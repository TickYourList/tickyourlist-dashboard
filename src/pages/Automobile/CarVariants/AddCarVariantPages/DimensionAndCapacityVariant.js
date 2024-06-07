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
import Select from "react-select"
import { Link } from "react-router-dom"
import * as Yup from "yup";

import classnames from "classnames"

import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"
import Switch from "react-switch";

const DimensionAndCapacityVariant = ({ carVariant, onFormSubmit }) => {

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
            length: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.length) || "",
            width: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.width) || "",
            height: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.height) || "",
            groundClearanceUnladen: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.groundClearanceUnladen) || "",
            wheelBase: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.wheelBase) || "",
            frontTread: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.frontTread) || "",
            rearTread: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.rearTread) || "",
            kerbWeight: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.kerbWeight) || "",
            grossWeight: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.grossWeight) || "",
            seatingCapacity: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.seatingCapacity) || "",
            bootSpace: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.bootSpace) || "",
            noOfDoors: (carVariant && carVariant.dimensionAndCapacity && carVariant.dimensionAndCapacity.noOfDoors) || "",
        },
        validationSchema: Yup.object({
            // length: Yup.string().required(
            //     "Please Enter the length"
            // ),
            // width: Yup.string().required(
            //     "Please Enter the width"
            // ),
            // height: Yup.string().required(
            //     "Please Enter the height"
            // ),
            // groundClearanceUnladen: Yup.string().required(
            //     "Please Enter ther ground cleanrance unleaden"
            // ),
            // wheelBase: Yup.string().required(
            //     "Please Enter the wheelbase"
            // ),
            // frontTread: Yup.string().required(
            //     "Please Enter the front Tread"
            // ),
            // rearTread: Yup.string().required(
            //     "Please Enter the rear Tread"
            // ),
            // kerbWeight: Yup.string().required(
            //     "Please Enter the Kerb Weight"
            // ),
            // grossWeight: Yup.string().required(
            //     "Please Enter the gross weight"
            // ),
            // seatingCapacity: Yup.string().required(
            //     "Please Enter the seating capacity"
            // ),
            // bootSpace: Yup.string().required(
            //     "Please Enter the boot space"
            // ),
            // noOfDoors: Yup.string().required(
            //     "Please Enter number of doors"
            // ),
        }),
        onSubmit: values => {
            console.log("values ", values);
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
            onFormSubmit('dimensionAndCapacity', values, '6');
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
                <CardTitle>Dimension and Capacity</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="length"
                            className="col-form-label"
                        >
                            Length (mm) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="length"
                                id="length"
                                placeholder="Enter your Length"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.length}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="width"
                            className="col-form-label"
                        >
                            Width (mm)<span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="width"
                                id="width"
                                placeholder="Enter your Width"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.width}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="height"
                            className="col-form-label"
                        >
                            Height (mm)<span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="height"
                                id="height"
                                placeholder="Enter your Height"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.height}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="groundClearanceUnladen"
                            className="col-form-label"
                        >
                            Ground Clearance Unladen (mm)<span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="groundClearanceUnladen"
                                id="groundClearanceUnladen"
                                placeholder="Enter your Ground Clearance Unladen"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.groundClearanceUnladen}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="wheelBase"
                            className="col-form-label"
                        >
                            Wheel Base (mm) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="wheelBase"
                                id="wheelBase"
                                placeholder="Enter your Wheel Base"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.wheelBase}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="frontTread"
                            className="col-form-label"
                        >
                            Front Tread (mm) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="frontTread"
                                id="frontTread"
                                placeholder="Enter your Front Tread"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.frontTread}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="rearTread"
                            className="col-form-label"
                        >
                            Rear Tread (mm) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="rearTread"
                                id="rearTread"
                                placeholder="Enter your Rear Tread"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.rearTread}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="kerbWeight"
                            className="col-form-label"
                        >
                            Kerb Weight (mm) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="kerbWeight"
                                id="kerbWeight"
                                placeholder="Enter your Kerb Weight"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.kerbWeight}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="grossWeight"
                            className="col-form-label"
                        >
                            Gross Weight (kg) <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="grossWeight"
                                id="grossWeight"
                                placeholder="Enter your Gross Weight"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.grossWeight}
                            />
                        </Col>
                    </FormGroup>
                    </Col>

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="seatingCapacity"
                            className="col-form-label"
                        >
                            Seating Capacity <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="seatingCapacity"
                                id="seatingCapacity"
                                placeholder="Enter your Seating Capacity"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.seatingCapacity}
                            />
                        </Col>
                    </FormGroup>
                    </Col>
                    </Row>

                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bootSpace"
                            className="col-form-label"
                        >
                            Boot Space (Litres) <span style={{ color: 'red' }}>*</span>
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

                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="noOfDoors"
                            className="col-form-label"
                        >
                            Number Of Doors <span style={{ color: 'red' }}>*</span>
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="noOfDoors"
                                id="noOfDoors"
                                placeholder="Enter your Number Of Doors"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.noOfDoors}
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

export default DimensionAndCapacityVariant
