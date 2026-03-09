const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Üst Giyim', 'Alt Giyim', 'Ayakkabı', 'Dış Giyim', 'Aksesuar']
  },
  color: {
    type: String,
    required: true
  },
  thickness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  waterproof: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

clothingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Clothing', clothingSchema);
