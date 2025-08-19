import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import { User, FriendRequest } from '../types';
import { Container, PageTitle, LoadingSpinner } from '../components/common/StyledComponents';
import Navigation from '../components/Navigation';
import FriendCard from '../components/FriendCard';
import FriendRequestCard from '../components/FriendRequestCard';

const FriendsContainer = styled(Container)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  
  ${props => props.active && `
    color: #4f46e5;
    border-bottom-color: #4f46e5;
  `}

  &:hover {
    color: #4f46e5;
    background: #f8f9fa;
  }
`;

const ContentSection = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  background: #4f46e5;
  color: white;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #4f46e5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

type TabType = 'requests' | 'friends' | 'suggestions' | 'search';

const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<(User & { mutualFriends?: number })[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchFriendRequests();
    } else if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFriendRequests = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getReceivedFriendRequests(1, 50);
      setFriendRequests(response.requests);
      setRequestsCount(response.pagination.totalRequests || response.requests.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
    setIsLoading(false);
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getUserFriends(user.id, 1, 100);
      setFriends(response.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
    setIsLoading(false);
  };

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getFriendSuggestions(20);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.searchUsers(searchQuery);
      setSearchResults(response.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setIsLoading(false);
  };

  const handleRequestAccepted = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    setRequestsCount(prev => Math.max(0, prev - 1));
    // Refresh friends list
    if (activeTab === 'friends') {
      fetchFriends();
    }
  };

  const handleRequestRejected = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    setRequestsCount(prev => Math.max(0, prev - 1));
  };

  const handleFriendRemoved = () => {
    fetchFriends();
  };

  const renderContent = () => {
    if (isLoading && (
      (activeTab === 'requests' && friendRequests.length === 0) ||
      (activeTab === 'friends' && friends.length === 0) ||
      (activeTab === 'suggestions' && suggestions.length === 0) ||
      (activeTab === 'search' && searchResults.length === 0)
    )) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'requests':
        return (
          <Section>
            <SectionTitle>
              Friend Requests
              {requestsCount > 0 && <Badge>{requestsCount}</Badge>}
            </SectionTitle>
            {friendRequests.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>👥</EmptyStateIcon>
                <p>No pending friend requests</p>
              </EmptyState>
            ) : (
              <ContentSection>
                {friendRequests.map((request) => (
                  <FriendRequestCard
                    key={request._id}
                    request={request}
                    onAccept={handleRequestAccepted}
                    onReject={handleRequestRejected}
                  />
                ))}
              </ContentSection>
            )}
          </Section>
        );

      case 'friends':
        return (
          <Section>
            <SectionTitle>
              My Friends
              {friends.length > 0 && <Badge>{friends.length}</Badge>}
            </SectionTitle>
            {friends.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>😔</EmptyStateIcon>
                <p>You haven't added any friends yet</p>
              </EmptyState>
            ) : (
              <ContentSection>
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    user={friend}
                    currentUserId={user?.id || ''}
                    showRemoveButton
                    onFriendRemoved={handleFriendRemoved}
                  />
                ))}
              </ContentSection>
            )}
          </Section>
        );

      case 'suggestions':
        return (
          <Section>
            <SectionTitle>
              Friend Suggestions
              {suggestions.length > 0 && <Badge>{suggestions.length}</Badge>}
            </SectionTitle>
            {suggestions.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>🔍</EmptyStateIcon>
                <p>No friend suggestions available</p>
              </EmptyState>
            ) : (
              <ContentSection>
                {suggestions.map((suggestion) => (
                  <FriendCard
                    key={suggestion.id}
                    user={suggestion}
                    currentUserId={user?.id || ''}
                    showAddButton
                    showMutualFriends
                    onFriendRequestSent={fetchSuggestions}
                  />
                ))}
              </ContentSection>
            )}
          </Section>
        );

      case 'search':
        return (
          <Section>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search for people by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
            
            <SectionTitle>
              Search Results
              {searchResults.length > 0 && <Badge>{searchResults.length}</Badge>}
            </SectionTitle>
            
            {searchQuery.length <= 2 ? (
              <EmptyState>
                <EmptyStateIcon>🔎</EmptyStateIcon>
                <p>Start typing to search for friends</p>
              </EmptyState>
            ) : searchResults.length === 0 && !isLoading ? (
              <EmptyState>
                <EmptyStateIcon>😕</EmptyStateIcon>
                <p>No users found for "{searchQuery}"</p>
              </EmptyState>
            ) : (
              <ContentSection>
                {searchResults.map((searchUser) => (
                  <FriendCard
                    key={searchUser.id}
                    user={searchUser}
                    currentUserId={user?.id || ''}
                    showAddButton
                  />
                ))}
              </ContentSection>
            )}
          </Section>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navigation />
      <FriendsContainer>
        <PageTitle>Friends</PageTitle>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')}
          >
            Friend Requests {requestsCount > 0 && `(${requestsCount})`}
          </Tab>
          <Tab 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')}
          >
            My Friends
          </Tab>
          <Tab 
            active={activeTab === 'suggestions'} 
            onClick={() => setActiveTab('suggestions')}
          >
            Suggestions
          </Tab>
          <Tab 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
          >
            Find Friends
          </Tab>
        </TabContainer>

        {renderContent()}
      </FriendsContainer>
    </>
  );
};

export default FriendsPage;
