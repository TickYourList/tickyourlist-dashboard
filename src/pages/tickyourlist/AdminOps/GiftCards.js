import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Col, Container, Row, Table, Spinner, Button, Badge,
} from "reactstrap";
import { getGiftCards } from "helpers/admin_ops_helper";

const STATUS_COLORS = { PENDING: "warning", PAID: "info", REDEEMED: "success" };
const STATUSES = ["", "PENDING", "PAID", "REDEEMED"];

/** Gift card sales & redemptions overview. */
const GiftCards = () => {
  document.title = "Gift Cards | TickYourList";
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGiftCards({ page, limit, ...(status && { status }) });
      setItems(res?.data?.items || []);
      setTotals(res?.data?.totals || []);
      setTotal(res?.data?.total || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const totalOf = (s) => totals.find((t) => t._id === s) || { count: 0, amountTYL: 0 };
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-3">Gift Cards</h4>

        <Row>
          {["PAID", "REDEEMED", "PENDING"].map((s) => (
            <Col md={4} key={s}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">{s === "PAID" ? "Sold (unredeemed)" : s === "REDEEMED" ? "Redeemed" : "Abandoned checkouts"}</div>
                    <Badge color={STATUS_COLORS[s]}>{s}</Badge>
                  </div>
                  <div className="fs-4 fw-semibold">{totalOf(s).count}</div>
                  <div className="text-muted small">{Number(totalOf(s).amountTYL).toLocaleString()} TYL</div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Card>
          <CardBody>
            <div className="d-flex gap-2 mb-3">
              {STATUSES.map((s) => (
                <Button
                  key={s || "all"}
                  size="sm"
                  color={status === s ? "primary" : "light"}
                  onClick={() => { setPage(1); setStatus(s); }}
                >
                  {s || "All"}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-5"><Spinner /></div>
            ) : (
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Bought</th>
                    <th>Code</th>
                    <th className="text-end">Value</th>
                    <th>Buyer</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Redeemed by</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((g) => (
                    <tr key={g._id}>
                      <td className="text-nowrap">{new Date(g.createdAt).toLocaleDateString()}</td>
                      <td><code>{g.code || "—"}</code></td>
                      <td className="text-end">{g.amountTYL} TYL <span className="text-muted small">({g.currencyPaid} {g.amountPaid})</span></td>
                      <td>{g.purchaserEmail}</td>
                      <td>{g.recipientName ? `${g.recipientName} · ` : ""}{g.recipientEmail}</td>
                      <td><Badge color={STATUS_COLORS[g.status] || "secondary"}>{g.status}</Badge></td>
                      <td>
                        {g.redeemedBy
                          ? `${g.redeemedBy.email || ""} ${g.redeemedAt ? `(${new Date(g.redeemedAt).toLocaleDateString()})` : ""}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No gift cards{status ? ` with status ${status}` : " yet"}.</td></tr>
                  )}
                </tbody>
              </Table>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <Button color="light" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
              <span className="text-muted small">Page {page} of {pages}</span>
              <Button color="light" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>Next →</Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default GiftCards;
