const mongoose = require("mongoose");
const locationType = require("./locationType");

const formSchema = mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: locationType,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: -1, // Descending index for recent-first queries
    },
    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
        required: true,
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
        required: true,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

formSchema.index({  active: 1 });
formSchema.index({ location: '2dsphere' });
formSchema.index({ 
    incidentId: 1, 
    timestamp: -1 
});

// Middleware to manage the active flag
formSchema.pre('save', async function() {
    if (this.isNew) {
      // Deactivate all other forms for this incident
      await this.constructor.updateOne(
        { incidentId: this.incidentId, active: true },// only one active form per incident
        { active: false }
      );
      this.active = true;
    }
  });

module.exports = mongoose.model("Form", formSchema);