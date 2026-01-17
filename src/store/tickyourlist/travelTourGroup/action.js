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
  FETCH_KLOOK_MAPPINGS_REQUEST,
  FETCH_KLOOK_MAPPINGS_SUCCESS,
  FETCH_KLOOK_MAPPINGS_FAILURE,
  SEARCH_KLOOK_ACTIVITIES_REQUEST,
  SEARCH_KLOOK_ACTIVITIES_SUCCESS,
  SEARCH_KLOOK_ACTIVITIES_FAILURE,
  FETCH_KLOOK_ACTIVITY_REQUEST,
  FETCH_KLOOK_ACTIVITY_SUCCESS,
  FETCH_KLOOK_ACTIVITY_FAILURE,
  BULK_LINK_KLOOK_MAPPINGS_REQUEST,
  BULK_LINK_KLOOK_MAPPINGS_SUCCESS,
  BULK_LINK_KLOOK_MAPPINGS_FAILURE,
  FETCH_KLOOK_LIVE_PRICING_REQUEST,
  FETCH_KLOOK_LIVE_PRICING_SUCCESS,
  FETCH_KLOOK_LIVE_PRICING_FAILURE,
  CREATE_VARIANT_FROM_KLOOK_REQUEST,
  CREATE_VARIANT_FROM_KLOOK_SUCCESS,
  CREATE_VARIANT_FROM_KLOOK_FAILURE,
  DELETE_KLOOK_MAPPING_REQUEST,
  DELETE_KLOOK_MAPPING_SUCCESS,
  DELETE_KLOOK_MAPPING_FAILURE,
  FETCH_MARKUP_CONFIGS_REQUEST,
  FETCH_MARKUP_CONFIGS_SUCCESS,
  FETCH_MARKUP_CONFIGS_FAILURE,
  UPSERT_MARKUP_CONFIG_REQUEST,
  UPSERT_MARKUP_CONFIG_SUCCESS,
  UPSERT_MARKUP_CONFIG_FAILURE,
  UPDATE_MARKUP_CONFIG_REQUEST,
  UPDATE_MARKUP_CONFIG_SUCCESS,
  UPDATE_MARKUP_CONFIG_FAILURE,
  DELETE_MARKUP_CONFIG_REQUEST,
  DELETE_MARKUP_CONFIG_SUCCESS,
  DELETE_MARKUP_CONFIG_FAILURE,
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

// Fetch Klook Mappings
export const fetchKlookMappingsRequest = tourGroupId => ({
  type: FETCH_KLOOK_MAPPINGS_REQUEST,
  payload: tourGroupId,
})

export const fetchKlookMappingsSuccess = (tourGroupId, mappings) => ({
  type: FETCH_KLOOK_MAPPINGS_SUCCESS,
  payload: { tourGroupId, mappings },
})

export const fetchKlookMappingsFailure = error => ({
  type: FETCH_KLOOK_MAPPINGS_FAILURE,
  payload: error,
})

// Search Klook Activities
export const searchKlookActivitiesRequest = searchQuery => ({
  type: SEARCH_KLOOK_ACTIVITIES_REQUEST,
  payload: searchQuery,
})

export const searchKlookActivitiesSuccess = activities => ({
  type: SEARCH_KLOOK_ACTIVITIES_SUCCESS,
  payload: activities,
})

export const searchKlookActivitiesFailure = error => ({
  type: SEARCH_KLOOK_ACTIVITIES_FAILURE,
  payload: error,
})

// Fetch Klook Activity Details
export const fetchKlookActivityRequest = activityId => ({
  type: FETCH_KLOOK_ACTIVITY_REQUEST,
  payload: activityId,
})

export const fetchKlookActivitySuccess = activity => ({
  type: FETCH_KLOOK_ACTIVITY_SUCCESS,
  payload: activity,
})

export const fetchKlookActivityFailure = error => ({
  type: FETCH_KLOOK_ACTIVITY_FAILURE,
  payload: error,
})

// Bulk Link Klook Mappings
export const bulkLinkKlookMappingsRequest = mappings => ({
  type: BULK_LINK_KLOOK_MAPPINGS_REQUEST,
  payload: mappings,
})

export const bulkLinkKlookMappingsSuccess = result => ({
  type: BULK_LINK_KLOOK_MAPPINGS_SUCCESS,
  payload: result,
})

export const bulkLinkKlookMappingsFailure = error => ({
  type: BULK_LINK_KLOOK_MAPPINGS_FAILURE,
  payload: error,
})

// Fetch Klook Live Pricing
export const fetchKlookLivePricingRequest = (tourGroupId, startDate, endDate, variantId, currency) => ({
  type: FETCH_KLOOK_LIVE_PRICING_REQUEST,
  payload: { tourGroupId, startDate, endDate, variantId, currency },
})

export const fetchKlookLivePricingSuccess = (tourGroupId, pricingData) => ({
  type: FETCH_KLOOK_LIVE_PRICING_SUCCESS,
  payload: { tourGroupId, pricingData },
})

export const fetchKlookLivePricingFailure = error => ({
  type: FETCH_KLOOK_LIVE_PRICING_FAILURE,
  payload: error,
})

// Create Variant from Klook Package
export const createVariantFromKlookRequest = (tourGroupId, klookActivityId, klookPackageId) => ({
  type: CREATE_VARIANT_FROM_KLOOK_REQUEST,
  payload: { tourGroupId, klookActivityId, klookPackageId },
})

export const createVariantFromKlookSuccess = (tourGroupId, variantData) => ({
  type: CREATE_VARIANT_FROM_KLOOK_SUCCESS,
  payload: { tourGroupId, variantData },
})

export const createVariantFromKlookFailure = error => ({
  type: CREATE_VARIANT_FROM_KLOOK_FAILURE,
  payload: error,
})

// Delete Klook Mapping
export const deleteKlookMappingRequest = (mappingId, tourGroupId) => ({
  type: DELETE_KLOOK_MAPPING_REQUEST,
  payload: { mappingId, tourGroupId },
})

export const deleteKlookMappingSuccess = (mappingId, tourGroupId) => ({
  type: DELETE_KLOOK_MAPPING_SUCCESS,
  payload: { mappingId, tourGroupId },
})

export const deleteKlookMappingFailure = error => ({
  type: DELETE_KLOOK_MAPPING_FAILURE,
  payload: error,
})

// Provider Markup Configuration Actions
export const fetchMarkupConfigsRequest = (provider, level, tourGroupId, variantId, isActive) => ({
  type: FETCH_MARKUP_CONFIGS_REQUEST,
  payload: { provider, level, tourGroupId, variantId, isActive },
})

export const fetchMarkupConfigsSuccess = configs => ({
  type: FETCH_MARKUP_CONFIGS_SUCCESS,
  payload: configs,
})

export const fetchMarkupConfigsFailure = error => ({
  type: FETCH_MARKUP_CONFIGS_FAILURE,
  payload: error,
})

export const upsertMarkupConfigRequest = configData => ({
  type: UPSERT_MARKUP_CONFIG_REQUEST,
  payload: configData,
})

export const upsertMarkupConfigSuccess = config => ({
  type: UPSERT_MARKUP_CONFIG_SUCCESS,
  payload: config,
})

export const upsertMarkupConfigFailure = error => ({
  type: UPSERT_MARKUP_CONFIG_FAILURE,
  payload: error,
})

export const updateMarkupConfigRequest = (configId, updateData) => ({
  type: UPDATE_MARKUP_CONFIG_REQUEST,
  payload: { configId, updateData },
})

export const updateMarkupConfigSuccess = config => ({
  type: UPDATE_MARKUP_CONFIG_SUCCESS,
  payload: config,
})

export const updateMarkupConfigFailure = error => ({
  type: UPDATE_MARKUP_CONFIG_FAILURE,
  payload: error,
})

export const deleteMarkupConfigRequest = configId => ({
  type: DELETE_MARKUP_CONFIG_REQUEST,
  payload: configId,
})

export const deleteMarkupConfigSuccess = configId => ({
  type: DELETE_MARKUP_CONFIG_SUCCESS,
  payload: configId,
})

export const deleteMarkupConfigFailure = error => ({
  type: DELETE_MARKUP_CONFIG_FAILURE,
  payload: error,
})
