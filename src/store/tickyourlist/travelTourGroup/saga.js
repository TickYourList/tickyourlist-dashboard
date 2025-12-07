import { put, takeEvery, call } from "redux-saga/effects"
import {
  FETCH_TOUR_GROUP_REQUEST,
  ADD_TOUR_GROUP_REQUEST,
  FETCH_TOUR_GROUP_WITH_ID_REQUEST,
  UPDATE_TOUR_GROUP_REQUEST,
  DELETE_TOUR_GROUP_REQUEST,
  GET_TOUR_GROUP_BOOKING_REQUEST,
  FETCH_TOUR_GROUPS_BY_CITY_REQUEST,
  FETCH_VARIANTS_BY_TOUR_REQUEST,
  FETCH_PRICING_RULES_REQUEST,
  SEARCH_TOUR_GROUPS_REQUEST,
  CREATE_PRICING_RULE_REQUEST,
  UPDATE_PRICING_RULE_REQUEST,
  DELETE_PRICING_RULE_REQUEST,
  FETCH_DATE_PRICING_REQUEST,
  SAVE_DATE_PRICING_REQUEST,
  FETCH_VARIANT_DETAIL_REQUEST,
  UPDATE_VARIANT_PRICES_REQUEST,
} from "./actionTypes"
import {
  fetchTourGroupsSuccess,
  fetchTourGroupsFailure,
  fetchTourGroupByIdSuccess,
  fetchTourGroupByIdFailure,
  addTourGroupSuccess,
  addTourGroupFailure,
  updateTourGroupSuccess,
  updateTourGroupFailure,
  deleteTourGroupFailure,
  deleteTourGroupSuccess,
  getTourGroupBookingDetailFailure,
  getTourGroupBookingDetailSuccess,
  fetchTourGroupsByCitySuccess,
  fetchTourGroupsByCityFailure,
  fetchVariantsByTourSuccess,
  fetchVariantsByTourFailure,
  fetchPricingRulesSuccess,
  fetchPricingRulesFailure,
  searchTourGroupsSuccess,
  searchTourGroupsFailure,
  createPricingRuleSuccess,
  createPricingRuleFailure,
  updatePricingRuleSuccess,
  updatePricingRuleFailure,
  deletePricingRuleSuccess,
  deletePricingRuleFailure,
  fetchDatePricingSuccess,
  fetchDatePricingFailure,
  saveDatePricingSuccess,
  saveDatePricingFailure,
  fetchVariantDetailSuccess,
  fetchVariantDetailFailure,
  updateVariantPricesSuccess,
  updateVariantPricesFailure,
  fetchVariantDetailRequest,
} from "./action"

import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import {
  addNewTourGroup,
  deleteTourGroupById,
  getAllTourGroupsList,
  getTourGroupsByCity,
  searchTourGroupsByName,
  getVariantsByTour,
  getPricingRulesByVariant,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getPricingRule,
  fetchDatePricing,
  saveDatePricing,
  getTourBookingDetails,
  getTourById,
  updateTourGroupHelper,
  getTourGroupVariantDetailAPI,
  updateVariantPrices,
} from "helpers/location_management_helper"

// 1. Fetch All Tour Groups
function* fetchTourGroup(action) {
  try {
    /* console.log("datadata ", action) */
    const { page = 1, limit = 10, cityCode = null } = action.payload || {}
    const res = yield call(getAllTourGroupsList, page, limit, cityCode)

    const data = res.data
    /*    console.log("datadata ", res) */
    yield put(
      fetchTourGroupsSuccess({
        tourGroups: data.tourGroups || [],
        page: data.page || page,
        total: data.total || 0,
      })
    )
  } catch (error) {
    /*  console.log("erroroccupred ", error) */
    yield put(fetchTourGroupsFailure(error.message))
  }
}

// 2. Fetch Tour Group by ID
function* fetchTourGroupById(action) {
  try {
    const id = action.payload
    const response = yield call(getTourById, id)

    const data = response.data
    /*  console.log(data) */
    yield put(fetchTourGroupByIdSuccess({ tourGroupById: data, id }))
  } catch (error) {
    yield put(fetchTourGroupByIdFailure(error.message))
  }
}

// 3. Add Tour Group
function* addTourGroup(action) {
  try {
    const { CityCode, formData } = action.payload
    /* console.log(action.payload) */
    const response = yield call(addNewTourGroup, CityCode, formData)

    yield put(addTourGroupSuccess(response.data.data))
    showToastSuccess("Tour group successfully created")
  } catch (error) {
    yield put(addTourGroupFailure(error.message))
    showToastError("Tour group failed to add.")
  }
}

// 4. Update Tour Group
function* updateTourGroup(action) {
  try {
    const { id, formData } = action.payload
    const response = yield call(updateTourGroupHelper, id, formData)

    yield put(updateTourGroupSuccess({ tourGroupById: response.data, id }))
    showToastSuccess("Update Tour group successfully created")
  } catch (error) {
    yield put(updateTourGroupFailure(error.message))
    showToastError("Failed to update tour group")
  }
}

function* deleteTourGroup({ payload }) {
  const { id, name } = payload
  try {
    /* console.log(payload) */
    yield call(deleteTourGroupById, id)
    yield put(deleteTourGroupSuccess(id))
    showToastSuccess("Successfully deleted tour group  " + name)
  } catch (error) {
    yield put(deleteTourGroupFailure(error))
    showToastError("failed to delete")
  }
}

function* getTourGroupBookingDetails(action) {
  try {
    const id = action.payload
    const response = yield call(getTourBookingDetails, id)
    const data = response.data
    const bookings = data.bookings
    /* console.log("data", bookings) */
    yield put(getTourGroupBookingDetailSuccess(bookings))
  } catch (error) {
    yield put(getTourGroupBookingDetailFailure(error))
    showToastError("Failed to Fetch Booking")
  }
}

// 7. Fetch Tour Groups by City (lightweight for dropdowns)
function* fetchTourGroupsByCitySaga(action) {
  try {
    const cityCode = action.payload
    console.log('🔵 Saga: Fetching tour groups for city:', cityCode)
    const response = yield call(getTourGroupsByCity, cityCode)
    console.log('🟢 Saga: Response received:', response)
    const data = response.data
    console.log('🟢 Saga: Data extracted:', data)
    console.log('🟢 Saga: Tour groups array:', data.data)
    yield put(fetchTourGroupsByCitySuccess(data || []))
  } catch (error) {
    console.error('🔴 Saga Error fetching tour groups by city:', error)
    yield put(fetchTourGroupsByCityFailure(error.message))
    showToastError('Failed to load tour groups for selected city')
  }
}

// 8. Fetch Variants by Tour
function* fetchVariantsByTourSaga(action) {
  try {
    const tourId = action.payload
    console.log('🔵 Saga: Fetching variants for tour:', tourId)
    const response = yield call(getVariantsByTour, tourId)
    console.log('🟢 Saga: Variants response:', response)
    const data = response.data
    yield put(fetchVariantsByTourSuccess(data || []))
  } catch (error) {
    console.error('🔴 Saga Error fetching variants:', error)
    yield put(fetchVariantsByTourFailure(error.message))
    showToastError('Failed to load variants for selected tour')
  }
}

// 9. Fetch Pricing Rules by Variant
function* fetchPricingRulesSaga(action) {
  try {
    const variantId = action.payload
    console.log('🔵 Saga: Fetching pricing rules for variant:', variantId)
    const response = yield call(getPricingRulesByVariant, variantId)
    console.log('🟢 Saga: Pricing rules response:', response)

    // Handle different response structures
    let rules = []
    if (response?.data?.rules) {
      rules = response.data.rules
    } else if (Array.isArray(response?.data)) {
      rules = response.data
    } else if (Array.isArray(response)) {
      rules = response
    }

    yield put(fetchPricingRulesSuccess({ rules }))
  } catch (error) {
    console.error('🔴 Saga Error fetching pricing rules:', error)
    yield put(fetchPricingRulesFailure(error.message))
    showToastError('Failed to load pricing rules')
  }
}

// 10. Search Tour Groups by Name
function* searchTourGroupsSaga(action) {
  try {
    const { searchQuery, cityCode } = action.payload
    console.log('🔵 Saga: Searching tour groups with query:', searchQuery, 'cityCode:', cityCode)
    const response = yield call(searchTourGroupsByName, searchQuery, cityCode)
    console.log('🟢 Saga: Search response:', response)

    // Handle different response structures
    let tourGroups = []
    if (Array.isArray(response)) {
      tourGroups = response
    } else if (Array.isArray(response.data)) {
      tourGroups = response.data
    } else if (response && typeof response === 'object') {
      // Try to find array in response
      const arr = Object.values(response).find(v => Array.isArray(v))
      if (arr) tourGroups = arr
    }

    console.log('🟢 Saga: Extracted tour groups:', tourGroups)
    yield put(searchTourGroupsSuccess(tourGroups))
  } catch (error) {
    console.error('🔴 Saga Error searching tour groups:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to search tour groups'
    yield put(searchTourGroupsFailure(errorMessage))
    showToastError(errorMessage)
  }
}

// 11. Create Pricing Rule
function* createPricingRuleSaga(action) {
  try {
    const { variantId, ruleData } = action.payload
    console.log('🔵 Saga: Creating pricing rule for variant:', variantId)
    const response = yield call(createPricingRule, variantId, ruleData)
    console.log('🟢 Saga: Create pricing rule response:', response)
    const rule = response.data?.rule || response.data || response
    yield put(createPricingRuleSuccess(rule))
    showToastSuccess('Pricing rule created successfully')
    // Refresh pricing rules list
    yield put({ type: FETCH_PRICING_RULES_REQUEST, payload: variantId })
  } catch (error) {
    console.error('🔴 Saga Error creating pricing rule:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create pricing rule'
    yield put(createPricingRuleFailure(errorMessage))
    showToastError(errorMessage)
  }
}

// 12. Update Pricing Rule
function* updatePricingRuleSaga(action) {
  try {
    const { variantId, tag, ruleData } = action.payload
    console.log('🔵 Saga: Updating pricing rule:', tag, 'for variant:', variantId)
    const response = yield call(updatePricingRule, variantId, tag, ruleData)
    console.log('🟢 Saga: Update pricing rule response:', response)
    const rule = response.data?.rule || response.data || response
    yield put(updatePricingRuleSuccess(rule))
    showToastSuccess('Pricing rule updated successfully')
    // Refresh pricing rules list
    yield put({ type: FETCH_PRICING_RULES_REQUEST, payload: variantId })
  } catch (error) {
    console.error('🔴 Saga Error updating pricing rule:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update pricing rule'
    yield put(updatePricingRuleFailure(errorMessage))
    showToastError(errorMessage)
  }
}

// 13. Delete Pricing Rule
function* deletePricingRuleSaga(action) {
  try {
    const { variantId, tag } = action.payload
    console.log('🔵 Saga: Deleting pricing rule:', tag, 'for variant:', variantId)
    yield call(deletePricingRule, variantId, tag)
    yield put(deletePricingRuleSuccess(tag))
    showToastSuccess('Pricing rule deleted successfully')
    // Refresh pricing rules list
    yield put({ type: FETCH_PRICING_RULES_REQUEST, payload: variantId })
  } catch (error) {
    console.error('🔴 Saga Error deleting pricing rule:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete pricing rule'
    yield put(deletePricingRuleFailure(errorMessage))
    showToastError(errorMessage)
  }
}

// 14. Fetch Date-Specific Pricing
function* fetchDatePricingSaga(action) {
  try {
    const { variantId, date } = action.payload
    // Calculate date range (30 days before and after the selected date)
    const selectedDate = new Date(date)
    const startDate = new Date(selectedDate)
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date(selectedDate)
    endDate.setDate(endDate.getDate() + 30)

    const response = yield call(
      fetchDatePricing,
      variantId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )

    const datePricing = response.data?.dateOverrides || response.data || []
    yield put(fetchDatePricingSuccess(datePricing))
  } catch (error) {
    console.error('🔴 Saga Error fetching date pricing:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch date pricing'
    yield put(fetchDatePricingFailure(errorMessage))
  }
}

// 15. Save Date-Specific Pricing
function* saveDatePricingSaga(action) {
  try {
    const { variantId, date, pricingData } = action.payload
    console.log('🔵 Saga: Saving date pricing for:', date, 'variant:', variantId)
    const response = yield call(saveDatePricing, variantId, date, pricingData)
    console.log('🟢 Saga: Save date pricing response:', response)
    const savedPricing = response.data?.data || response.data || response
    yield put(saveDatePricingSuccess(savedPricing))
    showToastSuccess('Date pricing saved successfully')
    // Refresh date pricing for the calendar
    yield put({ type: FETCH_DATE_PRICING_REQUEST, payload: { variantId, date } })
  } catch (error) {
    console.error('🔴 Saga Error saving date pricing:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save date pricing'
    yield put(saveDatePricingFailure(errorMessage))
    showToastError(errorMessage)
  }
}

// Watcher
export default function* tourGroupSaga() {
  yield takeEvery(FETCH_TOUR_GROUP_REQUEST, fetchTourGroup)
  yield takeEvery(ADD_TOUR_GROUP_REQUEST, addTourGroup)
  yield takeEvery(FETCH_TOUR_GROUP_WITH_ID_REQUEST, fetchTourGroupById)
  yield takeEvery(UPDATE_TOUR_GROUP_REQUEST, updateTourGroup)
  yield takeEvery(DELETE_TOUR_GROUP_REQUEST, deleteTourGroup)
  yield takeEvery(GET_TOUR_GROUP_BOOKING_REQUEST, getTourGroupBookingDetails)
  yield takeEvery(FETCH_TOUR_GROUPS_BY_CITY_REQUEST, fetchTourGroupsByCitySaga)
  yield takeEvery(FETCH_VARIANTS_BY_TOUR_REQUEST, fetchVariantsByTourSaga)
  yield takeEvery(FETCH_PRICING_RULES_REQUEST, fetchPricingRulesSaga)
  yield takeEvery(SEARCH_TOUR_GROUPS_REQUEST, searchTourGroupsSaga)
  yield takeEvery(CREATE_PRICING_RULE_REQUEST, createPricingRuleSaga)
  yield takeEvery(UPDATE_PRICING_RULE_REQUEST, updatePricingRuleSaga)
  yield takeEvery(DELETE_PRICING_RULE_REQUEST, deletePricingRuleSaga)
  yield takeEvery(FETCH_DATE_PRICING_REQUEST, fetchDatePricingSaga)
  yield takeEvery(SAVE_DATE_PRICING_REQUEST, saveDatePricingSaga)
  yield takeEvery(FETCH_VARIANT_DETAIL_REQUEST, fetchVariantDetailSaga)
  yield takeEvery(UPDATE_VARIANT_PRICES_REQUEST, updateVariantPricesSaga)
}

// Fetch variant details
function* fetchVariantDetailSaga(action) {
  try {
    const variantId = action.payload
    const response = yield call(getTourGroupVariantDetailAPI, variantId)
    const variant = response?.data?.data || response?.data || response
    yield put(fetchVariantDetailSuccess(variant))
  } catch (error) {
    console.error('Error fetching variant details:', error)
    yield put(fetchVariantDetailFailure(error.message))
  }
}

// Update variant prices
function* updateVariantPricesSaga(action) {
  try {
    const { variantId, payload, onSuccess } = action.payload
    console.log('🔵 Saga: Updating variant prices:', variantId)
    const response = yield call(updateVariantPrices, variantId, payload)
    console.log('🟢 Saga: Update variant prices response:', response)

    yield put(updateVariantPricesSuccess(response))
    showToastSuccess("Listing price updated successfully")

    // Refresh variant details
    yield put(fetchVariantDetailRequest(variantId))

    if (onSuccess) {
      yield call(onSuccess)
    }
  } catch (error) {
    console.error('🔴 Saga Error updating variant prices:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update listing price'
    yield put(updateVariantPricesFailure(errorMessage))
    showToastError(errorMessage)
  }
}
