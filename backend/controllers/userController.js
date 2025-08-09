const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Location = require("../models/userLocationModel");
const mongoose = require("mongoose");

const getUserById = async (req, res) => {
    try {
        console.log("fct: getUserById");
        const userId = req.user.id;
        const user = await User.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const locations = await Location.find({userId: user._id});
        if(!locations) {
            return res.status(404).json({ message: "Locations not found" });
        }
        const userData = {
            ...user._doc,
            locations: locations
        }
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateUserInfo = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        console.log("fct: updateUserInfo");
        const userId = req.user.id;
        const { fname, lname } = req.body;

        if (!fname || !lname) {
            await session.abortTransaction();
            return res.status(400).json({ message: "First name and last name are required" });
        }

        if (fname.trim().length < 1 || lname.trim().length < 1) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Names cannot be empty" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                fname: fname.trim(), 
                lname: lname.trim() 
            },
            { new: true, runValidators: true, session: session }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }

        const locations = await Location.find({userId: userId});

        const userData = {
            ...updatedUser._doc,
            locations: locations || []
        };

        await session.commitTransaction();

        res.status(200).json({ 
            message: "User information updated successfully",
            user: userData
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

const updateUserPassword = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        console.log("fct: updateUserPassword");
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            await session.abortTransaction();
            return res.status(400).json({ message: "All password fields are required" });
        }

        if (newPassword.length < 6) {
            await session.abortTransaction();
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        const user = await User.findById(userId);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedNewPassword },
            { new: true, session: session }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Failed to update password" });
        }

        await session.commitTransaction();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

const updateUserLocations = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        console.log("fct: updateUserLocations");
        const userId = req.user.id;
        const { locations } = req.body;

        if (!locations || !Array.isArray(locations)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Locations array is required" });
        }

        if (locations.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "At least one location is required" });
        }

        if (locations.length > 3) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Maximum 3 locations allowed" });
        }

        for (let i = 0; i < locations.length; i++) {
            const loc = locations[i];
            if (!loc.name || !loc.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    message: `Invalid location data at index ${i}. Name and coordinates [longitude, latitude] are required` 
                });
            }
        }

        const user = await User.findById(userId);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found" });
        }

        await Location.deleteMany({ userId: userId }).session(session);;

        const locationDocs = locations.map(loc => ({
            userId: userId,
            location: {
                type: "Point",
                name: loc.name.trim(),
                coordinates: loc.coordinates,
                address: loc.address || ""
            }
        }));

        const savedLocations = await Location.insertMany(locationDocs, { session: session });

        if (!savedLocations) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Failed to save locations" });
        }

        await session.commitTransaction();

        res.status(200).json({ 
            message: "Locations updated successfully",
            locations: savedLocations
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

module.exports = { 
    getUserById, 
    updateUserInfo, 
    updateUserPassword, 
    updateUserLocations 
};