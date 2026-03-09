const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .populate('from', 'username email _id')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
});

// Get unread notifications count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.userId, read: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error });
  }
});

// Mark all as read
router.patch('/read/all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read', error });
  }
});

// Create notification (internal use)
router.post('/', protect, async (req, res) => {
  try {
    const { user, type, from, content, postId } = req.body;

    const notification = new Notification({
      user,
      type,
      from,
      content,
      postId
    });

    await notification.save();
    const populated = await notification.populate('from', 'username email _id');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error });
  }
});

module.exports = router;
