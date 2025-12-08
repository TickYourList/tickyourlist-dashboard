import ViewCategoryModal from "./ViewCategoryModal";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import NoPermission from "./NoPermissions";

import TableContainer from "../../components/Common/TableContainer";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import {
  getTravelCategoriesRequest,
  deleteTravelCategoryRequest,
} from "../../store/travelCategories/actions";
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions";
import { getCitiesList } from "helpers/location_management_helper";
import Select from "react-select";

function TravelCategoryDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Existing selectors
  const data = useSelector((state) => state.travelCategory.data || []);
  const loading = useSelector((state) => state.travelCategory.loading);
  const error = useSelector((state) => state.travelCategory.error);

  // Use standardized permissions hook
  const { can, isPermissionsReady, loading: permissionsLoading } = usePermissions();

  // Permission checks using standardized system
  const permissions = useMemo(() => ({
    canAdd: can(ACTIONS.CAN_ADD, MODULES.CATEGORY_PERMS),
    canDelete: can(ACTIONS.CAN_DELETE, MODULES.CATEGORY_PERMS),
    canEdit: can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS),
    canView: can(ACTIONS.CAN_VIEW, MODULES.CATEGORY_PERMS)
  }), [can]);



  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch cities list on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await getCitiesList();
        const cityOptions = response.data.travelCityList.map(city => ({
          value: city.cityCode,
          label: `${city.name} (${city.cityCode})`,
        }));
        setCities(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    // Fetch categories only when permissions are ready
    if (isPermissionsReady) {
      dispatch(getTravelCategoriesRequest());
    }
  }, [dispatch, isPermissionsReady]);

  // Filter data based on selected city
  useEffect(() => {
    if (selectedCity) {
      const filtered = data.filter(
        (category) => category.cityCode === selectedCity.value
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [selectedCity, data]);

  const handleOpenViewModal = (category) => {
    // Permission check for view details
    if (!permissions.canView) {
      toastr.error("You don't have permission to view category details.");
      return;
    }
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (category) => {
    // Permission check - disable function if false
    if (!permissions.canDelete) {
      toastr.error("You don't have permission to delete this category.");
      return;
    }
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory || !permissions.canDelete) return;
    dispatch(deleteTravelCategoryRequest(selectedCategory._id));
    toastr.success(`${selectedCategory.name} Travel Category deleted successfully.`);
    setDeleteModalOpen(false);
  };

  const handleEditClick = (categoryId) => {
    // Permission check - disable function if false
    if (!permissions.canEdit) {
      toastr.error("You don't have permission to edit this category.");
      return;
    }
    navigate(`/edit-travel-category/${categoryId}`);
  };

  const handleAddClick = () => {
    // Permission check - disable function if false
    if (!permissions.canAdd) {
      toastr.error("You don't have permission to add new categories.");
      return;
    }
    navigate("/travel-category/add");
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: "Name",
        accessor: "name",
        Filter: ({ column }) => (
          <input
            className="form-control form-control-sm"
            onChange={(e) => column.setFilter(e.target.value)}
            placeholder="Search name..."
          />
        ),
      },
      {
        Header: "Display Name",
        accessor: "displayName",
        Filter: ({ column }) => (
          <input
            className="form-control form-control-sm"
            onChange={(e) => column.setFilter(e.target.value)}
            placeholder="Search display name..."
          />
        ),
      },
      {
        Header: "Tours",
        accessor: (row) => row?.urlSlugs ? Object.keys(row.urlSlugs).length : 0,
        id: "tours",
        Cell: ({ value }) => <span>{value || 0}</span>,
        Filter: ({ column }) => (
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={(e) => column.setFilter(e.target.value)}
            placeholder="Tours..."
          />
        ),
      },
      {
        Header: "Sort",
        accessor: "sortOrder",
        Filter: ({ column }) => (
          <input
            type="number"
            className="form-control form-control-sm"
            onChange={(e) => column.setFilter(e.target.value)}
            placeholder="Search sort..."
          />
        ),
      }
    ];

    // View Details button - show only if API says canView is true
    if (permissions.canView) {
      baseColumns.push({
        Header: "View Details",
        Cell: ({ row }) => (
          <button
            className="btn btn-sm btn-primary rounded-pill px-3"
            onClick={() => handleOpenViewModal(row.original)}
          >
            View Details
          </button>
        ),
      });
    }

    // Action column - show only if API says user has edit or delete permissions
    if (permissions.canEdit || permissions.canDelete) {
      baseColumns.push({
        Header: "Action",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center justify-content-center gap-5">
            {/* Edit button - show only if API says canEdit is true */}
            {permissions.canEdit && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Edit"
                onClick={() => handleEditClick(row.original._id)}
              >
                <i className="mdi mdi-pencil font-size-18 text-success"></i>
              </button>
            )}
            {/* Delete button - show only if API says canDelete is true */}
            {permissions.canDelete && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Delete"
                onClick={() => handleDeleteClick(row.original)}
              >
                <i className="mdi mdi-trash-can font-size-18 text-danger"></i>
              </button>
            )}
          </div>
        ),
      });
    }

    return baseColumns;
  }, [permissions, navigate]);

  document.title = "Travel Categories | TickYourList";

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
  };

  const handleEditCategory = (categoryId) => {
    if (!permissions.canEdit) {
      toastr.error("You don't have permission to edit this category.");
      return;
    }
    navigate(`/edit-travel-category/${categoryId}`);
  };

  // Show loading while permissions are being fetched
  if (permissionsLoading || !isPermissionsReady) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Loading page data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check canView permission - if false, return No Permission message
  if (!permissions.canView) {
    return <NoPermission />;
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Travel" breadcrumbItem="Travel Categories" />

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div style={{ width: '300px' }}>
                <label className="form-label">Filter by City Code</label>
                <Select
                  value={selectedCity}
                  onChange={setSelectedCity}
                  options={cities}
                  isClearable
                  isSearchable
                  isLoading={loadingCities}
                  placeholder="Select city to filter..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              {/* Add button - show only if API says canAdd is true */}
              {permissions.canAdd && (
                <button
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#28c76f',
                    borderColor: '#28c76f',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 2px 6px rgba(40, 199, 111, 0.3)',
                    border: 'none'
                  }}
                  onClick={handleAddClick}
                >
                  <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
                  Add New Travel Category
                </button>
              )}
            </div>

            <TableContainer
              columns={columns}
              data={filteredData.length > 0 || selectedCity ? filteredData : data}
              loading={loading}
              isGlobalFilter={true}
              isAddOptions={false}
              customPageSize={10}
              className="custom-header-css"
            />
          </div>
        </div>
      </div>

      {/* ViewCategoryModal - show only if API says canView is true */}
      {permissions.canView && (
        <ViewCategoryModal
          isOpen={isViewModalOpen}
          toggle={handleCloseModal}
          category={selectedCategory}
          onEdit={permissions.canEdit ? handleEditCategory : null}
        />
      )}

      {/* Delete Confirmation Modal - show only if API says canDelete is true */}
      {permissions.canDelete && (
        <Modal
          isOpen={deleteModalOpen}
          toggle={() => setDeleteModalOpen(false)}
          centered
          contentClassName="border-0 shadow-lg rounded"
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <ModalHeader
            toggle={() => setDeleteModalOpen(false)}
            className="border-0 pb-0"
          ></ModalHeader>

          <ModalBody className="text-center px-4 pt-0">
            <div className="mb-3">
              <i
                className="mdi mdi-trash-can-outline text-danger"
                style={{ fontSize: "40px" }}
              ></i>
            </div>
            <h5 className="text-muted fw-semibold">
              Are you sure you want to permanently delete the{" "}
              <strong>{selectedCategory?.name}</strong> Travel Category?
            </h5>
            <p className="text-muted mt-2">
              Once deleted, it cannot be recovered.
            </p>
          </ModalBody>

          <ModalFooter
            className="justify-content-center border-0 pt-0 pb-4"
            style={{ gap: "3rem" }}
          >
            <Button color="danger" onClick={handleConfirmDelete} className="px-4">
              Delete Now
            </Button>
            <Button
              color="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4"
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default TravelCategoryDetail;