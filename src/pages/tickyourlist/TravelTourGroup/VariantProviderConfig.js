import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Badge, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Row, Col, Alert, Spinner,
} from "reactstrap";
import {
  fetchProviderConfigsRequest,
  createProviderConfigRequest,
  updateProviderConfigRequest,
  deleteProviderConfigRequest,
  fetchSupportedProvidersRequest,
} from "../../../store/tickyourlist/providerConfig/action";

const ROLE_COLORS = { AVAILABILITY: "info", PRICING: "warning", BOOKING: "success" };
const ENV_COLORS = { staging: "secondary", sandbox: "secondary", production: "danger" };

const EMPTY_FORM = {
  provider: "GLOBALTIX",
  environment: "staging",
  roles: ["AVAILABILITY", "PRICING", "BOOKING"],
  externalProductId: "",
  externalVariantId: "",
  externalTicketTypeId: "",
  nettPriceSGD: "",
  recommendedPriceSGD: "",
  priority: 1,
  syncEnabled: true,
};

const VariantProviderConfig = ({ variantId, tourGroupId, variantName }) => {
  const dispatch = useDispatch();
  const { configs, configsLoading, configsError, createLoading, updateLoading, deleteLoading, supportedProviders } =
    useSelector((s) => s.providerConfig);

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (variantId) {
      dispatch(fetchProviderConfigsRequest({ variantId }));
      dispatch(fetchSupportedProvidersRequest());
    }
  }, [variantId]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (cfg) => {
    setForm({
      provider: cfg.provider,
      environment: cfg.environment || "staging",
      roles: cfg.roles || ["AVAILABILITY", "PRICING", "BOOKING"],
      externalProductId: cfg.externalProductId || "",
      externalVariantId: cfg.externalVariantId || "",
      externalTicketTypeId: cfg.externalTicketTypeId || "",
      nettPriceSGD: cfg.nettPriceSGD || "",
      recommendedPriceSGD: cfg.recommendedPriceSGD || "",
      priority: cfg.priority || 1,
      syncEnabled: cfg.syncEnabled !== false,
    });
    setEditingId(cfg._id);
    setModal(true);
  };

  const handleRoleToggle = (role) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const handleSubmit = () => {
    if (!form.provider || !form.externalProductId || !form.roles.length) return;

    const payload = {
      tourGroupId,
      variantId,
      provider: form.provider,
      environment: form.environment,
      roles: form.roles,
      externalProductId: form.externalProductId,
      externalVariantId: form.externalVariantId || undefined,
      externalTicketTypeId: form.externalTicketTypeId || undefined,
      nettPriceSGD: form.nettPriceSGD ? parseFloat(form.nettPriceSGD) : undefined,
      recommendedPriceSGD: form.recommendedPriceSGD ? parseFloat(form.recommendedPriceSGD) : undefined,
      priority: parseInt(form.priority) || 1,
      syncEnabled: form.syncEnabled,
    };

    if (editingId) {
      dispatch(updateProviderConfigRequest(editingId, payload, () => setModal(false)));
    } else {
      dispatch(createProviderConfigRequest(payload, () => setModal(false)));
    }
  };

  const handleToggleActive = (cfg) => {
    dispatch(updateProviderConfigRequest(cfg._id, { isActive: !cfg.isActive }));
  };

  const handleDelete = (id) => {
    dispatch(deleteProviderConfigRequest(id, () => setConfirmDeleteId(null)));
  };

  const implementedProviders = supportedProviders.filter((p) => p.implemented).map((p) => p.provider);

  return (
    <div className="provider-config-panel">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0 fw-semibold">
          <i className="bx bx-plug me-1" />
          Provider Connections
          {variantName && <small className="text-muted ms-2">— {variantName}</small>}
        </h6>
        <Button color="primary" size="sm" onClick={openCreate}>
          <i className="bx bx-plus me-1" />
          Add Provider
        </Button>
      </div>

      {configsError && <Alert color="danger" className="py-2 mb-2">{configsError}</Alert>}

      {configsLoading ? (
        <div className="text-center py-3"><Spinner size="sm" /></div>
      ) : configs.length === 0 ? (
        <div className="text-center py-4 text-muted border rounded bg-light">
          <i className="bx bx-unlink" style={{ fontSize: 32, opacity: 0.4 }} />
          <p className="mt-2 mb-1 small fw-semibold">No providers connected</p>
          <p className="small mb-0">Add a provider to enable availability, pricing, or booking for this variant.</p>
        </div>
      ) : (
        <Table size="sm" bordered responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Provider</th>
              <th>Env</th>
              <th>Roles</th>
              <th>External IDs</th>
              <th>Nett SGD</th>
              <th>Priority</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg._id} className={!cfg.isActive ? "opacity-50" : ""}>
                <td>
                  <span className="fw-semibold">{cfg.provider}</span>
                </td>
                <td>
                  <Badge color={ENV_COLORS[cfg.environment] || "secondary"} className="text-uppercase">
                    {cfg.environment}
                  </Badge>
                </td>
                <td>
                  {(cfg.roles || []).map((r) => (
                    <Badge key={r} color={ROLE_COLORS[r]} className="me-1 text-uppercase" pill>
                      {r}
                    </Badge>
                  ))}
                </td>
                <td className="small text-muted">
                  <div>Prod: <strong>{cfg.externalProductId}</strong></div>
                  {cfg.externalVariantId && <div>Opt: {cfg.externalVariantId}</div>}
                  {cfg.externalTicketTypeId && <div>TT: {cfg.externalTicketTypeId}</div>}
                </td>
                <td className="small">
                  {cfg.nettPriceSGD != null ? `SGD ${cfg.nettPriceSGD}` : "—"}
                </td>
                <td className="text-center">{cfg.priority}</td>
                <td className="text-center">
                  <div className="form-check form-switch d-inline-block">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={cfg.isActive}
                      onChange={() => handleToggleActive(cfg)}
                      disabled={updateLoading}
                    />
                  </div>
                </td>
                <td>
                  <Button color="outline-secondary" size="sm" className="me-1 py-0" onClick={() => openEdit(cfg)}>
                    <i className="bx bx-edit-alt" />
                  </Button>
                  <Button color="outline-danger" size="sm" className="py-0" onClick={() => setConfirmDeleteId(cfg._id)}>
                    <i className="bx bx-trash" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">
        <ModalHeader toggle={() => setModal(false)}>
          {editingId ? "Edit Provider Config" : "Add Provider Config"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Provider *</Label>
                  <Input type="select" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                    {implementedProviders.length > 0
                      ? implementedProviders.map((p) => <option key={p}>{p}</option>)
                      : ["GLOBALTIX", "KLOOK_AGENT", "BOKUN", "BOKUN_OCTO", "OCTO_NATIVE"].map((p) => <option key={p}>{p}</option>)
                    }
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Environment *</Label>
                  <Input type="select" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
                    <option value="staging">Staging</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Production</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label>Roles (select all that apply) *</Label>
              <div className="d-flex gap-3">
                {["AVAILABILITY", "PRICING", "BOOKING"].map((role) => (
                  <div key={role} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`role-${role}`}
                      checked={form.roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                    />
                    <label className="form-check-label" htmlFor={`role-${role}`}>
                      <Badge color={ROLE_COLORS[role]} pill>{role}</Badge>
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted">
                AVAILABILITY = dates & timeslots · PRICING = cost tracking · BOOKING = reserve/confirm/cancel
              </small>
            </FormGroup>

            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>External Product ID *</Label>
                  <Input
                    value={form.externalProductId}
                    onChange={(e) => setForm({ ...form, externalProductId: e.target.value })}
                    placeholder="e.g. 256012"
                  />
                  <small className="text-muted">Globaltix product ID / Klook activity ID</small>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>External Option/Variant ID</Label>
                  <Input
                    value={form.externalVariantId}
                    onChange={(e) => setForm({ ...form, externalVariantId: e.target.value })}
                    placeholder="e.g. 1"
                  />
                  <small className="text-muted">Globaltix option ID</small>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>External Ticket Type ID</Label>
                  <Input
                    value={form.externalTicketTypeId}
                    onChange={(e) => setForm({ ...form, externalTicketTypeId: e.target.value })}
                    placeholder="e.g. 12345"
                  />
                  <small className="text-muted">Used for availability checks</small>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>Nett Price (SGD)</Label>
                  <Input
                    type="number"
                    value={form.nettPriceSGD}
                    onChange={(e) => setForm({ ...form, nettPriceSGD: e.target.value })}
                    placeholder="e.g. 28.00"
                  />
                  <small className="text-muted">Your buy rate — internal only</small>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Recommended Sell Price (SGD)</Label>
                  <Input
                    type="number"
                    value={form.recommendedPriceSGD}
                    onChange={(e) => setForm({ ...form, recommendedPriceSGD: e.target.value })}
                    placeholder="e.g. 35.00"
                  />
                  <small className="text-muted">Provider's recommended sell price</small>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  />
                  <small className="text-muted">Lower = higher priority (1 = top)</small>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup check>
              <Input
                type="checkbox"
                id="syncEnabled"
                checked={form.syncEnabled}
                onChange={(e) => setForm({ ...form, syncEnabled: e.target.checked })}
              />
              <Label check htmlFor="syncEnabled">Enable price sync from this provider</Label>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={createLoading || updateLoading || !form.provider || !form.externalProductId || !form.roles.length}
          >
            {(createLoading || updateLoading) ? <Spinner size="sm" /> : editingId ? "Save Changes" : "Add Provider"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!confirmDeleteId} toggle={() => setConfirmDeleteId(null)} size="sm">
        <ModalHeader toggle={() => setConfirmDeleteId(null)}>Remove Provider</ModalHeader>
        <ModalBody>Are you sure you want to remove this provider mapping?</ModalBody>
        <ModalFooter>
          <Button color="secondary" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDelete(confirmDeleteId)}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" /> : "Remove"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default VariantProviderConfig;
