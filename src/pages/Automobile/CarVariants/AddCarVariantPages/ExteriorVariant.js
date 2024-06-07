import React, { useEffect, useState } from "react"
import {
    Col,
    Form,
    FormGroup,
    Label,
    CardTitle,
    Button,
    Input,
    Row,
} from "reactstrap"
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"

const ExteriorVariant = ({ carVariant, onFormSubmit }) => {

    document.title = "Add Car Variant | Scrollit"

    const dispatch = useDispatch()

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            bodyType: carVariant?.exterior?.bodyType || "",
            adjustableHeadlights: carVariant?.exterior?.adjustableHeadlights || "",
            fogLightsFront: carVariant?.exterior?.fogLightsFront || false,
            powerAdjustableExteriorRearViewMirror: carVariant?.exterior?.powerAdjustableExteriorRearViewMirror || false,
            manuallyAdjustableExtRearViewMirror: carVariant?.exterior?.manuallyAdjustableExtRearViewMirror || false,
            electricFoldingRearViewMirror: carVariant?.exterior?.electricFoldingRearViewMirror || false,
            rearWindowWiper: carVariant?.exterior?.rearWindowWiper || false,
            rearWindowWasher: carVariant?.exterior?.rearWindowWasher || false,
            rearWindowDefogger: carVariant?.exterior?.rearWindowDefogger || false,
            wheelCovers: carVariant?.exterior?.wheelCovers || false,
            alloyWheels: carVariant?.exterior?.alloyWheels || false,
            powerAntenna: carVariant?.exterior?.powerAntenna || false,
            rearSpoiler: carVariant?.exterior?.rearSpoiler || false,
            outsideRearViewMirrorTurnIndicators: carVariant?.exterior?.outsideRearViewMirrorTurnIndicators || false,
            integratedAntenna: carVariant?.exterior?.integratedAntenna || false,
            chromeGrille: carVariant?.exterior?.chromeGrille || false,
            chromeGarnish: carVariant?.exterior?.chromeGarnish || false,
            projectorHeadlamps: carVariant?.exterior?.projectorHeadlamps || false,
            halogenHeadlamps: carVariant?.exterior?.halogenHeadlamps || false,
            roofRail: carVariant?.exterior?.roofRail || false,
            ledDrls: carVariant?.exterior?.ledDrls || false,
            ledHeadlights: carVariant?.exterior?.ledHeadlights || false,
            ledTaillights: carVariant?.exterior?.ledTaillights || false,
            ledFogLamps: carVariant?.exterior?.ledFogLamps || false,
            additionalFeatures: carVariant?.exterior?.additionalFeatures || "",
            fogLights: carVariant?.exterior?.fogLights || false,
            antenna: carVariant?.exterior?.antenna || "",
            bootOpening: carVariant?.exterior?.bootOpening || "",
            puddleLamps: carVariant?.exterior?.puddleLamps || "",
            tyreSize: carVariant?.exterior?.tyreSize || "",
            tyreType: carVariant?.exterior?.tyreType || "",
            wheelSize: carVariant?.exterior?.wheelSize || "",
            allowWheelSize: carVariant?.exterior?.allowWheelSize || "",
        },
        onSubmit: values => {
            if (onFormSubmit) {
                onFormSubmit('exterior', values, '9')
            }
        }
    })

    const { carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }))

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels())
        }
    }, [dispatch])

    return (
        <React.Fragment>
            <div>
                <CardTitle>Exterior</CardTitle>
                <p className="card-title-desc">Fill all information below</p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                        <Col lg="3">
                            <FormGroup className="mb-4" row>
                                <div className="form-check form-check-end">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="fogLightsFront"
                                        {...validation.getFieldProps('fogLightsFront')}
                                        checked={validation.values.fogLightsFront}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="fogLightsFront"
                                    >
                                        Fog Light Front
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
                                        id="powerAdjustableExteriorRearViewMirror"
                                        {...validation.getFieldProps('powerAdjustableExteriorRearViewMirror')}
                                        checked={validation.values.powerAdjustableExteriorRearViewMirror}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerAdjustableExteriorRearViewMirror"
                                    >
                                        Power Adjustable Exterior Rear View Mirror
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
                                        id="manuallyAdjustableExtRearViewMirror"
                                        {...validation.getFieldProps('manuallyAdjustableExtRearViewMirror')}
                                        checked={validation.values.manuallyAdjustableExtRearViewMirror}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="manuallyAdjustableExtRearViewMirror"
                                    >
                                        Manually Adjustable Exterior Rear View Mirror
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
                                        id="electricFoldingRearViewMirror"
                                        {...validation.getFieldProps('electricFoldingRearViewMirror')}
                                        checked={validation.values.electricFoldingRearViewMirror}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="electricFoldingRearViewMirror"
                                    >
                                        Electric folding Rear View Mirror
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
                                        id="rearWindowWiper"
                                        {...validation.getFieldProps('rearWindowWiper')}
                                        checked={validation.values.rearWindowWiper}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowWiper"
                                    >
                                        Rear Window Wiper
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
                                        id="rearWindowWasher"
                                        {...validation.getFieldProps('rearWindowWasher')}
                                        checked={validation.values.rearWindowWasher}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowWasher"
                                    >
                                        Rear Window Washer
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
                                        id="rearWindowDefogger"
                                        {...validation.getFieldProps('rearWindowDefogger')}
                                        checked={validation.values.rearWindowDefogger}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearWindowDefogger"
                                    >
                                        Rear Window Defogger
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
                                        id="wheelCovers"
                                        {...validation.getFieldProps('wheelCovers')}
                                        checked={validation.values.wheelCovers}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="wheelCovers"
                                    >
                                        Wheel Covers
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
                                        id="alloyWheels"
                                        {...validation.getFieldProps('alloyWheels')}
                                        checked={validation.values.alloyWheels}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="alloyWheels"
                                    >
                                        Alloy Wheels
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
                                        id="powerAntenna"
                                        {...validation.getFieldProps('powerAntenna')}
                                        checked={validation.values.powerAntenna}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="powerAntenna"
                                    >
                                        Power Antenna
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
                                        id="rearSpoiler"
                                        {...validation.getFieldProps('rearSpoiler')}
                                        checked={validation.values.rearSpoiler}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="rearSpoiler"
                                    >
                                        Rear Spoiler
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
                                        id="outsideRearViewMirrorTurnIndicators"
                                        {...validation.getFieldProps('outsideRearViewMirrorTurnIndicators')}
                                        checked={validation.values.outsideRearViewMirrorTurnIndicators}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="outsideRearViewMirrorTurnIndicators"
                                    >
                                        Outside Rear View Mirror Turn Indicators
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
                                        id="integratedAntenna"
                                        {...validation.getFieldProps('integratedAntenna')}
                                        checked={validation.values.integratedAntenna}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="integratedAntenna"
                                    >
                                        Integrated Antenna
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
                                        id="chromeGrille"
                                        {...validation.getFieldProps('chromeGrille')}
                                        checked={validation.values.chromeGrille}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="chromeGrille"
                                    >
                                        Chrome Grille
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
                                        id="chromeGarnish"
                                        {...validation.getFieldProps('chromeGarnish')}
                                        checked={validation.values.chromeGarnish}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="chromeGarnish"
                                    >
                                        Chrome Garnish
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
                                        id="projectorHeadlamps"
                                        {...validation.getFieldProps('projectorHeadlamps')}
                                        checked={validation.values.projectorHeadlamps}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="projectorHeadlamps"
                                    >
                                        Projector Head Lamps
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
                                        id="halogenHeadlamps"
                                        {...validation.getFieldProps('halogenHeadlamps')}
                                        checked={validation.values.halogenHeadlamps}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="halogenHeadlamps"
                                    >
                                        Halogen Head Lamps
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
                                        id="roofRail"
                                        {...validation.getFieldProps('roofRail')}
                                        checked={validation.values.roofRail}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="roofRail"
                                    >
                                        Roof Rails
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
                                        id="ledDrls"
                                        {...validation.getFieldProps('ledDrls')}
                                        checked={validation.values.ledDrls}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledDrls"
                                    >
                                        Led Drls
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
                                        id="ledHeadlights"
                                        {...validation.getFieldProps('ledHeadlights')}
                                        checked={validation.values.ledHeadlights}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledHeadlights"
                                    >
                                        LED Head lights
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
                                        id="ledTaillights"
                                        {...validation.getFieldProps('ledTaillights')}
                                        checked={validation.values.ledTaillights}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledTaillights"
                                    >
                                        LED Tail lights
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
                                        id="ledFogLamps"
                                        {...validation.getFieldProps('ledFogLamps')}
                                        checked={validation.values.ledFogLamps}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="ledFogLamps"
                                    >
                                        LED Fog Lamps
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
                                        id="fogLights"
                                        {...validation.getFieldProps('fogLights')}
                                        checked={validation.values.fogLights}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="fogLights"
                                    >
                                        LED Fog Lights
                                    </label>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup className="mb-4" row>
                        <Label htmlFor="bodyType" md="2" className="col-form-label">
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
                            Adjustable Head Lights
                        </Label>
                        <Col md="10">
                            <Input
                                type="text"
                                className="form-control"
                                name="adjustableHeadlights"
                                id="adjustableHeadlights"
                                placeholder="Enter your Adjustable Head Lights"
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
                            Allow Wheel Size
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
                    <Button type="submit" color="primary">
                        Next
                    </Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default ExteriorVariant
