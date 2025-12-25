import {
  GET_CONTINENTS_DASHBOARD,
  GET_CONTINENTS_DASHBOARD_SUCCESS,
  GET_CONTINENTS_DASHBOARD_FAILURE,
  BULK_LINK_CONTINENT,
  BULK_LINK_CONTINENT_SUCCESS,
  BULK_LINK_CONTINENT_FAILURE,
  BULK_LINK_ALL_COUNTRIES,
  BULK_LINK_ALL_COUNTRIES_SUCCESS,
  BULK_LINK_ALL_COUNTRIES_FAILURE,
} from "./actions"

const initialState = {
  continents: [],
  summary: null,
  loading: false,
  error: null,
  linking: false,
  linkError: null,
  linkingAll: false,
  linkAllError: null,
}

const continentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CONTINENTS_DASHBOARD:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case GET_CONTINENTS_DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        continents: action.payload.continents || [],
        summary: action.payload.summary || null,
        error: null,
      }
    case GET_CONTINENTS_DASHBOARD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case BULK_LINK_CONTINENT:
      return {
        ...state,
        linking: true,
        linkError: null,
      }
    case BULK_LINK_CONTINENT_SUCCESS:
      return {
        ...state,
        linking: false,
        linkError: null,
      }
    case BULK_LINK_CONTINENT_FAILURE:
      return {
        ...state,
        linking: false,
        linkError: action.payload,
      }
    case BULK_LINK_ALL_COUNTRIES:
      return {
        ...state,
        linkingAll: true,
        linkAllError: null,
      }
    case BULK_LINK_ALL_COUNTRIES_SUCCESS:
      return {
        ...state,
        linkingAll: false,
        linkAllError: null,
      }
    case BULK_LINK_ALL_COUNTRIES_FAILURE:
      return {
        ...state,
        linkingAll: false,
        linkAllError: action.payload,
      }
    default:
      return state
  }
}

export default continentsReducer

