// Action Types
export const GET_CITIES = "GET_CITIES";
export const GET_CITIES_SUCCESS = "GET_CITIES_SUCCESS";
export const GET_CITIES_FAILURE = "GET_CITIES_FAILURE";

// Action Creators
export const getCities = (countryId) => ({
    type: GET_CITIES,
    payload: countryId,
});
export const getCitiesSuccess = (cities) => ({
    type: GET_CITIES_SUCCESS,
    payload: cities,
});
export const getCitiesFailure = (error) => ({
    type: GET_CITIES_FAILURE,
    payload: error,
});