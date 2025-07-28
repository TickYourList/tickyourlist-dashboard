import { call, put, takeEvery, takeLatest, all } from "redux-saga/effects";
import {
    GET_COUNTRIES,
    GET_COUNTRIES_SUCCESS,
    GET_COUNTRIES_FAILURE,
    ADD_COUNTRY,
    ADD_COUNTRY_SUCCESS,
    ADD_COUNTRY_FAILURE,
    GET_CURRENCY_LIST,
    getCurrencyListSuccess,
    getCurrencyListFail,
    UPDATE_COUNTRY,
    updateCountrySuccess,
    updateCountryFailure,
    getCountries,
    GET_COUNTRY_BY_CODE,
    GET_COUNTRY_BY_CODE_SUCCESS,
    GET_COUNTRY_BY_CODE_FAILURE,
    getCountryByCodeSuccess,
    getCountryByCodeFailure,
    DELETE_COUNTRY,
    deleteCountrySuccess,
    deleteCountryFailure
} from "./actions";
import { getCountriesList, getCurrencyList as getCurrencyListApi, getCountryByCode as getCountryByCodeApi, addCountry as addCountryApi } from "../../helpers/location_management_helper";
import { post } from "../../helpers/api_helper";
import { updateCountry as updateCountryApi } from "../../helpers/location_management_helper";
import { deleteCountryApi } from "../../helpers/location_management_helper";

// Get Countries Saga
function* getCountriesSaga() {
    try {
        const response = yield call(getCountriesList);
        // Extract the array from response.data.travelCountriesList
        const countriesArray = response?.data?.travelCountriesList || [];
        yield put({ type: GET_COUNTRIES_SUCCESS, payload: countriesArray });
    } catch (error) {
        yield put({ type: GET_COUNTRIES_FAILURE, payload: error.message });
    }
}

// Add Country Saga
function* addCountrySaga(action) {
    try {
        const response = yield call(addCountryApi, action.payload);
        yield put({ type: ADD_COUNTRY_SUCCESS, payload: response.data || response });
    } catch (error) {
        yield put({ type: ADD_COUNTRY_FAILURE, payload: error.message });
    }
}

// Get Currency List Saga
function* getCurrencyListSaga() {
    try {
        const response = yield call(getCurrencyListApi);
        const list = response?.data?.travelCurrencyList || [];
        yield put(getCurrencyListSuccess(list));
    } catch (error) {
        yield put(getCurrencyListFail(error.message || 'Failed to fetch currency list'));
    }
}

// Update Country Saga
function* updateCountrySaga(action) {
    try {
        const { countryId, data } = action.payload;
        const response = yield call(updateCountryApi, countryId, data);
        yield put(updateCountrySuccess(response.data));
    } catch (error) {
        yield put(updateCountryFailure(error.message));
    }
}

// Get Country by Code Saga
function* getCountryByCodeSaga(action) {
    try {
        const code = action.payload;
        console.log('Saga: Getting country by code:', code)
        const response = yield call(getCountryByCodeApi, code);
        console.log('Saga: API response:', response)
        yield put(getCountryByCodeSuccess(response.data));
    } catch (error) {
        console.log('Saga: Error getting country by code:', error)
        yield put(getCountryByCodeFailure(error.message));
    }
}

// Delete Country Saga
function* deleteCountrySaga(action) {
  try {
    yield call(deleteCountryApi, action.payload); // country code
    yield put(deleteCountrySuccess(action.payload));
  } catch (error) {
    yield put(deleteCountryFailure(error.message || "Failed to delete country"));
  }
}

function* countriesSaga() {
    yield takeEvery(GET_COUNTRIES, getCountriesSaga);
    yield takeEvery(ADD_COUNTRY, addCountrySaga);
    yield takeEvery(GET_CURRENCY_LIST, getCurrencyListSaga);
    yield takeEvery(UPDATE_COUNTRY, updateCountrySaga);
    yield takeEvery(GET_COUNTRY_BY_CODE, getCountryByCodeSaga);
    yield takeEvery(DELETE_COUNTRY, deleteCountrySaga);
}

export default countriesSaga;