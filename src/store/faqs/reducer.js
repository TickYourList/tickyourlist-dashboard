import {
  GET_FAQS_LIST,
  GET_FAQS_LIST_SUCCESS,
  GET_FAQS_LIST_FAIL,
  ADD_NEW_FAQS,
  ADD_NEW_FAQS_SUCCESS,
  ADD_NEW_FAQS_FAIL,
} from "./actionTypes"

const initialState = {
  loading: false,
  faqs: [],
  total: 0,
  error: null,
}

const faqsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FAQS_LIST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case GET_FAQS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: action.payload?.faqs || [],
        total: action.payload?.total || 0,
      }

    case GET_FAQS_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case ADD_NEW_FAQS:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case ADD_NEW_FAQS_SUCCESS:
      return {
        ...state,
        loading: false,
        faqs: [action.payload, ...state.faqs], // add new at top
        total: state.total + 1,
      }

    case ADD_NEW_FAQS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    default:
      return state
  }
}

export default faqsReducer
