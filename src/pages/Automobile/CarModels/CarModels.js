import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';
import Dropzone from "react-dropzone";

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
import CarModelDetail from "./CarModelDetail";
import { getCarBrands } from "store/automobiles/carbrands/actions";
import { useFormik } from "formik";
import CarBrandModel from "./CarModelModel";
import { addNewCarModel, deleteAllCarModels, deleteCarModel, getCarModels, updateCarModel } from "store/automobiles/carModels/actions";

const optionGroup = [
  {
    label: "Fuel Types",
    options: [
      { label: "Petrol", value: "Petrol" },
      { label: "Diesel", value: "Diesel" },
      { label: "CNG", value: "CNG" },
      { label: "Electric", value: "Electric" },
      { label: "Hybrid", value: "Hybrid" }
      // Add other fuel types here if necessary
    ]
  }
];

const optionGroupTransmissionType = [
  {
    label: "Transmission Types",
    options: [
      { label: "Manual", value: "Manual" },
      { label: "Automatic", value: "Automatic" }
    ]
  }
];

function CarModels() {

  //meta title
  document.title = "Car models | Scrollit";

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
      modelName: (carModel && carModel?.modelName) || "",
      carBrand: (carModel && carModel?.carBrand && carModel?.carBrand?._id) || "",
      bodyType: (carModel && carModel?.bodyType) || "",
      description: (carModel && carModel?.description) || "",
      year: (carModel && carModel?.year) || "",
      minPrice: (carModel && carModel?.priceRange?.minPrice) || "",
      minPriceType: (carModel && carModel?.priceRange?.minPriceType) || "Lakhs",
      maxPrice: (carModel && carModel?.priceRange?.maxPrice) || "",
      maxPriceType: (carModel && carModel?.priceRange?.maxPriceType) || "Lakhs",
      status: (carModel && carModel?.status ? 'Active' : 'InActive') || "",
      budget: (carModel && carModel?.budget) || "",
      fuelType: (carModel && carModel?.fuelType && convertArrayToSelectOptions(carModel?.fuelType)) || [],
      mileage: (carModel && carModel?.mileage) || "",
      seatingCapacity: (carModel && carModel?.seatingCapacity) || "",
      transmissionType: (carModel && carModel?.transmissionType && convertArrayToSelectOptions(carModel?.transmissionType)) || [],
      displacement: (carModel && carModel?.displacement) || "",
      modelImages: (carModel && carModel?.media) || []
    },
    validationSchema: Yup.object({
      modelName: Yup.string().required("Please Enter Your Model Name"),
      carBrand: Yup.string().required("Please Enter Your Car Brand"),
      bodyType: Yup.string().required("Please Enter Your Body Type"),
      description: Yup.string().required("Please Enter Your Description"),
      // year: Yup.string().required("Please Enter Your Year"),
      // year: Yup.number().required("Please Enter Your Year").min(1900, "Year must be after 1900").max(new Date().getFullYear(), `Year must be before or equal to ${new Date().getFullYear()}`),
      status: Yup.string().required("Please Enter Your Status"),
      minPrice: Yup.number().required("Please Enter Your Min Price"),
      maxPrice: Yup.number().required("Please Enter Your Max Price"),
      // minPriceType: Yup.string().required("Please Enter Your Min Pice Type"),
      // maxPriceType: Yup.string().required("Please Enter Your Max Price Type"),
      budget: Yup.string().required("Please Enter Your Budget"),
      fuelType: Yup.array().of(Yup.mixed()).required("Please Select Fuel Types"),
      mileage: Yup.string().required("Please Enter Mileage"),
      seatingCapacity: Yup.string().required("Please Enter Seating Capacity"),
      transmissionType: Yup.array().of(Yup.mixed()).required("Please Select Transmission Types"),
      displacement: Yup.string().required("Please Enter Engine Displacement"),
      modelImages: Yup.array().of(Yup.mixed()).required("Please Upload Images").min(1, 'At least one image is required'),

    }),
    onSubmit: values => {
      if (isEdit) {
        const updCarModel = new FormData();
        const priceRange = {
          minPrice: values.minPrice,
          minPriceType: values.minPriceType,
          maxPrice: values.maxPrice,
          maxPriceType: values.maxPriceType
        }
        updCarModel.append("modelName", values["modelName"]);
        updCarModel.append("description", values["description"]);
        newCarModel.append("bodyType", values["bodyType"]);
        newCarModel.append("priceRange", JSON.stringify(priceRange));
        newCarModel.append("budget", values["budget"]);
        newCarModel.append("mileage", values["mileage"]);
        newCarModel.append("seatingCapacity", values["seatingCapacity"]);
        newCarModel.append("displacement", values["displacement"]);
        updCarModel.append("year", values["year"]);
        updCarModel.append("status", values["status"] === 'Active' ? true : false);
        updCarModel.append("images", modelImage ? modelImage : "broken!");
        fuelType?.forEach((type, index) => newCarModel.append(`fuelType`, type));
        transmisisonType?.forEach((type, index) => newCarModel.append(`transmissionType`, type));
        values.modelImages.forEach((file, index) => newCarModel.append(`images`, file));
        dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

        validation.resetForm();
      } else {
        const fuelType = convertBackToArray(values["fuelType"]);
        const transmisisonType = convertBackToArray(values["transmissionType"]);
        const newCarModel = new FormData();
        console.log('valuesdata ', values);
        newCarModel.append("modelName", values["modelName"]);
        newCarModel.append("bodyType", values["bodyType"]);
        newCarModel.append("description", values["description"]);
        newCarModel.append("year", values["year"]);
        newCarModel.append("priceRange", JSON.stringify({
          minPrice: values.minPrice,
          minPriceType: values.minPriceType,
          maxPrice: values.maxPrice,
          maxPriceType: values.maxPriceType
        }));
        newCarModel.append("budget", values["budget"]);
        newCarModel.append("mileage", values["mileage"]);
        newCarModel.append("seatingCapacity", values["seatingCapacity"]);
        newCarModel.append("displacement", values["displacement"]);
        newCarModel.append("status", values["status"] === 'Active' ? true : false);
        fuelType?.forEach((type, index) => newCarModel.append(`fuelType`, type));
        transmisisonType?.forEach((type, index) => newCarModel.append(`transmissionType`, type));
        values.modelImages.forEach((file, index) => newCarModel.append(`images`, file));

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

  function handleAcceptedFiles(newFiles) {
    let combinedFiles = [...validation.values.modelImages, ...newFiles];

    if (combinedFiles.length > 5) {
      alert("You can only upload up to 5 images");
      combinedFiles = combinedFiles.slice(0, 5); // Keep only the first 5 files
    }

    const formattedFiles = combinedFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    );

    validation.setFieldValue("modelImages", formattedFiles);
  }

  /**
* Formats the size
*/
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }


  const toggle = () => {
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

  function handleMultiFuelTypes(selectedMulti) {
    validation.setFieldValue('fuelType', selectedMulti)
  }

  function handleMultiTransmissions(selectedMulti) {
    validation.setFieldValue('transmissionType', selectedMulti)
  }

  function convertArrayToSelectOptions(array) {
    return array.map(item => ({
      label: item,
      value: item
    }));
  }


  function convertBackToArray(optionGroup) {
    return optionGroup?.map(option => option.value);
  }

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
      <CarModelDetail isOpen={modal1} toggle={toggleViewModal} Data={carModelData} />
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
      <Modal size="lg" isOpen={modal} toggle={toggle}>
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
                <Row>
                  <Col className="mb-3">
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

                  </Col>
                  <Col className="mb-3">
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
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup className="mb-4" row>
                      <Label htmlFor="bodyType" className="col-form-label">
                        Body Type <span style={{ color: 'red' }}>*</span>
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
                  </Col>

                  <Col className="mb-3">
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
                  </Col>
                </Row>
                <Row>
                  <Col className="mb-3">
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
                  </Col>
                  <Col className="mb-3">
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
                  </Col>
                </Row>

                <Row>
                  <Col md="3" className="mb-3">
                    <Label for="minPrice">Min Price <span style={{ color: 'red' }}>*</span></Label>
                    <Input
                      type="number"
                      name="minPrice"
                      id="minPrice"
                      placeholder="Enter minimum price"
                      value={validation.values.minPrice}
                      onChange={validation.handleChange}
                    />
                    {validation.touched
                      .minPrice &&
                      validation.errors
                        .minPrice ? (
                      <FormFeedback type="invalid">
                        {
                          validation.errors
                            .minPrice
                        }
                      </FormFeedback>
                    ) : null}
                  </Col>
                  <Col md="3" className="mb-3">
                    <Label for="minPriceType">Unit <span style={{ color: 'red' }}>*</span></Label>
                    <Input
                      type="select"
                      name="minPriceType"
                      id="minPriceType"
                      value={validation.values.minPriceType}
                      onChange={validation.handleChange}
                    >
                      <option value="lakhs">Lakhs</option>
                      <option value="crores">Crores</option>
                    </Input>
                  </Col>
                  <Col md="3" className="mb-3">
                    <Label for="maxPrice">Max Price <span style={{ color: 'red' }}>*</span></Label>
                    <Input
                      type="number"
                      name="maxPrice"
                      id="maxPrice"
                      placeholder="Enter maximum price"
                      value={validation.values.maxPrice}
                      onChange={validation.handleChange}
                    />
                    {validation.touched
                      .maxPrice &&
                      validation.errors
                        .maxPrice ? (
                      <FormFeedback type="invalid">
                        {
                          validation.errors
                            .maxPrice
                        }
                      </FormFeedback>
                    ) : null}
                  </Col>
                  <Col md="3" className="mb-3">
                    <Label for="maxPriceType">Unit <span style={{ color: 'red' }}>*</span></Label>
                    <Input
                      type="select"
                      name="maxPriceType"
                      id="maxPriceType"
                      value={validation.values.maxPriceType}
                      onChange={validation.handleChange}
                    >
                      <option value="lakhs">Lakhs</option>
                      <option value="crores">Crores</option>
                    </Input>
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Label className="form-label">
                      Budget <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="budget"
                      id="budget"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.budget}
                    >
                      <option value="">Select a Car Budget</option>
                      <option value="under_5">Under 5 Lakh</option>
                      <option value="under_10">Under 10 Lakh</option>
                      <option value="under_15">Under 15 Lakh</option>
                      <option value="under_20">Under 20 Lakh</option>
                      <option value="under_25">Under 25 Lakh</option>
                      <option value="under_30">Under 30 Lakh</option>
                      <option value="above_30">Above 30 Lakh</option>
                    </Input>

                    {validation.touched.budget && validation.errors.budget ? (
                      <FormFeedback type="invalid">
                        {validation.errors.budget}
                      </FormFeedback>
                    ) : null}
                  </Col>

                  <Col className="mb-3">
                    <Label className="form-label">
                      Fuel Type <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Select
                      value={validation.values.fuelType}
                      isMulti={true}
                      onChange={handleMultiFuelTypes}
                      options={optionGroup}
                      className="select2-selection"
                    />
                    {validation.touched
                      .fuelType &&
                      validation.errors
                        .fuelType ? (
                      <FormFeedback type="invalid">
                        {
                          validation.errors
                            .fuelType
                        }
                      </FormFeedback>
                    ) : null}
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Label className="form-label">
                      Seating Capacity <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="seatingCapacity"
                      id="seatingCapacity"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.seatingCapacity}
                    >
                      <option value="">Select seating capacity</option>
                      <option value="5_seater">5 Seater</option>
                      <option value="6_seater">6 Seater</option>
                      <option value="7_seater">7 Seater</option>
                      <option value="8_seater">8 Seater</option>
                    </Input>

                    {validation.touched.seatingCapacity && validation.errors.seatingCapacity ? (
                      <FormFeedback type="invalid">
                        {validation.errors.seatingCapacity}
                      </FormFeedback>
                    ) : null}
                  </Col>

                  <Col className="mb-3">
                    <Label className="form-label">
                      TransmissionType Type <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Select
                      value={validation.values.transmissionType}
                      isMulti={true}
                      onChange={handleMultiTransmissions}
                      options={optionGroupTransmissionType}
                      className="select2-selection"
                    />
                    {validation.touched
                      .transmissionType &&
                      validation.errors
                        .transmissionType ? (
                      <FormFeedback type="invalid">
                        {
                          validation.errors
                            .transmissionType
                        }
                      </FormFeedback>
                    ) : null}
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-3">
                    <Label className="form-label">
                      Mileage (kmpl) <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="mileage"
                      id="mileage"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.mileage}
                    >
                      <option value="">Select Mileage</option>
                      <option value="under_10">Under 10 kmpl</option>
                      <option value="10_15">10-15 kmpl</option>
                      <option value="above_15">15 kmpl and above</option>
                    </Input>

                    {validation.touched.mileage && validation.errors.mileage ? (
                      <FormFeedback type="invalid">
                        {validation.errors.mileage}
                      </FormFeedback>
                    ) : null}
                  </Col>

                  <Col className="mb-3">
                    <Label className="form-label">
                      Engine Displacement <span style={{ color: 'red' }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="displacement"
                      id="displacement"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.displacement}
                    >
                      <option value="">Select engine displacement</option>
                      <option value="below_1000">Below 1000cc Cars</option>
                      <option value="1000_1500">1000-1500cc Cars</option>
                      <option value="1500_2000">1500-2000cc Cars</option>
                      <option value="2000_3000">2000-3000cc Cars</option>
                      <option value="3000_4000">3000-4000cc Cars</option>
                      <option value="above_4000">Above 4000cc Cars</option>
                    </Input>

                    {validation.touched.displacement && validation.errors.displacement ? (
                      <FormFeedback type="invalid">
                        {validation.errors.displacement}
                      </FormFeedback>
                    ) : null}
                  </Col>

                </Row>

                <div className="mt-3 mb-3">
                  <Label for="cimg">Model Image <span style={{ color: 'red' }}>*</span></Label>
                  <div className="mh-50">
                    <Dropzone
                      onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles)}
                      style={{ width: '300px', height: '100px', border: '2px dashed #000' }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <div className="dropzone">
                          <div
                            className="dz-message needsclick mt-2"
                            {...getRootProps()}
                          >
                            <input {...getInputProps()} />
                            <div className="mb-3">
                              <i className="display-4 text-muted bx bxs-cloud-upload" />
                            </div>
                            <h4>Drop files here or click to upload.</h4>
                          </div>
                        </div>
                      )}
                    </Dropzone>

                    {validation.values.modelImages.length > 0 && (
                      <div className="dropzone-previews mt-3" id="file-previews">
                        {validation.values.modelImages.map((file, index) => (
                          <Card
                            className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                            key={index}
                          >
                            <div className="p-2">
                              <Row className="align-items-center">
                                <Col className="col-auto">
                                  <img
                                    height="80"
                                    className="avatar-sm rounded bg-light"
                                    alt={file.name}
                                    src={file.preview}
                                  />
                                </Col>
                                <Col>
                                  <Link to="#" className="text-muted font-weight-bold">
                                    {file.name}
                                  </Link>
                                  <p className="mb-0">
                                    <strong>{file.formattedSize}</strong>
                                  </p>
                                </Col>
                              </Row>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

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