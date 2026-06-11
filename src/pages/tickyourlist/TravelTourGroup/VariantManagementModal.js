/**
 * ========================================
 * VARIANT MANAGEMENT MODAL
 * ========================================
 * 
 * Comprehensive variant management for tour groups
 * - List all variants
 * - Create variants (manual or from Klook)
 * - Edit variants
 * - Preview variants (JSON and UI view)
 * - Search and filter for scalability
 * 
 * ========================================
 */

import React, { useState, useEffect, useMemo } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    CardHeader,
    Table,
    Badge,
    Spinner,
    Alert,
    Input,
    Label,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    UncontrolledTooltip,
} from "reactstrap";
import classnames from "classnames";
import {
    getTourGroupVariantsAPI,
    addTourGroupVariantAPI,
    updateTourGroupVariantAPI,
    deleteTourGroupVariantAPI,
    getTourGroupVariantDetailAPI,
    createVariantFromKlookPackage,
    getKlookActivity,
    searchKlookActivities,
} from "helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import ImportKlookPackagesModal from "./ImportKlookPackagesModal";
import CreateVariantManualModal from "./CreateVariantManualModal";
import VariantProviderConfig from "./VariantProviderConfig";
import { setVariantVisibility } from "helpers/admin_ops_helper";

const VariantManagementModal = ({
    isOpen,
    toggle,
    tourGroup,
    onSuccess,
}) => {
    const [variants, setVariants] = useState([]);
    const [togglingId, setTogglingId] = useState(null);

    const handleToggleVisibility = async (variant) => {
        setTogglingId(variant._id);
        try {
            await setVariantVisibility(variant._id, !variant.status);
            setVariants((prev) => prev.map((v) => (v._id === variant._id ? { ...v, status: !variant.status } : v)));
            showToastSuccess(!variant.status
                ? `"${variant.name}" is now visible on the site`
                : `"${variant.name}" is hidden from the site (bookings/data kept)`);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Could not change visibility");
        } finally {
            setTogglingId(null);
        }
    };
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [previewMode, setPreviewMode] = useState(null); // 'json' or 'ui' or null
    const [previewData, setPreviewData] = useState(null);
    const [createFromKlookModal, setCreateFromKlookModal] = useState(false);
    const [createManualModal, setCreateManualModal] = useState(false);
    const [editFields, setEditFields] = useState({});
    const [advancedMode, setAdvancedMode] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch variants when modal opens
    useEffect(() => {
        if (isOpen && tourGroup?._id) {
            fetchVariants();
        } else {
            // Reset state when modal closes
            setVariants([]);
            setSearchQuery("");
            setSelectedVariant(null);
            setEditMode(false);
            setPreviewMode(null);
            setPreviewData(null);
            setActiveTab("list");
        }
    }, [isOpen, tourGroup]);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const response = await getTourGroupVariantsAPI({
                tourGroupId: tourGroup._id,
                page: 1,
                limit: 100, // Get all variants for this tour group
            });
            setVariants(response?.data?.variants || []);
        } catch (error) {
            console.error("Error fetching variants:", error);
            showToastError("Failed to fetch variants");
        } finally {
            setLoading(false);
        }
    };

    // Filter variants based on search query
    const filteredVariants = useMemo(() => {
        if (!searchQuery.trim()) return variants;
        const query = searchQuery.toLowerCase();
        return variants.filter(
            (v) =>
                v.name?.toLowerCase().includes(query) ||
                v.cityCode?.toLowerCase().includes(query) ||
                v._id?.toString().includes(query)
        );
    }, [variants, searchQuery]);

    // Handle create variant from Klook
    const handleCreateFromKlook = () => {
        setCreateFromKlookModal(true);
    };

    // Handle create variant manually
    const handleCreateManual = () => {
        setCreateManualModal(true);
    };

    // Handle edit variant
    const handleEditVariant = async (variant) => {
        try {
            setLoading(true);
            const response = await getTourGroupVariantDetailAPI(variant._id);
            const doc = response?.data?.variant || response?.data || variant;
            setSelectedVariant(doc);
            setEditFields({
                name: doc.name || "",
                externalVariantId: doc.externalVariantId || "",
                status: !!doc.status,
                openDated: !!doc.openDated,
                hasTimeSlots: !!doc.hasTimeSlots,
                slotDurationMinutes: doc.slotDurationMinutes || "",
                whatsappOnly: !!doc.whatsappOnly,
                notAvailable: !!doc.notAvailable,
                isPrivate: !!doc.isPrivate,
                isHotelPickup: !!doc.isHotelPickup,
            });
            setJsonText(JSON.stringify(doc, null, 2));
            setAdvancedMode(false);
            setEditMode(true);
            setActiveTab("edit");
        } catch (error) {
            console.error("Error fetching variant details:", error);
            showToastError("Failed to load variant details");
        } finally {
            setLoading(false);
        }
    };

    // Save edits — the update route replaces all editable fields from the body,
    // so always send the full doc merged with the changed fields.
    const handleSaveVariant = async () => {
        const doc = selectedVariant;
        if (!doc?._id) return;
        let payload;
        if (advancedMode) {
            try {
                payload = JSON.parse(jsonText);
            } catch (e) {
                showToastError("Invalid JSON: " + e.message);
                return;
            }
        } else {
            payload = {
                ...doc,
                ...editFields,
                slotDurationMinutes: editFields.slotDurationMinutes === "" ? undefined : Number(editFields.slotDurationMinutes),
            };
        }
        payload.productId = payload.productId?._id || payload.productId || tourGroup?._id;
        setSaving(true);
        try {
            await updateTourGroupVariantAPI(doc._id, payload);
            showToastSuccess(`"${payload.name || doc.name}" saved`);
            setEditMode(false);
            setActiveTab("list");
            fetchVariants();
            if (onSuccess) onSuccess();
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to save variant");
        } finally {
            setSaving(false);
        }
    };

    // Handle preview variant
    const handlePreviewVariant = async (variant, mode) => {
        try {
            setLoading(true);
            const response = await getTourGroupVariantDetailAPI(variant._id);
            setPreviewData(response?.data || variant);
            setPreviewMode(mode);
            setActiveTab("preview");
        } catch (error) {
            console.error("Error fetching variant details:", error);
            showToastError("Failed to load variant details");
        } finally {
            setLoading(false);
        }
    };

    // Permanently deletes the variant and its tours (cascade on the backend).
    // For temporarily taking a variant off the site, use the visibility toggle instead.
    const handleDeleteVariant = async (variant) => {
        if (!window.confirm(
            `Permanently delete variant "${variant.name}" and all its tour data?\n\n` +
            `This cannot be undone. If you only want to take it off the site, use the Visible/Hidden toggle instead.`
        )) return;
        setDeletingId(variant._id);
        try {
            await deleteTourGroupVariantAPI(variant._id);
            showToastSuccess(`"${variant.name}" deleted`);
            setVariants((prev) => prev.filter((v) => v._id !== variant._id));
            if (onSuccess) onSuccess();
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to delete variant");
        } finally {
            setDeletingId(null);
        }
    };

    // Render variant list
    const renderVariantList = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2" style={{ flex: 1, maxWidth: "400px" }}>
                    <Input
                        type="text"
                        placeholder="Search variants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bsSize="sm"
                    />
                    <Badge color="info">{filteredVariants.length} variant(s)</Badge>
                </div>
                <div className="d-flex gap-2">
                    <Button color="primary" size="sm" onClick={handleCreateFromKlook}>
                        <i className="mdi mdi-import me-1"></i>
                        Import from Provider
                    </Button>
                    <Button color="success" size="sm" onClick={handleCreateManual}>
                        <i className="mdi mdi-plus-circle me-1"></i>
                        Create Manually
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2">Loading variants...</p>
                </div>
            ) : filteredVariants.length === 0 ? (
                <Alert color="info">
                    {searchQuery ? "No variants found matching your search." : "No variants found for this tour group."}
                </Alert>
            ) : (
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <Table responsive striped hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City Code</th>
                                <th>External ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVariants.map((variant) => (
                                <tr key={variant._id}>
                                    <td>
                                        <strong>{variant.name || "Unnamed Variant"}</strong>
                                    </td>
                                    <td>{variant.cityCode || "—"}</td>
                                    <td>
                                        {variant.externalVariantId ? (
                                            <Badge color="info">{variant.externalVariantId}</Badge>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            color={variant.status ? "success" : "secondary"}
                                            outline={!variant.status}
                                            title={variant.status ? "Visible on the site — click to hide" : "Hidden from the site — click to show"}
                                            disabled={togglingId === variant._id}
                                            onClick={() => handleToggleVisibility(variant)}
                                        >
                                            {togglingId === variant._id
                                                ? <Spinner size="sm" />
                                                : variant.status ? <><i className="mdi mdi-eye me-1" />Visible</> : <><i className="mdi mdi-eye-off me-1" />Hidden</>}
                                        </Button>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button
                                                color="info"
                                                size="sm"
                                                onClick={() => handleEditVariant(variant)}
                                                title="Edit Variant"
                                            >
                                                <i className="mdi mdi-pencil"></i>
                                            </Button>
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                onClick={() => handlePreviewVariant(variant, "ui")}
                                                title="Preview (UI)"
                                            >
                                                <i className="mdi mdi-eye"></i>
                                            </Button>
                                            <Button
                                                color="dark"
                                                size="sm"
                                                onClick={() => handlePreviewVariant(variant, "json")}
                                                title="Preview (JSON)"
                                            >
                                                <i className="mdi mdi-code-json"></i>
                                            </Button>
                                            <Button
                                                color="danger"
                                                size="sm"
                                                disabled={deletingId === variant._id}
                                                onClick={() => handleDeleteVariant(variant)}
                                                title="Delete Variant (permanent)"
                                            >
                                                {deletingId === variant._id ? <Spinner size="sm" /> : <i className="mdi mdi-delete"></i>}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );

    const renderEditForm = () => {
        if (!selectedVariant) return <Alert color="warning">No variant selected</Alert>;

        const setField = (k, v) => setEditFields((prev) => ({ ...prev, [k]: v }));
        const flag = (key, label, hint) => (
            <Col md={4} key={key}>
                <div className="form-check form-switch mb-2">
                    <Input
                        type="switch"
                        className="form-check-input"
                        id={`vm-flag-${key}`}
                        checked={!!editFields[key]}
                        onChange={(e) => setField(key, e.target.checked)}
                    />
                    <Label className="form-check-label" for={`vm-flag-${key}`} title={hint}>{label}</Label>
                </div>
            </Col>
        );

        return (
            <div>
                <div className="form-check form-switch mb-3">
                    <Input
                        type="switch"
                        className="form-check-input"
                        id="vm-advanced"
                        checked={advancedMode}
                        onChange={(e) => setAdvancedMode(e.target.checked)}
                    />
                    <Label className="form-check-label" for="vm-advanced">
                        Advanced mode — edit the full variant JSON
                    </Label>
                </div>

                {advancedMode ? (
                    <>
                        <Alert color="warning" className="py-2">
                            The whole document below is sent as the update payload. Pricing edits here trigger currency re-conversion.
                        </Alert>
                        <Input
                            type="textarea"
                            rows={20}
                            style={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                        />
                    </>
                ) : (
                    <>
                        <Row>
                            <Col md={6} className="mb-3">
                                <Label>Name</Label>
                                <Input
                                    value={editFields.name}
                                    onChange={(e) => setField("name", e.target.value)}
                                />
                            </Col>
                            <Col md={3} className="mb-3">
                                <Label>External Variant ID</Label>
                                <Input
                                    value={editFields.externalVariantId}
                                    onChange={(e) => setField("externalVariantId", e.target.value)}
                                />
                            </Col>
                            <Col md={3} className="mb-3">
                                <Label>Slot duration (min)</Label>
                                <Input
                                    type="number"
                                    value={editFields.slotDurationMinutes}
                                    onChange={(e) => setField("slotDurationMinutes", e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            {flag("status", "Visible on site")}
                            {flag("openDated", "Open dated")}
                            {flag("hasTimeSlots", "Has time slots")}
                            {flag("whatsappOnly", "WhatsApp only")}
                            {flag("notAvailable", "Not available")}
                            {flag("isPrivate", "Private tour")}
                            {flag("isHotelPickup", "Hotel pickup")}
                        </Row>
                        <Alert color="light" className="py-2 mt-2 mb-0">
                            Pricing, tour content and delivery info aren't editable here — use Advanced mode
                            or the dedicated pricing pages.
                        </Alert>
                    </>
                )}

                <div className="mt-3">
                    <Button color="secondary" disabled={saving} onClick={() => { setEditMode(false); setActiveTab("list"); }}>
                        Cancel
                    </Button>
                    <Button color="primary" className="ms-2" disabled={saving} onClick={handleSaveVariant}>
                        {saving ? <><Spinner size="sm" className="me-1" />Saving…</> : "Save Changes"}
                    </Button>
                </div>
            </div>
        );
    };

    // Render preview
    const renderPreview = () => {
        if (!previewData) return <Alert color="warning">No preview data</Alert>;

        if (previewMode === "json") {
            return (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>JSON Preview</h6>
                        <Button
                            color="secondary"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
                                showToastSuccess("JSON copied to clipboard!");
                            }}
                        >
                            <i className="mdi mdi-content-copy me-1"></i>
                            Copy JSON
                        </Button>
                    </div>
                    <div style={{ maxHeight: "500px", overflow: "auto", backgroundColor: "#f8f9fa", padding: "1rem" }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {JSON.stringify(previewData, null, 2)}
                        </pre>
                    </div>
                </div>
            );
        }

        // UI Preview
        return (
            <div>
                <h6 className="mb-3">UI Preview</h6>
                <Card>
                    <CardBody>
                        <Row>
                            <Col md={6}>
                                <strong>Name:</strong> {previewData.variant?.name || previewData.name || "—"}
                            </Col>
                            <Col md={6}>
                                <strong>Status:</strong>{" "}
                                {previewData.variant?.status || previewData.status ? (
                                    <Badge color="success">Active</Badge>
                                ) : (
                                    <Badge color="secondary">Inactive</Badge>
                                )}
                            </Col>
                            <Col md={6}>
                                <strong>City Code:</strong> {previewData.variant?.cityCode || previewData.cityCode || "—"}
                            </Col>
                            <Col md={6}>
                                <strong>External Variant ID:</strong>{" "}
                                {previewData.variant?.externalVariantId || previewData.externalVariantId || "—"}
                            </Col>
                            {/* Add more fields as needed */}
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    };

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="xl" style={{ maxWidth: "1400px" }}>
                <ModalHeader toggle={toggle}>
                    Manage Variants - {tourGroup?.name || "Tour Group"}
                </ModalHeader>
                <ModalBody>
                    <Nav tabs className="nav-tabs-custom mb-3">
                        <NavItem>
                            <NavLink
                                style={{ cursor: "pointer" }}
                                className={classnames({ active: activeTab === "list" })}
                                onClick={() => setActiveTab("list")}
                            >
                                <i className="mdi mdi-format-list-bulleted me-1"></i>
                                Variant List
                            </NavLink>
                        </NavItem>
                        {editMode && selectedVariant && (
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "edit" })}
                                    onClick={() => setActiveTab("edit")}
                                >
                                    <i className="mdi mdi-pencil me-1"></i>
                                    Edit Variant
                                </NavLink>
                            </NavItem>
                        )}
                        {selectedVariant && (
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "providers" })}
                                    onClick={() => setActiveTab("providers")}
                                >
                                    <i className="bx bx-plug me-1"></i>
                                    Providers
                                    <Badge color="primary" pill className="ms-1" style={{ fontSize: "0.65em" }}>
                                        NEW
                                    </Badge>
                                </NavLink>
                            </NavItem>
                        )}
                        {previewMode && previewData && (
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "preview" })}
                                    onClick={() => setActiveTab("preview")}
                                >
                                    <i className={`mdi ${previewMode === "json" ? "mdi-code-json" : "mdi-eye"} me-1`}></i>
                                    Preview ({previewMode === "json" ? "JSON" : "UI"})
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="list">
                            {renderVariantList()}
                        </TabPane>
                        {editMode && (
                            <TabPane tabId="edit">
                                {renderEditForm()}
                            </TabPane>
                        )}
                        {previewMode && (
                            <TabPane tabId="preview">
                                {renderPreview()}
                            </TabPane>
                        )}
                        <TabPane tabId="providers">
                            {selectedVariant && activeTab === "providers" && (
                                <div className="p-3">
                                    <VariantProviderConfig
                                        variantId={selectedVariant._id}
                                        tourGroupId={tourGroup?._id}
                                        variantName={selectedVariant.name}
                                    />
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Import from Klook Modal */}
            {createFromKlookModal && (
                <ImportKlookPackagesModal
                    isOpen={createFromKlookModal}
                    toggle={() => setCreateFromKlookModal(false)}
                    tourGroup={tourGroup}
                    existingVariants={variants}
                    onSuccess={() => {
                        setCreateFromKlookModal(false);
                        fetchVariants();
                        if (onSuccess) onSuccess();
                    }}
                />
            )}

            {/* Create Manual Modal */}
            {createManualModal && (
                <CreateVariantManualModal
                    isOpen={createManualModal}
                    toggle={() => setCreateManualModal(false)}
                    tourGroup={tourGroup}
                    onSuccess={() => {
                        setCreateManualModal(false);
                        fetchVariants();
                        if (onSuccess) onSuccess();
                    }}
                />
            )}
        </>
    );
};

export default VariantManagementModal;
