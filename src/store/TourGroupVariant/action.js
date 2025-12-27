import {
  GET_TOUR_GROUP_VARIANTS,
  GET_TOUR_GROUP_VARIANTS_SUCCESS,
  GET_TOUR_GROUP_VARIANTS_ERROR,
  GET_TRAVEL_TOUR_GROUPS,
  GET_TRAVEL_TOUR_GROUPS_SUCCESS,
  GET_TRAVEL_TOUR_GROUPS_FAIL,
  ADD_TOUR_GROUP_VARIANT,
  ADD_TOUR_GROUP_VARIANT_SUCCESS,
  ADD_TOUR_GROUP_VARIANT_FAIL,
  UPDATE_TOUR_GROUP_VARIANT,
  UPDATE_TOUR_GROUP_VARIANT_SUCCESS,
  UPDATE_TOUR_GROUP_VARIANT_FAIL,
  GET_TOUR_GROUP_VARIANT_DETAIL,
  GET_TOUR_GROUP_VARIANT_DETAIL_SUCCESS,
  GET_TOUR_GROUP_VARIANT_DETAIL_FAIL,
  GET_PRICING_LIST,
  GET_PRICING_LIST_SUCCESS,
  GET_PRICING_LIST_FAIL,
  GET_BOOKING_LIST,
  GET_BOOKING_LIST_SUCCESS,
  GET_BOOKING_LIST_FAIL,
  GET_TOUR_GROUP_VARIANT_BY_ID,
  GET_TOUR_GROUP_VARIANT_BY_ID_SUCCESS,
  GET_TOUR_GROUP_VARIANT_BY_ID_FAIL,
} from "./actionType";

export const getTourGroupVariants = (page = 1, limit = 10, cityCode = null, tourGroupId = null, variantId = null) => ({
  type: GET_TOUR_GROUP_VARIANTS,
  payload: { page, limit, cityCode, tourGroupId, variantId },
});

export const getTourGroupVariantsSuccess = data => ({
  type: GET_TOUR_GROUP_VARIANTS_SUCCESS,
  payload: data,
});

export const getTourGroupVariantsError = error => ({
  type: GET_TOUR_GROUP_VARIANTS_ERROR,
  payload: error,
});

export const getTravelTourGroups = () => ({
  type: GET_TRAVEL_TOUR_GROUPS,
});

export const getTravelTourGroupsSuccess = data => ({
  type: GET_TRAVEL_TOUR_GROUPS_SUCCESS,
  payload: data,
});

export const getTravelTourGroupsFail = error => ({
  type: GET_TRAVEL_TOUR_GROUPS_FAIL,
  payload: error,
});

export const addTourGroupVariant = payload => ({
  type: ADD_TOUR_GROUP_VARIANT,
  payload,
});

export const addTourGroupVariantSuccess = response => ({
  type: ADD_TOUR_GROUP_VARIANT_SUCCESS,
  payload: response,
});

export const addTourGroupVariantFail = error => ({
  type: ADD_TOUR_GROUP_VARIANT_FAIL,
  payload: error,
});

export const updateTourGroupVariant = (variantId, updatedData) => ({
  type: UPDATE_TOUR_GROUP_VARIANT,
  payload: { variantId, updatedData },
});

export const updateTourGroupVariantSuccess = data => ({
  type: UPDATE_TOUR_GROUP_VARIANT_SUCCESS,
  payload: data,
});

export const updateTourGroupVariantFail = error => ({
  type: UPDATE_TOUR_GROUP_VARIANT_FAIL,
  payload: error,
});

export const getTourGroupVariantDetail = variantId => ({
  type: GET_TOUR_GROUP_VARIANT_DETAIL,
  payload: variantId,
});

export const getTourGroupVariantDetailSuccess = data => ({
  type: GET_TOUR_GROUP_VARIANT_DETAIL_SUCCESS,
  payload: data,
});

export const getTourGroupVariantDetailFail = error => ({
  type: GET_TOUR_GROUP_VARIANT_DETAIL_FAIL,
  payload: error,
});

export const getPricingList = variantId => ({
  type: GET_PRICING_LIST,
  payload: variantId,
});

export const getPricingListSuccess = data => ({
  type: GET_PRICING_LIST_SUCCESS,
  payload: data,
});

export const getPricingListFail = error => ({
  type: GET_PRICING_LIST_FAIL,
  payload: error,
});

export const getBookingList = variantId => ({
  type: GET_BOOKING_LIST,
  payload: variantId,
});

export const getBookingListSuccess = data => ({
  type: GET_BOOKING_LIST_SUCCESS,
  payload: data,
});

export const getBookingListFail = error => ({
  type: GET_BOOKING_LIST_FAIL,
  payload: error,
});

export const getTourGroupVariantById = variantId => ({
  type: GET_TOUR_GROUP_VARIANT_BY_ID,
  payload: variantId,
});

export const getTourGroupVariantByIdSuccess = data => ({
  type: GET_TOUR_GROUP_VARIANT_BY_ID_SUCCESS,
  payload: data,
});

export const getTourGroupVariantByIdFail = error => ({
  type: GET_TOUR_GROUP_VARIANT_BY_ID_FAIL,
  payload: error,
});