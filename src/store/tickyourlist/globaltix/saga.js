import { call, put, takeLatest } from "redux-saga/effects";
import {
  FETCH_GLOBALTIX_PRODUCTS_REQUEST,
  SEARCH_GLOBALTIX_PRODUCTS_REQUEST,
  FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST,
  LINK_GLOBALTIX_PRODUCT_REQUEST,
  GLOBALTIX_SYNC_FULL_REQUEST,
  GLOBALTIX_SYNC_PRODUCT_REQUEST,
  FETCH_GLOBALTIX_BOOKINGS_REQUEST,
  FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST,
  CANCEL_GLOBALTIX_BOOKING_REQUEST,
  FETCH_GLOBALTIX_TOKEN_REQUEST,
  AUTHENTICATE_GLOBALTIX_REQUEST,
} from "./actionTypes";
import {
  fetchGlobtixProductsSuccess,
  fetchGlobtixProductsFailure,
  searchGlobtixProductsSuccess,
  searchGlobtixProductsFailure,
  fetchGlobtixProductDetailSuccess,
  fetchGlobtixProductDetailFailure,
  linkGlobtixProductSuccess,
  linkGlobtixProductFailure,
  globaltixSyncFullSuccess,
  globaltixSyncFullFailure,
  globaltixSyncProductSuccess,
  globaltixSyncProductFailure,
  fetchGlobtixBookingsSuccess,
  fetchGlobtixBookingsFailure,
  fetchGlobtixBookingDetailSuccess,
  fetchGlobtixBookingDetailFailure,
  cancelGlobtixBookingSuccess,
  cancelGlobtixBookingFailure,
  fetchGlobtixTokenSuccess,
  fetchGlobtixTokenFailure,
  authenticateGlobtixSuccess,
  authenticateGlobtixFailure,
} from "./action";
import {
  getGlobtixProducts,
  searchGlobtixProducts,
  getGlobtixProductDetail,
  linkGlobtixProduct,
  globaltixSyncFull,
  globaltixSyncProduct,
  getGlobtixBookings,
  getGlobtixBookingDetail,
  cancelGlobtixBooking,
  getGlobtixToken,
  authenticateGlobtix,
} from "helpers/globaltix_helper";

function* fetchGlobtixProductsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixProducts, payload);
    yield put(fetchGlobtixProductsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixProductsFailure(error.message));
  }
}

function* searchGlobtixProductsSaga({ payload }) {
  try {
    const response = yield call(searchGlobtixProducts, payload.query, payload.environment);
    yield put(searchGlobtixProductsSuccess(response));
  } catch (error) {
    yield put(searchGlobtixProductsFailure(error.message));
  }
}

function* fetchGlobtixProductDetailSaga({ payload }) {
  try {
    const response = yield call(getGlobtixProductDetail, payload.productId, payload.environment);
    yield put(fetchGlobtixProductDetailSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixProductDetailFailure(error.message));
  }
}

function* linkGlobtixProductSaga({ payload }) {
  try {
    const response = yield call(linkGlobtixProduct, payload.globaltixProductId, payload.tourGroupId, payload.environment);
    yield put(linkGlobtixProductSuccess(response));
  } catch (error) {
    yield put(linkGlobtixProductFailure(error.message));
  }
}

function* globaltixSyncFullSaga({ payload }) {
  try {
    const response = yield call(globaltixSyncFull, payload.environment);
    yield put(globaltixSyncFullSuccess(response));
  } catch (error) {
    yield put(globaltixSyncFullFailure(error.message));
  }
}

function* globaltixSyncProductSaga({ payload }) {
  try {
    const response = yield call(globaltixSyncProduct, payload.globaltixProductId, payload.environment);
    yield put(globaltixSyncProductSuccess(response));
  } catch (error) {
    yield put(globaltixSyncProductFailure(error.message));
  }
}

function* fetchGlobtixBookingsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixBookings, payload);
    yield put(fetchGlobtixBookingsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixBookingsFailure(error.message));
  }
}

function* fetchGlobtixBookingDetailSaga({ payload }) {
  try {
    const response = yield call(getGlobtixBookingDetail, payload.referenceNumber);
    yield put(fetchGlobtixBookingDetailSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixBookingDetailFailure(error.message));
  }
}

function* cancelGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(cancelGlobtixBooking, payload.referenceNumber, payload.environment, payload.reason);
    yield put(cancelGlobtixBookingSuccess(response));
  } catch (error) {
    yield put(cancelGlobtixBookingFailure(error.message));
  }
}

function* fetchGlobtixTokenSaga({ payload }) {
  try {
    const response = yield call(getGlobtixToken, payload.environment);
    yield put(fetchGlobtixTokenSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixTokenFailure(error.message));
  }
}

function* authenticateGlobtixSaga({ payload }) {
  try {
    const response = yield call(authenticateGlobtix, payload.environment);
    yield put(authenticateGlobtixSuccess(response));
  } catch (error) {
    yield put(authenticateGlobtixFailure(error.message));
  }
}

function* globaltixSaga() {
  yield takeLatest(FETCH_GLOBALTIX_PRODUCTS_REQUEST, fetchGlobtixProductsSaga);
  yield takeLatest(SEARCH_GLOBALTIX_PRODUCTS_REQUEST, searchGlobtixProductsSaga);
  yield takeLatest(FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST, fetchGlobtixProductDetailSaga);
  yield takeLatest(LINK_GLOBALTIX_PRODUCT_REQUEST, linkGlobtixProductSaga);
  yield takeLatest(GLOBALTIX_SYNC_FULL_REQUEST, globaltixSyncFullSaga);
  yield takeLatest(GLOBALTIX_SYNC_PRODUCT_REQUEST, globaltixSyncProductSaga);
  yield takeLatest(FETCH_GLOBALTIX_BOOKINGS_REQUEST, fetchGlobtixBookingsSaga);
  yield takeLatest(FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST, fetchGlobtixBookingDetailSaga);
  yield takeLatest(CANCEL_GLOBALTIX_BOOKING_REQUEST, cancelGlobtixBookingSaga);
  yield takeLatest(FETCH_GLOBALTIX_TOKEN_REQUEST, fetchGlobtixTokenSaga);
  yield takeLatest(AUTHENTICATE_GLOBALTIX_REQUEST, authenticateGlobtixSaga);
}

export default globaltixSaga;
