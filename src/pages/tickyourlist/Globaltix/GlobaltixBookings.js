import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody, Label,
} from "reactstrap";
import {
  fetchGlobtixBookingsRequest,
  fetchGlobtixBookingDetailRequest,
  cancelGlobtixBookingRequest,
  confirmGlobtixBookingRequest,
  releaseGlobtixBookingRequest,
  resendGlobtixEmailRequest,
  refreshGlobtixBookingRequest,
} from "store/tickyourlist/globaltix/action";

const STATUS_COLORS = {
  RESERVED: "warning",
  CONFIRMED: "success",
  RELEASED: "secondary",
  CANCELLED: "danger",
  ERROR: "danger",
};

function HoldExpiry({ holdExpiresAt }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!holdExpiresAt) return;
    const tick = () => {
      const diff = new Date(holdExpiresAt) - new Date();
      if (diff <= 0) { setRemaining("EXPIRED"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);
  if (!remaining) return null;
  const isExpired = remaining === "EXPIRED";
  const isCritical = !isExpired && parseInt(remaining) < 5;
  return (
    <span className={`badge ${isExpired ? "bg-danger" : isCritical ? "bg-warning text-dark" : "bg-info"}`} style={{ fontSize: 10 }}>
      {isExpired ? "Hold Expired" : `Hold: ${remaining}`}
    </span>
  );
}

const GlobtixBookingsPage = () => {
  const dispatch = useDispatch();
  const {
    bookings, bookingsPagination, bookingsLoading,
    bookingDetail, bookingDetailLoading,
    cancelLoading, cancelSuccess,
    confirmLoading,
    releaseLoading,
    resendEmailLoading,
    refreshBookingLoading,
  } = useSelector((state) => state.globaltix || {});

  const [environment] = useState("staging");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmRef, setCancelConfirmRef] = useState(null);

  const fetchBookings = useCallback(() => {
    dispatch(fetchGlobtixBookingsRequest({ environment, status: statusFilter || undefined, page, limit: 20 }));
  }, [dispatch, environment, statusFilter, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (cancelSuccess && !cancelLoading) {
      setCancelConfirmRef(null);
      setCancelReason("");
      fetchBookings();
    }
  }, [cancelSuccess, cancelLoading]); // eslint-disable-line

  const handleViewDetail = (referenceNumber) => {
    dispatch(fetchGlobtixBookingDetailRequest(referenceNumber));
    setDetailModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelConfirmRef) return;
    dispatch(cancelGlobtixBookingRequest(cancelConfirmRef, environment, cancelReason));
  };

  const handleConfirm = (referenceNumber) => {
    dispatch(confirmGlobtixBookingRequest(referenceNumber, environment));
  };

  const handleRelease = (referenceNumber) => {
    dispatch(releaseGlobtixBookingRequest(referenceNumber, environment));
  };

  const handleResendEmail = (referenceNumber) => {
    dispatch(resendGlobtixEmailRequest(referenceNumber, environment));
  };

  const handleRefreshFromApi = (referenceNumber) => {
    dispatch(refreshGlobtixBookingRequest(referenceNumber, environment));
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
              <Badge color="secondary">{environment}</Badge>
            </div>

            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <Row className="align-items-center g-2">
                  <Col md={3}>
                    <Input type="select" value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                      <option value="">All Statuses</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="RELEASED">Released</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="ERROR">Error</option>
                    </Input>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-0">
                {bookingsLoading ? (
                  <div className="text-center py-5"><Spinner /></div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table hover responsive className="mb-0 table-nowrap align-middle" style={{ fontSize: 13 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Reference</th>
                          <th>Product / Option</th>
                          <th>Visit Date</th>
                          <th>Tickets</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Reserved At</th>
                          <th>TYL Booking</th>
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
                                <code style={{ fontSize: 11 }}>{b.referenceNumber}</code>
                                {b.partnerReference && (
                                  <div className="text-muted" style={{ fontSize: 10 }}>Ref: {b.partnerReference}</div>
                                )}
                              </td>
                              <td>
                                <div style={{ maxWidth: 200 }} className="text-truncate fw-medium">{b.globaltixProductName}</div>
                                <div className="text-muted" style={{ fontSize: 11 }}>{b.optionName || `Option ${b.optionId}`}</div>
                              </td>
                              <td>
                                {b.visitDate
                                  ? <>{b.visitDate}{b.visitTime ? <><br /><span className="text-muted" style={{ fontSize: 11 }}>{b.visitTime}</span></> : ""}</>
                                  : <span className="text-muted">Open</span>}
                              </td>
                              <td>
                                {(b.ticketCodes || []).length > 0
                                  ? b.ticketCodes.map((tc, i) => (
                                    <div key={i} style={{ fontSize: 11 }}>{tc.ticketTypeName || `Type ${tc.ticketTypeId}`} × {tc.quantity}</div>
                                  ))
                                  : <span className="text-muted small">—</span>}
                              </td>
                              <td><strong>{b.currency} {b.totalAmount?.toFixed(2)}</strong></td>
                              <td>
                                <div><Badge color={STATUS_COLORS[b.status] || "secondary"}>{b.status}</Badge></div>
                                {b.status === "RESERVED" && b.holdExpiresAt && (
                                  <div className="mt-1"><HoldExpiry holdExpiresAt={b.holdExpiresAt} /></div>
                                )}
                              </td>
                              <td className="text-muted small">
                                {b.reservedAt ? new Date(b.reservedAt).toLocaleString() : "—"}
                              </td>
                              <td>
                                {b.tourBookingId ? (
                                  <Badge color="info" style={{ fontSize: 10 }}>Linked</Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-1 flex-wrap">
                                  <Button size="sm" color="outline-primary" onClick={() => handleViewDetail(b.referenceNumber)} title="View Details">
                                    <i className="bx bx-info-circle"></i>
                                  </Button>
                                  {b.status === "RESERVED" && (
                                    <>
                                      <Button size="sm" color="success" onClick={() => handleConfirm(b.referenceNumber)}
                                        disabled={confirmLoading} title="Confirm booking (deducts credit)">
                                        {confirmLoading ? <Spinner size="sm" /> : <i className="bx bx-check"></i>}
                                      </Button>
                                      <Button size="sm" color="outline-warning" onClick={() => handleRelease(b.referenceNumber)}
                                        disabled={releaseLoading} title="Release hold (credit returned)">
                                        {releaseLoading ? <Spinner size="sm" /> : <i className="bx bx-x"></i>}
                                      </Button>
                                    </>
                                  )}
                                  {b.status === "CONFIRMED" && b.isCancellable && (
                                    <Button size="sm" color="outline-danger" onClick={() => setCancelConfirmRef(b.referenceNumber)} title="Cancel booking">
                                      <i className="bx bx-block"></i>
                                    </Button>
                                  )}
                                  {b.status === "CONFIRMED" && (
                                    <Button size="sm" color="outline-secondary" onClick={() => handleResendEmail(b.referenceNumber)}
                                      disabled={resendEmailLoading} title="Resend confirmation email">
                                      <i className="bx bx-envelope"></i>
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>

            {bookingsPagination?.total > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">
                  Showing {bookings?.length || 0} of {bookingsPagination.total} bookings
                  {bookingsPagination.pages > 1 && ` · Page ${page} of ${bookingsPagination.pages}`}
                </span>
                {bookingsPagination.pages > 1 && (
                  <div className="d-flex gap-2">
                    <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button size="sm" color="outline-secondary" disabled={page >= bookingsPagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* ── Booking Detail Modal ──────────────────────────────── */}
      <Modal isOpen={detailModalOpen} toggle={() => setDetailModalOpen(false)} size="lg" scrollable>
        <ModalHeader toggle={() => setDetailModalOpen(false)}>
          Booking Detail
          {bookingDetail?.referenceNumber && (
            <Button size="sm" color="outline-secondary" className="ms-3"
              onClick={() => handleRefreshFromApi(bookingDetail.referenceNumber)}
              disabled={refreshBookingLoading} title="Refresh live from Globaltix API">
              {refreshBookingLoading ? <Spinner size="sm" /> : <><i className="bx bx-cloud-download me-1" />Live Refresh</>}
            </Button>
          )}
        </ModalHeader>
        <ModalBody>
          {bookingDetailLoading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : bookingDetail ? (
            <div>
              {/* Status bar */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded" style={{ background: "#f8f9fa" }}>
                <div>
                  <div className="text-muted small">Reference</div>
                  <code style={{ fontSize: 15 }}>{bookingDetail.referenceNumber}</code>
                </div>
                <div>
                  <div className="text-muted small">Status</div>
                  <Badge color={STATUS_COLORS[bookingDetail.status]} style={{ fontSize: 13 }}>{bookingDetail.status}</Badge>
                  {bookingDetail.status === "RESERVED" && bookingDetail.holdExpiresAt && (
                    <div className="mt-1"><HoldExpiry holdExpiresAt={bookingDetail.holdExpiresAt} /></div>
                  )}
                </div>
                <div>
                  <div className="text-muted small">Total</div>
                  <strong style={{ fontSize: 16 }}>{bookingDetail.currency} {bookingDetail.totalAmount?.toFixed(2)}</strong>
                </div>
                <div className="ms-auto d-flex gap-2">
                  {bookingDetail.status === "RESERVED" && (
                    <>
                      <Button color="success" size="sm"
                        onClick={() => handleConfirm(bookingDetail.referenceNumber)} disabled={confirmLoading}>
                        {confirmLoading ? <Spinner size="sm" /> : <><i className="bx bx-check me-1" />Confirm</>}
                      </Button>
                      <Button color="outline-warning" size="sm"
                        onClick={() => handleRelease(bookingDetail.referenceNumber)} disabled={releaseLoading}>
                        {releaseLoading ? <Spinner size="sm" /> : <><i className="bx bx-x me-1" />Release</>}
                      </Button>
                    </>
                  )}
                  {bookingDetail.status === "CONFIRMED" && (
                    <Button color="outline-secondary" size="sm"
                      onClick={() => handleResendEmail(bookingDetail.referenceNumber)} disabled={resendEmailLoading}>
                      {resendEmailLoading ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Resend Email</>}
                    </Button>
                  )}
                  {bookingDetail.status === "CONFIRMED" && bookingDetail.isCancellable && (
                    <Button color="outline-danger" size="sm" onClick={() => { setDetailModalOpen(false); setCancelConfirmRef(bookingDetail.referenceNumber); }}>
                      <i className="bx bx-block me-1" />Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Booking details */}
              <Row className="mb-3 g-3">
                <Col md={6}>
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td className="text-muted" style={{ width: 130 }}>Product</td><td>{bookingDetail.globaltixProductName}</td></tr>
                      <tr><td className="text-muted">Product ID</td><td><code>{bookingDetail.globaltixProductId}</code></td></tr>
                      <tr><td className="text-muted">Option</td><td>{bookingDetail.optionName} <span className="text-muted small">(ID {bookingDetail.optionId})</span></td></tr>
                      {bookingDetail.visitDate && <tr><td className="text-muted">Visit Date</td><td>{bookingDetail.visitDate} {bookingDetail.visitTime || ""}</td></tr>}
                      {bookingDetail.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{bookingDetail.partnerReference}</code></td></tr>}
                      {bookingDetail.tourBookingId && <tr><td className="text-muted">TYL Booking</td><td><code className="small">{bookingDetail.tourBookingId}</code></td></tr>}
                    </tbody>
                  </table>
                </Col>
                <Col md={6}>
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td className="text-muted" style={{ width: 130 }}>Reserved At</td><td>{bookingDetail.reservedAt ? new Date(bookingDetail.reservedAt).toLocaleString() : "—"}</td></tr>
                      {bookingDetail.confirmedAt && <tr><td className="text-muted">Confirmed At</td><td>{new Date(bookingDetail.confirmedAt).toLocaleString()}</td></tr>}
                      {bookingDetail.releasedAt && <tr><td className="text-muted">Released At</td><td>{new Date(bookingDetail.releasedAt).toLocaleString()}</td></tr>}
                      {bookingDetail.cancelledAt && <tr><td className="text-muted">Cancelled At</td><td>{new Date(bookingDetail.cancelledAt).toLocaleString()}</td></tr>}
                      {bookingDetail.holdExpiresAt && bookingDetail.status === "RESERVED" && (
                        <tr><td className="text-muted">Hold Expires</td><td className="text-warning fw-semibold">{new Date(bookingDetail.holdExpiresAt).toLocaleString()}</td></tr>
                      )}
                      <tr><td className="text-muted">Cancellable</td><td>{bookingDetail.isCancellable ? <span className="text-success">Yes</span> : <span className="text-danger">No</span>}</td></tr>
                    </tbody>
                  </table>
                </Col>
              </Row>

              {/* Ticket quantities */}
              {bookingDetail.ticketCodes?.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-semibold">Ticket Breakdown</Label>
                  <table className="table table-sm table-bordered mb-0" style={{ fontSize: 13 }}>
                    <thead className="table-light">
                      <tr><th>Type</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {bookingDetail.ticketCodes.map((tc, i) => (
                        <tr key={i}>
                          <td>{tc.ticketTypeName || `Type ${tc.ticketTypeId}`}</td>
                          <td>{tc.quantity}</td>
                          <td>{bookingDetail.currency} {tc.unitPrice?.toFixed(2) || "—"}</td>
                          <td><strong>{bookingDetail.currency} {tc.totalPrice?.toFixed(2) || "—"}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Customer answers */}
              {bookingDetail.answers?.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-semibold">Customer Answers</Label>
                  <table className="table table-sm table-bordered mb-0" style={{ fontSize: 13 }}>
                    <thead className="table-light"><tr><th>Question ID</th><th>Answer</th></tr></thead>
                    <tbody>
                      {bookingDetail.answers.map((a, i) => (
                        <tr key={i}><td className="text-muted">Q{a.id}</td><td>{a.answer}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cancellation policy */}
              {bookingDetail.cancellationPolicy && bookingDetail.isCancellable && (
                <Alert color="info" className="py-2 mb-3">
                  <strong>Cancellation Policy:</strong> {bookingDetail.cancellationPolicy.percentReturn}% refund if cancelled at least {bookingDetail.cancellationPolicy.refundDuration}h before visit.
                </Alert>
              )}

              {/* Vouchers / QR codes */}
              {bookingDetail.vouchers?.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-semibold">Vouchers ({bookingDetail.vouchers.length})</Label>
                  {bookingDetail.vouchers.map((v, i) => (
                    <Card key={i} className="mb-2 border">
                      <CardBody className="py-2">
                        <Row className="align-items-start">
                          <Col>
                            {v.ticketTypeName && <div className="fw-semibold mb-1">{v.ticketTypeName}</div>}
                            <div className="small">
                              {v.serialNumber && <div><strong>Serial #:</strong> <code>{v.serialNumber}</code></div>}
                              {v.barcode && <div><strong>Barcode:</strong> <code>{v.barcode}</code></div>}
                              {v.status && <div><strong>Status:</strong> {v.status}</div>}
                              {v.validFrom && <div className="text-muted">Valid: {v.validFrom} → {v.validTo || "—"}</div>}
                              {v.eTicketUrl && (
                                <div className="mt-1">
                                  <a href={v.eTicketUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary me-2">
                                    <i className="bx bx-download me-1" />Download E-Ticket
                                  </a>
                                </div>
                              )}
                              {v.viewTicketUrl && (
                                <div className="mt-1">
                                  <a href={v.viewTicketUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                    <i className="bx bx-link-external me-1" />Customer View URL
                                  </a>
                                </div>
                              )}
                            </div>
                          </Col>
                          {v.qrCode && (
                            <Col xs="auto">
                              <img
                                src={`data:image/png;base64,${v.qrCode}`}
                                alt="QR Code"
                                style={{ width: 100, height: 100 }}
                              />
                            </Col>
                          )}
                        </Row>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error */}
              {bookingDetail.errorMessage && (
                <Alert color="danger" className="py-2 mb-0 small">
                  <strong>Error:</strong> {bookingDetail.errorMessage}
                </Alert>
              )}
            </div>
          ) : null}
        </ModalBody>
      </Modal>

      {/* ── Cancel Confirmation Modal ─────────────────────────── */}
      <Modal isOpen={!!cancelConfirmRef} toggle={() => setCancelConfirmRef(null)} size="sm">
        <ModalHeader toggle={() => setCancelConfirmRef(null)}>Confirm Cancellation</ModalHeader>
        <ModalBody>
          <p>Cancel booking <code>{cancelConfirmRef}</code>? This will trigger a refund if within the policy window.</p>
          <Label>Reason (optional)</Label>
          <Input type="textarea" rows={2} value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancellation reason..." />
        </ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setCancelConfirmRef(null)}>No</Button>
          <Button color="danger" onClick={handleCancelConfirm} disabled={cancelLoading}>
            {cancelLoading ? <Spinner size="sm" /> : "Yes, Cancel Booking"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GlobtixBookingsPage;
