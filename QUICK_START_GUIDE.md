# 🚀 Quick Start Guide - Pricing Management System

## ✅ What's Been Done

### 1. Components Created ✓
```
src/pages/tickyourlist/TravelTourGroup/PricingForm/
├── ✅ index.js                    (Main orchestrator)
├── ✅ ListingPriceEditor.js       (Simple pricing)
├── ✅ RuleBasedPricingBuilder.js  (Dynamic pricing)
├── ✅ WeekdaySelector.js          (Day selector)
├── ✅ MonthSelector.js            (Month selector)
├── ✅ DateRangeSelector.js        (Date picker)
├── ✅ PriorityManager.js          (Priority management)
└── ✅ CalendarPreview.js          (Calendar view)
```

### 2. Standalone Page Created ✓
```
src/pages/tickyourlist/PricingManagement/
└── ✅ index.js                    (Full pricing page)
```

### 3. Routing Added ✓
```javascript
// File: src/routes/index.js
✅ Import added (line 189)
✅ Routes added (lines 401-402)
   - /pricing-management/:variantId
   - /pricing-management
```

### 4. Sidebar Navigation Added ✓
```javascript
// File: src/components/VerticalLayout/SidebarContent.js
✅ Menu item added (lines 189-194)
   Under: Product Management → Pricing Management
```

### 5. Documentation Created ✓
```
✅ README.md                       (Component docs)
✅ INTEGRATION_GUIDE.md            (How to integrate)
✅ PAYLOAD_EXAMPLES.json           (API examples)
✅ VARIANT_LIST_INTEGRATION.md     (Variant list buttons)
✅ PRICING_FORM_IMPLEMENTATION_SUMMARY.md (This summary)
✅ QUICK_START_GUIDE.md            (This guide)
```

## 🎯 How to Access

### Method 1: Via Sidebar Menu
1. Start your app: `npm start`
2. Navigate to **Product Management**
3. Click **Pricing Management**
4. Enter or select a variant ID

### Method 2: Direct URL
```
http://localhost:3000/pricing-management/:variantId
```
Replace `:variantId` with actual variant ID

### Method 3: From Variant List (Optional)
Add this button to your variant list component:

```javascript
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

<Button
  color="primary"
  size="sm"
  outline
  onClick={() => navigate(`/pricing-management/${variant._id}`)}
>
  <i className="bx bx-dollar-circle me-1"></i>
  Pricing
</Button>
```

## 📸 Visual Flow

```
┌─────────────────────────────────────────┐
│   Sidebar: Product Management           │
│   ├── Tours & Experiences               │
│   ├── Tour Variants                     │
│   ├── 💰 Pricing Management ← NEW!     │
│   ├── Calendar Pricing                  │
│   └── ...                               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Pricing Management Page                │
│   ┌───────────────────────────────────┐ │
│   │ Variant Info Header               │ │
│   │ Name | ID | City | Status         │ │
│   └───────────────────────────────────┘ │
│                                         │
│   ┌───────────────────────────────────┐ │
│   │ Tabs:                             │ │
│   │ ├─ Listing Price                  │ │
│   │ ├─ Pricing Rules                  │ │
│   │ ├─ Priority Manager               │ │
│   │ └─ Calendar Preview               │ │
│   └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🔧 Configuration Needed

### 1. API Base URL
Set in your environment or axios config:

```javascript
// Option 1: .env file
REACT_APP_API_URL=http://your-api-server:3000/api

// Option 2: axios config
axios.defaults.baseURL = 'http://your-api-server:3000/api'
```

### 2. Authentication Token
Ensure axios has auth token in headers:

```javascript
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 🎨 Features Available

### Tab 1: Listing Price
- Set fixed prices for Adult/Child/Infant
- Original price, final price, deposit
- Discount percentage
- Group size configuration

### Tab 2: Pricing Rules
- Create dynamic pricing rules:
  - ✅ Default (no conditions)
  - ✅ Weekly (specific weekdays)
  - ✅ Seasonal (specific months)
  - ✅ Date-specific (exact dates)
  - ✅ Complex (multiple conditions)
- Priority system (1-100)
- Availability management

### Tab 3: Priority Manager
- View all rules by priority level
- Edit priorities inline
- Color-coded badges
- Conflict detection

### Tab 4: Calendar Preview
- Visual calendar showing applied pricing
- Month navigation
- Currency selection
- Price per day display
- Rule application visualization

## 📝 Example Usage

### 1. Create Simple Listing Price
```javascript
// Navigate to: /pricing-management/:variantId
// Click "Listing Price" tab
// Fill in:
Adult Price: $100
Child Price: $80
Group Size: 1
// Click "Save"
```

### 2. Create Weekend Premium Rule
```javascript
// Navigate to: /pricing-management/:variantId
// Click "Pricing Rules" tab
// Select: "Weekly Pattern"
// Fill in:
Tag: weekend_premium
Name: Weekend Premium
Priority: 18
Days: Fri, Sat, Sun (use quick select)
Adult Price: $150
// Click "Create Pricing Rule"
```

### 3. View in Calendar
```javascript
// Navigate to: /pricing-management/:variantId
// Click "Calendar Preview" tab
// Navigate months to see pricing applied
// Different colors = different priority levels
```

## 🎓 Priority Guidelines

Use these ranges for rule priorities:

| Range  | Level            | Color  | Use Case                    |
|--------|------------------|--------|-----------------------------|
| 90-100 | Emergency        | Red    | Weather, maintenance        |
| 51-89  | Special Events   | Orange | Holidays, festivals         |
| 31-50  | Complex Rules    | Yellow | Month + weekday combos      |
| 21-30  | Seasonal         | Blue   | Summer, winter seasons      |
| 11-20  | Weekly           | Green  | Weekend, weekday patterns   |
| 1-10   | Default          | Gray   | Base/fallback pricing       |

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property '_id' of undefined"
**Solution:** Make sure you're passing a valid variantId in the URL

### Issue: API calls return 404
**Solution:** 
- Check API base URL is configured
- Verify endpoints exist on your backend
- Check authentication token

### Issue: Menu item not showing
**Solution:**
- Clear cache: `npm run build` then restart
- Check browser dev tools for errors
- Verify SidebarContent.js changes saved

### Issue: Routing not working
**Solution:**
- Verify routes/index.js has new imports
- Check React Router version compatibility
- Clear browser cache and restart

## 📱 Responsive Design

All components are fully responsive:
- ✅ Desktop (>1024px) - Full featured
- ✅ Tablet (768-1024px) - Optimized layout
- ✅ Mobile (<768px) - Stacked layout

## 🔐 Security Notes

- Always validate user permissions before showing pricing
- Secure API endpoints with authentication
- Validate all form inputs server-side
- Use HTTPS in production

## 📊 API Endpoints Required

Make sure your backend has these endpoints:

```javascript
GET    /api/v1/tyl-travel-tour-group-variants/:variantId
PUT    /api/v1/tyl-travel-tour-group-variants/:variantId
GET    /api/v1/pricing-rules/:variantId
POST   /api/v1/pricing-rule/:variantId
PUT    /api/v1/pricing-rule/:variantId/:tag
POST   /api/v1/preview-rule-matches/:variantId
```

## 🚦 Testing Steps

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Navigate to pricing:**
   - Click sidebar: Product Management → Pricing Management

3. **Test listing price:**
   - Enter variant ID or navigate with ID in URL
   - Go to "Listing Price" tab
   - Enter adult/child prices
   - Click "Save"
   - Should see success message

4. **Test pricing rules:**
   - Go to "Pricing Rules" tab
   - Select "Weekly Pattern"
   - Choose weekend days
   - Enter prices
   - Click "Create"
   - Should see rule in existing rules table

5. **Test priority manager:**
   - Go to "Priority Manager" tab
   - Should see rules grouped by priority
   - Click "Edit Priority" on a rule
   - Change priority value
   - Click "Save"

6. **Test calendar preview:**
   - Go to "Calendar Preview" tab
   - Should see current month
   - Navigate to different months
   - Should see prices on days
   - Colors should match rule priorities

## ✨ Next Steps

1. **Customize to your needs:**
   - Modify colors in priority functions
   - Add custom validations
   - Extend with additional fields

2. **Add to variant list:**
   - See `VARIANT_LIST_INTEGRATION.md`
   - Add pricing button to variant table

3. **Set up permissions:**
   - Add permission checks if needed
   - Restrict access to authorized users

4. **Deploy:**
   - Build: `npm run build`
   - Deploy to your server
   - Configure production API URL

## 📚 Additional Resources

- **Full Documentation:** `src/pages/tickyourlist/TravelTourGroup/PricingForm/README.md`
- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **API Examples:** `PAYLOAD_EXAMPLES.json`
- **Implementation Summary:** `PRICING_FORM_IMPLEMENTATION_SUMMARY.md`

## 🎉 You're Ready!

Everything is set up and ready to use. Just:
1. Start your app
2. Navigate to Pricing Management
3. Select a variant
4. Start configuring pricing!

---

**Questions?** Check the documentation files or review the code comments in each component.

**Happy Pricing! 🎯**

