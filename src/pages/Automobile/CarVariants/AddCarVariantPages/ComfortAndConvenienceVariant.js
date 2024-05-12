import React, { useEffect, useState } from "react"

import {
    Col,
    Input,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button,
    Row
} from "reactstrap"

import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"

const ComfortAndConvenienceVariant = ({ carVariant, onFormSubmit }) => {

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
            powerSteering: (carVariant && carVariant?.comfortAndConvinience && carVariant.comfortAndConvinience?.powerSteering) || false,
            powerWindowsFront: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience.powerWindowsFront) || false,
            powerWindowsRear: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.powerWindowsRear) || false,
            automaticClimateControl: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.automaticClimateControl) || false,
            airQualityControl: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.airQualityControl) || false,
            remoteEngine: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.remoteEngine) || false,
            accessoryPowerOutlet: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.accessoryPowerOutlet) || false,
            trunkLight: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.trunkLight) || false,
            vanityMirror: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.vanityMirror) || false,
            rearReadingLamp: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.rearReadingLamp) || false,
            rearSeatHeadrest: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.rearSeatHeadrest) || false,
            adjustibleHeadrest: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.adjustibleHeadrest) || false,
            rearSeatCentreArmRest: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.rearSeatCentreArmRest) || false,
            heightAdjustibleFrontSeatBelts: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.heightAdjustibleFrontSeatBelts) || false,
            cupHolderFront: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.cupHolderFront) || false,
            cupHolderRear: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.cupHolderRear) || false,
            rearAcVents: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.rearAcVents) || false,
            multifunctionSteeringWheel: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.multifunctionSteeringWheel) || false,
            cruiseControl: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.cruiseControl) || false,
            parkingSensors: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.parkingSensors) || "",
            realTimeVehicleTracking: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.realTimeVehicleTracking) || false,
            foldableRearSeat: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.foldableRearSeat) || "",
            smartAccessCardEntry: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.smartAccessCardEntry) || false,
            engineStartStopButton: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.engineStartStopButton) || false,
            gloveBoxCooling: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.gloveBoxCooling) || false,
            bottleHolder: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.bottleHolder) || "",
            voiceCommand: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.voiceCommand) || false,
            steeringWheelGearshiftPaddles: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.steeringWheelGearshiftPaddles) || false,
            usbCharger: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.usbCharger) || "",
            centralControlArmrest: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.centralControlArmrest) || "",
            handsFreeTelegate: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.handsFreeTelegate) || false,
            gearShiftIndicator: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.gearShiftIndicator) || false,
            rearCurtain: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.rearCurtain) || false,
            luggageHookAndNet: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.luggageHookAndNet) || false,
            additionalFeatures: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.additionalFeatures) || "",
            oneTouchOperatingPowerWindow: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.oneTouchOperatingPowerWindow) || "",
            driveModes: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.driveModes) || "",
            voiceAssistedProof: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.voiceAssistedProof) || false,
            chitChatVoiceInteraction: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.chitChatVoiceInteraction) || false,
            airConditioner: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.airConditioner) || false,
            heater: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.heater) || false,
            adjustableSteering: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.adjustableSteering) || false,
            keylessEntry: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.keylessEntry) || false,
            ventilatedSeats: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.centralControlArmrest) || false,
            heightAdjustibleDriverSeats: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.heightAdjustibleDriverSeats) || "",
            electricAdjustibleSeats: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.electricAdjustibleSeats) || "",
            automaticHeadlamps: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.automaticHeadlamps) || "",
            followMeHomeHeadlamps: (carVariant && carVariant?.comfortAndConvinience && carVariant?.comfortAndConvinience?.followMeHomeHeadlamps) || "",
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
            
            if(onFormSubmit) {
            onFormSubmit('comfortAndConvenience', values, '7');
            }
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
                <CardTitle>Comfort And Convinience</CardTitle>
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
                                        id="powerSteering"
                                        {...validation.getFieldProps('powerSteering')}
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
                                        {...validation.getFieldProps('powerWindowsFront')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerWindowsFront"
                                    >
                                        Power Window Front
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
                                        {...validation.getFieldProps('powerWindowsRear')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerWindowsRear"
                                    >
                                        Power Window Rear
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
                                        {...validation.getFieldProps('automaticClimateControl')}
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
                                        {...validation.getFieldProps('airQualityControl')}
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
                                        {...validation.getFieldProps('remoteEngine')}
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
                                        {...validation.getFieldProps('accessoryPowerOutlet')}
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
                                        {...validation.getFieldProps('trunkLight')}
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
                                        {...validation.getFieldProps('vanityMirror')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="vanityMirror"
                                    >
                                        Vanity
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
                                        {...validation.getFieldProps('rearReadingLamp')}
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
                                        {...validation.getFieldProps('rearSeatHeadrest')}
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
                                        {...validation.getFieldProps('adjustibleHeadrest')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="adjustibleHeadrest"
                                    >
                                        Adjustible Headrest
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
                                        {...validation.getFieldProps('rearSeatCentreArmRest')}
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
                                        {...validation.getFieldProps('heightAdjustibleFrontSeatBelts')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="heightAdjustibleFrontSeatBelts"
                                    >
                                        Height Adjustible Front Belts
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
                                        {...validation.getFieldProps('cupHolderFront')}
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
                                        {...validation.getFieldProps('cupHolderRear')}
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
                                        {...validation.getFieldProps('rearAcVents')}
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
                                        {...validation.getFieldProps('multifunctionSteeringWheel')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="multifunctionSteeringWheel"
                                    >
                                        Multi Functional Steering Wheel
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
                                        {...validation.getFieldProps('cruiseControl')}
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
                                        {...validation.getFieldProps('realTimeVehicleTracking')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="realTimeVehicleTracking"
                                    >
                                        Real Time Vehicle Tracking
                                    </label>

                                </div>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        {/* <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="foldableRearSeat"
                                        {...validation.getFieldProps('foldableRearSeat')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="foldableRearSeat"
                                    >
                                        Foldable Rear Seat
                                    </label>

                                </div>
                            </FormGroup>
                        </Col> */}

                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="smartAccessCardEntry"
                                        {...validation.getFieldProps('smartAccessCardEntry')}
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
                                        {...validation.getFieldProps('engineStartStopButton')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="engineStartStopButton"
                                    >
                                        Engine Start And Stop
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
                                        {...validation.getFieldProps('gloveBoxCooling')}
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
                                        {...validation.getFieldProps('voiceCommand')}
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
                                        {...validation.getFieldProps('steeringWheelGearshiftPaddles')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="steeringWheelGearshiftPaddles"
                                    >
                                        Steering Wheel GearShift Paddles
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
                                        {...validation.getFieldProps('handsFreeTelegate')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="handsFreeTelegate"
                                    >
                                        Hands-Free Taligate
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
                                        {...validation.getFieldProps('gearShiftIndicator')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="gearShiftIndicator"
                                    >
                                        Feat Shift Indicator
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
                                        {...validation.getFieldProps('rearCurtain')}
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
                                        {...validation.getFieldProps('luggageHookAndNet')}
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
                                        {...validation.getFieldProps('chitChatVoiceInteraction')}
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
                                        {...validation.getFieldProps('airConditioner')}
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
                                        {...validation.getFieldProps('heater')}
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
                                        {...validation.getFieldProps('adjustableSteering')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="adjustableSteering"
                                    >
                                        Adjustible Steering
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
                                        {...validation.getFieldProps('keylessEntry')}
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
                                        {...validation.getFieldProps('ventilatedSeats')}
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
                                        {...validation.getFieldProps('heightAdjustibleDriverSeats')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="heightAdjustibleDriverSeats"
                                    >
                                        Height Adjustible Driber Seats
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
                                {...validation.getFieldProps('automaticHeadlamps')}
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
                                        {...validation.getFieldProps('followMeHomeHeadlamps')}
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
                                        {...validation.getFieldProps('electricAdjustibleSeats')}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="electricAdjustibleSeats"
                                    >
                                        Electric Adjustible Seats
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
                                placeholder="Enter the USB charger"
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
                                placeholder="Enter the Touch Opearting Power Window"
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

export default ComfortAndConvenienceVariant
