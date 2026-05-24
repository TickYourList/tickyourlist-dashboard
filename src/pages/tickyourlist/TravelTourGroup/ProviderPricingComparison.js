import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Table, Badge, Spinner,
  Button, Row, Col, Alert, Nav, NavItem, NavLink,
} from "reactstrap";
import Select from "react-select";
import classnames from "classnames";
import { getGlobtixProductPricing, getGlobtixProductByTourGroup } from "helpers/globaltix_helper";
import { getSupportedCurrencies } from "helpers/location_management_helper";
import { showToastError } from "helpers/toastBuilder";
import { useDispatch, useSelector } from "react-redux";
import { fetchKlookLivePricingRequest } from "store/tickyourlist/travelTourGroup/action";

// ─── B2B Comparison factor row
const CompRow = ({ label, klook, globaltix, highlight = false }) => (
  <tr className={highlight ? "table-active" : ""}>
    <td className="text-muted fw-medium" style={{ width: "30%", fontSize: 12 }}>{label}</td>
    <td style={{ fontSize: 12 }}>{klook ?? <span className="text-muted">—</span>}</td>
    <td style={{ fontSize: 12 }}>{globaltix ?? <span className="text-muted">—</span>}</td>
  </tr>
);

const bool2badge = (val, trueLabel = "Yes", falseLabel = "No") =>
  val == null ? null : val
    ? <Badge color="success">{trueLabel}</Badge>
    : <Badge color="secondary">{falseLabel}</Badge>;

const priceBadge = (val, currency, color = "light") =>
  val != null ? (
    <Badge color={color} className="text-dark border" style={{ fontSize: 12, fontWeight: 600 }}>
      {currency} {val?.toFixed(2)}
    </Badge>
  ) : null;

// Extract first adult ticket type price from Globaltix options
const extractGlobtixFirstPrice = (options, currency) => {
  for (const opt of options || []) {
    const adult = opt.ticketTypes?.find((tt) =>
      tt.name?.toLowerCase().includes("adult") || tt.name?.toLowerCase().includes("guest")
    ) || opt.ticketTypes?.[0];
    if (adult) return { ...adult.pricing, optionName: opt.name, currency };
  }
  return null;
};

// Extract first package min price from Klook pricing response
const extractKlookFirstPrice = (variants) => {
  for (const v of variants || []) {
    const allPrices = [];
    for (const sched of v.schedules || []) {
      for (const month of sched.calendars || []) {
        for (const ts of month.timeslots || []) {
          if (ts.available) allPrices.push(ts);
        }
      }
    }
    if (allPrices.length > 0) {
      const cheapest = allPrices.reduce((a, b) => (a.sellingPrice < b.sellingPrice ? a : b));
      return {
        variantName: v.variantName,
        b2bCost: cheapest.originalPrice,
        b2cPrice: cheapest.b2cPrice,
        sellingPrice: cheapest.sellingPrice,
        markup: cheapest.markupApplied,
        markupPct: cheapest.markupPercentage,
        currency: v.currency || "USD",
      };
    }
  }
  return null;
};

const ProviderPricingComparison = ({ tourGroupId, globaltixProductId: globaltixProductIdProp, environment = "staging" }) => {
  const dispatch = useDispatch();
  const { klookLivePricing, klookLivePricingLoading } = useSelector((state) => ({
    klookLivePricing: state.tourGroup?.klookLivePricing || {},
    klookLivePricingLoading: state.tourGroup?.klookLivePricingLoading || false,
  }));

  const [globaltixData, setGlobtixData] = useState(null);
  const [globaltixLoading, setGlobtixLoading] = useState(false);
  const [resolvedGlobtixProductId, setResolvedGlobtixProductId] = useState(globaltixProductIdProp || null);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState({ value: "SGD", label: "SGD (S$)" });
  const [activeTab, setActiveTab] = useState("overview");

  // Resolve globaltix product id from tour group if not provided directly
  useEffect(() => {
    if (globaltixProductIdProp) {
      setResolvedGlobtixProductId(globaltixProductIdProp);
      return;
    }
    if (!tourGroupId) return;
    getGlobtixProductByTourGroup(tourGroupId, environment)
      .then((res) => {
        const product = res?.data || res?.data?.data;
        if (product?.globaltixProductId) setResolvedGlobtixProductId(product.globaltixProductId);
      })
      .catch(() => {}); // not linked = silent
  }, [tourGroupId, globaltixProductIdProp, environment]);

  const klookData = tourGroupId ? klookLivePricing[tourGroupId] : null;

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

  const fetchAll = useCallback(() => {
    const currency = selectedCurrency.value;

    // Fetch Klook pricing
    if (tourGroupId) {
      const today = new Date();
      dispatch(
        fetchKlookLivePricingRequest({
          tourGroupId,
          startDate: today.toISOString().split("T")[0],
          endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          currency,
        })
      );
    }

    // Fetch Globaltix pricing
    if (resolvedGlobtixProductId) {
      setGlobtixLoading(true);
      getGlobtixProductPricing(resolvedGlobtixProductId, { environment, currency })
        .then((res) => setGlobtixData(res?.data || res?.data?.data || null))
        .catch((err) => showToastError("Globaltix pricing error: " + err.message))
        .finally(() => setGlobtixLoading(false));
    }
  }, [tourGroupId, resolvedGlobtixProductId, environment, selectedCurrency.value, dispatch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const isLoading = klookLivePricingLoading || globaltixLoading;
  const klookPrice = extractKlookFirstPrice(klookData?.variants);
  const gPrice = extractGlobtixFirstPrice(globaltixData?.options, selectedCurrency.value);

  const hasKlook = !!klookData;
  const hasGlobtix = !!globaltixData;

  return (
    <Card className="mb-0">
      <CardHeader className="bg-transparent border-bottom py-2">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <i className="bx bx-transfer-alt text-primary" style={{ fontSize: 18 }} />
              <strong>Provider Pricing Comparison</strong>
              {isLoading && <Spinner size="sm" className="ms-2" />}
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
            <Button size="sm" color="outline-primary" onClick={fetchAll} disabled={isLoading}>
              <i className="bx bx-refresh" />
            </Button>
          </Col>
        </Row>

        {/* Sub-navigation */}
        <Nav tabs className="mt-2 border-0">
          {["overview", "klook", "globaltix"].map((tab) => (
            <NavItem key={tab}>
              <NavLink
                className={classnames({ active: activeTab === tab }, "py-1 px-3 cursor-pointer")}
                style={{ fontSize: 12 }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" ? "Side-by-Side" : tab === "klook" ? "Klook Detail" : "Globaltix Detail"}
              </NavLink>
            </NavItem>
          ))}
        </Nav>
      </CardHeader>

      <CardBody className="p-0">
        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div>
            {!hasKlook && !hasGlobtix && !isLoading && (
              <div className="text-center text-muted py-4">
                <i className="bx bx-transfer-alt" style={{ fontSize: 36 }} />
                <p className="mt-2">No provider data found for this tour group.</p>
              </div>
            )}

            {(hasKlook || hasGlobtix) && (
              <Table bordered size="sm" className="mb-0 table-nowrap" style={{ fontSize: 12 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "30%" }}>Factor</th>
                    <th>
                      <div className="d-flex align-items-center gap-1">
                        <Badge color="info">Klook</Badge>
                        {hasKlook
                          ? <span className="text-muted" style={{ fontSize: 11 }}>{klookData?.currency}</span>
                          : <Badge color="secondary">Not connected</Badge>
                        }
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-1">
                        <Badge color="primary">Globaltix</Badge>
                        {hasGlobtix
                          ? <span className="text-muted" style={{ fontSize: 11 }}>{selectedCurrency.value}</span>
                          : <Badge color="secondary">Not connected</Badge>
                        }
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <CompRow
                    label="B2B Cost (Adult)"
                    klook={klookPrice ? priceBadge(klookPrice.b2bCost, klookPrice.currency, "danger") : null}
                    globaltix={gPrice ? priceBadge(gPrice.nettPriceConverted, selectedCurrency.value, "danger") : null}
                    highlight
                  />
                  <CompRow
                    label="Min Selling Price"
                    klook={null}
                    globaltix={gPrice ? priceBadge(gPrice.minimumSellingPriceConverted, selectedCurrency.value, "warning") : null}
                  />
                  <CompRow
                    label="Recommended Retail"
                    klook={klookPrice ? priceBadge(klookPrice.sellingPrice, klookPrice.currency, "success") : null}
                    globaltix={gPrice ? priceBadge(gPrice.recommendedSellingPriceConverted, selectedCurrency.value, "success") : null}
                    highlight
                  />
                  <CompRow
                    label="Market / Original Price"
                    klook={null}
                    globaltix={gPrice ? priceBadge(gPrice.originalPriceConverted, selectedCurrency.value) : null}
                  />
                  <CompRow
                    label="Margin (Rec - Cost)"
                    klook={klookPrice
                      ? <span className="text-success fw-bold">+{klookPrice.markup?.toFixed(2)}</span>
                      : null}
                    globaltix={gPrice
                      ? <span className={gPrice.marginAmountConverted >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                          {gPrice.marginAmountConverted >= 0 ? "+" : ""}{gPrice.marginAmountConverted?.toFixed(2)}
                        </span>
                      : null}
                    highlight
                  />
                  <CompRow
                    label="Margin %"
                    klook={klookPrice
                      ? <Badge color="success">+{klookPrice.markupPct?.toFixed(1)}%</Badge>
                      : null}
                    globaltix={gPrice
                      ? <Badge color={gPrice.marginPercent >= 0 ? "success" : "danger"}>
                          {gPrice.marginPercent >= 0 ? "+" : ""}{gPrice.marginPercent}%
                        </Badge>
                      : null}
                  />
                  <CompRow
                    label="Cancellable"
                    klook={hasKlook ? bool2badge(null, "Check policy", "—") : null}
                    globaltix={hasGlobtix ? bool2badge(globaltixData?.isCancellable) : null}
                  />
                  <CompRow
                    label="Instant Confirmation"
                    klook={null}
                    globaltix={hasGlobtix ? bool2badge(globaltixData?.isInstantConfirmation) : null}
                  />
                  <CompRow
                    label="Open Dated"
                    klook={null}
                    globaltix={hasGlobtix ? bool2badge(globaltixData?.isOpenDated) : null}
                  />
                  <CompRow
                    label="Ticket Format"
                    klook={hasKlook ? <span className="text-muted">QR / E-ticket</span> : null}
                    globaltix={hasGlobtix && globaltixData?.options?.length
                      ? globaltixData.options.map((o) => (
                          <Badge key={o.id} color={o.ticketFormat === "PDF" ? "warning" : "primary"} className="me-1" style={{ fontSize: 10 }}>
                            {o.ticketFormat}
                          </Badge>
                        ))
                      : null
                    }
                  />
                  <CompRow
                    label="Options / Packages"
                    klook={klookData?.variants?.length != null ? (
                      <Badge color="info">{klookData.variants.length} variants</Badge>
                    ) : null}
                    globaltix={hasGlobtix ? (
                      <Badge color="info">{globaltixData.options?.length} options</Badge>
                    ) : null}
                  />
                </tbody>
              </Table>
            )}
          </div>
        )}

        {/* ─── KLOOK DETAIL TAB ─── */}
        {activeTab === "klook" && (
          <div className="p-3">
            {!hasKlook && (
              <Alert color="warning" className="mb-0">
                No Klook mapping found for this tour group. Connect a Klook activity using the Klook button.
              </Alert>
            )}
            {hasKlook && (
              <div>
                <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                  Currency: <strong>{klookData.currency}</strong> · Exchange rate: {klookData.exchangeRate} ·
                  Date range: {klookData.dateRange?.startDate} → {klookData.dateRange?.endDate}
                </p>
                {klookData.variants?.map((v) => (
                  <div key={v.variantId || v.packageId} className="mb-3">
                    <div className="fw-medium mb-1">{v.variantName || v.packageName}</div>
                    {v.error ? (
                      <Alert color="danger" className="py-1 mb-0" style={{ fontSize: 12 }}>{v.error}</Alert>
                    ) : (
                      <Table size="sm" bordered responsive style={{ fontSize: 12 }}>
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>B2B Cost</th>
                            <th>B2C (with markup)</th>
                            <th>Markup</th>
                            <th>Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.schedules?.flatMap((s) =>
                            s.calendars?.flatMap((m) =>
                              m.timeslots?.slice(0, 10).map((ts, i) => (
                                <tr key={i}>
                                  <td>{ts.startTime?.slice(0, 10)}</td>
                                  <td>{v.originalCurrency} {ts.originalPrice?.toFixed(2)}</td>
                                  <td><strong>{klookData.currency} {ts.sellingPrice?.toFixed(2)}</strong></td>
                                  <td className="text-success">+{ts.markupApplied?.toFixed(2)} ({ts.markupPercentage?.toFixed(1)}%)</td>
                                  <td>{bool2badge(ts.available, "Yes", "No")}</td>
                                </tr>
                              ))
                            )
                          )}
                        </tbody>
                      </Table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── GLOBALTIX DETAIL TAB ─── */}
        {activeTab === "globaltix" && (
          <div className="p-0">
            {!hasGlobtix && (
              <Alert color="warning" className="m-3 mb-0">
                No Globaltix product linked. Use the Globe button to connect a Globaltix product.
              </Alert>
            )}
            {hasGlobtix && (
              <>
                <div className="px-3 py-2 border-bottom" style={{ fontSize: 12 }}>
                  <strong>{globaltixData.name}</strong>
                  <span className="text-muted ms-2">{globaltixData.country} · {globaltixData.city}</span>
                  <span className="ms-2">
                    {bool2badge(globaltixData.isCancellable, "Cancellable", "Non-Cancellable")}
                    {globaltixData.isInstantConfirmation && <Badge color="primary" className="ms-1">Instant</Badge>}
                  </span>
                </div>
                {globaltixData.options?.map((opt) => (
                  <div key={opt.id} className="border-bottom">
                    <div className="px-3 py-1 d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
                      <strong>{opt.name}</strong>
                      <Badge color="secondary" style={{ fontSize: 10 }}>{opt.ticketValidity}</Badge>
                      <Badge color={opt.ticketFormat === "PDF" ? "warning" : "primary"} style={{ fontSize: 10 }}>
                        {opt.ticketFormat}
                      </Badge>
                    </div>
                    <Table size="sm" bordered responsive className="mb-0 table-nowrap" style={{ fontSize: 12 }}>
                      <thead className="table-light">
                        <tr>
                          <th>Ticket Type</th>
                          <th>Age</th>
                          <th>Nett ({selectedCurrency.value})</th>
                          <th>Min Sell ({selectedCurrency.value})</th>
                          <th>Recommended ({selectedCurrency.value})</th>
                          <th>Market ({selectedCurrency.value})</th>
                          <th>Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opt.ticketTypes?.map((tt) => (
                          <tr key={tt.id}>
                            <td className="fw-medium">{tt.name}</td>
                            <td className="text-muted">
                              {tt.ageFrom != null && tt.ageTo != null ? `${tt.ageFrom}–${tt.ageTo}` : "—"}
                            </td>
                            <td><Badge color="danger">{tt.pricing.nettPriceConverted?.toFixed(2)}</Badge></td>
                            <td><Badge color="warning" className="text-dark">{tt.pricing.minimumSellingPriceConverted?.toFixed(2)}</Badge></td>
                            <td><Badge color="success">{tt.pricing.recommendedSellingPriceConverted?.toFixed(2)}</Badge></td>
                            <td>{tt.pricing.originalPriceConverted?.toFixed(2)}</td>
                            <td>
                              <span className={tt.pricing.marginPercent >= 0 ? "text-success" : "text-danger"}>
                                {tt.pricing.marginPercent >= 0 ? "+" : ""}{tt.pricing.marginPercent}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ProviderPricingComparison;
