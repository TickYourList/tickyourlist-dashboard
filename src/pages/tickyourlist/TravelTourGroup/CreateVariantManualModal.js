/**
 * ========================================
 * CREATE VARIANT MANUAL MODAL
 * ========================================
 * 
 * Form to manually create a new variant for a tour group
 * 
 * ========================================
 */

import React, { useState } from "react";
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
    FormGroup,
    Card,
    CardBody,
    Alert,
    Spinner,
} from "reactstrap";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import { addTourGroupVariantAPI } from "helpers/location_management_helper";

const CreateVariantManualModal = ({
    isOpen,
    toggle,
    tourGroup,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        ticketDeliveryInfo: "",
        confirmedTicketInfo: "",
        variantInfo: "",
        externalVariantId: "",
        openDated: false,
        status: true,
        whatsappOnly: false,
        notAvailable: false,
        hasTimeSlots: false,
        isPrivate: false,
        isHotelPickup: false,
        slotDurationMinutes: "",
        boosterTags: "",
        // Pricing (simplified - can be expanded)
        listingPrice: {
            prices: [{
                type: "ADULT",
                originalPrice: 0,
                finalPrice: 0,
                ageRange: { min: 0, max: 0 }
            }],
            groupSize: 1
        },
    });

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            // Handle nested fields like listingPrice.prices[0].finalPrice
            const [parent, child, index, subChild] = field.split(".");
            setFormData((prev) => {
                const newData = { ...prev };
                if (index !== undefined) {
                    // Array access
                    newData[parent][child][parseInt(index)][subChild] = value;
                } else {
                    newData[parent][child] = value;
                }
                return newData;
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.name.trim()) {
            showToastError("Variant name is required");
            return;
        }

        if (!tourGroup?._id) {
            showToastError("Tour group is required");
            return;
        }

        try {
            setLoading(true);

            // Prepare payload
            const payload = {
                productId: tourGroup._id,
                name: formData.name,
                ticketDeliveryInfo: formData.ticketDeliveryInfo || undefined,
                confirmedTicketInfo: formData.confirmedTicketInfo || undefined,
                variantInfo: formData.variantInfo || undefined,
                externalVariantId: formData.externalVariantId ? parseInt(formData.externalVariantId) : undefined,
                openDated: formData.openDated,
                status: formData.status,
                whatsappOnly: formData.whatsappOnly,
                notAvailable: formData.notAvailable,
                hasTimeSlots: formData.hasTimeSlots,
                isPrivate: formData.isPrivate,
                isHotelPickup: formData.isHotelPickup,
                slotDurationMinutes: formData.slotDurationMinutes ? parseInt(formData.slotDurationMinutes) : undefined,
                boosterTags: formData.boosterTags ? formData.boosterTags.split(",").map(tag => tag.trim()).filter(Boolean) : undefined,
                listingPrice: formData.listingPrice,
            };

            const response = await addTourGroupVariantAPI(payload);

            if (response?.tylTourGroupVariant) {
                showToastSuccess("Variant created successfully!");
                if (onSuccess) {
                    onSuccess();
                }
                toggle();
                // Reset form
                setFormData({
                    name: "",
                    ticketDeliveryInfo: "",
                    confirmedTicketInfo: "",
                    variantInfo: "",
                    externalVariantId: "",
                    openDated: false,
                    status: true,
                    whatsappOnly: false,
                    notAvailable: false,
                    hasTimeSlots: false,
                    isPrivate: false,
                    isHotelPickup: false,
                    slotDurationMinutes: "",
                    boosterTags: "",
                    listingPrice: {
                        prices: [{
                            type: "ADULT",
                            originalPrice: 0,
                            finalPrice: 0,
                            ageRange: { min: 0, max: 0 }
                        }],
                        groupSize: 1
                    },
                });
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Error creating variant:", error);
            showToastError(error.response?.data?.message || error.message || "Failed to create variant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Create Variant Manually - {tourGroup?.name || "Tour Group"}
            </ModalHeader>
            <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <Alert color="info" className="mb-3">
                    <small>
                        <strong>Note:</strong> City code and city will be automatically inherited from the tour group.
                    </small>
                </Alert>

                <Card>
                    <CardBody>
                        {/* Basic Information */}
                        <h6 className="mb-3">Basic Information</h6>
                        
                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <Label>Variant Name <span className="text-danger">*</span></Label>
                                    <Input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="e.g., Standard Package, VIP Package"
                                        required
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup>
                                    <Label>External Variant ID</Label>
                                    <Input
                                        type="number"
                                        value={formData.externalVariantId}
                                        onChange={(e) => handleInputChange("externalVariantId", e.target.value)}
                                        placeholder="External source variant ID"
                                    />
                                    <small className="text-muted">Optional: For syncing with external providers</small>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot Duration (Minutes)</Label>
                                    <Input
                                        type="number"
                                        value={formData.slotDurationMinutes}
                                        onChange={(e) => handleInputChange("slotDurationMinutes", e.target.value)}
                                        placeholder="e.g., 60"
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={12}>
                                <FormGroup>
                                    <Label>Variant Info</Label>
                                    <Input
                                        type="textarea"
                                        rows={3}
                                        value={formData.variantInfo}
                                        onChange={(e) => handleInputChange("variantInfo", e.target.value)}
                                        placeholder="Additional information about this variant"
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={12}>
                                <FormGroup>
                                    <Label>Booster Tags (comma-separated)</Label>
                                    <Input
                                        type="text"
                                        value={formData.boosterTags}
                                        onChange={(e) => handleInputChange("boosterTags", e.target.value)}
                                        placeholder="e.g., popular, featured, bestseller"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Ticket Information */}
                        <hr className="my-4" />
                        <h6 className="mb-3">Ticket Information</h6>

                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <Label>Ticket Delivery Info</Label>
                                    <Input
                                        type="textarea"
                                        rows={2}
                                        value={formData.ticketDeliveryInfo}
                                        onChange={(e) => handleInputChange("ticketDeliveryInfo", e.target.value)}
                                        placeholder="How tickets will be delivered"
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={12}>
                                <FormGroup>
                                    <Label>Confirmed Ticket Info</Label>
                                    <Input
                                        type="textarea"
                                        rows={2}
                                        value={formData.confirmedTicketInfo}
                                        onChange={(e) => handleInputChange("confirmedTicketInfo", e.target.value)}
                                        placeholder="Information about confirmed tickets"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Pricing */}
                        <hr className="my-4" />
                        <h6 className="mb-3">Pricing (Base - USD)</h6>

                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Final Price (USD)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.listingPrice.prices[0]?.finalPrice || 0}
                                        onChange={(e) => handleInputChange("listingPrice.prices.0.finalPrice", parseFloat(e.target.value) || 0)}
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup>
                                    <Label>Original Price (USD)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.listingPrice.prices[0]?.originalPrice || 0}
                                        onChange={(e) => handleInputChange("listingPrice.prices.0.originalPrice", parseFloat(e.target.value) || 0)}
                                    />
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup>
                                    <Label>Group Size</Label>
                                    <Input
                                        type="number"
                                        value={formData.listingPrice.groupSize || 1}
                                        onChange={(e) => handleInputChange("listingPrice.groupSize", parseInt(e.target.value) || 1)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Options */}
                        <hr className="my-4" />
                        <h6 className="mb-3">Options</h6>

                        <Row>
                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.status}
                                        onChange={(e) => handleInputChange("status", e.target.checked)}
                                    />
                                    <Label check>Active</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.openDated}
                                        onChange={(e) => handleInputChange("openDated", e.target.checked)}
                                    />
                                    <Label check>Open Dated</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.hasTimeSlots}
                                        onChange={(e) => handleInputChange("hasTimeSlots", e.target.checked)}
                                    />
                                    <Label check>Has Time Slots</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.isPrivate}
                                        onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                                    />
                                    <Label check>Is Private</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.isHotelPickup}
                                        onChange={(e) => handleInputChange("isHotelPickup", e.target.checked)}
                                    />
                                    <Label check>Hotel Pickup Available</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.whatsappOnly}
                                        onChange={(e) => handleInputChange("whatsappOnly", e.target.checked)}
                                    />
                                    <Label check>WhatsApp Only</Label>
                                </FormGroup>
                            </Col>

                            <Col md={6}>
                                <FormGroup check>
                                    <Input
                                        type="checkbox"
                                        checked={formData.notAvailable}
                                        onChange={(e) => handleInputChange("notAvailable", e.target.checked)}
                                    />
                                    <Label check>Not Available</Label>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} disabled={loading}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <i className="mdi mdi-check me-1"></i>
                            Create Variant
                        </>
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CreateVariantManualModal;
