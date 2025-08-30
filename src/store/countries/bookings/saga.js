import { call, put, takeEvery } from "redux-saga/effects";
import { GET_BOOKINGS, getBookingsSuccess, getBookingsFailure, appendBookingsSuccess } from "./actions";
import { getBookingByCountryId } from "../../../helpers/location_management_helper";

function* getBookingsSaga(action) {
    try {
        const { countryId, page, limit, append } = action.payload;
        const response = yield call(getBookingByCountryId, countryId, { page, limit });
        let bookingsArray = [];
        if (Array.isArray(response)) {
            bookingsArray = response;
        } else if (Array.isArray(response.data)) {
            bookingsArray = response.data;
        } else if (Array.isArray(response.bookings)) {
            bookingsArray = response.bookings;
        } else if (response && response.data && Array.isArray(response.data.bookings)) {
            bookingsArray = response.data.bookings;
        } else if (response && typeof response === 'object') {
            const arr = Object.values(response).find(v => Array.isArray(v));
            if (arr) bookingsArray = arr;
        }
        if (append) {
            yield put(appendBookingsSuccess(bookingsArray));
        } else {
            yield put(getBookingsSuccess(bookingsArray));
        }
    } catch (error) {
        yield put(getBookingsFailure(error.message));
    }
}

export default function* bookingsSaga() {
    yield takeEvery(GET_BOOKINGS, getBookingsSaga);
}