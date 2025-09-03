
import { put, takeEvery,call } from "redux-saga/effects"
import { addDefaultPricingFail, addDefaultPricingSuccess } from "./actions"
import { ADD_DEFAULT_PRICING } from "./actionTypes"
import { onAddDefaultCalendarPricing } from "helpers/location_management_helper"; 


function* addDefaultPricing(action) {
  try {
    const response = yield call(onAddDefaultCalendarPricing, action.payload);
    yield put(addDefaultPricingSuccess(response));
  } catch (error) {
    yield put(addDefaultPricingFail(error));
  }
}



function* calendarPricingSaga() {
  yield takeEvery(ADD_DEFAULT_PRICING, addDefaultPricing)

}

export default calendarPricingSaga
