import { takeEvery, put, call, takeLatest } from "redux-saga/effects"
import toastr from "toastr"

import {
  GET_CITIES_REQUEST,
  GET_CITY_REQUEST,
  GET_COUNTRIES_REQUEST,
  DELETE_CITY_REQUEST,
  CREATE_NEW_CITY_REQUEST,
  EDIT_CITY_REQUEST,
} from "./actionTypes"

import {
  getCities,
  getCitiesSuccess,
  getCitiesFail,

  getCitySuccess,
  getCityFail,

  getCountriesSuccess,
  getCountriesFail,

  createNewCitySuccess,
  createNewCityFail,

  editCitySuccess,
  editCityFail,

  deleteCitySuccess,
  deleteCityFail
} from "./action"

import {
  getCitiesList,
  getCityData,
  createNewCity,
  removeCity,
  updateCity,
  getCountriesList,
} from "../../helpers/location_management_helper"



function* fetchCities() {
  try {
    const response = yield call(getCitiesList)
    yield put(getCitiesSuccess(response.data.travelCityList))
  } 
  catch (error) {
    yield put(getCitiesFail(error.message || "Something went wrong"))
    console.error(error)
    toastr.error(error.message || "Failed to load all cities data");
  }
}

function* fetchCity({ payload, callback }) {
  try {
    const response = yield call(getCityData, payload)

    if (response.statusCode === "10000") {
      yield put(getCitySuccess(response.data.city))
    } 
    else {
      yield put(getCityFail(response.message || "Failed to load city data"))
      console.error(response.message || "Failed to load city data")
      toastr.error(response.message || "Failed to load city data");
      if(callback) callback();
    }
  } 
  catch (error) {
    yield put(getCityFail(error.message || "Something went wrong"))
    console.error(error)
    toastr.error(error.message || "Failed to load city data");
    if(callback) callback();
  }
}

function* fetchCountries() {
  try {
    const response = yield call(getCountriesList)
    const data = response.data.travelCountriesList
    const formatted = data.map(country => ({
      label: country.displayName,
      value: country._id,
    }))
    yield put(getCountriesSuccess(formatted))
  } 
  catch (error) {
    yield put(getCountriesFail(error.message || "Something went wrong"))
    console.error(error)
    toastr.error(error.message || "Failed to load all Countries data")
  }
}

function* createCity({ payload, callback }) {
  try {
    const response = yield call(createNewCity, payload)

    if (response.statusCode === "10000") {
      yield put(createNewCitySuccess(response.data.city))
      toastr.success(response.message)
      if (callback) callback()
    } 
    else {
      yield put(createNewCityFail(response.message || "Failed to create city"))
      console.error(response.message || "Failed to create city")
      toastr.error(response.message || "Failed to create city");    
    }
  } 
  catch (error) {
      yield put(createNewCityFail(error.message || "Failed to create city"))
      console.error(error.message || "Failed to create city")
      toastr.error(error.message || "Failed to create city");   
  }
}

function* editCity({ payload, callback }) {                  
  try {
    const response = yield call(updateCity, payload.cityCode, payload.formData)

    if (response.statusCode === "10000") {
      yield put(editCitySuccess(response.data))
      toastr.success(response.message)
      if (callback) callback()
    } 
    else {
      yield put(editCityFail(response.message || "Failed to edit city"))
      console.error(response.message || "Failed to edit city")
      toastr.error(response.message || "Failed to edit city");    
    }
  } 
  catch (error) {
    yield put(editCityFail(error.message || "Failed to create city"))
    console.error(error.message || "Failed to create city")
    toastr.error(error.message || "Failed to create city");   
  }
}

function* deleteCity({ payload }) {
  try {
    const response = yield call(removeCity, payload.cityCode)

    if (response.statusCode === "10000") {
      yield put(deleteCitySuccess(response.data.cityCode))
      toastr.success(`${payload.displayName} city deleted successfully`)
      yield put(getCities())
    } 
    else {
      yield put(deleteCityFail(`${payload.displayName} city failed to delete`))
      console.error(`${payload.displayName} city failed to delete`)
      toastr.error(`${payload.displayName} city failed to delete`);
    }
  } 
  catch (error) {
    yield put(deleteCityFail(`${error.displayName} city failed to delete`))
    console.error(error)
    toastr.error(error.message || "Failed to delete city");
  }
}

function* travelCitySaga() {
  yield takeEvery(GET_CITIES_REQUEST, fetchCities);
  yield takeEvery(GET_CITY_REQUEST, fetchCity);
  yield takeEvery(GET_COUNTRIES_REQUEST, fetchCountries);
  yield takeEvery(DELETE_CITY_REQUEST, deleteCity);
  yield takeLatest(CREATE_NEW_CITY_REQUEST, createCity)
  yield takeLatest(EDIT_CITY_REQUEST, editCity)
}

export default travelCitySaga;
// =======
// function* locationManagementSaga() {
//   yield takeEvery(GET_CITIES_REQUEST, fetchCities)
//   yield takeEvery(GET_CITY_REQUEST, fetchCity)
//   yield takeEvery(GET_COUNTRIES_REQUEST, fetchCountries)
//   yield takeLatest(CREATE_NEW_CITY_REQUEST, createCity)
//   yield takeLatest(EDIT_CITY_REQUEST, editCity)
//   yield takeEvery(DELETE_CITY_REQUEST, deleteCity)
// }

// export default locationManagementSaga
// >>>>>>> 01855b0 (Added: Delete city feature)