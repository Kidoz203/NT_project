const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ visibility: 'public' })
      .populate('user', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalPosts = await Post.countDocuments({ visibility: 'public' });
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: userId })
      .populate('user', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalPosts = await Post.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { content, visibility = 'public' } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ message: 'Post must have content or image' });
    }

    const postData = {
      user: req.user._id,
      content,
      visibility
    };

    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username firstName lastName profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error during post creation' });
  }
});

// Update a post
router.put('/:postId', auth, async (req, res) => {
  try {
    const { content, visibility } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.content = content || post.content;
    post.visibility = visibility || post.visibility;
    
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error during post update' });
  }
});

// Delete a post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error during post deletion' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
      await post.save();
      
      // Create notification for like (only if not liking own post)
      if (post.user.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: post.user,
          sender: userId,
          type: 'like',
          post: post._id,
          content: `${req.user.firstName} ${req.user.lastName} liked your post`
        });
        await notification.save();
      }
      
      res.json({ message: 'Post liked successfully', liked: true, likeCount: post.likes.length });
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ message: 'Post unliked successfully', liked: false, likeCount: post.likes.length });
    }
  } catch (error) {
    console.error('Like/Unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:postId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      content
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username firstName lastName profilePicture');

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    // Create notification for comment (only if not commenting on own post)
    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: addedComment._id,
        content: `${req.user.firstName} ${req.user.lastName} commented on your post`
      });
      await notification.save();
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment creation' });
  }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the post
    if (comment.user.toString() !== req.user._id.toString() && 
        post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error during comment deletion' });
  }
});

// Like/Unlike a comment
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(userId);
      await post.save();
      
      // Create notification for comment like (only if not liking own comment)
      if (comment.user.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: comment.user,
          sender: userId,
          type: 'comment_like',
          post: post._id,
          comment: comment._id,
          content: `${req.user.firstName} ${req.user.lastName} liked your comment`
        });
        await notification.save();
      }
      
      res.json({ message: 'Comment liked successfully', liked: true, likeCount: comment.likes.length });
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ message: 'Comment unliked successfully', liked: false, likeCount: comment.likes.length });
    }
  } catch (error) {
    console.error('Like/Unlike comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
