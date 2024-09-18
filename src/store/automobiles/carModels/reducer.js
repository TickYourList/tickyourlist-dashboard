import { ADD_CAR_MODEL_FAIL, ADD_CAR_MODEL_SUCCESS, DELETE_ALL_CAR_MODEL_SUCCESS, DELETE_CAR_MODEL_FAIL, DELETE_CAR_MODEL_SUCCESS, GET_CAR_MODELS, GET_CAR_MODELS_FAIL, GET_CAR_MODELS_SUCCESS, GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_MODEL_FAIL, UPDATE_CAR_MODEL_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carModels: [],
    countries: [],
    error: {},
    carVariants: []
};

const carModel = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_MODELS_SUCCESS:
            return {
                ...state,
                carModels: action.payload,
            };

        case GET_CAR_MODELS_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case ADD_CAR_MODEL_SUCCESS:
            return {
                ...state,
                carModels: [...state.carModels, action.payload.carModel],
            };

        case ADD_CAR_MODEL_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case UPDATE_CAR_MODEL_SUCCESS:
            return {
                ...state,
                carModels: state.carModels.map(carModel =>
                    carModel._id.toString() === action.payload.id.toString()
                      ? { ...carModel, ...action.payload.data } // Spread the original carModel object and update it with new data
                      : carModel // Return the unchanged carModel for non-matching entries
                  ),
            };

        case UPDATE_CAR_MODEL_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_MODEL_SUCCESS:
            return {
                ...state,
                carModels: state.carModels.filter(
                    carModel => carModel._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_MODEL_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_MODEL_SUCCESS:
            return {
                ...state,
                carModels: []
            }
        case GET_COUNTRIES_LIST_SUCCESS:
            return {
                ...state,
                countries: action.payload
            }
            case GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS:
                return {
                    ...state,
                    carVariants: action.payload
                }
        default:
            return state;
    }
};

export default carModel;
