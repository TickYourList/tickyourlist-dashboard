import React, { useState, useEffect } from "react";
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
  FormGroup,
  Label,
  Input,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put, del } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import classnames from "classnames";

// Criteria options
const CRITERIA_OPTIONS = [
  { 
    category: "Booking Behavior",
    options: [
      { key: "hasBooked", label: "Has Made Booking", type: "boolean" },
      { key: "bookingCountMin", label: "Min Bookings", type: "number" },
      { key: "bookingCountMax", label: "Max Bookings", type: "number" },
      { key: "lastBookingDaysAgo", label: "Last Booking Within (days)", type: "number" },
      { key: "totalSpentMin", label: "Total Spent Min (AED)", type: "number" },
      { key: "totalSpentMax", label: "Total Spent Max (AED)", type: "number" },
    ]
  },
  {
    category: "Account",
    options: [
      { key: "isVerified", label: "Is Verified", type: "boolean" },
      { key: "accountCreatedDaysAgo", label: "Account Age Max (days)", type: "number" },
    ]
  },
  {
    category: "Engagement",
    options: [
      { key: "hasOpenedEmail", label: "Has Opened Email", type: "boolean" },
      { key: "openedEmailDaysAgo", label: "Opened Email Within (days)", type: "number" },
      { key: "hasClickedEmail", label: "Has Clicked Email", type: "boolean" },
    ]
  },
];

const Segments = () => {
  const navigate = useNavigate();
  document.title = "Customer Segments | TickYourList Dashboard";

  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  // New segment form
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    isDynamic: true,
    criteria: {},
  });
  const [previewCount, setPreviewCount] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Import modal
  const [importBucketId, setImportBucketId] = useState("");
  const [importEmails, setImportEmails] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchSegments();
    fetchBuckets();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await get("/v1/tyl-email-campaigns/segments");
      if (response.success) {
        setSegments(response.data);
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
      toastr.error("Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuckets = async () => {
    try {
      const response = await get("/v1/tyl-email-campaigns/customer-buckets");
      if (response.success) {
        setBuckets(response.data);
      }
    } catch (error) {
      console.error("Error fetching buckets:", error);
    }
  };

  const handlePreviewCriteria = async () => {
    if (Object.keys(newSegment.criteria).length === 0) {
      toastr.warning("Add at least one criteria to preview");
      return;
    }

    try {
      setPreviewLoading(true);
      const response = await post("/v1/tyl-email-campaigns/segments/preview", {
        criteria: newSegment.criteria,
      });
      if (response.success) {
        setPreviewCount(response.data);
      }
    } catch (error) {
      console.error("Error previewing segment:", error);
      toastr.error("Failed to preview segment");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateSegment = async () => {
    if (!newSegment.name) {
      toastr.error("Segment name is required");
      return;
    }

    try {
      setCreating(true);
      const response = await post("/v1/tyl-email-campaigns/segments/create", newSegment);
      if (response.success) {
        toastr.success("Segment created successfully!");
        setCreateModal(false);
        setNewSegment({ name: "", description: "", isDynamic: true, criteria: {} });
        setPreviewCount(null);
        fetchSegments();
      } else {
        toastr.error(response.message || "Failed to create segment");
      }
    } catch (error) {
      console.error("Error creating segment:", error);
      toastr.error("Failed to create segment");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSegment = async () => {
    if (!selectedSegment) return;

    try {
      const response = await del(`/v1/tyl-email-campaigns/segments/${selectedSegment._id}`);
      if (response.success) {
        toastr.success("Segment deleted successfully!");
        setDeleteModal(false);
        fetchSegments();
      } else {
        toastr.error(response.message || "Failed to delete segment");
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
      toastr.error("Failed to delete segment");
    }
  };

  const handleImportFromBucket = async () => {
    if (!selectedSegment || !importBucketId) {
      toastr.error("Select a bucket to import from");
      return;
    }

    try {
      setImporting(true);
      const response = await post(`/v1/tyl-email-campaigns/segments/${selectedSegment._id}/import-from-bucket`, {
        bucketId: importBucketId,
      });
      if (response.success) {
        toastr.success(response.message);
        setImportModal(false);
        setImportBucketId("");
        fetchSegments();
      } else {
        toastr.error(response.message || "Failed to import");
      }
    } catch (error) {
      console.error("Error importing:", error);
      toastr.error("Failed to import");
    } finally {
      setImporting(false);
    }
  };

  const handleImportEmails = async () => {
    if (!selectedSegment || !importEmails.trim()) {
      toastr.error("Enter emails to import");
      return;
    }

    const emails = importEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e && e.includes("@"));
    
    if (emails.length === 0) {
      toastr.error("No valid emails found");
      return;
    }

    try {
      setImporting(true);
      const response = await post(`/v1/tyl-email-campaigns/segments/${selectedSegment._id}/add-members`, {
        emails: emails.map(e => ({ email: e })),
      });
      if (response.success) {
        toastr.success(response.message);
        setImportModal(false);
        setImportEmails("");
        fetchSegments();
      } else {
        toastr.error(response.message || "Failed to import");
      }
    } catch (error) {
      console.error("Error importing:", error);
      toastr.error("Failed to import");
    } finally {
      setImporting(false);
    }
  };

  const setCriteriaValue = (key, value) => {
    setNewSegment({
      ...newSegment,
      criteria: {
        ...newSegment.criteria,
        [key]: value,
      },
    });
    setPreviewCount(null);
  };

  const removeCriteria = (key) => {
    const newCriteria = { ...newSegment.criteria };
    delete newCriteria[key];
    setNewSegment({ ...newSegment, criteria: newCriteria });
    setPreviewCount(null);
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading segments...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Marketing" breadcrumbItem="Customer Segments" />

          {/* Stats Cards */}
          <Row className="mb-4">
            {buckets.slice(0, 4).map((bucket) => (
              <Col md={3} key={bucket.id}>
                <Card className="mini-stats-wid">
                  <CardBody>
                    <div className="d-flex">
                      <div className="flex-grow-1">
                        <p className="text-muted fw-medium mb-2">{bucket.name}</p>
                        <h4 className="mb-0">{bucket.count.toLocaleString()}</h4>
                      </div>
                      <div className="flex-shrink-0 align-self-center">
                        <div className={`mini-stat-icon avatar-sm rounded-circle bg-${bucket.color}`}>
                          <span className="avatar-title">
                            <i className={`bx ${bucket.icon} font-size-24`}></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <Row className="mb-4">
                    <Col md={6}>
                      <CardTitle className="h4">Customer Segments</CardTitle>
                      <p className="card-title-desc">Create and manage customer segments for targeted email campaigns.</p>
                    </Col>
                    <Col md={6} className="text-end">
                      <Button color="primary" onClick={() => setCreateModal(true)}>
                        <i className="bx bx-plus me-1"></i> Create New Segment
                      </Button>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <Table className="table mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Members</th>
                          <th>Campaigns Used</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {segments.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <div className="text-muted">
                                <i className="bx bx-filter font-size-24 mb-2 d-block"></i>
                                No segments yet. Create your first segment to start targeting customers!
                              </div>
                            </td>
                          </tr>
                        ) : (
                          segments.map((segment) => (
                            <tr key={segment._id}>
                              <td>
                                <strong>{segment.name}</strong>
                              </td>
                              <td>{segment.description || "-"}</td>
                              <td>
                                <Badge color={segment.isDynamic ? "info" : "secondary"}>
                                  {segment.isDynamic ? "Dynamic" : "Static"}
                                </Badge>
                              </td>
                              <td>
                                <Badge color="primary" className="font-size-12">
                                  {segment.memberCount?.toLocaleString() || 0}
                                </Badge>
                              </td>
                              <td>{segment.campaignsUsed || 0}</td>
                              <td>
                                {segment.lastCalculatedAt
                                  ? new Date(segment.lastCalculatedAt).toLocaleDateString()
                                  : new Date(segment.updatedAt).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    color="info"
                                    size="sm"
                                    outline
                                    onClick={() => {
                                      setSelectedSegment(segment);
                                      setImportModal(true);
                                    }}
                                  >
                                    <i className="bx bx-import"></i>
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    outline
                                    onClick={() => {
                                      setSelectedSegment(segment);
                                      setDeleteModal(true);
                                    }}
                                  >
                                    <i className="bx bx-trash"></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Create Segment Modal */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)} size="lg">
        <ModalHeader toggle={() => setCreateModal(false)}>Create New Segment</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Segment Name *</Label>
            <Input
              type="text"
              value={newSegment.name}
              onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
              placeholder="e.g., High Value Customers"
            />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input
              type="textarea"
              rows="2"
              value={newSegment.description}
              onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
              placeholder="Describe this segment..."
            />
          </FormGroup>
          <FormGroup check className="mb-3">
            <Input
              type="checkbox"
              id="isDynamic"
              checked={newSegment.isDynamic}
              onChange={(e) => setNewSegment({ ...newSegment, isDynamic: e.target.checked })}
            />
            <Label check for="isDynamic">
              Dynamic Segment (recalculates members automatically)
            </Label>
          </FormGroup>

          <hr />
          <h5 className="mb-3">Criteria</h5>

          {CRITERIA_OPTIONS.map((group) => (
            <div key={group.category} className="mb-4">
              <h6 className="text-primary mb-2">{group.category}</h6>
              <Row>
                {group.options.map((option) => (
                  <Col md={6} key={option.key}>
                    <FormGroup className="mb-2">
                      <div className="d-flex align-items-center">
                        {option.type === "boolean" ? (
                          <>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={newSegment.criteria[option.key] === undefined ? "" : String(newSegment.criteria[option.key])}
                              onChange={(e) => {
                                if (e.target.value === "") {
                                  removeCriteria(option.key);
                                } else {
                                  setCriteriaValue(option.key, e.target.value === "true");
                                }
                              }}
                              style={{ width: "auto" }}
                            >
                              <option value="">-- Any --</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </Input>
                            <Label className="mb-0 ms-2 small">{option.label}</Label>
                          </>
                        ) : (
                          <>
                            <Input
                              type="number"
                              bsSize="sm"
                              style={{ width: "80px" }}
                              value={newSegment.criteria[option.key] || ""}
                              onChange={(e) => {
                                if (e.target.value === "") {
                                  removeCriteria(option.key);
                                } else {
                                  setCriteriaValue(option.key, parseInt(e.target.value));
                                }
                              }}
                              placeholder="--"
                            />
                            <Label className="mb-0 ms-2 small">{option.label}</Label>
                          </>
                        )}
                      </div>
                    </FormGroup>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          {Object.keys(newSegment.criteria).length > 0 && (
            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Active Criteria:</strong>
                <Button color="info" size="sm" onClick={handlePreviewCriteria} disabled={previewLoading}>
                  {previewLoading ? <Spinner size="sm" /> : <><i className="bx bx-search me-1"></i> Preview</>}
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(newSegment.criteria).map(([key, value]) => (
                  <Badge key={key} color="secondary" className="p-2">
                    {key}: {String(value)}
                    <i
                      className="bx bx-x ms-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeCriteria(key)}
                    ></i>
                  </Badge>
                ))}
              </div>
              {previewCount && (
                <Alert color="success" className="mt-3 mb-0">
                  <strong>{previewCount.estimatedCount.toLocaleString()}</strong> customers match this criteria
                  {previewCount.sample?.length > 0 && (
                    <div className="mt-2 small">
                      Sample: {previewCount.sample.map(s => s.email).join(", ")}
                    </div>
                  )}
                </Alert>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleCreateSegment} disabled={creating}>
            {creating ? <Spinner size="sm" /> : "Create Segment"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importModal} toggle={() => setImportModal(false)} size="lg">
        <ModalHeader toggle={() => setImportModal(false)}>
          Import Members to "{selectedSegment?.name}"
        </ModalHeader>
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => setActiveTab("1")}
                style={{ cursor: "pointer" }}
              >
                From Customer Bucket
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => setActiveTab("2")}
                style={{ cursor: "pointer" }}
              >
                Paste Emails
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} className="pt-3">
            <TabPane tabId="1">
              <FormGroup>
                <Label>Select Customer Bucket</Label>
                <div className="d-flex flex-wrap gap-2">
                  {buckets.map((bucket) => (
                    <Button
                      key={bucket.id}
                      color={importBucketId === bucket.id ? "primary" : "light"}
                      onClick={() => setImportBucketId(bucket.id)}
                    >
                      <i className={`bx ${bucket.icon} me-1`}></i>
                      {bucket.name} ({bucket.count.toLocaleString()})
                    </Button>
                  ))}
                </div>
              </FormGroup>
              <Button
                color="primary"
                className="mt-3"
                onClick={handleImportFromBucket}
                disabled={!importBucketId || importing}
              >
                {importing ? <Spinner size="sm" /> : "Import from Bucket"}
              </Button>
            </TabPane>
            <TabPane tabId="2">
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
              <Button
                color="primary"
                onClick={handleImportEmails}
                disabled={!importEmails.trim() || importing}
              >
                {importing ? <Spinner size="sm" /> : "Import Emails"}
              </Button>
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setImportModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>Delete Segment</ModalHeader>
        <ModalBody>
          Are you sure you want to delete "{selectedSegment?.name}"?
          <br />
          <span className="text-danger">This action cannot be undone.</span>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button color="danger" onClick={handleDeleteSegment}>Delete</Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Segments;

