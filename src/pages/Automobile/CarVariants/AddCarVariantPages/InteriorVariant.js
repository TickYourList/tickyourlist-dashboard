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

const InteriorVariant = ({ carVariant, onFormSubmit }) => {
    // Meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            tachometer: carVariant?.interior?.tachometer ? "Y" : "N",
            electronicutiTripmeter: carVariant?.interior?.electronicutiTripmeter ? "Y" : "N",
            fabricUpholestry: carVariant?.interior?.fabricUpholestry ? "Y" : "N",
            leatherSteeringWheel: carVariant?.interior?.leatherSteeringWheel ? "Y" : "N",
            gloveCompartment: carVariant?.interior?.gloveCompartment ? "Y" : "N",
            digitalClock: carVariant?.interior?.digitalClock ? "Y" : "N",
            outsideTemperatureisplay: carVariant?.interior?.outsideTemperatureisplay ? "Y" : "N",
            digitalOdometer: carVariant?.interior?.digitalOdometer ? "Y" : "N",
            dualToneDashboard: carVariant?.interior?.dualToneDashboard ? "Y" : "N",
            additionFeatures: carVariant?.interior?.additionFeatures || "",
            digitalCluster: carVariant?.interior?.digitalCluster || "",
            digitalClusterSize: carVariant?.interior?.digitalClusterSize || 0,
            upholstery: carVariant?.interior?.upholstery || "",
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
                onFormSubmit('interior', convertedValues, '8');
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
    }, [dispatch, carModels]);

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
                    <CardTitle className="h4">Interior</CardTitle>
                    <Row>
                        {renderDropdown("tachometer", "Tachometer")}
                        {renderDropdown("electronicutiTripmeter", "Electronic Tripmeter")}
                        {renderDropdown("fabricUpholestry", "Fabric Upholstery")}
                        {renderDropdown("leatherSteeringWheel", "Leather Steering Wheel")}
                    </Row>
                    <Row>
                        {renderDropdown("gloveCompartment", "Glove Compartment")}
                        {renderDropdown("digitalClock", "Digital Clock")}
                        {renderDropdown("outsideTemperatureisplay", "Outside Temperature Display")}
                        {renderDropdown("digitalOdometer", "Digital Odometer")}
                    </Row>
                    <Row>
                        {renderDropdown("dualToneDashboard", "Dual Tone Dashboard")}
                    </Row>
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
                                name="additionFeatures"
                                id="additionFeatures"
                                placeholder="Enter your Additional Features"
                                rows="3"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.additionFeatures}
                            ></textarea>
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="digitalCluster"
                            md="2"
                            className="col-form-label"
                        >
                            Digital Cluster
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="digitalCluster"
                                id="digitalCluster"
                                placeholder="Enter your Digital Cluster"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.digitalCluster}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="digitalClusterSize"
                            md="2"
                            className="col-form-label"
                        >
                            Digital Cluster Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="number"
                                className="form-control"
                                name="digitalClusterSize"
                                id="digitalClusterSize"
                                placeholder="Enter your Digital Cluster Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.digitalClusterSize}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="upholstery"
                            md="2"
                            className="col-form-label"
                        >
                            Upholstery
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="upholstery"
                                id="upholstery"
                                placeholder="Enter your Upholstery"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.upholstery}
                            />
                        </Col>
                    </FormGroup>
                    <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Next</Button>
                </Form>
            </div>
        </React.Fragment>
    );
}

export default InteriorVariant;