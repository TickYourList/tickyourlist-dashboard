const { ADD_DEFAULT_PRICING_SUCCESS, ADD_DEFAULT_PRICING_FAIL } = require("./actionTypes");



const INIT_STATE = {
  pricing: [],
  categories: [],
  error: {},
};

const CalendarPricing = (state = INIT_STATE, action) => {
  switch (action.type) {
    case ADD_DEFAULT_PRICING_SUCCESS:
      return {
        ...state,
        pricing: action.payload,
      };

    case ADD_DEFAULT_PRICING_FAIL:
      return {
        ...state,
        error: action.payload,
      };
       default:
      return state;

    }

}

export default CalendarPricing;