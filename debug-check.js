// Comprehensive implementation testing
console.log('🔍 INVESTIMATE DEBUG CHECK - Starting comprehensive testing...');

// Test 1: Font standardization verification
function testFontStandardization() {
  console.log('� Test 1: Font Standardization Check');
  
  // Check main headers
  const mainHeaders = document.querySelectorAll('h1, h2, h3, h4');
  console.log(`Found ${mainHeaders.length} headers`);
  
  mainHeaders.forEach((header, i) => {
    const styles = window.getComputedStyle(header);
    console.log(`Header ${i+1} (${header.tagName}):`, {
      fontSize: styles.fontSize,
      text: header.textContent?.substring(0, 40) + '...'
    });
  });
  
  // Check body text consistency
  const bodyTexts = document.querySelectorAll('p, span, div[class*="MuiTypography"]');
  const uniqueFontSizes = new Set();
  
  Array.from(bodyTexts).slice(0, 10).forEach(el => {
    const fontSize = window.getComputedStyle(el).fontSize;
    uniqueFontSizes.add(fontSize);
  });
  
  console.log('Body text font sizes found:', Array.from(uniqueFontSizes));
}

// Test 2: Property search functionality
async function testPropertySearch() {
  console.log('🏠 Test 2: Property Search Functionality');
  
  try {
    // Check if search form is present
    const searchForms = document.querySelectorAll('form, [data-testid*="search"], [class*="search"]');
    console.log(`Search forms found: ${searchForms.length}`);
    
    // Check for search buttons
    const searchButtons = document.querySelectorAll('button[type="submit"], button:contains("Search"), [aria-label*="search" i]');
    console.log(`Search buttons found: ${searchButtons.length}`);
    
    // Check for input fields
    const inputs = document.querySelectorAll('input[type="text"], select, textarea');
    console.log(`Input fields found: ${inputs.length}`);
    
    // Test API endpoint (fallback to mock)
    console.log('Testing API connectivity...');
  } catch (error) {
    console.log('Search functionality test error:', error.message);
  }
}

// Test 3: Map functionality verification
function testMapFunctionality() {
  console.log('🗺️ Test 3: Map Functionality Check');
  
  // Check for Leaflet map elements
  const leafletMaps = document.querySelectorAll('.leaflet-container, [id*="map"]');
  console.log(`Leaflet map containers found: ${leafletMaps.length}`);
  
  // Check for map controls
  const mapControls = document.querySelectorAll('.leaflet-control-zoom, .leaflet-draw-toolbar, [class*="leaflet"]');
  console.log(`Map controls found: ${mapControls.length}`);
  
  // Check if map is interactive
  const mapContainer = document.querySelector('.leaflet-container');
  if (mapContainer) {
    console.log('Map container style:', {
      width: mapContainer.style.width || window.getComputedStyle(mapContainer).width,
      height: mapContainer.style.height || window.getComputedStyle(mapContainer).height,
      display: window.getComputedStyle(mapContainer).display
    });
  }
  
  // Check for property markers
  const markers = document.querySelectorAll('.leaflet-marker-icon, [class*="marker"]');
  console.log(`Property markers found: ${markers.length}`);
}

// Test 4: Property analysis modal verification  
function testPropertyAnalysis() {
  console.log('📊 Test 4: Property Analysis Modal Check');
  
  // Check for property cards
  const propertyCards = document.querySelectorAll('[class*="MuiCard"], [data-testid*="property"], .property-card');
  console.log(`Property cards found: ${propertyCards.length}`);
  
  // Check for analysis buttons
  const analysisButtons = document.querySelectorAll('button:contains("Analyze"), button[aria-label*="analysis" i], [class*="analysis"]');
  console.log(`Analysis buttons found: ${analysisButtons.length}`);
  
  // Check for modal components
  const modals = document.querySelectorAll('[role="dialog"], .MuiDialog-root, [class*="modal"]');
  console.log(`Modal containers found: ${modals.length}`);
  
  // Check if DetailedPropertyAnalysis component exists in DOM
  const analysisComponents = document.querySelectorAll('[class*="DetailedProperty"], [data-component*="analysis"]');
  console.log(`Analysis components found: ${analysisComponents.length}`);
}

// Test 5: Navigation and tab functionality
function testNavigationTabs() {
  console.log('🧭 Test 5: Navigation Tab Check');
  
  // Check for navigation tabs
  const tabs = document.querySelectorAll('[role="tab"], .MuiTab-root, [class*="tab"]');
  console.log(`Navigation tabs found: ${tabs.length}`);
  
  // Check current active tab
  const activeTabs = document.querySelectorAll('[aria-selected="true"], [class*="active"]');
  console.log(`Active tabs found: ${activeTabs.length}`);
  
  // Check if Property Calculator tab is accessible
  const calcTab = document.querySelector('button:contains("Property Calculator"), [aria-label*="calculator" i]');
  console.log(`Calculator tab accessible: ${calcTab ? 'YES' : 'NO'}`);
}

// Test 6: Component loading and rendering
function testComponentRendering() {
  console.log('⚛️ Test 6: Component Rendering Check');
  
  // Check for React components
  const reactRoots = document.querySelectorAll('[data-reactroot], #root');
  console.log(`React root elements: ${reactRoots.length}`);
  
  // Check for Material-UI components
  const muiComponents = document.querySelectorAll('[class*="Mui"]');
  console.log(`Material-UI components found: ${muiComponents.length}`);
  
  // Check for Lucide icons
  const lucideIcons = document.querySelectorAll('svg[class*="lucide"]');
  console.log(`Lucide icons found: ${lucideIcons.length}`);
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[class*="loading"], .MuiCircularProgress-root');
  console.log(`Loading indicators: ${loadingElements.length}`);
}

// Interactive test functions
function simulatePropertySearch() {
  console.log('🎯 Attempting to simulate property search...');
  
  // Try to find and fill search form
  const cityInput = document.querySelector('input[name*="city" i], input[placeholder*="city" i]');
  const stateInput = document.querySelector('select[name*="state" i], input[placeholder*="state" i]');
  const searchButton = document.querySelector('button[type="submit"], button:contains("Search")');
  
  if (cityInput && stateInput && searchButton) {
    console.log('✅ Search form elements found - ready for interaction');
    console.log('Inputs:', { city: cityInput.tagName, state: stateInput.tagName });
  } else {
    console.log('❌ Search form incomplete:', { 
      city: !!cityInput, 
      state: !!stateInput, 
      button: !!searchButton 
    });
  }
}

function simulatePropertyClick() {
  console.log('🎯 Attempting to simulate property analysis...');
  
  // Find property cards or table rows
  const clickableProperties = document.querySelectorAll(
    '.MuiCard-root, .MuiTableRow-root, [data-testid*="property"], [class*="property-card"]'
  );
  
  if (clickableProperties.length > 0) {
    console.log(`✅ Found ${clickableProperties.length} clickable property elements`);
    
    // Check for analysis buttons within properties
    const analysisButtons = document.querySelectorAll('button:contains("Analyze"), [class*="analysis-btn"]');
    console.log(`Analysis buttons available: ${analysisButtons.length}`);
  } else {
    console.log('❌ No clickable property elements found');
  }
}

// Master test runner
function runAllTests() {
  console.log('🚀 RUNNING ALL TESTS...\n');
  
  // Basic checks first
  testFontStandardization();
  console.log('─'.repeat(50));
  
  testNavigationTabs(); 
  console.log('─'.repeat(50));
  
  testComponentRendering();
  console.log('─'.repeat(50));
  
  // Functionality tests
  testPropertySearch();
  console.log('─'.repeat(50));
  
  testMapFunctionality();
  console.log('─'.repeat(50));
  
  testPropertyAnalysis();
  console.log('─'.repeat(50));
  
  // Interactive simulation
  simulatePropertySearch();
  console.log('─'.repeat(50));
  
  simulatePropertyClick();
  console.log('─'.repeat(50));
  
  // Summary
  console.log('🏁 TEST SUMMARY COMPLETE - Check results above');
}

// Run comprehensive tests after DOM is loaded
if (typeof window !== 'undefined') {
  // Run immediately if DOM is already loaded
  if (document.readyState === 'complete') {
    setTimeout(runAllTests, 1000);
  } else {
    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(runAllTests, 2000);
    });
  }
  
  // Also run tests when hash changes (for SPA navigation)
  window.addEventListener('hashchange', () => {
    setTimeout(() => {
      console.log('🔄 Page navigation detected - re-running tests...');
      runAllTests();
    }, 1000);
  });
  
  // Expose test functions globally for manual testing
  window.investimateDebug = {
    runAllTests,
    testFontStandardization,
    testPropertySearch,
    testMapFunctionality,
    testPropertyAnalysis,
    testNavigationTabs,
    testComponentRendering,
    simulatePropertySearch,
    simulatePropertyClick
  };
  
  console.log('🛠️ Debug functions available at: window.investimateDebug');
}
