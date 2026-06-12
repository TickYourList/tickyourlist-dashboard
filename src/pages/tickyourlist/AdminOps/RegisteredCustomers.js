import React, { useEffect, useState } from "react";
import {
  Badge, Button, Card, CardBody, Col, Container, Input, Row, Spinner, Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { getRegisteredCustomers } from "helpers/admin_ops_helper";
import { showToastError } from "helpers/toastBuilder";

/**
 * Directory of every registered account (verified or not): who they are, how
 * they signed up, wallet and booking footprint. Rows open the 360° Customer
 * Console for the full booking history and quick actions.
 */
const RegisteredCustomers = () => {
  document.title = "Registered Customers | TickYourList";
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await getRegisteredCustomers({
        page: p,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(verified ? { verified } : {}),
        ...(method ? { method } : {}),
      });
      setItems(res?.data?.items || []);
      setTotal(res?.data?.total || 0);
      setCounts(res?.data?.counts || null);
    } catch (err) {
      showToastError(err?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page, verified, method]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const bookingSummary = (stats) => {
    if (!stats?.length) return <span className="text-muted">—</span>;
    const bookings = stats.reduce((n, s) => n + (s.bookings || 0), 0);
    const confirmed = stats.reduce((n, s) => n + (s.confirmed || 0), 0);
    return (
      <span>
        {bookings} <span className="text-muted">({confirmed} confirmed)</span>
      </span>
    );
  };

  const spendSummary = (stats) => {
    const parts = (stats || [])
      .filter((s) => s.spend > 0)
      .map((s) => `${s._id} ${Number(s.spend).toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    return parts.length ? parts.join(" · ") : <span className="text-muted">—</span>;
  };

  const lastPage = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="mb-0">Registered Customers</h4>
          {counts && (
            <div className="d-flex gap-2">
              <Badge color="success" pill>{counts.verified} verified</Badge>
              <Badge color="warning" pill>{counts.unverified} unverified</Badge>
            </div>
          )}
        </div>

        <Card>
          <CardBody>
            <form className="d-flex gap-2 flex-wrap" onSubmit={onSearch}>
              <Input
                type="text"
                placeholder="Search name, email or referral code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <Input
                type="select"
                value={verified}
                onChange={(e) => { setVerified(e.target.value); setPage(1); }}
                style={{ maxWidth: 170 }}
              >
                <option value="">All statuses</option>
                <option value="true">Verified only</option>
                <option value="false">Unverified only</option>
              </Input>
              <Input
                type="select"
                value={method}
                onChange={(e) => { setMethod(e.target.value); setPage(1); }}
                style={{ maxWidth: 170 }}
              >
                <option value="">All signup methods</option>
                <option value="google">Google</option>
                <option value="email">Email + password</option>
              </Input>
              <Button color="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Search"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="table-responsive">
              <Table className="align-middle table-nowrap mb-0" hover>
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Signup</th>
                    <th>TylCash</th>
                    <th>Bookings</th>
                    <th>Confirmed spend</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="fw-semibold">
                          {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                          {c.isAgent && <Badge color="danger" className="ms-1">Agent</Badge>}
                        </div>
                        <div className="text-muted small">{c.email}</div>
                      </td>
                      <td className="small">
                        {c.phoneNumber ? `${c.phoneCode || ""} ${c.phoneNumber}` : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {c.verified ? <Badge color="success">Verified</Badge> : <Badge color="warning">Unverified</Badge>}
                          {!c.status && <Badge color="secondary">Inactive</Badge>}
                          {c.welcomeEmailSentAt && <Badge color="info" title="Welcome email sent">Welcomed</Badge>}
                        </div>
                      </td>
                      <td className="small">{c.googleId ? "Google" : "Email"}</td>
                      <td className="small">{Number(c.tylcashBalance || 0).toLocaleString()} TYL</td>
                      <td className="small">{bookingSummary(c.bookingStats)}</td>
                      <td className="small">{spendSummary(c.bookingStats)}</td>
                      <td className="small">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          outline
                          onClick={() =>
                            navigate(`/admin-ops/customer-console?email=${encodeURIComponent(c.email)}`)
                          }
                        >
                          360° view
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!items.length && !loading && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        No customers match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted small">
                {total.toLocaleString()} customer{total === 1 ? "" : "s"} · page {page} of {lastPage}
              </span>
              <div className="d-flex gap-2">
                <Button size="sm" color="light" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
                  ← Prev
                </Button>
                <Button size="sm" color="light" disabled={page >= lastPage || loading} onClick={() => setPage(page + 1)}>
                  Next →
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default RegisteredCustomers;
