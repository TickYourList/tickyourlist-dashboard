import {
    GET_CITIES_REQUEST,
    GET_CITIES_SUCCESS,
    GET_CITIES_FAIL,
  
    GET_CITY_REQUEST,
    GET_CITY_SUCCESS,
    GET_CITY_FAIL,

    GET_CITY_DETAILS_REQUEST,
    GET_CITY_DETAILS_SUCCESS,
    GET_CITY_DETAILS_FAIL,
  
    GET_COUNTRIES_REQUEST,
    GET_COUNTRIES_SUCCESS,
    GET_COUNTRIES_FAIL,
  
    CREATE_NEW_CITY_REQUEST,
    CREATE_NEW_CITY_SUCCESS,
    CREATE_NEW_CITY_FAIL,
  
    EDIT_CITY_REQUEST,
    EDIT_CITY_SUCCESS,
    EDIT_CITY_FAIL,
  
    DELETE_CITY_REQUEST,
    DELETE_CITY_SUCCESS,
    DELETE_CITY_FAIL
  } from "./actionTypes"
  
  const INIT_STATE = {
      cities: [],
      loadingCities: false,
      errorCities: null,
  
      city: {},
      loadingCity: false,
      errorCity: null,

      cityDetails: {},
    loadingCityDetails: false,
    errorCityDetails: null,
  
      countries: [],
      loadingCountries: false,
      errorCountries: null,
  
      newCity: {},
      loadingNewCity: false,
      errorNewCity: null,
  
      editCity: {},
      loadingEditCity: false,
      errorEditCity: null,
  
      deleteCity: {},
      loadingDeleteCity: false,
      errorDeleteCity: null,
  };
  
  const travelCity = (state = INIT_STATE, action) => {
      switch (action.type) {
      case GET_CITIES_REQUEST:
        return { ...state, loadingCities: true, errorCities: null }
      case GET_CITIES_SUCCESS:
        return { ...state, loadingCities: false, cities: action.payload }
      case GET_CITIES_FAIL:
        return { ...state, loadingCities: false, errorCities: action.payload }
  
      case GET_CITY_REQUEST:
        return { ...state, loadingCity: true, errorCity: null }
      case GET_CITY_SUCCESS:
        return { ...state, loadingCity: false, city: action.payload }
      case GET_CITY_FAIL:
        return { ...state, loadingCity: false, errorCity: action.payload }

        case GET_CITY_DETAILS_REQUEST:
          return { ...state, loadingCityDetails: true, errorCityDetails: null }
        case GET_CITY_DETAILS_SUCCESS:
          return { ...state, loadingCityDetails: false, cityDetails: action.payload }
        case GET_CITY_DETAILS_FAIL:
          return { ...state, loadingCityDetails: false, errorCityDetails: action.payload }
  
      case GET_COUNTRIES_REQUEST:
        return { ...state, loadingCountries: true, errorCountries: null }
      case GET_COUNTRIES_SUCCESS:
        return { ...state, loadingCountries: false, countries: action.payload }
      case GET_COUNTRIES_FAIL:
        return { ...state, loadingCountries: false, errorCountries: action.payload }
  
      case CREATE_NEW_CITY_REQUEST:
        return { ...state, loadingNewCity: true, errorNewCity: null }
      case CREATE_NEW_CITY_SUCCESS:
        return { ...state, loadingNewCity: false, newCity: action.payload }
      case CREATE_NEW_CITY_FAIL:
        return { ...state, loadingNewCity: false, errorNewCity: action.payload }
  
      case EDIT_CITY_REQUEST:
        return { ...state, loadingEditCity: true, errorEditCity: null }
      case EDIT_CITY_SUCCESS:
        return { ...state, loadingEditCity: false, editCity: action.payload }
      case EDIT_CITY_FAIL:
        return { ...state, loadingEditCity: false, errorEditCity: action.payload }
  
      case DELETE_CITY_REQUEST:
        return { ...state, loadingDeleteCity: true, errorDeleteCity: null }
      case DELETE_CITY_SUCCESS:
        return { ...state, loadingDeleteCity: false, deleteCity: action.payload }
      case DELETE_CITY_FAIL:
        return { ...state, loadingDeleteCity: false, errorDeleteCity: action.payload }
  
        default:
        return state
      }
  
  };
  
  export default travelCity;