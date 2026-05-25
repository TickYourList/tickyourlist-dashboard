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
import { getGlobtixCountries, getGlobtixCategories } from "helpers/globaltix_helper";
import ConnectGlobtixModal from "../TravelTourGroup/ConnectGlobtixModal";

const SYNC_STATUS_COLORS = { synced: "success", pending: "warning", error: "danger" };

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

  // Meta data
  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getGlobtixCountries(environment).then((res) => {
      const list = res?.data || [];
      setCountries(list);
      const cities = list.flatMap((c) => (c.cities || []).map((city) => ({ ...city, countryCode: c.code })));
      setAllCities(cities);
    }).catch(() => {});
    getGlobtixCategories(environment).then((res) => setCategories(res?.data || [])).catch(() => {});
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
      dispatch(searchGlobtixProductsRequest(searchQuery, environment));
    } else {
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

  const filteredCities = filterCountry
    ? allCities.filter((c) => countries.find((co) => co.name === filterCountry)?.code === c.countryCode)
    : allCities;

  const displayProducts = searchQuery.trim() && searchResults?.length >= 0 ? searchResults : products;

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
                        <Button color="outline-secondary" onClick={() => { setSearchQuery(""); fetchProducts(); }}>Clear</Button>
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
                        {countries.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCity}
                        onChange={(e) => { setFilterCity(e.target.value); setPage(1); }}>
                        <option value="">All Cities</option>
                        {filteredCities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Input type="select" bsSize="sm" value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                        <option value="">All Categories</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                          <th>ID</th><th>Name</th><th>Country</th><th>City</th>
                          <th>Category</th><th>Currency</th><th>Options</th>
                          <th>Sync</th><th>Linked</th><th>Last Synced</th><th>Actions</th>
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
                                <div style={{ maxWidth: 220 }}>
                                  <div className="fw-medium text-truncate">{p.name}</div>
                                  <div className="text-muted" style={{ fontSize: 11 }}>
                                    {p.isCancellable && <span className="me-1 text-success">&#10003; Cancellable</span>}
                                    {p.isOpenDated && <span className="me-1 text-info">Open Dated</span>}
                                    {p.isInstantConfirmation && <span className="text-primary">Instant</span>}
                                  </div>
                                </div>
                              </td>
                              <td>{p.country}</td>
                              <td>{p.city}</td>
                              <td><span className="text-muted small">{p.category || "—"}</span></td>
                              <td>{p.currency}</td>
                              <td className="text-center">{p.options?.length || 0}</td>
                              <td><Badge color={SYNC_STATUS_COLORS[p.syncStatus] || "secondary"}>{p.syncStatus}</Badge></td>
                              <td>
                                {p.tourGroupId ? (
                                  <Badge color="info"><i className="bx bx-link-alt me-1"></i>Linked</Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td className="text-muted small">
                                {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleDateString() : "—"}
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

            {!searchQuery && productsPagination?.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">Page {page} of {productsPagination.pages} ({productsPagination.total} products)</span>
                <div className="d-flex gap-2">
                  <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button size="sm" color="outline-secondary" disabled={page >= productsPagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Product Detail Modal */}
      <Modal isOpen={detailModalOpen} toggle={() => setDetailModalOpen(false)} size="lg" scrollable>
        <ModalHeader toggle={() => setDetailModalOpen(false)}>Product Details</ModalHeader>
        <ModalBody>
          {productDetailLoading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : productDetail ? (
            <div>
              <h5>{productDetail.name}</h5>
              <p className="text-muted small">ID: {productDetail.globaltixProductId} &bull; {productDetail.country} &bull; {productDetail.city} &bull; {productDetail.category}</p>
              <p>{productDetail.description}</p>
              <hr />
              <h6>Options ({productDetail.options?.length})</h6>
              {productDetail.options?.map((opt) => (
                <Card key={opt.id} className="mb-2">
                  <CardBody className="py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{opt.name}</strong>
                        <div className="d-flex gap-2 mt-1">
                          <Badge color="secondary">{opt.ticketValidity}</Badge>
                          <Badge color={opt.ticketFormat === "PDF" ? "warning" : "primary"}>{opt.ticketFormat}</Badge>
                          {opt.isCancellable && <Badge color="success">Cancellable</Badge>}
                          {opt.isOpenDated && <Badge color="info">Open Dated</Badge>}
                        </div>
                      </div>
                      <span className="text-muted small">{opt.advanceBookingDays}d advance</span>
                    </div>
                    <div className="mt-2">
                      {opt.ticketTypes?.map((tt) => (
                        <span key={tt.id} className="badge bg-light text-dark border me-1 mb-1" style={{ fontSize: 11 }}>
                          {tt.name}: S${tt.recommendedSellingPrice || tt.nettPrice}
                        </span>
                      ))}
                    </div>
                    {opt.questions?.length > 0 && (
                      <div className="mt-2 text-muted small">Questions: {opt.questions.map(q => q.question).join(", ")}</div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
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
