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
import Switch from "react-switch";

const Offsymbol = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 12,
                color: "#fff",
                paddingRight: 2
            }}
        >
            {" "}
            No
        </div>
    );
};

const OnSymbol = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 12,
                color: "#fff",
                paddingRight: 2
            }}
        >
            {" "}
            Yes
        </div>
    );
};

const ExteriorVariant = ({ carVariant, onFormSubmit }) => {

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

        initialValues: {
            bodyType: (carVariant && carVariant.exterior && carVariant.exterior.bodyType) || "",
            adjustableHeadlights: (carVariant && carVariant.exterior && carVariant.exterior.adjustableHeadlights) ? carVariant.exterior.adjustableHeadlights : "",
            fogLightsFront: (carVariant && carVariant.exterior && carVariant.exterior.fogLightsFront) ? carVariant.exterior.fogLightsFront : false,
            powerAdjustableExteriorRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.powerAdjustableExteriorRearViewMirror) ? carVariant.exterior.powerAdjustableExteriorRearViewMirror : false,
            manuallyAdjustableExtRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.manuallyAdjustableExtRearViewMirror) ? carVariant.exterior.manuallyAdjustableExtRearViewMirror : false,
            electricFoldingRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.electricFoldingRearViewMirror) ? carVariant.exterior.electricFoldingRearViewMirror : false,
            rearWindowWiper: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowWiper) ? carVariant.exterior.rearWindowWiper : false,
            rearWindowWasher: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowWasher) ? carVariant.exterior.rearWindowWasher : false,
            rearWindowDefogger: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowDefogger) ? carVariant.exterior.rearWindowDefogger : false,
            wheelCovers: (carVariant && carVariant.exterior && carVariant.exterior.wheelCovers) ? carVariant.exterior.wheelCovers : false,
            alloyWheels: (carVariant && carVariant.exterior && carVariant.exterior.alloyWheels) ? carVariant.exterior.alloyWheels : false,
            powerAntenna: (carVariant && carVariant.exterior && carVariant.exterior.powerAntenna) ? carVariant.exterior.powerAntenna : false,
            rearSpoiler: (carVariant && carVariant.exterior && carVariant.exterior.rearSpoiler) ? carVariant.exterior.rearSpoiler : false,
            outsideRearViewMirrorTurnIndicators: (carVariant && carVariant.exterior && carVariant.exterior.outsideRearViewMirrorTurnIndicators) ? carVariant.exterior.outsideRearViewMirrorTurnIndicators : false,
            integratedAntenna: (carVariant && carVariant.exterior && carVariant.exterior.integratedAntenna) ? carVariant.exterior.integratedAntenna : false,
            chromeGrille: (carVariant && carVariant.exterior && carVariant.exterior.chromeGrille) ? carVariant.exterior.chromeGrille : false,
            chromeGarnish: (carVariant && carVariant.exterior && carVariant.exterior.chromeGarnish) ? carVariant.exterior.chromeGarnish : false,
            projectorHeadlamps: (carVariant && carVariant.exterior && carVariant.exterior.projectorHeadlamps) ? carVariant.exterior.projectorHeadlamps : false,
            halogenHeadlamps: (carVariant && carVariant.exterior && carVariant.exterior.halogenHeadlamps) ? carVariant.exterior.halogenHeadlamps : false,
            roofRail: (carVariant && carVariant.exterior && carVariant.exterior.roofRail) ? carVariant.exterior.roofRail : false,
            ledDrls: (carVariant && carVariant.exterior && carVariant.exterior.ledDrls) ? carVariant.exterior.ledDrls : false,
            ledHeadlights: (carVariant && carVariant.exterior && carVariant.exterior.ledHeadlights) ? carVariant.exterior.ledHeadlights : false,
            ledTaillights: (carVariant && carVariant.exterior && carVariant.exterior.ledTaillights) ? carVariant.exterior.ledTaillights : false,
            ledFogLamps: (carVariant && carVariant.exterior && carVariant.exterior.ledFogLamps) ? carVariant.exterior.ledFogLamps : false,
            additionalFeatures: (carVariant && carVariant.exterior && carVariant.exterior.additionalFeatures) || "",
            fogLights: (carVariant && carVariant.exterior && carVariant.exterior.fogLights) ? carVariant.exterior.fogLights : false,
            antenna: (carVariant && carVariant.exterior && carVariant.exterior.antenna) || "",
            bootOpening: (carVariant && carVariant.exterior && carVariant.exterior.bootOpening) || "",
            puddleLamps: (carVariant && carVariant.exterior && carVariant.exterior.puddleLamps) ? carVariant.exterior.puddleLamps : "",
            tyreSize: (carVariant && carVariant.exterior && carVariant.exterior.tyreSize) || "",
            tyreType: (carVariant && carVariant.exterior && carVariant.exterior.tyreType) || "",
            wheelSize: (carVariant && carVariant.exterior && carVariant.exterior.wheelSize) || "",
            allowWheelSize: (carVariant && carVariant.exterior && carVariant.exterior.allowWheelSize) ? carVariant.exterior.allowWheelSize : "",
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
            if (onFormSubmit) {
                onFormSubmit('exterior', values, '9');
            }
            toggle();
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
                <CardTitle>Exterior</CardTitle>
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
                                        checked={validation.values.fogLightsFront}
                                        id="fogLightsFront"
                                        onChange={(event) => {
                                            validation.setFieldValue("fogLightsFront", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="fogLightsFront"
                                    >
                                        Fog Light Front
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
                                        checked={validation.values.powerAdjustableExteriorRearViewMirror}
                                        id="powerAdjustableExteriorRearViewMirror"
                                        onChange={(event) => {
                                            validation.setFieldValue("powerAdjustableExteriorRearViewMirror", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerAdjustableExteriorRearViewMirror"
                                    >
                                        Power Adjustable Exterior Rear View Mirror
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
                                        checked={validation.values.manuallyAdjustableExtRearViewMirror}
                                        id="manuallyAdjustableExtRearViewMirror"
                                        onChange={(event) => {
                                            validation.setFieldValue("manuallyAdjustableExtRearViewMirror", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="manuallyAdjustableExtRearViewMirror"
                                    >
                                        Manually Adjustable Exterior Rear View Mirror
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
                                        checked={validation.values.electricFoldingRearViewMirror}
                                        id="electricFoldingRearViewMirror"
                                        onChange={(event) => {
                                            validation.setFieldValue("electricFoldingRearViewMirror", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="electricFoldingRearViewMirror"
                                    >
                                        Electric folding Rear View Mirror
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
                                        checked={validation.values.rearWindowWiper}
                                        id="rearWindowWiper"
                                        onChange={(event) => {
                                            validation.setFieldValue("rearWindowWiper", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowWiper"
                                    >
                                        Rear Window Wiper
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
                                        checked={validation.values.rearWindowWasher}
                                        id="rearWindowWasher"
                                        onChange={(event) => {
                                            validation.setFieldValue("rearWindowWasher", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowWasher"
                                    >
                                        Rear Window Washer
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
                                        checked={validation.values.rearWindowDefogger}
                                        id="rearWindowDefogger"
                                        onChange={(event) => {
                                            validation.setFieldValue("rearWindowDefogger", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowDefogger"
                                    >
                                        Rear Window Defogger
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
                                        checked={validation.values.wheelCovers}
                                        id="wheelCovers"
                                        onChange={(event) => {
                                            validation.setFieldValue("wheelCovers", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="wheelCovers"
                                    >
                                        Wheel Covers
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
                                        checked={validation.values.alloyWheels}
                                        id="alloyWheels"
                                        onChange={(event) => {
                                            validation.setFieldValue("alloyWheels", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="alloyWheels"
                                    >
                                        Alloy Wheels
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
                                        checked={validation.values.powerAntenna}
                                        id="powerAntenna"
                                        onChange={(event) => {
                                            validation.setFieldValue("powerAntenna", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerAntenna"
                                    >
                                        Power Antenna
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
                                        checked={validation.values.rearSpoiler}
                                        id="rearSpoiler"
                                        onChange={(event) => {
                                            validation.setFieldValue("rearSpoiler", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearSpoiler"
                                    >
                                        Rear Spoiler
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
                                        checked={validation.values.outsideRearViewMirrorTurnIndicators}
                                        id="outsideRearViewMirrorTurnIndicators"
                                        onChange={(event) => {
                                            validation.setFieldValue("outsideRearViewMirrorTurnIndicators", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="outsideRearViewMirrorTurnIndicators"
                                    >
                                        Outside Rear View Mirror Turn Indicators
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
                                        checked={validation.values.integratedAntenna}
                                        id="integratedAntenna"
                                        onChange={(event) => {
                                            validation.setFieldValue("integratedAntenna", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="integratedAntenna"
                                    >
                                        Integrated Antenna
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
                                        checked={validation.values.chromeGrille}
                                        id="chromeGrille"
                                        onChange={(event) => {
                                            validation.setFieldValue("chromeGrille", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="chromeGrille"
                                    >
                                        Chrome Grille
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
                                        checked={validation.values.chromeGarnish}
                                        id="chromeGarnish"
                                        onChange={(event) => {
                                            validation.setFieldValue("chromeGarnish", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="chromeGarnish"
                                    >
                                        Chrome Garnish
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
                                        checked={validation.values.projectorHeadlamps}
                                        id="projectorHeadlamps"
                                        onChange={(event) => {
                                            validation.setFieldValue("projectorHeadlamps", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="projectorHeadlamps"
                                    >
                                        Projector Head Lamps
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
                                        checked={validation.values.halogenHeadlamps}
                                        id="halogenHeadlamps"
                                        onChange={(event) => {
                                            validation.setFieldValue("halogenHeadlamps", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="halogenHeadlamps"
                                    >
                                        Halogen Head Lamps
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
                                        checked={validation.values.roofRail}
                                        id="roofRail"
                                        onChange={(event) => {
                                            validation.setFieldValue("roofRail", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="roofRail"
                                    >
                                        Roof Rails
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
                                        checked={validation.values.ledDrls}
                                        id="ledDrls"
                                        onChange={(event) => {
                                            validation.setFieldValue("ledDrls", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledDrls"
                                    >
                                        Led Drls
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
                                        checked={validation.values.ledHeadlights}
                                        id="ledHeadlights"
                                        onChange={(event) => {
                                            validation.setFieldValue("ledHeadlights", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledHeadlights"
                                    >
                                        LED Head lights
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
                                        checked={validation.values.ledTaillights}
                                        id="ledTaillights"
                                        onChange={(event) => {
                                            validation.setFieldValue("ledTaillights", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledTaillights"
                                    >
                                        LED Tail lights
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
                                        checked={validation.values.ledFogLamps}
                                        id="ledFogLamps"
                                        onChange={(event) => {
                                            validation.setFieldValue("ledFogLamps", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledFogLamps"
                                    >
                                        LED Fog Lamps
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
                                        checked={validation.values.fogLights}
                                        id="fogLights"
                                        onChange={(event) => {
                                            validation.setFieldValue("fogLights", event.target.checked);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="fogLights"
                                    >
                                        LED Fog Lights
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <FormGroup className="mb-4" row>
                        <Label htmlFor="bodyType" md="2" className="col-form-label">
                            Body Type
                        </Label>
                        <Col md="10">
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

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="adjustableHeadlights"
                            md="2"
                            className="col-form-label"
                        >
                            Adjustable Head Lights
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="adjustableHeadlights"
                                id="adjustableHeadlights"
                                placeholder="Enter your Adjustable Head Lights"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.adjustableHeadlights}
                            />
                        </Col>
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
                                name="additionalFeatures"
                                id="additionalFeatures"
                                placeholder="Enter your Additional Features"
                                rows="3"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.additionalFeatures}
                            ></textarea>
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="antenna"
                            md="2"
                            className="col-form-label"
                        >
                            Antenna
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="antenna"
                                id="antenna"
                                placeholder="Enter your Antenna"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.antenna}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bootOpening"
                            md="2"
                            className="col-form-label"
                        >
                            Boot Opening
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="bootOpening"
                                id="bootOpening"
                                placeholder="Enter your Boot Opening"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bootOpening}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="puddleLamps"
                            md="2"
                            className="col-form-label"
                        >
                            Puddle Lamps
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="puddleLamps"
                                id="puddleLamps"
                                placeholder="Enter your Puddle Lamps"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.puddleLamps}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreSize"
                            md="2"
                            className="col-form-label"
                        >
                            Tyre Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="tyreSize"
                                id="tyreSize"
                                placeholder="Enter your Tyre Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.tyreSize}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreType"
                            md="2"
                            className="col-form-label"
                        >
                            Tyre Type
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="tyreType"
                                id="tyreType"
                                placeholder="Enter your Tyre Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.tyreType}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="wheelSize"
                            md="2"
                            className="col-form-label"
                        >
                            Wheel Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="wheelSize"
                                id="wheelSize"
                                placeholder="Enter your Wheel Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.wheelSize}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="allowWheelSize"
                            md="2"
                            className="col-form-label"
                        >
                            Allow Wheel Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="allowWheelSize"
                                id="allowWheelSize"
                                placeholder="Enter your Allow Wheel Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.allowWheelSize}
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

export default ExteriorVariant
