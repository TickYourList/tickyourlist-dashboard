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
  getTourBookingDetails,
  getTourById,
  updateTourGroupHelper,
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
    const data = response.data
    yield put(fetchPricingRulesSuccess(data || []))
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
}
