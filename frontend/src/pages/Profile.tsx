import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import Navigation from '../components/Navigation';
import { 
  Container, 
  Card, 
  Avatar,
  LoadingSpinner,
  Button,
  Flex,
  ErrorMessage
} from '../components/common/StyledComponents';

const ProfileContainer = styled.div`
  padding: 20px 0;
`;

const ProfileCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const ProfileHeader = styled.div`
  margin-bottom: 20px;
`;

const ProfileName = styled.h1`
  color: #14171a;
  margin: 15px 0 5px;
  font-size: 24px;
`;

const ProfileUsername = styled.h2`
  color: #657786;
  font-size: 16px;
  font-weight: normal;
  margin: 0;
`;

const ProfileBio = styled.p`
  color: #14171a;
  margin: 15px 0;
  line-height: 1.5;
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #14171a;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #657786;
`;

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getUserProfile(username!);
      setUser(response.user);
      
      // Check if current user is following this user
      if (currentUser && response.user.id !== currentUser.id) {
        // You might want to add an API endpoint to check follow status
        // For now, we'll assume not following
        setIsFollowing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user) return;
    
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await apiClient.unfollowUser(user.id);
        setIsFollowing(false);
      } else {
        await apiClient.followUser(user.id);
        setIsFollowing(true);
      }
      // Reload user profile to get updated follower count
      await loadUserProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container>
          <LoadingSpinner />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <Container>
          <ErrorMessage>User not found</ErrorMessage>
        </Container>
      </>
    );
  }

  const isOwnProfile = currentUser && user.id === currentUser.id;

  return (
    <>
      <Navigation />
      <ProfileContainer>
        <Container>
          <ProfileCard>
            <ProfileHeader>
              <Avatar 
                src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'} 
                alt={`${user.firstName} ${user.lastName}`}
                size="100px"
              />
              <ProfileName>{user.firstName} {user.lastName}</ProfileName>
              <ProfileUsername>@{user.username}</ProfileUsername>
              {user.bio && <ProfileBio>{user.bio}</ProfileBio>}
              
              {!isOwnProfile && currentUser && (
                <Flex justify="center" style={{ marginTop: '20px' }}>
                  <Button 
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={isFollowing ? 'secondary' : 'primary'}
                  >
                    {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                  </Button>
                </Flex>
              )}
              
              {isOwnProfile && (
                <Flex justify="center" style={{ marginTop: '20px' }}>
                  <Button onClick={() => navigate('/edit-profile')}>
                    Edit Profile
                  </Button>
                </Flex>
              )}
            </ProfileHeader>

            <ProfileStats>
              <StatItem>
                <StatNumber>{user.followers}</StatNumber>
                <StatLabel>Followers</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{user.following}</StatNumber>
                <StatLabel>Following</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>42</StatNumber>
                <StatLabel>Posts</StatLabel>
              </StatItem>
            </ProfileStats>
          </ProfileCard>
        </Container>
      </ProfileContainer>
    </>
  );
};

export default ProfilePage;
