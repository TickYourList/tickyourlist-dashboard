import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
import Select from "react-select";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    UncontrolledTooltip,
    Input,
    Label,
    Alert,
    Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import {
    getSubcategories,
    addTravelSubcategory,
    deleteSubcategory,
    resetCategoryStatus,
} from "store/actions";
import { getCities } from "store/actions";
import { usePermissions, MODULES, ACTIONS } from '../../../helpers/permissions';

// Component imports
import TravelSubCategoryDetailsModal from "./TravelSubCategoryDetailsModal";
import { getUserPermissions } from "store/user-permissions/actions";

const SubCategory = () => {
    document.title = "Travel Sub Categories | Scrollit";
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const {
        subcategories,
        loading,
        error,
        deleteSuccess,
    } = useSelector((state) => state.travelSubCategoryReducer);

    const cities = useSelector((state) => state.travelCity?.cities || []);

    const { can, loading: permissionLoading, isPermissionsReady } = usePermissions();

    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [filterCityCode, setFilterCityCode] = useState("");
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [notification, setNotification] = useState({
        message: "",
        type: "",
        isVisible: false,
    });
    const [showReloadButton, setShowReloadButton] = useState(false);
    const [showNotFound, setShowNotFound] = useState(false); // New state for 'not found' message

    const canView = can(ACTIONS.CAN_VIEW, MODULES.SUBCATEGORY_PERMS);
    const canAdd = can(ACTIONS.CAN_ADD, MODULES.SUBCATEGORY_PERMS);
    const canEdit = can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS);
    const canDelete = can(ACTIONS.CAN_DELETE, MODULES.SUBCATEGORY_PERMS);

    // Fetch cities on mount
    useEffect(() => {
        dispatch(getCities());

        // Safety check: if permissions are empty, fetch them
        const authUser = localStorage.getItem("authUser");
        console.log("SubCategory: Checking authUser from localStorage:", authUser ? "Found" : "Not Found");

        if (authUser) {
            console.log("SubCategory: Raw authUser string:", authUser);
            try {
                const userData = JSON.parse(authUser);
                // Handle various potential structures of authUser
                const userId = userData.data?.user?._id || userData.userId || userData.id || userData.user_id;
                console.log("SubCategory: Parsed userId:", userId);

                // We dispatch if not ready/empty, handled by redux checking redundant calls usually, 
                // but here we force it if we see empty state to be safe on reload.
                if (userId) {
                    console.log("SubCategory: Dispatching getUserPermissions for userId:", userId);
                    dispatch(getUserPermissions(userId));
                } else {
                    console.warn("SubCategory: No userId found in authUser data");
                }
            } catch (e) {
                console.error("SubCategory: Error parsing authUser:", e);
            }
        }
    }, [dispatch]);

    // Fetch subcategories if user has view permission
    useEffect(() => {
        if (isPermissionsReady && canView) {
            dispatch(getSubcategories(filterCityCode || null));
        }
    }, [dispatch, canView, isPermissionsReady, filterCityCode]);

    // Manage "No Subcategories Found" message delay
    useEffect(() => {
        let timer;
        if (!loading && !error && subcategories && subcategories.length === 0) {
            timer = setTimeout(() => {
                setShowNotFound(true);
            }, 1000); // 1-second delay before showing "not found"
        } else {
            setShowNotFound(false);
        }
        return () => clearTimeout(timer);
    }, [subcategories, loading, error]);

    useEffect(() => {
        dispatch(resetCategoryStatus());
    }, [dispatch]);

    useEffect(() => {
        let timer;
        if (error && !loading) {
            timer = setTimeout(() => {
                setShowReloadButton(true);
            }, 1000);
        } else {
            setShowReloadButton(false);
            clearTimeout(timer);
        }
        return () => clearTimeout(timer);
    }, [error, loading]);

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: (currentCategory && currentCategory.name) || "",
            displayName: (currentCategory && currentCategory.displayName) || "",
            tourCount: (currentCategory && currentCategory.tourCount) || "",
            sortOrder: (currentCategory && currentCategory.sortOrder) || "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Please Enter Name"),
            displayName: Yup.string().required("Please Enter Display Name"),
            tourCount: Yup.number()
                .typeError("Tours must be a number")
                .required("Please Enter Number of Tours")
                .min(0, "Tours cannot be negative"),
            sortOrder: Yup.number()
                .typeError("Sort must be a number")
                .required("Please Enter Sort Order")
                .min(0, "Sort order cannot be negative"),
        }),
        onSubmit: (values) => {
            if (isEdit) {
                // Your update logic
            } else {
                const newCategory = {
                    id: Math.floor(Math.random() * 1000),
                    name: values.name,
                    displayName: values.displayName,
                    tourCount: values.tourCount,
                    sortOrder: values.sortOrder,
                    cityCode: filterCityCode || "ALL",
                };
                dispatch(addTravelSubcategory(newCategory));
            }
            toggle();
            validation.resetForm();
        },
    });

    const showNotification = (message, type) => {
        setNotification({ message, type, isVisible: true });
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, isVisible: false }));
        }, 3000);
    };

    const toggle = () => {
        if (modal) {
            setModal(false);
            setCurrentCategory(null);
            setIsEdit(false);
            validation.resetForm();
        } else {
            setModal(true);
        }
    };

    const handleCityChange = (selectedOption) => {
        const cityCode = selectedOption?.value || "";
        setFilterCityCode(cityCode);
    };

    const handleReloadData = () => {
        setShowReloadButton(false);
        if (canView) {
            dispatch(getSubcategories());
        }
    };

    const handleCategoryClick = (arg) => {
        setCurrentCategory({
            id: arg.id,
            name: arg.name,
            displayName: arg.displayName,
            tourCount: arg.tourCount,
            sortOrder: arg.sortOrder,
            cityCode: arg.cityCode,
        });
        setIsEdit(true);
        toggle();
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    const handleConfirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            dispatch(deleteSubcategory(categoryToDelete._id));
            if (deleteSuccess) {
                dispatch(getSubcategories());
                showNotification(`${categoryToDelete.name} deleted successfully.`, "success");
                closeDeleteDialog();
                dispatch(resetCategoryStatus());
            } else {
                dispatch(getSubcategories());
                closeDeleteDialog();
                showNotification(`${categoryToDelete.name} failed to delete.`, "error");
            }
        } catch (error) {
            console.error("Deletion error:", error);
            showNotification(`An unexpected error occurred while deleting ${categoryToDelete.name}.`, "error");
        }
    };

    const handleAddCategoryClick = () => {
        setCurrentCategory(null);
        setIsEdit(false);
        toggle();
    };

    const openDetailsModal = (subcategory) => {
        setSelectedSubCategory(subcategory);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setSelectedSubCategory(null);
        setIsDetailsModalOpen(false);
    };

    const columns = useMemo(() => {
        const baseColumns = [
            {
                Header: "Name",
                accessor: "name",
                filterable: true,
                sortType: "basic",
            },
            {
                Header: "Display Name",
                accessor: "displayName",
                filterable: true,
                sortType: "basic",
            },
            {
                Header: "Tours",
                accessor: "tourCount",
                filterable: true,
                sortType: "basic",
            },
            {
                Header: "Sort",
                accessor: "sortOrder",
                filterable: true,
                sortType: "basic",
            },
            {
                Header: "View Travel Sub Category",
                accessor: "_id",
                Cell: ({ row: { original } }) => (
                    <button
                        className="btn btn-success"
                        onClick={() => openDetailsModal(original._id)}
                    >
                        View Travel Sub Category
                    </button>
                ),
                disableFilters: true,
                disableSortBy: true,
            },
        ];

        if (canEdit || canDelete) {
            baseColumns.push({
                Header: "Actions",
                id: "actionsColumn",
                Cell: ({ row: { original } }) => (
                    <div className="d-flex gap-2">
                        {canEdit && (
                            <>
                                <Link
                                    to={`/edit-subcategory/${original._id}`}
                                    className="text-primary"
                                    id={`editTooltip-${original._id}`}
                                >
                                    <i className="bx bx-pencil font-size-18"></i>
                                </Link>
                                <UncontrolledTooltip
                                    placement="top"
                                    target={`editTooltip-${original._id}`}
                                >
                                    Edit
                                </UncontrolledTooltip>
                            </>
                        )}
                        {canDelete && (
                            <>
                                <Link
                                    to="#"
                                    className="text-danger"
                                    onClick={() => handleDelete(original)}
                                    id={`deleteTooltip-${original._id}`}
                                >
                                    <i className="dripicons-trash"></i>
                                </Link>
                                <UncontrolledTooltip
                                    placement="top"
                                    target={`deleteTooltip-${original._id}`}
                                >
                                    Delete
                                </UncontrolledTooltip>
                            </>
                        )}
                    </div>
                ),
                disableFilters: true,
                disableSortBy: true,
            });
        }
        return baseColumns;
    }, [canEdit, canDelete]);

    const renderContent = () => {
        if (permissionLoading || !isPermissionsReady) {
            return (
                <div className="text-center p-5">
                    <i className="mdi mdi-spin mdi-loading display-4 text-primary"></i>
                    <p className="mt-2">Loading permissions...</p>
                </div>
            );
        }

        if (canView) {
            return (
                <>
                    <Card className="mb-3">
                        <CardBody>
                            <Row>
                                <Col md={4}>
                                    <Label>City</Label>
                                    <Select
                                        id="city-select"
                                        isClearable
                                        isSearchable
                                        placeholder="Search and select a city..."
                                        options={cities.map(city => ({
                                            value: city.cityCode,
                                            label: `${city.cityName || city.city} (${city.cityCode})`
                                        }))}
                                        value={filterCityCode ? cities.find(c => c.cityCode === filterCityCode) ? {
                                            value: filterCityCode,
                                            label: `${cities.find(c => c.cityCode === filterCityCode)?.cityName || cities.find(c => c.cityCode === filterCityCode)?.city} (${filterCityCode})`
                                        } : null : null}
                                        onChange={handleCityChange}
                                        isDisabled={cities.length === 0}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Row>
                        <Col xs="12">
                            <Card>
                                <CardBody>
                                    <div className="text-sm-end mb-2 btn-rounded">
                                        {canAdd && (
                                            <Link to="/add-new-travel-sub-category" className="text-primary">
                                                <button className="btn btn-success">Add New Sub Category</button>
                                            </Link>
                                        )}
                                    </div>
                                    {notification.isVisible && (
                                        <div
                                            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
                                                } ${notification.isVisible ? "opacity-100" : "opacity-0"}`}
                                            role="alert"
                                        >
                                            {notification.message}
                                        </div>
                                    )}
                                    {loading ? (
                                        <div className="text-center p-3">
                                            <i className="mdi mdi-spin mdi-loading display-4 text-primary"></i>
                                            <p className="mt-2">Loading Travel Sub Categories...</p>
                                        </div>
                                    ) : error ? (
                                        <Alert color="danger" className="text-center">
                                            <p>Error fetching data: {error.message}</p>
                                            <p>Please reload the page to fetch data again.</p>
                                            {showReloadButton && (
                                                <Button color="primary" className="mt-2" onClick={handleReloadData}>
                                                    Reload Data
                                                </Button>
                                            )}
                                        </Alert>
                                    ) : Array.isArray(subcategories) && subcategories.length > 0 ? (
                                        <TableContainer
                                            columns={columns}
                                            data={subcategories}
                                            isGlobalFilter={true}
                                            isAddButton={false}
                                            customPageSize={10}
                                            className="custom-header-css"
                                        />
                                    ) : showNotFound ? (
                                        <div className="text-center p-3">
                                            <p className="mt-2">No Travel Sub Categories found.</p>
                                            {showReloadButton && (
                                                <Button color="primary" className="mt-2" onClick={handleReloadData}>
                                                    Reload Data
                                                </Button>
                                            )}
                                        </div>
                                    ) : null}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </>
            );
        }

        return (
            <Alert color="danger" className="text-center">
                <p>You do not have permission to view this page.</p>
                <Button color="primary" className="mt-2" onClick={() => navigate("/dashboard")}>
                    Go Back to Home
                </Button>
            </Alert>
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs
                        title="Product Management"
                        breadcrumbItem="Travel Sub Categories"
                    />
                    {renderContent()}
                </Container>
            </div>
            <Modal isOpen={isDeleteDialogOpen} toggle={closeDeleteDialog}>
                <ModalHeader toggle={closeDeleteDialog}>Confirm Deletion</ModalHeader>
                <ModalBody>
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to permanently delete this{" "}
                        <span className="font-bold text-red-600">
                            {categoryToDelete?.name || ""}
                        </span>{" "}
                        Travel Sub Category? Once deleted, cannot be recovered.
                    </p>
                </ModalBody>
                <div className="modal-footer">
                    <Button
                        type="button"
                        className="btn btn-soft-secondary waves-effect waves-light"
                        onClick={closeDeleteDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteCategory}
                        color="danger"
                        className="btn btn-danger waves-effect waves-light"
                    >
                        Delete
                    </Button>
                </div>
            </Modal>
            <TravelSubCategoryDetailsModal
                isOpen={isDetailsModalOpen}
                toggle={closeDetailsModal}
                subCategoryId={selectedSubCategory}
                canEdit={canEdit}
            />
        </React.Fragment>
    );
};

SubCategory.propTypes = {
    subcategories: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.string,
    getSubcategories: PropTypes.func,
    addNewSubcategory: PropTypes.func,
    updateSubcategory: PropTypes.func,
};

export default SubCategory;