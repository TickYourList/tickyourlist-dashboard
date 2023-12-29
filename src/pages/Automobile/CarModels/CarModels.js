import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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
  ModelName,
  CarBrand,
  ModelId,
  Year,
}
  from "./CarModelsCol";
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
  FormGroup,
} from "reactstrap";
import Select from "react-select";
import CarBrandDetail from "./CarModelDetail";
import { getCarBrands } from "store/automobiles/carbrands/actions";
import { useFormik } from "formik";
import CarBrandModel from "./CarModelModel";
import { addNewCarModel, deleteAllCarModels, deleteCarModel, getCarModels, updateCarModel } from "store/automobiles/carModels/actions";

function CarModels() {

  //meta title
  document.title = "Car brands | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carModelsList, setCarModelsList] = useState([]);
  const [carModel, setCarModel] = useState(null);
  const [carModelData, setCarModelData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [modelImage, setModelImage] = useState(null)
  const dispatch = useDispatch();

  // // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      modelName: (carModel && carModel.modelName) || "",
      carBrand: (carModel && carModel.carBrand && carModel.carBrand._id) || "",
      bodyType: (carModel && carModel.bodyType) || "",
      description: (carModel && carModel.description) || "",
      year: (carModel && carModel.year) || "",
      status: (carModel && carModel.status ? 'Active' : 'InActive') || "",
      modelImage: (carModel && carModel.media.url) || ""
    },
    validationSchema: Yup.object({
      modelName: Yup.string().required(
        "Please Enter Your Brand Name"
      ),
      carBrand: Yup.string().required(
        "Please Enter Your CarBrand"
      ),
      bodyType: Yup.string().required(
        "Please Enter Your BodyType"
      ),
      description: Yup.string().required(
        "Please Enter Your description"
      ),
      year: Yup.string().required(
        "Please Enter Your Year"
      ),
      status: Yup.string().required(
        "Please Enter Your Status"
      )
    }),
    onSubmit: values => {
      if (isEdit) {
        const updCarModel = new FormData();
        updCarModel.append("modelName", values["modelName"]);
        updCarModel.append("description", values["description"]);
        newCarModel.append("bodyType", values["bodyType"]);
        updCarModel.append("year", values["year"]);
        updCarModel.append("status", values["status"] === 'Active' ? true : false);
        updCarModel.append("image", modelImage ? modelImage : "broken!");
        dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

        validation.resetForm();
      } else {
        const newCarModel = new FormData();
        newCarModel.append("modelName", values["modelName"]);
        newCarModel.append("bodyType", values["bodyType"]);
        newCarModel.append("description", values["description"]);
        newCarModel.append("year", values["year"]);
        newCarModel.append("status", values["status"] === 'Active' ? true : false);
        newCarModel.append("image", modelImage ? modelImage : "broken!");
        dispatch(addNewCarModel(values['carBrand'], newCarModel));
        validation.resetForm();
      }
      toggle();
    },
    handleError: e => { },
  });

  const toggleViewModal = () => setModal1(!modal1);

  const { carBrands, countries, carModels } = useSelector(state => ({
    carBrands: state.CarBrand.carBrands,
    countries: state.CarBrand.countries,
    carModels: state.CarModel.carModels
  }));

  useEffect(() => {
    if (carModels && !carModels.length) {
      dispatch(getCarBrands());
      dispatch(getCarModels());
    }
  }, [dispatch]);

  useEffect(() => {
    setCarModelsList(carModels);
  }, [carModels]);

  useEffect(() => {
    if (!isEmpty(carModels) && !!isEdit) {
      setCarModelsList(carModels);
      setIsEdit(false);
    }
  }, [carModels]);

  const resizeFile = file => {
    setModelImage(file);
  }

  const toggle = () => {
    console.log('model ', modal);
    if (modal) {
      setModal(false);
      setCarModel(null);
    } else {
      setModal(true);
    }
  };

  const handlecarModelClick = arg => {
    const carModel = arg;
    console.log('carModel ', carModel);
    setCarModel(carModel);
    setIsEdit(true);

    toggle();
  };

  //delete carBrand
  const [deleteModal, setDeleteModal] = useState(false);

  const onClickDelete = (carModel) => {
    setCarModel(carModel);
    setDeleteModal(true);
  };

  const handleDeletecarModel = () => {
    if (carModel && carModel._id) {
      dispatch(deleteCarModel(carModel));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllCarModels());
      setDeleteModal(false);
    }
  };
  const handleAddCarModelClicks = () => {
    setCarModelsList("");
    setIsEdit(false);
    toggle();
  };

  const handleCarModelDeleteClicks = () => {
    setCarModel();
    setDeleteModal(true);
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Model ID',
        accessor: '_id',
        width: '150px',
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: (cellProps) => {
          return <ModelId {...cellProps} />;
        }
      },
      {
        Header: 'Model Name',
        accessor: 'modelName',
        filterable: true,
        Cell: (cellProps) => {
          return <ModelName {...cellProps} />;
        }
      },
      {
        Header: 'Car Brand',
        accessor: 'carBrand.brandName',
        filterable: true,
        Cell: (cellProps) => {
          return <CarBrand {...cellProps} />;
        }
      },
      {
        Header: 'Year',
        accessor: 'year',
        filterable: true,
        Cell: (cellProps) => {
          return <Year {...cellProps} />;
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
        Header: 'View Model Details',
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
                setCarModelData(cellProps.row.original);
              }}
            >
              View Model Details
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
                  const carModelData = cellProps.row.original;
                  handlecarModelClick(carModelData);
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
                  const carModelData = cellProps.row.original;
                  onClickDelete(carModelData);
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
      <CarBrandModel isOpen={modal1} toggle={toggleViewModal} data={carModelData} />
      <CarBrandDetail isOpen={modal1} toggle={toggleViewModal} Data={carModelData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletecarModel}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Models" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={carModels}
                    isGlobalFilter={true}
                    isAddCarModelOptions={true}
                    isEventAddButtonOptions={true}
                    handleAddCarModelClicks={handleAddCarModelClicks}
                    handleCarModelDeleteClicks={handleCarModelDeleteClicks}
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
          {!!isEdit ? "Edit Car Model" : "Add New Car Model"}
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
                    Model Name <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="modelName"
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
                        .modelName || ""
                    }
                    invalid={
                      validation.touched
                        .modelName &&
                        validation.errors
                          .modelName
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .modelName &&
                    validation.errors
                      .modelName ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .modelName
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <div className="mb-3">
                  <Label className="form-label">
                    Car Brand <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    type="select"
                    name="carBrand"
                    id="carBrand"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.carBrand}
                  >
                    <option value="">Select a Car Brand</option>
                    {carBrands?.map((carBrand, index) => (
                      <option key={index} value={carBrand._id}>
                        {carBrand.brandName}
                      </option>
                    ))}
                  </Input>

                  {validation.touched
                    .carBrand &&
                    validation.errors
                      .carBrand ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .carBrand
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                 <FormGroup className="mb-4" row>
                        <Label htmlFor="bodyType" className="col-form-label">
                            Body Type <span style={{color: 'red'}}>*</span>
                        </Label>
                        <Col>
                            <Input
                                type="select"
                                className="form-control"
                                name="bodyType"
                                id="bodyType"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bodyType}
                            >
                                <option value="">Select Body Type</option>
                                <option value="SUV">SUV</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Sedan">Sedan</option>
                                <option value="Compact-Suv">Compact Suv</option>
                                <option value="Compact-Sedan">Compact Sedan</option>
                                <option value="Convertible">Convertible</option>
                                <option value="Coupe">Coupe</option>
                                <option value="Station-Wegon">Station Wegon</option>
                                <option value="MuV">MUV</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Minivan">Minivan</option>
                                <option value="Truck">Truck</option>
                            </Input>
                        </Col>
                    </FormGroup>
                <div className="mb-3">
                  <Label className="form-label">
                    Description <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="description"
                    type="textarea"
                    validate={{
                      required: { value: true },
                    }}
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .description || ""
                    }
                    invalid={
                      validation.touched
                        .description &&
                        validation.errors
                          .description
                        ? true
                        : false
                    }
                  />
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
                    Year <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="year"
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
                        .year || ""
                    }
                    invalid={
                      validation.touched
                        .year &&
                        validation.errors
                          .year
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .year &&
                    validation.errors
                      .year ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .year
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
                <div className="mt-3 mb-3">
                  <Label for="cimg">Model Image <span style={{ color: 'red' }}>*</span></Label>
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
                    {isEdit ? <div className="d-flex text-center margin-auto"><img src={validation.values.modelImage} width={100} height={65} className="mt-3"/></div> : ""}
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-success save-user"
                    disabled={!validation.isValid || !validation.dirty}
                    onClick={() => {
                      validation.setFieldTouched(
                        "modelName",
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
CarModels.propTypes = {
  preGlobalFilteredRows: PropTypes.any,

};


export default CarModels;