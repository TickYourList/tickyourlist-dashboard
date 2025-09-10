import {
  ADD_TOUR_GROUP_FAILURE,
  ADD_TOUR_GROUP_REQUEST,
  ADD_TOUR_GROUP_SUCCESS,
  DELETE_TOUR_GROUP_FAILURE,
  DELETE_TOUR_GROUP_REQUEST,
  DELETE_TOUR_GROUP_SUCCESS,
  FETCH_TOUR_GROUP_FAILURE,
  FETCH_TOUR_GROUP_REQUEST,
  FETCH_TOUR_GROUP_SUCCESS,
  FETCH_TOUR_GROUP_WITH_ID_FAILURE,
  FETCH_TOUR_GROUP_WITH_ID_REQUEST,
  FETCH_TOUR_GROUP_WITH_ID_SUCCESS,
  GET_TOUR_GROUP_BOOKING_FAILURE,
  GET_TOUR_GROUP_BOOKING_REQUEST,
  GET_TOUR_GROUP_BOOKING_SUCCESS,
  REMOVE_TOUR_GROUP_WITH_ID,
  UPDATE_TOUR_GROUP_FAILURE,
  UPDATE_TOUR_GROUP_REQUEST,
  UPDATE_TOUR_GROUP_SUCCESS,
} from "./actionTypes"

//initial state for fetching tourgroups
const initialState = {
  tourGroup: [],
  tourGroupById: {},
  bookingTourGroupById: [],
  id: "",
  currPage: 1,
  totalCount: 0,
  loading: false,
  error: null,
}

//creating the reducer to sync when to call the api request
export default function tourGroupReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TOUR_GROUP_REQUEST:
      /* console.log("initialState ", state, action) */
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_TOUR_GROUP_SUCCESS:
      /* console.log("actionstate ", action.payload) */
      return {
        ...state,
        loading: false,
        tourGroup: action.payload.tourGroups || [],

        currPage: action.payload.page || 1,
        totalCount: action.payload.total || 0,
      }
    case FETCH_TOUR_GROUP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case FETCH_TOUR_GROUP_WITH_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case FETCH_TOUR_GROUP_WITH_ID_SUCCESS:
      /* console.log(action.payload) */
      return {
        ...state,
        tourGroupById: action.payload.tourGroupById,
        id: action.payload.id,
        loading: false,
        error: null,
      }

    case FETCH_TOUR_GROUP_WITH_ID_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case ADD_TOUR_GROUP_REQUEST:
      return { ...state, loading: true, error: null }
    case ADD_TOUR_GROUP_SUCCESS: {
      return {
        ...state,
        loading: false,
        tourGroup: [...state.tourGroup, { ...(action.payload || []) }],
      }
    }
    case ADD_TOUR_GROUP_FAILURE: {
      return { ...state, loading: false, error: action.payload }
    }

    case DELETE_TOUR_GROUP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case DELETE_TOUR_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        tourGroup: state.tourGroup.filter(tour => tour._id !== action.payload),
      }
    case DELETE_TOUR_GROUP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case REMOVE_TOUR_GROUP_WITH_ID:
      return {
        ...state,
        loading: false,
        error: null,
        tourGroupById: {},
        id: "",
      }
    case UPDATE_TOUR_GROUP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case UPDATE_TOUR_GROUP_SUCCESS:
      /* console.log("UPDATE TOUR GROUP", action.payload) */
      return {
        ...state,
        loading: false,
        tourGroup: state.tourGroup.map(tour =>
          tour._id === action.payload.id ? { ...tour, ...action.payload } : tour
        ),
      }

    case UPDATE_TOUR_GROUP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case GET_TOUR_GROUP_BOOKING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case GET_TOUR_GROUP_BOOKING_SUCCESS:
      /* console.info("reducer", action.payload) */
      return {
        ...state,
        loading: false,
        bookingTourGroupById: action.payload,
      }
    case GET_TOUR_GROUP_BOOKING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}
