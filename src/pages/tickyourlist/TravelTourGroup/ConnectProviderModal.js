import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { showToastError } from "helpers/toastBuilder";
import {
    fetchKlookMappingsRequest,
    searchKlookActivitiesRequest,
    fetchKlookActivityRequest,
    bulkLinkKlookMappingsRequest,
    fetchTourGroupByIdRequest,
} from "store/tickyourlist/travelTourGroup/action";
import { getTourGroupVariantsAPI } from "helpers/location_management_helper";
import EditKlookMappingModal from "./EditKlookMappingModal";
import LiveKlookPricing from "./LiveKlookPricing";
import MarkupConfigModal from "./MarkupConfigModal";
import ProviderPricingComparison from "./ProviderPricingComparison";

const PROVIDER_OPTIONS = [
    { value: "KLOOK_AGENT", label: "Klook" },
    { value: "TOUR_GROUPS", label: "TourGroups" },
];

const TYPE_ACTIONS = [
    { value: "KEEP", label: "Keep" },
    { value: "EXCLUDE", label: "Exclude" },
    { value: "REPLACE", label: "Replace" },
];

const CONNECTION_SCOPES = [
    { value: "PRODUCT_ONLY", label: "Connect Tour Group Only (Activity ID)" },
    { value: "PRODUCT_AND_VARIANTS", label: "Connect Tour Group + Variants" },
];

const VARIANT_CONNECTION_MODES = [
    { value: "KEEP_EXISTING", label: "Keep Existing Variant Links (add new only)" },
    { value: "ADD_OR_UPDATE", label: "Add New / Update Selected Variant Links" },
];

const normalizeTypeRules = (rules = []) => {
    if (!Array.isArray(rules)) return [];
    return rules
        .filter((rule) => rule?.sourceType)
        .map((rule) => ({
            sourceType: String(rule.sourceType).toUpperCase(),
            action: ["KEEP", "EXCLUDE", "REPLACE"].includes(rule.action) ? rule.action : "KEEP",
            targetType: rule.targetType ? String(rule.targetType).toUpperCase() : "",
        }));
};

const mergeTypeRules = (types = [], existingRules = []) => {
    const existingMap = new Map(
        (existingRules || []).map((rule) => [String(rule.sourceType || "").toUpperCase(), rule])
    );

    return types.map((type) => {
        const existing = existingMap.get(type);
        return {
            sourceType: type,
            action: existing?.action || "KEEP",
            targetType: existing?.targetType || "",
        };
    });
};

const normalizeMappingRecord = (mapping) => {
    let variantIdStr = mapping?.variantId;
    if (typeof variantIdStr === "object" && variantIdStr !== null) {
        variantIdStr = variantIdStr._id || variantIdStr.id || String(variantIdStr);
    }

    let variantNameStr = mapping?.variantName;
    if (typeof variantNameStr === "object" && variantNameStr !== null) {
        variantNameStr = variantNameStr.name || variantNameStr.title || String(variantNameStr);
    }

    return {
        ...mapping,
        variantId: variantIdStr || null,
        variantName: variantNameStr || null,
    };
};

const ConnectProviderModal = ({
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
        klookSearching,
        klookActivityLoading,
        tourGroupById,
        loading,
    } = useSelector((state) => ({
        klookMappings: state.tourGroup?.klookMappings || {},
        klookActivities: state.tourGroup?.klookActivities || [],
        klookActivity: state.tourGroup?.klookActivity,
        klookSearching: state.tourGroup?.klookSearching || false,
        klookActivityLoading: state.tourGroup?.klookActivityLoading || false,
        tourGroupById: state.tourGroup?.tourGroupById || {},
        loading: state.tourGroup?.loading || false,
    }));

    const [selectedProvider, setSelectedProvider] = useState("KLOOK_AGENT");
    const [klookActivityId, setKlookActivityId] = useState("");
    const [providerProductId, setProviderProductId] = useState("");
    const [variants, setVariants] = useState([]);
    const [variantMappings, setVariantMappings] = useState({});
    const [connecting, setConnecting] = useState(false);
    const [loadingTourGroup, setLoadingTourGroup] = useState(false);
    const [existingMappings, setExistingMappings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [markupConfigModalOpen, setMarkupConfigModalOpen] = useState(false);
    const [markupConfigLevel, setMarkupConfigLevel] = useState("PROVIDER");
    const [selectedVariantForMarkup, setSelectedVariantForMarkup] = useState(null);
    const [useAllVariants, setUseAllVariants] = useState(true);
    const [selectedTourGroupsVariants, setSelectedTourGroupsVariants] = useState({});
    const [typeRules, setTypeRules] = useState([]);
    const [connectionScope, setConnectionScope] = useState("PRODUCT_ONLY");
    const [variantConnectionMode, setVariantConnectionMode] = useState("KEEP_EXISTING");

    const packagesSectionRef = useRef(null);

    const filteredMappings = useMemo(
        () => existingMappings.filter((mapping) => mapping?.provider === selectedProvider),
        [existingMappings, selectedProvider]
    );

    const availableTypes = useMemo(() => {
        const types = new Set();

        variants.forEach((variant) => {
            (variant?.listingPrice?.prices || []).forEach((price) => {
                if (price?.type) {
                    types.add(String(price.type).toUpperCase());
                }
            });

            (variant?.listingPricesInAllCurrencies || []).forEach((currencyPrice) => {
                (currencyPrice?.prices || []).forEach((price) => {
                    if (price?.type) {
                        types.add(String(price.type).toUpperCase());
                    }
                });
            });
        });

        return Array.from(types);
    }, [variants]);

    const packages =
        klookActivity?.package_list ||
        klookActivity?.data?.activity?.package_list ||
        [];
    const resolvedKlookActivityId = klookActivity?.activity_id ? String(klookActivity.activity_id) : "";
    const isKlookActivityResolvedForSelectedId =
        !!resolvedKlookActivityId && !!klookActivityId && resolvedKlookActivityId === String(klookActivityId);

    const existingVariantIds = useMemo(
        () =>
            new Set(
                filteredMappings
                    .map((mapping) => mapping?.variantId)
                    .filter(Boolean)
                    .map((id) => String(id))
            ),
        [filteredMappings]
    );

    useEffect(() => {
        if (!isOpen) {
            setSelectedProvider("KLOOK_AGENT");
            setVariants([]);
            setVariantMappings({});
            setKlookActivityId("");
            setProviderProductId("");
            setSearchQuery("");
            setExistingMappings([]);
            setEditModalOpen(false);
            setSelectedMapping(null);
            setMarkupConfigModalOpen(false);
            setMarkupConfigLevel("PROVIDER");
            setSelectedVariantForMarkup(null);
            setUseAllVariants(true);
            setSelectedTourGroupsVariants({});
            setTypeRules([]);
            setConnectionScope("PRODUCT_ONLY");
            setVariantConnectionMode("KEEP_EXISTING");
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && tourGroup?._id) {
            const fetchData = async () => {
                setLoadingTourGroup(true);
                try {
                    setVariants([]);

                    try {
                        const variantsResponse = await getTourGroupVariantsAPI({
                            tourGroupId: tourGroup._id,
                            page: 1,
                            limit: 100,
                        });
                        const fetchedVariants = variantsResponse?.data?.variants || [];
                        if (fetchedVariants.length > 0) {
                            setVariants(fetchedVariants);
                        }
                    } catch (variantError) {
                        dispatch(fetchTourGroupByIdRequest(tourGroup._id));
                    }

                    dispatch(fetchTourGroupByIdRequest(tourGroup._id));
                    dispatch(fetchKlookMappingsRequest(tourGroup._id));
                } catch (error) {
                    showToastError("Failed to load tour group data");
                } finally {
                    setLoadingTourGroup(false);
                }
            };

            fetchData();
        }
    }, [isOpen, tourGroup?._id, dispatch]);

    useEffect(() => {
        if (isOpen && tourGroup?._id && variants.length === 0 && !loadingTourGroup) {
            const tourGroupData = tourGroupById[tourGroup._id];

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
            }
        }
    }, [isOpen, tourGroupById, tourGroup, variants.length, loadingTourGroup]);

    useEffect(() => {
        if (tourGroup?._id && klookMappings[tourGroup._id]) {
            const mappings = klookMappings[tourGroup._id];
            const normalizedMappings = mappings.map(normalizeMappingRecord);
            setExistingMappings(normalizedMappings);

            const variantMappingData = {};
            normalizedMappings.forEach((mapping) => {
                if (mapping.variantId && mapping.externalVariantId !== undefined && mapping.externalVariantId !== null) {
                    variantMappingData[mapping.variantId] = {
                        externalVariantId: mapping.externalVariantId,
                        packageId: mapping.externalVariantId,
                    };
                }
            });

            if (Object.keys(variantMappingData).length > 0) {
                setVariantMappings((prev) => ({
                    ...prev,
                    ...variantMappingData,
                }));
            }
        }
    }, [klookMappings, tourGroup]);

    useEffect(() => {
        if (!isOpen) return;

        const providerMappings = filteredMappings;
        const hasVariantMappings = providerMappings.some((mapping) => !!mapping?.variantId);
        setConnectionScope(hasVariantMappings ? "PRODUCT_AND_VARIANTS" : "PRODUCT_ONLY");
        setVariantConnectionMode("KEEP_EXISTING");

        if (selectedProvider === "KLOOK_AGENT") {
            setProviderProductId("");
            setUseAllVariants(false);
            setSelectedTourGroupsVariants({});

            if (providerMappings.length > 0) {
                const activityId = providerMappings[0]?.externalProductId;
                if (activityId !== undefined && activityId !== null) {
                    const activityIdStr = String(activityId);
                    setKlookActivityId(activityIdStr);
                    setSearchQuery(activityIdStr);
                    if (hasVariantMappings) {
                        dispatch(fetchKlookActivityRequest(activityIdStr));
                    }
                }
            }
            return;
        }

        if (selectedProvider === "TOUR_GROUPS") {
            const firstMapping = providerMappings[0];
            setKlookActivityId("");
            setSearchQuery("");
            setProviderProductId(
                firstMapping?.externalProductId !== undefined && firstMapping?.externalProductId !== null
                    ? String(firstMapping.externalProductId)
                    : ""
            );

            const selectedMap = {};
            providerMappings.forEach((mapping) => {
                if (mapping?.variantId) {
                    selectedMap[mapping.variantId] = true;
                }
            });
            setSelectedTourGroupsVariants(selectedMap);

            const hasAllSelection = providerMappings.some(
                (mapping) =>
                    !mapping?.variantId ||
                    mapping?.metadata?.selectionMode === "ALL" ||
                    mapping?.metadata?.useAllVariants === true
            );

            setUseAllVariants(hasAllSelection || Object.keys(selectedMap).length === 0);

            const rulesFromMetadata = providerMappings.find((mapping) =>
                Array.isArray(mapping?.metadata?.typeRules)
            )?.metadata?.typeRules;

            if (rulesFromMetadata) {
                setTypeRules(normalizeTypeRules(rulesFromMetadata));
            }
        }
    }, [selectedProvider, filteredMappings, isOpen, dispatch]);

    useEffect(() => {
        if (selectedProvider !== "TOUR_GROUPS" || !isOpen) return;
        setTypeRules((prev) => mergeTypeRules(availableTypes, prev));
    }, [availableTypes, selectedProvider, isOpen]);

    useEffect(() => {
        if (klookActivity) {
            setKlookActivityId(String(klookActivity.activity_id));
        }
    }, [klookActivity]);

    const handleSearchKlookActivities = () => {
        if (!searchQuery.trim()) return;

        const query = searchQuery.trim();
        const activityId = parseInt(query, 10);

        if (!Number.isNaN(activityId) && activityId > 0 && query === activityId.toString()) {
            setKlookActivityId(activityId.toString());
            dispatch(fetchKlookActivityRequest(activityId.toString()));
        } else {
            dispatch(searchKlookActivitiesRequest(query));
        }
    };

    const handleFetchKlookActivity = (activityId) => {
        if (!activityId) return;
        const activityIdStr = String(activityId);
        setKlookActivityId(activityIdStr);
        dispatch(fetchKlookActivityRequest(activityIdStr));
    };

    const handleVariantMappingChange = (variantId, packageId) => {
        setVariantMappings((prev) => ({
            ...prev,
            [variantId]: {
                externalVariantId: packageId,
                packageId,
            },
        }));
    };

    const handleVariantSelectionToggle = (variantId) => {
        setSelectedTourGroupsVariants((prev) => ({
            ...prev,
            [variantId]: !prev[variantId],
        }));
    };

    const handleTypeRuleActionChange = (sourceType, action) => {
        setTypeRules((prev) =>
            prev.map((rule) =>
                rule.sourceType === sourceType
                    ? {
                        ...rule,
                        action,
                        targetType: action === "REPLACE" ? rule.targetType : "",
                    }
                    : rule
            )
        );
    };

    const handleTypeRuleTargetChange = (sourceType, targetType) => {
        setTypeRules((prev) =>
            prev.map((rule) =>
                rule.sourceType === sourceType
                    ? {
                        ...rule,
                        targetType,
                    }
                    : rule
            )
        );
    };

    const buildTypeRulesPayload = () => {
        const rules = [];

        for (const rule of typeRules) {
            if (!rule?.sourceType) continue;

            const normalizedRule = {
                sourceType: String(rule.sourceType).toUpperCase(),
                action: rule.action || "KEEP",
            };

            if (normalizedRule.action === "REPLACE") {
                const targetType = String(rule.targetType || "").trim().toUpperCase();
                if (!targetType) {
                    showToastError(`Replacement target is required for type ${normalizedRule.sourceType}`);
                    return null;
                }
                normalizedRule.targetType = targetType;
            }

            rules.push(normalizedRule);
        }

        return rules;
    };

    const handleConnect = () => {
        if (!tourGroup?._id) {
            showToastError("Tour group is required");
            return;
        }

        if (selectedProvider === "KLOOK_AGENT") {
            if (!klookActivityId) {
                showToastError("Please enter a Klook activity ID");
                return;
            }

            const externalProductId = Number(klookActivityId);
            if (Number.isNaN(externalProductId)) {
                showToastError("Invalid Klook activity ID");
                return;
            }

            let mappings = [];

            if (connectionScope === "PRODUCT_ONLY") {
                mappings = [
                    {
                        tourGroupId: tourGroup._id,
                        provider: selectedProvider,
                        externalProductId,
                        priority: 1,
                        isActive: true,
                        syncEnabled: true,
                        metadata: {
                            connectionScope: "PRODUCT_ONLY",
                            variantConnectionMode,
                        },
                    },
                ];
            } else {
                if (!isKlookActivityResolvedForSelectedId || !klookActivity) {
                    showToastError("Fetch Klook activity details for the selected activity ID before mapping variants");
                    return;
                }

                if (variants.length === 0) {
                    showToastError("No variants found for this tour group");
                    return;
                }

                mappings = variants.map((variant) => {
                    const variantMapping = variantMappings[variant._id];
                    const packageIdRaw = variantMapping?.packageId;
                    const parsedExternalVariantId =
                        packageIdRaw === undefined || packageIdRaw === null || packageIdRaw === ""
                            ? null
                            : Number(packageIdRaw);

                    return {
                        tourGroupId: tourGroup._id,
                        variantId: variant._id,
                        provider: selectedProvider,
                        externalProductId,
                        externalVariantId: Number.isNaN(parsedExternalVariantId) ? null : parsedExternalVariantId,
                        priority: 1,
                        isActive: true,
                        syncEnabled: true,
                        metadata: {
                            connectionScope: "PRODUCT_AND_VARIANTS",
                            variantConnectionMode,
                        },
                    };
                });

                if (variantConnectionMode === "KEEP_EXISTING") {
                    mappings = mappings.filter((mapping) => !existingVariantIds.has(String(mapping.variantId)));
                    if (mappings.length === 0) {
                        showToastError("All variants are already connected. Switch to Add/Update mode to update links.");
                        return;
                    }
                }
            }

            setConnecting(true);
            dispatch(bulkLinkKlookMappingsRequest(mappings));
            return;
        }

        if (selectedProvider === "TOUR_GROUPS") {
            const externalProductId = Number(providerProductId);
            if (!providerProductId || Number.isNaN(externalProductId)) {
                showToastError("Please enter a valid TourGroups product ID");
                return;
            }

            if (connectionScope === "PRODUCT_ONLY") {
                const mappings = [
                    {
                        tourGroupId: tourGroup._id,
                        provider: selectedProvider,
                        externalProductId,
                        priority: 1,
                        isActive: true,
                        syncEnabled: true,
                        metadata: {
                            connectionScope: "PRODUCT_ONLY",
                            variantConnectionMode,
                        },
                    },
                ];

                setConnecting(true);
                dispatch(bulkLinkKlookMappingsRequest(mappings));
                return;
            }

            const typeRulesPayload = buildTypeRulesPayload();
            if (!typeRulesPayload) return;

            const selectedVariants = variants.filter((variant) => selectedTourGroupsVariants[variant._id]);
            const shouldUseAllVariants = useAllVariants || selectedVariants.length === 0;

            const metadata = {
                selectionMode: shouldUseAllVariants ? "ALL" : "CUSTOM",
                useAllVariants: shouldUseAllVariants,
                typeRules: typeRulesPayload,
                connectionScope: "PRODUCT_AND_VARIANTS",
                variantConnectionMode,
            };

            let mappings = shouldUseAllVariants
                ? [
                    {
                        tourGroupId: tourGroup._id,
                        provider: selectedProvider,
                        externalProductId,
                        priority: 1,
                        isActive: true,
                        syncEnabled: true,
                        metadata,
                    },
                ]
                : selectedVariants.map((variant) => {
                    const variantMapping = variantMappings[variant._id];
                    const externalVariantRaw = variantMapping?.packageId;
                    const parsedExternalVariantId =
                        externalVariantRaw === undefined || externalVariantRaw === null || externalVariantRaw === ""
                            ? null
                            : Number(externalVariantRaw);

                    return {
                        tourGroupId: tourGroup._id,
                        variantId: variant._id,
                        provider: selectedProvider,
                        externalProductId,
                        externalVariantId: Number.isNaN(parsedExternalVariantId) ? null : parsedExternalVariantId,
                        priority: 1,
                        isActive: true,
                        syncEnabled: true,
                        metadata,
                    };
                });

            if (!shouldUseAllVariants && variantConnectionMode === "KEEP_EXISTING") {
                mappings = mappings.filter((mapping) => !existingVariantIds.has(String(mapping.variantId)));
                if (mappings.length === 0) {
                    showToastError("Selected variants are already connected. Switch to Add/Update mode to update links.");
                    return;
                }
            }

            setConnecting(true);
            dispatch(bulkLinkKlookMappingsRequest(mappings));
            return;
        }

        if (selectedProvider) {
            showToastError("Unsupported provider selection");
            return;
        }
    };

    useEffect(() => {
        if (!loading && connecting) {
            setConnecting(false);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                toggle();
            }, 500);
        }
    }, [loading, connecting, onSuccess, toggle]);

    const connectDisabled =
        connecting ||
        loading ||
        (selectedProvider === "KLOOK_AGENT"
            ? !klookActivityId ||
              (connectionScope === "PRODUCT_AND_VARIANTS" &&
                (!isKlookActivityResolvedForSelectedId || variants.length === 0 || klookActivityLoading))
            : !providerProductId.trim());

    const connectButtonTitle =
        selectedProvider === "KLOOK_AGENT"
            ? !klookActivityId
                ? "Please enter an activity ID"
                : connectionScope === "PRODUCT_AND_VARIANTS" && !isKlookActivityResolvedForSelectedId
                    ? "Fetch activity details for this activity ID to map variants"
                    : connectionScope === "PRODUCT_AND_VARIANTS" && variants.length === 0
                        ? "No variants found for this tour group"
                        : klookActivityLoading
                            ? "Loading activity details"
                            : "Connect with Klook"
            : !providerProductId.trim()
                ? "Please enter a TourGroups product ID"
                : "Connect with TourGroups";

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
                        <Card className="mb-3">
                            <CardBody>
                                <h5 className="mb-3">Step 1: Select Provider</h5>
                                <Row>
                                    <Col md={6}>
                                        <Label>Provider</Label>
                                        <Input
                                            type="select"
                                            value={selectedProvider}
                                            onChange={(e) => setSelectedProvider(e.target.value)}
                                        >
                                            {PROVIDER_OPTIONS.map((provider) => (
                                                <option key={provider.value} value={provider.value}>
                                                    {provider.label}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                    <Col md={6}>
                                        <Label>Connection Scope</Label>
                                        <Input
                                            type="select"
                                            value={connectionScope}
                                            onChange={(e) => setConnectionScope(e.target.value)}
                                        >
                                            {CONNECTION_SCOPES.map((scope) => (
                                                <option key={scope.value} value={scope.value}>
                                                    {scope.label}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                </Row>
                                {connectionScope === "PRODUCT_AND_VARIANTS" && (
                                    <Row className="mt-3">
                                        <Col md={12}>
                                            <Label>Variant Connection Mode</Label>
                                            <Input
                                                type="select"
                                                value={variantConnectionMode}
                                                onChange={(e) => setVariantConnectionMode(e.target.value)}
                                            >
                                                {VARIANT_CONNECTION_MODES.map((mode) => (
                                                    <option key={mode.value} value={mode.value}>
                                                        {mode.label}
                                                    </option>
                                                ))}
                                            </Input>
                                        </Col>
                                    </Row>
                                )}
                                <Row className="mt-2">
                                    <Col md={12}>
                                        <small className="text-muted">
                                            Use <strong>Tour Group Only</strong> to connect directly by provider activity ID.
                                            Use <strong>Tour Group + Variants</strong> when you want variant-level links.
                                        </small>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>

                        {selectedProvider === "KLOOK_AGENT" && (
                            <Card className="mb-3">
                                <CardBody>
                                    <h5 className="mb-3">Step 2: Select Klook Activity</h5>
                                    <Row>
                                        <Col md={8}>
                                            <Label>Search or Enter Activity ID</Label>
                                            <Input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSearchQuery(value);
                                                    if (/^\d*$/.test(value.trim())) {
                                                        setKlookActivityId(value.trim());
                                                    } else {
                                                        setKlookActivityId("");
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSearchKlookActivities();
                                                    }
                                                }}
                                                placeholder="Enter activity ID or search by name"
                                            />
                                            <small className="text-muted">
                                                Direct connect supports activity ID only. Search/fetch is required only for package-to-variant mapping.
                                            </small>
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
                                                        className="p-2 border-bottom"
                                                        onClick={() => handleFetchKlookActivity(activity.activity_id)}
                                                        style={{
                                                            cursor: "pointer",
                                                            backgroundColor:
                                                                String(klookActivityId) === String(activity.activity_id)
                                                                    ? "#e7f3ff"
                                                                    : "transparent",
                                                        }}
                                                    >
                                                        <strong>{activity.title}</strong>
                                                        <br />
                                                        <small className="text-muted">ID: {activity.activity_id}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {klookActivityLoading ? (
                                        <div className="mt-3 text-center">
                                            <Spinner size="sm" />
                                            <span className="ms-2">Loading activity details...</span>
                                        </div>
                                    ) : klookActivity && isKlookActivityResolvedForSelectedId ? (
                                        <div className="mt-3">
                                            <Alert color="success" className="mb-0">
                                                <strong>Selected Activity:</strong> {klookActivity.title}
                                                <br />
                                                <small>ID: {klookActivity.activity_id}</small>
                                            </Alert>
                                        </div>
                                    ) : klookActivity && klookActivityId ? (
                                        <div className="mt-3">
                                            <Alert color="warning" className="mb-0">
                                                Activity details are not synced with the currently entered ID. Click Search / Fetch to refresh details.
                                            </Alert>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <Alert color="info" className="mb-0">
                                                Enter an activity ID above or search for activities.
                                            </Alert>
                                        </div>
                                    )}

                                    {klookActivityId && !klookActivity && connectionScope === "PRODUCT_ONLY" && (
                                        <div className="mt-3">
                                            <Alert color="info" className="mb-0">
                                                Activity ID is set. You can connect this tour group directly without loading activity details.
                                            </Alert>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )}

                        {selectedProvider === "TOUR_GROUPS" && (
                            <Card className="mb-3">
                                <CardBody>
                                    <h5 className="mb-3">Step 2: Configure TourGroups Link</h5>
                                    <Row>
                                        <Col md={6}>
                                            <Label>TourGroups Product ID</Label>
                                            <Input
                                                type="number"
                                                value={providerProductId}
                                                onChange={(e) => setProviderProductId(e.target.value)}
                                                placeholder="Enter provider tour group ID"
                                            />
                                        </Col>
                                        <Col md={6} className="d-flex align-items-end">
                                            <div className="form-check mb-2">
                                                <Input
                                                    id="useAllVariants"
                                                    type="checkbox"
                                                    checked={useAllVariants}
                                                    onChange={(e) => setUseAllVariants(e.target.checked)}
                                                    disabled={connectionScope !== "PRODUCT_AND_VARIANTS"}
                                                />
                                                <Label for="useAllVariants" className="form-check-label ms-2 mb-0">
                                                    Use all variants when none are explicitly selected
                                                </Label>
                                            </div>
                                        </Col>
                                    </Row>
                                    <small className="text-muted">
                                        If you keep this enabled or leave variant selection empty, the mapping will apply to all variants.
                                    </small>
                                </CardBody>
                            </Card>
                        )}

                        {selectedProvider === "KLOOK_AGENT" && connectionScope === "PRODUCT_AND_VARIANTS" && isKlookActivityResolvedForSelectedId && klookActivity && (
                            variants.length > 0 ? (
                                <Card ref={packagesSectionRef} className="mb-3">
                                    <CardBody>
                                        <h5 className="mb-3">Step 3: Map Variants to Klook Packages</h5>
                                        <Table responsive>
                                            <thead>
                                                <tr>
                                                    <th>TYL Variant</th>
                                                    <th>Klook Package</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variants.map((variant) => {
                                                    const variantMapping = variantMappings[variant._id];
                                                    const mappedPackage = variantMapping?.packageId
                                                        ? packages.find(
                                                            (pkg) => String(pkg.package_id) === String(variantMapping.packageId)
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
                                                                        handleVariantMappingChange(variant._id, e.target.value)
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
                                <Card className="mb-3">
                                    <CardBody>
                                        <Alert color="warning" className="mb-0">
                                            <strong>No variants found</strong>
                                            <br />
                                            <small>
                                                This tour group does not have variants yet. Please add variants before connecting to Klook.
                                            </small>
                                        </Alert>
                                    </CardBody>
                                </Card>
                            )
                        )}

                        {selectedProvider === "KLOOK_AGENT" && connectionScope === "PRODUCT_AND_VARIANTS" && !isKlookActivityResolvedForSelectedId && (
                            <Card className="mb-3">
                                <CardBody>
                                    <Alert color="info" className="mb-0">
                                        Fetch Klook activity details to map provider packages with variants.
                                    </Alert>
                                </CardBody>
                            </Card>
                        )}

                        {selectedProvider === "TOUR_GROUPS" && connectionScope === "PRODUCT_AND_VARIANTS" && variants.length > 0 && !useAllVariants && (
                            <Card className="mb-3">
                                <CardBody>
                                    <h5 className="mb-3">Step 3: Select Variants (Optional)</h5>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Use</th>
                                                <th>TYL Variant</th>
                                                <th>Provider Variant ID</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variants.map((variant) => {
                                                const isSelected = !!selectedTourGroupsVariants[variant._id];
                                                return (
                                                    <tr key={variant._id}>
                                                        <td>
                                                            <Input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleVariantSelectionToggle(variant._id)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <strong>{variant.name}</strong>
                                                        </td>
                                                        <td>
                                                            <Input
                                                                type="number"
                                                                value={variantMappings[variant._id]?.packageId || ""}
                                                                onChange={(e) =>
                                                                    handleVariantMappingChange(variant._id, e.target.value)
                                                                }
                                                                placeholder="Optional external variant ID"
                                                                disabled={!isSelected}
                                                            />
                                                        </td>
                                                        <td>
                                                            {isSelected ? (
                                                                <Badge color="success">Selected</Badge>
                                                            ) : (
                                                                <Badge color="secondary">Not Selected</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                    <small className="text-muted">
                                        If no variants are selected, all variants will automatically be used.
                                    </small>
                                </CardBody>
                            </Card>
                        )}

                        {selectedProvider === "TOUR_GROUPS" && connectionScope === "PRODUCT_AND_VARIANTS" && (
                            <Card className="mb-3">
                                <CardBody>
                                    <h5 className="mb-3">Step 4: Type Rules (Keep / Exclude / Replace)</h5>
                                    {typeRules.length > 0 ? (
                                        <Table responsive>
                                            <thead>
                                                <tr>
                                                    <th>Source Type</th>
                                                    <th>Action</th>
                                                    <th>Target Type (for Replace)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {typeRules.map((rule) => (
                                                    <tr key={rule.sourceType}>
                                                        <td>
                                                            <Badge color="light" className="text-dark">
                                                                {rule.sourceType}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Input
                                                                type="select"
                                                                value={rule.action}
                                                                onChange={(e) =>
                                                                    handleTypeRuleActionChange(rule.sourceType, e.target.value)
                                                                }
                                                            >
                                                                {TYPE_ACTIONS.map((action) => (
                                                                    <option key={action.value} value={action.value}>
                                                                        {action.label}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </td>
                                                        <td>
                                                            <Input
                                                                type="text"
                                                                value={rule.targetType || ""}
                                                                onChange={(e) =>
                                                                    handleTypeRuleTargetChange(rule.sourceType, e.target.value)
                                                                }
                                                                placeholder="e.g. ADULT"
                                                                disabled={rule.action !== "REPLACE"}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <Alert color="info" className="mb-0">
                                            No variant types detected yet. Type rules will be available after variants include pricing types.
                                        </Alert>
                                    )}
                                </CardBody>
                            </Card>
                        )}

                        {filteredMappings.length > 0 && (
                            <Card className="mt-3">
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Markup Configuration</h5>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => {
                                                setMarkupConfigLevel("PROVIDER");
                                                setSelectedVariantForMarkup(null);
                                                setMarkupConfigModalOpen(true);
                                            }}
                                        >
                                            <i className="mdi mdi-cog me-1"></i>
                                            Configure Provider Markup
                                        </Button>
                                    </div>
                                    <Alert color="info" className="mb-0">
                                        Configure B2B to B2C markup rules for {selectedProvider}. Provider-level markup applies to all variants.
                                    </Alert>
                                </CardBody>
                            </Card>
                        )}

                        {selectedProvider === "KLOOK_AGENT" && filteredMappings.length > 0 && tourGroup?._id && (
                            <Card className="mt-3">
                                <CardBody>
                                    <LiveKlookPricing tourGroupId={tourGroup._id} />
                                </CardBody>
                            </Card>
                        )}

                        {tourGroup?._id && (
                            <Card className="mt-3">
                                <ProviderPricingComparison
                                    tourGroupId={tourGroup._id}
                                    environment="staging"
                                />
                            </Card>
                        )}

                        {filteredMappings.length > 0 && (
                            <Card className="mt-3">
                                <CardBody>
                                    <h5 className="mb-3">Existing {selectedProvider} Mappings</h5>
                                    <Table responsive size="sm">
                                        <thead>
                                            <tr>
                                                <th>Variant</th>
                                                <th>External Product ID</th>
                                                <th>External Variant ID</th>
                                                <th>Mode</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMappings.map((mapping, index) => {
                                                const variantIdStr =
                                                    typeof mapping.variantId === "object"
                                                        ? mapping.variantId?._id || mapping.variantId?.id || ""
                                                        : mapping.variantId || "";
                                                const variantNameStr =
                                                    typeof mapping.variantName === "object"
                                                        ? mapping.variantName?.name || mapping.variantName?.title || ""
                                                        : mapping.variantName || "";

                                                const displayVariant =
                                                    variantNameStr || variantIdStr || "All variants";

                                                const mappingMode =
                                                    mapping?.metadata?.selectionMode || (!variantIdStr ? "ALL" : "CUSTOM");

                                                return (
                                                    <tr key={`${mapping.mappingId || index}-${selectedProvider}`}>
                                                        <td>{displayVariant}</td>
                                                        <td>{mapping.externalProductId}</td>
                                                        <td>{mapping.externalVariantId || "—"}</td>
                                                        <td>
                                                            <Badge color={mappingMode === "ALL" ? "primary" : "info"}>
                                                                {mappingMode}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge color={mapping.isActive ? "success" : "secondary"}>
                                                                {mapping.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                {selectedProvider === "KLOOK_AGENT" && (
                                                                    <Button
                                                                        size="sm"
                                                                        color="info"
                                                                        onClick={() => {
                                                                            setSelectedMapping(mapping);
                                                                            setEditModalOpen(true);
                                                                        }}
                                                                        title="Edit & Compare Mapping"
                                                                    >
                                                                        <i className="mdi mdi-pencil me-1"></i>
                                                                        Edit
                                                                    </Button>
                                                                )}
                                                                {variantIdStr ? (
                                                                    <Button
                                                                        size="sm"
                                                                        color="warning"
                                                                        onClick={() => {
                                                                            const variantId =
                                                                                typeof mapping.variantId === "object"
                                                                                    ? mapping.variantId?._id || mapping.variantId?.id
                                                                                    : mapping.variantId;
                                                                            setSelectedVariantForMarkup(variantId);
                                                                            setMarkupConfigLevel("VARIANT");
                                                                            setMarkupConfigModalOpen(true);
                                                                        }}
                                                                        title="Configure Markup for this Variant"
                                                                    >
                                                                        <i className="mdi mdi-cog me-1"></i>
                                                                        Markup
                                                                    </Button>
                                                                ) : (
                                                                    <Button size="sm" color="secondary" disabled title="Variant-specific markup requires a variant mapping">
                                                                        <i className="mdi mdi-cog me-1"></i>
                                                                        Markup
                                                                    </Button>
                                                                )}
                                                            </div>
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
                    disabled={connectDisabled}
                    title={connectButtonTitle}
                >
                    {connecting || loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Connecting...
                        </>
                    ) : (
                        `Connect ${selectedProvider === "KLOOK_AGENT" ? "Klook" : "TourGroups"}`
                    )}
                </Button>
            </ModalFooter>

            {selectedProvider === "KLOOK_AGENT" && (
                <EditKlookMappingModal
                    isOpen={editModalOpen}
                    toggle={() => {
                        setEditModalOpen(false);
                        setSelectedMapping(null);
                    }}
                    tourGroup={tourGroup}
                    mapping={selectedMapping}
                    onSuccess={() => {
                        if (tourGroup?._id) {
                            dispatch(fetchKlookMappingsRequest(tourGroup._id));
                            dispatch(fetchTourGroupByIdRequest(tourGroup._id));
                        }
                    }}
                    onEditPackages={() => {
                        setEditModalOpen(false);
                        setSelectedMapping(null);
                        if (packagesSectionRef.current) {
                            setTimeout(() => {
                                packagesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 150);
                        }
                    }}
                />
            )}

            <MarkupConfigModal
                isOpen={markupConfigModalOpen}
                toggle={() => {
                    setMarkupConfigModalOpen(false);
                    setSelectedVariantForMarkup(null);
                }}
                provider={selectedProvider}
                tourGroupId={tourGroup?._id}
                variantId={markupConfigLevel === "VARIANT" ? selectedVariantForMarkup : null}
                level={markupConfigLevel}
            />
        </Modal>
    );
};

export default ConnectProviderModal;
