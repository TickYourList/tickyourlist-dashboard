# TickYourList Dashboard

A comprehensive React-based administrative dashboard application focused on automobile management with additional e-commerce, authentication, and various UI components.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **Python**: Version 3 or higher
- **npm** or **yarn** package manager

### Verify Prerequisites

```bash
node --version  # Should be 20+
python --version # Should be 3+
npm --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tickyourlist-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## 📁 Folder Structure

```
tickyourlist-dashboard/
├── public/
│   ├── index.html              # Main HTML template
│   ├── favicon.ico             # App favicon
│   └── manifest.json           # PWA manifest
├── src/
│   ├── App.js                  # Main application component
│   ├── index.js               # Application entry point
│   ├── config.js              # Application configuration
│   ├── i18n.js                # Internationalization setup
│   ├── assets/                # Static assets
│   │   ├── fonts/             # Custom fonts (Boxicons)
│   │   ├── images/            # Images and icons
│   │   ├── helperJsonData/    # JSON data files
│   │   ├── lang/              # Language files
│   │   └── scss/              # SCSS stylesheets
│   ├── components/            # Reusable UI components
│   │   ├── Common/            # Shared components
│   │   ├── VerticalLayout/    # Vertical layout components
│   │   ├── HorizontalLayout/  # Horizontal layout components
│   │   └── CommonForBoth/     # Components used in both layouts
│   ├── constants/             # Application constants
│   │   └── layout.js          # Layout configuration constants
│   ├── helpers/               # Utility functions and API helpers
│   │   ├── api_helper.js      # Axios configuration and API methods
│   │   ├── jwt-token-access/  # JWT token management
│   │   └── AuthType/          # Authentication helpers
│   ├── pages/                 # Page components
│   │   ├── Authentication/    # Auth pages (Login, Register, etc.)
│   │   ├── Automobile/        # Automobile management modules
│   │   │   ├── Dashboard/     # Automobile dashboard
│   │   │   ├── CarBrands/     # Car brand management
│   │   │   ├── CarModels/     # Car model management
│   │   │   ├── CarVariants/   # Car variant management
│   │   │   ├── CarBlogs/      # Car blog management
│   │   │   ├── CarCustomers/  # Customer management
│   │   │   ├── CarDealers/    # Dealer management
│   │   │   ├── Banner/        # Banner management
│   │   │   └── AutomobileCollections/ # Collection management
│   │   ├── Collections/       # E-commerce collections
│   │   ├── Ecommerce/         # E-commerce modules
│   │   ├── Settings/          # Application settings pages
│   │   ├── Dashboard/         # General dashboard components
│   │   ├── Charts/            # Chart components
│   │   ├── Forms/             # Form components
│   │   ├── Tables/            # Table components
│   │   ├── Ui/                # UI components showcase
│   │   └── Utility/           # Utility pages
│   ├── routes/                # Routing configuration
│   │   ├── index.js           # Route definitions
│   │   └── route.js           # Authentication middleware
│   ├── store/                 # Redux store configuration
│   │   ├── index.js           # Store setup
│   │   ├── reducers.js        # Root reducer
│   │   ├── actions.js         # Action creators
│   │   ├── auth/              # Authentication state management
│   │   ├── automobiles/       # Automobile state management
│   │   ├── dashboard/         # Dashboard state management
│   │   └── layout/            # Layout state management
│   └── locales/               # Internationalization files
│       ├── eng/               # English translations
│       ├── gr/                # Greek translations
│       ├── it/                # Italian translations
│       ├── rs/                # Russian translations
│       └── sp/                # Spanish translations
├── package.json               # Dependencies and scripts
├── jsconfig.json              # JavaScript configuration
└── yarn.lock                  # Dependency lock file
```

## 🔄 Application Flow

### 1. Application Bootstrap
- `src/index.js` - Entry point that renders the App component
- Redux store initialization with saga middleware
- React Router setup for navigation
- Internationalization (i18n) configuration

### 2. Authentication Flow
```
User Access → Authmiddleware → Check localStorage['authUser'] 
   ↓
   If Not Authenticated → Redirect to /login
   ↓
   If Authenticated → Render Protected Route
```

### 3. Layout System
- **Vertical Layout** (Default): Traditional sidebar navigation
- **Horizontal Layout**: Top navigation bar
- Dynamic layout switching based on Redux state
- Responsive design with mobile detection

### 4. State Management (Redux)
- **Actions**: User interactions and API calls
- **Reducers**: State updates
- **Sagas**: Side effects and async operations
- **Store**: Centralized state container

### 5. API Integration
- Axios-based HTTP client with interceptors
- JWT token authentication
- Base URL configuration: `http://localhost:3005` (development)
- API key authentication support

### 6. Routing Structure
- **Public Routes**: Login, Register, Password Reset, Error pages
- **Protected Routes**: Dashboard, Automobile modules, Settings, etc.
- Route-based code splitting
- Authentication middleware for protected routes

## 🏗️ Key Features

### Automobile Management
- **Dashboard**: Overview of automobile data
- **Car Brands**: Brand management with sorting capabilities
- **Car Models**: Model catalog management
- **Car Variants**: Variant details and specifications
- **Car Blogs**: Content management for automotive blogs
- **Customers**: Customer relationship management
- **Dealers**: Dealer network management
- **Collections**: Automobile collections and categorization

### E-commerce Features
- **Domain Management**: Domain purchasing and management
- **Collections**: Product collections
- **Customer Management**: E-commerce customer data
- **Order Management**: Order processing and tracking

### UI Components
- **Charts**: Multiple chart libraries (ApexCharts, Chart.js, etc.)
- **Forms**: Advanced form components with validation
- **Tables**: Data tables with sorting, filtering, pagination
- **UI Elements**: Buttons, alerts, modals, carousels, etc.

### Additional Features
- **Multi-language Support**: 5 languages (English, Greek, Italian, Russian, Spanish)
- **Responsive Design**: Mobile and desktop optimized
- **Theme Customization**: Multiple layout and color themes
- **Authentication**: Complete auth system with JWT
- **Settings**: Application configuration pages

## 🔧 Configuration

### API Configuration
Update `src/helpers/api_helper.js`:
```javascript
const API_URL = "http://localhost:3005"; // Development
// const API_URL = "https://api.univolenitsolutions.com"; // Production
```

### Layout Configuration
Modify `src/constants/layout.js` for layout options:
- Layout types (Vertical/Horizontal)
- Theme modes (Light/Dark)
- Sidebar configurations
- Topbar themes

## 🌐 Environment Setup

### Development Environment
1. Ensure Node.js 20+ is installed
2. Ensure Python 3+ is available (for build tools)
3. Install dependencies: `npm install`
4. Start development server: `npm start`

### Production Build
1. Create production build: `npm run build`
2. The build folder will contain optimized production files
3. Deploy the contents of the build folder to your web server

## 🔐 Authentication

The application uses JWT-based authentication:
- Login credentials are validated against the API
- JWT tokens are stored in localStorage
- API calls include Authorization header with Bearer token
- Automatic token refresh mechanism

## 📱 Responsive Design

- Mobile-first approach
- Breakpoint-based responsive design
- Touch-friendly interface for mobile devices
- Collapsible sidebar for mobile navigation

## 🎨 Styling

- **SCSS**: Modular stylesheet organization
- **Bootstrap 5**: UI framework
- **Custom Themes**: Multiple color schemes
- **Responsive Grid**: Flexible layout system

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Node Version Issues**
   ```bash
   # Use Node Version Manager
   nvm install 20
   nvm use 20
   ```

3. **Package Installation Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📈 Performance Considerations

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization
- Redux state normalization
- Efficient re-rendering with React.memo

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 📧 Support

For technical support or questions, please contact the development team.

---

**Note**: This application requires a backend API running on `http://localhost:3005` for full functionality. Ensure the backend service is running before starting the frontend application. 