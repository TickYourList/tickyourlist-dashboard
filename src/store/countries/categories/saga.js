import { call, put, takeEvery } from "redux-saga/effects";
import { GET_CATEGORIES, getCategoriesSuccess, getCategoriesFailure } from "./actions";
import { getCategoriesByCountryId } from "../../../helpers/location_management_helper";

function* getCategoriesSaga(action) {
    try {
        const response = yield call(getCategoriesByCountryId, action.payload);
        let categoriesArray = [];
        if (Array.isArray(response)) {
            categoriesArray = response;
        } else if (Array.isArray(response.data)) {
            categoriesArray = response.data;
        } else if (Array.isArray(response.categories)) {
            categoriesArray = response.categories;
        } else if (response && response.data && Array.isArray(response.data.categories)) {
            categoriesArray = response.data.categories;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) categoriesArray = arr;
        }
        yield put(getCategoriesSuccess(categoriesArray));
    } catch (error) {
        yield put(getCategoriesFailure(error.message));
    }
}

export default function* categoriesSaga() {
    yield takeEvery(GET_CATEGORIES, getCategoriesSaga);
}