import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Col, Container, Row, Table, Spinner, Button, Input, Label, Badge,
} from "reactstrap";
import { get } from "helpers/api_helper";

const isoDaysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const usd = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Revenue & margin per product: revenue normalised to USD, cost from the
 * provider mapping's nett buy rate. Manual products show revenue only.
 */
const MarginAnalytics = () => {
  document.title = "Margin Analytics | TickYourList";
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await get(`/v1/tylbookinganalytics/analytics/margin`, { params: { from, to } });
      setTotals(res?.data?.totals || null);
      setProducts(res?.data?.products || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load margin analytics");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-3">Revenue &amp; Margin</h4>

        <Card>
          <CardBody className="d-flex flex-wrap align-items-end gap-3">
            <div>
              <Label className="mb-1">From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button color="primary" onClick={load} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Apply"}
            </Button>
          </CardBody>
        </Card>

        {error && <div className="alert alert-danger">{error}</div>}

        {totals && (
          <Row>
            {[
              ["Confirmed bookings", totals.bookings],
              ["Revenue (USD)", usd(totals.revenueUSD)],
              ["Supplier cost (USD)", usd(totals.costUSD)],
              ["Margin (USD)", usd(totals.marginUSD)],
            ].map(([label, value]) => (
              <Col md={3} key={label}>
                <Card>
                  <CardBody>
                    <div className="text-muted small">{label}</div>
                    <div className="fs-4 fw-semibold">{value}</div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Card>
          <CardBody>
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-end">Bookings</th>
                  <th className="text-end">Guests</th>
                  <th className="text-end">Revenue</th>
                  <th className="text-end">Cost</th>
                  <th className="text-end">Margin</th>
                  <th className="text-end">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.tourGroupId}>
                    <td>{p.name}</td>
                    <td className="text-end">{p.bookings}</td>
                    <td className="text-end">{p.guests}</td>
                    <td className="text-end">{usd(p.revenueUSD)}</td>
                    <td className="text-end">{p.costKnownBookings > 0 ? usd(p.costUSD) : <Badge color="light" className="text-muted">no buy rate</Badge>}</td>
                    <td className="text-end">{p.costKnownBookings > 0 ? usd(p.marginUSD) : "—"}</td>
                    <td className="text-end">{p.marginPct != null ? `${p.marginPct}%` : "—"}</td>
                  </tr>
                ))}
                {!loading && products.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No confirmed bookings in this period.</td></tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default MarginAnalytics;
