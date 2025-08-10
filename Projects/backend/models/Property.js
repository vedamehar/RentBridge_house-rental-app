const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  propertyId: {
    type: String,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prop_type: {
    type: String,
    required: true,
  },
  prop_ad_type: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  prop_address: {
    type: String,
    required: true,
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    }
  },
  owner_contact: {
    type: String,
    required: true,
  },
  prop_amt: {
    type: Number,
    required: true,
  },
  prop_images: [String],
  ad_info: String,
  status: {
    type: String,
    enum: ["available", "pending", "booked"],
    default: "available",
  },
  bookingRequests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userName: String,
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property' // Note: This references 'Property', which might be incorrect
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Property", propertySchema);