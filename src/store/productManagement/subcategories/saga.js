import { takeEvery, put, call } from "redux-saga/effects"
import { GET_SUBCATEGORIES, GET_TRAVEL_CATEGORIES,  ADD_TRAVEL_SUBCATEGORY,GET_EXISTING_SUBCATEGORY,UPDATE_SUBCATEGORY,DELETE_SUBCATEGORY } from "./actionTypes";
import { getSubcategoriesFail, 
getSubcategoriesSuccess, 
addTravelSubcategorySuccess,
addTravelSubcategoryFail,
getExistingSubcategorySuccess,
getExistingSubcategoryFail,
updateSubcategoryFail,
updateSubcategorySuccess,
deleteSubcategorySuccess,
deleteSubcategoryFail,
getTravelCategoriesSuccess,
getTravelCategoriesFail
} from "./actions"

import { 
getSubcategoriesList,
getTravelCategoriesList,
addTravelSubcategoryApi,
getExistingSubcategory ,
updateSubcategory,
deleteSubcategoryApi
} from "../../../helpers/location_management_helper"

import { showToastError, showToastSuccess } from "helpers/toastBuilder"

function* fetchSubcategories() {
  try {
    console.log("fetchSubcategories from saga")
    const response = yield call(getSubcategoriesList)
    console.log("Thisi si response data ",response.data)
    yield put(getSubcategoriesSuccess(response.data))
  } catch (error) {
    console.log("Thisi si response error ",error)
    yield put(getSubcategoriesFail(error))
  }
}


function* onUpdateSubcategory(action) {
  try {
 
        const formDataToSend = action.payload.formData;
const subCategoryid = action.payload.subCategoryid;
    const response = yield call(updateSubcategory, formDataToSend,subCategoryid);
  
    yield put(updateSubcategorySuccess( response.data))
    showToastSuccess("Success to Update", "Congrats")
  } catch (error) {
    console.error("Saga: Error updating travel subcategory:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to update sub category.";
    console.error("Error message:", errorMessage);
    yield put(updateSubcategoryFail(error))
    showToastError("UpdateSubcategory Failed to Update. Please try again.", "Error")
  }
}

function* fetchTravelCategories(action) {
  try {
    console.log("fetchTravelCategories called from saga ", action.payload);
    const cityCode = action.payload;
    const response = yield call(getTravelCategoriesList, cityCode)
    yield put(getTravelCategoriesSuccess(response.data))
  } catch (error) {
    yield put(getTravelCategoriesFail(error))
  }
}

function* onAddTravelSubcategory(action) {
  try {
    const formDataToSend = action.payload.formData;
const cityCode = action.payload.cityCode;
console.log("onAddTravelSubcategory called from saga with formData:", formDataToSend, "and cityCode:", cityCode);
    const response = yield call(addTravelSubcategoryApi, formDataToSend,cityCode);
    yield put(addTravelSubcategorySuccess(response.data));
      showToastSuccess("Success to Add", "Congrats")
  } catch (error) {
    console.error("Saga: Error adding travel subcategory:", error);
        showToastError("Failed to Add. Please try again.", "Error")
    yield put(addTravelSubcategoryFail(error));
  }
}

function *fetchExistingSubcategory(action)
{
  const subCategoryId=action.payload;
  try {
    const response = yield call(getExistingSubcategory,subCategoryId)
    yield put(getExistingSubcategorySuccess(response.data))
  } catch (error) {
      console.log("GetExitingSubcategory error ",error);
    yield put(getExistingSubcategoryFail(error))
  }
}

function* onDeleteSubcategory(action) {
  const subCategoryId = action.payload;
  try {
    const response = yield call(deleteSubcategoryApi, subCategoryId);
    
    yield put(deleteSubcategorySuccess(response.data));
    showToastSuccess("Subcategory deleted successfully", "Success");
  } catch (error) {
    console.error("Saga: Error deleting subcategory:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete sub category.";
    console.error("Error message:", errorMessage);
    
    // Dispatch failure action
    yield put(deleteSubcategoryFail(error));
    showToastError("Failed to delete subcategory. Please try again.", "Error");
  }
}



function* subcategoriesSaga() {
  yield takeEvery(GET_SUBCATEGORIES, fetchSubcategories);
  yield takeEvery(ADD_TRAVEL_SUBCATEGORY, onAddTravelSubcategory);
  yield takeEvery(GET_TRAVEL_CATEGORIES, fetchTravelCategories);
  yield takeEvery(GET_EXISTING_SUBCATEGORY,fetchExistingSubcategory);
  yield takeEvery(UPDATE_SUBCATEGORY, onUpdateSubcategory);
  yield takeEvery(DELETE_SUBCATEGORY, onDeleteSubcategory);
  
}
export default subcategoriesSaga;
