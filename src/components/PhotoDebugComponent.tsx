import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import type { PropertyListing } from '../types/property';

interface PhotoDebugComponentProps {
  properties: PropertyListing[];
}

const PhotoDebugComponent: React.FC<PhotoDebugComponentProps> = ({ properties }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Photo Debug Information
      </Typography>
      
      {properties.slice(0, 5).map((property, index) => (
        <Card key={property.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property {index + 1}: {property.address}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Property ID: {property.id}
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              Images Array Length: {property.images?.length || 0}
            </Typography>
            
            {property.images && property.images.length > 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Available Image URLs:
                </Typography>
                {property.images.slice(0, 3).map((url, imgIndex) => (
                  <Box key={imgIndex} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      {url}
                    </Typography>
                    <CardMedia
                      component="img"
                      height={100}
                      image={url}
                      alt={`${property.address} - Image ${imgIndex + 1}`}
                      sx={{ mt: 1, maxWidth: 200 }}
                      onError={(e) => {
                        console.error(`Failed to load image: ${url}`);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded image: ${url}`);
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            
            {(!property.images || property.images.length === 0) && (
              <Typography variant="body2" color="warning.main">
                No images available for this property
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PhotoDebugComponent;
