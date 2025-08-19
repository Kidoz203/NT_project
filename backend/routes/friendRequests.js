const express = require('express');
const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to transform friend request data
const transformFriendRequest = (request) => {
  const requestObj = request.toObject ? request.toObject() : request;
  return {
    ...requestObj,
    id: requestObj._id,
    sender: requestObj.sender._id ? {
      ...requestObj.sender,
      id: requestObj.sender._id
    } : requestObj.sender,
    receiver: requestObj.receiver._id ? {
      ...requestObj.receiver,
      id: requestObj.receiver._id
    } : requestObj.receiver
  };
};

// Send friend request
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message = '' } = req.body;
    const senderId = req.user._id;

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they are already friends
    const sender = await User.findById(senderId);
    if (sender.following.includes(receiverId)) {
      return res.status(400).json({ message: 'You are already friends with this user' });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already exists' });
      }
      // Update existing request
      existingRequest.sender = senderId;
      existingRequest.receiver = receiverId;
      existingRequest.status = 'pending';
      existingRequest.message = message;
      await existingRequest.save();
    } else {
      // Create new friend request
      await FriendRequest.create({
        sender: senderId,
        receiver: receiverId,
        message
      });
    }

    // Create notification
    const notification = new Notification({
      recipient: receiverId,
      sender: senderId,
      type: 'friend_request',
      content: `${sender.firstName} ${sender.lastName} sent you a friend request`
    });
    await notification.save();

    res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received friend requests
router.get('/received', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending'
    })
    .populate('sender', 'username firstName lastName profilePicture bio')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    const totalRequests = await FriendRequest.countDocuments({
      receiver: req.user._id,
      status: 'pending'
    });

    res.json({
      requests: requests.map(transformFriendRequest),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        hasNextPage: page < Math.ceil(totalRequests / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get received friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent friend requests
router.get('/sent', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const requests = await FriendRequest.find({
      sender: req.user._id,
      status: 'pending'
    })
    .populate('receiver', 'username firstName lastName profilePicture bio')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    const totalRequests = await FriendRequest.countDocuments({
      sender: req.user._id,
      status: 'pending'
    });

    res.json({
      requests: requests.map(transformFriendRequest),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        hasNextPage: page < Math.ceil(totalRequests / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get sent friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.put('/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Add each other to following lists (making them friends)
    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (!sender.following.includes(request.receiver)) {
      sender.following.push(request.receiver);
    }
    if (!sender.followers.includes(request.receiver)) {
      sender.followers.push(request.receiver);
    }
    
    if (!receiver.following.includes(request.sender)) {
      receiver.following.push(request.sender);
    }
    if (!receiver.followers.includes(request.sender)) {
      receiver.followers.push(request.sender);
    }

    await sender.save();
    await receiver.save();

    // Create notification for acceptance
    const notification = new Notification({
      recipient: request.sender,
      sender: request.receiver,
      type: 'friend_accept',
      content: `${receiver.firstName} ${receiver.lastName} accepted your friend request`
    });
    await notification.save();

    res.json({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject friend request
router.put('/:requestId/reject', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected successfully' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel friend request
router.delete('/:requestId', auth, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Friend request cancelled successfully' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const limit = parseInt(req.query.limit) || 10;

    // Get users who have pending friend requests (sent or received)
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, status: 'pending' },
        { receiver: req.user._id, status: 'pending' }
      ]
    });

    const usersWithPendingRequests = [
      ...pendingRequests.map(req => req.sender.toString()),
      ...pendingRequests.map(req => req.receiver.toString())
    ];

    // Get users who are friends with current user's friends (mutual connections)
    const friendsOfFriends = await User.aggregate([
      // Match friends of current user
      { $match: { _id: { $in: currentUser.following } } },
      // Get their friends
      { $unwind: '$following' },
      // Lookup the friend details
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'friend'
        }
      },
      { $unwind: '$friend' },
      // Exclude current user, already following users, and users with pending requests
      {
        $match: {
          'friend._id': { 
            $nin: [
              ...currentUser.following,
              ...currentUser.blockedUsers,
              currentUser._id,
              ...usersWithPendingRequests.map(id => mongoose.Types.ObjectId(id))
            ]
          }
        }
      },
      // Group by friend and count mutual connections
      {
        $group: {
          _id: '$friend._id',
          mutualFriends: { $sum: 1 },
          user: { $first: '$friend' }
        }
      },
      // Sort by mutual friends count
      { $sort: { mutualFriends: -1 } },
      { $limit: limit },
      // Project final structure
      {
        $project: {
          id: '$user._id',
          username: '$user.username',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          profilePicture: '$user.profilePicture',
          bio: '$user.bio',
          mutualFriends: 1
        }
      }
    ]);

    // Get recent users (as fallback suggestions)
    const recentUsers = await User.find({
      _id: { 
        $nin: [
          ...currentUser.following,
          ...currentUser.blockedUsers,
          currentUser._id,
          ...friendsOfFriends.map(f => f._id),
          ...usersWithPendingRequests.map(id => mongoose.Types.ObjectId(id))
        ]
      }
    })
    .select('username firstName lastName profilePicture bio')
    .sort({ createdAt: -1 })
    .limit(limit - friendsOfFriends.length);

    const suggestions = [
      ...friendsOfFriends,
      ...recentUsers.map(user => ({ 
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        mutualFriends: 0 
      }))
    ].slice(0, limit);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend (unfriend)
router.delete('/friend/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot remove yourself as a friend' });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Check if they are actually friends
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are not friends with this user' });
    }

    // Remove each other from following/followers lists
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId);
    
    otherUser.following = otherUser.following.filter(id => id.toString() !== currentUserId.toString());
    otherUser.followers = otherUser.followers.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await otherUser.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mutual friends
router.get('/mutual/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find mutual friends
    const mutualFriendsIds = currentUser.following.filter(friendId =>
      otherUser.following.includes(friendId)
    );

    const mutualFriends = await User.find({
      _id: { $in: mutualFriendsIds }
    })
    .select('username firstName lastName profilePicture bio')
    .limit(20);

    res.json({ 
      mutualFriends,
      count: mutualFriends.length 
    });
  } catch (error) {
    console.error('Get mutual friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
