const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Tüm konuşmaları getir (son mesaj ile)
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.userId }, { recipient: req.userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.userId] },
              '$recipient',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            username: '$user.username',
            email: '$user.email',
          },
          lastMessage: '$lastMessage.content',
          lastMessageTime: '$lastMessage.createdAt',
          unreadCount: 1,
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Belirli bir kullanıcı ile mesajları getir
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.userId },
      ],
    })
      .populate('sender', 'username email')
      .populate('recipient', 'username email')
      .sort({ createdAt: 1 });

    // Okunmayan mesajları işaretle
    await Message.updateMany(
      {
        recipient: req.userId,
        sender: req.params.userId,
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Mesaj gönder
router.post('/send', protect, async (req, res) => {
  try {
    const { recipient, content } = req.body;

    if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: 'Alıcı ve mesaj içeriği gereklidir',
      });
    }

    // Alıcının var olup olmadığını kontrol et
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    // Kendisine mesaj gönderemesin
    if (recipient === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinize mesaj gönderemezsiniz',
      });
    }

    // Arkadaş olup olmadığını kontrol et
    const senderUser = await User.findById(req.userId);
    if (!senderUser.friends.includes(recipient)) {
      return res.status(403).json({
        success: false,
        message: 'Sadece arkadaşlarınıza mesaj gönderebilirsiniz',
      });
    }

    const message = new Message({
      sender: req.userId,
      recipient,
      content,
    });

    await message.save();
    await message.populate('sender', 'username email');
    await message.populate('recipient', 'username email');

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Okunmayan mesaj sayısı
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
