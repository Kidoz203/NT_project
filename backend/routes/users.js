const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username firstName lastName profilePicture')
      .populate('following', 'username firstName lastName profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        website: user.website,
        followers: user.followers.length,
        following: user.following.length,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      bio, 
      location, 
      website, 
      isPrivate,
      socialLinks,
      profileTheme,
      notificationSettings
    } = req.body;
    
    const updateData = {
      firstName,
      lastName,
      bio,
      location,
      website,
      isPrivate: isPrivate === 'true',
      profileTheme: profileTheme || 'default'
    };

    // Handle social links
    if (socialLinks) {
      const parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      updateData.socialLinks = parsedSocialLinks;
    }

    // Handle notification settings
    if (notificationSettings) {
      const parsedNotificationSettings = typeof notificationSettings === 'string' ? JSON.parse(notificationSettings) : notificationSettings;
      updateData.notificationSettings = parsedNotificationSettings;
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        updateData.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.coverPhoto && req.files.coverPhoto[0]) {
        updateData.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        website: user.website,
        followers: user.followers.length,
        following: user.following.length,
        isPrivate: user.isPrivate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add to following and followers lists
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    // Create notification for follow
    const notification = new Notification({
      recipient: userId,
      sender: currentUserId,
      type: 'follow',
      content: `${currentUser.firstName} ${currentUser.lastName} started following you`
    });
    await notification.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.post('/:userId/unfollow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if not following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following and followers lists
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await userToUnfollow.save();

    // Create notification for unfollow
    const notification = new Notification({
      recipient: userId,
      sender: currentUserId,
      type: 'unfollow',
      content: `${currentUser.firstName} ${currentUser.lastName} unfollowed you`
    });
    await notification.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    })
    .select('username firstName lastName profilePicture bio')
    .limit(20);

    // Map _id to id for frontend compatibility
    const mappedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      bio: user.bio
    }));

    res.json({ users: mappedUsers });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username firstName lastName profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:userId/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username firstName lastName profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block a user
router.post('/:userId/block', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already blocked
    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    // Add to blocked users list
    currentUser.blockedUsers.push(userId);

    // Remove from followers/following if they were connected
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId);
    userToBlock.following = userToBlock.following.filter(id => id.toString() !== currentUserId.toString());
    userToBlock.followers = userToBlock.followers.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await userToBlock.save();

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock a user
router.post('/:userId/unblock', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    // Check if user is blocked
    if (!currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    // Remove from blocked users list
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userId);
    await currentUser.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to close friends
router.post('/:userId/close-friend', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot add yourself as close friend' });
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already a close friend
    if (currentUser.closeFriends.includes(userId)) {
      return res.status(400).json({ message: 'User is already a close friend' });
    }

    // Must be following the user to add as close friend
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You must be following the user to add as close friend' });
    }

    currentUser.closeFriends.push(userId);
    await currentUser.save();

    res.json({ message: 'User added to close friends' });
  } catch (error) {
    console.error('Add close friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from close friends
router.post('/:userId/remove-close-friend', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    // Check if user is a close friend
    if (!currentUser.closeFriends.includes(userId)) {
      return res.status(400).json({ message: 'User is not in close friends' });
    }

    currentUser.closeFriends = currentUser.closeFriends.filter(id => id.toString() !== userId);
    await currentUser.save();

    res.json({ message: 'User removed from close friends' });
  } catch (error) {
    console.error('Remove close friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blocked users
router.get('/blocked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'username firstName lastName profilePicture');

    res.json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's friends list
router.get('/:userId/friends', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username firstName lastName profilePicture bio',
        options: {
          skip: skip,
          limit: limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalFriends = user.following.length;

    // Map _id to id for frontend compatibility
    const mappedFriends = user.following.map(friend => ({
      id: friend._id,
      username: friend.username,
      firstName: friend.firstName,
      lastName: friend.lastName,
      profilePicture: friend.profilePicture,
      bio: friend.bio
    }));

    res.json({ 
      friends: mappedFriends,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFriends / limit),
        totalFriends,
        hasNextPage: page < Math.ceil(totalFriends / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get close friends
router.get('/close-friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('closeFriends', 'username firstName lastName profilePicture bio');

    res.json({ closeFriends: user.closeFriends });
  } catch (error) {
    console.error('Get close friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate account
router.put('/deactivate', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { accountStatus: 'deactivated' });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reactivate account
router.put('/reactivate', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { accountStatus: 'active' });
    res.json({ message: 'Account reactivated successfully' });
  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
