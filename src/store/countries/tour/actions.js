// Action Types
export const GET_TOURS = "GET_TOURS";
export const GET_TOURS_SUCCESS = "GET_TOURS_SUCCESS";
export const GET_TOURS_FAILURE = "GET_TOURS_FAILURE";
export const CLEAR_TOURS = "CLEAR_TOURS";

// Action Creators
export const getTours = (countryId) => ({
    type: GET_TOURS,
    payload: countryId,
});
export const getToursSuccess = (tours) => ({
    type: GET_TOURS_SUCCESS,
    payload: tours,
});
export const getToursFailure = (error) => ({
    type: GET_TOURS_FAILURE,
    payload: error,
});
export const clearTours = () => ({ type: CLEAR_TOURS });