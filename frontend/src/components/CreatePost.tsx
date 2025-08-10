import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { CreatePostData } from '../types';
import {
  Card,
  Button,
  TextArea,
  Avatar,
  Flex,
  ErrorMessage,
  SuccessMessage
} from './common/StyledComponents';

const CreatePostCard = styled(Card)`
  margin-bottom: 20px;
`;

const PostForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PostHeader = styled(Flex)`
  align-items: flex-start;
  gap: 12px;
`;

const PostContent = styled.div`
  flex: 1;
`;

const PostActions = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f7f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #1da1f2;
  transition: all 0.2s ease;

  &:hover {
    background: #e8f5fd;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  margin-top: 10px;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const CharacterCount = styled.span<{ isLimit?: boolean }>`
  font-size: 14px;
  color: ${({ isLimit }) => isLimit ? '#e0245e' : '#657786'};
`;

const VisibilitySelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1da1f2;
  }
`;

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreatePostData & { content: string }>();

  const content = watch('content', '');

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostData) => apiClient.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
      setMessage('Post created successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || 'Failed to create post');
      setTimeout(() => setMessage(''), 5000);
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = (data: CreatePostData & { content: string }) => {
    if (!data.content.trim() && !selectedImage) {
      setMessage('Please add some content or an image to your post');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const postData: CreatePostData = {
      content: data.content.trim(),
      visibility: data.visibility || 'public'
    };

    if (selectedImage) {
      postData.image = selectedImage;
    }

    createPostMutation.mutate(postData);
  };

  return (
    <CreatePostCard>
      <PostForm onSubmit={handleSubmit(onSubmit)}>
        <PostHeader>
          <Avatar
            src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'}
            alt={`${user?.firstName} ${user?.lastName}`}
            size="48px"
          />
          <PostContent>
            <TextArea
              placeholder="What's happening?"
              {...register('content', {
                maxLength: {
                  value: 2000,
                  message: 'Post cannot exceed 2000 characters'
                }
              })}
              style={{ minHeight: '80px' }}
            />
            {errors.content && <ErrorMessage>{errors.content.message}</ErrorMessage>}
            
            {imagePreview && (
              <ImagePreview>
                <PreviewImage src={imagePreview} alt="Preview" />
                <RemoveImageButton type="button" onClick={removeImage}>
                  ×
                </RemoveImageButton>
              </ImagePreview>
            )}
          </PostContent>
        </PostHeader>

        <PostActions>
          <Flex gap="15px" align="center">
            <FileInputLabel htmlFor="image-upload">
              📷 Photo
            </FileInputLabel>
            <FileInput
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            
            <VisibilitySelect {...register('visibility')}>
              <option value="public">🌍 Public</option>
              <option value="followers">👥 Followers</option>
              <option value="private">🔒 Private</option>
            </VisibilitySelect>
          </Flex>

          <Flex gap="15px" align="center">
            <CharacterCount isLimit={content.length > 1800}>
              {content.length}/2000
            </CharacterCount>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending || (content.length === 0 && !selectedImage)}
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </Flex>
        </PostActions>

        {message && (
          message.includes('successfully') ? 
            <SuccessMessage>{message}</SuccessMessage> : 
            <ErrorMessage>{message}</ErrorMessage>
        )}
      </PostForm>
    </CreatePostCard>
  );
};

export default CreatePost;
