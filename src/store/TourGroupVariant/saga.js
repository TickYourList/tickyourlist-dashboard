import { takeEvery, takeLatest, call, put } from "redux-saga/effects";
import {
  GET_TOUR_GROUP_VARIANTS,
  GET_TRAVEL_TOUR_GROUPS,
  ADD_TOUR_GROUP_VARIANT,
  UPDATE_TOUR_GROUP_VARIANT,
} from "./actionType";

import {
  getTourGroupVariantsSuccess,
  getTourGroupVariantsError,
  getTravelTourGroupsSuccess,
  getTravelTourGroupsFail,
  addTourGroupVariantSuccess,
  addTourGroupVariantFail,
  updateTourGroupVariantSuccess,
  updateTourGroupVariantFail,
} from "./action";

import { getTourGroupVariants,
  getTourGroupVariantsAPI,
  getTravelTourGroupAPI,
  addTourGroupVariantAPI,
  updateTourGroupVariantAPI,
 } from "../../helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

function* onGetTourGroupVariants({ payload }) {
  try {
    const { page, limit } = payload || {};
    const response = yield call(getTourGroupVariantsAPI, { page, limit });

    yield put(
      getTourGroupVariantsSuccess({
        variants: response?.data?.variants || [],
        totalRecords: response?.data?.total || 0,
        page,
        limit,
      })
    );

    // showToastSuccess("Variants fetched successfully!", "Success");
  } catch (error) {
    yield put(getTourGroupVariantsError(error));
    showToastError(
      error.message || "Failed to fetch tour group variants.",
      "Error"
    );
  }
}

function* onGetTravelTourGroups() {
  try {
    const response = yield call(getTravelTourGroupAPI);
    const tourGroups = response?.data?.tourGroups || [];

    yield put(getTravelTourGroupsSuccess(tourGroups));
  } catch (error) {
    yield put(getTravelTourGroupsFail(error.message));
    showToastError("Failed to fetch travel tour groups.", "Error");
  }
}

function* onAddTourGroupVariant({ payload }) {
  try {
    const response = yield call(addTourGroupVariantAPI, payload);
    const resData = response?.data;
    // console.log("Raw response from API:", resData)

    if (resData?.tylTourGroupVariant) {
      yield put(addTourGroupVariantSuccess(resData));
      showToastSuccess("Variant added successfully!", "Success");
      // console.log("Tour group variant added successfully", resData)
    } else {
      throw new Error("Invalid Action.");
    }
  } catch (error) {
    yield put(addTourGroupVariantFail(error.message));
    showToastError(error.message || "Failed to add variant.", "Error");
    console.error("Add variant error:", error);
  }
}

function* onUpdateTourGroupVariant({ payload }) {
  try {
    const { variantId, updatedData } = payload;
    const response = yield call(
      updateTourGroupVariantAPI,
      variantId,
      updatedData
    );

    const updatedVariant = response?.data;

    if (updatedVariant && updatedVariant._id) {
      yield put(updateTourGroupVariantSuccess(updatedVariant));
      showToastSuccess("Variant updated successfully!", "Success");
    } else {
      yield put(updateTourGroupVariantFail("Update failed: Invalid response"));
      showToastError("Update failed", "Error");
    }
  } catch (error) {
    yield put(updateTourGroupVariantFail(error.message || "Network error"));
    showToastError(error.message || "Update failed", "Error");
  }
}

function* tourGroupVariantSaga() {
  yield takeEvery(GET_TOUR_GROUP_VARIANTS, onGetTourGroupVariants);
  yield takeEvery(GET_TRAVEL_TOUR_GROUPS, onGetTravelTourGroups);
  yield takeLatest(ADD_TOUR_GROUP_VARIANT, onAddTourGroupVariant);
  yield takeLatest(UPDATE_TOUR_GROUP_VARIANT, onUpdateTourGroupVariant);
}

export default tourGroupVariantSaga;
