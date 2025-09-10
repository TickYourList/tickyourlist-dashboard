import { call, put, takeEvery } from "redux-saga/effects";
import toastr from "toastr";

import {
  GET_TOURS_REQUEST,
  GET_CATEGORIES_REQUEST,
  GET_SUBCATEGORIES_REQUEST,
  GET_COLLECTIONS_REQUEST,
  GET_BOOKINGS_REQUEST,
  SORT_CATEGORY_REQUEST,
  SORT_SUB_CATEGORY_REQUEST,
} from "./actionTypes";

import {
  getToursSuccess,
  getToursFail,
  getCategoriesSuccess,
  getCategoriesFail,
  getSubCategoriesSuccess,
  getSubCategoriesFail,
  getCollectionsSuccess,
  getCollectionsFail,
  getBookingsSuccess,
  getBookingsFail,
  sortCategoriesSuccess,
  sortCategoriesFail,
  sortSubCategoriesSuccess,
  sortSubCategoriesFail,
} from "./actions";

import {
  getCityTours,
  getCityCategories,
  getCitySubCategories,
  getCityCollections,
  getCityBookings,
  sortCityCategories,
  sortCitySubCategories,
} from "helpers/location_management_helper"; 

// --- Tours ---
function* fetchTours({ payload }) {
  try {
    const response = yield call(getCityTours, payload);
    if (response.statusCode === "10000") {
      yield put(getToursSuccess(response.data.tours));
    } else {
      yield put(getToursFail(response.message || "Failed to load tours"));
      toastr.error(response.message || "Failed to load tours");
    }
  } catch (error) {
    yield put(getToursFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to load tours");
  }
}

// --- Categories ---
function* fetchCategories({ payload }) {
  try {
    const response = yield call(getCityCategories, payload);
    if (response.statusCode === "10000") {
      yield put(getCategoriesSuccess(response.data.categories));
    } else {
      yield put(getCategoriesFail(response.message || "Failed to load categories"));
      toastr.error(response.message || "Failed to load categories");
    }
  } catch (error) {
    yield put(getCategoriesFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to load categories");
  }
}

// --- SubCategories ---
function* fetchSubCategories({ payload }) {
  try {
    const response = yield call(getCitySubCategories, payload);
    if (response.statusCode === "10000") {
      yield put(getSubCategoriesSuccess(response.data.subcategories));
    } else {
      yield put(getSubCategoriesFail(response.message || "Failed to load subcategories"));
      toastr.error(response.message || "Failed to load subcategories");
    }
  } catch (error) {
    yield put(getSubCategoriesFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to load subcategories");
  }
}

// --- Collections ---
function* fetchCollections({ payload }) {
  try {
    const response = yield call(getCityCollections, payload);
    if (response.statusCode === "10000") {
      yield put(getCollectionsSuccess(response.data.collections));
    } else {
      yield put(getCollectionsFail(response.message || "Failed to load collections"));
      toastr.error(response.message || "Failed to load collections");
    }
  } catch (error) {
    yield put(getCollectionsFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to load collections");
  }
}

// --- Bookings ---
function* fetchBookings({ payload }) {
  try {
    const response = yield call(getCityBookings, payload);
    if (response.statusCode === "10000") {
      yield put(getBookingsSuccess(response.data.bookings));
    } else {
      yield put(getBookingsFail(response.message || "Failed to load bookings"));
      toastr.error(response.message || "Failed to load bookings");
    }
  } catch (error) {
    yield put(getBookingsFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to load bookings");
  }
}

// --- Sort Categories ---
function* sortCategories({ payload }) {
  try {
    const response = yield call(sortCityCategories, payload);
    if (response.statusCode === "10000") {
      yield put(sortCategoriesSuccess(response.data));
      toastr.success("Categories sorted successfully!");
    } else {
      yield put(sortCategoriesFail(response.message || "Failed to sort categories"));
      toastr.error(response.message || "Failed to sort categories");
    }
  } catch (error) {
    yield put(sortCategoriesFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to sort categories");
  }
}

// --- Sort Sub Categories ---
function* sortSubCategories({ payload }) {
  try {
    const response = yield call(sortCitySubCategories, payload);
    if (response.statusCode === "10000") {
      yield put(sortSubCategoriesSuccess(response.data));
      toastr.success("Sub Categories sorted successfully!");
    } else {
      yield put(sortSubCategoriesFail(response.message || "Failed to sort sub categories"));
      toastr.error(response.message || "Failed to sort sub categories");
    }
  } catch (error) {
    yield put(sortSubCategoriesFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to sort sub categories");
  }
}

function* cityDetailsSaga() {
  yield takeEvery(GET_TOURS_REQUEST, fetchTours);
  yield takeEvery(GET_CATEGORIES_REQUEST, fetchCategories);
  yield takeEvery(GET_SUBCATEGORIES_REQUEST, fetchSubCategories);
  yield takeEvery(GET_COLLECTIONS_REQUEST, fetchCollections);
  yield takeEvery(GET_BOOKINGS_REQUEST, fetchBookings);
  yield takeEvery(SORT_CATEGORY_REQUEST, sortCategories);
  yield takeEvery(SORT_SUB_CATEGORY_REQUEST, sortSubCategories);
}

export default cityDetailsSaga
