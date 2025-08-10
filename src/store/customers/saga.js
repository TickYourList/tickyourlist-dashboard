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

function* fetchCustomerList() {
  try {
    const response = yield call(getCustomerListAPI)
    const bookings = response?.data?.bookings || []
    yield put(getCustomerListSuccess(bookings))
  } catch (error) {
    yield put(getCustomerListFail(response.data) || "Failed to fetch customers")
  }
}

function* customerSaga() {
  yield takeEvery(GET_CUSTOMER_LIST, fetchCustomerList)
}

export default customerSaga
