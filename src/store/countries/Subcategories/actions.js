export const GET_SUBCATEGORIES = "GET_SUBCATEGORIES";
export const GET_SUBCATEGORIES_SUCCESS = "GET_SUBCATEGORIES_SUCCESS";
export const GET_SUBCATEGORIES_FAILURE = "GET_SUBCATEGORIES_FAILURE";

export const getSubcategories = (countryId) => ({
    type: GET_SUBCATEGORIES,
    payload: countryId,
});

export const getSubcategoriesSuccess = (subcategories) => ({
    type: GET_SUBCATEGORIES_SUCCESS,
    payload: subcategories,
});

export const getSubcategoriesFailure = (error) => ({
    type: GET_SUBCATEGORIES_FAILURE,
    payload: error,
});