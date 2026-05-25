import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody, Collapse,
} from "reactstrap";
import {
  fetchGlobtixProductsRequest,
  searchGlobtixProductsRequest,
  globaltixSyncFullRequest,
  globaltixSyncProductRequest,
  fetchGlobtixProductDetailRequest,
} from "store/tickyourlist/globaltix/action";
import { getGlobtixProductFilters } from "helpers/globaltix_helper";
import ConnectGlobtixModal from "../TravelTourGroup/ConnectGlobtixModal";

const SYNC_STATUS_COLORS = { synced: "success", pending: "warning", error: "danger" };

const GLOBALTIX_IMG_BASE_STG = "https://product-image.globaltix.com/stg-gtImage/";
const GLOBALTIX_IMG_BASE_PROD = "https://product-image.globaltix.com/";

function globaltixImageUrl(path, environment) {
  if (!path) return null;
  return (environment === "production" ? GLOBALTIX_IMG_BASE_PROD : GLOBALTIX_IMG_BASE_STG) + path;
}

const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : "—");
const fmtCur = (currency, n) => (typeof n === "number" ? `${currency} ${n.toFixed(2)}` : "—");

const VALIDITY_LABELS = {
  VisitDate: "Fixed Visit Date",
  OpenDated: "Open Dated (flexible)",
  DateAndTime: "Specific Date & Time",
  Duration: "Timed Entry (duration-based)",
};
const FORMAT_LABELS = {
  QRCODE: "QR Code",
  BARCODE: "Barcode",
  PDF: "PDF Voucher",
  SEPARATEEMAIL: "Sent via Separate Email",
};
const validityLabel = (v) => VALIDITY_LABELS[v] || v || "—";
const formatLabel = (v) => FORMAT_LABELS[v] || v || "—";

const ProductDetailPanel = ({ product, environment }) => {
  const [showTnC, setShowTnC] = useState(false);
  const [showWhatToExpect, setShowWhatToExpect] = useState(false);
  const images = (product.media || []).filter(m => m.path);
  const [activeImg, setActiveImg] = useState(0);
  const currency = product.currency || "SGD";

  return (
    <div>
      {/* ── Header: image + title ─────────────────────────────── */}
      <Row className="mb-4">
        {images.length > 0 && (
          <Col md={4}>
            <img
              src={globaltixImageUrl(images[activeImg]?.path, environment)}
              alt={images[activeImg]?.name || product.name}
              style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 220 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {images.length > 1 && (
              <div className="d-flex gap-1 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <img
                    key={img.id || i}
                    src={globaltixImageUrl(img.path, environment)}
                    alt=""
                    style={{
                      width: 48, height: 36, objectFit: "cover", borderRadius: 4, cursor: "pointer",
                      border: i === activeImg ? "2px solid #556ee6" : "2px solid transparent",
                    }}
                    onClick={() => setActiveImg(i)}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ))}
              </div>
            )}
          </Col>
        )}
        <Col>
          <h4 className="mb-1">{product.name}</h4>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {product.isInstantConfirmation && <Badge color="success">Instant Confirm</Badge>}
            {product.isCancellable && <Badge color="info">Cancellable</Badge>}
            {product.isOpenDated && <Badge color="primary">Open Dated</Badge>}
            <Badge color="secondary">{currency}</Badge>
          </div>
          <table className="table table-sm table-borderless mb-0" style={{ fontSize: 13 }}>
            <tbody>
              <tr><td className="text-muted pe-3" style={{ width: 120 }}>Globaltix ID</td><td><code>{product.globaltixProductId}</code></td></tr>
              <tr><td className="text-muted">Country</td><td>{product.country || "—"}</td></tr>
              <tr><td className="text-muted">City</td><td>{product.city || "—"}</td></tr>
              <tr><td className="text-muted">Category</td><td>{product.category || "—"}</td></tr>
              <tr><td className="text-muted">Merchant</td><td>{product.merchantName || "—"}{product.merchantId ? <span className="text-muted ms-1 small">(ID {product.merchantId})</span> : null}</td></tr>
              {product.originalPrice > 0 && <tr><td className="text-muted">From Price</td><td><strong>{fmtCur(currency, product.originalPrice)}</strong></td></tr>}
              {(product.latitude || product.longitude) && (
                <tr>
                  <td className="text-muted">Location</td>
                  <td>
                    <a
                      href={`https://www.google.com/maps?q=${product.latitude},${product.longitude}`}
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: 12 }}
                    >
                      {product.latitude?.toFixed(5)}, {product.longitude?.toFixed(5)} ↗
                    </a>
                  </td>
                </tr>
              )}
              {product.keywords && <tr><td className="text-muted">Keywords</td><td className="text-muted small">{product.keywords}</td></tr>}
              <tr><td className="text-muted">Last Synced</td><td className="text-muted small">{product.lastSyncedAt ? new Date(product.lastSyncedAt).toLocaleString() : "—"}</td></tr>
              {product.tourGroupId && <tr><td className="text-muted">TYL Tour Group</td><td><code className="small">{product.tourGroupId}</code></td></tr>}
            </tbody>
          </table>
        </Col>
      </Row>

      {/* ── Description ──────────────────────────────────────── */}
      {product.description && (
        <div className="mb-4">
          <h6 className="fw-semibold">Description</h6>
          <p style={{ fontSize: 13, whiteSpace: "pre-line" }}>{product.description}</p>
        </div>
      )}

      {/* ── How to Use ───────────────────────────────────────── */}
      {product.howToUse?.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-semibold">How to Use</h6>
          <ol className="ps-3 mb-0" style={{ fontSize: 13 }}>
            {product.howToUse.map((step, i) => (
              <li key={i} className="mb-1">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── What to Expect ────────────────────────────────────── */}
      {product.whatToExpect && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="fw-semibold mb-0">What to Expect</h6>
            <Button color="link" size="sm" className="p-0" onClick={() => setShowWhatToExpect(v => !v)}>
              {showWhatToExpect ? "Hide" : "Show"}
            </Button>
          </div>
          <Collapse isOpen={showWhatToExpect}>
            <p style={{ fontSize: 13, whiteSpace: "pre-line" }}>{product.whatToExpect}</p>
          </Collapse>
        </div>
      )}

      {/* ── Terms & Conditions ────────────────────────────────── */}
      {product.termsAndConditions && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="fw-semibold mb-0">Terms & Conditions</h6>
            <Button color="link" size="sm" className="p-0" onClick={() => setShowTnC(v => !v)}>
              {showTnC ? "Hide" : "Show"}
            </Button>
          </div>
          <Collapse isOpen={showTnC}>
            <div className="border rounded p-3 bg-light" style={{ fontSize: 12, whiteSpace: "pre-line", maxHeight: 200, overflowY: "auto" }}>
              {product.termsAndConditions}
            </div>
          </Collapse>
        </div>
      )}

      {/* ── Options & Pricing ────────────────────────────────── */}
      <h6 className="fw-semibold mb-3">Options & Pricing ({product.options?.length || 0})</h6>
      {(product.options || []).map((opt, oi) => (
        <Card key={opt.id || oi} className="mb-3 border">
          <CardHeader className="bg-light py-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong style={{ fontSize: 14 }}>{opt.name}</strong>
                <span className="text-muted small ms-2">(ID {opt.id})</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  <Badge color="secondary" style={{ fontSize: 10 }} title={opt.ticketValidity}>{validityLabel(opt.ticketValidity)}</Badge>
                  <Badge color={opt.ticketFormat === "PDF" ? "warning" : "primary"} style={{ fontSize: 10 }} title={opt.ticketFormat}>{formatLabel(opt.ticketFormat)}</Badge>
                  {opt.isCancellable ? <Badge color="success" style={{ fontSize: 10 }}>Cancellable</Badge> : <Badge color="danger" style={{ fontSize: 10 }}>Non-cancellable</Badge>}
                  {opt.isOpenDated && <Badge color="info" style={{ fontSize: 10 }}>Open Dated</Badge>}
                  {opt.visitDateRequired && <Badge color="secondary" style={{ fontSize: 10 }}>Visit Date Required</Badge>}
                </div>
              </div>
              <div className="text-end" style={{ fontSize: 12 }}>
                {opt.advanceBookingDays > 0 && <div className="text-muted">{opt.advanceBookingDays}d advance booking</div>}
                {opt.isCancellable && opt.cancellationPolicy && (
                  <div className="text-success">{opt.cancellationPolicy.percentReturn}% refund / {opt.cancellationPolicy.refundDuration}h before</div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody className="py-2 px-3">
            {/* Pricing table */}
            {(opt.ticketTypes || []).length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm table-hover mb-2" style={{ fontSize: 12 }}>
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>SKU</th>
                      <th>Age</th>
                      <th>Min / Max Qty</th>
                      <th>Original</th>
                      <th>Nett (cost)</th>
                      <th>Min Selling</th>
                      <th className="text-success">Rec. Selling</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opt.ticketTypes.map((tt) => {
                      const margin = (tt.recommendedSellingPrice || 0) - (tt.nettPrice || 0);
                      const marginPct = tt.nettPrice > 0
                        ? Math.round((margin / tt.nettPrice) * 10000) / 100
                        : null;
                      return (
                        <tr key={tt.id}>
                          <td><strong>{tt.name}</strong><div className="text-muted" style={{ fontSize: 10 }}>ID {tt.id}</div></td>
                          <td><code style={{ fontSize: 10 }}>{tt.sku || "—"}</code></td>
                          <td className="text-muted">
                            {tt.ageFrom != null || tt.ageTo != null
                              ? `${tt.ageFrom ?? "?"}–${tt.ageTo ?? "?"}yr`
                              : "—"}
                          </td>
                          <td className="text-muted">
                            {tt.minPurchaseQty != null || tt.maxPurchaseQty != null
                              ? `${tt.minPurchaseQty ?? "—"} / ${tt.maxPurchaseQty ?? "—"}`
                              : "—"}
                          </td>
                          <td>{fmtCur(currency, tt.originalPrice)}</td>
                          <td className="text-danger fw-semibold">{fmtCur(currency, tt.nettPrice)}</td>
                          <td className="text-muted">{fmtCur(currency, tt.minimumSellingPrice)}</td>
                          <td className="text-success fw-semibold">{fmtCur(currency, tt.recommendedSellingPrice)}</td>
                          <td>
                            {marginPct != null ? (
                              <span className={marginPct >= 20 ? "text-success" : marginPct >= 10 ? "text-warning" : "text-danger"}>
                                {fmtCur(currency, margin)} ({marginPct}%)
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Questions required at booking */}
            {(opt.questions || []).length > 0 && (
              <div>
                <div className="text-muted small fw-semibold mb-1">Required at Booking ({opt.questions.length} question{opt.questions.length > 1 ? "s" : ""})</div>
                {opt.questions.map((q) => (
                  <div key={q.id} className="d-flex align-items-start gap-2 mb-1" style={{ fontSize: 12 }}>
                    <Badge color="light" className="text-dark border" style={{ fontSize: 10, minWidth: 60 }}>{q.type}</Badge>
                    <div>
                      <span>{q.question}</span>
                      {q.questionCode && <span className="text-muted ms-1">({q.questionCode})</span>}
                      {q.options?.length > 0 && (
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          Options: {q.options.join(" · ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      {/* ── Blocked Dates ─────────────────────────────────────── */}
      {product.blockedDates?.length > 0 && (
        <div className="mb-3">
          <h6 className="fw-semibold">Blocked Dates ({product.blockedDates.length})</h6>
          <div className="d-flex flex-wrap gap-2">
            {product.blockedDates.map((bd, i) => (
              <Badge key={i} color="light" className="text-dark border" style={{ fontSize: 12 }}>
                {bd.date}{bd.title ? ` — ${bd.title}` : ""}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── Sync error ───────────────────────────────────────── */}
      {product.syncError && (
        <Alert color="danger" className="mb-0 py-2 small">
          <strong>Last sync error:</strong> {product.syncError}
        </Alert>
      )}
    </div>
  );
};

const GlobtixProductsPage = () => {
  const dispatch = useDispatch();
  const {
    products, productsPagination, productsLoading,
    searchResults, searching,
    syncLoading, syncResult,
    syncProductLoading,
    productDetail, productDetailLoading,
  } = useSelector((state) => state.globaltix || {});

  const [environment] = useState("staging");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedProductForConnect, setSelectedProductForConnect] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLinked, setFilterLinked] = useState("");
  const [filterCancellable, setFilterCancellable] = useState("");
  const [filterOpenDated, setFilterOpenDated] = useState("");

  // Meta data — derived from synced products (only countries/cities/categories you actually have)
  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getGlobtixProductFilters(environment)
      .then((res) => {
        const { countries: c = [], cities: ci = [], categories: ca = [] } = res?.data || {};
        setCountries(c);
        setAllCities(ci);
        setCategories(ca);
      })
      .catch(() => {});
  }, [environment]);

  const activeFilterCount = [filterCountry, filterCity, filterCategory, filterLinked, filterCancellable, filterOpenDated].filter(Boolean).length;

  const fetchProducts = useCallback(() => {
    dispatch(fetchGlobtixProductsRequest({
      environment, page, limit: 50,
      ...(filterCountry && { country: filterCountry }),
      ...(filterCity && { city: filterCity }),
      ...(filterCategory && { category: filterCategory }),
      ...(filterLinked !== "" && { isLinked: filterLinked }),
      ...(filterCancellable !== "" && { isCancellable: filterCancellable }),
      ...(filterOpenDated !== "" && { isOpenDated: filterOpenDated }),
    }));
  }, [dispatch, environment, page, filterCountry, filterCity, filterCategory, filterLinked, filterCancellable, filterOpenDated]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchSubmitted(true);
      dispatch(searchGlobtixProductsRequest(searchQuery, environment));
    } else {
      setSearchSubmitted(false);
      fetchProducts();
    }
  };

  const resetFilters = () => {
    setFilterCountry(""); setFilterCity(""); setFilterCategory("");
    setFilterLinked(""); setFilterCancellable(""); setFilterOpenDated("");
    setPage(1);
  };

  const handleFullSync = () => { setSyncConfirmOpen(false); dispatch(globaltixSyncFullRequest(environment)); };
  const handleSyncProduct = (productId) => dispatch(globaltixSyncProductRequest(productId, environment));
  const handleViewDetail = (productId) => { dispatch(fetchGlobtixProductDetailRequest(productId, environment)); setDetailModalOpen(true); };

  // allCities are flat strings; country+city both sent as independent MongoDB filters
  const filteredCities = allCities;

  const displayProducts = searchSubmitted ? searchResults : products;

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Globaltix Products</h4>
                <p className="text-muted mb-0">
                  Cached Globaltix product catalog &bull; {productsPagination?.total || 0} products
                </p>
              </div>
              <Button color="primary" onClick={() => setSyncConfirmOpen(true)} disabled={syncLoading}>
                {syncLoading ? <><Spinner size="sm" className="me-2" />Syncing...</> : <><i className="bx bx-refresh me-2"></i>Full Sync</>}
              </Button>
            </div>

            {syncResult && (
              <Alert color={syncResult.failed > 0 ? "warning" : "success"} className="mb-3">
                Sync complete: <strong>{syncResult.synced}</strong> synced, <strong>{syncResult.failed}</strong> failed.
                {syncResult.errors?.length > 0 && (
                  <ul className="mb-0 mt-1">{syncResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}</ul>
                )}
              </Alert>
            )}

            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <Row className="align-items-center g-2">
                  <Col md={5}>
                    <div className="d-flex gap-2">
                      <Input type="text" placeholder="Search by name, country, city..." value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                      <Button color="outline-primary" onClick={handleSearch} disabled={searching}>
                        {searching ? <Spinner size="sm" /> : <i className="bx bx-search"></i>}
                      </Button>
                      {searchQuery && (
                        <Button color="outline-secondary" onClick={() => { setSearchQuery(""); setSearchSubmitted(false); fetchProducts(); }}>Clear</Button>
                      )}
                    </div>
                  </Col>
                  <Col md={7} className="d-flex justify-content-end align-items-center gap-2">
                    <Button color={activeFilterCount > 0 ? "primary" : "outline-secondary"} size="sm"
                      onClick={() => setFiltersOpen(!filtersOpen)}>
                      <i className="bx bx-filter me-1"></i>Filters
                      {activeFilterCount > 0 && <Badge color="light" className="text-primary ms-1">{activeFilterCount}</Badge>}
                    </Button>
                    {activeFilterCount > 0 && (
                      <Button color="outline-danger" size="sm" onClick={resetFilters}>Clear Filters</Button>
                    )}
                    <span className="text-muted small">Environment: <Badge color="secondary">{environment}</Badge></span>
                  </Col>
                </Row>

                <Collapse isOpen={filtersOpen}>
                  <Row className="mt-3 g-2">
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCountry}
                        onChange={(e) => { setFilterCountry(e.target.value); setFilterCity(""); setPage(1); }}>
                        <option value="">All Countries</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCity}
                        onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}>
                        <option value="">All Cities</option>
                        {filteredCities.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                        <option value="">All Categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterLinked}
                        onChange={(e) => { setFilterLinked(e.target.value); setPage(1); }}>
                        <option value="">Linked + Unlinked</option>
                        <option value="true">Linked to TYL</option>
                        <option value="false">Unlinked</option>
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCancellable}
                        onChange={(e) => { setFilterCancellable(e.target.value); setPage(1); }}>
                        <option value="">Any Cancellation</option>
                        <option value="true">Cancellable</option>
                        <option value="false">Non-cancellable</option>
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterOpenDated}
                        onChange={(e) => { setFilterOpenDated(e.target.value); setPage(1); }}>
                        <option value="">Any Date Type</option>
                        <option value="true">Open Dated</option>
                        <option value="false">Fixed Date</option>
                      </Input>
                    </Col>
                  </Row>
                </Collapse>
              </CardHeader>

              <CardBody className="p-0">
                {productsLoading ? (
                  <div className="text-center py-5"><Spinner /></div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table hover responsive className="mb-0 table-nowrap align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th><th>Name</th><th>Country / City</th>
                          <th>Category</th><th>Price From</th><th>Options</th>
                          <th>Sync</th><th>Linked</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!displayProducts?.length ? (
                          <tr><td colSpan={11} className="text-center py-4 text-muted">
                            {activeFilterCount > 0 ? "No products match the filters." : "No products found. Run a Full Sync to populate the catalog."}
                          </td></tr>
                        ) : (
                          displayProducts.map((p) => (
                            <tr key={p._id || p.globaltixProductId}>
                              <td className="text-muted small">{p.globaltixProductId}</td>
                              <td>
                                <div style={{ maxWidth: 240 }}>
                                  <div className="fw-medium" style={{ fontSize: 13 }}>{p.name}</div>
                                  <div className="d-flex flex-wrap gap-1 mt-1">
                                    {p.isInstantConfirmation && <Badge color="success" style={{ fontSize: 9 }}>Instant</Badge>}
                                    {p.isCancellable && <Badge color="info" style={{ fontSize: 9 }}>Cancellable</Badge>}
                                    {p.isOpenDated && <Badge color="primary" style={{ fontSize: 9 }}>Open Dated</Badge>}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: 13 }}>{p.country || "—"}</div>
                                <div className="text-muted" style={{ fontSize: 11 }}>{p.city || ""}</div>
                              </td>
                              <td><span className="text-muted small">{p.category || "—"}</span></td>
                              <td style={{ fontSize: 12 }}>
                                {(() => {
                                  const prices = (p.options || [])
                                    .flatMap(o => o.ticketTypes || [])
                                    .map(tt => tt.recommendedSellingPrice || tt.nettPrice || 0)
                                    .filter(n => n > 0);
                                  if (!prices.length) return <span className="text-muted">—</span>;
                                  const min = Math.min(...prices);
                                  const max = Math.max(...prices);
                                  return <span className="text-success fw-semibold">{p.currency} {min === max ? min.toFixed(2) : `${min.toFixed(2)}–${max.toFixed(2)}`}</span>;
                                })()}
                              </td>
                              <td className="text-center">{p.options?.length || 0}</td>
                              <td><Badge color={SYNC_STATUS_COLORS[p.syncStatus] || "secondary"}>{p.syncStatus}</Badge></td>
                              <td>
                                {p.tourGroupId ? (
                                  <Badge color="info"><i className="bx bx-link-alt me-1"></i>Linked</Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button size="sm" color="outline-primary" onClick={() => handleViewDetail(p.globaltixProductId)} title="View Details">
                                    <i className="bx bx-info-circle"></i>
                                  </Button>
                                  <Button size="sm" color="outline-secondary" onClick={() => handleSyncProduct(p.globaltixProductId)} disabled={syncProductLoading} title="Re-sync">
                                    <i className="bx bx-refresh"></i>
                                  </Button>
                                  <Button size="sm" color={p.tourGroupId ? "outline-info" : "outline-success"}
                                    title={p.tourGroupId ? "Re-link tour group" : "Link or create tour group"}
                                    onClick={() => { setSelectedProductForConnect(p); setConnectModalOpen(true); }}>
                                    <i className={`bx ${p.tourGroupId ? "bx-link-alt" : "bx-plus"}`}></i>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>

            {!searchSubmitted && productsPagination?.total > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">
                  Showing {displayProducts?.length || 0} of {productsPagination.total} products
                  {productsPagination.pages > 1 && ` · Page ${page} of ${productsPagination.pages}`}
                </span>
                {productsPagination.pages > 1 && (
                  <div className="d-flex gap-2">
                    <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button size="sm" color="outline-secondary" disabled={page >= productsPagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Product Detail Modal */}
      <Modal isOpen={detailModalOpen} toggle={() => setDetailModalOpen(false)} size="xl" scrollable>
        <ModalHeader toggle={() => setDetailModalOpen(false)}>
          Product Details
          {productDetail && (
            <span className="ms-2 text-muted small fw-normal">
              ID {productDetail.globaltixProductId} &bull; <Badge color={productDetail.syncStatus === "synced" ? "success" : "warning"} style={{ fontSize: 10 }}>{productDetail.syncStatus}</Badge>
            </span>
          )}
        </ModalHeader>
        <ModalBody>
          {productDetailLoading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : productDetail ? (
            <ProductDetailPanel product={productDetail} environment={environment} />
          ) : null}
        </ModalBody>
      </Modal>

      {/* Sync Confirmation Modal */}
      <Modal isOpen={syncConfirmOpen} toggle={() => setSyncConfirmOpen(false)} size="sm">
        <ModalHeader toggle={() => setSyncConfirmOpen(false)}>Confirm Full Sync</ModalHeader>
        <ModalBody>This will fetch all Globaltix products for Singapore and update your local catalog.</ModalBody>
        <div className="modal-footer">
          <Button color="secondary" onClick={() => setSyncConfirmOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleFullSync}>Start Sync</Button>
        </div>
      </Modal>

      {/* Connect / Create Tour Group Modal */}
      <ConnectGlobtixModal
        isOpen={connectModalOpen}
        toggle={() => { setConnectModalOpen(false); setSelectedProductForConnect(null); }}
        tourGroup={null}
        initialProduct={selectedProductForConnect}
        onSuccess={() => {
          setConnectModalOpen(false);
          setSelectedProductForConnect(null);
          fetchProducts();
        }}
      />
    </div>
  );
};

export default GlobtixProductsPage;
