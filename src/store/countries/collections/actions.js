// Namespaced to avoid collision with global collections module
export const GET_COUNTRY_COLLECTIONS = "COUNTRY_GET_COLLECTIONS";
export const GET_COUNTRY_COLLECTIONS_SUCCESS = "COUNTRY_GET_COLLECTIONS_SUCCESS";
export const GET_COUNTRY_COLLECTIONS_FAILURE = "COUNTRY_GET_COUNTRY_COLLECTIONS_FAILURE";

export const getCollections = (countryId) => ({
    type: GET_COUNTRY_COLLECTIONS,
    payload: countryId,
});

export const getCollectionsSuccess = (collections) => ({
    type: GET_COUNTRY_COLLECTIONS_SUCCESS,
    payload: collections,
});

export const getCollectionsFailure = (error) => ({
    type: GET_COUNTRY_COLLECTIONS_FAILURE,
    payload: error,
});