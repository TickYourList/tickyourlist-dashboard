import { ADD_CAR_BRAND_FAIL, ADD_CAR_BRAND_SUCCESS, ADD_NEW_CAR_BRAND, DELETE_ALL_CAR_BRAND, DELETE_ALL_CAR_BRAND_FAIL, DELETE_ALL_CAR_BRAND_SUCCESS, DELETE_CAR_BRAND, DELETE_CAR_BRAND_FAIL, DELETE_CAR_BRAND_SUCCESS, GET_CAR_BRANDS, GET_CAR_BRANDS_FAIL, GET_CAR_BRANDS_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BRAND, UPDATE_CAR_BRAND_FAIL, UPDATE_CAR_BRAND_SUCCESS, UPDATE_CAR_BRANDS_SORT_ORDER, UPDATE_CAR_BRANDS_SORT_ORDER_SUCCESS, UPDATE_CAR_BRANDS_SORT_ORDER_FAIL } from "./actionTypes";
  
  export const getCarBrands = () => ({
    type: GET_CAR_BRANDS,
  });
  
  export const getCarBrandsSuccess = carBrands => ({
    type: GET_CAR_BRANDS_SUCCESS,
    payload: carBrands,
  });
  
  export const getCarBrandsFail = error => ({
    type: GET_CAR_BRANDS_FAIL,
    payload: error,
  });
  
  export const addNewCarBrand = data => ({
    type: ADD_NEW_CAR_BRAND,
    payload: data,
  });
  
  export const addCarBrandSuccess = event => ({
    type: ADD_CAR_BRAND_SUCCESS,
    payload: event,
  });
  
  export const addCarBrandFail = error => ({
    type: ADD_CAR_BRAND_FAIL,
    payload: error,
  });
  
  export const updateCarBrand = (id, data) => ({
    type: UPDATE_CAR_BRAND,
    payload: { id, data },
  });
  
  export const updateCarBrandSuccess = data => ({
    type: UPDATE_CAR_BRAND_SUCCESS,
    payload: data,
  });
  
  export const updateCarBrandFail = error => ({
    type: UPDATE_CAR_BRAND_FAIL,
    payload: error,
  });
  
  export const deleteCarBrand = carBrand => ({
    type: DELETE_CAR_BRAND,
    payload: carBrand,
  });
  
  export const deleteCarBrandSuccess = carBrand => ({
    type: DELETE_CAR_BRAND_SUCCESS,
    payload: carBrand,
  });
  
  export const deleteCarBrandFail = error => ({
    type: DELETE_CAR_BRAND_FAIL,
    payload: error,
  });

  export const deleteAllCarBrands = () => ({
    type: DELETE_ALL_CAR_BRAND,
  });
  
  export const deleteAllCarBrandsSuccess = () => ({
    type: DELETE_ALL_CAR_BRAND_SUCCESS,
  });
  
  export const deleteAllCarBrandsFail = error => ({
    type: DELETE_ALL_CAR_BRAND_FAIL,
    payload: error,
  });

  export const getCountriesList = () => { 
    return ({
    type: GET_COUNTRIES_LIST
  })};

  export const getCountriesListSuccess = data => { 
    return ({
    type: GET_COUNTRIES_LIST_SUCCESS,
    payload: data
  })};

  export const getCountriesListError = error => ({
    type: GET_COUNTRIES_LIST_ERROR,
    payload: error
  })

  export const updateCarBrandsSortOrder = (brands) => ({
    type: UPDATE_CAR_BRANDS_SORT_ORDER,
    payload: brands,
  });

  export const updateCarBrandsSortOrderSuccess = (response) => ({
    type: UPDATE_CAR_BRANDS_SORT_ORDER_SUCCESS,
    payload: response,
  });

  export const updateCarBrandsSortOrderFail = (error) => ({
    type: UPDATE_CAR_BRANDS_SORT_ORDER_FAIL,
    payload: error,
  });
