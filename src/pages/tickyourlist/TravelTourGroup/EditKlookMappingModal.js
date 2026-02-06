import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Spinner,
    Card,
    CardBody,
    Table,
    Alert,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import EditorReact from "./Editor";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    generateTourGroupContentAI,
    getTourGroupVariantDetailAPI,
    updateTourGroupHelper,
    updateTourGroupVariantAPI,
} from "helpers/location_management_helper";
import {
    fetchKlookActivityRequest,
    fetchTourGroupByIdRequest,
} from "store/tickyourlist/travelTourGroup/action";

const EditKlookMappingModal = ({
    isOpen,
    toggle,
    tourGroup,
    mapping,
    onSuccess,
    onEditPackages,
}) => {
    const dispatch = useDispatch();
    const {
        klookActivity,
        klookActivityLoading,
        tourGroupById,
    } = useSelector((state) => ({
        klookActivity: state.tourGroup?.klookActivity,
        klookActivityLoading: state.tourGroup?.klookActivityLoading || false,
        tourGroupById: state.tourGroup?.tourGroupById || {},
    }));

    const [activeTab, setActiveTab] = useState("tourgroup");
    const [tourGroupView, setTourGroupView] = useState("compare");
    const [variantView, setVariantView] = useState("compare");
    const [tylData, setTylData] = useState(null);
    const [klookData, setKlookData] = useState(null);
    const [variantDetail, setVariantDetail] = useState(null);
    const [tourGroupUpdates, setTourGroupUpdates] = useState({});
    const [variantUpdates, setVariantUpdates] = useState({});
    const [aiDraft, setAiDraft] = useState({});
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [saving, setSaving] = useState(false);

    const booleanFields = useMemo(() => new Set([
        "variant.openDated",
        "variant.notAvailable",
        "variant.status",
    ]), []);

    const numberFields = useMemo(() => new Set([
        "variant.externalVariantId",
    ]), []);

    const arrayFields = useMemo(() => new Set([
        "variant.boosterTags",
    ]), []);

    const resolveVariantId = () => {
        const fromMapping = mapping?.variantId;
        if (fromMapping && typeof fromMapping === "object") {
            return fromMapping._id || fromMapping.id;
        }
        return fromMapping || tylData?.variant?._id || variantDetail?._id;
    };

    const redirectTo = (url) => {
        window.location.href = url;
    };

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen && mapping) {
            // Fetch tour group data
            if (tourGroup?._id) {
                dispatch(fetchTourGroupByIdRequest(tourGroup._id));
            }

            // Fetch Klook activity data
            if (mapping.externalProductId) {
                dispatch(fetchKlookActivityRequest(mapping.externalProductId.toString()));
            }
        }
    }, [isOpen, mapping, tourGroup, dispatch]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setAiDraft({});
            setAiError("");
            setTourGroupUpdates({});
            setVariantUpdates({});
            setActiveTab("tourgroup");
            setTourGroupView("compare");
            setVariantView("compare");
            setVariantDetail(null);
        }
    }, [isOpen]);

    // Fetch variant detail for more complete data (for updates)
    useEffect(() => {
        const fetchVariantDetail = async () => {
            if (!isOpen || !mapping?.variantId) return;
            try {
                const response = await getTourGroupVariantDetailAPI(mapping.variantId);
                const responseData = response?.data?.data || response?.data || response || {};
                const variant = responseData?.variant || responseData;
                setVariantDetail(variant);
            } catch (error) {
                console.error("Error fetching variant detail:", error);
            }
        };

        fetchVariantDetail();
    }, [isOpen, mapping?.variantId]);

    // Extract TYL data
    useEffect(() => {
        if (tourGroup?._id && tourGroupById[tourGroup._id]) {
            const tgData = tourGroupById[tourGroup._id];
            const variantFromTourGroup = tgData?.variants?.find(v => {
                const variantId = typeof mapping?.variantId === 'object' && mapping?.variantId?._id
                    ? mapping.variantId._id
                    : mapping?.variantId;
                return v._id?.toString?.() === variantId?.toString?.() || v._id === variantId;
            });

            const resolvedVariant = variantDetail || variantFromTourGroup;

            setTylData({
                tourGroup: {
                    name: tgData.name || tourGroup.name,
                    summary: tgData.summary || "",
                    highlights: tgData.highlights || "",
                    inclusions: tgData.inclusions || "",
                    exclusions: tgData.exclusions || "",
                    faq: tgData.faq || "",
                    additionalInfo: tgData.additionalInfo || "",
                    ticketDeliveryInfo: tgData.ticketDeliveryInfo || "",
                    confirmedTicketInfo: tgData.confirmedTicketInfo || "",
                    cityCode: tgData.cityCode || tourGroup.cityCode,
                },
                variant: resolvedVariant ? {
                    _id: resolvedVariant._id,
                    name: resolvedVariant.name || "",
                    variantInfo: resolvedVariant.variantInfo || "",
                    ticketDeliveryInfo: resolvedVariant.ticketDeliveryInfo || "",
                    confirmedTicketInfo: resolvedVariant.confirmedTicketInfo || "",
                    listingPrice: resolvedVariant.listingPrice,
                    boosterTags: resolvedVariant.boosterTags,
                    openDated: resolvedVariant.openDated,
                    status: resolvedVariant.status,
                    whatsappOnly: resolvedVariant.whatsappOnly,
                    notAvailable: resolvedVariant.notAvailable,
                    hasTimeSlots: resolvedVariant.hasTimeSlots,
                    operatingHours: resolvedVariant.operatingHours,
                    slotDurationMinutes: resolvedVariant.slotDurationMinutes,
                    isPrivate: resolvedVariant.isPrivate,
                    isHotelPickup: resolvedVariant.isHotelPickup,
                    externalVariantId: resolvedVariant.externalVariantId,
                    productId: resolvedVariant.productId || tourGroup?._id,
                } : null,
            });
        }
    }, [tourGroupById, tourGroup, mapping, variantDetail]);

    // Extract Klook data
    useEffect(() => {
        if (klookActivity) {
            const activity = klookActivity?.data?.activity || klookActivity;
            const packageId = mapping?.externalVariantId;
            const packageData = activity?.package_list?.find(
                pkg => pkg.package_id?.toString?.() === packageId?.toString?.()
            ) || activity?.package_list?.[0];

            setKlookData({
                activity: {
                    title: activity.title,
                    subtitle: activity.subtitle,
                    what_we_love: activity.what_we_love,
                    location: activity.location,
                    address_desc_multilang: activity.address_desc_multilang,
                    section_info: activity.section_info || [],
                },
                package: packageData ? {
                    package_name: packageData.package_name,
                    package_id: packageData.package_id,
                    cancellation_type_multilang: packageData.cancellation_type_multilang,
                    voucher_usage_multilang: packageData.voucher_usage_multilang,
                    section_info: packageData.section_info || [],
                    sku_list: packageData.sku_list || [],
                    is_open_date: packageData.is_open_date,
                } : null,
            });
        }
    }, [klookActivity, mapping]);

    const updateScopeState = (fieldId, value) => {
        const normalized = normalizeFieldValue(fieldId, value);
        if (fieldId.startsWith("tourGroup.")) {
            setTourGroupUpdates(prev => {
                const next = { ...prev };
                if (normalized === undefined) {
                    delete next[fieldId];
                } else {
                    next[fieldId] = normalized;
                }
                return next;
            });
        } else if (fieldId.startsWith("variant.")) {
            setVariantUpdates(prev => {
                const next = { ...prev };
                if (normalized === undefined) {
                    delete next[fieldId];
                } else {
                    next[fieldId] = normalized;
                }
                return next;
            });
        }
    };

    const handleAiDraftChange = (fieldId, value, autoUpdate = true) => {
        setAiDraft(prev => ({
            ...prev,
            [fieldId]: value,
        }));
        if (autoUpdate) {
            updateScopeState(fieldId, value);
        }
    };

    const normalizeFieldValue = (fieldId, value) => {
        if (booleanFields.has(fieldId)) {
            if (typeof value === "boolean") return value;
            if (typeof value === "string") {
                if (value === "") return undefined;
                return value.toLowerCase() === "true";
            }
            return Boolean(value);
        }

        if (numberFields.has(fieldId)) {
            if (value === "" || value === null || value === undefined) return undefined;
            const num = Number(value);
            return Number.isNaN(num) ? undefined : num;
        }

        if (arrayFields.has(fieldId)) {
            if (Array.isArray(value)) return value;
            if (typeof value === "string") {
                return value
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(Boolean);
            }
        }

        return value;
    };

    const hasDisplayValue = (value) => {
        if (value === false || value === 0) return true;
        if (Array.isArray(value)) return value.length > 0;
        if (value === null || value === undefined) return false;
        if (typeof value === "string") return value.trim() !== "";
        return true;
    };

    const handleUpdateField = (field, value) => {
        updateScopeState(field, value);
    };

    const stripHtml = (value) => {
        if (!value) return "";
        return String(value)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const firstNonEmpty = (...values) => {
        for (const val of values) {
            if (val && String(val).trim()) return val;
        }
        return "";
    };

    const extractGroupContent = (sections = [], refTags = [], sectionNames = []) => {
        if (!Array.isArray(sections)) return "";
        const matches = [];
        const refMatches = refTags.map(t => t.toLowerCase());
        const sectionMatches = sectionNames.map(n => n.toLowerCase());

        sections.forEach(section => {
            const sectionName = (section?.section_name || "").toLowerCase();
            const sectionHit = sectionMatches.some(n => sectionName.includes(n));
            const groups = Array.isArray(section?.groups) ? section.groups : [];
            groups.forEach(group => {
                const tag = (group?.ref_field_tag || "").toLowerCase();
                const name = (group?.group_name || "").toLowerCase();
                const tagHit = refMatches.some(t => tag.includes(t));
                const nameHit = sectionMatches.some(n => name.includes(n));
                if (sectionHit || tagHit || nameHit) {
                    if (group?.content) matches.push(group.content);
                }
            });
        });
        return matches.join("\n\n");
    };

    const providerContent = useMemo(() => {
        const activity = klookData?.activity || {};
        const pkg = klookData?.package || {};
        const activitySections = activity.section_info || [];
        const packageSections = pkg.section_info || [];

        const highlights = extractGroupContent(activitySections, ["summary"], ["highlights"]);
        const goodToKnow = extractGroupContent(activitySections, ["insider_tips"], ["good to know"]);
        const insider = extractGroupContent(activitySections, ["klook_insider"], ["klook insider"]);
        const dateDesc = extractGroupContent(activitySections, ["date_description"], ["date description"]);

        const inclusions = extractGroupContent(packageSections, ["inclusive_of"], ["what's included", "included"]);
        const exclusions = extractGroupContent(packageSections, ["not_inclusive_of"], ["not included", "excluded"]);
        const additionalInfo = extractGroupContent(packageSections, ["additional_information", "policy"], ["additional information", "terms"]);
        const ticketDelivery = extractGroupContent(packageSections, ["redemption_process", "voucher_type_desc"], ["how to redeem", "voucher"]);
        const confirmation = extractGroupContent(packageSections, ["confirmation_details", "policy"], ["confirmation", "cancellation"]);

        const variantInfo = firstNonEmpty(
            extractGroupContent(packageSections, ["inclusive_of"], ["about this package"]),
            activity.what_we_love,
            highlights
        );

        return {
            "tourGroup.name": activity.title || "",
            "tourGroup.summary": firstNonEmpty(activity.what_we_love, activity.subtitle),
            "tourGroup.highlights": highlights,
            "tourGroup.inclusions": inclusions,
            "tourGroup.exclusions": exclusions,
            "tourGroup.faq": firstNonEmpty(goodToKnow, insider, dateDesc),
            "tourGroup.additionalInfo": firstNonEmpty(insider, additionalInfo, dateDesc),
            "tourGroup.ticketDeliveryInfo": ticketDelivery,
            "tourGroup.confirmedTicketInfo": confirmation,
            "variant.name": pkg.package_name || "",
            "variant.variantInfo": variantInfo || "",
            "variant.ticketDeliveryInfo": firstNonEmpty(ticketDelivery, pkg.voucher_usage_multilang),
            "variant.confirmedTicketInfo": firstNonEmpty(confirmation, pkg.cancellation_type_multilang),
            "variant.boosterTags": "",
            "variant.openDated": typeof pkg.is_open_date === "boolean" ? pkg.is_open_date : "",
            "variant.notAvailable": "",
            "variant.externalVariantId": pkg.package_id || "",
            "variant.status": "",
        };
    }, [klookData]);

    const currentContent = useMemo(() => ({
        "tourGroup.name": tylData?.tourGroup?.name || "",
        "tourGroup.summary": tylData?.tourGroup?.summary || "",
        "tourGroup.highlights": tylData?.tourGroup?.highlights || "",
        "tourGroup.inclusions": tylData?.tourGroup?.inclusions || "",
        "tourGroup.exclusions": tylData?.tourGroup?.exclusions || "",
        "tourGroup.faq": tylData?.tourGroup?.faq || "",
        "tourGroup.additionalInfo": tylData?.tourGroup?.additionalInfo || "",
        "tourGroup.ticketDeliveryInfo": tylData?.tourGroup?.ticketDeliveryInfo || "",
        "tourGroup.confirmedTicketInfo": tylData?.tourGroup?.confirmedTicketInfo || "",
        "variant.name": tylData?.variant?.name || "",
        "variant.variantInfo": tylData?.variant?.variantInfo || "",
        "variant.ticketDeliveryInfo": tylData?.variant?.ticketDeliveryInfo || "",
        "variant.confirmedTicketInfo": tylData?.variant?.confirmedTicketInfo || "",
        "variant.boosterTags": Array.isArray(tylData?.variant?.boosterTags)
            ? tylData?.variant?.boosterTags.join(", ")
            : (tylData?.variant?.boosterTags || ""),
        "variant.openDated": typeof tylData?.variant?.openDated === "boolean"
            ? tylData?.variant?.openDated
            : "",
        "variant.notAvailable": typeof tylData?.variant?.notAvailable === "boolean"
            ? tylData?.variant?.notAvailable
            : "",
        "variant.externalVariantId": tylData?.variant?.externalVariantId ?? "",
        "variant.status": typeof tylData?.variant?.status === "boolean"
            ? tylData?.variant?.status
            : "",
    }), [tylData]);

    const tourGroupFieldDefinitions = useMemo(() => ([
        { id: "tourGroup.name", label: "Tour Group Name", type: "text" },
        { id: "tourGroup.summary", label: "Summary", type: "html" },
        { id: "tourGroup.highlights", label: "Highlights", type: "html" },
        { id: "tourGroup.inclusions", label: "Inclusions", type: "html" },
        { id: "tourGroup.exclusions", label: "Exclusions", type: "html" },
        { id: "tourGroup.faq", label: "FAQ / Good to Know", type: "html" },
        { id: "tourGroup.additionalInfo", label: "Additional Info", type: "html" },
        { id: "tourGroup.ticketDeliveryInfo", label: "Ticket Delivery Info", type: "html" },
        { id: "tourGroup.confirmedTicketInfo", label: "Confirmation / Cancellation", type: "html" },
    ]), []);

    const variantFieldDefinitions = useMemo(() => ([
        { id: "variant.name", label: "Variant Name", type: "text" },
        { id: "variant.variantInfo", label: "Variant Info", type: "html" },
        { id: "variant.ticketDeliveryInfo", label: "Ticket Delivery Info", type: "html" },
        { id: "variant.confirmedTicketInfo", label: "Confirmed Ticket Info", type: "html" },
        { id: "variant.boosterTags", label: "Booster Tags", type: "text" },
        { id: "variant.openDated", label: "Open Dated", type: "boolean" },
        { id: "variant.notAvailable", label: "Not Available", type: "boolean" },
        { id: "variant.externalVariantId", label: "External Variant ID", type: "number", helper: "External source variant ID for syncing pricing" },
        { id: "variant.status", label: "Status (Active/Inactive)", type: "boolean" },
    ]), []);

    const mapAiToDraft = (aiData) => ({
        "tourGroup.name": aiData?.tourGroup?.name || "",
        "tourGroup.summary": aiData?.tourGroup?.summary || "",
        "tourGroup.highlights": aiData?.tourGroup?.highlights || "",
        "tourGroup.inclusions": aiData?.tourGroup?.inclusions || "",
        "tourGroup.exclusions": aiData?.tourGroup?.exclusions || "",
        "tourGroup.faq": aiData?.tourGroup?.faq || "",
        "tourGroup.additionalInfo": aiData?.tourGroup?.additionalInfo || "",
        "tourGroup.ticketDeliveryInfo": aiData?.tourGroup?.ticketDeliveryInfo || "",
        "tourGroup.confirmedTicketInfo": aiData?.tourGroup?.confirmedTicketInfo || "",
        "variant.name": aiData?.variant?.name || "",
        "variant.variantInfo": aiData?.variant?.variantInfo || "",
        "variant.ticketDeliveryInfo": aiData?.variant?.ticketDeliveryInfo || "",
        "variant.confirmedTicketInfo": aiData?.variant?.confirmedTicketInfo || "",
        "variant.boosterTags": aiData?.variant?.boosterTags || "",
        "variant.openDated": aiData?.variant?.openDated ?? "",
        "variant.notAvailable": aiData?.variant?.notAvailable ?? "",
        "variant.externalVariantId": aiData?.variant?.externalVariantId ?? "",
        "variant.status": aiData?.variant?.status ?? "",
    });

    const handleGenerateAI = async () => {
        setAiError("");
        if (!klookData?.activity && !klookData?.package) {
            showToastError("Provider activity/package not loaded yet");
            return;
        }

        setAiLoading(true);
        try {
            const response = await generateTourGroupContentAI({
                activity: klookData?.activity || {},
                package: klookData?.package || null,
                currentTourGroup: tylData?.tourGroup || {},
                currentVariant: tylData?.variant || {},
                tone: "professional",
            });

            if (response?.success) {
                setAiDraft(mapAiToDraft(response.data || {}));
                showToastSuccess("AI draft generated");
            } else {
                setAiError(response?.message || "AI generation failed");
            }
        } catch (error) {
            console.error("AI generation error:", error);
            setAiError("AI generation failed. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    const applyAiDraftToUpdates = () => {
        [...tourGroupFieldDefinitions, ...variantFieldDefinitions].forEach(field => {
            const value = aiDraft[field.id];
            const isValuePresent =
                value === false ||
                value === 0 ||
                (typeof value === "string" && value.trim() !== "") ||
                (value !== null && value !== undefined && typeof value !== "string");

            if (isValuePresent) {
                updateScopeState(field.id, value);
            }
        });
        showToastSuccess("AI draft applied to pending updates");
    };

    const saveTourGroupUpdates = async () => {
        if (Object.keys(tourGroupUpdates).length === 0) {
            showToastError("No tour group updates selected");
            return false;
        }

        try {
            setSaving(true);
            if (!tourGroup?._id) {
                throw new Error("Tour group ID not found");
            }
            const payload = {};
            Object.entries(tourGroupUpdates).forEach(([fieldId, value]) => {
                const [, field] = fieldId.split(".");
                payload[field] = value;
            });
            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            await updateTourGroupHelper(tourGroup._id, formData);
            showToastSuccess("Tour group updates saved");
            setTourGroupUpdates({});
            if (onSuccess) onSuccess();
            return true;
        } catch (error) {
            console.error("Failed to save updates:", error);
            showToastError(error.message || "Failed to save updates");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveVariantUpdates = async () => {
        if (Object.keys(variantUpdates).length === 0) {
            showToastError("No variant updates selected");
            return false;
        }

        try {
            setSaving(true);
            const baseVariant = tylData?.variant || variantDetail;
            if (!baseVariant?._id) {
                throw new Error("Variant data not loaded");
            }

            const resolveId = (val) => {
                if (!val) return undefined;
                if (typeof val === "object") return val._id || val.id || val;
                return val;
            };

            const variantPayload = {};
            Object.entries(variantUpdates).forEach(([fieldId, value]) => {
                const [, field] = fieldId.split(".");
                variantPayload[field] = value;
            });

            const payload = {
                productId: resolveId(baseVariant.productId) || tourGroup?._id,
                name: variantPayload.name || baseVariant.name,
                ticketDeliveryInfo: variantPayload.ticketDeliveryInfo || baseVariant.ticketDeliveryInfo,
                confirmedTicketInfo: variantPayload.confirmedTicketInfo || baseVariant.confirmedTicketInfo,
                variantInfo: variantPayload.variantInfo || baseVariant.variantInfo,
                externalVariantId: variantPayload.externalVariantId ?? baseVariant.externalVariantId,
                listingPrice: baseVariant.listingPrice,
                boosterTags: (variantPayload.boosterTags ?? baseVariant.boosterTags) || [],
                openDated: variantPayload.openDated ?? baseVariant.openDated,
                status: variantPayload.status ?? baseVariant.status,
                whatsappOnly: baseVariant.whatsappOnly,
                notAvailable: variantPayload.notAvailable ?? baseVariant.notAvailable,
                hasTimeSlots: baseVariant.hasTimeSlots,
                operatingHours: baseVariant.operatingHours,
                slotDurationMinutes: baseVariant.slotDurationMinutes,
                isPrivate: baseVariant.isPrivate,
                isHotelPickup: baseVariant.isHotelPickup,
            };

            await updateTourGroupVariantAPI(baseVariant._id, payload);
            showToastSuccess("Variant updates saved");
            setVariantUpdates({});
            if (onSuccess) onSuccess();
            return true;
        } catch (error) {
            console.error("Failed to save updates:", error);
            showToastError(error.message || "Failed to save updates");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const maybeSaveBeforeRedirect = async (redirectFn) => {
        const hasAnyUpdates =
            Object.keys(tourGroupUpdates).length > 0 || Object.keys(variantUpdates).length > 0;

        if (!hasAnyUpdates) {
            redirectFn();
            return;
        }

        const shouldSave = window.confirm("You have unsaved updates. Save before leaving?");
        if (shouldSave) {
            const savedGroup = Object.keys(tourGroupUpdates).length > 0 ? await saveTourGroupUpdates() : true;
            const savedVariant = Object.keys(variantUpdates).length > 0 ? await saveVariantUpdates() : true;
            if (!savedGroup || !savedVariant) return;
        }
        redirectFn();
    };

    const handleOpenTourGroupEdit = () => {
        if (!tourGroup?._id) return;
        const url = `/tours-&-experience?editId=${tourGroup._id}`;
        maybeSaveBeforeRedirect(() => redirectTo(url));
    };

    const handleOpenVariantEdit = () => {
        const variantId = resolveVariantId();
        if (!variantId) return;
        const url = `/tour-group-variants/edit/${variantId}`;
        maybeSaveBeforeRedirect(() => redirectTo(url));
    };

    const tourGroupFieldMap = useMemo(() => {
        const map = {};
        tourGroupFieldDefinitions.forEach((field) => {
            map[field.id] = field;
        });
        return map;
    }, [tourGroupFieldDefinitions]);

    const variantFieldMap = useMemo(() => {
        const map = {};
        variantFieldDefinitions.forEach((field) => {
            map[field.id] = field;
        });
        return map;
    }, [variantFieldDefinitions]);

    const pendingTourGroupRows = Object.entries(tourGroupUpdates).map(([fieldId, value]) => {
        const [target, field] = fieldId.split(".");
        return {
            id: fieldId,
            target,
            field,
            fieldDef: tourGroupFieldMap[fieldId] || { id: fieldId, type: "text" },
            label: tourGroupFieldMap[fieldId]?.label || fieldId,
            current: currentContent[fieldId] ?? "",
            next: value,
        };
    });

    const pendingVariantRows = Object.entries(variantUpdates).map(([fieldId, value]) => {
        const [target, field] = fieldId.split(".");
        return {
            id: fieldId,
            target,
            field,
            fieldDef: variantFieldMap[fieldId] || { id: fieldId, type: "text" },
            label: variantFieldMap[fieldId]?.label || fieldId,
            current: currentContent[fieldId] ?? "",
            next: value,
        };
    });

    const formatDisplayValue = (value, field) => {
        if (field.type === "boolean") {
            if (value === true) return "Yes";
            if (value === false) return "No";
            return "—";
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (field.type === "html") {
            return stripHtml(value) || "—";
        }

        return String(value);
    };

    const renderAiFieldEditor = (field) => {
        const value = aiDraft[field.id] ?? "";

        if (field.type === "boolean") {
            const stringValue = value === true ? "true" : value === false ? "false" : "";
            return (
                <Input
                    type="select"
                    value={stringValue}
                    onChange={(e) => {
                        const next = e.target.value === "" ? "" : e.target.value === "true";
                        handleAiDraftChange(field.id, next);
                    }}
                >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </Input>
            );
        }

        if (field.type === "number") {
            return (
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => handleAiDraftChange(field.id, e.target.value)}
                    placeholder="Enter value"
                />
            );
        }

        if (field.type === "text") {
            return (
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => handleAiDraftChange(field.id, e.target.value)}
                    placeholder="Enter text"
                />
            );
        }

        return (
            <div className="border rounded">
                <EditorReact
                    value={value}
                    onChange={(nextValue) => handleAiDraftChange(field.id, nextValue)}
                />
            </div>
        );
    };

    const renderPendingUpdates = ({ title, rows, onSave, emptyText, ctaLabel }) => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 className="mb-0">{title}</h6>
                    <small className="text-muted">Review the changes before saving.</small>
                </div>
                <Button
                    size="sm"
                    color="primary"
                    onClick={onSave}
                    disabled={rows.length === 0 || saving}
                >
                    {saving ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Saving...
                        </>
                    ) : (
                        ctaLabel
                    )}
                </Button>
            </div>
            {rows.length === 0 ? (
                <Alert color="info" className="mb-0">
                    {emptyText}
                </Alert>
            ) : (
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Current Value</th>
                            <th>New Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    <strong>{row.label}</strong>
                                </td>
                                <td>
                                    <div style={{ maxHeight: "120px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                        {formatDisplayValue(row.current, row.fieldDef)}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ maxHeight: "120px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                        {formatDisplayValue(row.next, row.fieldDef)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Edit & Compare Provider Mapping</ModalHeader>
            <ModalBody>
                {klookActivityLoading ? (
                    <div className="text-center py-4">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading data...</p>
                    </div>
                ) : (
                    <>
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                            <div>
                                <h5 className="mb-1">Edit Content & Mapping</h5>
                                <small className="text-muted">
                                    Open full editors for Tour Group or Variant, or return to package mapping.
                                </small>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    color="secondary"
                                    onClick={handleOpenTourGroupEdit}
                                    disabled={!tourGroup?._id}
                                >
                                    Edit Tour Group
                                </Button>
                                <Button
                                    size="sm"
                                    color="secondary"
                                    onClick={handleOpenVariantEdit}
                                    disabled={!resolveVariantId()}
                                >
                                    Edit Variant
                                </Button>
                                <Button
                                    size="sm"
                                    color="info"
                                    onClick={() => {
                                        if (onEditPackages) {
                                            onEditPackages();
                                        } else {
                                            toggle();
                                        }
                                    }}
                                >
                                    Edit Package Mapping
                                </Button>
                            </div>
                        </div>

                        <Card className="mb-3">
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="mb-1">AI Rewrite Controls</h5>
                                        <small className="text-muted">
                                            Generate a safe AI draft, review it, and apply changes field-by-field.
                                        </small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={handleGenerateAI}
                                            disabled={aiLoading}
                                        >
                                            {aiLoading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Generating...
                                                </>
                                            ) : (
                                                "Generate AI Draft"
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="success"
                                            onClick={applyAiDraftToUpdates}
                                            disabled={Object.keys(aiDraft).length === 0}
                                        >
                                            Apply AI to Updates
                                        </Button>
                                    </div>
                                </div>

                                {aiError && (
                                    <Alert color="danger" className="mb-0">
                                        {aiError}
                                    </Alert>
                                )}
                            </CardBody>
                        </Card>

                        <Nav tabs className="nav-tabs-custom">
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "tourgroup" })}
                                    onClick={() => setActiveTab("tourgroup")}
                                >
                                    Tour Group
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "variant" })}
                                    onClick={() => setActiveTab("variant")}
                                >
                                    Variant
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={activeTab} className="mt-3">
                            <TabPane tabId="tourgroup">
                                <Card className="mb-3">
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h5 className="mb-1">Tour Group Content</h5>
                                                <small className="text-muted">Edit high-level tour group copy separately from variants.</small>
                                            </div>
                                        </div>
                                        <Nav pills className="mb-3">
                                            <NavItem>
                                                <NavLink
                                                    style={{ cursor: "pointer" }}
                                                    className={classnames({ active: tourGroupView === "compare" })}
                                                    onClick={() => setTourGroupView("compare")}
                                                >
                                                    Compare
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{ cursor: "pointer" }}
                                                    className={classnames({ active: tourGroupView === "preview" })}
                                                    onClick={() => setTourGroupView("preview")}
                                                >
                                                    Preview & Save ({pendingTourGroupRows.length})
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        {tourGroupView === "compare" ? (
                                        <Table responsive striped className="align-middle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "180px" }}>Field</th>
                                                    <th>Current (TYL)</th>
                                                    <th>Provider</th>
                                                    <th style={{ width: "32%" }}>AI Draft (Editable)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tourGroupFieldDefinitions.map((field) => (
                                                    <tr key={field.id}>
                                                        <td><strong>{field.label}</strong></td>
                                                        <td>
                                                            <div style={{ maxHeight: "140px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                                {formatDisplayValue(currentContent[field.id], field)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ maxHeight: "140px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                                {formatDisplayValue(providerContent[field.id], field)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {renderAiFieldEditor(field)}
                                                            <div className="d-flex gap-2 mt-2">
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    onClick={() => {
                                                                        handleUpdateField(field.id, aiDraft[field.id]);
                                                                    }}
                                                                    disabled={!hasDisplayValue(aiDraft[field.id])}
                                                                >
                                                                    Use AI
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    color="secondary"
                                                                    onClick={() => {
                                                                        const providerValue = providerContent[field.id] ?? "";
                                                                        handleAiDraftChange(field.id, providerValue);
                                                                    }}
                                                                    disabled={!hasDisplayValue(providerContent[field.id])}
                                                                >
                                                                    Use Provider
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        ) : (
                                            renderPendingUpdates({
                                                title: "Pending Tour Group Updates",
                                                rows: pendingTourGroupRows,
                                                onSave: saveTourGroupUpdates,
                                                emptyText: "No tour group updates selected yet.",
                                                ctaLabel: "Save Tour Group Updates",
                                            })
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPane>

                            <TabPane tabId="variant">
                                <Card>
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h5 className="mb-1">Variant Content</h5>
                                                <small className="text-muted">Edit the specific variant + package mapping details.</small>
                                            </div>
                                        </div>
                                        <Alert color="info" className="py-2">
                                            Status & Availability Settings
                                        </Alert>
                                        <Nav pills className="mb-3">
                                            <NavItem>
                                                <NavLink
                                                    style={{ cursor: "pointer" }}
                                                    className={classnames({ active: variantView === "compare" })}
                                                    onClick={() => setVariantView("compare")}
                                                >
                                                    Compare
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{ cursor: "pointer" }}
                                                    className={classnames({ active: variantView === "preview" })}
                                                    onClick={() => setVariantView("preview")}
                                                >
                                                    Preview & Save ({pendingVariantRows.length})
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        {variantView === "compare" ? (
                                        <Table responsive striped className="align-middle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "180px" }}>Field</th>
                                                    <th>Current (TYL)</th>
                                                    <th>Provider</th>
                                                    <th style={{ width: "32%" }}>AI Draft (Editable)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variantFieldDefinitions.map((field) => (
                                                    <tr key={field.id}>
                                                        <td>
                                                            <strong>{field.label}</strong>
                                                            {field.helper && (
                                                                <div className="text-muted small">{field.helper}</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div style={{ maxHeight: "140px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                                {formatDisplayValue(currentContent[field.id], field)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ maxHeight: "140px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                                                                {formatDisplayValue(providerContent[field.id], field)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {renderAiFieldEditor(field)}
                                                            <div className="d-flex gap-2 mt-2">
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    onClick={() => {
                                                                        handleUpdateField(field.id, aiDraft[field.id]);
                                                                    }}
                                                                    disabled={!hasDisplayValue(aiDraft[field.id])}
                                                                >
                                                                    Use AI
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    color="secondary"
                                                                    onClick={() => {
                                                                        const providerValue = providerContent[field.id] ?? "";
                                                                        handleAiDraftChange(field.id, providerValue);
                                                                    }}
                                                                    disabled={!hasDisplayValue(providerContent[field.id])}
                                                                >
                                                                    Use Provider
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        ) : (
                                            renderPendingUpdates({
                                                title: "Pending Variant Updates",
                                                rows: pendingVariantRows,
                                                onSave: saveVariantUpdates,
                                                emptyText: "No variant updates selected yet.",
                                                ctaLabel: "Save Variant Updates",
                                            })
                                        )}
                                    </CardBody>
                                </Card>
                            </TabPane>
                        </TabContent>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditKlookMappingModal;
