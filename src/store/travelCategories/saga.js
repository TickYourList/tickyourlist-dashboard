import { call, put, takeLatest, all } from "redux-saga/effects";
import {
  GET_TRAVEL_CATEGORIES_REQUEST,
  GET_TRAVEL_CATEGORIES_SUCCESS,
  GET_TRAVEL_CATEGORIES_FAILURE,
  DELETE_TRAVEL_CATEGORY_REQUEST,
  DELETE_TRAVEL_CATEGORY_SUCCESS,
  DELETE_TRAVEL_CATEGORY_FAILURE,
  ADD_TRAVEL_CATEGORY_REQUEST,
  FETCH_TRAVEL_CATEGORY_REQUEST,
  UPDATE_TRAVEL_CATEGORY_REQUEST,
  VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST,
  VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS,
  VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,
  FETCH_CATEGORY_TOURS_REQUEST,
  FETCH_CATEGORY_SUBCATEGORIES_REQUEST,
  FETCH_CATEGORY_BOOKINGS_REQUEST,
  FETCH_CATEGORY_TOURS_SUCCESS,
  FETCH_CATEGORY_TOURS_FAILURE,
  FETCH_CATEGORY_SUBCATEGORIES_SUCCESS,
  FETCH_CATEGORY_SUBCATEGORIES_FAILURE,
  FETCH_CATEGORY_BOOKINGS_SUCCESS,
  FETCH_CATEGORY_BOOKINGS_FAILURE,
  //settings
  GET_SETTING_REQUEST,
  GET_SETTING_SUCCESS,
  GET_SETTING_FAILURE,

  UPDATE_SYSTEM_SETTINGS_REQUEST,
} from "./actionTypes";

import {
  deleteCategory,
  getCategoriesList,
  getCategoryById,
  updateCategory,
  addCategory,
   getCategoryByUrl,
  getCategoryTours,
  getCategorySubcategories,
  getCategoryBookings,
  getCities,
  getCategoryPermissions,
  getSettings,
  updateSystemSettings,
} from "../../helpers/location_management_helper";
import { addTravelCategoryFailure, addTravelCategorySuccess, fetchTravelCategoryFailure, fetchTravelCategorySuccess, updateTravelCategoryFailure, updateTravelCategorySuccess, fetchMySettingsSucc, fetchMySettingsFail,
  updateSystemSettingsSuccess,
  updateSystemSettingsFailure } from "./actions";

// 🚀 Get all categories
function* getTravelCategories() {
  try {
    const response = yield call(getCategoriesList);
  

    const statusCode = response?.statusCode;  // ✅ NOT response.data.statusCode
    const payloadData = response?.data || [];

    if (statusCode === "10000") {
      yield put({
        type: GET_TRAVEL_CATEGORIES_SUCCESS,
        payload: payloadData,
      });
    } else {
    
      yield put({
        type: GET_TRAVEL_CATEGORIES_FAILURE, 
        payload: "Unexpected response format",
      });
    }
  } catch (error) {
  
    yield put({
      type: GET_TRAVEL_CATEGORIES_FAILURE,
      payload: error.message,
    });
  }
}



// 🗑️ Delete category
function* deleteTravelCategory(action) {
  try {
    yield call(deleteCategory, action.payload);
    yield put({ type: DELETE_TRAVEL_CATEGORY_SUCCESS, payload: action.payload });
    yield put({ type: GET_TRAVEL_CATEGORIES_REQUEST }); // Refresh
  } catch (error) {
    yield put({ type: DELETE_TRAVEL_CATEGORY_FAILURE, payload: error.message });
  }
}

// ➕ Add a new travel category
function* addTravelCategorySaga(action) {
  try {
    const { data, images } = action.payload;
    const cityCode = data.cityCode;
    const submissionData = new FormData();
    submissionData.append("data", JSON.stringify(data));
    if (images && images.length > 0) {
      images.forEach((img) => submissionData.append("images", img));
    }

    for (let pair of submissionData.entries()) {
    
    }

    const res = yield call(() => addCategory(submissionData, cityCode));
    

       if (res.statusCode === "10000") {
      yield put(addTravelCategorySuccess("Category created successfully."));
    } else {
      yield put(addTravelCategoryFailure("Failed to create category."));
    }
  } catch (error) {
    yield put(addTravelCategoryFailure(error.message || "Add category failed"));
  }
}

// 🔍 Fetch single category
function* fetchTravelCategorySaga(action) {
  try {
    const response = yield call(getCategoryById, action.payload);
    yield put(fetchTravelCategorySuccess(response.data));
  } catch (error) {
    yield put(fetchTravelCategoryFailure(error.message));
  }
}

// 🛠️ Update category
function* updateTravelCategorySaga(action) {
  try {
    const { categoryId, formData } = action.payload;
    const response = yield call(updateCategory, categoryId, formData);
    yield put(updateTravelCategorySuccess(response.data));
  } catch (error) {
    yield put(updateTravelCategoryFailure(error.message));
    yield put(resetTravelCategory());
  }
}

function* viewTravelCategoryDetails(action) {
  try {
    const response = yield call(getCategoryByUrl, action.payload);

    const statusCode = response?.statusCode;
    const categoryData = response?.data || null;

    if (statusCode === "10000") {
      yield put({
        type: VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS,
        payload: categoryData,
      });
    } else {
      yield put({
        type: VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,
        payload: "Unexpected response format",
      });
    }
  } catch (error) {
    yield put({
      type: VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,
      payload: error.message,
    });
  }
}

function* fetchCategoryTours(action) {
  try {
    const res = yield call(getCategoryTours, action.payload);
    if (res?.statusCode === "10000") {
      yield put({
        type: FETCH_CATEGORY_TOURS_SUCCESS,
        payload: res.data?.tours || [], // ✅ Only the tours array
      });
    } else {
      yield put({ type: FETCH_CATEGORY_TOURS_FAILURE, payload: res.message || "Error fetching tours" });
    }
  } catch (error) {
    yield put({ type: FETCH_CATEGORY_TOURS_FAILURE, payload: error.message });
  }
}

// 🔹 Subcategories
function* fetchCategorySubcategories(action) {
  try {
    const res = yield call(getCategorySubcategories, action.payload);
    if (res?.statusCode === "10000") {
      yield put({
        type: FETCH_CATEGORY_SUBCATEGORIES_SUCCESS,
        payload: res.data?.subcategories || [], // ✅ Only the subcategories array
      });
    } else {
      yield put({ type: FETCH_CATEGORY_SUBCATEGORIES_FAILURE, payload: res.message || "Error fetching subcategories" });
    }
  } catch (error) {
    yield put({ type: FETCH_CATEGORY_SUBCATEGORIES_FAILURE, payload: error.message });
  }
}

// 🔹 Bookings
function* fetchCategoryBookings(action) {
  try {
    const res = yield call(getCategoryBookings, action.payload);
    if (res?.statusCode === "10000") {
      yield put({
        type: FETCH_CATEGORY_BOOKINGS_SUCCESS,
        payload: res.data?.bookings || [], // ✅ Only the bookings array
      });
    } else {
      yield put({ type: FETCH_CATEGORY_BOOKINGS_FAILURE, payload: res.message || "Error fetching bookings" });
    }
  } catch (error) {
    yield put({ type: FETCH_CATEGORY_BOOKINGS_FAILURE, payload: error.message });
  }
}

function* fetchSettingsSaga() {
  try {
    const response = yield call(getSettings);
    yield put(fetchMySettingsSucc(response));
  } catch (error) {
    yield put(fetchMySettingsFail(error.message));
  }
}

function* updateSystemSettingsSaga(action) {
  try {
    const response = yield call(updateSystemSettings, action.payload.data);

   // 👇 Debug karo pehle
    console.log("API full response:", response.data);

    if (response?.data?.updated) {  
  yield put(updateSystemSettingsSuccess(response.data));
} else {
  yield put(updateSystemSettingsFailure(response.data?.message || "Failed to update settings"));
}

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred while updating settings";
    yield put(updateSystemSettingsFailure(errorMessage));
  }
}


export default function* travelCategorySaga() {
  yield all([
    takeLatest(GET_TRAVEL_CATEGORIES_REQUEST, getTravelCategories),
    takeLatest(DELETE_TRAVEL_CATEGORY_REQUEST, deleteTravelCategory),
    takeLatest(ADD_TRAVEL_CATEGORY_REQUEST, addTravelCategorySaga),
    takeLatest(FETCH_TRAVEL_CATEGORY_REQUEST, fetchTravelCategorySaga),
    takeLatest(UPDATE_TRAVEL_CATEGORY_REQUEST, updateTravelCategorySaga),
    takeLatest(VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST, viewTravelCategoryDetails),
    takeLatest(FETCH_CATEGORY_TOURS_REQUEST, fetchCategoryTours),
    takeLatest(FETCH_CATEGORY_SUBCATEGORIES_REQUEST, fetchCategorySubcategories),
    takeLatest(FETCH_CATEGORY_BOOKINGS_REQUEST, fetchCategoryBookings),
    takeLatest(GET_SETTING_REQUEST, fetchSettingsSaga),
    takeLatest(UPDATE_SYSTEM_SETTINGS_REQUEST, updateSystemSettingsSaga),
  ]);
}
