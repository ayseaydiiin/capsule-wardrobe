const mongoose = require('mongoose');

const outfitPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Başlık gereklidir'],
      trim: true,
      maxlength: [100, 'Başlık 100 karakterden fazla olamaz'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Açıklama 500 karakterden fazla olamaz'],
    },
    outfitItems: {
      top: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothing',
      },
      bottom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothing',
      },
      shoes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothing',
      },
      outerwear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clothing',
      },
      accessories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Clothing',
        },
      ],
    },
    images: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    weather: {
      temperature: Number,
      condition: String,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('OutfitPost', outfitPostSchema);
