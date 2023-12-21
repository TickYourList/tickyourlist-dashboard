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
  ModelName,
  CarBrand,
  ModelId,
  Year,
}
  from "./CarVariantsCol";
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
import CarBrandDetail from "./CarVariantDetail";
import { getCarBrands } from "store/automobiles/carbrands/actions";
import { useFormik } from "formik";
import CarVariantModel from "./CarVariantModel";
import { addNewCarVariant, deleteAllCarVariants, deleteCarVariant, getCarVariants, updateCarVariant } from "store/automobiles/carVariants/actions";

function CarVariants() {

  //meta title
  document.title = "Car brands | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carVariantsList, setcarVariantsList] = useState([]);
  const [carVariant, setcarVariant] = useState(null);
  const [carVariantData, setcarVariantData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [variantImage, setvariantImage] = useState(null)
  const dispatch = useDispatch();
  const history = useNavigate();

  // // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      modelName: (carVariant && carVariant.modelName) || "",
      carBrand: (carVariant && carVariant.carBrand && carVariant.carBrand._id) || "",
      description: (carVariant && carVariant.description) || "",
      year: (carVariant && carVariant.year) || "",
      status: (carVariant && carVariant.status ? 'Active' : 'InActive') || "",
    },
    validationSchema: Yup.object({
      modelName: Yup.string().required(
        "Please Enter Your Brand Name"
      ),
      carBrand: Yup.string().required(
        "Please Enter Your CarBrand"
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

  const toggleViewModal = () => setModal1(!modal1);

  const { carBrands, countries, carModels, carVariants } = useSelector(state => ({
    carBrands: state.CarBrand.carBrands,
    countries: state.CarBrand.countries,
    carModels: state.CarModel.carModels,
    carVariants: state.carVariant.carVariants
  }));

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
    setIsEdit(true);

    toggle();
  };

  //delete carBrand
  const [deleteModal, setDeleteModal] = useState(false);

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
    // setcarVariantsList("");
    // setIsEdit(false);
    // toggle();
    history('/add-car-variant');
  };

  const handlecarVariantDeleteClicks = () => {
    setcarVariant();
    setDeleteModal(true);
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
                setcarVariantData(cellProps.row.original);
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
                  const carVariantData = cellProps.row.original;
                  handlecarVariantClick(carVariantData);
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
      <CarVariantModel isOpen={modal1} toggle={toggleViewModal} data={carVariantData} />
      <CarBrandDetail isOpen={modal1} toggle={toggleViewModal} Data={carVariantData} />
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