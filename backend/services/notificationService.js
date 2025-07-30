const admin = require("firebase-admin");
const Guest = require("../models/guestModel");
const LiveLocation = require("../models/liveLocationModel");
const UserLocation = require("../models/userLocationModel");
const FCM = require("../models/fcmModel");
const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

// Radius in meters
const SEARCH_RADIUS = 500;

// Get users/guests near incident location
async function getUsersNearLocation(location) {
  const geometry = {
    type: "Point",
    coordinates: location.coordinates,
  };

  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // 1. Guests (liveLocation inside guestModel)
  const guests = await Guest.find({
    liveLocation: {
      $near: {
        $geometry: geometry,
        $maxDistance: SEARCH_RADIUS,
      },
    },
  }).lean();

  // 2. Users with recent LiveLocation
  const liveLocUsers = await LiveLocation.find({
    location: {
      $near: {
        $geometry: geometry,
        $maxDistance: SEARCH_RADIUS,
      },
    },
    timestamp: { $gte: hourAgo },
  }).lean();

  // 3. Users with manually saved user locations
  const manualUsers = await UserLocation.find({
    location: {
      $near: {
        $geometry: geometry,
        $maxDistance: SEARCH_RADIUS,
      },
    },
  }).lean();

  const userIds = new Set();
  const guestIds = new Set();

  liveLocUsers.forEach((entry) => {
    if (entry.userId && entry.deviceId) {
      userIds.add(entry.userId.toString());
    }
  });

  manualUsers.forEach((entry) => {
    if (entry.userId) {
      userIds.add(entry.userId.toString());
    }
  });

  guests.forEach((entry) => {
    if (entry._id) {
      guestIds.add(entry._id.toString());
    }
  });

  const userFcmRecords = await FCM.find({
    userId: { $in: Array.from(userIds) },
    userType: "User",
  }).lean();

  // Find FCM tokens for guests
  const guestFcmRecords = await FCM.find({
    userId: { $in: Array.from(guestIds) },
    userType: "Guest",
  }).lean();

  return { userFcmRecords, guestFcmRecords, userIds };
}

async function triggerNotification(location, type, description, incidentId) {
  try {
    const { userFcmRecords, guestFcmRecords, userIds } =
      await getUsersNearLocation(location);

    // Extract tokens from both arrays
    const userTokens = userFcmRecords.map((rec) => rec.fcmToken);
    const guestTokens = guestFcmRecords.map((rec) => rec.fcmToken);

    // Combine all tokens
    const tokens = [...userTokens, ...guestTokens];

    if (tokens.length === 0) return; // Nothing to send

    const message = {
      tokens: tokens,
      notification: {
        title: `🚨 ${type} reported nearby!`,
        body: description || "Stay alert and safe.",
      },
      data: {
        type,
        lng: location.coordinates[0].toString(),
        lat: location.coordinates[1].toString(),
      },
    };

    // const response = await admin.messaging().sendMulticast(message);
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} notifications sent successfully.`);

    if (userIds.size > 0) {
      const notifications = Array.from(userIds).map((userId) => ({
        userId,
        incidentId,
        notificationType: "nearby_incident",
      }));

      await Notification.insertMany(notifications, { ordered: false });
      console.log("Notifications saved to DB for users.");
    }

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        console.log(`Notification sent to ${tokens[idx]}`);
      } else {
        console.error(`Failed to send to ${tokens[idx]}:`, resp.error);
      }
    });

    console.log(`${response.successCount} messages were sent successfully.`);

    //   if (response.failureCount > 0) {
    //     response.responses.forEach((resp, idx) => {
    //       if (!resp.success) {
    //         console.error(`Token ${tokens[idx]} failed:`, resp.error.message);
    //       }
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error in triggerNotification:", error);
  } catch (error) {
    console.error("Error in triggerNotification:", error);
  }
}

module.exports = { triggerNotification, getUsersNearLocation };
