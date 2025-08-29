import { GET_SUBCATEGORIES, GET_SUBCATEGORIES_SUCCESS, GET_SUBCATEGORIES_FAILURE } from "./actions";

const initialState = {
    subcategories: [],
    loading: false,
    error: null,
};

const subcategoriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SUBCATEGORIES:
            return {...state, loading: true, error: null };
        case GET_SUBCATEGORIES_SUCCESS:
            return {...state, loading: false, subcategories: action.payload, error: null };
        case GET_SUBCATEGORIES_FAILURE:
            return {...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
export default subcategoriesReducer;