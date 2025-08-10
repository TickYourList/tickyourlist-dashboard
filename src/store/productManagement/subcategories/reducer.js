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
    RESET_SUBCATEGORY_STATUS
} from "./actionTypes";

const TRAVEL_DATA_INIT_STATE = {
    subcategories: [],
    selectedCategory: null, // This seems related to subcategories
    travelcategories: [],
    travelCities: [],
    travelSubcategoryDetails:[],
    loading: false, // Initial loading state set to false
    error: null,
    success: false, // For add subcategory success
    deleteSuccess: false, // For delete subcategory success
};

const travelSubCategoryReducer = (state = TRAVEL_DATA_INIT_STATE, action) => {
    switch (action.type) {
        // --- Subcategory related actions ---
        case GET_SUBCATEGORIES_SUCCESS:
            return {
                ...state,
                subcategories: action.payload,
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
            console.log("This is GET_EXITING_SUBCATEGORY_FAIL!",action.payload);
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


        // --- Temporary testing case (consider removing in production) ---
        case 'FORCE_ERROR_FOR_TESTING':
            return {
                ...state,
                error: "This is a forced error message for testing!",
                loading: false,
                subcategories: [], // You might want to clear related data on a forced error
            };

        default:
            return state;
    }
};

export default travelSubCategoryReducer;