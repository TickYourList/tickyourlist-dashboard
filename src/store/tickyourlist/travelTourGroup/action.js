// actionTypes
import {
  FETCH_TOUR_GROUP_REQUEST,
  FETCH_TOUR_GROUP_SUCCESS,
  FETCH_TOUR_GROUP_FAILURE,
  ADD_TOUR_GROUP_REQUEST,
  ADD_TOUR_GROUP_SUCCESS,
  ADD_TOUR_GROUP_FAILURE,
  FETCH_TOUR_GROUP_WITH_ID_REQUEST,
  FETCH_TOUR_GROUP_WITH_ID_SUCCESS,
  FETCH_TOUR_GROUP_WITH_ID_FAILURE,
  UPDATE_TOUR_GROUP_REQUEST,
  UPDATE_TOUR_GROUP_SUCCESS,
  UPDATE_TOUR_GROUP_FAILURE,
  REMOVE_TOUR_GROUP_WITH_ID,
  CLEAR_TOUR_GROUP_LIST,
  DELETE_TOUR_GROUP_REQUEST,
  DELETE_TOUR_GROUP_SUCCESS,
  DELETE_TOUR_GROUP_FAILURE,
  GET_TOUR_GROUP_BOOKING_REQUEST,
  GET_TOUR_GROUP_BOOKING_SUCCESS,
  GET_TOUR_GROUP_BOOKING_FAILURE,
  FETCH_TOUR_GROUPS_BY_CITY_REQUEST,
  FETCH_TOUR_GROUPS_BY_CITY_SUCCESS,
  FETCH_TOUR_GROUPS_BY_CITY_FAILURE,
  FETCH_VARIANTS_BY_TOUR_REQUEST,
  FETCH_VARIANTS_BY_TOUR_SUCCESS,
  FETCH_VARIANTS_BY_TOUR_FAILURE,
  FETCH_PRICING_RULES_REQUEST,
  FETCH_PRICING_RULES_SUCCESS,
  FETCH_PRICING_RULES_FAILURE,
  SEARCH_TOUR_GROUPS_REQUEST,
  SEARCH_TOUR_GROUPS_SUCCESS,
  SEARCH_TOUR_GROUPS_FAILURE,
  CREATE_PRICING_RULE_REQUEST,
  CREATE_PRICING_RULE_SUCCESS,
  CREATE_PRICING_RULE_FAILURE,
  UPDATE_PRICING_RULE_REQUEST,
  UPDATE_PRICING_RULE_SUCCESS,
  UPDATE_PRICING_RULE_FAILURE,
  DELETE_PRICING_RULE_REQUEST,
  DELETE_PRICING_RULE_SUCCESS,
  DELETE_PRICING_RULE_FAILURE,
  FETCH_DATE_PRICING_REQUEST,
  FETCH_DATE_PRICING_SUCCESS,
  FETCH_DATE_PRICING_FAILURE,
  SAVE_DATE_PRICING_REQUEST,
  SAVE_DATE_PRICING_SUCCESS,
  SAVE_DATE_PRICING_FAILURE,
  BULK_DATE_PRICING_REQUEST,
  BULK_DATE_PRICING_SUCCESS,
  BULK_DATE_PRICING_FAILURE,
  FETCH_VARIANT_DETAIL_REQUEST,
  FETCH_VARIANT_DETAIL_SUCCESS,
  FETCH_VARIANT_DETAIL_FAILURE,
  UPDATE_VARIANT_PRICES_REQUEST,
  UPDATE_VARIANT_PRICES_SUCCESS,
  UPDATE_VARIANT_PRICES_FAILURE,
} from "./actionTypes"

// Fetch All Tour Groups
export const fetchTourGroupsRequest = payload => {
  /*   console.log("fetchTourGroupsRequest action ", payload) */
  return {
    type: FETCH_TOUR_GROUP_REQUEST,
    payload, // { page, limit }
  }
}

export const fetchTourGroupsSuccess = payload => ({
  type: FETCH_TOUR_GROUP_SUCCESS,

  payload, // { tourGroups, page, total }
})

export const fetchTourGroupsFailure = error => ({
  type: FETCH_TOUR_GROUP_FAILURE,
  payload: error,
})

// Fetch Single Tour Group By ID
export const fetchTourGroupByIdRequest = id => ({
  type: FETCH_TOUR_GROUP_WITH_ID_REQUEST,
  payload: id,
})

export const fetchTourGroupByIdSuccess = payload => ({
  type: FETCH_TOUR_GROUP_WITH_ID_SUCCESS,
  payload, // { tourGroupById, id }
})

export const fetchTourGroupByIdFailure = error => ({
  type: FETCH_TOUR_GROUP_WITH_ID_FAILURE,
  payload: error,
})

export const removeTourGroupWithId = () => ({
  type: REMOVE_TOUR_GROUP_WITH_ID,
})

export const clearTourGroupList = () => ({
  type: CLEAR_TOUR_GROUP_LIST,
})

// Add Tour Group
export const addTourGroupRequest = payload => ({
  type: ADD_TOUR_GROUP_REQUEST,
  payload, // { CityCode, formData }
})

export const addTourGroupSuccess = data => ({
  type: ADD_TOUR_GROUP_SUCCESS,
  payload: data,
})

export const addTourGroupFailure = error => ({
  type: ADD_TOUR_GROUP_FAILURE,
  payload: error,
})

// Update Tour Group
export const updateTourGroupRequest = payload => {
  /*  console.log("update tour group ", payload) */
  return {
    type: UPDATE_TOUR_GROUP_REQUEST,
    payload,
  }
}

export const updateTourGroupSuccess = payload => ({
  type: UPDATE_TOUR_GROUP_SUCCESS,
  payload, // { id, formData }
})

export const updateTourGroupFailure = error => ({
  type: UPDATE_TOUR_GROUP_FAILURE,
  payload: error,
})

export const deleteTourGroupRequest = (id, name) => ({
  type: DELETE_TOUR_GROUP_REQUEST,
  payload: { id, name },
})

export const deleteTourGroupSuccess = id => ({
  type: DELETE_TOUR_GROUP_SUCCESS,
  payload: id,
})

export const deleteTourGroupFailure = error => ({
  type: DELETE_TOUR_GROUP_FAILURE,
  payload: error,
})

export const getTourGroupBookingDetailRequest = id => ({
  type: GET_TOUR_GROUP_BOOKING_REQUEST,
  payload: id,
})
export const getTourGroupBookingDetailFailure = error => ({
  type: GET_TOUR_GROUP_BOOKING_FAILURE,
  payload: error,
})

export const getTourGroupBookingDetailSuccess = payload => {
  /* console.log("action", payload) */
  return {
    type: GET_TOUR_GROUP_BOOKING_SUCCESS,
    payload,
  }
}

// Fetch tour groups by city (lightweight for dropdowns)
export const fetchTourGroupsByCityRequest = cityCode => ({
  type: FETCH_TOUR_GROUPS_BY_CITY_REQUEST,
  payload: cityCode,
})

export const fetchTourGroupsByCitySuccess = tourGroups => ({
  type: FETCH_TOUR_GROUPS_BY_CITY_SUCCESS,
  payload: tourGroups,
})

export const fetchTourGroupsByCityFailure = error => ({
  type: FETCH_TOUR_GROUPS_BY_CITY_FAILURE,
  payload: error,
})

// Fetch variants by tour
export const fetchVariantsByTourRequest = tourId => ({
  type: FETCH_VARIANTS_BY_TOUR_REQUEST,
  payload: tourId,
})

export const fetchVariantsByTourSuccess = variants => ({
  type: FETCH_VARIANTS_BY_TOUR_SUCCESS,
  payload: variants,
})

export const fetchVariantsByTourFailure = error => ({
  type: FETCH_VARIANTS_BY_TOUR_FAILURE,
  payload: error,
})

// Fetch pricing rules by variant
export const fetchPricingRulesRequest = variantId => ({
  type: FETCH_PRICING_RULES_REQUEST,
  payload: variantId,
})

export const fetchPricingRulesSuccess = rules => ({
  type: FETCH_PRICING_RULES_SUCCESS,
  payload: rules,
})

export const fetchPricingRulesFailure = error => ({
  type: FETCH_PRICING_RULES_FAILURE,
  payload: error,
})

// Search tour groups by name
export const searchTourGroupsRequest = (searchQuery, cityCode) => ({
  type: SEARCH_TOUR_GROUPS_REQUEST,
  payload: { searchQuery, cityCode },
})

export const searchTourGroupsSuccess = tourGroups => ({
  type: SEARCH_TOUR_GROUPS_SUCCESS,
  payload: tourGroups,
})

export const searchTourGroupsFailure = error => ({
  type: SEARCH_TOUR_GROUPS_FAILURE,
  payload: error,
})

// Create pricing rule
export const createPricingRuleRequest = (variantId, ruleData) => ({
  type: CREATE_PRICING_RULE_REQUEST,
  payload: { variantId, ruleData },
})

export const createPricingRuleSuccess = (rule) => ({
  type: CREATE_PRICING_RULE_SUCCESS,
  payload: rule,
})

export const createPricingRuleFailure = error => ({
  type: CREATE_PRICING_RULE_FAILURE,
  payload: error,
})

// Update pricing rule
export const updatePricingRuleRequest = (variantId, tag, ruleData) => ({
  type: UPDATE_PRICING_RULE_REQUEST,
  payload: { variantId, tag, ruleData },
})

export const updatePricingRuleSuccess = (rule) => ({
  type: UPDATE_PRICING_RULE_SUCCESS,
  payload: rule,
})

export const updatePricingRuleFailure = error => ({
  type: UPDATE_PRICING_RULE_FAILURE,
  payload: error,
})

// Delete pricing rule
export const deletePricingRuleRequest = (variantId, tag) => ({
  type: DELETE_PRICING_RULE_REQUEST,
  payload: { variantId, tag },
})

export const deletePricingRuleSuccess = (tag) => ({
  type: DELETE_PRICING_RULE_SUCCESS,
  payload: tag,
})

export const deletePricingRuleFailure = error => ({
  type: DELETE_PRICING_RULE_FAILURE,
  payload: error,
})

// Fetch date-specific pricing
export const fetchDatePricingRequest = (variantId, date) => ({
  type: FETCH_DATE_PRICING_REQUEST,
  payload: { variantId, date },
})

export const fetchDatePricingSuccess = (datePricing) => ({
  type: FETCH_DATE_PRICING_SUCCESS,
  payload: datePricing,
})

export const fetchDatePricingFailure = error => ({
  type: FETCH_DATE_PRICING_FAILURE,
  payload: error,
})

// Save date-specific pricing (create/update)
export const saveDatePricingRequest = (variantId, date, pricingData) => ({
  type: SAVE_DATE_PRICING_REQUEST,
  payload: { variantId, date, pricingData },
})

export const saveDatePricingSuccess = (datePricing) => ({
  type: SAVE_DATE_PRICING_SUCCESS,
  payload: datePricing,
})

export const saveDatePricingFailure = error => ({
  type: SAVE_DATE_PRICING_FAILURE,
  payload: error,
})

// Bulk date pricing (for date ranges)
export const bulkDatePricingRequest = (variantId, dateRange, pricingData, operation = 'create') => ({
  type: BULK_DATE_PRICING_REQUEST,
  payload: { variantId, dateRange, pricingData, operation },
})

export const bulkDatePricingSuccess = (result) => ({
  type: BULK_DATE_PRICING_SUCCESS,
  payload: result,
})

export const bulkDatePricingFailure = error => ({
  type: BULK_DATE_PRICING_FAILURE,
  payload: error,
})

// Fetch variant details
export const fetchVariantDetailRequest = variantId => ({
  type: FETCH_VARIANT_DETAIL_REQUEST,
  payload: variantId,
})

export const fetchVariantDetailSuccess = variant => ({
  type: FETCH_VARIANT_DETAIL_SUCCESS,
  payload: variant,
})

export const fetchVariantDetailFailure = error => ({
  type: FETCH_VARIANT_DETAIL_FAILURE,
  payload: error,
})

// Update variant prices
export const updateVariantPricesRequest = (variantId, payload, onSuccess) => ({
  type: UPDATE_VARIANT_PRICES_REQUEST,
  payload: { variantId, payload, onSuccess },
})

export const updateVariantPricesSuccess = (data) => ({
  type: UPDATE_VARIANT_PRICES_SUCCESS,
  payload: data,
})

export const updateVariantPricesFailure = error => ({
  type: UPDATE_VARIANT_PRICES_FAILURE,
  payload: error,
})

