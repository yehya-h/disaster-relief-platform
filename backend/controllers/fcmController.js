const FCM = require("../models/fcmModel");
const admin = require("../services/firebaseService");

async function saveFcmToken(req, res) {
  try {
    const { fcmToken, deviceId } = req.body;

    if (!fcmToken || !deviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let userType;
    if (req.user.role == 0) {
      userType = "User";
    } else if (req.user.role == 1) {
      userType = "Guest";
    }

    const updatedFcm = await FCM.findOneAndUpdate(
      { deviceId },
      {
        userId: req.user.id,
        userType,
        fcmToken,
        deviceId,
        lastUsed: new Date(),
      },
      { upsert: true, new: true } //upsert: true, If no document is found, create a new one with the update data
      //new: true, Return the updated/created document instead of the original
    );

    res.status(200).json({
      message: "FCM token saved successfully",
      data: updatedFcm,
    });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//remove token on logout
async function removeFcmToken(req, res) {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: "deviceId is required" });
    }

    await FCM.deleteOne({ deviceId });

    res.status(200).json({ message: "FCM token removed successfully" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { saveFcmToken, removeFcmToken };
