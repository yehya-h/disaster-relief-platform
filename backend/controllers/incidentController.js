const Incident = require("../models/incidentModel");
const axios = require('axios');
require('dotenv').config();

const addIncident = async (req, res) => {
    try {
        const { incident } = req.body;
        let imageUrl = null;
        if (req.file) {
            // Upload image to imgbb
            const imageBase64 = req.file.buffer.toString('base64');
            const imgbbResponse = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                {
                    image: imageBase64
                },
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );
            imageUrl = imgbbResponse.data.data.url;
            const newIncident = new Incident({
                ...JSON.parse(incident),
                imageUrl: imageUrl
            });
            await newIncident.save();
            res.status(201).json(newIncident);
        } else {
            return res.status(400).json({ message: "No image provided" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find();
        res.status(200).json(incidents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findById(id);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        res.status(200).json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadImageToImgbb = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        const imageBase64 = req.file.buffer.toString('base64');
        const imgbbResponse = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                image: imageBase64,
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size
            },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        const imageUrl = imgbbResponse.data.data.url;
        res.status(200).json({ imageUrl });
    } catch (error) {
        res.status(500).json({ message: error});
    }
};

// ... existing code ...

module.exports = { addIncident, getIncidents, getIncidentById, uploadImageToImgbb };
