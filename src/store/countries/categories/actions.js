//Action type 
export const GET_CATEGORIES = "GET_CATEGORIE";
export const GET_CATEGORIES_SUCCESS = "GET_CATEGORIES_SUCCESS";
export const GET_CATEGORIES_FAILURE = "GET_CATEGORIES_FAILURE";

//action creators
export const getCategories = (countryId) => ({
    type: GET_CATEGORIES,
    payload: countryId,
});
export const getCategoriesSuccess = (categories) => ({
    type: GET_CATEGORIES_SUCCESS,
    payload: categories,
});
export const getCategoriesFailure = (error) => ({
    type: GET_CATEGORIES_FAILURE,
    payload: error,
});