// Action Types
export const GET_COUNTRIES = "GET_COUNTRIES";
export const GET_COUNTRIES_SUCCESS = "GET_COUNTRIES_SUCCESS";
export const GET_COUNTRIES_FAILURE = "GET_COUNTRIES_FAILURE";

export const ADD_COUNTRY = "ADD_COUNTRY";
export const ADD_COUNTRY_SUCCESS = "ADD_COUNTRY_SUCCESS";
export const ADD_COUNTRY_FAILURE = "ADD_COUNTRY_FAILURE";

export const GET_CURRENCY_LIST = "GET_CURRENCY_LIST";
export const GET_CURRENCY_LIST_SUCCESS = "GET_CURRENCY_LIST_SUCCESS";
export const GET_CURRENCY_LIST_FAIL = "GET_CURRENCY_LIST_FAIL";

export const UPDATE_COUNTRY = "UPDATE_COUNTRY";
export const UPDATE_COUNTRY_SUCCESS = "UPDATE_COUNTRY_SUCCESS";
export const UPDATE_COUNTRY_FAILURE = "UPDATE_COUNTRY_FAILURE";

export const GET_COUNTRY_BY_CODE = "GET_COUNTRY_BY_CODE";
export const GET_COUNTRY_BY_CODE_SUCCESS = "GET_COUNTRY_BY_CODE_SUCCESS";
export const GET_COUNTRY_BY_CODE_FAILURE = "GET_COUNTRY_BY_CODE_FAILURE";

export const DELETE_COUNTRY = "DELETE_COUNTRY";
export const DELETE_COUNTRY_SUCCESS = "DELETE_COUNTRY_SUCCESS";
export const DELETE_COUNTRY_FAILURE = "DELETE_COUNTRY_FAILURE";

// Action Creators
export const getCountries = () => ({
    type: GET_COUNTRIES
});

export const getCountriesSuccess = (countries) => ({
    type: GET_COUNTRIES_SUCCESS,
    payload: countries
});

export const getCountriesFailure = (error) => ({
    type: GET_COUNTRIES_FAILURE,
    payload: error
});

// Add Country
export const addCountry = (data) => ({
    type: ADD_COUNTRY,
    payload: data
});

export const addCountrySuccess = (country) => ({
    type: ADD_COUNTRY_SUCCESS,
    payload: country
});

export const addCountryFailure = (error) => ({
    type: ADD_COUNTRY_FAILURE,
    payload: error
});

export const getCurrencyList = () => ({
    type: GET_CURRENCY_LIST
});

export const getCurrencyListSuccess = (data) => ({
    type: GET_CURRENCY_LIST_SUCCESS,
    payload: data
});

export const getCurrencyListFail = (error) => ({
    type: GET_CURRENCY_LIST_FAIL,
    payload: error
});

export const updateCountry = (countryId, data) => ({
    type: UPDATE_COUNTRY,
    payload: { countryId, data }
});

export const updateCountrySuccess = (country) => ({
    type: UPDATE_COUNTRY_SUCCESS,
    payload: country
});

export const updateCountryFailure = (error) => ({
    type: UPDATE_COUNTRY_FAILURE,
    payload: error
});

// Get Country by Code
export const getCountryByCode = (code) => ({
    type: GET_COUNTRY_BY_CODE,
    payload: code
});

export const getCountryByCodeSuccess = (country) => ({
    type: GET_COUNTRY_BY_CODE_SUCCESS,
    payload: country
});

export const getCountryByCodeFailure = (error) => ({
    type: GET_COUNTRY_BY_CODE_FAILURE,
    payload: error
});

export const deleteCountry = (countryCode) => ({
    type: DELETE_COUNTRY,
    payload: countryCode,
});
export const deleteCountrySuccess = (countryCode) => ({
    type: DELETE_COUNTRY_SUCCESS,
    payload: countryCode,
});
export const deleteCountryFailure = (error) => ({
    type: DELETE_COUNTRY_FAILURE,
    payload: error,
});