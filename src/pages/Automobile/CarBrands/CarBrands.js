import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';

import {
} from "../../../store/e-commerce/actions"; 

import {
  BrandId,
  BrandName,
  CountryOfOrigin,
  TotalCars,
  Status,
}
  from "./CarBrandsCol";
  import * as Yup from "yup";

//redux
import { useSelector, useDispatch } from "react-redux";
// import CarBrandssModal from "./CarBrandssModal";

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
} from "reactstrap";
import Select from "react-select";
import CarBrandDetail from "./CarBrandDetail";
import { addNewCarBrand, deleteAllCarBrands, deleteCarBrand, getCarBrands, getCountriesList, updateCarBrand } from "store/automobiles/carbrands/actions";
import { useFormik } from "formik";
import CarBrandModel from "./CarBrandModel";
import countries from '../../../assets/helperJsonData/countries.json';

function CarBrands() {

  //meta title
  document.title = "Car brands | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carBrandsList, setCarBrandsList] = useState([]);
  const [carBrand, setCatBrand] = useState(null);
  const [carBrandData, setCatBrandData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [brandImage, setBrandImage] = useState(null)
  const dispatch = useDispatch();
  const navigate = useNavigate();

    // validation
    const validation = useFormik({
      // enableReinitialize : use this flag when initial values needs to be changed
      enableReinitialize: true,
  
      initialValues: {
        brandName: (carBrand && carBrand.brandName) || "",
        countryOfOrigin: carBrand && carBrand.countryOfOrigin || "",
        status: (carBrand && carBrand.status ? 'Active': 'InActive') || "",
        brandImage: carBrand && carBrand.media?.url || null,
      },
      validationSchema: Yup.object({
        brandName: Yup.string().required(
          "Please Enter Your Brand Name"
        ),
        countryOfOrigin: Yup.string().required(
          "Please Enter Your Country Of Origin"
        ),
        status: Yup.string().required(
          "Please Enter Your Status"
        )
      }),
      onSubmit: values => {
        if (isEdit) {
          const updCarBrand = new FormData();
          updCarBrand.append("brandName", values["brandName"]);
          updCarBrand.append("countryOfOrigin", values["countryOfOrigin"]);
          updCarBrand.append("status", values["status"] === 'Active' ? true : false);
          updCarBrand.append("image", brandImage ? brandImage : "broken!");
          dispatch(updateCarBrand(carBrand._id, updCarBrand));
  
          validation.resetForm();
        } else {
          const newCarBrand = new FormData();
          newCarBrand.append("brandName", values["brandName"]);
          newCarBrand.append("countryOfOrigin", values["countryOfOrigin"]);
          newCarBrand.append("status", values["status"] === 'Active' ? true : false);
          newCarBrand.append("image", brandImage ? brandImage : "broken!");
          dispatch(addNewCarBrand(newCarBrand));
          validation.resetForm();
        }
        toggle();
      },
      handleError: e => { },
    });

  const toggleViewModal = () => setModal1(!modal1);

  const { carBrands } = useSelector(state => ({
    carBrands: state.CarBrand.carBrands,
    // countries: state.CarBrand.countries
  }));

  useEffect(() => {
    if (carBrands && !carBrands.length) {
      dispatch(getCountriesList());
      dispatch(getCarBrands());
    }
  }, [dispatch]);

  useEffect(() => {
    if (carBrands) {
      // Sort brands by sortOrder if available, otherwise maintain original order
      const sortedBrands = [...carBrands].sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return b.sortOrder - a.sortOrder; // Descending order
        }
        return 0;
      });
      setCarBrandsList(sortedBrands);
    }
  }, [carBrands]);
  
  useEffect(() => {
    if (!isEmpty(carBrands) && !!isEdit) {
      const sortedBrands = [...carBrands].sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return b.sortOrder - a.sortOrder; // Descending order
        }
        return 0;
      });
      setCarBrandsList(sortedBrands);
      setIsEdit(false);
    }
  }, [carBrands]);

  const resizeFile = file => {
    setBrandImage(file);
  }

  const toggle = () => {
    if (modal) {
      setModal(false);
      setCatBrand(null);
      setIsEdit(false);
    } else {
      setModal(true);
    }
  };

  const handlecarBrandClick = arg => {
    const carBrand = arg;
    setCatBrand(carBrand);
    setIsEdit(true);

    toggle();
  };

  //delete carBrand
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleNested = () => {
    setNestedModal(!nestedModal);
    setCloseAll(false);
  };

  const toggleAll = () => {
    setNestedModal(!nestedModal);
    setCloseAll(true);
  };

  const onClickDelete = (carBrand) => {
    setCatBrand(carBrand);
    setDeleteModal(true);
  };

  const handleDeletecarBrand = () => {
    if (carBrand && carBrand._id) {
      dispatch(deleteCarBrand(carBrand));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllCarBrands(carBrand));
      setDeleteModal(false);
    }
  };
  const handleAddCarBrandClicks = () => {
    setCarBrandsList("");
    setIsEdit(false);
    toggle();
  };

  const handleCarBrandDeleteClicks = () => {
    setCatBrand();
    setDeleteModal(true);
  }

  const handleSortBrandsClick = () => {
    navigate("/sort-car-brands");
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Sort Order',
        accessor: 'sortOrder',
        width: '100px',
        style: {
          textAlign: "center",
          width: "8%",
        },
        Cell: (cellProps) => {
          return (
            <div className="text-center">
              <span className="badge bg-primary rounded-pill">
                #{cellProps.row.original.sortOrder || '-'}
              </span>
            </div>
          );
        }
      },
      {
        Header: 'Brand ID',
        accessor: '_id',
        width: '150px',
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: (cellProps) => {
          return <BrandId {...cellProps} />;
        }
      },
      {
        Header: 'Brand Name',
        accessor: 'brandName',
        filterable: true,
        Cell: (cellProps) => {
          return <BrandName {...cellProps} />;
        }
      },
      {
        Header: 'Country of Origin',
        accessor: 'countryOfOrigin',
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
        Header: 'View Brand Models',
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
                setCatBrandData(cellProps.row.original);
              }}
            >
              View Brand Models
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
                  const carBrandData = cellProps.row.original;
                  handlecarBrandClick(carBrandData);
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
                  const carBrandData = cellProps.row.original;
                  onClickDelete(carBrandData);
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

  return (
    <React.Fragment>
      {/* <CarBrandModel isOpen={modal1} toggle={toggleViewModal} data={carBrandData} /> */}
      <CarBrandDetail isOpen={modal1} toggle={toggleViewModal} Data={carBrandData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletecarBrand}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Brands" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-end mb-3">
                    <Button
                      color="info"
                      className="btn-sm me-2"
                      onClick={handleSortBrandsClick}
                    >
                      Sort Brands
                    </Button>
                  </div>
                  <TableContainer
                    columns={columns} 
                    data={carBrandsList || []}
                    isGlobalFilter={true}
                    isAddCarBrandOptions={true}
                    isEventAddButtonOptions={true}
                    handleAddCarBrandClicks={handleAddCarBrandClicks}
                    handleCarBrandDeleteClicks={handleCarBrandDeleteClicks}
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
              {!!isEdit ? "Edit Car brand" : "Add New Car Brand"}
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
                        Brand Name <span style={{color: 'red'}}>*</span>
                      </Label>
                      <Input
                        name="brandName"
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
                            .brandName || ""
                        }
                        invalid={
                          validation.touched
                            .brandName &&
                            validation.errors
                              .brandName
                            ? true
                            : false
                        }
                      />
                      {validation.touched
                        .brandName &&
                        validation.errors
                          .brandName ? (
                        <FormFeedback type="invalid">
                          {
                            validation.errors
                              .brandName
                          }
                        </FormFeedback>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <Label className="form-label">
                        Country Of Origin <span style={{color: 'red'}}>*</span>
                      </Label>
                      <Input
                      type="select" 
                      name="countryOfOrigin"
                      id="countryOfOrigin"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.countryOfOrigin}
                    >
                      <option value="">Select a country</option>
                      {countries?.data?.map((country, index) => (
                        <option key={index} value={country.country}>
                          {country.country}
                        </option>
                      ))}
                    </Input>
                      {validation.touched
                        .countryOfOrigin &&
                        validation.errors
                          .countryOfOrigin ? (
                        <FormFeedback type="invalid">
                          {
                            validation.errors
                              .countryOfOrigin
                          }
                        </FormFeedback>
                      ) : null}
                    </div>

                    <div className="mb-3">
                      <Label className="form-label">
                        Status <span style={{color: 'red'}}>*</span>
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
                    <div className="mt-3 mb-3">
                      <Label for="cimg">Brand Image <span style={{color: 'red'}}>*</span></Label>
                      <div className="mh-50">
                        <Input
                          id="cimg"
                          onChange={async e => {
                            if (
                              ["jpeg", "jpg", "png"].includes(
                                e.target.files[0].name.split(".").pop()
                              )
                            ) {
                              setToastDetails({
                                title: "Image Uploaded",
                                message: `${e.target.files[0].name} has been uploaded.`,
                              })
                              setToast(true)
                              const image = await resizeFile(e.target.files[0])
                            } else {
                              setToastDetails({
                                title: "Invalid image",
                                message:
                                  "Please upload images with jpg, jpeg or png extension",
                              })
                              setToast(true)
                            }
                          }}
                          type="file"
                        />
                      </div>
                     {isEdit ? <div className="d-flex text-center margin-auto"><img src={validation.values.brandImage} width={100} height={65} className="mt-3"/></div> : ""}
                    </div>

                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="btn btn-success save-user"
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
CarBrands.propTypes = {
  preGlobalFilteredRows: PropTypes.any,

};


export default CarBrands;