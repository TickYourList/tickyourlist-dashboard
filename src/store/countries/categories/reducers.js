import { GET_CATEGORIES, GET_CATEGORIES_SUCCESS, GET_CATEGORIES_FAILURE } from "./actions";


const initialState = {
    categories: [],
    loading: false,
    error: null,
};

const categoriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_CATEGORIES:
            return {...state, loading: true, error: null };
        case GET_CATEGORIES_SUCCESS:
            return {...state, loading: false, categories: action.payload, error: null };
        case GET_CATEGORIES_FAILURE:
            return {...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default categoriesReducer;