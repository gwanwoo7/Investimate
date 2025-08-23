// Test optimized Zillow API for maximum property results
// Run with: node test-optimized-zillow.js

import axios from 'axios';
import { config } from 'dotenv';

config();

const RAPID_API_KEY = process.env.VITE_RAPID_API_KEY;

async function testOptimizedZillowSearch() {
  console.log('🚀 Testing Optimized Zillow Search Strategy');
  console.log('🔑 API Key:', RAPID_API_KEY ? `${RAPID_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  console.log('📍 Testing location: Santa Clara, CA');
  console.log('🎯 Goal: Get 80+ properties (vs current 25-41)');
  console.log('');
  
  if (!RAPID_API_KEY) {
    console.log('❌ No API key found. Please set VITE_RAPID_API_KEY in your .env file');
    return;
  }

  const propertyTypes = ['Single Family', 'Townhouse', 'Condo', 'Multi Family'];
  const allProperties = [];
  
  console.log('🏡 Testing multi-page, multi-type search strategy...\n');
  
  for (const propertyType of propertyTypes) {
    console.log(`📋 Searching ${propertyType} properties...`);
    
    for (let page = 1; page <= 3; page++) {
      try {
        const response = await axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
          params: {
            location: 'Santa Clara, CA',
            status_type: 'ForSale',
            propertyType: propertyType,
            minPrice: '500000',
            maxPrice: '2000000',
            page: page.toString()
          },
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
          }
        });
        
        if (response.data?.props && Array.isArray(response.data.props)) {
          const properties = response.data.props;
          console.log(`  ✅ ${propertyType} (Page ${page}): ${properties.length} properties`);
          
          // Add unique identifier to track source
          properties.forEach(prop => {
            prop._source = `${propertyType}-Page${page}`;
            prop._id = `${prop.zpid}-${propertyType}-${page}`;
          });
          
          allProperties.push(...properties);
          
          // Show sample property data for first property
          if (page === 1 && properties.length > 0) {
            const sample = properties[0];
            console.log(`    📊 Sample: $${sample.price?.toLocaleString()} | ${sample.bedrooms}bd/${sample.bathrooms}ba | ${sample.address}`);
            console.log(`    📷 Photos: ${sample.carouselPhotos?.length || 0} images`);
            console.log(`    🏠 Rent Est: $${sample.rentZestimate?.toLocaleString() || 'N/A'}`);
          }
          
          // If no properties on this page, stop searching further pages for this type
          if (properties.length === 0) {
            console.log(`    ⏹️ No more ${propertyType} properties, stopping pagination`);
            break;
          }
        } else {
          console.log(`  ❌ ${propertyType} (Page ${page}): No data or invalid response`);
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`  ❌ ${propertyType} (Page ${page}): ${error.message}`);
        if (error.response?.status === 429) {
          console.log('    ⚠️ Rate limited - waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    console.log(''); // Empty line between property types
  }
  
  console.log('📊 RESULTS SUMMARY:');
  console.log(`🏠 Total properties found: ${allProperties.length}`);
  
  // Remove duplicates based on zpid
  const uniqueProperties = [];
  const seenZpids = new Set();
  
  for (const prop of allProperties) {
    if (prop.zpid && !seenZpids.has(prop.zpid)) {
      seenZpids.add(prop.zpid);
      uniqueProperties.push(prop);
    }
  }
  
  console.log(`🔍 Unique properties after deduplication: ${uniqueProperties.length}`);
  
  // Analyze property distribution
  const typeDistribution = {};
  const priceRanges = { under1M: 0, between1M2M: 0, over2M: 0 };
  let totalPhotos = 0;
  let propertiesWithRentEst = 0;
  
  uniqueProperties.forEach(prop => {
    // Type distribution
    const source = prop._source.split('-')[0];
    typeDistribution[source] = (typeDistribution[source] || 0) + 1;
    
    // Price distribution
    if (prop.price < 1000000) priceRanges.under1M++;
    else if (prop.price <= 2000000) priceRanges.between1M2M++;
    else priceRanges.over2M++;
    
    // Photo count
    if (prop.carouselPhotos) totalPhotos += prop.carouselPhotos.length;
    
    // Rent estimates
    if (prop.rentZestimate) propertiesWithRentEst++;
  });
  
  console.log('\n📈 PROPERTY ANALYSIS:');
  console.log('Property Type Distribution:');
  Object.entries(typeDistribution).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} properties`);
  });
  
  console.log('\nPrice Distribution:');
  console.log(`  Under $1M: ${priceRanges.under1M} properties`);
  console.log(`  $1M - $2M: ${priceRanges.between1M2M} properties`);
  console.log(`  Over $2M: ${priceRanges.over2M} properties`);
  
  console.log('\nData Quality:');
  console.log(`  📷 Average photos per property: ${Math.round(totalPhotos / uniqueProperties.length)}`);
  console.log(`  💰 Properties with rent estimates: ${propertiesWithRentEst}/${uniqueProperties.length} (${Math.round(propertiesWithRentEst/uniqueProperties.length*100)}%)`);
  
  console.log('\n🎯 OPTIMIZATION SUCCESS:');
  if (uniqueProperties.length >= 80) {
    console.log('✅ SUCCESS! Found 80+ properties (meets goal)');
  } else if (uniqueProperties.length >= 60) {
    console.log('✅ GOOD! Significant improvement over current 25-41');
  } else {
    console.log('⚠️ PARTIAL: Some improvement but may need additional strategies');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. The optimized service is already implemented in your app');
  console.log('2. It will search multiple property types and pages automatically');
  console.log('3. Results will be deduplicated and enhanced with investment metrics');
  console.log('4. Test by searching "Santa Clara, CA" in your app');
  
  // Show top 5 properties as examples
  console.log('\n🏆 TOP 5 SAMPLE PROPERTIES:');
  uniqueProperties.slice(0, 5).forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.address} - $${prop.price?.toLocaleString()} | ${prop.bedrooms}bd | ${prop.carouselPhotos?.length || 0} photos | ${prop._source}`);
  });
}

testOptimizedZillowSearch().catch(console.error);
