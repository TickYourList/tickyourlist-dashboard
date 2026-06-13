import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Table,
  Select,
  Switch,
  Statistic,
  Tooltip,
  message,
  Spin,
  InputNumber,
  Input,
  Collapse,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { get, post, put } from "../../helpers/api_helper";

// Plain-language meaning for each tunable setting + glossary term.
const SETTING_FIELDS = [
  {
    key: "rateRefreshIntervalMinutes",
    label: "Auto-refresh interval (minutes)",
    type: "number",
    help: "How often we automatically fetch fresh exchange rates from the provider. FX rates change roughly once a day, so 720 (12 hours) is plenty. Lower = fresher rates but uses more of your monthly API quota.",
  },
  {
    key: "rateCacheTtlSeconds",
    label: "Rate cache duration (seconds)",
    type: "number",
    help: "How long a fetched rate is reused before we fetch a new one. Keep this at or above the refresh interval, otherwise normal customer traffic triggers extra API calls. 43200 = 12 hours.",
  },
  {
    key: "rateRefreshEnabled",
    label: "Auto-refresh enabled",
    type: "switch",
    help: "Master switch for the scheduled refresh. If off, rates only update when a customer request finds the cache expired (lazy). Leave on.",
  },
  {
    key: "alertEmails",
    label: "Alert email recipients",
    type: "text",
    help: "Who gets emailed if currency conversion stops working (provider down, or monthly quota used up). Comma-separated list of emails.",
  },
  {
    key: "alertCooldownSeconds",
    label: "Alert cooldown (seconds)",
    type: "number",
    help: "Minimum gap between repeat alert emails, so a single outage doesn't flood your inbox. 3600 = at most one alert per hour.",
  },
  {
    key: "maxDeviationPercent",
    label: "Max rate deviation (%)",
    type: "number",
    help: "Safety check: reject a freshly fetched rate if it jumped more than this % versus the last known-good value. Protects against corrupted provider data breaking every price. 10 = 10%.",
  },
  {
    key: "monthlyQuota",
    label: "Monthly API quota",
    type: "number",
    help: "Your FX provider's monthly request budget. We email a warning when usage crosses 80% of this, so you can act before it runs out (the free plan is ~1500/month).",
  },
];

const GLOSSARY = [
  ["Refresh FX rates now", "Manually fetch the latest exchange rates from the provider immediately, instead of waiting for the schedule."],
  ["Run alignment now", "Recalculate every own-product's price in all currencies from its USD base price, using the latest rates. This normally runs automatically every night."],
  ["Exchange Rate Refresh", "The background job that pulls fresh exchange rates from the provider and caches them."],
  ["Currency Alignment", "The background job that rewrites each product's stored per-currency prices so they match the latest rates."],
  ["Healthy / Overdue / Stuck", "Healthy = the job ran successfully recently. Overdue = it hasn't succeeded within its expected window. Stuck = a run started but never finished (usually a crash)."],
  ["FX cache fresh / stale", "Whether the cached exchange rates are still within their cache duration. Stale means a refresh is due."],
  ["Last known-good", "The most recent set of valid rates we saved. If the provider goes down, we serve these instead of wrong (USD-only) prices."],
  ["Quota", "How many requests you've made to the FX provider this month, against your monthly budget."],
];

const BASE = "/v1/admin/currency-jobs";

const STATUS_COLOR = {
  SUCCESS: "green",
  PARTIAL: "gold",
  FAILED: "red",
  RUNNING: "blue",
};

const JOB_LABEL = {
  EXCHANGE_RATE_REFRESH: "Exchange Rate Refresh",
  CURRENCY_ALIGNMENT: "Currency Alignment",
};

const JOB_ICON = {
  EXCHANGE_RATE_REFRESH: <DollarOutlined />,
  CURRENCY_ALIGNMENT: <AppstoreOutlined />,
};

const fmtTime = (t) => (t ? new Date(t).toLocaleString() : "—");
const fmtDur = (ms) => {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return s < 60 ? `${s.toFixed(1)}s` : `${(s / 60).toFixed(1)}m`;
};
const ago = (t) => {
  if (!t) return "never";
  const m = (Date.now() - new Date(t).getTime()) / 60000;
  if (m < 60) return `${Math.round(m)}m ago`;
  const h = m / 60;
  return h < 24 ? `${h.toFixed(1)}h ago` : `${(h / 24).toFixed(1)}d ago`;
};

const HealthBadge = ({ job }) => {
  if (job.isStuck) return <Tag color="red">STUCK</Tag>;
  if (job.isOverdue) return <Tag color="gold">OVERDUE</Tag>;
  if (job.healthy) return <Tag color="green">HEALTHY</Tag>;
  return <Tag>UNKNOWN</Tag>;
};

const CurrencyJobs = () => {
  const [summary, setSummary] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [filters, setFilters] = useState({ jobType: "", status: "" });
  const [auto, setAuto] = useState(false);
  const [settings, setSettings] = useState(null);
  const [bounds, setBounds] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [rateHistory, setRateHistory] = useState([]);
  const timerRef = useRef(null);

  const loadSummary = useCallback(async () => {
    try {
      const res = await get(`${BASE}/summary`);
      setSummary(res?.data || res);
    } catch (e) {
      message.error(`Summary failed: ${e?.response?.data?.message || e.message}`);
    }
  }, []);

  const loadRuns = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "25" });
      if (filters.jobType) params.set("jobType", filters.jobType);
      if (filters.status) params.set("status", filters.status);
      const res = await get(`${BASE}/runs?${params.toString()}`);
      setRuns((res?.data || res)?.runs || []);
    } catch (e) {
      message.error(`Runs failed: ${e?.response?.data?.message || e.message}`);
    }
  }, [filters]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await get(`${BASE}/settings`);
      const d = res?.data || res;
      setSettings(d.settings);
      setBounds(d.bounds || {});
    } catch (e) {
      // settings are non-critical for the monitor view; don't spam
      console.warn("settings load failed", e?.message);
    }
  }, []);

  const loadRateHistory = useCallback(async () => {
    try {
      const res = await get(`${BASE}/rate-history?currency=INR&limit=20`);
      setRateHistory((res?.data || res)?.history || []);
    } catch (e) {
      console.warn("rate history load failed", e?.message);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSummary(), loadRuns(), loadSettings(), loadRateHistory()]);
    setLoading(false);
  }, [loadSummary, loadRuns, loadSettings, loadRateHistory]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await put(`${BASE}/settings`, settings);
      message.success("Settings saved — effective within ~1 minute");
      loadSettings();
    } catch (e) {
      message.error(`Save failed: ${e?.response?.data?.message || e.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const setField = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (auto) {
      timerRef.current = setInterval(loadAll, 30000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [auto, loadAll]);

  const runExchangeRefresh = async () => {
    setBusy("fx");
    try {
      const res = await post(`${BASE}/run/exchange-refresh`, {});
      const d = res?.data || res;
      message.success(`FX refreshed: ${d.ratesCount} rates (${d.source})`);
    } catch (e) {
      message.error(`FX refresh failed: ${e?.response?.data?.message || e.message}`);
    } finally {
      setBusy("");
      loadAll();
    }
  };

  const runAlignment = async () => {
    setBusy("align");
    try {
      await post(`${BASE}/run/alignment`, {});
      message.success("Alignment started — watch the run history below");
    } catch (e) {
      message.error(`Alignment failed to start: ${e?.response?.data?.message || e.message}`);
    } finally {
      setBusy("");
      setTimeout(loadAll, 1500);
    }
  };

  const columns = [
    {
      title: "Job",
      dataIndex: "jobType",
      render: (v) => (
        <span>
          {JOB_ICON[v]} {JOB_LABEL[v] || v}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => <Tag color={STATUS_COLOR[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Trigger",
      dataIndex: "trigger",
      render: (v) => <Tag>{v}</Tag>,
    },
    { title: "Started", dataIndex: "startedAt", render: fmtTime },
    { title: "Duration", dataIndex: "durationMs", render: fmtDur },
    {
      title: "Result",
      render: (_, r) => {
        const detail =
          r.jobType === "CURRENCY_ALIGNMENT"
            ? `${r.updated ?? "—"} updated / ${r.scanned ?? "—"} scanned${
                r.errorCount ? `, ${r.errorCount} err` : ""
              }`
            : `${r.ratesCount ?? "—"} rates${r.ratesSource ? ` · ${r.ratesSource}` : ""}${
                r.apiErrorType ? ` · ${r.apiErrorType}` : ""
              }`;
        return (
          <span>
            {detail}
            {r.errorMessage && (
              <div style={{ color: "#c0392b", fontSize: 12 }}>{r.errorMessage}</div>
            )}
          </span>
        );
      },
    },
    {
      title: "Alert",
      dataIndex: "alertSent",
      render: (v) => (v ? <Tooltip title="Failure email sent">📧</Tooltip> : "—"),
    },
  ];

  return (
    <div className="page-content" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h4 style={{ margin: 0 }}>Currency Jobs Monitor</h4>
          <div style={{ color: "#888", fontSize: 13 }}>
            FX-rate refresh &amp; product currency-alignment crons — did they run, when,
            and how many products were touched.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {summary && (
            <Tag color={summary.ratesFresh ? "green" : "gold"}>
              {summary.ratesFresh ? "FX cache fresh" : "FX cache STALE"}
            </Tag>
          )}
          <span style={{ fontSize: 12, color: "#888" }}>auto 30s</span>
          <Switch checked={auto} onChange={setAuto} size="small" />
          <Button icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DollarOutlined />}
            loading={busy === "fx"}
            onClick={runExchangeRefresh}
          >
            Refresh FX rates now
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            loading={busy === "align"}
            onClick={runAlignment}
          >
            Run alignment now
          </Button>
        </div>
      </div>

      {summary?.fxHealth && (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Statistic
                title="Rates age"
                value={
                  summary.fxHealth.ratesAgeMs == null
                    ? "—"
                    : ago(Date.now() - summary.fxHealth.ratesAgeMs)
                }
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Last good source"
                value={summary.fxHealth.lastGoodProvider || "—"}
                valueStyle={{ fontSize: 16 }}
              />
              <div style={{ fontSize: 11, color: "#888" }}>
                {fmtTime(summary.fxHealth.lastGoodAt)}
              </div>
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Primary quota (month)"
                value={
                  summary.fxHealth.quotaUsed == null
                    ? "—"
                    : `${summary.fxHealth.quotaUsed} / ${summary.fxHealth.quotaLimit}`
                }
                valueStyle={{
                  fontSize: 16,
                  color:
                    (summary.fxHealth.quotaPercent || 0) >= 80 ? "#c0392b" : undefined,
                }}
                suffix={
                  summary.fxHealth.quotaPercent != null
                    ? `(${summary.fxHealth.quotaPercent}%)`
                    : ""
                }
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Providers"
                valueRender={() => (
                  <span style={{ fontSize: 14 }}>
                    <Tag color={summary.fxHealth.primaryProviderConfigured ? "green" : "default"}>
                      primary {summary.fxHealth.primaryProviderConfigured ? "✓" : "off"}
                    </Tag>
                    <Tag color={summary.fxHealth.fallbackProviderConfigured ? "green" : "default"}>
                      fallback {summary.fxHealth.fallbackProviderConfigured ? "✓" : "off"}
                    </Tag>
                  </span>
                )}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Spin spinning={loading && !summary}>
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          {(summary?.jobs || []).map((job) => {
            const lr = job.lastRun || {};
            return (
              <Col xs={24} md={12} key={job.jobType}>
                <Card
                  title={
                    <span>
                      {JOB_ICON[job.jobType]} {JOB_LABEL[job.jobType] || job.jobType}{" "}
                      <HealthBadge job={job} />
                    </span>
                  }
                  size="small"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Last run"
                        value={ago(lr.startedAt)}
                        valueStyle={{ fontSize: 18 }}
                      />
                      <div style={{ marginTop: 4 }}>
                        {lr.status && (
                          <Tag color={STATUS_COLOR[lr.status] || "default"}>{lr.status}</Tag>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Last success"
                        value={ago(job.lastSuccessAt)}
                        valueStyle={{ fontSize: 18 }}
                      />
                      <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                        {fmtTime(job.lastSuccessAt)}
                      </div>
                    </Col>
                  </Row>
                  <div style={{ marginTop: 12, fontSize: 13 }}>
                    {job.jobType === "CURRENCY_ALIGNMENT" ? (
                      <span>
                        Products updated: <b>{lr.updated ?? "—"}</b> / scanned{" "}
                        {lr.scanned ?? "—"} (errors {lr.errorCount ?? 0})
                      </span>
                    ) : (
                      <span>
                        Rates fetched: <b>{lr.ratesCount ?? "—"}</b>
                        {lr.ratesSource ? ` · ${lr.ratesSource}` : ""}
                      </span>
                    )}
                  </div>
                  {lr.errorMessage && (
                    <div style={{ color: "#c0392b", marginTop: 6, fontSize: 12 }}>
                      {lr.errorMessage}
                    </div>
                  )}
                  {lr.alertSent && (
                    <Tag color="red" style={{ marginTop: 8 }}>
                      📧 failure email sent
                    </Tag>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </Spin>

      <Card
        size="small"
        title="Run history"
        style={{ marginTop: 8 }}
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Select
              size="small"
              style={{ width: 200 }}
              value={filters.jobType}
              onChange={(v) => setFilters((f) => ({ ...f, jobType: v }))}
              options={[
                { value: "", label: "All jobs" },
                { value: "EXCHANGE_RATE_REFRESH", label: "Exchange Rate Refresh" },
                { value: "CURRENCY_ALIGNMENT", label: "Currency Alignment" },
              ]}
            />
            <Select
              size="small"
              style={{ width: 140 }}
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={[
                { value: "", label: "All statuses" },
                { value: "SUCCESS", label: "Success" },
                { value: "PARTIAL", label: "Partial" },
                { value: "FAILED", label: "Failed" },
                { value: "RUNNING", label: "Running" },
              ]}
            />
          </div>
        }
      >
        <Table
          rowKey={(r) => r._id}
          columns={columns}
          dataSource={runs}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* ── Tunable settings ─────────────────────────────────────────────── */}
      <Card
        size="small"
        title={
          <span>
            <SettingOutlined /> Settings (change cadence & thresholds — no redeploy)
          </span>
        }
        style={{ marginTop: 16 }}
        extra={
          settings?.updatedByEmail ? (
            <span style={{ fontSize: 12, color: "#888" }}>
              last changed by {settings.updatedByEmail}
            </span>
          ) : null
        }
      >
        {!settings ? (
          <Spin />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {SETTING_FIELDS.map((f) => {
                const b = bounds[f.key === "maxDeviationPercent" ? "maxDeviationPercent" : f.key];
                return (
                  <Col xs={24} md={12} key={f.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</span>
                      <Tooltip title={f.help}>
                        <QuestionCircleOutlined style={{ color: "#aaa" }} />
                      </Tooltip>
                    </div>
                    <div style={{ margin: "4px 0" }}>
                      {f.type === "number" && (
                        <InputNumber
                          style={{ width: 200 }}
                          min={b?.min}
                          max={b?.max}
                          value={settings[f.key]}
                          onChange={(v) => setField(f.key, v)}
                        />
                      )}
                      {f.type === "switch" && (
                        <Switch
                          checked={!!settings[f.key]}
                          onChange={(v) => setField(f.key, v)}
                        />
                      )}
                      {f.type === "text" && (
                        <Input
                          style={{ maxWidth: 360 }}
                          value={settings[f.key]}
                          onChange={(e) => setField(f.key, e.target.value)}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#888", lineHeight: 1.4 }}>{f.help}</div>
                  </Col>
                );
              })}
            </Row>
            <Divider style={{ margin: "16px 0" }} />
            <Button type="primary" loading={savingSettings} onClick={saveSettings}>
              Save settings
            </Button>
            <span style={{ marginLeft: 12, fontSize: 12, color: "#888" }}>
              Takes effect within ~1 minute across all servers.
            </span>
          </>
        )}
      </Card>

      {/* ── Rate history (audit) ─────────────────────────────────────────── */}
      <Card size="small" title="Exchange-rate history (USD→INR, recent fetches)" style={{ marginTop: 16 }}>
        <Table
          rowKey={(r, i) => `${r.fetchedAt}-${i}`}
          size="small"
          pagination={{ pageSize: 8 }}
          dataSource={rateHistory}
          locale={{ emptyText: "No rate snapshots yet" }}
          columns={[
            { title: "Fetched at", dataIndex: "fetchedAt", render: fmtTime },
            { title: "Provider", dataIndex: "provider", render: (p) => <Tag>{p}</Tag> },
            { title: "USD→INR", dataIndex: "rate", render: (r) => (r != null ? r : "—") },
            { title: "Currencies", dataIndex: "ratesCount" },
            { title: "Status", dataIndex: "isGood", render: (g, r) => g ? <Tag color="green">good</Tag> : <Tooltip title={r.rejectionReason}><Tag color="red">rejected</Tag></Tooltip> },
          ]}
        />
        <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          Every fetched rate set is recorded (1-year retention) — answers “what was the rate when this booking was made?”. Showing USD→INR; the API supports any currency.
        </div>
      </Card>

      {/* ── Glossary: what each term means ───────────────────────────────── */}
      <Collapse style={{ marginTop: 16 }} items={[{
        key: "glossary",
        label: <span><QuestionCircleOutlined /> What do these terms mean?</span>,
        children: (
          <div>
            {GLOSSARY.map(([term, meaning]) => (
              <p key={term} style={{ marginBottom: 8 }}>
                <b>{term}</b> — <span style={{ color: "#555" }}>{meaning}</span>
              </p>
            ))}
          </div>
        ),
      }]} />
    </div>
  );
};

export default CurrencyJobs;
