 import {
  GET_TRAVEL_CATEGORIES_REQUEST,
  GET_TRAVEL_CATEGORIES_SUCCESS,
  GET_TRAVEL_CATEGORIES_FAILURE,
  DELETE_TRAVEL_CATEGORY_REQUEST,
  DELETE_TRAVEL_CATEGORY_SUCCESS,
  DELETE_TRAVEL_CATEGORY_FAILURE,
  FETCH_CITIES_REQUEST,
  FETCH_CITIES_SUCCESS,
  FETCH_CITIES_FAILURE,
  ADD_TRAVEL_CATEGORY_REQUEST,
  ADD_TRAVEL_CATEGORY_SUCCESS,
  ADD_TRAVEL_CATEGORY_FAILURE,
  FETCH_TRAVEL_CATEGORY_REQUEST,
  FETCH_TRAVEL_CATEGORY_SUCCESS,
  FETCH_TRAVEL_CATEGORY_FAILURE,
  UPDATE_TRAVEL_CATEGORY_REQUEST,
  UPDATE_TRAVEL_CATEGORY_SUCCESS,
  UPDATE_TRAVEL_CATEGORY_FAILURE,
  VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST,
  VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS,
  VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,

  FETCH_CATEGORY_TOURS_REQUEST,
  FETCH_CATEGORY_TOURS_SUCCESS,
  FETCH_CATEGORY_TOURS_FAILURE,

  FETCH_CATEGORY_SUBCATEGORIES_REQUEST,
  FETCH_CATEGORY_SUBCATEGORIES_SUCCESS,
  FETCH_CATEGORY_SUBCATEGORIES_FAILURE,

  FETCH_CATEGORY_BOOKINGS_REQUEST,
  FETCH_CATEGORY_BOOKINGS_SUCCESS,
  FETCH_CATEGORY_BOOKINGS_FAILURE,

   GET_SETTING_REQUEST,
  GET_SETTING_SUCCESS,
  GET_SETTING_FAILURE,

  UPDATE_SYSTEM_SETTINGS_REQUEST,
  UPDATE_SYSTEM_SETTINGS_SUCCESS,
  UPDATE_SYSTEM_SETTINGS_FAILURE,

  GET_CATEGORIES_BY_CITY_REQUEST,
  GET_CATEGORIES_BY_CITY_SUCCESS,
  GET_CATEGORIES_BY_CITY_FAILURE,

  SORT_CATEGORIES_REQUEST,
  SORT_CATEGORIES_SUCCESS,
  SORT_CATEGORIES_FAILURE,

  SORT_SUBCATEGORIES_REQUEST,
  SORT_SUBCATEGORIES_SUCCESS,
  SORT_SUBCATEGORIES_FAILURE,
} from "./actionTypes";

export const getTravelCategoriesRequest = () => ({
  type: GET_TRAVEL_CATEGORIES_REQUEST,
});

export const getTravelCategoriesSuccess = (data) => ({
  type: GET_TRAVEL_CATEGORIES_SUCCESS,
  payload: data,
});

export const getTravelCategoriesFailure = (error) => ({
  type: GET_TRAVEL_CATEGORIES_FAILURE,
  payload: error,
});
export const deleteTravelCategoryRequest = (categoryId) => ({
  type: DELETE_TRAVEL_CATEGORY_REQUEST,
  payload: categoryId,
});

export const deleteTravelCategorySuccess = (categoryId) => ({
  type: DELETE_TRAVEL_CATEGORY_SUCCESS,
  payload: categoryId,
});

export const deleteTravelCategoryFailure = (error) => ({
  type: DELETE_TRAVEL_CATEGORY_FAILURE,
  payload: error,
});

// Get Cities
export const fetchCitiesRequest = () => ({ type: FETCH_CITIES_REQUEST });
export const fetchCitiesSuccess = (cities) => ({ type: FETCH_CITIES_SUCCESS, payload: cities });
export const fetchCitiesFailure = (error) => ({ type: FETCH_CITIES_FAILURE, payload: error });

// Add Travel Category
export const addTravelCategoryRequest = (payload) => ({ type: ADD_TRAVEL_CATEGORY_REQUEST, payload });
export const addTravelCategorySuccess = (message) => ({ type: ADD_TRAVEL_CATEGORY_SUCCESS, payload: message });
export const addTravelCategoryFailure = (error) => ({ type: ADD_TRAVEL_CATEGORY_FAILURE, payload: error });

// GET Travel Category
export const fetchTravelCategoryRequest = (categoryId) => ({
  type: FETCH_TRAVEL_CATEGORY_REQUEST,
  payload: categoryId,
});

export const fetchTravelCategorySuccess = (data) => ({
  type: FETCH_TRAVEL_CATEGORY_SUCCESS,
  payload: data,
});

export const fetchTravelCategoryFailure = (error) => ({
  type: FETCH_TRAVEL_CATEGORY_FAILURE,
  payload: error,
});

// UPDATE Travel Category
export const updateTravelCategoryRequest = ({ categoryId, formData }) => ({
  type: UPDATE_TRAVEL_CATEGORY_REQUEST,
  payload: { categoryId, formData },
});

export const updateTravelCategorySuccess = () => ({
  type: UPDATE_TRAVEL_CATEGORY_SUCCESS,
});

export const updateTravelCategoryFailure = (error) => ({
  type: UPDATE_TRAVEL_CATEGORY_FAILURE,
  payload: error,
});

// ✅ RESET update state
export const resetTravelCategory = () => ({
  type: "RESET_TRAVEL_CATEGORY",
});

//fetch view details
export const viewTravelCategoryDetailsRequest = (id) => ({
  type: VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST,
  payload: id,
});

export const viewTravelCategoryDetailsSuccess = (data) => ({
  type: VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS,
  payload: data,
});

export const viewTravelCategoryDetailsFailure = (error) => ({
  type: VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,
  payload: error,
});

// 🔹 Fetch Tours
export const fetchCategoryToursRequest = (categoryId) => ({
  type: FETCH_CATEGORY_TOURS_REQUEST,
  payload: categoryId,
});

export const fetchCategoryToursSuccess = (tours) => ({
  type: FETCH_CATEGORY_TOURS_SUCCESS,
  payload: tours,
});

export const fetchCategoryToursFailure = (error) => ({
  type: FETCH_CATEGORY_TOURS_FAILURE,
  payload: error,
});


// 🔹 Fetch Subcategories
export const fetchCategorySubcategoriesRequest = (categoryId) => ({
  type: FETCH_CATEGORY_SUBCATEGORIES_REQUEST,
  payload: categoryId,
});

export const fetchCategorySubcategoriesSuccess = (subcategories) => ({
  type: FETCH_CATEGORY_SUBCATEGORIES_SUCCESS,
  payload: subcategories,
});

export const fetchCategorySubcategoriesFailure = (error) => ({
  type: FETCH_CATEGORY_SUBCATEGORIES_FAILURE,
  payload: error,
});


// 🔹 Fetch Bookings
export const fetchCategoryBookingsRequest = (categoryId) => ({
  type: FETCH_CATEGORY_BOOKINGS_REQUEST,
  payload: categoryId,
});

export const fetchCategoryBookingsSuccess = (bookings) => ({
  type: FETCH_CATEGORY_BOOKINGS_SUCCESS,
  payload: bookings,
});

export const fetchCategoryBookingsFailure = (error) => ({
  type: FETCH_CATEGORY_BOOKINGS_FAILURE,
  payload: error,
});

//SETTINGS
export const fetchMySettings = () => ({
  type: GET_SETTING_REQUEST,
});

export const fetchMySettingsSucc = (data) => ({
  type: GET_SETTING_SUCCESS,
  payload: data,
});

export const fetchMySettingsFail = (error) => ({
type: GET_SETTING_FAILURE,
payload: error,
});

export const updateSystemSettingsRequest = (data) => ({
type: UPDATE_SYSTEM_SETTINGS_REQUEST,
payload: { data },
});

export const updateSystemSettingsSuccess = (data) => ({
type: UPDATE_SYSTEM_SETTINGS_SUCCESS,
payload: data,
});

export const updateSystemSettingsFailure = (error) => ({
type: UPDATE_SYSTEM_SETTINGS_FAILURE,
payload: error,
});

// Main action creator
export const updateSystemSettings = (data) => ({
type: UPDATE_SYSTEM_SETTINGS_REQUEST,
payload: { data },
});

// Get Categories by City
export const getCategoriesByCityRequest = (cityCode) => ({
  type: GET_CATEGORIES_BY_CITY_REQUEST,
  payload: cityCode,
});

export const getCategoriesByCitySuccess = (categories) => ({
  type: GET_CATEGORIES_BY_CITY_SUCCESS,
  payload: categories,
});

export const getCategoriesByCityFailure = (error) => ({
  type: GET_CATEGORIES_BY_CITY_FAILURE,
  payload: error,
});

// Sort Categories
export const sortCategoriesRequest = (categoryOrders) => ({
  type: SORT_CATEGORIES_REQUEST,
  payload: categoryOrders,
});

export const sortCategoriesSuccess = (data) => ({
  type: SORT_CATEGORIES_SUCCESS,
  payload: data,
});

export const sortCategoriesFailure = (error) => ({
  type: SORT_CATEGORIES_FAILURE,
  payload: error,
});

// Sort Subcategories
export const sortSubcategoriesRequest = (payload) => ({
  type: SORT_SUBCATEGORIES_REQUEST,
  payload,
});

export const sortSubcategoriesSuccess = (data) => ({
  type: SORT_SUBCATEGORIES_SUCCESS,
  payload: data,
});

export const sortSubcategoriesFailure = (error) => ({
  type: SORT_SUBCATEGORIES_FAILURE,
  payload: error,
});

