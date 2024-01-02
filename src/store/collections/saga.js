import { call, put, takeEvery } from "redux-saga/effects";

// Collection Redux States
import {
  GET_COLLECTIONS,
  ADD_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
} from "./actionTypes";
import {
  getCollectionsSuccess,
  getCollectionsFail,
  updateCollectionSuccess,
  updateCollectionFail,
  deleteCollectionSuccess,
  deleteCollectionFail,
  addCollectionSuccess,
  addCollectionFail,
} from "./action";

import {
  getCollections,
  updateCollection,
  deleteCollection,
  addCollection,
  getProductList,
} from "helpers/backend_helper";
import { showToastError, showToastSuccess } from "helpers/toastBuilder";
import { getCarModelsList } from "helpers/automobile_helper_apis";

function* fetchCollections() {
  try {
    const products = yield call(getProductList);
    const carModels = yield call(getCarModelsList);
    const response = yield call(getCollections);
    yield put(
      getCollectionsSuccess([
        {
          name: "All Products",
          _id: "all-products",
          icon: "ballot",
          color: "#7A8D96",
          products: products.data.products.map(product => product._id),
          carModels: carModels.data.carModelsList
        },
        ...response.data,
      ])
    );
  } catch (error) {
    yield put(getCollectionsFail);
  }
}

function* onUpdateCollection({ payload: { collection, history } }) {
  try {
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    console.log('collections ', collection.getAll('carModels[]'));
    const response = yield call(updateCollection, collection, config);
    yield put(updateCollectionSuccess(response.data));
    showToastSuccess("Collection Updated successfully", "Success");
    history("/automobile-collections");
  } catch (error) {
    yield put(updateCollectionFail(error));
    showToastError("Sorry! Failed to update the collection", "Error");
  }
}

function* onDeleteCollection({ payload: { collectionId, history } }) {
  try {
    const response = yield call(deleteCollection, collectionId);
    yield put(deleteCollectionSuccess(collectionId));
    if(history) {
      history("/ecommerce-collections");
    }
    showToastSuccess("Collection Deleted successfully", "Success");
  } catch (error) {
    yield put(deleteCollectionFail(error));
    history("/ecommerce-collections");
    showToastError("Sorry! Failed to delete the collection", "Error");
  }
}

function* onAddCollection({ payload: { collection, history, url } }) {
  try {
    console.log('url ',url);
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    console.log('onAddCollectyioncalled ', collection, history);
    const response = yield call(addCollection, collection, config);
    yield put(addCollectionSuccess(response));
    showToastSuccess("Collection Added successfully", "Success");
    history(url);
  } catch (error) {
    yield put(addCollectionFail(error));
    showToastError("Sorry! Failed to Add the collection", "Error");
  }
}

function* collectionSaga() {
  yield takeEvery(ADD_COLLECTION, onAddCollection);
  yield takeEvery(GET_COLLECTIONS, fetchCollections);
  yield takeEvery(UPDATE_COLLECTION, onUpdateCollection);
  yield takeEvery(DELETE_COLLECTION, onDeleteCollection);
}

export default collectionSaga;
