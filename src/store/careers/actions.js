import {
  GET_CAREER_POSTINGS,
  GET_CAREER_POSTINGS_SUCCESS,
  GET_CAREER_POSTINGS_FAIL,
  GET_CAREER_POSTING,
  GET_CAREER_POSTING_SUCCESS,
  GET_CAREER_POSTING_FAIL,
  ADD_NEW_CAREER_POSTING,
  ADD_CAREER_POSTING_SUCCESS,
  ADD_CAREER_POSTING_FAIL,
  UPDATE_CAREER_POSTING,
  UPDATE_CAREER_POSTING_SUCCESS,
  UPDATE_CAREER_POSTING_FAIL,
  DELETE_CAREER_POSTING,
  DELETE_CAREER_POSTING_SUCCESS,
  DELETE_CAREER_POSTING_FAIL,
  GET_CAREER_APPLICATIONS,
  GET_CAREER_APPLICATIONS_SUCCESS,
  GET_CAREER_APPLICATIONS_FAIL,
  UPDATE_APPLICATION_STATUS,
  UPDATE_APPLICATION_STATUS_SUCCESS,
  UPDATE_APPLICATION_STATUS_FAIL,
} from "./actionTypes";

// Get all career postings
export const getCareerPostings = () => ({
  type: GET_CAREER_POSTINGS,
});

export const getCareerPostingsSuccess = (postings) => ({
  type: GET_CAREER_POSTINGS_SUCCESS,
  payload: postings,
});

export const getCareerPostingsFail = (error) => ({
  type: GET_CAREER_POSTINGS_FAIL,
  payload: error,
});

// Get single career posting
export const getCareerPosting = (id) => ({
  type: GET_CAREER_POSTING,
  payload: id,
});

export const getCareerPostingSuccess = (posting) => ({
  type: GET_CAREER_POSTING_SUCCESS,
  payload: posting,
});

export const getCareerPostingFail = (error) => ({
  type: GET_CAREER_POSTING_FAIL,
  payload: error,
});

// Add new career posting
export const addNewCareerPosting = (data) => ({
  type: ADD_NEW_CAREER_POSTING,
  payload: data,
});

export const addCareerPostingSuccess = (posting) => ({
  type: ADD_CAREER_POSTING_SUCCESS,
  payload: posting,
});

export const addCareerPostingFail = (error) => ({
  type: ADD_CAREER_POSTING_FAIL,
  payload: error,
});

// Update career posting
export const updateCareerPosting = (data) => ({
  type: UPDATE_CAREER_POSTING,
  payload: data,
});

export const updateCareerPostingSuccess = (posting) => ({
  type: UPDATE_CAREER_POSTING_SUCCESS,
  payload: posting,
});

export const updateCareerPostingFail = (error) => ({
  type: UPDATE_CAREER_POSTING_FAIL,
  payload: error,
});

// Delete career posting
export const deleteCareerPosting = (id) => ({
  type: DELETE_CAREER_POSTING,
  payload: id,
});

export const deleteCareerPostingSuccess = (id) => ({
  type: DELETE_CAREER_POSTING_SUCCESS,
  payload: id,
});

export const deleteCareerPostingFail = (error) => ({
  type: DELETE_CAREER_POSTING_FAIL,
  payload: error,
});

// Get career applications
export const getCareerApplications = () => ({
  type: GET_CAREER_APPLICATIONS,
});

export const getCareerApplicationsSuccess = (applications) => ({
  type: GET_CAREER_APPLICATIONS_SUCCESS,
  payload: applications,
});

export const getCareerApplicationsFail = (error) => ({
  type: GET_CAREER_APPLICATIONS_FAIL,
  payload: error,
});

// Update application status
export const updateApplicationStatus = (data) => ({
  type: UPDATE_APPLICATION_STATUS,
  payload: data,
});

export const updateApplicationStatusSuccess = (application) => ({
  type: UPDATE_APPLICATION_STATUS_SUCCESS,
  payload: application,
});

export const updateApplicationStatusFail = (error) => ({
  type: UPDATE_APPLICATION_STATUS_FAIL,
  payload: error,
});
