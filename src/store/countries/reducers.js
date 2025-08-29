import {
    GET_COUNTRIES,
    GET_COUNTRIES_SUCCESS,
    GET_COUNTRIES_FAILURE,
    ADD_COUNTRY,
    ADD_COUNTRY_SUCCESS,
    ADD_COUNTRY_FAILURE,
    GET_CURRENCY_LIST,
    GET_CURRENCY_LIST_SUCCESS,
    GET_CURRENCY_LIST_FAIL,
    UPDATE_COUNTRY,
    UPDATE_COUNTRY_SUCCESS,
    UPDATE_COUNTRY_FAILURE,
    GET_COUNTRY_BY_CODE,
    GET_COUNTRY_BY_CODE_SUCCESS,
    GET_COUNTRY_BY_CODE_FAILURE,
    GET_COUNTRY_BY_ID,
    GET_COUNTRY_BY_ID_SUCCESS,
    GET_COUNTRY_BY_ID_FAILURE,
    DELETE_COUNTRY,
    DELETE_COUNTRY_SUCCESS,
    DELETE_COUNTRY_FAILURE
} from './actions';

const initialState = {
    countries: [],
    loading: false,
    error: null,
    addLoading: false,
    deleteLoading: false, // added
    currencyList: [],
    currencyLoading: false,
    currencyError: null,
    selectedCountry: null,
    selectedCountryLoading: false,
    selectedCountryError: null,
    countryDetails: null,
    countryDetailsLoading: false,
    countryDetailsError: null,
};

const countriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_COUNTRIES:
            return {
                ...state,
                loading: true,
                error: null
            };
        case GET_COUNTRIES_SUCCESS:
            return {
                ...state,
                loading: false,
                countries: action.payload,
                error: null
            };
        case GET_COUNTRIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

            // Add Country
        case ADD_COUNTRY:
            return {
                ...state,
                addLoading: true,
                error: null
            };
        case ADD_COUNTRY_SUCCESS:
            return {
                ...state,
                addLoading: false,
                countries: [...state.countries, action.payload],
                error: null
            };
        case ADD_COUNTRY_FAILURE:
            return {
                ...state,
                addLoading: false,
                error: action.payload
            };

        case GET_CURRENCY_LIST:
            return {
                ...state,
                currencyLoading: true,
                currencyError: null,
            };
        case GET_CURRENCY_LIST_SUCCESS:
            return {
                ...state,
                currencyLoading: false,
                currencyList: action.payload,
            };
        case GET_CURRENCY_LIST_FAIL:
            return {
                ...state,
                currencyLoading: false,
                currencyError: action.payload,
            };

            // Update Country
        case UPDATE_COUNTRY:
            return {
                ...state,
                addLoading: true,
                error: null
            };
        case UPDATE_COUNTRY_SUCCESS:
            return {
                ...state,
                addLoading: false,
                countries: state.countries.map(country =>
                    country._id === action.payload._id ? action.payload : country
                ),
                error: null
            };
        case UPDATE_COUNTRY_FAILURE:
            return {
                ...state,
                addLoading: false,
                error: action.payload
            };

            // Get Country by Code
        case GET_COUNTRY_BY_CODE:
            return {
                ...state,
                selectedCountryLoading: true,
                selectedCountryError: null,
                selectedCountry: null
            };
        case GET_COUNTRY_BY_CODE_SUCCESS:
            return {
                ...state,
                selectedCountryLoading: false,
                selectedCountry: action.payload,
                selectedCountryError: null
            };
        case GET_COUNTRY_BY_CODE_FAILURE:
            return {
                ...state,
                selectedCountryLoading: false,
                selectedCountryError: action.payload,
                selectedCountry: null
            };
         // Get Country by ID
         case GET_COUNTRY_BY_ID:
            return {
                ...state,
                countryDetailsLoading: true,
                countryDetailsError: null,
                countryDetails: null
            };
        case GET_COUNTRY_BY_ID_SUCCESS:
            return {
                ...state,
                countryDetailsLoading: false,
                countryDetails: action.payload,
                countryDetailsError: null
            };
        case GET_COUNTRY_BY_ID_FAILURE:
            return {
                ...state,
                countryDetailsLoading: false,
                countryDetailsError: action.payload,
                countryDetails: null
            };

        case DELETE_COUNTRY:
            return {...state, deleteLoading: true, error: null };
        case DELETE_COUNTRY_SUCCESS:
            return {
                ...state,
                deleteLoading: false,
                countries: state.countries.filter(c => c.code !== action.payload),
                error: null,
            };
        case DELETE_COUNTRY_FAILURE:
            return {...state, deleteLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default countriesReducer;
