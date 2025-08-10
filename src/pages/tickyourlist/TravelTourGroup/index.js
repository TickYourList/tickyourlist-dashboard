import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

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
import { showToastSuccess } from "helpers/toastBuilder"

import {
  deleteTourGroupRequest,
  fetchTourGroupByIdRequest,
  fetchTourGroupsRequest,
  removeTourGroupWithId,
} from "../../../store/tickyourlist/travelTourGroup/action"
import DeleteModal from "components/Common/DeleteModal"
import TableContainer from "components/Common/TableContainer"

function TourGroup() {
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedTourGroupToBeDeleted, setSelectedTourGroupToBeDeleted] =
    useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  /* destructuring the tour group state */
  const { tourGroup, currPage, totalCount, error } = useSelector(
    state => state.tourGroupReducer
  )
  const toggle = () => {
    setModal(!modal)
    setIsEdit(false)
    setIsViewing(false)

    dispatch(removeTourGroupWithId())
  }

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
    /* console.log(id) */
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
          selectedTourGroupToBeDeleted.city.name
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
    setIsViewing(true)
    setIsEdit(false)
    setModal(true)
  }
  const handleViewVariant = id => {
    console.log("visiting variant of id ", id)
  }

  const handleViewCalender = id => {
    console.log("viewing calender of id ", id)
  }

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
        accessor: "city.name",
        Cell: ({ value }) => <span>{value || "—"}</span>,
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
        accessor: "city.country.status",
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
            <button
              className="btn p-0 border-0 bg-transparent"
              title="Edit"
              onClick={() => {
                handleEdit(row.original._id)
              }}
            >
              <i className="fas fa-edit font-size-18 text-success"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title="view"
              onClick={() => handleViewDetails(row.original._id)}
            >
              <i className="fas fa-eye font-size-18 text-primary"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title="variant"
              onClick={() => handleViewVariant(row.original._id)}
            >
              <i className="fas fa-layer-group font-size-18 text-info"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title="calender"
              onClick={() => handleViewCalender(row.original._id)}
            >
              <i className="fas fa-calendar-alt font-size-18 text-warning"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title="Delete"
              onClick={() => handleDelete(row.original)}
            >
              <i className="fas fa-trash font-size-18 text-danger"></i>
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  document.title = "Tour Groups | TickYourList"

  return (
    <React.Fragment>
      {error && <p>Something went wrong Please try again</p>}
      {isDeleting && (
        <DeleteModal
          show={deleteModal}
          onDeleteClick={onConfirmDelete}
          onCloseClick={handleOnCloseClick}
        >
          {selectedTourGroupToBeDeleted.city.name}
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
                    isAddNewTourGroup={true}
                    isGlobalFilter={true}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                  <Modal isOpen={modal} toggle={toggle} size="xl">
                    <ModalHeader toggle={toggle} tag="h4">
                      {isViewing
                        ? ""
                        : `${
                            isEdit ? "Update Tour Group" : "Add New Tour Group"
                          }`}
                    </ModalHeader>
                    <ModalBody>
                      <NewTourModel
                        setModal={setModal}
                        isViewing={isViewing}
                        isEdit={isEdit}
                        editId={editId}
                      />
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

export default TourGroup