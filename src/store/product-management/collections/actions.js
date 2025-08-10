import {
  GET_COLLECTIONS,
  GET_COLLECTIONS_SUCCESS,
  GET_COLLECTIONS_FAIL,
  ADD_COLLECTION,
  ADD_COLLECTION_SUCCESS,
  ADD_COLLECTION_FAIL,
  RESET_ADD_COLLECTION_STATE,
  GET_COLLECTION_BY_ID,
  GET_COLLECTION_BY_ID_SUCCESS,
  GET_COLLECTION_BY_ID_FAIL,  
  UPDATE_COLLECTION,
  UPDATE_COLLECTION_SUCCESS,
  UPDATE_COLLECTION_FAIL,
  DELETE_COLLECTION,
  DELETE_COLLECTION_SUCCESS,
  DELETE_COLLECTION_FAIL
} from "./actionTypes"

// -----------------------------------------getCollection------------------------------------------------------------

export const getCollections = () => ({
  type: GET_COLLECTIONS,
})

export const getCollectionsSuccess = collection => ({
  type: GET_COLLECTIONS_SUCCESS,
  payload: collection,
})

export const getCollectionsFail = error => ({
  type: GET_COLLECTIONS_FAIL,
  payload: error,
})

// collection by id to prepopulate edit form  

export const getCollectionById = id => ({
  type: GET_COLLECTION_BY_ID,
  payload: id,
})

export const getCollectionByIdSuccess = collection => ({
  type: GET_COLLECTION_BY_ID_SUCCESS,
  payload: collection,
})

export const getCollectionByIdFail = error => ({
  type: GET_COLLECTION_BY_ID_FAIL,
  payload: error,
})

// -----------------------------------------getCollection------------------------------------------------------------

// -----------------------------------------addCollection------------------------------------------------------------

export const addCollections = collection => ({
  type: ADD_COLLECTION,
  payload: collection,
})

export const addCollectionsSuccess = collection => ({
  type: ADD_COLLECTION_SUCCESS,
  payload: collection,
})

export const addCollectionsFail = error => ({
  type: ADD_COLLECTION_FAIL,
  payload: error,
})

export const resetAddCollectionState = () => ({
  type: RESET_ADD_COLLECTION_STATE,
});

// -----------------------------------------addCollection------------------------------------------------------------

// -----------------------------------------updateCollection------------------------------------------------------------

export const updateCollection = collection  => ({
  type: UPDATE_COLLECTION,
  payload: collection,
})

export const updateCollectionSuccess = collection => ({
  type: UPDATE_COLLECTION_SUCCESS,
  payload: collection,
})

export const updateCollectionFail = error => ({
  type: UPDATE_COLLECTION_FAIL,
  payload: error,
})
// -----------------------------------------updateCollection------------------------------------------------------------

// -----------------------------------------deleteCollection------------------------------------------------------------
export const deleteCollection = id => ({
  type: DELETE_COLLECTION,
  payload: id,
})

export const deleteCollectionSuccess = collection => ({
  type: DELETE_COLLECTION_SUCCESS,
  payload: collection,
})

export const deleteCollectionFail = error => ({
  type: DELETE_COLLECTION_FAIL,
  payload: error,
})

// -----------------------------------------deleteCollection------------------------------------------------------------
