import { ADD_CAR_CUSTOMER_FAIL, ADD_CAR_CUSTOMER_SUCCESS, DELETE_ALL_CAR_CUSTOMER_SUCCESS, DELETE_CAR_CUSTOMER_FAIL, DELETE_CAR_CUSTOMER_SUCCESS, GET_CAR_CUSTOMERS_FAIL, GET_CAR_CUSTOMERS_SUCCESS, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_CUSTOMER_FAIL, UPDATE_CAR_CUSTOMER_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carCustomers: [],
    error: {},
};

const CarCustomer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_CUSTOMERS_SUCCESS:
            return {
                ...state,
                carCustomers: action.payload,
            };
        case GET_CAR_CUSTOMERS_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case ADD_CAR_CUSTOMER_SUCCESS:
            return {
                ...state,
                carCustomers: [...state.carCustomers, action.payload.carCustomer],
            };
        case ADD_CAR_CUSTOMER_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case UPDATE_CAR_CUSTOMER_SUCCESS:
            return {
                ...state,
                carCustomers: state.carCustomers.map(carCustomer =>
                    carCustomer._id.toString() === action.payload._id.toString()
                        ? { carCustomer, ...action.payload }
                        : carCustomer
                ),
            };
        case UPDATE_CAR_CUSTOMER_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_CUSTOMER_SUCCESS:
            return {
                ...state,
                carCustomers: state.carCustomers.filter(
                    carCustomer => carCustomer._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_CUSTOMER_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_CUSTOMER_SUCCESS:
            return {
                ...state,
                carCustomers: []
            }
        case GET_COUNTRIES_LIST_SUCCESS:
            return {
                ...state,
                countries: action.payload
            }
        default:
            return state;
    }
};

export default CarCustomer;
