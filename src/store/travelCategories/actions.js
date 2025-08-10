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


