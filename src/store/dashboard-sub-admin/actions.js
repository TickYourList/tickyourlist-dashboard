import {
  GET_DASHBOARD_PERMISSION,
  GET_DASHBOARD_PERMISSION_SUCCESS,
  GET_DASHBOARD_PERMISSION_FAIL,
} from "./actionType"

export const getDashboardPermission = userId => ({
  type: GET_DASHBOARD_PERMISSION,
  payload: userId,
})

export const getDashboardPermissionSuccess = permissions => ({
  type: GET_DASHBOARD_PERMISSION_SUCCESS,
  payload: permissions,
})

export const getDashboardPermissionFail = error => ({
  type: GET_DASHBOARD_PERMISSION_FAIL,
  payload: error,
})
