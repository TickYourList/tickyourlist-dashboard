import React, { useEffect } from "react";
import { Col, Form, FormGroup, Label, CardTitle, Button, Input, Row } from "reactstrap";
import { useFormik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { getCarModels } from "store/automobiles/carModels/actions";

const SafetyVariant = ({ carVariant, onFormSubmit }) => {
    document.title = "Add Car Variant | Scrollit";
    const dispatch = useDispatch();

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            antiLockBrakingSystem: carVariant?.safety?.antiLockBrakingSystem ? "Y" : "N",
            breakAssist: carVariant?.safety?.breakAssist ? "Y" : "N",
            centralLocking: carVariant?.safety?.centralLocking ? "Y" : "N",
            powerDoorLocks: carVariant?.safety?.powerDoorLocks ? "Y" : "N",
            antiTheftAlarm: carVariant?.safety?.antiTheftAlarm ? "Y" : "N",
            noOfAirbags: carVariant?.safety?.noOfAirbags || "",
            driverAirbag: carVariant?.safety?.driverAirbag ? "Y" : "N",
            passengerAirbag: carVariant?.safety?.passengerAirbag ? "Y" : "N",
            sideAirbagFront: carVariant?.safety?.sideAirbagFront ? "Y" : "N",
            dayNightRearViewMirror: carVariant?.safety?.dayNightRearViewMirror ? "Y" : "N",
            passengerSideRearViewMirror: carVariant?.safety?.passengerSideRearViewMirror ? "Y" : "N",
            halogenHeadlamps: carVariant?.safety?.halogenHeadlamps ? "Y" : "N",
            rearSeatBelts: carVariant?.safety?.rearSeatBelts ? "Y" : "N",
            seatBeltWarning: carVariant?.safety?.seatBeltWarning ? "Y" : "N",
            sideImpactBeams: carVariant?.safety?.sideImpactBeams ? "Y" : "N",
            adjustableseats: carVariant?.safety?.adjustableseats ? "Y" : "N",
            tyrePressureMonitor: carVariant?.safety?.tyrePressureMonitor ? "Y" : "N",
            vehicletabilityControlSystem: carVariant?.safety?.vehicletabilityControlSystem ? "Y" : "N",
            engineImmobilizer: carVariant?.safety?.engineImmobilizer ? "Y" : "N",
            crashSensor: carVariant?.safety?.crashSensor ? "Y" : "N",
            ebd: carVariant?.safety?.ebd ? "Y" : "N",
            electronicStabilityControl: carVariant?.safety?.electronicStabilityControl ? "Y" : "N",
            advanceSafetyFeatures: carVariant?.safety?.advanceSafetyFeatures || "",
            rearCamera: carVariant?.safety?.rearCamera ? "Y" : "N",
            antiPinchPowerWindows: carVariant?.safety?.antiPinchPowerWindows ? "Y" : "N",
            speedAlert: carVariant?.safety?.speedAlert ? "Y" : "N",
            speedSensingAutoDoorLock: carVariant?.safety?.speedSensingAutoDoorLock ? "Y" : "N",
            isoFixChildSeatMounts: carVariant?.safety?.isoFixChildSeatMounts ? "Y" : "N",
            pretensionersAndForceLimiterSeatbelts: carVariant?.safety?.pretensionersAndForceLimiterSeatbelts ? "Y" : "N",
            hillDescentControl: carVariant?.safety?.hillDescentControl ? "Y" : "N",
            hillAssist: carVariant?.safety?.hillAssist ? "Y" : "N",
            additionalFeatures: carVariant?.safety?.additionalFeatures || ""
        },
        onSubmit: values => {
            const convertedValues = Object.keys(values).reduce((acc, key) => {
                if (values[key] === "Y" || values[key] === "N") {
                    acc[key] = values[key] === "Y";
                } else {
                    acc[key] = values[key];
                }
                return acc;
            }, {});

            if (onFormSubmit) {
                onFormSubmit('safety', convertedValues, '9');
            }
        }
    });

    const { carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch, carModels]);

    const renderDropdown = (fieldName, label) => (
        <Col lg="3">
            <FormGroup className="mb-4" row>
                <Label
                    htmlFor={fieldName}
                    className="col-form-label"
                >
                    {label}
                </Label>
                <Col>
                    <Input
                        type="select"
                        className="form-control"
                        name={fieldName}
                        id={fieldName}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values[fieldName]}
                    >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </Input>
                </Col>
            </FormGroup>
        </Col>
    );

    return (
        <React.Fragment>
            <div className="p-4">
                <Form
                    className="needs-validation"
                    onSubmit={e => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }}
                >
                    <CardTitle className="h4">Safety</CardTitle>
                    <Row>
                        {renderDropdown("antiLockBrakingSystem", "Anti Lock Braking System")}
                        {renderDropdown("breakAssist", "Break Assist")}
                        {renderDropdown("centralLocking", "Central Locking")}
                        {renderDropdown("powerDoorLocks", "Power Door Locks")}
                    </Row>
                    <Row>
                        {renderDropdown("antiTheftAlarm", "Anti Theft Alarm")}
                        {renderDropdown("driverAirbag", "Driver Airbags")}
                        {renderDropdown("passengerAirbag", "Passenger Airbag")}
                        {renderDropdown("sideAirbagFront", "Side Airbag Front")}
                    </Row>
                    <Row>
                        {renderDropdown("dayNightRearViewMirror", "Day Night Rear View Mirror")}
                        {renderDropdown("passengerSideRearViewMirror", "Passenger Side Rear View Mirror")}
                        {renderDropdown("halogenHeadlamps", "Halogen Head Lamps")}
                        {renderDropdown("rearSeatBelts", "Rear Seat Belts")}
                    </Row>
                    <Row>
                        {renderDropdown("seatBeltWarning", "Seat Belt Warning")}
                        {renderDropdown("sideImpactBeams", "Side Impact Beams")}
                        {renderDropdown("adjustableseats", "Adjustable Seats")}
                        {renderDropdown("tyrePressureMonitor", "Tyre Pressure Monitor")}
                    </Row>
                    <Row>
                        {renderDropdown("vehicletabilityControlSystem", "Vehicle Ability Control System")}
                        {renderDropdown("engineImmobilizer", "Engine Immobilizer")}
                        {renderDropdown("crashSensor", "Crash Sensor")}
                        {renderDropdown("ebd", "EBD")}
                    </Row>
                    <Row>
                        {renderDropdown("electronicStabilityControl", "Electronic Stability Control")}
                        {renderDropdown("rearCamera", "Rear Camera")}
                        {renderDropdown("antiPinchPowerWindows", "Anti Punch Power Windows")}
                        {renderDropdown("speedAlert", "Speed Alert")}
                    </Row>
                    <Row>
                        {renderDropdown("speedSensingAutoDoorLock", "Speed Sensing Auto Door Lock")}
                        {renderDropdown("isoFixChildSeatMounts", "Isofix Child Seat Mounts")}
                        {renderDropdown("pretensionersAndForceLimiterSeatbelts", "Pretensioners And Force Limiter Seatbelts")}
                        {renderDropdown("hillDescentControl", "Hill Descent Control")}
                    </Row>
                    <Row>
                        {renderDropdown("hillAssist", "Hill Assist")}
                    </Row>
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
                            htmlFor="advanceSafetyFeatures"
                            md="2"
                            className="col-form-label"
                        >
                            Advance Safety Feature
                        </Label>
                        <Col md="10">
                            <textarea
                                className="form-control"
                                name="advanceSafetyFeatures"
                                id="advanceSafetyFeatures"
                                placeholder="Enter your Advance Safety Feature"
                                rows="3"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.advanceSafetyFeatures}
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
                </Form>
            </div>
        </React.Fragment>
    )
}

export default SafetyVariant