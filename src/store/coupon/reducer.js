import { GET_COUPONS, ADD_COUPON, UPDATE_COUPON } from './actionTypes';

const INIT_STATE = {
  coupons: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  // Coupon usage data
  usageData: null,
  usageLoading: false,
  usageError: null,
};

const Coupon = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_COUPONS:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'GET_COUPONS_SUCCESS':
      return {
        ...state,
        coupons: action.payload.coupons,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        loading: false,
        error: null,
      };
    case 'GET_COUPONS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case ADD_COUPON:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ADD_COUPON_SUCCESS':
      return {
        ...state,
        coupons: [action.payload, ...state.coupons],
        loading: false,
        error: null,
      };
    case 'ADD_COUPON_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'IMPORT_COUPONS':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'IMPORT_COUPONS_SUCCESS':
      return {
        ...state,
        coupons: [...action.payload, ...state.coupons],
        loading: false,
        error: null,
      };
    case 'IMPORT_COUPONS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_COUPON_SUCCESS':
      return {
        ...state,
        coupons: state.coupons.map(c => c._id === action.payload._id ? action.payload : c),
        loading: false,
        error: null,
      };
    case 'UPDATE_COUPON_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'DELETE_COUPON':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'DELETE_COUPON_SUCCESS':
      return {
        ...state,
        coupons: state.coupons.filter(c => c._id !== action.payload.couponId),
        loading: false,
        error: null,
      };
    case 'DELETE_COUPON_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    // Coupon usage actions
    case 'GET_COUPON_USAGE_LOADING':
      return {
        ...state,
        usageLoading: true,
        usageError: null,
      };
    case 'GET_COUPON_USAGE_SUCCESS':
      return {
        ...state,
        usageData: action.payload,
        usageLoading: false,
        usageError: null,
      };
    case 'GET_COUPON_USAGE_FAIL':
      return {
        ...state,
        usageLoading: false,
        usageError: action.payload,
      };
    default:
      return state;
  }
};

export default Coupon;