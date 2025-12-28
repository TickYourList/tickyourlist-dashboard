import React, { useState } from "react";
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
  Alert,
  Badge,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { post } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

// Predefined purposes for quick selection
const QUICK_PURPOSES = [
  { value: "booking_cancellation", label: "Booking Cancellation", icon: "bx-x-circle" },
  { value: "refund_notification", label: "Refund Notification", icon: "bx-money" },
  { value: "experience_feedback", label: "Experience Feedback Request", icon: "bx-star" },
  { value: "booking_reminder", label: "Booking Reminder", icon: "bx-bell" },
  { value: "promotional_offer", label: "Promotional Offer", icon: "bx-gift" },
  { value: "newsletter", label: "Newsletter", icon: "bx-news" },
  { value: "welcome_email", label: "Welcome Email", icon: "bx-smile" },
  { value: "ticket_unavailable", label: "Ticket Unavailable", icon: "bx-error" },
  { value: "payment_confirmation", label: "Payment Confirmation", icon: "bx-check-shield" },
  { value: "custom", label: "Custom Purpose", icon: "bx-edit" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "empathetic", label: "Empathetic" },
  { value: "urgent", label: "Urgent" },
];

const AIGenerateTemplate = () => {
  document.title = "AI Generate Template | TickYourList Dashboard";

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const [form, setForm] = useState({
    purpose: "",
    customPurpose: "",
    tone: "professional",
    details: "",
    includeFields: [],
  });

  const [generatedTemplate, setGeneratedTemplate] = useState(null);

  // Handle quick purpose selection
  const selectPurpose = (purpose) => {
    setForm({ ...form, purpose: purpose.value });
  };

  // Handle field toggle
  const toggleField = (field) => {
    if (form.includeFields.includes(field)) {
      setForm({
        ...form,
        includeFields: form.includeFields.filter((f) => f !== field),
      });
    } else {
      setForm({
        ...form,
        includeFields: [...form.includeFields, field],
      });
    }
  };

  // Generate template using AI
  const handleGenerate = async () => {
    const purpose = form.purpose === "custom" ? form.customPurpose : form.purpose;

    if (!purpose) {
      toastr.error("Please select or enter a purpose");
      return;
    }

    try {
      setLoading(true);
      setGeneratedTemplate(null);

      const response = await post("/v1/tyl-email-templates/ai-generate", {
        purpose,
        tone: form.tone,
        details: form.details,
        includeFields: form.includeFields.length > 0 ? form.includeFields : undefined,
      });

      if (response.success) {
        setGeneratedTemplate(response.data);
        toastr.success("Template generated successfully!");
      } else {
        toastr.error(response.message || "Failed to generate template");
      }
    } catch (error) {
      console.error("Error generating template:", error);
      toastr.error("Failed to generate template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save generated template
  const handleSaveTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      const response = await post("/v1/tyl-email-templates/create", {
        name: generatedTemplate.suggestedName || "AI Generated Template",
        templateType: "custom",
        subject: generatedTemplate.subject,
        htmlContent: generatedTemplate.htmlContent,
        variables: generatedTemplate.variables || [],
        previewText: generatedTemplate.previewText,
        isActive: true,
        fromEmail: "bookings@tickyourlist.com",
        fromName: "TickYourList",
        description: `AI-generated template for: ${form.purpose === "custom" ? form.customPurpose : form.purpose}`,
      });

      if (response.success) {
        toastr.success("Template saved successfully!");
        navigate("/email-templates");
      } else {
        toastr.error(response.message || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toastr.error("Failed to save template");
    }
  };

  // Common fields that can be included
  const commonFields = [
    "customerName",
    "bookingId",
    "tourName",
    "bookingDate",
    "amount",
    "currency",
    "refundAmount",
    "promoCode",
    "discountPercent",
    "expiryDate",
    "feedbackLink",
    "supportEmail",
    "supportPhone",
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Templates" breadcrumbItem="AI Generate" />

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="avatar-sm me-3"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bx bx-bot text-white font-size-24"></i>
                    </div>
                    <div>
                      <h4 className="card-title mb-1">AI Email Generator</h4>
                      <p className="text-muted mb-0">
                        Let AI create professional email templates for you
                      </p>
                    </div>
                  </div>

                  {/* Quick Purpose Selection */}
                  <h6 className="mb-3">Select Purpose</h6>
                  <Row className="mb-4">
                    {QUICK_PURPOSES.map((purpose) => (
                      <Col xs={6} md={4} key={purpose.value} className="mb-2">
                        <div
                          className={`p-3 rounded text-center cursor-pointer ${
                            form.purpose === purpose.value
                              ? "bg-primary text-white"
                              : "bg-light"
                          }`}
                          style={{ cursor: "pointer", transition: "all 0.2s" }}
                          onClick={() => selectPurpose(purpose)}
                        >
                          <i className={`bx ${purpose.icon} font-size-20 d-block mb-1`}></i>
                          <small>{purpose.label}</small>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {form.purpose === "custom" && (
                    <FormGroup>
                      <Label>Custom Purpose *</Label>
                      <Input
                        type="text"
                        value={form.customPurpose}
                        onChange={(e) => setForm({ ...form, customPurpose: e.target.value })}
                        placeholder="e.g., Thank you email after tour completion"
                      />
                    </FormGroup>
                  )}

                  <Row>
                    <Col md={12}>
                      <FormGroup>
                        <Label>Tone</Label>
                        <div className="d-flex flex-wrap gap-2">
                          {TONES.map((tone) => (
                            <Badge
                              key={tone.value}
                              color={form.tone === tone.value ? "primary" : "light"}
                              className="p-2 cursor-pointer"
                              style={{
                                cursor: "pointer",
                                color: form.tone === tone.value ? "#fff" : "#333",
                              }}
                              onClick={() => setForm({ ...form, tone: tone.value })}
                            >
                              {tone.label}
                            </Badge>
                          ))}
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label>Additional Details (optional)</Label>
                    <Input
                      type="textarea"
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      placeholder="Add any specific details, requirements, or context for the email..."
                      rows={3}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Include Fields (optional)</Label>
                    <div className="d-flex flex-wrap gap-1">
                      {commonFields.map((field) => (
                        <Badge
                          key={field}
                          color={form.includeFields.includes(field) ? "success" : "light"}
                          className="p-2 cursor-pointer"
                          style={{
                            cursor: "pointer",
                            color: form.includeFields.includes(field) ? "#fff" : "#333",
                          }}
                          onClick={() => toggleField(field)}
                        >
                          {field}
                        </Badge>
                      ))}
                    </div>
                    <small className="text-muted">
                      Click to include these fields in the generated template
                    </small>
                  </FormGroup>

                  <Button
                    color="primary"
                    className="w-100"
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-magic-wand me-2"></i>
                        Generate Template
                      </>
                    )}
                  </Button>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              {generatedTemplate ? (
                <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="card-title mb-0">
                        <i className="bx bx-check-circle text-success me-2"></i>
                        Generated Template
                      </h4>
                      <div className="d-flex gap-2">
                        <Button
                          color="info"
                          size="sm"
                          outline
                          onClick={() => setPreviewModal(true)}
                        >
                          <i className="bx bx-show me-1"></i> Preview
                        </Button>
                        <Button color="success" size="sm" onClick={handleSaveTemplate}>
                          <i className="bx bx-save me-1"></i> Save Template
                        </Button>
                      </div>
                    </div>

                    <FormGroup>
                      <Label>Suggested Name</Label>
                      <Input
                        type="text"
                        value={generatedTemplate.suggestedName || ""}
                        onChange={(e) =>
                          setGeneratedTemplate({
                            ...generatedTemplate,
                            suggestedName: e.target.value,
                          })
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Subject</Label>
                      <Input
                        type="text"
                        value={generatedTemplate.subject || ""}
                        onChange={(e) =>
                          setGeneratedTemplate({
                            ...generatedTemplate,
                            subject: e.target.value,
                          })
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Preview Text</Label>
                      <Input
                        type="text"
                        value={generatedTemplate.previewText || ""}
                        onChange={(e) =>
                          setGeneratedTemplate({
                            ...generatedTemplate,
                            previewText: e.target.value,
                          })
                        }
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>
                        Variables{" "}
                        <Badge color="secondary">{generatedTemplate.variables?.length || 0}</Badge>
                      </Label>
                      <div className="d-flex flex-wrap gap-1">
                        {generatedTemplate.variables?.map((v) => (
                          <Badge key={v} color="primary">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label>HTML Content</Label>
                      <Input
                        type="textarea"
                        value={generatedTemplate.htmlContent || ""}
                        onChange={(e) =>
                          setGeneratedTemplate({
                            ...generatedTemplate,
                            htmlContent: e.target.value,
                          })
                        }
                        rows={12}
                        style={{ fontFamily: "monospace", fontSize: "12px" }}
                      />
                    </FormGroup>

                    <Alert color="info">
                      <i className="bx bx-info-circle me-2"></i>
                      You can edit the generated content before saving. Click "Preview" to see how
                      it looks.
                    </Alert>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody className="text-center py-5">
                    <div
                      className="avatar-lg mx-auto mb-4"
                      style={{
                        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "120px",
                        height: "120px",
                      }}
                    >
                      <i
                        className="bx bx-bot text-muted"
                        style={{ fontSize: "60px" }}
                      ></i>
                    </div>
                    <h5 className="text-muted">No Template Generated Yet</h5>
                    <p className="text-muted mb-0">
                      Select a purpose and click "Generate Template" to create an AI-powered email
                      template.
                    </p>
                  </CardBody>
                </Card>
              )}

              <Card className="mt-3">
                <CardBody>
                  <h6 className="mb-3">
                    <i className="bx bx-bulb text-warning me-2"></i>
                    Tips for Better Results
                  </h6>
                  <ul className="mb-0 small text-muted">
                    <li className="mb-2">Be specific about the purpose of your email</li>
                    <li className="mb-2">Add relevant details to get more customized content</li>
                    <li className="mb-2">
                      Select the appropriate tone based on your audience
                    </li>
                    <li className="mb-2">
                      Include fields that you want to personalize in the email
                    </li>
                    <li>Review and edit the generated content before saving</li>
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
              srcDoc={generatedTemplate?.htmlContent || ""}
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

export default AIGenerateTemplate;

