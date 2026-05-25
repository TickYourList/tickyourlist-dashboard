import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody, Label,
} from "reactstrap";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
  fetchGlobtixBookingsRequest,
  fetchGlobtixBookingDetailRequest,
  cancelGlobtixBookingRequest,
} from "store/tickyourlist/globaltix/action";

const STATUS_COLORS = {
  RESERVED: "warning",
  CONFIRMED: "success",
  RELEASED: "secondary",
  CANCELLED: "danger",
  ERROR: "danger",
};

const GlobtixBookingsPage = () => {
  const dispatch = useDispatch();
  const {
    bookings, bookingsPagination, bookingsLoading,
    bookingDetail, bookingDetailLoading,
    cancelLoading, cancelSuccess,
  } = useSelector((state) => state.globaltix || {});

  const [environment] = useState("staging");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmRef, setCancelConfirmRef] = useState(null);

  useEffect(() => {
    dispatch(fetchGlobtixBookingsRequest({ environment, status: statusFilter || undefined, page, limit: 20 }));
  }, [dispatch, environment, statusFilter, page]);

  // Close cancel modal as soon as cancelLoading finishes
  useEffect(() => {
    if (cancelSuccess && !cancelLoading) {
      setCancelConfirmRef(null);
      setCancelReason("");
    }
  }, [cancelSuccess, cancelLoading]);

  const handleViewDetail = (referenceNumber) => {
    dispatch(fetchGlobtixBookingDetailRequest(referenceNumber));
    setDetailModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelConfirmRef) return;
    dispatch(cancelGlobtixBookingRequest(cancelConfirmRef, environment, cancelReason));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Globaltix Bookings</h4>
                <p className="text-muted mb-0">
                  All Globaltix booking records &bull; {bookingsPagination?.total || 0} total
                </p>
              </div>
            </div>

            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <Row className="align-items-center">
                  <Col md={4}>
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                      <option value="">All Statuses</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="RELEASED">Released</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="ERROR">Error</option>
                    </Input>
                  </Col>
                  <Col className="text-end">
                    <Badge color="secondary">{environment}</Badge>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-0">
                {bookingsLoading ? (
                  <div className="text-center py-5"><Spinner /></div>
                ) : (
                  <Table hover responsive className="mb-0 table-nowrap align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Reference</th>
                        <th>Product</th>
                        <th>Option</th>
                        <th>Visit Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Reserved At</th>
                        <th>Linked Booking</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!bookings?.length ? (
                        <tr>
                          <td colSpan={9} className="text-center py-4 text-muted">No bookings found</td>
                        </tr>
                      ) : (
                        bookings.map((b) => (
                          <tr key={b._id}>
                            <td>
                              <code style={{ fontSize: 12 }}>{b.referenceNumber}</code>
                            </td>
                            <td>
                              <div style={{ maxWidth: 180 }} className="text-truncate">{b.globaltixProductName}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>ID: {b.globaltixProductId}</div>
                            </td>
                            <td>{b.optionName || b.optionId}</td>
                            <td>
                              {b.visitDate
                                ? <>{b.visitDate}{b.visitTime ? ` ${b.visitTime}` : ""}</>
                                : <span className="text-muted">—</span>}
                            </td>
                            <td>{b.currency} {b.totalAmount?.toFixed(2)}</td>
                            <td>
                              <Badge color={STATUS_COLORS[b.status] || "secondary"}>{b.status}</Badge>
                            </td>
                            <td className="text-muted small">
                              {b.reservedAt ? new Date(b.reservedAt).toLocaleString() : "—"}
                            </td>
                            <td>
                              {b.tourBookingId ? (
                                <Badge color="info" style={{ fontSize: 11 }}>Linked</Badge>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button size="sm" color="outline-primary" onClick={() => handleViewDetail(b.referenceNumber)} title="View">
                                  <i className="bx bx-info-circle"></i>
                                </Button>
                                {b.status === "CONFIRMED" && b.isCancellable && (
                                  <Button size="sm" color="outline-danger" onClick={() => setCancelConfirmRef(b.referenceNumber)} title="Cancel">
                                    <i className="bx bx-x"></i>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>

            {bookingsPagination?.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">Page {page} of {bookingsPagination.pages}</span>
                <div className="d-flex gap-2">
                  <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button size="sm" color="outline-secondary" disabled={page >= bookingsPagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Detail Modal */}
      <Modal isOpen={detailModalOpen} toggle={() => setDetailModalOpen(false)} size="lg" scrollable>
        <ModalHeader toggle={() => setDetailModalOpen(false)}>
          <span>Booking Detail</span>
          {bookingDetail?.referenceNumber && (
            <Button
              size="sm"
              color="outline-secondary"
              className="ms-3"
              onClick={() => dispatch(fetchGlobtixBookingDetailRequest(bookingDetail.referenceNumber))}
              disabled={bookingDetailLoading}
              title="Refresh from Globaltix"
            >
              {bookingDetailLoading ? <Spinner size="sm" /> : <i className="bx bx-refresh" />}
            </Button>
          )}
        </ModalHeader>
        <ModalBody>
          {bookingDetailLoading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : bookingDetail ? (
            <div>
              <Row className="mb-3">
                <Col>
                  <Label className="text-muted small">Reference</Label>
                  <div><code>{bookingDetail.referenceNumber}</code></div>
                </Col>
                <Col>
                  <Label className="text-muted small">Status</Label>
                  <div><Badge color={STATUS_COLORS[bookingDetail.status]}>{bookingDetail.status}</Badge></div>
                </Col>
                <Col>
                  <Label className="text-muted small">Total</Label>
                  <div>{bookingDetail.currency} {bookingDetail.totalAmount?.toFixed(2)}</div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Label className="text-muted small">Product</Label>
                  <div>{bookingDetail.globaltixProductName} ({bookingDetail.globaltixProductId})</div>
                </Col>
                <Col>
                  <Label className="text-muted small">Option</Label>
                  <div>{bookingDetail.optionName}</div>
                </Col>
              </Row>
              {bookingDetail.visitDate && (
                <Row className="mb-3">
                  <Col>
                    <Label className="text-muted small">Visit Date/Time</Label>
                    <div>{bookingDetail.visitDate} {bookingDetail.visitTime}</div>
                  </Col>
                </Row>
              )}

              {bookingDetail.vouchers?.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-semibold">Vouchers ({bookingDetail.vouchers.length})</Label>
                  {bookingDetail.vouchers.map((v, i) => (
                    <Card key={i} className="mb-2">
                      <CardBody className="py-2">
                        <Row>
                          <Col>
                            <div className="small">
                              {v.serialNumber && <div><strong>S/N:</strong> {v.serialNumber}</div>}
                              {v.barcode && <div><strong>Barcode:</strong> {v.barcode}</div>}
                              {v.eTicketUrl && (
                                <div>
                                  <strong>E-Ticket:</strong>{" "}
                                  <a href={v.eTicketUrl} target="_blank" rel="noreferrer">View</a>
                                </div>
                              )}
                              {v.viewTicketUrl && (
                                <div>
                                  <strong>View Ticket:</strong>{" "}
                                  <a href={v.viewTicketUrl} target="_blank" rel="noreferrer">Open</a>
                                </div>
                              )}
                            </div>
                          </Col>
                          {v.qrcode && (
                            <Col xs="auto">
                              <img
                                src={`data:image/png;base64,${v.qrcode}`}
                                alt="QR Code"
                                style={{ width: 100, height: 100, imageRendering: "pixelated" }}
                              />
                            </Col>
                          )}
                        </Row>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {bookingDetail.cancellationPolicy && (
                <Alert color="info" className="py-2 mb-0">
                  Cancellation Policy: {bookingDetail.cancellationPolicy.percentReturn}% refund if cancelled {bookingDetail.cancellationPolicy.refundDuration}h before.
                </Alert>
              )}
            </div>
          ) : null}
        </ModalBody>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={!!cancelConfirmRef} toggle={() => setCancelConfirmRef(null)} size="sm">
        <ModalHeader toggle={() => setCancelConfirmRef(null)}>Confirm Cancellation</ModalHeader>
        <ModalBody>
          <p>Cancel booking <code>{cancelConfirmRef}</code>?</p>
          <Label>Reason (optional)</Label>
          <Input
            type="textarea"
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancellation reason..."
          />
        </ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setCancelConfirmRef(null)}>No</Button>
          <Button color="danger" onClick={handleCancelConfirm} disabled={cancelLoading}>
            {cancelLoading ? <Spinner size="sm" /> : "Yes, Cancel"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GlobtixBookingsPage;
