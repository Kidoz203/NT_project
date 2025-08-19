import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

export const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  border: 1px solid #e1e8ed;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #1da1f2;
          color: white;
          &:hover {
            background-color: #1a91da;
          }
        `;
      case 'secondary':
        return `
          background-color: transparent;
          color: #1da1f2;
          border: 1px solid #1da1f2;
          &:hover {
            background-color: #f7f9fa;
          }
        `;
      case 'danger':
        return `
          background-color: #e0245e;
          color: white;
          &:hover {
            background-color: #c91d4e;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #1da1f2;
    box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.2);
  }

  &::placeholder {
    color: #657786;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    border-color: #1da1f2;
    box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.2);
  }

  &::placeholder {
    color: #657786;
  }
`;

export const ErrorMessage = styled.div`
  color: #e0245e;
  font-size: 14px;
  margin-top: 5px;
`;

export const SuccessMessage = styled.div`
  color: #17bf63;
  font-size: 14px;
  margin-top: 5px;
`;

export const Avatar = styled.img<{ size?: string }>`
  width: ${({ size = '40px' }) => size};
  height: ${({ size = '40px' }) => size};
  border-radius: 50%;
  object-fit: cover;
  background-color: #f7f9fa;
`;

export const Flex = styled.div<{ 
  direction?: string; 
  align?: string; 
  justify?: string; 
  gap?: string;
  wrap?: string;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'center' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap = '0' }) => gap};
  flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`;

export const Grid = styled.div<{ columns?: string; gap?: string }>`
  display: grid;
  grid-template-columns: ${({ columns = '1fr' }) => columns};
  gap: ${({ gap = '20px' }) => gap};
`;

export const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1da1f2;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: #657786;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
    color: #1da1f2;
  }

  &:active {
    background-color: rgba(29, 161, 242, 0.2);
  }
`;

export const Badge = styled.span<{ color?: string }>`
  background-color: ${({ color = '#1da1f2' }) => color};
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  color: #14171a;
  margin: 0 0 2rem 0;
  font-weight: 700;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #e1e8ed;
  margin: 20px 0;
`;

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e1e8ed;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
`;

export const DropdownItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: ${({ danger }) => danger ? '#e0245e' : '#14171a'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: ${({ danger }) => danger ? 'rgba(224, 36, 94, 0.1)' : '#f7f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
