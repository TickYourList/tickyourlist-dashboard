import {
  GET_CUSTOMER_LIST,
  GET_CUSTOMER_LIST_SUCCESS,
  GET_CUSTOMER_LIST_FAIL,
} from "./actionTypes"

export const getCustomerList = (page = 1, limit = 10, dateType = "bookingDate", startDate = "", endDate = "") => ({
  type: GET_CUSTOMER_LIST,
  payload: { page, limit, dateType, startDate, endDate },
})

export const getCustomerListSuccess = (customerList, total) => ({
  type: GET_CUSTOMER_LIST_SUCCESS,
  payload: { customerList, total },
})

export const getCustomerListFail = error => ({
  type: GET_CUSTOMER_LIST_FAIL,
  payload: error,
})
