import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Container, Table, Spinner, Button, Input, Label, Badge,
  Modal, ModalHeader, ModalBody,
} from "reactstrap";
import { getAuditLog } from "helpers/admin_ops_helper";

const ENTITY_COLORS = {
  coupon: "info", markup: "primary", "variant-pricing": "warning",
  variant: "secondary", settings: "dark", "tylcash-admin": "success",
  "globaltix-pricing": "primary", agents: "danger",
};

const ACTION_COLORS = { create: "success", update: "warning", delete: "danger", other: "secondary" };

/**
 * Who changed which price/coupon/markup/discount/setting, and when.
 * Every successful admin mutation on revenue-sensitive entities lands here.
 */
const AuditLog = () => {
  document.title = "Audit Log | TickYourList";
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [actor, setActor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [payloadView, setPayloadView] = useState(null);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLog({
        page, limit,
        ...(entity && { entity }),
        ...(actor && { actor }),
        ...(from && { from }),
        ...(to && { to }),
      });
      setItems(res?.data?.items || []);
      setTotal(res?.data?.total || 0);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, entity, actor, from, to]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Admin Audit Log</h4>
          <Badge color="light" className="text-muted fs-6">{total} entries</Badge>
        </div>

        <Card>
          <CardBody className="d-flex flex-wrap align-items-end gap-3">
            <div>
              <Label className="mb-1">Area</Label>
              <Input type="select" value={entity} onChange={(e) => { setPage(1); setEntity(e.target.value); }}>
                <option value="">All</option>
                {Object.keys(ENTITY_COLORS).map((k) => <option key={k} value={k}>{k}</option>)}
              </Input>
            </div>
            <div>
              <Label className="mb-1">Admin email</Label>
              <Input placeholder="admin@…" value={actor} onChange={(e) => { setPage(1); setActor(e.target.value); }} />
            </div>
            <div>
              <Label className="mb-1">From</Label>
              <Input type="date" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value); }} />
            </div>
            <div>
              <Label className="mb-1">To</Label>
              <Input type="date" value={to} onChange={(e) => { setPage(1); setTo(e.target.value); }} />
            </div>
            <Button color="primary" onClick={load} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Refresh"}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Area</th>
                  <th>Action</th>
                  <th>Path</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id}>
                    <td className="text-nowrap">{new Date(it.createdAt).toLocaleString()}</td>
                    <td>{it.actorEmail || it.actorName || <span className="text-muted">unknown</span>}</td>
                    <td><Badge color={ENTITY_COLORS[it.entity] || "secondary"}>{it.entity}</Badge></td>
                    <td><Badge color={ACTION_COLORS[it.action] || "secondary"} pill>{it.action}</Badge></td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}><code className="small">{it.method} {it.path}</code></td>
                    <td>
                      {it.payload ? (
                        <Button size="sm" color="light" onClick={() => setPayloadView(it)}>View</Button>
                      ) : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No audit entries match these filters.</td></tr>
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center">
              <Button color="light" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
              <span className="text-muted small">Page {page} of {pages}</span>
              <Button color="light" disabled={page >= pages || loading} onClick={() => setPage((p) => p + 1)}>Next →</Button>
            </div>
          </CardBody>
        </Card>

        <Modal isOpen={!!payloadView} toggle={() => setPayloadView(null)} size="lg">
          <ModalHeader toggle={() => setPayloadView(null)}>
            {payloadView?.entity} · {payloadView?.action} · {payloadView && new Date(payloadView.createdAt).toLocaleString()}
          </ModalHeader>
          <ModalBody>
            <div className="small text-muted mb-2">{payloadView?.method} {payloadView?.path}</div>
            <pre className="bg-light rounded p-3 small" style={{ maxHeight: 420, overflow: "auto" }}>
              {payloadView && JSON.stringify(payloadView.payload, null, 2)}
            </pre>
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default AuditLog;
