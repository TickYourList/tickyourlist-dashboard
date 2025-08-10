import axios from "axios"
import { put, takeEvery, call } from "redux-saga/effects"
import {
  FETCH_TOUR_GROUP_REQUEST,
  ADD_TOUR_GROUP_REQUEST,
  FETCH_TOUR_GROUP_WITH_ID_REQUEST,
  UPDATE_TOUR_GROUP_REQUEST,
  DELETE_TOUR_GROUP_REQUEST,
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
} from "./action"

import { apiUrl, authToken, xApiKey } from "constants/layout"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import {
  addNewTourGroup,
  deleteTourGroupById,
  getAllTourGroupsList,
  getTourById,
  updateTourGroupHelper,
} from "../../../helpers/location_management_helper"

// 1. Fetch All Tour Groups
function* fetchTourGroup(action) {
  try {
    /* console.log("datadata ", action) */
    const { page = 1, limit = 10 } = action.payload || {}
    const res = yield call(getAllTourGroupsList, page, limit)

    const data = res.data
    /* console.log("datadata ", data) */
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
    showToastSuccess("Successfully deleted tour group with city name " + name)
  } catch (error) {
    yield put(deleteTourGroupFailure(error))
    showToastError("failed to delete")
  }
}
// Watcher
export default function* tourGroupSaga() {
  yield takeEvery(FETCH_TOUR_GROUP_REQUEST, fetchTourGroup)
  yield takeEvery(ADD_TOUR_GROUP_REQUEST, addTourGroup)
  yield takeEvery(FETCH_TOUR_GROUP_WITH_ID_REQUEST, fetchTourGroupById)
  yield takeEvery(UPDATE_TOUR_GROUP_REQUEST, updateTourGroup)
  yield takeEvery(DELETE_TOUR_GROUP_REQUEST, deleteTourGroup)
}