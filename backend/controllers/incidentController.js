const Incident = require("../models/incidentModel");
const { uploadImageToImgbb } = require("../services/uploadImage");
const Type = require("../models/typeModel");
const Form = require("../models/formModel");
const addIncident = async (req, res) => {
  try {
    const incidentAnalysis = req.incidentAnalysis;
    console.log(incidentAnalysis);

    if (!incidentAnalysis.is_incident) {
      return res.status(422).json({
        message: "This report does not appear to be a real incident.",
      });
    }
    const incidentData = JSON.parse(req.body.incident);
    console.log(incidentData);
    let imageUrl = null;
    imageUrl = await uploadImageToImgbb(req.file);

    const typeId = await Type.findOne({ name: incidentAnalysis.type }).select(
      "_id"
    );

    const newIncident = new Incident({
      imageUrl: imageUrl,
      description: incidentAnalysis.reformulated_description,
      location: incidentData.location,
      timestamp: incidentData.timestamp,
      reporterIds: [incidentData.userId], // not last version
      typeId: typeId,
      severity: incidentAnalysis.severity.toLowerCase(),
    });
    const TIME_RANGE = 30;
    const nearByIncident = await Incident.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: incidentData.location.coordinates,
          },
          $maxDistance: 500,
        },
      },
      typeId: newIncident.typeId,
      timestamp: {
        $gte: new Date(Date.now() - TIME_RANGE * 60 * 1000),
      },
    });
    if (nearByIncident != null) {
      await Incident.findByIdAndUpdate(
        nearByIncident._id,
        {
          $addToSet: { reporterIds: incidentData.userId },
          lastUpdated: incidentData.timestamp,
          severity: incidentAnalysis.severity,
        },
        { new: true } // returns the updated document
      );
      return res.status(200).json({
        message: "Incident already exists. Your report has been added.",
      });
    } else {
      const savedIncident = await newIncident.save();
      // console.log(savedIncident);
      res.status(201).json(savedIncident);
    }
  } catch (error) {
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

    // Then get latest forms for these incidents
    const latestForms = await Form.find({
      incidentId: { $in: validIncidents.map(i => i._id) },
      timestamp: { $gte: twentyFourHoursAgo },
      active: true
    }).sort({ timestamp: -1 });

    res.status(200).json(latestForms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getNearbyIncidents = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // First get non-fake incidents
    const validIncidents = await Incident.find({
      isFake: false,
      // lastUpdated: { $gte: twentyFourHoursAgo }
    }).select('_id');
    const nearbyIncidentsForms = await Form.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 500
        }
      },
      active: true,
      timestamp: { $gte: twentyFourHoursAgo },
      incidentId: { $in: validIncidents.map(i => i._id) }
    }).sort({ timestamp: -1 });
    res.status(200).json(nearbyIncidentsForms);
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

module.exports = {
  addIncident,
  getLatestIncidentForms,
  getIncidentById,
  getNearbyIncidents,
};
