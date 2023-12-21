import { ADD_CAR_BLOG_FAIL, ADD_CAR_BLOG_SUCCESS, DELETE_ALL_CAR_BLOG_SUCCESS, DELETE_CAR_BLOG_FAIL, DELETE_CAR_BLOG_SUCCESS, GET_CAR_BLOGS, GET_CAR_BLOGS_FAIL, GET_CAR_BLOGS_SUCCESS, GET_CAR_MODEL_BY_BRAND_FAILED, GET_CAR_MODEL_BY_BRAND_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BLOG_FAIL, UPDATE_CAR_BLOG_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carBlogs: [],
    countries: [],
    error: {},
    carModels: []
};

const CarBlog = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_BLOGS_SUCCESS:
            return {
                ...state,
                carBlogs: action.payload,
            };
        case GET_CAR_BLOGS_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case ADD_CAR_BLOG_SUCCESS:
            return {
                ...state,
                carBlogs: [...state.carBlogs, action.payload.carBlog],
            };
        case ADD_CAR_BLOG_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case UPDATE_CAR_BLOG_SUCCESS:
            return {
                ...state,
                carBlogs: state.carBlogs.map(carBlog =>
                    carBlog._id.toString() === action.payload._id.toString()
                        ? { carBlog, ...action.payload }
                        : carBlog
                ),
            };
        case UPDATE_CAR_BLOG_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_BLOG_SUCCESS:
            return {
                ...state,
                carBlogs: state.carBlogs.filter(
                    carBlog => carBlog._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_BLOG_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_BLOG_SUCCESS:
            return {
                ...state,
                carBlogs: []
            }
        case GET_COUNTRIES_LIST_SUCCESS:
            return {
                ...state,
                countries: action.payload
            }
        case GET_CAR_MODEL_BY_BRAND_SUCCESS:
            console.log('action.payload ', action.payload);
            return {
                ...state,
                carModels: action.payload
            }
        case GET_CAR_MODEL_BY_BRAND_FAILED:
            return {
                ...state,
                carModels: action.payload
            }
        default:
            return state;
    }
};

export default CarBlog;
