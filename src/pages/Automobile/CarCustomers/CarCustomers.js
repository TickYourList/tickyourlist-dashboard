import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import {
} from "../../../store/e-commerce/actions";

import {
  CustomerId,
  CustomerName,
  CarBrand,
  CarModel,
  Status,
  ConnectionDate,
}
  from "./CarCustomersCol";
import * as Yup from "yup";
import * as XLSX from "xlsx";

//redux
import { useSelector, useDispatch } from "react-redux";
// import CarCustomerssModal from "./CarCustomerssModal";

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
import CarCustomerDetail from "./CarCustomerDetail";
import { addNewCarCustomer, deleteAllCarCustomers, deleteCarCustomer, getCarCustomers } from "store/automobiles/carCustomers/actions";
import { useFormik } from "formik";
import CarCustomerModel from "./CarCustomerModel";
import { getCarVariants } from "store/automobiles/carVariants/actions";
import { getCarModels } from "store/automobiles/carModels/actions";
import { getCarBrands } from "store/actions";

function CarCustomers() {

  //meta title
  document.title = "Car customers | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carCustomersList, setCarCustomersList] = useState([]);
  const [carCustomer, setCatCustomer] = useState(null);
  const [carCustomerData, setCatCustomerData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [customerImage, setCustomerImage] = useState(null)
  const [isCarBrandLoading, setIsCarBrandLoading] = useState(true);
  const [isCarModelLoading, setIsCarModelLoading] = useState(true);

  const dispatch = useDispatch();

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      customerName: (carCustomer && carCustomer.customerName) || "",
      carBrand: (carCustomer && carCustomer.carBrand) || "",
      carModel: (carCustomer && carCustomer.carModel) || "",
      status: (carCustomer && carCustomer.status ? 'Active' : 'InActive') || "",
      customerDescription: (carCustomer && carCustomer.customerDescription) || "",
      customerImage: (carCustomer && carCustomer.customerImage) || ""
    },
    validationSchema: Yup.object({
      customerName: Yup.string().required(
        "Please Enter Your Customer Name"
      ),
      carBrand: Yup.string().required(
        "Please Enter Your Car Brand"
      ),
      carModel: Yup.string().required(
        "Please Enter Your Car Model"
      ),
      // carVariant: Yup.string().required(
      //   "Please Enter Your Car Model"
      // ),
      customerDescription: Yup.string().required(
        "Please Enter Your Car Model"
      ),
      customerImage: Yup.object().required(
        "Please Enter Your Customer Image"
      ),
      status: Yup.string().required(
        "Please Enter Your Status"
      )
    }),
    onSubmit: values => {
      const newCarCustomer = new FormData();
      const customerData = {
        customerName: values.customerName,
        carBrand: values.carBrand,
        carModel: values.carModel,
        customerDescription: values.customerDescription,
        status: values.status
      };
      newCarCustomer.append("data", JSON.stringify(customerData));
      if (values.customerImage) {
        newCarCustomer.append("image", values.customerImage);
      }
      dispatch(addNewCarCustomer(newCarCustomer));
      validation.resetForm();
      toggle();
    },
    handleError: e => { },
  });

  const toggleViewModal = () => setModal1(!modal1);

  const { carCustomers, carModels, carBrands, carVariants } = useSelector(state => ({
    carCustomers: state.CarCustomer.carCustomers,
    carModels: state.CarCustomer.carModels,
    carBrands: state.CarBrand.carBrands,
    carVariants: state.carVariant.carVariants
  }));

  useEffect(() => {
    if (carCustomers && !carCustomers.length) {
      dispatch(getCarCustomers());
      dispatch(getCarVariants());
      setIsCarBrandLoading(true);
      dispatch(getCarBrands());
    }
  }, [dispatch]);

  useEffect(() => {
    setCarCustomersList(carCustomers);
  }, [carCustomers]);

  useEffect(() => {
    if (!isEmpty(carCustomers) && !!isEdit) {
      setCarCustomersList(carCustomers);
      setIsEdit(false);
    }
  }, [carCustomers]);

  useEffect(() => {
    if (carModels && carModels.length > 0) {
      setIsCarModelLoading(false);
    }
  }, [carModels])

  const resizeFile = file => {
    // setCustomerImage(file);
    validation.setFieldValue('customerImage', file);
  }

  const toggle = () => {
    if (modal) {
      setModal(false);
      setCatCustomer(null);
    } else {
      setModal(true);
    }
  };

  const handleCarBrandChange = (selectedBrandId) => {
    // setIsCarModelLoading(true);
    validation.setFieldValue("carBrand", selectedBrandId);
    validation.setFieldValue("carModel", ""); // Reset car model value
  };

  //delete carCustomer
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleNested = () => {
    setNestedModal(!nestedModal);
    setCloseAll(false);
  };

  const toggleAll = () => {
    setNestedModal(!nestedModal);
    setCloseAll(true);
  };

  const onClickDelete = (carCustomer) => {
    setCatCustomer(carCustomer);
    setDeleteModal(true);
  };

  const handleDeletecarCustomer = () => {
    if (carCustomer && carCustomer._id) {
      dispatch(deleteCarCustomer(carCustomer));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllCarCustomers(carCustomer));
      setDeleteModal(false);
    }
  };
  const handleAddCarCustomerClicks = () => {
    setCarCustomersList("");
    setIsEdit(false);
    toggle();
  };

  const handleCarCustomerDeleteClicks = () => {
    setCatCustomer();
    setDeleteModal(true);
  }

  const handleCarCustomerExportClicks = () => {
    if (carCustomersList.length === 0) {
      setToastDetails({ title: "No Data", message: "No car customer data to export" });
      setToast(true);
      return;
    }
  
    // Prepare data for Excel
    const data = carCustomersList.map(customer => ({
      "Customer ID": customer._id,
      "Customer Name": customer.username,
      "Phone Number": customer.phone,
      "City": customer?.city,
      "Buying Period": customer?.buyingPeriod,
      "Usage": customer?.usage,
      "Car Brand": customer.carBrand ? customer.carBrand.brandName : '',
      "Car Model": customer.carModel ? customer.carModel.modelName : '',
      "Car Variant": customer?.carVariant?.name ?? '',
      "Joining Date": customer.joiningDate
    }));
  
    // Convert JSON to Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Create a new Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Car Customers");
  
    // Export to Excel file
    XLSX.writeFile(workbook, "car_customers.xlsx");
  
    setToastDetails({ title: "Export Successful", message: "Car customer data has been exported successfully" });
    setToast(true);
  };

  const columns = useMemo(
    () => [

      {
        Header: 'Customer ID',
        accessor: '_id',
        width: '150px',
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: (cellProps) => {
          return <CustomerId {...cellProps} />;
        }
      },
      {
        Header: 'Customer Name',
        accessor: 'username',
        filterable: true,
        Cell: (cellProps) => {
          return <CustomerName {...cellProps} />;
        }
      },
      {
        Header: 'Phone Number',
        accessor: 'phone',
        filterable: true,
        Cell: (cellProps) => {
          return <CustomerName {...cellProps} />;
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
        Header: 'Car Model',
        accessor: 'carModel.modelName',
        filterable: true,
        Cell: (cellProps) => {
          return <CarModel {...cellProps} />;
        }
      },
      {
        Header: 'Connection Date',
        accessor: 'joiningDate',
        filterable: true,
        Cell: (cellProps) => {
          return <ConnectionDate {...cellProps} />;
        }
      },
      {
        Header: 'View Customers',
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
                setCatCustomerData(cellProps.row.original);
              }}
            >
              View Customer Details
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
                className="text-danger"
                onClick={() => {
                  const carCustomerData = cellProps.row.original;
                  onClickDelete(carCustomerData);
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
      <CarCustomerDetail isOpen={modal1} toggle={toggleViewModal} Data={carCustomerData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletecarCustomer}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Customers" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={carCustomers}
                    isGlobalFilter={true}
                    isAddCarCustomerOptions={true}
                    isEventAddButtonOptions={true}
                    handleCarCustomerDeleteClicks={handleCarCustomerDeleteClicks}
                    handleCarCustomerExportClicks={handleCarCustomerExportClicks}
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
          {!!isEdit ? "Edit Car customer" : "Add New Car Customer"}
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
                    Customer Name <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="customerName"
                    id="customerName"
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
                        .customerName || ""
                    }
                    invalid={
                      validation.touched
                        .customerName &&
                        validation.errors
                          .customerName
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .customerName &&
                    validation.errors
                      .customerName ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .customerName
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <FormGroup>
                  <Label for="carBrand">Car Brand <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    type="select"
                    name="carBrand"
                    id="carBrand"
                    onChange={e => handleCarBrandChange(e.target.value)}
                    value={validation.values.carBrand}
                  >
                    {/* {isCarBrandLoading ? (
                      <option>Loading...</option>
                    ) : (
                      <> */}
                    <option value="">Select a Brand</option>
                    {carBrands.map(brand => (
                      <option key={brand._id} value={brand._id}>{brand.brandName}</option>
                    ))}
                    {/* </> */}
                    {/* )} */}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="carModel">Car Model <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    type="select"
                    name="carModel"
                    id="carModel"
                    onChange={validation.handleChange}
                    value={validation.values.carModel}
                    disabled={isCarModelLoading}
                  >
                    {isCarModelLoading ? (
                      <option>Loading...</option>
                    ) : (
                      <>
                        <option value="">Select a Model</option>
                        {carModels.map(model => (
                          <option key={model._id} value={model._id}>{model.modelName}</option>
                        ))}
                      </>
                    )}
                  </Input>
                </FormGroup>

                <div className="mb-3">
                  <Label className="form-label">
                    Customer Description <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <textarea
                    className="form-control"
                    name="customerDescription"
                    id="customerDescription"
                    placeholder="Enter your Customer Description"
                    rows="10"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.customerDescription}
                  ></textarea>
                  {validation.touched
                    .customerDescription &&
                    validation.errors
                      .customerDescription ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .customerDescription
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
                  <Label for="cimg">Customer Image <span style={{ color: 'red' }}>*</span></Label>
                  <div className="mh-50">
                    <Input
                      id="customerImage"
                      onChange={(e) => { validation.setFieldValue('customerImage', e) }}
                      type="file"
                    />
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
                    disabled={!(validation.isValid)}
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
CarCustomers.propTypes = {
  preGlobalFilteredRows: PropTypes.any,

};


export default CarCustomers;