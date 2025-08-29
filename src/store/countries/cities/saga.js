import { call, put, takeEvery } from "redux-saga/effects";
import { GET_CITIES, getCitiesSuccess, getCitiesFailure } from "./actions";
import { getCitiesByCountryId } from "../../../helpers/location_management_helper";

function* getCitiesSaga(action) {
    try {
        const response = yield call(getCitiesByCountryId, action.payload);
        let citiesArray = [];
        if (Array.isArray(response)) {
            citiesArray = response;
        } else if (Array.isArray(response.data)) {
            citiesArray = response.data;
        } else if (Array.isArray(response.cities)) {
            citiesArray = response.cities;
        } else if (response && response.data && Array.isArray(response.data.cities)) {
            citiesArray = response.data.cities;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) citiesArray = arr;
        }
        yield put(getCitiesSuccess(citiesArray));
    } catch (error) {
        yield put(getCitiesFailure(error.message));
    }
}

export default function* citiesSaga() {
    yield takeEvery(GET_CITIES, getCitiesSaga);
}