import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { UpdateProfileData } from '../types';
import { 
  Container, 
  Card, 
  Button, 
  Input, 
  TextArea,
  ErrorMessage,
  SuccessMessage,
  Flex,
  Avatar
} from '../components/common/StyledComponents';

const EditProfileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfd00 0%,rgb(249, 249, 249) 100%);
  padding: 20px 0;
`;

const EditProfileCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #14171a;
  margin-bottom: 30px;
  font-size: 28px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #14171a;
`;

const ProfilePictureSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ProfilePictureContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
`;

const ProfilePicture = styled(Avatar)`
  width: 120px;
  height: 120px;
  border: 3px solid #fdfd00;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DefaultProfilePicture = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fdfd00 0%, #ffd700 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #14171a;
  font-size: 48px;
  border: 3px solid #fdfd00;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background-color: #fdfd00;
  color: #14171a;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ffd700;
  }
`;

const RemoveButton = styled.button`
  display: inline-block;
  padding: 8px 16px;
  background-color: #e0245e;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  margin-left: 10px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #c91d4e;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const CancelButton = styled(Button)`
  background-color: #657786;
  color: white;

  &:hover {
    background-color: #4a5a6a;
  }
`;

const EditProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UpdateProfileData>();

  const isPrivate = watch('isPrivate');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Set initial values
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('bio', user.bio || '');
    setValue('location', user.location || '');
    setValue('website', user.website || '');
    setValue('isPrivate', user.isPrivate);
    setPreviewUrl(user.profilePicture || '');
  }, [user, navigate, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
  };

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const updateData: UpdateProfileData = {
        ...data,
        isPrivate: Boolean(data.isPrivate)
      };

      if (selectedImage) {
        updateData.profilePicture = selectedImage;
      }

      const response = await apiClient.updateProfile(updateData);
      
      // Update user context
      updateUser(response.user);
      
      setSuccess('Profile updated successfully!');
      
      // Redirect to profile page after a short delay
      setTimeout(() => {
        navigate(`/profile/${user?.username}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during profile update');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <EditProfileContainer>
      <Container>
        <EditProfileCard>
          <Title>Edit Profile</Title>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <ProfilePictureSection>
              <ProfilePictureContainer>
                {previewUrl ? (
                  <ProfilePicture src={previewUrl} alt="Profile" size="120px" />
                ) : (
                  <DefaultProfilePicture>
                    {getInitials(user.firstName, user.lastName)}
                  </DefaultProfilePicture>
                )}
              </ProfilePictureContainer>
              
              <Flex gap="10px" justify="center">
                <FileInput
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <UploadButton htmlFor="profilePicture">
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </UploadButton>
                
                {previewUrl && (
                  <RemoveButton type="button" onClick={handleRemoveImage}>
                    Remove
                  </RemoveButton>
                )}
              </Flex>
            </ProfilePictureSection>

            <Flex gap="15px">
              <InputGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                />
                {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                />
                {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
              </InputGroup>
            </Flex>

            <InputGroup>
              <Label htmlFor="bio">Bio</Label>
              <TextArea
                id="bio"
                placeholder="Tell us about yourself..."
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio cannot exceed 500 characters'
                  }
                })}
              />
              {errors.bio && <ErrorMessage>{errors.bio.message}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Where are you located?"
                {...register('location', {
                  maxLength: {
                    value: 100,
                    message: 'Location cannot exceed 100 characters'
                  }
                })}
              />
              {errors.location && <ErrorMessage>{errors.location.message}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                {...register('website', {
                  maxLength: {
                    value: 200,
                    message: 'Website cannot exceed 200 characters'
                  }
                })}
              />
              {errors.website && <ErrorMessage>{errors.website.message}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Flex align="center" gap="10px">
                <input
                  id="isPrivate"
                  type="checkbox"
                  {...register('isPrivate')}
                />
                <Label htmlFor="isPrivate" style={{ margin: 0, cursor: 'pointer' }}>
                  Make profile private
                </Label>
              </Flex>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#657786' }}>
                Private profiles are only visible to followers
              </p>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <ButtonGroup>
              <CancelButton type="button" onClick={() => navigate(`/profile/${user.username}`)}>
                Cancel
              </CancelButton>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </ButtonGroup>
          </Form>
        </EditProfileCard>
      </Container>
    </EditProfileContainer>
  );
};

export default EditProfilePage; 