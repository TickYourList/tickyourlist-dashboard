import React, { useEffect, useState, useCallback } from "react";
import { Card, Row, Col, Button, Statistic, Tag, message, Spin, Alert, Table } from "antd";
import {
  ReloadOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { get, post } from "../../helpers/api_helper";

const BASE = "/v1/tourgroupsearch";

const ago = (t) => {
  if (!t) return "never";
  const m = (Date.now() - new Date(t).getTime()) / 60000;
  if (m < 1) return "just now";
  if (m < 60) return `${Math.round(m)}m ago`;
  const h = m / 60;
  return h < 24 ? `${h.toFixed(1)}h ago` : `${(h / 24).toFixed(1)}d ago`;
};

const SearchIndex = () => {
  const [stats, setStats] = useState(null);
  const [domain, setDomain] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [domainError, setDomainError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await get(`${BASE}/index-stats`);
      setStats(res?.data || res);
    } catch (e) {
      message.error(`Stats failed: ${e?.response?.data?.message || e.message}`);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await get(`${BASE}/search-analytics?days=30`);
      setAnalytics(res?.data || res);
    } catch (e) {
      console.warn("analytics load failed", e?.message);
    }
  }, []);

  const loadDomain = useCallback(async () => {
    try {
      const res = await get(`${BASE}/admin/my-domain`);
      setDomain(res?.data || res);
      setDomainError(null);
    } catch (e) {
      setDomainError(e?.response?.data?.message || e.message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadDomain(), loadAnalytics()]);
    setLoading(false);
  }, [loadStats, loadDomain, loadAnalytics]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Run a reindex action. `needsDomain` actions send the resolved domainId.
  const run = async (key, path, { needsDomain = true, label } = {}) => {
    if (needsDomain && !domain?.domainId) {
      message.error("No domain resolved for your account — cannot reindex.");
      return;
    }
    setBusy(key);
    try {
      const body = needsDomain ? { domainId: domain.domainId } : {};
      const res = await post(`${BASE}${path}`, body);
      const d = res?.data || res;
      message.success(
        d?.count != null
          ? `${label}: ${d.count} indexed`
          : d?.started
          ? `${label}: started in background`
          : `${label}: done`
      );
    } catch (e) {
      message.error(`${label} failed: ${e?.response?.data?.message || e.message}`);
    } finally {
      setBusy("");
      // Give Meili a moment, then refresh counts.
      setTimeout(loadStats, 1500);
    }
  };

  const cards = [
    { key: "products", title: "Products", icon: <AppstoreOutlined />, color: "#2d8cf0" },
    { key: "countries", title: "Countries", icon: <GlobalOutlined />, color: "#19be6b" },
    { key: "cities", title: "Cities", icon: <EnvironmentOutlined />, color: "#ff9900" },
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
          <h4 style={{ margin: 0 }}>Search Index (Meilisearch)</h4>
          <div style={{ color: "#888", fontSize: 13 }}>
            Reindex the catalog powering the site search bar: countries, cities and products.
          </div>
        </div>
        <Button icon={<ReloadOutlined />} onClick={refreshAll} loading={loading}>
          Refresh counts
        </Button>
      </div>

      {domainError && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Could not resolve your domain"
          description={`${domainError} — reindex actions are disabled. (You can still run "Setup indexes".)`}
        />
      )}

      <Spin spinning={loading && !stats}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {cards.map((c) => {
            const s = stats?.[c.key] || {};
            return (
              <Col xs={24} md={8} key={c.key}>
                <Card size="small">
                  <Statistic
                    title={
                      <span>
                        {c.icon} {c.title}{" "}
                        {s.isIndexing && <Tag color="processing">indexing…</Tag>}
                      </span>
                    }
                    value={s.count ?? "—"}
                    valueStyle={{ color: c.color }}
                  />
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    last reindexed: {ago(s.lastReindexedAt)}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Spin>

      <Card
        size="small"
        title="Reindex actions"
        extra={
          domain?.domainUrl ? (
            <span style={{ fontSize: 12, color: "#888" }}>
              domain: <b>{domain.domainUrl}</b>
            </span>
          ) : null
        }
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            icon={<SettingOutlined />}
            loading={busy === "setup"}
            onClick={() => run("setup", "/setup-indexes", { needsDomain: false, label: "Setup indexes" })}
          >
            Setup indexes
          </Button>
          <Button
            icon={<GlobalOutlined />}
            loading={busy === "countries"}
            disabled={!domain?.domainId}
            onClick={() => run("countries", "/reindex-countries", { label: "Reindex countries" })}
          >
            Reindex countries
          </Button>
          <Button
            icon={<EnvironmentOutlined />}
            loading={busy === "cities"}
            disabled={!domain?.domainId}
            onClick={() => run("cities", "/reindex-cities", { label: "Reindex cities" })}
          >
            Reindex cities
          </Button>
          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            loading={busy === "products"}
            disabled={!domain?.domainId}
            onClick={() => run("products", "/reindex-all-products", { label: "Reindex all products" })}
          >
            Reindex all products
          </Button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
          Run <b>Setup indexes</b> once first. <b>Reindex all products</b> runs in the
          background — watch the Products count climb (use “Refresh counts”).
        </div>
      </Card>

      {/* ── Search analytics (last 30 days) ──────────────────────────────── */}
      <Card size="small" title="Search analytics (last 30 days)" style={{ marginTop: 16 }}>
        {!analytics ? (
          <span style={{ color: "#888" }}>No search data yet.</span>
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col xs={8}><Statistic title="Total searches" value={analytics.totals?.searches ?? 0} /></Col>
              <Col xs={8}><Statistic title="Zero-result" value={analytics.totals?.zeroResults ?? 0} valueStyle={{ color: (analytics.totals?.zeroResultRate || 0) > 20 ? "#c0392b" : undefined }} suffix={`(${analytics.totals?.zeroResultRate ?? 0}%)`} /></Col>
              <Col xs={8}><Statistic title="Degraded" value={analytics.totals?.degraded ?? 0} /></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Top searches</div>
                <Table
                  size="small"
                  rowKey={(r) => r.query}
                  pagination={false}
                  dataSource={(analytics.topQueries || []).slice(0, 10)}
                  columns={[
                    { title: "Query", dataIndex: "query" },
                    { title: "Count", dataIndex: "count", width: 80 },
                    { title: "Type", dataIndex: "type", width: 90, render: (t) => <Tag>{t}</Tag> },
                  ]}
                />
              </Col>
              <Col xs={24} md={12}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  Top zero-result searches{" "}
                  <span style={{ fontWeight: 400, color: "#888", fontSize: 12 }}>(catalog/SEO gaps)</span>
                </div>
                <Table
                  size="small"
                  rowKey={(r) => r.query}
                  pagination={false}
                  locale={{ emptyText: "None 🎉" }}
                  dataSource={(analytics.topZeroResult || []).slice(0, 10)}
                  columns={[
                    { title: "Query", dataIndex: "query" },
                    { title: "Count", dataIndex: "count", width: 80 },
                  ]}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default SearchIndex;
