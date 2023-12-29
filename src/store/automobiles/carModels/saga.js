import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_MODEL, DELETE_ALL_CAR_MODEL, DELETE_CAR_MODEL, GET_CAR_MODELS, GET_CAR_VARIANTS_FROM_CARMODEL, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_MODEL } from "./actionTypes"
import { addCarModelFail, addCarModelSuccess, deleteAllCarModelsFail, deleteAllCarModelsSuccess, deleteCarModel, deleteCarModelFail, deleteCarModelSuccess, getCarModelsFail, getCarModelsSuccess, getCarVariantsFromModelFail, getCarVariantsFromModelSuccess, getCountriesListError, getCountriesListSuccess, updateCarModel, updateCarModelFail, updateCarModelSuccess } from "./actions"
import { addCarModel, deleteAllCarModels, deleteCarModelData, fetchCountriesListData, getCarModelsList, getCarVariantsListFromCarModel, updateCarModelData } from "helpers/automobile_helper_apis"


function* fetchCarModels() {
  try {
    const response = yield call(getCarModelsList)
    yield put(getCarModelsSuccess(response.data.carModelsList))
  } catch (error) {
    yield put(getCarModelsFail(error))
  }
}

function* onAddCarModel({ payload: {id , data } }) {
  try {
    const response = yield call(addCarModel, id, data)
    yield put(addCarModelSuccess(response.data))
  } catch (error) {
    yield put(addCarModelFail(error))
  }
}

function* onUpdateCarModel({ payload: { carModelId, id, data } }) {
  try {
    const response = yield call(updateCarModelData, carModelId, id, data )
    yield put(updateCarModelSuccess(id))
  } catch (error) {
    yield put(updateCarModelFail(error))
  }
}

function* onDeleteCarModel({ payload: carModel  }) {
  try {
    const response = yield call(deleteCarModelData, carModel._id );
    yield put(deleteCarModelSuccess(carModel))
  } catch (error) {
    yield put(deleteCarModelFail(error))
  }
}

function* onDeleteAllCarModel() {
    try {
      const response = yield call(deleteAllCarModels)
      yield put(deleteAllCarModelsSuccess(response))
    } catch (error) {
      yield put(deleteAllCarModelsFail(error))
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

  function* fetchCarVariantsFromCarModel({ payload: id }) {
    try {
      console.log('payloadcheck ', id);
      const response = yield call(getCarVariantsListFromCarModel, id)
      yield put(getCarVariantsFromModelSuccess(response.data.carVariantList))
    } catch (error) {
      yield put(getCarVariantsFromModelFail(error))
    }
  }

function* carModelSaga() {
  yield takeEvery(GET_CAR_MODELS, fetchCarModels);
  yield takeEvery(ADD_NEW_CAR_MODEL, onAddCarModel);
  yield takeEvery(UPDATE_CAR_MODEL, onUpdateCarModel);
  yield takeEvery(DELETE_CAR_MODEL, onDeleteCarModel);
  yield takeEvery(DELETE_ALL_CAR_MODEL, onDeleteAllCarModel);
  yield takeEvery(GET_COUNTRIES_LIST, fetchCountriesList);
  yield takeEvery(GET_CAR_VARIANTS_FROM_CARMODEL, fetchCarVariantsFromCarModel);
}

export default carModelSaga;
