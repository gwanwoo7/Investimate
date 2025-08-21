# Google Maps API Integration Setup

## Overview
The rental property search application now uses Google Maps API instead of Leaflet for enhanced mapping features. This provides better property visualization, drawing tools, and search capabilities.

## Features Implemented
✅ **Interactive Google Maps** - Professional mapping with multiple view modes
✅ **Boundary Drawing** - Draw custom search areas with polygon tools  
✅ **Property Markers** - Enhanced markers with price displays and detailed info windows
✅ **Current Location** - Automatic location detection with user position marker
✅ **Responsive Design** - Fullscreen mode and mobile-optimized controls
✅ **Search Integration** - Polygon-based property search with bounds detection

## Getting Your Google Maps API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for Maps API)

### Step 2: Enable APIs
Enable these APIs in your Google Cloud Console:
- **Maps JavaScript API** (required)
- **Drawing API** (for polygon drawing tools)  
- **Geocoding API** (optional, for address search)
- **Places API** (optional, for location search)

### Step 3: Create API Key
1. Go to "Credentials" in the API & Services section
2. Click "Create Credentials" → "API Key"
3. Copy your API key

### Step 4: Restrict Your API Key (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - For development: Choose "HTTP referrers" and add your domains
   - For production: Add your live domain (e.g., `https://yourdomain.com/*`)
3. Under "API restrictions":
   - Select "Restrict key" 
   - Choose the APIs you enabled above

### Step 5: Update Environment Variables
Add your API key to `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## API Key Security
- ✅ **API Key Restrictions**: Always restrict by domain and API
- ✅ **Environment Variables**: Never commit API keys to version control
- ✅ **Regular Rotation**: Regenerate keys periodically
- ⚠️ **Monitoring**: Set up usage alerts to avoid unexpected charges

## Usage Limits & Pricing
- **Free Tier**: $200 credit per month (covers most small applications)
- **Maps JavaScript API**: $7 per 1,000 loads
- **Typical Usage**: Property search app might use 100-500 loads/day

## Troubleshooting

### Map Not Loading
- Check browser console for API key errors
- Verify API key is in `.env.local` with correct variable name
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### Drawing Tools Not Working  
- Verify Drawing API is enabled
- Check for JavaScript errors in browser console
- Ensure proper API key restrictions allow drawing library

### Property Markers Missing
- Check if property data has valid latitude/longitude values
- Verify no JavaScript errors preventing marker creation
- Test with sample property data

## Development vs Production
- **Development**: Use unrestricted API key for localhost testing
- **Production**: Always use domain-restricted API keys
- **Staging**: Create separate API keys for staging environments

## Benefits Over Leaflet
✅ **Better Performance** - Native Google Maps optimization
✅ **Professional UI** - Consistent with Google Maps UX
✅ **Advanced Features** - Street View, satellite imagery, places integration
✅ **Mobile Experience** - Optimized touch interactions
✅ **Drawing Tools** - Native polygon drawing with Google Maps API
