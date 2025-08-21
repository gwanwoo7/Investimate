# 🧪 Investimate Manual Testing Guide

## Quick Test Checklist

### 1. Font Standardization ✅
**Expected:** Headers should be 1.5rem, body text 0.8-0.9rem throughout
**Test:** Navigate to tab "Investment Property Calculator" and verify text sizes are consistent

### 2. Property Search 🔍
**Expected:** Search form should accept city/state and return mock properties
**Test:**
1. Click on tab 1 (Investment Property Calculator)
2. Fill in search form: City = "Austin", State = "TX" 
3. Click "Search Properties" button
4. Should see properties appear in right panel and on map

### 3. Map Functionality 🗺️
**Expected:** Interactive Leaflet map with drawing tools and property markers
**Test:**
1. Map should be visible in center panel
2. Drawing tools should be present in top-left of map
3. After search, property markers should appear on map
4. Click and drag to draw boundaries should trigger search

### 4. Property Analysis Modal 📊
**Expected:** Click property card or "Analyze" button opens detailed analysis
**Test:**
1. After properties load, click on any property card
2. OR click "Full Analysis" button on property
3. Should open comprehensive modal with charts, tables, projections

### 5. Navigation 🧭
**Expected:** Tabs should work, proper routing between pages
**Test:**
1. Click different tabs (Home, Investment Calculator, Community)
2. Each should load different content
3. URLs should change appropriately

## Debug Commands (in Browser Console)

```javascript
// Run all tests
window.investimateDebug.runAllTests()

// Test specific functionality  
window.investimateDebug.testMapFunctionality()
window.investimateDebug.testPropertyAnalysis()
window.investimateDebug.simulatePropertySearch()
```

## Expected Console Output

The debug script should automatically run and show:
- ✅ Font sizes and consistency check
- ✅ Component rendering status
- ✅ Map elements detection
- ✅ Property interaction capabilities
- ✅ Navigation functionality

## Troubleshooting

If issues persist:
1. **Hard refresh:** Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
2. **Clear cache:** DevTools > Application > Storage > Clear site data
3. **Check console:** Look for React/JavaScript errors
4. **Verify dev server:** Should be running on localhost:5175
