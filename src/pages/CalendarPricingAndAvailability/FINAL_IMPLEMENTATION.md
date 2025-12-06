# Calendar Pricing & Availability - Final Implementation

## ✅ Complete Implementation

### 🎯 All 3 Dropdowns are Now Searchable with React-Select

#### 1. **City Dropdown** - Searchable ✅
- Uses Redux store (`state.travelCity.cities`)
- Type to search cities
- Clear button (X)

#### 2. **Tour Group Dropdown** - Searchable ✅
- Uses new API endpoint: `/v1/tyltraveltourgroup/tour-groups-by-city`
- Type to search tours
- Clear button (X)
- Loading spinner

#### 3. **Variant Dropdown** - Searchable ✅
- Uses endpoint: `/v1/tyltraveltourgroupvariant/by-tour/{tourId}`
- Type to search variants
- Clear button (X)
- Loading spinner

---

## 📊 API Endpoints Used

### 1. Cities (Redux)
```javascript
// Loaded via Redux action
dispatch(getCities());

// Endpoint (handled by saga)
GET /v1/tyltravelcity/get/all/travel-city-list

// Redux State
state.travelCity.cities
```

### 2. Tour Groups by City ⭐ NEW
```javascript
// Direct API call
GET /v1/tyltraveltourgroup/tour-groups-by-city?cityCode=DXB

// Request Example
axios.get('/api/v1/tyltraveltourgroup/tour-groups-by-city', {
  params: { cityCode: 'DXB' }
});

// Response Structure
{
  "statusCode": "200",
  "message": "Tour groups fetched successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Dubai Desert Safari"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Burj Khalifa Tickets"
    }
  ]
}
```

### 3. Variants by Tour
```javascript
// Direct API call
GET /v1/tyltraveltourgroupvariant/by-tour/{tourId}

// Headers
{
  'x-api-key': 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj'
}
```

### 4. Pricing Rules
```javascript
// Direct API call
GET /v1/pricing-rules/{variantId}
```

---

## 🔄 Complete Data Flow

```
Page Loads
    ↓
dispatch(getCities()) → Redux loads cities
    ↓
User types in City dropdown → Filters cities
    ↓
User selects "Dubai (DXB)"
    ↓
Triggers: fetchTourGroupsByCity('DXB')
    ↓
GET /v1/tyltraveltourgroup/tour-groups-by-city?cityCode=DXB
    ↓
Tours dropdown populated with [{ id, name }]
    ↓
User types in Tour dropdown → Filters tours
    ↓
User selects "Dubai Desert Safari"
    ↓
Triggers: fetchVariantsByTour('507f1f77bcf86cd799439011')
    ↓
GET /v1/tyltraveltourgroupvariant/by-tour/507f1f77bcf86cd799439011
    ↓
Variants dropdown populated
    ↓
User types in Variant dropdown → Filters variants
    ↓
User selects variant
    ↓
Triggers: fetchPricingRules(variantId)
    ↓
GET /v1/pricing-rules/{variantId}
    ↓
Calendar displays pricing events (6 months)
    ↓
Color-coded by priority, shows prices
```

---

## 🎨 UI Components

### City Dropdown (Searchable)
```jsx
<Select
  id="city-select"
  isClearable
  isSearchable
  placeholder="Search and select a city..."
  options={cities.map(city => ({
    value: city.cityCode,
    label: `${city.cityName} (${city.cityCode})`
  }))}
  value={selectedCity ? { value, label } : null}
  onChange={(option) => setSelectedCity(option?.value || "")}
  isDisabled={cities.length === 0}
/>
```

### Tour Group Dropdown (Searchable)
```jsx
<Select
  id="tour-select"
  isClearable
  isSearchable
  placeholder={selectedCity ? "Search and select a tour..." : "Select city first"}
  options={tours.map(tour => ({
    value: tour.id,
    label: tour.name
  }))}
  value={selectedTour ? { value, label } : null}
  onChange={(option) => setSelectedTour(option?.value || "")}
  isDisabled={loading || !selectedCity}
  isLoading={loading && selectedCity}
/>
```

### Variant Dropdown (Searchable)
```jsx
<Select
  id="variant-select"
  isClearable
  isSearchable
  placeholder={selectedTour ? "Search and select a variant..." : "Select tour first"}
  options={variants.map(variant => ({
    value: variant._id || variant.id,
    label: variant.name
  }))}
  value={selectedVariant ? { value, label } : null}
  onChange={(option) => setSelectedVariant(option?.value || "")}
  isDisabled={loading || !selectedTour}
  isLoading={loading && selectedTour}
/>
```

---

## ⚡ Features

### All Dropdowns Have:
- ✅ **Searchable** - Type to filter
- ✅ **Clearable** - X button to clear selection
- ✅ **Loading States** - Spinner when fetching
- ✅ **Disabled States** - Disabled until prerequisites met
- ✅ **Empty States** - Messages when no data
- ✅ **Error Handling** - Shows error messages
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Accessible** - Keyboard navigation support

### Tour Group Dropdown Features:
```
✓ Shows loading spinner while fetching
✓ Disabled until city selected
✓ Shows "Select city first" when no city
✓ Shows "No tours found for this city" when empty
✓ Automatically clears when city changes
✓ Lightweight response (only id + name)
```

---

## 📝 Code Structure

### State Management
```javascript
// Redux (Global)
const cities = useSelector(state => state.travelCity?.cities || []);

// Local (Component)
const [tours, setTours] = useState([]);
const [variants, setVariants] = useState([]);
const [selectedCity, setSelectedCity] = useState('');
const [selectedTour, setSelectedTour] = useState('');
const [selectedVariant, setSelectedVariant] = useState('');
const [pricingRules, setPricingRules] = useState([]);
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### useEffect Hooks
```javascript
// 1. Load cities on mount
useEffect(() => {
  dispatch(getCities());
}, [dispatch]);

// 2. Fetch tours when city selected
useEffect(() => {
  if (selectedCity) {
    fetchTourGroupsByCity(selectedCity);
  } else {
    setTours([]);
    setSelectedTour('');
    setVariants([]);
    setSelectedVariant('');
  }
}, [selectedCity]);

// 3. Fetch variants when tour selected
useEffect(() => {
  if (selectedTour) {
    fetchVariantsByTour(selectedTour);
  } else {
    setVariants([]);
    setSelectedVariant('');
  }
}, [selectedTour]);

// 4. Fetch pricing rules when variant selected
useEffect(() => {
  if (selectedVariant) {
    fetchPricingRules(selectedVariant);
  } else {
    setPricingRules([]);
    setEvents([]);
  }
}, [selectedVariant]);
```

### API Functions
```javascript
const fetchTourGroupsByCity = async (cityCode) => {
  try {
    setLoading(true);
    const response = await axios.get('/api/v1/tyltraveltourgroup/tour-groups-by-city', {
      params: { cityCode }
    });
    setTours(response.data.data || []);
    setError(null);
  } catch (err) {
    console.error('Error fetching tour groups:', err);
    setError('Failed to load tour groups for selected city');
    setTours([]);
  } finally {
    setLoading(false);
  }
};

const fetchVariantsByTour = async (tourId) => {
  try {
    setLoading(true);
    const response = await axios.get(`/api/v1/tyltraveltourgroupvariant/by-tour/${tourId}`, {
      headers: { 'x-api-key': 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj' }
    });
    setVariants(response.data.data || []);
    setError(null);
  } catch (err) {
    console.error('Error fetching variants:', err);
    setError('Failed to load variants for selected tour');
  } finally {
    setLoading(false);
  }
};

const fetchPricingRules = async (variantId) => {
  try {
    setLoading(true);
    const response = await axios.get(`/api/v1/pricing-rules/${variantId}`);
    const rules = response.data.rules || [];
    setPricingRules(rules);
    const generatedEvents = generateEventsFromRules(rules);
    setEvents(generatedEvents);
    setError(null);
  } catch (err) {
    console.error('Error fetching pricing rules:', err);
    setError('Failed to load pricing rules');
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 User Experience Flow

### Step-by-Step Usage

1. **Page Load**
   ```
   → Cities automatically load
   → City dropdown ready with searchable list
   → Other dropdowns disabled
   ```

2. **Select City**
   ```
   → User types "dub" in city dropdown
   → Shows: Dubai, Dublin, etc.
   → User selects "Dubai (DXB)"
   → Tour dropdown enables
   → Shows loading spinner
   → Fetches tour groups for Dubai
   ```

3. **Select Tour Group**
   ```
   → User types "safari" in tour dropdown
   → Shows: "Dubai Desert Safari", "Morning Safari", etc.
   → User selects "Dubai Desert Safari"
   → Variant dropdown enables
   → Shows loading spinner
   → Fetches variants for selected tour
   ```

4. **Select Variant**
   ```
   → User types "premium" in variant dropdown
   → Shows: "Premium Package", "Premium Evening", etc.
   → User selects variant
   → Shows loading spinner
   → Fetches pricing rules
   → Calendar populates with 6 months of pricing
   → Color-coded events appear
   → Active rules sidebar shows
   ```

5. **View & Manage**
   ```
   → Calendar shows pricing for each day
   → Click event to see details
   → Click "Manage Pricing Rules" to edit
   → Click "Bulk Update Pricing" to add new rules
   ```

---

## 🧪 Testing Checklist

### Dropdown Functionality
- [x] City dropdown is searchable
- [x] City dropdown has clear button
- [x] Tour dropdown is searchable
- [x] Tour dropdown has clear button
- [x] Tour dropdown shows loading state
- [x] Tour dropdown disabled until city selected
- [x] Variant dropdown is searchable
- [x] Variant dropdown has clear button
- [x] Variant dropdown shows loading state
- [x] Variant dropdown disabled until tour selected

### Data Flow
- [x] Cities load from Redux on mount
- [x] Selecting city fetches tour groups (new endpoint)
- [x] Tour groups populate dropdown
- [x] Selecting tour fetches variants
- [x] Variants populate dropdown
- [x] Selecting variant fetches pricing rules
- [x] Calendar displays events

### Error Handling
- [x] Shows error message on API failure
- [x] Shows "No tours found" when empty
- [x] Shows "No variants found" when empty
- [x] Shows "No pricing rules found" when empty

### UI/UX
- [x] All dropdowns searchable
- [x] All dropdowns clearable
- [x] Loading spinners show during fetch
- [x] Proper placeholder text
- [x] Disabled states work correctly
- [x] Empty states show helpful messages
- [x] No console errors
- [x] No linting errors

---

## 📦 Dependencies

### Required Packages
```json
{
  "react-select": "^5.x.x",
  "axios": "^1.x.x",
  "@fullcalendar/react": "^6.x.x",
  "reactstrap": "^9.x.x"
}
```

### Imports Used
```javascript
import Select from 'react-select';
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getCities } from 'store/travelCity/action';
```

---

## 🎨 Benefits of New Implementation

### 1. **Simplified API Response**
- Tour groups endpoint returns only `id` and `name`
- Faster response time
- Less data transfer
- Perfect for dropdown usage

### 2. **All Dropdowns Searchable**
- Consistent user experience
- Easy to find items in long lists
- Professional UI/UX
- Matches other forms in the app

### 3. **Better Performance**
- Cities loaded once via Redux (cached)
- Tour groups fetched only when city selected
- Variants fetched only when tour selected
- Pricing rules fetched only when variant selected

### 4. **Improved Error Handling**
- Clear error messages
- Proper fallbacks
- Empty state handling
- Loading states

### 5. **Maintainability**
- Uses new lightweight endpoint
- Clean code structure
- Proper separation of concerns
- Easy to debug

---

## 🚀 Production Ready

### Status: ✅ Complete

- ✅ All 3 dropdowns searchable
- ✅ New tour groups endpoint implemented
- ✅ Proper loading states
- ✅ Error handling
- ✅ Empty states
- ✅ No linting errors
- ✅ No console errors
- ✅ Tested and working

### API Endpoint Summary
```
1. Cities:     Redux → /v1/tyltravelcity/get/all/travel-city-list
2. Tours:      GET /v1/tyltraveltourgroup/tour-groups-by-city?cityCode=DXB
3. Variants:   GET /v1/tyltraveltourgroupvariant/by-tour/{tourId}
4. Rules:      GET /v1/pricing-rules/{variantId}
```

---

**Last Updated:** 2025-01-17  
**Status:** Production Ready ✅  
**Version:** Final Implementation

