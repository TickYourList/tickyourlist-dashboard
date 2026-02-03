import { takeEvery, put, call } from "redux-saga/effects"
import { GET_SUBCATEGORIES, GET_TRAVEL_CATEGORIES,  ADD_TRAVEL_SUBCATEGORY,GET_EXISTING_SUBCATEGORY,UPDATE_SUBCATEGORY,DELETE_SUBCATEGORY,
  GET_SUBCATEGORY_DETAILS_FOR_VIEW, GET_SUBCATEGORY_VIEW_TOURS_TABLE, GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE, GET_USERS_PERMISSIONS_FOR_SUBCATEGORY,
  GET_EXISTING_SUBCATEGORY_FOR_EDIT
 } from "./actionTypes";
import { getSubcategoriesFail, 
getSubcategoriesSuccess, 
addTravelSubcategorySuccess,
addTravelSubcategoryFail,
getExistingSubcategorySuccess,
getExistingSubcategoryFail,
updateSubcategoryFail,
updateSubcategorySuccess,
deleteSubcategorySuccess,
deleteSubcategoryFail,
getTravelCategoriesSuccess,
getTravelCategoriesFail,
getSubCategoryDetailsForViewSuccess,
  getSubCategoryDetailsForViewFail,
  getSubCategoryViewToursTableSuccess,
  getSubCategoryViewToursTableFail,
  getSubCategoryViewBookingsTableSuccess,
  getSubCategoryViewBookingsTableFail,
  getUsersPermissionsForSubcategorySuccess,
  getUsersPermissionsForSubcategoryFail
} from "./actions"

import { 
getSubcategoriesList,
getSubcategoriesForCity,
getTravelCategoriesList,
addTravelSubcategoryApi,
getExistingSubcategory,
getExistingSubcategoryForEdit,
updateSubcategory,
deleteSubcategoryApi,
getSubcategoryDetailsForView,
getSubcategoryDetailsForViewToursTable,
getSubcategoryDetailsForViewBookingsTable,
getUsersPermissionsForSubcategory
} from "../../../helpers/location_management_helper"

import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { get, take } from "lodash";
// import { GET_EXISTING_SUBCATEGORY_FOR_EDIT } from "helpers/locationManagement_url_helpers";

function* fetchSubcategories(action) {
  try {
    const cityCode = action.payload || null;
    let response;
    if (cityCode) {
      // Use city-specific endpoint
      response = yield call(getSubcategoriesForCity, cityCode);
      // Extract subcategories from the response structure
      const subcategories = response?.data?.subcategories || response?.data || [];
      yield put(getSubcategoriesSuccess(subcategories));
    } else {
      // Use general endpoint
      response = yield call(getSubcategoriesList);
      yield put(getSubcategoriesSuccess(response.data));
    }
  } catch (error) {
    yield put(getSubcategoriesFail(error));
  }
}


function* onUpdateSubcategory(action) {
  try {

        const formDataToSend = action.payload.formData;
const subCategoryid = action.payload.subCategoryid;
    const response = yield call(updateSubcategory, formDataToSend,subCategoryid);
  
    yield put(updateSubcategorySuccess( response.data))
    showToastSuccess("Success to Update", "Congrats")
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update sub category.";
    yield put(updateSubcategoryFail(error))
    showToastError("UpdateSubcategory Failed to Update. Please try again.", "Error")
  }
}

function* fetchTravelCategories(action) {
  try {
    const cityCode = action.payload;
    const response = yield call(getTravelCategoriesList, cityCode)
    yield put(getTravelCategoriesSuccess(response.data))
  } catch (error) {
    yield put(getTravelCategoriesFail(error))
  }
}

function* onAddTravelSubcategory(action) {
  try {
    const formDataToSend = action.payload.formData;
const cityCode = action.payload.cityCode;
    const response = yield call(addTravelSubcategoryApi, formDataToSend,cityCode);
    yield put(addTravelSubcategorySuccess(response.data));
      showToastSuccess("Success to Add", "Congrats")
  } catch (error) {
        showToastError("Failed to Add. Please try again.", "Error")
    yield put(addTravelSubcategoryFail(error));
  }
}

function *fetchExistingSubcategory(action)
{
  const subCategoryId=action.payload;
  try {
    const response = yield call(getExistingSubcategoryForEdit,subCategoryId)
    yield put(getExistingSubcategorySuccess(response.data))
  } catch (error) {
      console.log("GetExitingSubcategory error ",error);
    yield put(getExistingSubcategoryFail(error))
  }
}

function* onDeleteSubcategory(action) {
  const subCategoryId = action.payload;
  try {
    const response = yield call(deleteSubcategoryApi, subCategoryId);
    
    yield put(deleteSubcategorySuccess(response.data));
    showToastSuccess("Subcategory deleted successfully", "Success");
  } catch (error) {
    console.error("Saga: Error deleting subcategory:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete sub category.";
    console.error("Error message:", errorMessage);
    
    // Dispatch failure action
    yield put(deleteSubcategoryFail(error));
    showToastError("Failed to delete subcategory. Please try again.", "Error");
  }
}

function* fetchSubCategoryDetailsForView(action) {
  const subCategoryId = action.payload;
  try {
    const response = yield call(getSubcategoryDetailsForView, subCategoryId);
    // console.log("Fetched subcategory details for view from saga:", response.data);
    yield put(getSubCategoryDetailsForViewSuccess(response.data));
  } catch (error) {
    console.error("Saga: Error fetching subcategory details for view:", error);
    yield put(getSubCategoryDetailsForViewFail(error));
  }
}

function* fetchSubCategoryDetailsForViewToursTable(action) {
  const subCategoryId = action.payload;

  try {
    const response = yield call(getSubcategoryDetailsForViewToursTable, subCategoryId);
    console.log("Fetched subcategory view tours table data from saga:", response.data);
    // Dispatch success action with the fetched data
    yield put(getSubCategoryViewToursTableSuccess(response.data));
  } catch (error) {
    console.error("Saga: Error fetching subcategory view tours table data:",
      error);
    yield put(getSubCategoryViewToursTableFail(error));
  }
}

const fetchSubCategoryDetailsForViewBookingsTable = function* (action) {
  const subCategoryId = action.payload;
  try {
    const response = yield call(getSubcategoryDetailsForViewBookingsTable, subCategoryId); // Assuming similar logic for bookings table
    // Dispatch success action with the fetched data
    console.log("subcategoryId in saga: booking table", subCategoryId);
    console.log("Fetched subcategory view bookings table data from saga:", response.data);
    yield put(getSubCategoryViewBookingsTableSuccess(response.data));
  } catch (error) {
    yield put(getSubCategoryViewBookingsTableFail(error));
  }
}
const fetchUsersPermissionsForSubcategory = function* (action) {
  const userId = action.payload;
  try {
    const response = yield call(getUsersPermissionsForSubcategory, userId);
    // Dispatch success action with the fetched data
    console.log("Fetched user permissions for subcategory from saga:", response.data);
    yield put(getUsersPermissionsForSubcategorySuccess(response.data));
  } catch (error) {
    console.error("Saga: Error fetching users permissions for subcategory:", error);
    yield put(getUsersPermissionsForSubcategoryFail(error));
  }
};



function* subcategoriesSaga() {
  yield takeEvery(GET_SUBCATEGORIES, fetchSubcategories);
  yield takeEvery(ADD_TRAVEL_SUBCATEGORY, onAddTravelSubcategory);
  yield takeEvery(GET_TRAVEL_CATEGORIES, fetchTravelCategories);
  yield takeEvery(GET_EXISTING_SUBCATEGORY,fetchExistingSubcategory);
  yield takeEvery(GET_EXISTING_SUBCATEGORY_FOR_EDIT, fetchExistingSubcategory);
  yield takeEvery(UPDATE_SUBCATEGORY, onUpdateSubcategory);
  yield takeEvery(DELETE_SUBCATEGORY, onDeleteSubcategory);
  yield takeEvery(GET_SUBCATEGORY_DETAILS_FOR_VIEW, fetchSubCategoryDetailsForView);
  yield takeEvery(GET_SUBCATEGORY_VIEW_TOURS_TABLE, fetchSubCategoryDetailsForViewToursTable);
  yield takeEvery(GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE, fetchSubCategoryDetailsForViewToursTable); // Assuming 
  // ysimilar logic for bookings table
  yield takeEvery(GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE, fetchSubCategoryDetailsForViewBookingsTable);
  yield takeEvery(GET_USERS_PERMISSIONS_FOR_SUBCATEGORY, fetchUsersPermissionsForSubcategory);
  
}
export default subcategoriesSaga;
