import { get, post, put, del } from "./api_helper";

// ============================================
// WORKFLOW APIs
// ============================================

export const getWorkflowListAPI = () => {
  return get("/v1/tyl-email-campaigns/workflows");
};

export const getWorkflowByIdAPI = (id) => {
  return get(`/v1/tyl-email-campaigns/workflows/${id}`);
};

export const createWorkflowAPI = (data) => {
  return post("/v1/tyl-email-campaigns/workflows/create", data);
};

export const updateWorkflowAPI = (id, data) => {
  return put(`/v1/tyl-email-campaigns/workflows/${id}`, data);
};

export const deleteWorkflowAPI = (id) => {
  return del(`/v1/tyl-email-campaigns/workflows/${id}`);
};

export const toggleWorkflowStatusAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/toggle`, data);
};

export const runWorkflowAPI = (id) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/run`);
};

export const previewWorkflowAudienceAPI = (id) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/preview-audience`);
};

export const testWorkflowTriggerAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/test-trigger`, data);
};

// ============================================
// ENROLLMENT APIs
// ============================================

export const getWorkflowEnrollmentsAPI = (id, page = 1, limit = 50) => {
  return get(`/v1/tyl-email-campaigns/workflows/${id}/enrollments?page=${page}&limit=${limit}`);
};

export const enrollCustomerAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/enroll`, data);
};

export const cancelEnrollmentAPI = (enrollmentId) => {
  return post(`/v1/tyl-email-campaigns/enrollments/${enrollmentId}/cancel`);
};

export const processEnrollmentNowAPI = (enrollmentId) => {
  return post(`/v1/tyl-email-campaigns/enrollments/${enrollmentId}/process-now`);
};

// ============================================
// TEMPLATE APIs
// ============================================

export const getEmailTemplatesAPI = () => {
  return get("/v1/tyl-email-templates");
};

// ============================================
// SEGMENT APIs
// ============================================

export const getSegmentsAPI = () => {
  return get("/v1/tyl-email-campaigns/segments");
};

export const getSegmentByIdAPI = (id) => {
  return get(`/v1/tyl-email-campaigns/segments/${id}`);
};

export const createSegmentAPI = (data) => {
  return post("/v1/tyl-email-campaigns/segments/create", data);
};

export const updateSegmentAPI = (id, data) => {
  return put(`/v1/tyl-email-campaigns/segments/${id}`, data);
};

export const deleteSegmentAPI = (id) => {
  return del(`/v1/tyl-email-campaigns/segments/${id}`);
};

export const previewSegmentAPI = (data) => {
  return post("/v1/tyl-email-campaigns/segments/preview", data);
};

export const addSegmentMembersAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/segments/${id}/add-members`, data);
};

export const importSegmentFromBucketAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/segments/${id}/import-from-bucket`, data);
};

// ============================================
// CUSTOMER BUCKET APIs
// ============================================

export const getCustomerBucketsAPI = () => {
  return get("/v1/tyl-email-campaigns/customer-buckets");
};

export const getBucketCustomersAPI = (bucketId, page = 1, limit = 50) => {
  return get(`/v1/tyl-email-campaigns/customer-buckets/${bucketId}/customers?page=${page}&limit=${limit}`);
};

// ============================================
// WORKFLOW AUDIENCE APIs
// ============================================

export const updateWorkflowAudienceAPI = (id, data) => {
  return put(`/v1/tyl-email-campaigns/workflows/${id}/audience`, data);
};

export const addWorkflowRecipientsAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/add-recipients`, data);
};

export const importWorkflowFromBucketAPI = (id, data) => {
  return post(`/v1/tyl-email-campaigns/workflows/${id}/import-from-bucket`, data);
};

// ============================================
// TRIGGER TYPES API
// ============================================

export const getTriggerTypesAPI = () => {
  return get("/v1/tyl-email-campaigns/workflows/triggers");
};

