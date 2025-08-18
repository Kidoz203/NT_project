import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Feed from '../components/Feed';
import Navigation from '../components/Navigation';
import { 
  Container
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
  color:rgb(253, 253, 0);
  font-size: 30px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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
  return (
    <>
      <Navigation />
      <MainContent>
        <Container>
          <Feed />
        </Container>
      </MainContent>
    </>
  );
};

export default HomePage;
