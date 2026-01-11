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
    getTourGroupVariantDetailAPI,
    createVariantFromKlookPackage,
    getKlookActivity,
    searchKlookActivities,
} from "helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import ImportKlookPackagesModal from "./ImportKlookPackagesModal";
import CreateVariantManualModal from "./CreateVariantManualModal";

const VariantManagementModal = ({
    isOpen,
    toggle,
    tourGroup,
    onSuccess,
}) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [previewMode, setPreviewMode] = useState(null); // 'json' or 'ui' or null
    const [previewData, setPreviewData] = useState(null);
    const [createFromKlookModal, setCreateFromKlookModal] = useState(false);
    const [createManualModal, setCreateManualModal] = useState(false);

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
            setSelectedVariant(response?.data || variant);
            setEditMode(true);
            setActiveTab("edit");
        } catch (error) {
            console.error("Error fetching variant details:", error);
            showToastError("Failed to load variant details");
        } finally {
            setLoading(false);
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

    // Handle delete variant (placeholder - implement based on your API)
    const handleDeleteVariant = (variant) => {
        if (window.confirm(`Are you sure you want to delete variant "${variant.name}"?`)) {
            // TODO: Implement delete API call
            showToastError("Delete functionality not yet implemented");
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
                                        {variant.status ? (
                                            <Badge color="success">Active</Badge>
                                        ) : (
                                            <Badge color="secondary">Inactive</Badge>
                                        )}
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
                                                onClick={() => handleDeleteVariant(variant)}
                                                title="Delete Variant"
                                            >
                                                <i className="mdi mdi-delete"></i>
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

    // Render edit form (placeholder - implement based on your variant schema)
    const renderEditForm = () => {
        if (!selectedVariant) return <Alert color="warning">No variant selected</Alert>;

        return (
            <div>
                <Alert color="info">
                    Edit form will be implemented based on variant schema. Currently showing preview.
                </Alert>
                <pre style={{ maxHeight: "500px", overflow: "auto", backgroundColor: "#f8f9fa", padding: "1rem" }}>
                    {JSON.stringify(selectedVariant, null, 2)}
                </pre>
                <div className="mt-3">
                    <Button color="secondary" onClick={() => { setEditMode(false); setActiveTab("list"); }}>
                        Cancel
                    </Button>
                    <Button color="primary" className="ms-2" onClick={() => {
                        // TODO: Implement save
                        showToastSuccess("Save functionality will be implemented");
                    }}>
                        Save Changes
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
