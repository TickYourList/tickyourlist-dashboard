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
            powerSteering: carVariant?.comfortAndConvenience?.powerSteering ? "Y" : "N",
            powerWindowsFront: carVariant?.comfortAndConvenience?.powerWindowsFront ? "Y" : "N",
            powerWindowsRear: carVariant?.comfortAndConvenience?.powerWindowsRear ? "Y" : "N",
            automaticClimateControl: carVariant?.comfortAndConvenience?.automaticClimateControl ? "Y" : "N",
            airQualityControl: carVariant?.comfortAndConvenience?.airQualityControl ? "Y" : "N",
            remoteEngine: carVariant?.comfortAndConvenience?.remoteEngine ? "Y" : "N",
            accessoryPowerOutlet: carVariant?.comfortAndConvenience?.accessoryPowerOutlet ? "Y" : "N",
            trunkLight: carVariant?.comfortAndConvenience?.trunkLight ? "Y" : "N",
            vanityMirror: carVariant?.comfortAndConvenience?.vanityMirror ? "Y" : "N",
            rearReadingLamp: carVariant?.comfortAndConvenience?.rearReadingLamp ? "Y" : "N",
            rearSeatHeadrest: carVariant?.comfortAndConvenience?.rearSeatHeadrest ? "Y" : "N",
            adjustibleHeadrest: carVariant?.comfortAndConvenience?.adjustibleHeadrest ? "Y" : "N",
            rearSeatCentreArmRest: carVariant?.comfortAndConvenience?.rearSeatCentreArmRest ? "Y" : "N",
            heightAdjustibleFrontSeatBelts: carVariant?.comfortAndConvenience?.heightAdjustibleFrontSeatBelts ? "Y" : "N",
            cupHolderFront: carVariant?.comfortAndConvenience?.cupHolderFront ? "Y" : "N",
            cupHolderRear: carVariant?.comfortAndConvenience?.cupHolderRear ? "Y" : "N",
            rearAcVents: carVariant?.comfortAndConvenience?.rearAcVents ? "Y" : "N",
            multifunctionSteeringWheel: carVariant?.comfortAndConvenience?.multifunctionSteeringWheel ? "Y" : "N",
            cruiseControl: carVariant?.comfortAndConvenience?.cruiseControl ? "Y" : "N",
            parkingSensors: carVariant?.comfortAndConvenience?.parkingSensors || "",
            realTimeVehicleTracking: carVariant?.comfortAndConvenience?.realTimeVehicleTracking ? "Y" : "N",
            foldableRearSeat: carVariant?.comfortAndConvenience?.foldableRearSeat || "",
            smartAccessCardEntry: carVariant?.comfortAndConvenience?.smartAccessCardEntry ? "Y" : "N",
            engineStartStopButton: carVariant?.comfortAndConvenience?.engineStartStopButton ? "Y" : "N",
            gloveBoxCooling: carVariant?.comfortAndConvenience?.gloveBoxCooling ? "Y" : "N",
            bottleHolder: carVariant?.comfortAndConvenience?.bottleHolder || "",
            voiceCommand: carVariant?.comfortAndConvenience?.voiceCommand ? "Y" : "N",
            steeringWheelGearshiftPaddles: carVariant?.comfortAndConvenience?.steeringWheelGearshiftPaddles ? "Y" : "N",
            usbCharger: carVariant?.comfortAndConvenience?.usbCharger || "",
            centralControlArmrest: carVariant?.comfortAndConvenience?.centralControlArmrest || "",
            handsFreeTelegate: carVariant?.comfortAndConvenience?.handsFreeTelegate ? "Y" : "N",
            gearShiftIndicator: carVariant?.comfortAndConvenience?.gearShiftIndicator ? "Y" : "N",
            rearCurtain: carVariant?.comfortAndConvenience?.rearCurtain ? "Y" : "N",
            luggageHookAndNet: carVariant?.comfortAndConvenience?.luggageHookAndNet ? "Y" : "N",
            additionalFeatures: carVariant?.comfortAndConvenience?.additionalFeatures || "",
            oneTouchOperatingPowerWindow: carVariant?.comfortAndConvenience?.oneTouchOperatingPowerWindow || "",
            driveModes: carVariant?.comfortAndConvenience?.driveModes || "",
            voiceAssistedProof: carVariant?.comfortAndConvenience?.voiceAssistedProof ? "Y" : "N",
            chitChatVoiceInteraction: carVariant?.comfortAndConvenience?.chitChatVoiceInteraction ? "Y" : "N",
            airConditioner: carVariant?.comfortAndConvenience?.airConditioner ? "Y" : "N",
            heater: carVariant?.comfortAndConvenience?.heater ? "Y" : "N",
            adjustableSteering: carVariant?.comfortAndConvenience?.adjustableSteering ? "Y" : "N",
            keylessEntry: carVariant?.comfortAndConvenience?.keylessEntry ? "Y" : "N",
            ventilatedSeats: carVariant?.comfortAndConvenience?.ventilatedSeats ? "Y" : "N",
            heightAdjustibleDriverSeats: carVariant?.comfortAndConvenience?.heightAdjustibleDriverSeats || "",
            electricAdjustibleSeats: carVariant?.comfortAndConvenience?.electricAdjustibleSeats || "",
            automaticHeadlamps: carVariant?.comfortAndConvenience?.automaticHeadlamps || "",
            followMeHomeHeadlamps: carVariant?.comfortAndConvenience?.followMeHomeHeadlamps ? "Y" : "N",
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
                onFormSubmit('comfortAndConvenience', convertedValues, '7');
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
                    <CardTitle className="h4">Comfort And Convenience</CardTitle>
                    <Row>
                        {renderDropdown("powerSteering", "Power Steering")}
                        {renderDropdown("powerWindowsFront", "Power Windows-Front")}
                        {renderDropdown("powerWindowsRear", "Power Windows-Rear")}
                        {renderDropdown("automaticClimateControl", "Automatic Climate Control")}
                    </Row>
                    <Row>
                        {renderDropdown("airQualityControl", "Air Quality Control")}
                        {renderDropdown("remoteEngine", "Remote Engine")}
                        {renderDropdown("accessoryPowerOutlet", "Accessory Power Outlet")}
                        {renderDropdown("trunkLight", "Trunk Light")}
                    </Row>
                    <Row>
                        {renderDropdown("vanityMirror", "Vanity Mirror")}
                        {renderDropdown("rearReadingLamp", "Rear Reading Lamp")}
                        {renderDropdown("rearSeatHeadrest", "Rear Seat Headrest")}
                        {renderDropdown("adjustibleHeadrest", "Adjustable Headrest")}
                    </Row>
                    <Row>
                        {renderDropdown("rearSeatCentreArmRest", "Rear Seat Centre Arm Rest")}
                        {renderDropdown("heightAdjustibleFrontSeatBelts", "Height Adjustable Front Belts")}
                        {renderDropdown("cupHolderFront", "Cup Holder Front")}
                        {renderDropdown("cupHolderRear", "Cup Holder Rear")}
                    </Row>
                    <Row>
                        {renderDropdown("rearAcVents", "Rear AC Vents")}
                        {renderDropdown("multifunctionSteeringWheel", "Multifunction Steering Wheel")}
                        {renderDropdown("cruiseControl", "Cruise Control")}
                        {renderDropdown("realTimeVehicleTracking", "Real-Time Vehicle Tracking")}
                    </Row>
                    <Row>
                        {renderDropdown("smartAccessCardEntry", "Smart Access Card Entry")}
                        {renderDropdown("engineStartStopButton", "Engine Start/Stop Button")}
                        {renderDropdown("gloveBoxCooling", "Glove Box Cooling")}
                        {renderDropdown("voiceCommand", "Voice Command")}
                    </Row>
                    <Row>
                        {renderDropdown("steeringWheelGearshiftPaddles", "Steering Wheel Gearshift Paddles")}
                        {renderDropdown("handsFreeTelegate", "Hands-Free Tailgate")}
                        {renderDropdown("gearShiftIndicator", "Gear Shift Indicator")}
                        {renderDropdown("rearCurtain", "Rear Curtain")}
                    </Row>
                    <Row>
                        {renderDropdown("luggageHookAndNet", "Luggage Hook And Net")}
                        {renderDropdown("chitChatVoiceInteraction", "Chit Chat Voice Interaction")}
                        {renderDropdown("airConditioner", "Air Conditioner")}
                        {renderDropdown("heater", "Heater")}
                    </Row>
                    <Row>
                        {renderDropdown("adjustableSteering", "Adjustable Steering")}
                        {renderDropdown("keylessEntry", "Keyless Entry")}
                        {renderDropdown("ventilatedSeats", "Ventilated Seats")}
                        {renderDropdown("followMeHomeHeadlamps", "Follow Me Home Headlamps")}
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
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="heightAdjustibleDriverSeats"
                            md="2"
                            className="col-form-label"
                        >
                            Height Adjustable Driver Seats
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="heightAdjustibleDriverSeats"
                                id="heightAdjustibleDriverSeats"
                                placeholder="Enter Height Adjustable Driver Seats"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.heightAdjustibleDriverSeats}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="electricAdjustibleSeats"
                            md="2"
                            className="col-form-label"
                        >
                            Electric Adjustable Seats
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="electricAdjustibleSeats"
                                id="electricAdjustibleSeats"
                                placeholder="Enter Electric Adjustable Seats"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.electricAdjustibleSeats}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="automaticHeadlamps"
                            md="2"
                            className="col-form-label"
                        >
                            Automatic Headlamps
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="automaticHeadlamps"
                                id="automaticHeadlamps"
                                placeholder="Enter Automatic Headlamps"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.automaticHeadlamps}
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