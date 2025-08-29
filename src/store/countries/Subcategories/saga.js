import { call, put, takeEvery } from "redux-saga/effects";
import { GET_SUBCATEGORIES, getSubcategoriesSuccess, getSubcategoriesFailure } from "./actions";
import { getSubcategoriesByCountryId } from "../../../helpers/location_management_helper";

function* getSubcategoriesSaga(action) {
    try {
        const response = yield call(getSubcategoriesByCountryId, action.payload);
        let subcategoriesArray = [];
        if (Array.isArray(response)) {
            subcategoriesArray = response;
        } else if (Array.isArray(response.data)) {
            subcategoriesArray = response.data;
        } else if (Array.isArray(response.subcategories)) {
            subcategoriesArray = response.subcategories;
        } else if (response && response.data && Array.isArray(response.data.subcategories)) {
            subcategoriesArray = response.data.subcategories;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) subcategoriesArray = arr;
        }
        yield put(getSubcategoriesSuccess(subcategoriesArray));
    } catch (error) {
        yield put(getSubcategoriesFailure(error.message));
    }
}

export default function* subcategoriesSaga() {
    yield takeEvery(GET_SUBCATEGORIES, getSubcategoriesSaga);
}