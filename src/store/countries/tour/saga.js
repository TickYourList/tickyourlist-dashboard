import { call, put, takeEvery } from "redux-saga/effects";
import { GET_TOURS, getToursSuccess, getToursFailure } from "./actions";
import { getToursByCountryId } from "../../../helpers/location_management_helper";

function* getToursSaga(action) {
    try {
        const response = yield call(getToursByCountryId, action.payload);
        let toursArray = [];
        if (Array.isArray(response)) {
            toursArray = response;
        } else if (Array.isArray(response.data)) {
            toursArray = response.data;
        } else if (Array.isArray(response.tours)) {
            toursArray = response.tours;
        } else if (response && response.data && Array.isArray(response.data.tours)) {
            toursArray = response.data.tours;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) toursArray = arr;
        }
        yield put(getToursSuccess(toursArray));
    } catch (error) {
        yield put(getToursFailure(error.message));
    }
}

export default function* toursSaga() {
    yield takeEvery(GET_TOURS, getToursSaga);
}