import { GET_TOURS, GET_TOURS_SUCCESS, GET_TOURS_FAILURE, CLEAR_TOURS } from "./actions";

const initialState = {
    tours: [],
    loading: false,
    error: null,
};

const toursReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_TOURS:
            return {...state, loading: true, error: null };
        case GET_TOURS_SUCCESS:
            return {...state, loading: false, tours: action.payload, error: null };
        case GET_TOURS_FAILURE:
            return {...state, loading: false, error: action.payload };
        case CLEAR_TOURS:
            return {...initialState };
        default:
            return state;
    }
};

export default toursReducer;