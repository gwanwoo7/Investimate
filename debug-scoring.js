// Debug script to test scoring algorithm with negative CoC ROI

function calculateInvestmentMetrics(property, monthlyRent) {
  console.log(`💰 DEBUG: Calculating investment metrics for ${property.address}`);
  
  // Use same calculation as in the app
  const downPaymentPercent = 0.25;
  const interestRate = 0.068;
  const loanTermYears = 30;
  
  const loanAmount = property.purchasePrice * (1 - downPaymentPercent);
  const monthlyRate = interestRate / 12;
  const numPayments = loanTermYears * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const propertyManagement = monthlyRent * 0.10;
  const monthlyPropertyTaxes = property.purchasePrice * 0.015 / 12; // 1.5% annually
  const monthlyInsurance = property.purchasePrice * 0.006 / 12; // 0.6% annually
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
  
  // Scoring algorithm
  let score = 3.0;
  
  if (cashOnCashReturn >= 20) score += 4.0;
  else if (cashOnCashReturn >= 15) score += 3.5;
  else if (cashOnCashReturn >= 12) score += 3.0;
  else if (cashOnCashReturn >= 10) score += 2.5;
  else if (cashOnCashReturn >= 8) score += 2.0;
  else if (cashOnCashReturn >= 6) score += 1.0;
  else if (cashOnCashReturn >= 4) score += 0.5;
  else if (cashOnCashReturn >= 2) score += 0.0;
  else if (cashOnCashReturn >= 0) score -= 1.0;
  else score -= 2.0; // Negative cash flow
  
  if (monthlyNetCashFlow > 500) score += 0.8;
  else if (monthlyNetCashFlow > 300) score += 0.5;
  else if (monthlyNetCashFlow > 100) score += 0.2;
  else if (monthlyNetCashFlow < -200) score -= 0.8;
  else if (monthlyNetCashFlow < 0) score -= 0.4;
  
  score = Math.max(1, Math.min(10, score));
  
  console.log(`🏠 Property: ${property.address}`);
  console.log(`💵 Purchase Price: $${property.purchasePrice.toLocaleString()}`);
  console.log(`🏠 Monthly Rent: $${monthlyRent.toLocaleString()}`);
  console.log(`🏦 Monthly Mortgage: $${monthlyMortgage.toFixed(0)}`);
  console.log(`💰 Total Operating Cost: $${totalOperatingCost.toFixed(0)}`);
  console.log(`💳 Monthly Net Cash Flow: $${monthlyNetCashFlow.toFixed(0)}`);
  console.log(`🎯 Cash-on-Cash ROI: ${cashOnCashReturn.toFixed(1)}%`);
  console.log(`🏆 Investment Score: ${score.toFixed(1)}/10`);
  console.log(`📊 Total Cash Invested: $${totalCashInvested.toLocaleString()}`);
  
  return { score: score.toFixed(1), cashOnCashReturn: cashOnCashReturn.toFixed(1) };
}

// Test case 1: Property that should have -4.1% CoC ROI
console.log('\n=== TEST CASE 1: High price, low rent (should be negative CoC ROI) ===');
const testProperty1 = {
  address: "29460 Steinhauer St, Inkster, Michigan",
  purchasePrice: 75000, // Low price
  monthlyHoaFee: 0
};

// Try different rent amounts to see what would give -4.1% CoC ROI
const rents = [800, 1000, 1200, 1500];
rents.forEach(rent => {
  console.log(`\n--- Testing with $${rent}/month rent ---`);
  calculateInvestmentMetrics(testProperty1, rent);
});

console.log('\n=== TEST CASE 2: Find rent that gives exactly -4.1% CoC ROI ===');
// For $75,000 property, let's calculate what rent would give -4.1% CoC ROI
const targetCocROI = -4.1;
const price = 75000;
const downPayment = price * 0.25;
const closingCosts = price * 0.03;
const totalCashInvested = downPayment + closingCosts;
const targetAnnualCashFlow = (targetCocROI / 100) * totalCashInvested;
const targetMonthlyCashFlow = targetAnnualCashFlow / 12;

console.log(`Target monthly cash flow for -4.1% CoC ROI: $${targetMonthlyCashFlow.toFixed(0)}`);

// Work backwards to find rent
// Monthly cash flow = rent - operating costs - mortgage
// We need to solve for rent

const loanAmount = price * 0.75;
const monthlyRate = 0.068 / 12;
const numPayments = 30 * 12;
const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                       (Math.pow(1 + monthlyRate, numPayments) - 1);

// Operating costs depend on rent, so we need to solve this equation:
// targetMonthlyCashFlow = rent - (0.10*rent + 0.035*rent + 0.08*rent + monthlyTaxes + monthlyInsurance) - monthlyMortgage
// targetMonthlyCashFlow = rent - 0.225*rent - fixedCosts - monthlyMortgage
// targetMonthlyCashFlow = 0.775*rent - fixedCosts - monthlyMortgage
// rent = (targetMonthlyCashFlow + fixedCosts + monthlyMortgage) / 0.775

const monthlyTaxes = price * 0.015 / 12;
const monthlyInsurance = price * 0.006 / 12;
const fixedCosts = monthlyTaxes + monthlyInsurance;

const calculatedRent = (targetMonthlyCashFlow + fixedCosts + monthlyMortgage) / 0.775;

console.log(`Calculated rent needed for -4.1% CoC ROI: $${calculatedRent.toFixed(0)}`);

// Test with this calculated rent
calculateInvestmentMetrics({
  address: "Calculated Test Property",
  purchasePrice: price,
  monthlyHoaFee: 0
}, Math.round(calculatedRent));
