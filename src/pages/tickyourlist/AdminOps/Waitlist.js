import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Col, Container, Row, Table, Spinner, Badge, Input, Label,
} from "reactstrap";
import { getWaitlist } from "helpers/admin_ops_helper";

/**
 * Waitlist demand: which sold-out products/dates customers are waiting for.
 * The top table is your "add more capacity here" signal; the bottom lists
 * individual entries (notified automatically by the hourly job).
 */
const Waitlist = () => {
  document.title = "Waitlist | TickYourList";
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [demand, setDemand] = useState([]);
  const [pendingOnly, setPendingOnly] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWaitlist({ pending: pendingOnly });
      setItems(res?.data?.items || []);
      setDemand(res?.data?.demand || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pendingOnly]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-3">Waitlist — unmet demand</h4>

        <Row>
          <Col lg={5}>
            <Card>
              <CardBody>
                <h6 className="mb-3">Most-wanted sold-out dates</h6>
                {loading ? (
                  <div className="text-center py-4"><Spinner size="sm" /></div>
                ) : (
                  <Table size="sm" responsive hover className="align-middle">
                    <thead>
                      <tr><th>Product</th><th>Date</th><th className="text-end">Waiting</th></tr>
                    </thead>
                    <tbody>
                      {demand.map((d, i) => (
                        <tr key={i}>
                          <td className="text-truncate" style={{ maxWidth: 220 }}>{d.tourGroupName || "Unknown"}</td>
                          <td className="text-nowrap">{d.date}</td>
                          <td className="text-end"><Badge color={d.customers >= 5 ? "danger" : "warning"} pill>{d.customers}</Badge></td>
                        </tr>
                      ))}
                      {demand.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-muted py-3">No pending demand 🎉</td></tr>
                      )}
                    </tbody>
                  </Table>
                )}
                <div className="text-muted small">
                  Customers here are notified automatically (once) when capacity returns. High counts =
                  consider opening more slots or sourcing more allocation for that date.
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={7}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Entries</h6>
                  <Label check className="d-flex align-items-center gap-2 mb-0 small text-muted">
                    <Input
                      type="checkbox"
                      checked={pendingOnly}
                      onChange={(e) => setPendingOnly(e.target.checked)}
                    />
                    Pending only
                  </Label>
                </div>
                {loading ? (
                  <div className="text-center py-4"><Spinner size="sm" /></div>
                ) : (
                  <Table size="sm" responsive hover className="align-middle">
                    <thead>
                      <tr><th>Joined</th><th>Email</th><th>Product</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {items.map((w) => (
                        <tr key={w._id}>
                          <td className="text-nowrap">{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td>{w.email}</td>
                          <td className="text-truncate" style={{ maxWidth: 200 }}>{w.tourGroupId?.name || "—"}</td>
                          <td className="text-nowrap">{w.date}</td>
                          <td>
                            {w.notifiedAt
                              ? (new Date(w.notifiedAt).getTime() === 0
                                ? <Badge color="secondary">Expired</Badge>
                                : <Badge color="success">Notified</Badge>)
                              : <Badge color="warning">Waiting</Badge>}
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted py-3">No waitlist entries.</td></tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Waitlist;
