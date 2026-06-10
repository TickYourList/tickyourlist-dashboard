import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Table, Spinner, Button, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup,
} from "reactstrap";
import {
  getGlobtixNeedsAttention, retryGlobtixDelivery, refundGlobtixBooking,
} from "helpers/globaltix_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const STATUS_COLORS = {
  FAILED: "danger",
  RESERVED: "warning",
  CONFIRMED: "success",
  RELEASED: "secondary",
  CANCELLED: "dark",
};

/**
 * Ops queue: paid bookings whose Globaltix reserve/confirm failed.
 * Admin decides per booking: Retry delivery, or manually Refund (full/partial).
 * Nothing is refunded automatically.
 */
const GlobaltixNeedsAttention = ({ environment = "staging" }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  // Refund modal state
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [releaseReservation, setReleaseReservation] = useState(true);
  const [refunding, setRefunding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGlobtixNeedsAttention({ limit: 100, includeResolved });
      setItems(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to load ops queue");
    } finally {
      setLoading(false);
    }
  }, [includeResolved]);

  useEffect(() => { load(); }, [load]);

  const handleRetry = async (b) => {
    setRetryingId(b._id);
    try {
      const res = await retryGlobtixDelivery(b._id, environment);
      const r = res?.data || res;
      if (r?.success || r?.data?.success) {
        showToastSuccess("Delivery retried successfully — ticket flow restarted");
      } else {
        showToastError(r?.data?.error || r?.error || "Retry did not succeed — see error column");
      }
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const openRefund = (b) => {
    setRefundTarget(b);
    setRefundAmount("");
    setRefundReason("Globaltix booking could not be fulfilled");
    setReleaseReservation(true);
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      const res = await refundGlobtixBooking(refundTarget._id, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason,
        releaseReservation,
        environment,
      });
      const r = res?.data || res;
      showToastSuccess(`Refund issued (${r?.refundId || "ok"})`);
      setRefundTarget(null);
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Refund failed");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">
              <i className="bx bx-error-circle text-danger me-1" />
              Needs Attention
              <Badge color="danger" pill className="ms-2">{total}</Badge>
            </h5>
            <small className="text-muted">
              Paid bookings whose Globaltix reservation failed — retry the delivery or refund manually. Nothing refunds automatically.
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <FormGroup check className="mb-0 me-2">
              <Input type="checkbox" id="incResolved" checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} />
              <Label check for="incResolved" style={{ fontSize: 12 }}>Show all provider bookings</Label>
            </FormGroup>
            <Button color="light" size="sm" onClick={load} disabled={loading}>
              <i className={`bx bx-refresh${loading ? " bx-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4"><Spinner /></div>
        ) : !items.length ? (
          <Alert color="success" className="mb-0">
            <i className="bx bx-check-circle me-1" />All paid bookings are delivered — nothing needs attention.
          </Alert>
        ) : (
          <Table hover responsive size="sm" className="align-middle" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>Created</th>
                <th>Tour</th>
                <th>Customer</th>
                <th className="text-end">Amount</th>
                <th>Payment</th>
                <th>Provider Status</th>
                <th>Error</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const pb = b.providerBooking || {};
                const refunded = b.paymentStatus === "REFUNDED";
                return (
                  <tr key={b._id} className={pb.needsAttention && !refunded ? "table-danger" : ""}>
                    <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                    <td style={{ maxWidth: 180 }} className="text-truncate" title={b.title}>{b.title || "-"}</td>
                    <td>{b.email || "-"}</td>
                    <td className="text-end">{b.currency} {b.amount}</td>
                    <td>
                      <Badge color={refunded ? "info" : b.razorpayPaymentId ? "success" : "secondary"} style={{ fontSize: 10 }}>
                        {refunded ? "REFUNDED" : b.razorpayPaymentId ? "PAID" : b.paymentStatus || "—"}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={STATUS_COLORS[pb.status] || "secondary"} style={{ fontSize: 10 }}>{pb.status || "—"}</Badge>
                      {pb.retryCount > 0 && <small className="text-muted ms-1">×{pb.retryCount}</small>}
                    </td>
                    <td style={{ maxWidth: 220 }} className="text-truncate" title={pb.error}>{pb.error || "-"}</td>
                    <td>
                      {!refunded && (
                        <>
                          <Button
                            color="outline-primary" size="sm" className="me-1"
                            onClick={() => handleRetry(b)}
                            disabled={retryingId === b._id}
                            title="Retry reserve + confirm + ticket delivery"
                          >
                            {retryingId === b._id ? <Spinner size="sm" /> : <><i className="bx bx-redo" /> Retry</>}
                          </Button>
                          <Button
                            color="outline-danger" size="sm"
                            onClick={() => openRefund(b)}
                            disabled={!b.razorpayPaymentId}
                            title={b.razorpayPaymentId ? "Issue a manual Razorpay refund" : "No Razorpay payment id on this booking"}
                          >
                            <i className="bx bx-undo" /> Refund
                          </Button>
                        </>
                      )}
                      {refunded && pb.refundId && <small className="text-muted">refund: {pb.refundId}</small>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {/* Manual refund modal */}
        <Modal isOpen={!!refundTarget} toggle={() => setRefundTarget(null)} size="md">
          <ModalHeader toggle={() => setRefundTarget(null)}>
            Manual Refund — {refundTarget?.title}
          </ModalHeader>
          <ModalBody>
            <Alert color="warning" className="py-2" style={{ fontSize: 12 }}>
              This issues a <strong>Razorpay refund of real money</strong> to {refundTarget?.email}. It cannot be undone.
            </Alert>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Refund amount ({refundTarget?.currency}) — leave blank for full refund of {refundTarget?.currency} {refundTarget?.amount}</Label>
              <Input
                type="number" min="0" step="0.01"
                value={refundAmount}
                placeholder={String(refundTarget?.amount ?? "")}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontSize: 13 }}>Reason (stored on the refund)</Label>
              <Input type="text" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
            </FormGroup>
            <FormGroup check>
              <Input type="checkbox" id="relRes" checked={releaseReservation} onChange={(e) => setReleaseReservation(e.target.checked)} />
              <Label check for="relRes" style={{ fontSize: 13 }}>Release the Globaltix reservation (returns held credit/inventory)</Label>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setRefundTarget(null)} disabled={refunding}>Cancel</Button>
            <Button color="danger" onClick={handleRefund} disabled={refunding}>
              {refunding ? <Spinner size="sm" /> : <><i className="bx bx-undo me-1" />Issue Refund</>}
            </Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default GlobaltixNeedsAttention;
