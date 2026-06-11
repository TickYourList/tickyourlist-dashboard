import React, { useEffect, useState } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Row, Col, Label, Input, Spinner,
  Card, CardBody, Badge, Alert, Table,
  Nav, NavItem, NavLink,
} from "reactstrap";
import classnames from "classnames";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import { globaltixImportContent } from "helpers/admin_ops_helper";
import {
  searchGlobtixProducts,
  getGlobtixProductDetail,
  linkGlobtixProduct,
  globaltixSyncProduct,
  globaltixCreateTourGroup,
} from "helpers/globaltix_helper";
import LiveGlobtixPricing from "./LiveGlobtixPricing";
import GlobaltixCustomPricing from "./GlobaltixCustomPricing";

const STATUS_COLORS = {
  synced: "success",
  pending: "warning",
  error: "danger",
};

const VALIDITY_LABELS = {
  OpenDated: "Open Dated",
  VisitDate: "Visit Date",
  DateAndTime: "Date & Time",
};

const ConnectGlobtixModal = ({ isOpen, toggle, tourGroup, onSuccess, initialProduct = null }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [importFields, setImportFields] = useState(["images", "description"]);
  const [importing, setImporting] = useState(false);

  const IMPORT_FIELD_OPTIONS = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description / summary" },
    { key: "images", label: "Images" },
    { key: "highlights", label: "Highlights" },
    { key: "inclusions", label: "Inclusions" },
    { key: "howToUse", label: "How to use / ticket info" },
  ];

  const handleImportContent = async (productId) => {
    if (!importFields.length) { showToastError("Pick at least one field to replace"); return; }
    if (!window.confirm(`Replace ${importFields.join(", ")} of "${tourGroup?.name}" with Globaltix data? This overwrites the current values.`)) return;
    setImporting(true);
    try {
      const res = await globaltixImportContent({
        globaltixProductId: productId,
        tourGroupId: tourGroup._id,
        environment,
        fields: importFields,
      });
      showToastSuccess(`Replaced: ${(res?.data?.applied || []).join(", ")}`, "Content imported");
    } catch (err) {
      showToastError(err?.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [environment, setEnvironment] = useState("staging");
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSearched(false);
      setSelectedProduct(null);
      setProductDetail(null);
      setActiveTab("detail");
    } else if (initialProduct) {
      // Pre-select the product if one was passed in
      handleSelectProduct(initialProduct);
    }
  }, [isOpen]); // eslint-disable-line

  // Auto-search while typing (3+ chars) — no need to press the button.
  useEffect(() => {
    if (!isOpen || searchQuery.trim().length < 3) return;
    const t = setTimeout(() => handleSearch(), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, environment, isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await searchGlobtixProducts(searchQuery, environment);
      setSearchResults(res?.data || []);
    } catch (err) {
      showToastError("Search failed: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);
    setLoadingDetail(true);
    try {
      const res = await getGlobtixProductDetail(product.globaltixProductId, environment);
      setProductDetail(res?.data || product);
    } catch (err) {
      setProductDetail(product);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSyncProduct = async () => {
    if (!selectedProduct) return;
    setSyncing(true);
    try {
      await globaltixSyncProduct(selectedProduct.globaltixProductId, environment);
      const res = await getGlobtixProductDetail(selectedProduct.globaltixProductId, environment);
      setProductDetail(res?.data || selectedProduct);
      showToastSuccess("Product synced from Globaltix");
    } catch (err) {
      showToastError("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLink = async () => {
    if (!selectedProduct) return;
    setLinking(true);
    try {
      await linkGlobtixProduct(selectedProduct.globaltixProductId, tourGroup._id, environment);
      showToastSuccess(`Linked Globaltix product "${selectedProduct.name}" to "${tourGroup.name}"`);
      if (onSuccess) onSuccess();
      toggle();
    } catch (err) {
      showToastError("Link failed: " + err.message);
    } finally {
      setLinking(false);
    }
  };

  const handleCreateNewTourGroup = async () => {
    if (!selectedProduct) return;
    if (!window.confirm(`Create a new TYL tour group from "${selectedProduct.name}"?`)) return;
    setLinking(true);
    try {
      const res = await globaltixCreateTourGroup(selectedProduct.globaltixProductId, environment);
      showToastSuccess(`Tour group "${selectedProduct.name}" created and linked to Globaltix`);
      if (onSuccess) onSuccess(res?.data);
      toggle();
    } catch (err) {
      showToastError("Create failed: " + err.message);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm("Remove Globaltix link from this tour group?")) return;
    setLinking(true);
    try {
      await linkGlobtixProduct(selectedProduct?.globaltixProductId || tourGroup?.globaltixProductId, null, environment);
      showToastSuccess("Globaltix product unlinked");
      if (onSuccess) onSuccess();
      toggle();
    } catch (err) {
      showToastError("Unlink failed: " + err.message);
    } finally {
      setLinking(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable>
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span><i className="bx bx-zap me-2"></i>⚡ Power Link — {tourGroup?.name}</span>
          <div className="d-flex align-items-center gap-1 ms-2">
            <span className="small text-muted">Env:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 110, fontSize: "0.75rem" }}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        {/* Search Section */}
        <Row className="mb-3">
          <Col md={9}>
            <Input
              type="text"
              placeholder="Search Globaltix products by name, country, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </Col>
          <Col md={3}>
            <Button color="primary" block onClick={handleSearch} disabled={searching}>
              {searching ? <Spinner size="sm" /> : "Search"}
            </Button>
          </Col>
        </Row>

        {/* Empty state: make "no results" explicit instead of silent */}
        {searched && !searching && searchResults.length === 0 && (
          <div className="alert alert-warning py-2 small mb-3">
            No Globaltix products matched “{searchQuery}”. The search covers the <strong>synced {environment} catalog</strong> first,
            then live Globaltix (Singapore region). If the product you need isn’t synced yet, run a sync from
            <a href="/globaltix/products" className="ms-1">Globaltix → Products</a> and try again.
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-3">
            <CardBody style={{ maxHeight: 280, overflowY: "auto" }}>
              <Table hover size="sm" responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Linked</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((p) => (
                    <tr
                      key={p.globaltixProductId}
                      className={selectedProduct?.globaltixProductId === p.globaltixProductId ? "table-primary" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectProduct(p)}
                    >
                      <td>{p.globaltixProductId}</td>
                      <td>{p.name}</td>
                      <td>{p.country}</td>
                      <td>{p.city}</td>
                      <td>
                        <Badge color={STATUS_COLORS[p.syncStatus] || "secondary"}>
                          {p.syncStatus}
                        </Badge>
                      </td>
                      <td>
                        {p.tourGroupId ? (
                          <Badge color="info">Linked</Badge>
                        ) : (
                          <Badge color="light" className="text-muted">Unlinked</Badge>
                        )}
                      </td>
                      <td>
                        <Button size="sm" color="outline-primary" onClick={(e) => { e.stopPropagation(); handleSelectProduct(p); }}>
                          Select
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Selected Product Detail */}
        {selectedProduct && (
          <Card className="border border-primary">
            <div className="px-3 pt-2">
              <Nav tabs className="border-0">
                {["detail", "pricing", ...(tourGroup?._id ? ["custompricing"] : [])].map((tab) => (
                  <NavItem key={tab}>
                    <NavLink
                      className={classnames({ active: activeTab === tab }, "py-1 px-3 cursor-pointer")}
                      style={{ fontSize: 13 }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "detail"
                        ? "Product Detail"
                        : tab === "pricing"
                          ? <><i className="bx bx-dollar-circle me-1" />Live Pricing</>
                          : <><i className="bx bx-edit me-1" />Custom Pricing</>}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </div>
            <CardBody className={activeTab === "pricing" ? "p-0" : ""}>
              {activeTab === "detail" && (
                loadingDetail ? (
                  <div className="text-center py-3"><Spinner /></div>
                ) : (
                  <>
                    <Row>
                      <Col md={8}>
                        <h5 className="mb-1">{productDetail?.name || selectedProduct.name}</h5>
                        <p className="text-muted small mb-2">
                          ID: {selectedProduct.globaltixProductId} &bull;{" "}
                          {productDetail?.country} &bull; {productDetail?.city}
                        </p>
                        <p className="mb-2" style={{ fontSize: 13 }}>
                          {(productDetail?.description || "").substring(0, 200)}
                          {(productDetail?.description || "").length > 200 ? "..." : ""}
                        </p>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          <Badge color="secondary">{productDetail?.currency}</Badge>
                          {productDetail?.isOpenDated && <Badge color="info">Open Dated</Badge>}
                          {productDetail?.isCancellable && <Badge color="success">Cancellable</Badge>}
                          {productDetail?.isInstantConfirmation && <Badge color="primary">Instant Confirmation</Badge>}
                        </div>
                      </Col>
                      {productDetail?.media?.[0]?.path && (
                        <Col md={4}>
                          <img
                            src={productDetail.media[0].path}
                            alt={productDetail.name}
                            style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 4 }}
                          />
                        </Col>
                      )}
                    </Row>

                    {/* Options */}
                    {productDetail?.options?.length > 0 && (
                      <div className="mt-3">
                        <Label className="fw-semibold">Options ({productDetail.options.length})</Label>
                        <Table size="sm" bordered responsive>
                          <thead className="table-light">
                            <tr>
                              <th>Option</th>
                              <th>Validity</th>
                              <th>Format</th>
                              <th>Ticket Types</th>
                              <th>Advance Days</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productDetail.options.map((opt) => (
                              <tr key={opt.id}>
                                <td>{opt.name}</td>
                                <td>
                                  <Badge color="secondary" style={{ fontSize: 11 }}>
                                    {VALIDITY_LABELS[opt.ticketValidity] || opt.ticketValidity}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge color={opt.ticketFormat === "PDF" ? "warning" : "primary"} style={{ fontSize: 11 }}>
                                    {opt.ticketFormat}
                                  </Badge>
                                </td>
                                <td>
                                  {opt.ticketTypes?.map((tt) => (
                                    <span key={tt.id} className="badge bg-light text-dark me-1" style={{ fontSize: 11 }}>
                                      {tt.name} (S${tt.recommendedSellingPrice || tt.nettPrice})
                                    </span>
                                  ))}
                                </td>
                                <td>{opt.advanceBookingDays}d</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {productDetail?.options?.some((o) => o.ticketFormat === "PDF") && (
                      <Alert color="warning" className="mt-2 mb-0 py-2">
                        <i className="bx bx-error-circle me-1"></i>
                        <strong>Note:</strong> PDF format tickets are NOT cancellable once confirmed.
                      </Alert>
                    )}
                  </>
                )
              )}

              {activeTab === "pricing" && (
                <LiveGlobtixPricing
                  globaltixProductId={selectedProduct.globaltixProductId}
                  environment={environment}
                />
              )}

              {activeTab === "custompricing" && tourGroup?._id && (
                <GlobaltixCustomPricing
                  tourGroupId={tourGroup._id}
                  environment={environment}
                />
              )}
            </CardBody>
          </Card>
        )}

        {!selectedProduct && searchResults.length === 0 && (
          <div className="text-center text-muted py-4">
            <i className="bx bx-search-alt" style={{ fontSize: 40 }}></i>
            <p className="mt-2">Search for a Globaltix product to link to this tour group.</p>
          </div>
        )}
        {/* Replace TYL content with provider data — field-by-field opt-in */}
        {tourGroup && (selectedProduct || tourGroup?.globaltixProductId) && (
          <Card className="mt-2">
            <CardBody className="py-2">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <strong className="small">Replace product data from Globaltix:</strong>
                {IMPORT_FIELD_OPTIONS.map((f) => (
                  <label key={f.key} className="small d-flex align-items-center gap-1 mb-0" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={importFields.includes(f.key)}
                      onChange={(e) =>
                        setImportFields((prev) => (e.target.checked ? [...prev, f.key] : prev.filter((k) => k !== f.key)))
                      }
                    />
                    {f.label}
                  </label>
                ))}
                <Button
                  size="sm"
                  color="warning"
                  disabled={importing}
                  onClick={() => handleImportContent(selectedProduct?.globaltixProductId || tourGroup?.globaltixProductId)}
                >
                  {importing ? <Spinner size="sm" /> : "Replace selected"}
                </Button>
              </div>
              <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                Syncs fresh data from Globaltix first, then overwrites only the ticked fields. Unticked content is untouched.
              </div>
            </CardBody>
          </Card>
        )}
      </ModalBody>

      <ModalFooter>
        {selectedProduct && (
          <Button color="outline-secondary" size="sm" onClick={handleSyncProduct} disabled={syncing} className="me-auto">
            {syncing ? <Spinner size="sm" /> : <><i className="bx bx-refresh me-1"></i>Re-sync from Globaltix</>}
          </Button>
        )}
        {selectedProduct && !tourGroup && (
          <Button color="outline-success" onClick={handleCreateNewTourGroup} disabled={linking}>
            {linking ? <Spinner size="sm" /> : <><i className="bx bx-plus me-1"></i>Create New Tour Group</>}
          </Button>
        )}
        {tourGroup?.globaltixProductId && (
          <Button color="outline-danger" onClick={handleUnlink} disabled={linking}>
            Unlink
          </Button>
        )}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
        {tourGroup && (
          <Button color="primary" onClick={handleLink} disabled={!selectedProduct || linking}>
            {linking ? <Spinner size="sm" /> : "Link Product"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ConnectGlobtixModal;
