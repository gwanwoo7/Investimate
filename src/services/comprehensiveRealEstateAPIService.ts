import axios from 'axios';
import type { AreaSearchParams, PropertyListing, PropertyData } from '../types/property';

// Enhanced Multi-API Real Estate Service
// Combines multiple high-quality APIs for comprehensive property data
export class ComprehensiveRealEstateAPIService {
  private static readonly RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

  // Main search method - searches across multiple APIs for maximum results
  static async searchPropertiesComprehensive(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Starting comprehensive multi-API property search...');
    console.log('📍 Search params:', params);

    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ No API key configured. Using mock data...');
      return this.getComprehensiveMockProperties(params);
    }

    try {
      // Search multiple APIs in parallel for maximum coverage
      const searchPromises = [
        this.searchZillowEnhanced(params),
        this.searchRealtorAPI(params),
        this.searchRealtyMoleAPI(params),
        this.searchUSRealEstateAPI(params)
      ];

      console.log('🚀 Launching parallel searches across 4 APIs...');
      const results = await Promise.allSettled(searchPromises);
      
      let allProperties: PropertyData[] = [];
      const apiResults = ['Zillow Enhanced', 'Realtor.com', 'Realty Mole', 'US Real Estate'];

      results.forEach((result, index) => {
        const apiName = apiResults[index];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`✅ ${apiName}: Found ${result.value.length} properties`);
          allProperties = allProperties.concat(result.value);
        } else {
          console.log(`❌ ${apiName}: ${result.status === 'rejected' ? result.reason?.message || 'Search failed' : 'No properties found'}`);
        }
      });

      // Remove duplicates and enhance data
      allProperties = this.removeDuplicateProperties(allProperties);
      console.log(`🏠 Total unique properties after deduplication: ${allProperties.length}`);

      // Apply filters
      if (params.bounds) {
        allProperties = this.filterPropertiesByBounds(allProperties, params.bounds);
        console.log(`📍 Properties within boundary: ${allProperties.length}`);
      }

      // Calculate investment metrics and create listings
      const listings = await Promise.all(
        allProperties.map(async (property) => {
          const investmentMetrics = this.calculateInvestmentMetrics(property, property.monthlyRent || 3000);
          return {
            ...property,
            ...investmentMetrics
          } as PropertyListing;
        })
      );

      const sortedListings = this.sortByInvestmentScore(listings);
      console.log(`📊 Returning ${sortedListings.length} analyzed properties`);
      
      return sortedListings;

    } catch (error) {
      console.error('❌ Comprehensive search error:', error);
      return this.getComprehensiveMockProperties(params);
    }
  }

  // Enhanced Zillow API with multiple endpoints
  private static async searchZillowEnhanced(params: AreaSearchParams): Promise<PropertyData[]> {
    const location = `${params.city}, ${params.state}`;
    const allProperties: PropertyData[] = [];

    try {
      // Try multiple Zillow endpoints for more comprehensive results
      const endpoints = [
        {
          url: 'https://zillow-com1.p.rapidapi.com/search',
          config: {
            location: location,
            status_type: 'ForSale',
            home_type: 'Houses',
            minPrice: params.minPrice || 50000,
            maxPrice: params.maxPrice || 20000000,
          }
        },
        {
          url: 'https://zillow-com1.p.rapidapi.com/propertyDetails',
          config: {
            location: location,
            status_type: 'ForSale',
            propertyType: 'SingleFamily,Townhouse,Condo',
          }
        }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint.url, {
            params: endpoint.config,
            headers: {
              'X-RapidAPI-Key': this.RAPID_API_KEY,
              'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
            }
          });

          if (response.data && response.data.results) {
            const properties = this.transformZillowData(response.data.results, params, 'Zillow Enhanced');
            allProperties.push(...properties);
          }
        } catch (endpointError) {
          console.log(`Zillow endpoint failed: ${endpoint.url}`, endpointError);
        }
      }

      return allProperties.slice(0, 50); // Limit to 50 per API
    } catch (error) {
      console.error('Zillow Enhanced search failed:', error);
      return [];
    }
  }

  // Realtor.com API search
  private static async searchRealtorAPI(params: AreaSearchParams): Promise<PropertyData[]> {
    try {
      const config = {
        method: 'GET',
        url: 'https://realtor.p.rapidapi.com/properties/v2/list-for-sale',
        params: {
          city: params.city,
          state_code: params.state,
          limit: 50,
          offset: 0,
          price_min: params.minPrice || 50000,
          price_max: params.maxPrice || 20000000,
          beds_min: params.minBedrooms || 2,
          sort: 'relevance'
        },
        headers: {
          'X-RapidAPI-Key': this.RAPID_API_KEY,
          'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
        }
      };

      console.log('🏡 Searching Realtor.com API...');
      const response = await axios.request(config);

      if (response.data && response.data.properties) {
        return this.transformRealtorData(response.data.properties, params);
      }

      return [];
    } catch (error) {
      console.error('Realtor.com API search failed:', error);
      return [];
    }
  }

  // Realty Mole API search
  private static async searchRealtyMoleAPI(params: AreaSearchParams): Promise<PropertyData[]> {
    try {
      const config = {
        method: 'GET',
        url: 'https://realty-mole-property-api.p.rapidapi.com/properties',
        params: {
          city: params.city,
          state: params.state,
          limit: 50,
          propertyType: 'Single Family,Townhouse,Condo',
          minPrice: params.minPrice || 50000,
          maxPrice: params.maxPrice || 20000000
        },
        headers: {
          'X-RapidAPI-Key': this.RAPID_API_KEY,
          'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
        }
      };

      console.log('🏡 Searching Realty Mole API...');
      const response = await axios.request(config);

      if (response.data && Array.isArray(response.data)) {
        return this.transformRealtyMoleData(response.data, params);
      }

      return [];
    } catch (error) {
      console.error('Realty Mole API search failed:', error);
      return [];
    }
  }

  // US Real Estate API search
  private static async searchUSRealEstateAPI(params: AreaSearchParams): Promise<PropertyData[]> {
    try {
      const config = {
        method: 'GET',
        url: 'https://us-real-estate.p.rapidapi.com/v2/for-sale',
        params: {
          city: params.city,
          state_code: params.state,
          limit: 50,
          price_min: params.minPrice || 50000,
          price_max: params.maxPrice || 20000000,
          beds_min: params.minBedrooms || 2
        },
        headers: {
          'X-RapidAPI-Key': this.RAPID_API_KEY,
          'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
        }
      };

      console.log('🏡 Searching US Real Estate API...');
      const response = await axios.request(config);

      if (response.data && response.data.listings) {
        return this.transformUSRealEstateData(response.data.listings, params);
      }

      return [];
    } catch (error) {
      console.error('US Real Estate API search failed:', error);
      return [];
    }
  }

  // Transform Zillow data to standardized format
  private static transformZillowData(properties: any[], params: AreaSearchParams, source: string): PropertyData[] {
    return properties.slice(0, 25).map((property: any, index: number) => {
      const price = property.price || property.unformattedPrice || 0;
      const address = property.address || `Property ${index + 1}`;
      const coordinates = this.getCoordinates(property, params, index);
      
      return {
        id: `zillow-enhanced-${property.zpid || index}`,
        address: address,
        city: params.city || 'Unknown',
        state: params.state || 'Unknown',
        zipCode: property.zipcode || '00000',
        purchasePrice: price,
        marketValue: property.zestimate || price,
        bedrooms: Math.max(property.bedrooms || 2, 2),
        bathrooms: property.bathrooms || 2,
        squareFootage: property.livingArea || property.sqft || 1500,
        yearBuilt: property.yearBuilt || 2000,
        propertyType: this.standardizePropertyType(property.homeType || 'house'),
        monthlyRent: this.calculateRent(price, params.state || 'CA'),
        source: source,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        coordinates: coordinates,
        
        // Financial data
        monthlyHoaFee: property.monthlyHoaFee || 0,
        annualPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA'),
        monthlyPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA') / 12,
        annualInsurance: price * this.getInsuranceRateByState(params.state || 'CA'),
        monthlyInsurance: price * this.getInsuranceRateByState(params.state || 'CA') / 12,
        
        // Property details
        hasGarage: property.hasGarage || false,
        hasPool: property.hasPool || false,
        hasAirConditioning: true,
        propertyCondition: 'good',
        daysOnMarket: property.daysOnZillow || 0,
        listingUrl: property.detailUrl || `https://zillow.com/property/${property.zpid}`,
        pricePerSqft: price / (property.livingArea || 1500),
        
        // Enhanced photo support
        images: property.photos ? property.photos.slice(0, 15) : [], // Map to PropertyData.images field
        photos: property.photos ? property.photos.slice(0, 15) : [],
        photoCount: property.photos ? Math.min(property.photos.length, 15) : 0
      } as PropertyData;
    });
  }

  // Transform Realtor.com data
  private static transformRealtorData(properties: any[], params: AreaSearchParams): PropertyData[] {
    return properties.slice(0, 30).map((property: any, index: number) => {
      const price = property.price || 0;
      const address = property.address?.line || `Realtor Property ${index + 1}`;
      const coordinates = {
        lat: property.address?.lat || this.getCityCoordinates(params.city || '', params.state || '')?.lat || 37.3541,
        lng: property.address?.lon || this.getCityCoordinates(params.city || '', params.state || '')?.lng || -121.9552
      };
      
      return {
        id: `realtor-${property.property_id || index}`,
        address: address,
        city: property.address?.city || params.city || 'Unknown',
        state: property.address?.state_code || params.state || 'Unknown',
        zipCode: property.address?.postal_code || '00000',
        purchasePrice: price,
        marketValue: price,
        bedrooms: Math.max(property.beds || 2, 2),
        bathrooms: property.baths || 2,
        squareFootage: property.building_size?.size || 1500,
        yearBuilt: property.year_built || 2000,
        propertyType: this.standardizePropertyType(property.prop_type || 'single_family'),
        monthlyRent: this.calculateRent(price, params.state || 'CA'),
        source: 'Realtor.com',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        coordinates: coordinates,
        
        // Financial data
        monthlyHoaFee: property.hoa?.fee || 0,
        annualPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA'),
        monthlyPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA') / 12,
        annualInsurance: price * this.getInsuranceRateByState(params.state || 'CA'),
        monthlyInsurance: price * this.getInsuranceRateByState(params.state || 'CA') / 12,
        
        // Property details
        hasGarage: property.garage || false,
        hasPool: property.pool || false,
        hasAirConditioning: true,
        propertyCondition: 'good',
        daysOnMarket: property.days_on_mls || 0,
        listingUrl: property.rdc_web_url || `https://realtor.com/property/${property.property_id}`,
        pricePerSqft: price / (property.building_size?.size || 1500),
        
        // Enhanced photos from Realtor.com
        images: property.photos ? property.photos.slice(0, 12).map((photo: any) => photo.href) : [], // Map to PropertyData.images field
        photos: property.photos ? property.photos.slice(0, 12).map((photo: any) => photo.href) : [],
        photoCount: property.photos ? Math.min(property.photos.length, 12) : 0
      } as PropertyData;
    });
  }

  // Transform Realty Mole data
  private static transformRealtyMoleData(properties: any[], params: AreaSearchParams): PropertyData[] {
    return properties.slice(0, 25).map((property: any, index: number) => {
      const price = property.price || property.estimatedValue || 0;
      const coordinates = {
        lat: property.latitude || this.getCityCoordinates(params.city || '', params.state || '')?.lat || 37.3541,
        lng: property.longitude || this.getCityCoordinates(params.city || '', params.state || '')?.lng || -121.9552
      };
      
      return {
        id: `realty-mole-${property.id || index}`,
        address: property.formattedAddress || `Realty Mole Property ${index + 1}`,
        city: property.city || params.city || 'Unknown',
        state: property.state || params.state || 'Unknown',
        zipCode: property.zipCode || '00000',
        purchasePrice: price,
        marketValue: property.estimatedValue || price,
        bedrooms: Math.max(property.bedrooms || 2, 2),
        bathrooms: property.bathrooms || 2,
        squareFootage: property.squareFootage || 1500,
        yearBuilt: property.yearBuilt || 2000,
        propertyType: this.standardizePropertyType(property.propertyType || 'Single Family'),
        monthlyRent: property.rentEstimate || this.calculateRent(price, params.state || 'CA'),
        source: 'Realty Mole',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        coordinates: coordinates,
        
        // Financial data
        monthlyHoaFee: 0,
        annualPropertyTaxes: property.taxAssessment || price * this.getTaxRateByState(params.state || 'CA'),
        monthlyPropertyTaxes: (property.taxAssessment || price * this.getTaxRateByState(params.state || 'CA')) / 12,
        annualInsurance: price * this.getInsuranceRateByState(params.state || 'CA'),
        monthlyInsurance: price * this.getInsuranceRateByState(params.state || 'CA') / 12,
        
        // Property details
        hasGarage: false,
        hasPool: false,
        hasAirConditioning: true,
        propertyCondition: 'good',
        daysOnMarket: 0,
        listingUrl: `https://realtymole.com/property/${property.id}`,
        pricePerSqft: price / (property.squareFootage || 1500),
        
        // Photos (if available)
        images: property.photos || [], // Map to PropertyData.images field
        photos: property.photos || [],
        photoCount: property.photos ? property.photos.length : 0
      } as PropertyData;
    });
  }

  // Transform US Real Estate data
  private static transformUSRealEstateData(properties: any[], params: AreaSearchParams): PropertyData[] {
    return properties.slice(0, 20).map((property: any, index: number) => {
      const price = property.list_price || 0;
      const coordinates = {
        lat: property.location?.address?.coordinate?.lat || this.getCityCoordinates(params.city || '', params.state || '')?.lat || 37.3541,
        lng: property.location?.address?.coordinate?.lon || this.getCityCoordinates(params.city || '', params.state || '')?.lng || -121.9552
      };
      
      return {
        id: `us-re-${property.property_id || index}`,
        address: property.location?.address?.line || `US RE Property ${index + 1}`,
        city: property.location?.address?.city || params.city || 'Unknown',
        state: property.location?.address?.state_code || params.state || 'Unknown',
        zipCode: property.location?.address?.postal_code || '00000',
        purchasePrice: price,
        marketValue: price,
        bedrooms: Math.max(property.description?.beds || 2, 2),
        bathrooms: property.description?.baths || 2,
        squareFootage: property.description?.sqft || 1500,
        yearBuilt: property.description?.year_built || 2000,
        propertyType: this.standardizePropertyType(property.description?.type || 'single_family'),
        monthlyRent: this.calculateRent(price, params.state || 'CA'),
        source: 'US Real Estate',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        coordinates: coordinates,
        
        // Financial data
        monthlyHoaFee: 0,
        annualPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA'),
        monthlyPropertyTaxes: price * this.getTaxRateByState(params.state || 'CA') / 12,
        annualInsurance: price * this.getInsuranceRateByState(params.state || 'CA'),
        monthlyInsurance: price * this.getInsuranceRateByState(params.state || 'CA') / 12,
        
        // Property details
        hasGarage: property.description?.garage || false,
        hasPool: false,
        hasAirConditioning: true,
        propertyCondition: 'good',
        daysOnMarket: property.list_date ? Math.floor((Date.now() - new Date(property.list_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        listingUrl: property.rdc_web_url || `https://realtor.com/property/${property.property_id}`,
        pricePerSqft: price / (property.description?.sqft || 1500),
        
        // Enhanced photos
        images: property.photos ? property.photos.slice(0, 10).map((photo: any) => photo.href) : [], // Map to PropertyData.images field
        photos: property.photos ? property.photos.slice(0, 10).map((photo: any) => photo.href) : [],
        photoCount: property.photos ? Math.min(property.photos.length, 10) : 0
      } as PropertyData;
    });
  }

  // Utility methods
  private static standardizePropertyType(type: string): 'single-family' | 'townhouse' | 'condo' | 'multi-family' {
    const typeStr = type.toLowerCase();
    if (typeStr.includes('townhouse') || typeStr.includes('town_home')) return 'townhouse';
    if (typeStr.includes('condo') || typeStr.includes('apartment')) return 'condo';
    if (typeStr.includes('multi') || typeStr.includes('duplex')) return 'multi-family';
    return 'single-family';
  }

  private static getCoordinates(property: any, params: AreaSearchParams, index: number): { lat: number; lng: number } {
    if (property.latitude && property.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }
    
    const baseCoords = this.getCityCoordinates(params.city || '', params.state || '');
    if (baseCoords) {
      // Add small random variation
      const variation = 0.01;
      return {
        lat: baseCoords.lat + (Math.random() - 0.5) * variation,
        lng: baseCoords.lng + (Math.random() - 0.5) * variation
      };
    }
    
    return { lat: 37.3541, lng: -121.9552 };
  }

  private static getCityCoordinates(city: string, state: string): { lat: number; lng: number } | null {
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
      'Santa Clara, CA': { lat: 37.3541, lng: -121.9552 },
      'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
      'Cupertino, CA': { lat: 37.3230, lng: -122.0322 },
      'Sunnyvale, CA': { lat: 37.3688, lng: -122.0363 },
      'Mountain View, CA': { lat: 37.3861, lng: -122.0839 },
      'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
      'Houston, TX': { lat: 29.7604, lng: -95.3698 },
      'Miami, FL': { lat: 25.7617, lng: -80.1918 },
      'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
      'Atlanta, GA': { lat: 33.7490, lng: -84.3880 }
    };
    
    return cityCoords[`${city}, ${state}`] || null;
  }

  private static calculateRent(price: number, state: string): number {
    const stateMultipliers: { [key: string]: number } = {
      'CA': 0.004, 'NY': 0.005, 'FL': 0.006, 'TX': 0.007, 'GA': 0.008, 'AL': 0.01
    };
    const multiplier = stateMultipliers[state] || 0.005;
    return Math.round(price * multiplier);
  }

  private static getTaxRateByState(state: string): number {
    const taxRates: { [key: string]: number } = {
      'CA': 0.0062, 'TX': 0.0183, 'FL': 0.0097, 'NY': 0.0124, 'AL': 0.0041, 'GA': 0.0092
    };
    return taxRates[state] || 0.012;
  }

  private static getInsuranceRateByState(state: string): number {
    const insuranceRates: { [key: string]: number } = {
      'CA': 0.0035, 'TX': 0.0074, 'FL': 0.0108, 'NY': 0.0041, 'AL': 0.0065, 'GA': 0.0054
    };
    return insuranceRates[state] || 0.005;
  }

  private static removeDuplicateProperties(properties: PropertyData[]): PropertyData[] {
    const seen = new Set<string>();
    return properties.filter(property => {
      const key = `${property.address.toLowerCase().trim()}-${property.city.toLowerCase().trim()}-${Math.round(property.purchasePrice / 1000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private static filterPropertiesByBounds(
    properties: PropertyData[], 
    bounds: { north: number; south: number; east: number; west: number }
  ): PropertyData[] {
    return properties.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      return property.latitude <= bounds.north &&
             property.latitude >= bounds.south &&
             property.longitude >= bounds.west &&
             property.longitude <= bounds.east;
    });
  }

  private static calculateInvestmentMetrics(property: PropertyData, monthlyRent: number) {
    const downPaymentPercent = 0.25;
    const interestRate = 0.068;
    const loanTermYears = 30;
    
    const loanAmount = property.purchasePrice * (1 - downPaymentPercent);
    const monthlyRate = interestRate / 12;
    const numPayments = loanTermYears * 12;
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const propertyManagement = monthlyRent * 0.10;
    const monthlyPropertyTaxes = (property.annualPropertyTaxes || property.purchasePrice * this.getTaxRateByState(property.state)) / 12;
    const monthlyInsurance = (property.annualInsurance || property.purchasePrice * this.getInsuranceRateByState(property.state)) / 12;
    const vacancyReserves = monthlyRent * 0.035;
    const maintenanceReserve = monthlyRent * 0.08;
    const monthlyHOA = property.monthlyHoaFee || 0;
    
    const totalOperatingCost = propertyManagement + monthlyPropertyTaxes + monthlyInsurance + 
                              vacancyReserves + maintenanceReserve + monthlyHOA;
    
    const monthlyNetCashFlow = monthlyRent - totalOperatingCost - monthlyMortgage;
    
    const downPayment = property.purchasePrice * downPaymentPercent;
    const closingCosts = property.purchasePrice * 0.03;
    const totalCashInvested = downPayment + closingCosts;
    
    const annualNetCashFlow = monthlyNetCashFlow * 12;
    const cashOnCashReturn = (annualNetCashFlow / totalCashInvested) * 100;
    
    const annualOperatingExpenses = totalOperatingCost * 12;
    const netOperatingIncome = (monthlyRent * 12) - annualOperatingExpenses;
    const capRate = (netOperatingIncome / property.purchasePrice) * 100;
    
    let score = 5;
    if (monthlyNetCashFlow > 500) score += 2;
    else if (monthlyNetCashFlow > 300) score += 1.5;
    else if (monthlyNetCashFlow > 100) score += 1;
    else if (monthlyNetCashFlow < 0) score -= 3;
    
    if (cashOnCashReturn > 15) score += 2;
    else if (cashOnCashReturn > 12) score += 1.5;
    else if (cashOnCashReturn > 8) score += 1;
    else if (cashOnCashReturn < 4) score -= 2;
    
    score = Math.max(1, Math.min(10, score));
    
    let rank: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (score >= 8) rank = 'Excellent';
    else if (score >= 6.5) rank = 'Good';
    else if (score >= 4) rank = 'Fair';
    else rank = 'Poor';
    
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

  private static sortByInvestmentScore(listings: PropertyListing[]): PropertyListing[] {
    return listings.sort((a, b) => {
      if (b.investmentScore !== a.investmentScore) {
        return b.investmentScore - a.investmentScore;
      }
      return b.estimatedCOCReturn - a.estimatedCOCReturn;
    });
  }

  // Comprehensive mock data generator
  private static getComprehensiveMockProperties(params: AreaSearchParams): PropertyListing[] {
    console.log('🎭 Generating comprehensive mock properties for enhanced results...');
    
    const properties: PropertyData[] = [];
    const baseCoords = this.getCityCoordinates(params.city || '', params.state || '') || { lat: 37.3541, lng: -121.9552 };
    
    // Generate 80+ properties for comprehensive results
    for (let i = 0; i < 85; i++) {
      const price = 400000 + Math.random() * 1600000; // $400K - $2M range
      const bedrooms = Math.max(2, Math.floor(Math.random() * 3) + 2); // 2-4 bedrooms
      const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75) + 1);
      const sqft = 1200 + Math.floor(Math.random() * 1800); // 1200-3000 sqft
      const yearBuilt = 1970 + Math.floor(Math.random() * 54); // 1970-2024
      
      properties.push({
        id: `comprehensive-mock-${i + 1}`,
        address: `${1000 + i} ${['Main St', 'Oak Ave', 'Pine Dr', 'Cedar Ln', 'Maple Way', 'Elm St', 'Bay View Dr', 'Park Ave'][i % 8]}`,
        city: params.city || 'Santa Clara',
        state: params.state || 'CA',
        zipCode: `95${String(50 + (i % 50)).padStart(3, '0')}`,
        purchasePrice: Math.round(price),
        marketValue: Math.round(price * 1.05),
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        squareFootage: sqft,
        yearBuilt: yearBuilt,
        propertyType: ['single-family', 'townhouse', 'condo'][i % 3] as any,
        monthlyRent: this.calculateRent(price, params.state || 'CA'),
        source: 'Comprehensive Mock Data',
        latitude: baseCoords.lat + (Math.random() - 0.5) * 0.02,
        longitude: baseCoords.lng + (Math.random() - 0.5) * 0.02,
        coordinates: {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
        },
        
        // Enhanced financial data
        monthlyHoaFee: i % 3 === 2 ? Math.round(50 + Math.random() * 400) : 0, // Condos have HOA
        annualPropertyTaxes: Math.round(price * this.getTaxRateByState(params.state || 'CA')),
        monthlyPropertyTaxes: Math.round(price * this.getTaxRateByState(params.state || 'CA') / 12),
        annualInsurance: Math.round(price * this.getInsuranceRateByState(params.state || 'CA')),
        monthlyInsurance: Math.round(price * this.getInsuranceRateByState(params.state || 'CA') / 12),
        
        // Property features
        hasGarage: Math.random() > 0.3,
        hasPool: Math.random() > 0.8,
        hasAirConditioning: true,
        propertyCondition: ['excellent', 'good', 'good', 'fair'][Math.floor(Math.random() * 4)] as any,
        daysOnMarket: Math.floor(Math.random() * 60),
        listingUrl: `https://example.com/comprehensive-property/${i + 1}`,
        pricePerSqft: Math.round(price / sqft),
        
        // Mock photo data
        photos: Array.from({ length: 8 + Math.floor(Math.random() * 7) }, (_, photoIndex) => 
          `https://images.unsplash.com/photo-${1500000000 + i * 10 + photoIndex}-400x300?auto=format&fit=crop&w=400&h=300`
        ),
        photoCount: 8 + Math.floor(Math.random() * 7)
      } as PropertyData);
    }
    
    // Filter and calculate investment metrics
    const filteredProperties = properties.filter(property => {
      if (params.minPrice && property.purchasePrice < params.minPrice) return false;
      if (params.maxPrice && property.purchasePrice > params.maxPrice) return false;
      if (params.minBedrooms && property.bedrooms < params.minBedrooms) return false;
      return true;
    });
    
    const listings = filteredProperties.map(property => {
      const investmentMetrics = this.calculateInvestmentMetrics(property, property.monthlyRent);
      return { ...property, ...investmentMetrics } as PropertyListing;
    });

    console.log(`🏠 Generated ${listings.length} comprehensive mock properties`);
    return this.sortByInvestmentScore(listings);
  }
}

// Export main search function
export const searchPropertiesComprehensive = (params: AreaSearchParams) => {
  return ComprehensiveRealEstateAPIService.searchPropertiesComprehensive(params);
};

console.log('✅ Comprehensive Real Estate API Service loaded with multi-API support');
