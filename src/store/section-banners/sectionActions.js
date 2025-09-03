import { GET_CITIES, GET_CITIES_FAILURE, GET_CITIES_SUCCESS }
from "./actionTypes";
  

export const getCities = () => ({
  type: GET_CITIES,
});

export const getCitiesSuccess = (banners) => ({
  type: GET_CITIES_SUCCESS,
  payload: banners
});

export const getCitiesFailure = (error) => ({
  type: GET_CITIES_FAILURE,
  payload: error
});