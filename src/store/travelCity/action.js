import {
    GET_CITIES_REQUEST,
    GET_CITIES_SUCCESS,
    GET_CITIES_FAIL,
  
    GET_CITY_REQUEST,
    GET_CITY_SUCCESS,
    GET_CITY_FAIL,
  
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
  
  
  export const getCities = () => ({
    type: GET_CITIES_REQUEST,
  })
  export const getCitiesSuccess = cities => ({
    type: GET_CITIES_SUCCESS,
    payload: cities,
  })
  export const getCitiesFail = error => ({
    type: GET_CITIES_FAIL,
    payload: error,
  })
  
  
  
  export const getCity = (cityCode, callback) => ({
    type: GET_CITY_REQUEST,
    payload: cityCode,
    callback
  })
  export const getCitySuccess = city => ({
    type: GET_CITY_SUCCESS,
    payload: city,
  })
  export const getCityFail = error => ({
    type: GET_CITY_FAIL,
    payload: error,
  })
  
  
  
  export const getCountries = () => ({
    type: GET_COUNTRIES_REQUEST,
  })
  export const getCountriesSuccess = countries => ({
    type: GET_COUNTRIES_SUCCESS,
    payload: countries,
  })
  export const getCountriesFail = error => ({
    type: GET_COUNTRIES_FAIL,
    payload: error,
  })
  
  
  
  export const createNewCity = (formData, callback) => ({
    type: CREATE_NEW_CITY_REQUEST,
    payload: formData,
    callback,
  })
  export const createNewCitySuccess = newCity => ({
    type: CREATE_NEW_CITY_SUCCESS,
    payload: newCity,
  })
  export const createNewCityFail = error => ({
    type: CREATE_NEW_CITY_FAIL,
    payload: error,
  })
  
  
  
  export const editCity = (cityCode, formData, callback) => ({
    type: EDIT_CITY_REQUEST,
    payload: {
      cityCode,
      formData
    },
    callback
  })
  export const editCitySuccess = city => ({
    type: EDIT_CITY_SUCCESS,
    payload: city,
  })
  export const editCityFail = error => ({
    type: EDIT_CITY_FAIL,
    payload: error,
  })
  
  
  
  export const deleteCity = city => ({
    type: DELETE_CITY_REQUEST,
    payload: city,
  })
  export const deleteCitySuccess = deletedCityCode => ({
    type: DELETE_CITY_SUCCESS,
    payload: deletedCityCode,
  })
  export const deleteCityFail = error => ({
    type: DELETE_CITY_FAIL,
    payload: error,
  })