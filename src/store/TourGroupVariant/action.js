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
} from "./actionType";

export const getTourGroupVariants = (page = 1, limit = 10) => ({
  type: GET_TOUR_GROUP_VARIANTS,
  payload: { page, limit },
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
