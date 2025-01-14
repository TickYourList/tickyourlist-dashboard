import React, { useEffect, useState } from "react"

import {
    Container,
    Row,
    Col,
    Table,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Card,
    Form,
    FormGroup,
    Label,
    CardBody,
    CardTitle,
    CardSubtitle,
    FormFeedback,
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


const FuelPerformanceVariant = ({ carVariant, onFormSubmit, fuelType }) => {

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
            // fuelType: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.fuelType) || "",
            mileageCity: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.mileageCity) || "",
            mileageArai: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.mileageArai) || "",
            fuelTankCapacity: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.fuelTankCapacity) || "",
            emissionNormCompliance: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.emissionNormCompliance) || "",
            batteryCapacity: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.batteryCapacity) || "",
            range: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.range) || "",
            chargingTimeDC: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.chargingTimeDC) || "",
            chargingTimeAC: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.chargingTimeAC) || "",
            power: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.power) || "",
        },
        validationSchema: Yup.object({
            // fuelType: Yup.string().required(
            //     "Please Enter Fuel Type"
            // ),
            // mileageCity: Yup.string().required(
            //     "Please Enter Mileage City"
            // ),
            // mileageArai: Yup.string().required(
            //     "Please Enter Mileage Arai"
            // ),
            // fuelTankCapacity: Yup.string().required(
            //     "Please Enter Fuel Tank Capacity"
            // ),
            // emissionNormCompliance: Yup.string().required(
            //     "Please Enter Emission Norm Compliance"
            // )
        }),
        onSubmit: values => {
            console.log("values ", values);
            onFormSubmit('fuelAndPerformance', values, '4');
        },
        handleError: e => { },
    });

    function handleSelectGroup(selectedGroup) {
        setselectedGroup(selectedGroup)
    }

    const handleFuelTypeChange = (event) => {
        validation.handleChange(event);
    };

    // useEffect(() => {
    //     setCarModelsList(carModels);
    // }, [carModels]);

    return (
        <React.Fragment>
            <div>
                <CardTitle>Fuel And Performance</CardTitle>
                <p className="card-title-desc">Fill all information below</p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>

                        {fuelType !== 'Electric' && (
                            <>
                                {/* Fuel-specific fields */}
                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="mileageCity" className="col-form-label">
                                            City Mileage <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="mileageCity"
                                                id="mileageCity"
                                                placeholder="Enter your Mileage City"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.mileageCity}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="mileageArai" className="col-form-label">
                                            Arai Mileage <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="mileageArai"
                                                id="mileageArai"
                                                placeholder="Enter your Mileage Arai"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.mileageArai}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="fuelTankCapacity" className="col-form-label">
                                            Fuel Tank Capacity <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="fuelTankCapacity"
                                                id="fuelTankCapacity"
                                                placeholder="Enter your Fuel Tank Capacity"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.fuelTankCapacity}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label htmlFor="emissionNormCompliance" className="col-form-label">
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
                            </>
                        )}

                        {(fuelType === 'Electric' || fuelType === 'Hybrid') && (
                            <>
                                {/* Electric/Hybrid-specific fields */}
                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="batteryCapacity" className="col-form-label">
                                            Battery Capacity <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="batteryCapacity"
                                                id="batteryCapacity"
                                                placeholder="Enter your Battery Capacity"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.batteryCapacity}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="range" className="col-form-label">
                                            Range (Electric) <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="range"
                                                id="range"
                                                placeholder="Enter Range in Kilometers"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.range}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>

                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="chargingTimeDC" className="col-form-label">
                                         DC Charging Time <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="chargingTimeDC"
                                                id="chargingTimeDC"
                                                placeholder="e.g. 40Min-70kW-(10-80%)"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.chargingTimeDC}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="chargingTimeAC" className="col-form-label">
                                         AC Charging Time <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="chargingTimeAC"
                                                id="chargingTimeAC"
                                                placeholder="e.g. 7.9H-7.2kW-(10-80%)"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.chargingTimeAC}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>
                                <Col lg="6">
                                    <FormGroup className="mb-4" row>
                                        <Label htmlFor="power" className="col-form-label">
                                            Power <span style={{ color: 'red' }}>*</span>
                                        </Label>
                                        <Col md="10">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                name="power"
                                                id="power"
                                                placeholder="Enter Power"
                                                onChange={validation.handleChange}
                                                onBlur={validation.handleBlur}
                                                value={validation.values.power}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </>
                        )}
                    </Row>

                    <Button type="submit" color="primary" className={!validation.isValid ? "next disabled" : "next"}>
                        Next
                    </Button>
                </Form>
            </div>
        </React.Fragment>
    );
}

export default FuelPerformanceVariant
