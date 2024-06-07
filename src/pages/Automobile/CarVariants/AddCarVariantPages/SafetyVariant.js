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
            antiLockBrakingSystem: carVariant?.safety?.antiLockBrakingSystem || false,
            breakAssist: carVariant?.safety?.breakAssist || false,
            centralLocking: carVariant?.safety?.centralLocking || false,
            powerDoorLocks: carVariant?.safety?.powerDoorLocks || false,
            antiTheftAlarm: carVariant?.safety?.antiTheftAlarm || false,
            noOfAirbags: carVariant?.safety?.noOfAirbags || "",
            driverAirbag: carVariant?.safety?.driverAirbag || false,
            passengerAirbag: carVariant?.safety?.passengerAirbag || false,
            sideAirbagFront: carVariant?.safety?.sideAirbagFront || false,
            dayNightRearViewMirror: carVariant?.safety?.dayNightRearViewMirror || false,
            passengerSideRearViewMirror: carVariant?.safety?.passengerSideRearViewMirror || false,
            halogenHeadlamps: carVariant?.safety?.halogenHeadlamps || false,
            rearSeatBelts: carVariant?.safety?.rearSeatBelts || false,
            seatBeltWarning: carVariant?.safety?.seatBeltWarning || false,
            sideImpactBeams: carVariant?.safety?.sideImpactBeams || false,
            adjustableeats: carVariant?.safety?.adjustableeats || false,
            tyrePressureMonitor: carVariant?.safety?.tyrePressureMonitor || false,
            vehicletabilityControlSystem: carVariant?.safety?.vehicletabilityControlSystem || false,
            engineImmobilizer: carVariant?.safety?.engineImmobilizer || false,
            crashSensor: carVariant?.safety?.crashSensor || false,
            ebd: carVariant?.safety?.ebd || false,
            electronicStabilityControl: carVariant?.safety?.electronicStabilityControl || false,
            advanceSafetyFeatures: carVariant?.safety?.advanceSafetyFeatures || "",
            rearCamera: carVariant?.safety?.rearCamera || false,
            antiPinchPowerWindows: carVariant?.safety?.antiPinchPowerWindows || false,
            speedAlert: carVariant?.safety?.speedAlert || false,
            speedSensingAutoDoorLock: carVariant?.safety?.speedSensingAutoDoorLock || false,
            isoFixChildSeatMounts: carVariant?.safety?.isoFixChildSeatMounts || false,
            pretensionersAndForceLimiterSeatbelts: carVariant?.safety?.pretensionersAndForceLimiterSeatbelts || false,
            hillDescentControl: carVariant?.safety?.hillDescentControl || false,
            hillAssist: carVariant?.safety?.hillAssist || false,
            additionalFeatures: carVariant?.safety?.additionalFeatures || ""
        },
        onSubmit: values => {
            if (onFormSubmit) {
                onFormSubmit('safety', values, '9');
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

    return (
        <React.Fragment>
            <div>
                <CardTitle>Safety</CardTitle>
                <p className="card-title-desc">Fill all information below</p>
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
                                        checked={validation.values.antiLockBrakingSystem}
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
                                        checked={validation.values.breakAssist}
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
                                        checked={validation.values.centralLocking}
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
                                        checked={validation.values.powerDoorLocks}
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
                                        checked={validation.values.antiTheftAlarm}
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
                                        checked={validation.values.driverAirbag}
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
                                        checked={validation.values.passengerAirbag}
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
                                        checked={validation.values.sideAirbagFront}
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
                                        checked={validation.values.dayNightRearViewMirror}
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
                                        checked={validation.values.passengerSideRearViewMirror}
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
                                        checked={validation.values.halogenHeadlamps}
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
                                        checked={validation.values.rearSeatBelts}
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
                                        checked={validation.values.seatBeltWarning}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="seatBeltWarning"
                                    >
                                        Seat Belt Warning
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
                                        checked={validation.values.sideImpactBeams}
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
                                        checked={validation.values.adjustableeats}
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
                                        checked={validation.values.tyrePressureMonitor}
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
                                        checked={validation.values.vehicletabilityControlSystem}
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
                                        checked={validation.values.engineImmobilizer}
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
                                        checked={validation.values.crashSensor}
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
                                        checked={validation.values.ebd}
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
                                        checked={validation.values.electronicStabilityControl}
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
                                        checked={validation.values.rearCamera}
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
                                        checked={validation.values.antiPinchPowerWindows}
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
                                        checked={validation.values.speedAlert}
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
                                        checked={validation.values.speedSensingAutoDoorLock}
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
                                        checked={validation.values.isoFixChildSeatMounts}
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
                                        checked={validation.values.pretensionersAndForceLimiterSeatbelts}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="pretensionersAndForceLimiterSeatbelts"
                                    >
                                        Pretensioners And Force Limiter Seatbelts
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
                                        checked={validation.values.hillDescentControl}
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
                                checked={validation.values.hillAssist}
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
                        <Label htmlFor="noOfAirbags" md="2" className="col-form-label">
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
                        <Label htmlFor="advanceSafetyFeatures" md="2" className="col-form-label">
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
                        <Label htmlFor="additionalFeatures" md="2" className="col-form-label">
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
                    <Button type="submit" color="primary">
                        Next
                    </Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default SafetyVariant
