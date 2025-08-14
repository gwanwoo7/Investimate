# Real Estate API Setup Guide

## 🚀 Get Real Property Data

Your rental cash flow calculator is now enhanced with real estate API integration! Follow these steps to connect to live property data from Zillow, Realtor.com, and rent estimation services.

## 📋 Quick Setup (5 minutes)

### Step 1: Get Your RapidAPI Key
1. Visit [RapidAPI.com](https://rapidapi.com/) and create a free account
2. Go to your dashboard and copy your API key
3. In your project, open the `.env` file
4. Replace `your-rapid-api-key-here` with your actual API key:
   ```
   VITE_RAPID_API_KEY=your_actual_api_key_here
   ```

### Step 2: Subscribe to Real Estate APIs (Free Tiers Available)

#### Zillow API (Recommended - Best Data Quality)
- **URL**: https://rapidapi.com/s.mahmoud97/api/zillow-com1
- **Free Tier**: 100 requests/month
- **Features**: Property listings, rent estimates, market data
- **Click "Subscribe to Test" and select the free plan**

#### Realtor.com API (Alternative)
- **URL**: https://rapidapi.com/datascraper/api/realtor
- **Free Tier**: 500 requests/month
- **Features**: MLS listings, property details
- **Click "Subscribe to Test" and select the free plan**

#### RentSpotter API (Rent Estimates)
- **URL**: https://rapidapi.com/rentspotter-com-rentspotter-com-default/api/rentspotter-com
- **Free Tier**: 50 requests/month
- **Features**: Rental price estimates
- **Click "Subscribe to Test" and select the free plan**

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🎯 What You Get

### With APIs Connected:
✅ **Real Property Listings** from Zillow/Realtor.com
✅ **Actual Rent Estimates** from multiple sources
✅ **Live Market Data** with current pricing
✅ **Real Property Coordinates** for accurate mapping
✅ **Up-to-date Investment Metrics** based on real data

### Without APIs (Current Mode):
🎭 **Enhanced Mock Data** with realistic pricing
🗺️ **Interactive Maps** with simulated properties
📊 **Investment Analysis** with estimated values

## 🔧 Configuration Options

### Environment Variables
```bash
# Enable/disable mock data
VITE_USE_MOCK_DATA=false  # Set to true to force mock data

# API Configuration
VITE_RAPID_API_KEY=your_actual_api_key_here
```

## 📊 API Usage & Limits

| Service | Free Tier | Best For |
|---------|-----------|----------|
| Zillow API | 100 requests/month | Property listings & rent estimates |
| Realtor API | 500 requests/month | MLS data & property details |
| RentSpotter | 50 requests/month | Accurate rent estimates |

**Pro Tip**: The app intelligently falls back to enhanced mock data if APIs are unavailable or rate-limited.

## 🚨 Troubleshooting

### "Using enhanced mock data" message?
- Check your API key is correctly set in `.env`
- Verify you've subscribed to at least one real estate API
- Restart the development server after making changes

### API errors in console?
- Confirm your RapidAPI subscription is active
- Check you haven't exceeded rate limits
- Verify the API key has proper permissions

### Properties not showing on map?
- The app now uses realistic coordinates for better mapping
- Properties should appear in accurate geographic locations
- Zoom out to see the full property distribution

## 💡 Tips for Best Results

1. **Start with Zillow API** - Best overall data quality
2. **Monitor Rate Limits** - The app shows API usage in console
3. **Use Geographic Search** - APIs work best with specific locations
4. **Check Console Logs** - App shows whether it's using real or mock data

## 🆘 Need Help?

The application is designed to work seamlessly with or without API keys. All features remain functional with enhanced mock data while you set up the real APIs.

**Status Indicators:**
- 🔍 "Searching with real estate APIs..." = Using live data
- 🎭 "Using enhanced mock data..." = Using realistic simulated data
- ✅ "Found X properties from Zillow/Realtor API" = Successfully connected
