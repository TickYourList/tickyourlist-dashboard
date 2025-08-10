const {
  GET_COLLECTIONS,
  GET_COLLECTIONS_SUCCESS,
  GET_COLLECTIONS_FAIL,
  ADD_COLLECTION,
  ADD_COLLECTION_SUCCESS,
  ADD_COLLECTION_FAIL,
  GET_COLLECTION_BY_ID,
  GET_COLLECTION_BY_ID_SUCCESS,
  GET_COLLECTION_BY_ID_FAIL,
  UPDATE_COLLECTION,
  UPDATE_COLLECTION_SUCCESS,
  UPDATE_COLLECTION_FAIL,
  RESET_ADD_COLLECTION_STATE,
  DELETE_COLLECTION_SUCCESS,
  DELETE_COLLECTION_FAIL,
} = require("./actionTypes")

const INIT_STATE = {
  pm_collections: [],
  singleCollection: null,
  addSuccess: false,
  error: {},
  loading: false, // Flag for fetching data
  submitting: false, // Flag for form submission
}

const pmCollectionReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_COLLECTIONS:
      return {
        ...state,
        loading: true,
      }
    case GET_COLLECTIONS_SUCCESS:
      return {
        ...state,
        pm_collections: action.payload,
        loading: false,
      }

    case GET_COLLECTIONS_FAIL:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }

    case ADD_COLLECTION:
      return {
        ...state,
        submitting: true,
      }

    case ADD_COLLECTION_SUCCESS:
      return {
        ...state,
        pm_collections: [...state.pm_collections, action.payload],
        submitting: false,
        addSuccess: true,
        error: null,
      }

    case ADD_COLLECTION_FAIL:
      return {
        ...state,
        addSuccess: false,
        submitting: false,
        error: action.payload,
      }

    case RESET_ADD_COLLECTION_STATE:
      return {
        ...state,
        addSuccess: false,
        error: null,
      }

    case GET_COLLECTION_BY_ID:
      return {
        ...state,
        loading: true,
        singleCollection: null, // Clear old data
      }

    case GET_COLLECTION_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        singleCollection: action.payload,
      }

    case GET_COLLECTION_BY_ID_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case UPDATE_COLLECTION:
      return {
        ...state,
        submitting: true,
      }

    case UPDATE_COLLECTION_SUCCESS:
      return {
        ...state,
        pm_collections: state.pm_collections.map(collection =>
          String(collection.id) === String(action.payload.id)
            ? { ...collection, ...action.payload }
            : collection
        ),
        singleCollection: action.payload,
        submitting: false,
        addSuccess: true,
        error: null,
      }

    case UPDATE_COLLECTION_FAIL:
      return {
        ...state,
        addSuccess: false,
        submitting: false,
        error: action.payload,
      }

    case DELETE_COLLECTION_SUCCESS:
      return {
        ...state,
        pm_collections: state.pm_collections.filter(
          collection => collection._id !== action.payload._id
        ),
      }

    case DELETE_COLLECTION_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    default:
      return state
  }
}

export default pmCollectionReducer;
