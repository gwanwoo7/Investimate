// RealtyMole API Service - Free property photos and data
// Free tier: 20 requests per day
// Docs: https://rapidapi.com/realty-mole-realty-mole-default/api/realty-mole-property-api

import type { PropertyData, PropertyListing, AreaSearchParams } from '../types/property';

export class RealtyMoleAPIService {
  private static readonly API_BASE_URL = 'https://realty-mole-property-api.p.rapidapi.com';
  private static readonly RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
  
  // Enhance existing properties with RealtyMole photos when missing
  static async enhancePropertiesWithPhotos(properties: PropertyListing[]): Promise<PropertyListing[]> {
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ RealtyMole: No API key configured, skipping photo enhancement');
      return properties;
    }

    console.log(`📸 RealtyMole: Enhancing ${properties.length} properties with additional photos...`);
    
    const enhancedProperties: PropertyListing[] = [];
    let apiCallCount = 0;
    const maxAPICalls = 5; // Conservative limit for free tier
    
    for (const property of properties) {
      // Skip if property already has good photo coverage
      if (property.images && property.images.length >= 5) {
        enhancedProperties.push(property);
        continue;
      }
      
      // Limit API calls to preserve quota
      if (apiCallCount >= maxAPICalls) {
        console.log(`📸 RealtyMole: Reached API call limit (${maxAPICalls}), skipping remaining properties`);
        enhancedProperties.push(property);
        continue;
      }
      
      try {
        const enhancedProperty = await this.enhancePropertyWithPhotos(property);
        enhancedProperties.push(enhancedProperty);
        apiCallCount++;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`📸 RealtyMole: Failed to enhance property ${property.address}:`, error);
        enhancedProperties.push(property);
      }
    }
    
    console.log(`📸 RealtyMole: Enhanced ${apiCallCount} properties with additional photos`);
    return enhancedProperties;
  }
  
  private static async enhancePropertyWithPhotos(property: PropertyListing): Promise<PropertyListing> {
    try {
      // Search for property by address
      const searchResult = await this.searchPropertyByAddress(
        property.address,
        property.city,
        property.state
      );
      
      if (searchResult && searchResult.photos && searchResult.photos.length > 0) {
        // Merge existing photos with RealtyMole photos
        const existingPhotos = property.images || [];
        const newPhotos = searchResult.photos.filter((photo: any) => 
          !existingPhotos.includes(photo)
        );
        
        const combinedPhotos = [...existingPhotos, ...newPhotos].slice(0, 30);
        
        console.log(`📸 RealtyMole: Added ${newPhotos.length} photos to ${property.address}`);
        
        return {
          ...property,
          images: combinedPhotos,
          // Update photo-related fields if they exist
          photos: combinedPhotos,
          photoCount: combinedPhotos.length
        } as PropertyListing;
      }
      
      return property;
    } catch (error) {
      console.warn(`📸 RealtyMole: Error enhancing ${property.address}:`, error);
      return property;
    }
  }
  
  private static async searchPropertyByAddress(
    address: string,
    city: string,
    state: string
  ): Promise<any> {
    const searchAddress = `${address}, ${city}, ${state}`;
    
    const response = await fetch(
      `${this.API_BASE_URL}/properties?address=${encodeURIComponent(searchAddress)}`,
      {
        headers: {
          'X-RapidAPI-Key': this.RAPID_API_KEY!,
          'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`RealtyMole API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract photos from RealtyMole response format
    if (data && data.length > 0) {
      const property = data[0];
      return {
        photos: this.extractPhotosFromResponse(property)
      };
    }
    
    return null;
  }
  
  private static extractPhotosFromResponse(propertyData: any): string[] {
    const photos: string[] = [];
    
    // RealtyMole photo extraction (adjust based on actual API response format)
    if (propertyData.photos && Array.isArray(propertyData.photos)) {
      photos.push(...propertyData.photos.map((photo: any) => 
        typeof photo === 'string' ? photo : photo.url || photo.href
      ).filter((url: any) => url && typeof url === 'string'));
    }
    
    // Additional image fields
    if (propertyData.images && Array.isArray(propertyData.images)) {
      photos.push(...propertyData.images.filter((img: any) => 
        img && typeof img === 'string' && !photos.includes(img)
      ));
    }
    
    // Main property image
    if (propertyData.image && !photos.includes(propertyData.image)) {
      photos.unshift(propertyData.image);
    }
    
    return photos
      .filter(url => url && typeof url === 'string' && url.startsWith('http'))
      .slice(0, 15); // Limit per property
  }
  
  // Get comprehensive property data (future enhancement)
  static async getPropertyDetails(address: string, city: string, state: string): Promise<any> {
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      return null;
    }
    
    try {
      const searchAddress = `${address}, ${city}, ${state}`;
      const response = await fetch(
        `${this.API_BASE_URL}/properties?address=${encodeURIComponent(searchAddress)}`,
        {
          headers: {
            'X-RapidAPI-Key': this.RAPID_API_KEY!,
            'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data && data.length > 0 ? data[0] : null;
      }
      
      return null;
    } catch (error) {
      console.warn('RealtyMole API error:', error);
      return null;
    }
  }
}

console.log('✅ RealtyMole API Service loaded');
