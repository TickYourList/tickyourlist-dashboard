import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_NEW_CAR_CUSTOMER, DELETE_ALL_CAR_CUSTOMER, DELETE_CAR_CUSTOMER, GET_CAR_CUSTOMERS, GET_CAR_MODEL_BY_BRAND, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_CUSTOMER } from "./actionTypes"
import { addCarCustomerFail, addCarCustomerSuccess, deleteAllCarCustomersFail, deleteAllCarCustomersSuccess, deleteCarCustomer, deleteCarCustomerFail, deleteCarCustomerSuccess, getCarCustomersFail, getCarCustomersSuccess, getCountriesListError, getCountriesListSuccess, updateCarCustomerFail, updateCarCustomerSuccess } from "./actions"
import { addCarCustomer, deleteAllCarCustomers, deleteCarCustomerData, fetchCarModelByBrand, fetchCountriesListData, getCarCustomersList, updateCarCustomerData } from "helpers/automobile_helper_apis"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"


function* fetchCarCustomers() {
  try {
    console.log('dssdsasa');
    const response = yield call(getCarCustomersList)
    yield put(getCarCustomersSuccess(response.data.carCustomersList))
  } catch (error) {
    yield put(getCarCustomersFail(error))
  }
}

function* onAddCarCustomer({ payload: data }) {
  try {
    const response = yield call(addCarCustomer, data)
    yield put(addCarCustomerSuccess(response.data))
    showToastSuccess("Customer is created Successfully","Success");
  } catch (error) {
    yield put(addCarCustomerFail(error))
    showToastError("Customer Failed to create","Error");
  }
}

function* onUpdateCarCustomer({ payload: { id, data } }) {
  try {
    const response = yield call(updateCarCustomerData, id, data );
    yield put(updateCarCustomerSuccess(response.data));
    showToastSuccess("Customer is updated Successfully","Success");
  } catch (error) {
    yield put(updateCarCustomerFail(error))
    showToastError("Customer Failed to updated","Error");
  }
}

function* onDeleteCarCustomer({ payload: carCustomer  }) {
  try {
    const response = yield call(deleteCarCustomerData, carCustomer._id );
    yield put(deleteCarCustomerSuccess(carCustomer))
    showToastSuccess("Customer is deleted Successfully","Success");
  } catch (error) {
    yield put(deleteCarCustomerFail(error))
    showToastError("Customer Failed to delete","Error");
  }
}

function* onDeleteAllCarCustomer() {
    try {
      const response = yield call(deleteAllCarCustomers)
      yield put(deleteAllCarCustomersSuccess(response))
      showToastSuccess("All Customers deleted Successfully","Success");
    } catch (error) {
      yield put(deleteAllCarCustomersFail(error))
      showToastError("Customers Failed to delete","Error");
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

function* carCustomerSaga() {
  yield takeEvery(GET_CAR_CUSTOMERS, fetchCarCustomers);
  yield takeEvery(ADD_NEW_CAR_CUSTOMER, onAddCarCustomer);
  yield takeEvery(UPDATE_CAR_CUSTOMER, onUpdateCarCustomer);
  yield takeEvery(DELETE_CAR_CUSTOMER, onDeleteCarCustomer);
  yield takeEvery(DELETE_ALL_CAR_CUSTOMER, onDeleteAllCarCustomer);
  yield takeEvery(GET_COUNTRIES_LIST, fetchCountriesList);
}

export default carCustomerSaga;
