import { ADD_CAR_DEALER_FAIL, ADD_CAR_DEALER_SUCCESS, ADD_NEW_CAR_DEALER, DELETE_ALL_CAR_DEALER, DELETE_ALL_CAR_DEALER_FAIL, DELETE_ALL_CAR_DEALER_SUCCESS, DELETE_CAR_DEALER, DELETE_CAR_DEALER_FAIL, DELETE_CAR_DEALER_SUCCESS, GET_CAR_DEALERS, GET_CAR_DEALERS_FAIL, GET_CAR_DEALERS_SUCCESS, GET_CAR_VARIANTS_FROM_CARMODEL, GET_CAR_VARIANTS_FROM_CARMODEL_FAIL, GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_DEALER, UPDATE_CAR_DEALER_FAIL, UPDATE_CAR_DEALER_SUCCESS } from "./actionTypes";
  
  export const getCarDealers = () => ({
    type: GET_CAR_DEALERS,
  });
  
  export const getCarDealersSuccess = carModels => ({
    type: GET_CAR_DEALERS_SUCCESS,
    payload: carModels,
  });
  
  export const getCarDealersFail = error => ({
    type: GET_CAR_DEALERS_FAIL,
    payload: error,
  });
  
  export const addNewCarDealer = (data) => ({
    type: ADD_NEW_CAR_DEALER,
    payload: { data },
  });
  
  export const addCarDealerSuccess = event => ({
    type: ADD_CAR_DEALER_SUCCESS,
    payload: event,
  });
  
  export const addCarDealerFail = error => ({
    type: ADD_CAR_DEALER_FAIL,
    payload: error,
  });
  
  export const updateCarDealer = (id, data) => ({
    type: UPDATE_CAR_DEALER,
    payload: { id, data },
  });
  
  export const updateCarDealerSuccess = (id, data) => ({
    type: UPDATE_CAR_DEALER_SUCCESS,
    payload: { id, data },
  });
  
  export const updateCarDealerFail = error => ({
    type: UPDATE_CAR_DEALER_FAIL,
    payload: error,
  });
  
  export const deleteCarDealer = carDealer => ({
    type: DELETE_CAR_DEALER,
    payload: carDealer,
  });
  
  export const deleteCarDealerSuccess = carModel => ({
    type: DELETE_CAR_DEALER_SUCCESS,
    payload: carModel,
  });
  
  export const deleteCarDealerFail = error => ({
    type: DELETE_CAR_DEALER_FAIL,
    payload: error,
  });

  export const deleteAllCarDealers = () => ({
    type: DELETE_ALL_CAR_DEALER,
  });
  
  export const deleteAllCarDealersSuccess = () => ({
    type: DELETE_ALL_CAR_DEALER_SUCCESS,
  });
  
  export const deleteAllCarDealersFail = error => ({
    type: DELETE_ALL_CAR_DEALER_FAIL,
    payload: error,
  });