# Dashboard Sidebar Features

## Overview

The dashboard now features a beautiful, modern sidebar navigation system that replaces the previous header-based navigation with backtest and create strategy buttons. The design uses a clean white and blue color scheme that matches the rest of the website. **The sidebar is now persistent across all dashboard pages except the settings page.**

## Features

### 🎨 Modern Design

- **Clean White Background**: Crisp white sidebar with subtle blue accents
- **Blue Accent Colors**: Uses the website's primary blue (#0D6EFD) for highlights and active states
- **Smooth Animations**: CSS transitions and hover effects for all interactive elements
- **Professional Typography**: Clean, readable fonts with proper spacing

### 📱 Responsive Layout

- **Collapsible Sidebar**: Toggle between full (280px) and collapsed (80px) modes
- **Mobile-First**: Responsive design that works on all screen sizes
- **Mobile Menu**: Hamburger menu for mobile devices with overlay
- **Persistent Navigation**: Sidebar appears on all pages except settings

### 🧭 Navigation

- **Dashboard**: Main dashboard view with portfolio overview and key metrics
- **Backtest**: Strategy backtesting interface
- **Strategy Builder**: Create and configure trading strategies
- **Portfolio**: Portfolio management and overview
- **Analytics**: Trading analytics and insights
- **Settings**: User preferences and configuration (no sidebar)

### ⚡ Interactive Elements

- **Active Route Highlighting**: Current page is highlighted with blue gradient
- **Hover Effects**: Smooth transitions and visual feedback
- **Collapse Toggle**: Button to expand/collapse sidebar
- **User Profile**: User avatar and information display
- **Logout Button**: Styled logout button with icon

## Usage

### Desktop

1. **Full Sidebar**: Default view shows all navigation items with labels
2. **Collapsed Sidebar**: Click the toggle button (←/→) to collapse to icon-only view
3. **Navigation**: Click any navigation item to navigate to different sections
4. **Persistent**: Sidebar remains visible when navigating between dashboard pages

### Mobile

1. **Hamburger Menu**: Click the menu button (☰) to open the sidebar
2. **Overlay**: Dark overlay appears behind the sidebar
3. **Auto-Close**: Sidebar automatically closes when navigating to a new page
4. **Persistent**: Sidebar state is maintained across page navigation

## Page Structure

### Pages WITH Sidebar

- **Dashboard** (`/dashboard`) - Main dashboard with portfolio overview
- **Backtest** (`/backtest`) - Strategy backtesting interface
- **Strategy Builder** (`/builder`) - Strategy creation and configuration
- **Portfolio** (`/portfolio`) - Portfolio management (coming soon)
- **Analytics** (`/analytics`) - Trading analytics (coming soon)

### Pages WITHOUT Sidebar

- **Settings** (`/settings`) - User preferences and configuration

## Technical Details

### Architecture

- **DashboardLayout Component**: Wraps all pages that need the sidebar
- **React Router Outlet**: Uses nested routing to render page content within the layout
- **Shared State**: Sidebar collapse state and mobile menu state are maintained across navigation

### CSS Classes

- `.dashboard-sidebar`: Main sidebar container
- `.sidebar-navigation`: Navigation menu section
- `.nav-link`: Individual navigation links
- `.nav-link.active`: Active/current page styling
- `.sidebar-footer`: User profile and logout section

### State Management

- `sidebarCollapsed`: Controls sidebar width (280px vs 80px)
- `mobileMenuOpen`: Controls mobile menu visibility
- `location`: React Router location for active route detection

### Responsive Breakpoints

- **1024px and below**: Sidebar becomes fixed overlay
- **768px and below**: Single-column layout for cards
- **Mobile**: Stacked header layout with hamburger menu

## Customization

### Colors

The sidebar now uses a clean white and blue theme that matches the website:

- **Background**: `var(--white)` (#ffffff)
- **Primary Blue**: `var(--primary-blue)` (#0D6EFD)
- **Secondary Blue**: `var(--primary-purple)` (#0B5ED7)
- **Text Dark**: `var(--text-dark)` (#1a202c)
- **Text Light**: `var(--text-light-gray)` (#718096)
- **Borders**: Subtle blue tints using `rgba(13, 110, 253, 0.1)`

### Icons

Navigation items now use clean, minimalist SVG icons instead of emojis:

- **Dashboard**: Three horizontal lines (hamburger menu style)
- **Backtest**: Clock icon representing time-based testing
- **Strategy Builder**: Pencil icon representing creation and editing
- **Portfolio**: Wallet/money icon representing portfolio
- **Analytics**: Bar chart icon representing data analysis
- **Settings**: Gear icon representing configuration

All icons use the `currentColor` property, meaning they automatically inherit the text color and change to blue when the navigation item is active.

### Animations

All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, professional feel.

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- CSS custom properties (CSS variables)
- CSS transitions and transforms
- WebKit scrollbar styling
