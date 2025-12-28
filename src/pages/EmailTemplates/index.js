import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Input,
  FormGroup,
  Label,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  UncontrolledTooltip,
  Alert,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, del } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import classnames from "classnames";

// Template type labels
const TEMPLATE_TYPE_LABELS = {
  booking_confirmation: "Booking Confirmation",
  ticket_cancellation: "Ticket Cancellation",
  ticket_not_available: "Ticket Not Available",
  refund_processed: "Refund Processed",
  experience_feedback: "Experience Feedback",
  newsletter: "Newsletter",
  promotional: "Promotional",
  reminder: "Reminder",
  welcome: "Welcome",
  password_reset: "Password Reset",
  custom: "Custom",
};

const TEMPLATE_TYPE_COLORS = {
  booking_confirmation: "success",
  ticket_cancellation: "danger",
  ticket_not_available: "warning",
  refund_processed: "info",
  experience_feedback: "primary",
  newsletter: "secondary",
  promotional: "purple",
  reminder: "info",
  welcome: "success",
  password_reset: "dark",
  custom: "light",
};

const EmailTemplates = () => {
  document.title = "Email Templates | TickYourList Dashboard";

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, delivered: 0, opened: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [filter, setFilter] = useState({ type: "", status: "" });
  const [sendModal, setSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipientEmail: "",
    recipientName: "",
    subject: "",
    variables: {},
  });
  const [sending, setSending] = useState(false);

  // Quick customization for built-in template preview
  const [quickCustomization, setQuickCustomization] = useState({
    primaryColor: "#4CAF50",
    secondaryColor: "#45a049",
    textColor: "#333333",
    backgroundColor: "#f4f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  });

  const QUICK_PRESETS = [
    { name: "Green", primary: "#4CAF50", secondary: "#45a049" },
    { name: "Blue", primary: "#2196F3", secondary: "#1976D2" },
    { name: "Purple", primary: "#9C27B0", secondary: "#7B1FA2" },
    { name: "Orange", primary: "#FF5722", secondary: "#E64A19" },
    { name: "Teal", primary: "#009688", secondary: "#00796B" },
  ];

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get("/v1/tyl-email-templates/list?limit=100");
      if (response.success) {
        setTemplates(response.data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toastr.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await get("/v1/tyl-email-templates/stats");
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  // Fetch recent logs
  const fetchRecentLogs = useCallback(async () => {
    try {
      const response = await get("/v1/tyl-email-templates/logs/recent?limit=10");
      if (response.success) {
        setRecentLogs(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchStats();
    fetchRecentLogs();
  }, [fetchTemplates, fetchStats, fetchRecentLogs]);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await del(`/v1/tyl-email-templates/${selectedTemplate._id}`);
      toastr.success("Template deleted successfully");
      setDeleteModal(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toastr.error("Failed to delete template");
    }
  };

  // Handle preview
  const handlePreview = async (template) => {
    try {
      const sampleVariables = {
        customerName: "John Doe",
        bookingId: "BK123456",
        tourName: "Desert Safari Adventure",
        bookingDate: "December 30, 2025",
        amount: "150.00",
        currency: "AED",
        refundAmount: 150,
        cancellationReason: "Customer requested cancellation",
        processingDate: "December 27, 2025",
        estimatedArrival: "5-7 business days",
        requestedDate: "December 30, 2025",
        feedbackUrl: "https://www.tickyourlist.com/feedback",
      };

      const response = await post("/v1/tyl-email-templates/preview", {
        templateId: template._id,
        variables: sampleVariables,
      });

      if (response.success) {
        setPreviewHtml(response.data.html);
        setPreviewModal(true);
      }
    } catch (error) {
      console.error("Error previewing template:", error);
      toastr.error("Failed to preview template");
    }
  };

  // Handle duplicate
  const handleDuplicate = async (template) => {
    try {
      await post(`/v1/tyl-email-templates/${template._id}/duplicate`, {
        newName: `${template.name} (Copy)`,
      });
      toastr.success("Template duplicated successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toastr.error("Failed to duplicate template");
    }
  };

  // Handle set default
  const handleSetDefault = async (template) => {
    try {
      await post(`/v1/tyl-email-templates/${template._id}/set-default`);
      toastr.success("Template set as default");
      fetchTemplates();
    } catch (error) {
      console.error("Error setting default:", error);
      toastr.error("Failed to set as default");
    }
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (!selectedTemplate || !sendForm.recipientEmail) {
      toastr.error("Please fill in all required fields");
      return;
    }

    try {
      setSending(true);
      const response = await post("/v1/tyl-email-templates/send", {
        templateId: selectedTemplate._id,
        recipientEmail: sendForm.recipientEmail,
        recipientName: sendForm.recipientName,
        subject: sendForm.subject || selectedTemplate.subject,
        variables: sendForm.variables,
      });

      if (response.success) {
        toastr.success("Email sent successfully");
        setSendModal(false);
        setSendForm({ recipientEmail: "", recipientName: "", subject: "", variables: {} });
        fetchStats();
        fetchRecentLogs();
      } else {
        toastr.error(response.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toastr.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    if (filter.type && template.templateType !== filter.type) return false;
    if (filter.status === "active" && !template.isActive) return false;
    if (filter.status === "inactive" && template.isActive) return false;
    return true;
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email" breadcrumbItem="Email Templates" />

          {/* Stats Cards */}
          <Row>
            <Col lg={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Total Templates</p>
                      <h4 className="mb-0">{templates.length}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm align-self-center rounded-circle bg-primary">
                      <span className="avatar-title">
                        <i className="bx bx-mail-send font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Emails Sent</p>
                      <h4 className="mb-0">{stats.sent}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm align-self-center rounded-circle bg-success">
                      <span className="avatar-title">
                        <i className="bx bx-check-circle font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Failed</p>
                      <h4 className="mb-0">{stats.failed}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm align-self-center rounded-circle bg-danger">
                      <span className="avatar-title">
                        <i className="bx bx-x-circle font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Total Emails</p>
                      <h4 className="mb-0">{stats.total}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm align-self-center rounded-circle bg-info">
                      <span className="avatar-title">
                        <i className="bx bx-envelope font-size-24"></i>
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title mb-0">Email Templates</h4>
                    <div className="d-flex gap-2">
                      <Link to="/email-templates/create" className="btn btn-primary">
                        <i className="bx bx-plus me-1"></i> Create Template
                      </Link>
                      <Link to="/email-templates/ai-generate" className="btn btn-success">
                        <i className="bx bx-bot me-1"></i> AI Generate
                      </Link>
                    </div>
                  </div>

                  <Nav tabs className="nav-tabs-custom">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "1" })}
                        onClick={() => setActiveTab("1")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-file me-1"></i> Templates
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "2" })}
                        onClick={() => setActiveTab("2")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-history me-1"></i> Email Logs
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === "3" })}
                        onClick={() => setActiveTab("3")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bx bx-grid me-1"></i> Built-in Templates
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab} className="pt-4">
                    {/* Templates Tab */}
                    <TabPane tabId="1">
                      {/* Filters */}
                      <Row className="mb-3">
                        <Col md={3}>
                          <Input
                            type="select"
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                          >
                            <option value="">All Types</option>
                            {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </Input>
                        </Col>
                        <Col md={3}>
                          <Input
                            type="select"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                          >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Input>
                        </Col>
                      </Row>

                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner color="primary" />
                        </div>
                      ) : filteredTemplates.length === 0 ? (
                        <Alert color="info" className="text-center">
                          No templates found. Create your first template to get started!
                        </Alert>
                      ) : (
                        <div className="table-responsive">
                          <Table className="table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>From</th>
                                <th>Status</th>
                                <th>Default</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTemplates.map((template) => (
                                <tr key={template._id}>
                                  <td>
                                    <strong>{template.name}</strong>
                                    {template.description && (
                                      <p className="text-muted small mb-0">{template.description}</p>
                                    )}
                                  </td>
                                  <td>
                                    <Badge
                                      color={TEMPLATE_TYPE_COLORS[template.templateType] || "secondary"}
                                      className="font-size-12"
                                    >
                                      {TEMPLATE_TYPE_LABELS[template.templateType] || template.templateType}
                                    </Badge>
                                  </td>
                                  <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                    {template.subject}
                                  </td>
                                  <td>{template.fromEmail}</td>
                                  <td>
                                    <Badge color={template.isActive ? "success" : "secondary"}>
                                      {template.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </td>
                                  <td>
                                    {template.isDefault ? (
                                      <i className="bx bxs-star text-warning font-size-18"></i>
                                    ) : (
                                      <i className="bx bx-star text-muted font-size-18"></i>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button
                                        color="info"
                                        size="sm"
                                        outline
                                        onClick={() => handlePreview(template)}
                                        id={`preview-${template._id}`}
                                      >
                                        <i className="bx bx-show"></i>
                                      </Button>
                                      <UncontrolledTooltip target={`preview-${template._id}`}>
                                        Preview
                                      </UncontrolledTooltip>

                                      <Button
                                        color="primary"
                                        size="sm"
                                        outline
                                        onClick={() => {
                                          setSelectedTemplate(template);
                                          setSendModal(true);
                                        }}
                                        id={`send-${template._id}`}
                                      >
                                        <i className="bx bx-send"></i>
                                      </Button>
                                      <UncontrolledTooltip target={`send-${template._id}`}>
                                        Send Email
                                      </UncontrolledTooltip>

                                      <Button
                                        color="warning"
                                        size="sm"
                                        outline
                                        onClick={() => navigate(`/email-templates/edit/${template._id}`)}
                                        id={`edit-${template._id}`}
                                      >
                                        <i className="bx bx-edit"></i>
                                      </Button>
                                      <UncontrolledTooltip target={`edit-${template._id}`}>
                                        Edit
                                      </UncontrolledTooltip>

                                      <Button
                                        color="secondary"
                                        size="sm"
                                        outline
                                        onClick={() => handleDuplicate(template)}
                                        id={`duplicate-${template._id}`}
                                      >
                                        <i className="bx bx-copy"></i>
                                      </Button>
                                      <UncontrolledTooltip target={`duplicate-${template._id}`}>
                                        Duplicate
                                      </UncontrolledTooltip>

                                      {!template.isDefault && (
                                        <>
                                          <Button
                                            color="success"
                                            size="sm"
                                            outline
                                            onClick={() => handleSetDefault(template)}
                                            id={`default-${template._id}`}
                                          >
                                            <i className="bx bx-star"></i>
                                          </Button>
                                          <UncontrolledTooltip target={`default-${template._id}`}>
                                            Set as Default
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      <Button
                                        color="danger"
                                        size="sm"
                                        outline
                                        onClick={() => {
                                          setSelectedTemplate(template);
                                          setDeleteModal(true);
                                        }}
                                        id={`delete-${template._id}`}
                                      >
                                        <i className="bx bx-trash"></i>
                                      </Button>
                                      <UncontrolledTooltip target={`delete-${template._id}`}>
                                        Delete
                                      </UncontrolledTooltip>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </TabPane>

                    {/* Email Logs Tab */}
                    <TabPane tabId="2">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Recent Email Activity</h5>
                        <Link to="/email-templates/logs" className="btn btn-sm btn-outline-primary">
                          View All Logs
                        </Link>
                      </div>

                      {recentLogs.length === 0 ? (
                        <Alert color="info" className="text-center">
                          No email logs found. Start sending emails to see activity here.
                        </Alert>
                      ) : (
                        <div className="table-responsive">
                          <Table className="table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Recipient</th>
                                <th>Subject</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Sent At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentLogs.map((log) => (
                                <tr key={log._id}>
                                  <td>
                                    <strong>{log.recipientName || "N/A"}</strong>
                                    <p className="text-muted small mb-0">{log.recipientEmail}</p>
                                  </td>
                                  <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                    {log.subject}
                                  </td>
                                  <td>
                                    <Badge
                                      color={TEMPLATE_TYPE_COLORS[log.templateType] || "secondary"}
                                      className="font-size-12"
                                    >
                                      {TEMPLATE_TYPE_LABELS[log.templateType] || log.templateType || "N/A"}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge
                                      color={
                                        log.status === "sent"
                                          ? "success"
                                          : log.status === "failed"
                                          ? "danger"
                                          : "warning"
                                      }
                                    >
                                      {log.status}
                                    </Badge>
                                  </td>
                                  <td>
                                    {log.sentAt
                                      ? new Date(log.sentAt).toLocaleString()
                                      : new Date(log.createdAt).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </TabPane>

                    {/* Built-in Templates Tab */}
                    <TabPane tabId="3">
                      <Alert color="info" className="mb-4">
                        <i className="bx bx-info-circle me-2"></i>
                        These are pre-built templates that you can use directly or customize by creating a new template.
                      </Alert>

                      {/* Quick Color Customization */}
                      <Card className="mb-4 border-0 bg-light">
                        <CardBody className="py-3">
                          <div className="d-flex align-items-center flex-wrap gap-3">
                            <span className="fw-bold small">
                              <i className="bx bx-palette me-1"></i>
                              Quick Color:
                            </span>
                            {QUICK_PRESETS.map((preset, idx) => (
                              <div
                                key={idx}
                                onClick={() => setQuickCustomization({
                                  ...quickCustomization,
                                  primaryColor: preset.primary,
                                  secondaryColor: preset.secondary,
                                })}
                                title={preset.name}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                                  cursor: "pointer",
                                  border: quickCustomization.primaryColor === preset.primary 
                                    ? "3px solid #333" 
                                    : "2px solid #fff",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                  transition: "transform 0.2s",
                                }}
                                onMouseOver={(e) => e.target.style.transform = "scale(1.1)"}
                                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                              />
                            ))}
                            <div className="ms-3 d-flex align-items-center gap-2">
                              <span className="small text-muted">Custom:</span>
                              <Input
                                type="color"
                                value={quickCustomization.primaryColor}
                                onChange={(e) => setQuickCustomization({
                                  ...quickCustomization,
                                  primaryColor: e.target.value,
                                  secondaryColor: e.target.value,
                                })}
                                style={{ width: "32px", height: "32px", padding: "2px" }}
                              />
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <Row>
                        {Object.entries(TEMPLATE_TYPE_LABELS).map(([key, label]) => (
                          <Col md={4} key={key} className="mb-3">
                            <Card className="border">
                              <CardBody>
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <Badge
                                      color={TEMPLATE_TYPE_COLORS[key] || "secondary"}
                                      className="mb-2"
                                    >
                                      {label}
                                    </Badge>
                                    <h5 className="card-title">{label}</h5>
                                    <p className="text-muted small">
                                      Built-in template for {label.toLowerCase()} emails
                                    </p>
                                  </div>
                                </div>
                                <div className="d-flex gap-2 mt-3">
                                  <Button
                                    color="info"
                                    size="sm"
                                    outline
                                    onClick={async () => {
                                      try {
                                        const response = await post("/v1/tyl-email-templates/preview-builtin", {
                                          templateType: key,
                                          variables: {
                                            customerName: "John Doe",
                                            bookingId: "BK123456",
                                            tourName: "Desert Safari Adventure",
                                            bookingDate: "December 30, 2025",
                                            amount: "150.00",
                                            currency: "AED",
                                            refundAmount: 150,
                                            cancellationReason: "Customer requested",
                                            processingDate: "December 27, 2025",
                                            estimatedArrival: "5-7 business days",
                                            requestedDate: "December 30, 2025",
                                            feedbackUrl: "https://www.tickyourlist.com/feedback",
                                            headline: "Newsletter Headline",
                                            subheadline: "Newsletter Subheadline",
                                            ctaText: "Learn More",
                                            ctaUrl: "https://www.tickyourlist.com",
                                            subject: "Email Preview",
                                            verifyUrl: "https://www.tickyourlist.com/verify",
                                            resetUrl: "https://www.tickyourlist.com/reset-password",
                                            expiryMinutes: 30,
                                            bookingTime: "10:00 AM",
                                            meetingPoint: "Hotel Lobby",
                                            offerTitle: "Special Offer",
                                            offerDescription: "Get 20% off your next adventure!",
                                            discountText: "20% OFF",
                                            promoCode: "SAVE20",
                                            expiryDate: "December 31, 2025",
                                            refundMethod: "Credit Card",
                                          },
                                          customization: {
                                            ...quickCustomization,
                                            headerBgColor: quickCustomization.primaryColor,
                                            buttonColor: quickCustomization.primaryColor,
                                            accentColor: quickCustomization.primaryColor,
                                          },
                                        });
                                        if (response.success) {
                                          setPreviewHtml(response.data.html);
                                          setPreviewModal(true);
                                        }
                                      } catch (error) {
                                        toastr.error("Failed to preview template");
                                      }
                                    }}
                                  >
                                    <i className="bx bx-show me-1"></i> Preview
                                  </Button>
                                  <Link
                                    to={`/email-campaigns/create?templateType=${key}`}
                                    className="btn btn-sm btn-primary"
                                  >
                                    <i className="bx bx-send me-1"></i> Send Now
                                  </Link>
                                  <Link
                                    to={`/email-templates/create?type=${key}`}
                                    className="btn btn-sm btn-outline-secondary"
                                  >
                                    <i className="bx bx-copy me-1"></i> Customize
                                  </Link>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>Delete Template</ModalHeader>
        <ModalBody>
          Are you sure you want to delete the template "{selectedTemplate?.name}"?
          <br />
          <span className="text-danger">This action cannot be undone.</span>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

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
              srcDoc={previewHtml}
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

      {/* Send Email Modal */}
      <Modal isOpen={sendModal} toggle={() => setSendModal(false)}>
        <ModalHeader toggle={() => setSendModal(false)}>Send Email</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Template</Label>
            <Input type="text" value={selectedTemplate?.name || ""} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Recipient Email *</Label>
            <Input
              type="email"
              value={sendForm.recipientEmail}
              onChange={(e) => setSendForm({ ...sendForm, recipientEmail: e.target.value })}
              placeholder="Enter recipient email"
            />
          </FormGroup>
          <FormGroup>
            <Label>Recipient Name</Label>
            <Input
              type="text"
              value={sendForm.recipientName}
              onChange={(e) => setSendForm({ ...sendForm, recipientName: e.target.value })}
              placeholder="Enter recipient name"
            />
          </FormGroup>
          <FormGroup>
            <Label>Subject (optional - uses template subject if empty)</Label>
            <Input
              type="text"
              value={sendForm.subject}
              onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
              placeholder={selectedTemplate?.subject || "Enter subject"}
            />
          </FormGroup>

          {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
            <>
              <hr />
              <h6>Template Variables</h6>
              {selectedTemplate.variables.map((variable) => (
                <FormGroup key={variable}>
                  <Label>{variable}</Label>
                  <Input
                    type="text"
                    value={sendForm.variables[variable] || ""}
                    onChange={(e) =>
                      setSendForm({
                        ...sendForm,
                        variables: { ...sendForm.variables, [variable]: e.target.value },
                      })
                    }
                    placeholder={`Enter ${variable}`}
                  />
                </FormGroup>
              ))}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSendModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSendEmail} disabled={sending}>
            {sending ? <Spinner size="sm" /> : <><i className="bx bx-send me-1"></i> Send</>}
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default EmailTemplates;

