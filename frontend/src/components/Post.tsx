import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Post as PostType } from '../types';
import ImageLightbox from './ImageLightbox';
import {
  Card,
  Button,
  Avatar,
  Flex,
  IconButton,
  Divider,
  TextArea,
  ErrorMessage
} from './common/StyledComponents';

const PostCard = styled(Card)`
  margin-bottom: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const PostHeader = styled(Flex)`
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const UserName = styled(Link)`
  font-weight: 600;
  color: #14171a;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Username = styled.span`
  color: #657786;
  margin-left: 8px;
`;

const PostTime = styled.span`
  color: #657786;
  font-size: 14px;
`;

const PostContent = styled.div`
  margin-bottom: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 12px;
  margin: 12px 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const PostActions = styled(Flex)`
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e1e8ed;
`;

const ActionButton = styled(IconButton)<{ active?: boolean }>`
  color: ${({ active }) => active ? '#1da1f2' : '#657786'};
  font-size: 14px;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;

  &:hover {
    background-color: ${({ active }) => active ? 'rgba(29, 161, 242, 0.1)' : 'rgba(29, 161, 242, 0.1)'};
    color: #1da1f2;
  }
`;

const CommentSection = styled.div`
  margin-top: 16px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  margin: 12px 0;
  padding: 12px;
  background: #f7f9fa;
  border-radius: 12px;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled(Link)`
  font-weight: 600;
  font-size: 14px;
  color: #14171a;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CommentText = styled.div`
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.4;
`;

const CommentActions = styled(Flex)`
  gap: 10px;
  margin-top: 8px;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  align-items: flex-start;
`;

const CommentInput = styled(TextArea)`
  flex: 1;
  min-height: 60px;
  resize: none;
`;

// Dropdown menu styles
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled(IconButton)`
  padding: 8px;
  color: #657786;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
    color: #1da1f2;
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e1e8ed;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  animation: ${slideDown} 0.2s ease-out;
`;

const DropdownItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: ${({ danger }) => danger ? '#e0245e' : '#14171a'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: ${({ danger }) => danger ? 'rgba(224, 36, 94, 0.1)' : '#f7f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal styles for confirmation
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: ${slideDown} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #14171a;
  font-size: 20px;
  font-weight: 700;
`;

const ModalText = styled.p`
  margin: 0 0 24px 0;
  color: #657786;
  line-height: 1.5;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled(Button)<{ variant?: 'danger' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${({ variant }) => variant === 'danger' && `
    background-color: #e0245e;
    border-color: #e0245e;
    
    &:hover {
      background-color: #c91e4a;
      border-color: #c91e4a;
    }
  `}
  
  ${({ variant }) => variant === 'secondary' && `
    background-color: transparent;
    color: #657786;
    border: 1px solid #e1e8ed;
    
    &:hover {
      background-color: #f7f9fa;
      color: #14171a;
    }
  `}
`;

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const likeMutation = useMutation({
    mutationFn: () => apiClient.likePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => apiClient.addComment(post._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment('');
      setCommentError('');
    },
    onError: (error: any) => {
      setCommentError(error.response?.data?.message || 'Failed to add comment');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(post._id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiClient.likeComment(post._id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: () => apiClient.deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowDeleteModal(false);
      setShowDropdown(false);
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowCommentDeleteModal(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
      setShowCommentDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const handleLikeComment = (commentId: string) => {
    likeCommentMutation.mutate(commentId);
  };

  const handleDeletePost = () => {
    deletePostMutation.mutate();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isLikedByUser = post.likes.includes(user?.id || '');
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  return (
    <PostCard>
      <PostHeader>
        <Avatar
          src={post.user.profilePicture ? `http://localhost:5000${post.user.profilePicture}` : '/default-avatar.png'}
          alt={`${post.user.firstName} ${post.user.lastName}`}
          size="48px"
        />
        <UserInfo>
          <div>
            <UserName to={`/profile/${post.user.username}`}>
              {post.user.firstName} {post.user.lastName}
            </UserName>
            <Username>@{post.user.username}</Username>
          </div>
        </UserInfo>
        <PostTime>{formatTime(post.createdAt)}</PostTime>
        {post.user._id === user?.id && (
          <DropdownContainer ref={dropdownRef}>
            <DropdownButton onClick={toggleDropdown}>
              ⋯
            </DropdownButton>
            <DropdownMenu isOpen={showDropdown}>
              <DropdownItem onClick={() => console.log('Edit post')}>
                ✏️ Edit post
              </DropdownItem>
              <DropdownItem danger onClick={openDeleteModal}>
                🗑️ Delete post
              </DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
        )}
      </PostHeader>

      <PostContent>{post.content}</PostContent>

      {post.image && (
        <PostImage
          src={`http://localhost:5000${post.image}`}
          alt="Post image"
          onClick={() => setShowImageLightbox(true)}
        />
      )}

      <PostActions>
        <ActionButton
          active={isLikedByUser}
          onClick={handleLike}
          disabled={likeMutation.isPending}
        >
          ❤️ {post.likeCount}
        </ActionButton>
        
        <ActionButton onClick={() => setShowComments(!showComments)}>
          💬 {post.commentCount}
        </ActionButton>

        <ActionButton>
          🔄 {post.shares}
        </ActionButton>

        <ActionButton>
          📤 Share
        </ActionButton>
      </PostActions>

      {showComments && (
        <CommentSection>
          <Divider />
          
          {post.comments.length > 0 && (
            <div>
              {post.comments.map((comment) => (
                <CommentItem key={comment._id}>
                  <Avatar
                    src={comment.user.profilePicture ? `http://localhost:5000${comment.user.profilePicture}` : '/default-avatar.png'}
                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                    size="32px"
                  />
                  <CommentContent>
                    <CommentAuthor to={`/profile/${comment.user.username}`}>
                      {comment.user.firstName} {comment.user.lastName}
                    </CommentAuthor>
                    <CommentText>{comment.content}</CommentText>
                    <CommentActions>
                      <ActionButton
                        active={comment.likes.includes(user?.id || '')}
                        onClick={() => handleLikeComment(comment._id)}
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        ❤️ {comment.likes.length}
                      </ActionButton>
                      {(comment.user._id === user?.id || post.user._id === user?.id) && (
                        <ActionButton
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ padding: '4px 8px', fontSize: '12px', color: '#e0245e' }}
                        >
                          🗑️ Delete
                        </ActionButton>
                      )}
                    </CommentActions>
                  </CommentContent>
                </CommentItem>
              ))}
            </div>
          )}

          <CommentForm onSubmit={handleComment}>
            <Avatar
              src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'}
              alt={`${user?.firstName} ${user?.lastName}`}
              size="40px"
            />
            <CommentInput
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || commentMutation.isPending}
              style={{ marginTop: '0' }}
            >
              {commentMutation.isPending ? 'Posting...' : 'Comment'}
            </Button>
          </CommentForm>
          
          {commentError && <ErrorMessage>{commentError}</ErrorMessage>}
        </CommentSection>
      )}
      
      {/* Delete Post Modal */}
      <ModalOverlay isOpen={showDeleteModal} onClick={() => setShowDeleteModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Delete Post</ModalTitle>
          <ModalText>
            Are you sure you want to delete this post? This action cannot be undone.
          </ModalText>
          <ModalActions>
            <ModalButton 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </ModalButton>
            <ModalButton 
              variant="danger" 
              onClick={handleDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
      
      {/* Delete Comment Modal */}
      <ModalOverlay isOpen={showCommentDeleteModal} onClick={() => setShowCommentDeleteModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Delete Comment</ModalTitle>
          <ModalText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </ModalText>
          <ModalActions>
            <ModalButton 
              variant="secondary" 
              onClick={() => {
                setShowCommentDeleteModal(false);
                setCommentToDelete(null);
              }}
              disabled={deleteCommentMutation.isPending}
            >
              Cancel
            </ModalButton>
            <ModalButton 
              variant="danger" 
              onClick={confirmDeleteComment}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
      
      {/* Image Lightbox */}
      {post.image && (
        <ImageLightbox
          src={`http://localhost:5000${post.image}`}
          alt={`Post by ${post.user.firstName} ${post.user.lastName}`}
          isOpen={showImageLightbox}
          onClose={() => setShowImageLightbox(false)}
          onDownload={() => console.log('Image downloaded')}
        />
      )}
    </PostCard>
  );
};

export default Post;
