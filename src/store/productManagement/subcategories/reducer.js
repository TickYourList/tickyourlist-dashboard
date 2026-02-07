import {
    GET_SUBCATEGORIES_SUCCESS,
    GET_SUBCATEGORIES_FAIL,
    ADD_TRAVEL_SUBCATEGORY_SUCCESS,
    GET_TRAVEL_CATEGORIES_SUCCESS,
    GET_TRAVEL_CATEGORIES_FAIL,
    ADD_TRAVEL_SUBCATEGORY_FAIL,
    GET_EXISTING_SUBCATEGORY_SUCCESS,
    GET_EXISTING_SUBCATEGORY_FAIL,
    DELETE_SUBCATEGORY_SUCCESS,
    DELETE_SUBCATEGORY_FAIL,
    UPDATE_SUBCATEGORY_FAIL,
    UPDATE_SUBCATEGORY_SUCCESS,
    RESET_SUBCATEGORY_STATUS,
    GET_SUBCATEGORY_DETAILS_FOR_VIEW_SUCCESS,
    GET_SUBCATEGORY_DETAILS_FOR_VIEW_FAIL,
    GET_SUBCATEGORY_VIEW_TOURS_TABLE_SUCCESS,
    GET_SUBCATEGORY_VIEW_TOURS_TABLE_FAIL,
    GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_SUCCESS,
    GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_FAIL,
    GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_SUCCESS,
    GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_FAIL,
    // Make sure this is imported from your actionTypes file
     CLEAR_SUBCATEGORY_VIEW_DATA,
} from "./actionTypes";

const TRAVEL_DATA_INIT_STATE = {
    subcategories: [],
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    selectedCategory: null, // This seems related to subcategories
    travelcategories: [],
    travelCities: [],
    travelSubcategoryDetails:[],
    loading: false, // Initial loading state set to false
    error: null,
    success: false, // For add subcategory success
    deleteSuccess: false, // For delete subcategory success
    travelSubcategoryDetailsForView: null,
    SubcategoryViewToursTable: null,
    SubcategoryViewBookingsTable: null,
    SubcategoryUserPermissions: null,
};

const travelSubCategoryReducer = (state = TRAVEL_DATA_INIT_STATE, action) => {
    switch (action.type) {
        // --- Subcategory related actions ---
        case GET_SUBCATEGORIES_SUCCESS:
            return {
                ...state,
                subcategories: action.payload.subcategories || action.payload || [],
                totalCount: action.payload.total || 0,
                currentPage: action.payload.page || 1,
                pageSize: action.payload.limit || 10,
                loading: false,
                error: null,
            };
        case GET_SUBCATEGORIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        // --- Add Travel Subcategory related actions ---
        case ADD_TRAVEL_SUBCATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null, // Clear any previous errors on success
                success: true,
            };
        case ADD_TRAVEL_SUBCATEGORY_FAIL:
            return {
                ...state,
                error: action.payload,
                loading: false,
                success: false,
            };
            // --- Travel Category related actions ---
        case GET_TRAVEL_CATEGORIES_SUCCESS:
            return {
                ...state,
                travelcategories: action.payload,
                loading: false,
                error: null,
            };
        case GET_TRAVEL_CATEGORIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        // --- Exiting Subcategory related actions ---
        case GET_EXISTING_SUBCATEGORY_SUCCESS:
            return {
                ...state,
                travelSubcategoryDetails:action.payload,
                loading: false,
                success:false,
                error: null, // Clear any previous errors on success
            };
        case GET_EXISTING_SUBCATEGORY_FAIL:
            return {
                ...state,
                error: action.payload,
                loading: false,
                success: false,
            };
        case UPDATE_SUBCATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null, // Clear any previous errors on success
                success: true,
            };
        case UPDATE_SUBCATEGORY_FAIL:
            return {
                ...state,
                error: action.payload,
                loading: false,
                success: false,
            };

            case DELETE_SUBCATEGORY_SUCCESS:
                return {
                    ...state,
                    subcategories: state.subcategories.filter(subcategory => subcategory.id !== action.payload.id),
                    loading: false,
                    error: null,
                    deleteSuccess: true, // Set delete success to true
                };

        case DELETE_SUBCATEGORY_FAIL:
            return {    
                ...state,
                error: action.payload,
                loading: false,
                deleteSuccess: false, // Reset delete success on failure
            };

            case RESET_SUBCATEGORY_STATUS:
                return {
                ...state,
                success: false,
                error: null,
                deleteSuccess: false, // Reset delete success status
            };

            // This case seems to be duplicated with the one below.
    // It is best to use a single case for a specific action type.
    case GET_SUBCATEGORY_DETAILS_FOR_VIEW_SUCCESS:
      return {
        ...state,
        travelSubcategoryDetails: action.payload,
        travelSubcategoryDetailsForView: action.payload, // Correcting the state property
        loading: false,
        error: null,
      };
    case GET_SUBCATEGORY_DETAILS_FOR_VIEW_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };


        // --- Temporary testing case (consider removing in production) ---
        case 'FORCE_ERROR_FOR_TESTING':
            return {
                ...state,
                error: "This is a forced error message for testing!",
                loading: false,
                subcategories: [], // You might want to clear related data on a forced error
            };

            case GET_SUBCATEGORY_VIEW_TOURS_TABLE_SUCCESS:
                return {
                  ...state,
                  SubcategoryViewToursTable: action.payload,
                  loading: false,
                  error: null,
                };
              case GET_SUBCATEGORY_VIEW_TOURS_TABLE_FAIL:
                return {
                  ...state,
                  loading: false,
                  error: action.payload,
                };

                case GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_SUCCESS:
                    return {
                      ...state,
                      SubcategoryViewBookingsTable: action.payload,
                      loading: false,
                      error: null,
                    };
                  case GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE_FAIL:
                    return {
                      ...state,
                      loading: false,
                      error: action.payload,
                    };
              
                  case GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_SUCCESS:
                    console.log("Reducer: User permissions for subcategory fetched successfully: from reducer", action.payload.permissions);
                    return {
                      ...state,
                      SubcategoryUserPermissions: action.payload.permissions,
                      loading: false,
                      error: null,
                    };
                  case GET_USERS_PERMISSIONS_FOR_SUBCATEGORY_FAIL:
                    return {
                      ...state,
                      loading: false,
                      error: action.payload,
                    };
              
                  // --- ADD THE NEW CASE HERE ---
                  case CLEAR_SUBCATEGORY_VIEW_DATA:
                    return {
                      ...state,
                      travelSubcategoryDetails: null, // Resetting data for edit form
                      travelSubcategoryDetailsForView: null, // Resetting data for view modal
                      SubcategoryViewToursTable: null,
                      SubcategoryViewBookingsTable: null,
                      loading: false,
                      error: null,
                    };

        default:
            return state;
    }
};

export default travelSubCategoryReducer;