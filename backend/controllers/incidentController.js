const Incident = require("../models/incidentModel");
const { uploadImageToImgbb } = require("../services/uploadImage");
const Type = require("../models/typeModel");
const Form = require("../models/formModel");
const axios = require("axios");

const mongoose = require("mongoose");
const { triggerNotification } = require("../services/notificationService");

const addIncident = async (req, res) => {
  let session;
  try {
    const incidentAnalysis = req.incidentAnalysis;
    console.log(incidentAnalysis);

    if (!incidentAnalysis.is_incident) {
      return res.status(422).json({
        message: "This report does not appear to be a real incident.",
      });
    }
    const formData = JSON.parse(req.body.incident);
    console.log(formData);
    let imageUrl = null;
    imageUrl = await uploadImageToImgbb(req.file);

    const typeId = await Type.findOne({ name: incidentAnalysis.type }).select(
      "_id"
    );
    if (!typeId) {
      return res.status(400).json({ message: "Invalid incident type." });
    }

    const TIME_RANGE = 30;
    const session = await mongoose.startSession();
    session.startTransaction();
    const nearByIncident = await Form.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: formData.location.coordinates,
          },
          $maxDistance: 500,
        },
      },
      typeId: typeId,
      timestamp: {
        $gte: new Date(Date.now() - TIME_RANGE * 60 * 1000),
      },
    }).session(session);
    if (nearByIncident != null) {
      const newIncidentForm = new Form({
        imageUrl: imageUrl,
        description: incidentAnalysis.reformulated_description,
        location: formData.location,
        timestamp: formData.timestamp,
        incidentId: nearByIncident._id,
        reporterId: req.user.id,
        typeId: typeId,
        severity: incidentAnalysis.severity.toLowerCase(),
      });
      const savedIncident = await newIncidentForm.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Incident already exists. Your report has been added.",
        data: savedIncident,
      });
    } else {
      const newIncident = await new Incident({
        isFake: false,
      }).save({ session });
      const newIncidentForm = new Form({
        imageUrl: imageUrl,
        description: incidentAnalysis.reformulated_description,
        location: formData.location,
        timestamp: formData.timestamp,
        incidentId: newIncident._id,
        reporterId: req.user.id, // not last version
        typeId: typeId,
        severity: incidentAnalysis.severity.toLowerCase(),
      });
      const savedIncident = await newIncidentForm.save({ session });
      // console.log(savedIncident);
      await session.commitTransaction();
      session.endSession();

      triggerNotification(
        formData.location,
        incidentAnalysis.type,
        incidentAnalysis.reformulated_description,
        newIncident._id
      ).catch((err) => {
        console.error("Notification failed:", err);
      });

      return res.status(201).json(savedIncident);
    }
  } catch (error) {
    console.log(error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};

const getLatestIncidentForms = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // First get non-fake incidents
    const validIncidents = await Incident.find({
      isFake: false,
      // lastUpdated: { $gte: twentyFourHoursAgo }
    }).select('_id');
    console.log(validIncidents);
    // Then get latest forms for these incidents
    const latestForms = await Form.find({
      incidentId: { $in: validIncidents.map((i) => i._id) },
      timestamp: { $gte: twentyFourHoursAgo },
      active: true,
    }).sort({ timestamp: -1 });
    console.log(latestForms);
    res.status(200).json(latestForms);
  } catch (error) {
    console.error('Error fetching latest incident forms:', error);
    res.status(500).json({ message: error.message });
  }
};

const getNearbyIncidents = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // First get non-fake incidents
    const validIncidents = await Incident.find({
      isFake: false,
      // lastUpdated: { $gte: twentyFourHoursAgo }
    }).select("_id");
    const nearbyIncidentsForms = await Form.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 500,
        },
      },
      active: true,
      timestamp: { $gte: twentyFourHoursAgo },
      incidentId: { $in: validIncidents.map((i) => i._id) },
    }).sort({ timestamp: -1 });
    res.status(200).json(nearbyIncidentsForms);
  } catch (error) {
    console.error('Error fetching nearby incidents:', error);
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

// const tryUploadImageToImgbb = async (req, res) => {
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
//       console.error('Image upload failed:', error);
//         res.status(500).json({ message: error});
//     }
// };

module.exports = {
  addIncident,
  getLatestIncidentForms,
  getIncidentById,
  getNearbyIncidents,
  // tryUploadImageToImgbb,
};
