import {
  GET_TOURS_REQUEST,
  GET_TOURS_SUCCESS,
  GET_TOURS_FAIL,

  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,

  GET_SUBCATEGORIES_REQUEST,
  GET_SUBCATEGORIES_SUCCESS,
  GET_SUBCATEGORIES_FAIL,

  GET_COLLECTIONS_REQUEST,
  GET_COLLECTIONS_SUCCESS,
  GET_COLLECTIONS_FAIL,

  GET_BOOKINGS_REQUEST,
  GET_BOOKINGS_SUCCESS,
  GET_BOOKINGS_FAIL,

  SORT_CATEGORY_REQUEST,
  SORT_CATEGORY_SUCCESS,
  SORT_CATEGORY_FAIL,

  SORT_SUB_CATEGORY_REQUEST,
  SORT_SUB_CATEGORY_SUCCESS,
  SORT_SUB_CATEGORY_FAIL,
} from "./actionTypes";

const INIT_STATE = {
  tours: {
    loading: false,
    data: [],
    error: null,
  },
  categories: {
    loading: false,
    data: [],
    error: null,
    loadingSortCategories: false,
  },
  subCategories: {
    loading: false,
    data: [],
    error: null,
    loadingSortSubCategories: false,
  },
  collections: {
    loading: false,
    data: [],
    error: null,
  },
  bookings: {
    loading: false,
    data: [],
    error: null,
  },
};

const CityDetails = (state = INIT_STATE, action) => {
  switch (action.type) {
    // Tours
    case GET_TOURS_REQUEST:
      return {
        ...state,
        tours: { loading: true, data: [], error: null },
      };
    case GET_TOURS_SUCCESS:
      return {
        ...state,
        tours: { loading: false, data: action.payload, error: null },
      };
    case GET_TOURS_FAIL:
      return {
        ...state,
        tours: { loading: false, data: [], error: action.payload },
      };

    // Categories
    case GET_CATEGORIES_REQUEST:
      return {
        ...state,
        categories: { loading: true, data: [], error: null },
      };
    case GET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: { loading: false, data: action.payload, error: null },
      };
    case GET_CATEGORIES_FAIL:
      return {
        ...state,
        categories: { loading: false, data: [], error: action.payload },
      };

    // Sub Categories
    case GET_SUBCATEGORIES_REQUEST:
      return {
        ...state,
        subCategories: { loading: true, data: [], error: null },
      };
    case GET_SUBCATEGORIES_SUCCESS:
      return {
        ...state,
        subCategories: { loading: false, data: action.payload, error: null },
      };
    case GET_SUBCATEGORIES_FAIL:
      return {
        ...state,
        subCategories: { loading: false, data: [], error: action.payload },
      };

    // Collections
    case GET_COLLECTIONS_REQUEST:
      return {
        ...state,
        collections: { loading: true, data: [], error: null },
      };
    case GET_COLLECTIONS_SUCCESS:
      return {
        ...state,
        collections: { loading: false, data: action.payload, error: null },
      };
    case GET_COLLECTIONS_FAIL:
      return {
        ...state,
        collections: { loading: false, data: [], error: action.payload },
      };

    // Bookings
    case GET_BOOKINGS_REQUEST:
      return {
        ...state,
        bookings: { loading: true, data: [], error: null },
      };
    case GET_BOOKINGS_SUCCESS:
      return {
        ...state,
        bookings: { loading: false, data: action.payload, error: null },
      };
    case GET_BOOKINGS_FAIL:
      return {
        ...state,
        bookings: { loading: false, data: [], error: action.payload },
      };

    // Sort Categories
    case SORT_CATEGORY_REQUEST:
      return {
        ...state,
        categories: {
          ...state.categories,
          loadingSortCategories: true,
        },
      };
    case SORT_CATEGORY_SUCCESS:
      return {
        ...state,
        categories: {
          ...state.categories,
          loadingSortCategories: false,
          data: action.payload || state.categories.data,
        },
      };
    case SORT_CATEGORY_FAIL:
      return {
        ...state,
        categories: {
          ...state.categories,
          loadingSortCategories: false,
          error: action.payload,
        },
      };

    // Sort Sub Categories
    case SORT_SUB_CATEGORY_REQUEST:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loadingSortSubCategories: true,
        },
      };
    case SORT_SUB_CATEGORY_SUCCESS:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loadingSortSubCategories: false,
          data: action.payload || state.subCategories.data,
        },
      };
    case SORT_SUB_CATEGORY_FAIL:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loadingSortSubCategories: false,
          error: action.payload,
        },
      };

    default:
      return state;
  }
};

export default CityDetails;
