import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { 
  Avatar, 
  Flex, 
  IconButton,
  DropdownContainer,
  DropdownMenu,
  DropdownItem
} from './common/StyledComponents';

const NavContainer = styled.nav`
  background: white;
  border-bottom: 1px solid #e1e8ed;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #fdfd00;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    color: #ffd700;
  }
`;

const NavLinks = styled(Flex)`
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)<{ active?: boolean }>`
  color: ${({ active }) => active ? '#fdfd00' : '#657786'};
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: #fdfd00;
    background-color: rgba(253, 253, 0, 0.1);
  }
`;

const NotificationButton = styled(IconButton)<{ hasNotifications?: boolean }>`
  position: relative;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(253, 253, 0, 0.1);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #e0245e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #14171a;
  font-size: 14px;
`;

const UserUsername = styled.div`
  color: #657786;
  font-size: 12px;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #e0245e;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(224, 36, 94, 0.1);
  }
`;

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.getUnreadNotificationCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/">SocialApp</Logo>
        
        <NavLinks>
          <NavLink to="/" active={isActive('/')}>
            🏠 Home
          </NavLink>
          
          <NotificationButton 
            as={Link} 
            to="/notifications"
            hasNotifications={unreadCount > 0}
            onClick={() => setShowUserMenu(false)}
          >
            🔔
            {unreadCount > 0 && (
              <NotificationBadge>
                {unreadCount > 99 ? '99+' : unreadCount}
              </NotificationBadge>
            )}
          </NotificationButton>
          
          <UserMenu>
            <UserInfo>
              <UserName>{user.firstName} {user.lastName}</UserName>
              <UserUsername>@{user.username}</UserUsername>
            </UserInfo>
            
            <DropdownContainer>
              <Avatar
                src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'}
                alt={`${user.firstName} ${user.lastName}`}
                size="40px"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ cursor: 'pointer' }}
              />
              <DropdownMenu isOpen={showUserMenu}>
                <DropdownItem as={Link} to={`/profile/${user.username}`}>
                  👤 View Profile
                </DropdownItem>
                <DropdownItem as={Link} to="/edit-profile">
                  ✏️ Edit Profile
                </DropdownItem>
                <DropdownItem as={Link} to="/notifications">
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: 'auto', color: '#e0245e' }}>
                      {unreadCount}
                    </span>
                  )}
                </DropdownItem>
                <DropdownItem danger onClick={handleLogout}>
                  🚪 Logout
                </DropdownItem>
              </DropdownMenu>
            </DropdownContainer>
          </UserMenu>
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation; 