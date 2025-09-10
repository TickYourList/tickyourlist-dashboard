import {
  GET_SUBCATEGORIES,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_FAIL,
  GET_TRAVEL_CATEGORIES,
  GET_TRAVEL_CATEGORIES_SUCCESS,
  GET_TRAVEL_CATEGORIES_FAIL,
  ADD_TRAVEL_SUBCATEGORY, 
  ADD_TRAVEL_SUBCATEGORY_SUCCESS, 
  ADD_TRAVEL_SUBCATEGORY_FAIL,  
  RESET_ADD_SUBCATEGORY_STATUS, 
  GET_EXISTING_SUBCATEGORY,
  GET_EXISTING_SUBCATEGORY_FOR_EDIT,
  GET_EXISTING_SUBCATEGORY_SUCCESS, 
  GET_EXISTING_SUBCATEGORY_FAIL,
  UPDATE_SUBCATEGORY, 
  UPDATE_SUBCATEGORY_SUCCESS, 
  UPDATE_SUBCATEGORY_FAIL,
  DELETE_SUBCATEGORY,
  DELETE_SUBCATEGORY_SUCCESS,
  DELETE_SUBCATEGORY_FAIL,
  RESET_UPDATE_SUBCATEGORY_STATUS,
  RESET_SUBCATEGORY_STATUS,
  GET_SUBCATEGORY_DETAILS_FOR_VIEW,
  GET_SUBCATEGORY_DETAILS_FOR_VIEW_SUCCESS, 
  GET_SUBCATEGORY_DETAILS_FOR_VIEW_FAIL,
  GET_SUBCATEGORY_VIEW_TOURS_TABLE,
  GET_SUBCATEGORY_VIEW_TOURS_TABLE_SUCCESS, 
  GET_SUBCATEGORY_VIEW_TOURS_TABLE_FAIL,
  GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE,
  GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_SUCCESS,
  GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_FAIL,
  GET_USERS_PERMISSIONS_FOR_SUBCATEGORY,
  GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_SUCCESS,
  GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_FAIL,
  CLEAR_SUBCATEGORY_VIEW_DATA,
  GET_TRAVEL_CITIES,
  GET_TRAVEL_CITIES_SUCCESS,  
  GET_TRAVEL_CITIES_FAIL,
  // New
} from "./actionTypes";

export const getSubcategories = () => (
  
  {
  type: GET_SUBCATEGORIES,
});

export const getSubcategoriesSuccess = (data) => ({
  type: GET_SUBCATEGORIES_SUCCESS,
  payload: data,
});

export const getSubcategoriesFail = error => ({
  type: GET_SUBCATEGORIES_FAIL,
  payload: error,
});

export const getTravelCategories = (cityCode) => (
  {
    type: GET_TRAVEL_CATEGORIES,
    payload: cityCode, // Pass the cityCode as payload
  });
export const getTravelCategoriesSuccess = (data) => ({
  type: GET_TRAVEL_CATEGORIES_SUCCESS,
  payload: data,
});

export const getTravelCategoriesFail = error => ({
  type: GET_TRAVEL_CATEGORIES_FAIL,
  payload: error,
});

export const addTravelSubcategory = (formData, cityCode) => (
  console.log("addTravelSubcategory called with formData:", formData, "and cityCode:", cityCode), 
  {
    type: ADD_TRAVEL_SUBCATEGORY,
    payload: { formData, cityCode },
  });

export const addTravelSubcategorySuccess = (data) => ({
  type: ADD_TRAVEL_SUBCATEGORY_SUCCESS,
  payload: data,
});

export const addTravelSubcategoryFail = (error) => ({
  type: ADD_TRAVEL_SUBCATEGORY_FAIL,
  payload: error,
});



export const updateSubcategory = (  formData,subCategoryid) => ({
  type: UPDATE_SUBCATEGORY,
  payload: { formData,subCategoryid },
});

export const updateSubcategorySuccess = (formData,subCategoryid) => ({
  type: UPDATE_SUBCATEGORY_SUCCESS,
  payload: {formData,subCategoryid },
});

export const updateSubcategoryFail = error => ({
  type: UPDATE_SUBCATEGORY_FAIL,
  payload: error,
});


export const resetAddSubcategoryStatus = () => ({ // New action creator
  type: RESET_ADD_SUBCATEGORY_STATUS,
});

export const getCategoryCities = () => (
  {
    type: GET_TRAVEL_CITIES,
    payload: cityCode,
  });
export const getCategoryCitiesSuccess = (data) => ({
  type: GET_TRAVEL_CITIES_SUCCESS,
  payload: data,
});

export const getCategoryCitiesFail = error => ({
  type: GET_TRAVEL_CITIES_FAIL,
  payload: error,
});

export const getExistingSubcategory = (subCategoryId) => ({
  type: GET_EXISTING_SUBCATEGORY,
  payload: subCategoryId,
});
export const getExistingSubcategoryForEdit = (subCategoryId) => ({
  type: GET_EXISTING_SUBCATEGORY_FOR_EDIT,
  payload: subCategoryId,
});
export const getExistingSubcategorySuccess = (data) => ({
  type: GET_EXISTING_SUBCATEGORY_SUCCESS,
  payload: data,
});
export const getExistingSubcategoryFail = error => ({
  type: GET_EXISTING_SUBCATEGORY_FAIL,
  payload: error,
});

export const deleteSubcategory = (subCategoryId) => (
  {
  type: DELETE_SUBCATEGORY,
  payload: subCategoryId,
  
}
);

export const deleteSubcategorySuccess = (subCategoryId) => ({
  type: DELETE_SUBCATEGORY_SUCCESS,
  payload: subCategoryId,})

  export const deleteSubcategoryFail = error => ({
  type: DELETE_SUBCATEGORY_FAIL,
  payload: error,
});

export const resetUpdateSubcategoryStatus=()=>({
  type: RESET_UPDATE_SUBCATEGORY_STATUS,
})
export const resetCategoryStatus = () => ({ 
  type:RESET_SUBCATEGORY_STATUS
})

export const getSubCategoryDetailsForViewSuccess = (data) => ({
  type: GET_SUBCATEGORY_DETAILS_FOR_VIEW_SUCCESS,
  payload: data,
});

export const getSubCategoryDetailsForViewFail = (error) => ({
  type: GET_SUBCATEGORY_DETAILS_FOR_VIEW_FAIL,
  payload: error,
});

export const getSubCategoryDetailsForView = (subCategoryId) => ({
type: GET_SUBCATEGORY_DETAILS_FOR_VIEW,
payload: subCategoryId,
});

export const getSubCategoryViewToursTable = (subcategoryId) => ({
  type: GET_SUBCATEGORY_VIEW_TOURS_TABLE,
  payload: subcategoryId,
});
export const getSubCategoryViewToursTableSuccess = (data) => ({
  type: GET_SUBCATEGORY_VIEW_TOURS_TABLE_SUCCESS,
  payload: data,
});
export const getSubCategoryViewToursTableFail = (error) => ({
  type: GET_SUBCATEGORY_VIEW_TOURS_TABLE_FAIL,
  payload: error,
});

export const getSubCategoryViewBookingsTable = (subcategoryId) => ({
  type: GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE,  
  payload: subcategoryId,
});
export const getSubCategoryViewBookingsTableSuccess = (data) => ({
  type: GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_SUCCESS,
  payload: data,
});
export const getSubCategoryViewBookingsTableFail = (error) => ({
  type: GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_FAIL,
  payload: error,
});

export const getUsersPermissionsForSubcategory = (userId) => ({
  type: GET_USERS_PERMISSIONS_FOR_SUBCATEGORY,
  payload: userId,
});
export const getUsersPermissionsForSubcategorySuccess = (data) => ({
  type: GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_SUCCESS,
  payload: data,
});
export const getUsersPermissionsForSubcategoryFail = (error) => ({
  type: GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_FAIL,
  payload: error,
});
export const clearSubCategoryViewData = () => ({
  type: CLEAR_SUBCATEGORY_VIEW_DATA,
});
