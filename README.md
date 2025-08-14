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

### 🗺️ Interactive Property Maps
- **Location Search**: Find properties by city, state, or ZIP code
- **Map Visualization**: Interactive maps powered by Leaflet
- **Property Markers**: Visual representation of available properties
- **Neighborhood Analysis**: Local market insights

### 💬 Investor Community
- **Discussion Forums**: Connect with fellow investors
- **Market Updates**: Share insights and market trends
- **Property Reviews**: Learn from real experiences
- **Expert Tips**: Professional advice and strategies

### 🔐 Secure Authentication
- **Google OAuth**: Secure Google Sign-In integration
- **Apple Sign In**: Apple authentication support
- **JWT Security**: Secure token-based authentication
- **CSRF Protection**: Advanced security measures

### 💳 Payment Integration
- **Stripe Integration**: PCI-compliant payment processing
- **Subscription Management**: Pro plan features
- **Secure Transactions**: Encrypted payment handling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI v7
- **Build Tool**: Vite for fast development and optimized builds
- **Maps**: Leaflet for interactive property maps
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
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Build & Deploy

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
