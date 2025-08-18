import React from 'react';
import styled from 'styled-components';
import { Notification } from '../types';
import { apiClient } from '../utils/api';

const NotificationContainer = styled.div<{ read: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #e1e8ed;
  background-color: ${props => props.read ? 'transparent' : '#f7f9fa'};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f7f9fa;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  background: linear-gradient(135deg, #fdfd00 0%, #ffd700 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #14171a;
  font-size: 16px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Message = styled.p`
  margin: 0 0 5px 0;
  color: #14171a;
  font-size: 14px;
  line-height: 1.4;
`;

const Time = styled.span`
  color: #657786;
  font-size: 12px;
`;

const PostPreview = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f7f9fa;
  border-radius: 8px;
  border-left: 3px solid #fdfd00;
`;

const PostContent = styled.p`
  margin: 0;
  color: #14171a;
  font-size: 13px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #fdfd00;
  margin-left: 8px;
  flex-shrink: 0;
  align-self: center;
`;

interface NotificationItemProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onNotificationClick,
  onMarkAsRead
}) => {
  const handleClick = async () => {
    if (!notification.read) {
      try {
        await apiClient.markNotificationAsRead(notification._id);
        onMarkAsRead(notification._id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    onNotificationClick(notification);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <NotificationContainer read={notification.read} onClick={handleClick}>
      {notification.sender.profilePicture ? (
        <Avatar src={notification.sender.profilePicture} alt="Profile" />
      ) : (
        <DefaultAvatar>
          {getInitials(notification.sender.firstName, notification.sender.lastName)}
        </DefaultAvatar>
      )}
      
      <Content>
        <Message>{notification.content}</Message>
        <Time>{formatTime(notification.createdAt)}</Time>
        
        {notification.post && (
          <PostPreview>
            <PostContent>{notification.post.content}</PostContent>
          </PostPreview>
        )}
      </Content>
      
      {!notification.read && <UnreadDot />}
    </NotificationContainer>
  );
};

export default NotificationItem; 