import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Table, Badge, Spinner,
  Button, Row, Col, Alert, Input, Label,
} from "reactstrap";
import Select from "react-select";
import { getGlobtixProductPricing } from "helpers/globaltix_helper";
import { getSupportedCurrencies } from "helpers/location_management_helper";
import { showToastError } from "helpers/toastBuilder";

const TIER_META = [
  { key: "nettPriceConverted",              label: "Nett (B2B Cost)",          color: "danger",  tip: "What TYL pays Globaltix" },
  { key: "minimumSellingPriceConverted",    label: "Min Selling",              color: "warning", tip: "Minimum customer price allowed" },
  { key: "recommendedSellingPriceConverted",label: "Recommended Retail",       color: "success", tip: "Globaltix recommended B2C price" },
  { key: "originalPriceConverted",          label: "Market Price",             color: "secondary",tip: "Original market/gate price" },
];

const LiveGlobtixPricing = ({ globaltixProductId, environment = "staging" }) => {
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState({ value: "SGD", label: "SGD (S$)" });

  useEffect(() => {
    getSupportedCurrencies()
      .then((res) => {
        const list = res?.data?.currencies || res?.data?.data?.currencies || [];
        if (list.length > 0) {
          setCurrencies(list.map((c) => ({ value: c.code, label: `${c.code} (${c.symbol})` })));
        }
      })
      .catch(() => {});
  }, []);

  const fetchPricing = useCallback(async () => {
    if (!globaltixProductId) return;
    setLoading(true);
    try {
      const res = await getGlobtixProductPricing(globaltixProductId, {
        environment,
        currency: selectedCurrency.value,
        live: false,
      });
      setPricingData(res?.data || res?.data?.data || null);
    } catch (err) {
      showToastError("Failed to load Globaltix pricing: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [globaltixProductId, environment, selectedCurrency.value]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  if (!globaltixProductId) {
    return (
      <Alert color="info" className="mb-0">
        No Globaltix product linked to this tour group.
      </Alert>
    );
  }

  return (
    <Card className="mb-0">
      <CardHeader className="bg-transparent border-bottom py-2">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <i className="bx bx-globe text-primary" style={{ fontSize: 18 }} />
              <strong>Globaltix Live Pricing</strong>
              <Badge color="secondary" className="ms-1">{environment}</Badge>
              {pricingData && (
                <Badge color="light" className="text-muted border" style={{ fontSize: 11 }}>
                  {pricingData.name}
                </Badge>
              )}
            </div>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2">
            <div style={{ minWidth: 160 }}>
              <Select
                options={currencies}
                value={selectedCurrency}
                onChange={(opt) => setSelectedCurrency(opt)}
                placeholder="Currency"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }), control: (b) => ({ ...b, minHeight: 32, fontSize: 13 }) }}
              />
            </div>
            <Button size="sm" color="outline-primary" onClick={fetchPricing} disabled={loading}>
              {loading ? <Spinner size="sm" /> : <i className="bx bx-refresh" />}
            </Button>
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">
        {loading && !pricingData && (
          <div className="text-center py-4"><Spinner /></div>
        )}

        {!loading && !pricingData && (
          <div className="text-center text-muted py-4">
            <i className="bx bx-dollar-circle" style={{ fontSize: 32 }} />
            <p className="mt-2 mb-0">No pricing data available</p>
          </div>
        )}

        {pricingData && (
          <>
            {/* Product info strip */}
            <div className="px-3 py-2 border-bottom bg-light d-flex gap-3 flex-wrap" style={{ fontSize: 12 }}>
              <span><strong>Currency:</strong> {pricingData.sourceCurrency} → {pricingData.targetCurrency}
                {pricingData.exchangeRate !== 1 && (
                  <span className="text-muted ms-1">(×{pricingData.exchangeRate?.toFixed(4)})</span>
                )}
              </span>
              <span>
                {pricingData.isCancellable
                  ? <Badge color="success" className="me-1">Cancellable</Badge>
                  : <Badge color="warning" className="me-1">Non-Cancellable</Badge>
                }
                {pricingData.isInstantConfirmation && <Badge color="primary">Instant Confirmation</Badge>}
                {pricingData.isOpenDated && <Badge color="info" className="ms-1">Open Dated</Badge>}
              </span>
            </div>

            {/* Options pricing table */}
            {pricingData.options?.map((option) => (
              <div key={option.id} className="border-bottom">
                <div className="px-3 pt-2 pb-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong style={{ fontSize: 13 }}>{option.name}</strong>
                    <Badge color="secondary" style={{ fontSize: 10 }}>{option.ticketValidity}</Badge>
                    <Badge color={option.ticketFormat === "PDF" ? "warning" : "primary"} style={{ fontSize: 10 }}>
                      {option.ticketFormat}
                    </Badge>
                    {option.isCancellable
                      ? <Badge color="success" style={{ fontSize: 10 }}>Cancellable</Badge>
                      : <Badge color="danger" style={{ fontSize: 10 }}>Non-Cancellable</Badge>
                    }
                    {option.advanceBookingDays > 0 && (
                      <span className="text-muted" style={{ fontSize: 11 }}>
                        {option.advanceBookingDays}d advance
                      </span>
                    )}
                  </div>
                </div>

                {option.ticketTypes?.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <Table size="sm" bordered responsive className="mb-0 table-nowrap" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th style={{ minWidth: 120 }}>Ticket Type</th>
                          <th>Age Range</th>
                          <th>Qty</th>
                          {TIER_META.map((t) => (
                            <th key={t.key} title={t.tip}>
                              {t.label} <span className="text-muted">({pricingData.targetCurrency})</span>
                            </th>
                          ))}
                          <th>Margin</th>
                          <th>Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {option.ticketTypes.map((tt) => (
                          <tr key={tt.id}>
                            <td className="fw-medium">{tt.name}</td>
                            <td className="text-muted">
                              {tt.ageFrom != null && tt.ageTo != null
                                ? `${tt.ageFrom}–${tt.ageTo} yrs`
                                : "—"}
                            </td>
                            <td className="text-muted">
                              {tt.minPurchaseQty ?? 1}
                              {tt.maxPurchaseQty ? `–${tt.maxPurchaseQty}` : "+"}
                            </td>
                            {TIER_META.map((tier) => (
                              <td key={tier.key}>
                                <Badge
                                  color={tier.color}
                                  className="font-size-11"
                                  style={{ fontWeight: 600, letterSpacing: 0 }}
                                >
                                  {tt.pricing[tier.key]?.toFixed(2) ?? "—"}
                                </Badge>
                              </td>
                            ))}
                            <td>
                              {tt.pricing.marginAmountConverted != null ? (
                                <span className={tt.pricing.marginAmountConverted >= 0 ? "text-success" : "text-danger"}>
                                  {tt.pricing.marginAmountConverted >= 0 ? "+" : ""}
                                  {tt.pricing.marginAmountConverted.toFixed(2)}
                                </span>
                              ) : "—"}
                            </td>
                            <td>
                              {tt.pricing.marginPercent != null ? (
                                <Badge color={tt.pricing.marginPercent >= 0 ? "success" : "danger"}>
                                  {tt.pricing.marginPercent >= 0 ? "+" : ""}{tt.pricing.marginPercent}%
                                </Badge>
                              ) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted px-3 pb-2 mb-0" style={{ fontSize: 12 }}>No ticket types defined</p>
                )}
              </div>
            ))}

            <div className="px-3 py-1 text-muted" style={{ fontSize: 11 }}>
              Data from {pricingData.source === "live" ? "Globaltix API" : "local cache"} · {new Date(pricingData.fetchedAt).toLocaleString()}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default LiveGlobtixPricing;
