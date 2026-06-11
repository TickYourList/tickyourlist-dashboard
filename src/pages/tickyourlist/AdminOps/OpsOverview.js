import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Container, Row, Table, Spinner, Badge, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { getOpsOverview } from "helpers/admin_ops_helper";

const RANGE = [7, 30, 90];

/** The morning screen: funnel, today's pulse, open issues, top products. */
const OpsOverview = () => {
  document.title = "Overview | TickYourList";
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpsOverview(days);
      setData(res?.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const f = data?.funnel || {};

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Operations Overview</h4>
          <div className="d-flex gap-1">
            {RANGE.map((d) => (
              <Button key={d} size="sm" color={days === d ? "primary" : "light"} onClick={() => setDays(d)}>
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <div className="text-center py-5"><Spinner /></div>
        ) : data ? (
          <>
            <Row>
              {[
                ["Bookings created", f.created, "primary"],
                ["Confirmed", f.confirmed, "success"],
                ["Still pending", f.pending, "warning"],
                ["Cancelled", f.cancelled, "secondary"],
                ["Conversion", `${f.conversionPct ?? 0}%`, "info"],
              ].map(([label, value, tone]) => (
                <Col key={label} className="col">
                  <Card>
                    <CardBody className="py-3">
                      <div className="text-muted small">{label}</div>
                      <div className={`fs-4 fw-semibold text-${tone}`}>{value ?? 0}</div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row>
              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Today</h6>
                    <div className="d-flex justify-content-between"><span className="text-muted small">Created</span><strong>{data.today?.created ?? 0}</strong></div>
                    <div className="d-flex justify-content-between"><span className="text-muted small">Confirmed</span><strong className="text-success">{data.today?.confirmed ?? 0}</strong></div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Revenue (confirmed, {data.days}d)</h6>
                    {(data.revenueByCurrency || []).map((r) => (
                      <div key={r._id} className="d-flex justify-content-between">
                        <span className="text-muted small">{r._id} · {r.bookings} bookings</span>
                        <strong>{Math.round(r.revenue).toLocaleString()}</strong>
                      </div>
                    ))}
                    {!(data.revenueByCurrency || []).length && <div className="text-muted small">No confirmed revenue in range.</div>}
                  </CardBody>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Top products ({data.days}d)</h6>
                    {(data.topProducts || []).map((p) => (
                      <div key={p.tourGroupId} className="d-flex justify-content-between align-items-center mb-1">
                        <Link to={`/admin-ops/product-journey?tourGroupId=${p.tourGroupId}`} className="text-truncate small" style={{ maxWidth: 240 }}>
                          {p.name || p.tourGroupId}
                        </Link>
                        <Badge color="primary" pill>{p.bookings}</Badge>
                      </div>
                    ))}
                    {!(data.topProducts || []).length && <div className="text-muted small">No confirmed bookings in range.</div>}
                    <div className="text-muted mt-2" style={{ fontSize: 11 }}>Click a product to open its full journey.</div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Needs attention <Badge color={data.needsAttention?.length ? "danger" : "success"} pill>{data.needsAttention?.length || 0}</Badge></h6>
                    {(data.needsAttention || []).map((b) => (
                      <div key={b._id} className="mb-2 small border-bottom pb-1">
                        <div className="fw-semibold text-truncate">{b.title || b._id}</div>
                        <div className="text-muted text-truncate">{b.email} · {b.currency} {b.amount}</div>
                        <div className="text-danger text-truncate" style={{ fontSize: 11 }}>{b.providerBooking?.error}</div>
                      </div>
                    ))}
                    {!(data.needsAttention || []).length && <div className="text-muted small">All clear 🎉</div>}
                    <Link to="/globaltix/bookings" className="small">Open ops queue →</Link>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Card><CardBody className="text-center text-muted py-4">Could not load overview.</CardBody></Card>
        )}
      </Container>
    </div>
  );
};

export default OpsOverview;
