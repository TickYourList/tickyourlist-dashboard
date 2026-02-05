import { call, put, takeEvery } from "redux-saga/effects";
import toastr from "toastr";

import {
  GET_CAREER_POSTINGS,
  GET_CAREER_POSTING,
  ADD_NEW_CAREER_POSTING,
  UPDATE_CAREER_POSTING,
  DELETE_CAREER_POSTING,
  GET_CAREER_APPLICATIONS,
  UPDATE_APPLICATION_STATUS,
} from "./actionTypes";

import {
  getCareerPostingsSuccess,
  getCareerPostingsFail,
  getCareerPostingSuccess,
  getCareerPostingFail,
  addCareerPostingSuccess,
  addCareerPostingFail,
  updateCareerPostingSuccess,
  updateCareerPostingFail,
  deleteCareerPostingSuccess,
  deleteCareerPostingFail,
  getCareerApplicationsSuccess,
  getCareerApplicationsFail,
  updateApplicationStatusSuccess,
  updateApplicationStatusFail,
} from "./actions";

import {
  getCareerPostingsList,
  getCareerPostingById,
  createCareerPosting,
  updateCareerPosting,
  deleteCareerPosting,
  getCareerApplications,
  updateApplicationStatus,
} from "../../helpers/career_helper";

// Fetch all career postings
function* fetchCareerPostings() {
  try {
    const response = yield call(getCareerPostingsList);
    
    if (response?.statusCode === "10000" || response?.data) {
      // Handle different response structures
      let postings = [];
      if (Array.isArray(response?.data)) {
        postings = response.data;
      } else if (Array.isArray(response?.data?.careers)) {
        postings = response.data.careers;
      } else if (Array.isArray(response?.data?.postings)) {
        postings = response.data.postings;
      } else if (Array.isArray(response)) {
        postings = response;
      }
      
      // Ensure all postings have required fields with defaults
      postings = postings.map(posting => ({
        ...posting,
        status: posting.status !== undefined ? posting.status : true,
        featured: posting.featured || false,
      }));
      
      yield put(getCareerPostingsSuccess(postings));
    } else {
      yield put(getCareerPostingsSuccess([])); // Return empty array instead of failing
      console.warn("No career postings found or invalid response structure");
    }
  } catch (error) {
    console.error("Error fetching career postings:", error);
    yield put(getCareerPostingsSuccess([])); // Return empty array on error
    toastr.error(error.message || "Failed to fetch career postings");
  }
}

// Fetch single career posting
function* fetchCareerPosting({ payload: id }) {
  try {
    const response = yield call(getCareerPostingById, id);
    
    if (response?.statusCode === "10000" || response?.data) {
      const posting = response?.data || response;
      yield put(getCareerPostingSuccess(posting));
    } else {
      yield put(getCareerPostingFail(response?.message || "Failed to fetch career posting"));
      toastr.error(response?.message || "Failed to fetch career posting");
    }
  } catch (error) {
    yield put(getCareerPostingFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to fetch career posting");
  }
}

// Add new career posting
function* onAddNewCareerPosting({ payload: data }) {
  try {
    const response = yield call(createCareerPosting, data);
    
    if (response?.statusCode === "10000" || response?.data) {
      const posting = response?.data || response;
      yield put(addCareerPostingSuccess(posting));
      toastr.success("Career posting created successfully");
    } else {
      yield put(addCareerPostingFail(response?.message || "Failed to create career posting"));
      toastr.error(response?.message || "Failed to create career posting");
    }
  } catch (error) {
    yield put(addCareerPostingFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to create career posting");
  }
}

// Update career posting
function* onUpdateCareerPosting({ payload: data }) {
  try {
    const { id, ...updateData } = data;
    const response = yield call(updateCareerPosting, id, updateData);
    
    if (response?.statusCode === "10000" || response?.data) {
      const posting = response?.data || response;
      yield put(updateCareerPostingSuccess(posting));
      toastr.success("Career posting updated successfully");
    } else {
      yield put(updateCareerPostingFail(response?.message || "Failed to update career posting"));
      toastr.error(response?.message || "Failed to update career posting");
    }
  } catch (error) {
    yield put(updateCareerPostingFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to update career posting");
  }
}

// Delete career posting
function* onDeleteCareerPosting({ payload: id }) {
  try {
    const response = yield call(deleteCareerPosting, id);
    
    if (response?.statusCode === "10000" || response?.success) {
      yield put(deleteCareerPostingSuccess(id));
      toastr.success("Career posting deleted successfully");
    } else {
      yield put(deleteCareerPostingFail(response?.message || "Failed to delete career posting"));
      toastr.error(response?.message || "Failed to delete career posting");
    }
  } catch (error) {
    yield put(deleteCareerPostingFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to delete career posting");
  }
}

// Fetch career applications
function* fetchCareerApplications() {
  try {
    const response = yield call(getCareerApplications);
    
    if (response?.statusCode === "10000" || response?.data) {
      const applications = response?.data || response;
      yield put(getCareerApplicationsSuccess(applications));
    } else {
      yield put(getCareerApplicationsFail(response?.message || "Failed to fetch applications"));
      toastr.error(response?.message || "Failed to fetch applications");
    }
  } catch (error) {
    yield put(getCareerApplicationsFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to fetch applications");
  }
}

// Update application status
function* onUpdateApplicationStatus({ payload: data }) {
  try {
    const { id, status } = data;
    const response = yield call(updateApplicationStatus, id, status);
    
    if (response?.statusCode === "10000" || response?.data) {
      const application = response?.data || response;
      yield put(updateApplicationStatusSuccess(application));
      toastr.success("Application status updated successfully");
    } else {
      yield put(updateApplicationStatusFail(response?.message || "Failed to update application status"));
      toastr.error(response?.message || "Failed to update application status");
    }
  } catch (error) {
    yield put(updateApplicationStatusFail(error.message || "Something went wrong"));
    toastr.error(error.message || "Failed to update application status");
  }
}

function* careersSaga() {
  yield takeEvery(GET_CAREER_POSTINGS, fetchCareerPostings);
  yield takeEvery(GET_CAREER_POSTING, fetchCareerPosting);
  yield takeEvery(ADD_NEW_CAREER_POSTING, onAddNewCareerPosting);
  yield takeEvery(UPDATE_CAREER_POSTING, onUpdateCareerPosting);
  yield takeEvery(DELETE_CAREER_POSTING, onDeleteCareerPosting);
  yield takeEvery(GET_CAREER_APPLICATIONS, fetchCareerApplications);
  yield takeEvery(UPDATE_APPLICATION_STATUS, onUpdateApplicationStatus);
}

export default careersSaga;
