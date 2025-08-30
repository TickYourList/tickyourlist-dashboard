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

import TableContainer from "../../components/Common/TableContainer";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

import {
  getTravelCategoriesRequest,
  deleteTravelCategoryRequest,
} from "../../store/travelCategories/actions";

function TravelCategoryDetail() {


  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector((state) => state.travelCategory.data || []);
  const loading = useSelector((state) => state.travelCategory.loading);
  const error = useSelector((state) => state.travelCategory.error);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getTravelCategoriesRequest());
  }, [dispatch]);

const handleOpenViewModal = (category) => {
  setSelectedCategory(category);
  setIsViewModalOpen(true);
};


  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory) return;
    dispatch(deleteTravelCategoryRequest(selectedCategory._id));
    toastr.success(`${selectedCategory.name} Travel Category deleted successfully.`);
    setDeleteModalOpen(false);
  };

  const columns = useMemo(() => [
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
    },
    {
  Header: "View Details",
  Cell: ({ row }) => (
    <button
      className="btn btn-sm btn-primary rounded-pill px-3"
      onClick={() => handleOpenViewModal(row.original)}
    >
      View Details
    </button>
  ),
},
    {
      Header: "Action",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center justify-content-center gap-5">
          <button
            className="btn p-0 border-0 bg-transparent"
            title="Edit"
            onClick={() => navigate(`/edit-travel-category/${row.original._id}`)}
          >
            <i className="mdi mdi-pencil font-size-18 text-success"></i>
          </button>
          <button
            className="btn p-0 border-0 bg-transparent"
            title="Delete"
            onClick={() => handleDeleteClick(row.original)}
          >
            <i className="mdi mdi-trash-can font-size-18 text-danger"></i>
          </button>
        </div>
      ),
    },
  ], [navigate]);

  document.title = "Travel Categories | TickYourList";
const handleCloseModal = () => {
  setIsViewModalOpen(false);
 
};
const handleEditCategory = (categoryId) => {
  navigate(`/edit-travel-category/${categoryId}`);
};


  return (
        <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Travel" breadcrumbItem="Travel Categories" />

        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-0">
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
                onClick={() => navigate("/travel-category/add")}
              >
                <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
                Add New Travel Category
              </button>
            </div>

            <TableContainer
            
  columns={columns}
  data={data}
  loading={loading}
  isGlobalFilter={true}
  isAddOptions={false}
  customPageSize={10}
  className="custom-header-css"
/>

          </div>
        </div>
      </div>
            <ViewCategoryModal
  isOpen={isViewModalOpen}
  toggle={handleCloseModal}
  category={selectedCategory}
  onEdit={handleEditCategory}
/>

      {/* 🗑️ Delete Confirmation Modal */}
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
    </div>
  );
}

export default TravelCategoryDetail;