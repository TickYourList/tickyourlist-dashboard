import React, { useEffect, useState } from "react"

import {
    Row,
    Col,
    Input,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button
} from "reactstrap"
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"

const EntertainmentAndCommunicationVariant = ({ carVariant, onFormSubmit }) => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            radio: carVariant?.entertainmentAndCommunication?.radio ? "Y" : "N",
            speakerFront: carVariant?.entertainmentAndCommunication?.speakerFront ? "Y" : "N",
            speakerRear: carVariant?.entertainmentAndCommunication?.speakerRear ? "Y" : "N",
            integrated2DINAudio: carVariant?.entertainmentAndCommunication?.integrated2DINAudio ? "Y" : "N",
            wirelessPhoneCharging: carVariant?.entertainmentAndCommunication?.wirelessPhoneCharging ? "Y" : "N",
            bluetoothConnectivity: carVariant?.entertainmentAndCommunication?.bluetoothConnectivity ? "Y" : "N",
            wifiConnectivity: carVariant?.entertainmentAndCommunication?.wifiConnectivity ? "Y" : "N",
            touchScreen: carVariant?.entertainmentAndCommunication?.touchScreen ? "Y" : "N",
            touchScreenSize: carVariant?.entertainmentAndCommunication?.touchScreenSize || "",
            connectivity: carVariant?.entertainmentAndCommunication?.connectivity || "",
            androidAuto: carVariant?.entertainmentAndCommunication?.androidAuto ? "Y" : "N",
            appleCarPlay: carVariant?.entertainmentAndCommunication?.appleCarPlay ? "Y" : "N",
            noOfSpeakers: carVariant?.entertainmentAndCommunication?.noOfSpeakers || "",
            additionalFeatures: carVariant?.entertainmentAndCommunication?.additionalFeatures || "",
            usbPorts: carVariant?.entertainmentAndCommunication?.usbPorts ? "Y" : "N",
            inbuiltApps: carVariant?.entertainmentAndCommunication?.inbuiltApps || "",
            tweeter: carVariant?.entertainmentAndCommunication?.tweeter || "",
            rearTouchScreenSize: carVariant?.entertainmentAndCommunication?.rearTouchScreenSize || "",
            subWoofer: carVariant?.entertainmentAndCommunication?.subWoofer || "",
        },
        validationSchema: Yup.object({
            
        }),
        onSubmit: values => {
            const convertedValues = Object.keys(values).reduce((acc, key) => {
                if (values[key] === "Y" || values[key] === "N") {
                    acc[key] = values[key] === "Y";
                } else {
                    acc[key] = values[key];
                }
                return acc;
            }, {});

            onFormSubmit('entertainmentAndCommunication', convertedValues, '10');
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
                <CardTitle className="h4">Entertainment And Communication</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form
                    className="needs-validation"
                    onSubmit={e => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                    }}
                >
                    <Row>
                        {renderDropdown("radio", "Radio")}
                        {renderDropdown("speakerFront", "Speaker Front")}
                        {renderDropdown("speakerRear", "Speaker Rear")}
                        {renderDropdown("integrated2DINAudio", "Integrated 2DIN Audio")}
                    </Row>
                    <Row>
                        {renderDropdown("wirelessPhoneCharging", "Wireless Phone Charging")}
                        {renderDropdown("bluetoothConnectivity", "Bluetooth Connectivity")}
                        {renderDropdown("wifiConnectivity", "Wifi Connectivity")}
                        {renderDropdown("touchScreen", "Touch Screen")}
                    </Row>
                    <Row>
                        {renderDropdown("androidAuto", "Android Auto")}
                        {renderDropdown("appleCarPlay", "Apple Car Play")}
                        {renderDropdown("usbPorts", "Usb Ports")}
                    </Row>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="touchScreenSize"
                            md="2"
                            className="col-form-label"
                        >
                            Touch Screen Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="touchScreenSize"
                                id="touchScreenSize"
                                placeholder="Enter Touch Screen Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.touchScreenSize}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="connectivity"
                            md="2"
                            className="col-form-label"
                        >
                            Connectivity
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="connectivity"
                                id="connectivity"
                                placeholder="Enter Connectivity"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.connectivity}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="noOfSpeakers"
                            md="2"
                            className="col-form-label"
                        >
                            No of Speakers
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="noOfSpeakers"
                                id="noOfSpeakers"
                                placeholder="Enter No of Speakers"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.noOfSpeakers}
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
                            htmlFor="inbuiltApps"
                            md="2"
                            className="col-form-label"
                        >
                            Inbuilt Apps
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="inbuiltApps"
                                id="inbuiltApps"
                                placeholder="Enter Inbuilt Apps"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.inbuiltApps}
                            />
                        </Col>
                    </FormGroup>  
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tweeter"
                            md="2"
                            className="col-form-label"
                        >
                            Tweeter
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="tweeter"
                                id="tweeter"
                                placeholder="Enter the Tweeter"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.tweeter}
                            />
                        </Col>
                    </FormGroup> 
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="subWoofer"
                            md="2"
                            className="col-form-label"
                        >
                            SubWoofer
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="subWoofer"
                                id="subWoofer"
                                placeholder="Enter the Sub Woofer"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.subWoofer}
                            />
                        </Col>
                    </FormGroup>      
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearTouchScreenSize"
                            md="2"
                            className="col-form-label"
                        >
                            Rear Touch Screen Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="rearTouchScreenSize"
                                id="rearTouchScreenSize"
                                placeholder="Enter the Rear touch screen size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.rearTouchScreenSize}
                            />
                        </Col>
                    </FormGroup>              
                    <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Submit</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default EntertainmentAndCommunicationVariant