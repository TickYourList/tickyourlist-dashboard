import { ADD_CAR_BANNER_FAIL, ADD_CAR_BANNER_SUCCESS, ADD_NEW_CAR_BANNER, GET_CAR_BANNER, GET_CAR_BANNER_FAIL, GET_CAR_BANNER_SUCCESS } from "./actionTypes";

  export const getCarBanner = () => ({
    type: GET_CAR_BANNER,
  });
  
  export const getCarBannerSuccess = carBlogs => ({
    type: GET_CAR_BANNER_SUCCESS,
    payload: carBlogs,
  });
  
  export const getCarBannerFail = error => ({
    type: GET_CAR_BANNER_FAIL,
    payload: error,
  });
  
  export const addNewCarBanner = data => ({
    type: ADD_NEW_CAR_BANNER,
    payload: data,
  });
  
  export const addCarBannerSuccess = event => ({
    type: ADD_CAR_BANNER_SUCCESS,
    payload: event,
  });
  
  export const addCarBannerFail = error => ({
    type: ADD_CAR_BANNER_FAIL,
    payload: error,
  });