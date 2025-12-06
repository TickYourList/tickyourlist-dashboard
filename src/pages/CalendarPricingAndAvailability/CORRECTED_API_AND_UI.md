# Calendar Pricing & Availability - Corrected API & UI

## ✅ Changes Made

### 1. **Corrected Tour Groups API Endpoint**

#### ❌ Previous (Wrong)
```javascript
const response = await axios.get('/api/v1/tyl-travel-tour-groups', {
  params: { cityCode: cityCode, status: true, limit: 200 }
});
```

#### ✅ Current (Correct)
```javascript
// Now uses existing Redux action
import { fetchTourGroupsRequest } from 'store/tickyourlist/travelTourGroup/action';

// In component
dispatch(fetchTourGroupsRequest({
  page: 1,
  limit: 200,
  cityCode: selectedCity
}));

// This internally calls:
// GET /v1/tyltraveltourgroup/get/all/travel-tour-groups-list?page=1&limit=200&cityCode=DUBAI
```

**Source:** `src/helpers/locationManagement_url_helpers.js` (Line 32-33)
```javascript
export const FETCH_TOUR_GROUP_LIST = "/v1/tyltraveltourgroup/get/all/travel-tour-groups-list"
```

---

### 2. **Made City Dropdown Searchable**

#### ❌ Previous (Regular Dropdown)
```javascript
<Input 
  type="select" 
  id="city-select"
  value={selectedCity}
  onChange={(e) => setSelectedCity(e.target.value)}
>
  <option value="">Select a city...</option>
  {cities.map(city => (
    <option key={city._id} value={city.cityCode}>
      {city.cityName} ({city.cityCode})
    </option>
  ))}
</Input>
```

#### ✅ Current (Searchable React-Select)
```javascript
import Select from 'react-select';

<Select
  id="city-select"
  isClearable
  isSearchable
  placeholder="Search and select a city..."
  options={
    Array.isArray(cities)
      ? cities.map(city => ({
          value: city.cityCode,
          label: `${city.cityName} (${city.cityCode})`,
        }))
      : []
  }
  value={
    selectedCity
      ? {
          value: selectedCity,
          label: cities.find(c => c.cityCode === selectedCity)
            ? `${cities.find(c => c.cityCode === selectedCity).cityName} (${selectedCity})`
            : selectedCity
        }
      : null
  }
  onChange={(selectedOption) => {
    const selectedValue = selectedOption ? selectedOption.value : "";
    setSelectedCity(selectedValue);
  }}
  isDisabled={cities.length === 0}
/>
```

**Benefits:**
- ✅ Type to search cities
- ✅ Clear selection with X button
- ✅ Better UX for long lists
- ✅ Consistent with other screens (TravelCategoryForm, NewTourModel, etc.)

---

### 3. **Integrated Redux Store for Tour Groups**

#### Data Flow
```
User selects city
    ↓
dispatch(fetchTourGroupsRequest({ cityCode, page, limit }))
    ↓
Redux Saga calls API
    ↓
GET /v1/tyltraveltourgroup/get/all/travel-tour-groups-list?cityCode=DUBAI&page=1&limit=200
    ↓
Redux Store updated (state.travelTourGroup.tourGroups)
    ↓
Component reads from Redux via useSelector
    ↓
Tours dropdown populated
```

#### useEffect Hooks
```javascript
// 1. Fetch cities on mount
useEffect(() => {
  dispatch(getCities());
}, [dispatch]);

// 2. Fetch tours when city selected
useEffect(() => {
  if (selectedCity) {
    dispatch(fetchTourGroupsRequest({
      page: 1,
      limit: 200,
      cityCode: selectedCity
    }));
  } else {
    setSelectedTour('');
    setVariants([]);
    setSelectedVariant('');
  }
}, [selectedCity, dispatch]);

// 3. Update local state from Redux
useEffect(() => {
  if (tourGroups && tourGroups.length > 0) {
    setTours(tourGroups);
  }
}, [tourGroups]);

// 4. Fetch variants when tour selected
useEffect(() => {
  if (selectedTour) {
    fetchVariantsByTour(selectedTour);
  } else {
    setVariants([]);
    setSelectedVariant('');
  }
}, [selectedTour]);

// 5. Fetch pricing rules when variant selected
useEffect(() => {
  if (selectedVariant) {
    fetchPricingRules(selectedVariant);
  } else {
    setPricingRules([]);
    setEvents([]);
  }
}, [selectedVariant]);
```

---

## 📊 Complete API Endpoints

### 1. Cities (Redux)
```javascript
// Action
import { getCities } from 'store/travelCity/action';
dispatch(getCities());

// Endpoint (handled by Redux saga)
GET /v1/tyltravelcity/get/all/travel-city-list

// Redux State
state.travelCity.cities
```

### 2. Tour Groups (Redux) ✅ CORRECTED
```javascript
// Action
import { fetchTourGroupsRequest } from 'store/tickyourlist/travelTourGroup/action';
dispatch(fetchTourGroupsRequest({
  page: 1,
  limit: 200,
  cityCode: 'DUBAI'
}));

// Endpoint (handled by Redux saga)
GET /v1/tyltraveltourgroup/get/all/travel-tour-groups-list?page=1&limit=200&cityCode=DUBAI

// Redux State
state.travelTourGroup.tourGroups
```

### 3. Variants by Tour (Direct API)
```javascript
// Direct axios call
GET /api/v1/tyltraveltourgroupvariant/by-tour/{tourId}
Headers: {
  'x-api-key': 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj'
}
```

### 4. Pricing Rules (Direct API)
```javascript
// Direct axios call
GET /api/v1/pricing-rules/{variantId}
```

---

## 🎨 UI Improvements

### Searchable City Dropdown
```
Before: Static dropdown (hard to find city in long list)
After:  Searchable dropdown with:
  - Type to search
  - Clear button (X)
  - Better accessibility
  - Consistent with other forms
```

### Example Usage
```
1. User opens page
   → "Search and select a city..." placeholder shown

2. User types "dub"
   → Filters to show: "Dubai (DUBAI)", "Dublin (DUB)", etc.

3. User clicks "Dubai (DUBAI)"
   → Selected, triggers tour groups fetch

4. User clicks X (clear button)
   → Clears selection, resets downstream dropdowns
```

---

## 🔄 State Management

### Redux Selectors
```javascript
const cities = useSelector(state => state.travelCity?.cities || []);
const tourGroups = useSelector(state => state.travelTourGroup?.tourGroups || []);
```

### Local State
```javascript
const [tours, setTours] = useState([]);           // Local copy from Redux
const [variants, setVariants] = useState([]);     // From direct API
const [selectedCity, setSelectedCity] = useState('');
const [selectedTour, setSelectedTour] = useState('');
const [selectedVariant, setSelectedVariant] = useState('');
const [pricingRules, setPricingRules] = useState([]);
const [events, setEvents] = useState([]);
```

---

## ✅ Testing Checklist

- [x] Cities load from Redux on mount
- [x] City dropdown is searchable (type to filter)
- [x] City dropdown has clear button (X)
- [x] Selecting city fetches tours using CORRECT endpoint
- [x] Tours load from Redux store
- [x] Tour dropdown populates after city selection
- [x] Selecting tour fetches variants
- [x] Variant dropdown populates after tour selection
- [x] Selecting variant fetches pricing rules
- [x] Calendar displays pricing events
- [x] No console errors
- [x] No linting errors

---

## 📝 Files Modified

### `/src/pages/CalendarPricingAndAvailability/index.js`

**Imports Added:**
```javascript
import Select from 'react-select';
import { fetchTourGroupsRequest } from 'store/tickyourlist/travelTourGroup/action';
```

**Selectors Added:**
```javascript
const tourGroups = useSelector(state => state.travelTourGroup?.tourGroups || []);
```

**Functions Removed:**
```javascript
// REMOVED: Custom fetchToursByCity function
```

**Functions Modified:**
```javascript
// Updated to use Redux action instead of direct API call
dispatch(fetchTourGroupsRequest({ page, limit, cityCode }));
```

**UI Components Changed:**
```javascript
// Changed from <Input type="select"> to <Select> (react-select)
<Select
  isClearable
  isSearchable
  placeholder="Search and select a city..."
  // ... rest of props
/>
```

---

## 🎯 Pattern Consistency

This implementation now matches the existing patterns in:
- ✅ `src/pages/Travel/TravelCategoryForm.js`
- ✅ `src/pages/tickyourlist/TravelTourGroup/NewTourModel.js`
- ✅ `src/pages/LocationManagement/Cities/AddNewCity.js`

All these files use:
1. Redux actions for data fetching
2. react-select for searchable dropdowns
3. Consistent data flow patterns

---

## 🚀 Benefits

### 1. **Correct API Endpoint**
- Uses the actual working endpoint from existing code
- Consistent with rest of the application
- No more 404 or API errors

### 2. **Redux Integration**
- Single source of truth
- Automatic state updates
- Better performance (cached data)
- Consistent with existing architecture

### 3. **Better UX**
- Searchable dropdown for cities
- Easy to find city in long lists
- Clear button for quick reset
- Modern, accessible interface

### 4. **Maintainability**
- Uses existing Redux actions
- No duplicate API calls
- Follows established patterns
- Easy to understand and debug

---

## 📍 Example API Call (Development)

```bash
# When user selects "Dubai" from dropdown:
GET http://localhost:3000/v1/tyltraveltourgroup/get/all/travel-tour-groups-list?page=1&limit=200&cityCode=DUBAI

# Response structure:
{
  "tourGroups": [
    {
      "_id": "691117b717f64d5a198f18ca",
      "name": "Dubai City Tour",
      "cityCode": "DUBAI",
      // ... more fields
    }
  ],
  "page": 1,
  "total": 15
}
```

---

## 🎉 Final Status

### ✅ All Issues Resolved
1. ✅ Using correct API endpoint from existing code
2. ✅ City dropdown is searchable (react-select)
3. ✅ Redux integration for tour groups
4. ✅ Consistent with other screens
5. ✅ No linting errors
6. ✅ Production ready

**Last Updated:** 2025-01-17  
**Status:** Complete and Tested  
**Integration:** Seamlessly integrated with existing patterns

