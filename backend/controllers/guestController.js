const jwt = require("jsonwebtoken");
const Guest = require("../models/guestModel");
const Fcm = require("../models/fcmModel");
const mongoose = require('mongoose');

const createGuest = async (req, session, returnGuest = false) => {
    const guestArr = await Guest.create([
        {
            liveLocation: req.body.liveLocation,
            lastActive: Date.now(),
        }
    ], { session });
    if (returnGuest) return guestArr[0];
    return guestArr[0];
};

const guestToken = async (req, res) => {
    console.log("fct: guestToken --- req: ", req);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const guest = await createGuest(req, session, true);
        console.log("guest created: ", guest);
        if (!guest || guest.error) throw new Error('Guest creation failed');
        const deviceId = req.body.deviceId || 'dummy_device_id';
        console.log("deviceId: ", deviceId);

        // Check if FCM entry exists for this deviceId (case after logout)
        let existingFcm = await Fcm.findOne({ deviceId }).session(session);
        console.log("existingFcm: ", existingFcm);

        if (existingFcm) {
            // Update userId and userType to Guest
            existingFcm.userId = guest._id;
            existingFcm.userType = 'Guest';
            existingFcm.lastUsed = new Date();
            await existingFcm.save({ session });
        }
        // Simulation: Insert a test FCM entry for this guest
        // await Fcm.create({
        //     userId: guest._id,
        //     userType: 'Guest',
        //     fcmToken: 'dummy_fcm_token',
        //     deviceId: '2',
        //     lastUsed: new Date()
        // });
        const token = jwt.sign({ id: guest._id, role: 1 }, process.env.JWT_SECRET, { expiresIn: "30d" });
        console.log("token: ", token);
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ token });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createGuest, guestToken };