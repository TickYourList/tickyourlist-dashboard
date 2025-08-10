import {
  GET_CUSTOMER_LIST,
  GET_CUSTOMER_LIST_SUCCESS,
  GET_CUSTOMER_LIST_FAIL,
} from "./actionTypes"

export const getCustomerList = () => ({
  type: GET_CUSTOMER_LIST,
})

export const getCustomerListSuccess = customerList => ({
  type: GET_CUSTOMER_LIST_SUCCESS,
  payload: customerList,
})

export const getCustomerListFail = error => ({
  type: GET_CUSTOMER_LIST_FAIL,
  payload: error,
})
