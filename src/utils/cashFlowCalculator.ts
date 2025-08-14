import type { PropertyData, RentalIncome, OperatingExpenses, FinancingDetails, RepairCosts, CashFlowAnalysis, InvestmentRecommendation } from '../types/property';

export class CashFlowCalculator {
  static calculateEffectiveIncome(monthlyRent: number, otherIncome: number, vacancyRate: number): number {
    const grossIncome = monthlyRent + otherIncome;
    return grossIncome * (1 - vacancyRate / 100);
  }

  static calculateMonthlyMortgagePayment(loanAmount: number, interestRate: number, loanTermYears: number): number {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  static calculateTotalCashInvested(downPayment: number, closingCosts: number, repairCosts: number): number {
    return downPayment + closingCosts + repairCosts;
  }

  static calculateCashOnCashReturn(annualCashFlow: number, totalCashInvested: number): number {
    if (totalCashInvested === 0) return 0;
    return (annualCashFlow / totalCashInvested) * 100;
  }

  static calculateCapRate(annualNetIncome: number, propertyValue: number): number {
    if (propertyValue === 0) return 0;
    return (annualNetIncome / propertyValue) * 100;
  }

  static calculateGrossRentMultiplier(propertyValue: number, annualRent: number): number {
    if (annualRent === 0) return 0;
    return propertyValue / annualRent;
  }

  static calculateDebtCoverageRatio(annualNetIncome: number, annualDebtService: number): number {
    if (annualDebtService === 0) return 0;
    return annualNetIncome / annualDebtService;
  }

  static performCashFlowAnalysis(
    property: PropertyData,
    rentalIncome: RentalIncome,
    expenses: OperatingExpenses,
    financing: FinancingDetails,
    repairs: RepairCosts
  ): CashFlowAnalysis {
    const monthlyRentalIncome = this.calculateEffectiveIncome(
      rentalIncome.monthlyRent,
      rentalIncome.otherIncome,
      rentalIncome.vacancyRate
    );

    const monthlyMortgagePayment = this.calculateMonthlyMortgagePayment(
      financing.loanAmount,
      financing.interestRate,
      financing.loanTerm
    );

    const monthlyCashFlow = monthlyRentalIncome - expenses.totalMonthlyExpenses - monthlyMortgagePayment;
    const annualCashFlow = monthlyCashFlow * 12;
    
    const totalCashInvested = this.calculateTotalCashInvested(
      financing.downPayment,
      financing.closingCosts,
      repairs.totalRepairCosts
    );

    const annualNetIncome = (monthlyRentalIncome - expenses.totalMonthlyExpenses) * 12;
    
    return {
      monthlyRentalIncome,
      monthlyOperatingExpenses: expenses.totalMonthlyExpenses,
      monthlyMortgagePayment,
      monthlyCashFlow,
      annualCashFlow,
      totalCashInvested,
      cashOnCashReturn: this.calculateCashOnCashReturn(annualCashFlow, totalCashInvested),
      capRate: this.calculateCapRate(annualNetIncome, property.marketValue),
      grossRentMultiplier: this.calculateGrossRentMultiplier(property.marketValue, monthlyRentalIncome * 12),
      debtCoverageRatio: this.calculateDebtCoverageRatio(annualNetIncome, monthlyMortgagePayment * 12)
    };
  }

  static generateInvestmentRecommendation(cashFlow: CashFlowAnalysis): InvestmentRecommendation {
    let score = 5; // Start with neutral score
    const pros: string[] = [];
    const cons: string[] = [];

    // Cash-on-Cash Return Analysis
    if (cashFlow.cashOnCashReturn > 12) {
      score += 2;
      pros.push(`Excellent cash-on-cash return of ${cashFlow.cashOnCashReturn.toFixed(1)}%`);
    } else if (cashFlow.cashOnCashReturn > 8) {
      score += 1;
      pros.push(`Good cash-on-cash return of ${cashFlow.cashOnCashReturn.toFixed(1)}%`);
    } else if (cashFlow.cashOnCashReturn < 6) {
      score -= 1;
      cons.push(`Low cash-on-cash return of ${cashFlow.cashOnCashReturn.toFixed(1)}%`);
    }

    // Cap Rate Analysis
    if (cashFlow.capRate > 8) {
      score += 1;
      pros.push(`Strong cap rate of ${cashFlow.capRate.toFixed(1)}%`);
    } else if (cashFlow.capRate < 6) {
      score -= 1;
      cons.push(`Low cap rate of ${cashFlow.capRate.toFixed(1)}%`);
    }

    // Cash Flow Analysis
    if (cashFlow.monthlyCashFlow > 300) {
      score += 1;
      pros.push(`Positive monthly cash flow of $${cashFlow.monthlyCashFlow.toFixed(0)}`);
    } else if (cashFlow.monthlyCashFlow < 0) {
      score -= 2;
      cons.push(`Negative monthly cash flow of $${cashFlow.monthlyCashFlow.toFixed(0)}`);
    }

    // Debt Coverage Ratio
    if (cashFlow.debtCoverageRatio > 1.25) {
      score += 1;
      pros.push(`Strong debt coverage ratio of ${cashFlow.debtCoverageRatio.toFixed(2)}`);
    } else if (cashFlow.debtCoverageRatio < 1.0) {
      score -= 1;
      cons.push(`Weak debt coverage ratio of ${cashFlow.debtCoverageRatio.toFixed(2)}`);
    }

    // Ensure score stays within bounds
    score = Math.max(1, Math.min(10, score));

    let recommendation: InvestmentRecommendation['recommendation'];
    if (score >= 8) {
      recommendation = 'Strong Buy';
    } else if (score >= 6) {
      recommendation = 'Buy';
    } else if (score >= 4) {
      recommendation = 'Hold';
    } else {
      recommendation = 'Avoid';
    }

    return {
      score,
      recommendation,
      pros,
      cons,
      keyMetrics: {
        cashOnCashReturn: cashFlow.cashOnCashReturn,
        capRate: cashFlow.capRate,
        monthlyCashFlow: cashFlow.monthlyCashFlow
      }
    };
  }
}
