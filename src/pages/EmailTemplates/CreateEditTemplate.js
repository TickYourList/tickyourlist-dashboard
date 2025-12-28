import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
} from "reactstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

// Template types
const TEMPLATE_TYPES = [
  { value: "booking_confirmation", label: "Booking Confirmation" },
  { value: "ticket_cancellation", label: "Ticket Cancellation" },
  { value: "ticket_not_available", label: "Ticket Not Available" },
  { value: "refund_processed", label: "Refund Processed" },
  { value: "experience_feedback", label: "Experience Feedback" },
  { value: "newsletter", label: "Newsletter" },
  { value: "promotional", label: "Promotional" },
  { value: "reminder", label: "Reminder" },
  { value: "welcome", label: "Welcome" },
  { value: "password_reset", label: "Password Reset" },
  { value: "custom", label: "Custom" },
];

// Default variables for each template type
const DEFAULT_VARIABLES = {
  booking_confirmation: ["customerName", "bookingId", "tourName", "bookingDate", "amount", "currency"],
  ticket_cancellation: ["customerName", "bookingId", "tourName", "bookingDate", "cancellationReason", "refundAmount", "currency"],
  ticket_not_available: ["customerName", "bookingId", "tourName", "requestedDate"],
  refund_processed: ["customerName", "bookingId", "tourName", "refundAmount", "currency", "refundMethod", "processingDate", "estimatedArrival"],
  experience_feedback: ["customerName", "tourName", "bookingDate", "feedbackUrl"],
  newsletter: ["customerName", "headline", "subheadline", "ctaText", "ctaUrl"],
  promotional: ["customerName", "headline", "offerTitle", "offerDescription", "discountText", "promoCode", "expiryDate"],
  reminder: ["customerName", "tourName", "bookingDate", "bookingTime", "meetingPoint", "bookingId"],
  welcome: ["customerName", "verifyUrl"],
  password_reset: ["customerName", "resetUrl", "expiryMinutes"],
  custom: ["customerName"],
};

const CreateEditTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;

  document.title = `${isEditing ? "Edit" : "Create"} Email Template | TickYourList Dashboard`;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const [form, setForm] = useState({
    name: "",
    templateType: searchParams.get("type") || "custom",
    subject: "",
    htmlContent: "",
    textContent: "",
    description: "",
    variables: [],
    isActive: true,
    isDefault: false,
    fromEmail: "bookings@tickyourlist.com",
    fromName: "TickYourList",
    previewText: "",
  });

  // Customization state
  const [customization, setCustomization] = useState({
    primaryColor: "#4CAF50",
    secondaryColor: "#45a049",
    accentColor: "#27ae60",
    textColor: "#333333",
    backgroundColor: "#f4f7fa",
    headerBgColor: "#4CAF50",
    buttonColor: "#4CAF50",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    logoUrl: "https://tickyourlist-images.s3.ap-south-1.amazonaws.com/tyllogo-white.png",
  });

  // Font options
  const FONT_OPTIONS = [
    { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: "Segoe UI (Default)" },
    { value: "'Arial', sans-serif", label: "Arial" },
    { value: "'Helvetica Neue', Helvetica, sans-serif", label: "Helvetica" },
    { value: "'Georgia', serif", label: "Georgia" },
    { value: "'Times New Roman', serif", label: "Times New Roman" },
    { value: "'Verdana', sans-serif", label: "Verdana" },
    { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
    { value: "'Palatino Linotype', serif", label: "Palatino" },
    { value: "'Courier New', monospace", label: "Courier New" },
    { value: "'Lucida Console', monospace", label: "Lucida Console" },
  ];

  // Color presets
  const COLOR_PRESETS = [
    { name: "TickYourList Green", primary: "#4CAF50", secondary: "#45a049", accent: "#27ae60" },
    { name: "Ocean Blue", primary: "#2196F3", secondary: "#1976D2", accent: "#03A9F4" },
    { name: "Royal Purple", primary: "#9C27B0", secondary: "#7B1FA2", accent: "#E040FB" },
    { name: "Sunset Orange", primary: "#FF5722", secondary: "#E64A19", accent: "#FF9800" },
    { name: "Cherry Red", primary: "#F44336", secondary: "#D32F2F", accent: "#E91E63" },
    { name: "Teal", primary: "#009688", secondary: "#00796B", accent: "#4DB6AC" },
    { name: "Amber Gold", primary: "#FFC107", secondary: "#FFA000", accent: "#FFD54F" },
    { name: "Dark Navy", primary: "#1a237e", secondary: "#283593", accent: "#3949ab" },
  ];

  // Editor ref
  const editorRef = useRef(null);

  // Fetch template if editing
  const fetchTemplate = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await get(`/v1/tyl-email-templates/${id}`);
      if (response.success && response.data) {
        setForm({
          name: response.data.name || "",
          templateType: response.data.templateType || "custom",
          subject: response.data.subject || "",
          htmlContent: response.data.htmlContent || "",
          textContent: response.data.textContent || "",
          description: response.data.description || "",
          variables: response.data.variables || [],
          isActive: response.data.isActive ?? true,
          isDefault: response.data.isDefault ?? false,
          fromEmail: response.data.fromEmail || "bookings@tickyourlist.com",
          fromName: response.data.fromName || "TickYourList",
          previewText: response.data.previewText || "",
        });
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      toastr.error("Failed to fetch template");
      navigate("/email-templates");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // Handle template type change - set default variables
  const handleTemplateTypeChange = (type) => {
    setForm({
      ...form,
      templateType: type,
      variables: DEFAULT_VARIABLES[type] || [],
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!form.name || !form.templateType || !form.subject || !form.htmlContent) {
      toastr.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
      };

      let response;
      if (isEditing) {
        response = await put(`/v1/tyl-email-templates/${id}`, payload);
      } else {
        response = await post("/v1/tyl-email-templates/create", payload);
      }

      if (response.success) {
        toastr.success(`Template ${isEditing ? "updated" : "created"} successfully`);
        navigate("/email-templates");
      } else {
        toastr.error(response.message || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toastr.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  // Handle preview
  const handlePreview = async () => {
    if (!form.htmlContent) {
      toastr.error("Please add HTML content first");
      return;
    }

    try {
      // Generate sample variables
      const sampleVariables = {};
      form.variables.forEach((v) => {
        sampleVariables[v] = getSampleValue(v);
      });

      const response = await post("/v1/tyl-email-templates/preview", {
        customHtml: form.htmlContent,
        variables: sampleVariables,
        customization: customization,
      });

      if (response.success) {
        setPreviewHtml(response.data.html);
        setPreviewModal(true);
      }
    } catch (error) {
      console.error("Error previewing:", error);
      toastr.error("Failed to preview template");
    }
  };

  // Apply color preset
  const applyColorPreset = (preset) => {
    setCustomization({
      ...customization,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      headerBgColor: preset.primary,
      buttonColor: preset.primary,
    });
  };

  // Get sample value for variable
  const getSampleValue = (variable) => {
    const samples = {
      customerName: "John Doe",
      bookingId: "BK123456",
      tourName: "Desert Safari Adventure",
      bookingDate: "December 30, 2025",
      bookingTime: "10:00 AM",
      amount: "150.00",
      currency: "AED",
      refundAmount: "150.00",
      cancellationReason: "Customer requested cancellation",
      processingDate: "December 27, 2025",
      estimatedArrival: "5-7 business days",
      requestedDate: "December 30, 2025",
      feedbackUrl: "https://www.tickyourlist.com/feedback",
      verifyUrl: "https://www.tickyourlist.com/verify",
      resetUrl: "https://www.tickyourlist.com/reset-password",
      expiryMinutes: "30",
      meetingPoint: "Lobby of the hotel",
      headline: "Amazing Deals Await!",
      subheadline: "Discover incredible experiences",
      ctaText: "Book Now",
      ctaUrl: "https://www.tickyourlist.com",
      offerTitle: "Special Offer",
      offerDescription: "Get amazing discounts on selected tours",
      discountText: "20% OFF",
      promoCode: "SAVE20",
      expiryDate: "December 31, 2025",
      refundMethod: "Credit Card",
    };
    return samples[variable] || `[${variable}]`;
  };

  // Insert variable at cursor position
  const insertVariable = (variable) => {
    const varTag = `{{${variable}}}`;
    setForm({ ...form, htmlContent: form.htmlContent + varTag });
  };

  // Add new variable
  const addVariable = () => {
    const newVar = prompt("Enter variable name (e.g., customerName):");
    if (newVar && !form.variables.includes(newVar)) {
      setForm({ ...form, variables: [...form.variables, newVar] });
    }
  };

  // Remove variable
  const removeVariable = (variable) => {
    setForm({
      ...form,
      variables: form.variables.filter((v) => v !== variable),
    });
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading template...</p>
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
            title="Email Templates"
            breadcrumbItem={isEditing ? "Edit Template" : "Create Template"}
          />

          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">
                    {isEditing ? "Edit Email Template" : "Create Email Template"}
                  </h4>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Template Name *</Label>
                        <Input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g., Booking Confirmation - Standard"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Template Type *</Label>
                        <Input
                          type="select"
                          value={form.templateType}
                          onChange={(e) => handleTemplateTypeChange(e.target.value)}
                        >
                          {TEMPLATE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label>Description</Label>
                    <Input
                      type="textarea"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description of this template"
                      rows={2}
                    />
                  </FormGroup>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Subject *</Label>
                        <Input
                          type="text"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          placeholder="e.g., Hello {{customerName}}, your booking is confirmed!"
                        />
                        <small className="text-muted">
                          You can use variables like {"{{customerName}}"}, {"{{bookingId}}"}, etc.
                        </small>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Preview Text</Label>
                        <Input
                          type="text"
                          value={form.previewText}
                          onChange={(e) => setForm({ ...form, previewText: e.target.value })}
                          placeholder="Short preview text shown in email clients"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>From Email *</Label>
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
                    <Col md={6}>
                      <FormGroup>
                        <Label>From Name</Label>
                        <Input
                          type="text"
                          value={form.fromName}
                          onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                          placeholder="TickYourList"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label>HTML Content *</Label>
                    <div className="mb-2">
                      {form.variables.map((variable) => (
                        <Badge
                          key={variable}
                          color="primary"
                          className="me-1 mb-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => insertVariable(variable)}
                        >
                          {`{{${variable}}}`}
                          <i
                            className="bx bx-x ms-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVariable(variable);
                            }}
                          ></i>
                        </Badge>
                      ))}
                      <Badge
                        color="success"
                        className="mb-1"
                        style={{ cursor: "pointer" }}
                        onClick={addVariable}
                      >
                        <i className="bx bx-plus me-1"></i> Add Variable
                      </Badge>
                    </div>
                    <Input
                      type="textarea"
                      ref={editorRef}
                      value={form.htmlContent}
                      onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                      placeholder="Enter HTML content for your email..."
                      rows={15}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                    />
                    <small className="text-muted">
                      Click on a variable badge above to insert it at the end of the content.
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <Label>Plain Text Content (optional)</Label>
                    <Input
                      type="textarea"
                      value={form.textContent}
                      onChange={(e) => setForm({ ...form, textContent: e.target.value })}
                      placeholder="Plain text version of the email (for email clients that don't support HTML)"
                      rows={5}
                    />
                  </FormGroup>

                  <Row>
                    <Col md={4}>
                      <FormGroup check>
                        <Input
                          type="checkbox"
                          id="isActive"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <Label check for="isActive">
                          Active
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup check>
                        <Input
                          type="checkbox"
                          id="isDefault"
                          checked={form.isDefault}
                          onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                        />
                        <Label check for="isDefault">
                          Set as Default for this type
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      color="secondary"
                      outline
                      onClick={() => navigate("/email-templates")}
                    >
                      <i className="bx bx-arrow-back me-1"></i> Cancel
                    </Button>
                    <div className="d-flex gap-2">
                      <Button color="info" outline onClick={handlePreview}>
                        <i className="bx bx-show me-1"></i> Preview
                      </Button>
                      <Button color="primary" onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <i className="bx bx-save me-1"></i> {isEditing ? "Update" : "Create"} Template
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              {/* Customization Card */}
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="bx bx-palette me-2"></i>
                    Style Customization
                  </h5>

                  {/* Color Presets */}
                  <div className="mb-3">
                    <Label className="small fw-bold">Color Presets</Label>
                    <div className="d-flex flex-wrap gap-1">
                      {COLOR_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => applyColorPreset(preset)}
                          title={preset.name}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                            cursor: "pointer",
                            border: customization.primaryColor === preset.primary ? "3px solid #333" : "2px solid #eee",
                            transition: "transform 0.2s",
                          }}
                          onMouseOver={(e) => e.target.style.transform = "scale(1.1)"}
                          onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                        />
                      ))}
                    </div>
                  </div>

                  <hr />

                  {/* Custom Colors */}
                  <div className="mb-3">
                    <Label className="small fw-bold mb-2">Custom Colors</Label>
                    <Row>
                      <Col xs={6} className="mb-2">
                        <Label className="small">Primary</Label>
                        <div className="d-flex align-items-center">
                          <Input
                            type="color"
                            value={customization.primaryColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              primaryColor: e.target.value,
                              headerBgColor: e.target.value,
                              buttonColor: e.target.value,
                            })}
                            style={{ width: "40px", height: "32px", padding: "2px" }}
                          />
                          <Input
                            type="text"
                            value={customization.primaryColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              primaryColor: e.target.value,
                              headerBgColor: e.target.value,
                              buttonColor: e.target.value,
                            })}
                            className="ms-2"
                            style={{ fontSize: "11px" }}
                          />
                        </div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <Label className="small">Secondary</Label>
                        <div className="d-flex align-items-center">
                          <Input
                            type="color"
                            value={customization.secondaryColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              secondaryColor: e.target.value,
                            })}
                            style={{ width: "40px", height: "32px", padding: "2px" }}
                          />
                          <Input
                            type="text"
                            value={customization.secondaryColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              secondaryColor: e.target.value,
                            })}
                            className="ms-2"
                            style={{ fontSize: "11px" }}
                          />
                        </div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <Label className="small">Text Color</Label>
                        <div className="d-flex align-items-center">
                          <Input
                            type="color"
                            value={customization.textColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              textColor: e.target.value,
                            })}
                            style={{ width: "40px", height: "32px", padding: "2px" }}
                          />
                          <Input
                            type="text"
                            value={customization.textColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              textColor: e.target.value,
                            })}
                            className="ms-2"
                            style={{ fontSize: "11px" }}
                          />
                        </div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <Label className="small">Background</Label>
                        <div className="d-flex align-items-center">
                          <Input
                            type="color"
                            value={customization.backgroundColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              backgroundColor: e.target.value,
                            })}
                            style={{ width: "40px", height: "32px", padding: "2px" }}
                          />
                          <Input
                            type="text"
                            value={customization.backgroundColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              backgroundColor: e.target.value,
                            })}
                            className="ms-2"
                            style={{ fontSize: "11px" }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <hr />

                  {/* Font Family */}
                  <FormGroup>
                    <Label className="small fw-bold">Font Family</Label>
                    <Input
                      type="select"
                      value={customization.fontFamily}
                      onChange={(e) => setCustomization({
                        ...customization,
                        fontFamily: e.target.value,
                      })}
                      bsSize="sm"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>

                  {/* Logo URL */}
                  <FormGroup>
                    <Label className="small fw-bold">Logo URL</Label>
                    <Input
                      type="text"
                      value={customization.logoUrl}
                      onChange={(e) => setCustomization({
                        ...customization,
                        logoUrl: e.target.value,
                      })}
                      bsSize="sm"
                      placeholder="https://..."
                    />
                  </FormGroup>

                  {/* Preview swatch */}
                  <div
                    className="p-3 rounded mt-3"
                    style={{
                      background: customization.backgroundColor,
                      border: "1px solid #ddd",
                    }}
                  >
                    <div
                      className="p-2 rounded-top text-center"
                      style={{
                        background: `linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.secondaryColor} 100%)`,
                        color: "#fff",
                        fontSize: "12px",
                        fontFamily: customization.fontFamily,
                      }}
                    >
                      Header Preview
                    </div>
                    <div
                      className="p-2 bg-white text-center"
                      style={{
                        color: customization.textColor,
                        fontFamily: customization.fontFamily,
                        fontSize: "11px",
                      }}
                    >
                      <p className="mb-1" style={{ color: customization.textColor }}>Sample text content</p>
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          background: customization.buttonColor,
                          color: "#fff",
                          fontSize: "10px",
                        }}
                      >
                        Button
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Clickable Variables Card */}
              <Card className="mt-3">
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="bx bx-code-curly text-info me-2"></i>
                    Insert Variables
                  </h5>
                  
                  <Alert color="success" className="mb-3 py-2">
                    <small><i className="bx bx-info-circle me-1"></i> Click any variable to insert it into your content</small>
                  </Alert>

                  <div className="mb-3">
                    <strong className="small text-muted">Customer:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {["customerName", "firstName", "lastName", "customerEmail", "phoneNumber", "tylcashBalance", "referralCode"].map(v => (
                        <Badge
                          key={v}
                          color="primary"
                          className="py-1 px-2"
                          style={{ cursor: "pointer", fontSize: "11px" }}
                          onClick={() => insertVariable(v)}
                          title={`Click to insert {{${v}}}`}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="small text-muted">Booking:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {["bookingId", "bookingDate", "bookingTime", "amount", "currency", "guestsCount", "adultsCount", "childCount", "status"].map(v => (
                        <Badge
                          key={v}
                          color="info"
                          className="py-1 px-2"
                          style={{ cursor: "pointer", fontSize: "11px" }}
                          onClick={() => insertVariable(v)}
                          title={`Click to insert {{${v}}}`}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="small text-muted">Tour:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {["tourName", "meetingPoint", "hotelNameAndAddress"].map(v => (
                        <Badge
                          key={v}
                          color="success"
                          className="py-1 px-2"
                          style={{ cursor: "pointer", fontSize: "11px" }}
                          onClick={() => insertVariable(v)}
                          title={`Click to insert {{${v}}}`}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="small text-muted">Refund/Coupon:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {["refundAmount", "refundReason", "refundMethod", "refundReference", "couponCode", "discountAmount"].map(v => (
                        <Badge
                          key={v}
                          color="warning"
                          className="py-1 px-2"
                          style={{ cursor: "pointer", fontSize: "11px" }}
                          onClick={() => insertVariable(v)}
                          title={`Click to insert {{${v}}}`}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="small text-muted">Other:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {["headline", "subheadline", "ctaText", "ctaUrl", "feedbackUrl", "verifyUrl", "resetUrl", "promoCode", "expiryDate"].map(v => (
                        <Badge
                          key={v}
                          color="secondary"
                          className="py-1 px-2"
                          style={{ cursor: "pointer", fontSize: "11px" }}
                          onClick={() => insertVariable(v)}
                          title={`Click to insert {{${v}}}`}
                        >
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <hr />

                  <h6 className="small fw-bold">HTML Tips:</h6>
                  <ul className="small mb-0">
                    <li>Use inline CSS styles for better email client compatibility</li>
                    <li>Keep images hosted on a CDN</li>
                    <li>Keep the design simple and mobile-friendly</li>
                  </ul>
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
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <iframe
              srcDoc={previewHtml || form.htmlContent}
              title="Email Preview"
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
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

export default CreateEditTemplate;

