const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [30, 'Name too long']
  },
  gameId: {
    type: String,
    required: [true, 'Blood Strike ID is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Game ID too long']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true,
    maxlength: [20, 'Number too long']
  },
  country: {
    type: String,
    default: 'Unknown',
    trim: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Pro'],
    default: 'Intermediate'
  },
  usedCode: {
    type: String,
    required: true,
    unique: true,      // ← enforces one registration per code at DB level
    trim: true,
    uppercase: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);
