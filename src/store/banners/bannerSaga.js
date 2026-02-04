import { all, call, put, takeEvery } from 'redux-saga/effects';
import {
  getBannersSuccess,
  getBannersFailure,
  addBannerSuccess,
  addBannerFail,
  deleteBannersSuccess,
  deleteBannersFailure,
  editBannerSuccess,
  editBannerFailure,
  getBanners as getBannersAction,
} from "./bannerActions";


import {
  getBannerList,
  addNewBanner as addNewBannerAPI,
  deleteBanner as deleteBannerAPI,
  editBanner as editBannerAPI
} from "../../helpers/location_management_helper";

import {
  GET_BANNERS,
  ADD_NEW_BANNER,
  EDIT_BANNER,
  DELETE_BANNER,
} from "./actionTypes"; 

import { showToastSuccess, showToastError } from "helpers/toastBuilder"; 



// Worker: Get Banners
function* getBannersWorker() {
  try {
    const response = yield call(getBannerList);
    yield put(getBannersSuccess(response));
  } catch (error) {
    yield put(getBannersFailure(error.message));
  }
}

// Worker: Add Banner
function* onAddNewBanner({ payload: bannerData }) {
  try {
    const response = yield call(addNewBannerAPI, bannerData);
    yield put(addBannerSuccess(response?.data));
    yield put(getBannersAction());
    showToastSuccess("Banner Added Successfully", "Success");
  } catch (error) {
    yield put(addBannerFail(error));
    showToastError("Banner Failed to Add. Please try again.", "Error");
  }
}

//worker: Edit Banner
function* onEditBanner({ payload: bannerPayload }) {
  try {
    const response = yield call(editBannerAPI, bannerPayload);
    yield put(editBannerSuccess(response?.data));
    yield put(getBannersAction());
    showToastSuccess("Banner Updated Successfully", "Success");
  } catch (error) {
    yield put(editBannerFailure(error));
    showToastError("Banner Failed to Update. Please try again.", "Error");
  }
}


// Worker: Delete Banner
function* deleteBanner({ payload: bannerPayload }) {
  try {
    yield call(deleteBannerAPI, bannerPayload);
    yield put(deleteBannersSuccess(bannerPayload));
    yield put(getBannersAction());

    showToastSuccess("Banner Deleted Successfully", "Success");

  } catch (error) {
    yield put(deleteBannersFailure(error));

     showToastError("Banner Failed to Delete. Please try again.", "Error")
  }
}

export default function* BannerSaga() {
  
  yield all([
    takeEvery(GET_BANNERS, getBannersWorker),
    takeEvery(ADD_NEW_BANNER, onAddNewBanner),
    takeEvery(EDIT_BANNER, onEditBanner),
    takeEvery(DELETE_BANNER, deleteBanner),
  ]);
}
