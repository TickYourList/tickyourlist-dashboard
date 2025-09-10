import {
  GET_TOURS_REQUEST,
  GET_TOURS_SUCCESS,
  GET_TOURS_FAIL,

  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,

  GET_SUBCATEGORIES_REQUEST,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_FAIL,

  GET_COLLECTIONS_REQUEST,
  GET_COLLECTIONS_SUCCESS,
  GET_COLLECTIONS_FAIL,
  
  GET_BOOKINGS_REQUEST,
  GET_BOOKINGS_SUCCESS,
  GET_BOOKINGS_FAIL,
  SORT_CATEGORY_REQUEST,
  SORT_CATEGORY_SUCCESS,
  SORT_CATEGORY_FAIL,

  SORT_SUB_CATEGORY_REQUEST,
  SORT_SUB_CATEGORY_SUCCESS,
  SORT_SUB_CATEGORY_FAIL
} from "./actionTypes";

// ----- Tours -----
export const getTours = (cityCode, page = 1, limit = 10) => ({
  type: GET_TOURS_REQUEST,
  payload: {cityCode, page, limit},
});
export const getToursSuccess = (data) => ({
  type: GET_TOURS_SUCCESS,
  payload: data,
});
export const getToursFail = (error) => ({
  type: GET_TOURS_FAIL,
  payload: error,
});

// ----- Categories -----
export const getCategories = (cityCode) => ({
  type: GET_CATEGORIES_REQUEST,
  payload: cityCode,
});
export const getCategoriesSuccess = (data) => ({
  type: GET_CATEGORIES_SUCCESS,
  payload: data,
});
export const getCategoriesFail = (error) => ({
  type: GET_CATEGORIES_FAIL,
  payload: error,
});

// ----- Sub Categories -----
export const getSubCategories = (cityCode) => ({
  type: GET_SUBCATEGORIES_REQUEST,
  payload: cityCode,
});
export const getSubCategoriesSuccess = (data) => ({
  type: GET_SUBCATEGORIES_SUCCESS,
  payload: data,
});
export const getSubCategoriesFail = (error) => ({
  type: GET_SUBCATEGORIES_FAIL,
  payload: error,
});

// ----- Collections -----
export const getCollections = (cityCode) => ({
  type: GET_COLLECTIONS_REQUEST,
  payload: cityCode,
});
export const getCollectionsSuccess = (data) => ({
  type: GET_COLLECTIONS_SUCCESS,
  payload: data,
});
export const getCollectionsFail = (error) => ({
  type: GET_COLLECTIONS_FAIL,
  payload: error,
});

// ----- Bookings -----
export const getBookings = (cityCode, page = 1, limit = 10) => ({
  type: GET_BOOKINGS_REQUEST,
  payload: {cityCode, page, limit},
});
export const getBookingsSuccess = (data) => ({
  type: GET_BOOKINGS_SUCCESS,
  payload: data,
});
export const getBookingsFail = (error) => ({
  type: GET_BOOKINGS_FAIL,
  payload: error,
});

// ----- Sort Categories -----
export const sortCategories = (categoryOrder) => ({
  type: SORT_CATEGORY_REQUEST,
  payload: categoryOrder,
})
export const sortCategoriesSuccess = updatedCategories => ({
  type: SORT_CATEGORY_SUCCESS,
  payload: updatedCategories,
})
export const sortCategoriesFail = error => ({
  type: SORT_CATEGORY_FAIL,
  payload: error,
})

// ----- Sort Sub Categories -----
export const sortSubCategories = (categoryId ,subcategoryOrders) => ({
  type: SORT_SUB_CATEGORY_REQUEST,
  payload: {categoryId, subcategoryOrders},
})
export const sortSubCategoriesSuccess = updatedSubCategories => ({
  type: SORT_SUB_CATEGORY_SUCCESS,
  payload: updatedSubCategories,
})
export const sortSubCategoriesFail = error => ({
  type: SORT_SUB_CATEGORY_FAIL,
  payload: error,
})
