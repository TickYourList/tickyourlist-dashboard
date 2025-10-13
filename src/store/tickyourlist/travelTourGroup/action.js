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

