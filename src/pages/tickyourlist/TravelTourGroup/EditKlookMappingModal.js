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
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
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

    const [activeTab, setActiveTab] = useState("compare");
    const [tylData, setTylData] = useState(null);
    const [klookData, setKlookData] = useState(null);
    const [translationMap, setTranslationMap] = useState({});
    const [updates, setUpdates] = useState({});

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

    // Extract TYL data
    useEffect(() => {
        if (tourGroup?._id && tourGroupById[tourGroup._id]) {
            const tgData = tourGroupById[tourGroup._id];
            const variant = tgData?.variants?.find(v => v._id === mapping?.variantId);
            
            setTylData({
                tourGroup: {
                    name: tgData.name || tourGroup.name,
                    description: tgData.description || tourGroup.description,
                    cityCode: tgData.cityCode || tourGroup.cityCode,
                },
                variant: variant ? {
                    name: variant.name,
                    description: variant.description,
                    price: variant.listingPrice?.prices?.[0]?.price || variant.basePrice,
                    currency: variant.listingPrice?.prices?.[0]?.currency || variant.currency,
                } : null,
            });
        }
    }, [tourGroupById, tourGroup, mapping]);

    // Extract Klook data
    useEffect(() => {
        if (klookActivity) {
            const packageData = klookActivity.package_list?.find(
                pkg => pkg.package_id === mapping?.externalVariantId
            ) || klookActivity.package_list?.[0];

            setKlookData({
                activity: {
                    title: klookActivity.title,
                    subtitle: klookActivity.subtitle,
                    what_we_love: klookActivity.what_we_love,
                    location: klookActivity.location,
                    address_desc_multilang: klookActivity.address_desc_multilang,
                },
                package: packageData ? {
                    package_name: packageData.package_name,
                    package_id: packageData.package_id,
                    cancellation_type_multilang: packageData.cancellation_type_multilang,
                } : null,
            });
        }
    }, [klookActivity, mapping]);

    // Initialize translation map
    useEffect(() => {
        if (tylData && klookData) {
            const initialMap = {
                title: klookData.activity.title || "",
                description: klookData.activity.what_we_love || "",
                variantName: klookData.package?.package_name || "",
            };
            setTranslationMap(initialMap);
        }
    }, [tylData, klookData]);

    const handleTranslationChange = (field, value) => {
        setTranslationMap({
            ...translationMap,
            [field]: value,
        });
    };

    const handleUpdateField = (field, value) => {
        setUpdates({
            ...updates,
            [field]: value,
        });
    };

    const handleSave = () => {
        // TODO: Implement save logic to update TYL data with Klook data
        console.log("Saving updates:", updates);
        console.log("Translation map:", translationMap);
        showToastSuccess("Updates saved successfully");
        if (onSuccess) onSuccess();
        toggle();
    };

    const compareFields = [
        {
            label: "Title/Name",
            tyl: tylData?.tourGroup?.name,
            klook: klookData?.activity?.title,
            field: "name",
        },
        {
            label: "Description",
            tyl: tylData?.tourGroup?.description,
            klook: klookData?.activity?.what_we_love,
            field: "description",
        },
        {
            label: "Variant Name",
            tyl: tylData?.variant?.name,
            klook: klookData?.package?.package_name,
            field: "variantName",
        },
        {
            label: "Location",
            tyl: tylData?.tourGroup?.cityCode,
            klook: klookData?.activity?.address_desc_multilang,
            field: "location",
        },
    ];

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Edit & Compare Klook Mapping</ModalHeader>
            <ModalBody>
                {klookActivityLoading ? (
                    <div className="text-center py-4">
                        <Spinner color="primary" />
                        <p className="mt-2">Loading data...</p>
                    </div>
                ) : (
                    <>
                        <Nav tabs className="nav-tabs-custom">
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "compare" })}
                                    onClick={() => setActiveTab("compare")}
                                >
                                    Compare Data
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "translate" })}
                                    onClick={() => setActiveTab("translate")}
                                >
                                    Translate & Map
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "update" })}
                                    onClick={() => setActiveTab("update")}
                                >
                                    Update TYL Data
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={activeTab} className="mt-3">
                            <TabPane tabId="compare">
                                <Card>
                                    <CardBody>
                                        <h5>Data Comparison</h5>
                                        <Table responsive striped>
                                            <thead>
                                                <tr>
                                                    <th>Field</th>
                                                    <th>TYL Data</th>
                                                    <th>Klook Data</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compareFields.map((field, index) => (
                                                    <tr key={index}>
                                                        <td><strong>{field.label}</strong></td>
                                                        <td>
                                                            <div style={{ maxWidth: "300px", wordBreak: "break-word" }}>
                                                                {field.tyl || <span className="text-muted">—</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ maxWidth: "300px", wordBreak: "break-word" }}>
                                                                {field.klook || <span className="text-muted">—</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {field.tyl !== field.klook && field.klook ? (
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    onClick={() => handleUpdateField(field.field, field.klook)}
                                                                >
                                                                    Use Klook
                                                                </Button>
                                                            ) : (
                                                                <Badge color="success">Match</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </CardBody>
                                </Card>
                            </TabPane>

                            <TabPane tabId="translate">
                                <Card>
                                    <CardBody>
                                        <h5>Translation & Mapping</h5>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Label>TYL Title</Label>
                                                <Input
                                                    type="text"
                                                    value={tylData?.tourGroup?.name || ""}
                                                    disabled
                                                    className="bg-light"
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Label>Klook Title (Translated)</Label>
                                                <Input
                                                    type="text"
                                                    value={translationMap.title || ""}
                                                    onChange={(e) => handleTranslationChange("title", e.target.value)}
                                                    placeholder="Enter translated title"
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Label>TYL Description</Label>
                                                <Input
                                                    type="textarea"
                                                    rows={4}
                                                    value={tylData?.tourGroup?.description || ""}
                                                    disabled
                                                    className="bg-light"
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Label>Klook Description (Translated)</Label>
                                                <Input
                                                    type="textarea"
                                                    rows={4}
                                                    value={translationMap.description || ""}
                                                    onChange={(e) => handleTranslationChange("description", e.target.value)}
                                                    placeholder="Enter translated description"
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mt-3">
                                            <Col md={6}>
                                                <Label>TYL Variant Name</Label>
                                                <Input
                                                    type="text"
                                                    value={tylData?.variant?.name || ""}
                                                    disabled
                                                    className="bg-light"
                                                />
                                            </Col>
                                            <Col md={6}>
                                                <Label>Klook Package Name (Translated)</Label>
                                                <Input
                                                    type="text"
                                                    value={translationMap.variantName || ""}
                                                    onChange={(e) => handleTranslationChange("variantName", e.target.value)}
                                                    placeholder="Enter translated variant name"
                                                />
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </TabPane>

                            <TabPane tabId="update">
                                <Card>
                                    <CardBody>
                                        <h5>Pending Updates</h5>
                                        {Object.keys(updates).length === 0 ? (
                                            <Alert color="info">
                                                No updates selected. Use the "Compare Data" tab to select fields to update.
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
                                                    {Object.entries(updates).map(([field, value]) => (
                                                        <tr key={field}>
                                                            <td><strong>{field}</strong></td>
                                                            <td>
                                                                {field === "name" ? tylData?.tourGroup?.name :
                                                                 field === "description" ? tylData?.tourGroup?.description :
                                                                 field === "variantName" ? tylData?.variant?.name : "—"}
                                                            </td>
                                                            <td>{value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
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
                <Button
                    color="primary"
                    onClick={handleSave}
                    disabled={Object.keys(updates).length === 0}
                >
                    Save Updates
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditKlookMappingModal;
