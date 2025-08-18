import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const zoomIn = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.5);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

const LightboxOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 20px;
`;

const LightboxContainer = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LightboxImage = styled.img<{ zoomed: boolean }>`
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: ${({ zoomed }) => zoomed ? 'zoom-out' : 'zoom-in'};
  transform: ${({ zoomed }) => zoomed ? 'scale(1.5)' : 'scale(1)'};
  transition: transform 0.3s ease;
  animation: ${zoomIn} 0.3s ease-out;
`;

const LightboxControls = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CloseButton = styled(ControlButton)`
  position: absolute;
  top: -50px;
  right: -10px;
  font-size: 24px;
  
  @media (max-width: 768px) {
    top: -40px;
    right: 0;
  }
`;

const ImageInfo = styled.div`
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  
  @media (max-width: 768px) {
    bottom: -40px;
    font-size: 12px;
  }
`;

const ZoomContainer = styled.div<{ zoomed: boolean }>`
  ${({ zoomed }) => zoomed && `
    overflow: auto;
    max-width: 90vw;
    max-height: 85vh;
  `}
`;

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  src,
  alt = 'Image',
  isOpen,
  onClose,
  onDownload
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset zoom when lightbox opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      setImageLoaded(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          handleToggleZoom();
          break;
        case 'd':
        case 'D':
          if (onDownload) {
            onDownload();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onDownload, isZoomed]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleToggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onDownload) {
      onDownload();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <LightboxOverlay isOpen={isOpen} onClick={handleBackdropClick}>
      <LightboxContainer>
        <CloseButton onClick={onClose} title="Close (Esc)">
          ✕
        </CloseButton>
        
        <ZoomContainer zoomed={isZoomed}>
          <LightboxImage
            src={src}
            alt={alt}
            zoomed={isZoomed}
            onClick={handleToggleZoom}
            onLoad={() => setImageLoaded(true)}
            title={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
          />
        </ZoomContainer>

        {imageLoaded && (
          <>
            <LightboxControls>
              <ControlButton 
                onClick={handleToggleZoom}
                title={isZoomed ? 'Zoom out (Space)' : 'Zoom in (Space)'}
              >
                {isZoomed ? '🔍⁻' : '🔍⁺'}
              </ControlButton>
              
              <ControlButton 
                onClick={handleDownload}
                title="Download image (D)"
              >
                📥
              </ControlButton>
            </LightboxControls>

            <ImageInfo>
              Click image to zoom • Space to toggle zoom • D to download • Esc to close
            </ImageInfo>
          </>
        )}
      </LightboxContainer>
    </LightboxOverlay>
  );
};

export default ImageLightbox;
