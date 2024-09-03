import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_BANNER, GET_CAR_BANNER } from "./actionTypes"
import { addCarBlogFail } from "./actions"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { addCarBannerSuccess, getCarBannerFail, getCarBannerSuccess } from "./action"
import { addCarBannerImage, getCarBannerImage } from "helpers/automobile_helper_apis"


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
    yield put(addCarBlogSuccess(response.data))
    showToastSuccess("Blog is created Successfully","Success");
  } catch (error) {
    yield put(addCarBlogFail(error))
    showToastError("Blog Failed to create","Error");
  }
}

function* carBlogSaga() {
  yield takeEvery(GET_CAR_BANNER, fetchCarBanner);
  yield takeEvery(ADD_NEW_CAR_BANNER, onAddCarBanner);
}

export default carBlogSaga;
