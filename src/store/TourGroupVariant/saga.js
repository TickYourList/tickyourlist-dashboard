import { takeEvery, takeLatest, call, put } from "redux-saga/effects";
import {
  GET_TOUR_GROUP_VARIANTS,
  GET_TOUR_GROUP_VARIANT_BY_ID,
  GET_TRAVEL_TOUR_GROUPS,
  ADD_TOUR_GROUP_VARIANT,
  UPDATE_TOUR_GROUP_VARIANT,
  GET_TOUR_GROUP_VARIANT_DETAIL,
  GET_PRICING_LIST,
  GET_BOOKING_LIST,
  DELETE_TOUR_GROUP_VARIANT,
} from "./actionType";

import {
  getTourGroupVariantsSuccess,
  getTourGroupVariantsError,
  getTourGroupVariantByIdSuccess,
  getTourGroupVariantByIdFail,
  getTravelTourGroupsSuccess,
  getTravelTourGroupsFail,
  addTourGroupVariantSuccess,
  addTourGroupVariantFail,
  updateTourGroupVariantSuccess,
  updateTourGroupVariantFail,
  getTourGroupVariantDetailSuccess,
  getTourGroupVariantDetailFail,
  getPricingListSuccess,
  getPricingListFail,
  getBookingListSuccess,
  getBookingListFail,
  deleteTourGroupVariantSuccess,
  deleteTourGroupVariantFail,
} from "./action";

import { getTourGroupVariants,
  getTourGroupVariantsAPI,
  getTravelTourGroupAPI,
  addTourGroupVariantAPI,
  updateTourGroupVariantAPI,
  getTourGroupVariantDetailAPI,
  getPricingListAPI,
  getBookingListAPI,
  deleteTourGroupVariantAPI,
 } from "../../helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

function* onGetTourGroupVariants({ payload }) {
  try {
    const { page, limit, cityCode, tourGroupId, variantId } = payload || {};
    const response = yield call(getTourGroupVariantsAPI, { page, limit, cityCode, tourGroupId, variantId });

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

function* onGetTourGroupVariantById({ payload }) {
  try {
    // Use getTourGroupVariantDetailAPI which returns { variant, tourGroup, analytics }
    const response = yield call(getTourGroupVariantDetailAPI, payload);
    console.log('🔵 Saga: getTourGroupVariantById response:', response);
    
    // Extract variant from the nested structure - detail API returns { variant, tourGroup, analytics }
    const responseData = response?.data?.data || response?.data || response;
    const variant = responseData?.variant || responseData;
    const tourGroup = responseData?.tourGroup;
    
    console.log('🔵 Saga: Extracted variant:', variant);
    console.log('🔵 Saga: Extracted tourGroup:', tourGroup);
    
    // Enrich variant with productId and cityCode from tourGroup if not present
    if (variant && variant._id) {
      if (!variant.productId && tourGroup?._id) {
        variant.productId = tourGroup._id;
        console.log('✅ Added productId from tourGroup:', variant.productId);
      }
      if (!variant.cityCode && tourGroup?.cityCode) {
        variant.cityCode = tourGroup.cityCode;
        console.log('✅ Added cityCode from tourGroup:', variant.cityCode);
      }
      if (!variant.product && tourGroup) {
        variant.product = {
          _id: tourGroup._id,
          name: tourGroup.name,
          cityCode: tourGroup.cityCode
        };
        console.log('✅ Added product object from tourGroup');
      }
      
      yield put(getTourGroupVariantByIdSuccess(variant));
    } else {
      console.error('❌ Variant not found in response:', response);
      throw new Error("Variant not found");
    }
  } catch (error) {
    console.error('🔴 Error in onGetTourGroupVariantById:', error);
    yield put(
      getTourGroupVariantByIdFail(error.message || "Failed to fetch variant")
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

function* onGetTourGroupVariantDetail({ payload: variantId }) {
  try {
    const response = yield call(getTourGroupVariantDetailAPI, variantId);
    const tourGroupVariantDetail = response?.data;
    // console.log("tourGroupVariantDetailSaga ", tourGroupVariantDetail);

    if (tourGroupVariantDetail) {
      yield put(getTourGroupVariantDetailSuccess(tourGroupVariantDetail));
      // showToastSuccess(" Fetched Tour Group Variant Detail", "Success");
    } else {
      throw new Error("Invalid detail data.");
    }
  } catch (error) {
    yield put(
      getTourGroupVariantDetailFail(
        error.message || "Failed to fetch tour group variant detail"
      )
    );
    showToastError("Failed to fetch tour group variant detail", "Error");
  }
}

function* onGetPricingList({ payload: variantId }) {
  try {
    const response = yield call(getPricingListAPI, variantId);
    const pricingList = response?.data || [];
    // console.log(pricingData);
    yield put(getPricingListSuccess(pricingList));
    // Optional toast: showToastSuccess("Pricing list fetched!", "Success");
  } catch (error) {
    yield put(
      getPricingListFail(error.message || "Failed to fetch pricing list")
    );
    showToastError(error.message || "Failed to fetch pricing list", "Error");
  }
}

function* onGetBookingList({ payload: variantId }) {
  try {
    const response = yield call(getBookingListAPI, variantId);
    const bookingList = response?.data || [];
    // console.log(bookingList);
    yield put(getBookingListSuccess(bookingList));
    // Optional toast: showToastSuccess("Booking list fetched!", "Success");
  } catch (error) {
    yield put(
      getBookingListFail(error.message || "Failed to fetch booking list")
    );
    showToastError(error.message || "Failed to fetch booking list", "Error");
  }
}

function* onDeleteTourGroupVariant({ payload }) {
  const { id, name } = payload;
  try {
    yield call(deleteTourGroupVariantAPI, id);
    yield put(deleteTourGroupVariantSuccess(id));
    showToastSuccess(`Successfully deleted tour group variant: ${name || id}`, "Success");
  } catch (error) {
    yield put(deleteTourGroupVariantFail(error));
    showToastError(error.message || "Failed to delete tour group variant", "Error");
  }
}

function* tourGroupVariantSaga() {
  yield takeEvery(GET_TOUR_GROUP_VARIANTS, onGetTourGroupVariants);
  yield takeEvery(GET_TOUR_GROUP_VARIANT_BY_ID, onGetTourGroupVariantById);
  yield takeEvery(GET_TRAVEL_TOUR_GROUPS, onGetTravelTourGroups);
  yield takeLatest(ADD_TOUR_GROUP_VARIANT, onAddTourGroupVariant);
  yield takeLatest(UPDATE_TOUR_GROUP_VARIANT, onUpdateTourGroupVariant);
  yield takeLatest(GET_TOUR_GROUP_VARIANT_DETAIL, onGetTourGroupVariantDetail);
  yield takeLatest(GET_PRICING_LIST, onGetPricingList);
  yield takeLatest(GET_BOOKING_LIST, onGetBookingList);
  yield takeEvery(DELETE_TOUR_GROUP_VARIANT, onDeleteTourGroupVariant);
}

export default tourGroupVariantSaga;
