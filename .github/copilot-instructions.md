<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Rental Property Cash Flow Calculator

This is a React TypeScript project built with Vite for analyzing rental property investments and calculating cash flow returns.

## Project Structure
- **Components**: UI components for property search, data entry forms, and results dashboard
- **Types**: TypeScript interfaces for property data, financing, expenses, and analysis results
- **Utils**: Calculation engines for cash flow analysis and investment recommendations
- **Services**: Mock real estate data services (ready for API integration)

## Key Features
- Property search and data fetching
- Cash flow calculations based on rental income, expenses, and financing
- ROI analysis with cash-on-cash return, cap rate, and other KPIs
- Investment recommendation engine with scoring system
- Professional Material-UI interface

## Development Guidelines
- Use TypeScript strict mode and proper type imports
- Follow Material-UI design patterns with consistent spacing and theming
- Keep calculations accurate and based on real estate industry standards
- Ensure responsive design for mobile and desktop
- Use proper error handling for API calls and user input validation

## Business Logic
- Cash-on-cash return calculation: (Annual Cash Flow / Total Cash Invested) × 100
- Cap rate calculation: (Annual Net Operating Income / Property Value) × 100
- Investment scoring based on multiple KPIs with recommendations (Strong Buy, Buy, Hold, Avoid)
- Operating expense estimates follow industry standards (1-2% of property value annually)
