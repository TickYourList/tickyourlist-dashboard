import React, { useEffect, useMemo, useState } from "react"
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getTourGroupVariants, getTourGroupVariantDetail } from "../../store/TourGroupVariant/action"
import Breadcrumbs from "components/Common/Breadcrumb"
import TableContainerWithServerSidePagination from "components/Common/TableContainerWithServerSidePagination"
import DeleteModal from "components/Common/DeleteModal"
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import ViewDetail from "./ViewDetail"

import "./index.scss"

const TourGroupVariantsTable = () => {
  document.title = "Tour Group Variants | Scrollit"

  const dispatch = useDispatch()
  const { tourGroupVariants, totalRecords, loading } = useSelector(
    state => state.TourGroupVariant
  )
  // console.log(totalRecords);
  // console.log("Tour Group Variants:", tourGroupVariants);

  const { can } = usePermissions()

  // Modal state for view details
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [activeTab, setActiveTab] = useState("1")

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)

  const [page, setPage] = useState(
    () => Number(localStorage.getItem("variantPage")) || 1
  )
  const [limit, setLimit] = useState(
    () => Number(localStorage.getItem("variantLimit")) || 10
  )

  const total = totalRecords || 0


  useEffect(() => {
    dispatch(getTourGroupVariants(page, limit))
  }, [dispatch, page, limit])

  useEffect(() => {
    localStorage.setItem("variantPage", page)
  }, [page])

  useEffect(() => {
    localStorage.setItem("variantLimit", limit)
  }, [limit])

  const processedVariants = Array.isArray(tourGroupVariants)
    ? tourGroupVariants.map(row => ({
        ...row,
        name: row.name || "-",
        tourName: row.name || "-",
        city: row.city || "-",
        cityCode: row.cityCode || "-",
        status: row.status ? "Active" : "Inactive",
      }))
    : []

  // Permission checks using standardized usePermissions hook
  const canAddTourGroupVariant = can(ACTIONS.CAN_ADD, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canEditTourGroupVariant = can(ACTIONS.CAN_EDIT, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canViewTourGroupVariant = can(ACTIONS.CAN_VIEW, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canDeleteTourGroupVariant = can(ACTIONS.CAN_DELETE, MODULES.TOUR_GROUP_VARIANT_PERMS)

  const navigate = useNavigate()
  
  // Define all handler functions before useMemo
  const handleAddTourGroupVariantClicks = () => {
    navigate("add-tour-group-variants")
  }

  const handleEditButtonClick = variantId => {
    console.log("Editing variant with ID:", variantId)
    navigate(`/tour-group-variants/edit/${variantId}`)
  }

  const handleViewButtonClick = variantId => {
    console.log("View button clicked for variant ID:", variantId)
    setSelectedVariantId(variantId)
    setActiveTab("1")
    dispatch(getTourGroupVariantDetail(variantId))
    setIsViewModalOpen(true)
  }

  const toggleViewModal = () => {
    console.log("Toggle modal called, current state:", isViewModalOpen)
    setIsViewModalOpen(!isViewModalOpen)
    if (isViewModalOpen) {
      setSelectedVariantId(null)
    }
  }

  // Delete handlers
  const onClickDelete = (variant) => {
    setVariantToDelete(variant)
    setDeleteModal(true)
  }

  const handleDeleteVariant = () => {
    if (variantToDelete && variantToDelete._id) {
      // TODO: Implement actual delete API call here
      // dispatch(deleteTourGroupVariant(variantToDelete._id))
      
      // For now, show a message that this needs to be implemented
      showToastError("Delete functionality is not yet implemented for Tour Group Variants. Please contact your administrator.", "Not Implemented")
      
      setDeleteModal(false)
      setVariantToDelete(null)
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: "Variant Name",
        accessor: "name",
      },
      {
        Header: "Tour Name",
        accessor: "name",
        Cell: ({ row }) => (
          <a href="#" style={{ color: "blue", textDecoration: "underline" }}>
            {row.original.name}
          </a>
        ),
        id: "tourName",
      },
      {
        Header: "City",
        accessor: row => {
          const city = row.city || "-"
          return city
        },
        id: "cityName",
      },
      {
        Header: "City Code",
        accessor: row => {
          const cityCode = row.cityCode || "-"
          return cityCode
        },
        id: "cityCode",
      },
      {
        Header: "Price",
        accessor: row =>
          row?.listingPrice?.prices?.[0]?.finalPrice
            ? `₹${row.listingPrice.prices[0].finalPrice}`
            : "-",
        id: "price",
      },
      {
        Header: "Status",
        Cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.notAvailable ? "bg-danger" : "bg-success"
            } text-white`}
          >
            {row.original.notAvailable ? "Inactive" : "Active"}
          </span>
        ),
        id: "status",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center gap-2">
            {canViewTourGroupVariant && (
              <Button
                color="primary"
                size="sm"
                style={{ 
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewButtonClick(row.original._id);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="View Details"
              >
                👁️ View
              </Button>
            )}
            
            {canEditTourGroupVariant && (
              <Button
                color="success"
                size="sm"
                style={{ 
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditButtonClick(row.original._id);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="Edit"
              >
                ✏️ Edit
              </Button>
            )}

            {canViewTourGroupVariant && (
              <i className="bx bx-money cursor-pointer" title="Pricing" style={{ color: "#f1b44c" }} />
            )}
            {canViewTourGroupVariant && (
              <i className="bx bx-book-content cursor-pointer" title="Bookings" style={{ color: "#50a5f1" }} />
            )}
            {canEditTourGroupVariant && (
              <i className="bx bx-copy cursor-pointer" title="Duplicate" style={{ color: "#5b73e8" }} />
            )}
            {canDeleteTourGroupVariant && (
              <i
                className="bx bx-trash text-danger cursor-pointer"
                title="Delete"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickDelete(row.original);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
          </div>
        ),
        id: "actions",
      },
    ],
    [navigate, canEditTourGroupVariant, canViewTourGroupVariant, canDeleteTourGroupVariant, handleViewButtonClick, handleEditButtonClick, onClickDelete]
  )

  if (!canViewTourGroupVariant) {
    return (
      <div className="page-content">
        <Container
          fluid
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div
            className="alert alert-danger text-center w-100"
            style={{ maxWidth: "600px" }}
          >
            <h5 className="mb-3">Permission Required!</h5>
            <p className="mb-2">
              You do not have permission to access this page. If you believe
              this is a mistake, please contact your administrator.
            </p>
            <p className="mb-0">
              Click{" "}
              <a
                href="/dashboard"
                className="text-primary text-decoration-underline"
              >
                here
              </a>{" "}
              to return to the homepage or navigate to a page you have access
              to.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tour Groups" breadcrumbItem="Group Variants" />
        
        <div className="variant-list-page">
          <TableContainerWithServerSidePagination
            columns={columns}
            data={processedVariants}
            totalCount={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={newPage => setPage(newPage)}
            setPageSize={newLimit => {
              setLimit(newLimit)
              setPage(1)
            }}
            isGlobalFilter={true}
            isAddTourGroupVariantOptions={canAddTourGroupVariant}
            handleAddTourGroupVariantClicks={handleAddTourGroupVariantClicks}
            className="custom-header-css"
          />
        </div>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteVariant}
        onCloseClick={() => setDeleteModal(false)}
      />
      
      {/* View Detail Modal */}
      <ViewDetail 
        isOpen={isViewModalOpen}
        toggle={toggleViewModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

export default TourGroupVariantsTable
