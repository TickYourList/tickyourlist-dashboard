import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_DEALER, DELETE_ALL_CAR_DEALER, DELETE_CAR_DEALER, GET_CAR_DEALERS, GET_COUNTRIES_LIST, UPDATE_CAR_DEALER } from "./actionTypes"
import { addCarDealerFail, addCarDealerSuccess, deleteAllCarDealersFail, deleteAllCarDealersSuccess, deleteCarDealerFail, deleteCarDealerSuccess, getCarDealersFail, getCarDealersSuccess, updateCarDealerFail, updateCarDealerSuccess } from "./actions"
import { addCarDealer, deleteAllCarDealers, deleteCarDealerData, getCarDealersList, updateCarDealerData } from "helpers/automobile_helper_apis"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"


function* fetchCarDealers() {
  try {
    const response = yield call(getCarDealersList)
    yield put(getCarDealersSuccess(response.data.carDealersList))
  } catch (error) {
    yield put(getCarDealersFail(error))
  }
}

function* onAddCarDealer({ payload: {data } }) {
  try {
    const response = yield call(addCarDealer, data)
    yield put(addCarDealerSuccess(response.data))
    showToastSuccess("Car Model Added Successfully.","Success");
  } catch (error) { 
    yield put(addCarDealerFail(error))
    showToastError("Car Model Failed to Add. Please try again.","Error")
  }
}

function* onUpdateCarDealer({ payload: { id, data } }) {
  try {
    const response = yield call(updateCarDealerData, id, data )
    yield put(updateCarDealerSuccess(id, response.data))
    showToastSuccess("Car Model Updated Successfully.","Success");
  } catch (error) {
    yield put(updateCarDealerFail(error))
    showToastError("Car Model Failed to Update. Please try again.","Error")
  }
}

function* onDeleteCarDealer({ payload: carDealer  }) {
  try {
    const response = yield call(deleteCarDealerData, carDealer._id );
    yield put(deleteCarDealerSuccess(carDealer))
    showToastSuccess("Car Model Deleted Successfully.","Success");
  } catch (error) {
    yield put(deleteCarDealerFail(error))
    showToastError("Car Model Failed to Delete. Please try again.","Error")
  }
}

function* onDeleteAllCarDealer() {
    try {
      const response = yield call(deleteAllCarDealers)
      yield put(deleteAllCarDealersSuccess(response))
      showToastSuccess("Car Models Deleted Successfully.","Success");
    } catch (error) {
      yield put(deleteAllCarDealersFail(error))
      showToastError("Car Models Failed to Delete. Please try again.","Error")
    }
  }

function* carDealerSaga() {
  yield takeEvery(GET_CAR_DEALERS, fetchCarDealers);
  yield takeEvery(ADD_NEW_CAR_DEALER, onAddCarDealer); 
  yield takeEvery(UPDATE_CAR_DEALER, onUpdateCarDealer);
  yield takeEvery(DELETE_CAR_DEALER, onDeleteCarDealer);
  yield takeEvery(DELETE_ALL_CAR_DEALER, onDeleteAllCarDealer);
}

export default carDealerSaga;
