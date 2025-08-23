import { ApifyZillowAPIService } from './src/services/apifyZillowAPIService.js';

async function testApifyIntegration() {
  console.log('🧪 Testing Apify Zillow Scraper Integration...\n');
  
  // Test parameters
  const searchParams = {
    city: 'Los Angeles',
    state: 'CA',
    minPrice: 500000,
    maxPrice: 1000000,
    minBedrooms: 2,
    limit: 5 // Small limit for testing
  };
  
  console.log('📋 Search Parameters:');
  console.log('   Location: Los Angeles, CA');
  console.log('   Price Range: $500K - $1M');
  console.log('   Min Bedrooms: 2');
  console.log('   Limit: 5 properties\n');
  
  try {
    console.log('🚀 Starting Apify search...');
    const startTime = Date.now();
    
    const results = await ApifyZillowAPIService.searchProperties(searchParams);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Search completed in ${duration} seconds`);
    console.log(`📊 Found ${results.length} properties\n`);
    
    if (results.length > 0) {
      console.log('🏠 Sample Property Details:');
      const sample = results[0];
      
      console.log(`   Address: ${sample.address}, ${sample.city}, ${sample.state}`);
      console.log(`   Price: $${sample.purchasePrice.toLocaleString()}`);
      console.log(`   Bedrooms: ${sample.bedrooms} | Bathrooms: ${sample.bathrooms}`);
      console.log(`   Square Feet: ${sample.squareFootage.toLocaleString()}`);
      console.log(`   Estimated Rent: $${sample.monthlyRent?.toLocaleString() || 'N/A'}`);
      console.log(`   Photos: ${sample.images?.length || 0} images`);
      console.log(`   Investment Score: ${sample.investmentScore}/10 (${sample.investmentRank})`);
      console.log(`   Cash Flow: $${sample.estimatedCashFlow}/month`);
      console.log(`   COC Return: ${sample.estimatedCOCReturn}%`);
      console.log(`   Data Source: ${sample.source}\n`);
      
      if (sample.images && sample.images.length > 0) {
        console.log('📸 Photo URLs:');
        sample.images.slice(0, 3).forEach((url, index) => {
          console.log(`   ${index + 1}: ${url}`);
        });
        if (sample.images.length > 3) {
          console.log(`   ... and ${sample.images.length - 3} more photos`);
        }
        console.log();
      }
      
      console.log('📈 Investment Analysis:');
      console.log(`   Monthly Rent: $${sample.quickAnalysis?.monthlyRent || 'N/A'}`);
      console.log(`   Monthly Expenses: $${sample.quickAnalysis?.monthlyExpenses || 'N/A'}`);
      console.log(`   Monthly Mortgage: $${sample.quickAnalysis?.monthlyMortgage || 'N/A'}`);
      console.log(`   Monthly Cash Flow: $${sample.quickAnalysis?.monthlyCashFlow || 'N/A'}`);
      console.log(`   Total Cash Needed: $${sample.quickAnalysis?.totalCashNeeded?.toLocaleString() || 'N/A'}`);
    } else {
      console.log('ℹ️ No properties returned. This might be due to:');
      console.log('   - Apify token not configured (using mock data)');
      console.log('   - Search parameters too restrictive');
      console.log('   - Temporary API issues');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if VITE_APIFY_API_TOKEN is set in .env');
    console.log('2. Verify Apify account has sufficient credits');
    console.log('3. Check actor ID is correct');
    console.log('4. Review network connectivity');
  }
  
  console.log('\n📚 For setup instructions, see APIFY_SETUP_GUIDE.md');
}

// Run the test
testApifyIntegration();
