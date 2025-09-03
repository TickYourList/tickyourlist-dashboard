import {
  ADD_NEW_TRAVEL_PARTNER,
  ADD_TRAVEL_PARTNER_FAIL,
  ADD_TRAVEL_PARTNER_SUCCESS,
  DELETE_TRAVEL_PARTNER_FAIL,
  DELETE_TRAVEL_PARTNER_SUCCESS,
  GET_TRAVEL_PARTNERS,
  GET_TRAVEL_PARTNERS_FAIL,
  RESET_TRAVEL_PARTNER_FLAG,
  GET_TRAVEL_PARTNERS_SUCCESS,
  UPDATE_TRAVEL_PARTNER_FAIL,
  UPDATE_TRAVEL_PARTNER_SUCCESS,
} from "./actionsType"

const INIT_STATE = {
  travelPartners: [],
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
  flag: null,
}

const travelPartner = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_TRAVEL_PARTNERS_SUCCESS:
      const sortedPartners = (action.payload?.partners || []).sort((a, b) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder
        }
        return 0
      })

      return {
        ...state,
        travelPartners: sortedPartners,
        pagination: {
          total: action.payload?.total || 0,
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 10,
        },
      }

    case GET_TRAVEL_PARTNERS_FAIL:
      return {
        ...state,
        error: action.payload
      }
    case ADD_NEW_TRAVEL_PARTNER:
      return {
        ...state,
        error: null,
      }

    case ADD_TRAVEL_PARTNER_SUCCESS:
      const newTravelPartner = action.payload
      const updatedTravelPartners = [...state.travelPartners, newTravelPartner]
      const updatedTotal = state.pagination.total + 1

      return {
        ...state,
        travelPartners: [...state.travelPartners, action.payload],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        flag: true,
      }
    case ADD_TRAVEL_PARTNER_FAIL:
      return {
        ...state,
        error: action.payload,
      }
    case UPDATE_TRAVEL_PARTNER_SUCCESS:
      return {
        ...state,
        travelPartners: state.travelPartners.map(tp =>
          tp._id.toString() === action.payload._id.toString()
            ? { ...tp, ...action.payload }
            : tp
        ),
        flag: true
      }
    case UPDATE_TRAVEL_PARTNER_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case DELETE_TRAVEL_PARTNER_SUCCESS:
      return {
        ...state,
        travelPartners: state.travelPartners.filter(
          tp => tp._id.toString() !== action.payload._id.toString()
        ),
        flag: true,
      }

    case DELETE_TRAVEL_PARTNER_FAIL:
      return {
        ...state,
        error: action.payload,
        flag: false,
      }
      // Handle the new reset action
    case RESET_TRAVEL_PARTNER_FLAG:
      return {
        ...state,
        flag: null,
        error: null,
      }
    default:
      return state
  }
}

export default travelPartner
