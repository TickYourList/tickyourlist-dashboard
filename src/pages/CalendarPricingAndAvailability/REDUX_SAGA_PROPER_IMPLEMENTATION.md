# Calendar Pricing & Availability - Proper Redux Saga Implementation

## ✅ Following Existing Codebase Patterns

### Files Modified

#### 1. **URL Helper** - `src/helpers/locationManagement_url_helpers.js`
```javascript
// Added new endpoint constant
export const FETCH_TOUR_GROUPS_BY_CITY = "/v1/tyltraveltourgroup/tour-groups-by-city"
```

#### 2. **API Helper** - `src/helpers/location_management_helper.js`
```javascript
// Added helper function following existing pattern
const getTourGroupsByCity = (cityCode) => {
    return get(`${url.FETCH_TOUR_GROUPS_BY_CITY}?cityCode=${cityCode}`);
}

// Added to exports
export {
    // ... existing exports
    getTourGroupsByCity,
    // ... more exports
}
```

#### 3. **Action Types** - `src/store/tickyourlist/travelTourGroup/actionTypes.js`
```javascript
// Added new action types
export const FETCH_TOUR_GROUPS_BY_CITY_REQUEST = "FETCH_TOUR_GROUPS_BY_CITY_REQUEST"
export const FETCH_TOUR_GROUPS_BY_CITY_SUCCESS = "FETCH_TOUR_GROUPS_BY_CITY_SUCCESS"
export const FETCH_TOUR_GROUPS_BY_CITY_FAILURE = "FETCH_TOUR_GROUPS_BY_CITY_FAILURE"
```

#### 4. **Actions** - `src/store/tickyourlist/travelTourGroup/action.js`
```javascript
// Added action creators
export const fetchTourGroupsByCityRequest = cityCode => ({
  type: "FETCH_TOUR_GROUPS_BY_CITY_REQUEST",
  payload: cityCode,
})

export const fetchTourGroupsByCitySuccess = tourGroups => ({
  type: "FETCH_TOUR_GROUPS_BY_CITY_SUCCESS",
  payload: tourGroups,
})

export const fetchTourGroupsByCityFailure = error => ({
  type: "FETCH_TOUR_GROUPS_BY_CITY_FAILURE",
  payload: error,
})
```

#### 5. **Reducer** - `src/store/tickyourlist/travelTourGroup/reducer.js`
```javascript
// Added to initial state
const initialState = {
  tourGroup: [],
  tourGroupById: {},
  bookingTourGroupById: [],
  tourGroupsByCity: [], // NEW - Lightweight list for dropdowns
  id: "",
  currPage: 1,
  totalCount: 0,
  loading: false,
  error: null,
}

// Added reducer cases
case FETCH_TOUR_GROUPS_BY_CITY_REQUEST:
  return {
    ...state,
    loading: true,
    error: null,
  }
case FETCH_TOUR_GROUPS_BY_CITY_SUCCESS:
  return {
    ...state,
    loading: false,
    tourGroupsByCity: action.payload || [],
    error: null,
  }
case FETCH_TOUR_GROUPS_BY_CITY_FAILURE:
  return {
    ...state,
    loading: false,
    tourGroupsByCity: [],
    error: action.payload,
  }
```

#### 6. **Saga** - `src/store/tickyourlist/travelTourGroup/saga.js`
```javascript
// Import helper function
import {
  addNewTourGroup,
  deleteTourGroupById,
  getAllTourGroupsList,
  getTourGroupsByCity, // NEW
  getTourBookingDetails,
  getTourById,
  updateTourGroupHelper,
} from "helpers/location_management_helper"

// Added saga function following existing pattern
function* fetchTourGroupsByCitySaga(action) {
  try {
    const cityCode = action.payload
    const response = yield call(getTourGroupsByCity, cityCode)
    const data = response.data
    yield put(fetchTourGroupsByCitySuccess(data.data || []))
  } catch (error) {
    console.error('Error fetching tour groups by city:', error)
    yield put(fetchTourGroupsByCityFailure(error.message))
    showToastError('Failed to load tour groups for selected city')
  }
}

// Added watcher
export default function* tourGroupSaga() {
  yield takeEvery(FETCH_TOUR_GROUP_REQUEST, fetchTourGroup)
  yield takeEvery(ADD_TOUR_GROUP_REQUEST, addTourGroup)
  yield takeEvery(FETCH_TOUR_GROUP_WITH_ID_REQUEST, fetchTourGroupById)
  yield takeEvery(UPDATE_TOUR_GROUP_REQUEST, updateTourGroup)
  yield takeEvery(DELETE_TOUR_GROUP_REQUEST, deleteTourGroup)
  yield takeEvery(GET_TOUR_GROUP_BOOKING_REQUEST, getTourGroupBookingDetails)
  yield takeEvery(FETCH_TOUR_GROUPS_BY_CITY_REQUEST, fetchTourGroupsByCitySaga) // NEW
}
```

#### 7. **Component** - `src/pages/CalendarPricingAndAvailability/index.js`
```javascript
// Import action
import { fetchTourGroupsByCityRequest } from 'store/tickyourlist/travelTourGroup/action';

// Use Redux selectors
const tourGroupsByCity = useSelector(state => state.travelTourGroup?.tourGroupsByCity || []);
const tourGroupsLoading = useSelector(state => state.travelTourGroup?.loading || false);

// Dispatch action when city changes
useEffect(() => {
  if (selectedCity) {
    dispatch(fetchTourGroupsByCityRequest(selectedCity));
  } else {
    setSelectedTour('');
    setVariants([]);
    setSelectedVariant('');
  }
}, [selectedCity, dispatch]);

// Use data in Select component
<Select
  id="tour-select"
  options={tourGroupsByCity.map(tour => ({
    value: tour.id,
    label: tour.name,
  }))}
  isDisabled={tourGroupsLoading || !selectedCity}
  isLoading={tourGroupsLoading && selectedCity}
  // ... other props
/>
```

---

## 🎯 Architecture Pattern

### Data Flow
```
Component
    ↓
dispatch(fetchTourGroupsByCityRequest('DUBAI'))
    ↓
Action → Reducer (sets loading: true)
    ↓
Saga (fetchTourGroupsByCitySaga)
    ↓
Helper (getTourGroupsByCity)
    ↓
API Call (GET http://localhost:3005/v1/tyltraveltourgroup/tour-groups-by-city?cityCode=DUBAI)
    ↓
Response
    ↓
Saga → dispatch(fetchTourGroupsByCitySuccess(data))
    ↓
Reducer (updates tourGroupsByCity, sets loading: false)
    ↓
Component Re-renders (via useSelector)
```

### Folder Structure
```
src/
├── helpers/
│   ├── locationManagement_url_helpers.js  ← URL constants
│   └── location_management_helper.js      ← API helper functions
├── store/
│   └── tickyourlist/
│       └── travelTourGroup/
│           ├── actionTypes.js              ← Action type constants
│           ├── action.js                   ← Action creators
│           ├── reducer.js                  ← State management
│           └── saga.js                     ← Async logic
└── pages/
    └── CalendarPricingAndAvailability/
        └── index.js                        ← Component (dispatch only)
```

---

## 📋 Key Principles Followed

### 1. **Separation of Concerns**
- ✅ URLs defined in separate file
- ✅ API calls in helper functions
- ✅ Async logic in sagas
- ✅ State management in reducers
- ✅ Components only dispatch actions

### 2. **Consistent Patterns**
- ✅ Uses `get()` helper from existing API helpers
- ✅ Follows existing saga structure (`yield call`, `yield put`)
- ✅ Same naming conventions (Request/Success/Failure)
- ✅ Proper error handling with toast messages

### 3. **No Direct API Calls**
- ❌ No `axios.get()` in components
- ❌ No `axios.get()` in sagas
- ✅ Only helper functions in sagas
- ✅ Components only use `dispatch()` and `useSelector()`

### 4. **Type Safety**
- ✅ Action types as constants
- ✅ Imported from single source
- ✅ Prevents typos and errors

---

## 🔄 Comparison: Before vs After

### Before (Wrong Pattern)
```javascript
// In Saga - Direct axios call
const response = yield call(
  axios.get,
  `http://localhost:3005/v1/tyltraveltourgroup/tour-groups-by-city`,
  { params: { cityCode } }
)

// In Component - Direct axios call
const response = await axios.get('/v1/tyltraveltourgroup/tour-groups-by-city', {
  params: { cityCode }
});
```

### After (Correct Pattern)
```javascript
// In URL Helper
export const FETCH_TOUR_GROUPS_BY_CITY = "/v1/tyltraveltourgroup/tour-groups-by-city"

// In API Helper
const getTourGroupsByCity = (cityCode) => {
    return get(`${url.FETCH_TOUR_GROUPS_BY_CITY}?cityCode=${cityCode}`);
}

// In Saga
const response = yield call(getTourGroupsByCity, cityCode)

// In Component
dispatch(fetchTourGroupsByCityRequest(cityCode))
```

---

## 🎉 Benefits

### 1. **Maintainability**
- URL changes in one place
- API logic centralized
- Easy to test

### 2. **Consistency**
- Same pattern as existing code
- Team members familiar with pattern
- Easier code reviews

### 3. **Scalability**
- Easy to add more endpoints
- Can add caching/retry logic in helpers
- Can add interceptors for auth tokens

### 4. **Debugging**
- Clear separation makes debugging easier
- Redux DevTools shows action flow
- Error messages from toasts

---

## 📝 Summary

### Files Changed: 7
1. ✅ `locationManagement_url_helpers.js` - Added URL constant
2. ✅ `location_management_helper.js` - Added API helper function
3. ✅ `actionTypes.js` - Added action types
4. ✅ `action.js` - Added action creators
5. ✅ `reducer.js` - Added state + reducer cases
6. ✅ `saga.js` - Added saga function + watcher
7. ✅ `CalendarPricingAndAvailability/index.js` - Use Redux dispatch

### Pattern Followed: ✅ Existing Codebase Pattern
- No direct API calls in components
- No axios in sagas
- Helper functions for all API calls
- URL constants in dedicated file
- Proper Redux flow

### Status: ✅ Production Ready
- No linting errors
- Follows team conventions
- Consistent with existing code
- Ready for code review

---

**Last Updated:** 2025-01-17  
**Implementation:** Following Existing Patterns  
**Quality:** Enterprise-Grade Redux Saga Implementation

