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
} from "antd";
import {
  ReloadOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { get, post } from "../../helpers/api_helper";

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

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSummary(), loadRuns()]);
    setLoading(false);
  }, [loadSummary, loadRuns]);

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
    </div>
  );
};

export default CurrencyJobs;
