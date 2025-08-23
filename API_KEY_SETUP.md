# Real Estate API Setup Guide

## Available Real Estate APIs with Property Photos:

### ✅ Zillow APIs (WITH PHOTOS):

#### Option 1: Zillow.com API (Recommended - INCLUDES PHOTOS)
- **URL**: https://rapidapi.com/apimaker/api/zillow-com1/playground
- **Provider**: APIMaker
- **Photo Support**: ✅ YES - Property photos, galleries, high-res images
- **Features**: US and CA real-time data, property photos, search by address/coordinates
- **Status**: ✅ Highly maintained, updated 3 weeks ago

#### Option 2: Zillow API (Alternative - LIMITED PHOTOS)
- **URL**: https://rapidapi.com/s.mahmoud97/api/zillow56/playground  
- **Provider**: Sabri
- **Photo Support**: ⚠️ LIMITED - Basic property images
- **Features**: US and CA property data in JSON/CSV/Excel, listings, zestimate values
- **Status**: ✅ Working, updated 4 months ago

### ❌ Redfin APIs (NO DIRECT PHOTO ACCESS):
Unfortunately, Redfin doesn't provide direct photo access through their public APIs. Most Redfin APIs focus on property data, pricing, and market analytics but don't include property images due to their proprietary photo licensing.

## What Property Photos You'll Get:

### 🎯 **Primary Recommendation: Zillow.com API (apimaker)**
**BEST for property photos** - This API provides:
- ✅ **Property exterior photos** (front, side, aerial views)
- ✅ **Interior photos** (living rooms, kitchens, bedrooms, bathrooms) 
- ✅ **High-resolution images** (typically 800x600 or larger)
- ✅ **Multiple photos per property** (usually 4-15 photos)
- ✅ **Gallery format** with primary image + additional photos

### 📸 **Photo Fields Available:**
Your app already extracts photos from these Zillow API fields:
- `imgSrc` - Primary property image
- `photos` - Array of property photos
- `images` - Additional image array
- `hdpData.homeInfo.photos` - High-definition photos
- `mixedSources` - Multiple image sizes

### ⚠️ **Redfin Limitation:**
Redfin APIs typically **don't provide property photos** due to:
- Proprietary licensing agreements
- MLS photo restrictions  
- Focus on data analytics rather than media content

## Current App Status:
Your rental cash flow app is **already configured** to extract and display Zillow property photos! The code in `realEstateAPIService.ts` has comprehensive photo extraction logic.

1. **Sign up for RapidAPI**:
   - Go to https://rapidapi.com
   - Create a free account

2. **Subscribe to a Zillow API**:
   - Choose one of the options above
   - Click "Subscribe to Test" 
   - Select a plan (most have free tiers)

3. **Get your API key**:
   - After subscribing, go to the API's "Endpoints" tab
   - Your API key will be shown in the code examples
   - Copy the X-RapidAPI-Key value

4. **Update your .env file**:
   ```
   # Replace with your actual RapidAPI key:
   VITE_RAPID_API_KEY=your_actual_api_key_here
   ```

## Current Status:
```
# The current placeholder means the app uses demo mode with stock photos:
VITE_RAPID_API_KEY=your_rapid_api_key_here
```

Once you update with a real API key, the app will show actual Zillow property photos!
