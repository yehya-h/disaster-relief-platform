const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true,
        index: true
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reportType: {
        type: String,
        enum: ['fake', 'confirmed'],
        required: true,
        index: true
    }
});

// Compound indexes for common queries
reportSchema.index({ incidentId: 1, reportType: 1 });
reportSchema.index({ reporterId: 1, reportType: 1 });

module.exports = mongoose.model('Report', reportSchema);