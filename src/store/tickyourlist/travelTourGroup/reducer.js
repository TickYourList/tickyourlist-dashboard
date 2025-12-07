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
  CLEAR_TOUR_GROUP_LIST,
  UPDATE_TOUR_GROUP_FAILURE,
  UPDATE_TOUR_GROUP_REQUEST,
  UPDATE_TOUR_GROUP_SUCCESS,
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
  FETCH_VARIANT_DETAIL_REQUEST,
  FETCH_VARIANT_DETAIL_SUCCESS,
  FETCH_VARIANT_DETAIL_FAILURE,
  UPDATE_VARIANT_PRICES_REQUEST,
  UPDATE_VARIANT_PRICES_SUCCESS,
  UPDATE_VARIANT_PRICES_FAILURE,
} from "./actionTypes"

//initial state for fetching tourgroups
const initialState = {
  tourGroup: [],
  tourGroupById: {},
  bookingTourGroupById: [],
  tourGroupsByCity: [], // Lightweight list for dropdowns
  variantsByTour: [], // Variants for selected tour
  pricingRules: [], // Pricing rules for selected variant
  searchedTourGroups: [], // Search results
  datePricing: [], // Date-specific pricing overrides
  variantDetail: null, // Variant details with pricing types
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
      const newTourGroups = action.payload.tourGroups || []
      const currentPage = action.payload.page || 1

      // If page 1, replace data; otherwise append new data
      let updatedTourGroups
      if (currentPage === 1) {
        updatedTourGroups = newTourGroups
      } else {
        // Append new data, avoiding duplicates
        const existingIds = new Set(state.tourGroup.map(tg => tg._id))
        const uniqueNewGroups = newTourGroups.filter(tg => !existingIds.has(tg._id))
        updatedTourGroups = [...state.tourGroup, ...uniqueNewGroups]
      }

      return {
        ...state,
        loading: false,
        tourGroup: updatedTourGroups,
        currPage: currentPage,
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
    case CLEAR_TOUR_GROUP_LIST:
      return {
        ...state,
        tourGroup: [],
        currPage: 1,
        totalCount: 0,
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
    case FETCH_TOUR_GROUPS_BY_CITY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_TOUR_GROUPS_BY_CITY_SUCCESS:
      return {
        ...state,
        loading: false,
        tourGroupsByCity: action.payload || [],
        error: null,
      }
    case FETCH_TOUR_GROUPS_BY_CITY_FAILURE:
      return {
        ...state,
        loading: false,
        tourGroupsByCity: [],
        error: action.payload,
      }
    case FETCH_VARIANTS_BY_TOUR_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_VARIANTS_BY_TOUR_SUCCESS:
      return {
        ...state,
        loading: false,
        variantsByTour: action.payload || [],
        error: null,
      }
    case FETCH_VARIANTS_BY_TOUR_FAILURE:
      return {
        ...state,
        loading: false,
        variantsByTour: [],
        error: action.payload,
      }
    case FETCH_PRICING_RULES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_PRICING_RULES_SUCCESS:
      return {
        ...state,
        loading: false,
        pricingRules: action.payload.rules || [],
        error: null,
      }
    case FETCH_PRICING_RULES_FAILURE:
      return {
        ...state,
        loading: false,
        pricingRules: [],
        error: action.payload,
      }
    case SEARCH_TOUR_GROUPS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case SEARCH_TOUR_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        searchedTourGroups: action.payload || [],
        error: null,
      }
    case SEARCH_TOUR_GROUPS_FAILURE:
      return {
        ...state,
        loading: false,
        searchedTourGroups: [],
        error: action.payload,
      }
    case CREATE_PRICING_RULE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case CREATE_PRICING_RULE_SUCCESS:
      return {
        ...state,
        loading: false,
        pricingRules: [...state.pricingRules, action.payload],
        error: null,
      }
    case CREATE_PRICING_RULE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case UPDATE_PRICING_RULE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case UPDATE_PRICING_RULE_SUCCESS:
      return {
        ...state,
        loading: false,
        pricingRules: state.pricingRules.map(rule =>
          rule.tag === action.payload.tag ? action.payload : rule
        ),
        error: null,
      }
    case UPDATE_PRICING_RULE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case DELETE_PRICING_RULE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case DELETE_PRICING_RULE_SUCCESS:
      return {
        ...state,
        loading: false,
        pricingRules: state.pricingRules.filter(rule => rule.tag !== action.payload),
        error: null,
      }
    case DELETE_PRICING_RULE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case FETCH_DATE_PRICING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_DATE_PRICING_SUCCESS:
      return {
        ...state,
        loading: false,
        datePricing: action.payload || [],
        error: null,
      }
    case FETCH_DATE_PRICING_FAILURE:
      return {
        ...state,
        loading: false,
        datePricing: [],
        error: action.payload,
      }
    case SAVE_DATE_PRICING_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case SAVE_DATE_PRICING_SUCCESS:
      // Update or add the date pricing in the array
      const savedDate = action.payload
      const existingIndex = state.datePricing.findIndex(
        dp => dp.date === savedDate.date ||
          (dp.date && new Date(dp.date).toISOString().split('T')[0] === new Date(savedDate.date).toISOString().split('T')[0])
      )
      const updatedDatePricing = existingIndex >= 0
        ? state.datePricing.map((dp, idx) => idx === existingIndex ? savedDate : dp)
        : [...state.datePricing, savedDate]
      return {
        ...state,
        loading: false,
        datePricing: updatedDatePricing,
        error: null,
      }
    case SAVE_DATE_PRICING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case FETCH_VARIANT_DETAIL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case FETCH_VARIANT_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        variantDetail: action.payload,
        error: null,
      }
    case FETCH_VARIANT_DETAIL_FAILURE:
      return {
        ...state,
        loading: false,
        variantDetail: null,
        error: action.payload,
      }
    case UPDATE_VARIANT_PRICES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case UPDATE_VARIANT_PRICES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      }
    case UPDATE_VARIANT_PRICES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}
