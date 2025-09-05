const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // your schema definition
  userId: { 
    type: String, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['admin', 'owner', 'renter'], 
    default: 'renter' 
  },
  phone: String,
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  }],
   favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Check if model exists before defining it
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

