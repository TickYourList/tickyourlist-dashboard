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
} from "./actionTypes";

import {
  deleteCategory,
  getCategoriesList,
  getCategoryById,
  updateCategory,
} from "../../helpers/location_management_helper";
import { addTravelCategoryFailure, addTravelCategorySuccess, fetchTravelCategoryFailure, fetchTravelCategorySuccess, updateTravelCategoryFailure, updateTravelCategorySuccess } from "./actions";

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

export default function* travelCategorySaga() {
  yield all([
    takeLatest(GET_TRAVEL_CATEGORIES_REQUEST, getTravelCategories),
    takeLatest(DELETE_TRAVEL_CATEGORY_REQUEST, deleteTravelCategory),
    yield takeLatest(ADD_TRAVEL_CATEGORY_REQUEST, addTravelCategorySaga),
    yield takeLatest(FETCH_TRAVEL_CATEGORY_REQUEST, fetchTravelCategorySaga),
    yield takeLatest(UPDATE_TRAVEL_CATEGORY_REQUEST, updateTravelCategorySaga)
  ]);
}
