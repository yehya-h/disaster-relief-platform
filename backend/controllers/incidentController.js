const Incident = require("../models/incidentModel");
const { uploadImageToImgbb } = require('../services/uploadImage');
const Type = require('../models/typeModel');
const addIncident = async (req, res) => {
    try {
        const incidentAnalysis = req.incidentAnalysis;
        console.log(incidentAnalysis);

        if(!incidentAnalysis.is_incident){
            return res.status(400).json({ message: "No incident detected" });
        } 
        const incidentData = JSON.parse(req.body.incident);
        let imageUrl = null;
        imageUrl = await uploadImageToImgbb(req.file);

        const typeId = await Type.findOne({ name: incidentAnalysis.type }).select('_id');

        const newIncident = new Incident({
            imageUrl: imageUrl,
            description: incidentAnalysis.reformulated_description,
            location: incidentData.location,
            timestamp: new Date(),
            reporterIds: [incidentData.user_id], // not last version 
            typeId: typeId,
            severity: incidentAnalysis.severity,
        });
        const savedIncident = await newIncident.save();
        // console.log(savedIncident);
        res.status(201).json(savedIncident);
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

// const uploadImageToImgbb = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No image provided" });
//         }
//         const imageBase64 = req.file.buffer.toString('base64');
//         const imgbbResponse = await axios.post(
//             `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
//             {
//                 image: imageBase64,
//                 name: req.file.originalname,
//                 type: req.file.mimetype,
//                 size: req.file.size
//             },
//             {
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//             }
//         );
//         const imageUrl = imgbbResponse.data.data.url;
//         res.status(200).json({ imageUrl });
//     } catch (error) {
//         res.status(500).json({ message: error});
//     }
// };

// ... existing code ...

module.exports = { addIncident, getIncidents, getIncidentById, uploadImageToImgbb };
