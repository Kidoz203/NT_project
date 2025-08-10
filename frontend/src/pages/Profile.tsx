import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Container, 
  Card, 
  Avatar,
  LoadingSpinner
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

  // This is a placeholder - in a real app, you'd fetch the user data
  const isLoading = false;
  const user = {
    id: '1',
    username: username || 'user',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: '',
    bio: 'This is a sample bio for the user profile.',
    followers: 150,
    following: 200,
    isPrivate: false,
    createdAt: '2024-01-01'
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
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
  );
};

export default ProfilePage;
