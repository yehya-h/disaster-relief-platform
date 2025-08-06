const Incident = require("../models/incidentModel");
const { uploadImageToImgbb } = require("../services/uploadImage");
const Type = require("../models/typeModel");
const Form = require("../models/formModel");
const axios = require("axios");

const mongoose = require("mongoose");
const { triggerNotification } = require("../services/notificationService");

const analyzeIncidentController = async (req, res) => {
  try {
    const incidentAnalysis = req.incidentAnalysis;
    
    if (!incidentAnalysis.is_incident) {
      return res.status(422).json({
        message: "This report does not appear to be a real incident.",
        analysis: incidentAnalysis
      });
    }

    // Upload image temporarily and store URLs for later use
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImageToImgbb(req.file);
    }

    // Return analysis to frontend for approval
    return res.status(200).json({
      message: "Incident analysis completed. Please review and approve.",
      analysis: {
        is_incident: incidentAnalysis.is_incident,
        probability: incidentAnalysis.probability,
        reasoning: incidentAnalysis.reasoning,
        reformulated_description: incidentAnalysis.reformulated_description,
        severity: incidentAnalysis.severity,
        type: incidentAnalysis.type,
        imageUrl: imageUrl || null,
      }
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ message: error.message });
  }
};

const addIncident = async (req, res) => {
  let session;
  try {
    const { 
      formData, 
      analysis, 
      approved 
    } = req.body;

    // Check if user approved the analysis
    if (!approved) {
      return res.status(400).json({
        message: "Incident submission was not approved."
      });
    }

    // Validate analysis data
    if (!analysis || !analysis.is_incident) {
      return res.status(422).json({
        message: "Invalid or missing analysis data."
      });
    }

    const typeId = await Type.findOne({ name: analysis.type }).select("_id");
    if (!typeId) {
      return res.status(400).json({ message: "Invalid incident type." });
    }

    const TIME_RANGE = 30;
    session = await mongoose.startSession();
    session.startTransaction();

    // Check for nearby incidents
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
      // Add to existing incident
      const newIncidentForm = new Form({
        imageUrl: analysis.imageUrl,
        description: analysis.reformulated_description,
        location: formData.location,
        timestamp: formData.timestamp,
        incidentId: nearByIncident._id,
        reporterId: req.user.id,
        typeId: typeId,
        severity: analysis.severity.toLowerCase(),
      });
      
      const savedIncident = await newIncidentForm.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Incident already exists. Your report has been added.",
        data: savedIncident,
      });
    } else {
      // Create new incident
      const newIncident = await new Incident({
        isFake: false,
      }).save({ session });

      const newIncidentForm = new Form({
        imageUrl: analysis.imageUrl,
        description: analysis.reformulated_description,
        location: formData.location,
        timestamp: formData.timestamp,
        incidentId: newIncident._id,
        reporterId: req.user.id,
        typeId: typeId,
        severity: analysis.severity.toLowerCase(),
      });

      const savedIncident = await newIncidentForm.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Trigger notification asynchronously
      triggerNotification(
        formData.location,
        analysis.type,
        analysis.reformulated_description,
        newIncident._id
      ).catch((err) => {
        console.error("Notification failed:", err);
      });

      return res.status(201).json({
        message: "Incident created successfully.",
        data: savedIncident
      });
    }
  } catch (error) {
    console.error("Add incident error:", error);
    if (session && session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: error.message });
  }
};


// const addIncident = async (req, res) => {
//   let session;
//   try {
//     const incidentAnalysis = req.incidentAnalysis;
//     console.log(incidentAnalysis);

//     if (!incidentAnalysis.is_incident) {
//       return res.status(422).json({
//         message: "This report does not appear to be a real incident.",
//       });
//     }
//     const formData = JSON.parse(req.body.incident);
//     console.log(formData);
//     let imageUrl = null;
//     imageUrl = await uploadImageToImgbb(req.file);

//     const typeId = await Type.findOne({ name: incidentAnalysis.type }).select(
//       "_id"
//     );
//     if (!typeId) {
//       return res.status(400).json({ message: "Invalid incident type." });
//     }

//     const TIME_RANGE = 30;
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     const nearByIncident = await Form.findOne({
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: formData.location.coordinates,
//           },
//           $maxDistance: 500,
//         },
//       },
//       typeId: typeId,
//       timestamp: {
//         $gte: new Date(Date.now() - TIME_RANGE * 60 * 1000),
//       },
//     }).session(session);
//     if (nearByIncident != null) {
//       const newIncidentForm = new Form({
//         imageUrl: imageUrl,
//         description: incidentAnalysis.reformulated_description,
//         location: formData.location,
//         timestamp: formData.timestamp,
//         incidentId: nearByIncident._id,
//         reporterId: req.user.id,
//         typeId: typeId,
//         severity: incidentAnalysis.severity.toLowerCase(),
//       });
//       const savedIncident = await newIncidentForm.save({ session });
//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         message: "Incident already exists. Your report has been added.",
//         data: savedIncident,
//       });
//     } else {
//       const newIncident = await new Incident({
//         isFake: false,
//       }).save({ session });
//       const newIncidentForm = new Form({
//         imageUrl: imageUrl,
//         description: incidentAnalysis.reformulated_description,
//         location: formData.location,
//         timestamp: formData.timestamp,
//         incidentId: newIncident._id,
//         reporterId: req.user.id, // not last version
//         typeId: typeId,
//         severity: incidentAnalysis.severity.toLowerCase(),
//       });
//       const savedIncident = await newIncidentForm.save({ session });
//       // console.log(savedIncident);
//       await session.commitTransaction();
//       session.endSession();

//       triggerNotification(
//         formData.location,
//         incidentAnalysis.type,
//         incidentAnalysis.reformulated_description,
//         newIncident._id
//       ).catch((err) => {
//         console.error("Notification failed:", err);
//       });

//       return res.status(201).json(savedIncident);
//     }
//   } catch (error) {
//     console.log(error);
//     if (session) {
//       await session.abortTransaction();
//       session.endSession();
//     }
//     res.status(500).json({ message: error.message });
//   }
// };

const getLatestIncidentForms = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // First get non-fake incidents
    const validIncidents = await Incident.find({
      isFake: false,
      // lastUpdated: { $gte: twentyFourHoursAgo }
    }).select("_id");
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
    console.error("Error fetching latest incident forms:", error);
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
    })
    .populate({
          path: "typeId",
          model: "Type", 
      })
      .sort({ timestamp: -1 });

    res.status(200).json(nearbyIncidentsForms);
  } catch (error) {
    console.error("Error fetching nearby incidents:", error);
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

const getMoreIncidents = async (req, res) => {
  try {
    const chunk = parseInt(req.query.chunk) || 1;
    const limit = 10;
    const skip = (chunk - 1) * limit;

    const incidents = await Incident.find({ isFake: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalIncidents = await Incident.countDocuments({ isFake: false });
    const incidentIds = incidents.map((i) => i._id);

    const forms = incidentIds.length
      ? await Form.find({ incidentId: { $in: incidentIds } }).lean()
      : [];

    const formsByIncident = {};
    forms.forEach((form) => {
      const id = form.incidentId.toString();
      if (!formsByIncident[id]) {
        formsByIncident[id] = [];
      }
      formsByIncident[id].push(form);
    });

    res.json({
      chunk,
      totalchunks: Math.ceil(totalIncidents / limit),
      totalIncidents,
      incidents,
      formsByIncident,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
  analyzeIncidentController,
  addIncident,
  getLatestIncidentForms,
  getIncidentById,
  getNearbyIncidents,
  getMoreIncidents,
  // tryUploadImageToImgbb,
};
