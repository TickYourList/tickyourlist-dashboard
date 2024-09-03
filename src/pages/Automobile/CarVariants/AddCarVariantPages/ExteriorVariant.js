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

const ExteriorVariant = ({ carVariant, onFormSubmit }) => {
    // Meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            bodyType: carVariant?.exterior?.bodyType || "",
            adjustableHeadlights: carVariant?.exterior?.adjustableHeadlights || "",
            fogLightsFront: carVariant?.exterior?.fogLightsFront ? "Y" : "N",
            powerAdjustableExteriorRearViewMirror: carVariant?.exterior?.powerAdjustableExteriorRearViewMirror ? "Y" : "N",
            manuallyAdjustableExtRearViewMirror: carVariant?.exterior?.manuallyAdjustableExtRearViewMirror ? "Y" : "N",
            electricFoldingRearViewMirror: carVariant?.exterior?.electricFoldingRearViewMirror ? "Y" : "N",
            rearWindowWiper: carVariant?.exterior?.rearWindowWiper ? "Y" : "N",
            rearWindowWasher: carVariant?.exterior?.rearWindowWasher ? "Y" : "N",
            rearWindowDefogger: carVariant?.exterior?.rearWindowDefogger ? "Y" : "N",
            wheelCovers: carVariant?.exterior?.wheelCovers ? "Y" : "N",
            alloyWheels: carVariant?.exterior?.alloyWheels ? "Y" : "N",
            powerAntenna: carVariant?.exterior?.powerAntenna ? "Y" : "N",
            rearSpoiler: carVariant?.exterior?.rearSpoiler ? "Y" : "N",
            outsideRearViewMirrorTurnIndicators: carVariant?.exterior?.outsideRearViewMirrorTurnIndicators ? "Y" : "N",
            integratedAntenna: carVariant?.exterior?.integratedAntenna ? "Y" : "N",
            chromeGrille: carVariant?.exterior?.chromeGrille ? "Y" : "N",
            chromeGarnish: carVariant?.exterior?.chromeGarnish ? "Y" : "N",
            projectorHeadlamps: carVariant?.exterior?.projectorHeadlamps ? "Y" : "N",
            halogenHeadlamps: carVariant?.exterior?.halogenHeadlamps ? "Y" : "N",
            roofRail: carVariant?.exterior?.roofRail ? "Y" : "N",
            ledDrls: carVariant?.exterior?.ledDrls ? "Y" : "N",
            ledHeadlights: carVariant?.exterior?.ledHeadlights ? "Y" : "N",
            ledTaillights: carVariant?.exterior?.ledTaillights ? "Y" : "N",
            ledFogLamps: carVariant?.exterior?.ledFogLamps ? "Y" : "N",
            additionalFeatures: carVariant?.exterior?.additionalFeatures || "",
            fogLights: carVariant?.exterior?.fogLights ? "Y" : "N",
            antenna: carVariant?.exterior?.antenna || "",
            bootOpening: carVariant?.exterior?.bootOpening || "",
            puddleLamps: carVariant?.exterior?.puddleLamps || "",
            tyreSize: carVariant?.exterior?.tyreSize || "",
            tyreType: carVariant?.exterior?.tyreType || "",
            wheelSize: carVariant?.exterior?.wheelSize || "",
            allowWheelSize: carVariant?.exterior?.allowWheelSize || "",
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
                onFormSubmit('exterior', convertedValues, '9');
            }
        }
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
                    <CardTitle className="h4">Exterior</CardTitle>
                    <Row>
                        {renderDropdown("rearWindowWiper", "Rear Window Wiper")}
                        {renderDropdown("rearWindowWasher", "Rear Window Washer")}
                        {renderDropdown("rearWindowDefogger", "Rear Window Defogger")}
                        {renderDropdown("wheelCovers", "Wheel Covers")}
                    </Row>
                    <Row>
                        {renderDropdown("alloyWheels", "Alloy Wheels")}
                        {renderDropdown("powerAntenna", "Power Antenna")}
                        {renderDropdown("rearSpoiler", "Rear Spoiler")}
                        {renderDropdown("outsideRearViewMirrorTurnIndicators", "Outside Rear View Mirror Turn Indicators")}
                    </Row>
                    <Row>
                        {renderDropdown("integratedAntenna", "Integrated Antenna")}
                        {renderDropdown("chromeGrille", "Chrome Grille")}
                        {renderDropdown("chromeGarnish", "Chrome Garnish")}
                        {renderDropdown("projectorHeadlamps", "Projector Headlamps")}
                    </Row>
                    <Row>
                        {renderDropdown("halogenHeadlamps", "Halogen Headlamps")}
                        {renderDropdown("roofRail", "Roof Rail")}
                        {renderDropdown("ledDrls", "LED DRLs")}
                        {renderDropdown("ledHeadlights", "LED Headlights")}
                    </Row>
                    <Row>
                        {renderDropdown("ledTaillights", "LED Taillights")}
                        {renderDropdown("ledFogLamps", "LED Fog Lamps")}
                        {renderDropdown("fogLights", "Fog Lights")}
                        {renderDropdown("fogLightsFront", "Fog Lights Front")}
                    </Row>
                     <Row>
                        {renderDropdown("powerAdjustableExteriorRearViewMirror", "Power Adjustable Exterior Rear View Mirror")}
                        {renderDropdown("manuallyAdjustableExtRearViewMirror", "Manually Adjustable Exterior Rear View Mirror")}
                        {renderDropdown("electricFoldingRearViewMirror", "Electric Folding Rear View Mirror")}
                    </Row>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bodyType"
                            md="2"
                            className="col-form-label"
                        >
                            Body Type
                        </Label>
                        <Col md="10">
                            <Input
                                type="select"
                                className="form-control"
                                name="bodyType"
                                id="bodyType"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bodyType}
                            >
                                <option value="">Select Body Type</option>
                                <option value="SUV">SUV</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Sedan">Sedan</option>
                                <option value="Compact-Suv">Compact Suv</option>
                                <option value="Compact-Sedan">Compact Sedan</option>
                                <option value="Convertible">Convertible</option>
                                <option value="Coupe">Coupe</option>
                                <option value="Station-Wegon">Station Wegon</option>
                                <option value="MuV">MUV</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Minivan">Minivan</option>
                                <option value="Truck">Truck</option>
                            </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="adjustableHeadlights"
                            md="2"
                            className="col-form-label"
                        >
                            Adjustable Headlights
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="adjustableHeadlights"
                                id="adjustableHeadlights"
                                placeholder="Enter your Adjustable Headlights"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.adjustableHeadlights}
                            />
                        </Col>
                    </FormGroup>
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
                            htmlFor="antenna"
                            md="2"
                            className="col-form-label"
                        >
                            Antenna
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="antenna"
                                id="antenna"
                                placeholder="Enter your Antenna"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.antenna}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="bootOpening"
                            md="2"
                            className="col-form-label"
                        >
                            Boot Opening
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="bootOpening"
                                id="bootOpening"
                                placeholder="Enter your Boot Opening"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.bootOpening}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="puddleLamps"
                            md="2"
                            className="col-form-label"
                        >
                            Puddle Lamps
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="puddleLamps"
                                id="puddleLamps"
                                placeholder="Enter your Puddle Lamps"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.puddleLamps}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreSize"
                            md="2"
                            className="col-form-label"
                        >
                            Tyre Size
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
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="tyreType"
                            md="2"
                            className="col-form-label"
                        >
                            Tyre Type
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
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="wheelSize"
                            md="2"
                            className="col-form-label"
                        >
                            Wheel Size
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
                    <FormGroup className="mb-4" row>
                        <Label
                            htmlFor="allowWheelSize"
                            md="2"
                            className="col-form-label"
                        >
                            AllowWheel Size
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="allowWheelSize"
                                id="allowWheelSize"
                                placeholder="Enter your Allow Wheel Size"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.allowWheelSize}
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
export default ExteriorVariant;