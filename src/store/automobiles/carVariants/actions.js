import { ADD_CAR_MODEL_FAIL } from "../carModels/actionTypes";
import { ADD_ALL_VARIANT_PRICING, ADD_ALL_VARIANT_PRICING_ERROR, ADD_ALL_VARIANT_PRICING_SUCCESS, ADD_CAR_VARIANT_SUCCESS, ADD_NEW_CAR_VARIANT, DELETE_ALL_CAR_VARIANT, DELETE_ALL_CAR_VARIANT_FAIL, DELETE_ALL_CAR_VARIANT_SUCCESS, DELETE_CAR_VARIANT, DELETE_CAR_VARIANT_FAIL, DELETE_CAR_VARIANT_SUCCESS, GET_CAR_VARIANTS, GET_CAR_VARIANTS_FAIL, GET_CAR_VARIANTS_SUCCESS, UPDATE_CAR_VARIANT, UPDATE_CAR_VARIANT_FAIL, UPDATE_CAR_VARIANT_SUCCESS } from "./actionTypes";

  export const getCarVariants = () => ({
    type: GET_CAR_VARIANTS,
  });
  
  export const getCarVariantsSuccess = carModels => ({
    type: GET_CAR_VARIANTS_SUCCESS,
    payload: carModels,
  });
  
  export const getCarVariantsFail = error => ({
    type: GET_CAR_VARIANTS_FAIL,
    payload: error,
  });
  
  export const addNewCarVariant = (id, data, history) => ({
    type: ADD_NEW_CAR_VARIANT,
    payload: { id, data, history },
  });
  
  export const addCarVariantSuccess = event => ({
    type: ADD_CAR_VARIANT_SUCCESS,
    payload: event,
  });
  
  export const addCarVariantFail = error => ({
    type: ADD_CAR_MODEL_FAIL,
    payload: error,
  });
  
  export const updateCarVariant = (carModelId, id, data) => ({
    type: UPDATE_CAR_VARIANT,
    payload: { carModelId, id, data },
  });
  
  export const updateCarVariantSuccess = id => ({
    type: UPDATE_CAR_VARIANT_SUCCESS,
    payload: id,
  });
  
  export const updateCarVariantFail = error => ({
    type: UPDATE_CAR_VARIANT_FAIL,
    payload: error,
  });
  
  export const deleteCarVariant = carVariant => ({
    type: DELETE_CAR_VARIANT,
    payload: carVariant,
  });
  
  export const deleteCarVariantSuccess = carVariant => ({
    type: DELETE_CAR_VARIANT_SUCCESS,
    payload: carVariant,
  });
  
  export const deleteCarVariantFail = error => ({
    type: DELETE_CAR_VARIANT_FAIL,
    payload: error,
  });

  export const deleteAllCarVariants = () => ({
    type: DELETE_ALL_CAR_VARIANT,
  });
  
  export const deleteAllCarVariantsSuccess = () => ({
    type: DELETE_ALL_CAR_VARIANT_SUCCESS,
  });
  
  export const deleteAllCarVariantsFail = error => ({
    type: DELETE_ALL_CAR_VARIANT_FAIL,
    payload: error,
  });

  export const addVariantData = (id, data) => ({
    type: ADD_ALL_VARIANT_PRICING,
    payload: { id, data }
  })

  export const addVariantDataSuccess = () => ({
    type: ADD_ALL_VARIANT_PRICING_SUCCESS
  })

  export const addVariantDataError = (error) => ({
    type: ADD_ALL_VARIANT_PRICING_ERROR,
    payload: error
  })

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
  
  