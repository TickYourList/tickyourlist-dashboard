/**
 * ========================================
 * ENHANCED MARKUP CONFIGURATION MODAL
 * ========================================
 * 
 * Production-level modal for managing provider markup configurations
 * Features:
 * - Multiple markup configs per variant
 * - Support for all providers (Klook, Bokun, Ventrata, etc.)
 * - Priority management with reordering (up/down buttons)
 * - Hierarchical configuration (VARIANT → PRODUCT → PROVIDER → GLOBAL)
 * - Rule-based conditions
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
    UncontrolledTooltip,
} from "reactstrap";
import classnames from "classnames";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    fetchMarkupConfigsRequest,
    upsertMarkupConfigRequest,
    updateMarkupConfigRequest,
    deleteMarkupConfigRequest,
    reorderMarkupConfigsRequest,
} from "store/tickyourlist/travelTourGroup/action";
import { getAllMarkupConfigsForVariant } from "helpers/location_management_helper";

// All supported providers
const PROVIDERS = [
    { value: "KLOOK_AGENT", label: "Klook Agent" },
    { value: "KLOOK_OCTO", label: "Klook Octo" },
    { value: "BOKUN", label: "Bokun" },
    { value: "BOKUN_OCTO", label: "Bokun Octo" },
    { value: "VENTRATA", label: "Ventrata" },
    { value: "REZDY", label: "Rezdy" },
    { value: "REZDY_OCTO", label: "Rezdy Octo" },
    { value: "OCTO_NATIVE", label: "Octo Native" },
];

const MarkupConfigModal = ({
    isOpen,
    toggle,
    provider = null, // null = show all providers
    tourGroupId = null,
    variantId = null,
    level = "VARIANT", // GLOBAL, PROVIDER, PRODUCT, VARIANT
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
    const [selectedProvider, setSelectedProvider] = useState(provider || "KLOOK_AGENT");
    const [allVariantConfigs, setAllVariantConfigs] = useState(null); // For variant level: all configs across providers
    const [loadingAllConfigs, setLoadingAllConfigs] = useState(false);
    const [reordering, setReordering] = useState(false);

    const [formData, setFormData] = useState({
        level: level,
        provider: selectedProvider,
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
            currency: "USD",
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
            if (level === "VARIANT" && variantId) {
                // Fetch all configs for variant (all providers)
                fetchAllVariantConfigs();
            } else {
                // Fetch configs for specific provider/level
                dispatch(fetchMarkupConfigsRequest(selectedProvider, level, tourGroupId, variantId, true));
            }
        }
    }, [isOpen, selectedProvider, level, tourGroupId, variantId, dispatch]);

    // Fetch all markup configs for a variant (across all providers)
    const fetchAllVariantConfigs = async () => {
        if (!variantId || !tourGroupId) return;

        setLoadingAllConfigs(true);
        try {
            const response = await getAllMarkupConfigsForVariant(variantId, tourGroupId);
            const data = response?.data?.data || response?.data || response;
            setAllVariantConfigs(data);
        } catch (error) {
            console.error("Error fetching all variant configs:", error);
            showToastError("Failed to fetch markup configurations");
        } finally {
            setLoadingAllConfigs(false);
        }
    };

    // Update formData when selectedProvider changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            provider: selectedProvider,
        }));
    }, [selectedProvider]);

    // Reset form when editing config changes
    useEffect(() => {
        if (editingConfig) {
            setFormData({
                level: editingConfig.level || level,
                provider: editingConfig.provider || selectedProvider,
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
                provider: selectedProvider,
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
                    currency: "USD",
                    roundingRule: "NONE",
                    minPrice: undefined,
                    maxPrice: undefined,
                },
                isActive: true,
                isDefault: false,
            });
        }
    }, [editingConfig, level, selectedProvider, tourGroupId, variantId]);

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
            if (level === "VARIANT" && variantId) {
                fetchAllVariantConfigs();
            } else {
                dispatch(fetchMarkupConfigsRequest(selectedProvider, level, tourGroupId, variantId, true));
            }
        }, 1000);
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setSelectedProvider(config.provider || selectedProvider);
        setActiveTab("form");
    };

    const handleDelete = (configId) => {
        if (window.confirm("Are you sure you want to delete this markup configuration?")) {
            dispatch(deleteMarkupConfigRequest(configId));
            setTimeout(() => {
                if (level === "VARIANT" && variantId) {
                    fetchAllVariantConfigs();
                } else {
                    dispatch(fetchMarkupConfigsRequest(selectedProvider, level, tourGroupId, variantId, true));
                }
            }, 500);
        }
    };

    const handleCancel = () => {
        setEditingConfig(null);
        setActiveTab("list");
        setFormData({
            level: level,
            provider: selectedProvider,
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
    };

    // Handle priority reordering (move up/down)
    const handlePriorityChange = async (configId, direction) => {
        if (reordering) return;

        setReordering(true);
        try {
            // Get current configs
            const currentConfigs = level === "VARIANT" && allVariantConfigs
                ? allVariantConfigs.variantConfigs || []
                : markupConfigs;

            // Sort by priority
            const sorted = [...currentConfigs].sort((a, b) => (b.priority || 0) - (a.priority || 0));
            const currentIndex = sorted.findIndex(c => c._id === configId);

            if (currentIndex === -1) {
                showToastError("Configuration not found");
                return;
            }

            // Calculate new priority
            let newPriority;
            if (direction === "up" && currentIndex > 0) {
                // Swap with previous (higher priority)
                const prevPriority = sorted[currentIndex - 1].priority || 50;
                const currentPriority = sorted[currentIndex].priority || 50;
                newPriority = prevPriority + 1;
            } else if (direction === "down" && currentIndex < sorted.length - 1) {
                // Swap with next (lower priority)
                const nextPriority = sorted[currentIndex + 1].priority || 50;
                const currentPriority = sorted[currentIndex].priority || 50;
                newPriority = Math.max(1, nextPriority - 1);
            } else {
                setReordering(false);
                return; // Can't move further
            }

            // Update priority - format for backend API
            const updates = sorted.map((config, idx) => ({
                _id: config._id,
                priority: config._id === configId ? newPriority : config.priority || 50,
            }));

            // Dispatch action through Redux to handle refresh automatically
            dispatch(reorderMarkupConfigsRequest(
                updates,
                selectedProvider,
                level,
                tourGroupId,
                variantId
            ));
        } catch (error) {
            console.error("Error reordering priorities:", error);
            showToastError("Failed to update priority");
        } finally {
            setReordering(false);
        }
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
            case "NO_MARKUP": return "No Markup";
            case "DISCOUNT": return "Discount";
            case "CUSTOM_PRICE": return "Custom Price";
            default: return type;
        }
    };

    // Get provider display name
    const getProviderDisplayName = (providerValue) => {
        const provider = PROVIDERS.find(p => p.value === providerValue);
        return provider ? provider.label : providerValue;
    };

    // Get configurations to display
    const getDisplayConfigs = () => {
        if (level === "VARIANT" && allVariantConfigs) {
            return allVariantConfigs.variantConfigs || [];
        }
        return markupConfigs;
    };

    // Group configs by provider (for variant level)
    const getConfigsByProvider = () => {
        const configs = getDisplayConfigs();
        const grouped = {};

        configs.forEach(config => {
            const prov = config.provider || "UNKNOWN";
            if (!grouped[prov]) {
                grouped[prov] = [];
            }
            grouped[prov].push(config);
        });

        // Sort each group by priority
        Object.keys(grouped).forEach(prov => {
            grouped[prov].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        });

        return grouped;
    };

    const displayConfigs = getDisplayConfigs();
    const configsByProvider = level === "VARIANT" ? getConfigsByProvider() : {};

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>
                Markup Configuration - {getLevelDisplayName(level)}
                {variantId && level === "VARIANT" && " (All Providers)"}
            </ModalHeader>
            <ModalBody>
                {/* Provider Selection (for VARIANT level or when provider is null) */}
                {(level === "VARIANT" || !provider) && (
                    <Card className="mb-3">
                        <CardBody>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provider</Label>
                                        <Input
                                            type="select"
                                            value={selectedProvider}
                                            onChange={(e) => {
                                                setSelectedProvider(e.target.value);
                                                if (level !== "VARIANT") {
                                                    dispatch(fetchMarkupConfigsRequest(e.target.value, level, tourGroupId, variantId, true));
                                                }
                                            }}
                                        >
                                            {PROVIDERS.map(prov => (
                                                <option key={prov.value} value={prov.value}>
                                                    {prov.label}
                                                </option>
                                            ))}
                                        </Input>
                                        <small className="text-muted">
                                            {level === "VARIANT"
                                                ? "Select provider to add new configuration"
                                                : "Select provider to view configurations"}
                                        </small>
                                    </FormGroup>
                                </Col>
                                {level === "VARIANT" && allVariantConfigs && (
                                    <Col md={6}>
                                        <Alert color="info" className="mb-0">
                                            <strong>Available Providers:</strong>{" "}
                                            {allVariantConfigs.providers?.length > 0
                                                ? allVariantConfigs.providers.map(p => getProviderDisplayName(p)).join(", ")
                                                : "None"}
                                        </Alert>
                                    </Col>
                                )}
                            </Row>
                        </CardBody>
                    </Card>
                )}

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
                            Configurations ({displayConfigs.length})
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
                        {(loadingAllConfigs || markupConfigsLoading) ? (
                            <div className="text-center py-4">
                                <Spinner color="primary" />
                                <p className="mt-2">Loading configurations...</p>
                            </div>
                        ) : displayConfigs.length === 0 ? (
                            <Alert color="info">
                                No markup configurations found. Click "New Configuration" to create one.
                            </Alert>
                        ) : level === "VARIANT" && Object.keys(configsByProvider).length > 0 ? (
                            // Variant level: Show grouped by provider
                            <div>
                                {Object.keys(configsByProvider).map(providerKey => (
                                    <Card key={providerKey} className="mb-3">
                                        <CardBody>
                                            <h6 className="mb-3">
                                                <Badge color="primary">{getProviderDisplayName(providerKey)}</Badge>
                                                <span className="ms-2 text-muted">
                                                    ({configsByProvider[providerKey].length} configuration{configsByProvider[providerKey].length !== 1 ? 's' : ''})
                                                </span>
                                            </h6>
                                            <Table responsive size="sm">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40px' }}>Priority</th>
                                                        <th>Tag</th>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Value</th>
                                                        <th>Priority #</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {configsByProvider[providerKey].map((config, idx) => (
                                                        <tr key={config._id}>
                                                            <td>
                                                                <div className="d-flex flex-column gap-1">
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0"
                                                                        onClick={() => handlePriorityChange(config._id, "up")}
                                                                        disabled={reordering || idx === 0}
                                                                        title="Move Up (Increase Priority)"
                                                                    >
                                                                        <i className="mdi mdi-arrow-up"></i>
                                                                    </Button>
                                                                    <Button
                                                                        color="link"
                                                                        size="sm"
                                                                        className="p-0"
                                                                        onClick={() => handlePriorityChange(config._id, "down")}
                                                                        disabled={reordering || idx === configsByProvider[providerKey].length - 1}
                                                                        title="Move Down (Decrease Priority)"
                                                                    >
                                                                        <i className="mdi mdi-arrow-down"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
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
                                                                ) : config.markupConfig?.type === "FIXED_AMOUNT" ? (
                                                                    <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.value?.toFixed(2) || "0.00"}</>
                                                                ) : config.markupConfig?.type === "DISCOUNT" ? (
                                                                    <>{config.markupConfig?.value}%</>
                                                                ) : config.markupConfig?.type === "CUSTOM_PRICE" ? (
                                                                    <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.customPrice?.toFixed(2) || "0.00"}</>
                                                                ) : (
                                                                    <>{config.markupConfig?.value || "—"}</>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Badge color="info">{config.priority}</Badge>
                                                            </td>
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
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            // Other levels: Show simple table
                            <Table responsive size="sm">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>Priority</th>
                                        <th>Tag</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Value</th>
                                        <th>Priority #</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayConfigs
                                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                                        .map((config, idx) => (
                                            <tr key={config._id}>
                                                <td>
                                                    <div className="d-flex flex-column gap-1">
                                                        <Button
                                                            color="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() => handlePriorityChange(config._id, "up")}
                                                            disabled={reordering || idx === 0}
                                                            title="Move Up (Increase Priority)"
                                                        >
                                                            <i className="mdi mdi-arrow-up"></i>
                                                        </Button>
                                                        <Button
                                                            color="link"
                                                            size="sm"
                                                            className="p-0"
                                                            onClick={() => handlePriorityChange(config._id, "down")}
                                                            disabled={reordering || idx === displayConfigs.length - 1}
                                                            title="Move Down (Decrease Priority)"
                                                        >
                                                            <i className="mdi mdi-arrow-down"></i>
                                                        </Button>
                                                    </div>
                                                </td>
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
                                                    ) : config.markupConfig?.type === "FIXED_AMOUNT" ? (
                                                        <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.value?.toFixed(2) || "0.00"}</>
                                                    ) : config.markupConfig?.type === "DISCOUNT" ? (
                                                        <>{config.markupConfig?.value}%</>
                                                    ) : config.markupConfig?.type === "CUSTOM_PRICE" ? (
                                                        <>{config.markupConfig?.currency || "USD"} {config.markupConfig?.customPrice?.toFixed(2) || "0.00"}</>
                                                    ) : (
                                                        <>{config.markupConfig?.value || "—"}</>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge color="info">{config.priority}</Badge>
                                                </td>
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
                                        <Label>Provider {level !== "GLOBAL" && <span className="text-danger">*</span>}</Label>
                                        <Input
                                            type="select"
                                            name="provider"
                                            value={formData.provider}
                                            onChange={handleInputChange}
                                            required={level !== "GLOBAL"}
                                            disabled={level === "GLOBAL"}
                                        >
                                            <option value="">Select Provider</option>
                                            {PROVIDERS.map(prov => (
                                                <option key={prov.value} value={prov.value}>
                                                    {prov.label}
                                                </option>
                                            ))}
                                        </Input>
                                        <small className="text-muted">Select the provider for this markup configuration</small>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Tag <span className="text-danger">*</span></Label>
                                        <Input
                                            type="text"
                                            name="tag"
                                            value={formData.tag}
                                            onChange={handleInputChange}
                                            placeholder="e.g., default, winter_premium, summer_discount"
                                            required
                                        />
                                        <small className="text-muted">Unique identifier for this configuration</small>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
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
                                        <small className="text-muted">
                                            Higher number = higher priority (1-100). Higher priority configs are evaluated first.
                                        </small>
                                    </FormGroup>
                                </Col>
                            </Row>

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
                                            <option value="ORIGINAL_PRICE">Original Product Price (TYL Variant)</option>
                                            <option value="LIVE_SELLING_PRICE">Live Selling Price (Provider API)</option>
                                            <option value="CUSTOM">Custom Base Price</option>
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
                                                required
                                            />
                                        </FormGroup>
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Currency</Label>
                                        <Input
                                            type="select"
                                            name="markupConfig.currency"
                                            value={formData.markupConfig.currency || "USD"}
                                            onChange={handleInputChange}
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="INR">INR - Indian Rupee</option>
                                            <option value="SGD">SGD - Singapore Dollar</option>
                                            <option value="AUD">AUD - Australian Dollar</option>
                                            <option value="CAD">CAD - Canadian Dollar</option>
                                            <option value="JPY">JPY - Japanese Yen</option>
                                            <option value="AED">AED - UAE Dirham</option>
                                            <option value="SAR">SAR - Saudi Riyal</option>
                                        </Input>
                                        <small className="text-muted">
                                            Currency for fixed amount markup (important for FIXED_AMOUNT and CUSTOM_PRICE types)
                                        </small>
                                    </FormGroup>
                                </Col>
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
                                            <option value="NEAREST">Round to Nearest</option>
                                            <option value="NEAREST_5">Round to Nearest 5</option>
                                            <option value="NEAREST_10">Round to Nearest 10</option>
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Min Price (Optional)</Label>
                                        <Input
                                            type="number"
                                            name="markupConfig.minPrice"
                                            value={formData.markupConfig.minPrice || ""}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            placeholder="Minimum price"
                                        />
                                        <small className="text-muted">Enforce minimum price</small>
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
                                            placeholder="Maximum price"
                                        />
                                        <small className="text-muted">Enforce maximum price</small>
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

                            {/* Preview Section */}
                            <Card className="mt-3">
                                <CardBody>
                                    <h6>Price Preview</h6>
                                    <p className="mb-1">
                                        <strong>Provider:</strong> {formData.provider ? getProviderDisplayName(formData.provider) : "—"}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Base Price Source:</strong> {formData.markupConfig.priceSource || "B2B_PRICE"}
                                    </p>
                                    {formData.markupConfig.priceSource === "CUSTOM" && (
                                        <p className="mb-1">
                                            <strong>Custom Base Price:</strong> {formData.markupConfig.currency || "USD"} {formData.markupConfig.customPrice?.toFixed(2) || "0.00"}
                                        </p>
                                    )}
                                    <p className="mb-1">
                                        <strong>Example Base Price:</strong> {formData.markupConfig.currency || "USD"} 100.00
                                    </p>
                                    <p className="mb-1">
                                        <strong>Markup Type:</strong> {getMarkupTypeDisplayName(formData.markupConfig.type)}
                                    </p>
                                    {formData.markupConfig.type !== "NO_MARKUP" && formData.markupConfig.type !== "CUSTOM_PRICE" && (
                                        <p className="mb-1">
                                            <strong>Markup Value:</strong>{" "}
                                            {formData.markupConfig.type === "PERCENTAGE" || formData.markupConfig.type === "DISCOUNT" ? (
                                                <>{formData.markupConfig.value || 0}%</>
                                            ) : formData.markupConfig.type === "FIXED_AMOUNT" ? (
                                                <>{formData.markupConfig.currency || "USD"} {formData.markupConfig.value?.toFixed(2) || "0.00"}</>
                                            ) : (
                                                <>{formData.markupConfig.value || "—"}</>
                                            )}
                                        </p>
                                    )}
                                    {formData.markupConfig.type === "CUSTOM_PRICE" && (
                                        <p className="mb-1">
                                            <strong>Custom Final Price:</strong> {formData.markupConfig.currency || "USD"} {formData.markupConfig.customPrice?.toFixed(2) || "0.00"}
                                        </p>
                                    )}
                                    <p className="mb-1">
                                        <strong>Calculated Final Price:</strong>{" "}
                                        <span className="text-success fw-bold">
                                            {(() => {
                                                const basePrice = 100; // Example base price
                                                let finalPrice = basePrice;

                                                if (formData.markupConfig.type === "PERCENTAGE") {
                                                    finalPrice = basePrice * (1 + (formData.markupConfig.value || 0) / 100);
                                                } else if (formData.markupConfig.type === "FIXED_AMOUNT") {
                                                    finalPrice = basePrice + (formData.markupConfig.value || 0);
                                                } else if (formData.markupConfig.type === "DISCOUNT") {
                                                    finalPrice = basePrice * (1 - (formData.markupConfig.value || 0) / 100);
                                                } else if (formData.markupConfig.type === "CUSTOM_PRICE") {
                                                    finalPrice = formData.markupConfig.customPrice || basePrice;
                                                } else if (formData.markupConfig.type === "NO_MARKUP") {
                                                    finalPrice = basePrice;
                                                }

                                                return `${formData.markupConfig.currency || "USD"} ${finalPrice.toFixed(2)}`;
                                            })()}
                                        </span>
                                    </p>
                                    {formData.markupConfig.type === "FIXED_AMOUNT" && (
                                        <p className="mb-1 text-muted">
                                            <small>
                                                <i className="mdi mdi-information-outline"></i> Fixed amount ({formData.markupConfig.currency || "USD"} {formData.markupConfig.value?.toFixed(2) || "0.00"}) is added to the base price.
                                            </small>
                                        </p>
                                    )}
                                    <p className="mb-0">
                                        <strong>Priority:</strong> {formData.priority} (Higher = evaluated first)
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
