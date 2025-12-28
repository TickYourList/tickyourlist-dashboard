import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Spinner,
  Badge,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import classnames from "classnames";

const TEMPLATE_TYPES = [
  { value: "booking_confirmation", label: "Booking Confirmation" },
  { value: "ticket_cancellation", label: "Ticket Cancellation" },
  { value: "refund_processed", label: "Refund Processed" },
  { value: "experience_feedback", label: "Experience Feedback" },
  { value: "newsletter", label: "Newsletter" },
  { value: "promotional", label: "Promotional" },
  { value: "reminder", label: "Reminder" },
  { value: "welcome", label: "Welcome" },
  { value: "custom", label: "Custom" },
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  // Get initial template type from URL
  const initialTemplateType = searchParams.get("templateType") || "newsletter";

  document.title = `${isEditing ? "Edit" : "Create"} Campaign | TickYourList Dashboard`;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    templateId: "",
    templateType: initialTemplateType,
    subject: "",
    htmlContent: "",
    fromEmail: "bookings@tickyourlist.com",
    fromName: "TickYourList",
    recipients: [],
    segmentId: "",
    scheduledAt: "",
    isABTest: false,
    abTestSubjectB: "",
    customization: {
      primaryColor: "#4CAF50",
      secondaryColor: "#45a049",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    enableTracking: true,
  });

  const [recipientInput, setRecipientInput] = useState({ email: "", name: "" });
  const [bulkRecipients, setBulkRecipients] = useState("");

  // Fetch templates and segments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, segmentsRes] = await Promise.all([
          get("/v1/tyl-email-templates/list?limit=100"),
          get("/v1/tyl-email-campaigns/segments"),
        ]);
        if (templatesRes.success) setTemplates(templatesRes.data.templates || []);
        if (segmentsRes.success) setSegments(segmentsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch campaign if editing
  useEffect(() => {
    if (id) {
      const fetchCampaign = async () => {
        try {
          setLoading(true);
          const res = await get(`/v1/tyl-email-campaigns/campaigns/${id}`);
          if (res.success && res.data) {
            setForm({
              ...form,
              ...res.data,
              scheduledAt: res.data.scheduledAt ? new Date(res.data.scheduledAt).toISOString().slice(0, 16) : "",
            });
          }
        } catch (error) {
          toastr.error("Failed to fetch campaign");
          navigate("/email-campaigns");
        } finally {
          setLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [id]);

  // Add single recipient
  const addRecipient = () => {
    if (!recipientInput.email) {
      toastr.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientInput.email)) {
      toastr.error("Invalid email format");
      return;
    }
    if (form.recipients.some(r => r.email === recipientInput.email)) {
      toastr.error("Email already added");
      return;
    }
    setForm({
      ...form,
      recipients: [...form.recipients, { ...recipientInput, status: "pending" }],
    });
    setRecipientInput({ email: "", name: "" });
  };

  // Add bulk recipients
  const addBulkRecipients = () => {
    const lines = bulkRecipients.split("\n").filter(l => l.trim());
    const newRecipients = [];
    
    lines.forEach(line => {
      const [email, name] = line.split(",").map(s => s.trim());
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (!form.recipients.some(r => r.email === email) && !newRecipients.some(r => r.email === email)) {
          newRecipients.push({ email, name: name || "", status: "pending" });
        }
      }
    });

    if (newRecipients.length > 0) {
      setForm({
        ...form,
        recipients: [...form.recipients, ...newRecipients],
      });
      setBulkRecipients("");
      toastr.success(`Added ${newRecipients.length} recipients`);
    } else {
      toastr.warning("No valid new emails found");
    }
  };

  // Remove recipient
  const removeRecipient = (email) => {
    setForm({
      ...form,
      recipients: form.recipients.filter(r => r.email !== email),
    });
  };

  // Preview email
  const handlePreview = async () => {
    try {
      const response = await post("/v1/tyl-email-templates/preview-builtin", {
        templateType: form.templateType,
        variables: {
          customerName: "John Doe",
          headline: form.subject || "Newsletter Headline",
          subject: form.subject,
        },
        customization: form.customization,
      });
      if (response.success) {
        setPreviewHtml(response.data.html);
        setPreviewModal(true);
      }
    } catch (error) {
      toastr.error("Failed to preview");
    }
  };

  // Save campaign
  const handleSave = async (status = "draft") => {
    if (!form.name || !form.subject) {
      toastr.error("Campaign name and subject are required");
      return;
    }

    if (status === "scheduled" && !form.scheduledAt) {
      toastr.error("Please select a scheduled date and time");
      return;
    }

    if (status === "scheduled" && form.recipients.length === 0 && !form.segmentId) {
      toastr.error("Please add recipients or select a segment");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        status,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        abTestVariants: form.isABTest ? [
          { id: "A", subject: form.subject, percentage: 50, sentCount: 0, openCount: 0, clickCount: 0 },
          { id: "B", subject: form.abTestSubjectB, percentage: 50, sentCount: 0, openCount: 0, clickCount: 0 },
        ] : undefined,
      };

      let response;
      if (isEditing) {
        response = await put(`/v1/tyl-email-campaigns/campaigns/${id}`, payload);
      } else {
        response = await post("/v1/tyl-email-campaigns/campaigns/create", payload);
      }

      if (response.success) {
        toastr.success(`Campaign ${status === "scheduled" ? "scheduled" : "saved"} successfully!`);
        navigate("/email-campaigns");
      } else {
        toastr.error(response.message || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      toastr.error("Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading campaign...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Email Campaigns"
            breadcrumbItem={isEditing ? "Edit Campaign" : "Create Campaign"}
          />

          {/* Progress Steps */}
          <Card className="mb-4">
            <CardBody className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                {[
                  { num: 1, label: "Campaign Details" },
                  { num: 2, label: "Recipients" },
                  { num: 3, label: "Schedule & Review" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`d-flex align-items-center ${step >= s.num ? "text-primary" : "text-muted"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setStep(s.num)}
                  >
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center me-2`}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: step >= s.num ? "#4CAF50" : "#e9ecef",
                        color: step >= s.num ? "#fff" : "#6c757d",
                      }}
                    >
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span className="d-none d-md-inline">{s.label}</span>
                    {s.num < 3 && <div className="mx-3 border-top" style={{ width: "50px" }}></div>}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  {/* Step 1: Campaign Details */}
                  {step === 1 && (
                    <>
                      <h4 className="card-title mb-4">Campaign Details</h4>

                      <Row>
                        <Col md={12}>
                          <FormGroup>
                            <Label>Campaign Name *</Label>
                            <Input
                              type="text"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              placeholder="e.g., Holiday Promotion 2025"
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Template Type</Label>
                            <Input
                              type="select"
                              value={form.templateType}
                              onChange={(e) => setForm({ ...form, templateType: e.target.value })}
                            >
                              {TEMPLATE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>From Email</Label>
                            <Input
                              type="select"
                              value={form.fromEmail}
                              onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                            >
                              <option value="bookings@tickyourlist.com">bookings@tickyourlist.com</option>
                              <option value="info@tickyourlist.com">info@tickyourlist.com</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>

                      <FormGroup>
                        <Label>Subject Line *</Label>
                        <Input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g., 🎉 Special Holiday Deals Just For You!"
                        />
                        <small className="text-muted">
                          Tip: Use emojis and personalization for better open rates
                        </small>
                      </FormGroup>

                      {/* A/B Testing */}
                      <Card className="border mt-4">
                        <CardBody>
                          <FormGroup check className="mb-3">
                            <Input
                              type="checkbox"
                              id="abTest"
                              checked={form.isABTest}
                              onChange={(e) => setForm({ ...form, isABTest: e.target.checked })}
                            />
                            <Label check for="abTest">
                              <strong>Enable A/B Testing</strong>
                              <small className="d-block text-muted">
                                Test two different subject lines to see which performs better
                              </small>
                            </Label>
                          </FormGroup>

                          {form.isABTest && (
                            <FormGroup>
                              <Label>Alternative Subject Line (Variant B)</Label>
                              <Input
                                type="text"
                                value={form.abTestSubjectB}
                                onChange={(e) => setForm({ ...form, abTestSubjectB: e.target.value })}
                                placeholder="e.g., Don't Miss Out on These Amazing Deals!"
                              />
                              <small className="text-muted">
                                50% of recipients will receive each variant
                              </small>
                            </FormGroup>
                          )}
                        </CardBody>
                      </Card>

                      <div className="d-flex justify-content-between mt-4">
                        <Button color="secondary" outline onClick={() => navigate("/email-campaigns")}>
                          Cancel
                        </Button>
                        <div className="d-flex gap-2">
                          <Button color="info" outline onClick={handlePreview}>
                            <i className="bx bx-show me-1"></i> Preview
                          </Button>
                          <Button color="primary" onClick={() => setStep(2)}>
                            Next: Recipients <i className="bx bx-right-arrow-alt ms-1"></i>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Recipients */}
                  {step === 2 && (
                    <>
                      <h4 className="card-title mb-4">Recipients</h4>

                      <Alert color="info" className="mb-4">
                        <i className="bx bx-info-circle me-2"></i>
                        Select customers from your database, import from recent bookings, or add manually.
                      </Alert>

                      {/* Quick Actions */}
                      <Card className="border bg-light mb-4">
                        <CardBody>
                          <h6 className="mb-3">
                            <i className="bx bx-zap text-warning me-2"></i>
                            Quick Import from Database
                          </h6>
                          <Row>
                            <Col md={3}>
                              <Button
                                color="primary"
                                outline
                                className="w-100 mb-2"
                                onClick={async () => {
                                  try {
                                    const res = await get("/v1/tyl-email-campaigns/customers?limit=5000");
                                    if (res.success) {
                                      const newRecipients = res.data.customers.map(c => ({
                                        email: c.email,
                                        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
                                        customerId: c._id,
                                        status: "pending",
                                      })).filter(r => r.email && !form.recipients.some(fr => fr.email === r.email));
                                      setForm({ ...form, recipients: [...form.recipients, ...newRecipients] });
                                      toastr.success(`Added ${newRecipients.length} customers`);
                                    }
                                  } catch (e) {
                                    toastr.error("Failed to fetch customers");
                                  }
                                }}
                              >
                                <i className="bx bx-group me-1"></i>
                                All Customers
                              </Button>
                            </Col>
                            <Col md={3}>
                              <Button
                                color="success"
                                outline
                                className="w-100 mb-2"
                                onClick={async () => {
                                  try {
                                    const res = await get("/v1/tyl-email-campaigns/customers?verified=true&limit=5000");
                                    if (res.success) {
                                      const newRecipients = res.data.customers.map(c => ({
                                        email: c.email,
                                        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
                                        customerId: c._id,
                                        status: "pending",
                                      })).filter(r => r.email && !form.recipients.some(fr => fr.email === r.email));
                                      setForm({ ...form, recipients: [...form.recipients, ...newRecipients] });
                                      toastr.success(`Added ${newRecipients.length} verified customers`);
                                    }
                                  } catch (e) {
                                    toastr.error("Failed to fetch customers");
                                  }
                                }}
                              >
                                <i className="bx bx-check-shield me-1"></i>
                                Verified Only
                              </Button>
                            </Col>
                            <Col md={3}>
                              <Button
                                color="info"
                                outline
                                className="w-100 mb-2"
                                onClick={async () => {
                                  try {
                                    const res = await get("/v1/tyl-email-campaigns/customers?hasBooked=true&limit=5000");
                                    if (res.success) {
                                      const newRecipients = res.data.customers.map(c => ({
                                        email: c.email,
                                        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
                                        customerId: c._id,
                                        status: "pending",
                                      })).filter(r => r.email && !form.recipients.some(fr => fr.email === r.email));
                                      setForm({ ...form, recipients: [...form.recipients, ...newRecipients] });
                                      toastr.success(`Added ${newRecipients.length} customers with bookings`);
                                    }
                                  } catch (e) {
                                    toastr.error("Failed to fetch customers");
                                  }
                                }}
                              >
                                <i className="bx bx-calendar-check me-1"></i>
                                With Bookings
                              </Button>
                            </Col>
                            <Col md={3}>
                              <Button
                                color="warning"
                                outline
                                className="w-100 mb-2"
                                onClick={async () => {
                                  try {
                                    const res = await get("/v1/tyl-email-campaigns/recent-bookings?days=30&limit=500");
                                    if (res.success) {
                                      const newRecipients = res.data.bookings.map(b => ({
                                        email: b.email,
                                        name: b.name,
                                        bookingId: b.bookingId,
                                        tourName: b.tourName,
                                        status: "pending",
                                      })).filter(r => r.email && !form.recipients.some(fr => fr.email === r.email));
                                      setForm({ ...form, recipients: [...form.recipients, ...newRecipients] });
                                      toastr.success(`Added ${newRecipients.length} recent bookings (30 days)`);
                                    }
                                  } catch (e) {
                                    toastr.error("Failed to fetch bookings");
                                  }
                                }}
                              >
                                <i className="bx bx-time me-1"></i>
                                Recent Bookings
                              </Button>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>

                      {/* Segment Selection */}
                      <FormGroup>
                        <Label>Use Customer Segment (Optional)</Label>
                        <Input
                          type="select"
                          value={form.segmentId}
                          onChange={(e) => setForm({ ...form, segmentId: e.target.value })}
                        >
                          <option value="">-- Select a segment --</option>
                          {segments.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.memberCount} members)
                            </option>
                          ))}
                        </Input>
                      </FormGroup>

                      <hr />

                      {/* Manual Add */}
                      <h6>Add Recipients Manually</h6>
                      <Row className="mb-3">
                        <Col md={5}>
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={recipientInput.email}
                            onChange={(e) => setRecipientInput({ ...recipientInput, email: e.target.value })}
                          />
                        </Col>
                        <Col md={4}>
                          <Input
                            type="text"
                            placeholder="Name (optional)"
                            value={recipientInput.name}
                            onChange={(e) => setRecipientInput({ ...recipientInput, name: e.target.value })}
                          />
                        </Col>
                        <Col md={3}>
                          <Button color="primary" onClick={addRecipient} className="w-100">
                            <i className="bx bx-plus me-1"></i> Add
                          </Button>
                        </Col>
                      </Row>

                      {/* Bulk Add */}
                      <FormGroup>
                        <Label>Bulk Add (email,name - one per line)</Label>
                        <Input
                          type="textarea"
                          rows={4}
                          value={bulkRecipients}
                          onChange={(e) => setBulkRecipients(e.target.value)}
                          placeholder={`john@example.com,John Doe\njane@example.com,Jane Smith\n...`}
                        />
                        <Button color="secondary" size="sm" className="mt-2" onClick={addBulkRecipients}>
                          <i className="bx bx-import me-1"></i> Import List
                        </Button>
                      </FormGroup>

                      {/* Recipients List */}
                      {form.recipients.length > 0 && (
                        <div className="mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">
                              <i className="bx bx-user-check text-success me-2"></i>
                              Recipients ({form.recipients.length})
                            </h6>
                            <Button
                              color="danger"
                              size="sm"
                              outline
                              onClick={() => setForm({ ...form, recipients: [] })}
                            >
                              Clear All
                            </Button>
                          </div>
                          <div style={{ maxHeight: "200px", overflowY: "auto" }} className="border rounded p-2">
                            {form.recipients.map((r, idx) => (
                              <div key={idx} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                <div>
                                  <small className="fw-bold">{r.email}</small>
                                  {r.name && <small className="text-muted ms-2">({r.name})</small>}
                                  {r.tourName && <Badge color="info" className="ms-2" size="sm">{r.tourName}</Badge>}
                                </div>
                                <Button
                                  color="link"
                                  size="sm"
                                  className="text-danger p-0"
                                  onClick={() => removeRecipient(r.email)}
                                >
                                  <i className="bx bx-x"></i>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="d-flex justify-content-between mt-4">
                        <Button color="secondary" outline onClick={() => setStep(1)}>
                          <i className="bx bx-left-arrow-alt me-1"></i> Back
                        </Button>
                        <Button color="primary" onClick={() => setStep(3)}>
                          Next: Schedule <i className="bx bx-right-arrow-alt ms-1"></i>
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Step 3: Schedule & Review */}
                  {step === 3 && (
                    <>
                      <h4 className="card-title mb-4">Schedule & Review</h4>

                      <FormGroup>
                        <Label>Schedule Send Time</Label>
                        <Input
                          type="datetime-local"
                          value={form.scheduledAt}
                          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <small className="text-muted">
                          Leave empty to save as draft and send later
                        </small>
                      </FormGroup>

                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          id="tracking"
                          checked={form.enableTracking}
                          onChange={(e) => setForm({ ...form, enableTracking: e.target.checked })}
                        />
                        <Label check for="tracking">
                          Enable open and click tracking
                        </Label>
                      </FormGroup>

                      {/* Campaign Summary */}
                      <Card className="border bg-light">
                        <CardBody>
                          <h5 className="mb-3">Campaign Summary</h5>
                          <Row>
                            <Col md={6}>
                              <p className="mb-2">
                                <strong>Name:</strong> {form.name || "-"}
                              </p>
                              <p className="mb-2">
                                <strong>Subject:</strong> {form.subject || "-"}
                              </p>
                              <p className="mb-2">
                                <strong>From:</strong> {form.fromName} &lt;{form.fromEmail}&gt;
                              </p>
                            </Col>
                            <Col md={6}>
                              <p className="mb-2">
                                <strong>Recipients:</strong>{" "}
                                {form.segmentId
                                  ? `Segment: ${segments.find(s => s._id === form.segmentId)?.name || "Selected"}`
                                  : `${form.recipients.length} recipients`}
                              </p>
                              <p className="mb-2">
                                <strong>Schedule:</strong>{" "}
                                {form.scheduledAt
                                  ? new Date(form.scheduledAt).toLocaleString()
                                  : "Not scheduled (draft)"}
                              </p>
                              <p className="mb-2">
                                <strong>A/B Test:</strong>{" "}
                                {form.isABTest ? "Yes" : "No"}
                              </p>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>

                      <div className="d-flex justify-content-between mt-4">
                        <Button color="secondary" outline onClick={() => setStep(2)}>
                          <i className="bx bx-left-arrow-alt me-1"></i> Back
                        </Button>
                        <div className="d-flex gap-2">
                          <Button
                            color="secondary"
                            onClick={() => handleSave("draft")}
                            disabled={saving}
                          >
                            {saving ? <Spinner size="sm" /> : "Save as Draft"}
                          </Button>
                          <Button
                            color="primary"
                            onClick={() => handleSave(form.scheduledAt ? "scheduled" : "draft")}
                            disabled={saving}
                          >
                            {saving ? (
                              <Spinner size="sm" />
                            ) : form.scheduledAt ? (
                              <>
                                <i className="bx bx-calendar me-1"></i> Schedule Campaign
                              </>
                            ) : (
                              <>
                                <i className="bx bx-save me-1"></i> Save Campaign
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="bx bx-bulb text-warning me-2"></i>
                    Campaign Tips
                  </h5>

                  {step === 1 && (
                    <>
                      <Alert color="success" className="mb-3">
                        <strong>Subject Line Tips:</strong>
                        <ul className="mb-0 mt-2 ps-3">
                          <li>Keep it under 50 characters</li>
                          <li>Use emojis sparingly 🎉</li>
                          <li>Create urgency or curiosity</li>
                          <li>Personalize when possible</li>
                        </ul>
                      </Alert>
                      <p className="small text-muted">
                        A/B testing helps you find the best subject line by sending different versions to segments of your audience.
                      </p>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Alert color="info" className="mb-3">
                        <strong>Recipient Tips:</strong>
                        <ul className="mb-0 mt-2 ps-3">
                          <li>Use segments for targeted campaigns</li>
                          <li>Clean your list regularly</li>
                          <li>Personalize with recipient names</li>
                        </ul>
                      </Alert>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Alert color="warning" className="mb-3">
                        <strong>Best Send Times:</strong>
                        <ul className="mb-0 mt-2 ps-3">
                          <li>Tuesday-Thursday mornings</li>
                          <li>Avoid weekends for B2B</li>
                          <li>Consider your audience's timezone</li>
                        </ul>
                      </Alert>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Variable Reference */}
              <Card className="mt-3">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="bx bx-code-curly text-info me-2"></i>
                    Personalization Variables
                  </h5>
                  <p className="small text-muted mb-3">
                    Use these in your subject line or content to personalize emails:
                  </p>
                  <div className="small">
                    <div className="mb-2">
                      <strong>Customer:</strong>
                      <div className="ms-2 text-muted">
                        <code className="me-2">{"{{customerName}}"}</code>
                        <code className="me-2">{"{{firstName}}"}</code>
                        <code>{"{{customerEmail}}"}</code>
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Booking:</strong>
                      <div className="ms-2 text-muted">
                        <code className="me-2">{"{{bookingId}}"}</code>
                        <code className="me-2">{"{{bookingDate}}"}</code>
                        <code className="me-2">{"{{amount}}"}</code>
                        <code>{"{{currency}}"}</code>
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Tour:</strong>
                      <div className="ms-2 text-muted">
                        <code className="me-2">{"{{tourName}}"}</code>
                        <code>{"{{meetingPoint}}"}</code>
                      </div>
                    </div>
                    <div>
                      <strong>Other:</strong>
                      <div className="ms-2 text-muted">
                        <code className="me-2">{"{{refundAmount}}"}</code>
                        <code className="me-2">{"{{couponCode}}"}</code>
                        <code>{"{{tylcashBalance}}"}</code>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Color Customization */}
              <Card className="mt-3">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="bx bx-palette me-2"></i>
                    Email Styling
                  </h5>
                  <FormGroup>
                    <Label className="small">Primary Color</Label>
                    <div className="d-flex align-items-center">
                      <Input
                        type="color"
                        value={form.customization.primaryColor}
                        onChange={(e) => setForm({
                          ...form,
                          customization: { ...form.customization, primaryColor: e.target.value, secondaryColor: e.target.value }
                        })}
                        style={{ width: "50px", height: "36px" }}
                      />
                      <Input
                        type="text"
                        value={form.customization.primaryColor}
                        onChange={(e) => setForm({
                          ...form,
                          customization: { ...form.customization, primaryColor: e.target.value }
                        })}
                        className="ms-2"
                        style={{ width: "100px" }}
                      />
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl">
        <ModalHeader toggle={() => setPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody style={{ backgroundColor: "#f4f7fa", padding: "20px" }}>
          <iframe
            srcDoc={previewHtml}
            title="Email Preview"
            style={{ width: "100%", height: "600px", border: "none", backgroundColor: "#fff", borderRadius: "8px" }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default CreateCampaign;

