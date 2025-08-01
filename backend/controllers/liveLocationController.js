const LiveLocation = require('../models/liveLocationModel');
const User = require('../models/userModel');
const Guest = require('../models/guestModel');

const getLiveLocationsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Step 1: Get all live locations for the user
        const liveLocations = await LiveLocation.find({ userId });

        if (!liveLocations || liveLocations.length === 0) {
            return res.status(404).json({ message: "No live locations found for this user." });
        }

        // Step 2: Return the live locations
        return res.status(200).json(liveLocations);

    } catch (error) {
        console.error("Error fetching live locations:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}


const upsertLiveLocation = async (req, res) => {
    try {
        const { latitude, longitude, accuracy, deviceId } = req.body;

        if (!latitude || !longitude || !deviceId) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (req.user.role === 0) {
            const updatedLocation = await LiveLocation.findOneAndUpdate(
                { deviceId },
                {

                    userId: req.user.id,
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    deviceId,
                    timestamp: new Date(),
                },
                {
                    new: true, // return the updated document
                    upsert: true, // create if it doesn't exist
                    setDefaultsOnInsert: true,
                }
            );

            res.status(200).json({
                message: 'Live location saved successfully.',
                location: updatedLocation,
            });
        }
        else if (req.user.role === 1) {
            const updatedGuest = await Guest.findByIdAndUpdate(
                { _id: req.user.id },
                {
                    location: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    lastActive: new Date(),
                },
                {
                    new: true, // return the updated document
                    setDefaultsOnInsert: true,
                }
            );

            if (!updatedGuest) {
                return res.status(404).json({ message: 'Guest not found.' });
            }
            res.status(200).json({
                message: 'Guest location updated successfully.',
                location: updatedGuest,
            });
        }
        else {
            return res.status(403).json({ message: 'Unauthorized access.' });
        }
    } catch (error) {
        console.error('Error saving/updating live location:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getLiveLocationsByUserId,
    upsertLiveLocation
};