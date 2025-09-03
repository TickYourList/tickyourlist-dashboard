import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { SelectColumnFilter } from "../../components/Common/filters"; 
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  FormFeedback,
  Label,
  Input,
  Form,
  ModalFooter,
} from "reactstrap"
import Breadcrumbs from "../../components/Common/Breadcrumb"
import TableContainerWithServerSidePagination from "../../components/Common/TableContainerWithServerSidePagination"
import {
  addNewTravelPartner,
  getTravelPartner,
  updateTravelPartner,
  deleteTravelPartner,
} from "store/travelPartner/actions"
import TravelPartnerDetails from "./TravelPartnerDetails"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Link } from "react-router-dom"




const buildQueryFromFilters = (filters) => {
  const query = {};
  filters.forEach(filter => {
    const { id, value } = filter;
    if (id === 'status') {
      if (value === 'Active') query[id] = true;
      else if (value === 'Inactive') query[id] = false;
    } else if (id === 'featured') {
      if (value === 'Yes') query[id] = true;
      else if (value === 'No') query[id] = false;
    } else {
      query[id] = value;
    }
  });
  return query;
};

function TravelPartners() {
  document.title = "Travel partners | Scrollit"

  const [modal1, setModal1] = useState(false)
  const [travelPartner, setTravelPartner] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [modal, setModal] = useState(false)
  const [travelPartnerImage, setTravelPartnerImage] = useState(null)
  const [isDelete, setIsDelete] = useState(false)

  const dispatch = useDispatch()

  const { travelPartners, pagination } = useSelector(
    state =>
      state.travelPartner || {
        travelPartners: [],
        pagination: { total: 0, page: 1 },
        loading: false,
      }
  )

  const [limit, setLimit] = useState(10)

  useEffect(() => {
    if (pagination.page > 0) {
        dispatch(getTravelPartner(pagination.page, limit))
    }
  }, [dispatch, pagination.page, limit])

  const handlePageChange = newPage => {
    dispatch(getTravelPartner(newPage, limit))
  }

  const handleViewDetail = data => {
    setModal1(true)
    setTravelPartner(data)
  }

  const handleToggle = () => {
    setModal1(false)
    setTravelPartner(null)
  }

  const handleTravelPartnerEditClick = arg => {
    setTravelPartner(arg)
    setIsEdit(true)
    setTravelPartnerImage(null)
    toggle()
  }

  const handleAddNewTravelPartner = () => {
    setTravelPartner(null)
    setIsEdit(false)
    toggle()
  }

  const toggle = () => {
    if (modal) {
      setModal(false)
      setTravelPartner(null)
      setIsEdit(false)
      setTravelPartnerImage(null)
      validation.resetForm()
    } else {
      setModal(true)
    }
  }

  const handleDeleteClick = data => {
    setTravelPartner(data)
    setIsDelete(true)
  }
  const toggleDelete = () => {
    setIsDelete(false)
    setTravelPartner(null)
  }
  const confirmDelete = async () => {
    if (travelPartner && travelPartner._id) {
      await dispatch(deleteTravelPartner(travelPartner))
      dispatch(getTravelPartner(pagination.page, limit)) 
      toggleDelete()
    } else {
      toggleDelete()
    }
  }

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      travelPartnerName: travelPartner?.name || "",
      travelPartnerFeatured:
        isEdit && travelPartner ? (travelPartner.featured ? "Yes" : "No") : "",
      currentTravelPartnerImageUrl: travelPartner?.imgUrl?.url || null,
    travelPartnerImage: undefined,
    },
    validationSchema: Yup.object({
      travelPartnerName: Yup.string().required(
        "Please Enter Travel Partner Name"
      ),
      travelPartnerFeatured: Yup.string().required("Please Select Feature"),
      travelPartnerImage: Yup.mixed().test(
      "required-image",
      "Please upload an image",
      function (value) { 
        const isAddingNew = !isEdit;
        const hasExistingImageUrl = !!this.parent.currentTravelPartnerImageUrl;

        if (isAddingNew) {
        
          return !!value;
        } else {
          return !!value || hasExistingImageUrl;
        }
      }
    ),
  }),
    onSubmit: async values => {
      const formData = new FormData()
      formData.append("name", values.travelPartnerName)
      formData.append("featured", values.travelPartnerFeatured === "Yes")

      if (values.travelPartnerImage) {
        formData.append("media", values.travelPartnerImage)
      }

      if (isEdit) {
        await dispatch(updateTravelPartner(travelPartner._id, formData))
      } else {
        await dispatch(addNewTravelPartner(formData))
      }
      dispatch(getTravelPartner(pagination.page, limit)) 
      validation.resetForm()
      toggle()
    },
  })

  const travelPartnerColumns = useMemo(
    () => [
      {
        Header: "Display Order",
        accessor: "displayOrder",
        style: { textAlign: "center", width: "8%" },
        Cell: ({ row }) => (
          <div className="text-center">
            <span className="badge bg-secondary rounded-pill">
              {row.original.displayOrder || "-"}
            </span>
          </div>
        ),
      },
      {
        Header: "Image",
        accessor: "imgUrl.url",
        disableFilters: true,
        style: { textAlign: "center", width: "10%" },
        Cell: ({ row }) => {
          const { imgUrl } = row.original;
          return (
            <div className="text-center">
              <img
                src={imgUrl?.url}
                alt={imgUrl?.altText || "Partner"}
                style={{ width: "50px", height: "50px", objectFit: "contain" }}
              />
            </div>
          );
        },
      },
      {
        Header: "Name",
        accessor: "name",
      },
     {
        Header: "Featured",
        accessor: row => (row.featured ? "Yes" : "No"),
        id: 'featured', 
        Filter: SelectColumnFilter, 
        Cell: ({ value }) => (
          <div className="text-center">
            {value}
          </div>
        ),
      },
      {
        Header: "Status",
        accessor: row => (row.status ? "Active" : "Inactive"),
        id: 'status', 
        Filter: SelectColumnFilter, 
        Cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="text-center">
              <span className={`badge bg-${status ? "success" : "danger"}`}>
                {status ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        Header: "Details",
        accessor: "details",
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="text-center">
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded"
              onClick={() => handleViewDetail(row.original)}
            >
              View Details
            </Button>
          </div>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={e => {
                  e.preventDefault();
                  handleTravelPartnerEditClick(data);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                <UncontrolledTooltip placement="top" target="edittooltip">
                  Edit
                </UncontrolledTooltip>
              </Link>
              <Link
                to="#"
                className="text-danger"
                onClick={e => {
                  e.preventDefault();
                  handleDeleteClick(data);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
                <UncontrolledTooltip placement="top" target="deletetooltip">
                  Delete
                </UncontrolledTooltip>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );
  

  return (
    <React.Fragment>
      <div className="page-content">
        <TravelPartnerDetails
          isOpen={modal1}
          toggle={handleToggle}
          Data={travelPartner}
        />
        <div className="container-fluid">
          <Breadcrumbs title="Travel Partner" breadcrumbItem="Travel Partner" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainerWithServerSidePagination
                    columns={travelPartnerColumns}
                    data={travelPartners}
                    totalCount={pagination.total || 0}
                    currentPage={pagination.page || 1}
                    pageSize={limit}
                    onPageChange={handlePageChange}
                    setPageSize={setLimit}
                    isGlobalFilter={true}
                    toggleViewModal={handleAddNewTravelPartner}
                    isAddNewTravelPartner={true}
                    className="custom-header-css"
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
        {/* for adding or editing */}
<Modal isOpen={modal} toggle={toggle}>
  <ModalHeader toggle={toggle} tag="h4">
    {!!isEdit ? "Edit Travel Partner" : "Add New Travel Partner"}
  </ModalHeader>

  <Form onSubmit={validation.handleSubmit}>
    <ModalBody>
      <Row>
        <Col className="col-12">
          <div className="mb-3">
            <Label className="form-label">
              Travel Partner Name <span style={{ color: "red" }}>*</span>
            </Label>
            <Input
              name="travelPartnerName"
              type="text"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.travelPartnerName || ""}
              invalid={
                !!(
                  validation.touched.travelPartnerName &&
                  validation.errors.travelPartnerName
                )
              }
            />
            <FormFeedback>
              {validation.errors.travelPartnerName}
            </FormFeedback>
          </div>
          <div className="mb-3">
            <Label className="form-label">
              Featured <span style={{ color: "red" }}>*</span>
            </Label>
            <Input
              name="travelPartnerFeatured"
              type="select"
              className="form-select"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.travelPartnerFeatured || ""}
              invalid={
                !!(
                  validation.touched.travelPartnerFeatured &&
                  validation.errors.travelPartnerFeatured
                )
              }
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Input>
            <FormFeedback>
              {validation.errors.travelPartnerFeatured}
            </FormFeedback>
          </div>
          <div className="mt-3 mb-3">
            <Label htmlFor="cimg">
              Travel Partner Image{" "}
              <span style={{ color: "red" }}>
                {!isEdit ||
                (!validation.values.currentTravelPartnerImageUrl &&
                  !travelPartnerImage)
                  ? "*"
                  : ""}
              </span>
            </Label>
            <div className="mh-50">
              <Input
                id="cimg"
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                name="travelPartnerImage"
                onChange={e => {
                  const file = e.target.files[0]
                  validation.setFieldValue("travelPartnerImage", file)
                  setTravelPartnerImage(file)
                }}
                invalid={
                  !!(
                    validation.touched.travelPartnerImage &&
                    validation.errors.travelPartnerImage
                  )
                }
              />
            </div>
            <FormFeedback
              style={{
                display:
                  validation.touched.travelPartnerImage &&
                  validation.errors.travelPartnerImage
                    ? "block"
                    : "none",
              }}
            >
              {validation.errors.travelPartnerImage}
            </FormFeedback>

            {(travelPartnerImage ||
              validation.values.currentTravelPartnerImageUrl) && (
              <div className="text-center mt-3">
                <img
                  src={
                    travelPartnerImage
                      ? URL.createObjectURL(travelPartnerImage)
                      : validation.values.currentTravelPartnerImageUrl
                  }
                  width={100}
                  height={65}
                  alt="Preview"
                />
              </div>
            )}
          </div>
          
          
        </Col>
      </Row>
    </ModalBody>

    <ModalFooter>
      <Button type="button" color="secondary" onClick={toggle}>
        Cancel
      </Button>
      <Button type="submit" color="primary">
        {!!isEdit ? "Update Partner" : "Save Partner"}
      </Button>
    </ModalFooter>
  </Form>
</Modal>
        {/* onclick delete */}

        <Modal isOpen={isDelete} toggle={toggleDelete} centered={true}>
          <ModalHeader toggle={toggleDelete}>Delete Travel Partner</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to permanently delete this{" "}
               <strong>{travelPartner?.name}</strong> Travel Partner? Once deleted, cannot be
              recovered.
            </p>
            <div className="d-flex justify-content-end">
              <Button color="secondary" onClick={toggleDelete} className="me-2">
                Cancel
              </Button>
              <Button color="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  )
}

export default TravelPartners
