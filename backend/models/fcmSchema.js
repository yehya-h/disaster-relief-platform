const mongoose = require('mongoose');

const fcmSchema = new mongoose.Schema({
    user: {
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
        required: true
    },
    lastUsed: Date
});

// Compound index for faster queries
fcmSchema.index({ user: 1, userType: 1 });
fcmSchema.index({ deviceId: 1, userType: 1 });

module.exports = mongoose.model('FCM', fcmSchema);