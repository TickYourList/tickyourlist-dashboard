import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Container, Row, Spinner, Badge, Button } from "reactstrap";
import { getAutomationsHealth } from "helpers/admin_ops_helper";

/**
 * At-a-glance proof that the background automations are alive:
 * abandoned-checkout recovery, review requests, waitlist notifier,
 * pending-capacity expiry, gift card sales.
 */
const AutomationsHealth = () => {
  document.title = "Automations | TickYourList";
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAutomationsHealth();
      setData(res?.data || null);
      setLoadedAt(new Date());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = data ? [
    {
      title: "Abandoned-checkout recovery",
      schedule: "every 15 min · 1–24h window",
      rows: [
        ["Emails sent (24h)", data.abandonedRecovery?.sent24h],
        ["Emails sent (7d)", data.abandonedRecovery?.sent7d],
        ["Due right now", data.abandonedRecovery?.dueNow, data.abandonedRecovery?.dueNow > 20 ? "danger" : null],
      ],
      note: "\"Due right now\" should hover near zero — a growing number means the job isn't running.",
    },
    {
      title: "Post-visit review requests",
      schedule: "daily 10:00",
      rows: [
        ["Sent (24h)", data.reviewRequests?.sent24h],
        ["Sent (7d)", data.reviewRequests?.sent7d],
      ],
      note: "Zero for a week while you have past confirmed visits = check the job.",
    },
    {
      title: "Waitlist notifier",
      schedule: "hourly",
      rows: [
        ["Customers waiting", data.waitlist?.waiting],
        ["Notified (7d)", data.waitlist?.notified7d],
      ],
      note: "Waiting counts are demand, not errors — see the Waitlist page for which dates.",
    },
    {
      title: "Pending-capacity expiry",
      schedule: "hourly · 24h threshold",
      rows: [["Stale holds released (7d)", data.capacityExpiry?.released7d]],
      note: "Returns seats held by checkouts that never paid.",
    },
    {
      title: "Gift cards",
      schedule: "—",
      rows: [["Sold (7d)", data.giftCards?.sold7d]],
      note: "Paid or redeemed cards created in the last 7 days.",
    },
  ] : [];

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Automations health</h4>
          <div className="d-flex align-items-center gap-2">
            {loadedAt && <span className="text-muted small">as of {loadedAt.toLocaleTimeString()}</span>}
            <Button color="primary" size="sm" onClick={load} disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Refresh"}
            </Button>
          </div>
        </div>

        <Row>
          {cards.map((c) => (
            <Col md={6} xl={4} key={c.title}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0">{c.title}</h6>
                    <Badge color="light" className="text-muted">{c.schedule}</Badge>
                  </div>
                  <div className="mt-3">
                    {c.rows.map(([label, value, tone]) => (
                      <div key={label} className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{label}</span>
                        <Badge color={tone || (Number(value) > 0 ? "primary" : "light")} className={!tone && !(Number(value) > 0) ? "text-muted" : ""} pill>
                          {value ?? "—"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="text-muted mt-2" style={{ fontSize: 11 }}>{c.note}</div>
                </CardBody>
              </Card>
            </Col>
          ))}
          {!loading && !data && (
            <Col><Card><CardBody className="text-center text-muted py-4">Could not load automation stats.</CardBody></Card></Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default AutomationsHealth;
