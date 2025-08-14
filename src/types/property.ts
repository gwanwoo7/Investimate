export interface PropertyData {
  id: string; // Unique property identifier
  address: string;
  zipCode: string;
  city: string;
  state: string;
  purchasePrice: number;
  marketValue: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family';
  listingUrl?: string;
  images?: string[];
  description?: string;
  listingDate?: string;
  daysOnMarket?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // Direct coordinate properties from API
  latitude?: number;
  longitude?: number;
  monthlyRent?: number; // Estimated or actual monthly rent
  grossRentMultiplier?: number; // Purchase price / annual rent
  source?: string; // API source (Zillow, Redfin, etc.)
  
  // Financial details from API
  monthlyHoaFee?: number; // HOA fees from API
  annualPropertyTaxes?: number; // Property taxes from API
  monthlyPropertyTaxes?: number; // Monthly property taxes
  annualInsurance?: number; // Home insurance from API
  monthlyInsurance?: number; // Monthly insurance estimate
  mortgagePayment?: {
    principal?: number;
    interest?: number;
    total?: number; // Monthly P&I payment
    interestRate?: number; // Interest rate from API (decimal format, e.g., 0.065 for 6.5%)
  };
  
  // Interest rate data from API
  interestRate?: number; // Primary interest rate field
  mortgageRate?: number; // Alternative rate field
  currentRate?: number; // Current market rate
  loanRate?: number; // Loan-specific rate
  
  // Property details for calculations
  lotSize?: number; // Square feet
  parkingSpaces?: number;
  hasGarage?: boolean;
  yearRenovated?: number;
  
  // Zestimate data
  zestimate?: number;
  rentZestimate?: number;
  
  // Tax and assessment data
  taxAssessedValue?: number;
  taxYear?: number;
  
  // Additional property features that affect operating costs
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  heating?: string;
  propertyCondition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AreaSearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  radius?: number; // miles
  maxPrice?: number;
  minPrice?: number;
  propertyTypes?: ('single-family' | 'condo' | 'townhouse' | 'multi-family')[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  maxResults?: number;
  limit?: number; // Number of properties to return (10, 50, 100, 200)
  // Investment metric filters
  minCashOnCashROI?: number;
  maxCashOnCashROI?: number;
  minCapRate?: number;
  maxCapRate?: number;
  minMonthlyCashFlow?: number;
  maxMonthlyCashFlow?: number;
  minInvestmentScore?: number;
  maxInvestmentScore?: number;
  sortBy?: 'cashOnCashROI' | 'capRate' | 'monthlyCashFlow' | 'investmentScore' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyListing extends PropertyData {
  estimatedRent: number;
  estimatedCashFlow: number;
  estimatedCOCReturn: number;
  estimatedCapRate: number;
  investmentScore: number; // 1-10 calculated score
  investmentRank: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  quickAnalysis: {
    monthlyRent: number;
    monthlyExpenses: number;
    monthlyMortgage: number;
    monthlyCashFlow: number;
    totalCashNeeded: number;
  };
}

export interface RentalIncome {
  monthlyRent: number;
  otherIncome: number; // parking, laundry, etc.
  vacancyRate: number; // percentage
  effectiveMonthlyIncome: number;
}

export interface OperatingExpenses {
  propertyTaxes: number;
  insurance: number;
  propertyManagement: number;
  maintenance: number;
  utilities: number;
  advertising: number;
  legal: number;
  accounting: number;
  otherExpenses: number;
  totalMonthlyExpenses: number;
}

export interface FinancingDetails {
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // years
  monthlyPayment: number;
  closingCosts: number;
}

export interface RepairCosts {
  immediateRepairs: number;
  futureRepairs: number;
  totalRepairCosts: number;
}

export interface RentEstimate {
  estimatedRent: number;
  confidence: 'low' | 'medium' | 'high';
  source: string;
}

export interface CashFlowAnalysis {
  monthlyRentalIncome: number;
  monthlyOperatingExpenses: number;
  monthlyMortgagePayment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalCashInvested: number;
  cashOnCashReturn: number;
  capRate: number;
  grossRentMultiplier: number;
  debtCoverageRatio: number;
}

export interface InvestmentRecommendation {
  score: number; // 1-10
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Avoid';
  pros: string[];
  cons: string[];
  keyMetrics: {
    cashOnCashReturn: number;
    capRate: number;
    monthlyCashFlow: number;
  };
}

export interface PropertyAnalysis {
  property: PropertyData;
  rentalIncome: RentalIncome;
  expenses: OperatingExpenses;
  financing: FinancingDetails;
  repairs: RepairCosts;
  cashFlow: CashFlowAnalysis;
  recommendation: InvestmentRecommendation;
}
