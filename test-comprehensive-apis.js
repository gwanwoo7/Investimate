// Test script for comprehensive multi-API real estate search
// Run with: node test-comprehensive-apis.js

import axios from 'axios';
import { config } from 'dotenv';

config(); // Load .env file

const RAPID_API_KEY = process.env.VITE_RAPID_API_KEY;

async function testZillowEnhanced() {
  console.log('\n🏡 Testing Enhanced Zillow API...');
  
  try {
    const response = await axios.get('https://zillow-com1.p.rapidapi.com/search', {
      params: {
        location: 'Santa Clara, CA',
        status_type: 'ForSale',
        home_type: 'Houses',
        minPrice: 500000,
        maxPrice: 2000000,
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    });
    
    console.log('✅ Zillow Enhanced API Response Status:', response.status);
    console.log('📊 Data structure:', Object.keys(response.data));
    if (response.data.results) {
      console.log('🏠 Properties found:', response.data.results.length);
      console.log('📋 Sample property:', response.data.results[0] ? Object.keys(response.data.results[0]) : 'No properties');
    }
  } catch (error) {
    console.log('❌ Zillow Enhanced failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function testRealtorAPI() {
  console.log('\n🏡 Testing Realtor.com API...');
  
  try {
    const response = await axios.get('https://realtor.p.rapidapi.com/properties/v2/list-for-sale', {
      params: {
        city: 'Santa Clara',
        state_code: 'CA',
        limit: 20,
        price_min: 500000,
        price_max: 2000000,
        beds_min: 2
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
      }
    });
    
    console.log('✅ Realtor.com API Response Status:', response.status);
    console.log('📊 Data structure:', Object.keys(response.data));
    if (response.data.properties) {
      console.log('🏠 Properties found:', response.data.properties.length);
      console.log('📋 Sample property keys:', response.data.properties[0] ? Object.keys(response.data.properties[0]) : 'No properties');
    }
  } catch (error) {
    console.log('❌ Realtor.com failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function testRealtyMoleAPI() {
  console.log('\n🏡 Testing Realty Mole API...');
  
  try {
    const response = await axios.get('https://realty-mole-property-api.p.rapidapi.com/properties', {
      params: {
        city: 'Santa Clara',
        state: 'CA',
        limit: 20,
        propertyType: 'Single Family',
        minPrice: 500000,
        maxPrice: 2000000
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
      }
    });
    
    console.log('✅ Realty Mole API Response Status:', response.status);
    console.log('📊 Data structure:', Array.isArray(response.data) ? 'Array' : typeof response.data);
    if (Array.isArray(response.data)) {
      console.log('🏠 Properties found:', response.data.length);
      console.log('📋 Sample property keys:', response.data[0] ? Object.keys(response.data[0]) : 'No properties');
    }
  } catch (error) {
    console.log('❌ Realty Mole failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function testUSRealEstateAPI() {
  console.log('\n🏡 Testing US Real Estate API...');
  
  try {
    const response = await axios.get('https://us-real-estate.p.rapidapi.com/v2/for-sale', {
      params: {
        city: 'Santa Clara',
        state_code: 'CA',
        limit: 20,
        price_min: 500000,
        price_max: 2000000,
        beds_min: 2
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
      }
    });
    
    console.log('✅ US Real Estate API Response Status:', response.status);
    console.log('📊 Data structure:', Object.keys(response.data));
    if (response.data.listings) {
      console.log('🏠 Properties found:', response.data.listings.length);
      console.log('📋 Sample property keys:', response.data.listings[0] ? Object.keys(response.data.listings[0]) : 'No properties');
    }
  } catch (error) {
    console.log('❌ US Real Estate failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function testCurrentZillowAPI() {
  console.log('\n🏡 Testing Current Zillow API (propertyExtendedSearch)...');
  
  try {
    const response = await axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
      params: {
        location: 'Santa Clara, CA',
        status_type: 'ForSale',
        propertyType: 'Single Family',
        minPrice: '500000',
        maxPrice: '2000000',
        page: '1'
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    });
    
    console.log('✅ Current Zillow API Response Status:', response.status);
    console.log('📊 Data structure:', Object.keys(response.data));
    if (response.data.props) {
      console.log('🏠 Properties found:', response.data.props.length);
      console.log('📋 Sample property keys:', response.data.props[0] ? Object.keys(response.data.props[0]) : 'No properties');
    }
  } catch (error) {
    console.log('❌ Current Zillow failed:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Real Estate API Tests');
  console.log('🔑 API Key configured:', RAPID_API_KEY ? `${RAPID_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  console.log('📍 Testing location: Santa Clara, CA');
  console.log('💰 Price range: $500K - $2M');
  console.log('🛏️ Min bedrooms: 2');
  
  if (!RAPID_API_KEY) {
    console.log('❌ No API key found. Please set VITE_RAPID_API_KEY in your .env file');
    return;
  }

  // Test all APIs
  await testCurrentZillowAPI();
  await testZillowEnhanced();
  await testRealtorAPI();
  await testRealtyMoleAPI();
  await testUSRealEstateAPI();
  
  console.log('\n📊 Test Summary:');
  console.log('- Current method uses single Zillow endpoint with limited results');
  console.log('- New comprehensive approach tests multiple APIs for maximum coverage');
  console.log('- Best performing APIs will be prioritized in the implementation');
  console.log('\n💡 Next step: Based on results, configure the best working APIs in your app');
}

// Run tests
runAllTests().catch(console.error);
