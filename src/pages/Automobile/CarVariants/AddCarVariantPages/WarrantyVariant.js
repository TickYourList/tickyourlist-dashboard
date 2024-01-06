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

const WarrantyVariant = () => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const [activeTab, setactiveTab] = useState("1")
    const [selectedGroup, setselectedGroup] = useState(null)

    const [carVariant, setCarVariant] = useState([]);
    const [switch1, setswitch1] = useState(true);
    // const [carModelsList, setCarModelsList] = useState([]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            antiLockBrakingSystem: (carVariant && carVariant.safety && carVariant.safety.antiLockBrakingSystem) || false,
            breakAssist: (carVariant && carVariant.exterior && carVariant.exterior.breakAssist) ? carVariant.exterior.breakAssist : false,
            centralLocking: (carVariant && carVariant.safety && carVariant.safety.centralLocking) || false,
            powerDoorLocks: (carVariant && carVariant.safety && carVariant.safety.powerDoorLocks) || false,
            antiTheftAlarm: (carVariant && carVariant.safety && carVariant.safety.antiTheftAlarm) || false,
            noOfAirbags: (carVariant && carVariant.safety && carVariant.safety.noOfAirbags) || "",
            driverAirbag: (carVariant && carVariant.safety && carVariant.safety.driverAirbag) || false,
            passengerAirbag: (carVariant && carVariant.safety && carVariant.safety.passengerAirbag) || false,
            sideAirbagFront: (carVariant && carVariant.safety && carVariant.safety.sideAirbagFront) || false,
            dayNightRearViewMirror: (carVariant && carVariant.safety && carVariant.safety.dayNightRearViewMirror) || false,
            passengerSideRearViewMirror: (carVariant && carVariant.safety && carVariant.safety.passengerSideRearViewMirror) || false,
            halogenHeadlamps: (carVariant && carVariant.safety && carVariant.safety.halogenHeadlamps) || false,
            rearSeatBelts: (carVariant && carVariant.safety && carVariant.safety.rearSeatBelts) || false,
            seatBeltWarning: (carVariant && carVariant.safety && carVariant.safety.seatBeltWarning) || false,
            sideImpactBeams: (carVariant && carVariant.safety && carVariant.safety.sideImpactBeams) || false,
            adjustableeats: (carVariant && carVariant.safety && carVariant.safety.adjustableeats) || false,
            tyrePressureMonitor: (carVariant && carVariant.safety && carVariant.safety.tyrePressureMonitor) || false,
            vehicletabilityControlSystem: (carVariant && carVariant.safety && carVariant.safety.vehicletabilityControlSystem) || false,
            engineImmobilizer: (carVariant && carVariant.safety && carVariant.safety.engineImmobilizer) || false,
            crashSensor: (carVariant && carVariant.safety && carVariant.safety.crashSensor) || false,
            ebd: (carVariant && carVariant.safety && carVariant.safety.ebd) || false,
            electronicStabilityControl: (carVariant && carVariant.safety && carVariant.safety.electronicStabilityControl) || false,
            advanceSafetyFeature: (carVariant && carVariant.safety && carVariant.safety.advanceSafetyFeature) || false,
            rearCamera: (carVariant && carVariant.safety && carVariant.safety.rearCamera) || false,
            antiPinchPowerindows: (carVariant && carVariant.safety && carVariant.safety.antiPinchPowerindows) || false,
            speedAlert: (carVariant && carVariant.safety && carVariant.safety.speedAlert) || false,
            speedSensingAutoDoorLock: (carVariant && carVariant.safety && carVariant.safety.speedSensingAutoDoorLock) || false,
            isoFixChildSeatMounts: (carVariant && carVariant.safety && carVariant.safety.isoFixChildSeatMounts) || false,
            pretensionersAndForceLimiterSeatbelts: (carVariant && carVariant.safety && carVariant.safety.pretensionersAndForceLimiterSeatbelts) || false,
            hillDescentControl: (carVariant && carVariant.safety && carVariant.safety.hillDescentControl) || false,
            hillAssist: (carVariant && carVariant.safety && carVariant.safety.hillAssist) || false
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

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bodyType"
                            md="2"
                            className="col-form-label"
                        >
                            Body Type
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="bodyType"
                                id="bodyType"
                                placeholder="Enter your Body Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bodyType}
                            />
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
                            htmlFor="adjustableHeadlights"
                            md="2"
                            className="col-form-label"
                        >
                            Adjustable Head Lights
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("adjustableHeadlights", checked);
                                }}
                                checked={validation.values.adjustableHeadlights}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="powerAdjustableExteriorRearViewMirror"
                            md="2"
                            className="col-form-label"
                        >
                            Power Adjustable Exterior Rear View Mirror
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("powerAdjustableExteriorRearViewMirror", checked);
                                }}
                                checked={validation.values.powerAdjustableExteriorRearViewMirror}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="manuallyAdjustableExtRearViewMirror"
                            md="2"
                            className="col-form-label"
                        >
                            Manually Adjustable Exterior Rear View Mirror
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("manuallyAdjustableExtRearViewMirror", checked);
                                }}
                                checked={validation.values.manuallyAdjustableExtRearViewMirror}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="electricFoldingRearViewMirror"
                            md="2"
                            className="col-form-label"
                        >
                            Electric folding Rear View Mirror
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("electricFoldingRearViewMirror", checked);
                                }}
                                checked={validation.values.electricFoldingRearViewMirror}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearWindowWiper"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Window Wiper
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("rearWindowWiper", checked);
                                }}
                                checked={validation.values.rearWindowWiper}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearWindowWasher"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Window Washer
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("rearWindowWasher", checked);
                                }}
                                checked={validation.values.rearWindowWasher}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearWindowDefogger"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Window Defogger
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("rearWindowDefogger", checked);
                                }}
                                checked={validation.values.rearWindowDefogger}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearWindowWheelCovers"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Window WheelCovers
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("wheelCovers", checked);
                                }}
                                checked={validation.values.wheelCovers}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="alloyWheels"
                            md="2"
                            className="col-form-label"
                        >
                            Alloy Wheels
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("alloyWheels", checked);
                                }}
                                checked={validation.values.alloyWheels}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="powerAntenna"
                            md="2"
                            className="col-form-label"
                        >
                            Power Antenna
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("powerAntenna", checked);
                                }}
                                checked={validation.values.powerAntenna}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearSpoiler"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Spoiler
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("rearSpoiler", checked);
                                }}
                                checked={validation.values.rearSpoiler}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="outsideRearViewMirrorTurnIndicators"
                            md="2"
                            className="col-form-label"
                        >
                            Outside Rear View Mirror Turn Indicators
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("outsideRearViewMirrorTurnIndicators", checked);
                                }}
                                checked={validation.values.outsideRearViewMirrorTurnIndicators}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="integratedAntenna"
                            md="2"
                            className="col-form-label"
                        >
                            Integrated Antenna
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("integratedAntenna", checked);
                                }}
                                checked={validation.values.integratedAntenna}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="chromeGrille"
                            md="2"
                            className="col-form-label"
                        >
                            Chrome Grille
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("chromeGrille", checked);
                                }}
                                checked={validation.values.chromeGrille}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="chromeGarnish"
                            md="2"
                            className="col-form-label"
                        >
                            Chrome Garnish
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("chromeGarnish", checked);
                                }}
                                checked={validation.values.chromeGarnish}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="projectorHeadlamps"
                            md="2"
                            className="col-form-label"
                        >
                            Projector Head Lamps
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("projectorHeadlamps", checked);
                                }}
                                checked={validation.values.projectorHeadlamps}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="halogenHeadlamps"
                            md="2"
                            className="col-form-label"
                        >
                            Halogen Head Lamps
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("halogenHeadlamps", checked);
                                }}
                                checked={validation.values.halogenHeadlamps}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="roofRail"
                            md="2"
                            className="col-form-label"
                        >
                            Roof Rails
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("roofRail", checked);
                                }}
                                checked={validation.values.roofRail}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="ledDrls"
                            md="2"
                            className="col-form-label"
                        >
                            Led Drls
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("ledDrls", checked);
                                }}
                                checked={validation.values.ledDrls}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="ledHeadlights"
                            md="2"
                            className="col-form-label"
                        >
                            LED Head lights
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("ledHeadlights", checked);
                                }}
                                checked={validation.values.ledHeadlights}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="ledTaillights"
                            md="2"
                            className="col-form-label"
                        >
                            LED Tail lights
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("ledTaillights", checked);
                                }}
                                checked={validation.values.ledTaillights}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="ledFogLamps"
                            md="2"
                            className="col-form-label"
                        >
                            LED Fog Lamps
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("ledFogLamps", checked);
                                }}
                                checked={validation.values.ledFogLamps}
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
                            <Input
                                type="text"
                                className="form-control"
                                name="additionFeatures"
                                id="additionFeatures"
                                placeholder="Enter your Additional Features"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.additionFeatures}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="fogLights"
                            md="2"
                            className="col-form-label"
                        >
                            LED Fog Lamps
                        </Label>
                        <Col md="10">
                            <Switch
                                uncheckedIcon={<Offsymbol />}
                                checkedIcon={<OnSymbol />}
                                className="me-1 mb-sm-8 mb-2"
                                onColor="#626ed4"
                                onChange={(checked) => {
                                    validation.setFieldValue("fogLights", checked);
                                }}
                                checked={validation.values.fogLights}
                            />
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

                    <Button type="submit" color="primary">Next</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default WarrantyVariant
