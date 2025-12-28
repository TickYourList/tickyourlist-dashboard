import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Table,
  Badge,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Progress,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, del } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const TRIGGER_LABELS = {
  booking_confirmed: { label: "Booking Confirmed", icon: "bx-calendar-check", color: "success" },
  post_experience: { label: "Post Experience", icon: "bx-star", color: "info" },
  booking_cancelled: { label: "Booking Cancelled", icon: "bx-calendar-x", color: "danger" },
  abandoned_cart: { label: "Abandoned Cart", icon: "bx-cart-alt", color: "warning" },
  signup: { label: "New Signup", icon: "bx-user-plus", color: "primary" },
  birthday: { label: "Birthday", icon: "bx-gift", color: "pink" },
  no_booking_days: { label: "Inactive Customer", icon: "bx-time", color: "secondary" },
};

const Workflows = () => {
  const navigate = useNavigate();
  document.title = "Email Automations | TickYourList Dashboard";

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    totalEnrolled: 0,
    totalEmailsSent: 0,
  });

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await get("/v1/tyl-email-campaigns/workflows");
      if (response.success) {
        setWorkflows(response.data);
        
        // Calculate stats
        const active = response.data.filter(w => w.status === 'active').length;
        const totalEnrolled = response.data.reduce((sum, w) => sum + (w.stats?.totalEnrolled || 0), 0);
        const totalEmailsSent = response.data.reduce((sum, w) => sum + (w.stats?.totalEmailsSent || 0), 0);
        
        setStats({
          total: response.data.length,
          active,
          paused: response.data.length - active,
          totalEnrolled,
          totalEmailsSent,
        });
      }
    } catch (error) {
      toastr.error("Failed to fetch workflows.");
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleDelete = async () => {
    if (selectedWorkflow) {
      try {
        const response = await del(`/v1/tyl-email-campaigns/workflows/${selectedWorkflow._id}`);
        if (response.success) {
          toastr.success("Workflow deleted successfully!");
          fetchWorkflows();
          setDeleteModal(false);
        } else {
          toastr.error(response.message || "Failed to delete workflow.");
        }
      } catch (error) {
        toastr.error("Failed to delete workflow.");
        console.error("Error deleting workflow:", error);
      }
    }
  };

  const handleToggleStatus = async (workflow) => {
    const newStatus = workflow.status === "active" ? "paused" : "active";
    try {
      const response = await post(`/v1/tyl-email-campaigns/workflows/${workflow._id}/toggle-status`, {
        status: newStatus,
      });
      if (response.success) {
        toastr.success(`Workflow ${newStatus === "active" ? "activated" : "paused"}!`);
        fetchWorkflows();
      }
    } catch (error) {
      // Fallback to PUT if toggle endpoint doesn't exist
      try {
        const { put } = await import("../../helpers/api_helper");
        const response = await put(`/v1/tyl-email-campaigns/workflows/${workflow._id}`, {
          ...workflow,
          status: newStatus,
        });
        if (response.success) {
          toastr.success(`Workflow ${newStatus === "active" ? "activated" : "paused"}!`);
          fetchWorkflows();
        }
      } catch (e) {
        toastr.error("Failed to update workflow status.");
      }
    }
  };

  const handleProcessPending = async () => {
    try {
      const response = await post("/v1/tyl-email-campaigns/workflows/process-pending");
      if (response.success) {
        toastr.success("Pending steps processed successfully!");
      }
    } catch (error) {
      toastr.error("Failed to process pending steps.");
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading automations...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Marketing" breadcrumbItem="Automations" />

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Total Workflows</p>
                      <h4 className="mb-0">{stats.total}</h4>
                    </div>
                    <div className="flex-shrink-0 align-self-center">
                      <div className="mini-stat-icon avatar-sm rounded-circle bg-primary">
                        <span className="avatar-title">
                          <i className="bx bx-git-branch font-size-24"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Active</p>
                      <h4 className="mb-0 text-success">{stats.active}</h4>
                    </div>
                    <div className="flex-shrink-0 align-self-center">
                      <div className="mini-stat-icon avatar-sm rounded-circle bg-success">
                        <span className="avatar-title">
                          <i className="bx bx-play-circle font-size-24"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Total Enrolled</p>
                      <h4 className="mb-0">{stats.totalEnrolled}</h4>
                    </div>
                    <div className="flex-shrink-0 align-self-center">
                      <div className="mini-stat-icon avatar-sm rounded-circle bg-info">
                        <span className="avatar-title">
                          <i className="bx bx-user-check font-size-24"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Emails Sent</p>
                      <h4 className="mb-0">{stats.totalEmailsSent}</h4>
                    </div>
                    <div className="flex-shrink-0 align-self-center">
                      <div className="mini-stat-icon avatar-sm rounded-circle bg-warning">
                        <span className="avatar-title">
                          <i className="bx bx-mail-send font-size-24"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <Row className="mb-4">
                    <Col md={6}>
                      <CardTitle className="h4">Email Automations</CardTitle>
                      <p className="card-title-desc">
                        Automate your email communication with smart workflows that trigger based on customer actions.
                      </p>
                    </Col>
                    <Col md={6} className="text-end">
                      <Button color="secondary" outline className="me-2" onClick={handleProcessPending}>
                        <i className="bx bx-refresh me-1"></i> Process Pending
                      </Button>
                      <Link to="/email-workflows/create" className="btn btn-primary">
                        <i className="bx bx-plus me-1"></i> Create Workflow
                      </Link>
                    </Col>
                  </Row>

                  {workflows.length === 0 ? (
                    <Alert color="info" className="text-center py-5">
                      <i className="bx bx-info-circle font-size-24 d-block mb-2"></i>
                      <h5>No Automations Yet</h5>
                      <p className="mb-3">Create your first email automation workflow to engage customers automatically.</p>
                      <Link to="/email-workflows/create" className="btn btn-primary">
                        <i className="bx bx-plus me-1"></i> Create Your First Workflow
                      </Link>
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Workflow</th>
                            <th>Trigger</th>
                            <th>Steps</th>
                            <th>Status</th>
                            <th>Enrolled</th>
                            <th>Emails Sent</th>
                            <th>Performance</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workflows.map((workflow) => {
                            const triggerInfo = TRIGGER_LABELS[workflow.trigger] || { label: workflow.trigger, icon: "bx-play", color: "secondary" };
                            const openRate = workflow.stats?.totalEmailsSent > 0 
                              ? Math.round((workflow.stats.totalOpens / workflow.stats.totalEmailsSent) * 100) 
                              : 0;
                            
                            return (
                              <tr key={workflow._id}>
                                <td>
                                  <h6 className="mb-0">{workflow.name}</h6>
                                  <small className="text-muted">{workflow.description || "No description"}</small>
                                </td>
                                <td>
                                  <Badge color={triggerInfo.color} className="font-size-12 p-2">
                                    <i className={`bx ${triggerInfo.icon} me-1`}></i>
                                    {triggerInfo.label}
                                  </Badge>
                                </td>
                                <td>
                                  <span className="badge bg-light text-dark">
                                    {workflow.steps?.length || 0} steps
                                  </span>
                                </td>
                                <td>
                                  <Badge color={workflow.status === "active" ? "success" : workflow.status === "paused" ? "warning" : "secondary"}>
                                    {workflow.status}
                                  </Badge>
                                </td>
                                <td>
                                  <div>
                                    <strong>{workflow.stats?.totalEnrolled || 0}</strong>
                                    {workflow.stats?.currentlyActive > 0 && (
                                      <small className="text-success d-block">
                                        {workflow.stats.currentlyActive} active
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td>{workflow.stats?.totalEmailsSent || 0}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div style={{ width: "80px" }}>
                                      <Progress
                                        value={openRate}
                                        color={openRate > 30 ? "success" : openRate > 15 ? "warning" : "danger"}
                                        style={{ height: "6px" }}
                                      />
                                    </div>
                                    <small className="ms-2">{openRate}% open</small>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      color={workflow.status === "active" ? "warning" : "success"}
                                      size="sm"
                                      outline
                                      onClick={() => handleToggleStatus(workflow)}
                                      title={workflow.status === "active" ? "Pause" : "Activate"}
                                    >
                                      <i className={`bx ${workflow.status === "active" ? "bx-pause" : "bx-play"}`}></i>
                                    </Button>
                                    <Link
                                      to={`/email-workflows/${workflow._id}/edit`}
                                      className="btn btn-sm btn-primary"
                                      title="Edit"
                                    >
                                      <i className="bx bx-edit"></i>
                                    </Link>
                                    <Button
                                      color="danger"
                                      size="sm"
                                      outline
                                      onClick={() => {
                                        setSelectedWorkflow(workflow);
                                        setDeleteModal(true);
                                      }}
                                      title="Delete"
                                    >
                                      <i className="bx bx-trash"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Pre-built Workflow Templates */}
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-4">Quick Start Templates</CardTitle>
                  <Row>
                    <Col md={4}>
                      <Card className="border">
                        <CardBody>
                          <div className="d-flex align-items-center mb-3">
                            <div className="avatar-sm bg-success bg-soft rounded me-3 d-flex align-items-center justify-content-center">
                              <i className="bx bx-user-plus text-success font-size-20"></i>
                            </div>
                            <h5 className="mb-0">Welcome Series</h5>
                          </div>
                          <p className="text-muted mb-3">
                            Send a series of welcome emails to new customers with tips and featured tours.
                          </p>
                          <Button 
                            color="success" 
                            outline 
                            size="sm"
                            onClick={() => navigate("/email-workflows/create?template=welcome")}
                          >
                            Use Template
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="border">
                        <CardBody>
                          <div className="d-flex align-items-center mb-3">
                            <div className="avatar-sm bg-info bg-soft rounded me-3 d-flex align-items-center justify-content-center">
                              <i className="bx bx-calendar-check text-info font-size-20"></i>
                            </div>
                            <h5 className="mb-0">Post-Booking</h5>
                          </div>
                          <p className="text-muted mb-3">
                            Reminder before the experience and feedback request after completion.
                          </p>
                          <Button 
                            color="info" 
                            outline 
                            size="sm"
                            onClick={() => navigate("/email-workflows/create?template=post_booking")}
                          >
                            Use Template
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="border">
                        <CardBody>
                          <div className="d-flex align-items-center mb-3">
                            <div className="avatar-sm bg-warning bg-soft rounded me-3 d-flex align-items-center justify-content-center">
                              <i className="bx bx-time text-warning font-size-20"></i>
                            </div>
                            <h5 className="mb-0">Win-Back</h5>
                          </div>
                          <p className="text-muted mb-3">
                            Re-engage customers who haven't booked in a while with special offers.
                          </p>
                          <Button 
                            color="warning" 
                            outline 
                            size="sm"
                            onClick={() => navigate("/email-workflows/create?template=winback")}
                          >
                            Use Template
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>Delete Workflow</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete the workflow "{selectedWorkflow?.name}"?</p>
          {selectedWorkflow?.stats?.currentlyActive > 0 && (
            <Alert color="warning">
              <i className="bx bx-error me-1"></i>
              This workflow has {selectedWorkflow.stats.currentlyActive} active enrollments that will be cancelled.
            </Alert>
          )}
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
    </React.Fragment>
  );
};

export default Workflows;
