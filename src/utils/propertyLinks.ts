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
}): string => {
  // Return the first image if available
  if (property.images && property.images.length > 0) {
    return property.images[0];
  }
  
  // Return a placeholder image with property details
  const encodedAddress = encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`);
  
  // Use a real estate placeholder service or a generic placeholder
  return `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80`;
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
