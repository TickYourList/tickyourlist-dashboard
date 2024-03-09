import { ADD_CAR_DEALER_FAIL, ADD_CAR_DEALER_SUCCESS, DELETE_ALL_CAR_DEALER_SUCCESS, DELETE_CAR_DEALER_FAIL, DELETE_CAR_DEALER_SUCCESS, GET_CAR_DEALERS, GET_CAR_DEALERS_FAIL, GET_CAR_DEALERS_SUCCESS, GET_CAR_VARIANTS_FROM_CARMODEL_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_DEALER_FAIL, UPDATE_CAR_DEALER_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carDealers: [],
    countries: [],
    error: {},
    carVariants: []
};

const carDealer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_DEALERS_SUCCESS:
            return {
                ...state,
                carDealers: action.payload,
            };

        case GET_CAR_DEALERS_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case ADD_CAR_DEALER_SUCCESS:
            return {
                ...state,
                carDealers: [...state.carDealers, action.payload.carDealers],
            };

        case ADD_CAR_DEALER_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case UPDATE_CAR_DEALER_SUCCESS:
            return {
                ...state,
                carDealers: state.carDealers.map(carDealer =>
                    carDealer._id.toString() === action.payload.id.toString()
                        ? { carDealer, ...action.payload.data }
                        : carDealer
                ),
            };

        case UPDATE_CAR_DEALER_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_DEALER_SUCCESS:
            return {
                ...state,
                carDealers: state.carDealers.filter(
                    carDealer => carDealer._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_DEALER_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_DEALER_SUCCESS:
            return {
                ...state,
                carDealers: []
            }
        default:
            return state;
    }
};

export default carDealer;
