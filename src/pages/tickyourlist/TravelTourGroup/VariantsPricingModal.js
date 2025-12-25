import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
  Table,
  Spinner,
  Alert,
  Badge,
  Input,
  Label,
  Row,
  Col,
} from "reactstrap";
import Select from "react-select";
import { getVariantsByTour, refreshVariantPricing, updateVariantPrices } from "helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const VariantsPricingModal = ({ isOpen, toggle, tourGroupId, tourGroupName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [error, setError] = useState(null);
  const [confirmRefreshModal, setConfirmRefreshModal] = useState(false);
  const [variantToRefresh, setVariantToRefresh] = useState(null);
  const [selectedVariantFilter, setSelectedVariantFilter] = useState(null);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editedPricing, setEditedPricing] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (isOpen && tourGroupId) {
      fetchVariants();
    } else {
      // Reset state when modal closes
      setVariants([]);
      setError(null);
      setSelectedVariantFilter(null);
      setEditingVariantId(null);
      setEditedPricing(null);
    }
  }, [isOpen, tourGroupId]);

  // Filter variants based on selected filter
  const filteredVariants = useMemo(() => {
    if (!selectedVariantFilter || !selectedVariantFilter.value) return variants;
    return variants.filter(v => v._id === selectedVariantFilter.value);
  }, [variants, selectedVariantFilter]);

  // Variant options for dropdown
  const variantOptions = useMemo(() => {
    return variants.map(v => ({
      value: v._id,
      label: v.name || "Unnamed Variant"
    }));
  }, [variants]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVariantsByTour(tourGroupId);
      setVariants(response?.data || []);
    } catch (err) {
      console.error("Error fetching variants:", err);
      setError(err?.response?.data?.message || "Failed to fetch variants");
      showToastError("Failed to fetch variants", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPricingClick = (variant) => {
    setVariantToRefresh(variant);
    setConfirmRefreshModal(true);
  };

  const handleConfirmRefresh = async () => {
    if (!variantToRefresh) return;

    try {
      setRefreshingId(variantToRefresh._id);
      setConfirmRefreshModal(false);
      const response = await refreshVariantPricing(variantToRefresh._id);
      showToastSuccess("Pricing refreshed successfully!", "Success");
      
      // Refresh the variants list to get updated pricing
      await fetchVariants();
      setVariantToRefresh(null);
    } catch (err) {
      console.error("Error refreshing pricing:", err);
      showToastError(err?.response?.data?.message || "Failed to refresh pricing", "Error");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleEditPricing = (variant) => {
    setEditingVariantId(variant._id);
    // Deep copy the pricing data for editing
    const { usdPricing } = getVariantPricingData(variant);
    if (usdPricing) {
      setEditedPricing({
        prices: JSON.parse(JSON.stringify(usdPricing.prices || [])),
        groupSize: usdPricing.groupSize || 0,
        otherPricesExist: usdPricing.otherPricesExist || false,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setEditedPricing(null);
  };

  const handlePriceChange = (priceIndex, field, value) => {
    if (!editedPricing) return;
    const updatedPricing = { ...editedPricing };
    updatedPricing.prices = [...updatedPricing.prices];
    updatedPricing.prices[priceIndex] = {
      ...updatedPricing.prices[priceIndex],
      [field]: parseFloat(value) || 0
    };
    setEditedPricing(updatedPricing);
  };

  const handleSavePricing = async (variantId) => {
    if (!editedPricing) return;

    try {
      setSavingId(variantId);
      const listingPrice = {
        prices: editedPricing.prices,
        groupSize: editedPricing.groupSize,
        otherPricesExist: editedPricing.otherPricesExist,
      };
      
      await updateVariantPrices(variantId, { listingPrice });
      showToastSuccess("Pricing updated successfully!", "Success");
      
      // Refresh the variants list to get updated pricing
      await fetchVariants();
      setEditingVariantId(null);
      setEditedPricing(null);
    } catch (err) {
      console.error("Error updating pricing:", err);
      showToastError(err?.response?.data?.message || "Failed to update pricing", "Error");
    } finally {
      setSavingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price;
  };

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      USD: "$",
      INR: "₹",
      AED: "د.إ",
      EUR: "€",
      GBP: "£",
      SAR: "﷼",
      SGD: "S$",
      QAR: "﷼",
    };
    return symbols[currencyCode] || currencyCode;
  };

  const getVariantPricingData = (variant) => {
    const usdPrice = variant.listingPrice;
    const allCurrencies = variant.listingPricesInAllCurrencies || [];
    const usdPricing = allCurrencies.find(p => p.currencyCode === 'USD') || usdPrice;
    return { usdPricing, allCurrencies };
  };

  const renderVariantPricing = (variant) => {
    const { usdPricing, allCurrencies } = getVariantPricingData(variant);
    const isEditing = editingVariantId === variant._id;
    const displayPricing = isEditing && editedPricing ? editedPricing : (usdPricing || { prices: [] });
    
    // Calculate converted prices for preview when editing
    const getPreviewCurrencies = () => {
      if (!isEditing || !editedPricing) return allCurrencies;
      
      // In edit mode, we'll show the current converted currencies
      // The actual conversion will happen on save
      return allCurrencies;
    };

    const previewCurrencies = getPreviewCurrencies();

    return (
      <Card className="mb-3">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">{variant.name || "Unnamed Variant"}</h6>
            <div className="d-flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => handleEditPricing(variant)}
                  >
                    <i className="mdi mdi-pencil me-1"></i>
                    Edit Pricing
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleRefreshPricingClick(variant)}
                    disabled={refreshingId === variant._id}
                  >
                    {refreshingId === variant._id ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-refresh me-1"></i>
                        Refresh Pricing
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => handleSavePricing(variant._id)}
                    disabled={savingId === variant._id}
                  >
                    {savingId === variant._id ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-content-save me-1"></i>
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={savingId === variant._id}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* USD Pricing (Default) */}
          <div className="mb-3">
            <h6 className="text-primary mb-2">
              USD (Default Currency) {isEditing && <Badge color="warning">Editing</Badge>}
            </h6>
            {displayPricing?.prices && displayPricing.prices.length > 0 ? (
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Original Price</th>
                    <th>Final Price</th>
                    {displayPricing.prices[0]?.minimumPayablePrice && <th>Min Payable</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayPricing.prices.map((price, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge color="info">{price.type || "N/A"}</Badge>
                        {price.ageRange && (
                          <small className="d-block text-muted">
                            Age: {price.ageRange.min}-{price.ageRange.max}
                          </small>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={price.originalPrice || 0}
                            onChange={(e) => handlePriceChange(idx, 'originalPrice', e.target.value)}
                            className="form-control-sm"
                            style={{ width: '120px' }}
                          />
                        ) : (
                          `$${formatPrice(price.originalPrice)}`
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={price.finalPrice || 0}
                            onChange={(e) => handlePriceChange(idx, 'finalPrice', e.target.value)}
                            className="form-control-sm fw-bold"
                            style={{ width: '120px' }}
                          />
                        ) : (
                          <strong>${formatPrice(price.finalPrice)}</strong>
                        )}
                      </td>
                      {displayPricing.prices[0]?.minimumPayablePrice && (
                        <td>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={price.minimumPayablePrice || 0}
                              onChange={(e) => handlePriceChange(idx, 'minimumPayablePrice', e.target.value)}
                              className="form-control-sm"
                              style={{ width: '120px' }}
                            />
                          ) : (
                            `$${formatPrice(price.minimumPayablePrice)}`
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-muted">No pricing available</p>
            )}
          </div>

          {/* Other Currencies */}
          <div>
            <h6 className="text-success mb-2">
              Converted Currencies 
              {isEditing && <Badge color="info" className="ms-2">Preview (Will update on save)</Badge>}
            </h6>
            {previewCurrencies.length > 0 ? (
              <div className="table-responsive">
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Type</th>
                      <th>Original Price</th>
                      <th>Final Price</th>
                            {previewCurrencies[0]?.prices?.[0]?.minimumPayablePrice && <th>Min Payable</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {previewCurrencies
                      .filter(p => p.currencyCode !== 'USD')
                      .map((currencyPricing, currIdx) =>
                        currencyPricing.prices?.map((price, priceIdx) => (
                          <tr key={`${currIdx}-${priceIdx}`}>
                            {priceIdx === 0 && (
                              <td rowSpan={currencyPricing.prices.length} className="align-middle">
                                <strong>{currencyPricing.currencyCode}</strong>
                                <br />
                                <small className="text-muted">
                                  {getCurrencySymbol(currencyPricing.currencyCode)}
                                </small>
                              </td>
                            )}
                            <td>
                              <Badge color="secondary">{price.type || "N/A"}</Badge>
                              {price.ageRange && (
                                <small className="d-block text-muted">
                                  Age: {price.ageRange.min}-{price.ageRange.max}
                                </small>
                              )}
                            </td>
                            <td>
                              {getCurrencySymbol(currencyPricing.currencyCode)}
                              {formatPrice(price.originalPrice)}
                            </td>
                            <td>
                              <strong>
                                {getCurrencySymbol(currencyPricing.currencyCode)}
                                {formatPrice(price.finalPrice)}
                              </strong>
                            </td>
                            {previewCurrencies[0]?.prices?.[0]?.minimumPayablePrice && (
                              <td>
                                {getCurrencySymbol(currencyPricing.currencyCode)}
                                {formatPrice(price.minimumPayablePrice)}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted">No converted currencies available</p>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" scrollable>
      <ModalHeader toggle={toggle}>
        Variants Pricing - {tourGroupName || "Tour Group"}
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading variants...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : variants.length === 0 ? (
          <Alert color="info">No variants found for this tour group.</Alert>
        ) : (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <Label htmlFor="variantFilter" className="form-label">
                  Filter by Variant
                </Label>
                <Select
                  id="variantFilter"
                  value={selectedVariantFilter}
                  onChange={(option) => {
                    setSelectedVariantFilter(option);
                    // Cancel any editing when filter changes to a different variant
                    if (editingVariantId && option && option.value && option.value !== editingVariantId) {
                      setEditingVariantId(null);
                      setEditedPricing(null);
                    }
                  }}
                  options={[{ value: null, label: "All Variants" }, ...variantOptions]}
                  isClearable
                  isSearchable
                  placeholder="Select a variant to filter..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Col>
            </Row>
            
            <p className="text-muted mb-3">
              Review pricing for each variant below. Click "Edit Pricing" to modify USD prices, or "Refresh Pricing" to update all currency prices based on current exchange rates.
            </p>
            
            {filteredVariants.length === 0 ? (
              <Alert color="info">No variants match the selected filter.</Alert>
            ) : (
              filteredVariants.map((variant) => (
                <div key={variant._id}>{renderVariantPricing(variant)}</div>
              ))
            )}
          </div>
        )}
        
        {/* Confirm Refresh Pricing Modal */}
        <Modal isOpen={confirmRefreshModal} toggle={() => setConfirmRefreshModal(false)} size="lg">
          <ModalHeader toggle={() => setConfirmRefreshModal(false)}>
            Confirm Refresh Pricing - {variantToRefresh?.name}
          </ModalHeader>
          <ModalBody>
            {variantToRefresh && (
              <>
                <Alert color="info" className="mb-3">
                  <strong>Review current pricing before refreshing:</strong>
                  <br />
                  This will update all currency prices based on current exchange rates. The USD base price will remain unchanged.
                </Alert>
                
                {(() => {
                  const { usdPricing, allCurrencies } = getVariantPricingData(variantToRefresh);
                  
                  return (
                    <>
                      {/* USD Pricing */}
                      <div className="mb-3">
                        <h6 className="text-primary mb-2">USD (Default Currency - Will Not Change)</h6>
                        {usdPricing?.prices && usdPricing.prices.length > 0 ? (
                          <Table bordered size="sm">
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th>Original Price</th>
                                <th>Final Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {usdPricing.prices.map((price, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <Badge color="info">{price.type || "N/A"}</Badge>
                                  </td>
                                  <td>${formatPrice(price.originalPrice)}</td>
                                  <td>
                                    <strong>${formatPrice(price.finalPrice)}</strong>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-muted">No pricing available</p>
                        )}
                      </div>

                      {/* Converted Currencies (Will Be Updated) */}
                      <div className="mb-3">
                        <h6 className="text-warning mb-2">Converted Currencies (Will Be Refreshed)</h6>
                        {allCurrencies.length > 0 ? (
                          <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Table bordered size="sm">
                              <thead>
                                <tr>
                                  <th>Currency</th>
                                  <th>Type</th>
                                  <th>Current Final Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allCurrencies
                                  .filter(p => p.currencyCode !== 'USD')
                                  .slice(0, 10) // Show first 10 currencies
                                  .map((currencyPricing, currIdx) =>
                                    currencyPricing.prices?.slice(0, 2).map((price, priceIdx) => (
                                      <tr key={`${currIdx}-${priceIdx}`}>
                                        {priceIdx === 0 && (
                                          <td rowSpan={Math.min(currencyPricing.prices.length, 2)} className="align-middle">
                                            <strong>{currencyPricing.currencyCode}</strong>
                                            <br />
                                            <small className="text-muted">
                                              {getCurrencySymbol(currencyPricing.currencyCode)}
                                            </small>
                                          </td>
                                        )}
                                        <td>
                                          <Badge color="secondary">{price.type || "N/A"}</Badge>
                                        </td>
                                        <td>
                                          <strong>
                                            {getCurrencySymbol(currencyPricing.currencyCode)}
                                            {formatPrice(price.finalPrice)}
                                          </strong>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                              </tbody>
                            </Table>
                            {allCurrencies.filter(p => p.currencyCode !== 'USD').length > 10 && (
                              <small className="text-muted">Showing first 10 currencies. All currencies will be refreshed.</small>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted">No converted currencies available</p>
                        )}
                      </div>
                    </>
                  );
                })()}
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button color="secondary" onClick={() => setConfirmRefreshModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onClick={handleConfirmRefresh}
                    disabled={refreshingId === variantToRefresh._id}
                  >
                    {refreshingId === variantToRefresh._id ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <i className="mdi mdi-refresh me-1"></i>
                        Confirm Refresh
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </ModalBody>
        </Modal>
      </ModalBody>
    </Modal>
  );
};

export default VariantsPricingModal;

