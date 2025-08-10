import {
  GET_TRAVEL_CATEGORIES_REQUEST,
  GET_TRAVEL_CATEGORIES_SUCCESS,
  GET_TRAVEL_CATEGORIES_FAILURE,
  // 🔽 Inserted delete action types
  DELETE_TRAVEL_CATEGORY_REQUEST,
  DELETE_TRAVEL_CATEGORY_SUCCESS,
  DELETE_TRAVEL_CATEGORY_FAILURE,
  FETCH_CITIES_SUCCESS,
  ADD_TRAVEL_CATEGORY_SUCCESS,
  ADD_TRAVEL_CATEGORY_FAILURE,
  FETCH_TRAVEL_CATEGORY_REQUEST,
  FETCH_TRAVEL_CATEGORY_SUCCESS,
  FETCH_TRAVEL_CATEGORY_FAILURE,
  UPDATE_TRAVEL_CATEGORY_REQUEST,
  UPDATE_TRAVEL_CATEGORY_SUCCESS,
  UPDATE_TRAVEL_CATEGORY_FAILURE,
  RESET_TRAVEL_CATEGORY,
} from "./actionTypes";

const initialState = { 
  data: [],
  cities: [],
  loading: false,
  error: null,
  successMessage: null,
  updateSuccess: false
};

const travelCategory = (state = initialState, action) => {
  switch (action.type) {
    case GET_TRAVEL_CATEGORIES_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_TRAVEL_CATEGORIES_SUCCESS:

  return {
   
    ...state,
    loading: false,
    data: action.payload,
  };
    case GET_TRAVEL_CATEGORIES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // 🔽 Inserted delete cases without touching your original logic
    case DELETE_TRAVEL_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_TRAVEL_CATEGORY_SUCCESS:
  return {
    ...state,
    loading: false,
    error: null,
  };
    case DELETE_TRAVEL_CATEGORY_FAILURE:
      return { ...state, loading: false, error: action.payload };

      case FETCH_CITIES_SUCCESS:
        return { ...state, cities: action.payload };
  
      case ADD_TRAVEL_CATEGORY_SUCCESS:
       
        return {
          ...state,
          successMessage: action.payload,
          error: null,
        };
  
      case ADD_TRAVEL_CATEGORY_FAILURE:
        return {
          ...state,
          successMessage: null,
          error: action.payload,
        };
  
      case "RESET_ADD_TRAVEL_CATEGORY":
        return { ...state, successMessage: null, error: null };

      // FETCH
    case FETCH_TRAVEL_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_TRAVEL_CATEGORY_SUCCESS:
      return { ...state, loading: false, data: action.payload };

    case FETCH_TRAVEL_CATEGORY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // UPDATE
    case UPDATE_TRAVEL_CATEGORY_REQUEST:
      return { ...state, loading: true, updateSuccess: false };

    case UPDATE_TRAVEL_CATEGORY_SUCCESS:
      return { ...state, loading: false, updateSuccess: true };

    case UPDATE_TRAVEL_CATEGORY_FAILURE:
      return { ...state, loading: false, error: action.payload, updateSuccess: false };

    // ✅ FIXED RESET
    case RESET_TRAVEL_CATEGORY:
      return {
        ...state,
        data: null, // ✅ reset data, not "category"
        loading: false,
        error: null,
        updateSuccess: false,
      };


    default:
      return state;
  }
};

export default travelCategory;

