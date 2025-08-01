const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Guest = require("../models/guestModel");
const Fcm = require("../models/fcmModel");
const LiveLocation = require("../models/liveLocationModel");
const mongoose = require("mongoose");
const UserLocation = require("../models/userLocationModel");
const admin = require("../services/firebaseService");

const register = async (req, res) => {
    console.log("fct: register --- req: ", req.body);
    const session = await mongoose.startSession();
    session.startTransaction();
    const { fname, lname, email, password, role, liveLocation, deviceId, locations } = req.body;
    try {
        const existing = await User.findOne({ email }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "An account with this email address already exists. Please use a different email or try signing in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userArr = await User.create([{ fname, lname, email, password: hashedPassword, role }], { session });
        const user = userArr[0];
        await LiveLocation.create([{ userId: user._id, location: liveLocation, deviceId: deviceId }], { session });

        if (locations && locations.length > 0) {
            for (const location of locations) {
                console.log("location: ", location);
                await UserLocation.create([{
                    userId: user._id,
                    location: location
                }], { session });
            }
        }

        const fbUser = await admin.auth().createUser({
            email,
            password,
            displayName: `${fname} ${lname}`,
        }, { session });

        user.firebaseUid = fbUser.uid;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ status: 201, message: "Account created successfully! Please check your email for a verification link." });
    } catch (err) {
        console.log("err: ", err);
        await session.abortTransaction();
        session.endSession();
        
        // Handle specific Firebase errors
        if (err.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: "An account with this email address already exists. Please use a different email or try signing in." });
        } else if (err.code === 'auth/invalid-email') {
            return res.status(400).json({ message: "Please enter a valid email address." });
        } else if (err.code === 'auth/weak-password') {
            return res.status(400).json({ message: "Password is too weak. Please choose a stronger password (at least 6 characters)." });
        } else if (err.code === 'auth/operation-not-allowed') {
            return res.status(500).json({ message: "Email/password accounts are not enabled. Please contact support." });
        }
        
        res.status(500).json({ error: err.message });
    }
}

const login = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { email, password, liveLocation, deviceId } = req.body;
    try {
        const user = await User.findOne({ email }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ message: "Email address not found. Please check your email or sign up for a new account." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("isPasswordCorrect: ", isPasswordCorrect);
        if (!isPasswordCorrect) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ message: "Incorrect password. Please check your password and try again." });
        }

        //if user is not verified, check if firebase email is verified
        if (!user.emailVerified) {
            //get firebase user by email
            const fbUser = await admin.auth().getUserByEmail(email);
            if (!fbUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(401).json({ message: "Email address not found. Please check your email or sign up for a new account." });
            }

            //check if firebase email is verified
            if (!fbUser.emailVerified) {
                await session.abortTransaction();
                session.endSession();
                return res.status(401).json({ 
                    message: "Email not verified! Please check your email for verification link.",
                    resendCount: user.resendCount,
                    maxResends: 3
                });
            }

            //check if firebase uid is the same as the user's firebase uid
            if (fbUser.uid !== user.firebaseUid) {
                await session.abortTransaction();
                session.endSession();
                return res.status(401).json({ message: "Invalid credentials. Please check your email and password." });
            }

            //update user emailVerified to true if firebase email is verified
            if (fbUser.emailVerified && !user.emailVerified) {
                user.emailVerified = true;
                await user.save({ session });
            }
        }
 
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
        await LiveLocation.create([{ userId: user._id, location: liveLocation, deviceId: deviceId }], { session });

        // Remove guest if exists
        if (req.user && req.user.id) {
            console.log(req.user.id);
            const bl = await Guest.findByIdAndDelete(req.user.id).session(session);
            console.log(bl);
        }
        console.log("before:", deviceId);
        // Update FCM
        if (deviceId) {
            console.log("after:", deviceId);
            const fcm = await Fcm.findOne({ deviceId, userType: 'Guest' }).session(session);
            if (fcm) {
                fcm.userId = user._id;
                fcm.userType = 'User';
                fcm.lastUsed = new Date();
                await fcm.save({ session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ token });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
}

const logout = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { deviceId, liveLocation } = req.body;

        // Delete live location if exists
        await LiveLocation.findOneAndDelete({ deviceId: deviceId }).session(session);

        // Create new guest
        const guestArr = await Guest.create([{
            liveLocation: liveLocation,
            lastActive: Date.now(),
        }], { session });
        const guest = guestArr[0];

        // Update FCM entry for this device
        if (deviceId) {
            let existingFcm = await Fcm.findOne({ deviceId }).session(session);
            if (existingFcm) {
                existingFcm.userId = guest._id;
                existingFcm.userType = 'Guest';
                existingFcm.lastUsed = new Date();
                await existingFcm.save({ session });
            }
        }

        // Generate guest token
        const token = jwt.sign({ id: guest._id, role: 1 }, process.env.JWT_SECRET, { expiresIn: "30d" });

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
            message: "Logged out successfully",
            token: token
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
}

const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    console.log(token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contains id and role
        console.log(req.user);
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

const authRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        next();
    }
}

const resendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email address not found. Please check your email or sign up for a new account." });
        }

        const fbUser = await admin.auth().getUserByEmail(email);
        if (!fbUser) {
            return res.status(401).json({ message: "Email address not found. Please check your email or sign up for a new account." });
        }

        if (fbUser.emailVerified) {
            if (!user.emailVerified) {
                user.emailVerified = true;
                await user.save();
            }
            return res.status(400).json({ message: "Email is already verified. You can now login with your credentials." });
        }

        // Check resend limit
        if (user.resendCount >= 3) {
            return res.status(429).json({ 
                message: "Maximum verification emails sent. Please check your email or contact support if you haven't received the verification link.",
                resendCount: user.resendCount,
                maxResends: 3
            });
        }

        // Check if enough time has passed since last resend (optional: 5 minutes)
        if (user.lastResendTime) {
            const timeSinceLastResend = Date.now() - user.lastResendTime.getTime();
            const fiveMinutes = 1 * 60 * 1000; // 1 minutes in milliseconds
            if (timeSinceLastResend < fiveMinutes) {
                const remainingTime = Math.ceil((fiveMinutes - timeSinceLastResend) / 1000 / 60);
                return res.status(429).json({ 
                    message: `Please wait ${remainingTime} minutes before requesting another verification email.`,
                    resendCount: user.resendCount,
                    maxResends: 3
                });
            }
        }

        // Update resend count and timestamp
        user.resendCount += 1;
        user.lastResendTime = new Date();
        await user.save();
        
        // Return success - actual email sending will be done by frontend
        res.status(200).json({ 
            message: "Verification email sent successfully. Please check your inbox.",
            resendCount: user.resendCount,
            maxResends: 3
        });
    } catch (err) {
        console.log("Resend verification error:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, register, authToken, authRole, logout, resendVerification };