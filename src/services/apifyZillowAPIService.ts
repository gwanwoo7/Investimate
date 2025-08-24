import axios from 'axios';
import type { AreaSearchParams, PropertyListing, PropertyData, RentEstimate } from '../types/property';

// Apify Zillow Scraper API Service - Enhanced property data extraction
export class ApifyZillowAPIService {
  private static readonly APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
  private static readonly ACTOR_ID = 'petr_cermak/zillow-scraper'; // Popular Zillow scraper

  // Main search method using Apify
  static async searchProperties(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Apify Zillow Search called with params:', params);
    
    if (!this.APIFY_API_TOKEN || this.APIFY_API_TOKEN === 'your_apify_token_here') {
      console.log('⚠️ No Apify API token configured. Using fallback data...');
      return this.getMockProperties(params);
    }

    try {
      const properties = await this.fetchFromApifyZillow(params);
      console.log(`✅ Apify Zillow: Found ${properties.length} properties with enhanced data`);
      
      const listings = await Promise.all(
        properties.map(async (property) => {
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
      console.error('❌ Apify Zillow API error:', error);
      // Fallback to mock data on error
      return this.getMockProperties(params);
    }
  }

  // Apify Zillow Scraper Integration
  private static async fetchFromApifyZillow(params: AreaSearchParams): Promise<PropertyData[]> {
    console.log('🔍 Fetching from Apify Zillow Scraper...');
    
    // Validate location parameters
    if (!params.city || !params.state) {
      throw new Error(`Missing required location parameters: city="${params.city}", state="${params.state}"`);
    }

    const location = `${params.city}, ${params.state}`;
    console.log('📍 Searching Apify for location:', location);

    // Apify actor input configuration
    const inputData = {
      // Search configuration
      locations: [location],
      maxItems: params.limit || 50,
      
      // Property filters
      minPrice: params.minPrice || 50000,
      maxPrice: params.maxPrice || 2000000,
      bedrooms: params.minBedrooms ? `${params.minBedrooms}+` : undefined,
      bathrooms: params.minBathrooms ? `${params.minBathrooms}+` : undefined,
      
      // Property types
      propertyTypes: ['houses', 'townhouses', 'condos'],
      
      // Enhanced data extraction
      includePhotos: true,
      includeVirtualTours: true,
      includeDescription: true,
      includePriceHistory: true,
      includeTaxInfo: true,
      includeSchoolInfo: true,
      includeNeighborhoodInfo: true,
      
      // Output options
      outputFormat: 'json',
      
      // Performance settings
      waitForPhotosLoad: true,
      scrollToLoadMorePhotos: true,
      maxPhotosPerProperty: 20
    };

    try {
      // Start Apify actor run
      console.log('🚀 Starting Apify actor run...');
      const runResponse = await axios.post(
        `https://api.apify.com/v2/acts/${this.ACTOR_ID}/runs`,
        inputData,
        {
          headers: {
            'Authorization': `Bearer ${this.APIFY_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          params: {
            token: this.APIFY_API_TOKEN
          }
        }
      );

      const runId = runResponse.data.data.id;
      console.log(`⏳ Actor run started with ID: ${runId}`);

      // Wait for run completion
      const results = await this.waitForRunCompletion(runId);
      
      // Transform Apify results to PropertyData format
      return this.transformApifyProperties(results, params);
      
    } catch (error: any) {
      console.error('❌ Apify API error:', error);
      throw new Error(`Apify API error: ${error.message}`);
    }
  }

  // Wait for Apify run to complete
  private static async waitForRunCompletion(runId: string, maxWaitTime = 300000): Promise<any[]> {
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check run status
        const statusResponse = await axios.get(
          `https://api.apify.com/v2/acts/${this.ACTOR_ID}/runs/${runId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.APIFY_API_TOKEN}`
            }
          }
        );

        const status = statusResponse.data.data.status;
        console.log(`📊 Run status: ${status}`);

        if (status === 'SUCCEEDED') {
          // Fetch results
          const resultsResponse = await axios.get(
            `https://api.apify.com/v2/acts/${this.ACTOR_ID}/runs/${runId}/dataset/items`,
            {
              headers: {
                'Authorization': `Bearer ${this.APIFY_API_TOKEN}`
              }
            }
          );

          console.log(`✅ Apify run completed successfully with ${resultsResponse.data.length} items`);
          return resultsResponse.data;
        } else if (status === 'FAILED') {
          throw new Error('Apify run failed');
        } else if (status === 'ABORTED') {
          throw new Error('Apify run was aborted');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        
      } catch (error) {
        console.error('❌ Error checking run status:', error);
        throw error;
      }
    }

    throw new Error('Apify run timeout - exceeded maximum wait time');
  }

  // Transform Apify properties to PropertyData format
  private static transformApifyProperties(apifyData: any[], params: AreaSearchParams): PropertyData[] {
    console.log(`🏠 Processing ${apifyData.length} properties from Apify...`);
    
    if (!Array.isArray(apifyData) || apifyData.length === 0) {
      console.log('No properties found in Apify response');
      return [];
    }

    return apifyData.map((property: any, index: number) => {
      const price = property.price || property.listPrice || 0;
      
      // Enhanced address parsing from Apify
      const address = property.address?.street || property.streetAddress || `Property ${index + 1}`;
      const city = property.address?.city || property.city || params.city || 'Unknown';
      const state = property.address?.state || property.state || params.state || 'Unknown';
      const zipCode = property.address?.zip || property.zipCode || '00000';
      
      // Apify provides rich rent estimates
      const estimatedRent = property.rentEstimate || 
                           property.monthlyRent || 
                           property.rentZestimate || 
                           Math.round(price * 0.01 / 12);
      
      // Extract comprehensive photo data from Apify
      const propertyImages = this.extractApifyImages(property);
      console.log(`📸 Extracted ${propertyImages.length} images for ${address}`);
      
      // Enhanced financial data from Apify
      const taxData = property.taxInfo || property.propertyTax || {};
      const annualPropertyTaxes = taxData.annualAmount || 
                                 taxData.yearlyTax || 
                                 property.annualPropertyTaxes ||
                                 (price * 0.015);
      
      const monthlyPropertyTaxes = taxData.monthlyAmount || (annualPropertyTaxes / 12);
      
      // Insurance data from Apify
      const insuranceData = property.insurance || {};
      const annualInsurance = insuranceData.annualAmount || 
                             property.homeInsurance ||
                             (price * 0.006);
      const monthlyInsurance = insuranceData.monthlyAmount || (annualInsurance / 12);
      
      // HOA fees from Apify
      const monthlyHOA = property.hoaFee || 
                        property.monthlyHoaFee || 
                        0;

      return {
        id: `apify-${property.zpid || property.id || index}`,
        address,
        city,
        state,
        zipCode,
        purchasePrice: price,
        marketValue: property.marketValue || price,
        bedrooms: property.bedrooms || property.beds || 3,
        bathrooms: property.bathrooms || property.baths || 2,
        squareFootage: property.squareFootage || property.livingArea || property.sqft || 1500,
        yearBuilt: property.yearBuilt || property.builtYear || 2000,
        propertyType: this.getPropertyType(property.propertyType || property.homeType),
        monthlyRent: estimatedRent,
        source: 'Apify Zillow Scraper',
        latitude: property.latitude || property.lat,
        longitude: property.longitude || property.lng,
        
        // Enhanced image data from Apify
        images: propertyImages,
        
        // Comprehensive financial data
        monthlyHoaFee: monthlyHOA,
        annualPropertyTaxes: annualPropertyTaxes,
        monthlyPropertyTaxes: monthlyPropertyTaxes,
        annualInsurance: annualInsurance,
        monthlyInsurance: monthlyInsurance,
        
        // Additional Apify-specific data
        zestimate: property.zestimate || price,
        rentZestimate: property.rentZestimate,
        priceHistory: property.priceHistory || [],
        description: property.description || '',
        virtualTourUrl: property.virtualTour || property.walkthrough,
        
        // Property details from Apify
        lotSize: property.lotSize || property.lotSqft,
        parkingSpaces: property.parking?.spaces || property.parkingSpaces,
        hasGarage: property.hasGarage || property.parking?.hasGarage || false,
        hasPool: property.hasPool || false,
        hasAirConditioning: property.hasAirConditioning !== false, // Default true
        heating: property.heating || 'central',
        yearRenovated: property.yearRenovated,
        propertyCondition: property.condition || 'good',
        
        // School and neighborhood info from Apify
        schoolDistrict: property.schoolDistrict,
        schoolRating: property.schoolRating,
        walkScore: property.walkScore,
        crimeRating: property.crimeRating,
        
        // Market data
        daysOnMarket: property.daysOnMarket || property.dom,
        listingDate: property.listingDate || property.datePosted,
        lastSoldDate: property.lastSoldDate,
        lastSoldPrice: property.lastSoldPrice
      } as PropertyData;
    });
  }

  // Extract images from Apify property data
  private static extractApifyImages(property: any): string[] {
    const images: string[] = [];
    
    try {
      // Apify typically provides photos in various formats
      const photoSources = [
        property.photos,           // Main photos array
        property.images,           // Alternative images array
        property.gallery,          // Gallery array
        property.media?.photos,    // Media photos
        property.pictures,         // Pictures array
        [property.mainPhoto]       // Single main photo
      ].filter(Boolean);

      photoSources.forEach(source => {
        if (Array.isArray(source)) {
          source.forEach(photo => {
            const imageUrl = this.extractImageUrl(photo);
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
            }
          });
        }
      });

      // Also check for thumbnail arrays
      if (property.thumbnails && Array.isArray(property.thumbnails)) {
        property.thumbnails.forEach((thumb: any) => {
          const fullSizeUrl = thumb.fullSize || thumb.large || thumb.url;
          if (fullSizeUrl && !images.includes(fullSizeUrl)) {
            images.push(fullSizeUrl);
          }
        });
      }

      console.log(`📸 Apify extracted ${images.length} images`);
      return images.slice(0, 15); // Limit to 15 images
      
    } catch (error) {
      console.error('❌ Error extracting Apify images:', error);
      return [];
    }
  }

  // Extract image URL from various formats
  private static extractImageUrl(item: any): string | null {
    if (typeof item === 'string' && this.isValidImageUrl(item)) {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      // Try different URL fields
      const urlFields = ['url', 'src', 'href', 'fullSize', 'large', 'medium', 'high', 'original'];
      
      for (const field of urlFields) {
        if (item[field] && typeof item[field] === 'string' && this.isValidImageUrl(item[field])) {
          return item[field];
        }
      }
    }
    
    return null;
  }

  // Validate image URL
  private static isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url) || 
             url.includes('zillow') || 
             url.includes('photos');
    } catch {
      return false;
    }
  }

  // Convert property type to standard format
  private static getPropertyType(type: string): 'single-family' | 'townhouse' | 'condo' | 'multi-family' {
    if (!type) return 'single-family';
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('townhouse') || lowerType.includes('townhome')) return 'townhouse';
    if (lowerType.includes('condo') || lowerType.includes('condominium')) return 'condo';
    if (lowerType.includes('multi') || lowerType.includes('duplex')) return 'multi-family';
    return 'single-family';
  }

  // Calculate rent estimate
  private static async getRentEstimate(property: PropertyData): Promise<RentEstimate> {
    if (property.monthlyRent && property.monthlyRent > 0) {
      return {
        estimatedRent: property.monthlyRent,
        confidence: 'high' as const,
        source: 'Apify Data'
      };
    }

    const baseRent = this.calculateBaseRent(property);
    return {
      estimatedRent: baseRent,
      confidence: 'medium' as const,
      source: 'Calculated'
    };
  }

  // Calculate base rent using property characteristics
  private static calculateBaseRent(property: PropertyData): number {
    let baseRent = 800;
    baseRent += property.bedrooms * 250;
    baseRent += property.bathrooms * 150;
    baseRent += (property.squareFootage / 1000) * 300;
    
    const stateMultipliers: { [key: string]: number } = {
      'CA': 1.8, 'NY': 1.7, 'MA': 1.5, 'CT': 1.3, 'FL': 1.0,
      'TX': 1.1, 'CO': 1.3, 'WA': 1.4, 'OR': 1.2
    };
    
    baseRent *= stateMultipliers[property.state] || 1.0;
    return Math.round(baseRent);
  }

  // Calculate investment metrics
  // REASONABLE CASH-ON-CASH ROI FOCUSED INVESTMENT METRICS CALCULATION
  private static calculateInvestmentMetrics(property: PropertyData, monthlyRent: number) {
    console.log(`💰 APIFY SERVICE: Calculating reasonable investment metrics for ${property.address}`);
    
    const monthlyMortgage = this.calculateMortgagePayment(property.purchasePrice);
    const monthlyPropertyTaxes = property.monthlyPropertyTaxes || (property.purchasePrice * 0.015 / 12);
    const monthlyInsurance = property.monthlyInsurance || (property.purchasePrice * 0.006 / 12);
    const monthlyHOA = property.monthlyHoaFee || 0;
    
    const propertyManagement = monthlyRent * 0.10;
    const vacancyReserves = monthlyRent * 0.035;
    const maintenanceReserve = monthlyRent * 0.08;
    const ownerPaidUtilities = 0;
    
    const totalOperatingCost = propertyManagement + monthlyPropertyTaxes + monthlyInsurance + 
                              ownerPaidUtilities + vacancyReserves + maintenanceReserve + monthlyHOA;
    
    const monthlyNetCashFlow = monthlyRent - totalOperatingCost - monthlyMortgage;
    
    const downPaymentPercent = 0.25;
    const downPayment = property.purchasePrice * downPaymentPercent;
    const closingCosts = property.purchasePrice * 0.03;
    const totalCashInvested = downPayment + closingCosts;
    
    const annualNetCashFlow = monthlyNetCashFlow * 12;
    const cashOnCashReturn = (annualNetCashFlow / totalCashInvested) * 100;
    
    const annualOperatingExpenses = totalOperatingCost * 12;
    const netOperatingIncome = (monthlyRent * 12) - annualOperatingExpenses;
    const capRate = (netOperatingIncome / property.purchasePrice) * 100;
    
    // Investment scoring (1-10 scale) - COC ROI FOCUSED with REASONABLE thresholds
    let score = 3.0; // Reasonable base score for neutral properties

    // --- PRIMARY: CASH-ON-CASH ROI (80% weight, practical thresholds) ---
    if (cashOnCashReturn >= 20) score += 4.0; // Exceptional
    else if (cashOnCashReturn >= 15) score += 3.5; // Outstanding
    else if (cashOnCashReturn >= 12) score += 3.0; // Excellent potential (as requested)
    else if (cashOnCashReturn >= 10) score += 2.5; // Very good
    else if (cashOnCashReturn >= 8) score += 2.0; // Good
    else if (cashOnCashReturn >= 6) score += 1.0; // Acceptable
    else if (cashOnCashReturn >= 4) score += 0.5; // Below average
    else if (cashOnCashReturn >= 2) score += 0.0; // Poor
    else if (cashOnCashReturn >= 0) score -= 1.0; // Very poor but breakeven
    else score -= 2.0; // Negative cash flow

    // --- SECONDARY: CASH FLOW (15% weight) ---
    if (monthlyNetCashFlow > 500) score += 0.8;
    else if (monthlyNetCashFlow > 300) score += 0.5;
    else if (monthlyNetCashFlow > 100) score += 0.2;
    else if (monthlyNetCashFlow < -200) score -= 0.8;
    else if (monthlyNetCashFlow < 0) score -= 0.4;

    // --- TERTIARY: CAP RATE (5% weight) ---
    if (capRate > 12) score += 0.3;
    else if (capRate > 8) score += 0.2;
    else if (capRate < 4) score -= 0.2;

    // Clamp between 1 and 10
    score = Math.max(1, Math.min(10, score));

    let rank: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (score >= 8.5 || cashOnCashReturn >= 12) rank = 'Excellent'; // 12%+ CoC ROI = Excellent
    else if (score >= 6.5 || cashOnCashReturn >= 8) rank = 'Good';   // 8%+ CoC ROI = Good
    else if (score >= 4.5 || cashOnCashReturn >= 4) rank = 'Fair';   // 4%+ CoC ROI = Fair
    else rank = 'Poor';                                              // Below 4% CoC ROI = Poor
    
    console.log(`💰 APIFY: ${property.address} - Cash-on-Cash ROI: ${cashOnCashReturn.toFixed(1)}% ⭐`);
    console.log(`🏆 Investment Score: ${score.toFixed(1)}/10 (${rank}) - 12%+ CoC ROI = Excellent`);
    
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

  // Calculate mortgage payment
  private static calculateMortgagePayment(purchasePrice: number): number {
    const downPaymentPercent = 0.25;
    const interestRate = 0.065;
    const loanTermYears = 30;
    
    const loanAmount = purchasePrice * (1 - downPaymentPercent);
    const monthlyRate = interestRate / 12;
    const numPayments = loanTermYears * 12;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Sort properties by investment score
  private static sortByInvestmentScore(listings: PropertyListing[]): PropertyListing[] {
    return listings.sort((a, b) => {
      if (b.investmentScore !== a.investmentScore) {
        return b.investmentScore - a.investmentScore;
      }
      return b.estimatedCOCReturn - a.estimatedCOCReturn;
    });
  }

  // Fallback mock data
  private static getMockProperties(params: AreaSearchParams): PropertyListing[] {
    console.log('🎭 Using mock data for Apify service...');
    
    const mockProperties: PropertyData[] = [
      {
        id: 'apify-mock-1',
        address: '123 Enhanced St',
        city: params.city || 'Los Angeles',
        state: params.state || 'CA',
        zipCode: '90210',
        purchasePrice: 750000,
        marketValue: 750000,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1800,
        yearBuilt: 2010,
        propertyType: 'single-family',
        monthlyRent: 4200,
        source: 'Apify Demo',
        latitude: 34.0522,
        longitude: -118.2437,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 11250,
        monthlyPropertyTaxes: 937,
        annualInsurance: 4500,
        monthlyInsurance: 375,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format&q=80',
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format&q=80'
        ]
      }
    ];

    const listings: PropertyListing[] = mockProperties.map(property => {
      const rentEstimate = { estimatedRent: property.monthlyRent || 1000, confidence: 'high' as const, source: 'Mock Data' };
      const investmentMetrics = this.calculateInvestmentMetrics(property, rentEstimate.estimatedRent);
      
      return {
        ...property,
        ...investmentMetrics
      } as PropertyListing;
    });

    return this.sortByInvestmentScore(listings);
  }
}
