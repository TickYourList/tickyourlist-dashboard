import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';
import * as XLSX from "xlsx";

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';
import statesCitiesList from "../../../assets/helperJsonData/state-and-city.json";

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
} from "./CarVariantsCol";
import * as Yup from "yup";

//redux
import { useSelector, useDispatch } from "react-redux";

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
import { getCarBrands } from "store/automobiles/carbrands/actions";
import { useFormik } from "formik";
import CarVariantModel from "./CarVariantModel";
import { addNewCarVariant, addVariantData, deleteAllCarVariants, deleteCarVariant, getCarVariants, updateCarVariant } from "store/automobiles/carVariants/actions";
import CarVariantDetail from "./CarVariantDetail";
import CarVariantPricingModal from "./CarVariantPricingModal";
import CarVariantPricingViewModal from "./CarVariantPricingViewModal";

// Function to generate dynamic data fields array
const generateDataFields = (numOthersFields = 2) => {
  const baseFields = [
    "CarBrand",
    "BrandName",
    "CarModel",
    "ModelName",
    "CarVariant",
    "VariantName",
    "State",
    // "City",
    // "CityCode",
    "Ex-Showroom Price",
    "RTO",
    "Insurance",
  ];

  const othersFields = [];
  for (let i = 1; i <= numOthersFields; i++) {
    othersFields.push(`Others-Key-${i}`, `Others-Value-${i}`);
  }

  return [...baseFields, ...othersFields];
};

function CarVariants() {
  // Define number of "Others" fields
  const numOthersFields = 5; // Adjust this number as needed
  const dataFields = generateDataFields(numOthersFields);

  // Meta title
  document.title = "Car variants | Scrollit";

  // State declarations
  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [variantPricingModal, setVariantPricingModal] = useState(false);
  const [variantPricingViewModal, setVariantPricingViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [carVariantsList, setcarVariantsList] = useState([]);
  const [carVariant, setcarVariant] = useState(null);
  const [carVariantData, setcarVariantData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [variantImage, setvariantImage] = useState(null);
  const dispatch = useDispatch();
  const history = useNavigate();
  const toggleViewModal = () => setModal1(!modal1);
  const toggleVariantPricingModal = () => setVariantPricingModal(!variantPricingModal);
  const toggleVariantPricingViewModal = () => setVariantPricingViewModal(!variantPricingViewModal);

  const { carBrands, countries, carModels, carVariants } = useSelector(state => ({
    carBrands: state.CarBrand.carBrands,
    countries: state.CarBrand.countries,
    carModels: state.CarModel.carModels,
    carVariants: state.carVariant.carVariants
  }));

  // Form validation
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      modelName: (carVariant && carVariant.modelName) || "",
      carBrand: (carVariant && carVariant.carBrand && carVariant.carBrand._id) || "",
      description: (carVariant && carVariant.description) || "",
      year: (carVariant && carVariant.year) || "",
      status: (carVariant && carVariant.status ? 'Active' : 'InActive') || "",
    },
    validationSchema: Yup.object({
      modelName: Yup.string().required("Please Enter Your Brand Name"),
      carBrand: Yup.string().required("Please Enter Your CarBrand"),
      description: Yup.string().required("Please Enter Your description"),
      year: Yup.string().required("Please Enter Your Year"),
      status: Yup.string().required("Please Enter Your Status")
    }),
    onSubmit: values => {
      if (isEdit) {
        const updcarVariant = new FormData();
        updcarVariant.append("modelName", values["modelName"]);
        updcarVariant.append("description", values["description"]);
        updcarVariant.append("year", values["year"]);
        updcarVariant.append("status", values["status"] === 'Active' ? true : false);
        updcarVariant.append("image", variantImage ? variantImage : "broken!");
        dispatch(updateCarVariant(carVariant._id, values['carBrand'], updcarVariant));
        validation.resetForm();
      } else {
        const newcarVariant = new FormData();
        newcarVariant.append("modelName", values["modelName"]);
        newcarVariant.append("description", values["description"]);
        newcarVariant.append("year", values["year"]);
        newcarVariant.append("status", values["status"] === 'Active' ? true : false);
        newcarVariant.append("image", variantImage ? variantImage : "broken!");
        dispatch(addNewCarVariant(values['carBrand'], newcarVariant));
        validation.resetForm();
      }
      toggle();
    },
    handleError: e => { },
  });

  // Effect hooks
  useEffect(() => {
    if (carVariants && !carVariants.length) {
      dispatch(getCarBrands());
      dispatch(getCarVariants());
    }
  }, [dispatch]);

  useEffect(() => {
    setcarVariantsList(carVariants);
  }, [carVariants]);

  useEffect(() => {
    if (!isEmpty(carVariants) && !!isEdit) {
      setcarVariantsList(carVariants);
      setIsEdit(false);
    }
  }, [carVariants]);

  const resizeFile = file => {
    setvariantImage(file);
  }

  const toggle = () => {
    if (modal) {
      setModal(false);
      setcarVariant(null);
    } else {
      setModal(true);
    }
  };

  const handlecarVariantClick = arg => {
    const carVariant = arg;
    setcarVariant(carVariant);
    history(`/add-car-variant/${carVariant._id}`);
    toggle();
  };

  const onClickDelete = (carVariant) => {
    setcarVariant(carVariant);
    setDeleteModal(true);
  };

  const handleDeletecarVariant = () => {
    if (carVariant && carVariant._id) {
      dispatch(deleteCarVariant(carVariant));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllCarVariants());
      setDeleteModal(false);
    }
  };

  const handleAddcarVariantClicks = () => {
    history('/add-car-variant');
  };

  const handlecarVariantDeleteClicks = () => {
    setcarVariant();
    setDeleteModal(true);
  };

  const handleDownloadTemplateForVariantPricing = format => {
    console.log("carVariantData", format);
    const book = XLSX.utils.book_new();
    let newArray = [];

    // Generate template data for each state (state-level pricing)
    for (let state in statesCitiesList) {
      let arrayValue = [
        carVariantData?.carModel?.carBrand?._id ?? "",
        carVariantData?.carModel?.carBrand?.brandName ?? "",
        carVariantData?.carModel?._id ?? "",
        carVariantData?.carModel?.modelName ?? "",
        carVariantData?._id ?? "",
        carVariantData?.name ?? "",
        state,
        "", // Ex-Showroom Price
        "", // RTO
        "", // Insurance
        "", // Others-Key-1
        "", // Others-Value-1
        "", // Others-Key-2
        "", // Others-Value-2
        "", // Others-Key-3
        "", // Others-Value-3
        "", // Others-Key-4
        "", // Others-Value-4
        "", // Others-Key-5
        "", // Others-Value-5
      ];
      newArray.push(arrayValue);
    }

    const ws = XLSX.utils.aoa_to_sheet([dataFields, ...newArray]);
    XLSX.utils.book_append_sheet(book, ws, "CarVariant");
    XLSX.writeFile(book, `CarVariant Pricing Template.${format}`);
  };

  const saveVariantPricing = (variantId, tableData, toggle) => {
    dispatch(addVariantData(variantId, tableData, toggle))
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Variant ID',
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
        Header: 'Variant Name',
        accessor: 'name',
        filterable: true,
        Cell: (cellProps) => {
          return <ModelName {...cellProps} />;
        }
      },
      {
        Header: 'Car Model',
        accessor: 'carModel.modelName',
        filterable: true,
        Cell: (cellProps) => {
          return <ModelName {...cellProps} />;
        }
      },
      {
        Header: 'Car Brand',
        accessor: 'carModel.carBrand.brandName',
        filterable: true,
        Cell: (cellProps) => {
          return <CarBrand {...cellProps} />;
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
        Header: 'View Variant Details',
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
                setcarVariantData(cellProps.row.original);
              }}
            >
              View Variant Details
            </Button>);
        }
      },
      {
        Header: 'Connect/View Variant Pricing',
        accessor: 'connect',
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <>
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded me-2"
              onClick={e => {
                toggleVariantPricingModal();
                setcarVariantData(cellProps.row.original);
              }}
            >
              Connect Pricing
            </Button>
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded"
              onClick={e => {
                toggleVariantPricingViewModal();
                setcarVariantData(cellProps.row.original);
              }}
            >
              View List
            </Button>
            </>);
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
                to={`/edit-car-variant/${cellProps.row.original._id}`}
                className="text-success"
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
                  const carVariantData = cellProps.row.original;
                  onClickDelete(carVariantData);
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
      <CarVariantDetail isOpen={modal1} toggle={toggleViewModal} Data={carVariantData} />
      <CarVariantPricingModal
        isOpen={variantPricingModal}
        toggle={toggleVariantPricingModal}
        Data={carVariantData}
        handleDownloadTemplateForVariantPricing={handleDownloadTemplateForVariantPricing}
        saveVariantPricing={saveVariantPricing}
      />
      <CarVariantPricingViewModal
        isOpen={variantPricingViewModal}
        toggle={toggleVariantPricingViewModal}
        Data={carVariantData}
        // tableData={carVariantTableData}
      />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletecarVariant}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Variants" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={carVariants}
                    isGlobalFilter={true}
                    isAddcarVariantOptions={true}
                    isEventAddButtonOptions={true}
                    handleAddcarVariantClicks={handleAddcarVariantClicks}
                    handlecarVariantDeleteClicks={handlecarVariantDeleteClicks}
                    customPageSize={10}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

CarVariants.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default CarVariants;
