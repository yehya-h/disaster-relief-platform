const admin = require("firebase-admin");
const Guest = require("../models/guestModel");
const LiveLocation = require("../models/liveLocationModel");
const UserLocation = require("../models/userLocationModel");
const FCM = require("../models/fcmModel");
const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");
const { Types } = mongoose;

// Radius in meters
const SEARCH_RADIUS = 1000;

// Get users/guests near incident location
async function getUsersNearLocation(location) {
  console.log("🟢 getUsersNearLocation called with location:", location);

  const geometry = {
    type: "Point",
    coordinates: location.coordinates,
  };

  console.log("🔷 Using geometry:", geometry);

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

  console.log(`👥 Found ${guests.length} guests near location.`);
  guests.forEach((guest, i) => {
    console.log(
      `  Guest[${i}]: _id=${guest._id}, liveLocation=${JSON.stringify(
        guest.liveLocation
      )}`
    );
  });

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

  console.log(`👤 Found ${liveLocUsers.length} liveLocUsers near location.`);
  liveLocUsers.forEach((user, i) => {
    console.log(
      `  LiveLocUser[${i}]: userId=${user.userId}, deviceId=${
        user.deviceId
      }, location=${JSON.stringify(user.location)}, timestamp=${user.timestamp}`
    );
  });

  // 3. Users with manually saved user locations
  const manualUsers = await UserLocation.find({
    location: {
      $near: {
        $geometry: geometry,
        $maxDistance: SEARCH_RADIUS,
      },
    },
  }).lean();

  console.log(`👥 Found ${manualUsers.length} manualUsers near location.`);
  manualUsers.forEach((user, i) => {
    console.log(
      `  ManualUser[${i}]: userId=${user.userId}, location=${JSON.stringify(
        user.location
      )}`
    );
  });

  const userIds = new Set();
  const guestIds = new Set();

  liveLocUsers.forEach((entry) => {
    if (entry.userId && entry.deviceId) {
      userIds.add(entry.userId);
    }
  });

  manualUsers.forEach((entry) => {
    if (entry.userId && Types.ObjectId.isValid(entry.userId)) {
      userIds.add(entry.userId);
    } else {
      console.error("Invalid userId skipped:", entry.userId);
    }
  });

  guests.forEach((entry) => {
    if (entry._id) {
      guestIds.add(entry._id);
    }
  });

  console.log(
    `🔶 Aggregated ${userIds.size} unique userIds and ${guestIds.size} unique guestIds`
  );

  const userFcmRecords = await FCM.find({
    userId: { $in: Array.from(userIds) },
    // userType: "User",
  }).lean();
  console.log(`🔷 Found ${userFcmRecords.length} FCM records for users.`);

  const guestFcmRecords = await FCM.find({
    userId: { $in: Array.from(guestIds) },
    // userType: "Guest",
  }).lean();
  console.log(`🔷 Found ${guestFcmRecords.length} FCM records for guests.`);

  return { userFcmRecords, guestFcmRecords, userIds };
}

async function triggerNotification(location, type, description, incidentId) {
  console.log("🟢 triggerNotification called");

  try {
    const { userFcmRecords, guestFcmRecords, userIds } =
      await getUsersNearLocation(location);

    // Extract tokens from both arrays
    const userTokens = userFcmRecords.map((rec) => rec.fcmToken);
    const guestTokens = guestFcmRecords.map((rec) => rec.fcmToken);

    // Combine all tokens
    const tokens = [...userTokens, ...guestTokens].filter(Boolean);

    console.log(`🔔 Sending notification to ${tokens.length} tokens.`);

    if (tokens.length === 0) {
      console.log("⚠️ No tokens found. Exiting triggerNotification.");
      return; // Nothing to send
    }

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

    let response;
    try {
      response = await admin.messaging().sendEachForMulticast(message);
      console.log(
        `✅ ${response.successCount} notifications sent successfully.`
      );
    } catch (fcmError) {
      console.error("🔥 Firebase sendEachForMulticast error:", fcmError);
      throw fcmError; // Re-throw to be caught by outer catch
    }

    if (userIds.size > 0) {
      const notifications = Array.from(userIds).map((userId) => ({
        userId,
        incidentId,
        notificationType: "nearby_incident",
      }));

      try {
        await Notification.insertMany(notifications, { ordered: false });
        console.log("💾 Notifications saved to DB for users.");
      } catch (dbError) {
        console.error("🔥 Error saving notifications to DB:", dbError);
      }
    }

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        console.log(`Notification sent to token: ${tokens[idx]}`);
      } else {
        console.error(
          `Failed to send to token: ${tokens[idx]} - Error:`,
          resp.error
        );
      }
    });

    console.log(
      `ℹ️ Total successCount: ${response.successCount}, failureCount: ${response.failureCount}`
    );
  } catch (error) {
    console.error("🔥 Error in triggerNotification:", error);
  }
}

module.exports = { triggerNotification, getUsersNearLocation };
