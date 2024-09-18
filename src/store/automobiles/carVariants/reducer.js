import { ADD_ALL_VARIANT_PRICING, ADD_ALL_VARIANT_PRICING_ERROR, ADD_ALL_VARIANT_PRICING_SUCCESS, ADD_CAR_VARIANT_FAIL, ADD_CAR_VARIANT_SUCCESS, DELETE_ALL_CAR_VARIANT_SUCCESS, DELETE_CAR_VARIANT_FAIL, DELETE_CAR_VARIANT_PRICING, DELETE_CAR_VARIANT_PRICING_FAIL, DELETE_CAR_VARIANT_PRICING_SUCCESS, DELETE_CAR_VARIANT_SUCCESS, GET_CAR_VARIANTS_FAIL, GET_CAR_VARIANTS_SUCCESS, GET_CAR_VARIANT_PRICING, GET_CAR_VARIANT_PRICING_FAIL, GET_CAR_VARIANT_PRICING_SUCCESS, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_VARIANT_FAIL, UPDATE_CAR_VARIANT_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carVariants: [],
    countries: [],
    error: {},
    carVariantPricing: [],
    carVariantSaveLoader: false,
    carVariantPriceLoader: false,
};

const carVariant = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_VARIANTS_SUCCESS:
            return {
                ...state,
                carVariants: action.payload,
            };

        case GET_CAR_VARIANTS_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case ADD_CAR_VARIANT_SUCCESS:
            return {
                ...state,
                carVariants: [...state.carVariants, action.payload.carVariant],
            };

        case ADD_CAR_VARIANT_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case UPDATE_CAR_VARIANT_SUCCESS:
            return {
                ...state,
                carVariants: state.carVariants.map(carVariant =>
                    carVariant._id.toString() === action.payload._id.toString()
                        ? { carVariant, ...action.payload }
                        : carVariant
                ),
            };

        case UPDATE_CAR_VARIANT_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_VARIANT_SUCCESS:
            return {
                ...state,
                carVariants: state.carVariants.filter(
                    carVariant => carVariant._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_VARIANT_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_VARIANT_SUCCESS:
            return {
                ...state,
                carVariants: []
            }
        case ADD_ALL_VARIANT_PRICING:
            return {
                ...state,
                carVariantSaveLoader: true
            };
        case ADD_ALL_VARIANT_PRICING_SUCCESS: 
        return {
            ...state,
            carVariantPriceLoader: false
        };
        case ADD_ALL_VARIANT_PRICING_ERROR: 
        return {
            ...state,
            carVariantPriceLoader: false
        };
        case GET_CAR_VARIANT_PRICING:
            return {
                ...state,
                carVariantPriceLoader: true
            };
        case GET_CAR_VARIANT_PRICING_SUCCESS:
            return {
                ...state,
                carVariantPricing: action.payload,
                carVariantPriceLoader: false
            };
        case DELETE_CAR_VARIANT_PRICING_SUCCESS:
            return {
                ...state,
                carVariantPricing: []
            };
        case DELETE_CAR_VARIANT_PRICING_FAIL:
            return {
                ...state,
                carVariantPricing: state.carVariantPricing
            };

        case GET_CAR_VARIANT_PRICING_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case GET_COUNTRIES_LIST_SUCCESS:
            return {
                ...state,
                countries: action.payload
            }
        default:
            return state;
    }
};

export default carVariant;
