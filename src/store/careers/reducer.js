import {
  GET_CAREER_POSTINGS,
  GET_CAREER_POSTINGS_SUCCESS,
  GET_CAREER_POSTINGS_FAIL,
  GET_CAREER_POSTING,
  GET_CAREER_POSTING_SUCCESS,
  GET_CAREER_POSTING_FAIL,
  ADD_NEW_CAREER_POSTING,
  ADD_CAREER_POSTING_SUCCESS,
  ADD_CAREER_POSTING_FAIL,
  UPDATE_CAREER_POSTING,
  UPDATE_CAREER_POSTING_SUCCESS,
  UPDATE_CAREER_POSTING_FAIL,
  DELETE_CAREER_POSTING,
  DELETE_CAREER_POSTING_SUCCESS,
  DELETE_CAREER_POSTING_FAIL,
  GET_CAREER_APPLICATIONS,
  GET_CAREER_APPLICATIONS_SUCCESS,
  GET_CAREER_APPLICATIONS_FAIL,
  UPDATE_APPLICATION_STATUS,
  UPDATE_APPLICATION_STATUS_SUCCESS,
  UPDATE_APPLICATION_STATUS_FAIL,
} from "./actionTypes";

const initialState = {
  postings: [],
  posting: null,
  applications: [],
  loading: false,
  error: null,
};

const careersReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CAREER_POSTINGS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_CAREER_POSTINGS_SUCCESS:
      return {
        ...state,
        postings: action.payload,
        loading: false,
        error: null,
      };

    case GET_CAREER_POSTINGS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case GET_CAREER_POSTING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_CAREER_POSTING_SUCCESS:
      return {
        ...state,
        posting: action.payload,
        loading: false,
        error: null,
      };

    case GET_CAREER_POSTING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_NEW_CAREER_POSTING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADD_CAREER_POSTING_SUCCESS:
      return {
        ...state,
        postings: [...state.postings, action.payload],
        loading: false,
        error: null,
      };

    case ADD_CAREER_POSTING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_CAREER_POSTING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_CAREER_POSTING_SUCCESS:
      return {
        ...state,
        postings: state.postings.map((posting) =>
          posting._id === action.payload._id ? action.payload : posting
        ),
        posting: action.payload,
        loading: false,
        error: null,
      };

    case UPDATE_CAREER_POSTING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case DELETE_CAREER_POSTING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_CAREER_POSTING_SUCCESS:
      return {
        ...state,
        postings: state.postings.filter(
          (posting) => posting._id !== action.payload
        ),
        loading: false,
        error: null,
      };

    case DELETE_CAREER_POSTING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case GET_CAREER_APPLICATIONS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_CAREER_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.payload,
        loading: false,
        error: null,
      };

    case GET_CAREER_APPLICATIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_APPLICATION_STATUS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_APPLICATION_STATUS_SUCCESS:
      return {
        ...state,
        applications: state.applications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        ),
        loading: false,
        error: null,
      };

    case UPDATE_APPLICATION_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default careersReducer;
