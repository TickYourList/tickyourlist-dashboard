import {
    GET_COUNTRY_COLLECTIONS,
    GET_COUNTRY_COLLECTIONS_SUCCESS,
    GET_COUNTRY_COLLECTIONS_FAILURE
} from "./actions";

const initialState = {
    collections: [],
    loading: false,
    error: null,

};

const collectionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_COUNTRY_COLLECTIONS:
            return {...state, loading: true, error: null };
        case GET_COUNTRY_COLLECTIONS_SUCCESS:
            return {...state, loading: false, collections: action.payload, error: null };
        case GET_COUNTRY_COLLECTIONS_FAILURE:
            return {...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
export default collectionsReducer;