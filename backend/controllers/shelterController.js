const Shelter = require("../models/shelterModel");

const addShelter = async (req, res) => {
    try {
        const { title, location, capacity } = req.body;
        const shelter = new Shelter({ title, location, capacity });
        await shelter.save();
        res.status(201).json(shelter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getShelters = async (req, res) => {
    try {
        const shelters = await Shelter.find();
        res.status(200).json(shelters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNearbyShelters = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        // need shelters out the radius of 500 meters   
        const nearbyShelters = await Shelter.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point", coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000,
                    $minDistance: 500
                }
            }
        });
        res.status(200).json(nearbyShelters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addShelter,
    getShelters,
    getNearbyShelters,
};