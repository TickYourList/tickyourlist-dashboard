import { takeEvery, put, call } from "redux-saga/effects"

import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { addTravelPartner, getTravelPartnerList,updateTravelPartner,deleteTravelPartner } from "../../helpers/location_management_helper"
import { addTravelPartnerFail, addTravelPartnerSuccess, deleteTravelPartnerFail, deleteTravelPartnerSuccess, getTravelPartner, getTravelPartnerFail, getTravelPartnerSuccess, updateTravelPartnerFail, updateTravelPartnerSuccess,} from "./actions";
import { ADD_NEW_TRAVEL_PARTNER, DELETE_TRAVEL_PARTNER, GET_TRAVEL_PARTNERS, UPDATE_TRAVEL_PARTNER } from "./actionsType";


function* fetchTravelPartners(action) {
  try {
    const { page, limit } = action.payload  || { page: 1, limit: 10 };
    const response = yield call(getTravelPartnerList, page, limit);
    yield put(getTravelPartnerSuccess(response.data));
  } catch (error) {
    yield put(getTravelPartnerFail(error));
  }
}



function* onAddTravelPartner({ payload: data }) {
  try {
    const response = yield call(addTravelPartner, data);
    yield put(addTravelPartnerSuccess(response.data));
    showToastSuccess("Travel Partner Added Successfully.", "Success");
  } catch (error) {
    yield put(addTravelPartnerFail(error));
    showToastError("Travel Partner Failed to Add. Please try again.", "Error");
  }
}


function* onUpdateTravelPartner({ payload: { id, data } }) {
  try {
    const response = yield call(updateTravelPartner, id, data );
    yield put(updateTravelPartnerSuccess(response.data));
    showToastSuccess("Travel Partner Updated Successfully.","Success");
  } catch (error) {
    yield put(updateTravelPartnerFail(error))
    showToastError("Travel Partner Failed to Update. Please try again.","Error");
  }
}

function* onDeleteTravelPartner({ payload: travelPartner  }) {
  try {
    const response = yield call(deleteTravelPartner, travelPartner._id );
    yield put(deleteTravelPartnerSuccess(travelPartner))
    showToastSuccess(`Travel Partner ${travelPartner.name} Deleted Successfully.`,"Success");
  } catch (error) {
    yield put(deleteTravelPartnerFail(error))
    showToastError("Travel Partner Failed to Delete. Please try again.","Error");
  }
}

function* TravelPartnerSaga() {
  yield takeEvery(GET_TRAVEL_PARTNERS, fetchTravelPartners);
  yield takeEvery(ADD_NEW_TRAVEL_PARTNER, onAddTravelPartner);
  yield takeEvery(UPDATE_TRAVEL_PARTNER, onUpdateTravelPartner);
  yield takeEvery(DELETE_TRAVEL_PARTNER, onDeleteTravelPartner);
}

export default TravelPartnerSaga;
