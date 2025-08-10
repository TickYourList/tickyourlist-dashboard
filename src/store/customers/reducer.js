import {
  GET_CUSTOMER_LIST,
  GET_CUSTOMER_LIST_SUCCESS,
  GET_CUSTOMER_LIST_FAIL,
} from "./actionTypes"

const initialState = {
  loading: false,
  customers: [],
  error: null,
}
const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CUSTOMER_LIST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case GET_CUSTOMER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload,
        error: null,
      }

    case GET_CUSTOMER_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    default:
      return state
  }
}

export default customerReducer
