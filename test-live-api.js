import axios from 'axios';

async function testZillowAPI() {
  const API_KEY = 'b88f193366msh54685e5876b1873p1d27b6jsnb71f9fd28d7c';
  
  console.log('🧪 Testing current Zillow API configuration...');
  
  const config = {
    method: 'GET',
    url: 'https://zillow-com1.p.rapidapi.com/propertyExtendedSearch',
    params: {
      location: 'Los Angeles, CA',
      status_type: 'ForSale',
      propertyType: 'Single Family,Townhouse',
      minPrice: '100000',
      maxPrice: '500000',
      page: '1'
    },
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    console.log('📡 Making request with current config...');
    const response = await axios.request(config);
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log(`📊 Total Properties Found: ${response.data.totalResultCount || 0}`);
    
    if (response.data.props && response.data.props.length > 0) {
      const firstProperty = response.data.props[0];
      console.log('🏠 First property sample:');
      console.log(`   Address: ${firstProperty.address}`);
      console.log(`   Price: $${firstProperty.price?.toLocaleString()}`);
      console.log(`   Image URL: ${firstProperty.imgSrc}`);
      console.log(`   Has Image: ${firstProperty.hasImage}`);
      
      // Count how many properties have images
      const propertiesWithImages = response.data.props.filter(p => p.imgSrc).length;
      console.log(`📸 Properties with images: ${propertiesWithImages}/${response.data.props.length}`);
      
      // Show first 3 image URLs
      const imageUrls = response.data.props
        .filter(p => p.imgSrc)
        .slice(0, 3)
        .map(p => p.imgSrc);
      
      console.log('📸 Sample image URLs:');
      imageUrls.forEach((url, idx) => {
        console.log(`   ${idx + 1}: ${url}`);
      });
    } else {
      console.log('❌ No properties returned');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testZillowAPI();
