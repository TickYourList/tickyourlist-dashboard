import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Label,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
  Spinner,
  Table,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Progress,
} from "reactstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import classnames from "classnames";

// Redux Actions
import {
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  getWorkflowEnrollments,
  processEnrollmentNow,
  runWorkflow,
  previewWorkflowAudience,
  testWorkflowTrigger,
  getEmailTemplates,
  getSegments,
  getCustomerBuckets,
  addWorkflowRecipients,
  importWorkflowFromBucket,
} from "../../store/emailWorkflows/actions";

// Trigger options
const TRIGGER_OPTIONS = [
  { value: "booking_confirmed", label: "Booking Confirmed", icon: "bx-calendar-check", description: "When a booking is completed", category: "event" },
  { value: "booking_cancelled", label: "Booking Cancelled", icon: "bx-calendar-x", description: "When a booking is cancelled", category: "event" },
  { value: "booking_refunded", label: "Booking Refunded", icon: "bx-money", description: "When a refund is processed", category: "event" },
  { value: "signup", label: "New Signup", icon: "bx-user-plus", description: "When a customer registers", category: "event" },
  { value: "post_experience", label: "Post Experience", icon: "bx-star", description: "Day after the experience", category: "scheduled" },
  { value: "pre_experience_reminder", label: "Pre-Experience Reminder", icon: "bx-bell", description: "Before the experience date", category: "scheduled" },
  { value: "no_booking_days", label: "Inactive Customer", icon: "bx-time", description: "No booking in X days", category: "scheduled" },
  { value: "segment_based", label: "Segment Based", icon: "bx-filter", description: "Target a customer segment", category: "segment" },
  { value: "manual", label: "Manual Trigger", icon: "bx-hand", description: "Run manually with selected customers", category: "manual" },
];

// Audience types
const AUDIENCE_TYPES = [
  { value: "event_triggered", label: "Event Triggered", description: "Customers who trigger the event", icon: "bx-bolt" },
  { value: "all_customers", label: "All Customers", description: "Send to all customers", icon: "bx-group" },
  { value: "segment", label: "Segment", description: "Use a customer segment", icon: "bx-filter-alt" },
  { value: "manual_list", label: "Manual List", description: "Select specific customers", icon: "bx-list-check" },
  { value: "booking_based", label: "Booking Based", description: "Filter by booking criteria", icon: "bx-calendar" },
];

// Step types
const STEP_TYPES = [
  { value: "email", label: "Send Email", icon: "bx-mail-send", color: "primary" },
  { value: "wait", label: "Wait/Delay", icon: "bx-time-five", color: "warning" },
];

// Template types
const TEMPLATE_TYPES = [
  { value: "booking_confirmation", label: "Booking Confirmation" },
  { value: "reminder", label: "Reminder" },
  { value: "experience_feedback", label: "Experience Feedback" },
  { value: "promotional", label: "Promotional" },
  { value: "newsletter", label: "Newsletter" },
  { value: "welcome", label: "Welcome" },
  { value: "ticket_cancellation", label: "Ticket Cancellation" },
  { value: "refund_processed", label: "Refund Processed" },
  { value: "custom", label: "Custom" },
];

const WorkflowEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  document.title = `${isEditMode ? "Edit" : "Create"} Workflow | TickYourList Dashboard`;

  // Redux State
  const {
    currentWorkflow,
    workflowsLoading,
    workflowsError,
    enrollments,
    enrollmentsPagination,
    enrollmentsLoading,
    templates,
    templatesLoading,
    segments,
    segmentsLoading,
    buckets,
    bucketsLoading,
    audiencePreview,
    audiencePreviewLoading,
    actionLoading,
    actionResult,
    actionError,
  } = useSelector((state) => state.emailWorkflows);

  // Form state
  const [activeTab, setActiveTab] = useState("1");
  const [workflow, setWorkflow] = useState({
    name: "",
    description: "",
    trigger: "booking_confirmed",
    triggerConfig: {},
    audience: {
      type: "event_triggered",
      manualRecipients: [],
      segmentId: null,
      bookingFilter: {},
      excludeRecentlyEmailed: false,
      excludeRecentlyEmailedDays: 7,
    },
    steps: [],
    status: "draft",
    customization: {
      primaryColor: "#4CAF50",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
  });

  // UI State
  const [stepModal, setStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);
  const [testModal, setTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [importModal, setImportModal] = useState(false);
  const [importEmails, setImportEmails] = useState("");

  // Sync Redux state to local workflow state
  useEffect(() => {
    if (currentWorkflow && isEditMode) {
      setWorkflow({
        ...currentWorkflow,
        steps: currentWorkflow.steps || [],
        audience: currentWorkflow.audience || {
          type: "event_triggered",
          manualRecipients: [],
        },
      });
    }
  }, [currentWorkflow, isEditMode]);

  // Show toast on action success/error
  useEffect(() => {
    if (actionResult) {
      if (actionResult.success !== false) {
        toastr.success(actionResult.message || "Action completed successfully!");
      }
    }
  }, [actionResult]);

  useEffect(() => {
    if (actionError) {
      toastr.error(actionError.message || actionError || "An error occurred");
    }
  }, [actionError]);

  // Fetch data
  useEffect(() => {
    if (isEditMode) {
      dispatch(getWorkflowById(id));
    } else {
      // Check for template param
      const template = searchParams.get("template");
      if (template) {
        applyTemplate(template);
      }
    }
    dispatch(getEmailTemplates());
    dispatch(getSegments());
    dispatch(getCustomerBuckets());
  }, [id, dispatch]);

  // Fetch functions now use Redux - no need for local fetch functions
  // Data is automatically fetched via useEffect and stored in Redux

  const applyTemplate = (templateId) => {
    const templates = {
      welcome: {
        name: "Welcome Series",
        description: "Send a series of welcome emails to new customers",
        trigger: "signup",
        audience: { type: "event_triggered" },
        steps: [
          { stepId: "step_1", type: "email", templateType: "welcome", subject: "Welcome to TickYourList! 🎉", order: 1, isActive: true },
          { stepId: "step_2", type: "wait", waitDays: 2, order: 2, isActive: true },
          { stepId: "step_3", type: "email", templateType: "promotional", subject: "Discover Amazing Experiences Near You", order: 3, isActive: true },
        ],
      },
      post_booking: {
        name: "Post-Booking Sequence",
        description: "Remind customers before and ask for feedback after their experience",
        trigger: "booking_confirmed",
        audience: { type: "event_triggered" },
        steps: [
          { stepId: "step_1", type: "wait", waitDays: 1, order: 1, isActive: true },
          { stepId: "step_2", type: "email", templateType: "reminder", subject: "Your Adventure Awaits Tomorrow! 🗺️", order: 2, isActive: true },
        ],
      },
      winback: {
        name: "Win-Back Campaign",
        description: "Re-engage customers who haven't booked in a while",
        trigger: "no_booking_days",
        triggerConfig: { daysSinceLastBooking: 60 },
        audience: { type: "event_triggered" },
        steps: [
          { stepId: "step_1", type: "email", templateType: "promotional", subject: "We Miss You! Here's 15% Off Your Next Adventure", order: 1, isActive: true },
          { stepId: "step_2", type: "wait", waitDays: 7, order: 2, isActive: true },
          { stepId: "step_3", type: "email", templateType: "newsletter", subject: "Check Out What's New at TickYourList", order: 3, isActive: true },
        ],
      },
    };

    if (templates[templateId]) {
      setWorkflow({ ...workflow, ...templates[templateId] });
    }
  };

  const handleSave = () => {
    if (!workflow.name) {
      toastr.error("Workflow name is required");
      return;
    }

    if (workflow.steps.length === 0) {
      toastr.error("Add at least one step to the workflow");
      return;
    }

    const payload = {
      ...workflow,
      steps: workflow.steps.map((step, idx) => ({
        ...step,
        stepId: step.stepId || `step_${idx + 1}`,
        order: idx + 1,
        isActive: true,
      })),
    };

    if (isEditMode) {
      dispatch(updateWorkflow(id, payload));
    } else {
      dispatch(createWorkflow(payload));
    }
  };

  // Navigate after successful save
  useEffect(() => {
    if (actionResult && (actionResult.success || actionResult.data)) {
      if (actionResult.message?.includes("created") || actionResult.message?.includes("updated")) {
        setTimeout(() => {
          navigate("/email-workflows");
        }, 1000);
      }
    }
  }, [actionResult, navigate]);

  const handleRunWorkflow = () => {
    if (!id) return;
    dispatch(runWorkflow(id));
    // Refresh enrollments and workflow after a delay
    setTimeout(() => {
      dispatch(getWorkflowEnrollments(id));
      dispatch(getWorkflowById(id));
    }, 2000);
  };

  const handleImportFromBucket = (bucketId) => {
    if (!id) {
      toastr.error("Save the workflow first before importing customers");
      return;
    }
    
    dispatch(importWorkflowFromBucket(id, {
      bucketId,
      limit: 10000,
    }));
    
    // Refresh workflow after import
    setTimeout(() => {
      dispatch(getWorkflowById(id));
    }, 2000);
  };

  const handleImportEmails = () => {
    if (!id) {
      toastr.error("Save the workflow first before importing customers");
      return;
    }

    const emails = importEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e && e.includes("@"));
    
    if (emails.length === 0) {
      toastr.error("No valid emails found");
      return;
    }

    dispatch(addWorkflowRecipients(id, {
      recipients: emails.map(email => ({ email })),
    }));
    
    // Clear and refresh after success
    setTimeout(() => {
      if (actionResult?.success) {
        setImportModal(false);
        setImportEmails("");
        dispatch(getWorkflowById(id));
      }
    }, 2000);
  };

  // Step handlers
  const handleAddStep = () => {
    setEditingStep({
      type: "email",
      templateType: "promotional",
      subject: "",
      waitDays: 1,
      waitHours: 0,
      waitMinutes: 0,
    });
    setEditingStepIndex(-1);
    setStepModal(true);
  };

  const handleEditStep = (step, index) => {
    setEditingStep({ ...step });
    setEditingStepIndex(index);
    setStepModal(true);
  };

  const handleSaveStep = () => {
    if (!editingStep) return;

    if (editingStep.type === "email" && !editingStep.subject) {
      toastr.error("Subject is required for email steps");
      return;
    }

    const newSteps = [...workflow.steps];
    const step = {
      ...editingStep,
      stepId: editingStep.stepId || `step_${Date.now()}`,
    };

    if (editingStepIndex >= 0) {
      newSteps[editingStepIndex] = step;
    } else {
      newSteps.push(step);
    }

    setWorkflow({ ...workflow, steps: newSteps });
    setStepModal(false);
    setEditingStep(null);
    setEditingStepIndex(-1);
  };

  const handleDeleteStep = (index) => {
    const newSteps = workflow.steps.filter((_, i) => i !== index);
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...workflow.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const handleTestTrigger = () => {
    if (!testEmail) {
      toastr.error("Email is required");
      return;
    }

    dispatch(testWorkflowTrigger(id, {
      email: testEmail,
      firstName: "Test",
      lastName: "User",
    }));

    // Close modal and refresh enrollments on success
    setTimeout(() => {
      if (actionResult?.success) {
        setTestModal(false);
        setTestEmail("");
        dispatch(getWorkflowEnrollments(id));
      }
    }, 2000);
  };

  const handleToggleStatus = () => {
    const newStatus = workflow.status === "active" ? "paused" : "active";
    dispatch(updateWorkflow(id, {
      ...workflow,
      status: newStatus,
    }));
  };

  const handleProcessNow = (enrollmentId) => {
    dispatch(processEnrollmentNow(enrollmentId));
    // Refresh enrollments and workflow after processing
    setTimeout(() => {
      dispatch(getWorkflowEnrollments(id));
      dispatch(getWorkflowById(id));
    }, 2000);
  };

  const previewAudience = () => {
    if (!id) return;
    dispatch(previewWorkflowAudience(id));
  };

  // Render step card
  const renderStepCard = (step, index) => {
    const stepType = STEP_TYPES.find((t) => t.value === step.type);
    const templateType = TEMPLATE_TYPES.find((t) => t.value === step.templateType);

    return (
      <Card key={step.stepId || index} className="mb-3 border shadow-sm">
        <CardBody className="py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div
                className={`avatar-sm rounded-circle bg-${stepType?.color || "primary"} bg-soft me-3 d-flex align-items-center justify-content-center`}
              >
                <i className={`bx ${stepType?.icon || "bx-question-mark"} text-${stepType?.color || "primary"} font-size-20`}></i>
              </div>
              <div>
                <h6 className="mb-0 font-size-14">
                  Step {index + 1}: {stepType?.label || step.type}
                </h6>
                {step.type === "email" && (
                  <p className="mb-0 text-muted small">
                    Template: {templateType?.label || step.templateType} | Subject: "{step.subject}"
                  </p>
                )}
                {step.type === "wait" && (
                  <p className="mb-0 text-muted small">
                    Wait {step.waitDays > 0 ? `${step.waitDays} day(s) ` : ""}
                    {step.waitHours > 0 ? `${step.waitHours} hour(s) ` : ""}
                    {step.waitMinutes > 0 ? `${step.waitMinutes} minute(s)` : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button size="sm" color="light" onClick={() => handleMoveStep(index, "up")} disabled={index === 0}>
                <i className="bx bx-up-arrow-alt"></i>
              </Button>
              <Button size="sm" color="light" onClick={() => handleMoveStep(index, "down")} disabled={index === workflow.steps.length - 1}>
                <i className="bx bx-down-arrow-alt"></i>
              </Button>
              <Button size="sm" color="primary" outline onClick={() => handleEditStep(step, index)}>
                <i className="bx bx-edit"></i>
              </Button>
              <Button size="sm" color="danger" outline onClick={() => handleDeleteStep(index)}>
                <i className="bx bx-trash"></i>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (workflowsLoading && isEditMode) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading workflow...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Handle error state
  if (workflowsError && isEditMode) {
    toastr.error(workflowsError.message || "Failed to load workflow");
    setTimeout(() => navigate("/email-workflows"), 2000);
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Automations" breadcrumbItem={isEditMode ? "Edit Workflow" : "Create Workflow"} />

          <Row>
            {/* Main Editor */}
            <Col lg={8}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="card-title mb-0">{isEditMode ? "Edit Workflow" : "Create Workflow"}</h4>
                      {isEditMode && (
                        <Badge color={workflow.status === "active" ? "success" : "secondary"} className="mt-2">
                          {workflow.status}
                        </Badge>
                      )}
                    </div>
                    {isEditMode && (
                      <div className="d-flex gap-2">
                        <Button color="info" outline onClick={() => setTestModal(true)}>
                          <i className="bx bx-test-tube me-1"></i> Test
                        </Button>
                        <Button
                          color="success"
                          onClick={handleRunWorkflow}
                          disabled={actionLoading || workflow.status !== "active"}
                        >
                          {actionLoading ? <Spinner size="sm" /> : <i className="bx bx-play me-1"></i>}
                          Run Now
                        </Button>
                        <Button
                          color={workflow.status === "active" ? "warning" : "success"}
                          onClick={handleToggleStatus}
                        >
                          <i className={`bx ${workflow.status === "active" ? "bx-pause" : "bx-play"} me-1`}></i>
                          {workflow.status === "active" ? "Pause" : "Activate"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Nav tabs className="mb-4">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => setActiveTab("1")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-cog me-1"></i> Settings
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => setActiveTab("2")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-group me-1"></i> Audience
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => setActiveTab("3")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-flow me-1"></i> Steps
                      </NavLink>
                    </NavItem>
                    {isEditMode && (
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "4" })}
                          onClick={() => {
                            setActiveTab("4");
                            if (id) dispatch(getWorkflowEnrollments(id));
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="bx bx-user-check me-1"></i> Enrollments
                        </NavLink>
                      </NavItem>
                    )}
                  </Nav>

                  <TabContent activeTab={activeTab}>
                    {/* Settings Tab */}
                    <TabPane tabId="1">
                      <FormGroup>
                        <Label>Workflow Name *</Label>
                        <Input
                          type="text"
                          value={workflow.name}
                          onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                          placeholder="e.g., Welcome Series"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Description</Label>
                        <Input
                          type="textarea"
                          rows="2"
                          value={workflow.description || ""}
                          onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                          placeholder="Describe what this workflow does..."
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Trigger Event *</Label>
                        <Row>
                          {TRIGGER_OPTIONS.map((trigger) => (
                            <Col md={6} lg={4} key={trigger.value} className="mb-2">
                              <div
                                className={`p-3 border rounded h-100 ${workflow.trigger === trigger.value ? "border-primary bg-primary bg-soft" : ""}`}
                                onClick={() => setWorkflow({ ...workflow, trigger: trigger.value })}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="d-flex align-items-start">
                                  <i className={`bx ${trigger.icon} me-2 font-size-18 ${workflow.trigger === trigger.value ? "text-primary" : "text-muted"}`}></i>
                                  <div>
                                    <h6 className="mb-0 font-size-13">{trigger.label}</h6>
                                    <small className="text-muted">{trigger.description}</small>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </FormGroup>

                      {workflow.trigger === "no_booking_days" && (
                        <FormGroup>
                          <Label>Days Since Last Booking</Label>
                          <Input
                            type="number"
                            value={workflow.triggerConfig?.daysSinceLastBooking || 60}
                            onChange={(e) =>
                              setWorkflow({
                                ...workflow,
                                triggerConfig: { ...workflow.triggerConfig, daysSinceLastBooking: parseInt(e.target.value) },
                              })
                            }
                          />
                        </FormGroup>
                      )}

                      {workflow.trigger === "pre_experience_reminder" && (
                        <FormGroup>
                          <Label>Days Before Experience</Label>
                          <Input
                            type="number"
                            value={workflow.triggerConfig?.daysBeforeExperience || 1}
                            onChange={(e) =>
                              setWorkflow({
                                ...workflow,
                                triggerConfig: { ...workflow.triggerConfig, daysBeforeExperience: parseInt(e.target.value) },
                              })
                            }
                          />
                        </FormGroup>
                      )}

                      <hr className="my-4" />
                      <h5 className="mb-3">Recurring Schedule (Optional)</h5>
                      <Alert color="info" className="mb-3">
                        <small>Enable recurring to automatically run this workflow on a schedule (e.g., weekly newsletter)</small>
                      </Alert>
                      
                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          id="isRecurring"
                          checked={workflow.schedule?.isRecurring || false}
                          onChange={(e) =>
                            setWorkflow({
                              ...workflow,
                              schedule: {
                                ...workflow.schedule,
                                isRecurring: e.target.checked,
                                recurrenceType: e.target.checked ? (workflow.schedule?.recurrenceType || "weekly") : undefined,
                              },
                            })
                          }
                        />
                        <Label check for="isRecurring">
                          Enable Recurring Schedule
                        </Label>
                      </FormGroup>

                      {workflow.schedule?.isRecurring && (
                        <>
                          <FormGroup>
                            <Label>Recurrence Type</Label>
                            <Input
                              type="select"
                              value={workflow.schedule?.recurrenceType || "weekly"}
                              onChange={(e) =>
                                setWorkflow({
                                  ...workflow,
                                  schedule: { ...workflow.schedule, recurrenceType: e.target.value },
                                })
                              }
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </Input>
                          </FormGroup>

                          <FormGroup>
                            <Label>Every (Interval)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={workflow.schedule?.recurrenceInterval || 1}
                              onChange={(e) =>
                                setWorkflow({
                                  ...workflow,
                                  schedule: { ...workflow.schedule, recurrenceInterval: parseInt(e.target.value) || 1 },
                                })
                              }
                            />
                            <small className="text-muted">
                              {workflow.schedule?.recurrenceType === "daily" && "days"}
                              {workflow.schedule?.recurrenceType === "weekly" && "weeks"}
                              {workflow.schedule?.recurrenceType === "monthly" && "months"}
                            </small>
                          </FormGroup>

                          {workflow.schedule?.recurrenceType === "weekly" && (
                            <FormGroup>
                              <Label>Days of Week</Label>
                              <div className="d-flex flex-wrap gap-2">
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    color={workflow.schedule?.recurrenceDays?.includes(idx) ? "primary" : "light"}
                                    onClick={() => {
                                      const days = workflow.schedule?.recurrenceDays || [];
                                      const newDays = days.includes(idx)
                                        ? days.filter(d => d !== idx)
                                        : [...days, idx].sort();
                                      setWorkflow({
                                        ...workflow,
                                        schedule: { ...workflow.schedule, recurrenceDays: newDays },
                                      });
                                    }}
                                  >
                                    {day.substring(0, 3)}
                                  </Button>
                                ))}
                              </div>
                            </FormGroup>
                          )}

                          <FormGroup>
                            <Label>Time of Day (24-hour format)</Label>
                            <Input
                              type="time"
                              value={workflow.schedule?.runAt || "09:00"}
                              onChange={(e) =>
                                setWorkflow({
                                  ...workflow,
                                  schedule: { ...workflow.schedule, runAt: e.target.value },
                                })
                              }
                            />
                          </FormGroup>
                        </>
                      )}
                    </TabPane>

                    {/* Audience Tab */}
                    <TabPane tabId="2">
                      <FormGroup>
                        <Label>Audience Type</Label>
                        <Row>
                          {AUDIENCE_TYPES.map((type) => (
                            <Col md={6} key={type.value} className="mb-2">
                              <div
                                className={`p-3 border rounded ${workflow.audience?.type === type.value ? "border-primary bg-primary bg-soft" : ""}`}
                                onClick={() => setWorkflow({
                                  ...workflow,
                                  audience: { ...workflow.audience, type: type.value },
                                })}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="d-flex align-items-center">
                                  <i className={`bx ${type.icon} me-2 font-size-20 ${workflow.audience?.type === type.value ? "text-primary" : "text-muted"}`}></i>
                                  <div>
                                    <h6 className="mb-0">{type.label}</h6>
                                    <small className="text-muted">{type.description}</small>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </FormGroup>

                      {workflow.audience?.type === "segment" && (
                        <FormGroup>
                          <Label>Select Segment</Label>
                          <Input
                            type="select"
                            value={workflow.audience?.segmentId || ""}
                            onChange={(e) => setWorkflow({
                              ...workflow,
                              audience: { ...workflow.audience, segmentId: e.target.value || null },
                            })}
                          >
                            <option value="">-- Select Segment --</option>
                            {segments && segments.length > 0 ? segments.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.memberCount} members)
                              </option>
                            )) : <option>Loading segments...</option>}
                          </Input>
                        </FormGroup>
                      )}

                      {workflow.audience?.type === "manual_list" && (
                        <>
                          <Card className="border mb-3">
                            <CardBody>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                  <i className="bx bx-list-check me-1"></i>
                                  Manual Recipients ({workflow.audience?.manualRecipients?.length || 0})
                                </h6>
                                <Button color="primary" size="sm" onClick={() => setImportModal(true)}>
                                  <i className="bx bx-import me-1"></i> Import Emails
                                </Button>
                              </div>

                              <Label className="small text-muted mb-2">Quick Import from Buckets:</Label>
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                {buckets && buckets.length > 0 ? buckets.map((bucket) => (
                                  <Button
                                    key={bucket.id}
                                    color="light"
                                    size="sm"
                                    onClick={() => handleImportFromBucket(bucket.id)}
                                    disabled={!isEditMode}
                                  >
                                    <i className={`bx ${bucket.icon} me-1`}></i>
                                    {bucket.name} ({bucket.count})
                                  </Button>
                                )) : (
                                  <Spinner size="sm" /> 
                                )}
                              </div>

                              {workflow.audience?.manualRecipients?.length > 0 && (
                                <div className="table-responsive" style={{ maxHeight: "200px" }}>
                                  <Table size="sm" className="mb-0">
                                    <thead>
                                      <tr>
                                        <th>Email</th>
                                        <th>Name</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {workflow.audience.manualRecipients.slice(0, 10).map((r, i) => (
                                        <tr key={i}>
                                          <td>{r.email}</td>
                                          <td>{r.name || "-"}</td>
                                        </tr>
                                      ))}
                                      {workflow.audience.manualRecipients.length > 10 && (
                                        <tr>
                                          <td colSpan="2" className="text-center text-muted">
                                            ... and {workflow.audience.manualRecipients.length - 10} more
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </Table>
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        </>
                      )}

                      {workflow.audience?.type === "booking_based" && (
                        <Card className="border">
                          <CardBody>
                            <h6 className="mb-3">Booking Filters</h6>
                            <Row>
                              <Col md={6}>
                                <FormGroup>
                                  <Label>Booking Status</Label>
                                  <Input
                                    type="select"
                                    multiple
                                    value={workflow.audience?.bookingFilter?.status || []}
                                    onChange={(e) => {
                                      const values = Array.from(e.target.selectedOptions, (o) => o.value);
                                      setWorkflow({
                                        ...workflow,
                                        audience: {
                                          ...workflow.audience,
                                          bookingFilter: { ...workflow.audience.bookingFilter, status: values },
                                        },
                                      });
                                    }}
                                  >
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CANCELLED">Cancelled</option>
                                  </Input>
                                </FormGroup>
                              </Col>
                              <Col md={6}>
                                <FormGroup>
                                  <Label>Last X Days</Label>
                                  <Input
                                    type="number"
                                    value={workflow.audience?.bookingFilter?.daysBack || 30}
                                    onChange={(e) =>
                                      setWorkflow({
                                        ...workflow,
                                        audience: {
                                          ...workflow.audience,
                                          bookingFilter: { ...workflow.audience.bookingFilter, daysBack: parseInt(e.target.value) },
                                        },
                                      })
                                    }
                                  />
                                </FormGroup>
                              </Col>
                              <Col md={6}>
                                <FormGroup>
                                  <Label>Min Amount</Label>
                                  <Input
                                    type="number"
                                    value={workflow.audience?.bookingFilter?.minAmount || ""}
                                    onChange={(e) =>
                                      setWorkflow({
                                        ...workflow,
                                        audience: {
                                          ...workflow.audience,
                                          bookingFilter: { ...workflow.audience.bookingFilter, minAmount: parseInt(e.target.value) || undefined },
                                        },
                                      })
                                    }
                                  />
                                </FormGroup>
                              </Col>
                              <Col md={6}>
                                <FormGroup>
                                  <Label>Max Amount</Label>
                                  <Input
                                    type="number"
                                    value={workflow.audience?.bookingFilter?.maxAmount || ""}
                                    onChange={(e) =>
                                      setWorkflow({
                                        ...workflow,
                                        audience: {
                                          ...workflow.audience,
                                          bookingFilter: { ...workflow.audience.bookingFilter, maxAmount: parseInt(e.target.value) || undefined },
                                        },
                                      })
                                    }
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      )}

                      <FormGroup check className="mt-3">
                        <Input
                          type="checkbox"
                          id="excludeRecent"
                          checked={workflow.audience?.excludeRecentlyEmailed || false}
                          onChange={(e) =>
                            setWorkflow({
                              ...workflow,
                              audience: { ...workflow.audience, excludeRecentlyEmailed: e.target.checked },
                            })
                          }
                        />
                        <Label check for="excludeRecent">
                          Exclude customers emailed in last {workflow.audience?.excludeRecentlyEmailedDays || 7} days
                        </Label>
                      </FormGroup>

                      {isEditMode && (
                        <div className="mt-4">
                          <Button color="info" outline onClick={previewAudience} disabled={audiencePreviewLoading}>
                            {audiencePreviewLoading ? <Spinner size="sm" /> : <i className="bx bx-show me-1"></i>}
                            Preview Audience
                          </Button>
                          {audiencePreview && (
                            <Alert color="info" className="mt-3">
                              <strong>{audiencePreview.count || audiencePreview.data?.count}</strong> recipients will receive this workflow
                              {(audiencePreview.sample || audiencePreview.data?.sample)?.length > 0 && (
                                <div className="mt-2">
                                  <small>Sample: {(audiencePreview.sample || audiencePreview.data?.sample || []).slice(0, 5).map(r => r.email).join(", ")}</small>
                                </div>
                              )}
                            </Alert>
                          )}
                        </div>
                      )}
                    </TabPane>

                    {/* Steps Tab */}
                    <TabPane tabId="3">
                      {isEditMode && workflow.steps && workflow.steps.length > 0 && (
                        <Alert color="warning" className="mb-3">
                          <i className="bx bx-info-circle me-1"></i>
                          <strong>Note:</strong> When you update wait times and save, active enrollments will automatically recalculate their next step time.
                        </Alert>
                      )}
                      {!workflow.steps || workflow.steps.length === 0 ? (
                        <Alert color="info" className="text-center">
                          <h5 className="alert-heading">No steps yet!</h5>
                          <p>Add email and wait steps to build your workflow.</p>
                          <Button color="primary" onClick={handleAddStep}>
                            <i className="bx bx-plus me-1"></i> Add Your First Step
                          </Button>
                        </Alert>
                      ) : (
                        <>
                          {/* Trigger Node */}
                          <div className="text-center mb-3">
                            <Badge color="primary" className="p-2 font-size-12">
                              <i className={`bx ${TRIGGER_OPTIONS.find(t => t.value === workflow.trigger)?.icon} me-1`}></i>
                              {TRIGGER_OPTIONS.find(t => t.value === workflow.trigger)?.label}
                            </Badge>
                          </div>
                          <div className="text-center mb-3">
                            <i className="bx bx-down-arrow-alt text-muted font-size-20"></i>
                          </div>

                          {(workflow.steps || []).map((step, index) => (
                            <React.Fragment key={step.stepId || index}>
                              {renderStepCard(step, index)}
                              {index < (workflow.steps || []).length - 1 && (
                                <div className="text-center mb-3">
                                  <i className="bx bx-down-arrow-alt text-muted font-size-20"></i>
                                </div>
                              )}
                            </React.Fragment>
                          ))}

                          <div className="text-center mt-4">
                            <Button color="success" outline onClick={handleAddStep}>
                              <i className="bx bx-plus me-1"></i> Add Step
                            </Button>
                          </div>
                        </>
                      )}
                    </TabPane>

                    {/* Enrollments Tab */}
                    <TabPane tabId="4">
                      {enrollmentsLoading ? (
                        <div className="text-center py-4">
                          <Spinner size="sm" /> Loading...
                        </div>
                      ) : enrollments.length === 0 ? (
                        <Alert color="info" className="text-center">
                          No customers enrolled yet.
                        </Alert>
                      ) : (
                        <div className="table-responsive">
                          <Table className="table mb-0">
                            <thead>
                              <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Enrolled At</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {enrollments.map((e) => (
                                <tr key={e._id}>
                                  <td>{e.email}</td>
                                  <td>{`${e.firstName || ""} ${e.lastName || ""}`.trim() || "-"}</td>
                                  <td>
                                    <Badge
                                      color={
                                        e.status === "active" ? "success" :
                                        e.status === "completed" ? "primary" :
                                        e.status === "failed" ? "danger" : "secondary"
                                      }
                                    >
                                      {e.status}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Progress
                                      value={(e.currentStepIndex / (e.stepExecutions?.length || 1)) * 100}
                                      style={{ height: "6px", width: "80px" }}
                                    />
                                    <small className="text-muted">
                                      {e.currentStepIndex}/{e.stepExecutions?.length || 0}
                                    </small>
                                  </td>
                                  <td>{new Date(e.enrolledAt).toLocaleString()}</td>
                                  <td>
                                    {e.status === "active" && (
                                      <Button
                                        color="info"
                                        size="sm"
                                        outline
                                        onClick={() => handleProcessNow(e._id)}
                                        title="Process this enrollment immediately"
                                      >
                                        <i className="bx bx-play"></i> Process Now
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </TabPane>
                  </TabContent>

                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <Button color="secondary" outline onClick={() => navigate("/email-workflows")}>
                      <i className="bx bx-arrow-back me-1"></i> Cancel
                    </Button>
                    <Button color="primary" onClick={handleSave} disabled={actionLoading}>
                      {actionLoading ? <Spinner size="sm" className="me-1" /> : <i className="bx bx-save me-1"></i>}
                      {isEditMode ? "Update Workflow" : "Create Workflow"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              {isEditMode && workflow.stats && (
                <Card>
                  <CardBody>
                    <h5 className="card-title mb-4">Stats</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Enrolled</span>
                      <strong>{workflow.stats.totalEnrolled || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Currently Active</span>
                      <strong className="text-success">{workflow.stats.currentlyActive || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Completed</span>
                      <strong className="text-primary">{workflow.stats.completed || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Emails Sent</span>
                      <strong>{workflow.stats.totalEmailsSent || 0}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Failed</span>
                      <strong className="text-danger">{workflow.stats.failedCount || 0}</strong>
                    </div>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">Quick Tips</h5>
                  <ul className="ps-3 mb-0">
                    <li className="mb-2">Set <strong>Audience</strong> to choose who receives emails</li>
                    <li className="mb-2">Add <strong>Wait steps</strong> between emails for timing</li>
                    <li className="mb-2">Workflow must be <Badge color="success">Active</Badge> to process</li>
                    <li className="mb-2">Use <strong>Run Now</strong> to manually trigger for audience</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Step Modal */}
      <Modal isOpen={stepModal} toggle={() => setStepModal(false)} size="lg">
        <ModalHeader toggle={() => setStepModal(false)}>
          {editingStepIndex >= 0 ? "Edit Step" : "Add Step"}
        </ModalHeader>
        <ModalBody>
          {editingStep && (
            <>
              <FormGroup>
                <Label>Step Type</Label>
                <Row>
                  {STEP_TYPES.map((type) => (
                    <Col md={6} key={type.value}>
                      <div
                        className={`p-3 border rounded mb-2 ${editingStep.type === type.value ? `border-${type.color} bg-${type.color} bg-soft` : ""}`}
                        onClick={() => setEditingStep({ ...editingStep, type: type.value })}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`bx ${type.icon} me-2 text-${type.color}`}></i>
                        {type.label}
                      </div>
                    </Col>
                  ))}
                </Row>
              </FormGroup>

              {editingStep.type === "email" && (
                <>
                  <FormGroup>
                    <Label>Template Type</Label>
                    <Input
                      type="select"
                      value={editingStep.templateType || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, templateType: e.target.value })}
                    >
                      <option value="">-- Select Template --</option>
                      {TEMPLATE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>Or Saved Template</Label>
                    <Input
                      type="select"
                      value={editingStep.templateId || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, templateId: e.target.value || undefined })}
                    >
                      <option value="">-- Use Built-in --</option>
                      {templates && templates.length > 0 ? templates.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      )) : <option>Loading templates...</option>}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>Subject Line *</Label>
                    <Input
                      type="text"
                      value={editingStep.subject || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, subject: e.target.value })}
                      placeholder="e.g., Your Booking Confirmation"
                    />
                  </FormGroup>
                </>
              )}

              {editingStep.type === "wait" && (
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Days</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingStep.waitDays || 0}
                        onChange={(e) => setEditingStep({ ...editingStep, waitDays: parseInt(e.target.value) || 0 })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={editingStep.waitHours || 0}
                        onChange={(e) => setEditingStep({ ...editingStep, waitHours: parseInt(e.target.value) || 0 })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Minutes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={editingStep.waitMinutes || 0}
                        onChange={(e) => setEditingStep({ ...editingStep, waitMinutes: parseInt(e.target.value) || 0 })}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setStepModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleSaveStep}>
            {editingStepIndex >= 0 ? "Update" : "Add"} Step
          </Button>
        </ModalFooter>
      </Modal>

      {/* Test Modal */}
      <Modal isOpen={testModal} toggle={() => setTestModal(false)}>
        <ModalHeader toggle={() => setTestModal(false)}>Test Workflow</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setTestModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleTestTrigger}>Send Test</Button>
        </ModalFooter>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importModal} toggle={() => setImportModal(false)}>
        <ModalHeader toggle={() => setImportModal(false)}>Import Emails</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Paste Emails (one per line or comma-separated)</Label>
            <Input
              type="textarea"
              rows="8"
              value={importEmails}
              onChange={(e) => setImportEmails(e.target.value)}
              placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setImportModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleImportEmails}>Import</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default WorkflowEditor;
