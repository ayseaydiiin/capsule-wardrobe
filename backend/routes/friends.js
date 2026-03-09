const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { protect } = require('../middleware/auth');

// Get all users except current user and friends
router.get('/suggestions', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).populate('friends', 'username email _id');
    const friendIds = currentUser.friends.map(f => f._id.toString());
    
    // Pending requests olan kişileri de haricine tutma
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: req.userId },
        { recipient: req.userId }
      ],
      status: 'pending'
    });
    
    const pendingIds = pendingRequests.map(r => 
      r.sender.toString() === req.userId ? r.recipient.toString() : r.sender.toString()
    );
    
    const users = await User.find({
      _id: { $ne: req.userId, $nin: [...friendIds, ...pendingIds] }
    }).select('username email _id createdAt');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user suggestions', error });
  }
});

// Get current user's friends
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('friends', 'username email _id');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends', error });
  }
});

// Get pending friend requests (received)
router.get('/requests/received', protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.userId,
      status: 'pending'
    }).populate('sender', 'username email _id').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend requests', error });
  }
});

// Get pending friend requests (sent)
router.get('/requests/sent', protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.userId,
      status: 'pending'
    }).populate('recipient', 'username email _id').sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent requests', error });
  }
});

// Send friend request
router.post('/request/send/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Already friends check
    const currentUser = await User.findById(req.userId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Duplicate request check - only check pending requests
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = new FriendRequest({
      sender: req.userId,
      recipient: userId,
      status: 'pending'
    });

    await friendRequest.save();
    const populated = await friendRequest.populate('sender', 'username email _id');

    res.json({
      message: 'Friend request sent',
      request: populated
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error });
  }
});

// Accept friend request
router.post('/request/accept/:requestId', protect, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add as friends
    const sender = await User.findById(friendRequest.sender);
    const recipient = await User.findById(friendRequest.recipient);

    if (!sender.friends.includes(friendRequest.recipient)) {
      sender.friends.push(friendRequest.recipient);
      await sender.save();
    }

    if (!recipient.friends.includes(friendRequest.sender)) {
      recipient.friends.push(friendRequest.sender);
      await recipient.save();
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error });
  }
});

// Reject friend request
router.post('/request/reject/:requestId', protect, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error });
  }
});

// Remove friend
router.post('/remove/:friendId', protect, async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUser = await User.findById(req.userId);
    const friendUser = await User.findById(friendId);

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friend from both users
    currentUser.friends = currentUser.friends.filter(f => f.toString() !== friendId);
    friendUser.friends = friendUser.friends.filter(f => f.toString() !== req.userId);

    await currentUser.save();
    await friendUser.save();

    const updatedUser = await User.findById(req.userId).populate('friends', 'username email _id');
    res.json({
      message: 'Friend removed successfully',
      friends: updatedUser.friends,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error });
  }
});

// Check if user is friend
router.get('/check/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.userId);
    const isFriend = currentUser.friends.includes(userId);
    res.json({ isFriend });
  } catch (error) {
    res.status(500).json({ message: 'Error checking friend status', error });
  }
});

module.exports = router;

