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
    } = useSelector((state) => ({
        klookActivities: state.tourGroup?.klookActivities || [],
        klookActivity: state.tourGroup?.klookActivity,
        klookSearching: state.tourGroup?.klookSearching || false,
        klookActivityLoading: state.tourGroup?.klookActivityLoading || false,
        creatingVariantFromKlook: state.tourGroup?.creatingVariantFromKlook || false,
    }));

    const [searchQuery, setSearchQuery] = useState("");
    const [klookActivityId, setKlookActivityId] = useState("");
    const [selectedPackages, setSelectedPackages] = useState([]); // Array of { packageId, action: 'add'|'replace'|'connect', existingVariantId?: string }
    const [packageActions, setPackageActions] = useState({}); // { packageId: { action: 'add'|'replace'|'connect', existingVariantId?: string } }

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setSearchQuery("");
            setKlookActivityId("");
            setSelectedPackages([]);
            setPackageActions({});
        }
    }, [isOpen]);

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

    // Handle package selection and action
    const handlePackageSelection = (packageId, isSelected) => {
        if (isSelected) {
            // Check if this package is already mapped to an existing variant
            const existingVariant = existingVariants.find(
                (v) => v.externalVariantId === packageId
            );

            if (existingVariant) {
                // Package already exists - default to "connect"
                setPackageActions({
                    ...packageActions,
                    [packageId]: {
                        action: "connect",
                        existingVariantId: existingVariant._id,
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

    // Handle import
    const handleImport = () => {
        if (selectedPackages.length === 0) {
            showToastError("Please select at least one package to import");
            return;
        }

        if (!klookActivityId) {
            showToastError("Please select a Klook activity first");
            return;
        }

        // Import each selected package
        selectedPackages.forEach((packageId) => {
            const action = packageActions[packageId];
            
            if (action.action === "add") {
                // Create new variant - saga will handle success/error toasts
                dispatch(
                    createVariantFromKlookRequest(
                        tourGroup._id,
                        klookActivityId,
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
            toggle();
        }, 500);
    };

    // Get packages from activity
    const packages = klookActivity?.package_list ||
        (klookActivity?.data?.activity?.package_list) ||
        [];

    // Check which packages are already mapped
    const getPackageStatus = (packageId) => {
        const existingVariant = existingVariants.find(
            (v) => v.externalVariantId === packageId
        );
        return existingVariant ? { exists: true, variant: existingVariant } : { exists: false };
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>
                Import Variants from Klook
            </ModalHeader>
            <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Step 1: Search/Select Activity */}
                <Card className="mb-3">
                    <CardBody>
                        <h5 className="mb-3">Step 1: Select Klook Activity</h5>
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
                                    Activity ID: {klookActivityId}
                                    {klookActivity.currency && ` • Currency: ${klookActivity.currency}`}
                                </small>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Step 2: Select Packages */}
                {packages.length > 0 && (
                    <Card>
                        <CardBody>
                            <h5 className="mb-3">
                                Step 2: Select Packages to Import ({selectedPackages.length} selected)
                            </h5>
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
                                            <th style={{ width: "50px" }}>Select</th>
                                            <th>Package Name</th>
                                            <th>Package ID</th>
                                            <th>SKUs</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {packages.map((pkg) => {
                                            const isSelected = selectedPackages.includes(pkg.package_id);
                                            const status = getPackageStatus(pkg.package_id);
                                            const action = packageActions[pkg.package_id];

                                            return (
                                                <tr key={pkg.package_id}>
                                                    <td>
                                                        <Input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) =>
                                                                handlePackageSelection(
                                                                    pkg.package_id,
                                                                    e.target.checked
                                                                )
                                                            }
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
                                                                Already Exists
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
                                                                            status.variant._id
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

                {klookActivity && packages.length === 0 && (
                    <Alert color="warning">
                        No packages found for this activity.
                    </Alert>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} disabled={creatingVariantFromKlook}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={handleImport}
                    disabled={selectedPackages.length === 0 || creatingVariantFromKlook}
                >
                    {creatingVariantFromKlook ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Importing...
                        </>
                    ) : (
                        <>
                            <i className="mdi mdi-import me-1"></i>
                            Import Selected ({selectedPackages.length})
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ImportKlookPackagesModal;
