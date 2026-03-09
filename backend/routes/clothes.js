const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Clothing = require('../models/Clothing');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'clothing-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/clothes - Add new clothing item
router.post(
  '/',
  protect,
  upload.single('image'),
  [
    body('category').isIn(['Üst Giyim', 'Alt Giyim', 'Ayakkabı', 'Dış Giyim', 'Aksesuar']),
    body('color').notEmpty(),
    body('thickness').optional().isInt({ min: 1, max: 5 }),
    body('waterproof').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Create clothing item with local file path
      const clothing = new Clothing({
        userId: req.userId,
        imageURL: `/uploads/${req.file.filename}`,
        category: req.body.category,
        color: req.body.color,
        thickness: req.body.thickness || 3,
        waterproof: req.body.waterproof === 'true' || req.body.waterproof === true,
        tags: req.body.tags ? JSON.parse(req.body.tags) : []
      });

      await clothing.save();

      res.status(201).json({
        success: true,
        data: clothing
      });
    } catch (error) {
      console.error('Error adding clothing item:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// GET /api/clothes - Get all clothing items
router.get('/', protect, async (req, res) => {
  try {
    const { category, color, search } = req.query;
    const query = { userId: req.userId };

    if (category) {
      query.category = category;
    }

    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { color: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const clothes = await Clothing.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: clothes.length,
      data: clothes
    });
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/clothes/:id - Get single clothing item
router.get('/:id', protect, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({
        success: false,
        error: 'Clothing item not found'
      });
    }

    // Kontrol et: bu eşya bu kullanıcıya ait mi
    if (clothing.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: clothing
    });
  } catch (error) {
    console.error('Error fetching clothing item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/clothes/:id - Delete clothing item
router.delete('/:id', protect, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) {
      return res.status(404).json({
        success: false,
        error: 'Clothing item not found'
      });
    }

    // Kontrol et: bu eşya bu kullanıcıya ait mi
    if (clothing.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Delete local file
    const filePath = path.join(__dirname, '..', clothing.imageURL);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Clothing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Clothing item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting clothing item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
