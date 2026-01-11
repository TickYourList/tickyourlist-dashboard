import React, { useEffect, useState } from "react";
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
} from "reactstrap";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    fetchKlookMappingsRequest,
    searchKlookActivitiesRequest,
    fetchKlookActivityRequest,
    bulkLinkKlookMappingsRequest,
    fetchTourGroupByIdRequest,
    createVariantFromKlookRequest,
} from "store/tickyourlist/travelTourGroup/action";
import { get } from "helpers/api_helper";
import { getTourGroupVariantsAPI } from "helpers/location_management_helper";
import EditKlookMappingModal from "./EditKlookMappingModal";
import LiveKlookPricing from "./LiveKlookPricing";

const ConnectKlookModal = ({
    isOpen,
    toggle,
    tourGroup,
    onSuccess,
}) => {
    const dispatch = useDispatch();
    const {
        klookMappings,
        klookActivities,
        klookActivity,
        klookMappingsLoading,
        klookSearching,
        klookActivityLoading,
        tourGroupById,
        loading,
    } = useSelector((state) => ({
        klookMappings: state.tourGroup?.klookMappings || {},
        klookActivities: state.tourGroup?.klookActivities || [],
        klookActivity: state.tourGroup?.klookActivity,
        klookMappingsLoading: state.tourGroup?.klookMappingsLoading || false,
        klookSearching: state.tourGroup?.klookSearching || false,
        klookActivityLoading: state.tourGroup?.klookActivityLoading || false,
        tourGroupById: state.tourGroup?.tourGroupById || {},
        loading: state.tourGroup?.loading || false,
    }));

    const [klookActivityId, setKlookActivityId] = useState("");
    const [variants, setVariants] = useState([]);
    const [variantMappings, setVariantMappings] = useState({}); // { variantId: { externalVariantId, packageId } }
    const [connecting, setConnecting] = useState(false);
    const [loadingTourGroup, setLoadingTourGroup] = useState(false);
    const [existingMappings, setExistingMappings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setVariants([]);
            setVariantMappings({});
            setKlookActivityId("");
            setSearchQuery("");
            setExistingMappings([]);
            setEditModalOpen(false);
            setSelectedMapping(null);
        }
    }, [isOpen]);

    // Fetch tour group variants and existing mappings when modal opens
    useEffect(() => {
        if (isOpen && tourGroup?._id) {
            const fetchData = async () => {
                setLoadingTourGroup(true);
                try {
                    // Always fetch fresh data - clear old state first
                    setVariants([]);

                    // Fetch variants directly using the variants API (more reliable)
                    try {
                        const variantsResponse = await getTourGroupVariantsAPI({
                            tourGroupId: tourGroup._id,
                            page: 1,
                            limit: 100, // Get all variants
                        });
                        const fetchedVariants = variantsResponse?.data?.variants || [];
                        if (fetchedVariants.length > 0) {
                            setVariants(fetchedVariants);
                            console.log('✅ Variants fetched directly:', fetchedVariants.length, fetchedVariants.map(v => ({ id: v._id, name: v.name })));
                        }
                    } catch (variantError) {
                        console.error("Error fetching variants:", variantError);
                        // Fallback to Redux fetch
                        dispatch(fetchTourGroupByIdRequest(tourGroup._id));
                    }

                    // Fetch tour group data using Redux (for other data)
                    dispatch(fetchTourGroupByIdRequest(tourGroup._id));

                    // Fetch existing mappings using Redux
                    dispatch(fetchKlookMappingsRequest(tourGroup._id));
                } catch (error) {
                    console.error("Error fetching data:", error);
                    showToastError("Failed to load tour group data");
                } finally {
                    setLoadingTourGroup(false);
                }
            };

            fetchData();
        }
    }, [isOpen, tourGroup?._id, dispatch]);

    // Update variants from Redux state as fallback (if direct fetch didn't work)
    useEffect(() => {
        if (isOpen && tourGroup?._id && variants.length === 0 && !loadingTourGroup) {
            // Only use Redux as fallback if we don't have variants yet
            const tourGroupData = tourGroupById[tourGroup._id];

            // Check multiple possible locations for variants
            let foundVariants = null;

            if (tourGroupData?.variants && Array.isArray(tourGroupData.variants) && tourGroupData.variants.length > 0) {
                foundVariants = tourGroupData.variants;
            } else if (tourGroupData?.data?.variants && Array.isArray(tourGroupData.data.variants) && tourGroupData.data.variants.length > 0) {
                foundVariants = tourGroupData.data.variants;
            } else if (tourGroup?.variants && Array.isArray(tourGroup.variants) && tourGroup.variants.length > 0) {
                foundVariants = tourGroup.variants;
            } else if (tourGroup?.data?.variants && Array.isArray(tourGroup.data.variants) && tourGroup.data.variants.length > 0) {
                foundVariants = tourGroup.data.variants;
            }

            if (foundVariants && foundVariants.length > 0) {
                setVariants(foundVariants);
                console.log('✅ Variants loaded from fallback source:', foundVariants.length, foundVariants.map(v => ({ id: v._id, name: v.name })));
            }
        }
    }, [isOpen, tourGroupById, tourGroup, variants.length, loadingTourGroup]);

    // Update existing mappings from Redux state
    useEffect(() => {
        if (tourGroup?._id && klookMappings[tourGroup._id]) {
            const mappings = klookMappings[tourGroup._id];

            // Normalize mappings - ensure variantId is a string, not an object
            const normalizedMappings = mappings.map(mapping => {
                // Extract variantId as string
                let variantIdStr = mapping.variantId;
                if (typeof variantIdStr === 'object' && variantIdStr !== null) {
                    variantIdStr = variantIdStr._id || variantIdStr.id || String(variantIdStr);
                }

                // Extract variantName as string
                let variantNameStr = mapping.variantName;
                if (typeof variantNameStr === 'object' && variantNameStr !== null) {
                    variantNameStr = variantNameStr.name || variantNameStr.title || String(variantNameStr);
                }

                return {
                    ...mapping,
                    variantId: variantIdStr,
                    variantName: variantNameStr,
                };
            });

            setExistingMappings(normalizedMappings);

            // Pre-populate variant mappings
            const variantMappingData = {};
            normalizedMappings.forEach((mapping) => {
                if (mapping.variantId && mapping.externalVariantId) {
                    variantMappingData[mapping.variantId] = {
                        externalVariantId: mapping.externalVariantId,
                        packageId: mapping.externalVariantId,
                    };
                }
            });
            setVariantMappings(variantMappingData);

            // If there's a mapping, fetch the activity
            if (normalizedMappings.length > 0) {
                const firstMapping = normalizedMappings[0];
                const activityId = firstMapping.externalProductId;
                setKlookActivityId(activityId);
                dispatch(fetchKlookActivityRequest(activityId));
            }
        }
    }, [klookMappings, tourGroup, dispatch]);

    // Update klookActivityId when activity is loaded
    useEffect(() => {
        if (klookActivity) {
            setKlookActivityId(klookActivity.activity_id);
        }
    }, [klookActivity]);

    // Search Klook activities or fetch by ID
    const handleSearchKlookActivities = () => {
        if (!searchQuery.trim()) {
            return;
        }

        const query = searchQuery.trim();

        // Check if input is a number (activity ID)
        // If it's a valid number, directly fetch the activity by ID
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

    // Fetch Klook activity details
    const handleFetchKlookActivity = (activityId) => {
        if (!activityId) return;
        setKlookActivityId(activityId);
        dispatch(fetchKlookActivityRequest(activityId));
    };

    // Handle variant mapping change
    const handleVariantMappingChange = (variantId, packageId) => {
        setVariantMappings({
            ...variantMappings,
            [variantId]: {
                externalVariantId: packageId,
                packageId: packageId,
            },
        });
    };

    // Handle connect
    const handleConnect = () => {
        if (!klookActivityId || !klookActivity) {
            showToastError("Please select a provider activity first");
            return;
        }

        if (variants.length === 0) {
            showToastError("No variants found for this tour group");
            return;
        }

        setConnecting(true);

        // Prepare mappings array
        const mappings = variants.map((variant) => {
            const variantMapping = variantMappings[variant._id];
            return {
                tourGroupId: tourGroup._id,
                variantId: variant._id,
                provider: "KLOOK_AGENT",
                externalProductId: klookActivityId,
                externalVariantId: variantMapping?.packageId || null,
                priority: 1,
                isActive: true,
                syncEnabled: true,
            };
        });

        // Dispatch bulk link action - success/error will be handled by saga
        dispatch(bulkLinkKlookMappingsRequest(mappings));
    };

    // Listen for successful connection - close modal when connection completes
    // The saga handles success/error toasts, we just need to close the modal
    useEffect(() => {
        if (!loading && connecting) {
            setConnecting(false);
            // Small delay to ensure toast is shown
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                toggle();
            }, 500);
        }
    }, [loading, connecting, onSuccess, toggle]);

    // Get packages from activity - Klook response structure: 
    // { success: true, data: { success: true, activity: { package_list: [...] } } }
    // After saga extraction, klookActivity should be the activity object directly
    const packages = klookActivity?.package_list ||
        (klookActivity?.data?.activity?.package_list) ||
        [];

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Connect with External Provider</ModalHeader>
            <ModalBody>
                {loadingTourGroup ? (
                    <div className="text-center py-4">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading tour group data...</p>
                    </div>
                ) : (
                    <>
                        {/* Search/Select Activity */}
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
                                            placeholder="Enter activity ID or search by name"
                                        />
                                    </Col>
                                    <Col md={4} className="d-flex align-items-end">
                                        <Button
                                            color="primary"
                                            onClick={handleSearchKlookActivities}
                                            disabled={(klookSearching || klookActivityLoading) || !searchQuery.trim()}
                                            className="w-100"
                                        >
                                            {(klookSearching || klookActivityLoading) ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    {klookActivityLoading ? "Loading..." : "Searching..."}
                                                </>
                                            ) : (
                                                "Search / Fetch"
                                            )}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Activity Results */}
                                {klookActivities.length > 0 && (
                                    <div className="mt-3">
                                        <Label>Search Results:</Label>
                                        <div
                                            style={{
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                                border: "1px solid #dee2e6",
                                                borderRadius: "0.25rem",
                                            }}
                                        >
                                            {klookActivities.map((activity) => (
                                                <div
                                                    key={activity.activity_id}
                                                    className="p-2 border-bottom cursor-pointer"
                                                    onClick={() => handleFetchKlookActivity(activity.activity_id)}
                                                    style={{
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                            klookActivityId === activity.activity_id
                                                                ? "#e7f3ff"
                                                                : "transparent",
                                                    }}
                                                >
                                                    <strong>{activity.title}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        ID: {activity.activity_id}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Selected Activity */}
                                {klookActivityLoading ? (
                                    <div className="mt-3 text-center">
                                        <Spinner size="sm" />
                                        <span className="ms-2">Loading activity details...</span>
                                    </div>
                                ) : klookActivity ? (
                                    <div className="mt-3">
                                        <Alert color="success">
                                            <strong>Selected Activity:</strong> {klookActivity.title}
                                            <br />
                                            <small>ID: {klookActivity.activity_id}</small>
                                        </Alert>
                                    </div>
                                ) : klookActivityId ? (
                                    <div className="mt-3">
                                        <Alert color="warning">
                                            Activity ID entered: {klookActivityId}. Waiting for activity details to load...
                                        </Alert>
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <Alert color="info">
                                            Enter an activity ID above or search for activities
                                        </Alert>
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Map Variants to Packages */}
                        {klookActivity && (
                            variants.length > 0 ? (
                                <Card>
                                    <CardBody>
                                        <h5 className="mb-3">Step 2: Map Variants to Klook Packages</h5>
                                        <Table responsive>
                                            <thead>
                                                <tr>
                                                    <th>TYL Variant</th>
                                                    <th>Provider Package</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variants.map((variant) => {
                                                    const variantMapping = variantMappings[variant._id];
                                                    const mappedPackage = variantMapping?.packageId
                                                        ? packages.find(
                                                            (pkg) => pkg.package_id === variantMapping.packageId
                                                        )
                                                        : null;

                                                    return (
                                                        <tr key={variant._id}>
                                                            <td>
                                                                <strong>{variant.name}</strong>
                                                            </td>
                                                            <td>
                                                                <Input
                                                                    type="select"
                                                                    value={variantMapping?.packageId || ""}
                                                                    onChange={(e) =>
                                                                        handleVariantMappingChange(
                                                                            variant._id,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">Select Package</option>
                                                                    {packages.map((pkg) => (
                                                                        <option key={pkg.package_id} value={pkg.package_id}>
                                                                            {pkg.package_name} (ID: {pkg.package_id})
                                                                        </option>
                                                                    ))}
                                                                </Input>
                                                            </td>
                                                            <td>
                                                                {mappedPackage ? (
                                                                    <Badge color="success">Mapped</Badge>
                                                                ) : (
                                                                    <Badge color="warning">Not Mapped</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Card>
                                    <CardBody>
                                        <Alert color="warning">
                                            <strong>No variants found</strong>
                                            <br />
                                            <small>This tour group doesn't have any variants. Please add variants before connecting to provider.</small>
                                        </Alert>
                                    </CardBody>
                                </Card>
                            )
                        )}

                        {/* Live Pricing */}
                        {existingMappings.length > 0 && tourGroup?._id && (
                            <Card className="mt-3">
                                <CardBody>
                                    <LiveKlookPricing tourGroupId={tourGroup._id} />
                                </CardBody>
                            </Card>
                        )}

                        {/* Existing Mappings */}
                        {existingMappings.length > 0 && (
                            <Card className="mt-3">
                                <CardBody>
                                    <h5 className="mb-3">Existing Mappings</h5>
                                    <Table responsive size="sm">
                                        <thead>
                                            <tr>
                                                <th>Variant</th>
                                                <th>External Product ID</th>
                                                <th>External Variant ID</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {existingMappings.map((mapping, index) => {
                                                // Handle variantId - it might be an object or string
                                                const variantIdStr = typeof mapping.variantId === 'object'
                                                    ? (mapping.variantId?._id || mapping.variantId?.id || JSON.stringify(mapping.variantId))
                                                    : (mapping.variantId || '');

                                                // Handle variantName - it might be an object or string
                                                const variantNameStr = typeof mapping.variantName === 'object'
                                                    ? (mapping.variantName?.name || mapping.variantName?.title || JSON.stringify(mapping.variantName))
                                                    : (mapping.variantName || '');

                                                const displayVariant = variantNameStr || variantIdStr || '—';

                                                return (
                                                    <tr key={index}>
                                                        <td>{displayVariant}</td>
                                                        <td>{mapping.externalProductId}</td>
                                                        <td>{mapping.externalVariantId || "—"}</td>
                                                        <td>
                                                            <Badge color={mapping.isActive ? "success" : "secondary"}>
                                                                {mapping.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                color="info"
                                                                onClick={() => {
                                                                    setSelectedMapping(mapping);
                                                                    setEditModalOpen(true);
                                                                }}
                                                            >
                                                                <i className="mdi mdi-pencil me-1"></i>
                                                                Edit & Compare
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        )}
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={handleConnect}
                    disabled={
                        connecting ||
                        loading ||
                        !klookActivity ||
                        variants.length === 0 ||
                        klookActivityLoading ||
                        !klookActivityId
                    }
                    title={
                        !klookActivity ? "Please select a Klook activity" :
                            variants.length === 0 ? "No variants found for this tour group" :
                                klookActivityLoading ? "Loading activity details..." :
                                    !klookActivityId ? "Please enter an activity ID" :
                                        connecting || loading ? "Connecting..." :
                                            "Connect with External Provider"
                    }
                >
                    {connecting || loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Connecting...
                        </>
                    ) : (
                        "Connect with External Provider"
                    )}
                </Button>
            </ModalFooter>

            {/* Edit Mapping Modal */}
            <EditKlookMappingModal
                isOpen={editModalOpen}
                toggle={() => {
                    setEditModalOpen(false);
                    setSelectedMapping(null);
                }}
                tourGroup={tourGroup}
                mapping={selectedMapping}
                onSuccess={() => {
                    // Refresh mappings after edit
                    if (tourGroup?._id) {
                        dispatch(fetchKlookMappingsRequest(tourGroup._id));
                        dispatch(fetchTourGroupByIdRequest(tourGroup._id));
                    }
                }}
            />
        </Modal>
    );
};

export default ConnectKlookModal;
