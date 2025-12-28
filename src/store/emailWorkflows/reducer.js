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

const initialState = {
  // Workflows
  workflows: [],
  currentWorkflow: null,
  workflowsLoading: false,
  workflowsError: null,

  // Enrollments
  enrollments: [],
  enrollmentsPagination: null,
  enrollmentsLoading: false,
  enrollmentsError: null,

  // Templates
  templates: [],
  templatesLoading: false,
  templatesError: null,

  // Segments
  segments: [],
  currentSegment: null,
  segmentsLoading: false,
  segmentsError: null,

  // Customer Buckets
  buckets: [],
  bucketCustomers: [],
  bucketsLoading: false,
  bucketsError: null,

  // Workflow Audience Preview
  audiencePreview: null,
  audiencePreviewLoading: false,
  audiencePreviewError: null,

  // Segment Preview
  segmentPreview: null,
  segmentPreviewLoading: false,
  segmentPreviewError: null,

  // Trigger Types
  triggerTypes: [],
  triggerTypesLoading: false,
  triggerTypesError: null,

  // Action Results
  actionResult: null,
  actionLoading: false,
  actionError: null,
};

const emailWorkflowsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ============================================
    // WORKFLOW ACTIONS
    // ============================================
    case GET_WORKFLOW_LIST:
      return {
        ...state,
        workflowsLoading: true,
        workflowsError: null,
      };

    case GET_WORKFLOW_LIST_SUCCESS:
      return {
        ...state,
        workflowsLoading: false,
        workflows: action.payload?.data || action.payload || [],
        workflowsError: null,
      };

    case GET_WORKFLOW_LIST_FAIL:
      return {
        ...state,
        workflowsLoading: false,
        workflowsError: action.payload,
      };

    case GET_WORKFLOW_BY_ID:
      return {
        ...state,
        workflowsLoading: true,
        workflowsError: null,
      };

    case GET_WORKFLOW_BY_ID_SUCCESS:
      return {
        ...state,
        workflowsLoading: false,
        currentWorkflow: action.payload?.data || action.payload,
        workflowsError: null,
      };

    case GET_WORKFLOW_BY_ID_FAIL:
      return {
        ...state,
        workflowsLoading: false,
        workflowsError: action.payload,
      };

    case CREATE_WORKFLOW:
    case UPDATE_WORKFLOW:
    case DELETE_WORKFLOW:
    case TOGGLE_WORKFLOW_STATUS:
    case RUN_WORKFLOW:
      return {
        ...state,
        actionLoading: true,
        actionError: null,
      };

    case CREATE_WORKFLOW_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        workflows: [action.payload?.data || action.payload, ...state.workflows],
        actionError: null,
      };

    case UPDATE_WORKFLOW_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        currentWorkflow: action.payload?.data || action.payload,
        workflows: state.workflows.map((w) =>
          w._id === (action.payload?.data?._id || action.payload?._id)
            ? action.payload?.data || action.payload
            : w
        ),
        actionError: null,
      };

    case DELETE_WORKFLOW_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        workflows: state.workflows.filter(
          (w) => w._id !== action.payload
        ),
        actionError: null,
      };

    case TOGGLE_WORKFLOW_STATUS_SUCCESS:
    case RUN_WORKFLOW_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        currentWorkflow: action.payload?.data || action.payload,
        actionError: null,
      };

    case CREATE_WORKFLOW_FAIL:
    case UPDATE_WORKFLOW_FAIL:
    case DELETE_WORKFLOW_FAIL:
    case TOGGLE_WORKFLOW_STATUS_FAIL:
    case RUN_WORKFLOW_FAIL:
      return {
        ...state,
        actionLoading: false,
        actionError: action.payload,
      };

    case PREVIEW_WORKFLOW_AUDIENCE:
      return {
        ...state,
        audiencePreviewLoading: true,
        audiencePreviewError: null,
      };

    case PREVIEW_WORKFLOW_AUDIENCE_SUCCESS:
      return {
        ...state,
        audiencePreviewLoading: false,
        audiencePreview: action.payload?.data || action.payload,
        audiencePreviewError: null,
      };

    case PREVIEW_WORKFLOW_AUDIENCE_FAIL:
      return {
        ...state,
        audiencePreviewLoading: false,
        audiencePreviewError: action.payload,
      };

    case TEST_WORKFLOW_TRIGGER:
      return {
        ...state,
        actionLoading: true,
        actionError: null,
      };

    case TEST_WORKFLOW_TRIGGER_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        actionError: null,
      };

    case TEST_WORKFLOW_TRIGGER_FAIL:
      return {
        ...state,
        actionLoading: false,
        actionError: action.payload,
      };

    // ============================================
    // ENROLLMENT ACTIONS
    // ============================================
    case GET_WORKFLOW_ENROLLMENTS:
      return {
        ...state,
        enrollmentsLoading: true,
        enrollmentsError: null,
      };

    case GET_WORKFLOW_ENROLLMENTS_SUCCESS:
      return {
        ...state,
        enrollmentsLoading: false,
        enrollments: action.payload?.data?.enrollments || action.payload?.enrollments || [],
        enrollmentsPagination: action.payload?.data?.pagination || action.payload?.pagination || null,
        enrollmentsError: null,
      };

    case GET_WORKFLOW_ENROLLMENTS_FAIL:
      return {
        ...state,
        enrollmentsLoading: false,
        enrollmentsError: action.payload,
      };

    case ENROLL_CUSTOMER:
    case CANCEL_ENROLLMENT:
    case PROCESS_ENROLLMENT_NOW:
      return {
        ...state,
        actionLoading: true,
        actionError: null,
      };

    case ENROLL_CUSTOMER_SUCCESS:
    case CANCEL_ENROLLMENT_SUCCESS:
    case PROCESS_ENROLLMENT_NOW_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        actionError: null,
      };

    case ENROLL_CUSTOMER_FAIL:
    case CANCEL_ENROLLMENT_FAIL:
    case PROCESS_ENROLLMENT_NOW_FAIL:
      return {
        ...state,
        actionLoading: false,
        actionError: action.payload,
      };

    // ============================================
    // TEMPLATE ACTIONS
    // ============================================
    case GET_EMAIL_TEMPLATES:
      return {
        ...state,
        templatesLoading: true,
        templatesError: null,
      };

    case GET_EMAIL_TEMPLATES_SUCCESS:
      return {
        ...state,
        templatesLoading: false,
        templates: action.payload?.data || action.payload || [],
        templatesError: null,
      };

    case GET_EMAIL_TEMPLATES_FAIL:
      return {
        ...state,
        templatesLoading: false,
        templatesError: action.payload,
      };

    // ============================================
    // SEGMENT ACTIONS
    // ============================================
    case GET_SEGMENTS:
      return {
        ...state,
        segmentsLoading: true,
        segmentsError: null,
      };

    case GET_SEGMENTS_SUCCESS:
      return {
        ...state,
        segmentsLoading: false,
        segments: action.payload?.data || action.payload || [],
        segmentsError: null,
      };

    case GET_SEGMENTS_FAIL:
      return {
        ...state,
        segmentsLoading: false,
        segmentsError: action.payload,
      };

    case GET_SEGMENT_BY_ID:
      return {
        ...state,
        segmentsLoading: true,
        segmentsError: null,
      };

    case GET_SEGMENT_BY_ID_SUCCESS:
      return {
        ...state,
        segmentsLoading: false,
        currentSegment: action.payload?.data || action.payload,
        segmentsError: null,
      };

    case GET_SEGMENT_BY_ID_FAIL:
      return {
        ...state,
        segmentsLoading: false,
        segmentsError: action.payload,
      };

    case CREATE_SEGMENT:
    case UPDATE_SEGMENT:
    case DELETE_SEGMENT:
    case ADD_SEGMENT_MEMBERS:
    case IMPORT_SEGMENT_FROM_BUCKET:
      return {
        ...state,
        actionLoading: true,
        actionError: null,
      };

    case CREATE_SEGMENT_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        segments: [action.payload?.data || action.payload, ...state.segments],
        actionError: null,
      };

    case UPDATE_SEGMENT_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        currentSegment: action.payload?.data || action.payload,
        segments: state.segments.map((s) =>
          s._id === (action.payload?.data?._id || action.payload?._id)
            ? action.payload?.data || action.payload
            : s
        ),
        actionError: null,
      };

    case DELETE_SEGMENT_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        segments: state.segments.filter(
          (s) => s._id !== action.payload
        ),
        actionError: null,
      };

    case ADD_SEGMENT_MEMBERS_SUCCESS:
    case IMPORT_SEGMENT_FROM_BUCKET_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        actionError: null,
      };

    case CREATE_SEGMENT_FAIL:
    case UPDATE_SEGMENT_FAIL:
    case DELETE_SEGMENT_FAIL:
    case ADD_SEGMENT_MEMBERS_FAIL:
    case IMPORT_SEGMENT_FROM_BUCKET_FAIL:
      return {
        ...state,
        actionLoading: false,
        actionError: action.payload,
      };

    case PREVIEW_SEGMENT:
      return {
        ...state,
        segmentPreviewLoading: true,
        segmentPreviewError: null,
      };

    case PREVIEW_SEGMENT_SUCCESS:
      return {
        ...state,
        segmentPreviewLoading: false,
        segmentPreview: action.payload?.data || action.payload,
        segmentPreviewError: null,
      };

    case PREVIEW_SEGMENT_FAIL:
      return {
        ...state,
        segmentPreviewLoading: false,
        segmentPreviewError: action.payload,
      };

    // ============================================
    // CUSTOMER BUCKET ACTIONS
    // ============================================
    case GET_CUSTOMER_BUCKETS:
      return {
        ...state,
        bucketsLoading: true,
        bucketsError: null,
      };

    case GET_CUSTOMER_BUCKETS_SUCCESS:
      return {
        ...state,
        bucketsLoading: false,
        buckets: action.payload?.data || action.payload || [],
        bucketsError: null,
      };

    case GET_CUSTOMER_BUCKETS_FAIL:
      return {
        ...state,
        bucketsLoading: false,
        bucketsError: action.payload,
      };

    case GET_BUCKET_CUSTOMERS:
      return {
        ...state,
        bucketsLoading: true,
        bucketsError: null,
      };

    case GET_BUCKET_CUSTOMERS_SUCCESS:
      return {
        ...state,
        bucketsLoading: false,
        bucketCustomers: action.payload?.data?.customers || action.payload?.customers || [],
        bucketsError: null,
      };

    case GET_BUCKET_CUSTOMERS_FAIL:
      return {
        ...state,
        bucketsLoading: false,
        bucketsError: action.payload,
      };

    // ============================================
    // WORKFLOW AUDIENCE ACTIONS
    // ============================================
    case UPDATE_WORKFLOW_AUDIENCE:
    case ADD_WORKFLOW_RECIPIENTS:
    case IMPORT_WORKFLOW_FROM_BUCKET:
      return {
        ...state,
        actionLoading: true,
        actionError: null,
      };

    case UPDATE_WORKFLOW_AUDIENCE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        currentWorkflow: action.payload?.data || action.payload,
        actionError: null,
      };

    case ADD_WORKFLOW_RECIPIENTS_SUCCESS:
    case IMPORT_WORKFLOW_FROM_BUCKET_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        actionResult: action.payload?.data || action.payload,
        actionError: null,
      };

    case UPDATE_WORKFLOW_AUDIENCE_FAIL:
    case ADD_WORKFLOW_RECIPIENTS_FAIL:
    case IMPORT_WORKFLOW_FROM_BUCKET_FAIL:
      return {
        ...state,
        actionLoading: false,
        actionError: action.payload,
      };

    // ============================================
    // TRIGGER TYPES ACTIONS
    // ============================================
    case GET_TRIGGER_TYPES:
      return {
        ...state,
        triggerTypesLoading: true,
        triggerTypesError: null,
      };

    case GET_TRIGGER_TYPES_SUCCESS:
      return {
        ...state,
        triggerTypesLoading: false,
        triggerTypes: action.payload?.data || action.payload || [],
        triggerTypesError: null,
      };

    case GET_TRIGGER_TYPES_FAIL:
      return {
        ...state,
        triggerTypesLoading: false,
        triggerTypesError: action.payload,
      };

    default:
      return state;
  }
};

export default emailWorkflowsReducer;

