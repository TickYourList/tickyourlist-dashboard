import { ADD_NEW_TESTIMONIAL, ADD_TESTIMONIAL_FAIL, ADD_TESTIMONIAL_SUCCESS, DELETE_ALL_TESTIMONIAL, DELETE_ALL_TESTIMONIAL_FAIL, DELETE_ALL_TESTIMONIAL_SUCCESS, DELETE_TESTIMONIAL, DELETE_TESTIMONIAL_FAIL, DELETE_TESTIMONIAL_SUCCESS, GET_TESTIMONIALS, GET_TESTIMONIALS_FAIL, GET_TESTIMONIALS_SUCCESS, UPDATE_TESTIMONIAL, UPDATE_TESTIMONIAL_FAIL, UPDATE_TESTIMONIAL_SUCCESS } from "./actionTypes";

  export const getTestimonials = () => ({
    type: GET_TESTIMONIALS,
  });
  
  export const getTestimonialsSuccess = Testimonials => ({
    type: GET_TESTIMONIALS_SUCCESS,
    payload: Testimonials,
  });
  
  export const getTestimonialsFail = error => ({
    type: GET_TESTIMONIALS_FAIL,
    payload: error,
  });
  
  export const addNewTestimonial = (data) => ({
    type: ADD_NEW_TESTIMONIAL,
    payload: { data },
  });
  
  export const addTestimonialsuccess = event => ({
    type: ADD_TESTIMONIAL_SUCCESS,
    payload: event,
  });
  
  export const addTestimonialFail = error => ({
    type: ADD_TESTIMONIAL_FAIL,
    payload: error,
  });
  
  export const updateTestimonial = (id, data) => ({
    type: UPDATE_TESTIMONIAL,
    payload: { id, data },
  });
  
  export const updateTestimonialsuccess = id => ({
    type: UPDATE_TESTIMONIAL_SUCCESS,
    payload: id,
  });
  
  export const updateTestimonialFail = error => ({
    type: UPDATE_TESTIMONIAL_FAIL,
    payload: error,
  });
  
  export const deleteTestimonial = testimonial => ({
    type: DELETE_TESTIMONIAL,
    payload: testimonial,
  });
  
  export const deleteTestimonialsuccess = testimonial => ({
    type: DELETE_TESTIMONIAL_SUCCESS,
    payload: testimonial,
  });
  
  export const deleteTestimonialFail = error => ({
    type: DELETE_TESTIMONIAL_FAIL,
    payload: error,
  });

  export const deleteAllTestimonials = () => ({
    type: DELETE_ALL_TESTIMONIAL,
  });
  
  export const deleteAllTestimonialsSuccess = () => ({
    type: DELETE_ALL_TESTIMONIAL_SUCCESS,
  });
  
  export const deleteAllTestimonialsFail = error => ({
    type: DELETE_ALL_TESTIMONIAL_FAIL,
    payload: error,
  });
  