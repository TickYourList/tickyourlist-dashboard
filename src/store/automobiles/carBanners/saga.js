import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_BANNER, GET_CAR_BANNER } from "./actionTypes"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { addCarBannerImage, getCarBannerImage } from "helpers/automobile_helper_apis"
import { addCarBannerFail, addCarBannerSuccess } from "./action"


function* fetchCarBanner() {
  try {
    const response = yield call(getCarBannerImage)
    yield put(getCarBannerSuccess(response.data.carBlogsList))
  } catch (error) {
    yield put(getCarBannerFail(error))
  }
}

function* onAddCarBanner({ payload: data }) {
  try {
    const response = yield call(addCarBannerImage, data)
    yield put(addCarBannerSuccess(response.data))
    showToastSuccess("Blog is created Successfully","Success");
  } catch (error) {
    yield put(addCarBannerFail(error))
    showToastError("Blog Failed to create","Error");
  }
}

function* CarBannerSaga() {
  yield takeEvery(GET_CAR_BANNER, fetchCarBanner);
  yield takeEvery(ADD_NEW_CAR_BANNER, onAddCarBanner);
}

export default CarBannerSaga;
