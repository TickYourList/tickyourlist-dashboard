import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_BLOG, DELETE_ALL_CAR_BLOG, DELETE_CAR_BLOG, GET_CAR_BLOGS, GET_CAR_MODEL_BY_BRAND, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BLOG } from "./actionTypes"
import { addCarBlogFail, addCarBlogSuccess, deleteAllCarBlogsFail, deleteAllCarBlogsSuccess, deleteCarBlog, deleteCarBlogFail, deleteCarBlogSuccess, getCarBlogsFail, getCarBlogsSuccess, getCarModelsByBrandFailed, getCarModelsByBrandSuccess, getCountriesListError, getCountriesListSuccess, updateCarBlog, updateCarBlogFail, updateCarBlogSuccess } from "./actions"
import { addCarBlog, deleteAllCarBlogs, deleteCarBlogData, fetchCarModelByBrand, fetchCountriesListData, getCarBlogsList, updateCarBlogData } from "helpers/automobile_helper_apis"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"


function* fetchCarBlogs() {
  try {
    const response = yield call(getCarBlogsList)
    yield put(getCarBlogsSuccess(response.data.carBlogsList))
  } catch (error) {
    yield put(getCarBlogsFail(error))
  }
}

function* onAddCarBlog({ payload: data }) {
  try {
    console.log('data ', data);
    const response = yield call(addCarBlog, data)
    yield put(addCarBlogSuccess(response.data))
    showToastSuccess("Blog is created Successfully","Success");
  } catch (error) {
    yield put(addCarBlogFail(error))
    showToastError("Blog Failed to create","Error");
  }
}

function* onUpdateCarBlog({ payload: { id, data } }) {
  try {
    const response = yield call(updateCarBlogData, id, data );
    yield put(updateCarBlogSuccess(response.data));
    showToastSuccess("Blog is updated Successfully","Success");
  } catch (error) {
    yield put(updateCarBlogFail(error))
    showToastError("Blog Failed to updated","Error");
  }
}

function* onDeleteCarBlog({ payload: carBlog  }) {
  try {
    const response = yield call(deleteCarBlogData, carBlog._id );
    yield put(deleteCarBlogSuccess(carBlog))
    showToastSuccess("Blog is deleted Successfully","Success");
  } catch (error) {
    yield put(deleteCarBlogFail(error))
    showToastError("Blog Failed to delete","Error");
  }
}

function* onDeleteAllCarBlog() {
    try {
      const response = yield call(deleteAllCarBlogs)
      yield put(deleteAllCarBlogsSuccess(response))
      showToastSuccess("All Blogs deleted Successfully","Success");
    } catch (error) {
      yield put(deleteAllCarBlogsFail(error))
      showToastError("Blogs Failed to delete","Error");
    }
  }

  function* fetchCountriesList() {
    try {
      const response = yield call(fetchCountriesListData);
      yield put(getCountriesListSuccess(response.data));
    }catch(error) {
      yield put(getCountriesListError(error));
    }
  }

  function* fetchCarModelByBrandData({ payload: { id } }) {
    try {
      const response = yield call(fetchCarModelByBrand, id );
      yield put(getCarModelsByBrandSuccess(response.data.carModelsList));
    } catch (error) {
      yield put(getCarModelsByBrandFailed(error))
    }
  }

function* carBlogSaga() {
  yield takeEvery(GET_CAR_BLOGS, fetchCarBlogs);
  yield takeEvery(ADD_NEW_CAR_BLOG, onAddCarBlog);
  yield takeEvery(UPDATE_CAR_BLOG, onUpdateCarBlog);
  yield takeEvery(DELETE_CAR_BLOG, onDeleteCarBlog);
  yield takeEvery(DELETE_ALL_CAR_BLOG, onDeleteAllCarBlog);
  yield takeEvery(GET_COUNTRIES_LIST, fetchCountriesList);
  yield takeEvery(GET_CAR_MODEL_BY_BRAND, fetchCarModelByBrandData);
}

export default carBlogSaga;
