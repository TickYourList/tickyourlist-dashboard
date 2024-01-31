import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../components/Common/TableContainer';

//import components
import Breadcrumbs from '../../components/Common/Breadcrumb';
import DeleteModal from '../../components/Common/DeleteModal';
import statesAndDistricts from '../../assets/helperJsonData/states-and-districts.json';

import {
} from "../../store/e-commerce/actions";

import {
  TestimonialId,
  TestimonialName,
  CountryOfOrigin,
  TotalCars,
  Status,
}
  from "./TestimonialsCol";
import * as Yup from "yup";

//redux
import { useSelector, useDispatch } from "react-redux";
// import TestimonialssModal from "./TestimonialssModal";

import {
  Button,
  Col,
  Row,
  UncontrolledTooltip,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  FormFeedback,
  FormGroup,
} from "reactstrap";
import Select from "react-select";
import TestimonialDetail from "./TesrimonialDetail";
import { addNewTestimonial, deleteAllTestimonials, deleteTestimonial, getTestimonials, updateTestimonial } from "store/testimonials/actions";
import { useFormik } from "formik";
import TestimonialModel from "./TesrimonialModel";

function Testimonials() {

  //meta title
  document.title = "Testimonials | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [cities, setCities] = useState([]);

  const [testimonialsList, setTestimonialsList] = useState([]);
  const [testimonial, setCatTestimonial] = useState(null);
  const [testimonialData, setCatTestimonialData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [testimonialImage, setTestimonialImage] = useState(null)
  const dispatch = useDispatch();

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: (testimonial && testimonial.name) || "",
      state: (testimonial && testimonial.state) || "",
      city: (testimonial && testimonial.city) || "",
      rating: (testimonial && testimonial.rating) || "",
      description: testimonial && testimonial.description || "",
      status: (testimonial && testimonial.status ? 'Active' : 'InActive') || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required(
        "Please Enter Your Testimonial Name"
      ),
      state: Yup.string().required(
        "Please Enter Your State"
      ),
      city: Yup.string().required(
        "Please Enter Your City"
      ),
      rating: Yup.string().required(
        "Please Enter Your Rating"
      ),
      description: Yup.string().required(
        "Please Enter Your Description"
      ),
      status: Yup.string().required(
        "Please Enter Your Status"
      ),
    }),
    onSubmit: values => {
      if (isEdit) {
        const updTestimonial = new FormData();
        updTestimonial.append("name", values["name"]);
        updTestimonial.append("countryOfOrigin", values["countryOfOrigin"]);
        updTestimonial.append("status", values["status"] === 'Active' ? true : false);
        updTestimonial.append("image", testimonialImage ? testimonialImage : "broken!");
        dispatch(updateTestimonial(testimonial._id, updTestimonial));

        validation.resetForm();
      } else {
        console.log('values ', values);
        const data = {
          name: values["name"],
          state: values["state"],
          city: values["city"],
          rating: values["rating"],
          description: values["description"],
          status: values["status"] === 'Active' ? true : false
        }
        dispatch(addNewTestimonial(data));
        validation.resetForm();
      }
      toggle();
    },
    handleError: e => { },
  });

  const toggleViewModal = () => setModal1(!modal1);

  const { testimonials, countries } = useSelector(state => ({
    testimonials: state.Testimonial.testimonials,
    countries: state.Testimonial.countries
  }));

  useEffect(() => {
    if (testimonials && !testimonials.length) {
      dispatch(getTestimonials());
    }
  }, [dispatch]);

  useEffect(() => {
    setTestimonialsList(testimonials);
  }, [testimonials]);

  useEffect(() => {
    if (!isEmpty(testimonials) && !!isEdit) {
      setTestimonialsList(testimonials);
      setIsEdit(false);
    }
  }, [testimonials]);

  const resizeFile = file => {
    setTestimonialImage(file);
  }

  const toggle = () => {
    if (modal) {
      setModal(false);
      setCatTestimonial(null);
      setIsEdit(false);
    } else {
      setModal(true);
    }
  };

  const handletestimonialClick = arg => {
    const testimonial = arg;
    setCatTestimonial(testimonial);
    setIsEdit(true);

    toggle();
  };

  //delete testimonial
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleNested = () => {
    setNestedModal(!nestedModal);
    setCloseAll(false);
  };

  const toggleAll = () => {
    setNestedModal(!nestedModal);
    setCloseAll(true);
  };

  const onClickDelete = (testimonial) => {
    setCatTestimonial(testimonial);
    setDeleteModal(true);
  };

  const handleDeletetestimonial = () => {
    if (testimonial && testimonial._id) {
      dispatch(deleteTestimonial(testimonial));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllTestimonials(testimonial));
      setDeleteModal(false);
    }
  };
  const handleAddTestimonialClicks = () => {
    setTestimonialsList("");
    setIsEdit(false);
    toggle();
  };

  const handleTestimonialDeleteClicks = () => {
    setCatTestimonial();
    setDeleteModal(true);
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Testimonial ID',
        accessor: '_id',
        width: '150px',
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: (cellProps) => {
          return <TestimonialId {...cellProps} />;
        }
      },
      {
        Header: 'Testimonial Name',
        accessor: 'name',
        filterable: true,
        Cell: (cellProps) => {
          return <TestimonialName {...cellProps} />;
        }
      },
      {
        Header: 'Rating',
        accessor: 'rating',
        filterable: true,
        Cell: (cellProps) => {
          return <CountryOfOrigin {...cellProps} />;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        filterable: true,
        Cell: (cellProps) => {
          return <Status {...cellProps} />;
        }
      },
      {
        Header: 'View Testimonial Models',
        accessor: 'view',
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded"
              onClick={e => {
                toggleViewModal();
                setCatTestimonialData(cellProps.row.original);
              }}
            >
              View Testimonial Models
            </Button>);
        }
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  const testimonialData = cellProps.row.original;
                  handletestimonialClick(testimonialData);
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
                onClick={() => {
                  const testimonialData = cellProps.row.original;
                  onClickDelete(testimonialData);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
                <UncontrolledTooltip placement="top" target="deletetooltip">
                  Delete
                </UncontrolledTooltip>
              </Link>
            </div>
          );
        }
      },
    ],
    []
  );

  const handleStateChange = (selectedState) => {
    setSelectedState(selectedState);
    const stateObj = statesAndDistricts.states.find(state => state.state === selectedState);
    setCities(stateObj ? stateObj.districts : []);
    validation.setFieldValue('state', selectedState);
    validation.setFieldValue('city', ''); // Reset city value when state changes
  };

  return (
    <React.Fragment>
      {/* <TestimonialModel isOpen={modal1} toggle={toggleViewModal} data={testimonialData} /> */}
      <TestimonialDetail isOpen={modal1} toggle={toggleViewModal} Data={testimonialData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletetestimonial}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Testimonials" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={testimonials}
                    isGlobalFilter={true}
                    isAddTestimonialOptions={true}
                    isEventAddButtonOptions={true}
                    handleAddTestimonialClicks={handleAddTestimonialClicks}
                    handleTestimonialDeleteClicks={handleTestimonialDeleteClicks}
                    customPageSize={10}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle} tag="h4">
          {!!isEdit ? "Edit testimonial" : "Add New Testimonial"}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={e => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <Row form="true">
              <Col className="col-12">
                <div className="mb-3">
                  <Label className="form-label">
                    Testimonial Name <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="name"
                    type="text"
                    validate={{
                      required: { value: true },
                    }}
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .name || ""
                    }
                    invalid={
                      validation.touched
                        .name &&
                        validation.errors
                          .name
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .name &&
                    validation.errors
                      .name ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .name
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <Col className="col-12 row">
                  <Col className="col">
                    <FormGroup>
                      <Label for="state">State <span style={{ color: 'red' }}>*</span></Label>
                      <Input type="select" name="state" id="state" onChange={(e) => handleStateChange(e.target.value)}>
                        <option value="">Select State</option>
                        {statesAndDistricts.states.map((stateObj, index) => (
                          <option key={index} value={stateObj.state}>{stateObj.state}</option>
                        ))}
                      </Input>
                      {validation.touched
                        .state &&
                        validation.errors
                          .state ? (
                        <FormFeedback type="invalid">
                          {
                            validation.errors
                              .state
                          }
                        </FormFeedback>
                      ) : null}
                    </FormGroup>
                  </Col>
                  <Col className="col">
                    <FormGroup>
                      <Label for="city">City <span style={{ color: 'red' }}>*</span></Label>
                      <Input type="select" name="city" id="city" onChange={validation.handleChange} disabled={!selectedState}>
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city}>{city}</option>
                        ))}
                      </Input>
                      {validation.touched
                        .city &&
                        validation.errors
                          .city ? (
                        <FormFeedback type="invalid">
                          {
                            validation.errors
                              .city
                          }
                        </FormFeedback>
                      ) : null}
                    </FormGroup>
                  </Col>
                </Col>
                <Col className="col">
                  <FormGroup>
                    <Label for="rating">Rating <span style={{ color: 'red' }}>*</span></Label>
                    <Input type="number" name="rating" id="rating" onChange={validation.handleChange} />
                    {validation.touched
                      .rating &&
                      validation.errors
                        .rating ? (
                      <FormFeedback type="invalid">
                        {
                          validation.errors
                            .rating
                        }
                      </FormFeedback>
                    ) : null}
                  </FormGroup>
                </Col>
                <div className="mb-3">
                  <Label className="form-label">
                    Description <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    placeholder="Enter your Testimonial Description"
                    rows="10"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.description}
                  ></textarea>
                  {validation.touched
                    .description &&
                    validation.errors
                      .description ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .description
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <div className="mb-3">
                  <Label className="form-label">
                    Status <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="status"
                    type="select"
                    className="form-select"
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .status || ""
                    }
                  >
                    <option>Active</option>
                    <option>InActive</option>
                  </Input>
                  {validation.touched
                    .status &&
                    validation.errors
                      .status ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .status
                      }
                    </FormFeedback>
                  ) : null}
                </div>

              </Col>
            </Row>
            <Row>
              <Col>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-success save-user"
                    disabled={!(validation.isValid)}
                    onClick={() => {
                      validation.setFieldTouched(
                        "billingName",
                        true
                      );
                      validation.setFieldTouched(
                        "orderItems",
                        true
                      );
                    }}
                  >
                    Save
                  </button>
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
}
Testimonials.propTypes = {
  preGlobalFilteredRows: PropTypes.any,

};


export default Testimonials;