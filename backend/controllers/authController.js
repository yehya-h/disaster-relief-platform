const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Guest = require("../models/guestModel");
const Fcm = require("../models/fcmModel");
const LiveLocation = require("../models/liveLocationModel");
const mongoose = require("mongoose");
const { guestToken } = require("./guestController");
const UserLocation = require("../models/userLocationModel");

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
            return res.status(400).json({ message: "Email already exists" });
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
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

        // Remove guest if exists
        if (req.user && req.user.id) {
            console.log(req.user.id);
            const bl = await Guest.findByIdAndDelete(req.user.id).session(session);
            console.log(bl);
        }
        // Update FCM
        if (deviceId) {
            await Fcm.findOneAndUpdate(
                { deviceId, userType: 'Guest' },
                { userId: user._id, userType: 'User', deviceId, lastUsed: new Date() },
                { session }
            );
        }
        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ token });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
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
            return res.status(401).json({ message: "User not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("isPasswordCorrect: ", isPasswordCorrect);
        if (!isPasswordCorrect) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ message: "Invalid credentials" });
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
            // await Fcm.findOneAndUpdate(
            //     { deviceId, userType: 'Guest' },
            //     { userId: user._id, userType: 'User', deviceId, lastUsed: new Date() },
            //     { session }
            // );
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

module.exports = { login, register, authToken, authRole, logout };