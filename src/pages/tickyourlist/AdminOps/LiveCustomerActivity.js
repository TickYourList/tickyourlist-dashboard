import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge, Button, Card, CardBody, Col, Container, Input, Row, Spinner, Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getCustomerActivity } from "helpers/admin_ops_helper";
import { showToastError } from "helpers/toastBuilder";
import getSocket from "helpers/socket";

/**
 * Live feed of storefront customer auth activity — who just signed up or logged
 * in, from where and on what device, and whether they are a brand-new account
 * or returning. The REST call seeds history on load; the socket pushes events
 * in real time. Powered by /admin/ops/customer-activity + the customer_activity
 * socket room.
 */

const TYPE_META = {
  SIGNUP: { label: "New signup", color: "success" },
  GOOGLE_SIGNUP: { label: "New signup · Google", color: "success" },
  LOGIN: { label: "Login", color: "primary" },
  GOOGLE_LOGIN: { label: "Login · Google", color: "primary" },
  LOGIN_FAILED: { label: "Failed login", color: "danger" },
};

const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleString();
};

const StatCard = ({ label, value, color }) => (
  <Col xs="6" md="2">
    <Card className="mb-2">
      <CardBody className="py-3 text-center">
        <h3 className={`mb-0 text-${color || "dark"}`}>{value ?? "—"}</h3>
        <span className="text-muted small">{label}</span>
      </CardBody>
    </Card>
  </Col>
);

const LiveCustomerActivity = () => {
  document.title = "Live Customer Activity | TickYourList";
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  // `paused` inside socket callbacks needs a ref to read the latest value.
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCustomerActivity({ limit: 50 });
      setItems(res?.data?.items || []);
      setStats(res?.data?.stats || null);
    } catch (err) {
      showToastError(err?.response?.data?.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const socket = getSocket();
    const onConnect = () => {
      setConnected(true);
      socket.emit("join_customer_activity");
    };
    const onDisconnect = () => setConnected(false);
    const onActivity = (event) => {
      if (pausedRef.current) return;
      setItems((prev) => [event, ...prev].slice(0, 200));
    };
    const onRecent = (payload) => {
      if (pausedRef.current) return;
      if (payload?.items?.length) setItems(payload.items.slice(0, 200));
    };
    const onStats = (payload) => {
      if (payload?.stats) setStats(payload.stats);
    };
    // Geo resolves in the background; merge it into the matching row when it lands.
    const onGeoPatch = (payload) => {
      if (!payload?._id || !payload.location) return;
      setItems((prev) =>
        prev.map((e) => (e._id === payload._id ? { ...e, location: payload.location } : e))
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("customer_activity", onActivity);
    socket.on("customer_activity_recent", onRecent);
    socket.on("customer_activity_stats", onStats);
    socket.on("customer_activity_geo", onGeoPatch);

    if (socket.connected) onConnect();

    return () => {
      socket.emit("leave_customer_activity");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("customer_activity", onActivity);
      socket.off("customer_activity_recent", onRecent);
      socket.off("customer_activity_stats", onStats);
      socket.off("customer_activity_geo", onGeoPatch);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((e) => {
      if (typeFilter === "new" && !e.isNewUser) return false;
      if (typeFilter === "returning" && (e.isNewUser || e.type === "LOGIN_FAILED")) return false;
      if (typeFilter === "failed" && e.type !== "LOGIN_FAILED") return false;
      if (q) {
        const hay = `${e.customer?.name || ""} ${e.customer?.email || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, typeFilter, search]);

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="mb-0">Live Customer Activity</h4>
          <div className="d-flex align-items-center gap-2">
            <Badge color={connected ? "success" : "secondary"} pill>
              <i className="mdi mdi-circle me-1" style={{ fontSize: 8 }} />
              {connected ? "Live" : "Connecting…"}
            </Badge>
            <Button size="sm" color={paused ? "warning" : "light"} onClick={() => setPaused((p) => !p)}>
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button size="sm" color="light" onClick={load} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Refresh"}
            </Button>
          </div>
        </div>

        <Row>
          <StatCard label="Total customers" value={stats?.totalCustomers} color="dark" />
          <StatCard label="New today" value={stats?.newToday} color="success" />
          <StatCard label="Returning today" value={stats?.returningToday} color="primary" />
          <StatCard label="Online (15m)" value={stats?.onlineWindow} color="info" />
          <StatCard label="Logins today" value={stats?.loginsToday} color="secondary" />
          <StatCard label="Failed today" value={stats?.failedToday} color="danger" />
        </Row>

        <Card>
          <CardBody>
            <div className="d-flex gap-2 flex-wrap mb-3">
              <Input
                type="text"
                placeholder="Filter by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 280 }}
              />
              <Input
                type="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ maxWidth: 200 }}
              >
                <option value="">All activity</option>
                <option value="new">New users only</option>
                <option value="returning">Returning users only</option>
                <option value="failed">Failed logins only</option>
              </Input>
            </div>

            <div className="table-responsive">
              <Table className="align-middle table-nowrap mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Activity</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>When</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, idx) => {
                    const meta = TYPE_META[e.type] || { label: e.type, color: "secondary" };
                    const loc = e.location;
                    const locStr = loc
                      ? [loc.city, loc.country].filter(Boolean).join(", ")
                      : null;
                    return (
                      <tr key={e._id || `${e.at}-${idx}`}>
                        <td>
                          <div className="fw-semibold">
                            {e.customer?.name || "—"}
                            {e.isNewUser && <Badge color="success" className="ms-1">New</Badge>}
                          </div>
                          <div className="text-muted small">{e.customer?.email || "—"}</div>
                        </td>
                        <td>
                          <Badge color={meta.color}>{meta.label}</Badge>
                          {e.type === "LOGIN_FAILED" && e.failureReason && (
                            <div className="text-danger small mt-1">{e.failureReason}</div>
                          )}
                        </td>
                        <td className="small">
                          {e.device?.browser || e.device?.os ? (
                            <span>
                              {[e.device?.browser, e.device?.os].filter(Boolean).join(" · ")}
                              {e.device?.deviceType && e.device.deviceType !== "unknown" && (
                                <span className="text-muted"> ({e.device.deviceType})</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="small">
                          {locStr ? (
                            <span>
                              {locStr}
                              {e.isVpn && <Badge color="warning" className="ms-1">VPN</Badge>}
                            </span>
                          ) : (
                            <span className="text-muted">{e.ip || "—"}</span>
                          )}
                        </td>
                        <td className="small text-muted" title={e.at}>{timeAgo(e.at)}</td>
                        <td>
                          {e.customer?.email && (
                            <Button
                              color="primary"
                              size="sm"
                              outline
                              onClick={() =>
                                navigate(`/admin-ops/customer-console?email=${encodeURIComponent(e.customer.email)}`)
                              }
                            >
                              360° view
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        {connected ? "Waiting for customer activity…" : "No activity to show yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default LiveCustomerActivity;
