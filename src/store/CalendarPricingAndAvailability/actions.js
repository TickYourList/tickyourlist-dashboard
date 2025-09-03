import { ADD_DEFAULT_PRICING, ADD_DEFAULT_PRICING_FAIL, ADD_DEFAULT_PRICING_SUCCESS } from "./actionTypes";

export const addDefaultPricing = (data) => ({
  type: ADD_DEFAULT_PRICING,
  payload:data
});

export const addDefaultPricingSuccess = data => ({
  type: ADD_DEFAULT_PRICING_SUCCESS,
  payload: data,
});

export const addDefaultPricingFail = error => ({
  type: ADD_DEFAULT_PRICING_FAIL,
  payload: error,
});