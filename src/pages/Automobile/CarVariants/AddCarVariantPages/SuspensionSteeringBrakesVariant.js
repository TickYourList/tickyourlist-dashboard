import React, { useEffect, useState } from "react"

import {
    Row,
    Col,
    Input,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button,
} from "reactstrap"
import classnames from "classnames"
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"
import * as Yup from "yup";

const SuspensionSteeringBrakesVariant = ({ carVariant, onFormSubmit }) => {

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
            fontSuspension: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.fontSuspension) || "",
            rearSuspension: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.rearSuspension) || "",
            steeringType: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.steeringType) || "",
            steeringColumn: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.steeringColumn) || "",
            turningRadius: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.turningRadius) || "",
            frontBrakeType: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.frontBrakeType) || "",
            rearBrakeType: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.rearBrakeType) || "",
            emissionNormCompliance: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.emissionNormCompliance) || "",
            tyreSize: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.tyreSize) || "",
            tyreType: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.tyreType) || "",
            wheelSize: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.wheelSize) || "",
            alloyWheelSize: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.alloyWheelSize) || "",
            alloyWheelSizeFront: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.alloyWheelSizeFront) || "",
            alloyWheelSizeRear: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.alloyWheelSizeRear) || "",
            bootSpace: (carVariant && carVariant.suspensionAndSteeringAndBrakes && carVariant.suspensionAndSteeringAndBrakes.bootSpace) || "",
        },
        validationSchema: Yup.object({
            // fontSuspension: Yup.string().required(
            //     "Please Enter Front Suspension"
            // ),
            // rearSuspension: Yup.string().required(
            //     "Please Enter Rear Suspension"
            // ),
            // steeringType: Yup.string().required(
            //     "Please Enter Steering Type"
            // ),
            // steeringColumn: Yup.string().required(
            //     "Please Enter Steering Column"
            // ),
            // turningRadius: Yup.string().required(
            //     "Please Enter Turning Radius"
            // ),
            // frontBrakeType: Yup.string().required(
            //     "Please Enter Front Brake Type"
            // ),
            // rearBrakeType: Yup.string().required(
            //     "Please Enter Rear Brake Type"
            // ),
            // emissionNormCompliance: Yup.string().required(
            //     "Please Enter Emission Norm Compliance"
            // ),
            // tyreSize: Yup.string().required(
            //     "Please Enter Tyre Size"
            // ),
            // tyreType: Yup.string().required(
            //     "Please Enter Tyre Type"
            // ),
            // wheelSize: Yup.string().required(
            //     "Please Enter Wheel Size"
            // ),
            // alloyWheelSize: Yup.string().required(
            //     "Please Enter Alloy Wheel Size"
            // ),
            // alloyWheelSizeFront:  Yup.string().required(
            //     "Please Enter Alloy Wheel Size Front"
            // ),
            // alloyWheelSizeRear: Yup.string().required(
            //     "Please Enter Alloy Wheel Size Rear"
            // ),
            // bootSpace: Yup.string().required(
            //     "Please Enter Boot Space"
            // )
        }),
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
            onFormSubmit('suspensionAndSteeringAndBrakes', values, '5');
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
                <CardTitle>Suspension and Steering</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="fontSuspension"
                            className="col-form-label"
                        >
                            Front Suspension <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="fontSuspension"
                                id="fontSuspension"
                                placeholder="Enter your Font Suspension"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.fontSuspension}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearSuspension"
                            className="col-form-label"
                        >
                            Rear Suspension <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="rearSuspension"
                                id="rearSuspension"
                                placeholder="Enter your Rear Suspension"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.rearSuspension}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="steeringType"
                            className="col-form-label"
                        >
                            Steering Type <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="steeringType"
                                id="steeringType"
                                placeholder="Enter your Steering Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.steeringType}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="steeringColumn"
                            className="col-form-label"
                        >
                            Steering Column <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="steeringColumn"
                                id="steeringColumn"
                                placeholder="Enter your Steering Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.steeringColumn}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                  
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="turningRadius"
                            className="col-form-label"
                        >
                            Turning Radius (Metres) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="turningRadius"
                                id="turningRadius"
                                placeholder="Enter your Turning Radius"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.turningRadius}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="frontBrakeType"
                            className="col-form-label"
                        >
                            Front Brake Type <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="frontBrakeType"
                                id="frontBrakeType"
                                placeholder="Enter your Front Brake Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.frontBrakeType}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearBrakeType"
                            className="col-form-label"
                        >
                            Rear Brake Type <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="rearBrakeType"
                                id="rearBrakeType"
                                placeholder="Enter your Rear Brake Type"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.rearBrakeType}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="emissionNormCompliance"
                            className="col-form-label"
                        >
                            Emission Norm Compliance <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="emissionNormCompliance"
                                id="emissionNormCompliance"
                                placeholder="Enter your Emission Norm Compliance"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.emissionNormCompliance}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreSize"
                            className="col-form-label"
                        >
                            Tyre Size <span style={{ color: 'red' }}>*</span>
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
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreType"
                            className="col-form-label"
                        >
                            Tyre Type <span style={{ color: 'red' }}>*</span>
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
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="wheelSize"
                            className="col-form-label"
                        >
                            Wheel Size <span style={{ color: 'red' }}>*</span>
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
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="alloyWheelSize"
                            className="col-form-label"
                        >
                            Alloy Wheel Size <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="alloyWheelSize"
                                id="alloyWheelSize"
                                placeholder="Enter your Alloy Wheel Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.alloyWheelSize}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="alloyWheelSizeFront"
                            className="col-form-label"
                        >
                            Alloy Wheel Size Front <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="alloyWheelSizeFront"
                                id="alloyWheelSizeFront"
                                placeholder="Enter your Alloy Wheel Size Front"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.alloyWheelSizeFront}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>
                    
                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="alloyWheelSizeRear"
                            className="col-form-label"
                        >
                            Alloy Wheel Size Rear <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="alloyWheelSizeRear"
                                id="alloyWheelSizeRear"
                                placeholder="Enter your Alloy Wheel Size Rear"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.alloyWheelSizeRear}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bootSpace"
                            className="col-form-label"
                        >
                            Boot Space <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="bootSpace"
                                id="bootSpace"
                                placeholder="Enter your Boot Space"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bootSpace}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Button type="submit" color="primary" className={
                            !validation.isValid ? "next disabled" : "next"
                          }>Next</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default SuspensionSteeringBrakesVariant
