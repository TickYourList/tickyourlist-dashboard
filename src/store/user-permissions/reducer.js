import {
  GET_USER_PERMISSIONS,
  GET_USER_PERMISSIONS_SUCCESS,
  GET_USER_PERMISSIONS_FAILURE,
} from './actionTypes';


const INIT_STATE = {
  loading: false,
  permissions: [],
  error: null,
}

const UserPermissionsReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_USER_PERMISSIONS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case GET_USER_PERMISSIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        permissions: action.payload,
        error: null,
      }
    case GET_USER_PERMISSIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default UserPermissionsReducer