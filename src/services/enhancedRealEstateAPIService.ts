import axios from 'axios';
import type { AreaSearchParams, PropertyListing, PropertyData, RentEstimate } from '../types/property';
import { ApifyZillowAPIService } from './apifyZillowAPIService';
import { OptimizedZillowAPIService } from './optimizedZillowAPIService';
import { RealtyMoleAPIService } from './realtyMoleAPIService';

// Enhanced Real Estate API Service with Apify Integration and Optimized Zillow Search
export class EnhancedRealEstateAPIService {
  private static readonly RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
  private static readonly APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;

  // Main search method - prioritizes Apify, then optimized Zillow search
  static async searchProperties(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Enhanced search method called with params:', params);
    
    // Try Apify first for the most comprehensive data (premium option)
    if (this.APIFY_API_TOKEN && this.APIFY_API_TOKEN !== 'your_apify_token_here') {
      console.log('🚀 Using Apify Zillow Scraper for enhanced data extraction...');
      try {
        const apifyResults = await ApifyZillowAPIService.searchProperties(params);
        if (apifyResults.length > 0) {
          console.log(`✅ Apify returned ${apifyResults.length} properties with comprehensive data`);
          return apifyResults;
        }
      } catch (error) {
        console.log('⚠️ Apify failed, falling back to optimized Zillow search...', error);
      }
    }
    
    // Use optimized Zillow search to maximize current API subscription
    console.log('🚀 Using optimized Zillow search for maximum results...');
    try {
      const optimizedResults = await OptimizedZillowAPIService.searchPropertiesOptimized(params);
      if (optimizedResults.length > 0) {
        console.log(`✅ Optimized search returned ${optimizedResults.length} properties`);
        // Enhance with additional photos from RealtyMole
        const enhancedResults = await RealtyMoleAPIService.enhancePropertiesWithPhotos(optimizedResults);
        return enhancedResults;
      }
    } catch (error) {
      console.log('⚠️ Optimized search failed, falling back to original method...', error);
    }
    
    // Final fallback to original multi-source search
    return this.searchPropertiesFromMultipleSources(params);
  }

  // Enhanced search with boundary support
  static async searchPropertiesWithBoundary(
    params: AreaSearchParams, 
    bounds?: { north: number; south: number; east: number; west: number }
  ): Promise<PropertyListing[]> {
    console.log('🗺️ Boundary search called with bounds:', bounds);
    
    if (bounds) {
      // Convert bounds to location search
      const centerLat = (bounds.north + bounds.south) / 2;
      const centerLng = (bounds.east + bounds.west) / 2;
      
      // Enhanced search parameters for boundary
      const enhancedParams = {
        ...params,
        latitude: centerLat,
        longitude: centerLng,
        bounds: bounds,
        limit: 100 // Request more properties for boundary searches
      };
      
      // Try Apify first for boundary searches
      if (this.APIFY_API_TOKEN && this.APIFY_API_TOKEN !== 'your_apify_token_here') {
        console.log('🚀 Using Apify for boundary search...');
        try {
          const apifyResults = await ApifyZillowAPIService.searchProperties(enhancedParams);
          if (apifyResults.length > 0) {
            console.log(`✅ Apify boundary search returned ${apifyResults.length} properties`);
            return apifyResults;
          }
        } catch (error) {
          console.log('⚠️ Apify boundary search failed, falling back...', error);
        }
      }
      
      // Use optimized search for boundary queries
      try {
        const optimizedResults = await OptimizedZillowAPIService.searchPropertiesOptimized(enhancedParams);
        if (optimizedResults.length > 0) {
          console.log(`✅ Optimized boundary search returned ${optimizedResults.length} properties`);
          // Enhance with additional photos from RealtyMole
          const enhancedResults = await RealtyMoleAPIService.enhancePropertiesWithPhotos(optimizedResults);
          return enhancedResults;
        }
      } catch (error) {
        console.log('⚠️ Optimized boundary search failed, using fallback...', error);
      }
      
      return this.searchPropertiesFromMultipleSources(enhancedParams);
    }
    
    return this.searchProperties(params);
  }

  // Search from multiple sources to get more comprehensive results
  private static async searchPropertiesFromMultipleSources(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Searching multiple sources for comprehensive results...');
    console.log('🔑 Enhanced API Key check:', { 
      hasKey: !!this.RAPID_API_KEY, 
      keyLength: this.RAPID_API_KEY?.length, 
      keyPrefix: this.RAPID_API_KEY?.substring(0, 10) + '...'
    });
    
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ No API key configured. Using enhanced mock data...');
      return this.getEnhancedMockProperties(params);
    }

    try {
      // Search multiple property types and sources in parallel
      const searchPromises = [
        this.fetchFromZillowEnhanced(params, 'Single Family'),
        this.fetchFromZillowEnhanced(params, 'Townhouse'),
        this.fetchFromZillowEnhanced(params, 'Condo'),
        this.fetchFromZillowEnhanced(params, 'Multi Family')
      ];

      const results = await Promise.allSettled(searchPromises);
      let allProperties: PropertyData[] = [];

      // Combine results from all successful searches
      results.forEach((result, index) => {
        const propertyType = ['Houses', 'Townhouses', 'Condos', 'MultiFamily'][index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${propertyType}: Found ${result.value.length} properties`);
          allProperties = allProperties.concat(result.value);
        } else {
          console.log(`❌ ${propertyType}: Search failed -`, result.reason?.message);
        }
      });

      // Remove duplicates
      allProperties = this.removeDuplicateProperties(allProperties);
      console.log(`🏠 Total unique properties after deduplication: ${allProperties.length}`);

      // Apply boundary filtering if bounds are provided
      if (params.bounds) {
        allProperties = this.filterPropertiesByBounds(allProperties, params.bounds);
        console.log(`📍 Properties within boundary: ${allProperties.length}`);
      }

      // Calculate investment metrics for each property
      const listings = await Promise.all(
        allProperties.map(async (property) => {
          const rentEstimate = await this.getRentEstimate(property);
          const investmentMetrics = this.calculateInvestmentMetrics(property, rentEstimate.estimatedRent);
          
          return {
            ...property,
            ...investmentMetrics
          } as PropertyListing;
        })
      );

      return this.sortByInvestmentScore(listings);
    } catch (error) {
      console.error('❌ Enhanced search error:', error);
      return this.getEnhancedMockProperties(params);
    }
  }

  // Enhanced Zillow API search with property type support
  private static async fetchFromZillowEnhanced(params: AreaSearchParams, homeType: string): Promise<PropertyData[]> {
    if (!params.city || !params.state) {
      throw new Error(`Missing required location parameters: city="${params.city}", state="${params.state}"`);
    }
    
    const location = `${params.city}, ${params.state}`;
    
    // Enhanced search configuration for more results
    const config = {
      method: 'GET',
      url: 'https://zillow-com1.p.rapidapi.com/propertyExtendedSearch',
      params: {
        location: location,
        status_type: 'ForSale',
        propertyType: homeType,
        minPrice: (params.minPrice || 50000).toString(),
        maxPrice: (params.maxPrice || 20000000).toString(),
        page: '1'
      },
      headers: {
        'X-RapidAPI-Key': this.RAPID_API_KEY,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    };

    console.log(`🏡 Searching Zillow for ${homeType} in ${location}...`);
    const response = await axios.request(config);
    
    if (response.status === 403 || (response.data?.message && response.data.message.includes('subscribed'))) {
      throw new Error('You are not subscribed to this API');
    }
    
    if (!response.data) {
      throw new Error('No data found');
    }

    return this.transformZillowPropertiesEnhanced(response.data, params, homeType);
  }

  // Enhanced property transformation with better data extraction
  private static transformZillowPropertiesEnhanced(zillowData: any, params: AreaSearchParams, homeType: string): PropertyData[] {
    if (!zillowData || !zillowData.props || !Array.isArray(zillowData.props)) {
      console.log(`No ${homeType} properties found in Zillow response`);
      return [];
    }
    
    console.log(`📊 Processing ${zillowData.props.length} ${homeType} properties from Zillow...`);
    
    return zillowData.props.slice(0, 25).map((property: any, index: number) => {
      const price = property.price || property.unformattedPrice || 0;
      
      // Enhanced address parsing
      const fullAddress = property.address || '';
      const addressParts = fullAddress.split(', ');
      const address = addressParts[0] || `${homeType} Property ${index + 1}`;
      const city = addressParts[1] || params.city || 'Unknown';
      const stateZip = addressParts[2] || '';
      const state = stateZip.split(' ')[0] || params.state || 'Unknown';
      const zipCode = stateZip.split(' ')[1] || '00000';
      
      // Enhanced rent estimation using multiple Zillow sources
      let estimatedRent = property.rentZestimate || 
                         property.rentalZestimate || 
                         property.estimatedRent;
      
      if (!estimatedRent) {
        // Calculate using enhanced 1% rule with regional adjustments
        const monthlyGrossRent = price * 0.01 / 12;
        const regionMultipliers: { [key: string]: number } = {
          'CA': 0.4, // Lower rent ratio in expensive CA markets
          'NY': 0.5,
          'FL': 0.8,
          'TX': 0.9,
          'AL': 1.2,
          'GA': 1.0,
          'NC': 1.1,
          'TN': 1.1
        };
        estimatedRent = Math.round(monthlyGrossRent * (regionMultipliers[state] || 1.0));
      }
      
      // Property type mapping
      const getPropertyType = (homeType: string): 'single-family' | 'townhouse' | 'condo' | 'multi-family' => {
        switch (homeType.toLowerCase()) {
          case 'townhouses': return 'townhouse';
          case 'condos': return 'condo';
          case 'multifamily': return 'multi-family';
          default: return 'single-family';
        }
      };
      
      // Enhanced financial data extraction
      const annualPropertyTaxes = property.propertyTaxes || 
                                  property.taxAssessment || 
                                  (price * this.getTaxRateByState(state));
      
      const annualInsurance = property.insurance || 
                             property.homeInsurance || 
                             (price * this.getInsuranceRateByState(state));
      
      const monthlyHOA = property.monthlyHoaFee || 
                        property.hoaFee || 
                        (homeType === 'Condos' ? Math.round(price * 0.003 / 12) : 0); // Condos typically have HOA
      
      // Enhanced mortgage calculation
      const interestRate = property.interestRate || 
                          property.mortgageRate || 
                          0.068; // Current market rate as of 2024
      
      const downPaymentPercent = 0.25;
      const loanAmount = price * (1 - downPaymentPercent);
      const monthlyRate = interestRate / 12;
      const numPayments = 30 * 12;
      const monthlyMortgagePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                    (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      return {
        id: `zillow-${homeType}-${property.zpid || index}`,
        address,
        city,
        state,
        zipCode,
        purchasePrice: price,
        marketValue: property.zestimate || price,
        bedrooms: Math.max(property.bedrooms || 2, 2), // Ensure minimum 2 bedrooms as per search criteria
        bathrooms: property.bathrooms || 2,
        squareFootage: property.livingArea || property.sqft || 1500,
        yearBuilt: property.yearBuilt || 2000,
        propertyType: getPropertyType(homeType),
        monthlyRent: estimatedRent,
        source: `Zillow ${homeType}`,
        latitude: property.latitude || this.getCityCoordinates(city, state)?.lat,
        longitude: property.longitude || this.getCityCoordinates(city, state)?.lng,
        
        // Add coordinates property for map compatibility
        coordinates: {
          lat: property.latitude || this.getCityCoordinates(city, state)?.lat || 37.3541,
          lng: property.longitude || this.getCityCoordinates(city, state)?.lng || -121.9552
        },
        
        // Enhanced financial data
        monthlyHoaFee: monthlyHOA,
        annualPropertyTaxes: annualPropertyTaxes,
        monthlyPropertyTaxes: annualPropertyTaxes / 12,
        annualInsurance: annualInsurance,
        monthlyInsurance: annualInsurance / 12,
        mortgagePayment: {
          principal: monthlyMortgagePayment - (loanAmount * monthlyRate),
          interest: loanAmount * monthlyRate,
          total: monthlyMortgagePayment,
          interestRate: interestRate
        },
        
        // Additional property details
        lotSize: property.lotSize,
        parkingSpaces: property.parkingSpaces,
        hasGarage: property.hasGarage || false,
        hasPool: property.hasPool || false,
        hasAirConditioning: property.hasAirConditioning || true,
        heating: property.heating || 'central',
        propertyCondition: property.propertyCondition || 'good',
        daysOnMarket: property.daysOnZillow || property.daysOnMarket || 0,
        listingUrl: property.detailUrl || `https://zillow.com/homes/${property.zpid}`,
        
        // Market data
        pricePerSqft: price / (property.livingArea || 1500),
        taxAssessedValue: property.taxAssessedValue || price * 0.8,
        neighborhoodName: property.neighborhood,
        schoolDistrict: property.schoolDistrict
      } as PropertyData;
    });
  }

  // Get tax rates by state (approximate values)
  private static getTaxRateByState(state: string): number {
    const taxRates: { [key: string]: number } = {
      'CA': 0.0062, // 0.62%
      'TX': 0.0183, // 1.83%
      'FL': 0.0097, // 0.97%
      'NY': 0.0124, // 1.24%
      'AL': 0.0041, // 0.41%
      'GA': 0.0092, // 0.92%
      'NC': 0.0084, // 0.84%
      'TN': 0.0067  // 0.67%
    };
    return taxRates[state] || 0.012; // Default 1.2%
  }

  // Get insurance rates by state
  private static getInsuranceRateByState(state: string): number {
    const insuranceRates: { [key: string]: number } = {
      'CA': 0.0035, // 0.35%
      'TX': 0.0074, // 0.74%
      'FL': 0.0108, // 1.08% (hurricane risk)
      'NY': 0.0041, // 0.41%
      'AL': 0.0065, // 0.65%
      'GA': 0.0054, // 0.54%
      'NC': 0.0046, // 0.46%
      'TN': 0.0039  // 0.39%
    };
    return insuranceRates[state] || 0.005; // Default 0.5%
  }

  // Method aliases for consistency with property generation calls
  private static getPropertyTaxRate(state: string): number {
    return this.getTaxRateByState(state);
  }

  private static getInsuranceRate(state: string): number {
    return this.getInsuranceRateByState(state);
  }

  // Get city coordinates for fallback
  private static getCityCoordinates(city: string, state: string): { lat: number; lng: number } | null {
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'Santa Clara, CA': { lat: 37.3541, lng: -121.9552 },
      'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
      'Cupertino, CA': { lat: 37.3230, lng: -122.0322 },
      'Sunnyvale, CA': { lat: 37.3688, lng: -122.0363 },
      'Mountain View, CA': { lat: 37.3861, lng: -122.0839 },
      'Milpitas, CA': { lat: 37.4323, lng: -121.8995 },
      'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
      'Houston, TX': { lat: 29.7604, lng: -95.3698 },
      'Miami, FL': { lat: 25.7617, lng: -80.1918 },
      'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
      'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
      'Birmingham, AL': { lat: 33.5186, lng: -86.8104 }
    };
    
    return cityCoords[`${city}, ${state}`] || null;
  }

  // Get nearby cities for diverse property listings
  private static getNearbyCities(city: string, state: string): Array<{ city: string; state: string; lat: number; lng: number }> {
    // Base location
    const baseCoords = this.getCityCoordinates(city, state);
    const baseLat = baseCoords?.lat || 37.3541;
    const baseLng = baseCoords?.lng || -121.9552;

    // State-specific nearby cities
    const nearbyCitiesByState: { [key: string]: Array<{ city: string; state: string; lat: number; lng: number }> } = {
      'CA': [
        { city: city, state: state, lat: baseLat, lng: baseLng },
        { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
        { city: 'Sunnyvale', state: 'CA', lat: 37.3688, lng: -122.0363 },
        { city: 'Cupertino', state: 'CA', lat: 37.3230, lng: -122.0322 },
        { city: 'Mountain View', state: 'CA', lat: 37.3861, lng: -122.0839 },
        { city: 'Milpitas', state: 'CA', lat: 37.4323, lng: -121.8995 }
      ],
      'TX': [
        { city: city, state: state, lat: baseLat, lng: baseLng },
        { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
        { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
        { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
        { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 }
      ],
      'FL': [
        { city: city, state: state, lat: baseLat, lng: baseLng },
        { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
        { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
        { city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
        { city: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 }
      ],
      'GA': [
        { city: city, state: state, lat: baseLat, lng: baseLng },
        { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
        { city: 'Columbus', state: 'GA', lat: 32.4609, lng: -84.9877 },
        { city: 'Augusta', state: 'GA', lat: 33.4735, lng: -82.0105 },
        { city: 'Savannah', state: 'GA', lat: 32.0835, lng: -81.0998 }
      ]
    };

    return nearbyCitiesByState[state] || [
      { city: city, state: state, lat: baseLat, lng: baseLng },
      { city: city, state: state, lat: baseLat + 0.1, lng: baseLng + 0.1 },
      { city: city, state: state, lat: baseLat - 0.1, lng: baseLng - 0.1 }
    ];
  }

  // Get regional pricing based on state
  private static getRegionalPricing(state: string): number {
    const regionalPricing: { [key: string]: { min: number; max: number } } = {
      'CA': { min: 600000, max: 2000000 },
      'TX': { min: 200000, max: 800000 },
      'FL': { min: 250000, max: 900000 },
      'GA': { min: 180000, max: 600000 },
      'AL': { min: 120000, max: 400000 },
      'NY': { min: 400000, max: 1500000 },
      'WA': { min: 350000, max: 1200000 }
    };

    const pricing = regionalPricing[state] || { min: 200000, max: 800000 };
    return pricing.min + Math.random() * (pricing.max - pricing.min);
  }

  // Filter properties by boundary bounds
  private static filterPropertiesByBounds(
    properties: PropertyData[], 
    bounds: { north: number; south: number; east: number; west: number }
  ): PropertyData[] {
    console.log('🔍 Filtering properties by bounds:', bounds);
    console.log('📍 Total properties before filtering:', properties.length);
    
    const filtered = properties.filter(property => {
      if (!property.latitude || !property.longitude) return false; // Exclude properties without coordinates
      
      const withinBounds = property.latitude <= bounds.north &&
             property.latitude >= bounds.south &&
             property.longitude >= bounds.west &&  // Fixed: west should be minimum
             property.longitude <= bounds.east;    // Fixed: east should be maximum
             
      if (withinBounds) {
        console.log(`✅ Property ${property.address} is within bounds:`, {
          lat: property.latitude, 
          lng: property.longitude,
          bounds
        });
      }
      
      return withinBounds;
    });
    
    console.log('📍 Properties after boundary filtering:', filtered.length);
    return filtered;
  }

  // Remove duplicate properties based on address and price
  private static removeDuplicateProperties(properties: PropertyData[]): PropertyData[] {
    const seen = new Set<string>();
    return properties.filter(property => {
      const key = `${property.address.toLowerCase().trim()}-${property.city.toLowerCase().trim()}-${property.purchasePrice}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Enhanced rent estimation
  private static async getRentEstimate(property: PropertyData): Promise<RentEstimate> {
    if (property.monthlyRent && property.monthlyRent > 0) {
      return {
        estimatedRent: property.monthlyRent,
        confidence: 'high' as const,
        source: 'API Data'
      };
    }

    const baseRent = this.calculateEnhancedRent(property);
    
    return {
      estimatedRent: baseRent,
      confidence: 'medium' as const,
      source: 'Calculated'
    };
  }

  // Enhanced rent calculation with regional and property-specific adjustments
  private static calculateEnhancedRent(property: PropertyData): number {
    let baseRent = 500; // Starting base
    
    // Bedroom/bathroom adjustments
    baseRent += property.bedrooms * 300;
    baseRent += property.bathrooms * 200;
    
    // Square footage adjustment
    baseRent += (property.squareFootage / 1000) * 400;
    
    // Property type multipliers
    const typeMultipliers = {
      'single-family': 1.15,
      'townhouse': 1.05,
      'condo': 0.95,
      'multi-family': 1.0
    };
    baseRent *= typeMultipliers[property.propertyType] || 1.0;
    
    // Age adjustments
    if (property.yearBuilt) {
      const age = new Date().getFullYear() - property.yearBuilt;
      if (age < 10) baseRent *= 1.1; // Newer properties command higher rent
      else if (age > 30) baseRent *= 0.9; // Older properties rent for less
    }
    
    // Property features
    if (property.hasPool) baseRent += 150;
    if (property.hasGarage) baseRent += 100;
    if (property.parkingSpaces && property.parkingSpaces > 1) baseRent += 50 * (property.parkingSpaces - 1);
    
    // Regional multipliers (updated for current market conditions)
    const stateMultipliers: { [key: string]: number } = {
      'CA': 2.8, 'NY': 2.2, 'MA': 2.0, 'WA': 1.9, 'CO': 1.6,
      'FL': 1.4, 'TX': 1.3, 'GA': 1.2, 'NC': 1.1, 'TN': 1.0,
      'AL': 0.85, 'OH': 0.9, 'MI': 0.85, 'IN': 0.8
    };
    
    baseRent *= stateMultipliers[property.state] || 1.0;
    
    return Math.round(baseRent);
  }

  // ULTRA-CONSERVATIVE CASH-ON-CASH ROI FOCUSED INVESTMENT METRICS CALCULATION
  private static calculateInvestmentMetrics(property: PropertyData, monthlyRent: number) {
    console.log(`💰 ENHANCED SERVICE: Calculating ultra-conservative investment metrics for ${property.address}`);
    
    // Fetch monthly mortgage (Principal & Interest) from API data
    const monthlyMortgage = property.mortgagePayment?.total || this.calculateMortgagePayment(property.purchasePrice);
    
    // Fetch property taxes from API data
    const monthlyPropertyTaxes = property.monthlyPropertyTaxes || (property.purchasePrice * this.getTaxRateByState(property.state) / 12);
    
    // Fetch monthly home insurance from API data
    const monthlyInsurance = property.monthlyInsurance || (property.purchasePrice * this.getInsuranceRateByState(property.state) / 12);
    
    // Fetch HOA fees from API data
    const monthlyHOA = property.monthlyHoaFee || 0;
    
    // Calculate total operating costs per your formula:
    // property management = 10% of rent
    const propertyManagement = monthlyRent * 0.10;
    
    // vacancy reserves = 3.5% of rent
    const vacancyReserves = monthlyRent * 0.035;
    
    // maintenance reserve = 8% of rent
    const maintenanceReserve = monthlyRent * 0.08;
    
    // owner paid utilities = 0
    const ownerPaidUtilities = 0;
    
    // Total operating cost = property management + property taxes + insurance + owner paid utilities + vacancy reserves + maintenance reserve
    const totalOperatingCost = propertyManagement + monthlyPropertyTaxes + monthlyInsurance + 
                              ownerPaidUtilities + vacancyReserves + maintenanceReserve + monthlyHOA;
    
    // Monthly net cash flow = Monthly Rent - total operating cost - monthly mortgage
    const monthlyNetCashFlow = monthlyRent - totalOperatingCost - monthlyMortgage;
    
    // Calculate down payment and closing costs
    const downPaymentPercent = 0.25; // 25% down payment
    const downPayment = property.purchasePrice * downPaymentPercent;
    const closingCosts = property.purchasePrice * 0.03; // 3% closing costs
    const totalCashInvested = downPayment + closingCosts;
    
    // 1st year cash on cash (COC) ROI = 100 * Monthly net cash flow / (down payment + closing costs)
    const annualNetCashFlow = monthlyNetCashFlow * 12;
    const cashOnCashReturn = (annualNetCashFlow / totalCashInvested) * 100;
    
    // Calculate Cap Rate for comparison (NOI / Property Value)
    const annualOperatingExpenses = totalOperatingCost * 12;
    const netOperatingIncome = (monthlyRent * 12) - annualOperatingExpenses;
    const capRate = (netOperatingIncome / property.purchasePrice) * 100;
    
    // Investment scoring (1-10 scale) - EXTREME CONSERVATIVE, COC ROI FOCUSED
    // Score is now 90% based on Cash-on-Cash ROI with ultra-strict thresholds
    let score = 1.0; // Ultra low base score

    // --- PRIMARY: CASH-ON-CASH ROI (90% weight, EXTREMELY strict) ---
    // Only exceptional CoC ROI gets high scores
    if (cashOnCashReturn >= 25) {
      score += 1.0; // Still penalize as likely unrealistic
      console.log(`⚠️ Extremely high CoC ROI ${cashOnCashReturn.toFixed(1)}% - likely data error`);
    } else if (cashOnCashReturn >= 18) score += 2.0; // Excellent but rare
    else if (cashOnCashReturn >= 15) score += 1.5; // Very good
    else if (cashOnCashReturn >= 12) score += 1.0; // Good
    else if (cashOnCashReturn >= 10) score += 0.5; // Acceptable
    else if (cashOnCashReturn >= 8) score += 0.2; // Below average
    else if (cashOnCashReturn >= 6) score += 0.1; // Poor
    else if (cashOnCashReturn >= 4) score += 0.0; // Very poor
    else if (cashOnCashReturn >= 2) score -= 0.5; // Terrible
    else score -= 1.0; // Extremely poor

    // --- SECONDARY: CASH FLOW (5% weight, minimal impact) ---
    if (monthlyNetCashFlow > 500) score += 0.2;
    else if (monthlyNetCashFlow > 200) score += 0.1;
    else if (monthlyNetCashFlow < 0) score -= 0.3;

    // --- TERTIARY: CAP RATE (5% weight, minimal impact) ---
    if (capRate > 10) score += 0.1;
    else if (capRate < 4) score -= 0.1;

    // --- Market Reality Checks (MUCH STRICTER) ---
    // Heavy penalties for unrealistic scenarios
    if (property.purchasePrice < 50000 && monthlyRent > 1000) {
      score -= 2.0; // Even stricter penalty
      console.log(`⚠️ Unrealistic rent/price combo: $${monthlyRent}/mo rent on $${property.purchasePrice} price - severe penalty`);
    }
    
    // Penalize if CoC ROI is suspiciously high (likely bad data)
    if (cashOnCashReturn > 25) {
      score -= 1.5;
      console.log(`⚠️ Suspiciously high CoC ROI ${cashOnCashReturn.toFixed(1)}% - data quality penalty`);
    }
    
    // Penalize very low price properties (distressed/not financeable)
    if (property.purchasePrice < 30000) {
      score -= 1.5;
      console.log(`⚠️ Price below $30k - likely not financeable or distressed`);
    }

    // --- Property quality adjustments (minimal impact) ---
    if (property.propertyCondition === 'excellent') score += 0.05;
    else if (property.propertyCondition === 'poor') score -= 0.2;

    if (property.yearBuilt && property.yearBuilt > 2015) score += 0.05;
    else if (property.yearBuilt && property.yearBuilt < 1960) score -= 0.15;

    // --- ULTIMATE HARD CAP: CoC ROI must be strong for ANY good score ---
    if (cashOnCashReturn < 8) {
      score = Math.min(score, 4); // Max score 4 if CoC ROI < 8%
    }
    if (cashOnCashReturn < 6) {
      score = Math.min(score, 3); // Max score 3 if CoC ROI < 6%
    }
    if (cashOnCashReturn < 4) {
      score = Math.min(score, 2); // Max score 2 if CoC ROI < 4%
    }

    // Clamp between 1 and 7 (make Excellent nearly impossible)
    score = Math.max(1, Math.min(7, score));

    let rank: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    // EXTREMELY conservative rankings - CoC ROI focused
    if (score >= 6.5 && cashOnCashReturn >= 15) rank = 'Excellent'; // Requires both high score AND high CoC ROI
    else if (score >= 5.5 && cashOnCashReturn >= 10) rank = 'Good';   // Requires both decent score AND CoC ROI
    else if (score >= 4) rank = 'Fair';                              // Acceptable
    else rank = 'Poor';                                              // Most properties
    
    // Enhanced logging with conservative CoC ROI approach
    console.log(`💰 ENHANCED: ${property.address} - ULTRA-CONSERVATIVE CoC ROI Analysis:`);
    console.log(`📊 Operating Cost Breakdown:`);
    console.log(`   - Property Management: $${propertyManagement.toFixed(0)}/mo (10% of rent)`);
    console.log(`   - Property Taxes: $${monthlyPropertyTaxes.toFixed(0)}/mo`);
    console.log(`   - Insurance: $${monthlyInsurance.toFixed(0)}/mo`);
    console.log(`   - Vacancy Reserves: $${vacancyReserves.toFixed(0)}/mo (3.5% of rent)`);
    console.log(`   - Maintenance Reserve: $${maintenanceReserve.toFixed(0)}/mo (8% of rent)`);
    if (monthlyHOA > 0) console.log(`   - HOA Fees: $${monthlyHOA.toFixed(0)}/mo`);
    console.log(`📈 Total Operating Cost: $${totalOperatingCost.toFixed(0)}/mo`);
    console.log(`🏠 Monthly Mortgage P&I: $${monthlyMortgage.toFixed(0)}/mo`);
    console.log(`💵 Monthly Rent: $${monthlyRent.toFixed(0)}`);
    console.log(`💳 Monthly Net Cash Flow: $${monthlyNetCashFlow.toFixed(0)} (Rent - Operating Cost - Mortgage)`);
    console.log(`🎯 CASH-ON-CASH ROI: ${cashOnCashReturn.toFixed(1)}% ⭐ PRIMARY RANKING FACTOR`);
    console.log(`📊 Cap Rate: ${capRate.toFixed(1)}%`);
    console.log(`🏆 ULTRA-CONSERVATIVE Investment Score: ${score.toFixed(1)}/10 (${rank}) - Extreme Realism`);
    console.log(`💡 Total Cash Invested: $${totalCashInvested.toFixed(0)} (25% down + 3% closing)`);
    
    // Market reality warnings
    if (cashOnCashReturn > 20) {
      console.log(`⚠️ WARNING: ${cashOnCashReturn.toFixed(1)}% CoC ROI is exceptionally high - verify rent estimates are realistic`);
    }
    if (monthlyNetCashFlow > 500) {
      console.log(`⚠️ WARNING: $${monthlyNetCashFlow.toFixed(0)}/mo cash flow is very high - double-check all assumptions`);
    }
    
    return {
      estimatedRent: monthlyRent,
      estimatedCashFlow: Math.round(monthlyNetCashFlow),
      estimatedCOCReturn: Math.round(cashOnCashReturn * 100) / 100,
      estimatedCapRate: Math.round(capRate * 100) / 100,
      investmentScore: Math.round(score * 10) / 10,
      investmentRank: rank,
      quickAnalysis: {
        monthlyRent: Math.round(monthlyRent),
        monthlyExpenses: Math.round(totalOperatingCost),
        monthlyMortgage: Math.round(monthlyMortgage),
        monthlyCashFlow: Math.round(monthlyNetCashFlow),
        totalCashNeeded: Math.round(totalCashInvested)
      }
    };
  }

  private static calculateMortgagePayment(purchasePrice: number): number {
    const downPaymentPercent = 0.25;
    const interestRate = 0.068; // Current market rate
    const loanTermYears = 30;
    
    const loanAmount = purchasePrice * (1 - downPaymentPercent);
    const monthlyRate = interestRate / 12;
    const numPayments = loanTermYears * 12;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  private static sortByInvestmentScore(listings: PropertyListing[]): PropertyListing[] {
    return listings.sort((a, b) => {
      if (b.investmentScore !== a.investmentScore) {
        return b.investmentScore - a.investmentScore;
      }
      return b.estimatedCOCReturn - a.estimatedCOCReturn;
    });
  }

  // Enhanced mock data with 55+ properties matching search location
  private static getEnhancedMockProperties(params: AreaSearchParams): PropertyListing[] {
    console.log(`🎭 Generating enhanced mock properties for ${params.city || 'Unknown'}, ${params.state || 'Unknown'}...`);
    
    // Generate properties across different price ranges and types
    const mockProperties: PropertyData[] = [];
    
    // Dynamic location data based on search parameters
    const cityCoords = this.getCityCoordinates(params.city || '', params.state || '');
    const searchLocation = { 
      city: params.city || 'Unknown City', 
      state: params.state || 'Unknown State', 
      lat: cityCoords?.lat || 37.3541,
      lng: cityCoords?.lng || -121.9552
    };
    
    // Get nearby cities for the search location
    const nearbyCities = this.getNearbyCities(params.city || '', params.state || '');
    
    const propertyTypes: Array<'single-family' | 'townhouse' | 'condo'> = ['single-family', 'townhouse', 'condo'];
    
    // Generate 60+ properties to provide good search results
    for (let i = 0; i < 60; i++) {
      const cityInfo = nearbyCities[i % nearbyCities.length];
      const propertyType = propertyTypes[i % propertyTypes.length];
      
      // Price distribution based on state/region
      let basePrice = this.getRegionalPricing(params.state || 'CA');
      if (i < 15) basePrice = 800000 + Math.random() * 1200000; // High-end: $800K - $2M
      else if (i < 35) basePrice = 600000 + Math.random() * 400000; // Mid-range: $600K - $1M
      else basePrice = 400000 + Math.random() * 300000; // Lower range: $400K - $700K
      
      // Ensure minimum requirements (2+ beds, price range)
      const bedrooms = Math.max(2, Math.floor(Math.random() * 3) + 2); // 2-4 bedrooms
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75) + 1);
      const sqft = 1200 + Math.floor(Math.random() * 1800); // 1200-3000 sqft
      const yearBuilt = 1970 + Math.floor(Math.random() * 54); // 1970-2024
      
      // Calculate realistic rent for Bay Area
      const baseRent = Math.floor(basePrice * 0.004 / 12 * 1000) / 1000; // Roughly 0.4% monthly
      const rent = Math.round(baseRent + (bedrooms - 2) * 500 + (sqft - 1200) * 0.5);
      
      // Add random variation to coordinates within city bounds
      const latVariation = (Math.random() - 0.5) * 0.02;
      const lngVariation = (Math.random() - 0.5) * 0.02;
      
      // Generate location-specific zip codes
      const stateZipPrefixes: { [key: string]: string } = {
        'CA': '95', 'TX': '77', 'FL': '33', 'GA': '30', 'AL': '35',
        'NY': '10', 'WA': '98'
      };
      const zipPrefix = stateZipPrefixes[cityInfo.state] || '95';
      
      mockProperties.push({
        id: `enhanced-mock-${i + 1}`,
        address: `${1000 + i} ${['Main St', 'Oak Ave', 'Pine Dr', 'Cedar Ln', 'Maple Way', 'Elm St'][i % 6]}`,
        city: cityInfo.city,
        state: cityInfo.state,
        zipCode: `${zipPrefix}${String(50 + (i % 50)).padStart(3, '0')}`,
        purchasePrice: Math.round(basePrice),
        marketValue: Math.round(basePrice),
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        squareFootage: sqft,
        yearBuilt: yearBuilt,
        propertyType: propertyType,
        monthlyRent: rent,
        source: 'Enhanced Demo Data',
        latitude: cityInfo.lat + latVariation,
        longitude: cityInfo.lng + lngVariation,
        
        // Add coordinates property for consistency
        coordinates: {
          lat: cityInfo.lat + latVariation,
          lng: cityInfo.lng + lngVariation
        },
        
        // Enhanced property data with location-specific rates
        monthlyHoaFee: propertyType === 'condo' ? Math.round(50 + Math.random() * 400) : 0,
        annualPropertyTaxes: Math.round(basePrice * this.getPropertyTaxRate(cityInfo.state)),
        monthlyPropertyTaxes: Math.round(basePrice * this.getPropertyTaxRate(cityInfo.state) / 12),
        annualInsurance: Math.round(basePrice * this.getInsuranceRate(cityInfo.state)),
        monthlyInsurance: Math.round(basePrice * this.getInsuranceRate(cityInfo.state) / 12),
        mortgagePayment: {
          principal: Math.round(basePrice * 0.75 * 0.006 * 0.4),
          interest: Math.round(basePrice * 0.75 * 0.006 * 0.6),
          total: Math.round(basePrice * 0.75 * 0.006),
          interestRate: 0.068
        },
        
        // Property features with mock images
        images: this.generateMockPropertyImages(i),
        hasGarage: Math.random() > 0.3,
        hasPool: Math.random() > 0.8,
        hasAirConditioning: true,
        propertyCondition: ['excellent', 'good', 'good', 'fair'][Math.floor(Math.random() * 4)] as any,
        daysOnMarket: Math.floor(Math.random() * 60),
        listingUrl: `https://example.com/property/${i + 1}`,
        pricePerSqft: Math.round(basePrice / sqft),
        neighborhoodName: `${cityInfo.city} ${['Downtown', 'Hills', 'Gardens', 'Heights'][i % 4]}`,
        schoolDistrict: `${cityInfo.city} Unified School District`
      });
    }
    
    // Filter based on search parameters
    const filteredProperties = mockProperties.filter(property => {
      if (params.minPrice && property.purchasePrice < params.minPrice) return false;
      if (params.maxPrice && property.purchasePrice > params.maxPrice) return false;
      if (params.minBedrooms && property.bedrooms < params.minBedrooms) return false;
      return true;
    });
    
    console.log(`🏠 Generated ${filteredProperties.length} enhanced mock properties matching search criteria`);
    
    // Calculate investment metrics
    const listings: PropertyListing[] = filteredProperties.map(property => {
      const rentEstimate = { estimatedRent: property.monthlyRent || 3000, confidence: 'high' as const, source: 'Enhanced Mock Data' };
      const investmentMetrics = this.calculateInvestmentMetrics(property, rentEstimate.estimatedRent);
      
      return {
        ...property,
        ...investmentMetrics
      } as PropertyListing;
    });

    return this.sortByInvestmentScore(listings);
  }

  private static generateMockPropertyImages(index: number): string[] {
    // Generate 3-8 realistic property images per property
    const imageCount = 3 + Math.floor(Math.random() * 6);
    const images: string[] = [];
    
    // Use real property-related Unsplash images
    const propertyImageIds = [
      'photo-1564013799919-ab600027ffc6', // Modern house exterior
      'photo-1570129477492-45c003edd2be', // House with lawn
      'photo-1449844908441-8829872d2607', // Modern home exterior
      'photo-1593696954219-9c03a79d5c93', // Contemporary house
      'photo-1558618666-fcd25c85cd64', // House front view
      'photo-1502672260266-1c1ef2d93688', // Real estate exterior
      'photo-1605146769289-440113cc3d00', // House with garden
      'photo-1575517111478-7f6afd0973db'  // Modern residential
    ];
    
    const interiorImageIds = [
      'photo-1586023492125-27b2c045efd7', // Living room
      'photo-1556909114-f6e7ad7d3136', // Kitchen
      'photo-1556909909-f3e08abc8bee', // Bedroom
      'photo-1571508601891-ca5e7a713859', // Bathroom
      'photo-1505691723518-36a5ac3be353', // Dining room
      'photo-1574692330073-d3b19e5bdb50'  // Interior space
    ];
    
    // First image is always exterior
    const exteriorId = propertyImageIds[index % propertyImageIds.length];
    images.push(`https://images.unsplash.com/${exteriorId}?w=800&h=600&fit=crop&auto=format&q=80`);
    
    // Add interior images
    for (let i = 1; i < imageCount; i++) {
      const interiorId = interiorImageIds[(index + i) % interiorImageIds.length];
      images.push(`https://images.unsplash.com/${interiorId}?w=800&h=600&fit=crop&auto=format&q=80`);
    }
    
    return images;
  }
}

// Export the main search function for external use
export const searchPropertiesWithBoundary = (params: AreaSearchParams) => {
  return EnhancedRealEstateAPIService.searchPropertiesWithBoundary(params, params.bounds);
};

// Export the class-based search as well
export const searchProperties = (params: AreaSearchParams) => {
  return EnhancedRealEstateAPIService.searchProperties(params);
};

console.log('✅ Enhanced Real Estate API Service loaded');
