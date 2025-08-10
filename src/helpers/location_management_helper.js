import {get, post, put, del, postFormData, putFormData } from "./api_helper";
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

const getCitiesList = () => get(url.GET_CITIES_LIST)
const getCityData = (cityCode) => get(url.GET_CITY_DATA +'/' + cityCode)

const createNewCity = (formData) => postFormData(url.CREATE_NEW_CITY, formData)
const updateCity = (cityCode, formData) => putFormData(url.UPDATE_CITY + '/' + cityCode, formData)

const removeCity = (cityCode) => del(url.REMOVE_CITY + '/' + cityCode)

//GET ALL TOUR GROUPS
const getAllTourGroupsList = (page, limit) =>
    get(`${url.FETCH_TOUR_GROUP_LIST}?page=${page}&limit=${limit}`)

//GET TOUR BY ID
const getTourById = id => get(`${url.FETCH_TOUR_GROUP_BY_ID}${id}`)

//ADDING A NEW TOUR GROUP
const addNewTourGroup = (cityCode, data) =>
  postFormData(`${url.ADD_TOUR_GROUP}?cityCode=${cityCode}`, data)

//UPDATING AN EXISTING TOUR GROUP
const updateTourGroupHelper = (id, data) =>
  putFormData(`${url.UPDATE_TOUR_GROUP}/${id}`, data)

//DELETING A TOUR GROUP
const deleteTourGroupById = id => del(`${url.DELETE_TOUR_GROUP}${id}`)

export {
    getCountriesList,
    getCurrencyList,
    getCountryByCode,
    addCountry,
    updateCountry,
    deleteCountryApi,
    getCitiesList,
    getCityData,
    createNewCity,
    updateCity,
    removeCity,
    getAllTourGroupsList,
    getTourById,
    addNewTourGroup,
    updateTourGroupHelper,
    deleteTourGroupById
};