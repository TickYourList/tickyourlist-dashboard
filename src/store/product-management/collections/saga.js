import { call, put, takeEvery } from "redux-saga/effects"
import { GET_COLLECTIONS, ADD_COLLECTION , GET_COLLECTION_BY_ID, UPDATE_COLLECTION, DELETE_COLLECTION} from "./actionTypes"
import {
  getCollectionsSuccess,
  getCollectionsFail,
  addCollectionsSuccess,
  addCollectionsFail,
  getCollectionByIdSuccess,
  getCollectionByIdFail,
  updateCollectionSuccess,
  updateCollectionFail,
  deleteCollectionSuccess,
  deleteCollectionFail
} from "./actions"

import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { getPMCollections, addPMCollection, getPMCollectionById, updatePMCollection, deletePMCollection } from "../../../helpers/location_management_helper"

function* fetchCollections() {
  try {
    const response = yield call(getPMCollections)
    // const originalData = response.data.collections
    // const repeatedData = []

    // while (repeatedData.length < 50) {
    //   for (
    //     let i = 0;
    //     i < originalData.length && repeatedData.length < 50;
    //     i++
    //   ) {
    
    //     const newItem = { ...originalData[i], id: repeatedData.length + 1 }
    //     repeatedData.push(newItem)
    //   }
    // }

    // yield put(getCollectionsSuccess(repeatedData))

    yield put(getCollectionsSuccess(response.data.collections))
  } catch (error) {
    yield put(getCollectionsFail(error))
  }
}

function * fetchCollectionByIdSaga(action) {
  try {
    const response = yield call(getPMCollectionById, { 
      collectionId: action.payload.collectionId, 
      language: action.payload.language })
      console.log("get collection by id response", response);

    yield put(getCollectionByIdSuccess(response.data))
   
  } 
  catch (error) {
    yield put(getCollectionByIdFail(error))
  }
}

function* addCollectionsSaga(action) {
  try {
    // console.log("saga action", action)
    const response = yield call(addPMCollection, {
      cityCode: action.payload.cityCode,
      formData: action.payload.formData,
    })
    // console.log("saga response", response)


    yield put(addCollectionsSuccess(response.data))
    showToastSuccess("Collection added successfully!")
  } catch (error) {
    yield put(addCollectionsFail(error))
     showToastError("Failed to add collection!")
  }
}

function * updateCollectionSaga(action) {
  try {
    const response = yield call(updatePMCollection, {
      collectionId: action.payload.collectionId,
      formData: action.payload.formData
    })
    yield put(updateCollectionSuccess(response.data))
    showToastSuccess("Collection edited successfully!")
  } catch (error) {
    yield put(updateCollectionFail(error))
    showToastSuccess("Failed to edit collection!")
  }
}

function * deleteCollectionSaga(action) {
  try {
    const response = yield call(deletePMCollection, {
      collectionId: action.payload._id
    })
    yield put(deleteCollectionSuccess(response.data))
    showToastSuccess(`${action.payload.displayName} Travel Collection deleted successfully!`)
  } catch (error) {
    yield put(deleteCollectionFail(error))
    showToastError(`${action.payload.displayName}Travel Collection failed to delete!`)
  }
}

export default function* collectionsSaga() {
  yield takeEvery(GET_COLLECTIONS, fetchCollections)
  yield takeEvery(ADD_COLLECTION, addCollectionsSaga)
  yield takeEvery(GET_COLLECTION_BY_ID, fetchCollectionByIdSaga)
  yield takeEvery(UPDATE_COLLECTION, updateCollectionSaga),
  yield takeEvery(DELETE_COLLECTION, deleteCollectionSaga)  
}
