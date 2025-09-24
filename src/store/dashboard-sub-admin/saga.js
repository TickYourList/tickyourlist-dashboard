import { call, put, takeEvery } from "redux-saga/effects"

import { GET_DASHBOARD_PERMISSION } from "./actionType"

import {
  getDashboardPermission,
  getDashboardPermissionSuccess,
  getDashboardPermissionFail,
} from "./actions"

import { getDashboardPermissionAPI } from "../../helpers/backend_helper"

// worker saga
function* fetchDashboardPermission({ payload: userId }) {
  try {
    const response = yield call(getDashboardPermissionAPI, userId)
    // console.log("Raw API response:", response)
    const data = response.data
    const permissions = data.permissions
    // console.log(permissions)
    yield put(getDashboardPermissionSuccess(permissions))
  } catch (error) {
    yield put(getDashboardPermissionFail(error.response?.data || error.message))
  }
}

// watcher saga
export default function* dashboardPermissionSaga() {
  yield takeEvery(GET_DASHBOARD_PERMISSION, fetchDashboardPermission)
}
