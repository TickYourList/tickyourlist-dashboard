import { call, put, takeEvery, all, fork } from 'redux-saga/effects';
import { GET_COUPONS, ADD_COUPON, UPDATE_COUPON, DELETE_COUPON } from './actionTypes';
import { getCouponList, addCoupon as addCouponApi, importCoupons as importCouponsApi, updateCoupon as updateCouponApi, deleteCoupon as deleteCouponApi } from '../../helpers/location_management_helper';
import { addCouponSuccess, addCouponFail, deleteCouponSuccess, deleteCouponFail } from './actions';

function* fetchCoupons(action) {
  try {
    const { page = 1, limit = 10 } = action.payload || {};
    const response = yield call(getCouponList, page, limit);
    yield put({ type: 'GET_COUPONS_SUCCESS', payload: response.data });
  } catch (error) {
    yield put({ type: 'GET_COUPONS_FAIL', payload: error });
  }
}

function* addCouponSaga(action) {
  try {
    const response = yield call(addCouponApi, action.payload);
    // Fix: Extract coupon from response.data or response.data.data
    let coupon = response.data?.coupon || response.data;
    if (response.data && response.data.data) {
      coupon = response.data.data;
    }
    yield put(addCouponSuccess(coupon));
  } catch (error) {
    yield put(addCouponFail(error));
  }
}

function* importCouponsSaga(action) {
  try {
    const response = yield call(importCouponsApi, action.payload);
    yield put({ type: 'IMPORT_COUPONS_SUCCESS', payload: response });
  } catch (error) {
    yield put({ type: 'IMPORT_COUPONS_FAIL', payload: error });
  }
}

function* updateCouponSaga(action) {
  try {
    const response = yield call(updateCouponApi, action.payload);
    // You may want to dispatch a success action or refetch coupons
    yield put({ type: 'UPDATE_COUPON_SUCCESS', payload: response.data });
  } catch (error) {
    yield put({ type: 'UPDATE_COUPON_FAIL', payload: error });
  }
}

function* deleteCouponSaga(action) {
  try {
    const { couponId, couponCode } = action.payload;
    yield call(deleteCouponApi, couponId);
    yield put(deleteCouponSuccess(couponId, couponCode));
    // Show success notification
    if (window && window.toast) {
      window.toast.success(`${couponCode} Coupon deleted successfully`);
    }
  } catch (error) {
    const { couponCode } = action.payload;
    yield put(deleteCouponFail(error, couponCode));
    // Show error notification
    if (window && window.toast) {
      window.toast.error(`${couponCode} Coupon failed to delete.`);
    }
  }
}

function* watchGetCoupons() {
  yield takeEvery(GET_COUPONS, fetchCoupons);
}

function* watchAddCoupon() {
  yield takeEvery(ADD_COUPON, addCouponSaga);
}

function* watchImportCoupons() {
  yield takeEvery('IMPORT_COUPONS', importCouponsSaga);
}

function* watchUpdateCoupon() {
  yield takeEvery(UPDATE_COUPON, updateCouponSaga);
}

function* watchDeleteCoupon() {
  yield takeEvery(DELETE_COUPON, deleteCouponSaga);
}

export default function* couponSaga() {
  yield all([
    fork(watchGetCoupons),
    fork(watchAddCoupon),
    fork(watchImportCoupons),
    fork(watchUpdateCoupon),
    fork(watchDeleteCoupon),
  ]);
}