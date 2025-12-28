import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Badge,
  Spinner,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

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

const STATUS_COLORS = {
  pending: "warning",
  sent: "success",
  failed: "danger",
  delivered: "info",
  opened: "primary",
  clicked: "success",
  bounced: "dark",
};

const EmailLogs = () => {
  document.title = "Email Logs | TickYourList Dashboard";

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    templateType: "",
    startDate: "",
    endDate: "",
  });
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      let url = `/v1/tyl-email-templates/logs?page=${pagination.page}&limit=${pagination.limit}`;

      if (filters.status) url += `&status=${filters.status}`;
      if (filters.templateType) url += `&templateType=${filters.templateType}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;

      const response = await get(url);

      if (response.success) {
        setLogs(response.data.logs || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
          pages: response.data.pages,
        }));
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toastr.error("Failed to fetch email logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePreview = (log) => {
    setSelectedLog(log);
    setPreviewModal(true);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      templateType: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Templates" breadcrumbItem="Email Logs" />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title mb-0">Email Sending History</h4>
                    <Button color="secondary" size="sm" outline onClick={clearFilters}>
                      <i className="bx bx-refresh me-1"></i> Clear Filters
                    </Button>
                  </div>

                  {/* Filters */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <Input
                        type="select"
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="delivered">Delivered</option>
                        <option value="opened">Opened</option>
                      </Input>
                    </Col>
                    <Col md={3}>
                      <Input
                        type="select"
                        value={filters.templateType}
                        onChange={(e) => handleFilterChange("templateType", e.target.value)}
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
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        placeholder="Start Date"
                      />
                    </Col>
                    <Col md={3}>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        placeholder="End Date"
                      />
                    </Col>
                  </Row>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading logs...</p>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bx bx-envelope text-muted" style={{ fontSize: "64px" }}></i>
                      <h5 className="text-muted mt-3">No email logs found</h5>
                      <p className="text-muted">Start sending emails to see activity here.</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table className="table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Recipient</th>
                              <th>Subject</th>
                              <th>Type</th>
                              <th>From</th>
                              <th>Status</th>
                              <th>Sent At</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logs.map((log) => (
                              <tr key={log._id}>
                                <td>
                                  <strong>{log.recipientName || "N/A"}</strong>
                                  <p className="text-muted small mb-0">{log.recipientEmail}</p>
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "200px" }}
                                  title={log.subject}
                                >
                                  {log.subject}
                                </td>
                                <td>
                                  <Badge color="secondary" className="font-size-11">
                                    {TEMPLATE_TYPE_LABELS[log.templateType] || log.templateType || "N/A"}
                                  </Badge>
                                </td>
                                <td className="small">{log.fromEmail}</td>
                                <td>
                                  <Badge color={STATUS_COLORS[log.status] || "secondary"}>
                                    {log.status}
                                  </Badge>
                                  {log.errorMessage && (
                                    <p className="text-danger small mb-0 mt-1" title={log.errorMessage}>
                                      {log.errorMessage.substring(0, 30)}...
                                    </p>
                                  )}
                                </td>
                                <td className="small">
                                  {log.sentAt
                                    ? new Date(log.sentAt).toLocaleString()
                                    : new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td>
                                  <Button
                                    color="info"
                                    size="sm"
                                    outline
                                    onClick={() => handlePreview(log)}
                                  >
                                    <i className="bx bx-show"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {pagination.pages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <p className="text-muted mb-0">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                            {pagination.total} entries
                          </p>
                          <Pagination>
                            <PaginationItem disabled={pagination.page === 1}>
                              <PaginationLink
                                previous
                                onClick={() => handlePageChange(pagination.page - 1)}
                              />
                            </PaginationItem>
                            {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                              const pageNum = idx + 1;
                              return (
                                <PaginationItem key={pageNum} active={pageNum === pagination.page}>
                                  <PaginationLink onClick={() => handlePageChange(pageNum)}>
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            <PaginationItem disabled={pagination.page === pagination.pages}>
                              <PaginationLink
                                next
                                onClick={() => handlePageChange(pagination.page + 1)}
                              />
                            </PaginationItem>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl">
        <ModalHeader toggle={() => setPreviewModal(false)}>
          Email Details - {selectedLog?.recipientEmail}
        </ModalHeader>
        <ModalBody>
          {selectedLog && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1">
                    <strong>To:</strong> {selectedLog.recipientName} ({selectedLog.recipientEmail})
                  </p>
                  <p className="mb-1">
                    <strong>From:</strong> {selectedLog.fromEmail}
                  </p>
                  <p className="mb-1">
                    <strong>Subject:</strong> {selectedLog.subject}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Status:</strong>{" "}
                    <Badge color={STATUS_COLORS[selectedLog.status]}>{selectedLog.status}</Badge>
                  </p>
                  <p className="mb-1">
                    <strong>Sent:</strong>{" "}
                    {selectedLog.sentAt
                      ? new Date(selectedLog.sentAt).toLocaleString()
                      : "Not sent yet"}
                  </p>
                  {selectedLog.errorMessage && (
                    <p className="mb-1 text-danger">
                      <strong>Error:</strong> {selectedLog.errorMessage}
                    </p>
                  )}
                </Col>
              </Row>
              <hr />
              <div
                style={{
                  backgroundColor: "#f4f7fa",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <iframe
                  srcDoc={selectedLog.htmlContent}
                  title="Email Content"
                  style={{
                    width: "100%",
                    height: "500px",
                    border: "none",
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </>
          )}
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

export default EmailLogs;

