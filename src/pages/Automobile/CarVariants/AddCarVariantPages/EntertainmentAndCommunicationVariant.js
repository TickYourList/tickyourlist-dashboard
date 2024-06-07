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
            radio: carVariant?.entertainmentAndCommunication?.radio || false,
            speakerFront: carVariant?.entertainmentAndCommunication?.speakerFront || false,
            speakerRear: carVariant?.entertainmentAndCommunication?.speakerRear || false,
            integrated2DINAudio: carVariant?.entertainmentAndCommunication?.integrated2DINAudio || false,
            wirelessPhoneCharging: carVariant?.entertainmentAndCommunication?.wirelessPhoneCharging || false,
            bluetoothConnectivity: carVariant?.entertainmentAndCommunication?.bluetoothConnectivity || false,
            wifiConnectivity: carVariant?.entertainmentAndCommunication?.wifiConnectivity || false,
            touchScreen: carVariant?.entertainmentAndCommunication?.touchScreen || false,
            touchScreenSize: carVariant?.entertainmentAndCommunication?.touchScreenSize || "",
            connectivity: carVariant?.entertainmentAndCommunication?.connectivity || "",
            androidAuto: carVariant?.entertainmentAndCommunication?.androidAuto || false,
            appleCarPlay: carVariant?.entertainmentAndCommunication?.appleCarPlay || false,
            noOfSpeakers: carVariant?.entertainmentAndCommunication?.noOfSpeakers || "",
            additionalFeatures: carVariant?.entertainmentAndCommunication?.additionalFeatures || "",
            usbPorts: carVariant?.entertainmentAndCommunication?.usbPorts || false,
            inbuiltApps: carVariant?.entertainmentAndCommunication?.inbuiltApps || "",
            tweeter: carVariant?.entertainmentAndCommunication?.tweeter || "",
            rearTouchScreenSize: carVariant?.entertainmentAndCommunication?.rearTouchScreenSize || "",
            subWoofer: carVariant?.entertainmentAndCommunication?.subWoofer || "",
        },
        validationSchema: Yup.object({
            
        }),
        onSubmit: values => {
            // console.log("entertainment values ", values);
            console.log("values" , values);
            onFormSubmit('entertainmentAndCommunication', values, '10');
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

    return (
        <React.Fragment>
             <div>
                <CardTitle>Entertainment And Communication</CardTitle>
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
                                id="radio"
                                {...validation.getFieldProps('radio')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="radio"
                            >
                                Radio
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
                                id="speakerFront"
                                {...validation.getFieldProps('speakerFront')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="speakerFront"
                            >
                                Speaker Front
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
                                id="speakerRear"
                                {...validation.getFieldProps('speakerRear')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="speakerRear"
                            >
                                Speaker Rear
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
                                id="integrated2DINAudio"
                                {...validation.getFieldProps('integrated2DINAudio')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="integrated2DINAudio"
                            >
                                Integrated 2DIN Audio
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
                                id="wirelessPhoneCharging"
                                {...validation.getFieldProps('wirelessPhoneCharging')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="wirelessPhoneCharging"
                            >
                                Wireless Phone Charging
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
                                id="bluetoothConnectivity"
                                {...validation.getFieldProps('bluetoothConnectivity')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="bluetoothConnectivity"
                            >
                                Bluetooth Connectivity
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
                                id="wifiConnectivity"
                                {...validation.getFieldProps('wifiConnectivity')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="wifiConnectivity"
                            >
                                Wifi Connectivity
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
                                id="touchScreen"
                                {...validation.getFieldProps('touchScreen')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="touchScreen"
                            >
                                Touch Screen
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
                                id="androidAuto"
                                {...validation.getFieldProps('androidAuto')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="androidAuto"
                            >
                               Android Auto
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
                                id="appleCarPlay"
                                {...validation.getFieldProps('appleCarPlay')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="appleCarPlay"
                            >
                                Apple Car Play
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
                                id="usbPorts"
                                {...validation.getFieldProps('usbPorts')}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="usbPorts"
                            >
                                Usb Ports
                            </label>

                        </div>
                        </FormGroup>
                        </Col>

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
                                placeholder="Enter the SUb Wooler"
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


                        </Row>




                    <Button type="submit" color="primary" className={
                            !validation.isValid ? "next disabled" : "next"
                          }>Submit</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default EntertainmentAndCommunicationVariant
