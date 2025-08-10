import{
  GET_COUPONS, ADD_COUPON, UPDATE_COUPON } from './actionTypes';
import { get } from 'helpers/api_helper';

export const getCoupon = (page = 1, limit = 10) => ({
  type: GET_COUPONS,
  payload: { page, limit },
});

export const importCoupons = (coupons) => ({
  type: 'IMPORT_COUPONS',
  payload: coupons,
});

export const addNewCoupon = (coupon) => ({
  type: ADD_COUPON,
  payload: coupon,
});

export const addCouponSuccess = (coupon) => ({
  type: 'ADD_COUPON_SUCCESS',
  payload: coupon,
});

export const addCouponFail = (error) => ({
  type: 'ADD_COUPON_FAIL',
  payload: error,
});

export const updateCoupon = (coupon) => ({
  type: UPDATE_COUPON,
  payload: coupon,
});

export const deleteCoupon = (couponId, couponCode) => ({
  type: 'DELETE_COUPON',
  payload: { couponId, couponCode },
});

export const deleteCouponSuccess = (couponId, couponCode) => ({
  type: 'DELETE_COUPON_SUCCESS',
  payload: { couponId, couponCode },
});

export const deleteCouponFail = (error, couponCode) => ({
  type: 'DELETE_COUPON_FAIL',
  payload: { error, couponCode },
});

export const getCouponUsage = (couponId) => async (dispatch) => {
  try {
    dispatch({ type: 'GET_COUPON_USAGE_LOADING' });
    const response = await get(`/v1/tyltravelcoupon/usage/${couponId}`);
    dispatch({ 
      type: 'GET_COUPON_USAGE_SUCCESS', 
      payload: response 
    });
    return response;
  } catch (error) {
    dispatch({ 
      type: 'GET_COUPON_USAGE_FAIL', 
      payload: error.message || 'Failed to fetch coupon usage data' 
    });
    throw error;
  }
};