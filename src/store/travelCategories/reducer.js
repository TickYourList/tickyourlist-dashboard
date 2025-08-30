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
   // Inserted view action types
   VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST,
   VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS,
   VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE,
 
   //tours
   FETCH_CATEGORY_TOURS_REQUEST,
   FETCH_CATEGORY_TOURS_SUCCESS,
   FETCH_CATEGORY_TOURS_FAILURE,
 
   //subcategories
   FETCH_CATEGORY_SUBCATEGORIES_REQUEST,
   FETCH_CATEGORY_SUBCATEGORIES_SUCCESS,
   FETCH_CATEGORY_SUBCATEGORIES_FAILURE,
 
   //bookings
   FETCH_CATEGORY_BOOKINGS_REQUEST,
   FETCH_CATEGORY_BOOKINGS_SUCCESS,
   FETCH_CATEGORY_BOOKINGS_FAILURE,
} from "./actionTypes";

const initialState = { 
  data: [],
  cities: [],
  loading: false,
  error: null,
  successMessage: null,
  updateSuccess: false,
  viewCategory: null,
  viewLoading: false,
  viewError: null,

  tours: [],
  toursLoading: false,
  toursError: null,

  subCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,

  bookings: [],
  bookingsLoading: false,
  bookingsError: null,
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
        data: [], // ✅ reset data, not "category"
        loading: false,
        error: null,
        updateSuccess: false,
      };
      case VIEW_TRAVEL_CATEGORY_DETAILS_REQUEST:
      return {
        ...state,
        viewLoading: true,
        viewError: null,
        viewCategory: null,
      };
    case VIEW_TRAVEL_CATEGORY_DETAILS_SUCCESS:
      return {
        ...state,
        viewLoading: false,
        viewCategory: action.payload,
      };
    case VIEW_TRAVEL_CATEGORY_DETAILS_FAILURE:
      return {
        ...state,
        viewLoading: false,
        viewError: action.payload,
        viewCategory: null,
      };

        // 🔹 Tours
    case FETCH_CATEGORY_TOURS_REQUEST:
      return {
        ...state,
        toursLoading: true,
        toursError: null,
      };
    case FETCH_CATEGORY_TOURS_SUCCESS:
      return {
        ...state,
        toursLoading: false,
        tours: action.payload,
      };
    case FETCH_CATEGORY_TOURS_FAILURE:
      return {
        ...state,
        toursLoading: false,
        toursError: action.payload,
      };

    // 🔹 Subcategories
    case FETCH_CATEGORY_SUBCATEGORIES_REQUEST:
      return {
        ...state,
        subCategoriesLoading: true,
        subCategoriesError: null,
      };
    case FETCH_CATEGORY_SUBCATEGORIES_SUCCESS:
      return {
        ...state,
        subCategoriesLoading: false,
        subCategories: action.payload,
      };
    case FETCH_CATEGORY_SUBCATEGORIES_FAILURE:
      return {
        ...state,
        subCategoriesLoading: false,
        subCategoriesError: action.payload,
      };

    // 🔹 Bookings
    case FETCH_CATEGORY_BOOKINGS_REQUEST:
      return {
        ...state,
        bookingsLoading: true,
        bookingsError: null,
      };
    case FETCH_CATEGORY_BOOKINGS_SUCCESS:
      return {
        ...state,
        bookingsLoading: false,
        bookings: action.payload,
      };
    case FETCH_CATEGORY_BOOKINGS_FAILURE:
      return {
        ...state,
        bookingsLoading: false,
        bookingsError: action.payload,
      };

    default:
      return state;
  }
};

export default travelCategory;

