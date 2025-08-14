# 🏠 Rental Property Cash Flow Calculator

A comprehensive React TypeScript application for analyzing rental property investments and calculating cash flow returns. Built with Vite, Material-UI, and integrated with real estate APIs.

## 🚀 Features

### 📊 Property Analysis
- **Area-based Property Search**: Find properties by city, state, and search criteria
- **Investment Ranking**: Properties ranked by Cash-on-Cash return and investment score
- **Real-time Calculations**: Automatic cash flow, ROI, and cap rate calculations
- **Investment Recommendations**: AI-powered scoring system with buy/hold/avoid recommendations

### 🔍 Property Search & Data
- **Multi-API Integration**: Zillow, Realtor.com, and rental estimation APIs
- **Enhanced Mock Data**: Realistic property data when APIs are unavailable
- **Location-based Pricing**: Dynamic price adjustments for different markets
- **Comprehensive Filtering**: Price range, bedrooms, property type, location filters

### 💰 Financial Analysis
- **Cash-on-Cash Return**: (Annual Cash Flow / Total Cash Invested) × 100
- **Cap Rate**: (Annual Net Operating Income / Property Value) × 100
- **Monthly Cash Flow**: Rental income minus all expenses and mortgage
- **Investment Scoring**: 1-10 scale based on multiple KPIs

### 🏗️ Professional Interface
- **Material-UI Design**: Clean, responsive interface for mobile and desktop
- **Step-by-step Wizard**: Guided property analysis workflow
- **Interactive Charts**: Visual representation of investment metrics
- **Property Cards**: Detailed property information with quick analysis

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI v5
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS-in-JS with MUI theming

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AreaSearchForm.tsx       # Location-based property search
│   ├── PropertyListView.tsx     # Property listings with rankings
│   ├── PropertyDetailsForm.tsx  # Property information input
│   ├── FinancingForm.tsx        # Loan and financing details
│   ├── ExpensesForm.tsx         # Operating expenses configuration
│   ├── ResultsDashboard.tsx     # Analysis results and charts
│   └── PropertyCalculator.tsx   # Main application component
├── services/            # API integration
│   └── realEstateService.ts     # Multi-provider real estate APIs
├── types/              # TypeScript definitions
│   └── property.ts             # Property and analysis interfaces
├── utils/              # Business logic
│   └── cashFlowCalculator.ts   # Investment calculation engine
└── assets/             # Static assets
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start
```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173 (or next available port)
```

### API Configuration (Optional)

1. **Get RapidAPI Key**:
   - Sign up at [RapidAPI](https://rapidapi.com/)
   - Subscribe to real estate APIs:
     - [Zillow API](https://rapidapi.com/s.mahmoud97/api/zillow-com1)
     - [Realtor API](https://rapidapi.com/datascrader/api/realtor)
     - [Rentals API](https://rapidapi.com/rentals-com-rentals-com-default/api/rentals-com)

2. **Configure Environment**:
   ```bash
   # Copy .env file and add your API key
   VITE_RAPID_API_KEY=your-actual-api-key-here
   ```

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

> **Note**: The app works perfectly with enhanced mock data if no API key is provided.

## 📈 How to Use

### 1. **Search Properties**
- Enter location (city, state)
- Set price range and criteria
- Choose property types
- Click "Search Properties"

### 2. **Review Investment Rankings**
- Browse properties ranked by investment potential
- View quick analysis metrics
- Check investment scores and recommendations
- Select a property for detailed analysis

### 3. **Analyze Property Details**
- Verify property information
- Input or adjust property details
- Review estimated rental income

### 4. **Configure Financing**
- Set down payment and loan terms
- Adjust interest rate
- Choose loan duration

### 5. **Set Operating Expenses**
- Configure property taxes and insurance
- Set maintenance and management costs
- Add utilities and other expenses

### 6. **View Results**
- Review comprehensive cash flow analysis
- Check ROI metrics and recommendations
- Export or save analysis results

## 💡 Investment Metrics Explained

### Cash-on-Cash Return
Measures the annual return on the actual cash invested:
```
Cash-on-Cash Return = (Annual Cash Flow / Total Cash Invested) × 100
```

### Cap Rate (Capitalization Rate)
Measures the property's potential return on investment:
```
Cap Rate = (Annual Net Operating Income / Property Value) × 100
```

### Investment Score (1-10)
Comprehensive scoring based on:
- **Cash-on-Cash Return** (>10% = Good, >15% = Excellent)
- **Cap Rate** (>8% = Good, >10% = Excellent)
- **Monthly Cash Flow** (>$100 = Positive, >$300 = Excellent)

### Investment Rankings
- **Excellent (8-10)**: Strong buy recommendation
- **Good (6.5-7.9)**: Buy recommendation with good fundamentals
- **Fair (4-6.4)**: Hold or investigate further
- **Poor (<4)**: Avoid or negotiate significantly

## 🎯 Business Logic

### Operating Expense Estimates
- **Property Taxes**: 1.5% of property value annually
- **Insurance**: 0.5% of property value annually
- **Maintenance**: 1% of property value annually
- **Property Management**: 8-12% of rental income (optional)

### Financing Assumptions
- **Down Payment**: 25% (typical for investment properties)
- **Interest Rate**: 7.5% (current market rate)
- **Loan Term**: 30 years
- **Closing Costs**: 3% of purchase price

### Rent Estimation
Advanced model considering:
- **Location multipliers** for different markets
- **Property age** and condition factors
- **Property type** adjustments
- **Square footage** base calculations

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

## 🤝 Contributing

This project follows industry-standard real estate investment practices and can be enhanced with:
- Additional API integrations
- More sophisticated analysis models
- Tax consideration calculators
- Comparative market analysis
- Portfolio management features

## 📄 License

This project is built for educational and investment analysis purposes. Use responsibly and consult with financial professionals for investment decisions.

---

**Built with ❤️ for real estate investors**

*Calculate smarter, invest better* 🏆
