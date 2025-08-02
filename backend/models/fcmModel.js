const mongoose = require('mongoose');

const fcmSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userType',
        required: true
    },
    userType: {
        type: String,
        enum: ['User', 'Guest'],
        required: true
    },
    fcmToken: {
        type: String,
        required: true,
        index: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    lastUsed: Date
});

// Compound index for faster queries
fcmSchema.index({ userId: 1, userType: 1 });
fcmSchema.index({ deviceId: 1, userType: 1 });

module.exports = mongoose.model('FCM', fcmSchema);