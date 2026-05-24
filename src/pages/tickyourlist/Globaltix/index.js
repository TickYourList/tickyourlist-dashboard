import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Input, Badge, Table, Spinner, Alert,
  Modal, ModalHeader, ModalBody,
} from "reactstrap";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
  fetchGlobtixProductsRequest,
  searchGlobtixProductsRequest,
  globaltixSyncFullRequest,
  globaltixSyncProductRequest,
  fetchGlobtixProductDetailRequest,
} from "store/tickyourlist/globaltix/action";
import ConnectGlobtixModal from "../TravelTourGroup/ConnectGlobtixModal";

const SYNC_STATUS_COLORS = {
  synced: "success",
  pending: "warning",
  error: "danger",
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
  const [page, setPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedProductForConnect, setSelectedProductForConnect] = useState(null);

  useEffect(() => {
    dispatch(fetchGlobtixProductsRequest({ environment, page, limit: 50 }));
  }, [dispatch, environment, page]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchGlobtixProductsRequest(searchQuery, environment));
    } else {
      dispatch(fetchGlobtixProductsRequest({ environment, page: 1, limit: 50 }));
    }
  };

  const handleFullSync = () => {
    setSyncConfirmOpen(false);
    dispatch(globaltixSyncFullRequest(environment));
  };

  const handleSyncProduct = (productId) => {
    dispatch(globaltixSyncProductRequest(productId, environment));
  };

  const handleViewDetail = (productId) => {
    dispatch(fetchGlobtixProductDetailRequest(productId, environment));
    setDetailModalOpen(true);
  };

  const displayProducts = searchQuery.trim() && searchResults?.length >= 0
    ? searchResults
    : products;

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
              <Button
                color="primary"
                onClick={() => setSyncConfirmOpen(true)}
                disabled={syncLoading}
              >
                {syncLoading ? (
                  <><Spinner size="sm" className="me-2" />Syncing...</>
                ) : (
                  <><i className="bx bx-refresh me-2"></i>Full Sync</>
                )}
              </Button>
            </div>

            {syncResult && (
              <Alert color={syncResult.failed > 0 ? "warning" : "success"} className="mb-3">
                Sync complete: <strong>{syncResult.synced}</strong> synced,{" "}
                <strong>{syncResult.failed}</strong> failed.
                {syncResult.errors?.length > 0 && (
                  <ul className="mb-0 mt-1">
                    {syncResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </Alert>
            )}

            <Card>
              <CardHeader className="bg-transparent border-bottom">
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search by name, country, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button color="outline-primary" onClick={handleSearch} disabled={searching}>
                        {searching ? <Spinner size="sm" /> : <i className="bx bx-search"></i>}
                      </Button>
                      {searchQuery && (
                        <Button color="outline-secondary" onClick={() => { setSearchQuery(""); dispatch(fetchGlobtixProductsRequest({ environment, page: 1, limit: 50 })); }}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </Col>
                  <Col md={6} className="text-end text-muted small">
                    Environment: <Badge color="secondary">{environment}</Badge>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="p-0">
                {productsLoading ? (
                  <div className="text-center py-5"><Spinner /></div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table hover responsive className="mb-0 table-nowrap align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Country</th>
                          <th>City</th>
                          <th>Currency</th>
                          <th>Options</th>
                          <th>Sync</th>
                          <th>Linked</th>
                          <th>Last Synced</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayProducts?.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-4 text-muted">
                              No products found. Run a full sync to populate the catalog.
                            </td>
                          </tr>
                        ) : (
                          displayProducts?.map((p) => (
                            <tr key={p._id || p.globaltixProductId}>
                              <td className="text-muted small">{p.globaltixProductId}</td>
                              <td>
                                <div style={{ maxWidth: 250 }}>
                                  <div className="fw-medium text-truncate">{p.name}</div>
                                  <div className="text-muted" style={{ fontSize: 11 }}>
                                    {p.isCancellable && <span className="me-1 text-success">✓ Cancellable</span>}
                                    {p.isOpenDated && <span className="me-1 text-info">Open Dated</span>}
                                    {p.isInstantConfirmation && <span className="text-primary">Instant</span>}
                                  </div>
                                </div>
                              </td>
                              <td>{p.country}</td>
                              <td>{p.city}</td>
                              <td>{p.currency}</td>
                              <td className="text-center">{p.options?.length || 0}</td>
                              <td>
                                <Badge color={SYNC_STATUS_COLORS[p.syncStatus] || "secondary"}>
                                  {p.syncStatus}
                                </Badge>
                              </td>
                              <td>
                                {p.tourGroupId ? (
                                  <Badge color="info" title={p.tourGroupId}>
                                    <i className="bx bx-link-alt me-1"></i>Linked
                                  </Badge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                              <td className="text-muted small">
                                {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleDateString() : "—"}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    size="sm"
                                    color="outline-primary"
                                    onClick={() => handleViewDetail(p.globaltixProductId)}
                                    title="View Details"
                                  >
                                    <i className="bx bx-info-circle"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="outline-secondary"
                                    onClick={() => handleSyncProduct(p.globaltixProductId)}
                                    disabled={syncProductLoading}
                                    title="Re-sync this product"
                                  >
                                    <i className="bx bx-refresh"></i>
                                  </Button>
                                  <Button
                                    size="sm"
                                    color={p.tourGroupId ? "outline-info" : "outline-success"}
                                    title={p.tourGroupId ? "Re-link tour group" : "Link or create tour group"}
                                    onClick={() => { setSelectedProductForConnect(p); setConnectModalOpen(true); }}
                                  >
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

            {/* Pagination */}
            {!searchQuery && productsPagination?.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">
                  Page {page} of {productsPagination.pages} ({productsPagination.total} products)
                </span>
                <div className="d-flex gap-2">
                  <Button size="sm" color="outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <Button size="sm" color="outline-secondary" disabled={page >= productsPagination.pages} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Product Detail Modal */}
      <Modal isOpen={detailModalOpen} toggle={() => setDetailModalOpen(false)} size="lg" scrollable>
        <ModalHeader toggle={() => setDetailModalOpen(false)}>
          Product Details
        </ModalHeader>
        <ModalBody>
          {productDetailLoading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : productDetail ? (
            <div>
              <h5>{productDetail.name}</h5>
              <p className="text-muted small">
                ID: {productDetail.globaltixProductId} &bull; {productDetail.country} &bull; {productDetail.city}
              </p>
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
                      <div className="mt-2 text-muted small">
                        Questions required: {opt.questions.map(q => q.question).join(", ")}
                      </div>
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
        <ModalBody>
          This will fetch all Globaltix products and update your local catalog. This may take several minutes.
        </ModalBody>
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
        onSuccess={() => {
          setConnectModalOpen(false);
          setSelectedProductForConnect(null);
          dispatch(fetchGlobtixProductsRequest({ environment, page, limit: 50 }));
        }}
      />
    </div>
  );
};

export default GlobtixProductsPage;
