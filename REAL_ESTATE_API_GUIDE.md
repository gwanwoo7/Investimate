# 🏠 Real Estate Data API Integration Guide

This guide provides step-by-step instructions for integrating real estate data from major platforms like Zillow, Rentometer, and Redfin into your rental cash flow calculator.

## 📊 Available Real Estate APIs

### 1. **RentSpree API** (Recommended - Free Tier Available)
- **What it provides**: Property listings, rental estimates, market data
- **Free tier**: 1,000 requests/month
- **Signup**: https://api.rentspree.com/
- **Documentation**: https://docs.rentspree.com/

### 2. **RentBerry API**
- **What it provides**: Rental listings, property details, market analysis
- **Free tier**: Limited requests
- **Signup**: https://rentberry.com/api
- **Documentation**: https://docs.rentberry.com/

### 3. **Rental Market Data API**
- **What it provides**: Rent estimates, market trends, comparable properties
- **Cost**: $0.10-$0.50 per request
- **Signup**: https://rentalmarketdata.com/api
- **Documentation**: https://docs.rentalmarketdata.com/

### 4. **Bridge Interactive (MLS Data)**
- **What it provides**: MLS listings, property details, market data
- **Cost**: Varies by region
- **Signup**: https://www.bridgeinteractive.com/
- **Documentation**: https://docs.bridgeinteractive.com/

## 🚫 Why Direct Zillow/Redfin APIs Are Not Available

### **Zillow**
- ❌ **Discontinued**: Zillow shut down their public API in 2021
- ❌ **No public access**: Only internal use and select partners
- ⚠️ **Alternative**: Use web scraping (legally complex) or third-party services

### **Redfin**
- ❌ **No public API**: Redfin doesn't offer a public API
- ⚠️ **Alternative**: Use web scraping or partner APIs

### **Rentometer**
- ❌ **No public API**: Rentometer doesn't provide a public API
- ⚠️ **Alternative**: Use similar rental estimation services

## 🛠️ Implementation Steps

### Step 1: Choose Your API Provider

**For beginners, I recommend starting with RentSpree API:**

```bash
# 1. Sign up at https://api.rentspree.com/
# 2. Get your API key
# 3. Install axios if not already installed
npm install axios
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# Real Estate API Configuration
VITE_RENTSPREE_API_KEY=your_api_key_here
VITE_RENTSPREE_BASE_URL=https://api.rentspree.com/v1

# Alternative APIs (choose one)
VITE_RENTAL_MARKET_DATA_API_KEY=your_api_key_here
VITE_BRIDGE_INTERACTIVE_API_KEY=your_api_key_here
```

### Step 3: Create API Service

I'll create a real estate data service for you:

```typescript
// src/services/realEstateDataService.ts
interface RealEstateProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: string;
  rentEstimate?: number;
  marketValue?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

class RealEstateDataService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RENTSPREE_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_RENTSPREE_BASE_URL || '';
  }

  async searchProperties(params: {
    city?: string;
    state?: string;
    zipCode?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: string;
  }): Promise<RealEstateProperty[]> {
    try {
      const response = await fetch(\`\${this.baseUrl}/properties/search\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getRentEstimate(address: string, city: string, state: string): Promise<number> {
    try {
      const response = await fetch(\`\${this.baseUrl}/rent-estimate\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, city, state }),
      });

      if (!response.ok) {
        throw new Error('Failed to get rent estimate');
      }

      const data = await response.json();
      return data.rentEstimate || 0;
    } catch (error) {
      console.error('Error getting rent estimate:', error);
      return 0;
    }
  }
}

export const realEstateDataService = new RealEstateDataService();
```

### Step 4: Integrate with Your Components

Update your service to use real data:

```typescript
// src/services/realEstateService.ts
import { realEstateDataService } from './realEstateDataService';

export class RealEstateService {
  static async searchProperties(params: AreaSearchParams): Promise<PropertyListing[]> {
    try {
      // Use real API instead of mock data
      const realProperties = await realEstateDataService.searchProperties({
        city: params.city,
        state: params.state,
        zipCode: params.zipCode,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        bedrooms: params.minBedrooms,
        propertyType: params.propertyTypes?.[0],
      });

      // Convert to PropertyListing format
      return realProperties.map(property => ({
        ...property,
        purchasePrice: property.price,
        marketValue: property.marketValue || property.price,
        estimatedRent: property.rentEstimate || 0,
        // Calculate investment metrics
        estimatedCashFlow: this.calculateCashFlow(property),
        estimatedCOCReturn: this.calculateCOCReturn(property),
        estimatedCapRate: this.calculateCapRate(property),
        investmentScore: this.calculateInvestmentScore(property),
        // ... other required fields
      }));
    } catch (error) {
      console.error('Error searching properties:', error);
      // Fallback to mock data if API fails
      return this.getMockProperties(params);
    }
  }
}
```

## 🗺️ Adding Interactive Map with Real Locations

### Step 1: Install Leaflet for Maps

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Step 2: Create Enhanced Map Component

I'll create a real interactive map component:

```typescript
// src/components/InteractivePropertyMap.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractivePropertyMap = ({ properties, onPropertySelect }) => {
  return (
    <MapContainer
      center={[39.8283, -98.5795]} // Center of US
      zoom={4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.coordinates.lat, property.coordinates.lng]}
          eventHandlers={{
            click: () => onPropertySelect(property),
          }}
        >
          <Popup>
            <div>
              <h3>{property.address}</h3>
              <p>Price: ${property.purchasePrice.toLocaleString()}</p>
              <p>Rent Estimate: ${property.estimatedRent}/month</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractivePropertyMap;
```

## 💰 Cost Breakdown

### **Free Options**
- **RentSpree**: 1,000 requests/month free
- **OpenStreetMap**: Free mapping tiles
- **Geocoding**: Free with Nominatim (OpenStreetMap)

### **Paid Options**
- **RentSpree Pro**: $49/month for 10,000 requests
- **Rental Market Data**: $0.10-$0.50 per request
- **Google Maps**: $7 per 1,000 requests
- **Mapbox**: $0.50 per 1,000 requests

## 🚀 Quick Start Implementation

### Option 1: Free Tier Setup (Recommended for Development)

1. **Sign up for RentSpree API** (free tier)
2. **Use OpenStreetMap** for mapping (free)
3. **Implement geocoding** with Nominatim (free)

### Option 2: Production Setup

1. **Choose paid API** based on your needs
2. **Set up Google Maps** or Mapbox for better UX
3. **Implement caching** to reduce API costs

## 🔧 Implementation Priority

1. **✅ Start with mock data** (current implementation)
2. **🔄 Add one API service** (RentSpree recommended)
3. **🗺️ Integrate interactive map** (Leaflet + OpenStreetMap)
4. **📊 Add real rent estimates**
5. **🎯 Implement geocoding** for property locations
6. **⚡ Add caching layer** for performance

## 📞 Next Steps

Would you like me to:

1. **Set up RentSpree API integration** with your current code?
2. **Implement the interactive Leaflet map** component?
3. **Add geocoding** to get real coordinates for properties?
4. **Create a caching layer** to optimize API usage?

Let me know which option you'd prefer, and I'll implement it step by step!
