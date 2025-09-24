import {
  GET_DASHBOARD_PERMISSION,
  GET_DASHBOARD_PERMISSION_SUCCESS,
  GET_DASHBOARD_PERMISSION_FAIL,
} from "./actionType"

const INIT_STATE = {
  loading: false,
  permissions: [],
  error: null,
}

const DashboardPermissionReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_DASHBOARD_PERMISSION:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case GET_DASHBOARD_PERMISSION_SUCCESS:
      return {
        ...state,
        loading: false,
        permissions: action.payload,
        error: null,
      }
    case GET_DASHBOARD_PERMISSION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default DashboardPermissionReducer
