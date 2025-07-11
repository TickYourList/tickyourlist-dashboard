import { GET_CURRENCY_LIST, SET_CURRENCY_LIST } from "./types";


export const getCurrencyList = () => ({
  type: GET_CURRENCY_LIST,
});

export const setCurrencyList = (data) => ({
  type: SET_CURRENCY_LIST,
  payload: data,
});
