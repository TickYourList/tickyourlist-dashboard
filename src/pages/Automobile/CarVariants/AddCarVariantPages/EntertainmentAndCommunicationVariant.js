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
} from "reactstrap"
import Select from "react-select"
import { Link } from "react-router-dom"
import * as Yup from "yup";

import classnames from "classnames"

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb"

//Import Images
import img1 from "../../../assets/images/product/img-1.png"
import img7 from "../../../assets/images/product/img-7.png"
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"
import Switch from "react-switch";

const Offsymbol = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 12,
                color: "#fff",
                paddingRight: 2
            }}
        >
            {" "}
            No
        </div>
    );
};

const OnSymbol = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: 12,
                color: "#fff",
                paddingRight: 2
            }}
        >
            {" "}
            Yes
        </div>
    );
};

const optionGroup = [
    {
        label: "Picnic",
        options: [
            { label: "Mustard", value: "Mustard" },
            { label: "Ketchup", value: "Ketchup" },
            { label: "Relish", value: "Relish" },
        ],
    },
    {
        label: "Camping",
        options: [
            { label: "Tent", value: "Tent" },
            { label: "Flashlight", value: "Flashlight" },
            { label: "Toilet Paper", value: "Toilet Paper" },
        ],
    },
]

const orderSummary = [
    {
        id: 1,
        img: img1,
        productTitle: "Half sleeve T-shirt (64GB)",
        price: 450,
        qty: 1,
    },
    { id: 2, img: img7, productTitle: "Wireless Headphone", price: 225, qty: 1 },
]

const EntertainmentAndCommunicationVariant = () => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const [activeTab, setactiveTab] = useState("1")
    const [selectedGroup, setselectedGroup] = useState(null)

    const [carVariant, setCarVariant] = useState([]);
    const [switch1, setswitch1] = useState(true);
    // const [carModelsList, setCarModelsList] = useState([]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            variantName: (carVariant && carVariant.variantName) || "",
            carModel: (carVariant && carVariant._id) || "",
            variantStatus: (carVariant && carVariant.status) || "",
            onRoadPrice: (carVariant && carVariant.basicInformation && carVariant.basicInformation.onRoadPrice) || "",
            userRating: (carVariant && carVariant.basicInformation && carVariant.basicInformation.userRating) || "",
            startEmiAmount: (carVariant && carVariant.basicInformation && carVariant.basicInformation.startEmiAmount) || "",
            startInsuranceAmount: (carVariant && carVariant.basicInformation && carVariant.basicInformation.startInsuranceAmount) || "",
            serviceCost: (carVariant && carVariant.basicInformation && carVariant.basicInformation.serviceCost) || "",
            engineType: (carVariant && carVariant.engineAndTransmission && carVariant.engineAndTransmission.engineType) || "",
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
            fuelType: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.fuelType) || "",
            mileageCity: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.mileageCity) || "",
            mileageArai: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.mileageArai) || "",
            fuelTankCapacity: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.fuelTankCapacity) || "",
            emissionNormCompliance: (carVariant && carVariant.fuelAndPerformance && carVariant.fuelAndPerformance.emissionNormCompliance) || "",

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

            tachometer: (carVariant && carVariant.interior && carVariant.interior.tachometer)
                ? carVariant.interior.tachometer
                : false,
            electronicutiTripmeter: (carVariant && carVariant.interior && carVariant.interior.electronicutiTripmeter) ? carVariant.interior.electronicutiTripmeter : false,
            fabricUpholestry: (carVariant && carVariant.interior && carVariant.interior.fabricUpholestry) ? carVariant.interior.fabricUpholestry : false,
            leatherSteeringWheel: (carVariant && carVariant.interior && carVariant.interior.leatherSteeringWheel) ? carVariant.interior.leatherSteeringWheel : false,
            gloveCompartment: (carVariant && carVariant.interior && carVariant.interior.gloveCompartment) ? carVariant.interior.gloveCompartment: false,
            digitalClock: (carVariant && carVariant.interior && carVariant.interior.digitalClock) ? carVariant.interior.digitalClock: false,
            outsideTemperatureisplay: (carVariant && carVariant.interior && carVariant.interior.outsideTemperatureisplay) ? carVariant.interior.outsideTemperatureisplay: false,
            digitalOdometer: (carVariant && carVariant.interior && carVariant.interior.digitalOdometer) ? carVariant.interior.digitalOdometer: false,
            DualToneDashboard: (carVariant && carVariant.interior && carVariant.interior.DualToneDashboard) ? carVariant.interior.DualToneDashboard: false,
            additionFeatures: (carVariant && carVariant.interior && carVariant.interior.additionFeatures) || "",
            digitalCluster: (carVariant && carVariant.interior && carVariant.interior.digitalCluster) || "",
            digitalClusterSize: (carVariant && carVariant.interior && carVariant.interior.digitalClusterSize) || 0,
            upholstery: (carVariant && carVariant.interior && carVariant.interior.upholstery) || "",

            bodyType: (carVariant && carVariant.exterior && carVariant.exterior.bodyType) || "",
            adjustableHeadlights: (carVariant && carVariant.exterior && carVariant.exterior.adjustableHeadlights) ? carVariant.exterior.adjustableHeadlights : false,
            fogLightsFront: (carVariant && carVariant.exterior && carVariant.exterior.fogLightsFront) ? carVariant.exterior.fogLightsFront : false,
            powerAdjustableExteriorRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.powerAdjustableExteriorRearViewMirror) ? carVariant.exterior.powerAdjustableExteriorRearViewMirror : false,
            manuallyAdjustableExtRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.manuallyAdjustableExtRearViewMirror) ? carVariant.exterior.manuallyAdjustableExtRearViewMirror : false,
            electricFoldingRearViewMirror: (carVariant && carVariant.exterior && carVariant.exterior.electricFoldingRearViewMirror) ? carVariant.exterior.electricFoldingRearViewMirror : false,
            rearWindowWiper: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowWiper) ? carVariant.exterior.rearWindowWiper : false,
            rearWindowWasher: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowWasher) ? carVariant.exterior.rearWindowWasher : false,
            rearWindowDefogger: (carVariant && carVariant.exterior && carVariant.exterior.rearWindowDefogger) ? carVariant.exterior.rearWindowDefogger : false,
            wheelCovers: (carVariant && carVariant.exterior && carVariant.exterior.wheelCovers) ? carVariant.exterior.wheelCovers : false,
            alloyWheels: (carVariant && carVariant.exterior && carVariant.exterior.alloyWheels) ? carVariant.exterior.alloyWheels : false,
            powerAntenna: (carVariant && carVariant.exterior && carVariant.exterior.powerAntenna) ? carVariant.exterior.powerAntenna : false,
            rearSpoiler: (carVariant && carVariant.exterior && carVariant.exterior.rearSpoiler) ? carVariant.exterior.rearSpoiler : false,
            outsideRearViewMirrorTurnIndicators: (carVariant && carVariant.exterior && carVariant.exterior.outsideRearViewMirrorTurnIndicators) ? carVariant.exterior.outsideRearViewMirrorTurnIndicators : false,
            integratedAntenna: (carVariant && carVariant.exterior && carVariant.exterior.integratedAntenna) ? carVariant.exterior.integratedAntenna : false,
            chromeGrille: (carVariant && carVariant.exterior && carVariant.exterior.chromeGrille) ? carVariant.exterior.chromeGrille : false,
            chromeGarnish: (carVariant && carVariant.exterior && carVariant.exterior.chromeGarnish) ? carVariant.exterior.chromeGarnish : false,
            projectorHeadlamps: (carVariant && carVariant.exterior && carVariant.exterior.projectorHeadlamps) ? carVariant.exterior.projectorHeadlamps : false,
            halogenHeadlamps: (carVariant && carVariant.exterior && carVariant.exterior.halogenHeadlamps) ? carVariant.exterior.halogenHeadlamps : false,
            roofRail: (carVariant && carVariant.exterior && carVariant.exterior.roofRail) ? carVariant.exterior.roofRail : false,
            ledDrls: (carVariant && carVariant.exterior && carVariant.exterior.ledDrls) ? carVariant.exterior.ledDrls : false,
            ledHeadlights: (carVariant && carVariant.exterior && carVariant.exterior.ledHeadlights) ? carVariant.exterior.ledHeadlights : false,
            ledTaillights: (carVariant && carVariant.exterior && carVariant.exterior.ledTaillights) ? carVariant.exterior.ledTaillights : false,
            ledFogLamps: (carVariant && carVariant.exterior && carVariant.exterior.ledFogLamps) ? carVariant.exterior.ledFogLamps : false,
            additionalFeatures: (carVariant && carVariant.exterior && carVariant.exterior.additionalFeatures) || "",
            fogLights: (carVariant && carVariant.exterior && carVariant.exterior.fogLights) ? carVariant.exterior.fogLights : false,
            antenna: (carVariant && carVariant.exterior && carVariant.exterior.antenna) || "",
            bootOpening: (carVariant && carVariant.exterior && carVariant.exterior.bootOpening) || "",
            puddleLamps: (carVariant && carVariant.exterior && carVariant.exterior.puddleLamps) ? carVariant.exterior.puddleLamps : false,
            tyreSize: (carVariant && carVariant.exterior && carVariant.exterior.tyreSize) || "",
            tyreType: (carVariant && carVariant.exterior && carVariant.exterior.tyreType) || "",
            wheelSize: (carVariant && carVariant.exterior && carVariant.exterior.wheelSize) || "",
            allowWheelSize: (carVariant && carVariant.exterior && carVariant.exterior.allowWheelSize) ? carVariant.exterior.allowWheelSize : false,

            allowWheelSize: (carVariant && carVariant.exterior && carVariant.exterior.allowWheelSize) ? carVariant.exterior.allowWheelSize : false,
            
            
            // description: (carModel && carModel.description) || "",
            // year: (carModel && carModel.year) || "",
            // status: (carModel && carModel.status ? 'Active' : 'InActive') || "",
        },
        validationSchema: Yup.object({
            modelName: Yup.string().required(
                "Please Enter Your Brand Name"
            ),
            carBrand: Yup.string().required(
                "Please Enter Your CarBrand"
            ),
            description: Yup.string().required(
                "Please Enter Your description"
            ),
            year: Yup.string().required(
                "Please Enter Your Year"
            ),
            status: Yup.string().required(
                "Please Enter Your Status"
            )
        }),
        onSubmit: values => {
            if (isEdit) {
                const updCarModel = new FormData();
                updCarModel.append("modelName", values["modelName"]);
                updCarModel.append("description", values["description"]);
                updCarModel.append("year", values["year"]);
                updCarModel.append("status", values["status"] === 'Active' ? true : false);
                updCarModel.append("image", modelImage ? modelImage : "broken!");
                dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

                validation.resetForm();
            } else {
                const newCarModel = new FormData();
                newCarModel.append("modelName", values["modelName"]);
                newCarModel.append("description", values["description"]);
                newCarModel.append("year", values["year"]);
                newCarModel.append("status", values["status"] === 'Active' ? true : false);
                newCarModel.append("image", modelImage ? modelImage : "broken!");
                dispatch(addNewCarModel(values['carBrand'], newCarModel));
                validation.resetForm();
            }
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
            <div className="page-content">
                <Container fluid>
                    {/* Render Breadcrumb */}
                    <Breadcrumbs title="Car Variant" breadcrumbItem="Add Car Variant" />

                    <div className="checkout-tabs">
                        <Row>
                            <Col lg="2" sm="3">
                                <Nav className="flex-column" pills>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "1" })}
                                            onClick={() => {
                                                setactiveTab("1")
                                            }}
                                        >
                                            <i className="bx bxs-truck d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Basic Information</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "2" })}
                                            onClick={() => {
                                                setactiveTab("2")
                                            }}
                                        >
                                            <i className="bx bx-money d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Engine And Transmission</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "3" })}
                                            onClick={() => {
                                                setactiveTab("3")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Fuel And Performance</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "4" })}
                                            onClick={() => {
                                                setactiveTab("4")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Suspension and Steering and Brakes</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "5" })}
                                            onClick={() => {
                                                setactiveTab("5")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Dimension and Capacity</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "6" })}
                                            onClick={() => {
                                                setactiveTab("6")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Comfort and Convinience</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "7" })}
                                            onClick={() => {
                                                setactiveTab("7")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Interior</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "8" })}
                                            onClick={() => {
                                                setactiveTab("8")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Exterior</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "9" })}
                                            onClick={() => {
                                                setactiveTab("9")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Safety</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "10" })}
                                            onClick={() => {
                                                setactiveTab("10")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Entertainment and Communication</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "11" })}
                                            onClick={() => {
                                                setactiveTab("11")
                                            }}
                                        >
                                            <i className="bx bx-badge-check d-block check-nav-icon mt-4 mb-2" />
                                            <p className="fw-bold mb-4">Warranty</p>
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                            </Col>
                            <Col lg="10" sm="9">
                                <Card>
                                    <CardBody>
                                        <TabContent activeTab={activeTab}>
                                            <TabPane tabId="1">
                                                <div>
                                                    <CardTitle>Basic information</CardTitle>
                                                    <p className="card-title-desc">
                                                        Fill all information below
                                                    </p>
                                                    <Form>
                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="billing-name"
                                                                md="2"
                                                                className="col-form-label"
                                                            >
                                                                Name <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="billing-name"
                                                                    placeholder="Enter your name"
                                                                />
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                Car Model <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="select"
                                                                    name="carModel"
                                                                    id="carModel"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.carModel}
                                                                >
                                                                    <option value="">Select a Car Brand</option>
                                                                    {carModels?.map((carModel, index) => (
                                                                        <option key={index} value={carModel._id}>
                                                                            {carModel.modelName}
                                                                        </option>
                                                                    ))}
                                                                </Input>

                                                                {validation.touched
                                                                    .carModel &&
                                                                    validation.errors
                                                                        .carModel ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .carModel
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                Status <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="select"
                                                                    name="variantStatus"
                                                                    id="variantStatus"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.status}
                                                                >
                                                                    <option>Active</option>
                                                                    <option>InActive</option>
                                                                </Input>

                                                                {validation.touched
                                                                    .status &&
                                                                    validation.errors
                                                                        .status ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .status
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                On Road Price <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    name="onRoadPrice"
                                                                    id="onRoadPrice"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.onRoadPrice}
                                                                >
                                                                </Input>

                                                                {validation.touched
                                                                    .onRoadPrice &&
                                                                    validation.errors
                                                                        .onRoadPrice ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .onRoadPrice
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                User Rating <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="number"
                                                                    name="userRating"
                                                                    id="userRating"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.userRating}
                                                                >
                                                                </Input>

                                                                {validation.touched
                                                                    .userRating &&
                                                                    validation.errors
                                                                        .userRating ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .userRating
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                Start EMI Amount <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    name="startEmiAmount"
                                                                    id="startEmiAmount"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.startEmiAmount}
                                                                >
                                                                </Input>

                                                                {validation.touched
                                                                    .startEmiAmount &&
                                                                    validation.errors
                                                                        .startEmiAmount ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .startEmiAmount
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                Start Insurance Amount <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    name="startInsuranceAmount"
                                                                    id="startInsuranceAmount"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.startInsuranceAmount}
                                                                >
                                                                </Input>

                                                                {validation.touched
                                                                    .startInsuranceAmount &&
                                                                    validation.errors
                                                                        .startInsuranceAmount ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .startInsuranceAmount
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label className="form-label" md="2">
                                                                Service Cost <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    name="serviceCost"
                                                                    id="serviceCost"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.serviceCost}
                                                                >
                                                                </Input>

                                                                {validation.touched
                                                                    .serviceCost &&
                                                                    validation.errors
                                                                        .serviceCost ? (
                                                                    <FormFeedback type="invalid">
                                                                        {
                                                                            validation.errors
                                                                                .serviceCost
                                                                        }
                                                                    </FormFeedback>
                                                                ) : null}
                                                            </Col>
                                                        </FormGroup>
                                                    </Form>
                                                </div>
                                            </TabPane>
                                            <TabPane
                                                tabId="2"
                                                id="v-pills-payment"
                                                role="tabpanel"
                                                aria-labelledby="v-pills-payment-tab"
                                            >
                                                <div>
                                                    <CardTitle>Engine And Transmission</CardTitle>
                                                    <p className="card-title-desc">
                                                        Fill all information below
                                                    </p>
                                                    <Form>
                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="engineType"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="displacement"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="noOfCylinders"
                                                                md="2"
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
                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="maxPower"
                                                                md="2"
                                                                className="col-form-label"
                                                            >
                                                                Max Power <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="maxPower"
                                                                    id="maxPower"
                                                                    placeholder="Enter your MaxPower"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.maxPower}
                                                                />
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="valuePerCylinder"
                                                                md="2"
                                                                className="col-form-label"
                                                            >
                                                                Value Per Cylinder <span style={{ color: 'red' }}>*</span>
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="fuelSupplySystem"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="compressionRatio"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="turboCharge"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="transmissionType"
                                                                md="2"
                                                                className="col-form-label"
                                                            >
                                                                Transmission Type <span style={{ color: 'red' }}>*</span>
                                                            </Label>
                                                            <Col md="10">
                                                                <Input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="transmissionType"
                                                                    id="transmissionType"
                                                                    placeholder="Enter your Transmission Type"
                                                                    onChange={validation.handleChange}
                                                                    onBlur={validation.handleBlur}
                                                                    value={validation.values.transmissionType}
                                                                />
                                                            </Col>
                                                        </FormGroup>

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="gearBox"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="mildHybrid"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="driverType"
                                                                md="2"
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

                                                        <FormGroup className="mb-4" row>
                                                            <Label
                                                                htmlFor="cluchType"
                                                                md="2"
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
                                                    </Form>
                                                </div>
                                            </TabPane>
                                            <TabPane tabId="3" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Fuel And Transmission</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="fuelType"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Fuel Type <span style={{ color: 'red' }}>*</span>
                                                    </Label>
                                                    <Col md="10">
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="fuelType"
                                                            id="fuelType"
                                                            placeholder="Enter your Fuel Type"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.fuelType}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="mileageCity"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="mileageArai"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="fuelTankCapacity"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="emissionNormCompliance"
                                                        md="2"
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
                                            </TabPane>
                                            <TabPane tabId="4" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Suspension And Steering And Brakes</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="fontSuspension"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Font Suspension <span style={{ color: 'red' }}>*</span>
                                                    </Label>
                                                    <Col md="10">
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="fuelType"
                                                            id="fuelType"
                                                            placeholder="Enter your Font Suspension"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.fontSuspension}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearSuspension"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="steeringType"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="steeringColumn"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="turningRadius"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Turning Radius <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="frontBrakeType"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearBrakeType"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="emissionNormCompliance"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="tyreSize"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="tyreType"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="wheelSize"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="alloyWheelSize"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="alloyWheelSizeFront"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="alloyWheelSizeFront"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="alloyWheelSizeRear"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="bootSpace"
                                                        md="2"
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
                                            </TabPane>
                                            <TabPane tabId="5" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Dimension and Capacity</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="length"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Length <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="width"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Width <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="height"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Height <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="groundClearanceUnladen"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Ground Clearance Unladen <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="wheelBase"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Wheel Base <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="frontTread"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Front Tread <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearTread"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Tread <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="kerbWeight"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Kerb Weight <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="grossWeight"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Gross Weight <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="seatingCapacity"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Gross Weight <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="bootSpace"
                                                        md="2"
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="noOfDoors"
                                                        md="2"
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


                                            </TabPane>

                                            <TabPane tabId="6" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Comfort And Convinience</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="length"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Length <span style={{ color: 'red' }}>*</span>
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

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="width"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Width <span style={{ color: 'red' }}>*</span>
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

                                            </TabPane>

                                            <TabPane tabId="7" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Interior</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="tachometer"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Technometer
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("tachometer", checked);
                                                            }}
                                                            checked={validation.values.tachometer}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="electronicutiTripmeter"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Electronic Tripmeter
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("electronicutiTripmeter", checked);
                                                            }}
                                                            checked={validation.values.electronicutiTripmeter}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="fabricUpholestry"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Fabric upholstery
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("fabricUpholestry", checked);
                                                            }}
                                                            checked={validation.values.fabricUpholestry}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="leatherSteeringWheel"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Leather Steering Wheel
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("leatherSteeringWheel", checked);
                                                            }}
                                                            checked={validation.values.leatherSteeringWheel}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="gloveCompartment"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Glove Compartment
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("gloveCompartment", checked);
                                                            }}
                                                            checked={validation.values.gloveCompartment}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="digitalClock"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Digital Clock
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("digitalClock", checked);
                                                            }}
                                                            checked={validation.values.digitalClock}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="outsideTemperatureisplay"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Outside Temperature display
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("outsideTemperatureisplay", checked);
                                                            }}
                                                            checked={validation.values.outsideTemperatureisplay}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="digitalOdometer"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Digital Odometer
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("digitalOdometer", checked);
                                                            }}
                                                            checked={validation.values.digitalOdometer}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="dualToneDashboard"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Dual Tone Dashboard
                                                    </Label>
                                                    <Col md="10">
                                                        <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("dualToneDashboard", checked);
                                                            }}
                                                            checked={validation.values.dualToneDashboard}
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
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="additionFeatures"
                                                            id="additionFeatures"
                                                            placeholder="Enter your Additional Features"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.additionFeatures}
                                                        />
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
                                                        Digital Cluster
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
                                                        Upholestery
                                                    </Label>
                                                    <Col md="10">
                                                        <Input
                                                            type="number"
                                                            className="form-control"
                                                            name="digitalClusterSize"
                                                            id="digitalClusterSize"
                                                            placeholder="Enter your Upholestery"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.upholstery}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                            </TabPane>

                                            <TabPane tabId="8" id="v-pills-confir" role="tabpanel">
                                                <CardTitle>Exterior</CardTitle>
                                                <p className="card-title-desc">
                                                    Fill all information below
                                                </p>

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
                                                            type="text"
                                                            className="form-control"
                                                            name="bodyType"
                                                            id="bodyType"
                                                            placeholder="Enter your Body Type"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.bodyType}
                                                        />
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
                                                        htmlFor="adjustableHeadlights"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Adjustable Head Lights
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("adjustableHeadlights", checked);
                                                            }}
                                                            checked={validation.values.adjustableHeadlights}
                                                        />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="powerAdjustableExteriorRearViewMirror"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Power Adjustable Exterior Rear View Mirror
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("powerAdjustableExteriorRearViewMirror", checked);
                                                            }}
                                                            checked={validation.values.powerAdjustableExteriorRearViewMirror}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="manuallyAdjustableExtRearViewMirror"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Manually Adjustable Exterior Rear View Mirror
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("manuallyAdjustableExtRearViewMirror", checked);
                                                            }}
                                                            checked={validation.values.manuallyAdjustableExtRearViewMirror}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="electricFoldingRearViewMirror"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Electric folding Rear View Mirror
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("electricFoldingRearViewMirror", checked);
                                                            }}
                                                            checked={validation.values.electricFoldingRearViewMirror}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearWindowWiper"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Window Wiper
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("rearWindowWiper", checked);
                                                            }}
                                                            checked={validation.values.rearWindowWiper}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearWindowWasher"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Window Washer
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("rearWindowWasher", checked);
                                                            }}
                                                            checked={validation.values.rearWindowWasher}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearWindowDefogger"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Window Defogger
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("rearWindowDefogger", checked);
                                                            }}
                                                            checked={validation.values.rearWindowDefogger}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearWindowWheelCovers"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Window WheelCovers
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("wheelCovers", checked);
                                                            }}
                                                            checked={validation.values.wheelCovers}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="alloyWheels"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Alloy Wheels
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("alloyWheels", checked);
                                                            }}
                                                            checked={validation.values.alloyWheels}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="powerAntenna"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Power Antenna
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("powerAntenna", checked);
                                                            }}
                                                            checked={validation.values.powerAntenna}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="rearSpoiler"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Rear Spoiler
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("rearSpoiler", checked);
                                                            }}
                                                            checked={validation.values.rearSpoiler}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="outsideRearViewMirrorTurnIndicators"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Outside Rear View Mirror Turn Indicators
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("outsideRearViewMirrorTurnIndicators", checked);
                                                            }}
                                                            checked={validation.values.outsideRearViewMirrorTurnIndicators}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="integratedAntenna"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Integrated Antenna
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("integratedAntenna", checked);
                                                            }}
                                                            checked={validation.values.integratedAntenna}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="chromeGrille"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Chrome Grille
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("chromeGrille", checked);
                                                            }}
                                                            checked={validation.values.chromeGrille}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="chromeGarnish"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Chrome Garnish
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("chromeGarnish", checked);
                                                            }}
                                                            checked={validation.values.chromeGarnish}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="projectorHeadlamps"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Projector Head Lamps
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("projectorHeadlamps", checked);
                                                            }}
                                                            checked={validation.values.projectorHeadlamps}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="halogenHeadlamps"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Halogen Head Lamps
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("halogenHeadlamps", checked);
                                                            }}
                                                            checked={validation.values.halogenHeadlamps}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="roofRail"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Roof Rails
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("roofRail", checked);
                                                            }}
                                                            checked={validation.values.roofRail}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="ledDrls"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Led Drls
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("ledDrls", checked);
                                                            }}
                                                            checked={validation.values.ledDrls}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="ledHeadlights"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        LED Head lights
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("ledHeadlights", checked);
                                                            }}
                                                            checked={validation.values.ledHeadlights}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="ledTaillights"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        LED Tail lights
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("ledTaillights", checked);
                                                            }}
                                                            checked={validation.values.ledTaillights}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="ledFogLamps"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        LED Fog Lamps
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("ledFogLamps", checked);
                                                            }}
                                                            checked={validation.values.ledFogLamps}
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
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="additionFeatures"
                                                            id="additionFeatures"
                                                            placeholder="Enter your Additional Features"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.additionFeatures}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="fogLights"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        LED Fog Lamps
                                                    </Label>
                                                    <Col md="10">
                                                    <Switch
                                                            uncheckedIcon={<Offsymbol />}
                                                            checkedIcon={<OnSymbol />}
                                                            className="me-1 mb-sm-8 mb-2"
                                                            onColor="#626ed4"
                                                            onChange={(checked) => {
                                                                validation.setFieldValue("fogLights", checked);
                                                            }}
                                                            checked={validation.values.fogLights}
                                                        />
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

                                            </TabPane>

                                        </TabContent>
                                    </CardBody>
                                </Card>
                                <Row className="mt-4">
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
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default EntertainmentAndCommunicationVariant
