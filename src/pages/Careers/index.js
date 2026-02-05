import React, { useEffect, useMemo, useState } from "react";
import { isEmpty } from "lodash";
import TableContainer from "../../components/Common/TableContainer";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DeleteModal from "../../components/Common/DeleteModal";

import {
  getCareerPostings as onGetCareerPostings,
  addNewCareerPosting as onAddNewCareerPosting,
  updateCareerPosting as onUpdateCareerPosting,
  deleteCareerPosting as onDeleteCareerPosting,
} from "../../store/actions";

import {
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Input,
  FormFeedback,
  Label,
  Card,
  CardBody,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "reactstrap";

//redux
import { useSelector, useDispatch } from "react-redux";

function Careers() {
  //meta title
  document.title = "Career Management | TickYourList";

  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [postingsList, setPostingsList] = useState([]);
  const [posting, setPosting] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const dispatch = useDispatch();
  const { postings, loading } = useSelector((state) => ({
    postings: state.careers.postings,
    loading: state.careers.loading,
  }));

  useEffect(() => {
    dispatch(onGetCareerPostings());
  }, [dispatch]);

  useEffect(() => {
    if (postings && postings.length) {
      setPostingsList(postings);
    }
  }, [postings]);

  // validation
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: (posting && posting.title) || "",
      department: (posting && posting.department) || "",
      location: (posting && posting.location) || "",
      employmentType: (posting && posting.employmentType) || "Full-time",
      description: (posting && posting.description) || "",
      requirements: (posting && posting.requirements) || [],
      responsibilities: (posting && posting.responsibilities) || [],
      benefits: (posting && posting.benefits) || [],
      status: (posting && posting.status) !== undefined ? posting.status : true,
      featured: (posting && posting.featured) || false,
      applicationDeadline: (posting && posting.applicationDeadline) || "",
      salaryRange: {
        min: (posting && posting.salaryRange?.min) || "",
        max: (posting && posting.salaryRange?.max) || "",
        currency: (posting && posting.salaryRange?.currency) || "USD",
      },
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Job Title"),
      department: Yup.string().required("Please Enter Department"),
      location: Yup.string().required("Please Enter Location"),
      employmentType: Yup.string().required("Please Select Employment Type"),
      description: Yup.string().required("Please Enter Description"),
      requirements: Yup.array().min(1, "Please Add At Least One Requirement"),
      responsibilities: Yup.array().min(1, "Please Add At Least One Responsibility"),
    }),
    onSubmit: (values) => {
      const formattedData = {
        ...values,
        requirements: Array.isArray(values.requirements)
          ? values.requirements
          : values.requirements.split("\n").filter((r) => r.trim()),
        responsibilities: Array.isArray(values.responsibilities)
          ? values.responsibilities
          : values.responsibilities.split("\n").filter((r) => r.trim()),
        benefits: Array.isArray(values.benefits)
          ? values.benefits
          : values.benefits.split("\n").filter((r) => r.trim()),
        salaryRange: values.salaryRange.min || values.salaryRange.max
          ? {
              min: parseFloat(values.salaryRange.min) || 0,
              max: parseFloat(values.salaryRange.max) || 0,
              currency: values.salaryRange.currency,
            }
          : undefined,
        applicationDeadline: values.applicationDeadline || undefined,
      };

      if (isEdit) {
        const updateData = {
          id: posting._id,
          ...formattedData,
        };
        dispatch(onUpdateCareerPosting(updateData));
      } else {
        dispatch(onAddNewCareerPosting(formattedData));
      }
      validation.resetForm();
      toggle();
    },
  });

  const toggle = () => {
    if (modal) {
      setModal(false);
      setPosting(null);
      setIsEdit(false);
    } else {
      setModal(true);
    }
  };

  const handlePostingClick = (arg) => {
    const postingData = arg;
    setPosting(postingData);
    setIsEdit(true);
    toggle();
  };

  const onClickDelete = (posting) => {
    setPosting(posting);
    setDeleteModal(true);
  };

  const handleDeletePosting = () => {
    if (posting && posting._id) {
      dispatch(onDeleteCareerPosting(posting._id));
      setDeleteModal(false);
      setPosting(null);
    }
  };

  const handleAddPosting = () => {
    setPosting(null);
    setIsEdit(false);
    toggle();
  };

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title",
        filterable: true,
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.title}</span>;
        },
      },
      {
        Header: "Department",
        accessor: "department",
        filterable: true,
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.department}</span>;
        },
      },
      {
        Header: "Location",
        accessor: "location",
        filterable: true,
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.location}</span>;
        },
      },
      {
        Header: "Type",
        accessor: "employmentType",
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.employmentType}</span>;
        },
      },
      {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <Badge
              className={`badge-soft-${
                cellProps.row.original.status ? "success" : "danger"
              }`}
            >
              {cellProps.row.original.status ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        Header: "Featured",
        accessor: "featured",
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <Badge
              className={`badge-soft-${
                cellProps.row.original.featured ? "primary" : "secondary"
              }`}
            >
              {cellProps.row.original.featured ? "Yes" : "No"}
            </Badge>
          );
        },
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <ul className="list-unstyled hstack gap-1 mb-0">
              <li>
                <Button
                  color="link"
                  size="sm"
                  className="btn-soft-info"
                  onClick={() => {
                    const postingData = cellProps.row.original;
                    handlePostingClick(postingData);
                  }}
                >
                  <i className="mdi mdi-pencil-outline"></i>
                </Button>
              </li>
              <li>
                <Button
                  color="link"
                  size="sm"
                  className="btn-soft-danger"
                  onClick={() => {
                    const postingData = cellProps.row.original;
                    onClickDelete(postingData);
                  }}
                >
                  <i className="mdi mdi-delete-outline"></i>
                </Button>
              </li>
            </ul>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Careers" breadcrumbItem="Career Management" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="card-title mb-0">Career Postings</h4>
                    <Button
                      color="primary"
                      className="btn-sm"
                      onClick={handleAddPosting}
                    >
                      <i className="mdi mdi-plus me-1"></i> Add New Posting
                    </Button>
                  </div>

                  <TableContainer
                    columns={columns}
                    data={postingsList}
                    isGlobalFilter={true}
                    isAddOptions={false}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>
          {isEdit ? "Edit Career Posting" : "Add New Career Posting"}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <Row>
              <Col md="6">
                <div className="mb-3">
                  <Label>Job Title *</Label>
                  <Input
                    name="title"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.title || ""}
                    invalid={
                      validation.touched.title && validation.errors.title
                        ? true
                        : false
                    }
                  />
                  {validation.touched.title && validation.errors.title ? (
                    <FormFeedback type="invalid">
                      {validation.errors.title}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-3">
                  <Label>Department *</Label>
                  <Input
                    name="department"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.department || ""}
                    invalid={
                      validation.touched.department &&
                      validation.errors.department
                        ? true
                        : false
                    }
                  />
                  {validation.touched.department &&
                  validation.errors.department ? (
                    <FormFeedback type="invalid">
                      {validation.errors.department}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-3">
                  <Label>Location *</Label>
                  <Input
                    name="location"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.location || ""}
                    invalid={
                      validation.touched.location && validation.errors.location
                        ? true
                        : false
                    }
                  />
                  {validation.touched.location && validation.errors.location ? (
                    <FormFeedback type="invalid">
                      {validation.errors.location}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="6">
                <div className="mb-3">
                  <Label>Employment Type *</Label>
                  <Input
                    name="employmentType"
                    type="select"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.employmentType || ""}
                    invalid={
                      validation.touched.employmentType &&
                      validation.errors.employmentType
                        ? true
                        : false
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </Input>
                  {validation.touched.employmentType &&
                  validation.errors.employmentType ? (
                    <FormFeedback type="invalid">
                      {validation.errors.employmentType}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="12">
                <div className="mb-3">
                  <Label>Description *</Label>
                  <Input
                    name="description"
                    type="textarea"
                    rows="4"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.description || ""}
                    invalid={
                      validation.touched.description &&
                      validation.errors.description
                        ? true
                        : false
                    }
                  />
                  {validation.touched.description &&
                  validation.errors.description ? (
                    <FormFeedback type="invalid">
                      {validation.errors.description}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="12">
                <div className="mb-3">
                  <Label>Requirements * (One per line)</Label>
                  <Input
                    name="requirements"
                    type="textarea"
                    rows="4"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={
                      Array.isArray(validation.values.requirements)
                        ? validation.values.requirements.join("\n")
                        : validation.values.requirements || ""
                    }
                    invalid={
                      validation.touched.requirements &&
                      validation.errors.requirements
                        ? true
                        : false
                    }
                  />
                  {validation.touched.requirements &&
                  validation.errors.requirements ? (
                    <FormFeedback type="invalid">
                      {validation.errors.requirements}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="12">
                <div className="mb-3">
                  <Label>Responsibilities * (One per line)</Label>
                  <Input
                    name="responsibilities"
                    type="textarea"
                    rows="4"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={
                      Array.isArray(validation.values.responsibilities)
                        ? validation.values.responsibilities.join("\n")
                        : validation.values.responsibilities || ""
                    }
                    invalid={
                      validation.touched.responsibilities &&
                      validation.errors.responsibilities
                        ? true
                        : false
                    }
                  />
                  {validation.touched.responsibilities &&
                  validation.errors.responsibilities ? (
                    <FormFeedback type="invalid">
                      {validation.errors.responsibilities}
                    </FormFeedback>
                  ) : null}
                </div>
              </Col>

              <Col md="12">
                <div className="mb-3">
                  <Label>Benefits (Optional - One per line)</Label>
                  <Input
                    name="benefits"
                    type="textarea"
                    rows="3"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={
                      Array.isArray(validation.values.benefits)
                        ? validation.values.benefits.join("\n")
                        : validation.values.benefits || ""
                    }
                  />
                </div>
              </Col>

              <Col md="4">
                <div className="mb-3">
                  <Label>Salary Min</Label>
                  <Input
                    name="salaryRange.min"
                    type="number"
                    onChange={validation.handleChange}
                    value={validation.values.salaryRange?.min || ""}
                  />
                </div>
              </Col>

              <Col md="4">
                <div className="mb-3">
                  <Label>Salary Max</Label>
                  <Input
                    name="salaryRange.max"
                    type="number"
                    onChange={validation.handleChange}
                    value={validation.values.salaryRange?.max || ""}
                  />
                </div>
              </Col>

              <Col md="4">
                <div className="mb-3">
                  <Label>Currency</Label>
                  <Input
                    name="salaryRange.currency"
                    type="select"
                    onChange={validation.handleChange}
                    value={validation.values.salaryRange?.currency || "USD"}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AED">AED</option>
                    <option value="INR">INR</option>
                  </Input>
                </div>
              </Col>

              <Col md="6">
                <div className="mb-3">
                  <Label>Application Deadline</Label>
                  <Input
                    name="applicationDeadline"
                    type="date"
                    onChange={validation.handleChange}
                    value={validation.values.applicationDeadline || ""}
                  />
                </div>
              </Col>

              <Col md="3">
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <Input
                      name="status"
                      type="checkbox"
                      checked={validation.values.status}
                      onChange={(e) =>
                        validation.setFieldValue("status", e.target.checked)
                      }
                    />
                    <Label check>Active Status</Label>
                  </div>
                </div>
              </Col>

              <Col md="3">
                <div className="mb-3">
                  <div className="form-check form-switch">
                    <Input
                      name="featured"
                      type="checkbox"
                      checked={validation.values.featured}
                      onChange={(e) =>
                        validation.setFieldValue("featured", e.target.checked)
                      }
                    />
                    <Label check>Featured</Label>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="text-end">
              <Button type="button" color="secondary" onClick={toggle}>
                Cancel
              </Button>
              <Button type="submit" color="primary" className="ms-2">
                {isEdit ? "Update" : "Submit"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletePosting}
        onCloseClick={() => setDeleteModal(false)}
      />
    </React.Fragment>
  );
}

export default Careers;
