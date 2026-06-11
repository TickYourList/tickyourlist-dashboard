import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Card, CardBody, Col, Container, Row, Table, Spinner, Badge, Button, Input,
} from "reactstrap";
import { searchProducts, getProductJourney } from "helpers/admin_ops_helper";

const STATUS_TONE = { CONFIRMED: "success", CANCELLED: "danger", PENDING: "warning" };

/**
 * One product, whole journey: funnel, daily bookings, revenue, waitlist
 * demand, amendments, recent admin changes, current price and social proof —
 * with jump links to every related management screen.
 */
const ProductJourney = () => {
  document.title = "Product Journey | TickYourList";
  const [params, setParams] = useSearchParams();
  const presetId = params.get("tourGroupId") || "";

  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(presetId || null);
  const [days, setDays] = useState(60);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Debounced product search
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchProducts(q.trim());
        setHits(res?.data?.products || []);
      } catch { setHits([]); } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await getProductJourney(selected, days);
      setData(res?.data || null);
    } catch { setData(null); } finally { setLoading(false); }
  }, [selected, days]);

  useEffect(() => { load(); }, [load]);

  const pick = (id) => {
    setSelected(id);
    setHits([]);
    setQ("");
    setParams({ tourGroupId: id });
  };

  const maxDay = Math.max(1, ...((data?.timeline || []).map((d) => d.created)));
  const statuses = data?.statuses || {};

  return (
    <div className="page-content">
      <Container fluid>
        <h4 className="mb-3">Product Journey</h4>

        <Card>
          <CardBody>
            <div className="position-relative" style={{ maxWidth: 480 }}>
              <Input
                placeholder="Search a product by name…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {(hits.length > 0 || searching) && (
                <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 10 }}>
                  {searching && <div className="p-2 small text-muted">Searching…</div>}
                  {hits.map((h) => (
                    <button
                      key={h._id}
                      type="button"
                      className="d-block w-100 text-start border-0 bg-white p-2 small"
                      style={{ cursor: "pointer" }}
                      onClick={() => pick(h._id)}
                    >
                      {h.name} {h.status && <Badge color="light" className="text-muted ms-1">{h.status}</Badge>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {loading && <div className="text-center py-5"><Spinner /></div>}

        {!loading && data?.product && (
          <>
            <Card>
              <CardBody className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <h5 className="mb-1">{data.product.name}</h5>
                  <div className="small text-muted">
                    {data.product.rating ? <>⭐ {data.product.rating} ({data.product.reviewCount || 0} reviews) · </> : null}
                    {data.product.listingPrice?.prices?.[0]?.finalPrice
                      ? <>{data.product.listingPrice.currencyCode} {data.product.listingPrice.prices[0].finalPrice} headline · </>
                      : null}
                    {data.socialProof?.booked7d ? <>🔥 {data.socialProof.booked7d} booked this week</> : "no bookings this week"}
                  </div>
                  <div className="mt-2 d-flex gap-2 flex-wrap small">
                    <Link to="/margin-analytics">Margin →</Link>
                    <Link to={`/admin-ops/waitlist`}>Waitlist →</Link>
                    <Link to={`/admin-ops/audit-log`}>Audit →</Link>
                    {data.product.urlSlugs?.EN && (
                      <a href={`https://www.tickyourlist.com/${data.product.urlSlugs.EN}`} target="_blank" rel="noreferrer">Live page ↗</a>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-1">
                  {[30, 60, 90].map((d) => (
                    <Button key={d} size="sm" color={days === d ? "primary" : "light"} onClick={() => setDays(d)}>{d}d</Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Row>
              {["PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
                <Col md={3} key={s}>
                  <Card><CardBody className="py-3">
                    <div className="text-muted small">{s.toLowerCase()}</div>
                    <div className={`fs-4 fw-semibold text-${STATUS_TONE[s]}`}>{statuses[s] || 0}</div>
                  </CardBody></Card>
                </Col>
              ))}
              <Col md={3}>
                <Card><CardBody className="py-3">
                  <div className="text-muted small">amended bookings</div>
                  <div className="fs-4 fw-semibold text-info">{data.amendments || 0}</div>
                </CardBody></Card>
              </Col>
            </Row>

            <Row>
              <Col lg={8}>
                <Card>
                  <CardBody>
                    <h6 className="mb-3">Bookings per day ({data.days}d) <span className="text-muted small fw-normal">solid = confirmed, light = created</span></h6>
                    <div className="d-flex align-items-end gap-1" style={{ height: 120, overflowX: "auto" }}>
                      {(data.timeline || []).map((d) => (
                        <div key={d._id} className="d-flex flex-column align-items-center" title={`${d._id}: ${d.created} created, ${d.confirmed} confirmed`} style={{ minWidth: 10 }}>
                          <div className="d-flex flex-column justify-content-end" style={{ height: 100 }}>
                            <div style={{ width: 8, height: Math.max(2, (d.created / maxDay) * 100), background: "#cfe2ff", borderRadius: 2 }}>
                              <div style={{ width: 8, height: `${d.created ? (d.confirmed / d.created) * 100 : 0}%`, background: "#0d6efd", borderRadius: 2, marginTop: "auto" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      {!(data.timeline || []).length && <div className="text-muted small">No bookings in range.</div>}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h6 className="mb-3">Recent admin changes on this product</h6>
                    <Table size="sm" responsive hover className="align-middle">
                      <thead><tr><th>When</th><th>Who</th><th>Area</th><th>Action</th></tr></thead>
                      <tbody>
                        {(data.audit || []).map((a) => (
                          <tr key={a._id}>
                            <td className="text-nowrap small">{new Date(a.createdAt).toLocaleString()}</td>
                            <td className="small">{a.actorEmail || "—"}</td>
                            <td><Badge color="light" className="text-muted">{a.entity}</Badge></td>
                            <td className="small">{a.action} <code style={{ fontSize: 10 }}>{a.method}</code></td>
                          </tr>
                        ))}
                        {!(data.audit || []).length && <tr><td colSpan={4} className="text-muted small text-center py-3">No tracked changes yet.</td></tr>}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Revenue ({data.days}d, confirmed)</h6>
                    {(data.revenueByCurrency || []).map((r) => (
                      <div key={r._id} className="d-flex justify-content-between">
                        <span className="text-muted small">{r._id}</span>
                        <strong>{Math.round(r.revenue).toLocaleString()}</strong>
                      </div>
                    ))}
                    {!(data.revenueByCurrency || []).length && <div className="text-muted small">None in range.</div>}
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Waitlist demand <Badge color={data.waitlist?.pending ? "warning" : "light"} pill>{data.waitlist?.pending || 0}</Badge></h6>
                    {(data.waitlist?.topDates || []).map((d) => (
                      <div key={d.date} className="d-flex justify-content-between small">
                        <span>{d.date}</span><Badge color="warning" pill>{d.customers}</Badge>
                      </div>
                    ))}
                    {!(data.waitlist?.topDates || []).length && <div className="text-muted small">No one waiting.</div>}
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <h6 className="mb-2">Price tracking</h6>
                    {data.priceSnapshot ? (
                      <div className="small">
                        <div className="d-flex justify-content-between"><span className="text-muted">Tracked (USD)</span><strong>${data.priceSnapshot.priceUSD}</strong></div>
                        <div className="d-flex justify-content-between"><span className="text-muted">Last change seen</span><span>{new Date(data.priceSnapshot.updatedAt).toLocaleDateString()}</span></div>
                        <div className="text-muted mt-1" style={{ fontSize: 11 }}>Drops ≥5% alert wishlisters automatically.</div>
                      </div>
                    ) : (
                      <div className="text-muted small">No snapshot yet — appears once someone wishlists this product.</div>
                    )}
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

export default ProductJourney;
