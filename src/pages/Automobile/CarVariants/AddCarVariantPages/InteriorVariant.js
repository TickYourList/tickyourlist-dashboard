import React, { useEffect, useState } from "react"

import {
    Container,
    Row,
    Col,
    Table,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Card,
    Form,
    FormGroup,
    Label,
    CardBody,
    CardTitle,
    CardSubtitle,
    FormFeedback,
    Button,
} from "reactstrap"
import Select from "react-select"
import { Link } from "react-router-dom"
import * as Yup from "yup";

import classnames from "classnames"
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"

const InteriorVariant = ({ carVariant, onFormSubmit }) => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const [activeTab, setactiveTab] = useState("1")
    const [selectedGroup, setselectedGroup] = useState(null)

    const [switch1, setswitch1] = useState(true);
    // const [carModelsList, setCarModelsList] = useState([]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,
        simpleCheckbox: false,

        initialValues: {
            tachometer: carVariant?.interior?.tachometer ?? false,
            electronicutiTripmeter: carVariant?.interior?.electronicutiTripmeter ?? false,
            fabricUpholestry: carVariant?.interior?.fabricUpholestry ?? false,
            leatherSteeringWheel: carVariant?.interior?.leatherSteeringWheel ?? false,
            gloveCompartment: carVariant?.interior?.gloveCompartment ?? false,
            digitalClock: carVariant?.interior?.digitalClock ?? false,
            outsideTemperatureisplay: carVariant?.interior?.outsideTemperatureisplay ?? false,
            digitalOdometer: carVariant?.interior?.digitalOdometer ?? false,
            dualToneDashboard: carVariant?.interior?.dualToneDashboard ?? false,
            additionFeatures: carVariant?.interior?.additionFeatures || "",
            digitalCluster: carVariant?.interior?.digitalCluster || "",
            digitalClusterSize: carVariant?.interior?.digitalClusterSize || 0,
            upholstery: carVariant?.interior?.upholstery || "",
        },
        
        // validationSchema: Yup.object({
        //     modelName: Yup.string().required(
        //         "Please Enter Your Brand Name"
        //     ),
        //     carBrand: Yup.string().required(
        //         "Please Enter Your CarBrand"
        //     ),
        //     description: Yup.string().required(
        //         "Please Enter Your description"
        //     ),
        //     year: Yup.string().required(
        //         "Please Enter Your Year"
        //     ),
        //     status: Yup.string().required(
        //         "Please Enter Your Status"
        //     )
        // }),
        onSubmit: values => {
            console.log('values ', values);
            // if (isEdit) {
            //     const updCarModel = new FormData();
            //     updCarModel.append("modelName", values["modelName"]);
            //     updCarModel.append("description", values["description"]);
            //     updCarModel.append("year", values["year"]);
            //     updCarModel.append("status", values["status"] === 'Active' ? true : false);
            //     updCarModel.append("image", modelImage ? modelImage : "broken!");
            //     dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

            //     validation.resetForm();
            // } else {
            //     const newCarModel = new FormData();
            //     newCarModel.append("modelName", values["modelName"]);
            //     newCarModel.append("description", values["description"]);
            //     newCarModel.append("year", values["year"]);
            //     newCarModel.append("status", values["status"] === 'Active' ? true : false);
            //     newCarModel.append("image", modelImage ? modelImage : "broken!");
            //     dispatch(addNewCarModel(values['carBrand'], newCarModel));
            //     validation.resetForm();
            // }
            onFormSubmit('interior', values, '8');
        },
        handleError: e => { },
    });

    function handleSelectGroup(selectedGroup) {
        setselectedGroup(selectedGroup)
    }

    const { carBrands, countries, carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch]);

    // useEffect(() => {
    //     setCarModelsList(carModels);
    // }, [carModels]);

    return (
        <React.Fragment>
            <div>
                <CardTitle>Interior</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                        <Col lg="3">
                          <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="tachometer"
                                        {...validation.getFieldProps('tachometer')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="tachometer"
                                    >
                                        Techometer
                                    </label>

                                </div>
                            </FormGroup>
                     

                        </Col>

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="electronicutiTripmeter"
                                        {...validation.getFieldProps('electronicutiTripmeter')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="electronicutiTripmeter"
                                    >
                                        Electronic Tripmeter
                                    </label>
                                </div>
                            </FormGroup>
                        </Col>

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="fabricUpholestry"
                                        {...validation.getFieldProps('fabricUpholestry')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="fabricUpholestry"
                                    >
                                        Fabric upholstery
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="leatherSteeringWheel"
                                        {...validation.getFieldProps('leatherSteeringWheel')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="leatherSteeringWheel"
                                    >
                                        Leather Steering Wheel
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="gloveCompartment"
                                        {...validation.getFieldProps('gloveCompartment')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="gloveCompartment"
                                    >
                                        Glove Compartment
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="digitalClock"
                                        {...validation.getFieldProps('digitalClock')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="digitalClock"
                                    >
                                        Digital Clock
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="outsideTemperatureisplay"
                                        {...validation.getFieldProps('outsideTemperatureisplay')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="outsideTemperatureisplay"
                                    >
                                        Outside Temperature display
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="digitalOdometer"
                                        {...validation.getFieldProps('digitalOdometer')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="digitalOdometer"
                                    >
                                        Digital Odometer
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <FormGroup className="mb-4" row>
                        <div className="form-check form-check-end">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="dualToneDashboard"
                                {...validation.getFieldProps('dualToneDashboard')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="dualToneDashboard"
                            >
                                Dual Tone Dashboard
                            </label>

                        </div>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="additionFeatures"
                            md="2"
                            className="col-form-label"
                        >
                            Additional Features
                        </Label>
                        <Col md="10">
                            <textarea
                                className="form-control"
                                name="additionFeatures"
                                id="additionFeatures"
                                placeholder="Enter your Additional Features"
                                rows="3"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.additionFeatures}
                            ></textarea>
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="digitalCluster"
                            md="2"
                            className="col-form-label"
                        >
                            Digital Cluster
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="digitalCluster"
                                id="digitalCluster"
                                placeholder="Enter your Digital Cluster"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.digitalCluster}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="digitalClusterSize"
                            md="2"
                            className="col-form-label"
                        >
                            Digital Cluster Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="number"
                                className="form-control"
                                name="digitalClusterSize"
                                id="digitalClusterSize"
                                placeholder="Enter your Digital Cluster Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.digitalClusterSize}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="upholstery"
                            md="2"
                            className="col-form-label"
                        >
                            Upholestery
                        </Label>
                        <Col md="10">
                            <Input
                                type="number"
                                className="form-control"
                                name="upholstery"
                                id="upholstery"
                                placeholder="Enter your Upholestery"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.upholstery}
                            />
                        </Col>
                    </FormGroup>

                    <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Next</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default InteriorVariant
