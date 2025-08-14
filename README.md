# Rental Property Cash Flow Calculator

A comprehensive React TypeScript application for analyzing rental property investments, calculating cash flow returns, and providing investment recommendations.

## Features

🏠 **Property Analysis**
- Property search and data fetching
- Detailed property information input
- Market value estimation

💰 **Financial Calculations**
- Cash flow analysis with monthly/annual projections
- Cash-on-cash return calculations
- Cap rate analysis
- Debt coverage ratio assessment

📊 **Investment Recommendations**
- AI-powered scoring system (1-10 scale)
- Investment recommendations: Strong Buy, Buy, Hold, Avoid
- Detailed pros and cons analysis
- Key performance indicators (KPIs)

🎨 **Modern UI**
- Material-UI components with professional design
- Responsive layout for mobile and desktop
- Step-by-step wizard interface
- Interactive charts and data visualization

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Property Search**: Enter property address or zip code
2. **Property Details**: Review and update property specifications
3. **Financing**: Configure loan terms and down payment
4. **Expenses**: Input operating expenses and maintenance costs
5. **Results**: View comprehensive investment analysis and recommendations

## Project Structure

```
src/
├── components/          # React components
│   ├── PropertyCalculator.tsx    # Main calculator wizard
│   ├── PropertySearchForm.tsx    # Property search interface
│   ├── PropertyDetailsForm.tsx   # Property info form
│   ├── FinancingForm.tsx         # Financing details form
│   ├── ExpensesForm.tsx          # Operating expenses form
│   └── ResultsDashboard.tsx      # Analysis results display
├── types/               # TypeScript type definitions
│   └── property.ts              # Property and analysis types
├── utils/               # Utility functions
│   └── cashFlowCalculator.ts    # Financial calculation engine
├── services/            # API services
│   └── realEstateService.ts     # Real estate data service
└── App.tsx              # Main application component
```

## Key Calculations

### Cash-on-Cash Return
```
(Annual Cash Flow / Total Cash Invested) × 100
```

### Cap Rate
```
(Annual Net Operating Income / Property Value) × 100
```

### Monthly Cash Flow
```
Monthly Rental Income - Operating Expenses - Mortgage Payment
```

## Investment Scoring System

The application uses a comprehensive scoring system (1-10) based on:
- Cash-on-cash return performance
- Cap rate competitiveness
- Monthly cash flow positivity
- Debt coverage ratio strength

**Recommendations:**
- **8-10**: Strong Buy
- **6-7**: Buy
- **4-5**: Hold
- **1-3**: Avoid

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI v5
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Emotion (CSS-in-JS)

## Future Enhancements

- Real estate API integration (Zillow, RentSpotter)
- Advanced charts and data visualization
- Property comparison features
- Market analysis and trends
- Export to PDF/Excel functionality
- User authentication and saved analyses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
