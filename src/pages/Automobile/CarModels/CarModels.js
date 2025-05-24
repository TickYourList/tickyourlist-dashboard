import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import 'bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';
import Dropzone from "react-dropzone";
import { v4 as uuidv4 } from 'uuid';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';
import ColorPicker from "@vtaits/react-color-picker";
import { Status, ModelName, CarBrand, ModelId, Year } from "./CarModelsCol";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, UncontrolledTooltip, Card, CardBody, Modal, ModalHeader, ModalBody, Form, Label, Input, FormFeedback, NavItem, NavLink, FormGroup, TabContent, TabPane } from "reactstrap";
import Select from "react-select";
import { getCarBrands } from "store/automobiles/carbrands/actions";
import { addNewCarModel, deleteAllCarModels, deleteCarModel, getCarModels, updateCarModel } from "store/automobiles/carModels/actions";
import classnames from "classnames";
import CarModelDetail from "./CarModelDetail";
import { useFormik } from "formik";

const optionGroup = [
  {
    label: "Fuel Types",
    options: [
      { label: "Petrol", value: "Petrol" },
      { label: "Diesel", value: "Diesel" },
      { label: "CNG", value: "CNG" },
      { label: "Electric", value: "Electric" },
      { label: "Hybrid", value: "Hybrid" }
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
  document.title = "Car models | Scrollit";

  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [carModelsList, setCarModelsList] = useState([]);
  const [carModel, setCarModel] = useState(null);
  const [carModelData, setCarModelData] = useState({});
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [modelImage, setModelImage] = useState(null);
  const [activeTab, setactiveTab] = useState(1);
  const [activeTabVartical, setoggleTabVertical] = useState(1);
  const [passedSteps, setPassedSteps] = useState([1]);
  const [passedStepsVertical, setPassedStepsVertical] = useState([1]);
  const [colorRgb, setcolorRgb] = useState("red");
  const [simple_color1, setsimple_color1] = useState(0);
  const dispatch = useDispatch();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      modelName: carModel?.modelName || "",
      carBrand: carModel?.carBrand?._id || "",
      bodyType: carModel?.bodyType || "",
      description: carModel?.description || "",
      year: carModel?.year || "",
      minPrice: carModel?.priceRange?.minPrice || "",
      minPriceType: carModel?.priceRange?.minPriceType || "Lakhs",
      maxPrice: carModel?.priceRange?.maxPrice || "",
      maxPriceType: carModel?.priceRange?.maxPriceType || "Lakhs",
      status: carModel?.status ? 'Active' : 'InActive',
      budget: carModel?.budget || "",
      fuelType: convertArrayToSelectOptions(carModel?.fuelType) || [],
      mileage: carModel?.mileage || "",
      seatingCapacity: carModel?.seatingCapacity || "",
      transmissionType: convertArrayToSelectOptions(carModel?.transmissionType) || [],
      displacement: carModel?.displacement || "",
      modelImages: carModel?.media?.map(image => ({ ...image, preview: image.url })) || [],
      urlslug: carModel?.urlslug || '',
      keyFeatures: carModel?.keyFeatures || [{ id: 1, featureType: '', featureDescription: '', image: null }],
      exterior: carModel?.exterior || [{ id: 1, featureType: '', featureDescription: '', image: null }],
      interior: carModel?.interior || [{ id: 1, featureType: '', featureDescription: '', image: null }],
      imagesByColor: carModel?.imagesByColor || [{ id: 1, colorCode: "", colorDescription: "", image: null }],
      range: carModel?.range || "",
      power: carModel?.power || "",
      batteryCapacity: carModel?.batteryCapacity || "",
      chargingTimeDC: carModel?.chargingTimeDC || "",
      chargingTimeAC: carModel?.chargingTimeAC || "",
    },
    validationSchema: Yup.object({
      modelName: Yup.string().required("Please Enter Your Model Name"),
      carBrand: Yup.string().required("Please Enter Your Car Brand"),
      bodyType: Yup.string().required("Please Enter Your Body Type"),
      description: Yup.string().required("Please Enter Your Description"),
      status: Yup.string().required("Please Enter Your Status"),
      minPrice: Yup.number().required("Please Enter Your Min Price"),
      maxPrice: Yup.number().required("Please Enter Your Max Price"),
      budget: Yup.string().required("Please Enter Your Budget"),
      fuelType: Yup.array().of(Yup.mixed()).required("Please Select Fuel Types"),
      mileage: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value !== 'Electric'),
        then: () => Yup.string().required('Mileage is required for the vehicle'),
      }),
      seatingCapacity: Yup.string().required("Please Enter Seating Capacity"),
      transmissionType: Yup.array().of(Yup.mixed()).required("Please Select Transmission Types"),
      displacement: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value !== 'Electric'),
        then: () => Yup.string().required('Please enter the displacement'),
      }),
      modelImages: Yup.array().of(Yup.mixed()).required("Please Upload Images").min(1, 'At least one image is required'),
      urlslug: Yup.string().required("Please Enter URL Slug"),
      range: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value === 'Electric'),
        then: () => Yup.string().required('Range is required for electric vehicles'),
      }),
      power: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value === 'Electric'),
        then: () => Yup.string().required('Power is required for electric vehicles'),
      }),
      batteryCapacity: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value === 'Electric'),
        then: () => Yup.string().required('Battery capacity is required for electric vehicles'),
      }),
      chargingTimeDC: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value === 'Electric'),
        then: () => Yup.string().required('DC charging time is required for electric vehicles'),
      }),
      chargingTimeAC: Yup.string().when('fuelType', {
        is: (fuelType) => fuelType?.some(type => type.value === 'Electric'),
        then: () => Yup.string().required('AC charging time is required for electric vehicles'),
      }),
    }),
    onSubmit: values => {
      console.log("values ", values);
      const formData = new FormData();
      const priceRange = {
        minPrice: values.minPrice,
        minPriceType: values.minPriceType,
        maxPrice: values.maxPrice,
        maxPriceType: values.maxPriceType
      }
      const fuelType = convertBackToArray(values["fuelType"]);
      const transmisisonType = convertBackToArray(values["transmissionType"]);

      formData.append("modelName", values["modelName"]);
      formData.append("description", values["description"]);
      formData.append("bodyType", values["bodyType"]);
      formData.append("priceRange", JSON.stringify(priceRange));
      formData.append("budget", values["budget"]);
      formData.append("mileage", values["mileage"]);
      formData.append("seatingCapacity", values["seatingCapacity"]);
      formData.append("displacement", values["displacement"]);
      formData.append("year", values["year"]);
      formData.append("status", values["status"] === 'Active' ? true : false);
      formData.append("urlslug", values["urlslug"]);
      fuelType?.forEach(type => formData.append(`fuelType`, type));
      transmisisonType?.forEach(type => formData.append(`transmissionType`, type));

      if (values.fuelType?.some(type => type.value === 'Electric')) {
        formData.append('range', values.range);
        formData.append('power', values.power);
        formData.append('batteryCapacity', values.batteryCapacity);
        formData.append('chargingTimeDC', values.chargingTimeDC);
        formData.append('chargingTimeAC', values.chargingTimeAC);
      }

      values.modelImages.forEach((file, index) => {
        if (file.file instanceof File) {
          formData.append(`images`, file?.file);
        }
      });

      // Handle field data separately (text-based data)
      const keyFeaturesData = values.keyFeatures.map((feature) => ({
        featureType: feature.featureType,
        featureDescription: feature.featureDescription,
        image: feature.image || null
      }));

      const exteriorData = values.exterior.map((feature) => ({
        featureType: feature.featureType,
        featureDescription: feature.featureDescription,
        image: feature.image || null
      }));

      const interiorData = values.interior.map((feature) => ({
        featureType: feature.featureType,
        featureDescription: feature.featureDescription,
        image: feature.image || null
      }));

      const imagesByColorData = values.imagesByColor.map((color) => ({
        colorCode: color.colorCode,
        colorDescription: color.colorDescription,
        image: color.image || null
      }));

      // Convert text data to JSON and append to formData
      formData.append('keyFeaturesData', JSON.stringify(keyFeaturesData));
      formData.append('exteriorData', JSON.stringify(exteriorData));
      formData.append('interiorData', JSON.stringify(interiorData));
      formData.append('imagesByColorData', JSON.stringify(imagesByColorData));

      // Handle new image uploads
      values.keyFeatures.forEach((feature) => {
        if (feature.image instanceof File) {
          formData.append('keyFeatureImages', feature.image); // New image uploads
        }
      });

      values.exterior.forEach((feature) => {
        if (feature.image instanceof File) {
          formData.append('exteriorImages', feature.image); // New image uploads
        }
      });

      values.interior.forEach((feature) => {
        if (feature.image instanceof File) {
          formData.append('interiorImages', feature.image); // New image uploads
        }
      });

      values.imagesByColor.forEach((color) => {
        if (color.image instanceof File) {
          formData.append('colorImages', color.image); // New image uploads
        }
      });

      if (isEdit) {
        dispatch(updateCarModel(carModel._id, values['carBrand'], formData));
      } else {
        dispatch(addNewCarModel(values['carBrand'], formData));
      }

      // validation.resetForm();
    },
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
  }, [dispatch, carModels]);

  useEffect(() => {
    if (!isEmpty(carModels) && isEdit) {
      setCarModelsList(carModels);
      setIsEdit(false);
      setModal(false);
    }
  }, [carModels]);

  useEffect(() => {
    setCarModelsList(carModels);
  }, [carModels]);


  const resizeFile = file => {
    setModelImage(file);
  }

  function handleAcceptedFiles(newFiles) {
    if (newFiles.length > 5) {
      alert("You can only upload up to 5 images.");
      newFiles = newFiles.slice(0, 5);
    }

    const formattedFiles = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    validation.setFieldValue("modelImages", formattedFiles);
  }


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
    if (carModel?._id !== arg._id) { // Only update if the selected model is different
      setCarModel(arg);
      setIsEdit(true);
      toggle();
    }
  };

  function handleMultiFuelTypes(selectedMulti) {
    validation.setFieldValue('fuelType', selectedMulti)
  }

  function handleMultiTransmissions(selectedMulti) {
    validation.setFieldValue('transmissionType', selectedMulti)
  }

  function convertArrayToSelectOptions(array) {
    return array?.map(item => ({
      label: item,
      value: item
    }));
  }

  function convertBackToArray(optionGroup) {
    return optionGroup?.map(option => option.value);
  }

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
    validation.resetForm();
    toggle();
  };

  const handleCarModelDeleteClicks = () => {
    setCarModel();
    setDeleteModal(true);
  }

  function toggleTab(tab) {
    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab]
      if (tab >= 1 && tab <= 5) {
        setactiveTab(tab)
        setPassedSteps(modifiedSteps)
      }
    }
  }

  const onDragRgb = (color, index) => {
    handleColorChange(color, index);
  };

  function handleColorChange(color, index) {
    const updatedColors = validation.values.imagesByColor.map((colorItem, colorIndex) => {
      if (colorIndex === index) {
        return {
          ...colorItem,
          colorCode: color
        };
      }
      return colorItem;
    });
    validation.setFieldValue('imagesByColor', updatedColors);
  }

  function toggleTabVertical(tab) {
    if (activeTabVartical !== tab) {
      const modifiedSteps = [...passedStepsVertical, tab]
      if (tab >= 1 && tab <= 4) {
        setoggleTabVertical(tab)
        setPassedStepsVertical(modifiedSteps)
      }
    }
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
        Cell: (cellProps) => <ModelId {...cellProps} />
      },
      {
        Header: 'Model Name',
        accessor: 'modelName',
        filterable: true,
        Cell: (cellProps) => <ModelName {...cellProps} />
      },
      {
        Header: 'Car Brand',
        accessor: 'carBrand.brandName',
        filterable: true,
        Cell: (cellProps) => <CarBrand {...cellProps} />
      },
      {
        Header: 'Year',
        accessor: 'year',
        filterable: true,
        Cell: (cellProps) => <Year {...cellProps} />
      },
      {
        Header: 'Status',
        accessor: 'status',
        filterable: true,
        Cell: (cellProps) => <Status {...cellProps} />
      },
      {
        Header: 'View Model Details',
        accessor: 'view',
        disableFilters: true,
        Cell: (cellProps) => (
          <Button
            type="button"
            color="primary"
            className="btn-sm btn-rounded"
            onClick={() => {
              toggleViewModal();
              setCarModelData(cellProps.row.original);
            }}
          >
            View Model Details
          </Button>
        )
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: (cellProps) => (
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
        )
      }
    ],
    []
  );

  const getKeyFeatures = () => (
    <div>
      {validation.values.keyFeatures.map((feature, index) => (
        <Row key={feature.id}>
          <Col md="3">
            <FormGroup>
              <Label>Feature Type</Label>
              <Input
                type="text"
                name={`keyFeatures[${index}].featureType`}
                value={feature.featureType}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.keyFeatures?.[index]?.featureType && validation.errors.keyFeatures?.[index]?.featureType && (
                <FormFeedback type="invalid">
                  {validation.errors.keyFeatures[index].featureType}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Feature Description</Label>
              <Input
                type="text"
                name={`keyFeatures[${index}].featureDescription`}
                value={feature.featureDescription}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.keyFeatures?.[index]?.featureDescription && validation.errors.keyFeatures?.[index]?.featureDescription && (
                <FormFeedback type="invalid">
                  {validation.errors.keyFeatures[index].featureDescription}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label>Feature Image</Label>
              {feature.image && (
                <div className="mb-2">
                  <img src={feature.image.url || URL.createObjectURL(feature.image)} alt={feature.image.altText} style={{ width: '100px', height: '100px' }} />
                </div>
              )}
              <Input
                type="file"
                name={`keyFeatures[${index}].image`}
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  validation.setFieldValue(`keyFeatures[${index}].image`, file);
                }}
              />
              {validation.touched.keyFeatures?.[index]?.image && validation.errors.keyFeatures?.[index]?.image && (
                <FormFeedback type="invalid">
                  {validation.errors.keyFeatures[index].image}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="2" className="mt-auto mb-auto">
            <Button color="danger" onClick={() => handleRemoveFeature(feature)} style={{ marginTop: '0.7rem' }}>Remove Feature</Button>
          </Col>
        </Row>
      ))}
      <Button color="success" onClick={handleAddFeature}>Add Feature</Button>
    </div>
  )

  const getInteriorUI = () => (
    <div>
      {validation.values.interior?.map((interior, index) => (
        <Row key={interior.id}>
          <Col md="3">
            <FormGroup>
              <Label>Interior Type</Label>
              <Input
                type="text"
                name={`interior[${index}].featureType`}
                value={interior.featureType}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.interior?.[index]?.featureType && validation.errors.interior?.[index]?.featureType && (
                <FormFeedback type="invalid">
                  {validation.errors.interior[index].featureType}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Interior Description</Label>
              <Input
                type="text"
                name={`interior[${index}].featureDescription`}
                value={interior.featureDescription}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.interior?.[index]?.featureDescription && validation.errors.interior?.[index]?.featureDescription && (
                <FormFeedback type="invalid">
                  {validation.errors.interior[index].featureDescription}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label>Interior Image</Label>
              {interior.image && (
                <div className="mb-2">
                  <img src={interior.image.url || URL.createObjectURL(interior.image)} alt={interior.image.altText} style={{ width: '100px', height: '100px' }} />
                </div>
              )}
              <Input
                type="file"
                name={`interior[${index}].image`}
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  validation.setFieldValue(`interior[${index}].image`, file);
                }}
              />
              {validation.touched.interior?.[index]?.image && validation.errors.interior?.[index]?.image && (
                <FormFeedback type="invalid">
                  {validation.errors.interior[index].image}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="2" className="mt-auto mb-auto">
            <Button color="danger" onClick={() => handleRemoveInterior(interior.id)} style={{ marginTop: '0.7rem' }}>Remove Interior</Button>
          </Col>
        </Row>
      ))}
      <Button color="success" onClick={handleAddInterior}>Add more</Button>
    </div>
  )

  const getImagesByColorUI = () => (
    <div>
      {validation.values.imagesByColor?.map((imagesByColor, index) => (
        <Row key={imagesByColor.id}>
          <Col md="3">
            <FormGroup>
              <Label>Color Code</Label>
              <div
                className="input-group colorpicker-default"
                title="Using format option"
              >
                <input
                  readOnly
                  value={imagesByColor.colorCode}
                  name={`imagesByColor[${index}].colorCode`}
                  type="text"
                  className="form-control input-lg"
                  onChange={validation.handleChange}
                />
                <span className="input-group-append">
                  <span
                    className="input-group-text colorpicker-input-addon"
                    onClick={() => {
                      setsimple_color1(!simple_color1);
                    }}
                  >
                    <i
                      style={{
                        height: "16px",
                        width: "16px",
                        background: imagesByColor.colorCode
                      }}
                    />
                  </span>
                </span>
              </div>

              {simple_color1 ? (
                <ColorPicker
                  saturationHeight={100}
                  saturationWidth={100}
                  value={imagesByColor.colorCode}
                  onDrag={(color) => onDragRgb(color, index)}
                />
              ) : null}

              {validation.touched.imagesByColor?.[index]?.colorCode && validation.errors.imagesByColor?.[index]?.colorCode && (
                <FormFeedback type="invalid">
                  {validation.errors.imagesByColor[index].colorCode}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="3">
            <FormGroup>
              <Label>Color Description</Label>
              <Input
                type="text"
                name={`imagesByColor[${index}].colorDescription`}
                value={imagesByColor.colorDescription}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
              />
              {validation.touched.imagesByColor?.[index]?.colorDescription && validation.errors.imagesByColor?.[index]?.colorDescription && (
                <FormFeedback type="invalid">
                  {validation.errors.interior[index].colorDescription}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>

              <Label>Car Image</Label>
              {imagesByColor.image && (
                <div className="mb-2">
                  <img src={imagesByColor.image.url || URL.createObjectURL(imagesByColor.image)} alt={imagesByColor.image.altText} style={{ width: '100px', height: '100px' }} />
                </div>
              )}
              <Input
                type="file"
                name={`imagesByColor[${index}].image`}
                onChange={(event) => {
                  const file = event.currentTarget.files[0];
                  validation.setFieldValue(`imagesByColor[${index}].image`, file);
                }}
              />
              {validation.touched.imagesByColor && validation.touched.imagesByColor[index] && validation.touched.imagesByColor[index].image && validation.errors.imagesByColor && validation.errors.imagesByColor[index] && validation.errors.imagesByColor[index].image && (
                <FormFeedback type="invalid">
                  {validation.errors.imagesByColor[index].image}
                </FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md="2" className="mt-auto mb-auto">
            <Button color="danger" onClick={() => handleRemoveImageByColor(imagesByColor.id)} style={{ marginTop: '0.7rem' }}>Remove Color</Button>
          </Col>
        </Row>
      ))}
      <Button color="success" onClick={handleAddImageByColor}>Add more</Button>
    </div>
  );

  const getExteriorUI = () => {
    return (
      <div>
        {validation.values.exterior?.map((exterior, index) => (
          <Row key={exterior.id}>
            <Col md="3">
              <FormGroup>
                <Label>Exterior Type</Label>
                <Input
                  type="text"
                  name={`exterior[${index}].featureType`}
                  value={exterior.featureType}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                />
                {validation.touched.exterior && validation.touched.exterior[index] && validation.touched.exterior[index].featureType && validation.errors.exterior && validation.errors.exterior[index] && validation.errors.exterior[index].featureType && (
                  <FormFeedback type="invalid">
                    {validation.errors.exterior[index].featureType}
                  </FormFeedback>
                )}
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label>Exterior Description</Label>
                <Input
                  type="text"
                  name={`exterior[${index}].featureDescription`}
                  value={exterior.featureDescription}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                />
                {validation.touched.exterior && validation.touched.exterior[index] && validation.touched.exterior[index].featureDescription && validation.errors.exterior && validation.errors.exterior[index] && validation.errors.exterior[index].featureDescription && (
                  <FormFeedback type="invalid">
                    {validation.errors.exterior[index].featureDescription}
                  </FormFeedback>
                )}
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Exterior Image</Label>
                {exterior.image && (
                  <div className="mb-2">
                    <img src={exterior.image.url || URL.createObjectURL(exterior.image)} alt={exterior.image.altText} style={{ width: '100px', height: '100px' }} />
                  </div>
                )}
                <Input
                  type="file"
                  name={`exterior[${index}].image`}
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    validation.setFieldValue(`exterior[${index}].image`, file);
                  }}
                />
                {validation.touched.exterior && validation.touched.exterior[index] && validation.touched.exterior[index].image && validation.errors.exterior && validation.errors.exterior[index] && validation.errors.exterior[index].image && (
                  <FormFeedback type="invalid">
                    {validation.errors.exterior[index].image}
                  </FormFeedback>
                )}
              </FormGroup>
            </Col>
            <Col md="2" className="mt-auto mb-auto">
              <Button color="danger" onClick={() => handleRemoveExterior(exterior.id)} style={{ marginTop: '0.7rem' }}>Remove Exterior</Button>
            </Col>
          </Row>
        ))}
        <Button color="success" onClick={handleAddExterior}>Add more</Button>
      </div>
    );
  }

  const handleAddFeature = () => {
    const newFeature = {
      id: uuidv4(),  // Use UUID for unique identifier
      featureType: '',
      featureDescription: '',
      image: null,
      preview: '' // Placeholder for image preview
    };
    const updatedFeatures = [...validation.values.keyFeatures, newFeature];
    validation.setFieldValue('keyFeatures', updatedFeatures);
  };

  const handleRemoveFeature = feature => {
    const id = feature._id;
    const updatedFeatures = validation.values.keyFeatures.filter(feature => feature._id !== id);
    validation.setFieldValue('keyFeatures', updatedFeatures);
  };

  const handleAddExterior = () => {
    const newFeature = {
      id: uuidv4(),  // Use UUID for unique identifier
      featureType: '',
      featureDescription: '',
      image: null,
      preview: '' // Placeholder for image preview
    };
    const updatedFeatures = [...validation.values.exterior, newFeature];
    validation.setFieldValue('exterior', updatedFeatures);
  };

  const handleRemoveExterior = id => {
    const updatedFeatures = validation.values.exterior.filter(feature => feature.id !== id);
    validation.setFieldValue('exterior', updatedFeatures);
  };

  const handleAddInterior = () => {
    const newFeature = {
      id: uuidv4(),
      colorCode: '',
      colorDescription: '',
      image: null,
      preview: ''
    };
    const updatedFeatures = [...validation.values.interior, newFeature];
    validation.setFieldValue('interior', updatedFeatures);
  };

  const handleRemoveInterior = id => {
    const updatedFeatures = validation.values.interior.filter(feature => feature.id !== id);
    validation.setFieldValue('interior', updatedFeatures);
  };

  const handleAddImageByColor = () => {
    const newFeature = {
      id: uuidv4(),
      colorCode: '',
      colorDescription: '',
      image: null
    };
    const updatedFeatures = [...validation.values.imagesByColor, newFeature];
    validation.setFieldValue('imagesByColor', updatedFeatures);
  };

  const handleRemoveImageByColor = id => {
    const updatedFeatures = validation.values.imagesByColor.filter(feature => feature.id !== id);
    validation.setFieldValue('imagesByColor', updatedFeatures);
  };

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
      <Modal size="xl" isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle} tag="h4">
          {isEdit ? "Edit Car Model" : "Add New Car Model"}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="wizard clearfix">
                    <div className="steps clearfix">
                      <ul className="d-flex flex-row">
                        <NavItem
                          className={classnames({ current: activeTab === 1 })}
                        >
                          <NavLink
                            className={classnames({ current: activeTab === 1 })}
                            onClick={() => {
                              setactiveTab(1)
                            }}
                            disabled={!(passedSteps || []).includes(1)}
                          >
                            <span className="number">1.</span> Model Details
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 2 })}
                        >
                          <NavLink
                            className={classnames({ active: activeTab === 2 })}
                            onClick={() => {
                              setactiveTab(2)
                            }}
                            disabled={!(passedSteps || []).includes(2)}
                          >
                            <span className="number">2.</span> Key Features
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 3 })}
                        >
                          <NavLink
                            className={classnames({ active: activeTab === 3 })}
                            onClick={() => {
                              setactiveTab(3)
                            }}
                            disabled={!(passedSteps || []).includes(3)}
                          >
                            <span className="number">3.</span> Exterior
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 4 })}
                        >
                          <NavLink
                            className={classnames({ active: activeTab === 4 })}
                            onClick={() => {
                              setactiveTab(4)
                            }}
                            disabled={!(passedSteps || []).includes(4)}
                          >
                            <span className="number">4.</span> Interior
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({ current: activeTab === 5 })}
                        >
                          <NavLink
                            className={classnames({ active: activeTab === 5 })}
                            onClick={() => {
                              setactiveTab(5)
                            }}
                            disabled={!(passedSteps || []).includes(5)}
                          >
                            <span className="number">4.</span> Images By Color
                          </NavLink>
                        </NavItem>
                      </ul>
                    </div>
                    <div className="content clearfix">
                      <TabContent activeTab={activeTab} className="body">
                        <TabPane tabId={1}>
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
                                      <option value="2_seater">2 Seater</option>
                                      <option value="4_seater">4 Seater</option>
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
                                      Transmission Type <span style={{ color: 'red' }}>*</span>
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

                                {validation.values.fuelType?.some(type => type.value === 'Electric') ? (
                                  <>
                                    <Row>
                                      <Col className="mb-3">
                                        <Label className="form-label">
                                          Range (km) <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                          name="range"
                                          type="text"
                                          onChange={validation.handleChange}
                                          onBlur={validation.handleBlur}
                                          value={validation.values.range}
                                          invalid={validation.touched.range && validation.errors.range}
                                        />
                                        {validation.touched.range && validation.errors.range && (
                                          <FormFeedback type="invalid">
                                            {validation.errors.range}
                                          </FormFeedback>
                                        )}
                                      </Col>
                                      <Col className="mb-3">
                                        <Label className="form-label">
                                          Power (bhp) <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                          name="power"
                                          type="text"
                                          onChange={validation.handleChange}
                                          onBlur={validation.handleBlur}
                                          value={validation.values.power}
                                          invalid={validation.touched.power && validation.errors.power}
                                        />
                                        {validation.touched.power && validation.errors.power && (
                                          <FormFeedback type="invalid">
                                            {validation.errors.power}
                                          </FormFeedback>
                                        )}
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col className="mb-3">
                                        <Label className="form-label">
                                          Battery Capacity (kWh) <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                          name="batteryCapacity"
                                          type="text"
                                          onChange={validation.handleChange}
                                          onBlur={validation.handleBlur}
                                          value={validation.values.batteryCapacity}
                                          invalid={validation.touched.batteryCapacity && validation.errors.batteryCapacity}
                                        />
                                        {validation.touched.batteryCapacity && validation.errors.batteryCapacity && (
                                          <FormFeedback type="invalid">
                                            {validation.errors.batteryCapacity}
                                          </FormFeedback>
                                        )}
                                      </Col>
                                      <Col className="mb-3">
                                        <Label className="form-label">
                                          DC Charging Time <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                          name="chargingTimeDC"
                                          type="text"
                                          placeholder="e.g. 40Min-70kW-(10-80%)"
                                          onChange={validation.handleChange}
                                          onBlur={validation.handleBlur}
                                          value={validation.values.chargingTimeDC}
                                          invalid={validation.touched.chargingTimeDC && validation.errors.chargingTimeDC}
                                        />
                                        {validation.touched.chargingTimeDC && validation.errors.chargingTimeDC && (
                                          <FormFeedback type="invalid">
                                            {validation.errors.chargingTimeDC}
                                          </FormFeedback>
                                        )}
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col className="mb-3">
                                        <Label className="form-label">
                                          AC Charging Time <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                          name="chargingTimeAC"
                                          type="text"
                                          placeholder="e.g. 7.9H-7.2kW-(10-80%)"
                                          onChange={validation.handleChange}
                                          onBlur={validation.handleBlur}
                                          value={validation.values.chargingTimeAC}
                                          invalid={validation.touched.chargingTimeAC && validation.errors.chargingTimeAC}
                                        />
                                        {validation.touched.chargingTimeAC && validation.errors.chargingTimeAC && (
                                          <FormFeedback type="invalid">
                                            {validation.errors.chargingTimeAC}
                                          </FormFeedback>
                                        )}
                                      </Col>
                                    </Row>
                                  </>
                                ) : (

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
                                )}

                                <Row>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Url Slug <span style={{ color: 'red' }}>*</span>
                                    </Label>
                                    <Input
                                      name="urlslug"
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
                                          .urlslug || ""
                                      }
                                      invalid={
                                        validation.touched
                                          .urlslug &&
                                          validation.errors
                                            .urlslug
                                          ? true
                                          : false
                                      }
                                    />
                                    {validation.touched
                                      .urlslug &&
                                      validation.errors
                                        .urlslug ? (
                                      <FormFeedback type="invalid">
                                        {
                                          validation.errors
                                            .urlslug
                                        }
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
                          </Form>
                        </TabPane>
                        <TabPane tabId={2}>
                          <div>
                            {getKeyFeatures()}
                          </div>
                        </TabPane>
                        <TabPane tabId={3}>
                          <div>
                            {getExteriorUI()}
                          </div>
                        </TabPane>
                        <TabPane tabId={4}>
                          <div className="row justify-content-center">
                            {getInteriorUI()}
                          </div>
                        </TabPane>
                        <TabPane tabId={5}>
                          <div className="row justify-content-center">
                            {getImagesByColorUI()}
                          </div>
                        </TabPane>
                      </TabContent>
                    </div>
                    <div className="actions clearfix">
                      <ul>
                        <li
                          className={
                            activeTab === 1 ? "previous disabled" : "previous"
                          }
                        >
                          <Link
                            to="#"
                            onClick={() => {
                              toggleTab(activeTab - 1)
                            }}
                          >
                            Previous
                          </Link>
                        </li>
                        <li
                          className={activeTab === 5 ? "next d-none" : "next"}
                        >
                          <Link
                            to="#"
                            onClick={() => {
                              toggleTab(activeTab + 1)
                            }}
                          >
                            Next
                          </Link>
                        </li>
                        {activeTab === 5 && <li className={activeTab === 5 ? "next" : "next"}>
                          <Button
                            color="success"
                            className="mb-1"
                            disabled={!validation.isValid || !validation.dirty}
                            onClick={() => {
                              validation.handleSubmit();
                            }}
                          >
                            Save
                          </Button>
                        </li>
                        }
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
}
CarModels.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default CarModels;
