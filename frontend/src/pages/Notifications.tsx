import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { Notification } from '../types';
import NotificationItem from '../components/NotificationItem';
import { 
  Container, 
  Card, 
  Button, 
  ErrorMessage,
  Flex
} from '../components/common/StyledComponents';

const NotificationsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfd00 0%,rgb(249, 249, 249) 100%);
  padding: 20px 0;
`;

const NotificationsCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
  background-color: white;
`;

const Title = styled.h1`
  color: #14171a;
  margin: 0 0 10px 0;
  font-size: 24px;
`;

const Subtitle = styled.p`
  color: #657786;
  margin: 0;
  font-size: 14px;
`;

const NotificationsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #657786;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #14171a;
`;

const EmptySubtext = styled.p`
  margin: 0;
  font-size: 14px;
`;

const LoadMoreButton = styled(Button)`
  width: 100%;
  margin: 20px;
  background-color: #f7f9fa;
  color: #14171a;
  border: 1px solid #e1e8ed;

  &:hover {
    background-color: #e1e8ed;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadNotifications();
    loadUnreadCount();
  }, [user, navigate]);

  const loadNotifications = async (pageNum: number = 1) => {
    try {
      setError('');
      const response = await apiClient.getNotifications(pageNum);
      
      if (pageNum === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.pagination.hasNextPage);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.getUnreadNotificationCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadNotifications(page + 1);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.post) {
      navigate(`/post/${notification.post._id}`);
    } else if (notification.type === 'follow' || notification.type === 'unfollow') {
      navigate(`/profile/${notification.sender.username}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return (
      <NotificationsContainer>
        <Container>
          <NotificationsCard>
            <Header>
              <Title>Notifications</Title>
              <Subtitle>Loading...</Subtitle>
            </Header>
          </NotificationsCard>
        </Container>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <Container>
        <NotificationsCard>
          <Header>
            <Flex justify="space-between" align="center">
              <div>
                <Title>Notifications</Title>
                <Subtitle>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </Subtitle>
              </div>
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </Flex>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <NotificationsList>
            {notifications.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🔔</EmptyIcon>
                <EmptyText>No notifications yet</EmptyText>
                <EmptySubtext>
                  When you get notifications, they'll show up here
                </EmptySubtext>
              </EmptyState>
            ) : (
              <>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
                
                {hasMore && (
                  <LoadMoreButton 
                    onClick={handleLoadMore} 
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </LoadMoreButton>
                )}
              </>
            )}
          </NotificationsList>
        </NotificationsCard>
      </Container>
    </NotificationsContainer>
  );
};

export default NotificationsPage; 