import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"

import Breadcrumbs from "components/Common/Breadcrumb"

import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap"
import TableContainerWithServerSidePagination from "components/Common/TableContainerWithServerSidePagination"
import NewTourModel from "./NewTourModel"

import {
  deleteTourGroupRequest,
  fetchTourGroupByIdRequest,
  fetchTourGroupsRequest,
  removeTourGroupWithId,
} from "store/tickyourlist/travelTourGroup/action"
import DeleteModal from "components/Common/DeleteModal"

import ViewTourGroup from "./ViewTourGroup"
import { showToastSuccess } from "helpers/toastBuilder"
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions"
function TourGroupTable() {
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [tourGroupByIdName, setTourGroupByIdName] = useState("")
  const [editId, setEditId] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedTourGroupToBeDeleted, setSelectedTourGroupToBeDeleted] =
    useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { can, getTourGroupPermissions } = usePermissions()

  /* destructuring the tour group state */
  const { tourGroup, currPage, totalCount, error } = useSelector(
    state => state.tourGroup
  )

  const toggle = () => {
    setModal(!modal)
    setIsEdit(false)
    setIsViewing(false)

    dispatch(removeTourGroupWithId())
  }
  const role = JSON.parse(localStorage.getItem("authUser"))?.data?.user
    ?.roles[0]?.code
  //calling the api
  useEffect(() => {
    /* console.log("called dispatch fetch tour group") */

    dispatch(
      fetchTourGroupsRequest({
        page: currPage,
        limit: pageSize,
      })
    )
  }, [currPage, pageSize])

  const handlePageChange = newPage => {
    dispatch(
      fetchTourGroupsRequest({
        page: newPage,
        limit: pageSize,
      })
    )
  }
  const handleEdit = id => {
    dispatch(fetchTourGroupByIdRequest(id))
    setEditId(id)
    setIsEdit(true)
    setIsViewing(false)
    setModal(true)
  }

  const handleDelete = tourGroup => {
    /* console.log(tourGroup._id, tourGroup.city.name) */
    setDeleteModal(true)
    setSelectedTourGroupToBeDeleted(tourGroup)
    setIsDeleting(true)
  }

  const onConfirmDelete = () => {
    if (selectedTourGroupToBeDeleted) {
      dispatch(
        deleteTourGroupRequest(
          selectedTourGroupToBeDeleted._id,
          selectedTourGroupToBeDeleted.name
        )
      )
      setDeleteModal(false)
      setSelectedTourGroupToBeDeleted(null)
      setIsDeleting(false)
    }
  }

  const handleOnCloseClick = () => {
    setIsDeleting(false)
    setDeleteModal(false)
  }
  const handleViewDetails = id => {
    dispatch(fetchTourGroupByIdRequest(id))
    setEditId(id)
    setIsViewing(true)
    setIsEdit(false)
    setModal(true)
  }

  const handleViewCalender = id => {
    showToastSuccess("Calender Triggered")
  }

  // Permission checks using standardized usePermissions hook
  const canAddTourGroup = can(ACTIONS.CAN_ADD, MODULES.TOUR_GROUP_PERMS)
  const canViewTourGroup = can(ACTIONS.CAN_VIEW, MODULES.TOUR_GROUP_PERMS)
  const canEditTourGroup = can(ACTIONS.CAN_EDIT, MODULES.TOUR_GROUP_PERMS)
  const canDeleteTourGroup = can(ACTIONS.CAN_DELETE, MODULES.TOUR_GROUP_PERMS)
  const columns = useMemo(
    () => [
      {
        Header: "Tour Name",
        accessor: "name",

        Cell: ({ row }) => (
          <Link
            to={`${row.original.urlSlugs?.EN || "#"}`}
            className="text-black fw-bold"
          >
            {row.original.name}
          </Link>
        ),

        filterable: true,
      },
      {
        Header: "City",
        accessor: "cityName",
        Cell: ({ row }) => <span>{row.original.cityName || "—"}</span>,
        filterable: true,
      },
      {
        Header: "Price",
        accessor: "listingPrice.finalPrice",
        Cell: ({ row }) => {
          const value = row.original.listingPrice?.finalPrice
          const currency =
            row.original.city?.country?.currency?.localSymbol || "$"

          return <span>{value ? `${currency} ${value}` : "N/A"}</span>
        },
        filterable: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`badge rounded-pill ${
              value === true ? "bg-success" : "bg-danger"
            }`}
          >
            {value === true ? "Active" : "Inactive"}
          </span>
        ),
        filterable: true,
      },
      {
        Header: "Rating",
        accessor: "review.average",
        Cell: ({ value }) => (
          <span className="badge bg-success">
            <i className="mdi mdi-star me-1"></i>
            {value}
          </span>
        ),
        disableFilters: true,
      },
      {
        Header: "Created Date",
        accessor: "createdAt",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "—",
        disableFilters: true,
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center justify-content-center gap-4">
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Edit"
                onClick={() => {
                  handleEdit(row.original._id)
                }}
              >
                <i className="fas fa-edit font-size-18 text-success"></i>
              </button>
            )}
            {canViewTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="view"
                onClick={() => {
                  handleViewDetails(row.original._id)
                }}
              >
                <i className="fas fa-eye font-size-18 text-primary"></i>
              </button>
            )}
            {role === "ADMIN" && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="variant"
              >
                <Link to={`variants/${row.original._id}`} target="_blank">
                  {" "}
                  <i className="fas fa-layer-group font-size-18 text-info"></i>
                </Link>
              </button>
            )}
            <button
              className="btn p-0 border-0 bg-transparent"
              title="calender"
              onClick={() => handleViewCalender(row.original._id)}
            >
              <i className="fas fa-calendar-alt font-size-18 text-warning"></i>
            </button>
            {canDeleteTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Delete"
                onClick={() => handleDelete(row.original)}
              >
                <i className="fas fa-trash font-size-18 text-danger"></i>
              </button>
            )}
          </div>
        ),
      },
     ],
     [
       navigate,
       canEditTourGroup,
       canDeleteTourGroup,
       canViewTourGroup,
       role,
     ]
  )

  document.title = "Tour Groups | TickYourList"
  if (!canViewTourGroup) {
    return (
      <div
        className="page-content  d-flex justify-content-center align-items-center "
        style={{ minHeight: "100vh" }}
      >
        <div
          style={{ minWidth: "80%" }}
          className="m-2 d-flex flex-column justify-content-center align-items-center bg-danger bg-soft text-white p-3"
        >
          <p className="fw-bold fs-4 mb-3 text-danger text-gradient">
            Permission Required
          </p>
          <p
            className="text-center mb-3 text-danger text-gradient "
            style={{ maxWidth: "60%" }}
          >
            You do not have the permission to access this page. If you think
            this is a mistake, contact the administrator.
          </p>
          <p className="text-center text-danger text-gradient">
            Click{" "}
            <Link
              to="/"
              className="text-primary text-soft text-decoration-underline fw-bold "
            >
              here
            </Link>{" "}
            to return to the home page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {error && <p>Something went wrong Please try again</p>}
      {isDeleting && (
        <DeleteModal
          show={deleteModal}
          onDeleteClick={onConfirmDelete}
          onCloseClick={handleOnCloseClick}
        >
          {selectedTourGroupToBeDeleted.name}
        </DeleteModal>
      )}
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="TickYourList" breadcrumbItem="TourGroup" />

          <Row>
            <Col>
              <Card>
                <CardBody>
                  {/* This is the server side pagination component */}
                  <TableContainerWithServerSidePagination
                    columns={columns}
                    data={tourGroup}
                    totalCount={totalCount}
                    currentPage={currPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    setPageSize={setPageSize}
                    toggleViewModal={toggle}
                    isAddNewTourGroup={canAddTourGroup}
                    isGlobalFilter={true}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                  <Modal isOpen={modal} toggle={toggle} size="xl">
                    <ModalHeader toggle={toggle} tag="h4">
                      {isViewing
                        ? `${tourGroupByIdName}`
                        : `${
                            isEdit ? "Update Tour Group" : "Add New Tour Group"
                          }`}
                    </ModalHeader>
                    <ModalBody>
                      {isViewing ? (
                        <ViewTourGroup
                          setIsEdit={setIsEdit}
                          setIsViewing={setIsViewing}
                          isViewing={isViewing}
                          editId={editId}
                          setTourGroupByIdName={setTourGroupByIdName}
                        />
                      ) : (
                        <NewTourModel
                          setModal={setModal}
                          editId={editId}
                          isEdit={isEdit}
                        />
                      )}
                    </ModalBody>
                  </Modal>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default TourGroupTable
