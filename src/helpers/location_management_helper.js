import {get, post, put, del } from "./api_helper";
import * as url from "./locationManagement_url_helpers";


const getCountriesList = () => get(url.GET_COUNTRIES_LIST);
const getCurrencyList = () => get(url.GET_CURRENCY_LIST);
const getCountryByCode = (code) => get(url.GET_COUNTRY_BY_CODE.replace('{code}', code));
const addCountry = (data) => post(url.ADD_COUNTRY, data);


const updateCountry = (countryCode, data) => put(url.UPDATE_COUNTRY.replace('{code}', countryCode), data);

const deleteCountryApi = (countryCode) => {
    // Placeholder for actual API call
    return del(url.DELETE_COUNTRY.replace("{code}", countryCode));
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
};

export {
    getCountriesList,
    getCurrencyList,
    getCountryByCode,
    addCountry,
    updateCountry,
    deleteCountryApi
};