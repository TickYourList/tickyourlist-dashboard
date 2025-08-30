import { GET_BOOKINGS, GET_BOOKINGS_SUCCESS, GET_BOOKINGS_FAILURE, APPEND_BOOKINGS_SUCCESS } from "./actions";

const initialState = {
    bookings: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 50,
};

const bookingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_BOOKINGS:
            return {...state, loading: true, error: null };
        case GET_BOOKINGS_SUCCESS:
            return {...state, loading: false, bookings: action.payload, error: null };
        case APPEND_BOOKINGS_SUCCESS:
            return {...state, loading: false, bookings: [...state.bookings, ...action.payload], error: null };
        case GET_BOOKINGS_FAILURE:
            return {...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
export default bookingsReducer;