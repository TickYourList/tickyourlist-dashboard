import React, { useEffect, useState } from "react"

import {
    Col,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button,
    Input,
    Row,
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

const SafetyVariant = ({ carVariant, onFormSubmit }) => {

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
            advanceSafetyFeature: (carVariant && carVariant.safety && carVariant.safety.advanceSafetyFeature) || "",
            rearCamera: (carVariant && carVariant.safety && carVariant.safety.rearCamera) || false,
            antiPinchPowerWindows: (carVariant && carVariant.safety && carVariant.safety.antiPinchPowerWindows) || false,
            speedAlert: (carVariant && carVariant.safety && carVariant.safety.speedAlert) || false,
            speedSensingAutoDoorLock: (carVariant && carVariant.safety && carVariant.safety.speedSensingAutoDoorLock) || false,
            isoFixChildSeatMounts: (carVariant && carVariant.safety && carVariant.safety.isoFixChildSeatMounts) || false,
            pretensionersAndForceLimiterSeatbelts: (carVariant && carVariant.safety && carVariant.safety.pretensionersAndForceLimiterSeatbelts) || false,
            hillDescentControl: (carVariant && carVariant.safety && carVariant.safety.hillDescentControl) || false,
            hillAssist: (carVariant && carVariant.safety && carVariant.safety.hillAssist) || false,
            additionalFeatures: carVariant?.safety?.additionalFeatures || ""
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
            console.log("safety", values);
            if(onFormSubmit) {
                onFormSubmit('safety', values, '9');
                }
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
                <CardTitle>Safety</CardTitle>
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
                                id="antiLockBrakingSystem"
                                {...validation.getFieldProps('antiLockBrakingSystem')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="antiLockBrakingSystem"
                            >
                                Anti Lock Braking System
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
                                id="breakAssist"
                                {...validation.getFieldProps('breakAssist')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="breakAssist"
                            >
                                Break Assist
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
                                id="centralLocking"
                                {...validation.getFieldProps('centralLocking')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="centralLocking"
                            >
                                Central Locking
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
                                id="powerDoorLocks"
                                {...validation.getFieldProps('powerDoorLocks')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="powerDoorLocks"
                            >
                                Power Door Locks
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
                                id="antiTheftAlarm"
                                {...validation.getFieldProps('antiTheftAlarm')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="antiTheftAlarm"
                            >
                                Anti Theft Alarm
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
                                id="driverAirbag"
                                {...validation.getFieldProps('driverAirbag')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="driverAirbag"
                            >
                                Driver Airbags
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
                                id="passengerAirbag"
                                {...validation.getFieldProps('passengerAirbag')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="passengerAirbag"
                            >
                                Passenger Airbag
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
                                id="sideAirbagFront"
                                {...validation.getFieldProps('sideAirbagFront')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="sideAirbagFront"
                            >
                                Side Airbag Front
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
                                id="dayNightRearViewMirror"
                                {...validation.getFieldProps('dayNightRearViewMirror')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="dayNightRearViewMirror"
                            >
                                Day Night Rear View Mirror
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
                                id="passengerSideRearViewMirror"
                                {...validation.getFieldProps('passengerSideRearViewMirror')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="passengerSideRearViewMirror"
                            >
                                Passenger Side Rear View Mirror
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
                                id="halogenHeadlamps"
                                {...validation.getFieldProps('halogenHeadlamps')}
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
                                id="rearSeatBelts"
                                {...validation.getFieldProps('rearSeatBelts')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="rearSeatBelts"
                            >
                                Rear Seat Belts
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
                                id="seatBeltWarning"
                                {...validation.getFieldProps('seatBeltWarning')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="seatBeltWarning"
                            >
                                eat Belt Warning
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
                                id="sideImpactBeams"
                                {...validation.getFieldProps('sideImpactBeams')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="sideImpactBeams"
                            >
                                Side Impact Beams
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
                                id="adjustableeats"
                                {...validation.getFieldProps('adjustableeats')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="adjustableeats"
                            >
                                Adjustable Eats
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
                                id="tyrePressureMonitor"
                                {...validation.getFieldProps('tyrePressureMonitor')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="tyrePressureMonitor"
                            >
                                Tyre Pressure Monitor
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
                                id="vehicletabilityControlSystem"
                                {...validation.getFieldProps('vehicletabilityControlSystem')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="vehicletabilityControlSystem"
                            >
                                Vehicle Ability Control System
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
                                id="engineImmobilizer"
                                {...validation.getFieldProps('engineImmobilizer')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="engineImmobilizer"
                            >
                                Engine Immobilizer
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
                                id="crashSensor"
                                {...validation.getFieldProps('crashSensor')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="crashSensor"
                            >
                                Crash Sensor
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
                                id="ebd"
                                {...validation.getFieldProps('ebd')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="ebd"
                            >
                                EBD
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
                                id="electronicStabilityControl"
                                {...validation.getFieldProps('electronicStabilityControl')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="electronicStabilityControl"
                            >
                                Electronic Stability Control
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
                                id="rearCamera"
                                {...validation.getFieldProps('rearCamera')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="rearCamera"
                            >
                                Rear Camera
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
                                id="antiPinchPowerWindows"
                                {...validation.getFieldProps('antiPinchPowerWindows')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="antiPinchPowerWindows"
                            >
                                Anti Punch Power Windows
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
                                id="speedAlert"
                                {...validation.getFieldProps('speedAlert')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="speedAlert"
                            >
                                Speed Alert
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
                                id="speedSensingAutoDoorLock"
                                {...validation.getFieldProps('speedSensingAutoDoorLock')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="speedSensingAutoDoorLock"
                            >
                                Speed Sensing Auto Door Lock
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
                                id="isoFixChildSeatMounts"
                                {...validation.getFieldProps('isoFixChildSeatMounts')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="isoFixChildSeatMounts"
                            >
                                Isofix Child Seat Mounts
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
                                id="pretensionersAndForceLimiterSeatbelts"
                                {...validation.getFieldProps('pretensionersAndForceLimiterSeatbelts')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="pretensionersAndForceLimiterSeatbelts"
                            >
                                Pretensioners And Force Limiter Seatbeats
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
                                id="hillDescentControl"
                                {...validation.getFieldProps('hillDescentControl')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="hillDescentControl"
                            >
                                Hill Descent Control
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
                                id="hillAssist"
                                {...validation.getFieldProps('hillAssist')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="hillAssist"
                            >
                                Hill Assist
                            </label>

                        </div>
                        </FormGroup>

                        <FormGroup className="mb-4" row>
                            <Label
                                htmlFor="noOfAirbags"
                                md="2"
                                className="col-form-label"
                            >
                                NO of Airbags
                            </Label>
                            <Col md="10">
                                <Input
                                type="text"
                                className="form-control"
                                name="noOfAirbags"
                                id="noOfAirbags"
                                placeholder="Enter your No Of Airbags"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.noOfAirbags}
                            />
                            </Col>
                        </FormGroup>

                        <FormGroup className="mb-4" row>
                            <Label
                                htmlFor="advanceSafetyFeature"
                                md="2"
                                className="col-form-label"
                            >
                               Advance Safety Feature
                            </Label>
                            <Col md="10">
                            <textarea
                                    className="form-control"
                                    name="advanceSafetyFeature"
                                    id="advanceSafetyFeature"
                                    placeholder="Enter your Advance Safety Feature"
                                    rows="3"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.advanceSafetyFeature}
                                  ></textarea>
                            </Col>
                        </FormGroup>

                        <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="additionalFeatures"
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

                        <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Next</Button>

                    {/* <Button type="submit" color="primary" className={
                            !validation.isValid ? "next disabled" : "next"
                          }>Submit</Button> */}
                </Form>
            </div>
        </React.Fragment>
    )
}

export default SafetyVariant
