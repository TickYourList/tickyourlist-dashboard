import { ADD_CAR_BANNER_FAIL, ADD_CAR_BANNER_SUCCESS, ADD_CAR_BLOG_FAIL, ADD_CAR_BLOG_SUCCESS, DELETE_ALL_CAR_BLOG_SUCCESS, DELETE_CAR_BLOG_FAIL, DELETE_CAR_BLOG_SUCCESS, GET_CAR_BANNER_FAIL, GET_CAR_BANNER_SUCCESS, GET_CAR_BLOGS, GET_CAR_BLOGS_FAIL, GET_CAR_BLOGS_SUCCESS, GET_CAR_MODEL_BY_BRAND_FAILED, GET_CAR_MODEL_BY_BRAND_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BLOG_FAIL, UPDATE_CAR_BLOG_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    banner: '',
    error: ''
};

const CarBanner = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_BANNER_SUCCESS:
            return {
                ...state,
                banner: action.payload,
            };
        case GET_CAR_BANNER_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case ADD_CAR_BANNER_SUCCESS:
            return {
                ...state,
                banner: action.payload,
            };
        case ADD_CAR_BANNER_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default CarBanner;
