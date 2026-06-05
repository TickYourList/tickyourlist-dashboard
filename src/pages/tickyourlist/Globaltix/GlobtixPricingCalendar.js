/**
 * GlobtixPricingCalendar
 *
 * Shows a 6-month daily pricing grid for a Globaltix ticket type.
 * For each day: availability status + selling price in any currency.
 *
 * Usage:
 *   <GlobtixPricingCalendar
 *     ticketTypeID={256012}
 *     productId={53081}
 *     ticketTypeName="Date and Timeslots"
 *   />
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Row, Col, Badge, Spinner,
  Alert, Button, Input, Label, Table,
} from "reactstrap";
import { getGlobtixPricingCalendar } from "helpers/globaltix_helper";

const CURRENCIES = ["SGD", "INR", "USD", "AED", "EUR", "GBP", "MYR"];
const MONTHS_OPTIONS = [1, 2, 3, 6];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const GlobtixPricingCalendar = ({
  ticketTypeID,
  productId,
  ticketTypeName = "",
  environment = "staging",
}) => {
  const [currency, setCurrency] = useState("SGD");
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // { days: DayEntry[], summary: {} }
  const [view, setView] = useState("calendar"); // "calendar" | "table"

  const fetch = useCallback(async () => {
    if (!ticketTypeID) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getGlobtixPricingCalendar({
        ticketTypeID,
        productId,
        months,
        environment,
        currency,
      });
      setData(res?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load pricing calendar");
    } finally {
      setLoading(false);
    }
  }, [ticketTypeID, productId, months, environment, currency]);

  useEffect(() => { fetch(); }, [fetch]);

  // Group days by YYYY-MM for calendar rendering
  const byMonth = React.useMemo(() => {
    if (!data?.days) return {};
    const map = {};
    for (const day of data.days) {
      const ym = day.date.substring(0, 7);
      if (!map[ym]) map[ym] = {};
      map[ym][day.date] = day;
    }
    return map;
  }, [data]);

  const priceColor = (day) => {
    if (!day || day.isBlocked) return "#f8d7da";
    if (!day.available) return "#f8f9fa";
    if (!day.sellingPrice) return "#d4edda";
    const { summary } = data;
    if (!summary?.minPrice || !summary?.maxPrice || summary.minPrice === summary.maxPrice) return "#d4edda";
    const ratio = (day.sellingPrice - summary.minPrice) / (summary.maxPrice - summary.minPrice);
    // Green (cheap) → Yellow → Red (expensive)
    if (ratio < 0.33) return "#d4edda";
    if (ratio < 0.66) return "#fff3cd";
    return "#fde2e4";
  };

  const renderMonthCalendar = (yearMonth, daysMap) => {
    const [y, m] = yearMonth.split("-").map(Number);
    const firstDow = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const monthLabel = new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearMonth}-${String(d).padStart(2, "0")}`;
      cells.push({ d, day: daysMap[dateStr] || null, dateStr });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div key={yearMonth} className="mb-4">
        <div className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>{monthLabel}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              {DAY_NAMES.map((n) => (
                <th key={n} style={{ textAlign: "center", fontSize: "0.7rem", color: "#888", padding: "2px 0" }}>
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, wi) => (
              <tr key={wi}>
                {cells.slice(wi * 7, wi * 7 + 7).map((cell, ci) => {
                  if (!cell) return <td key={ci} />;
                  const { d, day, dateStr } = cell;
                  const bg = priceColor(day);
                  const today = new Date().toISOString().split("T")[0];
                  const isPast = dateStr < today;
                  return (
                    <td
                      key={ci}
                      title={day
                        ? `${dateStr}\n${day.isBlocked ? "BLOCKED" : day.available ? `${day.sellingPrice} ${currency}${day.hasTimeslots ? ` · ${day.seriesCount} slots` : ""}` : "Unavailable"}`
                        : dateStr}
                      style={{
                        background: isPast ? "#f8f9fa" : bg,
                        border: "1px solid #dee2e6",
                        borderRadius: 3,
                        padding: "2px 1px",
                        textAlign: "center",
                        opacity: isPast ? 0.4 : 1,
                        cursor: day && !isPast ? "pointer" : "default",
                        minWidth: 36,
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: 500 }}>{d}</div>
                      {day && !isPast && day.available && !day.isBlocked && day.sellingPrice > 0 && (
                        <div style={{ fontSize: "0.6rem", color: "#333", lineHeight: 1 }}>
                          {currency === "SGD" ? "S$" : currency === "INR" ? "₹" : currency === "USD" ? "$" : currency}{" "}
                          {day.sellingPrice % 1 === 0 ? day.sellingPrice : day.sellingPrice.toFixed(0)}
                        </div>
                      )}
                      {day?.isBlocked && (
                        <div style={{ fontSize: "0.55rem", color: "#dc3545" }}>BLOCKED</div>
                      )}
                      {day?.hasTimeslots && !isPast && (
                        <div style={{ fontSize: "0.55rem", color: "#0d6efd" }}>{day.seriesCount}sl</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = () => {
    if (!data?.days) return null;
    const today = new Date().toISOString().split("T")[0];
    const futureDays = data.days.filter((d) => d.date >= today);
    return (
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        <Table size="sm" bordered responsive className="mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Capacity</th>
              <th>Nett (SGD)</th>
              <th>Sell Price ({currency})</th>
              <th>Timeslots</th>
            </tr>
          </thead>
          <tbody>
            {futureDays.map((d) => (
              <tr key={d.date} style={{ background: priceColor(d) }}>
                <td className="small">{d.date}</td>
                <td>
                  {d.isBlocked
                    ? <Badge color="danger" pill>Blocked</Badge>
                    : d.available
                      ? <Badge color="success" pill>Available</Badge>
                      : <Badge color="secondary" pill>Unavailable</Badge>}
                </td>
                <td className="small text-center">{d.available ? String(d.capacity) : "—"}</td>
                <td className="small">{d.nettPriceSGD > 0 ? `SGD ${d.nettPriceSGD}` : "—"}</td>
                <td className="small fw-semibold">{d.sellingPrice > 0 ? `${currency} ${d.sellingPrice}` : "—"}</td>
                <td className="small text-center">{d.hasTimeslots ? `${d.seriesCount} slot(s)` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="mb-0 border-0 shadow-none">
      <CardHeader className="bg-white border-bottom py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <span className="fw-semibold">
            <i className="bx bx-calendar-alt me-1 text-primary" />
            Pricing Calendar
          </span>
          {ticketTypeName && (
            <Badge color="primary" pill className="ms-2" style={{ fontSize: "0.65em" }}>
              {ticketTypeName}
            </Badge>
          )}
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="d-flex align-items-center gap-1">
            <Label className="mb-0 small">Currency</Label>
            <Input
              type="select"
              bsSize="sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: 80 }}
            >
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </Input>
          </div>
          <div className="d-flex align-items-center gap-1">
            <Label className="mb-0 small">Months</Label>
            <Input
              type="select"
              bsSize="sm"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              style={{ width: 65 }}
            >
              {MONTHS_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </Input>
          </div>
          <div className="btn-group btn-group-sm">
            <Button
              color={view === "calendar" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <i className="bx bx-grid-alt" />
            </Button>
            <Button
              color={view === "table" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setView("table")}
            >
              <i className="bx bx-list-ul" />
            </Button>
          </div>
          <Button color="outline-secondary" size="sm" onClick={fetch} disabled={loading}>
            <i className={`bx ${loading ? "bx-loader bx-spin" : "bx-refresh"}`} />
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-3">
        {/* Legend */}
        <div className="d-flex gap-3 mb-3 flex-wrap" style={{ fontSize: "0.72rem" }}>
          <span><span style={{ background: "#d4edda", padding: "2px 8px", borderRadius: 3 }} /> Low price</span>
          <span><span style={{ background: "#fff3cd", padding: "2px 8px", borderRadius: 3 }} /> Mid price</span>
          <span><span style={{ background: "#fde2e4", padding: "2px 8px", borderRadius: 3 }} /> High price</span>
          <span><span style={{ background: "#f8d7da", padding: "2px 8px", borderRadius: 3 }} /> Blocked</span>
          <span><span style={{ background: "#f8f9fa", padding: "2px 8px", borderRadius: 3 }} /> Unavailable</span>
        </div>

        {/* Summary stats */}
        {data?.summary && (
          <Row className="mb-3 g-2">
            {[
              { label: "Available Days", value: data.summary.availableDays },
              { label: "Blocked Days", value: data.summary.blockedDays, color: data.summary.blockedDays > 0 ? "danger" : undefined },
              { label: "Min Price", value: data.summary.minPrice != null ? `${currency} ${data.summary.minPrice}` : "—" },
              { label: "Max Price", value: data.summary.maxPrice != null ? `${currency} ${data.summary.maxPrice}` : "—" },
              { label: "Dynamic Pricing", value: data.summary.hasDynamicPricing ? "Yes" : "No", color: data.summary.hasDynamicPricing ? "warning" : undefined },
            ].map(({ label, value, color }) => (
              <Col key={label} xs="auto">
                <div className="border rounded px-2 py-1 text-center" style={{ minWidth: 90 }}>
                  <div style={{ fontSize: "0.65rem", color: "#888" }}>{label}</div>
                  <div className={`fw-semibold small${color ? ` text-${color}` : ""}`}>{value}</div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {error && <Alert color="danger" className="py-2">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2 small text-muted">Fetching {months} month(s) of availability…</p>
          </div>
        ) : data ? (
          view === "calendar" ? (
            <Row>
              {Object.entries(byMonth).map(([ym, daysMap]) => (
                <Col key={ym} md={4} sm={6} xs={12}>
                  {renderMonthCalendar(ym, daysMap)}
                </Col>
              ))}
            </Row>
          ) : (
            renderTable()
          )
        ) : null}
      </CardBody>
    </Card>
  );
};

export default GlobtixPricingCalendar;
