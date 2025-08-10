import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Feed from '../components/Feed';
import { 
  Container, 
  Button, 
  Avatar
} from '../components/common/StyledComponents';

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e1e8ed;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
`;

const Logo = styled.h1`
  color: #1da1f2;
  font-size: 24px;
  font-weight: bold;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const UserHandle = styled.span`
  color: #657786;
  font-size: 12px;
`;

const MainContent = styled.main`
  padding: 20px 0;
  min-height: calc(100vh - 80px);
`;


const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Header>
        <Container>
          <HeaderContent>
            <Logo>Social Media</Logo>
            <UserSection>
              <UserInfo>
                <UserName>{user?.firstName} {user?.lastName}</UserName>
                <UserHandle>@{user?.username}</UserHandle>
              </UserInfo>
              <Avatar 
                src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'} 
                alt="Profile"
                size="40px"
              />
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </UserSection>
          </HeaderContent>
        </Container>
      </Header>

      <MainContent>
        <Container>
          <Feed />
        </Container>
      </MainContent>
    </>
  );
};

export default HomePage;
