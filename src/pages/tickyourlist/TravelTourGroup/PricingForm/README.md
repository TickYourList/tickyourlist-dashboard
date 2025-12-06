# Pricing Form Components

## Overview

This directory contains a comprehensive pricing management system for tour variants. The system supports multiple pricing models including simple listing prices, rule-based dynamic pricing, priority management, and calendar preview.

## Components

### 1. `index.js` - Main Pricing Form
The main component that orchestrates all pricing functionality.

**Features:**
- Auto-detects pricing model type
- Shows appropriate UI based on configuration
- Displays recommendations
- Tab-based navigation

**Usage:**
```jsx
import PricingForm from "./PricingForm"

<PricingForm variantId="507f1f77bcf86cd799439011" />
```

### 2. `ListingPriceEditor.js`
Simple fixed pricing editor for variants.

**Features:**
- Adult/Child/Infant pricing configuration
- Original price, final price, minimum deposit
- Discount percentage
- Group size settings

**Pricing Structure:**
```javascript
{
  listingPrice: {
    prices: [
      {
        type: "adult",
        originalPrice: 100,
        finalPrice: 100,
        minimumPayablePrice: 20,
        bestDiscount: 0,
        ageRange: { min: 18, max: 99 }
      },
      // ... child, infant
    ],
    groupSize: 1
  }
}
```

### 3. `RuleBasedPricingBuilder.js`
Create dynamic pricing rules based on conditions.

**Rule Types:**
- **Default**: No conditions, applies to all dates
- **Weekly**: Specific weekdays (e.g., weekends)
- **Seasonal**: Specific months (e.g., summer)
- **Date Specific**: Exact date ranges (e.g., holidays)
- **Complex**: Multiple conditions combined

**Priority Guidelines:**
- 90-100: Emergency overrides
- 51-89: Special events
- 31-50: Complex combinations
- 21-30: Seasonal patterns
- 11-20: Weekly patterns
- 1-10: Default pricing

**Example Payload:**
```javascript
{
  tag: "weekend_premium",
  name: "Weekend Premium Pricing",
  priority: 18,
  conditions: {
    weekdays: [5, 6, 0] // Fri, Sat, Sun
  },
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 150, originalPrice: 150 },
      { type: "child", finalPrice: 120, originalPrice: 120 }
    ]
  }],
  isActive: true
}
```

### 4. `WeekdaySelector.js`
Interactive weekday selection component.

**Features:**
- Individual day selection
- Quick presets (Weekdays, Weekend, All)
- Visual feedback

### 5. `MonthSelector.js`
Interactive month selection component.

**Features:**
- Individual month selection
- Seasonal presets (Summer, Winter, Spring, Fall)
- Visual feedback

### 6. `DateRangeSelector.js`
Add specific date ranges.

**Features:**
- Start and end date picker
- Optional year specification
- Recurring vs. one-time ranges
- Visual list of added ranges

### 7. `PriorityManager.js`
Manage rule priorities and order.

**Features:**
- View rules grouped by priority level
- Edit individual priorities
- Color-coded priority badges
- Real-time updates

### 8. `CalendarPreview.js`
Visual calendar showing pricing application.

**Features:**
- Monthly calendar view
- Navigate between months
- Color-coded priorities
- Price display per day
- Shows which rule applies to each date

## API Integration

### Required Endpoints

#### 1. Get Variant
```
GET /api/v1/tyl-travel-tour-group-variants/:variantId
```

#### 2. Update Variant (Listing Price)
```
PUT /api/v1/tyl-travel-tour-group-variants/:variantId
Body: { listingPrice: {...} }
```

#### 3. Get Pricing Rules
```
GET /api/v1/pricing-rules/:variantId
Query params: { includeInactive: boolean }
```

#### 4. Create Pricing Rule
```
POST /api/v1/pricing-rule/:variantId
Body: { tag, name, priority, conditions, dayPricing, ... }
```

#### 5. Update Pricing Rule
```
PUT /api/v1/pricing-rule/:variantId/:tag
Body: { priority, ... }
```

#### 6. Preview Rule Matches
```
POST /api/v1/preview-rule-matches/:variantId
Body: { startDate, endDate, currency }
```

## Complete Examples

### Example 1: Simple Listing Price

```javascript
const payload = {
  listingPrice: {
    prices: [
      {
        type: "adult",
        originalPrice: 100,
        finalPrice: 100,
        minimumPayablePrice: 20,
        ageRange: { min: 18, max: 99 }
      },
      {
        type: "child",
        originalPrice: 80,
        finalPrice: 80,
        minimumPayablePrice: 16,
        ageRange: { min: 3, max: 17 }
      },
      {
        type: "infant",
        originalPrice: 0,
        finalPrice: 0,
        ageRange: { min: 0, max: 2 }
      }
    ],
    groupSize: 1,
    otherPricesExist: false
  }
}
```

### Example 2: Default Pricing Rule

```javascript
const defaultRule = {
  variantId: "507f1f77bcf86cd799439011",
  tag: "default_pricing",
  name: "Default Pricing",
  priority: 5,
  conditions: {},
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 100, originalPrice: 100 },
      { type: "child", finalPrice: 80, originalPrice: 80 }
    ]
  }],
  isActive: true
}
```

### Example 3: Weekend Premium

```javascript
const weekendRule = {
  variantId: "507f1f77bcf86cd799439011",
  tag: "weekend_premium",
  name: "Weekend Premium",
  priority: 18,
  conditions: {
    weekdays: [5, 6, 0]
  },
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 150, originalPrice: 150 },
      { type: "child", finalPrice: 120, originalPrice: 120 }
    ]
  }],
  isActive: true
}
```

### Example 4: Summer Season

```javascript
const summerRule = {
  variantId: "507f1f77bcf86cd799439011",
  tag: "summer_peak",
  name: "Summer Peak Season",
  priority: 28,
  conditions: {
    months: [6, 7, 8]
  },
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 200, originalPrice: 200 },
      { type: "child", finalPrice: 160, originalPrice: 160 }
    ]
  }],
  isActive: true
}
```

### Example 5: Complex (Summer Weekend)

```javascript
const complexRule = {
  variantId: "507f1f77bcf86cd799439011",
  tag: "summer_weekend_premium",
  name: "Summer Weekend Premium",
  priority: 38,
  conditions: {
    months: [6, 7, 8],
    weekdays: [5, 6, 0]
  },
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 250, originalPrice: 250 },
      { type: "child", finalPrice: 200, originalPrice: 200 }
    ]
  }],
  isActive: true
}
```

### Example 6: Holiday Special

```javascript
const holidayRule = {
  variantId: "507f1f77bcf86cd799439011",
  tag: "christmas_newyear",
  name: "Christmas & New Year",
  priority: 85,
  conditions: {
    dateRanges: [{
      startDate: "2024-12-20",
      endDate: "2025-01-05",
      year: 2024
    }]
  },
  dayPricing: [{
    currency: "USD",
    prices: [
      { type: "adult", finalPrice: 300, originalPrice: 300 },
      { type: "child", finalPrice: 240, originalPrice: 240 }
    ]
  }],
  isActive: true
}
```

## Integration with NewTourModel.js

Add as a new tab in the tour creation/editing wizard:

```javascript
// In NewTourModel.js

import PricingForm from "./PricingForm"

// Add to TabPane navigation
<TabPane tabId={11}>
  <PricingForm variantId={variantId} />
</TabPane>
```

## Styling

Components use Reactstrap and Bootstrap classes. Colors are configured for priority levels:
- Red (danger): 90-100
- Orange (warning): 51-89
- Yellow (info): 31-50
- Blue (primary): 21-30
- Green (success): 11-20
- Gray (secondary): 1-10

## Error Handling

All components include:
- Loading states
- Error messages
- Success confirmations
- Validation feedback

## Best Practices

1. **Always create a default rule** for variants with rule-based pricing
2. **Use appropriate priorities** based on the guidelines
3. **Test with calendar preview** before activating rules
4. **Avoid priority conflicts** by using unique values
5. **Document complex rules** in the description field

## Troubleshooting

### No prices showing in calendar
- Check if rules are active (`isActive: true`)
- Verify priority values are correct
- Ensure conditions are properly formatted

### Multiple rules conflicting
- Review priorities in Priority Manager
- Higher priority always wins
- Check date overlaps

### API errors
- Verify variant ID exists
- Check authentication token
- Ensure rule tags are unique

## Future Enhancements

- Bulk rule operations
- Rule templates
- Import/export functionality
- Analytics dashboard
- Multi-currency support expansion
- Time slot integration

