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
  Progress,
  Alert,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, del } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import classnames from "classnames";

const CAMPAIGN_STATUS_COLORS = {
  draft: "secondary",
  scheduled: "info",
  sending: "warning",
  completed: "success",
  paused: "dark",
  cancelled: "danger",
};

const Campaigns = () => {
  document.title = "Email Campaigns | TickYourList Dashboard";

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [campaignsRes, segmentsRes, analyticsRes] = await Promise.all([
        get("/v1/tyl-email-campaigns/campaigns"),
        get("/v1/tyl-email-campaigns/segments"),
        get("/v1/tyl-email-campaigns/analytics/overview"),
      ]);

      if (campaignsRes.success) setCampaigns(campaignsRes.data.campaigns || []);
      if (segmentsRes.success) setSegments(segmentsRes.data || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading campaigns...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Marketing" breadcrumbItem="Campaigns" />

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="mini-stats-wid">
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted fw-medium mb-2">Total Sent</p>
                      <h4 className="mb-0">{analytics?.overview?.totalSent?.toLocaleString() || 0}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                      <span className="avatar-title">
                        <i className="bx bx-send font-size-24"></i>
                      </span>
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
                      <p className="text-muted fw-medium mb-2">Open Rate</p>
                      <h4 className="mb-0">{analytics?.overview?.openRate || 0}%</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-success align-self-center">
                      <span className="avatar-title">
                        <i className="bx bx-envelope-open font-size-24"></i>
                      </span>
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
                      <p className="text-muted fw-medium mb-2">Click Rate</p>
                      <h4 className="mb-0">{analytics?.overview?.clickRate || 0}%</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-info align-self-center">
                      <span className="avatar-title">
                        <i className="bx bx-pointer font-size-24"></i>
                      </span>
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
                      <p className="text-muted fw-medium mb-2">Active Campaigns</p>
                      <h4 className="mb-0">{campaigns.filter(c => c.status === "scheduled" || c.status === "sending").length}</h4>
                    </div>
                    <div className="mini-stat-icon avatar-sm rounded-circle bg-warning align-self-center">
                      <span className="avatar-title">
                        <i className="bx bx-rocket font-size-24"></i>
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
                    <Nav pills className="nav-pills-custom">
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => setActiveTab("1")}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="bx bx-rocket me-1"></i> Campaigns
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => setActiveTab("2")}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="bx bx-group me-1"></i> Segments
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "3" })}
                          onClick={() => setActiveTab("3")}
                          style={{ cursor: "pointer" }}
                        >
                          <i className="bx bx-line-chart me-1"></i> Analytics
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <div className="d-flex gap-2">
                      {activeTab === "1" && (
                        <Link to="/email-campaigns/create" className="btn btn-primary">
                          <i className="bx bx-plus me-1"></i> New Campaign
                        </Link>
                      )}
                      {activeTab === "2" && (
                        <Button color="primary" onClick={() => navigate("/email-campaigns/segment/create")}>
                          <i className="bx bx-plus me-1"></i> New Segment
                        </Button>
                      )}
                    </div>
                  </div>

                  <TabContent activeTab={activeTab}>
                    {/* Campaigns Tab */}
                    <TabPane tabId="1">
                      {campaigns.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bx bx-rocket" style={{ fontSize: "48px", color: "#aaa" }}></i>
                          <p className="text-muted mt-3">No campaigns yet</p>
                          <Link to="/email-campaigns/create" className="btn btn-primary">
                            Create Your First Campaign
                          </Link>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <Table className="table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Campaign</th>
                                <th>Status</th>
                                <th>Recipients</th>
                                <th>Sent</th>
                                <th>Open Rate</th>
                                <th>Click Rate</th>
                                <th>Scheduled</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {campaigns.map((campaign) => (
                                <tr key={campaign._id}>
                                  <td>
                                    <strong>{campaign.name}</strong>
                                    <br />
                                    <small className="text-muted">{campaign.subject}</small>
                                  </td>
                                  <td>
                                    <Badge color={CAMPAIGN_STATUS_COLORS[campaign.status] || "secondary"}>
                                      {campaign.status}
                                    </Badge>
                                    {campaign.isABTest && (
                                      <Badge color="purple" className="ms-1">A/B Test</Badge>
                                    )}
                                  </td>
                                  <td>{campaign.totalRecipients?.toLocaleString() || 0}</td>
                                  <td>{campaign.stats?.sent?.toLocaleString() || 0}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <Progress
                                        value={campaign.openRate || 0}
                                        color="success"
                                        style={{ width: "60px", height: "6px" }}
                                        className="me-2"
                                      />
                                      <span>{campaign.openRate || 0}%</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <Progress
                                        value={campaign.clickRate || 0}
                                        color="info"
                                        style={{ width: "60px", height: "6px" }}
                                        className="me-2"
                                      />
                                      <span>{campaign.clickRate || 0}%</span>
                                    </div>
                                  </td>
                                  <td>{formatDate(campaign.scheduledAt)}</td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button
                                        color="info"
                                        size="sm"
                                        outline
                                        onClick={() => navigate(`/email-campaigns/${campaign._id}/analytics`)}
                                        title="View Analytics"
                                      >
                                        <i className="bx bx-bar-chart-alt-2"></i>
                                      </Button>
                                      <Button
                                        color="primary"
                                        size="sm"
                                        outline
                                        onClick={() => navigate(`/email-campaigns/${campaign._id}/edit`)}
                                        title="Edit"
                                        disabled={campaign.status !== "draft" && campaign.status !== "scheduled"}
                                      >
                                        <i className="bx bx-edit"></i>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </TabPane>

                    {/* Segments Tab */}
                    <TabPane tabId="2">
                      <Alert color="info" className="mb-4">
                        <i className="bx bx-info-circle me-2"></i>
                        <strong>Customer Segments</strong> allow you to target specific groups of customers based on their behavior, demographics, and engagement.
                      </Alert>

                      {segments.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bx bx-group" style={{ fontSize: "48px", color: "#aaa" }}></i>
                          <p className="text-muted mt-3">No segments created yet</p>
                          <Button color="primary" onClick={() => navigate("/email-campaigns/segment/create")}>
                            Create Your First Segment
                          </Button>
                        </div>
                      ) : (
                        <Row>
                          {segments.map((segment) => (
                            <Col md={4} key={segment._id} className="mb-3">
                              <Card className="border h-100">
                                <CardBody>
                                  <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                      <h5 className="mb-1">{segment.name}</h5>
                                      <small className="text-muted">{segment.description || "No description"}</small>
                                    </div>
                                    <Badge color={segment.isDynamic ? "primary" : "secondary"}>
                                      {segment.isDynamic ? "Dynamic" : "Static"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                      <i className="bx bx-user-circle text-primary me-2"></i>
                                      <span className="fw-bold">{segment.memberCount?.toLocaleString() || 0}</span>
                                      <span className="text-muted ms-1">members</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <i className="bx bx-send text-success me-2"></i>
                                      <span>{segment.campaignsUsed || 0} campaigns used</span>
                                    </div>
                                  </div>

                                  <div className="d-flex gap-2">
                                    <Button color="primary" size="sm" outline className="flex-grow-1">
                                      <i className="bx bx-rocket me-1"></i> Use in Campaign
                                    </Button>
                                    <Button color="secondary" size="sm" outline>
                                      <i className="bx bx-edit"></i>
                                    </Button>
                                  </div>
                                </CardBody>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}

                      {/* Pre-built Segment Suggestions */}
                      <Card className="mt-4 border-0 bg-light">
                        <CardBody>
                          <h5 className="mb-3">
                            <i className="bx bx-bulb text-warning me-2"></i>
                            Suggested Segments
                          </h5>
                          <Row>
                            {[
                              { name: "Recent Bookers", desc: "Customers who booked in the last 30 days", icon: "bx-calendar-check", color: "success" },
                              { name: "High Spenders", desc: "Customers who spent more than $500", icon: "bx-dollar-circle", color: "warning" },
                              { name: "Inactive Users", desc: "No booking in last 90 days", icon: "bx-time", color: "danger" },
                              { name: "Newsletter Subscribers", desc: "Subscribed to newsletter", icon: "bx-envelope", color: "info" },
                            ].map((seg, idx) => (
                              <Col md={3} key={idx}>
                                <div className="bg-white p-3 rounded border mb-2">
                                  <div className="d-flex align-items-center mb-2">
                                    <div className={`avatar-xs me-2`}>
                                      <span className={`avatar-title rounded-circle bg-${seg.color}-subtle text-${seg.color}`}>
                                        <i className={`bx ${seg.icon}`}></i>
                                      </span>
                                    </div>
                                    <strong className="small">{seg.name}</strong>
                                  </div>
                                  <p className="text-muted small mb-0">{seg.desc}</p>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </CardBody>
                      </Card>
                    </TabPane>

                    {/* Analytics Tab */}
                    <TabPane tabId="3">
                      <Row>
                        <Col md={8}>
                          <Card className="border-0 bg-light">
                            <CardBody>
                              <h5 className="mb-4">Email Performance (Last 30 Days)</h5>
                              <div className="d-flex justify-content-around text-center">
                                <div>
                                  <h2 className="text-primary">{analytics?.overview?.totalSent?.toLocaleString() || 0}</h2>
                                  <p className="text-muted mb-0">Emails Sent</p>
                                </div>
                                <div>
                                  <h2 className="text-success">{analytics?.overview?.totalOpened?.toLocaleString() || 0}</h2>
                                  <p className="text-muted mb-0">Opened</p>
                                </div>
                                <div>
                                  <h2 className="text-info">{analytics?.overview?.totalClicked?.toLocaleString() || 0}</h2>
                                  <p className="text-muted mb-0">Clicked</p>
                                </div>
                                <div>
                                  <h2 className="text-danger">{analytics?.overview?.totalFailed?.toLocaleString() || 0}</h2>
                                  <p className="text-muted mb-0">Failed</p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>

                          {/* Top Performing Templates */}
                          {analytics?.topTemplates?.length > 0 && (
                            <Card className="mt-4">
                              <CardBody>
                                <h5 className="mb-4">Top Performing Templates</h5>
                                <Table className="table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Template Type</th>
                                      <th>Sent</th>
                                      <th>Open Rate</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analytics.topTemplates.map((t, idx) => (
                                      <tr key={idx}>
                                        <td>
                                          <Badge color="primary">{t._id}</Badge>
                                        </td>
                                        <td>{t.sent}</td>
                                        <td>
                                          <Progress value={t.openRate} color="success" style={{ height: "8px" }} />
                                          <small>{t.openRate?.toFixed(1)}%</small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </CardBody>
                            </Card>
                          )}
                        </Col>

                        <Col md={4}>
                          {/* Recent Campaigns */}
                          <Card>
                            <CardBody>
                              <h5 className="mb-3">Recent Campaigns</h5>
                              {analytics?.recentCampaigns?.length > 0 ? (
                                analytics.recentCampaigns.map((c, idx) => (
                                  <div key={idx} className="border-bottom pb-3 mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <strong className="small">{c.name}</strong>
                                      <Badge color={CAMPAIGN_STATUS_COLORS[c.status]}>{c.status}</Badge>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2 small text-muted">
                                      <span>Open: {c.openRate || 0}%</span>
                                      <span>Click: {c.clickRate || 0}%</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted text-center">No recent campaigns</p>
                              )}
                            </CardBody>
                          </Card>

                          {/* Quick Actions */}
                          <Card className="mt-4">
                            <CardBody>
                              <h5 className="mb-3">Quick Actions</h5>
                              <div className="d-grid gap-2">
                                <Link to="/email-campaigns/create" className="btn btn-primary">
                                  <i className="bx bx-plus me-1"></i> New Campaign
                                </Link>
                                <Link to="/email-templates" className="btn btn-outline-primary">
                                  <i className="bx bx-file me-1"></i> Manage Templates
                                </Link>
                                <Button color="outline-info">
                                  <i className="bx bx-download me-1"></i> Export Report
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Campaigns;

