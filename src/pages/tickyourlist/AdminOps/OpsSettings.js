import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Col, Container, Row, Spinner, Button, Input, Label, Badge, FormGroup,
} from "reactstrap";
import { getOpsConfigSettings, updateOpsConfigSettings } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const EMAIL_KEYS = [
  { key: "reviewRequest", label: "Post-visit review request", vars: "{{customerName}} {{tourName}} {{url}}" },
  { key: "waitlist", label: "Waitlist — spots opened up", vars: "{{customerName}} {{tourName}} {{date}} {{url}}" },
  { key: "priceDrop", label: "Wishlist price drop", vars: "{{customerName}} {{tourName}} {{oldPrice}} {{newPrice}} {{dropPct}} {{url}}" },
  { key: "amendment", label: "Booking date changed", vars: "{{customerName}} {{tourName}} {{oldDate}} {{newDate}} {{newTime}}" },
  { key: "giftCard", label: "Gift card delivery", vars: "{{recipientName}} {{purchaserEmail}} {{code}} {{amountTYL}} {{message}}" },
];

const TOGGLES = [
  ["abandonedRecoveryEnabled", "Abandoned-checkout recovery emails"],
  ["reviewRequestEnabled", "Post-visit review requests"],
  ["waitlistNotificationsEnabled", "Waitlist availability notifier"],
  ["priceDropAlertsEnabled", "Wishlist price-drop alerts"],
  ["velocityGuardEnabled", "Booking velocity fraud guard"],
];

/**
 * Runtime knobs without a deploy: loyalty/referral economics, fraud limits,
 * automation on/off, provider routing, and transactional email copy.
 * Empty field = env var / code default. Changes take effect within ~1 minute.
 */
const OpsSettings = () => {
  document.title = "Settings | TickYourList";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState({});
  const [emailKey, setEmailKey] = useState(EMAIL_KEYS[0].key);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpsConfigSettings();
      setCfg(res?.data?.config || {});
    } catch {
      showToastError("Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateOpsConfigSettings(cfg);
      setCfg(res?.data?.config || cfg);
      showToastSuccess("Saved — live within a minute", "Settings updated");
    } catch (e) {
      showToastError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setCfg((p) => ({ ...p, [k]: v }));
  const ov = cfg.emailOverrides?.[emailKey] || {};
  const setOv = (field, value) =>
    setCfg((p) => ({
      ...p,
      emailOverrides: { ...(p.emailOverrides || {}), [emailKey]: { ...(p.emailOverrides?.[emailKey] || {}), [field]: value } },
    }));
  const activeMeta = EMAIL_KEYS.find((e) => e.key === emailKey);

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Business Settings</h4>
          <Button color="primary" onClick={save} disabled={saving || loading}>
            {saving ? <Spinner size="sm" /> : "Save all"}
          </Button>
        </div>
        <p className="text-muted small">
          Empty field = server default. Everything here takes effect within a minute — no deploy needed.
        </p>

        {loading ? (
          <div className="text-center py-5"><Spinner /></div>
        ) : (
          <Row>
            <Col lg={4}>
              <Card>
                <CardBody>
                  <h6 className="mb-3">Rewards & loyalty</h6>
                  <FormGroup>
                    <Label className="small">Loyalty tiers <span className="text-muted">(bookings:multiplier, e.g. 3:1.25,7:1.5 — or “off”)</span></Label>
                    <Input value={cfg.loyaltyTiers ?? ""} placeholder="3:1.25,7:1.5"
                      onChange={(e) => set("loyaltyTiers", e.target.value)} />
                  </FormGroup>
                  <FormGroup>
                    <Label className="small">Referrer reward (TYL)</Label>
                    <Input type="number" value={cfg.referralRewardTYL ?? ""} placeholder="10"
                      onChange={(e) => set("referralRewardTYL", e.target.value === "" ? undefined : Number(e.target.value))} />
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label className="small">Referee welcome reward (TYL)</Label>
                    <Input type="number" value={cfg.refereeRewardTYL ?? ""} placeholder="0 (off)"
                      onChange={(e) => set("refereeRewardTYL", e.target.value === "" ? undefined : Number(e.target.value))} />
                  </FormGroup>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h6 className="mb-3">Fraud limits</h6>
                  <FormGroup>
                    <Label className="small">Max bookings per IP / 10 min</Label>
                    <Input type="number" value={cfg.velocityMaxPerIp10m ?? ""} placeholder="5"
                      onChange={(e) => set("velocityMaxPerIp10m", e.target.value === "" ? undefined : Number(e.target.value))} />
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label className="small">Max bookings per email / hour</Label>
                    <Input type="number" value={cfg.velocityMaxPerEmail1h ?? ""} placeholder="8"
                      onChange={(e) => set("velocityMaxPerEmail1h", e.target.value === "" ? undefined : Number(e.target.value))} />
                  </FormGroup>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h6 className="mb-3">Provider routing</h6>
                  <Input type="select" value={cfg.providerRouting ?? "LEAST_COST"}
                    onChange={(e) => set("providerRouting", e.target.value)}>
                    <option value="LEAST_COST">Least cost — cheapest B2B nett wins</option>
                    <option value="PRIORITY">Priority — manual order wins</option>
                  </Input>
                  <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                    Applies when several suppliers are mapped to the same product/variant.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h6 className="mb-3">Automations on/off</h6>
                  {TOGGLES.map(([k, label]) => (
                    <div key={k} className="form-check form-switch mb-2">
                      <Input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={k}
                        checked={cfg[k] !== false}
                        onChange={(e) => set(k, e.target.checked)}
                      />
                      <Label className="form-check-label small" htmlFor={k}>{label}</Label>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>

            <Col lg={8}>
              <Card>
                <CardBody>
                  <h6 className="mb-1">Email copy</h6>
                  <p className="text-muted small mb-3">
                    Override the subject/body of the automated customer emails. Leave empty to use the built-in copy.
                  </p>
                  <div className="d-flex gap-1 flex-wrap mb-3">
                    {EMAIL_KEYS.map((e) => (
                      <Button key={e.key} size="sm"
                        color={emailKey === e.key ? "primary" : "light"}
                        onClick={() => setEmailKey(e.key)}>
                        {e.label}
                        {cfg.emailOverrides?.[e.key]?.subject || cfg.emailOverrides?.[e.key]?.html
                          ? <Badge color="warning" className="ms-1" pill>custom</Badge> : null}
                      </Button>
                    ))}
                  </div>
                  <div className="small text-muted mb-2">Available placeholders: <code>{activeMeta?.vars}</code></div>
                  <FormGroup>
                    <Label className="small">Subject override</Label>
                    <Input value={ov.subject || ""} placeholder="(using built-in subject)"
                      onChange={(e) => setOv("subject", e.target.value)} />
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label className="small">HTML body override</Label>
                    <Input type="textarea" rows={12} value={ov.html || ""}
                      placeholder="(using built-in body) — full HTML with {{placeholders}}"
                      onChange={(e) => setOv("html", e.target.value)}
                      style={{ fontFamily: "monospace", fontSize: 12 }} />
                  </FormGroup>
                  <div className="d-flex justify-content-end mt-2">
                    <Button size="sm" color="outline-danger"
                      onClick={() => setCfg((p) => ({ ...p, emailOverrides: { ...(p.emailOverrides || {}), [emailKey]: {} } }))}>
                      Reset this email to built-in copy
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default OpsSettings;
