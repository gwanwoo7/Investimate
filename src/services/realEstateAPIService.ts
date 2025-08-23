import axios from 'axios';
import type { AreaSearchParams, PropertyListing, PropertyData, RentEstimate } from '../types/property';

// Real Estate API Service with Live Data Integration
export class RealEstateAPIService {
  private static readonly RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;

  // Main search method that components call
  static async searchProperties(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Main search method called with params:', params);
    // Use Zillow as primary source since Redfin backup is disabled
    return this.searchPropertiesFromZillow(params);
  }

  static async searchRentalProperties(params: AreaSearchParams): Promise<PropertyListing[]> {
    // NOTE: Temporarily using searchPropertiesFromZillow instead as Redfin backup is disabled
    return this.searchPropertiesFromZillow(params);
    /*
    try {
      const properties = await this.fetchFromRedfin(params);
      
      // Add investment analysis to each property
      const listings = await Promise.all(
        properties.map(async (property) => {
          const rentEstimate = await this.getRentEstimate(property);
          const investmentMetrics = this.calculateInvestmentMetrics(property, rentEstimate.estimatedRent);
          
          return {
            ...property,
            ...investmentMetrics,
            monthlyRent: rentEstimate.estimatedRent
          } as PropertyListing;
        })
      );
      
      return this.sortByInvestmentScore(listings);
    } catch (error) {
      console.error('Error searching rental properties:', error);
      throw error;
    }
    */
  }

  // Add method to remove duplicate properties
  private static _removeDuplicateProperties(properties: PropertyData[]): PropertyData[] {
    const seen = new Set<string>();
    return properties.filter(property => {
      const key = `${property.address.toLowerCase()}-${property.city.toLowerCase()}-${property.state.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // SEPARATE API METHODS FOR INDIVIDUAL TESTING
  static async searchPropertiesFromRedfin(params: AreaSearchParams): Promise<PropertyListing[]> {
    // NOTE: Temporarily disabled as Redfin API is hardcoded to New Haven region
    // Using Zillow instead until region mapping is implemented
    console.log('⚠️ Redfin search disabled, redirecting to Zillow...');
    return this.searchPropertiesFromZillow(params);
    
    /*
    console.log('🔍 Searching Redfin properties only...');
    
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ No API key configured.');
      return [];
    }

    try {
      const properties = await this.fetchFromRedfin(params);
      console.log(`✅ Redfin API: Found ${properties.length} properties`);
      
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
      console.error('❌ Redfin API error:', error);
      throw error;
    }
    */
  }

  static async searchPropertiesFromZillow(params: AreaSearchParams): Promise<PropertyListing[]> {
    console.log('🔍 Searching Zillow properties only...');
    
    if (!this.RAPID_API_KEY || this.RAPID_API_KEY === 'your-rapid-api-key-here') {
      console.log('⚠️ No API key configured. Using enhanced demo data with realistic property photos...');
      console.log('💡 To see real Zillow photos, configure VITE_RAPID_API_KEY in your .env file');
      console.log('📸 Current demo mode shows professional real estate stock photos for each property');
      return this.getMockProperties(params);
    }

    try {
      const properties = await this.fetchFromZillow(params);
      console.log(`✅ Zillow API: Found ${properties.length} properties`);
      
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
      console.error('❌ Zillow API error:', error);
      throw error;
    }
  }

  // ZILLOW API INTEGRATION - Primary data source for property listings
  private static async fetchFromZillow(params: AreaSearchParams): Promise<PropertyData[]> {
    console.log('🔍 Searching Zillow for:', params.city, params.state);
    
    // Validate that we have required location parameters
    if (!params.city || !params.state) {
      throw new Error(`Missing required location parameters: city="${params.city}", state="${params.state}"`);
    }
    
    const location = `${params.city}, ${params.state}`;
    console.log('📍 Final location string:', location);
    
    const config = {
      method: 'GET',
      url: 'https://zillow-com1.p.rapidapi.com/propertyExtendedSearch',
      params: {
        location: location,
        status_type: 'ForSale',
        home_type: 'Houses',
        minPrice: params.minPrice?.toString() || '50000',
        maxPrice: params.maxPrice?.toString() || '500000'
      },
      headers: {
        'X-RapidAPI-Key': this.RAPID_API_KEY,
        'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
      }
    };

    const response = await axios.request(config);
    
    // Check for subscription error
    if (response.status === 403 || (response.data?.message && response.data.message.includes('subscribed'))) {
      throw new Error('You are not subscribed to this API');
    }
    
    if (!response.data) {
      throw new Error('No data found');
    }

    // Transform the property listings
    return this.transformZillowProperties(response.data, params);
  }

  // REDFIN API INTEGRATION - Updated with working endpoint
  // NOTE: Temporarily disabled - Redfin API is hardcoded to New Haven region
  // This method needs region mapping implementation before re-enabling
  /*
  private static async fetchFromRedfin(params: AreaSearchParams): Promise<PropertyData[]> {
    const config = {
      method: 'GET',
      url: 'https://redfin-com-data.p.rapidapi.com/properties/search-rent',
      params: {
        regionId: '6_13410' // This can be made dynamic based on location
      },
      headers: {
        'X-RapidAPI-Key': this.RAPID_API_KEY,
        'X-RapidAPI-Host': 'redfin-com-data.p.rapidapi.com'
      }
    };

    const response = await axios.request(config);
    
    // Check for subscription error
    if (response.status === 403 || (response.data?.message && response.data.message.includes('subscribed'))) {
      throw new Error('You are not subscribed to this API');
    }
    
    if (!response.data?.data || !Array.isArray(response.data.data)) {
      throw new Error('No data found in API response');
    }

    return response.data.data.slice(0, 15).map(this.transformRedfinProperty);
  }
  */

  // Transform Zillow property listings into PropertyData format
  private static transformZillowProperties(zillowData: any, params: AreaSearchParams): PropertyData[] {
    console.log('🏠 Zillow API Full Response Structure:', Object.keys(zillowData || {}));
    
    // Log a sample property with all its fields to understand the structure
    if (zillowData?.props?.[0]) {
      console.log('🏠 Sample property keys:', Object.keys(zillowData.props[0]));
      console.log('🏠 Sample property data (first 3 fields):', {
        zpid: zillowData.props[0].zpid,
        address: zillowData.props[0].address,
        price: zillowData.props[0].price,
        imgSrc: zillowData.props[0].imgSrc,
        photos: zillowData.props[0].photos,
        images: zillowData.props[0].images
      });
    }
    
    if (!zillowData || !zillowData.props || !Array.isArray(zillowData.props)) {
      console.log('No properties found in Zillow response, structure:', Object.keys(zillowData || {}));
      return [];
    }
    
    console.log(`📊 Processing ${zillowData.props.length} properties from Zillow API...`);
    
    return zillowData.props.slice(0, params.limit || 50).map((property: any, index: number) => {
      const price = property.price || property.unformattedPrice || 0;
      
      // Parse full address from Zillow
      const fullAddress = property.address || '';
      const addressParts = fullAddress.split(', ');
      const address = addressParts[0] || `Property ${index + 1}`;
      const city = addressParts[1] || params.city || 'Unknown';
      const stateZip = addressParts[2] || '';
      const state = stateZip.split(' ')[0] || params.state || 'Unknown';
      const zipCode = stateZip.split(' ')[1] || '00000';
      
      // Use Zillow's rentZestimate if available, otherwise calculate using 1% rule
      const estimatedRent = property.rentZestimate || Math.round(price * 0.01 / 12);
      
      // Extract property images from Zillow API - Enhanced extraction with detailed logging
      console.log(`📸 Processing images for property ${index + 1}:`, {
        address,
        zpid: property.zpid,
        availableFields: Object.keys(property).filter(key => 
          key.toLowerCase().includes('img') || 
          key.toLowerCase().includes('photo') || 
          key.toLowerCase().includes('image') ||
          key.toLowerCase().includes('pic')
        )
      });
      
      const propertyImages = this.extractPropertyImages(property);
      console.log(`📸 RESULT: Found ${propertyImages.length} images for ${address}:`, propertyImages.length > 0 ? propertyImages.slice(0, 2) : 'No images extracted');
      
      // Extract tax and insurance data from Zillow API - Enhanced extraction
      console.log(`🔍 Extracting financial data for ${address}:`, {
        propertyTaxes: property.propertyTaxes,
        annualTaxes: property.annualTaxes,
        monthlyTaxes: property.monthlyTaxes,
        insurance: property.insurance,
        homeInsurance: property.homeInsurance,
        monthlyInsurance: property.monthlyInsurance,
        monthlyHoaFee: property.monthlyHoaFee,
        hoaFee: property.hoaFee,
        mortgagePayment: property.mortgagePayment,
        monthlyMortgage: property.monthlyMortgage,
        principalAndInterest: property.principalAndInterest,
        interestRate: property.interestRate,
        mortgageRate: property.mortgageRate,
        currentRate: property.currentRate,
        loanRate: property.loanRate
      });

      // Property taxes - try multiple Zillow fields
      const annualPropertyTaxes = property.propertyTaxes || 
                                  property.annualTaxes || 
                                  property.taxAssessment || 
                                  (price * 0.015); // 1.5% fallback
      const monthlyPropertyTaxes = property.monthlyTaxes || (annualPropertyTaxes / 12);
      
      // Insurance - try multiple Zillow fields
      const annualInsurance = property.insurance || 
                             property.homeInsurance || 
                             property.propertyInsurance || 
                             (price * 0.006); // 0.6% fallback
      const monthlyInsurance = property.monthlyInsurance || (annualInsurance / 12);
      
      // HOA fees - try multiple Zillow fields
      const monthlyHOA = property.monthlyHoaFee || 
                        property.hoaFee || 
                        property.monthlyHoa || 
                        0;
      
      // Mortgage calculation - Enhanced with Zillow interest rate data
      let monthlyMortgagePayment, monthlyPrincipal, monthlyInterest, actualInterestRate;
      
      // Try to get interest rate from Zillow API first
      const zillowInterestRate = property.interestRate || 
                                property.mortgageRate || 
                                property.currentRate || 
                                property.loanRate ||
                                property.rate;
      
      // Use Zillow rate or current market rate fallback
      actualInterestRate = zillowInterestRate || 0.065; // 6.5% fallback
      
      if (property.mortgagePayment || property.monthlyMortgage || property.principalAndInterest) {
        // Use Zillow mortgage data if available
        monthlyMortgagePayment = property.mortgagePayment || 
                                property.monthlyMortgage || 
                                property.principalAndInterest;
        
        // If we have the total, estimate P&I breakdown using the actual rate
        const loanAmount = price * 0.75; // Assume 25% down
        monthlyInterest = (loanAmount * actualInterestRate) / 12;
        monthlyPrincipal = monthlyMortgagePayment - monthlyInterest;
        
        console.log(`💰 Using Zillow mortgage data: $${monthlyMortgagePayment}/mo with ${zillowInterestRate ? 'Zillow' : 'market'} rate: ${(actualInterestRate * 100).toFixed(2)}%`);
      } else {
        // Calculate mortgage payment using Zillow interest rate or market rate
        const downPaymentPercent = 0.25; // 25% down
        const loanAmount = price * (1 - downPaymentPercent);
        const monthlyRate = actualInterestRate / 12;
        const numPayments = 30 * 12; // 30 years
        monthlyMortgagePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        // Calculate principal and interest breakdown (approximate for first payment)
        monthlyInterest = loanAmount * monthlyRate;
        monthlyPrincipal = monthlyMortgagePayment - monthlyInterest;
        
        console.log(`🔢 Calculated mortgage payment: $${monthlyMortgagePayment}/mo using ${zillowInterestRate ? 'Zillow API' : 'market'} rate: ${(actualInterestRate * 100).toFixed(2)}%`);
      }
      
      console.log(`🏠 ${address}: Price=$${price.toLocaleString()}, Taxes=$${monthlyPropertyTaxes.toFixed(0)}/mo, Insurance=$${monthlyInsurance.toFixed(0)}/mo, P&I=$${monthlyMortgagePayment.toFixed(0)}/mo`);
      
      return {
        id: `zillow-${property.zpid || index}`,
        address,
        city,
        state,
        zipCode,
        purchasePrice: price,
        marketValue: price,
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        squareFootage: property.livingArea || 1500,
        yearBuilt: property.yearBuilt || 2000,
        propertyType: 'single-family',
        monthlyRent: estimatedRent,
        source: 'Zillow',
        latitude: property.latitude,
        longitude: property.longitude,
        
        // Property images from Zillow API
        images: propertyImages,
        
        // Enhanced financial data
        monthlyHoaFee: monthlyHOA,
        annualPropertyTaxes: annualPropertyTaxes,
        monthlyPropertyTaxes: monthlyPropertyTaxes,
        annualInsurance: annualInsurance,
        monthlyInsurance: monthlyInsurance,
        mortgagePayment: {
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          total: monthlyMortgagePayment,
          interestRate: actualInterestRate
        },
        
        // Interest rate data
        interestRate: zillowInterestRate || actualInterestRate,
        
        // Additional Zillow data
        zestimate: property.zestimate || price,
        rentZestimate: property.rentZestimate,
        taxAssessedValue: property.taxAssessedValue,
        taxYear: property.taxYear,
        lotSize: property.lotSize,
        parkingSpaces: property.parkingSpaces,
        hasGarage: property.hasGarage || false,
        hasPool: property.hasPool || false,
        hasAirConditioning: property.hasAirConditioning || true,
        heating: property.heating || 'central',
        yearRenovated: property.yearRenovated,
        propertyCondition: property.propertyCondition || 'good'
      } as PropertyData;
    });
  }

  // Transform Redfin rental data into property listings
  // NOTE: Temporarily disabled as Redfin API is disabled
  /*
  private static transformRedfinProperty(redfinItem: any): PropertyData {
    const homeData = redfinItem.homeData;
    const rentalData = redfinItem.rentalExtension;
    
    // Extract address components
    const addressInfo = homeData.addressInfo;
    const address = addressInfo.formattedStreetLine || 'Address not available';
    const city = addressInfo.city || 'Unknown';
    const state = addressInfo.state || 'Unknown';
    const zipCode = addressInfo.zip || '00000';
    
    // Extract coordinates
    const lat = addressInfo.centroid?.centroid?.latitude || 0;
    const lng = addressInfo.centroid?.centroid?.longitude || 0;
    
    // Calculate purchase price from rent (rough estimate for investment properties)
    const avgRent = rentalData.rentPriceRange ? 
      (rentalData.rentPriceRange.min + rentalData.rentPriceRange.max) / 2 : 
      (rentalData.rentPrice || 1500);
    
    // Estimate purchase price using typical gross rent multiplier of 12-15x annual rent
    const estimatedPurchasePrice = Math.round(avgRent * 12 * (13 + Math.random() * 2));
    
    return {
      id: homeData.propertyId || `redfin-${Math.random().toString(36).substr(2, 9)}`,
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      purchasePrice: estimatedPurchasePrice,
      marketValue: estimatedPurchasePrice,
      bedrooms: homeData.beds || 3,
      bathrooms: homeData.baths || 2,
      squareFootage: homeData.sqFt || Math.round(1200 + Math.random() * 1500),
      propertyType: 'single-family',
      yearBuilt: homeData.yearBuilt || Math.floor(Math.random() * 40) + 1985,
      daysOnMarket: Math.floor(Math.random() * 60),
      coordinates: {
        lat: lat,
        lng: lng
      },
      listingUrl: homeData.url || `https://redfin.com/property/${homeData.propertyId}`,
      monthlyRent: avgRent,
      grossRentMultiplier: Math.round((estimatedPurchasePrice / (avgRent * 12)) * 100) / 100,
      description: `${homeData.beds || 3} bed, ${homeData.baths || 2} bath property in ${city}`
    };
  }
  */

  private static async getRentEstimate(property: PropertyData): Promise<RentEstimate> {
    // If we already have monthly rent from the API, use it
    if (property.monthlyRent) {
      return {
        estimatedRent: property.monthlyRent,
        confidence: 'high' as const,
        source: 'API Data'
      };
    }

    // Otherwise calculate based on property characteristics
    const baseRent = this.calculateBaseRent(property);
    
    return {
      estimatedRent: baseRent,
      confidence: 'medium' as const,
      source: 'Estimated'
    };
  }

  private static calculateBaseRent(property: PropertyData): number {
    // Base rent calculation (industry standards)
    let baseRent = 800; // Starting base
    
    // Add for bedrooms
    baseRent += property.bedrooms * 250;
    
    // Add for bathrooms
    baseRent += property.bathrooms * 150;
    
    // Add for square footage
    baseRent += (property.squareFootage / 1000) * 300;
    
    // Adjust for property type
    const typeMultipliers = {
      'single-family': 1.1,
      'townhouse': 1.0,
      'condo': 0.9,
      'multi-family': 0.95
    };
    
    baseRent *= typeMultipliers[property.propertyType] || 1.0;
    
    // Regional adjustments (rough estimates)
    const stateMultipliers: { [key: string]: number } = {
      'CA': 1.8, 'NY': 1.7, 'MA': 1.5, 'CT': 1.3, 'FL': 1.0,
      'TX': 1.1, 'CO': 1.3, 'WA': 1.4, 'OR': 1.2
    };
    
    baseRent *= stateMultipliers[property.state] || 1.0;
    
    return Math.round(baseRent);
  }

  private static calculateInvestmentMetrics(property: PropertyData, monthlyRent: number) {
    console.log(`💰 Calculating investment metrics for ${property.address} using your specific formula`);
    
    // Fetch monthly mortgage (Principal & Interest) from Zillow API
    const monthlyMortgage = property.mortgagePayment?.total || this.calculateMortgagePayment(property.purchasePrice);
    
    // Fetch property taxes from Zillow API
    const monthlyPropertyTaxes = property.monthlyPropertyTaxes || (property.purchasePrice * 0.015 / 12);
    
    // Fetch monthly home insurance from Zillow API
    const monthlyInsurance = property.monthlyInsurance || (property.purchasePrice * 0.006 / 12);
    
    // Fetch HOA fees from Zillow API
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
    
    // Investment scoring (1-10 scale) based on your metrics
    let score = 5; // Base score
    
    if (cashOnCashReturn > 12) score += 2;
    else if (cashOnCashReturn > 8) score += 1;
    else if (cashOnCashReturn < 4) score -= 2;
    
    if (capRate > 8) score += 1;
    else if (capRate < 5) score -= 1;
    
    if (monthlyNetCashFlow > 400) score += 1;
    else if (monthlyNetCashFlow < 0) score -= 3;
    
    // Adjust score based on property condition and features
    if (property.propertyCondition === 'excellent') score += 0.5;
    else if (property.propertyCondition === 'poor') score -= 1;
    
    if (property.yearBuilt && property.yearBuilt > 2000) score += 0.5;
    else if (property.yearBuilt && property.yearBuilt < 1980) score -= 0.5;
    
    score = Math.max(1, Math.min(10, score)); // Clamp between 1-10
    
    let rank: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (score >= 8) rank = 'Excellent';
    else if (score >= 6) rank = 'Good';
    else if (score >= 4) rank = 'Fair';
    else rank = 'Poor';
    
    // Enhanced logging with your specific formula breakdown
    console.log(`💰 ${property.address} - Using Your Formula:`);
    console.log(`📊 Operating Cost Breakdown:`);
    console.log(`   - Property Management: $${propertyManagement.toFixed(0)}/mo (10% of rent)`);
    console.log(`   - Property Taxes: $${monthlyPropertyTaxes.toFixed(0)}/mo (${property.monthlyPropertyTaxes ? 'from Zillow API' : 'estimated'})`);
    console.log(`   - Insurance: $${monthlyInsurance.toFixed(0)}/mo (${property.monthlyInsurance ? 'from Zillow API' : 'estimated'})`);
    console.log(`   - Owner Paid Utilities: $${ownerPaidUtilities.toFixed(0)}/mo (per your formula)`);
    console.log(`   - Vacancy Reserves: $${vacancyReserves.toFixed(0)}/mo (3.5% of rent)`);
    console.log(`   - Maintenance Reserve: $${maintenanceReserve.toFixed(0)}/mo (8% of rent)`);
    if (monthlyHOA > 0) console.log(`   - HOA Fees: $${monthlyHOA.toFixed(0)}/mo (from Zillow API)`);
    console.log(`📈 Total Operating Cost: $${totalOperatingCost.toFixed(0)}/mo`);
    console.log(`🏠 Monthly Mortgage P&I: $${monthlyMortgage.toFixed(0)}/mo (${property.mortgagePayment ? 'from Zillow API' : 'calculated'})`);
    console.log(`� Monthly Rent: $${monthlyRent.toFixed(0)}`);
    console.log(`💵 Monthly Net Cash Flow: $${monthlyNetCashFlow.toFixed(0)} (Rent - Operating Cost - Mortgage)`);
    console.log(`🎯 1st Year COC ROI: ${cashOnCashReturn.toFixed(1)}% (Annual Cash Flow / Total Cash Invested * 100)`);
    console.log(`📊 Investment Score: ${score.toFixed(1)}/10 (${rank})`);
    
    return {
      estimatedRent: monthlyRent,
      estimatedCashFlow: Math.round(monthlyNetCashFlow),
      estimatedCOCReturn: Math.round(cashOnCashReturn * 100) / 100,
      estimatedCapRate: Math.round(capRate * 100) / 100,
      investmentScore: score,
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
  
  // Calculate mortgage payment using standard assumptions
  private static calculateMortgagePayment(purchasePrice: number): number {
    const downPaymentPercent = 0.25; // 25% down payment
    const interestRate = 0.065; // 6.5% interest rate
    const loanTermYears = 30;
    
    const loanAmount = purchasePrice * (1 - downPaymentPercent);
    const monthlyRate = interestRate / 12;
    const numPayments = loanTermYears * 12;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }
  
  // Calculate maintenance expenses based on property characteristics
  private static _calculateMaintenanceExpenses(property: PropertyData, monthlyRent: number): number {
    let maintenanceRate = 0.08; // Base 8% of rent
    
    // Adjust based on property age
    if (property.yearBuilt && property.yearBuilt < 1980) {
      maintenanceRate += 0.02; // Older properties need more maintenance
    } else if (property.yearBuilt && property.yearBuilt > 2010) {
      maintenanceRate -= 0.01; // Newer properties need less maintenance
    }
    
    // Adjust based on property features
    if (property.hasPool) maintenanceRate += 0.015; // Pools add ~1.5% maintenance
    if (property.squareFootage > 2500) maintenanceRate += 0.005; // Larger homes cost more
    
    // Property condition adjustment
    if (property.propertyCondition === 'poor') maintenanceRate += 0.03;
    else if (property.propertyCondition === 'excellent') maintenanceRate -= 0.01;
    
    return monthlyRent * maintenanceRate;
  }
  
  // Calculate utilities expenses (what investor typically pays)
  private static _calculateUtilitiesExpenses(property: PropertyData): number {
    let baseUtilities = 50; // Base monthly utilities during vacancy
    
    // Adjust based on property size and features
    if (property.squareFootage > 2000) baseUtilities += 25;
    if (property.hasPool) baseUtilities += 40; // Pool utilities
    if (property.hasAirConditioning) baseUtilities += 15;
    
    return baseUtilities;
  }

  private static sortByInvestmentScore(listings: PropertyListing[]): PropertyListing[] {
    return listings.sort((a, b) => {
      // Primary sort by investment score (descending)
      if (b.investmentScore !== a.investmentScore) {
        return b.investmentScore - a.investmentScore;
      }
      // Secondary sort by cash-on-cash return (descending)
      return b.estimatedCOCReturn - a.estimatedCOCReturn;
    });
  }

  // Mock data for demonstration when no API key is configured
  private static getMockProperties(params: AreaSearchParams): PropertyListing[] {
    console.log('🎭 Generating enhanced mock properties with realistic photos for demonstration...');
    
    const mockProperties: PropertyData[] = [
      {
        id: 'mock-1',
        address: '123 Main St',
        city: params.city || 'Birmingham',
        state: params.state || 'AL',
        zipCode: '35203',
        purchasePrice: 120000,
        marketValue: 120000,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1400,
        yearBuilt: 1995,
        propertyType: 'single-family',
        monthlyRent: 1200,
        source: 'Demo Data',
        latitude: 33.5186,
        longitude: -86.8104,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 1800,
        monthlyPropertyTaxes: 150,
        annualInsurance: 720,
        monthlyInsurance: 60,
        mortgagePayment: {
          principal: 350,
          interest: 400,
          total: 750,
          interestRate: 0.065
        },
        interestRate: 0.065,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80', // Beautiful house exterior
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format&q=80', // Spacious living room
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format&q=80', // Modern kitchen
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format&q=80', // Cozy bedroom
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format&q=80'  // Elegant bathroom
        ]
      },
      {
        id: 'mock-2',
        address: '456 Oak Avenue',
        city: params.city || 'Birmingham',
        state: params.state || 'AL',
        zipCode: '35205',
        purchasePrice: 95000,
        marketValue: 95000,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1100,
        yearBuilt: 1985,
        propertyType: 'single-family',
        monthlyRent: 950,
        source: 'Demo Data',
        latitude: 33.5206,
        longitude: -86.8124,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 1425,
        monthlyPropertyTaxes: 118,
        annualInsurance: 570,
        monthlyInsurance: 47,
        mortgagePayment: {
          principal: 275,
          interest: 315,
          total: 590,
          interestRate: 0.065
        },
        interestRate: 0.065,
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&auto=format&q=80', // Charming cottage exterior
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format&q=80', // Bright living space
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&auto=format&q=80', // Cozy kitchen
          'https://images.unsplash.com/photo-1631889993959-41b4bd7c3ced?w=800&h=600&fit=crop&auto=format&q=80', // Comfortable bedroom
          'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&auto=format&q=80'  // Clean bathroom
        ]
      },
      {
        id: 'mock-3',
        address: '789 Pine Street',
        city: params.city || 'Birmingham',
        state: params.state || 'AL',
        zipCode: '35207',
        purchasePrice: 150000,
        marketValue: 150000,
        bedrooms: 4,
        bathrooms: 2,
        squareFootage: 1800,
        yearBuilt: 2005,
        propertyType: 'single-family',
        monthlyRent: 1450,
        source: 'Demo Data',
        latitude: 33.5226,
        longitude: -86.8144,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 2250,
        monthlyPropertyTaxes: 187,
        annualInsurance: 900,
        monthlyInsurance: 75,
        mortgagePayment: {
          principal: 437,
          interest: 500,
          total: 937,
          interestRate: 0.065
        },
        interestRate: 0.065,
        images: [
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&auto=format&q=80', // Modern house exterior
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&auto=format&q=80', // Open floor plan
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80', // Gourmet kitchen
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&auto=format&q=80', // Master bedroom
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&auto=format&q=80', // Luxury bathroom
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&auto=format&q=80'  // Backyard/patio
        ]
      },
      {
        id: 'mock-4',
        address: '321 Elm Drive',
        city: params.city || 'Birmingham',
        state: params.state || 'AL',
        zipCode: '35209',
        purchasePrice: 85000,
        marketValue: 85000,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1000,
        yearBuilt: 1978,
        propertyType: 'single-family',
        monthlyRent: 875,
        source: 'Demo Data',
        latitude: 33.5156,
        longitude: -86.8054,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 1275,
        monthlyPropertyTaxes: 106,
        annualInsurance: 510,
        monthlyInsurance: 42,
        mortgagePayment: {
          principal: 247,
          interest: 283,
          total: 530,
          interestRate: 0.065
        },
        interestRate: 0.065,
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format&q=80', // Classic brick exterior
          'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=600&fit=crop&auto=format&q=80', // Traditional living room
          'https://images.unsplash.com/photo-1556909200-f33d5697d4b2?w=800&h=600&fit=crop&auto=format&q=80', // Vintage kitchen
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop&auto=format&q=80'  // Simple bedroom
        ]
      },
      {
        id: 'mock-5',
        address: '654 Maple Court',
        city: params.city || 'Birmingham',
        state: params.state || 'AL',
        zipCode: '35211',
        purchasePrice: 175000,
        marketValue: 175000,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1600,
        yearBuilt: 2010,
        propertyType: 'single-family',
        monthlyRent: 1375,
        source: 'Demo Data',
        latitude: 33.5276,
        longitude: -86.8194,
        monthlyHoaFee: 0,
        annualPropertyTaxes: 2625,
        monthlyPropertyTaxes: 218,
        annualInsurance: 1050,
        monthlyInsurance: 87,
        mortgagePayment: {
          principal: 509,
          interest: 582,
          total: 1091,
          interestRate: 0.065
        },
        interestRate: 0.065,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80', // Contemporary house exterior
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop&auto=format&q=80', // Modern living area
          'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop&auto=format&q=80', // Updated kitchen
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop&auto=format&q=80', // Stylish bedroom
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop&auto=format&q=80'  // Modern bathroom
        ]
      }
    ];

    // Apply basic filters
    const filteredProperties = mockProperties.filter(property => {
      if (params.minPrice && property.purchasePrice < params.minPrice) return false;
      if (params.maxPrice && property.purchasePrice > params.maxPrice) return false;
      if (params.minBedrooms && property.bedrooms < params.minBedrooms) return false;
      return true;
    });

    // Calculate investment metrics for each property
    const listings: PropertyListing[] = filteredProperties.map(property => {
      const rentEstimate = { estimatedRent: property.monthlyRent || 1000, confidence: 'high' as const, source: 'Mock Data' };
      const investmentMetrics = this.calculateInvestmentMetrics(property, rentEstimate.estimatedRent);
      
      return {
        ...property,
        ...investmentMetrics
      } as PropertyListing;
    });

    return this.sortByInvestmentScore(listings);
  }

  // Extract property images from Zillow API response
  private static extractPropertyImages(property: any): string[] {
    const images: string[] = [];
    
    try {
      console.log(`📸 Extracting images for property:`, {
        zpid: property.zpid,
        address: property.address,
        availableFields: Object.keys(property)
      });
      
      // Check different possible image fields in Zillow API (updated based on actual API structure)
      const imageFields = [
        'imgSrc',          // Primary image source (most common in Zillow API)
        'photo',           // Single photo field  
        'photos',          // Main photos array
        'images',          // Alternative images array
        'primaryPhoto',    // Primary photo object
        'listingPhotos',   // Listing photos array
        'media',           // Media array
        'gallery',         // Gallery array
        'photoUrls',       // Direct photo URLs array
        'hdpData'          // High-definition photo data
      ];
      
      // First, try to get the primary image (most reliable)
      if (property.imgSrc && this.isValidImageUrl(property.imgSrc)) {
        images.push(property.imgSrc);
        console.log(`🖼️ Found primary image (imgSrc):`, property.imgSrc);
      }
      
      // Then try other image fields
      for (const field of imageFields) {
        if (property[field]) {
          console.log(`🖼️ Found ${field} field:`, property[field]);
          
          if (Array.isArray(property[field])) {
            // Handle array of image objects or URLs
            property[field].forEach((item: any, idx: number) => {
              const imageUrl = this.extractImageUrl(item);
              if (imageUrl && !images.includes(imageUrl)) {
                images.push(imageUrl);
                console.log(`  ✅ Extracted image ${idx + 1}:`, imageUrl);
              }
            });
          } else if (typeof property[field] === 'object' && property[field] !== null) {
            // Handle single image object
            const imageUrl = this.extractImageUrl(property[field]);
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
              console.log(`  ✅ Extracted from object:`, imageUrl);
            }
          } else if (typeof property[field] === 'string' && this.isValidImageUrl(property[field])) {
            // Handle direct URL string
            if (!images.includes(property[field])) {
              images.push(property[field]);
              console.log(`  ✅ Direct URL:`, property[field]);
            }
          }
        }
      }
      
      // Try nested structures if still no images found
      if (images.length === 0) {
        console.log(`🔍 No images found in primary fields, checking nested structures...`);
        
        // Check hdpData (Zillow's high-definition photo data)
        if (property.hdpData?.homeInfo?.photos) {
          property.hdpData.homeInfo.photos.forEach((photo: any, idx: number) => {
            const imageUrl = this.extractImageUrl(photo);
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
              console.log(`  ✅ HDP photo ${idx + 1}:`, imageUrl);
            }
          });
        }
        
        // Check media nested structures
        if (property.media?.photos) {
          property.media.photos.forEach((photo: any) => {
            const imageUrl = this.extractImageUrl(photo);
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
            }
          });
        }
        
        // Check for carousel images
        if (property.carousel && Array.isArray(property.carousel)) {
          property.carousel.forEach((item: any) => {
            const imageUrl = this.extractImageUrl(item);
            if (imageUrl && !images.includes(imageUrl)) {
              images.push(imageUrl);
            }
          });
        }
      }
      
      // Log the final extraction result
      if (images.length > 0) {
        console.log(`📸 Successfully extracted ${images.length} images for ${property.address || 'property'}`);
        console.log(`📸 Sample URLs:`, images.slice(0, 3));
      } else {
        console.warn(`⚠️ No images found for property:`, property.address || 'unknown');
        console.log(`Available property fields:`, Object.keys(property));
      }
      
      // Limit to first 10 images for performance
      return images.slice(0, 10);
      
    } catch (error) {
      console.error('❌ Error extracting property images:', error);
      return [];
    }
  }

  // Extract image URL from various object structures
  private static extractImageUrl(item: any): string | null {
    if (typeof item === 'string' && this.isValidImageUrl(item)) {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      // Common image URL fields in Zillow API
      const urlFields = [
        'url',           // Standard URL field
        'src',           // Source field
        'href',          // Link field
        'link',          // Alternative link field
        'photoUrl',      // Photo URL field
        'imageUrl',      // Image URL field
        'fullSizeUrl',   // Full size image URL
        'largeUrl',      // Large size URL
        'mediumUrl',     // Medium size URL
        'mixedSources',  // Zillow's mixed sources field
        'webp',          // WebP format URL
        'jpeg'           // JPEG format URL
      ];
      
      // First, try direct URL fields
      for (const field of urlFields) {
        if (item[field] && typeof item[field] === 'string' && this.isValidImageUrl(item[field])) {
          return item[field];
        }
      }
      
      // Check for nested image size structures (common in Zillow API)
      if (item.sizes && Array.isArray(item.sizes)) {
        // Find the largest size image
        const largestImage = item.sizes.reduce((largest: any, current: any) => {
          if (!current.url || !this.isValidImageUrl(current.url)) return largest;
          
          const currentSize = (current.width || 0) * (current.height || 0);
          const largestSize = (largest?.width || 0) * (largest?.height || 0);
          return currentSize > largestSize ? current : largest;
        }, null);
        
        if (largestImage && largestImage.url) {
          return largestImage.url;
        }
      }
      
      // Check for mixedSources (Zillow's photo structure)
      if (item.mixedSources) {
        if (typeof item.mixedSources === 'string' && this.isValidImageUrl(item.mixedSources)) {
          return item.mixedSources;
        }
        
        if (typeof item.mixedSources === 'object') {
          // Try different size variants
          const sizeVariants = ['l', 'xl', 'm', 's']; // Large, extra large, medium, small
          for (const size of sizeVariants) {
            if (item.mixedSources[size] && this.isValidImageUrl(item.mixedSources[size])) {
              return item.mixedSources[size];
            }
          }
        }
      }
      
      // Check for nested image objects
      if (item.image && typeof item.image === 'object') {
        return this.extractImageUrl(item.image);
      }
      
      // Check for photo object with nested URL
      if (item.photo && typeof item.photo === 'object') {
        return this.extractImageUrl(item.photo);
      }
    }
    
    return null;
  }

  // Validate if a string is a valid image URL
  private static isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // Check if it's a valid URL
    try {
      const urlObj = new URL(url);
      
      // Reject obviously invalid URLs
      if (!urlObj.hostname) return false;
      
    } catch {
      return false;
    }
    
    // Check if it has image extension or is from known real estate image domains
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i;
    const realEstateImageDomains = [
      'zillow',                    // Main Zillow domain
      'zillowstatic',             // Zillow's static content domain
      'photos.zillowstatic',      // Zillow photos subdomain
      'img.zillowstatic',         // Zillow image subdomain  
      'p.rdcpix',                 // Realtor.com images
      'ap.rdcpix',                // Realtor.com additional photos
      'redfin',                   // Redfin domain
      'ssl.cdn-redfin',          // Redfin CDN
      'redfin-assets',           // Redfin assets
      'mls-images',              // MLS image servers
      'mlslistings',             // MLS listings images
      'listingimages'            // Generic listing images
    ];
    
    // Check for image extensions
    if (imageExtensions.test(url)) {
      return true;
    }
    
    // Check for known real estate image domains
    const hasValidDomain = realEstateImageDomains.some(domain => url.toLowerCase().includes(domain));
    
    if (hasValidDomain) {
      // Additional validation for real estate domains to ensure it's actually an image
      const hasImageIndicators = [
        '/photos/',
        '/images/',
        '/img/',
        '/picture',
        '/photo',
        '_photo',
        '-photo',
        'image',
        'pic'
      ].some(indicator => url.toLowerCase().includes(indicator));
      
      return hasImageIndicators;
    }
    
    return false;
  }
}
