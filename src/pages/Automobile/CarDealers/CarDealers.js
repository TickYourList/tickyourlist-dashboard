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
    DealerId,
    DealerName,
    CarBrand,
    CarModel,
    Status,
    ConnectionDate,
}
    from "./CarDealersCol";
import * as Yup from "yup";

//redux
import { useSelector, useDispatch } from "react-redux";
// import CarDealersModal from "./CarDealersModal";

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
import CarDealerDetail from "./CarDealerDetail";
import { addNewCarDealer, deleteAllCarDealers, deleteCarDealer, getCarDealers, updateCarDealer } from "store/automobiles/carDealers/actions";
import { useFormik } from "formik";
import { getCarVariants } from "store/automobiles/carVariants/actions";
import { getCarModels } from "store/automobiles/carModels/actions";
import { getCarBrands } from "store/actions";
// import statesAndDistricts from '../../../assets/helperJsonData/states-and-districts.json';
import statesCitiesList from "../../../assets/helperJsonData/state-and-city.json";

function CarDealers() {

    //meta title
    document.title = "Car dealers | Scrollit";

    const [modal, setModal] = useState(false);
    const [nestedModal, setNestedModal] = useState(false);
    const [modal1, setModal1] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [carDealersList, setCarDealersList] = useState([]);
    const [carDealer, setCarDealer] = useState(null);
    const [carDealerData, setCarDealerData] = useState({});
    const [closeAll, setCloseAll] = useState(false);
    const [toast, setToast] = useState(false);
    const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
    const [dealerImage, setDealerImage] = useState(null)
    const [isCarBrandLoading, setIsCarBrandLoading] = useState(true);
    const [isCarDealerLoading, setIsCarDealerLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState([]);
    // State for the selected city and city options
    const [selectedCity, setSelectedCity] = useState(null);
    const [cityOptions, setCityOptions] = useState([]);


    const dispatch = useDispatch();

    // validation
    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            dealerName: (carDealer && carDealer.dealerName) || "",
            email: (carDealer && carDealer.email) || "",
            phoneNumber: (carDealer && carDealer.phoneNumber) || "",
            state: (carDealer && carDealer.state) || "",
            city: (carDealer && carDealer.city) || "",
            cityId: carDealer?.cityId || '',
            carBrand: (carDealer && carDealer.carBrand?._id) || "",
            address: (carDealer && carDealer.address) || "",
            status: (carDealer && carDealer.status ? 'Active' : 'InActive') || "",
            dealerDescription: (carDealer && carDealer.description) || "",
        },
        validationSchema: Yup.object({
            dealerName: Yup.string().required(
                "Please Enter Your Dealer Name"
            ),
            address: Yup.string().required(
                "Please Enter Your Address"
            ),
            state: Yup.string().required(
                "Please Enter Your State"
            ),
            city: Yup.string().required(
                "Please Enter Your City"
            ),
            email: Yup.string().required(
                "Please Enter Your Email"
            ),
            phoneNumber: Yup.number().required(
                "Please Enter Your Phone Number"
            ),
            carBrand: Yup.string().required(
                "Please Enter Your Car Brand"
            ),
            dealerDescription: Yup.string().required(
                "Please Enter Your Car Description"
            ),
            status: Yup.string().required(
                "Please Enter Your Status"
            )
        }),
        onSubmit: values => {
            if (isEdit) {
                const dealerData = {
                    dealerName: values.dealerName,
                    carBrand: values.carBrand,
                    description: values.dealerDescription,
                    address: values.address,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    state: values.state,
                    city: values.city,
                    cityId: values?.cityId,
                    status: values.status === 'Active' ? true : false
                };
                dispatch(updateCarDealer(carDealer._id, dealerData));
                validation.resetForm();
                toggle();
            } else {
                const dealerData = {
                    dealerName: values.dealerName,
                    carBrand: values.carBrand,
                    description: values.dealerDescription,
                    address: values.address,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    state: values.state,
                    city: values.city,
                    cityId: values.cityId,
                    status: values.status === 'Active' ? true : false
                };
                dispatch(addNewCarDealer(dealerData));
                validation.resetForm();
                toggle();
            }
        },
        handleError: e => { },
    });


    const toggleViewModal = () => setModal1(!modal1);

    const { carDealers, carModels, carBrands, carVariants } = useSelector(state => ({
        carDealers: state.CarDealer.carDealers,
        carModels: state.CarDealer.carModels,
        carBrands: state.CarBrand.carBrands,
        carVariants: state.carVariant.carVariants
    }));

    useEffect(() => {
        if (carDealers && !carDealers.length) {
            dispatch(getCarDealers());
            dispatch(getCarVariants());
            setIsCarBrandLoading(true);
            dispatch(getCarBrands());
        }
    }, [dispatch]);

    useEffect(() => {
        setCarDealersList(carDealers);
    }, [carDealers]);

    useEffect(() => {
        if (!isEmpty(carDealers) && !!isEdit) {
            setCarDealersList(carDealers);
            setIsEdit(false);
        }
    }, [carDealers]);

    useEffect(() => {
        if (carModels && carModels.length > 0) {
            setIsCarDealerLoading(false);
        }
    }, [carModels])

    const toggle = () => {
        if (modal) {
            setModal(false);
            setCarDealer(null);
        } else {
            setModal(true);
        }
    };

    const handleCarBrandChange = (selectedBrandId) => {
        // setIsCarDealerLoading(true);
        validation.setFieldValue("carBrand", selectedBrandId);
        validation.setFieldValue("carModel", ""); // Reset car model value
    };

    // Function to handle state selection change
    const handleStateChange = (selectedState) => {
        console.log('selectedState ', selectedState);
        setSelectedState(selectedState);
        const citiesArray = statesCitiesList[selectedState] || [];
        setCities(citiesArray); // Directly setting city objects
        validation.setFieldValue('state', selectedState);
        validation.setFieldValue('cityId', ''); // Reset city ID when state changes
    };

    // Now updates formik to use city ID
    const handleCityChange = (event) => {
        const { value } = event.target;
        const cityObj = cities.find(city => city.id === value); // Find the city object based on the id
        const cityName = cityObj ? cityObj.city : ''; // Extract the city name

        validation.setFieldValue('city', cityName);
        validation.setFieldValue('cityId', value);
        // Additional logic can be placed here if needed
    };


    //delete carDealer
    const [deleteModal, setDeleteModal] = useState(false);

    const toggleNested = () => {
        setNestedModal(!nestedModal);
        setCloseAll(false);
    };

    const toggleAll = () => {
        setNestedModal(!nestedModal);
        setCloseAll(true);
    };

    const onClickDelete = (carDealer) => {
        setCarDealer(carDealer);
        setDeleteModal(true);
    };

    const handleDeletecarDealer = () => {
        if (carDealer && carDealer._id) {
            dispatch(deleteCarDealer(carDealer));
            setDeleteModal(false);
        } else {
            dispatch(deleteAllCarDealers());
            setDeleteModal(false);
        }
    };
    const handleAddCarDealerClicks = () => {
        setCarDealersList("");
        setIsEdit(false);
        toggle();
    };

    const handleCarDealerDeleteClicks = () => {
        setCarDealer();
        setDeleteModal(true);
    }

    const handlecarDealerClick = arg => {
        const carDealer = arg;
        setCarDealer(carDealer);
        setIsEdit(true);

        toggle();
    };

    const columns = useMemo(
        () => [

            {
                Header: 'Dealer ID',
                accessor: '_id',
                width: '150px',
                style: {
                    textAlign: "center",
                    width: "10%",
                    background: "#0000",
                },
                filterable: true,
                Cell: (cellProps) => {
                    return <DealerId {...cellProps} />;
                }
            },
            {
                Header: 'Dealer Name',
                accessor: 'dealerName',
                filterable: true,
                Cell: (cellProps) => {
                    return <DealerName {...cellProps} />;
                }
            },
            {
                Header: 'Phone Number',
                accessor: 'phoneNumber',
                filterable: true,
                Cell: (cellProps) => {
                    return <DealerName {...cellProps} />;
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
                Header: 'Email',
                accessor: 'email',
                filterable: true,
                Cell: (cellProps) => {
                    return <CarBrand {...cellProps} />;
                }
            },
            {
                Header: 'View Dealers',
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
                                setCarDealerData(cellProps.row.original);
                            }}
                        >
                            View Dealer Details
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
                                    const carDealerData = cellProps.row.original;
                                    handlecarDealerClick(carDealerData);
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
                                    const carDealerData = cellProps.row.original;
                                    onClickDelete(carDealerData);
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
            <CarDealerDetail isOpen={modal1} toggle={toggleViewModal} Data={carDealerData} />
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDeletecarDealer}
                onCloseClick={() => setDeleteModal(false)}
            />
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Dealers" />
                    <Row>
                        <Col xs="12">
                            <Card>
                                <CardBody>
                                    <TableContainer
                                        columns={columns}
                                        data={carDealers}
                                        isGlobalFilter={true}
                                        isAddCarDealerOptions={true}
                                        isEventAddButtonOptions={true}
                                        handleAddCarDealerClicks={handleAddCarDealerClicks}
                                        handleCarDealerDeleteClicks={handleCarDealerDeleteClicks}
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
                    {!!isEdit ? "Edit Car dealer" : "Add New Car Dealer"}
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
                                        Dealer Name <span style={{ color: 'red' }}>*</span>
                                    </Label>
                                    <Input
                                        name="dealerName"
                                        id="dealerName"
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
                                                .dealerName || ""
                                        }
                                        invalid={
                                            validation.touched
                                                .dealerName &&
                                                validation.errors
                                                    .dealerName
                                                ? true
                                                : false
                                        }
                                    />
                                    {validation.touched
                                        .dealerName &&
                                        validation.errors
                                            .dealerName ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .dealerName
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </div>
                                <Col className="col-12">
                                    <div className="mb-3">
                                        <Label className="form-label">
                                            Address <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Input
                                            name="address"
                                            id="address"
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
                                                    .address || ""
                                            }
                                            invalid={
                                                validation.touched
                                                    .address &&
                                                    validation.errors
                                                        .address
                                                    ? true
                                                    : false
                                            }
                                        />
                                        {validation.touched
                                            .address &&
                                            validation.errors
                                                .address ? (
                                            <FormFeedback type="invalid">
                                                {
                                                    validation.errors
                                                        .address
                                                }
                                            </FormFeedback>
                                        ) : null}
                                    </div>
                                </Col>
                                {/* State Selection */}
                                <Col className="col-12 row">
                                    <Col className="col">
                                        <FormGroup>
                                            <Label for="state">State <span style={{ color: 'red' }}>*</span></Label>
                                            <Input type="select" name="state" id="state" value={validation.values.state} onChange={(e) => handleStateChange(e.target.value)}>
                                                <option value="">Select State</option>
                                                {Object.keys(statesCitiesList).map((stateName, index) => (
                                                    <option key={index} value={stateName}>{stateName}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col className="col">
                                        <FormGroup>
                                            <Label for="city">City <span style={{ color: 'red' }}>*</span></Label>
                                            <Input type="select" name="cityId" id="city" value={validation.values.cityId} onChange={handleCityChange} disabled={!selectedState}>
                                                <option value="">Select City</option>
                                                {cities.map((cityObj, index) => (
                                                    <option key={index} value={cityObj.id}>{cityObj.city}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Col>

                                <Col className="col-12 row">
                                    <Col className="col">
                                        <div className="mb-3">
                                            <Label className="form-label">
                                                Email <span style={{ color: 'red' }}>*</span>
                                            </Label>
                                            <Input
                                                name="email"
                                                id="email"
                                                type="email"
                                                validate={{
                                                    required: { value: true },
                                                }}
                                                onChange={
                                                    validation.handleChange
                                                }
                                                onBlur={validation.handleBlur}
                                                value={
                                                    validation.values
                                                        .email || ""
                                                }
                                                invalid={
                                                    validation.touched
                                                        .email &&
                                                        validation.errors
                                                            .email
                                                        ? true
                                                        : false
                                                }
                                            />
                                            {validation.touched
                                                .email &&
                                                validation.errors
                                                    .email ? (
                                                <FormFeedback type="invalid">
                                                    {
                                                        validation.errors
                                                            .email
                                                    }
                                                </FormFeedback>
                                            ) : null}
                                        </div>
                                    </Col>
                                    <Col className="col">
                                        <div className="mb-3">
                                            <Label className="form-label">
                                                Phone Number <span style={{ color: 'red' }}>*</span>
                                            </Label>
                                            <Input
                                                name="phoneNumber"
                                                id="phoneNumber"
                                                type="number"
                                                validate={{
                                                    required: { value: true },
                                                }}
                                                onChange={
                                                    validation.handleChange
                                                }
                                                onBlur={validation.handleBlur}
                                                value={
                                                    validation.values
                                                        .phoneNumber || ""
                                                }
                                                invalid={
                                                    validation.touched
                                                        .phoneNumber &&
                                                        validation.errors
                                                            .phoneNumber
                                                        ? true
                                                        : false
                                                }
                                            />
                                            {validation.touched
                                                .phoneNumber &&
                                                validation.errors
                                                    .phoneNumber ? (
                                                <FormFeedback type="invalid">
                                                    {
                                                        validation.errors
                                                            .phoneNumber
                                                    }
                                                </FormFeedback>
                                            ) : null}
                                        </div>
                                    </Col>
                                </Col>
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

                                <div className="mb-3">
                                    <Label className="form-label">
                                        Description <span style={{ color: 'red' }}>*</span>
                                    </Label>
                                    <textarea
                                        className="form-control"
                                        name="dealerDescription"
                                        id="dealerDescription"
                                        placeholder="Enter your Dealer Description"
                                        rows="10"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.dealerDescription}
                                    ></textarea>
                                    {validation.touched
                                        .dealerDescription &&
                                        validation.errors
                                            .dealerDescription ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .dealerDescription
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
CarDealers.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default CarDealers;