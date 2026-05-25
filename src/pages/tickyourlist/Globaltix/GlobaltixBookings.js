import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody, Label, FormGroup, FormFeedback,
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
} from "store/tickyourlist/globaltix/action";
import { fetchGlobtixProductsRequest, searchGlobtixProductsRequest } from "store/tickyourlist/globaltix/action";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  RESERVED: "warning",
  CONFIRMED: "success",
  RELEASED: "secondary",
  CANCELLED: "danger",
  ERROR: "danger",
};

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

const STEP_LABELS = ["Select Product", "Tickets & Date", "Questions", "Review", "Done"];

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

// ─── Step 2: Tickets & Date ───────────────────────────────────────────────────

function StepTicketsDate({ product, option, form, onChange, environment }) {
  const dispatch = useDispatch();
  const { availabilityCalendar, calendarLoading, availabilityTimeslots, timeslotsLoading } = useSelector((s) => s.globaltix || {});
  const currency = product.currency || "SGD";
  const needsDate = option.visitDateRequired || ["VisitDate", "DateAndTime"].includes(option.ticketValidity);
  const needsTime = option.ticketValidity === "DateAndTime";
  const currentMonth = useRef(isoMonth(new Date()));

  useEffect(() => {
    if (needsDate) {
      dispatch(fetchGlobtixAvailabilityCalendarRequest(product.globaltixProductId, option.id, currentMonth.current, environment));
    }
  }, [dispatch, product.globaltixProductId, option.id, environment, needsDate]);

  useEffect(() => {
    if (needsTime && form.visitDate) {
      dispatch(fetchGlobtixAvailabilityTimeslotRequest(product.globaltixProductId, option.id, form.visitDate, environment));
    }
  }, [dispatch, product.globaltixProductId, option.id, form.visitDate, environment, needsTime]);

  const availableDates = availabilityCalendar?.available || availabilityCalendar?.dates || [];
  const isDayAvailable = (d) => !availableDates.length || availableDates.includes(d);

  const totalAmount = (option.ticketTypes || []).reduce((sum, tt) => {
    const qty = form.quantities[tt.id] || 0;
    return sum + qty * (tt.recommendedSellingPrice || tt.nettPrice || 0);
  }, 0);

  return (
    <div>
      {/* Ticket quantities */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2">Ticket Types</h6>
        {(option.ticketTypes || []).map((tt) => {
          const price = tt.recommendedSellingPrice || tt.nettPrice || 0;
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
                <div className="text-success fw-semibold">{fmtCur(currency, price)}</div>
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
            Subtotal: <span className="text-success">{fmtCur(currency, totalAmount)}</span>
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

      {/* Timeslots for DateAndTime */}
      {needsTime && form.visitDate && (
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Select Time {timeslotsLoading && <Spinner size="sm" className="ms-1" />}</h6>
          {!timeslotsLoading && !availabilityTimeslots?.length ? (
            <Alert color="warning" className="py-2 small">No timeslots available for this date.</Alert>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {(availabilityTimeslots || []).map((slot, i) => {
                const time = slot.time || slot.startTime || slot;
                const sid = slot.seriesId || slot.id || i;
                const avail = slot.availability ?? slot.available ?? "?";
                const selected = form.visitTime === String(time) && form.seriesId === sid;
                return (
                  <Button key={i} size="sm"
                    color={selected ? "primary" : "outline-secondary"}
                    onClick={() => { onChange("visitTime", String(time)); onChange("seriesId", sid); }}
                    disabled={avail === 0}>
                    {time}{avail !== "?" ? ` (${avail})` : ""}
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
  const tickets = (option.ticketTypes || []).filter((tt) => (form.quantities[tt.id] || 0) > 0);
  const total = tickets.reduce((s, tt) => s + (form.quantities[tt.id] || 0) * (tt.recommendedSellingPrice || tt.nettPrice || 0), 0);
  const answers = Object.entries(form.answers || {}).filter(([, v]) => v);

  return (
    <div>
      <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
        <div className="fw-semibold mb-1">{product.name}</div>
        <div className="text-muted small">{product.country}{product.city ? ` · ${product.city}` : ""}</div>
      </div>

      <table className="table table-sm table-borderless mb-3" style={{ fontSize: 13 }}>
        <tbody>
          <tr><td className="text-muted" style={{ width: 130 }}>Option</td><td className="fw-medium">{option.name}</td></tr>
          <tr><td className="text-muted">Ticket Type</td><td>{VALIDITY_LABELS[option.ticketValidity] || option.ticketValidity} · {FORMAT_LABELS[option.ticketFormat] || option.ticketFormat}</td></tr>
          {form.visitDate && <tr><td className="text-muted">Visit Date</td><td className="fw-medium">{form.visitDate}{form.visitTime ? ` at ${form.visitTime}` : ""}</td></tr>}
          {form.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{form.partnerReference}</code></td></tr>}
          <tr><td className="text-muted">Cancellable</td><td>{option.isCancellable ? <span className="text-success">Yes — {option.cancellationPolicy?.percentReturn}% refund / {option.cancellationPolicy?.refundDuration}h before</span> : <span className="text-danger">No</span>}</td></tr>
        </tbody>
      </table>

      {tickets.length > 0 && (
        <div className="mb-3">
          <div className="fw-semibold small mb-1">Ticket Breakdown</div>
          <table className="table table-sm table-bordered mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light"><tr><th>Type</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {tickets.map((tt) => {
                const qty = form.quantities[tt.id] || 0;
                const price = tt.recommendedSellingPrice || tt.nettPrice || 0;
                return (
                  <tr key={tt.id}>
                    <td>{tt.name}</td>
                    <td>{fmtCur(currency, price)}</td>
                    <td>{qty}</td>
                    <td className="fw-semibold">{fmtCur(currency, qty * price)}</td>
                  </tr>
                );
              })}
              <tr className="table-light">
                <td colSpan={3} className="fw-bold text-end">Total</td>
                <td className="fw-bold text-success">{fmtCur(currency, total)}</td>
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

function StepReserved({ booking, onConfirm, onRelease, confirmLoading, releaseLoading, onClose }) {
  if (!booking) return null;
  return (
    <div>
      <div className="text-center mb-4">
        <div className="fs-1">🎫</div>
        <h5 className="text-warning fw-bold">Booking Reserved!</h5>
        <p className="text-muted small">You have 15 minutes to confirm this booking before the hold expires and credit is returned.</p>
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

      <table className="table table-sm table-borderless mb-4" style={{ fontSize: 13 }}>
        <tbody>
          <tr><td className="text-muted" style={{ width: 130 }}>Product</td><td>{booking.globaltixProductName}</td></tr>
          <tr><td className="text-muted">Option</td><td>{booking.optionName}</td></tr>
          {booking.visitDate && <tr><td className="text-muted">Visit Date</td><td>{booking.visitDate}{booking.visitTime ? ` · ${booking.visitTime}` : ""}</td></tr>}
          {booking.partnerReference && <tr><td className="text-muted">Partner Ref</td><td><code>{booking.partnerReference}</code></td></tr>}
          <tr><td className="text-muted">Hold Expires</td><td className="text-warning fw-semibold">{booking.holdExpiresAt ? new Date(booking.holdExpiresAt).toLocaleString() : "—"}</td></tr>
        </tbody>
      </table>

      <div className="d-flex gap-3">
        <Button color="success" className="flex-grow-1"
          onClick={() => onConfirm(booking.referenceNumber)} disabled={confirmLoading}>
          {confirmLoading ? <><Spinner size="sm" className="me-1" />Confirming...</> : <><i className="bx bx-check-circle me-1" />Confirm Booking (deducts credit)</>}
        </Button>
        <Button color="outline-danger"
          onClick={() => onRelease(booking.referenceNumber)} disabled={releaseLoading}>
          {releaseLoading ? <Spinner size="sm" /> : "Release"}
        </Button>
      </div>

      <div className="text-center mt-3">
        <Button color="link" size="sm" className="text-muted" onClick={onClose}>
          Close and view in bookings list
        </Button>
      </div>
    </div>
  );
}

// ─── Create Booking Modal ─────────────────────────────────────────────────────

function CreateBookingModal({ isOpen, toggle, environment }) {
  const dispatch = useDispatch();
  const { reserveLoading, reservedBooking, reserveError, confirmLoading, releaseLoading } = useSelector((s) => s.globaltix || {});
  const prevReserveLoading = useRef(false);

  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [form, setForm] = useState({
    quantities: {},
    visitDate: "",
    visitTime: "",
    seriesId: null,
    partnerReference: "",
    answers: {},
  });

  // Move to Done step once reserve succeeds
  useEffect(() => {
    if (prevReserveLoading.current && !reserveLoading && reservedBooking) {
      setStep(4);
    }
    prevReserveLoading.current = reserveLoading;
  }, [reserveLoading, reservedBooking]);

  const resetModal = () => {
    setStep(0);
    setSelectedProduct(null);
    setSelectedOption(null);
    setForm({ quantities: {}, visitDate: "", visitTime: "", seriesId: null, partnerReference: "", answers: {} });
  };

  const handleToggle = () => { resetModal(); toggle(); };

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleProductSelected = (product, option) => {
    setSelectedProduct(product);
    setSelectedOption(option);
    // Init quantities to 0
    const init = {};
    (option.ticketTypes || []).forEach((tt) => { init[tt.id] = 0; });
    setForm({ quantities: init, visitDate: "", visitTime: "", seriesId: null, partnerReference: "", answers: {} });
    setStep(1);
  };

  const totalQty = selectedOption ? (selectedOption.ticketTypes || []).reduce((s, tt) => s + (form.quantities[tt.id] || 0), 0) : 0;

  const canProceedStep1 = step === 1 && totalQty > 0 &&
    (!selectedOption?.visitDateRequired && !["VisitDate", "DateAndTime"].includes(selectedOption?.ticketValidity) || form.visitDate) &&
    (selectedOption?.ticketValidity !== "DateAndTime" || form.visitTime);

  const requiredAnswers = (selectedOption?.questions || []).filter((q) => {
    // All questions are implicitly required unless we know otherwise
    return true;
  });
  const canProceedStep2 = step === 2 && requiredAnswers.every((q) => form.answers[q.id]);

  const handleReserve = () => {
    const tickets = (selectedOption.ticketTypes || [])
      .filter((tt) => (form.quantities[tt.id] || 0) > 0)
      .map((tt) => ({ ticketTypeId: tt.id, quantity: form.quantities[tt.id] }));

    const answers = Object.entries(form.answers)
      .filter(([, v]) => v)
      .map(([id, answer]) => ({ id: parseInt(id), answer }));

    dispatch(reserveGlobtixBookingRequest({
      environment,
      globaltixProductId: selectedProduct.globaltixProductId,
      optionId: selectedOption.id,
      tickets,
      ...(form.visitDate && { visitDate: form.visitDate }),
      ...(form.visitTime && { visitTime: form.visitTime }),
      ...(form.seriesId && { seriesId: form.seriesId }),
      ...(answers.length && { answers }),
      ...(form.partnerReference && { partnerReference: form.partnerReference }),
    }));
  };

  const handleConfirm = (ref) => dispatch(confirmGlobtixBookingRequest(ref, environment));
  const handleRelease = (ref) => dispatch(releaseGlobtixBookingRequest(ref, environment));

  return (
    <Modal isOpen={isOpen} toggle={handleToggle} size="lg" scrollable>
      <ModalHeader toggle={handleToggle}>
        Create Globaltix Booking
        {step > 0 && step < 4 && selectedProduct && (
          <span className="ms-2 text-muted fw-normal small">{selectedProduct.name}</span>
        )}
      </ModalHeader>
      <ModalBody>
        {/* Step indicator */}
        {step < 4 && (
          <div className="d-flex align-items-center mb-4 gap-1" style={{ fontSize: 12 }}>
            {STEP_LABELS.slice(0, -1).map((label, i) => (
              <React.Fragment key={i}>
                <div className={`px-2 py-1 rounded ${i === step ? "bg-primary text-white fw-semibold" : i < step ? "bg-success text-white" : "bg-light text-muted"}`}>
                  {i < step ? "✓" : i + 1} {label}
                </div>
                {i < STEP_LABELS.length - 2 && <div className="text-muted">›</div>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 0: Select product */}
        {step === 0 && (
          <StepSelectProduct onSelect={handleProductSelected} environment={environment} />
        )}

        {/* Step 1: Tickets & Date */}
        {step === 1 && selectedProduct && selectedOption && (
          <div>
            <StepTicketsDate
              product={selectedProduct}
              option={selectedOption}
              form={form}
              onChange={setField}
              environment={environment}
            />
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => { setStep(0); setSelectedProduct(null); setSelectedOption(null); }}>Back</Button>
              <Button color="primary" disabled={!canProceedStep1}
                onClick={() => setStep((selectedOption.questions || []).length > 0 ? 2 : 3)}>
                {(selectedOption.questions || []).length > 0 ? "Next: Questions" : "Next: Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && selectedOption && (
          <div>
            <StepQuestions option={selectedOption} form={form} onChange={setField} />
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => setStep(1)}>Back</Button>
              <Button color="primary" onClick={() => setStep(3)}>Next: Review</Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && selectedProduct && selectedOption && (
          <div>
            <StepReview product={selectedProduct} option={selectedOption} form={form} />
            {reserveError && (
              <Alert color="danger" className="mt-3 py-2 small">
                <strong>Reserve failed:</strong> {reserveError}
              </Alert>
            )}
            <div className="d-flex gap-2 mt-3">
              <Button color="outline-secondary" onClick={() => setStep((selectedOption.questions || []).length > 0 ? 2 : 1)}>Back</Button>
              <Button color="success" className="flex-grow-1" onClick={handleReserve} disabled={reserveLoading}>
                {reserveLoading
                  ? <><Spinner size="sm" className="me-1" />Reserving...</>
                  : <><i className="bx bx-lock-alt me-1" />Reserve (15-min hold)</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Reserved result */}
        {step === 4 && (
          <StepReserved
            booking={reservedBooking}
            onConfirm={handleConfirm}
            onRelease={handleRelease}
            confirmLoading={confirmLoading}
            releaseLoading={releaseLoading}
            onClose={handleToggle}
          />
        )}
      </ModalBody>
    </Modal>
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
  } = useSelector((state) => state.globaltix || {});

  const [environment] = useState("staging");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmRef, setCancelConfirmRef] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  const handleConfirm = (ref) => dispatch(confirmGlobtixBookingRequest(ref, environment));
  const handleRelease = (ref) => dispatch(releaseGlobtixBookingRequest(ref, environment));
  const handleResendEmail = (ref) => dispatch(resendGlobtixEmailRequest(ref, environment));
  const handleRefreshFromApi = (ref) => dispatch(refreshGlobtixBookingRequest(ref, environment));

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Globaltix Bookings</h4>
                <p className="text-muted mb-0">
                  All booking records &bull; {bookingsPagination?.total || 0} total
                </p>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <Badge color="secondary">{environment}</Badge>
                <Button color="primary" onClick={() => setCreateModalOpen(true)}>
                  <i className="bx bx-plus me-1" />Create Booking
                </Button>
              </div>
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
                  <Col className="d-flex justify-content-end">
                    <Button color="outline-secondary" size="sm" onClick={fetchBookings}>
                      <i className="bx bx-refresh me-1" />Refresh
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
                                  <Badge color="info" style={{ fontSize: 10 }}>Linked</Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
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
                                  {b.status === "CONFIRMED" && b.isCancellable && (
                                    <Button size="sm" color="outline-danger"
                                      onClick={() => setCancelConfirmRef(b.referenceNumber)} title="Cancel booking">
                                      <i className="bx bx-block" />
                                    </Button>
                                  )}
                                  {b.status === "CONFIRMED" && (
                                    <Button size="sm" color="outline-secondary"
                                      onClick={() => handleResendEmail(b.referenceNumber)}
                                      disabled={resendEmailLoading} title="Resend email">
                                      <i className="bx bx-envelope" />
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
                    <Button color="outline-secondary" size="sm"
                      onClick={() => handleResendEmail(bookingDetail.referenceNumber)} disabled={resendEmailLoading}>
                      {resendEmailLoading ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Resend Email</>}
                    </Button>
                  )}
                  {bookingDetail.status === "CONFIRMED" && bookingDetail.isCancellable && (
                    <Button color="outline-danger" size="sm"
                      onClick={() => { setDetailModalOpen(false); setCancelConfirmRef(bookingDetail.referenceNumber); }}>
                      <i className="bx bx-block me-1" />Cancel
                    </Button>
                  )}
                </div>
              </div>

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
                      {bookingDetail.tourBookingId && <tr><td className="text-muted">TYL Booking</td><td><code className="small">{typeof bookingDetail.tourBookingId === "object" ? bookingDetail.tourBookingId._id || String(bookingDetail.tourBookingId) : bookingDetail.tourBookingId}</code></td></tr>}
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
                              {v.status && <div><strong>Status:</strong> <Badge color={v.status === "ACTIVE" ? "success" : "secondary"}>{v.status}</Badge></div>}
                              {v.validFrom && <div className="text-muted">Valid: {v.validFrom} → {v.validTo || "—"}</div>}
                              <div className="d-flex gap-2 mt-2 flex-wrap">
                                {v.eTicketUrl && (
                                  <a href={v.eTicketUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                                    <i className="bx bx-download me-1" />Download E-Ticket
                                  </a>
                                )}
                                {v.viewTicketUrl && (
                                  <a href={v.viewTicketUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                                    <i className="bx bx-link-external me-1" />Customer View
                                  </a>
                                )}
                              </div>
                            </div>
                          </Col>
                          {v.qrCode && (
                            <Col xs="auto">
                              <img
                                src={`data:image/png;base64,${v.qrCode}`}
                                alt="QR Code"
                                style={{ width: 100, height: 100, border: "1px solid #dee2e6", borderRadius: 4 }}
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

      {/* ── Create Booking Modal ──────────────────────────────── */}
      <CreateBookingModal
        isOpen={createModalOpen}
        toggle={() => { setCreateModalOpen(false); fetchBookings(); }}
        environment={environment}
      />
    </div>
  );
};

export default GlobtixBookingsPage;
