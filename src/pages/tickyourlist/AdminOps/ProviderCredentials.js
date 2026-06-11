import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Container, Table, Spinner, Button, Input, Label, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup,
} from "reactstrap";
import { getProviderCredentials, saveProviderCredentials, toggleProviderCredentials } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const PROVIDERS = ["REZDY_OCTO", "VENTRATA", "KLOOK_OCTO", "OCTO_NATIVE", "BOKUN_OCTO", "KLOOK_AGENT", "BOKUN", "GLOBALTIX"];
const ENVIRONMENTS = ["sandbox", "production"];

/**
 * Generic supplier API credentials: one row per provider+environment.
 * OCTO-dialect suppliers (Rezdy/Ventrata/Klook-OCTO) go live the moment an
 * active row exists — no code change. Keys are shown masked.
 */
const ProviderCredentials = () => {
  document.title = "Provider Credentials | TickYourList";
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [form, setForm] = useState({ provider: "REZDY_OCTO", environment: "sandbox", endpoint: "", apiKey: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProviderCredentials();
      setItems(res?.data?.items || []);
    } catch {
      showToastError("Could not load credentials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.endpoint.trim() || !form.apiKey.trim()) {
      showToastError("Endpoint and API key are required");
      return;
    }
    setSaving(true);
    try {
      await saveProviderCredentials(form);
      showToastSuccess(`${form.provider} (${form.environment}) credentials saved`);
      setOpen(false);
      setForm({ provider: "REZDY_OCTO", environment: "sandbox", endpoint: "", apiKey: "" });
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item) => {
    setTogglingId(item._id);
    try {
      await toggleProviderCredentials(item._id);
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Toggle failed");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Provider Credentials</h4>
          <Button color="primary" onClick={() => setOpen(true)}>+ Add / update credentials</Button>
        </div>

        <Card>
          <CardBody>
            <p className="text-muted small mb-3">
              One row per supplier + environment. OCTO suppliers (Rezdy, Ventrata, Klook-OCTO) start working
              the moment an <strong>active</strong> row exists — products can then be mapped per variant from
              Variant Management. Keys are stored server-side and shown masked here.
            </p>
            {loading ? (
              <div className="text-center py-5"><Spinner /></div>
            ) : (
              <Table responsive hover className="align-middle">
                <thead>
                  <tr><th>Provider</th><th>Environment</th><th>Endpoint</th><th>API key</th><th>Status</th><th className="text-end">Actions</th></tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.provider}</strong></td>
                      <td><Badge color={c.environment === "production" ? "danger" : "secondary"}>{c.environment}</Badge></td>
                      <td className="text-truncate" style={{ maxWidth: 280 }}><code className="small">{c.endpoint}</code></td>
                      <td><code className="small">{c.apiKey}</code></td>
                      <td>{c.isActive ? <Badge color="success">Active</Badge> : <Badge color="secondary">Disabled</Badge>}</td>
                      <td className="text-end">
                        <Button size="sm" color={c.isActive ? "outline-danger" : "outline-success"}
                          disabled={togglingId === c._id} onClick={() => toggle(c)}>
                          {togglingId === c._id ? <Spinner size="sm" /> : c.isActive ? "Disable" : "Enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No supplier credentials yet — add your first above.</td></tr>
                  )}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={open} toggle={() => !saving && setOpen(false)}>
          <ModalHeader toggle={() => setOpen(false)}>Add / update supplier credentials</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label className="small">Provider</Label>
              <Input type="select" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className="small">Environment</Label>
              <Input type="select" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
                {ENVIRONMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className="small">API endpoint (base URL)</Label>
              <Input placeholder="https://api.supplier.com/octo" value={form.endpoint}
                onChange={(e) => setForm({ ...form, endpoint: e.target.value })} />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="small">API key / bearer token</Label>
              <Input type="password" placeholder="paste the full key — stored server-side, shown masked"
                value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
              <div className="form-text">Saving overwrites any existing row for this provider+environment.</div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button color="primary" onClick={save} disabled={saving}>
              {saving ? <Spinner size="sm" /> : "Save credentials"}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default ProviderCredentials;
