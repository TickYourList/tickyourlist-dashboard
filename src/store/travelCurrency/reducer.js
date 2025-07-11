import { SET_CURRENCY_LIST } from "./types";

const initialState = {
  currencyList: [],
};

const travelCurrency = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENCY_LIST:
      return {
        ...state,
        currencyList: action.payload,
      };
    default:
      return state;
  }
};

export default travelCurrency;


  
  
