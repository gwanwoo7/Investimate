# Apify Zillow Scraper Integration Guide

## Overview
This guide helps you set up the Apify Zillow Scraper API to extract comprehensive property data including high-quality photos, detailed property information, market data, and neighborhood insights.

## Why Apify Zillow Scraper?

### Advantages over RapidAPI:
- **More Comprehensive Data**: Extracts all available property details
- **Higher Quality Photos**: Up to 20 photos per property in full resolution
- **Rich Property Details**: Description, virtual tours, price history, tax info
- **Neighborhood Data**: School ratings, walk scores, crime ratings
- **Market Analytics**: Days on market, listing history, comparable sales
- **Better Reliability**: Direct scraping with advanced anti-detection
- **Flexible Configuration**: Customizable data extraction

### Data Extracted:
- **Photos**: Up to 20 high-resolution images per property
- **Financial Data**: Detailed tax info, HOA fees, insurance estimates
- **Property Details**: Square footage, lot size, year built, renovations
- **Market Data**: Price history, days on market, listing date
- **Neighborhood**: School districts, ratings, walk score, crime data
- **Virtual Tours**: 3D tour links and walkthrough videos

## Setup Instructions

### Step 1: Create Apify Account
1. Go to [Apify.com](https://apify.com)
2. Sign up for a free account
3. Navigate to **Console** → **Account** → **Integrations**
4. Copy your **API Token**

### Step 2: Choose Zillow Scraper
1. Go to [Apify Store](https://apify.com/store)
2. Search for **"Zillow Scraper"**
3. Popular options:
   - `petr_cermak/zillow-scraper` (Recommended)
   - `dtrungtin/zillow-scraper`
   - `misceres/zillow-scraper`

### Step 3: Configure Environment
1. Open your `.env` file
2. Add your Apify API token:
```bash
# Apify Configuration (Enhanced Zillow Scraper)
VITE_APIFY_API_TOKEN=your_actual_apify_token_here
```

### Step 4: Test Integration
1. Restart your development server: `npm run dev`
2. Search for properties in California (e.g., "Los Angeles, CA")
3. Check browser console for Apify logs
4. Verify enhanced data and photos are loading

## Apify vs RapidAPI Comparison

| Feature | RapidAPI Zillow | Apify Zillow Scraper |
|---------|-----------------|---------------------|
| Photos per Property | 1-3 images | Up to 20 images |
| Image Quality | Compressed thumbnails | Full resolution |
| Property Details | Basic info | Comprehensive data |
| Market Data | Limited | Price history, DOM |
| Neighborhood Info | None | Schools, walk score |
| Virtual Tours | No | Yes, with 3D links |
| Tax Information | Estimated | Actual tax records |
| Reliability | API limits | Direct scraping |
| Cost | Per request | Per run (more efficient) |

## Configuration Options

### Basic Search
```javascript
{
  locations: ["Los Angeles, CA"],
  maxItems: 50,
  minPrice: 100000,
  maxPrice: 1000000,
  propertyTypes: ["houses", "townhouses", "condos"]
}
```

### Enhanced Extraction
```javascript
{
  includePhotos: true,
  includeVirtualTours: true,
  includeDescription: true,
  includePriceHistory: true,
  includeTaxInfo: true,
  includeSchoolInfo: true,
  includeNeighborhoodInfo: true,
  maxPhotosPerProperty: 20,
  waitForPhotosLoad: true,
  scrollToLoadMorePhotos: true
}
```

## Pricing

### Apify Free Tier:
- $5 free credits monthly
- ~100-500 properties (depending on data complexity)
- Perfect for development and testing

### Apify Paid Plans:
- **Personal**: $49/month - ~2,000-10,000 properties
- **Team**: $499/month - ~20,000-100,000 properties
- **Enterprise**: Custom pricing for large scale

### Cost Comparison:
- **RapidAPI**: $0.01-0.05 per request
- **Apify**: $0.001-0.01 per property (more efficient)

## Performance Tips

### Optimization Settings:
1. **Batch Processing**: Process multiple locations in one run
2. **Selective Data**: Only extract needed fields to reduce costs
3. **Caching**: Implement local caching for repeated searches
4. **Concurrent Limits**: Respect Apify's concurrent run limits

### Error Handling:
- Implement fallback to RapidAPI if Apify fails
- Add retry logic for failed runs
- Monitor Apify usage and credits

## Troubleshooting

### Common Issues:

1. **"No API Token" Error**
   - Check `.env` file has correct token
   - Restart development server
   - Verify token is not expired

2. **"Run Failed" Error**
   - Check Apify console for run details
   - Verify actor ID is correct
   - Check input parameters format

3. **"Timeout" Error**
   - Increase `maxWaitTime` in service
   - Reduce `maxItems` for faster processing
   - Check Apify service status

4. **No Photos Returned**
   - Verify `includePhotos: true`
   - Check `waitForPhotosLoad` setting
   - Increase `maxPhotosPerProperty`

### Debug Logs:
Check browser console for detailed logs:
```
🚀 Using Apify Zillow Scraper for enhanced data extraction...
⏳ Actor run started with ID: run_abc123
📊 Run status: RUNNING
✅ Apify run completed successfully with 45 items
📸 Extracted 15 images for 123 Main St
```

## Integration Status

✅ **Implemented Features:**
- Apify API service (`apifyZillowAPIService.ts`)
- Enhanced property data extraction
- Comprehensive photo extraction (up to 20 per property)
- Investment analysis with real financial data
- Fallback to RapidAPI if Apify unavailable

🔄 **Auto-Fallback Logic:**
1. Try Apify first (if token configured)
2. Fall back to RapidAPI if Apify fails
3. Use mock data if both fail

## Next Steps

1. **Get Apify Token**: Sign up and get your API token
2. **Update .env**: Add your token to environment variables
3. **Test**: Search for properties to verify enhanced data
4. **Monitor Usage**: Check Apify console for credit usage
5. **Optimize**: Adjust settings based on your needs

## Support

- **Apify Documentation**: [docs.apify.com](https://docs.apify.com)
- **Zillow Scraper Docs**: Check specific actor documentation
- **Community**: Apify Discord and forums

The integration provides significantly enhanced property data with comprehensive photos and market insights while maintaining backward compatibility with existing RapidAPI implementation.
