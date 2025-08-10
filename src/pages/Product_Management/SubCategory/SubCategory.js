import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik } from "formik";
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
  Form,
  Alert,
  Button,
  CardTitle,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { getSubcategories, addTravelSubcategory, deleteSubcategory, resetCategoryStatus } from "store/actions";

const SubCategory = (props) => {
  document.title = "Travel Sub Categories | Scrollit";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subcategories, loading, error, deleteSuccess } = useSelector(
    (state) => state.travelSubCategoryReducer
  );

  // State for Add/Edit Modal
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filterCityCode, setFilterCityCode] = useState("");

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // State for Notification Message (Toast)
  const [notification, setNotification] = useState({
    message: "",
    type: "", // 'success' or 'error'
    isVisible: false,
  });

  // Function to display a notification
  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // Function to handle the initial data load on component mount
  useEffect(() => {
    console.log("GETSubcategories called from catergorie")
    dispatch(getSubcategories());
  }, [dispatch]);

  // Function to apply the city code filter and fetch data
  const handleApplyCityCodeFilter = () => {
    console.log("GETSubcategories called from catergorie")
    dispatch(getSubcategories());
  };

  // Function to clear the filter and reload all data
  const handleClearFilter = () => {
    setFilterCityCode("");
    console.log("GETSubcategories called from catergorie")
    dispatch(getSubcategories());
  };

  const handleReloadData = () => {
    console.log("GETSubcategories called from catergorie")
    dispatch(getSubcategories());
  };

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
        // ... (your update logic)
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
        // After successful deletion, re-fetch data using the current filter
        console.log("GETSubcategories called from catergorie")
        dispatch(getSubcategories());
        showNotification(
          `${categoryToDelete.name} Travel Sub Category deleted successfully.`,
          "success"
        );
        closeDeleteDialog();
        dispatch(resetCategoryStatus());
      } else {
        // If deletion failed, re-fetch to update the state anyway
        console.log("GETSubcategories called from catergorie")
        dispatch(getSubcategories());
        closeDeleteDialog();
        showNotification(
          `${categoryToDelete.name} Travel Sub Category failed to delete.`,
          "error"
        );
      }
    } catch (error) {
      console.error("Deletion error:", error);
      showNotification(
        `An unexpected error occurred while deleting ${categoryToDelete.name}.`,
        "error"
      );
    }
  };

  const handleAddCategoryClick = () => {
    setCurrentCategory(null);
    setIsEdit(false);
    toggle();
  };

  const columns = useMemo(
    () => [
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
        Header: "View Details",
        accessor: "_id",
        Cell: (cellProps) => {
          return (
            <Link to={`/sub-category-details/${cellProps.value}`} className="text-primary">
              <button className="btn btn-success">View Details</button>
            </Link>
          );
        },
        disableFilters: true,
        disableSortBy: true,
      },
      {
        Header: "Actions",
        id: "actionsColumn",
        Cell: (cellProps) => {
          return (
            <div className="d-flex gap-2">
              <Link
                to={`/edit-subcategory/${cellProps.row.original._id}`}
                className="text-primary"
                id={`editTooltip-${cellProps.row.original._id}`}
              >
                <i className="bx bx-pencil font-size-18"></i>
              </Link>
              <UncontrolledTooltip
                placement="top"
                target={`editTooltip-${cellProps.row.original._id}`}
              >
                Edit
              </UncontrolledTooltip>
              <Link
                to="#"
                className="text-danger"
                onClick={() => handleDelete(cellProps.row.original)}
                id={`deleteTooltip-${cellProps.row.original._id}`}
              >
                <i className="dripicons-trash "></i>
              </Link>
              <UncontrolledTooltip
                placement="top"
                target={`deleteTooltip-${cellProps.row.original._id}`}
              >
                Delete
              </UncontrolledTooltip>
            </div>
          );
        },
        disableFilters: true,
        disableSortBy: true,
      },
    ],
    []
  );

  useEffect(() => {
    dispatch(resetCategoryStatus());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Product Management"
            breadcrumbItem="Travel Sub Categories"
          />

          {/* City Code Filter Input */}
          <Row className="mb-3">
            <Col md={4}>
              <Label htmlFor="cityCodeFilterInput" className="form-label">
                Filter by City Code (e.g., PNQ, DEL)
              </Label>
              <Input
                id="cityCodeFilterInput"
                type="text"
                value={filterCityCode}
                onChange={(e) => setFilterCityCode(e.target.value.toUpperCase())}
                placeholder="Enter City Code"
              />
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <button
                className="btn btn-primary"
                onClick={handleApplyCityCodeFilter}
              >
                Apply Filter
              </button>
              {filterCityCode && (
                <button
                  className="btn btn-secondary ms-2"
                  onClick={handleClearFilter}
                >
                  Clear Filter
                </button>
              )}
            </Col>
          </Row>

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="text-sm-end mb-2 btn-rounded">
                    <Link
                      to={"/add-new-travel-sub-category"}
                      className="text-primary"
                    >
                      <button className="btn btn-success">
                        Add New Sub Category
                      </button>
                    </Link>
                  </div>

                  {notification.isVisible && (
                    <div
                      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 ${
                        notification.type === "success"
                          ? "bg-green-500"
                          : "bg-red-500"
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
                      <Button color="primary" className="mt-2" onClick={handleReloadData}>
                        Reload Data
                      </Button>
                    </Alert>
                  ) : Array.isArray(subcategories) && subcategories.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={subcategories}
                      isGlobalFilter={true}
                      isAddButton={true}
                      handleAddNewClick={handleAddCategoryClick}
                      customPageSize={10}
                      className="custom-header-css"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <p className="mt-2">No Travel Sub Categories found.</p>
                      <Button color="primary" className="mt-2" onClick={handleReloadData}>
                        Reload Data
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={isDeleteDialogOpen} toggle={closeDeleteDialog}>
        <ModalHeader toggle={closeDeleteDialog}>
          Confirm Deletion
        </ModalHeader>
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
