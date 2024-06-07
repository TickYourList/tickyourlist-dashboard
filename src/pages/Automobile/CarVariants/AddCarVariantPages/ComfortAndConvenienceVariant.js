import React, { useEffect } from "react";
import {
    Col,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button,
    Row,
    Input
} from "reactstrap";

import { useSelector, useDispatch } from "react-redux";
import { getCarModels } from "store/automobiles/carModels/actions";
import { useFormik } from "formik";

const ComfortAndConvenienceVariant = ({ carVariant, onFormSubmit }) => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            powerSteering: carVariant?.comfortAndConvenience?.powerSteering || false,
            powerWindowsFront: carVariant?.comfortAndConvenience?.powerWindowsFront || false,
            powerWindowsRear: carVariant?.comfortAndConvenience?.powerWindowsRear || false,
            automaticClimateControl: carVariant?.comfortAndConvenience?.automaticClimateControl || false,
            airQualityControl: carVariant?.comfortAndConvenience?.airQualityControl || false,
            remoteEngine: carVariant?.comfortAndConvenience?.remoteEngine || false,
            accessoryPowerOutlet: carVariant?.comfortAndConvenience?.accessoryPowerOutlet || false,
            trunkLight: carVariant?.comfortAndConvenience?.trunkLight || false,
            vanityMirror: carVariant?.comfortAndConvenience?.vanityMirror || false,
            rearReadingLamp: carVariant?.comfortAndConvenience?.rearReadingLamp || false,
            rearSeatHeadrest: carVariant?.comfortAndConvenience?.rearSeatHeadrest || false,
            adjustibleHeadrest: carVariant?.comfortAndConvenience?.adjustibleHeadrest || false,
            rearSeatCentreArmRest: carVariant?.comfortAndConvenience?.rearSeatCentreArmRest || false,
            heightAdjustibleFrontSeatBelts: carVariant?.comfortAndConvenience?.heightAdjustibleFrontSeatBelts || false,
            cupHolderFront: carVariant?.comfortAndConvenience?.cupHolderFront || false,
            cupHolderRear: carVariant?.comfortAndConvenience?.cupHolderRear || false,
            rearAcVents: carVariant?.comfortAndConvenience?.rearAcVents || false,
            multifunctionSteeringWheel: carVariant?.comfortAndConvenience?.multifunctionSteeringWheel || false,
            cruiseControl: carVariant?.comfortAndConvenience?.cruiseControl || false,
            parkingSensors: carVariant?.comfortAndConvenience?.parkingSensors || "",
            realTimeVehicleTracking: carVariant?.comfortAndConvenience?.realTimeVehicleTracking || false,
            foldableRearSeat: carVariant?.comfortAndConvenience?.foldableRearSeat || "",
            smartAccessCardEntry: carVariant?.comfortAndConvenience?.smartAccessCardEntry || false,
            engineStartStopButton: carVariant?.comfortAndConvenience?.engineStartStopButton || false,
            gloveBoxCooling: carVariant?.comfortAndConvenience?.gloveBoxCooling || false,
            bottleHolder: carVariant?.comfortAndConvenience?.bottleHolder || "",
            voiceCommand: carVariant?.comfortAndConvenience?.voiceCommand || false,
            steeringWheelGearshiftPaddles: carVariant?.comfortAndConvenience?.steeringWheelGearshiftPaddles || false,
            usbCharger: carVariant?.comfortAndConvenience?.usbCharger || "",
            centralControlArmrest: carVariant?.comfortAndConvenience?.centralControlArmrest || "",
            handsFreeTelegate: carVariant?.comfortAndConvenience?.handsFreeTelegate || false,
            gearShiftIndicator: carVariant?.comfortAndConvenience?.gearShiftIndicator || false,
            rearCurtain: carVariant?.comfortAndConvenience?.rearCurtain || false,
            luggageHookAndNet: carVariant?.comfortAndConvenience?.luggageHookAndNet || false,
            additionalFeatures: carVariant?.comfortAndConvenience?.additionalFeatures || "",
            oneTouchOperatingPowerWindow: carVariant?.comfortAndConvenience?.oneTouchOperatingPowerWindow || "",
            driveModes: carVariant?.comfortAndConvenience?.driveModes || "",
            voiceAssistedProof: carVariant?.comfortAndConvenience?.voiceAssistedProof || false,
            chitChatVoiceInteraction: carVariant?.comfortAndConvenience?.chitChatVoiceInteraction || false,
            airConditioner: carVariant?.comfortAndConvenience?.airConditioner || false,
            heater: carVariant?.comfortAndConvenience?.heater || false,
            adjustableSteering: carVariant?.comfortAndConvenience?.adjustableSteering || false,
            keylessEntry: carVariant?.comfortAndConvenience?.keylessEntry || false,
            ventilatedSeats: carVariant?.comfortAndConvenience?.ventilatedSeats || false,
            heightAdjustibleDriverSeats: carVariant?.comfortAndConvenience?.heightAdjustibleDriverSeats || "",
            electricAdjustibleSeats: carVariant?.comfortAndConvenience?.electricAdjustibleSeats || "",
            automaticHeadlamps: carVariant?.comfortAndConvenience?.automaticHeadlamps || "",
            followMeHomeHeadlamps: carVariant?.comfortAndConvenience?.followMeHomeHeadlamps || false,
        },
        onSubmit: values => {
            if (onFormSubmit) {
                onFormSubmit('comfortAndConvenience', values, '7');
            }
        },
    });

    const { carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch]);

    const handleCheckboxChange = (field) => {
        validation.setFieldValue(field, !validation.values[field]);
    };

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
                    <CardTitle className="h4">Comfort And Convenience</CardTitle>
                    <Row>
                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="powerSteering"
                                        checked={validation.values.powerSteering}
                                        onChange={() => handleCheckboxChange('powerSteering')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerSteering"
                                    >
                                        Power Steering
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
                                        id="powerWindowsFront"
                                        checked={validation.values.powerWindowsFront}
                                        onChange={() => handleCheckboxChange('powerWindowsFront')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerWindowsFront"
                                    >
                                        Power Windows-Front
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
                                        id="powerWindowsRear"
                                        checked={validation.values.powerWindowsRear}
                                        onChange={() => handleCheckboxChange('powerWindowsRear')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerWindowsRear"
                                    >
                                        Power Windows-Rear
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
                                        id="automaticClimateControl"
                                        checked={validation.values.automaticClimateControl}
                                        onChange={() => handleCheckboxChange('automaticClimateControl')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="automaticClimateControl"
                                    >
                                        Automatic Climate Control
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
                                        id="airQualityControl"
                                        checked={validation.values.airQualityControl}
                                        onChange={() => handleCheckboxChange('airQualityControl')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="airQualityControl"
                                    >
                                        Air Quality Control
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
                                        id="remoteEngine"
                                        checked={validation.values.remoteEngine}
                                        onChange={() => handleCheckboxChange('remoteEngine')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="remoteEngine"
                                    >
                                        Remote Engine
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
                                        id="accessoryPowerOutlet"
                                        checked={validation.values.accessoryPowerOutlet}
                                        onChange={() => handleCheckboxChange('accessoryPowerOutlet')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="accessoryPowerOutlet"
                                    >
                                        Accessory Power Outlet
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
                                        id="trunkLight"
                                        checked={validation.values.trunkLight}
                                        onChange={() => handleCheckboxChange('trunkLight')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="trunkLight"
                                    >
                                        Trunk Light
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
                                        id="vanityMirror"
                                        checked={validation.values.vanityMirror}
                                        onChange={() => handleCheckboxChange('vanityMirror')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="vanityMirror"
                                    >
                                        Vanity Mirror
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
                                        id="rearReadingLamp"
                                        checked={validation.values.rearReadingLamp}
                                        onChange={() => handleCheckboxChange('rearReadingLamp')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearReadingLamp"
                                    >
                                        Rear Reading Lamp
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
                                        id="rearSeatHeadrest"
                                        checked={validation.values.rearSeatHeadrest}
                                        onChange={() => handleCheckboxChange('rearSeatHeadrest')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearSeatHeadrest"
                                    >
                                        Rear Seat Headrest
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
                                        id="adjustibleHeadrest"
                                        checked={validation.values.adjustibleHeadrest}
                                        onChange={() => handleCheckboxChange('adjustibleHeadrest')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="adjustibleHeadrest"
                                    >
                                        Adjustable Headrest
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
                                        id="rearSeatCentreArmRest"
                                        checked={validation.values.rearSeatCentreArmRest}
                                        onChange={() => handleCheckboxChange('rearSeatCentreArmRest')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearSeatCentreArmRest"
                                    >
                                        Rear Seat Centre Arm Rest
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
                                        id="heightAdjustibleFrontSeatBelts"
                                        checked={validation.values.heightAdjustibleFrontSeatBelts}
                                        onChange={() => handleCheckboxChange('heightAdjustibleFrontSeatBelts')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="heightAdjustibleFrontSeatBelts"
                                    >
                                        Height Adjustable Front Belts
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
                                        id="cupHolderFront"
                                        checked={validation.values.cupHolderFront}
                                        onChange={() => handleCheckboxChange('cupHolderFront')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="cupHolderFront"
                                    >
                                        Cup Holder Front
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
                                        id="cupHolderRear"
                                        checked={validation.values.cupHolderRear}
                                        onChange={() => handleCheckboxChange('cupHolderRear')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="cupHolderRear"
                                    >
                                        Cup Holder Rear
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
                                        id="rearAcVents"
                                        checked={validation.values.rearAcVents}
                                        onChange={() => handleCheckboxChange('rearAcVents')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearAcVents"
                                    >
                                        Rear AC Vents
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
                                        id="multifunctionSteeringWheel"
                                        checked={validation.values.multifunctionSteeringWheel}
                                        onChange={() => handleCheckboxChange('multifunctionSteeringWheel')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="multifunctionSteeringWheel"
                                    >
                                        Multifunction Steering Wheel
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
                                        id="cruiseControl"
                                        checked={validation.values.cruiseControl}
                                        onChange={() => handleCheckboxChange('cruiseControl')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="cruiseControl"
                                    >
                                        Cruise Control
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
                                        id="realTimeVehicleTracking"
                                        checked={validation.values.realTimeVehicleTracking}
                                        onChange={() => handleCheckboxChange('realTimeVehicleTracking')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="realTimeVehicleTracking"
                                    >
                                        Real-Time Vehicle Tracking
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
                                        id="smartAccessCardEntry"
                                        checked={validation.values.smartAccessCardEntry}
                                        onChange={() => handleCheckboxChange('smartAccessCardEntry')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="smartAccessCardEntry"
                                    >
                                        Smart Access Card Entry
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
                                        id="engineStartStopButton"
                                        checked={validation.values.engineStartStopButton}
                                        onChange={() => handleCheckboxChange('engineStartStopButton')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="engineStartStopButton"
                                    >
                                        Engine Start/Stop Button
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
                                        id="gloveBoxCooling"
                                        checked={validation.values.gloveBoxCooling}
                                        onChange={() => handleCheckboxChange('gloveBoxCooling')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="gloveBoxCooling"
                                    >
                                        Glove Box Cooling
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
                                        id="voiceCommand"
                                        checked={validation.values.voiceCommand}
                                        onChange={() => handleCheckboxChange('voiceCommand')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="voiceCommand"
                                    >
                                        Voice Command
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
                                        id="steeringWheelGearshiftPaddles"
                                        checked={validation.values.steeringWheelGearshiftPaddles}
                                        onChange={() => handleCheckboxChange('steeringWheelGearshiftPaddles')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="steeringWheelGearshiftPaddles"
                                    >
                                        Steering Wheel Gearshift Paddles
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
                                        id="handsFreeTelegate"
                                        checked={validation.values.handsFreeTelegate}
                                        onChange={() => handleCheckboxChange('handsFreeTelegate')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="handsFreeTelegate"
                                    >
                                        Hands-Free Tailgate
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
                                        id="gearShiftIndicator"
                                        checked={validation.values.gearShiftIndicator}
                                        onChange={() => handleCheckboxChange('gearShiftIndicator')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="gearShiftIndicator"
                                    >
                                        Gear Shift Indicator
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
                                        id="rearCurtain"
                                        checked={validation.values.rearCurtain}
                                        onChange={() => handleCheckboxChange('rearCurtain')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearCurtain"
                                    >
                                        Rear Curtain
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
                                        id="luggageHookAndNet"
                                        checked={validation.values.luggageHookAndNet}
                                        onChange={() => handleCheckboxChange('luggageHookAndNet')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="luggageHookAndNet"
                                    >
                                        Luggage Hook And Net
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
                                        id="chitChatVoiceInteraction"
                                        checked={validation.values.chitChatVoiceInteraction}
                                        onChange={() => handleCheckboxChange('chitChatVoiceInteraction')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="chitChatVoiceInteraction"
                                    >
                                        Chit Chat Voice Interaction
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
                                        id="airConditioner"
                                        checked={validation.values.airConditioner}
                                        onChange={() => handleCheckboxChange('airConditioner')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="airConditioner"
                                    >
                                        Air Conditioner
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
                                        id="heater"
                                        checked={validation.values.heater}
                                        onChange={() => handleCheckboxChange('heater')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="heater"
                                    >
                                        Heater
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
                                        id="adjustableSteering"
                                        checked={validation.values.adjustableSteering}
                                        onChange={() => handleCheckboxChange('adjustableSteering')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="adjustableSteering"
                                    >
                                        Adjustable Steering
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
                                        id="keylessEntry"
                                        checked={validation.values.keylessEntry}
                                        onChange={() => handleCheckboxChange('keylessEntry')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="keylessEntry"
                                    >
                                        Keyless Entry
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
                                        id="ventilatedSeats"
                                        checked={validation.values.ventilatedSeats}
                                        onChange={() => handleCheckboxChange('ventilatedSeats')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ventilatedSeats"
                                    >
                                        Ventilated Seats
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
                                        id="heightAdjustibleDriverSeats"
                                        checked={validation.values.heightAdjustibleDriverSeats}
                                        onChange={() => handleCheckboxChange('heightAdjustibleDriverSeats')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="heightAdjustibleDriverSeats"
                                    >
                                        Height Adjustable Driver Seats
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
                                        id="automaticHeadlamps"
                                        checked={validation.values.automaticHeadlamps}
                                        onChange={() => handleCheckboxChange('automaticHeadlamps')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="automaticHeadlamps"
                                    >
                                        Automatic Headlamps
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
                                        id="followMeHomeHeadlamps"
                                        checked={validation.values.followMeHomeHeadlamps}
                                        onChange={() => handleCheckboxChange('followMeHomeHeadlamps')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="followMeHomeHeadlamps"
                                    >
                                        Follow Me Home Headlamps
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
                                        id="electricAdjustibleSeats"
                                        checked={validation.values.electricAdjustibleSeats}
                                        onChange={() => handleCheckboxChange('electricAdjustibleSeats')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="electricAdjustibleSeats"
                                    >
                                        Electric Adjustable Seats
                                    </label>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
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
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="parkingSensors"
                            md="2"
                            className="col-form-label"
                        >
                            Parking Sensors
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="parkingSensors"
                                id="parkingSensors"
                                placeholder="Enter Parking Sensor"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.parkingSensors}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="foldableRearSeat"
                            md="2"
                            className="col-form-label"
                        >
                            Foldable Rear Seats
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="foldableRearSeat"
                                id="foldableRearSeat"
                                placeholder="Enter the Foldable Rear Seats"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.foldableRearSeat}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bottleHolder"
                            md="2"
                            className="col-form-label"
                        >
                            Bottle Holder
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="bottleHolder"
                                id="bottleHolder"
                                placeholder="Enter the Bottle Holder"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bottleHolder}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="usbCharger"
                            md="2"
                            className="col-form-label"
                        >
                            USB Charger
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="usbCharger"
                                id="usbCharger"
                                placeholder="Enter the USB charger"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.usbCharger}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="centralControlArmrest"
                            md="2"
                            className="col-form-label"
                        >
                            Central Control Armrest
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="centralControlArmrest"
                                id="centralControlArmrest"
                                placeholder="Enter the Central Control Armrest"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.centralControlArmrest}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="oneTouchOperatingPowerWindow"
                            md="2"
                            className="col-form-label"
                        >
                            One Touch Operating Power Window
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="oneTouchOperatingPowerWindow"
                                id="oneTouchOperatingPowerWindow"
                                placeholder="Enter the One Touch Operating Power Window"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.oneTouchOperatingPowerWindow}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="driveModes"
                            md="2"
                            className="col-form-label"
                        >
                            Drive Modes
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="driveModes"
                                id="driveModes"
                                placeholder="Enter the Drive Modes"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.driveModes}
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

export default ComfortAndConvenienceVariant;
