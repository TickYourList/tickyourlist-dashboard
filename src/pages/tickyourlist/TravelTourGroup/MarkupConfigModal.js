/**
 * ========================================
 * MARKUP CONFIGURATION MODAL
 * ========================================
 * 
 * Modal for managing provider markup configurations
 * Supports hierarchical configuration (GLOBAL → PROVIDER → PRODUCT → VARIANT)
 * 
 * ========================================
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Label,
    Input,
    Spinner,
    Card,
    CardBody,
    Table,
    Badge,
    Alert,
    FormGroup,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    fetchMarkupConfigsRequest,
    upsertMarkupConfigRequest,
    updateMarkupConfigRequest,
    deleteMarkupConfigRequest,
} from "store/tickyourlist/travelTourGroup/action";

const MarkupConfigModal = ({
    isOpen,
    toggle,
    provider = "KLOOK_AGENT",
    tourGroupId = null,
    variantId = null,
    level = "PROVIDER", // GLOBAL, PROVIDER, PRODUCT, VARIANT
}) => {
    const dispatch = useDispatch();
    const {
        markupConfigs,
        markupConfigsLoading,
        upsertingMarkupConfig,
        updatingMarkupConfig,
        deletingMarkupConfig,
    } = useSelector((state) => ({
        markupConfigs: state.tourGroup?.markupConfigs || [],
        markupConfigsLoading: state.tourGroup?.markupConfigsLoading || false,
        upsertingMarkupConfig: state.tourGroup?.upsertingMarkupConfig || false,
        updatingMarkupConfig: state.tourGroup?.updatingMarkupConfig || false,
        deletingMarkupConfig: state.tourGroup?.deletingMarkupConfig || false,
    }));

    const [activeTab, setActiveTab] = useState("list");
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        level: level,
        provider: provider,
        tourGroupId: tourGroupId,
        variantId: variantId,
        tag: "default",
        name: "",
        description: "",
        priority: 50,
        markupConfig: {
            type: "PERCENTAGE",
            value: 20,
            priceSource: "B2B_PRICE",
            customPrice: undefined,
            roundingRule: "NONE",
            minPrice: undefined,
            maxPrice: undefined,
        },
        isActive: true,
        isDefault: false,
    });

    // Fetch configurations when modal opens
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchMarkupConfigsRequest(provider, level, tourGroupId, variantId, true));
        }
    }, [isOpen, provider, level, tourGroupId, variantId, dispatch]);

    // Reset form when editing config changes
    useEffect(() => {
        if (editingConfig) {
            setFormData({
                level: editingConfig.level || level,
                provider: editingConfig.provider || provider,
                tourGroupId: editingConfig.tourGroupId || tourGroupId,
                variantId: editingConfig.variantId || variantId,
                tag: editingConfig.tag || "default",
                name: editingConfig.name || "",
                description: editingConfig.description || "",
                priority: editingConfig.priority || 50,
                markupConfig: editingConfig.markupConfig || {
                    type: "PERCENTAGE",
                    value: 20,
                    priceSource: "B2B_PRICE",
                    customPrice: undefined,
                    roundingRule: "NONE",
                },
                isActive: editingConfig.isActive !== undefined ? editingConfig.isActive : true,
                isDefault: editingConfig.isDefault || false,
            });
        } else {
            // Reset to defaults
            setFormData({
                level: level,
                provider: provider,
                tourGroupId: tourGroupId,
                variantId: variantId,
                tag: "default",
                name: "",
                description: "",
                priority: 50,
                markupConfig: {
                    type: "PERCENTAGE",
                    value: 20,
                    priceSource: "B2B_PRICE",
                    customPrice: undefined,
                    roundingRule: "NONE",
                    minPrice: undefined,
                    maxPrice: undefined,
                },
                isActive: true,
                isDefault: false,
            });
        }
    }, [editingConfig, level, provider, tourGroupId, variantId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("markupConfig.")) {
            const field = name.split(".")[1];
            setFormData({
                ...formData,
                markupConfig: {
                    ...formData.markupConfig,
                    [field]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) || 0 : value),
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) || 0 : value),
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.tag || !formData.name) {
            showToastError("Tag and Name are required");
            return;
        }

        // Validation based on markup type
        if (formData.markupConfig.type === "NO_MARKUP" || formData.markupConfig.type === "CUSTOM_PRICE") {
            // NO_MARKUP doesn't need value, CUSTOM_PRICE needs customPrice
            if (formData.markupConfig.type === "CUSTOM_PRICE" && (!formData.markupConfig.customPrice || formData.markupConfig.customPrice <= 0)) {
                showToastError("Custom price must be greater than 0");
                return;
            }
        } else if (!formData.markupConfig.value || formData.markupConfig.value <= 0) {
            showToastError("Markup value must be greater than 0");
            return;
        }

        // Determine if creating or updating
        if (editingConfig?._id) {
            dispatch(updateMarkupConfigRequest(editingConfig._id, formData));
        } else {
            dispatch(upsertMarkupConfigRequest(formData));
        }

        // Reset after a delay
        setTimeout(() => {
            setEditingConfig(null);
            setActiveTab("list");
        }, 1000);
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setActiveTab("form");
    };

    const handleDelete = (configId) => {
        if (window.confirm("Are you sure you want to delete this markup configuration?")) {
            dispatch(deleteMarkupConfigRequest(configId));
        }
    };

    const handleCancel = () => {
        setEditingConfig(null);
        setActiveTab("list");
        setFormData({
            level: level,
            provider: provider,
            tourGroupId: tourGroupId,
            variantId: variantId,
            tag: "default",
            name: "",
            description: "",
            priority: 50,
            markupConfig: {
                type: "PERCENTAGE",
                value: 20,
                roundingRule: "NONE",
                minPrice: undefined,
                maxPrice: undefined,
            },
            isActive: true,
            isDefault: false,
        });
    };

    // Get level display name
    const getLevelDisplayName = (level) => {
        switch (level) {
            case "GLOBAL": return "Global";
            case "PROVIDER": return "Provider";
            case "PRODUCT": return "Product";
            case "VARIANT": return "Variant";
            default: return level;
        }
    };

    // Get markup type display name
    const getMarkupTypeDisplayName = (type) => {
        switch (type) {
            case "PERCENTAGE": return "Percentage";
            case "FIXED_AMOUNT": return "Fixed Amount";
            case "TIERED": return "Tiered";
            case "NO_MARKUP": return "No Markup (Keep Original)";
            case "DISCOUNT": return "Discount";
            case "CUSTOM_PRICE": return "Custom Fixed Price";
            default: return type;
        }
    };

    // Get price source display name
    const getPriceSourceDisplayName = (source) => {
        switch (source) {
            case "B2B_PRICE": return "B2B Price (Provider Wholesale)";
            case "ORIGINAL_PRICE": return "Original Product Price";
            case "LIVE_SELLING_PRICE": return "Live Selling Price (Klook API)";
            case "CUSTOM": return "Custom Price";
            default: return source || "B2B Price";
        }
    };

    // Calculate B2C price preview
    const calculatePreview = (basePrice = 100) => {
        const { type, value, customPrice } = formData.markupConfig;
        if (type === "NO_MARKUP") {
            return basePrice;
        } else if (type === "CUSTOM_PRICE") {
            return customPrice || basePrice;
        } else if (type === "DISCOUNT") {
            return basePrice * (1 - value / 100);
        } else if (type === "PERCENTAGE") {
            return basePrice * (1 + value / 100);
        } else if (type === "FIXED_AMOUNT") {
            return basePrice + value;
        }
        return basePrice;
    };

    // Get base price for preview based on priceSource
    const getPreviewBasePrice = () => {
        const { priceSource, customPrice } = formData.markupConfig;
        switch (priceSource) {
            case "ORIGINAL_PRICE":
                return 120; // Example original price
            case "LIVE_SELLING_PRICE":
                return 150; // Example live selling price
            case "CUSTOM":
                return customPrice || 100;
            case "B2B_PRICE":
            default:
                return 100; // B2B price
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Markup Configuration - {getLevelDisplayName(level)}
                {provider && ` (${provider})`}
            </ModalHeader>
            <ModalBody>
                <Nav tabs className="nav-tabs-custom">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "list" })}
                            onClick={() => {
                                setActiveTab("list");
                                setEditingConfig(null);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="mdi mdi-format-list-bulleted me-1"></i>
                            Configurations ({markupConfigs.length})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === "form" })}
                            onClick={() => setActiveTab("form")}
                            style={{ cursor: "pointer" }}
                        >
                            <i className="mdi mdi-plus-circle me-1"></i>
                            {editingConfig ? "Edit Configuration" : "New Configuration"}
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="p-3">
                    <TabPane tabId="list">
                        {markupConfigsLoading ? (
                            <div className="text-center py-4">
                                <Spinner color="primary" />
                                <p className="mt-2">Loading configurations...</p>
                            </div>
                        ) : markupConfigs.length === 0 ? (
                            <Alert color="info">
                                No markup configurations found. Click "New Configuration" to create one.
                            </Alert>
                        ) : (
                            <Table responsive size="sm">
                                <thead>
                                    <tr>
                                        <th>Tag</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Value</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {markupConfigs
                                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                                        .map((config) => (
                                            <tr key={config._id}>
                                                <td>
                                                    <Badge color="primary">{config.tag}</Badge>
                                                    {config.isDefault && (
                                                        <Badge color="success" className="ms-1">Default</Badge>
                                                    )}
                                                </td>
                                                <td>{config.name}</td>
                                                <td>{getMarkupTypeDisplayName(config.markupConfig?.type)}</td>
                                                <td>
                                                    {config.markupConfig?.type === "PERCENTAGE" ? (
                                                        <>{config.markupConfig?.value}%</>
                                                    ) : (
                                                        <>{config.markupConfig?.value}</>
                                                    )}
                                                </td>
                                                <td>{config.priority}</td>
                                                <td>
                                                    {config.isActive ? (
                                                        <Badge color="success">Active</Badge>
                                                    ) : (
                                                        <Badge color="secondary">Inactive</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleEdit(config)}
                                                    >
                                                        <i className="mdi mdi-pencil"></i>
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(config._id)}
                                                        disabled={deletingMarkupConfig}
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        )}
                    </TabPane>

                    <TabPane tabId="form">
                        <form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Tag <span className="text-danger">*</span></Label>
                                        <Input
                                            type="text"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleInputChange}
                                            placeholder="e.g., default, winter_premium"
                                            required
                                        />
                                        <small className="text-muted">Unique identifier for this configuration</small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Priority</Label>
                                        <Input
                                            type="number"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            min={1}
                                            max={100}
                                            required
                                        />
                                        <small className="text-muted">Higher number = higher priority (1-100)</small>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <FormGroup>
                                <Label>Name <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Default Klook Markup"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Description of this markup configuration"
                                    rows={2}
                                />
                            </FormGroup>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Price Source <span className="text-danger">*</span></Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.priceSource"
                                            value={formData.markupConfig.priceSource || "B2B_PRICE"}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="B2B_PRICE">B2B Price (Provider Wholesale)</option>
                                            <option value="ORIGINAL_PRICE">Original Product Price</option>
                                            <option value="LIVE_SELLING_PRICE">Live Selling Price (Klook API)</option>
                                            <option value="CUSTOM">Custom Price</option>
                                        </Input>
                                        <small className="text-muted">Base price to apply markup on</small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    {formData.markupConfig.priceSource === "CUSTOM" && (
                                        <FormGroup>
                                            <Label>Custom Base Price <span className="text-danger">*</span></Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.customPrice"
                                                value={formData.markupConfig.customPrice || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={0.01}
                                                placeholder="Enter custom price"
                                                required={formData.markupConfig.priceSource === "CUSTOM"}
                                            />
                                        </FormGroup>
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Markup Type <span className="text-danger">*</span></Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.type"
                                            value={formData.markupConfig.type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="NO_MARKUP">No Markup (Keep Original)</option>
                                            <option value="PERCENTAGE">Percentage Markup</option>
                                            <option value="FIXED_AMOUNT">Fixed Amount Markup</option>
                                            <option value="DISCOUNT">Discount</option>
                                            <option value="CUSTOM_PRICE">Custom Fixed Price</option>
                                            <option value="TIERED">Tiered (Advanced)</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    {formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE" && (
                                        <FormGroup>
                                            <Label>
                                                {formData.markupConfig.type === "DISCOUNT" ? "Discount" : "Markup"} Value <span className="text-danger">*</span>
                                                {formData.markupConfig.type === "PERCENTAGE" && " (%)"}
                                                {formData.markupConfig.type === "DISCOUNT" && " (%)"}
                                                {formData.markupConfig.type === "FIXED_AMOUNT" && " (Fixed Amount)"}
                                            </Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.value"
                                                value={formData.markupConfig.value || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={formData.markupConfig.type === "PERCENTAGE" || formData.markupConfig.type === "DISCOUNT" ? 1 : 0.01}
                                                required={formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE"}
                                            />
                                        </FormGroup>
                                    )}
                                    {formData.markupConfig.type === "CUSTOM_PRICE" && (
                                        <FormGroup>
                                            <Label>Custom Final Price <span className="text-danger">*</span></Label>
                                            <Input
                                                type="number"
                                                name="markupConfig.customPrice"
                                                value={formData.markupConfig.customPrice || ""}
                                                onChange={handleInputChange}
                                                min={0}
                                                step={0.01}
                                                placeholder="Enter final price"
                                                required
                                            />
                                        </FormGroup>
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Rounding Rule</Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.roundingRule"
                                            value={formData.markupConfig.roundingRule || "NONE"}
                                            onChange={handleInputChange}
                                        >
                                            <option value="NONE">None</option>
                                            <option value="UP">Round Up</option>
                                            <option value="DOWN">Round Down</option>
                                            <option value="NEAREST">Round Nearest</option>
                                            <option value="NEAREST_5">Round to Nearest 5</option>
                                            <option value="NEAREST_10">Round to Nearest 10</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Min Price (Optional)</Label>
                                        <Input
                                            type="number"
                                            name="markupConfig.minPrice"
                                            value={formData.markupConfig.minPrice || ""}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="No minimum"
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Max Price (Optional)</Label>
                                        <Input
                                            type="number"
                                            name="markupConfig.maxPrice"
                                            value={formData.markupConfig.maxPrice || ""}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="No maximum"
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup check>
                                        <Input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <Label check>Active</Label>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup check>
                                        <Input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleInputChange}
                                        />
                                        <Label check>Default Configuration</Label>
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Preview */}
                            <Card className="mt-3">
                                <CardBody>
                                    <h6>Price Preview</h6>
                                    <p className="mb-1">
                                        <strong>Base Price Source:</strong> {getPriceSourceDisplayName(formData.markupConfig.priceSource)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Base Price:</strong> ${getPreviewBasePrice().toFixed(2)}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Markup Type:</strong> {getMarkupTypeDisplayName(formData.markupConfig.type)}
                                    </p>
                                    {formData.markupConfig.type !== "NO_MARKUP" && (
                                        <p className="mb-1">
                                            <strong>
                                                {formData.markupConfig.type === "DISCOUNT" ? "Discount" : 
                                                 formData.markupConfig.type === "CUSTOM_PRICE" ? "Custom Price" : 
                                                 "Markup"}:
                                            </strong>{" "}
                                            {formData.markupConfig.type === "CUSTOM_PRICE" ? (
                                                <>${(formData.markupConfig.customPrice || 0).toFixed(2)}</>
                                            ) : formData.markupConfig.type === "PERCENTAGE" || formData.markupConfig.type === "DISCOUNT" ? (
                                                <>{formData.markupConfig.value || 0}%</>
                                            ) : (
                                                <>${formData.markupConfig.value || 0}</>
                                            )}
                                        </p>
                                    )}
                                    <p className="mb-0">
                                        <strong>Final B2C Price:</strong> <span className="text-success">${calculatePreview(getPreviewBasePrice()).toFixed(2)}</span>
                                    </p>
                                </CardBody>
                            </Card>
                        </form>
                    </TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                {activeTab === "form" && (
                    <>
                        <Button color="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleSubmit}
                            disabled={upsertingMarkupConfig || updatingMarkupConfig}
                        >
                            {upsertingMarkupConfig || updatingMarkupConfig ? (
                                <>
                                    <Spinner size="sm" className="me-1" />
                                    {editingConfig ? "Updating..." : "Saving..."}
                                </>
                            ) : (
                                <>{editingConfig ? "Update" : "Save"} Configuration</>
                            )}
                        </Button>
                    </>
                )}
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default MarkupConfigModal;
