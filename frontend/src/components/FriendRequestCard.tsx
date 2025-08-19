import React, { useState } from 'react';
import styled from 'styled-components';
import { FriendRequest } from '../types';
import { apiClient } from '../utils/api';

const Card = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
  border-left: 4px solid #4f46e5;
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

const Content = styled.div`
  flex: 1;
`;

const UserInfo = styled.div`
  margin-bottom: 0.5rem;
`;

const UserName = styled.h4`
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
`;

const UserHandle = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const RequestMessage = styled.p`
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.9rem;
  font-style: italic;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
`;

const TimeStamp = styled.span`
  font-size: 0.8rem;
  color: #888;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
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
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
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

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState<'accepted' | 'rejected' | null>(null);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await apiClient.acceptFriendRequest(request.id || request._id);
      setActionTaken('accepted');
      onAccept?.(request.id || request._id);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await apiClient.rejectFriendRequest(request.id || request._id);
      setActionTaken('rejected');
      onReject?.(request.id || request._id);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request');
    }
    setIsLoading(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (actionTaken) {
    return (
      <Card style={{ opacity: 0.7, borderLeftColor: actionTaken === 'accepted' ? '#10b981' : '#ef4444' }}>
        {request.sender.profilePicture ? (
          <Avatar src={request.sender.profilePicture} alt={`${request.sender.firstName} ${request.sender.lastName}`} />
        ) : (
          <DefaultAvatar>{getInitials(request.sender.firstName, request.sender.lastName)}</DefaultAvatar>
        )}
        
        <Content>
          <UserInfo>
            <UserName>{request.sender.firstName} {request.sender.lastName}</UserName>
            <UserHandle>@{request.sender.username}</UserHandle>
          </UserInfo>
          <TimeStamp>
            Friend request {actionTaken === 'accepted' ? 'accepted' : 'rejected'}
          </TimeStamp>
        </Content>
      </Card>
    );
  }

  return (
    <Card>
      {request.sender.profilePicture ? (
        <Avatar src={request.sender.profilePicture} alt={`${request.sender.firstName} ${request.sender.lastName}`} />
      ) : (
        <DefaultAvatar>{getInitials(request.sender.firstName, request.sender.lastName)}</DefaultAvatar>
      )}
      
      <Content>
        <UserInfo>
          <UserName>{request.sender.firstName} {request.sender.lastName}</UserName>
          <UserHandle>@{request.sender.username}</UserHandle>
        </UserInfo>
        
        {request.message && (
          <RequestMessage>"{request.message}"</RequestMessage>
        )}
        
        <TimeStamp>{formatTimeAgo(request.createdAt)}</TimeStamp>
      </Content>

      <ActionsContainer>
        <Button
          variant="primary"
          onClick={handleAccept}
          disabled={isLoading}
        >
          {isLoading ? 'Accepting...' : 'Accept'}
        </Button>
        
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={isLoading}
        >
          {isLoading ? 'Rejecting...' : 'Decline'}
        </Button>
      </ActionsContainer>
    </Card>
  );
};

export default FriendRequestCard;
