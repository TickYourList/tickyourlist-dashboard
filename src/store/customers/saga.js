import { call, put, takeEvery } from "redux-saga/effects"
import {
  GET_CUSTOMER_LIST,
  GET_CUSTOMER_LIST_SUCCESS,
  GET_CUSTOMER_LIST_FAIL,
} from "./actionTypes"

import {
  getCustomerList,
  getCustomerListSuccess,
  getCustomerListFail,
} from "./actions"

import { getCustomerListAPI } from "../../helpers/location_management_helper"

function* fetchCustomerList(action) {
  try {
    const { page = 1, limit = 10, dateType = "bookingDate", startDate = "", endDate = "" } = action.payload || {}
    const response = yield call(getCustomerListAPI, page, limit, dateType, startDate, endDate)
    // Response structure from API: { statusCode, message, data: { bookings, total, totalPages, currentPage } }
    // Since api_helper.get() returns response.data, the response here is the entire API response
    const bookings = response?.data?.bookings || []
    const total = response?.data?.total || 0
    // getCustomerListSuccess expects (customerList, total) as separate parameters
    yield put(getCustomerListSuccess(bookings, total))
  } catch (error) {
    yield put(getCustomerListFail(error?.response?.data || "Failed to fetch customers"))
  }
}

function* customerSaga() {
  yield takeEvery(GET_CUSTOMER_LIST, fetchCustomerList)
}

export default customerSaga
