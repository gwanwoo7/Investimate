# 🏠 Investimate - Rental Cash Flow Calculator

A comprehensive React TypeScript application for analyzing rental property investments and calculating cash flow returns.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-7.x-purple)

## 🚀 Live Demo

**[View Live Application](https://investimate.netlify.app)** ← Will be updated after deployment

## ✨ Features

### 🧮 Investment Calculator
- **Property Analysis**: Comprehensive cash flow calculations
- **ROI Metrics**: Cash-on-cash return, cap rate, and investment scoring
- **Market Data**: Real estate API integration for property values
- **Expense Tracking**: Operating costs, taxes, insurance, and maintenance

### 🏘️ Property Data Integration
- **Apify Zillow Scraper**: Premium data extraction with up to 20 photos per property
- **Comprehensive Property Details**: Square footage, lot size, year built, renovations
- **Market Analytics**: Price history, days on market, listing history
- **Neighborhood Insights**: School ratings, walk scores, crime ratings
- **Virtual Tours**: 3D tour links and walkthrough videos
- **RapidAPI Fallback**: Backup data source for reliability
- **Real-time Updates**: Fresh property data and market trends
### 🗺️ Interactive Property Maps
- **Google Maps Integration**: Professional mapping with Google Maps JavaScript API
- **Boundary Drawing**: Interactive polygon drawing for custom search areas
- **Property Markers**: Enhanced markers with price displays and detailed info windows
- **Location Services**: Automatic current location detection and centering
- **Fullscreen Mode**: Immersive map experience with responsive controls
- **Property Clustering**: Smart grouping of nearby properties for better performance

### 💬 Investor Community
- **Discussion Forums**: Connect with fellow investors
- **Market Updates**: Share insights and market trends
- **Property Reviews**: Learn from real experiences
- **Expert Tips**: Professional advice and strategies

### 🔐 Authentication & Security
- **Google OAuth**: Secure Google Sign-In integration
- **Apple Sign In**: Apple authentication support  
- **Demo Login**: Quick testing without registration
- **Local Storage**: Secure session management
- **OAuth Provider Support**: Extensible authentication system

### 💳 Payment Integration
- **Stripe Integration**: PCI-compliant payment processing
- **Subscription Management**: Pro plan features
- **Secure Transactions**: Encrypted payment handling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI v7
- **Build Tool**: Vite for fast development and optimized builds
- **Maps**: Google Maps JavaScript API with drawing tools
- **Icons**: Lucide React for modern iconography
- **State Management**: React Hooks and Context

## 🚦 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gwanwoo7/Investimate.git
   cd Investimate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Google Maps API key and other credentials
   ```

4. **Configure Google Maps API**
   - Get API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Drawing API
   - Add API key to `.env.local` as `VITE_GOOGLE_MAPS_API_KEY`
   - See [GOOGLE_MAPS_SETUP_GUIDE.md](./GOOGLE_MAPS_SETUP_GUIDE.md) for details

5. **Start development server**
   ```bash
   npm run dev
   ```

## � OAuth Setup (Optional)

To enable Google and Apple authentication:

1. **Copy Environment Variables**
   ```bash
   cp .env.example .env
   ```

2. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your Client ID to `.env` as `VITE_GOOGLE_CLIENT_ID`

3. **Configure Apple Sign In**
   - Set up Apple Developer account
   - Create Service ID for Sign In with Apple
   - Add Client ID to `.env` as `VITE_APPLE_CLIENT_ID`

4. **Detailed Setup Guide**
   - See [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md) for complete instructions

## 🏘️ Property Data APIs

The application supports multiple data sources for comprehensive property information:

### 🚀 Apify Zillow Scraper (Recommended)
**Premium data extraction with enhanced property details**

- **Features**: Up to 20 photos per property, virtual tours, price history
- **Data Quality**: Comprehensive neighborhood insights and market analytics
- **Setup**: See [APIFY_SETUP_GUIDE.md](./APIFY_SETUP_GUIDE.md) for detailed instructions

```bash
# Add to .env
VITE_APIFY_API_TOKEN=your_apify_token_here
```

### 📡 RapidAPI Zillow (Fallback)
**Reliable backup data source**

- **Features**: Basic property data with primary photos
- **Setup**: Get API key from [RapidAPI Zillow](https://rapidapi.com/s.mahmoud97/api/zillow-com1)

```bash
# Add to .env
VITE_RAPID_API_KEY=your_rapidapi_key_here
```

### 🔄 Auto-Fallback System
The application automatically:
1. **Tries Apify first** (if token configured)
2. **Falls back to RapidAPI** if Apify fails
3. **Uses demo data** if both APIs unavailable

> **Note**: OAuth is optional. The app includes a demo login for testing without OAuth setup.

## �🔧 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Deploy to Netlify
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or drag & drop the dist folder to netlify.com/drop
```

## 📊 Key Calculations

### Cash Flow Analysis
- **Monthly Cash Flow** = Rental Income - Operating Expenses
- **Cash-on-Cash Return** = (Annual Cash Flow / Total Cash Invested) × 100
- **Cap Rate** = (Annual Net Operating Income / Property Value) × 100

### Investment Scoring
- **Strong Buy**: Cap rate > 8%, Cash-on-Cash > 12%
- **Buy**: Cap rate > 6%, Cash-on-Cash > 8%
- **Hold**: Cap rate > 4%, Cash-on-Cash > 4%
- **Avoid**: Below minimum thresholds

## 🔐 Security Features

- **OAuth 2.0 Authentication**: Google and Apple Sign-In
- **PCI Compliance**: Secure payment processing
- **CSRF Protection**: Cross-site request forgery prevention
- **Security Headers**: Comprehensive security policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

⭐ **Star this repo if you find it helpful!**

Built with ❤️ for the real estate investor community
