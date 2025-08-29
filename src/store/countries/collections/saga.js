import { call, put, takeEvery } from "redux-saga/effects";
import { GET_COUNTRY_COLLECTIONS, getCollectionsSuccess, getCollectionsFailure } from "./actions";
import { getCollectionsByCountryId } from "../../../helpers/location_management_helper";

function* getCollectionsSaga(action) {
    try {
        const response = yield call(getCollectionsByCountryId, action.payload);
        let collectionsArray = [];
        if (Array.isArray(response)) {
            collectionsArray = response;
        } else if (Array.isArray(response.data)) {
            collectionsArray = response.data;
        } else if (Array.isArray(response.collections)) {
            collectionsArray = response.collections;
        } else if (response && response.data && Array.isArray(response.data.collections)) {
            collectionsArray = response.data.collections;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) collectionsArray = arr;
        }
        yield put(getCollectionsSuccess(collectionsArray));
    } catch (error) {
        yield put(getCollectionsFailure(error.message));
    }
}

export default function* collectionsSaga() {
    yield takeEvery(GET_COUNTRY_COLLECTIONS, getCollectionsSaga);
}