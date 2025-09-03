import { all, call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  getCitiesSuccess,
  getCitiesFailure,
} from "./sectionActions";


import {
  getCitiesList,
} from "helpers/location_management_helper";

import {
  GET_CITIES,
} from "./actionTypes"; 

import { showToastSuccess, showToastError } from "helpers/toastBuilder"; 



// Worker: Get Section Banners
function* getCities() {
  try {
    const response = yield call(getCitiesList);
    yield put(getCitiesSuccess(response));
  } catch (error) {
    yield put(getCitiesFailure(error.message));
  }
}

export default function* CitySaga() {
  
  yield all([
    takeEvery(GET_CITIES, getCities),
  ]);
}
