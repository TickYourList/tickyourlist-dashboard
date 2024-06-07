import React, { useEffect } from "react";
import {
    Col,
    Form,
    FormGroup,
    Label,
    Button,
    Input,
    Row,
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
            tachometer: carVariant?.interior?.tachometer || false,
            electronicutiTripmeter: carVariant?.interior?.electronicutiTripmeter || false,
            fabricUpholestry: carVariant?.interior?.fabricUpholestry || false,
            leatherSteeringWheel: carVariant?.interior?.leatherSteeringWheel || false,
            gloveCompartment: carVariant?.interior?.gloveCompartment || false,
            digitalClock: carVariant?.interior?.digitalClock || false,
            outsideTemperatureisplay: carVariant?.interior?.outsideTemperatureisplay || false,
            digitalOdometer: carVariant?.interior?.digitalOdometer || false,
            dualToneDashboard: carVariant?.interior?.dualToneDashboard || false,
            additionFeatures: carVariant?.interior?.additionFeatures || "",
            digitalCluster: carVariant?.interior?.digitalCluster || "",
            digitalClusterSize: carVariant?.interior?.digitalClusterSize || 0,
            upholstery: carVariant?.interior?.upholstery || "",
        },
        onSubmit: values => {
            onFormSubmit('interior', values, '8');
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

    const handleCheckboxChange = (e) => {
        console.log('xsdsd ')
        const { name, checked } = e.target;
        validation.setFieldValue(name, checked);
    };

    return (
        <React.Fragment>
            <div>
                <h4>Interior</h4>
                <p>Fill all information below</p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="tachometer"
                                        name="tachometer"
                                        checked={validation.values.tachometer}
                                        onChange={(e) => handleCheckboxChange(e)}
                                    />
                                    <Label className="form-check-label" htmlFor="tachometer">
                                        Tachometer
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="electronicutiTripmeter"
                                        name="electronicutiTripmeter"
                                        checked={validation.values.electronicutiTripmeter}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="electronicutiTripmeter">
                                        Electronic Tripmeter
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="fabricUpholestry"
                                        name="fabricUpholestry"
                                        checked={validation.values.fabricUpholestry}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="fabricUpholestry">
                                        Fabric Upholstery
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="leatherSteeringWheel"
                                        name="leatherSteeringWheel"
                                        checked={validation.values.leatherSteeringWheel}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="leatherSteeringWheel">
                                        Leather Steering Wheel
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="gloveCompartment"
                                        name="gloveCompartment"
                                        checked={validation.values.gloveCompartment}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="gloveCompartment">
                                        Glove Compartment
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="digitalClock"
                                        name="digitalClock"
                                        checked={validation.values.digitalClock}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="digitalClock">
                                        Digital Clock
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="outsideTemperatureisplay"
                                        name="outsideTemperatureisplay"
                                        checked={validation.values.outsideTemperatureisplay}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="outsideTemperatureisplay">
                                        Outside Temperature Display
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg="3">
                            <FormGroup className="mb-4">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="digitalOdometer"
                                        name="digitalOdometer"
                                        checked={validation.values.digitalOdometer}
                                        onChange={handleCheckboxChange}
                                    />
                                    <Label className="form-check-label" htmlFor="digitalOdometer">
                                        Digital Odometer
                                    </Label>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup className="mb-4">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="dualToneDashboard"
                                name="dualToneDashboard"
                                checked={validation.values.dualToneDashboard}
                                onChange={handleCheckboxChange}
                            />
                            <Label className="form-check-label" htmlFor="dualToneDashboard">
                                Dual Tone Dashboard
                            </Label>
                        </div>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label htmlFor="additionFeatures" md="2" className="col-form-label">
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
                        <Label htmlFor="digitalCluster" md="2" className="col-form-label">
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
                        <Label htmlFor="digitalClusterSize" md="2" className="col-form-label">
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
                        <Label htmlFor="upholstery" md="2" className="col-form-label">
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
