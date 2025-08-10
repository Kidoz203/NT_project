import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { PostsResponse } from '../types';
import Post from './Post';
import CreatePost from './CreatePost';
import {
  Button,
  LoadingSpinner,
  ErrorMessage,
  Flex
} from './common/StyledComponents';

const FeedContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const LoadMoreContainer = styled(Flex)`
  justify-content: center;
  margin: 20px 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #657786;
`;

const EmptyStateTitle = styled.h3`
  color: #14171a;
  margin-bottom: 10px;
`;

const EmptyStateText = styled.p`
  line-height: 1.5;
`;

const Feed: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useQuery<PostsResponse>({
    queryKey: ['posts', currentPage],
    queryFn: () => apiClient.getPosts(currentPage, postsPerPage)
  });

  if (isLoading && currentPage === 1) {
    return (
      <FeedContainer>
        <CreatePost />
        <LoadingSpinner />
      </FeedContainer>
    );
  }

  if (error) {
    return (
      <FeedContainer>
        <CreatePost />
        <ErrorMessage>
          Failed to load posts. 
          <Button 
            variant="secondary" 
            onClick={() => refetch()}
            style={{ marginLeft: '10px' }}
          >
            Try Again
          </Button>
        </ErrorMessage>
      </FeedContainer>
    );
  }

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination;

  return (
    <FeedContainer>
      <CreatePost />
      
      {posts.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No posts yet!</EmptyStateTitle>
          <EmptyStateText>
            Be the first to share something with the community. 
            Create your first post above to get started.
          </EmptyStateText>
        </EmptyState>
      ) : (
        <>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}

          {pagination?.hasNextPage && (
            <LoadMoreContainer>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Posts'}
              </Button>
            </LoadMoreContainer>
          )}

          {currentPage > 1 && (
            <LoadMoreContainer>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(1)}
              >
                Back to Top
              </Button>
            </LoadMoreContainer>
          )}
        </>
      )}
    </FeedContainer>
  );
};

export default Feed;
