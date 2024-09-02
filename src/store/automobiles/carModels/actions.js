import { ADD_CAR_MODEL_FAIL, ADD_CAR_MODEL_SUCCESS, ADD_NEW_CAR_MODEL, DELETE_ALL_CAR_MODEL, DELETE_ALL_CAR_MODEL_FAIL, DELETE_ALL_CAR_MODEL_SUCCESS, DELETE_CAR_MODEL, DELETE_CAR_MODEL_FAIL, DELETE_CAR_MODEL_SUCCESS, GET_CAR_MODELS, GET_CAR_MODELS_FAIL, GET_CAR_MODELS_SUCCESS, GET_CAR_VARIANTS_FROM_CARMODEL, GET_CAR_VARIANTS_FROM_CARMODEL_FAIL, GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_MODEL, UPDATE_CAR_MODEL_FAIL, UPDATE_CAR_MODEL_SUCCESS } from "./actionTypes";
  
  export const getCarModels = () => ({
    type: GET_CAR_MODELS,
  });
  
  export const getCarModelsSuccess = carModels => ({
    type: GET_CAR_MODELS_SUCCESS,
    payload: carModels,
  });
  
  export const getCarModelsFail = error => ({
    type: GET_CAR_MODELS_FAIL,
    payload: error,
  });
  
  export const addNewCarModel = (id, data) => ({
    type: ADD_NEW_CAR_MODEL,
    payload: {id, data },
  });
  
  export const addCarModelSuccess = event => ({
    type: ADD_CAR_MODEL_SUCCESS,
    payload: event,
  });
  
  export const addCarModelFail = error => ({
    type: ADD_CAR_MODEL_FAIL,
    payload: error,
  });
  
  export const updateCarModel = (carModelId, id, data) => ({
    type: UPDATE_CAR_MODEL,
    payload: { carModelId, id, data },
  });
  
  export const updateCarModelSuccess = (id, data) => ({
    type: UPDATE_CAR_MODEL_SUCCESS,
    payload: { id, data },
  });
  
  export const updateCarModelFail = error => ({
    type: UPDATE_CAR_MODEL_FAIL,
    payload: error,
  });
  
  export const deleteCarModel = carModel => ({
    type: DELETE_CAR_MODEL,
    payload: carModel,
  });
  
  export const deleteCarModelSuccess = carModel => ({
    type: DELETE_CAR_MODEL_SUCCESS,
    payload: carModel,
  });
  
  export const deleteCarModelFail = error => ({
    type: DELETE_CAR_MODEL_FAIL,
    payload: error,
  });

  export const deleteAllCarModels = () => ({
    type: DELETE_ALL_CAR_MODEL,
  });
  
  export const deleteAllCarModelsSuccess = () => ({
    type: DELETE_ALL_CAR_MODEL_SUCCESS,
  });
  
  export const deleteAllCarModelsFail = error => ({
    type: DELETE_ALL_CAR_MODEL_FAIL,
    payload: error,
  });

  export const getCarVariantsFromModel = id => ({
    type: GET_CAR_VARIANTS_FROM_CARMODEL,
    payload: id
  });
  
  export const getCarVariantsFromModelSuccess = carVariants => ({
    type: GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS,
    payload: carVariants,
  });
  
  export const getCarVariantsFromModelFail = error => ({
    type: GET_CAR_VARIANTS_FROM_CARMODEL_FAIL,
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
  
  