import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { ADD_ALL_VARIANT_PRICING, ADD_NEW_CAR_VARIANT, DELETE_ALL_CAR_VARIANT, DELETE_CAR_VARIANT, DELETE_CAR_VARIANT_PRICING, GET_CAR_VARIANTS, GET_CAR_VARIANT_PRICING, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_VARIANT } from "./actionTypes"
import { addCarModelByBrand, addCarVariant, deleteCarVariantData, fetchCarModelByBrand, getCarVariantsList, updateCarVariantData, getCarVariantPricingList, deleteCarVariantPricingList } from "helpers/automobile_helper_apis"
import { addCarVariantFail, addCarVariantSuccess, addVariantDataError, addVariantDataSuccess, deleteAllCarVariantsFail, deleteAllCarVariantsSuccess, deleteCarVariantFail, deleteCarVariantPricingFail, deleteCarVariantPricingSuccess, deleteCarVariantSuccess, getCarVariantPricingFail, getCarVariantPricingSuccess, getCarVariantsFail, getCarVariantsSuccess, getCountriesListError, getCountriesListSuccess, updateCarVariantFail, updateCarVariantSuccess } from "./actions"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"


function* fetchCarVariants() {
  try {
    const response = yield call(getCarVariantsList)
    yield put(getCarVariantsSuccess(response.data.carVariantList))
  } catch (error) {
    yield put(getCarVariantsFail(error))
    showToastError('Sorry! Failed to Fetch Variants, plese try again', 'Error');
  }
}

function* onAddCarVariant({ payload: {id , data, history } }) {
  try {
    const response = yield call(addCarVariant, id, data)
    yield put(addCarVariantSuccess(response.data));
    showToastSuccess("Variant added successfully", "SUCCESS");
    history('/car-variants');
  } catch (error) {
    yield put(addCarVariantFail(error));
    showToastError('Sorry! Failed to Add Variant, plese try again', 'Error');
  }
}

function* onUpdateCarVariant({ payload: { carvariantid, carModelId, data, history } }) {
  try {
    console.log("datatest ", data);
    const response = yield call(updateCarVariantData, carvariantid, carModelId, data );
    yield put(updateCarVariantSuccess(response?.data))
    showToastSuccess("Variant updated successfully", "SUCCESS");
    history('/car-variants'); 
  } catch (error) {
    yield put(updateCarVariantFail(error))
    showToastError('Sorry! Failed to Update Variant, plese try again', 'Error');
  }
}

function* onDeleteCarVariant({ payload: carModel  }) {
  try {
    const response = yield call(deleteCarVariantData, carModel._id );
    showToastSuccess("Variant deleted successfully", "SUCCESS");
    yield put(deleteCarVariantSuccess(carModel))
  } catch (error) {
    yield put(deleteCarVariantFail(error))
    showToastError('Sorry! Failed to delete Variant, plese try again', 'Error');
  }
}

function* onDeleteAllCarVariant() {
    try {
      const response = yield call(deleteAllCarModels)
      yield put(deleteAllCarVariantsSuccess(response))
      showToastSuccess("Variant Pricing updated successfully", "SUCCESS");
    } catch (error) {
      yield put(deleteAllCarVariantsFail(error))
      showToastError('Sorry! Failed to delete Variant, plese try again', 'Error');
    }
  }

  function* fetchModelByBrand({ payload: { id } }) {
    try {
      const response = yield call(fetchCarModelByBrand, id);
      yield put(getCountriesListSuccess(response.data.carModelsList));
    }catch(error) {
      yield put(getCountriesListError(error));
    }
  }

  function* onAddAllVariantPricing({ payload: { id, data, toggle } }) {
    try {
      const response = yield call(addCarModelByBrand, id, data);
      yield put(addVariantDataSuccess(response.data.carModelsList));
      toggle();
      showToastSuccess("Variant Pricing added successfully","Success");
    }catch(error) {
      yield put(addVariantDataError(error));
      showToastError('Vsriant Pricing Failed to add, plese try again', 'Error');
    }
  }

  function* fetchCarVariantPricing({ payload: { variantId } }) {
    try {
      const response = yield call(getCarVariantPricingList, variantId)
      yield put(getCarVariantPricingSuccess(response.data.carVariantPricingList))
    } catch (error) {
      yield put(getCarVariantPricingFail(error))
      showToastError('Sorry! Failed to Fetch Variant Pricing, plese try again', 'Error');
    }
  }

  function* deleteCarVariantPricing({ payload: { variantId } }) {
    try {
      const response = yield call(deleteCarVariantPricingList, variantId)
      yield put(deleteCarVariantPricingSuccess())
      showToastSuccess("Variant pricing deleted successfully", "SUCCESS");
    } catch (error) {
      yield put(deleteCarVariantPricingFail(error))
      showToastError('Vsriant Pricing Failed to delete, plese try again', 'Error');
    }
  }
 
function* carVariantSaga() {
  yield takeEvery(GET_CAR_VARIANTS, fetchCarVariants);
  yield takeEvery(ADD_NEW_CAR_VARIANT, onAddCarVariant);
  yield takeEvery(UPDATE_CAR_VARIANT, onUpdateCarVariant);
  yield takeEvery(DELETE_CAR_VARIANT, onDeleteCarVariant);
  yield takeEvery(DELETE_ALL_CAR_VARIANT, onDeleteAllCarVariant);
  yield takeEvery(ADD_ALL_VARIANT_PRICING, onAddAllVariantPricing);
  yield takeEvery(GET_CAR_VARIANT_PRICING, fetchCarVariantPricing);
  yield takeEvery(DELETE_CAR_VARIANT_PRICING, deleteCarVariantPricing);
}

export default carVariantSaga;
