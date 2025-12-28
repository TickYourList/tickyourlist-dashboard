import {
  // Workflow Actions
  GET_WORKFLOW_LIST,
  GET_WORKFLOW_LIST_SUCCESS,
  GET_WORKFLOW_LIST_FAIL,
  GET_WORKFLOW_BY_ID,
  GET_WORKFLOW_BY_ID_SUCCESS,
  GET_WORKFLOW_BY_ID_FAIL,
  CREATE_WORKFLOW,
  CREATE_WORKFLOW_SUCCESS,
  CREATE_WORKFLOW_FAIL,
  UPDATE_WORKFLOW,
  UPDATE_WORKFLOW_SUCCESS,
  UPDATE_WORKFLOW_FAIL,
  DELETE_WORKFLOW,
  DELETE_WORKFLOW_SUCCESS,
  DELETE_WORKFLOW_FAIL,
  TOGGLE_WORKFLOW_STATUS,
  TOGGLE_WORKFLOW_STATUS_SUCCESS,
  TOGGLE_WORKFLOW_STATUS_FAIL,
  RUN_WORKFLOW,
  RUN_WORKFLOW_SUCCESS,
  RUN_WORKFLOW_FAIL,
  PREVIEW_WORKFLOW_AUDIENCE,
  PREVIEW_WORKFLOW_AUDIENCE_SUCCESS,
  PREVIEW_WORKFLOW_AUDIENCE_FAIL,
  TEST_WORKFLOW_TRIGGER,
  TEST_WORKFLOW_TRIGGER_SUCCESS,
  TEST_WORKFLOW_TRIGGER_FAIL,
  // Enrollment Actions
  GET_WORKFLOW_ENROLLMENTS,
  GET_WORKFLOW_ENROLLMENTS_SUCCESS,
  GET_WORKFLOW_ENROLLMENTS_FAIL,
  ENROLL_CUSTOMER,
  ENROLL_CUSTOMER_SUCCESS,
  ENROLL_CUSTOMER_FAIL,
  CANCEL_ENROLLMENT,
  CANCEL_ENROLLMENT_SUCCESS,
  CANCEL_ENROLLMENT_FAIL,
  PROCESS_ENROLLMENT_NOW,
  PROCESS_ENROLLMENT_NOW_SUCCESS,
  PROCESS_ENROLLMENT_NOW_FAIL,
  // Template Actions
  GET_EMAIL_TEMPLATES,
  GET_EMAIL_TEMPLATES_SUCCESS,
  GET_EMAIL_TEMPLATES_FAIL,
  // Segment Actions
  GET_SEGMENTS,
  GET_SEGMENTS_SUCCESS,
  GET_SEGMENTS_FAIL,
  GET_SEGMENT_BY_ID,
  GET_SEGMENT_BY_ID_SUCCESS,
  GET_SEGMENT_BY_ID_FAIL,
  CREATE_SEGMENT,
  CREATE_SEGMENT_SUCCESS,
  CREATE_SEGMENT_FAIL,
  UPDATE_SEGMENT,
  UPDATE_SEGMENT_SUCCESS,
  UPDATE_SEGMENT_FAIL,
  DELETE_SEGMENT,
  DELETE_SEGMENT_SUCCESS,
  DELETE_SEGMENT_FAIL,
  PREVIEW_SEGMENT,
  PREVIEW_SEGMENT_SUCCESS,
  PREVIEW_SEGMENT_FAIL,
  ADD_SEGMENT_MEMBERS,
  ADD_SEGMENT_MEMBERS_SUCCESS,
  ADD_SEGMENT_MEMBERS_FAIL,
  IMPORT_SEGMENT_FROM_BUCKET,
  IMPORT_SEGMENT_FROM_BUCKET_SUCCESS,
  IMPORT_SEGMENT_FROM_BUCKET_FAIL,
  // Customer Bucket Actions
  GET_CUSTOMER_BUCKETS,
  GET_CUSTOMER_BUCKETS_SUCCESS,
  GET_CUSTOMER_BUCKETS_FAIL,
  GET_BUCKET_CUSTOMERS,
  GET_BUCKET_CUSTOMERS_SUCCESS,
  GET_BUCKET_CUSTOMERS_FAIL,
  // Workflow Audience Actions
  UPDATE_WORKFLOW_AUDIENCE,
  UPDATE_WORKFLOW_AUDIENCE_SUCCESS,
  UPDATE_WORKFLOW_AUDIENCE_FAIL,
  ADD_WORKFLOW_RECIPIENTS,
  ADD_WORKFLOW_RECIPIENTS_SUCCESS,
  ADD_WORKFLOW_RECIPIENTS_FAIL,
  IMPORT_WORKFLOW_FROM_BUCKET,
  IMPORT_WORKFLOW_FROM_BUCKET_SUCCESS,
  IMPORT_WORKFLOW_FROM_BUCKET_FAIL,
  // Trigger Types
  GET_TRIGGER_TYPES,
  GET_TRIGGER_TYPES_SUCCESS,
  GET_TRIGGER_TYPES_FAIL,
} from "./actionTypes";

// ============================================
// WORKFLOW ACTIONS
// ============================================

export const getWorkflowList = () => ({
  type: GET_WORKFLOW_LIST,
});

export const getWorkflowListSuccess = (workflows) => ({
  type: GET_WORKFLOW_LIST_SUCCESS,
  payload: workflows,
});

export const getWorkflowListFail = (error) => ({
  type: GET_WORKFLOW_LIST_FAIL,
  payload: error,
});

export const getWorkflowById = (id) => ({
  type: GET_WORKFLOW_BY_ID,
  payload: id,
});

export const getWorkflowByIdSuccess = (workflow) => ({
  type: GET_WORKFLOW_BY_ID_SUCCESS,
  payload: workflow,
});

export const getWorkflowByIdFail = (error) => ({
  type: GET_WORKFLOW_BY_ID_FAIL,
  payload: error,
});

export const createWorkflow = (data) => ({
  type: CREATE_WORKFLOW,
  payload: data,
});

export const createWorkflowSuccess = (workflow) => ({
  type: CREATE_WORKFLOW_SUCCESS,
  payload: workflow,
});

export const createWorkflowFail = (error) => ({
  type: CREATE_WORKFLOW_FAIL,
  payload: error,
});

export const updateWorkflow = (id, data) => ({
  type: UPDATE_WORKFLOW,
  payload: { id, data },
});

export const updateWorkflowSuccess = (workflow) => ({
  type: UPDATE_WORKFLOW_SUCCESS,
  payload: workflow,
});

export const updateWorkflowFail = (error) => ({
  type: UPDATE_WORKFLOW_FAIL,
  payload: error,
});

export const deleteWorkflow = (id) => ({
  type: DELETE_WORKFLOW,
  payload: id,
});

export const deleteWorkflowSuccess = () => ({
  type: DELETE_WORKFLOW_SUCCESS,
});

export const deleteWorkflowFail = (error) => ({
  type: DELETE_WORKFLOW_FAIL,
  payload: error,
});

export const toggleWorkflowStatus = (id, data) => ({
  type: TOGGLE_WORKFLOW_STATUS,
  payload: { id, data },
});

export const toggleWorkflowStatusSuccess = (workflow) => ({
  type: TOGGLE_WORKFLOW_STATUS_SUCCESS,
  payload: workflow,
});

export const toggleWorkflowStatusFail = (error) => ({
  type: TOGGLE_WORKFLOW_STATUS_FAIL,
  payload: error,
});

export const runWorkflow = (id) => ({
  type: RUN_WORKFLOW,
  payload: id,
});

export const runWorkflowSuccess = (result) => ({
  type: RUN_WORKFLOW_SUCCESS,
  payload: result,
});

export const runWorkflowFail = (error) => ({
  type: RUN_WORKFLOW_FAIL,
  payload: error,
});

export const previewWorkflowAudience = (id) => ({
  type: PREVIEW_WORKFLOW_AUDIENCE,
  payload: id,
});

export const previewWorkflowAudienceSuccess = (data) => ({
  type: PREVIEW_WORKFLOW_AUDIENCE_SUCCESS,
  payload: data,
});

export const previewWorkflowAudienceFail = (error) => ({
  type: PREVIEW_WORKFLOW_AUDIENCE_FAIL,
  payload: error,
});

export const testWorkflowTrigger = (id, data) => ({
  type: TEST_WORKFLOW_TRIGGER,
  payload: { id, data },
});

export const testWorkflowTriggerSuccess = (result) => ({
  type: TEST_WORKFLOW_TRIGGER_SUCCESS,
  payload: result,
});

export const testWorkflowTriggerFail = (error) => ({
  type: TEST_WORKFLOW_TRIGGER_FAIL,
  payload: error,
});

// ============================================
// ENROLLMENT ACTIONS
// ============================================

export const getWorkflowEnrollments = (id, page = 1, limit = 50) => ({
  type: GET_WORKFLOW_ENROLLMENTS,
  payload: { id, page, limit },
});

export const getWorkflowEnrollmentsSuccess = (data) => ({
  type: GET_WORKFLOW_ENROLLMENTS_SUCCESS,
  payload: data,
});

export const getWorkflowEnrollmentsFail = (error) => ({
  type: GET_WORKFLOW_ENROLLMENTS_FAIL,
  payload: error,
});

export const enrollCustomer = (id, data) => ({
  type: ENROLL_CUSTOMER,
  payload: { id, data },
});

export const enrollCustomerSuccess = (enrollment) => ({
  type: ENROLL_CUSTOMER_SUCCESS,
  payload: enrollment,
});

export const enrollCustomerFail = (error) => ({
  type: ENROLL_CUSTOMER_FAIL,
  payload: error,
});

export const cancelEnrollment = (enrollmentId) => ({
  type: CANCEL_ENROLLMENT,
  payload: enrollmentId,
});

export const cancelEnrollmentSuccess = () => ({
  type: CANCEL_ENROLLMENT_SUCCESS,
});

export const cancelEnrollmentFail = (error) => ({
  type: CANCEL_ENROLLMENT_FAIL,
  payload: error,
});

export const processEnrollmentNow = (enrollmentId) => ({
  type: PROCESS_ENROLLMENT_NOW,
  payload: enrollmentId,
});

export const processEnrollmentNowSuccess = () => ({
  type: PROCESS_ENROLLMENT_NOW_SUCCESS,
});

export const processEnrollmentNowFail = (error) => ({
  type: PROCESS_ENROLLMENT_NOW_FAIL,
  payload: error,
});

// ============================================
// TEMPLATE ACTIONS
// ============================================

export const getEmailTemplates = () => ({
  type: GET_EMAIL_TEMPLATES,
});

export const getEmailTemplatesSuccess = (templates) => ({
  type: GET_EMAIL_TEMPLATES_SUCCESS,
  payload: templates,
});

export const getEmailTemplatesFail = (error) => ({
  type: GET_EMAIL_TEMPLATES_FAIL,
  payload: error,
});

// ============================================
// SEGMENT ACTIONS
// ============================================

export const getSegments = () => ({
  type: GET_SEGMENTS,
});

export const getSegmentsSuccess = (segments) => ({
  type: GET_SEGMENTS_SUCCESS,
  payload: segments,
});

export const getSegmentsFail = (error) => ({
  type: GET_SEGMENTS_FAIL,
  payload: error,
});

export const getSegmentById = (id) => ({
  type: GET_SEGMENT_BY_ID,
  payload: id,
});

export const getSegmentByIdSuccess = (segment) => ({
  type: GET_SEGMENT_BY_ID_SUCCESS,
  payload: segment,
});

export const getSegmentByIdFail = (error) => ({
  type: GET_SEGMENT_BY_ID_FAIL,
  payload: error,
});

export const createSegment = (data) => ({
  type: CREATE_SEGMENT,
  payload: data,
});

export const createSegmentSuccess = (segment) => ({
  type: CREATE_SEGMENT_SUCCESS,
  payload: segment,
});

export const createSegmentFail = (error) => ({
  type: CREATE_SEGMENT_FAIL,
  payload: error,
});

export const updateSegment = (id, data) => ({
  type: UPDATE_SEGMENT,
  payload: { id, data },
});

export const updateSegmentSuccess = (segment) => ({
  type: UPDATE_SEGMENT_SUCCESS,
  payload: segment,
});

export const updateSegmentFail = (error) => ({
  type: UPDATE_SEGMENT_FAIL,
  payload: error,
});

export const deleteSegment = (id) => ({
  type: DELETE_SEGMENT,
  payload: id,
});

export const deleteSegmentSuccess = () => ({
  type: DELETE_SEGMENT_SUCCESS,
});

export const deleteSegmentFail = (error) => ({
  type: DELETE_SEGMENT_FAIL,
  payload: error,
});

export const previewSegment = (data) => ({
  type: PREVIEW_SEGMENT,
  payload: data,
});

export const previewSegmentSuccess = (data) => ({
  type: PREVIEW_SEGMENT_SUCCESS,
  payload: data,
});

export const previewSegmentFail = (error) => ({
  type: PREVIEW_SEGMENT_FAIL,
  payload: error,
});

export const addSegmentMembers = (id, data) => ({
  type: ADD_SEGMENT_MEMBERS,
  payload: { id, data },
});

export const addSegmentMembersSuccess = (result) => ({
  type: ADD_SEGMENT_MEMBERS_SUCCESS,
  payload: result,
});

export const addSegmentMembersFail = (error) => ({
  type: ADD_SEGMENT_MEMBERS_FAIL,
  payload: error,
});

export const importSegmentFromBucket = (id, data) => ({
  type: IMPORT_SEGMENT_FROM_BUCKET,
  payload: { id, data },
});

export const importSegmentFromBucketSuccess = (result) => ({
  type: IMPORT_SEGMENT_FROM_BUCKET_SUCCESS,
  payload: result,
});

export const importSegmentFromBucketFail = (error) => ({
  type: IMPORT_SEGMENT_FROM_BUCKET_FAIL,
  payload: error,
});

// ============================================
// CUSTOMER BUCKET ACTIONS
// ============================================

export const getCustomerBuckets = () => ({
  type: GET_CUSTOMER_BUCKETS,
});

export const getCustomerBucketsSuccess = (buckets) => ({
  type: GET_CUSTOMER_BUCKETS_SUCCESS,
  payload: buckets,
});

export const getCustomerBucketsFail = (error) => ({
  type: GET_CUSTOMER_BUCKETS_FAIL,
  payload: error,
});

export const getBucketCustomers = (bucketId, page = 1, limit = 50) => ({
  type: GET_BUCKET_CUSTOMERS,
  payload: { bucketId, page, limit },
});

export const getBucketCustomersSuccess = (data) => ({
  type: GET_BUCKET_CUSTOMERS_SUCCESS,
  payload: data,
});

export const getBucketCustomersFail = (error) => ({
  type: GET_BUCKET_CUSTOMERS_FAIL,
  payload: error,
});

// ============================================
// WORKFLOW AUDIENCE ACTIONS
// ============================================

export const updateWorkflowAudience = (id, data) => ({
  type: UPDATE_WORKFLOW_AUDIENCE,
  payload: { id, data },
});

export const updateWorkflowAudienceSuccess = (workflow) => ({
  type: UPDATE_WORKFLOW_AUDIENCE_SUCCESS,
  payload: workflow,
});

export const updateWorkflowAudienceFail = (error) => ({
  type: UPDATE_WORKFLOW_AUDIENCE_FAIL,
  payload: error,
});

export const addWorkflowRecipients = (id, data) => ({
  type: ADD_WORKFLOW_RECIPIENTS,
  payload: { id, data },
});

export const addWorkflowRecipientsSuccess = (result) => ({
  type: ADD_WORKFLOW_RECIPIENTS_SUCCESS,
  payload: result,
});

export const addWorkflowRecipientsFail = (error) => ({
  type: ADD_WORKFLOW_RECIPIENTS_FAIL,
  payload: error,
});

export const importWorkflowFromBucket = (id, data) => ({
  type: IMPORT_WORKFLOW_FROM_BUCKET,
  payload: { id, data },
});

export const importWorkflowFromBucketSuccess = (result) => ({
  type: IMPORT_WORKFLOW_FROM_BUCKET_SUCCESS,
  payload: result,
});

export const importWorkflowFromBucketFail = (error) => ({
  type: IMPORT_WORKFLOW_FROM_BUCKET_FAIL,
  payload: error,
});

// ============================================
// TRIGGER TYPES ACTIONS
// ============================================

export const getTriggerTypes = () => ({
  type: GET_TRIGGER_TYPES,
});

export const getTriggerTypesSuccess = (triggers) => ({
  type: GET_TRIGGER_TYPES_SUCCESS,
  payload: triggers,
});

export const getTriggerTypesFail = (error) => ({
  type: GET_TRIGGER_TYPES_FAIL,
  payload: error,
});

