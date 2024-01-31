import { ADD_TESTIMONIAL_FAIL, ADD_TESTIMONIAL_SUCCESS, DELETE_ALL_TESTIMONIAL_SUCCESS, DELETE_TESTIMONIAL_FAIL, DELETE_TESTIMONIAL_SUCCESS, GET_TESTIMONIALS_FAIL, GET_TESTIMONIALS_SUCCESS, UPDATE_TESTIMONIAL_FAIL, UPDATE_TESTIMONIAL_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    testimonials: [],
    error: {},
};

const testimonial = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_TESTIMONIALS_SUCCESS:
            return {
                ...state,
                testimonials: action.payload,
            };

        case GET_TESTIMONIALS_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case ADD_TESTIMONIAL_SUCCESS:
            return {
                ...state,
                testimonials: [...state.testimonials, action.payload.testimonials],
            };

        case ADD_TESTIMONIAL_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case UPDATE_TESTIMONIAL_SUCCESS:
            return {
                ...state,
                testimonials: state.testimonials.map(testimonial =>
                    testimonial.id.toString() === action.payload.id.toString()
                        ? { testimonial, ...action.payload }
                        : event
                ),
            };

        case UPDATE_TESTIMONIAL_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_TESTIMONIAL_SUCCESS:
            return {
                ...state,
                testimonials: state.testimonials.filter(
                    testimonial => testimonial._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_TESTIMONIAL_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_TESTIMONIAL_SUCCESS:
            return {
                ...state,
                testimonials: []
            }
        default:
            return state;
    }
};

export default testimonial;
