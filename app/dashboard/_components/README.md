# Financial Dashboard Components

This directory contains the components for the redesigned financial dashboard.

## Components Overview

### 1. SummaryHeaderStats

- Displays financial health at a glance with key metrics
- Shows current balance, month's credited/debited amounts, net cash flow
- Includes spending change comparison vs last month with tooltips
- Features skeleton loading states for better UX
- Includes sparkline mini-charts for trend visualization
- Uses responsive grid layout with animations and CountUp effects

### 2. CashFlowLineChart

- Dual-line chart for credit vs debit trends
- Includes time period toggles (weekly, monthly, quarterly)
- Shows shaded area representing net cash flow
- Provides detailed tooltips for data points

### 3. CategorySpendingDonut

- Interactive donut chart showing expense distribution by category
- Features drill-down functionality to view transactions within a category
- Automatically groups smaller categories as "Others"
- Displays percentage of total spending and transaction details

### 4. MonthlyTrendChart

- Stacked bar chart showing spending patterns over time
- Color-coded categories for visual consistency
- Limited to displaying top 5 categories + "Others"
- Shows month-to-month changes in spending distribution

### 5. TopCategoriesList

- Horizontal bar visualization of top spending categories
- Includes category icons for better visual recognition
- Shows percentage of total spending and amount for each category
- Presents a ranked view of where money is spent most

### 6. RecentTransactionsMini

- Compact list view of latest transactions
- Smart date formatting (Today, Yesterday, etc.)
- Color-coded by transaction type (credit/debit)
- Includes category icons and descriptions

### 7. SpendingHeatmap

- Calendar heatmap showing daily spending intensity
- Color-coded cells representing spending levels
- Month navigation with current month highlighted
- Shows daily and monthly spending totals

### 8. AIInsightCards

- Optional AI-powered financial insights
- Smart recommendations based on spending patterns
- Dismissible cards for user customization
- Can be toggled on/off via dashboard settings

### 9. DashboardSettings

- Controls for dashboard customization
- Toggle for enabling/disabling AI insights
- Options for layout customization
- Reset option for dashboard defaults

## Usage

All components take a `transactions` prop which should be an array of transaction objects with the following structure:

```javascript
{
  date: "2025-03-11T00:00:00.000Z", // ISO format date string
  amount: 1000, // Numeric amount
  transactionType: "CREDIT", // Transaction type: "CREDIT" or "DEBIT"
  description: "MOHAMMAD SUFYAN", // Transaction description
  category: "P2P Transfer", // Transaction category
  transactionId: "T2503112107052780850120", // Unique transaction ID
  userId: "67e67942a524dfc3177697e0" // User ID
}
```

Some components may take additional props, such as `currentBalance` for the SummaryHeaderStats component, or `isLoading` to control loading states.

## Implementation

The components use a consistent currency formatting function across all visualizations:

```javascript
const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};
```

The components correctly interpret transaction data where:

- "CREDIT" transaction types increase available funds
- "DEBIT" transaction types decrease available funds
- Amounts are processed based on the `transactionType` rather than the sign of the amount
- All date calculations handle ISO format dates properly

All components are responsive and work well on both desktop and mobile viewports.

## Libraries Used

- Recharts for charts and visualizations
- Framer Motion for animations
- Radix UI for accessible UI components
- ChartJS for interactive charts
- TailwindCSS for styling

## Future Improvements

- Add export functionality for individual charts and visualizations
- Implement date range filtering within components
- Add more advanced AI insights based on spending patterns
- Include budget integration with spending categories
- Add comparison views against previous periods
