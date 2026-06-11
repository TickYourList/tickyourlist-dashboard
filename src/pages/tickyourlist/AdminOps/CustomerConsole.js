import React, { useState } from "react";
import {
  Card, CardBody, Col, Container, Row, Table, Spinner, Button, Input, Badge,
} from "reactstrap";
import { getCustomer360, resendConfirmationEmail, amendBooking } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const STATUS_COLORS = {
  CONFIRMED: "success", CANCELLED: "danger", PENDING: "warning",
  PAID: "info", REDEEMED: "success",
};
const TXN_COLORS = { EARNED: "success", REDEEMED: "primary", BONUS: "info", EXPIRED: "secondary", REFUND: "warning", MANUAL_ADJUSTMENT: "dark" };

/**
 * Customer-service console: everything about one customer on one screen —
 * account, bookings (with resend/amend quick actions), TylCash ledger,
 * gift cards and waitlist entries.
 */
const CustomerConsole = () => {
  document.title = "Customer Console | TickYourList";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [amendId, setAmendId] = useState(null);
  const [amendDate, setAmendDate] = useState("");
  const [amending, setAmending] = useState(false);

  const load = async (e) => {
    e?.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      const res = await getCustomer360(email.trim());
      setData(res?.data || null);
    } catch (err) {
      showToastError(err?.response?.data?.message || "Lookup failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const resend = async (bookingId) => {
    setResendingId(bookingId);
    try {
      await resendConfirmationEmail(bookingId);
      showToastSuccess("Confirmation email resent");
    } catch (err) {
      showToastError(err?.response?.data?.message || "Resend failed");
    } finally {
      setResendingId(null);
    }
  };

  const doAmend = async (bookingId) => {
    if (!amendDate) return;
    setAmending(true);
    try {
      const res = await amendBooking(bookingId, { newDate: amendDate });
      showToastSuccess(`Moved to ${res?.data?.newDate}. Ticket re-issued; customer emailed.`, "Booking amended");
      setAmendId(null);
      setAmendDate("");
      await load();
    } catch (err) {
      showToastError(err?.response?.data?.message || "Amendment failed");
    } finally {
      setAmending(false);
    }
  };

  const acct = data?.account;

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-3">Customer Console</h4>

        <Card>
          <CardBody>
            <form className="d-flex gap-2" onSubmit={load}>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ maxWidth: 380 }}
              />
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Look up"}
              </Button>
            </form>
          </CardBody>
        </Card>

        {data && (
          <>
            <Row>
              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h6 className="mb-3">Account</h6>
                    {acct ? (
                      <div className="small">
                        <div className="fs-5 fw-semibold">{[acct.firstName, acct.lastName].filter(Boolean).join(" ") || "—"}</div>
                        <div className="text-muted">{acct.email}</div>
                        <div className="mt-2 d-flex gap-2 flex-wrap">
                          {acct.isAgent && <Badge color="danger">Agent · {acct.agentCommissionPct}%</Badge>}
                          {acct.referralCode && <Badge color="light" className="text-muted">Ref code: {acct.referralCode}</Badge>}
                          {acct.referredBy && <Badge color="info">Referred user</Badge>}
                        </div>
                        <div className="mt-3 d-flex justify-content-between">
                          <span className="text-muted">TylCash balance</span>
                          <strong>{Number(acct.tylcashBalance || 0).toLocaleString()} TYL</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Lifetime earned</span>
                          <span>{Number(acct.totalTylcashEarned || 0).toLocaleString()} TYL</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Customer since</span>
                          <span>{acct.createdAt ? new Date(acct.createdAt).toLocaleDateString() : "—"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted small">
                        No registered account — guest checkout only. Bookings below are matched by email.
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h6 className="mb-3">Gift cards ({data.giftCards?.length || 0})</h6>
                    {(data.giftCards || []).slice(0, 8).map((g) => (
                      <div key={g._id} className="d-flex justify-content-between small mb-1">
                        <span><code>{g.code || "pending"}</code> · {g.amountTYL} TYL</span>
                        <Badge color={STATUS_COLORS[g.status] || "secondary"}>{g.status}</Badge>
                      </div>
                    ))}
                    {!(data.giftCards || []).length && <div className="text-muted small">None</div>}
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h6 className="mb-3">Waitlist ({data.waitlist?.length || 0})</h6>
                    {(data.waitlist || []).slice(0, 8).map((w) => (
                      <div key={w._id} className="d-flex justify-content-between small mb-1">
                        <span className="text-truncate" style={{ maxWidth: 200 }}>{w.tourGroupId?.name || "—"} · {w.date}</span>
                        {w.notifiedAt ? <Badge color="success">Notified</Badge> : <Badge color="warning">Waiting</Badge>}
                      </div>
                    ))}
                    {!(data.waitlist || []).length && <div className="text-muted small">None</div>}
                  </CardBody>
                </Card>
              </Col>

              <Col lg={8}>
                <Card>
                  <CardBody>
                    <h6 className="mb-3">Bookings ({data.bookings?.length || 0})</h6>
                    <Table size="sm" responsive hover className="align-middle">
                      <thead>
                        <tr><th>Created</th><th>Experience</th><th>Visit</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {(data.bookings || []).map((b) => (
                          <React.Fragment key={b._id}>
                            <tr className={b.providerBooking?.needsAttention ? "table-danger" : ""}>
                              <td className="text-nowrap small">{new Date(b.createdAt).toLocaleDateString()}</td>
                              <td className="text-truncate" style={{ maxWidth: 220 }}>
                                {b.title || "—"}
                                {b.amendments?.length > 0 && <Badge color="light" className="text-muted ms-1" title="Date was changed">amended</Badge>}
                                {b.providerBooking?.needsAttention && <Badge color="danger" className="ms-1">needs attention</Badge>}
                              </td>
                              <td className="text-nowrap small">{b.bookingDate || "Open"}{b.timeSlot?.startTime ? ` ${b.timeSlot.startTime}` : ""}</td>
                              <td className="text-nowrap">{b.currency} {b.amount}</td>
                              <td><Badge color={STATUS_COLORS[b.status] || "secondary"}>{b.status || "PENDING"}</Badge></td>
                              <td>
                                <div className="d-flex gap-1">
                                  {b.status === "CONFIRMED" && (
                                    <>
                                      <Button size="sm" color="outline-secondary" title="Resend confirmation email"
                                        disabled={resendingId === b._id} onClick={() => resend(b._id)}>
                                        {resendingId === b._id ? <Spinner size="sm" /> : <i className="bx bx-mail-send" />}
                                      </Button>
                                      <Button size="sm" color="outline-info" title="Change visit date"
                                        onClick={() => { setAmendId(amendId === b._id ? null : b._id); setAmendDate(""); }}>
                                        <i className="bx bx-calendar-edit" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {amendId === b._id && (
                              <tr>
                                <td colSpan={6} className="bg-light">
                                  <div className="d-flex gap-2 align-items-center p-1">
                                    <span className="small text-muted">New date:</span>
                                    <Input type="date" bsSize="sm" style={{ maxWidth: 170 }}
                                      min={new Date().toISOString().slice(0, 10)}
                                      value={amendDate} onChange={(e) => setAmendDate(e.target.value)} />
                                    <Button size="sm" color="primary" disabled={amending || !amendDate} onClick={() => doAmend(b._id)}>
                                      {amending ? <Spinner size="sm" /> : "Confirm change"}
                                    </Button>
                                    <Button size="sm" color="light" onClick={() => setAmendId(null)}>Cancel</Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {!(data.bookings || []).length && (
                          <tr><td colSpan={6} className="text-center text-muted py-3">No bookings for this email.</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h6 className="mb-3">TylCash ledger ({data.transactions?.length || 0})</h6>
                    <Table size="sm" responsive hover className="align-middle">
                      <thead>
                        <tr><th>Date</th><th>Type</th><th>Description</th><th className="text-end">Amount</th><th className="text-end">Balance</th></tr>
                      </thead>
                      <tbody>
                        {(data.transactions || []).map((t) => (
                          <tr key={t._id}>
                            <td className="text-nowrap small">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td><Badge color={TXN_COLORS[t.transactionType] || "secondary"}>{t.transactionType}</Badge></td>
                            <td className="text-truncate small" style={{ maxWidth: 280 }}>{t.description}</td>
                            <td className="text-end">{t.transactionType === "REDEEMED" ? "−" : "+"}{t.amount}</td>
                            <td className="text-end text-muted">{t.balanceAfter}</td>
                          </tr>
                        ))}
                        {!(data.transactions || []).length && (
                          <tr><td colSpan={5} className="text-center text-muted py-3">{acct ? "No transactions." : "Guest — no TylCash account."}</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default CustomerConsole;
