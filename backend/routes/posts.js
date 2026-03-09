const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const OutfitPost = require('../models/OutfitPost');
const User = require('../models/User');

// Tüm post'ları getir (feed)
router.get('/', protect, async (req, res) => {
  try {
    const posts = await OutfitPost.find()
      .populate('userId', 'username email')
      .populate('outfitItems.top', 'imageURL category color')
      .populate('outfitItems.bottom', 'imageURL category color')
      .populate('outfitItems.shoes', 'imageURL category color')
      .populate('outfitItems.outerwear', 'imageURL category color')
      .populate('outfitItems.accessories', 'imageURL category color')
      .populate('comments.userId', 'username email')
      .populate('likes', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Kullanıcının post'larını getir
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const posts = await OutfitPost.find({ userId: req.params.userId })
      .populate('userId', 'username email')
      .populate('outfitItems.top', 'imageURL category color')
      .populate('outfitItems.bottom', 'imageURL category color')
      .populate('outfitItems.shoes', 'imageURL category color')
      .populate('outfitItems.outerwear', 'imageURL category color')
      .populate('outfitItems.accessories', 'imageURL category color')
      .populate('comments.userId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Yeni post oluştur
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      outfitItems,
      weather,
      tags,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Başlık gereklidir',
      });
    }

    const post = new OutfitPost({
      userId: req.userId,
      title,
      description,
      outfitItems,
      weather,
      tags: tags || [],
    });

    await post.save();
    await post.populate('userId', 'username email');
    await post.populate('outfitItems.top', 'imageURL category color');
    await post.populate('outfitItems.bottom', 'imageURL category color');
    await post.populate('outfitItems.shoes', 'imageURL category color');
    await post.populate('outfitItems.outerwear', 'imageURL category color');
    await post.populate('outfitItems.accessories', 'imageURL category color');

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Post'u beğen/beğenmekten çık
router.patch('/:postId/like', protect, async (req, res) => {
  try {
    let post = await OutfitPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post bulunamadı',
      });
    }

    // Beğeni var mı kontrol et
    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex === -1) {
      // Beğen
      post.likes.push(req.userId);
    } else {
      // Beğenmekten çık
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('userId', 'username email');
    await post.populate('likes', 'username email');

    res.status(200).json({
      success: true,
      post,
      liked: likeIndex === -1,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Yorum ekle
router.post('/:postId/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Yorum metni gereklidir',
      });
    }

    const post = await OutfitPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post bulunamadı',
      });
    }

    post.comments.push({
      userId: req.userId,
      text,
    });

    await post.save();
    await post.populate('comments.userId', 'username email');

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Post sil
router.delete('/:postId', protect, async (req, res) => {
  try {
    const post = await OutfitPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post bulunamadı',
      });
    }

    // Sadece sahibi silebilir
    if (post.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await OutfitPost.findByIdAndDelete(req.params.postId);

    res.status(200).json({
      success: true,
      message: 'Post silinmiştir',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
