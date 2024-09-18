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
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"
import * as Yup from "yup";

const EngineAndTransmissionVariant = ({ carVariant, onFormSubmit, fuelType }) => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();
    const [selectedGroup, setselectedGroup] = useState(null)
    // const [carModelsList, setCarModelsList] = useState([]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            engineType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.engineType) || "",
            motorType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.motorType) || "",
            batteryType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.batteryType) || "",
            chargingPort: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.chargingPort) || "",
            fastCharging: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.fastCharging) || "",
            displacement: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.displacement) || "",
            noOfCylinders: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.noOfCylinders) || "",
            maxPower: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.maxPower) || "",
            maxTorque: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.maxTorque) || "",
            valuePerCylinder: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.valuePerCylinder) || "",
            fuelSupplySystem: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.fuelSupplySystem) || "",
            compressionRatio: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.compressionRatio) || "",
            turboCharge: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.turboCharge) || "",
            transmissionType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.transmissionType) || "",
            gearBox: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.gearBox) || "",
            mildHybrid: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.mildHybrid) || "",
            driverType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.driverType) || "",
            cluchType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.cluchType) || "",
        },
        validationSchema: Yup.object({
            // engineType: Yup.string().required(
            //     "Please Enter the Engine Type"
            // ),
            // displacement: Yup.string().required(
            //     "Please Enter the displacement"
            // ),
            // noOfCylinders: Yup.string().required(
            //     "Please Enter Number of Cylinders"
            // ),
            // maxPower: Yup.string().required(
            //     "Please Enter the max power"
            // ),
            // maxTorque: Yup.string().required(
            //     "Please Enter the max torque"
            // ),
            // valuePerCylinder: Yup.string().required(
            //     "Please Enter the values Per Cylinder"
            // ),
            // fuelSupplySystem: Yup.string().required(
            //     "Please Enter Fuel Supply System"
            // ),
            // compressionRatio: Yup.string().required(
            //     "Please Enter Compression Rate"
            // ),
            // turboCharge: Yup.string().required(
            //     "Please Enter Turbo Charge"
            // ),
            // transmissionType: Yup.string().required(
            //     "Please Enter Transmission type"
            // ),
            // gearBox: Yup.string().required(
            //     "Please Enter Geat Box"
            // ),
            // mildHybrid: Yup.string().required(
            //     "Please Enter Mild Hybrid"
            // ),
            // driverType: Yup.string().required(
            //     "Please Enter Driver Type"
            // ),
            // cluchType: Yup.string().required(
            //     "Please Enter Clutch Type"
            // )
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
                onFormSubmit('engineAndTransmission', values, '3');
        
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
                <CardTitle>Engine And Transmission</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                {(fuelType === 'Electric' || fuelType === 'Hybrid') && (
                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="motorType"
                                    className="col-form-label"
                                >
                                    Motor Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="motorType"
                                        id="motorType"
                                        placeholder="Enter your Motor Type"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.motorType}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="batteryType"
                                    className="col-form-label"
                                >
                                    Battery Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="batteryType"
                                        id="batteryType"
                                        placeholder="Enter your Battery Type"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.batteryType}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>)}
                {fuelType !== "Electric" && (
                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="engineType"
                                    className="col-form-label"
                                >
                                    Engine Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="engineType"
                                        id="engineType"
                                        placeholder="Enter your Engine Type"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.engineType}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="displacement"
                                    className="col-form-label"
                                >
                                    Displacement <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="displacement"
                                        id="displacement"
                                        placeholder="Enter your Displacement"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.displacement}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>)}

                    <Row>
                    {fuelType !== "Electric" && (
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="noOfCylinders"
                                    className="col-form-label"
                                >
                                    Number of Cylinders <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="noOfCylinders"
                                        id="noOfCylinders"
                                        placeholder="Enter your Number of Cylinders"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.noOfCylinders}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    )}
                    {(fuelType === 'Electric' || fuelType === 'Hybrid') && (
                        <Col lg="6">
                        <FormGroup className="mb-4" row>
                            <Label
                                htmlFor="chargingPort"
                                className="col-form-label"
                            >
                                Charging Port <span style={{ color: 'red' }}>*</span>
                            </Label>
                            <Col md="10">
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="chargingPort"
                                    id="chargingPort"
                                    placeholder="Enter the Charging Port"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.chargingPort}
                                />
                            </Col>
                        </FormGroup>
                    </Col>
                    )}
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="maxPower"
                                    className="col-form-label"
                                >
                                    Max Power (bhp@rpm) <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="maxPower"
                                        id="maxPower"
                                        placeholder="Enter your Max Power"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.maxPower}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="maxTorque"
                                    className="col-form-label"
                                >
                                    Max Torque (nm@rpm) <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="maxTorque"
                                        id="maxTorque"
                                        placeholder="Enter your MaxTorque"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.maxTorque}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                        {(fuelType === 'Electric' || fuelType === 'Hybrid') && (
                        <Col lg="6">
                        <FormGroup className="mb-4" row>
                            <Label
                                htmlFor="fastCharging"
                                className="col-form-label"
                            >
                                Fast Charging <span style={{ color: 'red' }}>*</span>
                            </Label>
                            <Col md="10">
                                <Input
                                    type="select"
                                    className="form-control"
                                    name="fastCharging"
                                    id="fastCharging"
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    value={validation.values.fastCharging}
                                >
                                    <option value="">Select the Charging</option>
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </Input>
                            </Col>
                        </FormGroup>
                    </Col>
                    )}

                        {fuelType !== "Electric" && (
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="valuePerCylinder"
                                    className="col-form-label"
                                >
                                    Valves Per Cylinder <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="valuePerCylinder"
                                        id="valuePerCylinder"
                                        placeholder="Enter your Value Per Cylinder"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.valuePerCylinder}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                        )}
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="fuelSupplySystem"
                                    className="col-form-label"
                                >
                                    Fuel Supply System <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="fuelSupplySystem"
                                        id="fuelSupplySystem"
                                        placeholder="Enter your Fuel Supply System"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.fuelSupplySystem}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>

                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="compressionRatio"
                                    className="col-form-label"
                                >
                                    Compression Ratio <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="compressionRatio"
                                        id="compressionRatio"
                                        placeholder="Enter your Compression Ratio"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.compressionRatio}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="turboCharge"
                                    className="col-form-label"
                                >
                                    Turbo Charge <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="turboCharge"
                                        id="turboCharge"
                                        placeholder="Enter your Tyrbo Charge"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.turboCharge}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label htmlFor="transmissionType" className="col-form-label">
                                    Transmission Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="select"
                                        className="form-control"
                                        name="transmissionType"
                                        id="transmissionType"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.transmissionType}
                                    >
                                        <option value="">Select Transmission Type</option>
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </Input>
                                </Col>
                            </FormGroup>

                        </Col>
                    </Row>

                    <Row>
                    {fuelType !== "Electric" && (
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="gearBox"
                                    className="col-form-label"
                                >
                                    Gear Box <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="gearBox"
                                        id="gearBox"
                                        placeholder="Enter your Gear Box"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.gearBox}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    )}

                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="mildHybrid"
                                    className="col-form-label"
                                >
                                    Mild Hybrid <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="mildHybrid"
                                        id="mildHybrid"
                                        placeholder="Enter your Mild Hybrid"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.mildHybrid}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="driverType"
                                    className="col-form-label"
                                >
                                    Driver Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="driverType"
                                        id="driverType"
                                        placeholder="Enter your Driver Type"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.driverType}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>

                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="cluchType"
                                    className="col-form-label"
                                >
                                    clutch Type <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="cluchType"
                                        id="cluchType"
                                        placeholder="Enter your Clutch Type"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.cluchType}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Next</Button>
                </Form>

                {/* <Row className="mt-4">
                                    <Col sm="6">
                                        <Link
                                            to="/ecommerce-cart"
                                            className="btn text-muted d-none d-sm-inline-block btn-link"
                                        >
                                            <i className="mdi mdi-arrow-left me-1" /> Back to
                                            Shopping Cart{" "}
                                        </Link>
                                    </Col>
                                    <Col sm="6">
                                        <div className="text-sm-end btn btn-success">
                                            <Link
                                                to="/add-car-variant"
                                                className="btn btn-success"
                                            >
                                                <i className="mdi mdi-truck-fast me-1" /> Proceed to
                                                Shipping{" "}
                                            </Link>
                                        </div>
                                    </Col>
                                </Row> */}


            </div>
        </React.Fragment>
    )
}

export default EngineAndTransmissionVariant
