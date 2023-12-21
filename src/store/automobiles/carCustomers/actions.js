import { ADD_CAR_CUSTOMER_FAIL, ADD_CAR_CUSTOMER_SUCCESS, ADD_NEW_CAR_CUSTOMER, DELETE_ALL_CAR_CUSTOMER, DELETE_ALL_CAR_CUSTOMER_FAIL, DELETE_ALL_CAR_CUSTOMER_SUCCESS, DELETE_CAR_CUSTOMER, DELETE_CAR_CUSTOMER_FAIL, DELETE_CAR_CUSTOMER_SUCCESS, GET_CAR_CUSTOMERS, GET_CAR_CUSTOMERS_FAIL, GET_CAR_CUSTOMERS_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_CUSTOMER, UPDATE_CAR_CUSTOMER_FAIL, UPDATE_CAR_CUSTOMER_SUCCESS } from "./actionTypes";
  
  export const getCarCustomers = () => ({
    type: GET_CAR_CUSTOMERS,
  });
  
  export const getCarCustomersSuccess = carCustomers => ({
    type: GET_CAR_CUSTOMERS_SUCCESS,
    payload: carCustomers,
  });
  
  export const getCarCustomersFail = error => ({
    type: GET_CAR_CUSTOMERS_FAIL,
    payload: error,
  });
  
  export const addNewCarCustomer = data => ({
    type: ADD_NEW_CAR_CUSTOMER,
    payload: data,
  });
  
  export const addCarCustomerSuccess = event => ({
    type: ADD_CAR_CUSTOMER_SUCCESS,
    payload: event,
  });
  
  export const addCarCustomerFail = error => ({
    type: ADD_CAR_CUSTOMER_FAIL,
    payload: error,
  });
  
  export const updateCarCustomer = (id, data) => ({
    type: UPDATE_CAR_CUSTOMER,
    payload: { id, data },
  });
  
  export const updateCarCustomerSuccess = data => ({
    type: UPDATE_CAR_CUSTOMER_SUCCESS,
    payload: data,
  });
  
  export const updateCarCustomerFail = error => ({
    type: UPDATE_CAR_CUSTOMER_FAIL,
    payload: error,
  });
  
  export const deleteCarCustomer = carCustomer => ({
    type: DELETE_CAR_CUSTOMER,
    payload: carCustomer,
  });
  
  export const deleteCarCustomerSuccess = carCustomer => ({
    type: DELETE_CAR_CUSTOMER_SUCCESS,
    payload: carCustomer,
  });
  
  export const deleteCarCustomerFail = error => ({
    type: DELETE_CAR_CUSTOMER_FAIL,
    payload: error,
  });

  export const deleteAllCarCustomers = () => ({
    type: DELETE_ALL_CAR_CUSTOMER,
  });
  
  export const deleteAllCarCustomersSuccess = () => ({
    type: DELETE_ALL_CAR_CUSTOMER_SUCCESS,
  });
  
  export const deleteAllCarCustomersFail = error => ({
    type: DELETE_ALL_CAR_CUSTOMER_FAIL,
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
  
  