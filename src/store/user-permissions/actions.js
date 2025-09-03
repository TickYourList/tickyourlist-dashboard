import {
  GET_USER_PERMISSIONS,
  GET_USER_PERMISSIONS_SUCCESS,
  GET_USER_PERMISSIONS_FAILURE,
} from './actionTypes';

export const getUserPermissions = userId => ({
  type: GET_USER_PERMISSIONS,
  payload: userId,
})

export const getUserPermissionsSuccess = permissions => ({
  type: GET_USER_PERMISSIONS_SUCCESS,
  payload: permissions,
})

export const getUserPermissionsFail = error => ({
  type: GET_USER_PERMISSIONS_FAILURE,
  payload: error,
})