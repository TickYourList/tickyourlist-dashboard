import { call, put, takeEvery } from 'redux-saga/effects';
import { GET_USER_PERMISSIONS } from "./actionTypes"
import {
  getUserPermissions,
  getUserPermissionsSuccess,
  getUserPermissionsFail,
} from "./actions"

import { getPermissionsList } from "../../helpers/location_management_helper"

// worker saga
function* fetchUserPermissions({ payload: userId }) {
  try {
    const response = yield call(getPermissionsList, userId)
    const data = response.data
    const permissions = data.permissions
    yield put(getUserPermissionsSuccess(permissions))
  } catch (error) {
    yield put(getUserPermissionsFail(error.response?.data || error.message))
  }
}

// watcher saga
export default function* UserPermissionsSaga() {
  yield takeEvery(GET_USER_PERMISSIONS, fetchUserPermissions)
}