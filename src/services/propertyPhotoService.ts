/**
 * Property Photo Service - Enhanced photo retrieval from Zillow API
 * Provides comprehensive image fetching capabilities for real estate properties
 */

import axios from 'axios';

export interface PropertyPhoto {
  url: string;
  width?: number;
  height?: number;
  description?: string;
  type?: 'exterior' | 'interior' | 'other';
}

export interface PropertyPhotoResponse {
  photos: PropertyPhoto[];
  totalCount: number;
  hasMore: boolean;
}

export class PropertyPhotoService {
  private static readonly RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

  /**
   * Fetch property photos from Zillow API using property ID (ZPID)
   */
  static async fetchPropertyPhotos(zpid: string): Promise<PropertyPhotoResponse> {
    console.log('📸 Fetching detailed photos for ZPID:', zpid);
    
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ No API key configured for photo service. Using sample photos...');
      return this.getSamplePhotos();
    }

    try {
      const config = {
        method: 'GET',
        url: 'https://zillow-com1.p.rapidapi.com/property',
        params: {
          zpid: zpid
        },
        headers: {
          'X-RapidAPI-Key': this.RAPID_API_KEY,
          'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        }
      };

      const response = await axios.request(config);
      
      if (response.status === 403 || (response.data?.message && response.data.message.includes('subscribed'))) {
        throw new Error('You are not subscribed to this API');
      }

      if (!response.data) {
        throw new Error('No property data found');
      }

      return this.parseZillowPhotoResponse(response.data);
      
    } catch (error) {
      console.error('❌ Error fetching property photos:', error);
      return this.getSamplePhotos();
    }
  }

  /**
   * Parse Zillow API response to extract property photos
   */
  private static parseZillowPhotoResponse(data: any): PropertyPhotoResponse {
    const photos: PropertyPhoto[] = [];
    
    try {
      console.log('📸 Parsing Zillow photo response structure:', Object.keys(data));
      
      // Check various photo fields in the response (updated for actual Zillow API structure)
      const photoFields = [
        'photos',
        'images', 
        'media',
        'gallery',
        'photoGallery',
        'listingPhotos',
        'propertyPhotos'
      ];
      
      // First, try to get photos from the main response
      for (const field of photoFields) {
        if (data[field] && Array.isArray(data[field])) {
          console.log(`🖼️ Found ${field} with ${data[field].length} items`);
          
          data[field].forEach((item: any, index: number) => {
            const photo = this.parsePhotoItem(item, index);
            if (photo && !photos.some(p => p.url === photo.url)) {
              photos.push(photo);
            }
          });
        }
      }
      
      // Check nested structures (common in Zillow property detail responses)
      if (data.property?.photos || data.listing?.photos) {
        const propertyPhotos = data.property?.photos || data.listing?.photos;
        if (Array.isArray(propertyPhotos)) {
          console.log(`🖼️ Found nested property photos: ${propertyPhotos.length} items`);
          propertyPhotos.forEach((item: any, index: number) => {
            const photo = this.parsePhotoItem(item, index);
            if (photo && !photos.some(p => p.url === photo.url)) {
              photos.push(photo);
            }
          });
        }
      }
      
      // Check hdpData (Zillow's high-definition photo data)
      if (data.hdpData?.homeInfo?.photos) {
        console.log(`🖼️ Found HDP photos: ${data.hdpData.homeInfo.photos.length} items`);
        data.hdpData.homeInfo.photos.forEach((item: any, index: number) => {
          const photo = this.parsePhotoItem(item, index);
          if (photo && !photos.some(p => p.url === photo.url)) {
            photos.push(photo);
          }
        });
      }
      
      // Check for photo carousel data
      if (data.carousel && Array.isArray(data.carousel)) {
        console.log(`🖼️ Found carousel photos: ${data.carousel.length} items`);
        data.carousel.forEach((item: any, index: number) => {
          const photo = this.parsePhotoItem(item, index);
          if (photo && !photos.some(p => p.url === photo.url)) {
            photos.push(photo);
          }
        });
      }
      
      // Check for imgSrc (common in Zillow listings)
      if (data.imgSrc && typeof data.imgSrc === 'string') {
        const photo = this.parsePhotoItem(data.imgSrc, 0);
        if (photo && !photos.some(p => p.url === photo.url)) {
          photos.push(photo);
        }
      }
      
      console.log(`📸 Successfully parsed ${photos.length} unique photos`);
      
      return {
        photos: photos.slice(0, 20), // Limit to 20 photos
        totalCount: photos.length,
        hasMore: photos.length > 20
      };
      
    } catch (error) {
      console.error('❌ Error parsing photo response:', error);
      return {
        photos: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  /**
   * Parse individual photo item from various structures
   */
  private static parsePhotoItem(item: any, index: number): PropertyPhoto | null {
    try {
      let photoUrl: string | null = null;
      let width: number | undefined;
      let height: number | undefined;
      let description: string | undefined;
      
      // Handle string URLs
      if (typeof item === 'string' && this.isValidImageUrl(item)) {
        photoUrl = item;
      }
      // Handle object with URL properties
      else if (typeof item === 'object' && item !== null) {
        // Try different URL fields
        const urlFields = ['url', 'src', 'href', 'link', 'photoUrl', 'imageUrl', 'fullSizeUrl', 'largeUrl'];
        for (const field of urlFields) {
          if (item[field] && typeof item[field] === 'string' && this.isValidImageUrl(item[field])) {
            photoUrl = item[field];
            break;
          }
        }
        
        // Extract dimensions
        width = item.width || item.w;
        height = item.height || item.h;
        description = item.description || item.caption || item.alt;
        
        // Handle sizes array (find the largest)
        if (!photoUrl && item.sizes && Array.isArray(item.sizes)) {
          const largestSize = item.sizes.reduce((largest: any, current: any) => {
            const currentPixels = (current.width || 0) * (current.height || 0);
            const largestPixels = (largest?.width || 0) * (largest?.height || 0);
            return currentPixels > largestPixels ? current : largest;
          }, null);
          
          if (largestSize?.url) {
            photoUrl = largestSize.url;
            width = largestSize.width;
            height = largestSize.height;
          }
        }
      }
      
      if (!photoUrl) {
        return null;
      }
      
      return {
        url: photoUrl,
        width,
        height,
        description: description || this.generatePhotoDescription(photoUrl, index),
        type: this.inferPhotoType(photoUrl, description, index)
      };
      
    } catch (error) {
      console.error('❌ Error parsing photo item:', error);
      return null;
    }
  }

  /**
   * Generate a descriptive caption for a photo based on URL patterns and index
   */
  private static generatePhotoDescription(url: string, index: number): string {
    const lowerUrl = url.toLowerCase();
    
    // Try to infer room/area type from URL patterns
    if (lowerUrl.includes('kitchen')) return 'Kitchen';
    if (lowerUrl.includes('bathroom') || lowerUrl.includes('bath')) return 'Bathroom';
    if (lowerUrl.includes('bedroom') || lowerUrl.includes('bed')) return 'Bedroom';
    if (lowerUrl.includes('living') || lowerUrl.includes('family')) return 'Living room';
    if (lowerUrl.includes('dining')) return 'Dining room';
    if (lowerUrl.includes('garage')) return 'Garage';
    if (lowerUrl.includes('pool')) return 'Swimming pool';
    if (lowerUrl.includes('yard') || lowerUrl.includes('backyard')) return 'Backyard';
    if (lowerUrl.includes('front')) return 'Front exterior';
    if (lowerUrl.includes('exterior')) return 'Exterior view';
    if (lowerUrl.includes('interior')) return 'Interior view';
    
    // Default descriptions based on position
    if (index === 0) return 'Main exterior view';
    if (index === 1) return 'Front entrance';
    if (index === 2) return 'Living space';
    
    return `Property photo ${index + 1}`;
  }

  /**
   * Infer photo type based on URL, description, or position
   */
  private static inferPhotoType(url: string, description?: string, index?: number): 'exterior' | 'interior' | 'other' {
    const lowerUrl = url.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    
    // Keywords that suggest exterior photos
    const exteriorKeywords = ['exterior', 'front', 'back', 'yard', 'pool', 'garage', 'driveway', 'landscape'];
    // Keywords that suggest interior photos
    const interiorKeywords = ['interior', 'kitchen', 'bathroom', 'bedroom', 'living', 'dining', 'basement', 'attic'];
    
    if (exteriorKeywords.some(keyword => lowerUrl.includes(keyword) || lowerDesc.includes(keyword))) {
      return 'exterior';
    }
    
    if (interiorKeywords.some(keyword => lowerUrl.includes(keyword) || lowerDesc.includes(keyword))) {
      return 'interior';
    }
    
    // First few photos are typically exterior
    if (index !== undefined && index < 2) {
      return 'exterior';
    }
    
    return 'other';
  }

  /**
   * Enhanced image URL validation for real estate photos
   */
  private static isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname) return false;
    } catch {
      return false;
    }
    
    // Real estate image domains (enhanced list)
    const realEstateImageDomains = [
      'zillow',
      'zillowstatic', 
      'photos.zillowstatic',
      'img.zillowstatic',
      'p.rdcpix',
      'ap.rdcpix',
      'redfin',
      'ssl.cdn-redfin',
      'mls-images',
      'mlslistings'
    ];
    
    // Check for image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i;
    if (imageExtensions.test(url)) {
      return true;
    }
    
    // Check for real estate domains with image paths
    const hasValidDomain = realEstateImageDomains.some(domain => 
      url.toLowerCase().includes(domain)
    );
    
    if (hasValidDomain) {
      // Must have image indicators in the path
      const imageIndicators = [
        '/photos/', '/images/', '/img/', '/picture', '/photo',
        '_photo', '-photo', 'image', 'pic'
      ];
      return imageIndicators.some(indicator => 
        url.toLowerCase().includes(indicator)
      );
    }
    
    return false;
  }

  /**
   * Get sample photos for demo purposes
   */
  private static getSamplePhotos(): PropertyPhotoResponse {
    const samplePhotos: PropertyPhoto[] = [
      {
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80',
        width: 800,
        height: 600,
        description: 'Beautiful house exterior',
        type: 'exterior'
      },
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format&q=80',
        width: 800,
        height: 600,
        description: 'Spacious living room',
        type: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format&q=80',
        width: 800,
        height: 600,
        description: 'Modern kitchen',
        type: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format&q=80',
        width: 800,
        height: 600,
        description: 'Cozy bedroom',
        type: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format&q=80',
        width: 800,
        height: 600,
        description: 'Elegant bathroom',
        type: 'interior'
      }
    ];
    
    return {
      photos: samplePhotos,
      totalCount: samplePhotos.length,
      hasMore: false
    };
  }

  /**
   * Optimize image URL for different display sizes
   */
  static optimizeImageUrl(url: string, width: number, height: number, quality: number = 80): string {
    // For Unsplash images, we can add parameters
    if (url.includes('unsplash.com')) {
      return `${url.split('?')[0]}?w=${width}&h=${height}&fit=crop&auto=format&q=${quality}`;
    }
    
    // For Zillow images, they often have size parameters
    if (url.includes('zillowstatic.com')) {
      // Try to replace existing size parameters
      return url.replace(/(_\d+x\d+)/g, `_${width}x${height}`);
    }
    
    // Return original URL if we can't optimize
    return url;
  }

  /**
   * Get the best image URL from property data
   */
  static getBestImage(property: any): string {
    // Check if property has images array
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images[0];
    }
    
    // Fallback to a high-quality placeholder
    return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80';
  }
}
