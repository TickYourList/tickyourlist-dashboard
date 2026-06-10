import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody, Label, FormGroup, FormFeedback,
  Nav, NavItem, NavLink, TabContent, TabPane,
} from "reactstrap";
import {
  fetchGlobtixBookingsRequest,
  fetchGlobtixBookingDetailRequest,
  cancelGlobtixBookingRequest,
  confirmGlobtixBookingRequest,
  releaseGlobtixBookingRequest,
  resendGlobtixEmailRequest,
  refreshGlobtixBookingRequest,
  reserveGlobtixBookingRequest,
  fetchGlobtixAvailabilityCalendarRequest,
  fetchGlobtixAvailabilityTimeslotRequest,
  fetchGlobtixTicketUrlsRequest,
  fetchGlobtixWebhookEventsRequest,
  fetchRazorpayWebhookEventsRequest,
  fetchGlobtixCreditRequest,
  triggerGlobtixSweepRequest,
  exportGlobtixBookingsRequest,
  linkGlobtixBookingRequest,
  unlinkGlobtixBookingRequest,
} from "store/tickyourlist/globaltix/action";
import { fetchGlobtixProductsRequest, searchGlobtixProductsRequest } from "store/tickyourlist/globaltix/action";
import GlobaltixNeedsAttention from "./GlobaltixNeedsAttention";
import { amendBooking } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  RESERVED: "warning",
  CONFIRMED: "success",
  RELEASED: "secondary",
  CANCELLED: "danger",
  ERROR: "danger",
};

const EVENT_TYPE_COLORS = {
  "booking-ticket-revoke": "danger",
  "booking-ticket-update": "info",
  "booking-transaction-update": "primary",
  "booking-ticket-redeem": "success",
  "ticket-type-price-update": "warning",
  "product-info-update": "secondary",
  "ticket-expired": "secondary",
};

const WEBHOOK_URL = "https://api.univolenitsolutions.com/v1/globaltix/webhooks/event";
const RAZORPAY_WEBHOOK_URL = "https://api.univolenitsolutions.com/v1/tyltourcustomerbooking/razorpay/webhook";

const VALIDITY_LABELS = {
  VisitDate: "Fixed Visit Date",
  OpenDated: "Open Dated",
  DateAndTime: "Date & Time",
  Duration: "Timed Entry",
};

const FORMAT_LABELS = {
  QRCODE: "QR Code",
  BARCODE: "Barcode",
  PDF: "PDF Voucher",
  SEPARATEEMAIL: "Sent via Email",
};

const STEP_LABELS = ["Select Product", "Customer", "Tickets & Date", "Questions", "Review", "Done"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCur(currency, n) {
  return typeof n === "number" ? `${currency} ${n.toFixed(2)}` : "—";
}

function isoMonth(date) {
  // YYYY-MM from a Date object
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Hold expiry countdown ────────────────────────────────────────────────────

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
  const mins = parseInt(remaining);
  const isCritical = !isExpired && mins < 5;
  return (
    <span className={`badge ${isExpired ? "bg-danger" : isCritical ? "bg-warning text-dark" : "bg-info"}`} style={{ fontSize: 10 }}>
      {isExpired ? "Hold Expired" : `Hold: ${remaining}`}
    </span>
  );
}

// ─── Step 1: Select Product & Option ─────────────────────────────────────────

function StepSelectProduct({ onSelect, environment }) {
  const dispatch = useDispatch();
  const { products, productsLoading, searchResults, searching } = useSelector((s) => s.globaltix || {});
  const [q, setQ] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchGlobtixProductsRequest({ environment, page: 1, limit: 50 }));
  }, [dispatch, environment]);

  const doSearch = () => {
    if (q.trim()) { setSearched(true); dispatch(searchGlobtixProductsRequest(q, environment)); }
    else { setSearched(false); }
  };

  const list = searched ? searchResults : (products || []);

  if (selectedProduct) {
    return (
      <div>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Button color="link" size="sm" className="p-0" onClick={() => setSelectedProduct(null)}>
            ← Back
          </Button>
          <span className="text-muted small">Select an option for <strong>{selectedProduct.name}</strong></span>
        </div>
        {!selectedProduct.options?.length ? (
          <Alert color="warning">No options available for this product.</Alert>
        ) : (
          selectedProduct.options.map((opt) => (
            <Card key={opt.id} className="mb-2 border" style={{ cursor: "pointer" }}
              onClick={() => onSelect(selectedProduct, opt)}>
              <CardBody className="py-2 px-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold" style={{ fontSize: 14 }}>{opt.name}</div>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      <Badge color="secondary" style={{ fontSize: 10 }}>{VALIDITY_LABELS[opt.ticketValidity] || opt.ticketValidity}</Badge>
                      <Badge color="primary" style={{ fontSize: 10 }}>{FORMAT_LABELS[opt.ticketFormat] || opt.ticketFormat}</Badge>
                      {opt.isCancellable ? <Badge color="success" style={{ fontSize: 10 }}>Cancellable</Badge> : <Badge color="danger" style={{ fontSize: 10 }}>Non-cancellable</Badge>}
                      {opt.visitDateRequired && <Badge color="info" style={{ fontSize: 10 }}>Visit Date Required</Badge>}
                    </div>
                    {opt.advanceBookingDays > 0 && (
                      <div className="text-muted" style={{ fontSize: 11 }}>{opt.advanceBookingDays}d advance booking required</div>
                    )}
                    {opt.isCancellable && opt.cancellationPolicy && (
                      <div className="text-success" style={{ fontSize: 11 }}>
                        {opt.cancellationPolicy.percentReturn}% refund if cancelled {opt.cancellationPolicy.refundDuration}h before
                      </div>
                    )}
                  </div>
                  <div className="text-end ms-3" style={{ fontSize: 12, minWidth: 100 }}>
                    {opt.ticketTypes?.map((tt) => (
                      <div key={tt.id}>{tt.name}: <strong>{fmtCur(selectedProduct.currency || "SGD", tt.recommendedSellingPrice || tt.nettPrice)}</strong></div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <Input type="text" placeholder="Search products..." value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()} />
        <Button color="outline-primary" onClick={doSearch} disabled={searching}>
          {searching ? <Spinner size="sm" /> : <i className="bx bx-search" />}
        </Button>
        {searched && <Button color="outline-secondary" onClick={() => { setQ(""); setSearched(false); }}>Clear</Button>}
      </div>
      {productsLoading ? (
        <div className="text-center py-4"><Spinner /></div>
      ) : !list.length ? (
        <div className="text-center text-muted py-3">No products found.</div>
      ) : (
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {list.map((p) => (
            <div key={p._id || p.globaltixProductId}
              className="d-flex align-items-center justify-content-between border-bottom py-2 px-1"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedProduct(p)}>
              <div>
                <div className="fw-medium" style={{ fontSize: 13 }}>{p.name}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {p.country}{p.city ? ` · ${p.city}` : ""} · {p.options?.length || 0} options
                </div>
              </div>
              <div className="text-end">
                <Badge color={p.syncStatus === "synced" ? "success" : "warning"} style={{ fontSize: 9 }}>{p.syncStatus}</Badge>
                <i className="bx bx-chevron-right ms-2 text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Customer Info ────────────────────────────────────────────────────

function StepCustomerInfo({ form, onChange }) {
  return (
    <div>
      <p className="text-muted small mb-3">
        Globaltix requires customer details to issue the ticket. The confirmation email with vouchers is sent to the customer's email address.
      </p>
      <FormGroup className="mb-3">
        <Label className="fw-semibold small">Full Name <span className="text-danger">*</span></Label>
        <Input type="text" placeholder="e.g. John Doe"
          value={form.customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
          invalid={form.customerName === "" && form._touched?.customerName} />
        <FormFeedback>Required</FormFeedback>
      </FormGroup>
      <FormGroup className="mb-3">
        <Label className="fw-semibold small">Email Address <span className="text-danger">*</span></Label>
        <Input type="email" placeholder="e.g. customer@example.com"
          value={form.customerEmail}
          onChange={(e) => onChange("customerEmail", e.target.value)}
          invalid={form.customerEmail === "" && form._touched?.customerEmail} />
        <div className="text-muted" style={{ fontSize: 11 }}>Globaltix will send ticket vouchers to this address.</div>
        <FormFeedback>Required</FormFeedback>
      </FormGroup>
      <Row className="g-2">
        <Col xs={3}>
          <Label className="fw-semibold small">Prefix</Label>
          <Input type="select" value={form.mobilePrefix} onChange={(e) => onChange("mobilePrefix", e.target.value)}>
            <option value="+65">+65 (SG)</option>
            <option value="+60">+60 (MY)</option>
            <option value="+62">+62 (ID)</option>
            <option value="+63">+63 (PH)</option>
            <option value="+66">+66 (TH)</option>
            <option value="+84">+84 (VN)</option>
            <option value="+91">+91 (IN)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+1">+1 (US/CA)</option>
          </Input>
        </Col>
        <Col>
          <Label className="fw-semibold small">Mobile Number <span className="text-muted">(optional)</span></Label>
          <Input type="tel" placeholder="91234567"
            value={form.mobileNumber}
            onChange={(e) => onChange("mobileNumber", e.target.value)} />
        </Col>
      </Row>
      <FormGroup className="mb-0 mt-3">
        <Label className="fw-semibold small">Remarks <span className="text-muted">(optional — internal note)</span></Label>
        <Input type="textarea" rows={2} placeholder="e.g. Corporate booking, group tour..."
          value={form.remarks}
          onChange={(e) => onChange("remarks", e.target.value)} maxLength={200} />
      </FormGroup>
    </div>
  );
}

// ─── Step 3: Tickets & Date ───────────────────────────────────────────────────

const PRICE_TIERS = [
  { key: "recommendedSellingPrice", label: "Recommended Selling", desc: "Globaltix-suggested retail price", color: "success" },
  { key: "minimumSellingPrice", label: "Minimum Selling", desc: "Floor price — do not go below", color: "warning" },
  { key: "nettPrice", label: "Nett / Cost Price", desc: "Your cost from Globaltix — no margin", color: "danger" },
];

function StepTicketsDate({ product, option, form, onChange, environment }) {
  const dispatch = useDispatch();
  const { availabilityCalendar, calendarLoading, availabilityTimeslots, timeslotsLoading } = useSelector((s) => s.globaltix || {});
  const currency = product.currency || "SGD";
  // visitDateRequired is synced from Globaltix visitDate.required; also check ticketValidity as fallback
  const needsDate = option.visitDateRequired || option.ticketValidity === "VisitDate";
  // hasTimeslots comes from the calendar response (seriesId present in any slot)
  const hasTimeslots = availabilityCalendar?.hasTimeslots === true;
  const needsTime = needsDate && hasTimeslots;
  const currentMonth = useRef(isoMonth(new Date()));
  // Use the first ticketType id for availability queries (all share same availability)
  const primaryTicketTypeId = (option.ticketTypes || [])[0]?.id;

  useEffect(() => {
    if (needsDate && primaryTicketTypeId) {
      dispatch(fetchGlobtixAvailabilityCalendarRequest(primaryTicketTypeId, currentMonth.current, environment));
    }
  }, [dispatch, primaryTicketTypeId, environment, needsDate]);

  useEffect(() => {
    if (needsDate && primaryTicketTypeId && form.visitDate) {
      dispatch(fetchGlobtixAvailabilityTimeslotRequest(primaryTicketTypeId, form.visitDate, environment));
    }
  }, [dispatch, primaryTicketTypeId, form.visitDate, environment, needsDate]);

  const availableDates = availabilityCalendar?.available || [];
  const isDayAvailable = (d) => !availableDates.length || availableDates.includes(d);

  const priceTier = form.priceTier || "recommendedSellingPrice";
  const activeTierMeta = PRICE_TIERS.find((t) => t.key === priceTier) || PRICE_TIERS[0];

  const totalAmount = (option.ticketTypes || []).reduce((sum, tt) => {
    const qty = form.quantities[tt.id] || 0;
    return sum + qty * (tt[priceTier] || tt.nettPrice || 0);
  }, 0);

  return (
    <div>
      {/* Pricing tier selector */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-1">Selling Price Tier</h6>
        <p className="text-muted small mb-2">Choose what price you're selling to the customer. Globaltix charges your account the <strong>nett price</strong> regardless.</p>
        <div className="d-flex gap-2 flex-wrap">
          {PRICE_TIERS.map((tier) => {
            const selected = priceTier === tier.key;
            return (
              <div key={tier.key}
                className={`border rounded p-2 flex-grow-1 ${selected ? `border-${tier.color} bg-light` : "border-secondary"}`}
                style={{ cursor: "pointer", minWidth: 150 }}
                onClick={() => onChange("priceTier", tier.key)}>
                <div className="d-flex align-items-start gap-2">
                  <input type="radio" readOnly checked={selected} style={{ marginTop: 3 }} />
                  <div>
                    <div className={`fw-semibold text-${tier.color}`} style={{ fontSize: 12 }}>{tier.label}</div>
                    <div className="text-muted" style={{ fontSize: 10 }}>{tier.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket quantities */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2">Ticket Quantities</h6>
        {(option.ticketTypes || []).map((tt) => {
          const sellingPrice = tt[priceTier] || tt.nettPrice || 0;
          const nett = tt.nettPrice || 0;
          const margin = sellingPrice - nett;
          const qty = form.quantities[tt.id] || 0;
          const min = tt.minPurchaseQty || 0;
          const max = tt.maxPurchaseQty || 99;
          return (
            <div key={tt.id} className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded" style={{ fontSize: 13 }}>
              <div>
                <div className="fw-medium">{tt.name}</div>
                {(tt.ageFrom != null || tt.ageTo != null) && (
                  <div className="text-muted" style={{ fontSize: 11 }}>Age {tt.ageFrom ?? "?"}–{tt.ageTo ?? "?"}yr</div>
                )}
                <div className={`fw-semibold text-${activeTierMeta.color}`}>
                  {fmtCur(currency, sellingPrice)}
                  <span className="text-muted fw-normal ms-1" style={{ fontSize: 11 }}>
                    (cost {fmtCur(currency, nett)}{margin > 0 ? `, +${fmtCur(currency, margin)} margin` : ""})
                  </span>
                </div>
                {(min > 0 || max < 99) && <div className="text-muted" style={{ fontSize: 11 }}>Min {min} / Max {max}</div>}
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button size="sm" color="outline-secondary" style={{ width: 30, padding: 0 }}
                  onClick={() => onChange("quantities", { ...form.quantities, [tt.id]: Math.max(0, qty - 1) })}>−</Button>
                <span style={{ minWidth: 24, textAlign: "center", fontWeight: "bold" }}>{qty}</span>
                <Button size="sm" color="outline-secondary" style={{ width: 30, padding: 0 }}
                  onClick={() => onChange("quantities", { ...form.quantities, [tt.id]: Math.min(max, qty + 1) })}>+</Button>
              </div>
            </div>
          );
        })}
        {totalAmount > 0 && (
          <div className="text-end fw-semibold mt-2">
            Total ({activeTierMeta.label}): <span className={`text-${activeTierMeta.color}`}>{fmtCur(currency, totalAmount)}</span>
          </div>
        )}
      </div>

      {/* Visit date */}
      {needsDate && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Visit Date {calendarLoading && <Spinner size="sm" className="ms-1" />}</h6>
          <Input type="date" value={form.visitDate || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              const d = e.target.value;
              if (!isDayAvailable(d)) return;
              onChange("visitDate", d);
              onChange("visitTime", "");
              onChange("seriesId", null);
            }} />
          {availableDates.length > 0 && !isDayAvailable(form.visitDate) && form.visitDate && (
            <FormFeedback style={{ display: "block" }}>This date is not available.</FormFeedback>
          )}
        </div>
      )}

      {/* Timeslots */}
      {needsTime && form.visitDate && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Select Time {timeslotsLoading && <Spinner size="sm" className="ms-1" />}</h6>
          {!timeslotsLoading && !availabilityTimeslots?.length ? (
            <Alert color="warning" className="py-2 small">No timeslots available for this date.</Alert>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {(availabilityTimeslots || []).map((slot, i) => {
                const time = slot.time;
                const sid = slot.seriesId;
                const avail = slot.available;
                const selected = form.visitTime === time && form.seriesId === sid;
                return (
                  <Button key={i} size="sm"
                    color={selected ? "primary" : "outline-secondary"}
                    onClick={() => { onChange("visitTime", time); onChange("seriesId", sid); }}
                    disabled={avail === 0}>
                    {time}{avail !== "∞" && avail != null ? ` (${avail} left)` : ""}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Partner reference */}
      <div className="mb-3">
        <Label className="fw-semibold small">Partner Reference <span className="text-muted">(optional — your internal booking ID)</span></Label>
        <Input type="text" placeholder="e.g. TYL-2025-001" value={form.partnerReference}
          onChange={(e) => onChange("partnerReference", e.target.value)} maxLength={100} />
      </div>
    </div>
  );
}

// ─── Step 3: Questions ────────────────────────────────────────────────────────

function StepQuestions({ option, form, onChange }) {
  const allQuestions = (option.ticketTypes || []).flatMap((tt, ti) => {
    const ttQs = option.questions || [];
    return ttQs.map((q) => ({ ...q, _ttId: tt.id, _ttName: tt.name, _ttIdx: ti, _qty: form.quantities[tt.id] || 0 }));
  });

  // Deduplicate questions by id
  const seenIds = new Set();
  const uniqueQuestions = allQuestions.filter((q) => {
    if (seenIds.has(q.id)) return false;
    seenIds.add(q.id);
    return true;
  });

  // Use option-level questions (not per-ticket for now — Globaltix sends them at option level)
  const questions = option.questions || [];

  if (!questions.length) {
    return (
      <div className="text-center text-muted py-4">
        <i className="bx bx-check-circle fs-1 text-success" />
        <p className="mt-2">No questions required for this option.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted small mb-3">These are required at booking time — fill in all fields for the customer.</p>
      {questions.map((q) => {
        const val = form.answers[q.id] || "";
        const set = (v) => onChange("answers", { ...form.answers, [q.id]: v });
        return (
          <FormGroup key={q.id} className="mb-3">
            <Label className="fw-semibold" style={{ fontSize: 13 }}>
              {q.question}
              {q.questionCode && <span className="text-muted ms-1 small">({q.questionCode})</span>}
              <Badge color="light" className="text-dark border ms-2" style={{ fontSize: 10 }}>{q.type}</Badge>
            </Label>
            {q.type === "OPTION" && q.options?.length > 0 ? (
              <Input type="select" value={val} onChange={(e) => set(e.target.value)}>
                <option value="">— Select —</option>
                {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </Input>
            ) : q.type === "MULTISELECT" && q.options?.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {q.options.map((o) => {
                  const selected = (val || "").split(",").filter(Boolean).includes(o);
                  return (
                    <Button key={o} size="sm" color={selected ? "primary" : "outline-secondary"}
                      onClick={() => {
                        const current = (val || "").split(",").filter(Boolean);
                        const next = selected ? current.filter((x) => x !== o) : [...current, o];
                        set(next.join(","));
                      }}>
                      {o}
                    </Button>
                  );
                })}
              </div>
            ) : q.type === "DATE" ? (
              <Input type="date" value={val} onChange={(e) => set(e.target.value)} />
            ) : (
              <Input type="text" value={val} onChange={(e) => set(e.target.value)}
                placeholder={`Enter ${q.question.toLowerCase()}`} />
            )}
          </FormGroup>
        );
      })}
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function StepReview({ product, option, form }) {
  const currency = product.currency || "SGD";
  const priceTier = form.priceTier || "recommendedSellingPrice";
  const tierMeta = PRICE_TIERS.find((t) => t.key === priceTier) || PRICE_TIERS[0];
  const tickets = (option.ticketTypes || []).filter((tt) => (form.quantities[tt.id] || 0) > 0);
  const total = tickets.reduce((s, tt) => s + (form.quantities[tt.id] || 0) * (tt[priceTier] || tt.nettPrice || 0), 0);
  const nettTotal = tickets.reduce((s, tt) => s + (form.quantities[tt.id] || 0) * (tt.nettPrice || 0), 0);
  const answers = Object.entries(form.answers || {}).filter(([, v]) => v);

  return (
    <div>
      <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
        <div className="fw-semibold mb-1">{product.name}</div>
        <div className="text-muted small">{product.country}{product.city ? ` · ${product.city}` : ""}</div>
      </div>

      <Row className="mb-3 g-3">
        <Col md={6}>
          <div className="fw-semibold small mb-1">Customer</div>
          <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
            <tbody>
              <tr><td className="text-muted" style={{ width: 100 }}>Name</td><td className="fw-medium">{form.customerName}</td></tr>
              <tr><td className="text-muted">Email</td><td>{form.customerEmail}</td></tr>
              {form.mobileNumber && <tr><td className="text-muted">Mobile</td><td>{form.mobilePrefix} {form.mobileNumber}</td></tr>}
              {form.remarks && <tr><td className="text-muted">Remarks</td><td className="text-muted small">{form.remarks}</td></tr>}
            </tbody>
          </table>
        </Col>
        <Col md={6}>
          <div className="fw-semibold small mb-1">Booking</div>
          <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
            <tbody>
              <tr><td className="text-muted" style={{ width: 100 }}>Option</td><td className="fw-medium">{option.name}</td></tr>
              <tr><td className="text-muted">Validity</td><td>{VALIDITY_LABELS[option.ticketValidity] || option.ticketValidity}</td></tr>
              <tr><td className="text-muted">Format</td><td>{FORMAT_LABELS[option.ticketFormat] || option.ticketFormat}</td></tr>
              {form.visitDate && <tr><td className="text-muted">Visit Date</td><td className="fw-medium">{form.visitDate}{form.visitTime ? ` · ${form.visitTime}` : ""}</td></tr>}
              {form.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{form.partnerReference}</code></td></tr>}
              <tr><td className="text-muted">Cancellable</td><td>{option.isCancellable ? <span className="text-success">Yes</span> : <span className="text-danger">No</span>}</td></tr>
            </tbody>
          </table>
        </Col>
      </Row>

      {tickets.length > 0 && (
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="fw-semibold small">Ticket Breakdown</div>
            <Badge color={tierMeta.color} style={{ fontSize: 10 }}>Pricing: {tierMeta.label}</Badge>
          </div>
          <table className="table table-sm table-bordered mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr><th>Type</th><th>Selling Price</th><th>Nett Cost</th><th>Margin</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {tickets.map((tt) => {
                const qty = form.quantities[tt.id] || 0;
                const price = tt[priceTier] || tt.nettPrice || 0;
                const nett = tt.nettPrice || 0;
                const margin = price - nett;
                const marginPct = nett > 0 ? Math.round((margin / nett) * 100) : 0;
                return (
                  <tr key={tt.id}>
                    <td>{tt.name}</td>
                    <td className={`fw-semibold text-${tierMeta.color}`}>{fmtCur(currency, price)}</td>
                    <td className="text-danger">{fmtCur(currency, nett)}</td>
                    <td>
                      {margin >= 0
                        ? <span className="text-success">+{fmtCur(currency, margin)} ({marginPct}%)</span>
                        : <span className="text-danger">{fmtCur(currency, margin)}</span>}
                    </td>
                    <td>{qty}</td>
                    <td className="fw-semibold">{fmtCur(currency, qty * price)}</td>
                  </tr>
                );
              })}
              <tr className="table-light">
                <td colSpan={4} className="fw-bold text-end">Total charged to customer</td>
                <td colSpan={2}>
                  <div className={`fw-bold text-${tierMeta.color}`}>{fmtCur(currency, total)}</div>
                  <div className="text-muted small">Your cost: {fmtCur(currency, nettTotal)}</div>
                  {total - nettTotal > 0 && <div className="text-success small">Margin: +{fmtCur(currency, total - nettTotal)}</div>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {answers.length > 0 && (
        <div className="mb-3">
          <div className="fw-semibold small mb-1">Customer Answers</div>
          {answers.map(([id, val]) => {
            const q = (option.questions || []).find((x) => String(x.id) === String(id));
            return (
              <div key={id} className="d-flex gap-2 small mb-1">
                <span className="text-muted">{q?.question || `Q${id}`}:</span>
                <span className="fw-medium">{val}</span>
              </div>
            );
          })}
        </div>
      )}

      {!option.isCancellable && (
        <Alert color="warning" className="py-2 small mb-0">
          <strong>Non-cancellable:</strong> This option cannot be cancelled or refunded after confirmation.
        </Alert>
      )}
    </div>
  );
}

// ─── Step 5: Reserved Result ──────────────────────────────────────────────────

function StepReserved({ booking, onConfirm, onRelease, confirmLoading, confirmError, releaseLoading, onClose, isConfirmed }) {
  if (!booking) return null;

  // ── CONFIRMED state ─────────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <div className="text-center py-3">
        <div style={{ fontSize: 56 }}>✅</div>
        <h5 className="text-success fw-bold mt-2">Booking Confirmed!</h5>
        <p className="text-muted small mb-3">Credit has been deducted. A confirmation email with tickets has been sent to the customer.</p>
        <div className="p-3 rounded border mb-3 text-start" style={{ background: "#f0fff4" }}>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">Reference</span>
            <code className="fw-bold">{booking.referenceNumber}</code>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">Customer</span>
            <span className="small fw-medium">{booking.customerName} &lt;{booking.customerEmail}&gt;</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted small">Product</span>
            <span className="small">{booking.globaltixProductName}</span>
          </div>
          {booking.visitDate && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted small">Visit Date</span>
              <span className="small">{booking.visitDate}{booking.visitTime ? ` · ${booking.visitTime}` : ""}</span>
            </div>
          )}
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Total Charged</span>
            <strong>{booking.currency} {booking.totalAmount?.toFixed(2)}</strong>
          </div>
        </div>
        <Alert color="info" className="py-2 small text-start">
          <i className="bx bx-envelope me-1" />
          Confirmation email sent to <strong>{booking.customerEmail}</strong>
        </Alert>
        <Button color="success" onClick={onClose} className="w-100">
          <i className="bx bx-list-ul me-1" />View in Bookings List
        </Button>
      </div>
    );
  }

  // ── RESERVED state ──────────────────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-4">
        <div className="fs-1">🎫</div>
        <h5 className="text-warning fw-bold">Booking Reserved!</h5>
        <p className="text-muted small">You have 15 minutes to confirm. Confirming deducts credit and sends the customer their tickets.</p>
      </div>

      <div className="p-3 rounded border mb-3" style={{ background: "#fffbf0" }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="text-muted small">Reference Number</div>
            <code style={{ fontSize: 16 }}>{booking.referenceNumber}</code>
          </div>
          <div className="text-end">
            <div className="text-muted small">Total</div>
            <strong style={{ fontSize: 16 }}>{booking.currency} {booking.totalAmount?.toFixed(2)}</strong>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Badge color="warning" style={{ fontSize: 12 }}>RESERVED</Badge>
          {booking.holdExpiresAt && <HoldExpiry holdExpiresAt={booking.holdExpiresAt} />}
        </div>
      </div>

      <table className="table table-sm table-borderless mb-3" style={{ fontSize: 13 }}>
        <tbody>
          <tr><td className="text-muted" style={{ width: 130 }}>Product</td><td>{booking.globaltixProductName}</td></tr>
          <tr><td className="text-muted">Option</td><td>{booking.optionName}</td></tr>
          {booking.visitDate && <tr><td className="text-muted">Visit Date</td><td>{booking.visitDate}{booking.visitTime ? ` · ${booking.visitTime}` : ""}</td></tr>}
          {booking.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{booking.partnerReference}</code></td></tr>}
          <tr><td className="text-muted">Customer</td><td>{booking.customerName} &lt;{booking.customerEmail}&gt;</td></tr>
        </tbody>
      </table>

      <Alert color="info" className="py-2 small">
        <i className="bx bx-envelope me-1" />
        Confirming will send tickets to <strong>{booking.customerEmail}</strong>
      </Alert>

      {confirmError && (
        <Alert color="danger" className="py-2 small">
          <strong>Confirm failed:</strong> {confirmError}
        </Alert>
      )}

      <div className="d-flex gap-3">
        <Button color="success" className="flex-grow-1"
          onClick={() => onConfirm(booking.referenceNumber)} disabled={confirmLoading || releaseLoading}>
          {confirmLoading
            ? <><Spinner size="sm" className="me-1" />Confirming & sending email...</>
            : <><i className="bx bx-check-circle me-1" />Confirm &amp; Send Email</>}
        </Button>
        <Button color="outline-danger"
          onClick={() => onRelease(booking.referenceNumber)} disabled={releaseLoading || confirmLoading}>
          {releaseLoading ? <Spinner size="sm" /> : "Release"}
        </Button>
      </div>

      <div className="text-center mt-3">
        <Button color="link" size="sm" className="text-muted" onClick={onClose}>
          Close and handle later from bookings list
        </Button>
      </div>
    </div>
  );
}

// ─── Ticket Access Panel ──────────────────────────────────────────────────────
// Shown inside booking detail modal for CONFIRMED bookings.
// Fetches fresh eTicketUrl (PDF, time-limited) + stable viewTicketUrl from Globaltix.

const TICKET_FORMAT_COLORS = { QRCODE: "primary", BARCODE: "secondary", PDF: "info", SEPARATEEMAIL: "warning" };
const TICKET_STATUS_COLORS = { VALID: "success", REDEEMED: "secondary", EXPIRED: "danger", REVOKED: "danger" };

function TicketAccessPanel({ referenceNumber, environment, storedVouchers }) {
  const dispatch = useDispatch();
  const { ticketUrls, ticketUrlsLoading, ticketUrlsError } = useSelector((s) => s.globaltix || {});
  const [copiedUrl, setCopiedUrl] = useState(null);

  const fetchUrls = () => dispatch(fetchGlobtixTicketUrlsRequest(referenceNumber, environment));

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedUrl(key);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : null;

  // Merge fresh API tickets with stored vouchers for the most complete display
  const mergedTickets = ticketUrls?.tickets || [];
  const hasStoredQRCodes = (storedVouchers || []).some((v) => v.qrCode);

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Label className="fw-semibold mb-0">
          <i className="bx bx-ticket me-1" />Ticket Access
        </Label>
        <Button color="outline-primary" size="sm" onClick={fetchUrls} disabled={ticketUrlsLoading}>
          {ticketUrlsLoading
            ? <><Spinner size="sm" className="me-1" />Fetching...</>
            : <><i className="bx bx-refresh me-1" />Get Fresh Links</>}
        </Button>
      </div>

      {ticketUrlsError && (
        <Alert color="danger" className="py-2 small mb-2">
          <strong>Error:</strong> {ticketUrlsError}
        </Alert>
      )}

      {!ticketUrls && !ticketUrlsLoading && (
        <div className="p-3 rounded border text-center text-muted small" style={{ background: "#f8f9fa" }}>
          <i className="bx bx-info-circle me-1" />
          Click <strong>Get Fresh Links</strong> to fetch the latest ticket download URLs from Globaltix.
          {hasStoredQRCodes && " QR codes from the confirmation are shown below."}
        </div>
      )}

      {ticketUrls && (
        <div>
          {/* isTicketsReady banner */}
          {!ticketUrls.isTicketsReady && (
            <Alert color="warning" className="py-2 small mb-2">
              <i className="bx bx-time me-1" />
              <strong>Tickets still processing</strong> — Globaltix has not issued the tickets yet. Wait a few minutes and try again.
            </Alert>
          )}

          {/* Top-level download buttons */}
          {ticketUrls.isTicketsReady && (ticketUrls.eTicketUrl || ticketUrls.viewTicketUrl) && (
            <div className="p-2 rounded border mb-3" style={{ background: "#f0f4ff" }}>
              <div className="fw-semibold small mb-2">
                <i className="bx bx-cloud-download me-1" />All Tickets
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {ticketUrls.eTicketUrl && (
                  <a href={ticketUrls.eTicketUrl} target="_blank" rel="noreferrer"
                    className="btn btn-sm btn-primary">
                    <i className="bx bx-download me-1" />Download PDF
                  </a>
                )}
                {ticketUrls.viewTicketUrl && (
                  <>
                    <a href={ticketUrls.viewTicketUrl} target="_blank" rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary">
                      <i className="bx bx-link-external me-1" />Customer View
                    </a>
                    <Button size="sm" color={copiedUrl === "view" ? "success" : "outline-secondary"}
                      onClick={() => copyToClipboard(ticketUrls.viewTicketUrl, "view")}>
                      <i className={`bx ${copiedUrl === "view" ? "bx-check" : "bx-copy"} me-1`} />
                      {copiedUrl === "view" ? "Copied!" : "Copy Link"}
                    </Button>
                  </>
                )}
              </div>
              <div className="text-muted mt-1" style={{ fontSize: 10 }}>
                PDF link expires after a few hours. Customer view link is stable — safe to share anytime.
              </div>
            </div>
          )}

          {/* Per-ticket breakdown */}
          {mergedTickets.length > 0 && (
            <div>
              <div className="fw-semibold small mb-2">Individual Tickets ({mergedTickets.length})</div>
              {mergedTickets.map((t, i) => {
                const storedVoucher = (storedVouchers || []).find((v) => v.serialNumber === t.code);
                const qrBase64 = t.qrCode || storedVoucher?.qrCode;
                const statusColor = TICKET_STATUS_COLORS[t.statusName] || "secondary";
                const formatColor = TICKET_FORMAT_COLORS[t.ticketFormat] || "secondary";
                const redeemEnd = formatDate(t.redeemEnd);
                return (
                  <Card key={i} className="mb-2 border">
                    <CardBody className="py-2 px-3">
                      <div className="d-flex align-items-start gap-3">
                        {qrBase64 && (
                          <img src={`data:image/png;base64,${qrBase64}`} alt="QR"
                            style={{ width: 80, height: 80, border: "1px solid #dee2e6", borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            {t.ticketTypeName && <span className="fw-semibold small">{t.ticketTypeName}</span>}
                            <Badge color={formatColor} className="fw-normal" style={{ fontSize: 10 }}>{t.ticketFormat}</Badge>
                            <Badge color={statusColor} className="fw-normal" style={{ fontSize: 10 }}>{t.statusName}</Badge>
                          </div>
                          <div className="small mb-1">
                            <span className="text-muted me-1">Code:</span>
                            <code className="fw-semibold">{t.code}</code>
                            <Button size="sm" color="link" className="p-0 ms-1" style={{ fontSize: 11 }}
                              onClick={() => copyToClipboard(t.code, `code-${i}`)}>
                              <i className={`bx ${copiedUrl === `code-${i}` ? "bx-check text-success" : "bx-copy text-muted"}`} />
                            </Button>
                          </div>
                          {t.attractionTitle && <div className="text-muted small">{t.attractionTitle}</div>}
                          {redeemEnd && (
                            <div className="small text-muted">
                              Valid until <strong>{redeemEnd}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Always show stored QR codes even before fetching fresh links */}
      {!ticketUrls && hasStoredQRCodes && (
        <div className="mt-2">
          <div className="fw-semibold small mb-1 text-muted">Stored QR Codes (from confirmation)</div>
          <div className="d-flex flex-wrap gap-2">
            {(storedVouchers || []).filter((v) => v.qrCode).map((v, i) => (
              <div key={i} className="text-center">
                <img src={`data:image/png;base64,${v.qrCode}`} alt="QR"
                  style={{ width: 90, height: 90, border: "1px solid #dee2e6", borderRadius: 4 }} />
                {v.serialNumber && <div className="text-muted mt-1" style={{ fontSize: 10 }}><code>{v.serialNumber}</code></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Booking Modal ─────────────────────────────────────────────────────

function CreateBookingModal({ isOpen, toggle, environment, onBookingConfirmed }) {
  const dispatch = useDispatch();
  const { reserveLoading, reservedBooking, reserveError, confirmLoading, confirmSuccess, confirmError, releaseLoading, availabilityCalendar } = useSelector((s) => s.globaltix || {});
  const prevReserveLoading = useRef(false);

  // Steps: 0=Select Product, 1=Customer, 2=Tickets&Date, 3=Questions, 4=Review, 5=Reserved
  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [form, setForm] = useState({
    // Customer
    customerName: "",
    customerEmail: "",
    mobileNumber: "",
    mobilePrefix: "+65",
    remarks: "",
    // Tickets
    quantities: {},
    visitDate: "",
    visitTime: "",
    seriesId: null,
    partnerReference: "",
    priceTier: "recommendedSellingPrice",
    // Q&A
    answers: {},
  });

  const prevConfirmLoading = useRef(false);
  const [confirmedRef, setConfirmedRef] = useState(null);

  // Advance to "Done" step when reserve succeeds
  useEffect(() => {
    if (prevReserveLoading.current && !reserveLoading && reservedBooking) {
      setStep(5);
    }
    prevReserveLoading.current = reserveLoading;
  }, [reserveLoading, reservedBooking]);

  // Track confirm success to show confirmed state (only fires on success, not error)
  useEffect(() => {
    if (prevConfirmLoading.current && !confirmLoading && confirmSuccess && step === 5 && reservedBooking) {
      setConfirmedRef(reservedBooking.referenceNumber);
      if (onBookingConfirmed) onBookingConfirmed();
    }
    prevConfirmLoading.current = confirmLoading;
  }, [confirmLoading, confirmSuccess, step, reservedBooking, onBookingConfirmed]);

  const resetModal = () => {
    setStep(0);
    setSelectedProduct(null);
    setSelectedOption(null);
    setForm({
      customerName: "", customerEmail: "", mobileNumber: "", mobilePrefix: "+65", remarks: "",
      quantities: {}, visitDate: "", visitTime: "", seriesId: null, partnerReference: "",
      priceTier: "recommendedSellingPrice", answers: {},
    });
  };

  const handleToggle = () => { resetModal(); toggle(); };
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleProductSelected = (product, option) => {
    setSelectedProduct(product);
    setSelectedOption(option);
    const init = {};
    (option.ticketTypes || []).forEach((tt) => { init[tt.id] = 0; });
    setForm((f) => ({ ...f, quantities: init, visitDate: "", visitTime: "", seriesId: null, partnerReference: "", answers: {} }));
    setStep(1);
  };

  // Validation helpers
  const isCustomerValid = form.customerName.trim() !== "" && /\S+@\S+\.\S+/.test(form.customerEmail.trim());

  const totalQty = selectedOption
    ? (selectedOption.ticketTypes || []).reduce((s, tt) => s + (form.quantities[tt.id] || 0), 0)
    : 0;

  // Mirror the same logic used in StepTicketsDate
  const needsDate = selectedOption &&
    (selectedOption.visitDateRequired || selectedOption.ticketValidity === "VisitDate");
  const needsTime = needsDate && availabilityCalendar?.hasTimeslots === true;

  const isTicketsValid = totalQty > 0 &&
    (!needsDate || form.visitDate) &&
    (!needsTime || form.visitTime);

  // Questions step — skip if no questions
  const hasQuestions = (selectedOption?.questions || []).length > 0;
  const nextAfterTickets = hasQuestions ? 3 : 4;
  const backFromReview = hasQuestions ? 3 : 2;

  const handleReserve = () => {
    const priceTier = form.priceTier || "recommendedSellingPrice";
    const tickets = (selectedOption.ticketTypes || [])
      .filter((tt) => (form.quantities[tt.id] || 0) > 0)
      .map((tt) => ({
        ticketTypeId: tt.id,
        ticketTypeName: tt.name || "",
        quantity: form.quantities[tt.id],
        unitPrice: tt[priceTier] || tt.nettPrice || 0,
      }));

    const answers = Object.entries(form.answers)
      .filter(([, v]) => v)
      .map(([id, answer]) => ({ id: parseInt(id), answer }));

    dispatch(reserveGlobtixBookingRequest({
      environment,
      globaltixProductId: selectedProduct.globaltixProductId,
      optionId: selectedOption.id,
      tickets,
      priceTier,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      mobileNumber: form.mobileNumber,
      mobilePrefix: form.mobilePrefix,
      ...(form.remarks && { remarks: form.remarks }),
      ...(form.visitDate && { visitDate: form.visitDate }),
      ...(form.visitTime && { visitTime: form.visitTime }),
      ...(form.seriesId && { seriesId: form.seriesId }),
      ...(answers.length && { answers }),
      ...(form.partnerReference && { partnerReference: form.partnerReference }),
    }));
  };

  const handleConfirm = (ref) => dispatch(confirmGlobtixBookingRequest(ref, environment));
  const handleRelease = (ref) => dispatch(releaseGlobtixBookingRequest(ref, environment));

  const VISIBLE_STEPS = STEP_LABELS.slice(0, -1); // all except "Done"

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} size="lg" scrollable>
      <ModalHeader toggle={handleToggle}>
        Create Globaltix Booking
        {step > 0 && step < 5 && selectedProduct && (
          <span className="ms-2 text-muted fw-normal small">{selectedProduct.name}</span>
        )}
      </ModalHeader>
      <ModalBody>
        {/* Step indicator */}
        {step < 5 && (
          <div className="d-flex align-items-center mb-4 gap-1 flex-wrap" style={{ fontSize: 11 }}>
            {VISIBLE_STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className={`px-2 py-1 rounded ${i === step ? "bg-primary text-white fw-semibold" : i < step ? "bg-success text-white" : "bg-light text-muted"}`}>
                  {i < step ? "✓" : i + 1} {label}
                </div>
                {i < VISIBLE_STEPS.length - 1 && <div className="text-muted">›</div>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 0: Select product + option */}
        {step === 0 && (
          <StepSelectProduct onSelect={handleProductSelected} environment={environment} />
        )}

        {/* Step 1: Customer info */}
        {step === 1 && (
          <div>
            <StepCustomerInfo form={form} onChange={setField} />
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => { setStep(0); setSelectedProduct(null); setSelectedOption(null); }}>Back</Button>
              <Button color="primary" disabled={!isCustomerValid} onClick={() => setStep(2)}>
                Next: Tickets & Date
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tickets & Date */}
        {step === 2 && selectedProduct && selectedOption && (
          <div>
            <StepTicketsDate
              product={selectedProduct}
              option={selectedOption}
              form={form}
              onChange={setField}
              environment={environment}
            />
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => setStep(1)}>Back</Button>
              <Button color="primary" disabled={!isTicketsValid} onClick={() => setStep(nextAfterTickets)}>
                {hasQuestions ? "Next: Questions" : "Next: Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Questions */}
        {step === 3 && selectedOption && (
          <div>
            <StepQuestions option={selectedOption} form={form} onChange={setField} />
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => setStep(2)}>Back</Button>
              <Button color="primary" onClick={() => setStep(4)}>Next: Review</Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && selectedProduct && selectedOption && (
          <div>
            <StepReview product={selectedProduct} option={selectedOption} form={form} />
            {reserveError && (
              <Alert color="danger" className="mt-3 py-2 small">
                <strong>Reserve failed:</strong> {reserveError}
              </Alert>
            )}
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => setStep(backFromReview)}>Back</Button>
              <Button color="success" className="flex-grow-1" onClick={handleReserve} disabled={reserveLoading}>
                {reserveLoading
                  ? <><Spinner size="sm" className="me-1" />Reserving with Globaltix...</>
                  : <><i className="bx bx-lock-alt me-1" />Reserve (15-min hold)</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Reserved result */}
        {step === 5 && (
          <StepReserved
            booking={reservedBooking}
            onConfirm={handleConfirm}
            onRelease={handleRelease}
            confirmLoading={confirmLoading}
            confirmError={confirmError}
            releaseLoading={releaseLoading}
            onClose={handleToggle}
            isConfirmed={!!confirmedRef}
          />
        )}
      </ModalBody>
    </Modal>
  );
}

// ─── Webhook Events Tab ───────────────────────────────────────────────────────

function WebhookEventsTab({ environment }) {
  const dispatch = useDispatch();
  const {
    webhookEvents,
    webhookEventsPagination,
    webhookEventsLoading,
    webhookEventsError,
  } = useSelector((s) => s.globaltix || {});

  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [processedFilter, setProcessedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedPayloads, setExpandedPayloads] = useState({});

  const fetchEvents = useCallback(() => {
    const params = {
      environment,
      page,
      limit: 30,
      ...(eventTypeFilter && { eventType: eventTypeFilter }),
      ...(processedFilter === "true" && { processed: true }),
      ...(processedFilter === "false" && { processed: false }),
    };
    dispatch(fetchGlobtixWebhookEventsRequest(params));
  }, [dispatch, environment, eventTypeFilter, processedFilter, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const togglePayload = (id) =>
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (event) => {
    if (event.processed) return <Badge color="success" style={{ fontSize: 11 }}>Processed</Badge>;
    if (event.processingError) return <Badge color="danger" style={{ fontSize: 11 }}>Failed</Badge>;
    return <Badge color="secondary" style={{ fontSize: 11 }}>Pending</Badge>;
  };

  return (
    <div>
      {/* Info banner */}
      <Alert color="info" className="py-2 mb-3" style={{ fontSize: 13 }}>
        <i className="bx bx-link me-1" />
        <strong>Webhook URL to register in Globaltix partner portal:</strong>{" "}
        <code style={{ userSelect: "all" }}>POST {WEBHOOK_URL}</code>
      </Alert>

      {/* Filter bar */}
      <Card className="mb-3">
        <CardHeader className="bg-transparent border-bottom py-2">
          <Row className="align-items-center g-2">
            <Col md={4}>
              <Input
                type="select"
                bsSize="sm"
                value={eventTypeFilter}
                onChange={(e) => { setEventTypeFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Event Types</option>
                <option value="booking-ticket-revoke">booking-ticket-revoke</option>
                <option value="booking-ticket-update">booking-ticket-update</option>
                <option value="booking-transaction-update">booking-transaction-update</option>
                <option value="booking-ticket-redeem">booking-ticket-redeem</option>
                <option value="ticket-type-price-update">ticket-type-price-update</option>
                <option value="product-info-update">product-info-update</option>
                <option value="ticket-expired">ticket-expired</option>
              </Input>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                bsSize="sm"
                value={processedFilter}
                onChange={(e) => { setProcessedFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                <option value="true">Processed</option>
                <option value="false">Failed / Pending</option>
              </Input>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button color="outline-secondary" size="sm" onClick={fetchEvents} disabled={webhookEventsLoading}>
                <i className="bx bx-refresh me-1" />Refresh
              </Button>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          {webhookEventsLoading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : webhookEventsError ? (
            <Alert color="danger" className="m-3">Failed to load webhook events: {webhookEventsError}</Alert>
          ) : !webhookEvents?.length ? (
            <div className="text-center py-5 text-muted">
              <i className="bx bx-webhook" style={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 mb-1 fw-semibold">No webhook events yet.</p>
              <p className="small">Register your webhook URL in the Globaltix partner portal.</p>
              <code className="small d-block mt-2" style={{ background: "#f8f9fa", padding: "4px 8px", borderRadius: 4 }}>
                POST {WEBHOOK_URL}
              </code>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table hover responsive className="mb-0 table-nowrap align-middle" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 130 }}>Time</th>
                    <th style={{ minWidth: 180 }}>Event Type</th>
                    <th style={{ minWidth: 130 }}>Reference #</th>
                    <th style={{ minWidth: 120 }}>Ticket Code</th>
                    <th style={{ minWidth: 100 }}>Status</th>
                    <th style={{ minWidth: 200 }}>Error</th>
                    <th style={{ minWidth: 100 }}>Raw Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookEvents.map((evt) => (
                    <React.Fragment key={evt._id}>
                      <tr>
                        <td>
                          <span title={new Date(evt.createdAt).toLocaleString()}>
                            {formatRelativeTime(evt.createdAt)}
                          </span>
                          <div className="text-muted" style={{ fontSize: 10 }}>
                            {new Date(evt.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td>
                          <Badge
                            color={EVENT_TYPE_COLORS[evt.eventType] || "light"}
                            className="fw-normal"
                            style={{ fontSize: 11, whiteSpace: "normal", textAlign: "left" }}
                          >
                            {evt.eventType}
                          </Badge>
                        </td>
                        <td>
                          {evt.referenceNumber
                            ? <code style={{ fontSize: 11 }}>{evt.referenceNumber}</code>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          {evt.ticketCode
                            ? <code style={{ fontSize: 11 }}>{evt.ticketCode}</code>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>{getStatusBadge(evt)}</td>
                        <td>
                          {evt.processingError
                            ? <span className="text-danger small" title={evt.processingError}>
                                {evt.processingError.length > 60
                                  ? evt.processingError.slice(0, 60) + "…"
                                  : evt.processingError}
                              </span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <Button
                            color="outline-secondary"
                            size="sm"
                            style={{ fontSize: 11 }}
                            onClick={() => togglePayload(evt._id)}
                          >
                            {expandedPayloads[evt._id] ? "Hide" : "Show"}
                          </Button>
                        </td>
                      </tr>
                      {expandedPayloads[evt._id] && (
                        <tr>
                          <td colSpan={7} style={{ background: "#f8f9fa" }}>
                            <pre
                              style={{
                                fontSize: 11,
                                maxHeight: 300,
                                overflowY: "auto",
                                margin: 0,
                                padding: "8px",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                              }}
                            >
                              {JSON.stringify(evt.rawPayload, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {webhookEventsPagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Showing {webhookEvents?.length || 0} of {webhookEventsPagination.total} events
            {webhookEventsPagination.pages > 1 && ` · Page ${page} of ${webhookEventsPagination.pages}`}
          </span>
          {webhookEventsPagination.pages > 1 && (
            <div className="d-flex gap-2">
              <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                size="sm"
                color="outline-secondary"
                disabled={page >= webhookEventsPagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Razorpay Webhook Events Tab ─────────────────────────────────────────────

function RazorpayWebhookEventsTab() {
  const dispatch = useDispatch();
  const {
    razorpayWebhookEvents,
    razorpayWebhookEventsPagination,
    razorpayWebhookEventsLoading,
    razorpayWebhookEventsError,
  } = useSelector((s) => s.globaltix || {});

  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [processedFilter, setProcessedFilter] = useState("");
  const [signatureFilter, setSignatureFilter] = useState("");
  const [paymentIdFilter, setPaymentIdFilter] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedPayloads, setExpandedPayloads] = useState({});

  const fetchEvents = useCallback(() => {
    dispatch(fetchRazorpayWebhookEventsRequest({
      page,
      limit: 30,
      ...(eventTypeFilter && { eventType: eventTypeFilter }),
      ...(processedFilter === "true" && { processed: true }),
      ...(processedFilter === "false" && { processed: false }),
      ...(signatureFilter === "true" && { signatureValid: true }),
      ...(signatureFilter === "false" && { signatureValid: false }),
      ...(paymentIdFilter.trim() && { paymentId: paymentIdFilter.trim() }),
      ...(orderIdFilter.trim() && { orderId: orderIdFilter.trim() }),
      ...(bookingIdFilter.trim() && { bookingId: bookingIdFilter.trim() }),
    }));
  }, [dispatch, page, eventTypeFilter, processedFilter, signatureFilter, paymentIdFilter, orderIdFilter, bookingIdFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const togglePayload = (id) =>
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (event) => {
    if (event.processed) return <Badge color="success" style={{ fontSize: 11 }}>Processed</Badge>;
    if (event.processingError) return <Badge color="danger" style={{ fontSize: 11 }}>Failed</Badge>;
    return <Badge color="secondary" style={{ fontSize: 11 }}>Pending</Badge>;
  };

  const getSignatureBadge = (event) =>
    event.signatureValid
      ? <Badge color="success" style={{ fontSize: 11 }}>Valid</Badge>
      : <Badge color="danger" style={{ fontSize: 11 }}>Invalid</Badge>;

  const resetFilters = () => {
    setEventTypeFilter("");
    setProcessedFilter("");
    setSignatureFilter("");
    setPaymentIdFilter("");
    setOrderIdFilter("");
    setBookingIdFilter("");
    setPage(1);
  };

  return (
    <div>
      <Alert color="info" className="py-2 mb-3" style={{ fontSize: 13 }}>
        <i className="bx bx-link me-1" />
        <strong>Webhook URL to register in Razorpay dashboard:</strong>{" "}
        <code style={{ userSelect: "all" }}>POST {RAZORPAY_WEBHOOK_URL}</code>
        <span className="d-block mt-1 text-muted">
          Enable <code>payment.captured</code>. Optional events such as <code>payment.failed</code> are stored for audit and ignored safely.
        </span>
      </Alert>

      <Card className="mb-3">
        <CardHeader className="bg-transparent border-bottom py-2">
          <Row className="align-items-center g-2">
            <Col md={3}>
              <Input
                type="select"
                bsSize="sm"
                value={eventTypeFilter}
                onChange={(e) => { setEventTypeFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Event Types</option>
                <option value="payment.captured">payment.captured</option>
                <option value="payment.failed">payment.failed</option>
                <option value="order.paid">order.paid</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                bsSize="sm"
                value={processedFilter}
                onChange={(e) => { setProcessedFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                <option value="true">Processed</option>
                <option value="false">Failed / Pending</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                bsSize="sm"
                value={signatureFilter}
                onChange={(e) => { setSignatureFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Signatures</option>
                <option value="true">Valid Signature</option>
                <option value="false">Invalid Signature</option>
              </Input>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              <Button color="outline-secondary" size="sm" onClick={resetFilters}>
                Clear
              </Button>
              <Button color="outline-secondary" size="sm" onClick={fetchEvents} disabled={razorpayWebhookEventsLoading}>
                <i className="bx bx-refresh me-1" />Refresh
              </Button>
            </Col>
          </Row>
          <Row className="align-items-center g-2 mt-2">
            <Col md={4}>
              <Input
                bsSize="sm"
                placeholder="Payment ID"
                value={paymentIdFilter}
                onChange={(e) => { setPaymentIdFilter(e.target.value); setPage(1); }}
              />
            </Col>
            <Col md={4}>
              <Input
                bsSize="sm"
                placeholder="Order ID"
                value={orderIdFilter}
                onChange={(e) => { setOrderIdFilter(e.target.value); setPage(1); }}
              />
            </Col>
            <Col md={4}>
              <Input
                bsSize="sm"
                placeholder="Booking ID"
                value={bookingIdFilter}
                onChange={(e) => { setBookingIdFilter(e.target.value); setPage(1); }}
              />
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          {razorpayWebhookEventsLoading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : razorpayWebhookEventsError ? (
            <Alert color="danger" className="m-3">Failed to load Razorpay webhook events: {razorpayWebhookEventsError}</Alert>
          ) : !razorpayWebhookEvents?.length ? (
            <div className="text-center py-5 text-muted">
              <i className="bx bx-credit-card" style={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 mb-1 fw-semibold">No Razorpay webhook events yet.</p>
              <p className="small">Register the webhook URL in Razorpay and wait for a payment event.</p>
              <code className="small d-block mt-2" style={{ background: "#f8f9fa", padding: "4px 8px", borderRadius: 4 }}>
                POST {RAZORPAY_WEBHOOK_URL}
              </code>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table hover responsive className="mb-0 table-nowrap align-middle" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 130 }}>Time</th>
                    <th style={{ minWidth: 150 }}>Event Type</th>
                    <th style={{ minWidth: 100 }}>Signature</th>
                    <th style={{ minWidth: 100 }}>Status</th>
                    <th style={{ minWidth: 260 }}>Payment / Order</th>
                    <th style={{ minWidth: 180 }}>Booking</th>
                    <th style={{ minWidth: 220 }}>Note / Error</th>
                    <th style={{ minWidth: 100 }}>Raw Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {razorpayWebhookEvents.map((evt) => {
                    const rowId = evt._id || `${evt.paymentId}-${evt.createdAt}`;
                    const message = evt.processingError || evt.processingNote;
                    return (
                      <React.Fragment key={rowId}>
                        <tr>
                          <td>
                            <span title={new Date(evt.createdAt).toLocaleString()}>
                              {formatRelativeTime(evt.createdAt)}
                            </span>
                            <div className="text-muted" style={{ fontSize: 10 }}>
                              {new Date(evt.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td>
                            <Badge color={evt.eventType === "payment.captured" ? "success" : "secondary"} className="fw-normal" style={{ fontSize: 11 }}>
                              {evt.eventType || "unknown"}
                            </Badge>
                          </td>
                          <td>{getSignatureBadge(evt)}</td>
                          <td>{getStatusBadge(evt)}</td>
                          <td>
                            {evt.paymentId
                              ? <div><span className="text-muted me-1">pay</span><code style={{ fontSize: 11 }}>{evt.paymentId}</code></div>
                              : <div className="text-muted">No payment id</div>}
                            {evt.orderId
                              ? <div className="mt-1"><span className="text-muted me-1">ord</span><code style={{ fontSize: 11 }}>{evt.orderId}</code></div>
                              : null}
                          </td>
                          <td>
                            {evt.bookingId
                              ? <code style={{ fontSize: 11 }}>{evt.bookingId}</code>
                              : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {message
                              ? <span className={evt.processingError ? "text-danger small" : "text-muted small"} title={message}>
                                  {message.length > 70 ? message.slice(0, 70) + "…" : message}
                                </span>
                              : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              style={{ fontSize: 11 }}
                              onClick={() => togglePayload(rowId)}
                            >
                              {expandedPayloads[rowId] ? "Hide" : "Show"}
                            </Button>
                          </td>
                        </tr>
                        {expandedPayloads[rowId] && (
                          <tr>
                            <td colSpan={8} style={{ background: "#f8f9fa" }}>
                              <pre
                                style={{
                                  fontSize: 11,
                                  maxHeight: 300,
                                  overflowY: "auto",
                                  margin: 0,
                                  padding: "8px",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-all",
                                }}
                              >
                                {JSON.stringify(evt.rawPayload, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {razorpayWebhookEventsPagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Showing {razorpayWebhookEvents?.length || 0} of {razorpayWebhookEventsPagination.total} events
            {razorpayWebhookEventsPagination.pages > 1 && ` · Page ${page} of ${razorpayWebhookEventsPagination.pages}`}
          </span>
          {razorpayWebhookEventsPagination.pages > 1 && (
            <div className="d-flex gap-2">
              <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                size="sm"
                color="outline-secondary"
                disabled={page >= razorpayWebhookEventsPagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Bookings Page ───────────────────────────────────────────────────────

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
    creditBalance,
    creditLoading,
    sweepLoading,
    exportLoading,
    linkBookingLoading,
    unlinkBookingLoading,
    linkBookingError,
  } = useSelector((state) => state.globaltix || {});

  const [environment] = useState("staging");
  const [activeTab, setActiveTab] = useState("bookings");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmRef, setCancelConfirmRef] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [resendTarget, setResendTarget] = useState(null);
  const [resendCustomEmail, setResendCustomEmail] = useState("");
  const [amendTarget, setAmendTarget] = useState(null); // { tourBookingId, productName, visitDate }
  const [amendDate, setAmendDate] = useState("");
  const [amendTime, setAmendTime] = useState("");
  const [amendLoading, setAmendLoading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);
  const [linkTourBookingId, setLinkTourBookingId] = useState("");

  // Search filter state
  const handleAmend = async () => {
    if (!amendTarget?.tourBookingId || !amendDate) return;
    setAmendLoading(true);
    try {
      const res = await amendBooking(amendTarget.tourBookingId, {
        newDate: amendDate,
        ...(amendTime ? { newStartTime: amendTime } : {}),
      });
      showToastSuccess(
        `Moved to ${res?.data?.newDate}${res?.data?.newStartTime ? ` at ${res.data.newStartTime}` : ""}. New ticket issued; old one cancelled.`,
        "Booking amended"
      );
      setAmendTarget(null);
      setAmendDate("");
      setAmendTime("");
    } catch (e) {
      showToastError(e?.response?.data?.message || "Amendment failed");
    } finally {
      setAmendLoading(false);
    }
  };

  const [searchEmail, setSearchEmail] = useState("");
  const [searchPartnerRef, setSearchPartnerRef] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  // Applied filter state (committed on Search click)
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedPartnerRef, setAppliedPartnerRef] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");

  const fetchBookings = useCallback(() => {
    dispatch(fetchGlobtixBookingsRequest({
      environment,
      status: statusFilter || undefined,
      customerEmail: appliedEmail || undefined,
      partnerReference: appliedPartnerRef || undefined,
      dateFrom: appliedDateFrom || undefined,
      dateTo: appliedDateTo || undefined,
      page,
      limit: 20,
    }));
  }, [dispatch, environment, statusFilter, appliedEmail, appliedPartnerRef, appliedDateFrom, appliedDateTo, page]);

  const handleSearchApply = () => {
    setAppliedEmail(searchEmail);
    setAppliedPartnerRef(searchPartnerRef);
    setAppliedDateFrom(searchDateFrom);
    setAppliedDateTo(searchDateTo);
    setPage(1);
  };

  const handleSearchClear = () => {
    setSearchEmail("");
    setSearchPartnerRef("");
    setSearchDateFrom("");
    setSearchDateTo("");
    setAppliedEmail("");
    setAppliedPartnerRef("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setPage(1);
  };

  const handleExportCsv = () => {
    dispatch(exportGlobtixBookingsRequest({
      environment,
      status: statusFilter || undefined,
      customerEmail: appliedEmail || undefined,
      partnerReference: appliedPartnerRef || undefined,
      dateFrom: appliedDateFrom || undefined,
      dateTo: appliedDateTo || undefined,
    }));
  };

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    if (cancelSuccess && !cancelLoading) {
      setCancelConfirmRef(null);
      setCancelReason("");
      fetchBookings();
    }
  }, [cancelSuccess, cancelLoading]); // eslint-disable-line

  // Auto-fetch credit balance on page load
  useEffect(() => {
    dispatch(fetchGlobtixCreditRequest(environment));
  }, [dispatch, environment]); // eslint-disable-line

  const handleSweep = () => {
    dispatch(triggerGlobtixSweepRequest(environment));
    // Refresh bookings list after a short delay to reflect status changes
    setTimeout(() => fetchBookings(), 2000);
  };

  const handleViewDetail = (referenceNumber) => {
    dispatch(fetchGlobtixBookingDetailRequest(referenceNumber));
    setDetailModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelConfirmRef) return;
    dispatch(cancelGlobtixBookingRequest(cancelConfirmRef, environment, cancelReason));
  };

  const handleConfirm = (ref) => dispatch(confirmGlobtixBookingRequest(ref, environment));
  const handleRelease = (ref) => dispatch(releaseGlobtixBookingRequest(ref, environment));
  const handleResendEmail = (ref, toEmail) => dispatch(resendGlobtixEmailRequest(ref, environment, toEmail));
  const handleRefreshFromApi = (ref) => dispatch(refreshGlobtixBookingRequest(ref, environment));
  const openResendModal = (ref) => { setResendTarget(ref); setResendCustomEmail(""); setResendModalOpen(true); };
  const handleResendCustomSubmit = () => {
    if (!resendTarget || !resendCustomEmail.trim()) return;
    handleResendEmail(resendTarget, resendCustomEmail.trim());
    setResendModalOpen(false);
  };
  const openLinkModal = (ref) => { setLinkTarget(ref); setLinkTourBookingId(""); setLinkModalOpen(true); };
  const handleLinkSubmit = () => {
    if (!linkTarget || !linkTourBookingId.trim()) return;
    dispatch(linkGlobtixBookingRequest(linkTarget, linkTourBookingId.trim()));
    setLinkModalOpen(false);
  };
  const handleUnlink = (ref) => dispatch(unlinkGlobtixBookingRequest({ referenceNumber: ref, environment }));

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h4 className="mb-1">Globaltix Bookings</h4>
                <p className="text-muted mb-0">
                  All booking records &bull; {bookingsPagination?.total || 0} total
                </p>
              </div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {/* Credit Balance Widget */}
                <div
                  className="d-flex align-items-center gap-2 border rounded px-3 py-2"
                  style={{ background: "#f8f9fa", fontSize: 13, minWidth: 180 }}
                >
                  <div>
                    <div className="text-muted" style={{ fontSize: 10, lineHeight: 1 }}>Credit Balance</div>
                    {creditLoading ? (
                      <Spinner size="sm" className="mt-1" />
                    ) : creditBalance ? (
                      <span
                        className="fw-semibold"
                        style={{
                          color:
                            typeof creditBalance.creditBalance === "number" && creditBalance.creditBalance < 200
                              ? "#dc3545"
                              : "#212529",
                        }}
                      >
                        {typeof creditBalance.creditBalance === "number" && creditBalance.creditBalance < 200 && (
                          <i className="bx bx-error-circle me-1 text-danger" style={{ fontSize: 12 }} />
                        )}
                        {creditBalance.currencyCode || creditBalance.currency || "SGD"}{" "}
                        {typeof creditBalance.creditBalance === "number"
                          ? creditBalance.creditBalance.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "—"}
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </div>
                  <Button
                    color="link"
                    size="sm"
                    className="p-0 ms-1"
                    title="Refresh credit balance"
                    onClick={() => dispatch(fetchGlobtixCreditRequest(environment))}
                    disabled={creditLoading}
                  >
                    <i className={`bx bx-refresh${creditLoading ? " bx-spin" : ""}`} style={{ fontSize: 16 }} />
                  </Button>
                </div>

                <Badge color="secondary">{environment}</Badge>
                {activeTab === "bookings" && (
                  <Button color="primary" onClick={() => setCreateModalOpen(true)}>
                    <i className="bx bx-plus me-1" />Create Booking
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink
                  className={activeTab === "bookings" ? "active" : ""}
                  onClick={() => setActiveTab("bookings")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bx bx-list-ul me-1" />Bookings
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "needsattention" ? "active" : ""}
                  onClick={() => setActiveTab("needsattention")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bx bx-error-circle me-1 text-danger" />Needs Attention
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "webhooks" ? "active" : ""}
                  onClick={() => setActiveTab("webhooks")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bx bx-transfer me-1" />Webhook Events
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "razorpay-webhooks" ? "active" : ""}
                  onClick={() => setActiveTab("razorpay-webhooks")}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bx bx-credit-card me-1" />Razorpay Webhooks
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
              <TabPane tabId="needsattention">
                <GlobaltixNeedsAttention environment={environment} />
              </TabPane>
              <TabPane tabId="webhooks">
                <WebhookEventsTab environment={environment} />
              </TabPane>
              <TabPane tabId="razorpay-webhooks">
                <RazorpayWebhookEventsTab />
              </TabPane>
              <TabPane tabId="bookings">

            <Card>
              <CardHeader className="bg-transparent border-bottom">
                {/* Row 1: Status filter + action buttons */}
                <Row className="align-items-center g-2 mb-2">
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
                  <Col className="d-flex justify-content-end gap-2">
                    <Button
                      color="outline-warning"
                      size="sm"
                      onClick={handleSweep}
                      disabled={sweepLoading}
                      title="Mark all expired RESERVED bookings as RELEASED"
                    >
                      {sweepLoading
                        ? <><Spinner size="sm" className="me-1" />Sweeping...</>
                        : <><i className="bx bx-timer me-1" />Sweep Expired</>}
                    </Button>
                    <Button color="outline-secondary" size="sm" onClick={fetchBookings}>
                      <i className="bx bx-refresh me-1" />Refresh
                    </Button>
                  </Col>
                </Row>
                {/* Row 2: Advanced search filters + export */}
                <Row className="align-items-center g-2">
                  <Col md={3}>
                    <Input
                      type="email"
                      placeholder="Search by customer email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
                      bsSize="sm"
                    />
                  </Col>
                  <Col md={3}>
                    <Input
                      type="text"
                      placeholder="Partner ref / reference #..."
                      value={searchPartnerRef}
                      onChange={(e) => setSearchPartnerRef(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
                      bsSize="sm"
                    />
                  </Col>
                  <Col md={2}>
                    <Input
                      type="date"
                      value={searchDateFrom}
                      onChange={(e) => setSearchDateFrom(e.target.value)}
                      bsSize="sm"
                      title="Reserved from date"
                    />
                  </Col>
                  <Col md={2}>
                    <Input
                      type="date"
                      value={searchDateTo}
                      onChange={(e) => setSearchDateTo(e.target.value)}
                      bsSize="sm"
                      title="Reserved to date"
                    />
                  </Col>
                  <Col className="d-flex gap-2 flex-wrap">
                    <Button color="primary" size="sm" onClick={handleSearchApply}>
                      Search
                    </Button>
                    <Button color="outline-secondary" size="sm" onClick={handleSearchClear}>
                      Clear
                    </Button>
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={handleExportCsv}
                      disabled={exportLoading}
                      title="Export current filters to CSV"
                    >
                      {exportLoading
                        ? <><Spinner size="sm" className="me-1" />Exporting...</>
                        : <><i className="bx bx-download me-1" />Export CSV</>}
                    </Button>
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
                            <td colSpan={9} className="text-center py-4 text-muted">
                              No bookings found. Use <strong>Create Booking</strong> to make your first one, or run the seed script for dummy data.
                            </td>
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
                                  : <span className="text-muted small">Open</span>}
                              </td>
                              <td>
                                {(b.ticketCodes || []).length > 0
                                  ? b.ticketCodes.map((tc, i) => (
                                    <div key={i} style={{ fontSize: 11 }}>
                                      {tc.ticketTypeName || `Type ${tc.ticketTypeId}`} × {tc.quantity}
                                    </div>
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
                                  <Badge color="info" style={{ fontSize: 10 }} title={typeof b.tourBookingId === "string" ? b.tourBookingId : String(b.tourBookingId)}>
                                    Linked
                                  </Badge>
                                ) : (
                                  <Button size="sm" color="outline-secondary" style={{ fontSize: 10, padding: "1px 5px" }}
                                    onClick={() => openLinkModal(b.referenceNumber)} title="Link to TYL booking">
                                    <i className="bx bx-link" />
                                  </Button>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-1 flex-wrap">
                                  <Button size="sm" color="outline-primary"
                                    onClick={() => handleViewDetail(b.referenceNumber)} title="View Details">
                                    <i className="bx bx-info-circle" />
                                  </Button>
                                  {b.status === "RESERVED" && (
                                    <>
                                      <Button size="sm" color="success"
                                        onClick={() => handleConfirm(b.referenceNumber)}
                                        disabled={confirmLoading} title="Confirm (deducts credit)">
                                        {confirmLoading ? <Spinner size="sm" /> : <i className="bx bx-check" />}
                                      </Button>
                                      <Button size="sm" color="outline-warning"
                                        onClick={() => handleRelease(b.referenceNumber)}
                                        disabled={releaseLoading} title="Release hold">
                                        {releaseLoading ? <Spinner size="sm" /> : <i className="bx bx-x" />}
                                      </Button>
                                    </>
                                  )}
                                  {b.status === "CONFIRMED" && b.tourBookingId && (
                                    <Button size="sm" color="outline-info"
                                      onClick={() => {
                                        setAmendTarget({
                                          tourBookingId: typeof b.tourBookingId === "string" ? b.tourBookingId : String(b.tourBookingId),
                                          productName: b.globaltixProductName,
                                          visitDate: b.visitDate,
                                        });
                                        setAmendDate("");
                                        setAmendTime("");
                                      }}
                                      title="Change visit date (re-reserve, no penalty)">
                                      <i className="bx bx-calendar-edit" />
                                    </Button>
                                  )}
                                  {b.status === "CONFIRMED" && b.isCancellable && (
                                    <Button size="sm" color="outline-danger"
                                      onClick={() => setCancelConfirmRef(b.referenceNumber)} title="Cancel booking">
                                      <i className="bx bx-block" />
                                    </Button>
                                  )}
                                  {b.status === "CONFIRMED" && (
                                    <>
                                      <Button size="sm" color="outline-secondary"
                                        onClick={() => handleResendEmail(b.referenceNumber)}
                                        disabled={resendEmailLoading} title="Resend to customer email">
                                        <i className="bx bx-envelope" />
                                      </Button>
                                      <Button size="sm" color="outline-info"
                                        onClick={() => openResendModal(b.referenceNumber)}
                                        disabled={resendEmailLoading} title="Resend to custom email">
                                        <i className="bx bx-envelope-open" />
                                      </Button>
                                    </>
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

              </TabPane>
            </TabContent>

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
                <div className="ms-auto d-flex gap-2 flex-wrap">
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
                    <>
                      <Button color="outline-secondary" size="sm"
                        onClick={() => handleResendEmail(bookingDetail.referenceNumber)} disabled={resendEmailLoading}
                        title="Resend to original customer email">
                        {resendEmailLoading ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Resend Email</>}
                      </Button>
                      <Button color="outline-info" size="sm"
                        onClick={() => openResendModal(bookingDetail.referenceNumber)} disabled={resendEmailLoading}
                        title="Resend to a different email address">
                        <i className="bx bx-envelope-open me-1" />Resend to...
                      </Button>
                    </>
                  )}
                  {bookingDetail.status === "CONFIRMED" && bookingDetail.isCancellable && (
                    <Button color="outline-danger" size="sm"
                      onClick={() => { setDetailModalOpen(false); setCancelConfirmRef(bookingDetail.referenceNumber); }}>
                      <i className="bx bx-block me-1" />Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer details */}
              {(bookingDetail.customerName || bookingDetail.customerEmail) && (
                <div className="mb-3 p-2 rounded" style={{ background: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <div className="fw-semibold small text-muted mb-1" style={{ letterSpacing: "0.03em" }}>CUSTOMER</div>
                  <div className="d-flex flex-wrap gap-3" style={{ fontSize: 13 }}>
                    {bookingDetail.customerName && (
                      <span><i className="bx bx-user me-1 text-muted" /><strong>{bookingDetail.customerName}</strong></span>
                    )}
                    {bookingDetail.customerEmail && (
                      <span><i className="bx bx-envelope me-1 text-muted" />
                        <a href={`mailto:${bookingDetail.customerEmail}`}>{bookingDetail.customerEmail}</a>
                      </span>
                    )}
                    {bookingDetail.mobileNumber && (
                      <span><i className="bx bx-phone me-1 text-muted" />
                        {bookingDetail.mobilePrefix || ""}{bookingDetail.mobileNumber}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Booking info */}
              <Row className="mb-3 g-3">
                <Col md={6}>
                  <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr><td className="text-muted" style={{ width: 130 }}>Product</td><td>{bookingDetail.globaltixProductName}</td></tr>
                      <tr><td className="text-muted">Product ID</td><td><code>{bookingDetail.globaltixProductId}</code></td></tr>
                      <tr><td className="text-muted">Option</td><td>{bookingDetail.optionName} <span className="text-muted small">(ID {bookingDetail.optionId})</span></td></tr>
                      {bookingDetail.visitDate && <tr><td className="text-muted">Visit Date</td><td>{bookingDetail.visitDate}{bookingDetail.visitTime ? ` · ${bookingDetail.visitTime}` : ""}</td></tr>}
                      {bookingDetail.seriesId && <tr><td className="text-muted">Series ID</td><td><code>{bookingDetail.seriesId}</code></td></tr>}
                      {bookingDetail.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{bookingDetail.partnerReference}</code></td></tr>}
                      <tr>
                        <td className="text-muted">TYL Booking</td>
                        <td>
                          {bookingDetail.tourBookingId ? (
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <div>
                                <code className="small">
                                  {typeof bookingDetail.tourBookingId === "object"
                                    ? bookingDetail.tourBookingId._id || String(bookingDetail.tourBookingId)
                                    : bookingDetail.tourBookingId}
                                </code>
                                {typeof bookingDetail.tourBookingId === "object" && bookingDetail.tourBookingId.nonCustomerFirstName && (
                                  <div className="text-muted" style={{ fontSize: 11 }}>
                                    {bookingDetail.tourBookingId.nonCustomerFirstName} {bookingDetail.tourBookingId.nonCustomerLastName}
                                    {bookingDetail.tourBookingId.email ? ` · ${bookingDetail.tourBookingId.email}` : ""}
                                  </div>
                                )}
                              </div>
                              <Button size="sm" color="outline-secondary"
                                onClick={() => openLinkModal(bookingDetail.referenceNumber)}
                                disabled={linkBookingLoading} title="Change linked booking">
                                <i className="bx bx-link-alt" />
                              </Button>
                              <Button size="sm" color="outline-danger"
                                onClick={() => handleUnlink(bookingDetail.referenceNumber)}
                                disabled={unlinkBookingLoading} title="Remove link">
                                {unlinkBookingLoading ? <Spinner size="sm" /> : <i className="bx bx-unlink" />}
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" color="outline-primary"
                              onClick={() => openLinkModal(bookingDetail.referenceNumber)}
                              disabled={linkBookingLoading}>
                              {linkBookingLoading ? <Spinner size="sm" /> : <><i className="bx bx-link me-1" />Link TYL Booking</>}
                            </Button>
                          )}
                          {linkBookingError && <div className="text-danger small mt-1">{linkBookingError}</div>}
                        </td>
                      </tr>
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
                      {bookingDetail.retryCount > 0 && <tr><td className="text-muted">Retry Count</td><td>{bookingDetail.retryCount}</td></tr>}
                    </tbody>
                  </table>
                </Col>
              </Row>

              {/* Ticket breakdown */}
              {bookingDetail.ticketCodes?.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Label className="fw-semibold mb-0">Ticket Breakdown</Label>
                    {bookingDetail.priceTier && (
                      <Badge color={bookingDetail.priceTier === "nettPrice" ? "danger" : bookingDetail.priceTier === "minimumSellingPrice" ? "warning" : "success"} className="fw-normal small">
                        {bookingDetail.priceTier === "recommendedSellingPrice" ? "Recommended Selling" : bookingDetail.priceTier === "minimumSellingPrice" ? "Minimum Selling" : "Nett / Cost Price"}
                      </Badge>
                    )}
                  </div>
                  <table className="table table-sm table-bordered mb-0" style={{ fontSize: 13 }}>
                    <thead className="table-light">
                      <tr>
                        <th>Type</th><th>Qty</th><th>Unit Price</th>
                        {bookingDetail.ticketCodes.some((tc) => tc.nettPrice != null) && <th>Nett Cost</th>}
                        {bookingDetail.ticketCodes.some((tc) => tc.nettPrice != null) && <th>Margin</th>}
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingDetail.ticketCodes.map((tc, i) => {
                        const hasNett = tc.nettPrice != null;
                        const showMarginCols = bookingDetail.ticketCodes.some((c) => c.nettPrice != null);
                        const margin = hasNett ? (tc.unitPrice || 0) - tc.nettPrice : null;
                        const marginTotal = hasNett ? margin * tc.quantity : null;
                        const marginPct = hasNett && tc.nettPrice > 0 ? Math.round((margin / tc.nettPrice) * 100) : null;
                        return (
                          <tr key={i}>
                            <td>{tc.ticketTypeName || `Type ${tc.ticketTypeId}`}</td>
                            <td>{tc.quantity}</td>
                            <td>{tc.unitPrice > 0 ? `${bookingDetail.currency} ${tc.unitPrice.toFixed(2)}` : <span className="text-muted">—</span>}</td>
                            {showMarginCols && (
                              <td>{hasNett ? `${bookingDetail.currency} ${tc.nettPrice.toFixed(2)}` : <span className="text-muted">—</span>}</td>
                            )}
                            {showMarginCols && (
                              <td>
                                {margin !== null
                                  ? margin >= 0
                                    ? <span className="text-success">+{bookingDetail.currency} {marginTotal.toFixed(2)}{marginPct !== null ? ` (${marginPct}%)` : ""}</span>
                                    : <span className="text-danger">{bookingDetail.currency} {marginTotal.toFixed(2)}</span>
                                  : <span className="text-muted">—</span>}
                              </td>
                            )}
                            <td><strong>{tc.totalPrice > 0 ? `${bookingDetail.currency} ${tc.totalPrice.toFixed(2)}` : <span className="text-muted">—</span>}</strong></td>
                          </tr>
                        );
                      })}
                      <tr className="table-light">
                        <td colSpan={bookingDetail.ticketCodes.some((tc) => tc.nettPrice != null) ? 5 : 3} className="text-end fw-semibold">Total</td>
                        <td><strong>{bookingDetail.currency} {(bookingDetail.totalAmount || 0).toFixed(2)}</strong></td>
                      </tr>
                      {bookingDetail.ticketCodes.some((tc) => tc.nettPrice != null) && (() => {
                        const nettTotal = bookingDetail.ticketCodes.reduce((s, tc) => s + (tc.nettPrice != null ? tc.nettPrice * tc.quantity : 0), 0);
                        const grossMargin = (bookingDetail.totalAmount || 0) - nettTotal;
                        const marginPct = nettTotal > 0 ? Math.round((grossMargin / nettTotal) * 100) : null;
                        return (
                          <tr className="table-light">
                            <td colSpan={4} className="text-end fw-semibold text-muted small">Total Margin</td>
                            <td colSpan={2}>
                              {grossMargin >= 0
                                ? <span className="text-success fw-semibold">+{bookingDetail.currency} {grossMargin.toFixed(2)}{marginPct !== null ? ` (${marginPct}%)` : ""}</span>
                                : <span className="text-danger fw-semibold">{bookingDetail.currency} {grossMargin.toFixed(2)}</span>}
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cancellation policy */}
              {bookingDetail.cancellationPolicy && bookingDetail.isCancellable && (
                <Alert color="info" className="py-2 mb-3 small">
                  <strong>Cancellation Policy:</strong> {bookingDetail.cancellationPolicy.percentReturn}% refund if cancelled at least {bookingDetail.cancellationPolicy.refundDuration}h before visit.
                </Alert>
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

              {/* Ticket Access — CONFIRMED: full download panel; others: simple list */}
              {bookingDetail.status === "CONFIRMED" ? (
                <TicketAccessPanel
                  referenceNumber={bookingDetail.referenceNumber}
                  environment={environment}
                  storedVouchers={bookingDetail.vouchers}
                />
              ) : bookingDetail.vouchers?.length > 0 && (
                <div className="mb-3">
                  <Label className="fw-semibold">Vouchers ({bookingDetail.vouchers.length})</Label>
                  {bookingDetail.vouchers.map((v, i) => (
                    <div key={i} className="small border rounded p-2 mb-1">
                      {v.ticketTypeName && <div className="fw-semibold">{v.ticketTypeName}</div>}
                      {v.serialNumber && <div><span className="text-muted">Serial #:</span> <code>{v.serialNumber}</code></div>}
                      {v.status && <Badge color={v.status === "ACTIVE" ? "success" : "secondary"} className="mt-1">{v.status}</Badge>}
                    </div>
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
      <Modal isOpen={!!amendTarget} toggle={() => !amendLoading && setAmendTarget(null)}>
        <ModalHeader toggle={() => setAmendTarget(null)}>Change visit date</ModalHeader>
        <ModalBody>
          <div className="small text-muted mb-1">{amendTarget?.productName}</div>
          <div className="small mb-3">Current date: <strong>{amendTarget?.visitDate || "—"}</strong></div>
          <FormGroup>
            <Label className="small">New date</Label>
            <Input type="date" value={amendDate} min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setAmendDate(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="small">New time (optional — keeps the current slot time if blank)</Label>
            <Input type="time" value={amendTime} onChange={(e) => setAmendTime(e.target.value)} />
          </FormGroup>
          <Alert color="info" className="small mb-0">
            Availability is re-checked, a <strong>new ticket is reserved first</strong>, then the old
            one is cancelled — the customer always holds a valid ticket. No cancellation penalty.
            The customer gets a confirmation email automatically.
          </Alert>
          <div className="d-flex gap-2 mt-3">
            <Button color="primary" className="flex-grow-1" onClick={handleAmend} disabled={amendLoading || !amendDate}>
              {amendLoading ? <Spinner size="sm" /> : "Confirm date change"}
            </Button>
            <Button color="light" onClick={() => setAmendTarget(null)} disabled={amendLoading}>Close</Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal isOpen={!!cancelConfirmRef} toggle={() => setCancelConfirmRef(null)} size="sm">
        <ModalHeader toggle={() => setCancelConfirmRef(null)}>Confirm Cancellation</ModalHeader>
        <ModalBody>
          <p className="small">Cancel booking <code>{cancelConfirmRef}</code>? This triggers a refund if within the policy window.</p>
          <Label className="small fw-semibold">Reason (optional)</Label>
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

      {/* ── Link TYL Booking Modal ───────────────────────────── */}
      <Modal isOpen={linkModalOpen} toggle={() => setLinkModalOpen(false)} size="sm">
        <ModalHeader toggle={() => setLinkModalOpen(false)}>Link to TYL Tour Booking</ModalHeader>
        <ModalBody>
          <p className="small text-muted mb-3">
            Enter the TYL tour booking ID (<code>ObjectId</code>) to link to Globaltix booking <code>{linkTarget}</code>.
          </p>
          <FormGroup>
            <Label className="fw-semibold small">TYL Tour Booking ID</Label>
            <Input
              type="text"
              placeholder="e.g. 6643abc1d2e3f4567890abcd"
              value={linkTourBookingId}
              onChange={(e) => setLinkTourBookingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
            />
            <div className="text-muted mt-1" style={{ fontSize: 11 }}>24-character MongoDB ObjectId</div>
          </FormGroup>
          {linkBookingError && <Alert color="danger" className="py-2 small">{linkBookingError}</Alert>}
        </ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setLinkModalOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleLinkSubmit}
            disabled={!linkTourBookingId.trim() || linkBookingLoading}>
            {linkBookingLoading ? <Spinner size="sm" /> : <><i className="bx bx-link me-1" />Link</>}
          </Button>
        </div>
      </Modal>

      {/* ── Resend to Custom Email Modal ─────────────────────── */}
      <Modal isOpen={resendModalOpen} toggle={() => setResendModalOpen(false)} size="sm">
        <ModalHeader toggle={() => setResendModalOpen(false)}>Resend Confirmation Email</ModalHeader>
        <ModalBody>
          <p className="small text-muted mb-3">
            Send the ticket confirmation for <code>{resendTarget}</code> to a different email address.
          </p>
          <FormGroup>
            <Label className="fw-semibold small">Email Address</Label>
            <Input
              type="email"
              placeholder="e.g. agent@example.com"
              value={resendCustomEmail}
              onChange={(e) => setResendCustomEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResendCustomSubmit()}
            />
          </FormGroup>
        </ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setResendModalOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleResendCustomSubmit}
            disabled={!resendCustomEmail.trim() || resendEmailLoading}>
            {resendEmailLoading ? <Spinner size="sm" /> : <><i className="bx bx-send me-1" />Send</>}
          </Button>
        </div>
      </Modal>

      {/* ── Create Booking Modal ──────────────────────────────── */}
      <CreateBookingModal
        isOpen={createModalOpen}
        toggle={() => { setCreateModalOpen(false); fetchBookings(); }}
        environment={environment}
        onBookingConfirmed={fetchBookings}
      />
    </div>
  );
};

export default GlobtixBookingsPage;
