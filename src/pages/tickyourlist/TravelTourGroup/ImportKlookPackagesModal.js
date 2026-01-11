/**
 * ========================================
 * IMPORT KLOOK PACKAGES MODAL
 * ========================================
 * 
 * Allows user to:
 * 1. Search/Select a Klook activity
 * 2. View all packages from that activity
 * 3. Select packages to import
 * 4. Choose action: Add New, Replace Existing, or Connect with Existing
 * 
 * ========================================
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
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
    Badge,
    Table,
    Alert,
    FormGroup,
    Form,
} from "reactstrap";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    searchKlookActivitiesRequest,
    fetchKlookActivityRequest,
    createVariantFromKlookRequest,
    fetchKlookMappingsRequest,
    deleteKlookMappingRequest,
} from "store/tickyourlist/travelTourGroup/action";

const ImportKlookPackagesModal = ({
    isOpen,
    toggle,
    tourGroup,
    existingVariants = [],
    onSuccess,
}) => {
    const dispatch = useDispatch();
    const {
        klookActivities,
        klookActivity,
        klookSearching,
        klookActivityLoading,
        creatingVariantFromKlook,
        klookMappings,
    } = useSelector((state) => ({
        klookActivities: state.tourGroup?.klookActivities || [],
        klookActivity: state.tourGroup?.klookActivity,
        klookSearching: state.tourGroup?.klookSearching || false,
        klookActivityLoading: state.tourGroup?.klookActivityLoading || false,
        creatingVariantFromKlook: state.tourGroup?.creatingVariantFromKlook || false,
        klookMappings: state.tourGroup?.klookMappings || {},
    }));

    const [searchQuery, setSearchQuery] = useState("");
    const [klookActivityId, setKlookActivityId] = useState("");
    const [selectedPackages, setSelectedPackages] = useState([]); // Array of { packageId, action: 'add'|'replace'|'connect', existingVariantId?: string }
    const [packageActions, setPackageActions] = useState({}); // { packageId: { action: 'add'|'replace'|'connect', existingVariantId?: string } }
    const [showPreview, setShowPreview] = useState(false); // Show preview step
    const [previewData, setPreviewData] = useState({}); // Preview data for each package
    const [editingPackageId, setEditingPackageId] = useState(null); // Currently editing package

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setSearchQuery("");
            setKlookActivityId("");
            setSelectedPackages([]);
            setPackageActions({});
            setShowPreview(false);
            setPreviewData({});
            setEditingPackageId(null);
        }
    }, [isOpen]);

    // Fetch Klook mappings when tour group is available
    useEffect(() => {
        if (isOpen && tourGroup?._id) {
            dispatch(fetchKlookMappingsRequest(tourGroup._id));
        }
    }, [isOpen, tourGroup?._id, dispatch]);

    // Update klookActivityId when activity is loaded (for search results)
    useEffect(() => {
        if (klookActivity && !klookActivityId) {
            const activityId = klookActivity.activity_id || 
                              klookActivity.data?.activity?.activity_id ||
                              klookActivity.id;
            if (activityId) {
                setKlookActivityId(activityId.toString());
            }
        }
    }, [klookActivity, klookActivityId]);

    // Fetch Klook activity details
    const handleSearchKlookActivities = () => {
        const query = searchQuery.trim();
        if (!query) {
            showToastError("Please enter a search query or activity ID");
            return;
        }

        const activityId = parseInt(query, 10);
        if (!isNaN(activityId) && activityId > 0 && query === activityId.toString()) {
            // It's a valid activity ID - fetch directly
            setKlookActivityId(activityId.toString());
            dispatch(fetchKlookActivityRequest(activityId.toString()));
        } else {
            // It's a search query - search activities
            dispatch(searchKlookActivitiesRequest(query));
        }
    };

    // Handle package toggle (for available packages only)
    const handlePackageToggle = (packageId, isSelected) => {
        if (isSelected) {
            // Check if this package is already mapped to an existing variant
            const status = getPackageStatus(packageId);

            if (status.exists && !status.connected) {
                // Package exists but not connected - default to "connect"
                setPackageActions({
                    ...packageActions,
                    [packageId]: {
                        action: "connect",
                        existingVariantId: status.variant?._id || status.variant,
                    },
                });
                setSelectedPackages([...selectedPackages, packageId]);
            } else {
                // New package - default to "add"
                setPackageActions({
                    ...packageActions,
                    [packageId]: {
                        action: "add",
                    },
                });
                setSelectedPackages([...selectedPackages, packageId]);
            }
        } else {
            // Deselect package
            setSelectedPackages(selectedPackages.filter((id) => id !== packageId));
            const newActions = { ...packageActions };
            delete newActions[packageId];
            setPackageActions(newActions);
        }
    };

    // Handle action change for a package
    const handleActionChange = (packageId, action, existingVariantId = null) => {
        setPackageActions({
            ...packageActions,
            [packageId]: {
                action,
                existingVariantId: action === "connect" ? existingVariantId : null,
            },
        });
    };

    // Get activity ID from various possible locations
    const getActivityId = () => {
        if (klookActivityId) return klookActivityId;
        if (klookActivity?.activity_id) return klookActivity.activity_id.toString();
        if (klookActivity?.data?.activity?.activity_id) return klookActivity.data.activity.activity_id.toString();
        return null;
    };

    // Prepare preview data from selected packages
    const preparePreviewData = () => {
        const activityId = getActivityId();
        if (!activityId || !klookActivity) return {};

        const packages = klookActivity?.package_list || (klookActivity?.data?.activity?.package_list) || [];
        const activity = klookActivity?.data?.activity || klookActivity;
        const preview = {};

        selectedPackages.forEach((packageId) => {
            const pkg = packages.find(p => p.package_id === packageId);
            const action = packageActions[packageId];
            
            if (pkg && action) {
                // Extract description from activity or SKU titles
                const activityDescription = activity?.what_we_love || activity?.subtitle || '';
                const skuTitles = pkg.sku_list?.map(sku => sku.title).filter(Boolean).join(', ') || '';
                const variantDescription = activityDescription || skuTitles || '';

                // Map Klook package to TYL variant format for preview
                // Note: Pricing is not available in package data - it will be synced from schedules API
                preview[packageId] = {
                    packageId: packageId,
                    packageName: pkg.package_name || 'Untitled Package',
                    action: action.action,
                    // Variant preview data - aligned with TylTourGroupVariant schema
                    name: pkg.package_name || 'Untitled Variant',
                    variantInfo: variantDescription, // From activity what_we_love or SKU titles
                    ticketDeliveryInfo: pkg.voucher_usage_multilang || '', // Voucher usage info
                    confirmedTicketInfo: pkg.cancellation_type_multilang || '', // Cancellation info
                    minPax: pkg.package_min_pax || 1,
                    maxPax: pkg.package_max_pax || 999,
                    openDated: pkg.is_open_date || false,
                    hasTimeSlots: pkg.timeslot_type === 1 || false, // timeslot_type: 1 = has time slots
                    isInstant: pkg.instant === 1 || false,
                    isPrivate: false, // Not available from Klook
                    isHotelPickup: false, // Not available from Klook
                    // SKU information (pricing will be synced later from schedules API)
                    skuList: pkg.sku_list?.map(sku => ({
                        skuId: sku.sku_id,
                        title: sku.title || '',
                        skuType: sku.sku_type || 'GENERAL',
                        minAge: sku.min_age || 0,
                        maxAge: sku.max_age || 999,
                        required: sku.required === 1,
                        // Note: Pricing not available here - will be synced from schedules
                        priceNote: 'Pricing will be synced from provider schedules'
                    })) || [],
                    skuCount: pkg.sku_list?.length || 0,
                    // Additional Klook package metadata
                    cancellationType: pkg.cancellation_type_multilang || '',
                    voucherUsage: pkg.voucher_usage_multilang || '',
                    ticketType: pkg.ticket_type || 0,
                    timeZone: pkg.time_zone || activity?.time_zone || '+00:00',
                    // Activity-level info
                    activityTitle: activity?.title || '',
                    activityDescription: activity?.what_we_love || activity?.subtitle || '',
                    currency: activity?.currency || 'USD'
                };
            }
        });

        return preview;
    };

    // Handle preview button click
    const handlePreview = () => {
        const activityId = getActivityId();
        
        if (!activityId || !klookActivity) {
            showToastError("Please select a provider activity first");
            return;
        }

        if (selectedPackages.length === 0) {
            showToastError("Please select at least one package to import");
            return;
        }

        // Prepare and show preview
        const preview = preparePreviewData();
        setPreviewData(preview);
        setShowPreview(true);
    };

    // Handle final import after preview
    const handleFinalImport = () => {
        const activityId = getActivityId();
        
        // Import each selected package
        selectedPackages.forEach((packageId) => {
            const action = packageActions[packageId];
            
            if (!action) {
                showToastError(`No action specified for package ${packageId}`);
                return;
            }
            
            if (action.action === "add") {
                // Create new variant - saga will handle success/error toasts
                dispatch(
                    createVariantFromKlookRequest(
                        tourGroup._id,
                        activityId,
                        packageId
                    )
                );
            } else if (action.action === "replace") {
                // Replace existing variant - TODO: Implement replace logic
                showToastError(`Replace functionality for package ${packageId} will be implemented`);
            } else if (action.action === "connect") {
                // Connect with existing variant - TODO: Implement connect mapping logic
                showToastError(`Connect functionality for package ${packageId} will be implemented`);
            }
        });

        // Close modal after a short delay to allow dispatches to complete
        setTimeout(() => {
            if (onSuccess) {
                onSuccess();
            }
            setShowPreview(false);
            toggle();
        }, 500);
    };

    // Handle edit preview data
    const handleEditPreview = (packageId, field, value) => {
        setPreviewData(prev => ({
            ...prev,
            [packageId]: {
                ...prev[packageId],
                [field]: value
            }
        }));
    };

    // Get packages from activity
    const packages = klookActivity?.package_list ||
        (klookActivity?.data?.activity?.package_list) ||
        [];

    // Get Klook mappings for this tour group
    const mappings = klookMappings[tourGroup?._id] || [];

    // Check which packages are already mapped/connected
    const getPackageStatus = (packageId) => {
        // Check in mappings first (most reliable)
        const mapping = mappings.find(
            (m) => m.externalVariantId === packageId && m.isActive
        );
        
        if (mapping) {
            return {
                exists: true,
                connected: true,
                variant: mapping.variantId,
                mapping: mapping
            };
        }

        // Fallback to existing variants
        const existingVariant = existingVariants.find(
            (v) => v.externalVariantId === packageId
        );
        
        return existingVariant 
            ? { exists: true, connected: false, variant: existingVariant } 
            : { exists: false, connected: false };
    };

    // Separate packages into connected and available
    const connectedPackages = packages.filter(pkg => {
        const status = getPackageStatus(pkg.package_id);
        return status.connected;
    });

    const availablePackages = packages.filter(pkg => {
        const status = getPackageStatus(pkg.package_id);
        return !status.connected;
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>
                Import Variants from Provider
            </ModalHeader>
            <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {showPreview ? (
                    /* Preview Step */
                    <div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5>
                                <i className="mdi mdi-eye me-2"></i>
                                Preview & Review Variants
                            </h5>
                            <Button color="secondary" size="sm" onClick={() => setShowPreview(false)}>
                                <i className="mdi mdi-arrow-left me-1"></i>
                                Back to Selection
                            </Button>
                        </div>
                        <Alert color="info" className="mb-3">
                            <i className="mdi mdi-information me-2"></i>
                            Review how your variants will appear in the checkout UI. You can edit the details before finalizing.
                        </Alert>

                        {Object.keys(previewData).map((packageId) => {
                            const preview = previewData[packageId];
                            const isEditing = editingPackageId === packageId;
                            
                            return (
                                <Card key={packageId} className="mb-3 border-primary">
                                    <CardBody>
                                        {isEditing ? (
                                            /* Edit Mode */
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6>Edit Variant Details</h6>
                                                    <Button 
                                                        color="success" 
                                                        size="sm" 
                                                        onClick={() => setEditingPackageId(null)}
                                                    >
                                                        <i className="mdi mdi-check me-1"></i>
                                                        Save
                                                    </Button>
                                                </div>
                                                <Row>
                                                    <Col md={6}>
                                                        <Label>Variant Name</Label>
                                                        <Input
                                                            type="text"
                                                            value={preview.name}
                                                            onChange={(e) => handleEditPreview(packageId, 'name', e.target.value)}
                                                            placeholder="Variant name"
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Label>Variant Info</Label>
                                                        <Input
                                                            type="textarea"
                                                            rows="3"
                                                            value={preview.variantInfo}
                                                            onChange={(e) => handleEditPreview(packageId, 'variantInfo', e.target.value)}
                                                            placeholder="Variant description"
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mt-2">
                                                        <Label>Ticket Delivery Info</Label>
                                                        <Input
                                                            type="textarea"
                                                            rows="2"
                                                            value={preview.ticketDeliveryInfo}
                                                            onChange={(e) => handleEditPreview(packageId, 'ticketDeliveryInfo', e.target.value)}
                                                            placeholder="Ticket delivery information"
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mt-2">
                                                        <Label>Confirmed Ticket Info</Label>
                                                        <Input
                                                            type="textarea"
                                                            rows="2"
                                                            value={preview.confirmedTicketInfo}
                                                            onChange={(e) => handleEditPreview(packageId, 'confirmedTicketInfo', e.target.value)}
                                                            placeholder="Confirmed ticket information"
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        ) : (
                                            /* Preview Mode - Checkout UI Style */
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div>
                                                        <h6 className="mb-1">{preview.name}</h6>
                                                        <Badge color="primary">{preview.action === 'add' ? 'New Variant' : preview.action}</Badge>
                                                    </div>
                                                    <Button 
                                                        color="primary" 
                                                        size="sm" 
                                                        onClick={() => setEditingPackageId(packageId)}
                                                    >
                                                        <i className="mdi mdi-pencil me-1"></i>
                                                        Edit
                                                    </Button>
                                                </div>

                                                {/* Checkout UI Style Card Preview */}
                                                <div className="border rounded p-3 bg-light" style={{ minHeight: "200px" }}>
                                                    <div className="mb-3">
                                                        <h5 className="text-sm font-semibold mb-2" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                                                            {preview.name}
                                                        </h5>
                                                        {preview.variantInfo && (
                                                            <p className="text-muted small mb-2" style={{ fontSize: "0.875rem" }}>
                                                                {preview.variantInfo}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* SKU Information (Pricing will be synced from schedules) */}
                                                    {preview.skuList && preview.skuList.length > 0 && (
                                                        <div className="mb-3">
                                                            <Label className="small text-muted d-flex align-items-center">
                                                                <i className="mdi mdi-ticket me-1"></i>
                                                                Ticket Types ({preview.skuList.length}):
                                                            </Label>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {preview.skuList.map((sku, idx) => (
                                                                    <div key={idx} className="border rounded p-2 bg-white">
                                                                        <div className="small">
                                                                            <strong>{sku.skuType}</strong>
                                                                            {sku.title && (
                                                                                <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>
                                                                                    - {sku.title}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            {sku.minAge > 0 || sku.maxAge < 999 ? (
                                                                                <span className="text-muted small">
                                                                                    Age: {sku.minAge}-{sku.maxAge} years
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-muted small">All ages</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <Badge color="info" style={{ fontSize: "0.7rem" }}>
                                                                                Pricing will be synced
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Alert color="info" className="mt-2 mb-0" style={{ fontSize: "0.75rem", padding: "0.5rem" }}>
                                                                <i className="mdi mdi-information me-1"></i>
                                                                Pricing will be automatically synced from provider schedules after import.
                                                            </Alert>
                                                        </div>
                                                    )}

                                                    {/* Variant Details */}
                                                    <div className="row small text-muted mb-3">
                                                        <div className="col-6 mb-2">
                                                            <i className="mdi mdi-account-group me-1"></i>
                                                            <strong>Pax:</strong> {preview.minPax} - {preview.maxPax}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <i className="mdi mdi-calendar me-1"></i>
                                                            <strong>Date Type:</strong> {preview.openDated ? 'Open Date' : 'Fixed Date'}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <i className="mdi mdi-clock me-1"></i>
                                                            <strong>Time Slots:</strong> {preview.hasTimeSlots ? 'Yes' : 'No'}
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <i className="mdi mdi-lightning-bolt me-1"></i>
                                                            <strong>Instant:</strong> {preview.isInstant ? 'Yes' : 'No'}
                                                        </div>
                                                        {preview.cancellationType && (
                                                            <div className="col-12 mb-2">
                                                                <i className="mdi mdi-cancel me-1"></i>
                                                                <strong>Cancellation:</strong> {preview.cancellationType}
                                                            </div>
                                                        )}
                                                        {preview.voucherUsage && (
                                                            <div className="col-12 mb-2">
                                                                <i className="mdi mdi-ticket-confirmation me-1"></i>
                                                                <strong>Voucher Usage:</strong> {preview.voucherUsage}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Activity Info */}
                                                    {preview.activityDescription && (
                                                        <div className="mt-3 pt-3 border-top">
                                                            <div className="small">
                                                                <strong><i className="mdi mdi-information me-1"></i>Activity Description:</strong>
                                                                <p className="mt-1 mb-0">{preview.activityDescription}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Ticket Info */}
                                                    {(preview.ticketDeliveryInfo || preview.confirmedTicketInfo) && (
                                                        <div className="mt-3 pt-3 border-top">
                                                            {preview.ticketDeliveryInfo && (
                                                                <div className="small mb-2">
                                                                    <strong><i className="mdi mdi-ticket-delivery me-1"></i>Voucher Usage:</strong> {preview.ticketDeliveryInfo}
                                                                </div>
                                                            )}
                                                            {preview.confirmedTicketInfo && (
                                                                <div className="small">
                                                                    <strong><i className="mdi mdi-check-circle me-1"></i>Cancellation Policy:</strong> {preview.confirmedTicketInfo}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Package Selection Step */
                    <>
                {/* Step 1: Search/Select Activity */}
                <Card className="mb-3">
                    <CardBody>
                        <h5 className="mb-3">Step 1: Select Provider Activity</h5>
                        <Row>
                            <Col md={8}>
                                <Label>Search or Enter Activity ID</Label>
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearchKlookActivities();
                                        }
                                    }}
                                    placeholder="Enter activity ID or search term"
                                />
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Button
                                    color="primary"
                                    onClick={handleSearchKlookActivities}
                                    disabled={klookSearching || klookActivityLoading || !searchQuery.trim()}
                                    className="w-100"
                                >
                                    {klookSearching || klookActivityLoading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            {klookActivityLoading ? "Fetching..." : "Searching..."}
                                        </>
                                    ) : (
                                        "Search / Fetch"
                                    )}
                                </Button>
                            </Col>
                        </Row>

                        {/* Activity Details */}
                        {klookActivity && (
                            <div className="mt-3 p-3 bg-light rounded">
                                <h6>{klookActivity.title || klookActivity.data?.activity?.title}</h6>
                                <small className="text-muted">
                                    Activity ID: {getActivityId() || 'N/A'}
                                    {klookActivity.currency && ` • Currency: ${klookActivity.currency}`}
                                </small>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Step 2: Select Packages */}
                {packages.length > 0 && (
                    <>
                        {/* Already Connected Packages */}
                        {connectedPackages.length > 0 && (
                            <Card className="mb-3 border-success">
                                <CardBody>
                                    <div className="d-flex align-items-center mb-3">
                                        <h5 className="mb-0 me-2">
                                            <i className="mdi mdi-check-circle text-success me-2"></i>
                                            Already Connected Packages
                                        </h5>
                                        <Badge color="success">{connectedPackages.length}</Badge>
                                    </div>
                                    <Alert color="info" className="mb-3">
                                        <i className="mdi mdi-information me-2"></i>
                                        These packages are already connected to TYL variants. You can manage, replace, or disconnect them.
                                    </Alert>
                                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        <Table responsive striped>
                                            <thead>
                                                <tr>
                                                    <th>Package Name</th>
                                                    <th>Package ID</th>
                                                    <th>SKUs</th>
                                                    <th>Connected Variant</th>
                                                    <th>Status</th>
                                                    <th style={{ width: "200px" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {connectedPackages.map((pkg) => {
                                                    const status = getPackageStatus(pkg.package_id);
                                                    const variantName = status.mapping?.variantName || 
                                                                       (status.variant?.name ? status.variant.name : 'N/A');
                                                    const mappingId = status.mapping?.mappingId;

                                                    const handleDisconnect = () => {
                                                        if (window.confirm(`Are you sure you want to disconnect "${pkg.package_name}" from "${variantName}"?`)) {
                                                            dispatch(deleteKlookMappingRequest(mappingId, tourGroup._id));
                                                        }
                                                    };

                                                    const handleReplace = () => {
                                                        // Disconnect first, then allow reconnection
                                                        if (window.confirm(`This will disconnect "${pkg.package_name}" from "${variantName}". You can then reconnect it to a different variant. Continue?`)) {
                                                            dispatch(deleteKlookMappingRequest(mappingId, tourGroup._id));
                                                            // After disconnect, the package will appear in available packages
                                                            showToastSuccess('Package disconnected. You can now reconnect it to a different variant.');
                                                        }
                                                    };

                                                    return (
                                                        <tr key={pkg.package_id}>
                                                            <td>
                                                                <strong>{pkg.package_name}</strong>
                                                            </td>
                                                            <td>
                                                                <Badge color="secondary">{pkg.package_id}</Badge>
                                                            </td>
                                                            <td>
                                                                <Badge color="info">
                                                                    {pkg.sku_list?.length || 0} SKU(s)
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge color="success">
                                                                    <i className="mdi mdi-link me-1"></i>
                                                                    {variantName}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge color="success">
                                                                    <i className="mdi mdi-check-circle me-1"></i>
                                                                    Connected
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <Button
                                                                        color="warning"
                                                                        size="sm"
                                                                        onClick={handleReplace}
                                                                        title="Disconnect and reconnect to a different variant"
                                                                    >
                                                                        <i className="mdi mdi-swap-horizontal me-1"></i>
                                                                        Replace
                                                                    </Button>
                                                                    <Button
                                                                        color="danger"
                                                                        size="sm"
                                                                        onClick={handleDisconnect}
                                                                        title="Disconnect this package from the variant"
                                                                    >
                                                                        <i className="mdi mdi-link-off me-1"></i>
                                                                        Disconnect
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Available Packages (Not Connected) */}
                        {availablePackages.length > 0 && (
                            <Card>
                                <CardBody>
                                    <div className="d-flex align-items-center mb-3">
                                        <h5 className="mb-0 me-2">
                                            Step 2: Select Packages to Import
                                        </h5>
                                        <Badge color="primary">{selectedPackages.length} selected</Badge>
                                    </div>
                                    <Alert color="info" className="mb-3">
                                        <strong>Actions:</strong>
                                        <ul className="mb-0 mt-2">
                                            <li><strong>Add New:</strong> Create a new variant from this package</li>
                                            <li><strong>Replace:</strong> Replace an existing variant with this package</li>
                                            <li><strong>Connect:</strong> Link this package with an existing variant</li>
                                        </ul>
                                    </Alert>

                                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        <Table responsive striped>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "80px" }}>Toggle</th>
                                                    <th>Package Name</th>
                                                    <th>Package ID</th>
                                                    <th>SKUs</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availablePackages.map((pkg) => {
                                                    const isSelected = selectedPackages.includes(pkg.package_id);
                                                    const status = getPackageStatus(pkg.package_id);
                                                    const action = packageActions[pkg.package_id];

                                                    return (
                                                        <tr key={pkg.package_id}>
                                                            <td>
                                                                <Switch
                                                                    checked={isSelected}
                                                                    onChange={(checked) =>
                                                                        handlePackageToggle(
                                                                            pkg.package_id,
                                                                            checked
                                                                        )
                                                                    }
                                                                    onColor="#86d3ff"
                                                                    onHandleColor="#2693e6"
                                                                    handleDiameter={20}
                                                                    uncheckedIcon={false}
                                                                    checkedIcon={false}
                                                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                                    height={24}
                                                                    width={48}
                                                                    id={`package-switch-${pkg.package_id}`}
                                                                />
                                                            </td>
                                                            <td>
                                                                <strong>{pkg.package_name}</strong>
                                                            </td>
                                                            <td>
                                                                <Badge color="secondary">{pkg.package_id}</Badge>
                                                            </td>
                                                            <td>
                                                                <Badge color="info">
                                                                    {pkg.sku_list?.length || 0} SKU(s)
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {status.exists ? (
                                                                    <Badge color="warning">
                                                                        Exists (Not Connected)
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color="success">New</Badge>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {isSelected && (
                                                                    <Input
                                                                        type="select"
                                                                        bsSize="sm"
                                                                        value={action?.action || "add"}
                                                                        onChange={(e) => {
                                                                            const newAction = e.target.value;
                                                                            if (newAction === "connect" && status.exists) {
                                                                                handleActionChange(
                                                                                    pkg.package_id,
                                                                                    "connect",
                                                                                    status.variant?._id || status.variant
                                                                                );
                                                                            } else {
                                                                                handleActionChange(
                                                                                    pkg.package_id,
                                                                                    newAction
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        <option value="add">Add New</option>
                                                                        {status.exists && (
                                                                            <>
                                                                                <option value="replace">Replace Existing</option>
                                                                                <option value="connect">Connect with Existing</option>
                                                                            </>
                                                                        )}
                                                                    </Input>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {availablePackages.length === 0 && connectedPackages.length > 0 && (
                            <Alert color="info">
                                <i className="mdi mdi-information me-2"></i>
                                All packages from this activity are already connected. No packages available to import.
                            </Alert>
                        )}
                    </>
                )}

                {klookActivity && packages.length === 0 && (
                    <Alert color="warning">
                        No packages found for this activity.
                    </Alert>
                )}
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                {showPreview ? (
                    <>
                        <Button color="secondary" onClick={() => setShowPreview(false)} disabled={creatingVariantFromKlook}>
                            <i className="mdi mdi-arrow-left me-1"></i>
                            Back
                        </Button>
                        <Button
                            color="success"
                            onClick={handleFinalImport}
                            disabled={creatingVariantFromKlook}
                        >
                            {creatingVariantFromKlook ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <i className="mdi mdi-check-circle me-1"></i>
                                    Complete Import ({selectedPackages.length})
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="secondary" onClick={toggle} disabled={creatingVariantFromKlook}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onClick={handlePreview}
                            disabled={!getActivityId() || !klookActivity || selectedPackages.length === 0 || creatingVariantFromKlook}
                        >
                            <i className="mdi mdi-eye me-1"></i>
                            Preview & Import ({selectedPackages.length})
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default ImportKlookPackagesModal;
