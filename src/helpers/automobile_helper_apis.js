import axios from "axios";
import { del, get, post, postFormData, put, putFormData } from "./api_helper";
import * as url from "./automobile_url_helpers";


// GET CAR BRANDS LIST
const getCarBrandsList = () => get(url.GET_CAR_BRANDS);

// ADD CAR BRAND
const addCarBrand = data => postFormData(url.ADD_CAR_BRAND, data);

// UPDATE CAR BRAND
const updateCarBrandData = (userId, data) => putFormData(`${url.UPDATE_CAR_BRAND}/${userId}`, data);

// DELETE CAR BRAND
const deleteCarBrandData = id => del(`${url.DELETE_CAR_BRAND}/${id}`);

// DELETE ALL CAR BRANDS
const deleteAllCarBrands = () => del(url.DELETE_ALL_CAR_BRAND);

// GET CAR MODELS LIST
const getCarModelsList = () => get(url.GET_CAR_MODELS);

// Get Car Variants from Car Model
const getCarVariantsListFromCarModel = id => get(`${url.GET_CAR_VARIANTS_FROM_CAR_MODEL}/${id}`);

// ADD CAR MODEL
const addCarModel = (id, data) => postFormData(`${url.ADD_CAR_MODEL}/${id}`, data);

// UPDATE CAR MODEL
const updateCarModelData = (carModelId, userId, data) => putFormData(`${url.UPDATE_CAR_MODEL}/${carModelId}/carbrand/${userId}`, data);

// DELETE CAR MODEL
const deleteCarModelData = id => del(`${url.DELETE_CAR_MODEL}/${id}`);

// DELETE ALL CAR MODELS
const deleteAllCarModels = () => del(url.DELETE_ALL_CAR_MODEL);


// GET COUNTRIES LIST
const fetchCountriesListData = () => get(url.GET_COUNTRIES_LIST_DATA);


// fetch model by brand
const fetchCarModelByBrand = id => get(`${url.GET_MODEL_BY_BRAND}/${id}`);

// GET CAR CARIANTS LIST
const getCarVariantsList = () => get(url.GET_CAR_VARIANTS);

// ADD CAR VARIANT
const addCarVariant = (id, data) => postFormData(`${url.ADD_CAR_VARIANT}/${id}`, data);

// UPDATE CAR MODEL
const updateCarVariantData = (carModelId, userId, data) => putFormData(`${url.UPDATE_CAR_VARIANT}/${carModelId}/carbrand/${userId}`, data);

// DELETE CAR MODEL
const deleteCarVariantData = id => del(`${url.DELETE_CAR_VARIANT}/${id}`);

// DELETE ALL CAR MODELS
const deleteAllCarVariants = () => del(url.DELETE_ALL_CAR_VARIANT);

// GET CAR BLOGS LIST
const getCarBlogsList = () => get(url.GET_CAR_BLOGS);

// ADD CAR BRAND
const addCarBlog = data => postFormData(url.ADD_CAR_BLOG, data);

// UPDATE CAR BRAND
const updateCarBlogData = (userId, data) => putFormData(`${url.UPDATE_CAR_BLOG}/${userId}`, data);

// DELETE CAR BRAND
const deleteCarBlogData = id => del(`${url.DELETE_CAR_BLOG}/${id}`);

// DELETE ALL CAR BRANDS
const deleteAllCarBlogs = () => del(url.DELETE_ALL_CAR_BLOG);

// GET CAR CUSTOMERS LIST
const getCarCustomersList = () => get(url.GET_CAR_CUSTOMERS);

// ADD CAR CUSTOMER
const addCarCustomer = data => postFormData(url.ADD_CAR_CUSTOMER, data);

// UPDATE CAR CUSTOMER
const updateCarCustomerData = (userId, data) => putFormData(`${url.UPDATE_CAR_CUSTOMER}/${userId}`, data);

// DELETE CAR CUSTOMER
const deleteCarCustomerData = id => del(`${url.DELETE_CAR_CUSTOMER}/${id}`);

// DELETE ALL CAR CUSTOMERS
const deleteAllCarCustomers = () => del(url.DELETE_ALL_CAR_CUSTOMER);


export {
    getCarBrandsList,
    addCarBrand,
    updateCarBrandData,
    deleteCarBrandData,
    deleteAllCarBrands,
    getCarModelsList,
    getCarVariantsListFromCarModel,
    addCarModel,
    updateCarModelData,
    deleteCarModelData,
    deleteAllCarModels,
    getCarVariantsList,
    addCarVariant,
    updateCarVariantData,
    deleteCarVariantData,
    deleteAllCarVariants,
    fetchCountriesListData,
    getCarBlogsList,
    addCarBlog,
    updateCarBlogData,
    deleteAllCarBlogs,
    deleteCarBlogData,
    fetchCarModelByBrand,
    getCarCustomersList,
    addCarCustomer,
    updateCarCustomerData,
    deleteCarCustomerData,
    deleteAllCarCustomers
};
