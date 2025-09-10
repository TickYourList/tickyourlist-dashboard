import { GET_CITIES, GET_CITIES_FAILURE, GET_CITIES_SUCCESS, GET_SECTION_CITIES, GET_SECTION_CITIES_FAILURE, GET_SECTION_CITIES_SUCCESS }
from "./actionTypes";
  

export const getCities = () => ({
  type: GET_SECTION_CITIES,
});

export const getCitiesSuccess = (banners) => ({
  type: GET_SECTION_CITIES_SUCCESS,
  payload: banners
});

export const getCitiesFailure = (error) => ({
  type: GET_SECTION_CITIES_FAILURE,
  payload: error
});

