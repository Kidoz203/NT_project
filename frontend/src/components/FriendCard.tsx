import React, { useState } from 'react';
import styled from 'styled-components';
import { User } from '../types';
import { apiClient } from '../utils/api';

const Card = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h4`
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
`;

const UserHandle = styled.p`
  margin: 0 0 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const UserBio = styled.p`
  margin: 0;
  color: #888;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const MutualFriends = styled.span`
  font-size: 0.8rem;
  color: #666;
  margin-left: 0.5rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #4f46e5;
          color: white;
          &:hover { background: #4338ca; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #e5e7eb; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface FriendCardProps {
  user: User & { mutualFriends?: number };
  currentUserId: string;
  onFriendRequestSent?: () => void;
  onFriendAdded?: () => void;
  onFriendRemoved?: () => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  showMutualFriends?: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({
  user,
  currentUserId,
  onFriendRequestSent,
  onFriendAdded,
  onFriendRemoved,
  showAddButton = false,
  showRemoveButton = false,
  showMutualFriends = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSendFriendRequest = async () => {
    setIsLoading(true);
    try {
      await apiClient.sendFriendRequest(user.id);
      setActionCompleted(true);
      onFriendRequestSent?.();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
    setIsLoading(false);
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to unfriend ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.removeFriend(user.id);
      onFriendRemoved?.();
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
    setIsLoading(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      {user.profilePicture ? (
        <Avatar src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
      ) : (
        <DefaultAvatar>{getInitials(user.firstName, user.lastName)}</DefaultAvatar>
      )}
      
      <UserInfo>
        <UserName>{user.firstName} {user.lastName}</UserName>
        <UserHandle>@{user.username}</UserHandle>
        {user.bio && <UserBio>{user.bio}</UserBio>}
        {showMutualFriends && user.mutualFriends !== undefined && user.mutualFriends > 0 && (
          <MutualFriends>{user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}</MutualFriends>
        )}
      </UserInfo>

      <ActionsContainer>
        {showAddButton && !actionCompleted && (
          <Button
            variant="primary"
            onClick={handleSendFriendRequest}
            disabled={isLoading || user.id === currentUserId}
          >
            {isLoading ? 'Sending...' : 'Add Friend'}
          </Button>
        )}

        {actionCompleted && (
          <Button disabled>
            Request Sent
          </Button>
        )}

        {showRemoveButton && (
          <Button
            variant="danger"
            onClick={handleRemoveFriend}
            disabled={isLoading}
          >
            {isLoading ? 'Removing...' : 'Remove'}
          </Button>
        )}
      </ActionsContainer>
    </Card>
  );
};

export default FriendCard;
