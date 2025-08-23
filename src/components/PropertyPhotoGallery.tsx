import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  ImageList,
  ImageListItem,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Share
} from '@mui/icons-material';
import { PropertyPhotoService } from '../services/propertyPhotoService';
import type { PropertyPhoto } from '../services/propertyPhotoService';

interface PropertyPhotoGalleryProps {
  open: boolean;
  onClose: () => void;
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    images?: string[];
  };
}

const PropertyPhotoGallery: React.FC<PropertyPhotoGalleryProps> = ({
  open,
  onClose,
  property
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showLargeView, setShowLargeView] = useState(false);

  useEffect(() => {
    if (open && property.id) {
      loadPropertyPhotos();
    }
  }, [open, property.id]);

  const loadPropertyPhotos = async () => {
    setLoading(true);
    try {
      // If property already has images, use them
      if (property.images && property.images.length > 0) {
        const propertyPhotos: PropertyPhoto[] = property.images.map((url, index) => ({
          url,
          description: `Property photo ${index + 1}`,
          type: index === 0 ? 'exterior' : 'interior'
        }));
        setPhotos(propertyPhotos);
      } else {
        // Try to fetch from API
        const response = await PropertyPhotoService.fetchPropertyPhotos(property.id);
        setPhotos(response.photos);
      }
    } catch (error) {
      console.error('Error loading property photos:', error);
      // Fallback to sample photos
      setPhotos([
        {
          url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80',
          description: 'Property exterior',
          type: 'exterior'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setSelectedPhoto(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedPhoto(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async (photo: PropertyPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-${property.address.replace(/\s+/g, '-')}-photo-${selectedPhoto + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const handleShare = async (photo: PropertyPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Property Photo - ${property.address}`,
          text: `Check out this photo of ${property.address}, ${property.city}, ${property.state}`,
          url: photo.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(photo.url);
    }
  };

  if (!photos.length && !loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Property Photos
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>No photos available for this property.</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog
        open={open && !showLargeView}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="div">
                Property Photos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {property.address}, {property.city}, {property.state}
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Main Photo Display */}
              <Box sx={{ position: 'relative', bgcolor: 'black' }}>
                <img
                  src={PropertyPhotoService.optimizeImageUrl(photos[selectedPhoto]?.url || '', 800, 600)}
                  alt={photos[selectedPhoto]?.description || 'Property photo'}
                  style={{
                    width: '100%',
                    height: isMobile ? '50vh' : '60vh',
                    objectFit: 'contain'
                  }}
                />
                
                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevious}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={handleNext}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
                
                {/* Photo Actions */}
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1
                }}>
                  <IconButton
                    onClick={() => setShowLargeView(true)}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <ZoomIn />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDownload(photos[selectedPhoto])}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <Download />
                  </IconButton>
                  <IconButton
                    onClick={() => handleShare(photos[selectedPhoto])}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
                
                {/* Photo Counter */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Chip
                    label={`${selectedPhoto + 1} of ${photos.length}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                  />
                  {photos[selectedPhoto]?.type && (
                    <Chip
                      label={photos[selectedPhoto].type}
                      size="small"
                      color={photos[selectedPhoto].type === 'exterior' ? 'primary' : 'secondary'}
                      sx={{ bgcolor: 'rgba(0,0,0,0.7)' }}
                    />
                  )}
                </Box>
              </Box>

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <Box sx={{ p: 2 }}>
                  <ImageList
                    sx={{ width: '100%', height: 120 }}
                    cols={Math.min(photos.length, isMobile ? 4 : 8)}
                    gap={8}
                  >
                    {photos.map((photo, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: 'pointer',
                          border: selectedPhoto === index ? 2 : 0,
                          borderColor: 'primary.main',
                          borderRadius: 1,
                          overflow: 'hidden',
                          opacity: selectedPhoto === index ? 1 : 0.7,
                          '&:hover': { opacity: 1 }
                        }}
                        onClick={() => setSelectedPhoto(index)}
                      >
                        <img
                          src={PropertyPhotoService.optimizeImageUrl(photo.url, 120, 90)}
                          alt={photo.description}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            {photos[selectedPhoto]?.description}
          </Typography>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Large View Dialog */}
      <Dialog
        open={showLargeView}
        onClose={() => setShowLargeView(false)}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'black'
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={photos[selectedPhoto]?.url}
            alt={photos[selectedPhoto]?.description || 'Property photo'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
          <IconButton
            onClick={() => setShowLargeView(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};

export default PropertyPhotoGallery;
