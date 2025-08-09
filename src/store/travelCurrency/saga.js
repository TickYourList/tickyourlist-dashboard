import { call, put, takeEvery } from "redux-saga/effects";
import { GET_CURRENCY_LIST, SET_CURRENCY_LIST } from "./types";
import { getTravelCurrencyListAPI } from "../../helpers/backend_helper";
function* fetchCurrencyList() {
    try {
      const response = yield call(getTravelCurrencyListAPI);
      console.log(" API Response:", response); 
      yield put({ type: SET_CURRENCY_LIST, payload: response.data.travelCurrencyList });
    } catch (error) {
      console.error("Currency API failed:", error);
    }
  }
  

function* currencySaga() {
  yield takeEvery(GET_CURRENCY_LIST, fetchCurrencyList);
}

export default currencySaga;



  
