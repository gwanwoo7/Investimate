export const generateZillowUrl = (property: {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
}): string => {
  // Clean and format address for Zillow URL
  const cleanAddress = property.address.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const cleanCity = property.city.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const cleanState = property.state.replace(/[^a-zA-Z]/g, '');
  
  // Zillow URL format: https://www.zillow.com/homes/{address}-{city}-{state}-{zip}/
  const baseUrl = 'https://www.zillow.com/homes';
  const locationString = `${cleanAddress}-${cleanCity}-${cleanState}${property.zipCode ? `-${property.zipCode}` : ''}/`;
  
  return `${baseUrl}/${locationString.toLowerCase()}`;
};

export const generateRedfinUrl = (property: {
  address: string;
  city: string;
  state: string;
}): string => {
  // Redfin search URL
  const searchQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`);
  return `https://www.redfin.com/city/30749/CA/${property.city}/filter/property-type=house`;
};

export const generateRealtyUrl = (property: {
  address: string;
  city: string;
  state: string;
}): string => {
  const searchQuery = encodeURIComponent(`${property.address} ${property.city} ${property.state}`);
  return `https://www.realtor.com/realestateandhomes-search/${property.city}_${property.state}`;
};

export const getPropertyImageUrl = (property: {
  images?: string[];
  address: string;
  city: string;
  state: string;
  id?: string;
}): string => {
  // Return the first image if available from the property data
  if (property.images && property.images.length > 0) {
    // Use the first image, which should be the best/primary photo
    return property.images[0];
  }
  
  // Generate a property-specific placeholder based on the property ID or address
  // This ensures each property gets a consistent but unique image
  const propertyHash = property.id || `${property.address}-${property.city}-${property.state}`;
  const imageId = Math.abs(propertyHash.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0)) % 1000; // Generate consistent hash-based ID
  
  // Use different property photos based on the hash to create variety
  const placeholderImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80', // Modern house
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80', // Traditional house
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80', // Suburban house
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&auto=format&q=80', // Contemporary house
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&auto=format&q=80'  // Classic house
  ];
  
  return placeholderImages[imageId % placeholderImages.length];
};

// Get optimized image URL for specific dimensions
export const getOptimizedImageUrl = (property: {
  images?: string[];
  address: string;
  city: string;
  state: string;
  id?: string;
}, width: number = 400, height: number = 300, quality: number = 80): string => {
  const baseUrl = getPropertyImageUrl(property);
  
  // If it's a Zillow image, try to optimize it with their sizing parameters
  if (baseUrl.includes('zillowstatic.com') || baseUrl.includes('zillow')) {
    // Zillow images often have size parameters that can be modified
    // Example: https://photos.zillowstatic.com/fp/abc123_def456-cc_ft_768.jpg
    // We can try to replace size indicators
    let optimizedUrl = baseUrl;
    
    // Try to replace existing size parameters in Zillow URLs
    optimizedUrl = optimizedUrl.replace(/_\d+x\d+/g, `_${width}x${height}`);
    optimizedUrl = optimizedUrl.replace(/_cc_ft_\d+/g, `_cc_ft_${Math.max(width, height)}`);
    optimizedUrl = optimizedUrl.replace(/_[sml]\./, `_${width >= 400 ? 'l' : width >= 200 ? 'm' : 's'}.`);
    
    // If no size parameters were found, try to add them
    if (optimizedUrl === baseUrl) {
      // Try to insert size parameters before file extension
      optimizedUrl = optimizedUrl.replace(/(\.[a-z]{3,4})(\?.*)?$/, `_${width}x${height}$1$2`);
    }
    
    return optimizedUrl;
  }
  
  // If it's an Unsplash image, we can optimize it
  if (baseUrl.includes('unsplash.com')) {
    return baseUrl.replace(/w=\d+&h=\d+/, `w=${width}&h=${height}`).replace(/q=\d+/, `q=${quality}`);
  }
  
  // For Redfin or other real estate sites, return as-is
  // (they usually don't support URL-based optimization)
  return baseUrl;
};

// Generate multiple property listing URLs for comparison
export const getPropertyListingLinks = (property: {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  listingUrl?: string;
}) => {
  return {
    original: property.listingUrl,
    zillow: generateZillowUrl(property),
    redfin: generateRedfinUrl(property),
    realtor: generateRealtyUrl(property)
  };
};
