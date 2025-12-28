import { call, put, takeEvery } from "redux-saga/effects";
import {
  // Workflow Actions
  GET_WORKFLOW_LIST,
  GET_WORKFLOW_BY_ID,
  CREATE_WORKFLOW,
  UPDATE_WORKFLOW,
  DELETE_WORKFLOW,
  TOGGLE_WORKFLOW_STATUS,
  RUN_WORKFLOW,
  PREVIEW_WORKFLOW_AUDIENCE,
  TEST_WORKFLOW_TRIGGER,
  // Enrollment Actions
  GET_WORKFLOW_ENROLLMENTS,
  ENROLL_CUSTOMER,
  CANCEL_ENROLLMENT,
  PROCESS_ENROLLMENT_NOW,
  // Template Actions
  GET_EMAIL_TEMPLATES,
  // Segment Actions
  GET_SEGMENTS,
  GET_SEGMENT_BY_ID,
  CREATE_SEGMENT,
  UPDATE_SEGMENT,
  DELETE_SEGMENT,
  PREVIEW_SEGMENT,
  ADD_SEGMENT_MEMBERS,
  IMPORT_SEGMENT_FROM_BUCKET,
  // Customer Bucket Actions
  GET_CUSTOMER_BUCKETS,
  GET_BUCKET_CUSTOMERS,
  // Workflow Audience Actions
  UPDATE_WORKFLOW_AUDIENCE,
  ADD_WORKFLOW_RECIPIENTS,
  IMPORT_WORKFLOW_FROM_BUCKET,
  // Trigger Types
  GET_TRIGGER_TYPES,
} from "./actionTypes";

import {
  // Workflow Actions
  getWorkflowListSuccess,
  getWorkflowListFail,
  getWorkflowByIdSuccess,
  getWorkflowByIdFail,
  createWorkflowSuccess,
  createWorkflowFail,
  updateWorkflowSuccess,
  updateWorkflowFail,
  deleteWorkflowSuccess,
  deleteWorkflowFail,
  toggleWorkflowStatusSuccess,
  toggleWorkflowStatusFail,
  runWorkflowSuccess,
  runWorkflowFail,
  previewWorkflowAudienceSuccess,
  previewWorkflowAudienceFail,
  testWorkflowTriggerSuccess,
  testWorkflowTriggerFail,
  // Enrollment Actions
  getWorkflowEnrollmentsSuccess,
  getWorkflowEnrollmentsFail,
  enrollCustomerSuccess,
  enrollCustomerFail,
  cancelEnrollmentSuccess,
  cancelEnrollmentFail,
  processEnrollmentNowSuccess,
  processEnrollmentNowFail,
  // Template Actions
  getEmailTemplatesSuccess,
  getEmailTemplatesFail,
  // Segment Actions
  getSegmentsSuccess,
  getSegmentsFail,
  getSegmentByIdSuccess,
  getSegmentByIdFail,
  createSegmentSuccess,
  createSegmentFail,
  updateSegmentSuccess,
  updateSegmentFail,
  deleteSegmentSuccess,
  deleteSegmentFail,
  previewSegmentSuccess,
  previewSegmentFail,
  addSegmentMembersSuccess,
  addSegmentMembersFail,
  importSegmentFromBucketSuccess,
  importSegmentFromBucketFail,
  // Customer Bucket Actions
  getCustomerBucketsSuccess,
  getCustomerBucketsFail,
  getBucketCustomersSuccess,
  getBucketCustomersFail,
  // Workflow Audience Actions
  updateWorkflowAudienceSuccess,
  updateWorkflowAudienceFail,
  addWorkflowRecipientsSuccess,
  addWorkflowRecipientsFail,
  importWorkflowFromBucketSuccess,
  importWorkflowFromBucketFail,
  // Trigger Types
  getTriggerTypesSuccess,
  getTriggerTypesFail,
} from "./actions";

import {
  getWorkflowListAPI,
  getWorkflowByIdAPI,
  createWorkflowAPI,
  updateWorkflowAPI,
  deleteWorkflowAPI,
  toggleWorkflowStatusAPI,
  runWorkflowAPI,
  previewWorkflowAudienceAPI,
  testWorkflowTriggerAPI,
  getWorkflowEnrollmentsAPI,
  enrollCustomerAPI,
  cancelEnrollmentAPI,
  processEnrollmentNowAPI,
  getEmailTemplatesAPI,
  getSegmentsAPI,
  getSegmentByIdAPI,
  createSegmentAPI,
  updateSegmentAPI,
  deleteSegmentAPI,
  previewSegmentAPI,
  addSegmentMembersAPI,
  importSegmentFromBucketAPI,
  getCustomerBucketsAPI,
  getBucketCustomersAPI,
  updateWorkflowAudienceAPI,
  addWorkflowRecipientsAPI,
  importWorkflowFromBucketAPI,
  getTriggerTypesAPI,
} from "../../helpers/email_workflows_helper";

// ============================================
// WORKFLOW SAGAS
// ============================================

function* fetchWorkflowList() {
  try {
    const response = yield call(getWorkflowListAPI);
    yield put(getWorkflowListSuccess(response));
  } catch (error) {
    yield put(getWorkflowListFail(error?.response?.data || error?.message || "Failed to fetch workflows"));
  }
}

function* fetchWorkflowById({ payload: id }) {
  try {
    const response = yield call(getWorkflowByIdAPI, id);
    yield put(getWorkflowByIdSuccess(response));
  } catch (error) {
    yield put(getWorkflowByIdFail(error?.response?.data || error?.message || "Failed to fetch workflow"));
  }
}

function* createWorkflow({ payload: data }) {
  try {
    const response = yield call(createWorkflowAPI, data);
    yield put(createWorkflowSuccess(response));
  } catch (error) {
    yield put(createWorkflowFail(error?.response?.data || error?.message || "Failed to create workflow"));
  }
}

function* updateWorkflow({ payload: { id, data } }) {
  try {
    const response = yield call(updateWorkflowAPI, id, data);
    yield put(updateWorkflowSuccess(response));
  } catch (error) {
    yield put(updateWorkflowFail(error?.response?.data || error?.message || "Failed to update workflow"));
  }
}

function* deleteWorkflow({ payload: id }) {
  try {
    yield call(deleteWorkflowAPI, id);
    yield put(deleteWorkflowSuccess());
  } catch (error) {
    yield put(deleteWorkflowFail(error?.response?.data || error?.message || "Failed to delete workflow"));
  }
}

function* toggleWorkflowStatus({ payload: { id, data } }) {
  try {
    const response = yield call(toggleWorkflowStatusAPI, id, data);
    yield put(toggleWorkflowStatusSuccess(response));
  } catch (error) {
    yield put(toggleWorkflowStatusFail(error?.response?.data || error?.message || "Failed to toggle workflow status"));
  }
}

function* runWorkflow({ payload: id }) {
  try {
    const response = yield call(runWorkflowAPI, id);
    yield put(runWorkflowSuccess(response));
  } catch (error) {
    yield put(runWorkflowFail(error?.response?.data || error?.message || "Failed to run workflow"));
  }
}

function* previewWorkflowAudience({ payload: id }) {
  try {
    const response = yield call(previewWorkflowAudienceAPI, id);
    yield put(previewWorkflowAudienceSuccess(response));
  } catch (error) {
    yield put(previewWorkflowAudienceFail(error?.response?.data || error?.message || "Failed to preview audience"));
  }
}

function* testWorkflowTrigger({ payload: { id, data } }) {
  try {
    const response = yield call(testWorkflowTriggerAPI, id, data);
    yield put(testWorkflowTriggerSuccess(response));
  } catch (error) {
    yield put(testWorkflowTriggerFail(error?.response?.data || error?.message || "Failed to test trigger"));
  }
}

// ============================================
// ENROLLMENT SAGAS
// ============================================

function* fetchWorkflowEnrollments({ payload: { id, page, limit } }) {
  try {
    const response = yield call(getWorkflowEnrollmentsAPI, id, page, limit);
    yield put(getWorkflowEnrollmentsSuccess(response));
  } catch (error) {
    yield put(getWorkflowEnrollmentsFail(error?.response?.data || error?.message || "Failed to fetch enrollments"));
  }
}

function* enrollCustomer({ payload: { id, data } }) {
  try {
    const response = yield call(enrollCustomerAPI, id, data);
    yield put(enrollCustomerSuccess(response));
  } catch (error) {
    yield put(enrollCustomerFail(error?.response?.data || error?.message || "Failed to enroll customer"));
  }
}

function* cancelEnrollment({ payload: enrollmentId }) {
  try {
    const response = yield call(cancelEnrollmentAPI, enrollmentId);
    yield put(cancelEnrollmentSuccess());
  } catch (error) {
    yield put(cancelEnrollmentFail(error?.response?.data || error?.message || "Failed to cancel enrollment"));
  }
}

function* processEnrollmentNow({ payload: enrollmentId }) {
  try {
    const response = yield call(processEnrollmentNowAPI, enrollmentId);
    yield put(processEnrollmentNowSuccess());
  } catch (error) {
    yield put(processEnrollmentNowFail(error?.response?.data || error?.message || "Failed to process enrollment"));
  }
}

// ============================================
// TEMPLATE SAGAS
// ============================================

function* fetchEmailTemplates() {
  try {
    const response = yield call(getEmailTemplatesAPI);
    yield put(getEmailTemplatesSuccess(response));
  } catch (error) {
    yield put(getEmailTemplatesFail(error?.response?.data || error?.message || "Failed to fetch templates"));
  }
}

// ============================================
// SEGMENT SAGAS
// ============================================

function* fetchSegments() {
  try {
    const response = yield call(getSegmentsAPI);
    yield put(getSegmentsSuccess(response));
  } catch (error) {
    yield put(getSegmentsFail(error?.response?.data || error?.message || "Failed to fetch segments"));
  }
}

function* fetchSegmentById({ payload: id }) {
  try {
    const response = yield call(getSegmentByIdAPI, id);
    yield put(getSegmentByIdSuccess(response));
  } catch (error) {
    yield put(getSegmentByIdFail(error?.response?.data || error?.message || "Failed to fetch segment"));
  }
}

function* createSegment({ payload: data }) {
  try {
    const response = yield call(createSegmentAPI, data);
    yield put(createSegmentSuccess(response));
  } catch (error) {
    yield put(createSegmentFail(error?.response?.data || error?.message || "Failed to create segment"));
  }
}

function* updateSegment({ payload: { id, data } }) {
  try {
    const response = yield call(updateSegmentAPI, id, data);
    yield put(updateSegmentSuccess(response));
  } catch (error) {
    yield put(updateSegmentFail(error?.response?.data || error?.message || "Failed to update segment"));
  }
}

function* deleteSegment({ payload: id }) {
  try {
    yield call(deleteSegmentAPI, id);
    yield put(deleteSegmentSuccess());
  } catch (error) {
    yield put(deleteSegmentFail(error?.response?.data || error?.message || "Failed to delete segment"));
  }
}

function* previewSegment({ payload: data }) {
  try {
    const response = yield call(previewSegmentAPI, data);
    yield put(previewSegmentSuccess(response));
  } catch (error) {
    yield put(previewSegmentFail(error?.response?.data || error?.message || "Failed to preview segment"));
  }
}

function* addSegmentMembers({ payload: { id, data } }) {
  try {
    const response = yield call(addSegmentMembersAPI, id, data);
    yield put(addSegmentMembersSuccess(response));
  } catch (error) {
    yield put(addSegmentMembersFail(error?.response?.data || error?.message || "Failed to add members"));
  }
}

function* importSegmentFromBucket({ payload: { id, data } }) {
  try {
    const response = yield call(importSegmentFromBucketAPI, id, data);
    yield put(importSegmentFromBucketSuccess(response));
  } catch (error) {
    yield put(importSegmentFromBucketFail(error?.response?.data || error?.message || "Failed to import from bucket"));
  }
}

// ============================================
// CUSTOMER BUCKET SAGAS
// ============================================

function* fetchCustomerBuckets() {
  try {
    const response = yield call(getCustomerBucketsAPI);
    yield put(getCustomerBucketsSuccess(response));
  } catch (error) {
    yield put(getCustomerBucketsFail(error?.response?.data || error?.message || "Failed to fetch buckets"));
  }
}

function* fetchBucketCustomers({ payload: { bucketId, page, limit } }) {
  try {
    const response = yield call(getBucketCustomersAPI, bucketId, page, limit);
    yield put(getBucketCustomersSuccess(response));
  } catch (error) {
    yield put(getBucketCustomersFail(error?.response?.data || error?.message || "Failed to fetch bucket customers"));
  }
}

// ============================================
// WORKFLOW AUDIENCE SAGAS
// ============================================

function* updateWorkflowAudience({ payload: { id, data } }) {
  try {
    const response = yield call(updateWorkflowAudienceAPI, id, data);
    yield put(updateWorkflowAudienceSuccess(response));
  } catch (error) {
    yield put(updateWorkflowAudienceFail(error?.response?.data || error?.message || "Failed to update audience"));
  }
}

function* addWorkflowRecipients({ payload: { id, data } }) {
  try {
    const response = yield call(addWorkflowRecipientsAPI, id, data);
    yield put(addWorkflowRecipientsSuccess(response));
  } catch (error) {
    yield put(addWorkflowRecipientsFail(error?.response?.data || error?.message || "Failed to add recipients"));
  }
}

function* importWorkflowFromBucket({ payload: { id, data } }) {
  try {
    const response = yield call(importWorkflowFromBucketAPI, id, data);
    yield put(importWorkflowFromBucketSuccess(response));
  } catch (error) {
    yield put(importWorkflowFromBucketFail(error?.response?.data || error?.message || "Failed to import from bucket"));
  }
}

// ============================================
// TRIGGER TYPES SAGA
// ============================================

function* fetchTriggerTypes() {
  try {
    const response = yield call(getTriggerTypesAPI);
    yield put(getTriggerTypesSuccess(response));
  } catch (error) {
    yield put(getTriggerTypesFail(error?.response?.data || error?.message || "Failed to fetch trigger types"));
  }
}

// ============================================
// WATCHER SAGAS
// ============================================

function* emailWorkflowsSaga() {
  // Workflow watchers
  yield takeEvery(GET_WORKFLOW_LIST, fetchWorkflowList);
  yield takeEvery(GET_WORKFLOW_BY_ID, fetchWorkflowById);
  yield takeEvery(CREATE_WORKFLOW, createWorkflow);
  yield takeEvery(UPDATE_WORKFLOW, updateWorkflow);
  yield takeEvery(DELETE_WORKFLOW, deleteWorkflow);
  yield takeEvery(TOGGLE_WORKFLOW_STATUS, toggleWorkflowStatus);
  yield takeEvery(RUN_WORKFLOW, runWorkflow);
  yield takeEvery(PREVIEW_WORKFLOW_AUDIENCE, previewWorkflowAudience);
  yield takeEvery(TEST_WORKFLOW_TRIGGER, testWorkflowTrigger);

  // Enrollment watchers
  yield takeEvery(GET_WORKFLOW_ENROLLMENTS, fetchWorkflowEnrollments);
  yield takeEvery(ENROLL_CUSTOMER, enrollCustomer);
  yield takeEvery(CANCEL_ENROLLMENT, cancelEnrollment);
  yield takeEvery(PROCESS_ENROLLMENT_NOW, processEnrollmentNow);

  // Template watchers
  yield takeEvery(GET_EMAIL_TEMPLATES, fetchEmailTemplates);

  // Segment watchers
  yield takeEvery(GET_SEGMENTS, fetchSegments);
  yield takeEvery(GET_SEGMENT_BY_ID, fetchSegmentById);
  yield takeEvery(CREATE_SEGMENT, createSegment);
  yield takeEvery(UPDATE_SEGMENT, updateSegment);
  yield takeEvery(DELETE_SEGMENT, deleteSegment);
  yield takeEvery(PREVIEW_SEGMENT, previewSegment);
  yield takeEvery(ADD_SEGMENT_MEMBERS, addSegmentMembers);
  yield takeEvery(IMPORT_SEGMENT_FROM_BUCKET, importSegmentFromBucket);

  // Customer Bucket watchers
  yield takeEvery(GET_CUSTOMER_BUCKETS, fetchCustomerBuckets);
  yield takeEvery(GET_BUCKET_CUSTOMERS, fetchBucketCustomers);

  // Workflow Audience watchers
  yield takeEvery(UPDATE_WORKFLOW_AUDIENCE, updateWorkflowAudience);
  yield takeEvery(ADD_WORKFLOW_RECIPIENTS, addWorkflowRecipients);
  yield takeEvery(IMPORT_WORKFLOW_FROM_BUCKET, importWorkflowFromBucket);

  // Trigger Types watcher
  yield takeEvery(GET_TRIGGER_TYPES, fetchTriggerTypes);
}

export default emailWorkflowsSaga;

