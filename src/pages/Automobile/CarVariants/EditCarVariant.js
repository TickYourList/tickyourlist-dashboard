import React, { useEffect, useState } from "react"
import {
    Container,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Card,
    CardBody,
    Form,
} from "reactstrap"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { getCarVariants, updateCarVariant } from "store/automobiles/carVariants/actions"
import classnames from "classnames"
import Breadcrumbs from "../../../components/Common/Breadcrumb"
import BasicCarVariant from "./AddCarVariantPages/BasicCarVariant"
import EngineAndTransmissionVariant from "./AddCarVariantPages/EngineAndTransmissionVariant"
import FuelPerformanceVariant from "./AddCarVariantPages/FuelPerformanceVariant"
import SuspensionSteeringBrakesVariant from "./AddCarVariantPages/SuspensionSteeringBrakesVariant"
import DimensionAndCapacityVariant from "./AddCarVariantPages/DimensionAndCapacityVariant"
import ComfortAndConvenienceVariant from "./AddCarVariantPages/ComfortAndConvenienceVariant"
import InteriorVariant from "./AddCarVariantPages/InteriorVariant"
import ExteriorVariant from "./AddCarVariantPages/ExteriorVariant"
import SafetyVariant from "./AddCarVariantPages/SafetyVariant"
import EntertainmentAndCommunicationVariant from "./AddCarVariantPages/EntertainmentAndCommunicationVariant"

const EditCarVariant = () => {
    document.title = "Edit Car Variant | Scrollit"

    const { _id } = useParams()
    const dispatch = useDispatch()
    const history = useNavigate()

    const [activeTabVartical, setoggleTabVertical] = useState(1)
    const [passedStepsVertical, setPassedStepsVertical] = useState([1])
    const [carVariant, setCarVariant] = useState({})
    const [formData, setFormData] = useState({
        name: '',
        carModel: '',
        basicInformation: {},
        engineAndTransmission: {},
        fuelAndPerformance: {},
        suspensionAndSteeringAndBrakes: {},
        dimensionAndCapacity: {},
        comfortAndConvenience: {},
        interior: {},
        exterior: {},
        safety: {},
        entertainmentAndCommunication: {},
        status: {},
    })

    const { carVariants } = useSelector(state => ({
        carVariants: state.carVariant.carVariants
    }))

    useEffect(() => {
        dispatch(getCarVariants())
        dispatch(getCarModels())
    }, [dispatch])

    useEffect(() => {
        const variantData = carVariants.find(variant => variant._id === _id)
        if (variantData) {
            setCarVariant(variantData)
            setFormData({
                ...formData,
                ...variantData,
                status: variantData.status,
                carModel: variantData.carModel?._id
            })
        }
    }, [carVariants, _id]) 

    const handleBasicCarFormSubmit = (childData, selectedFiles) => {
        const basicInformation = childData.basicInformation;
        setFormData({
            ...formData,
            name: childData.name,
            carModel: childData.carModel,
            status: childData.status,
            basicInformation,
            media: selectedFiles
        });
        toggleTabVertical(activeTabVartical + 1)
    };

    const handleFormSubmit = (childKey, childData, movement) => {
        setFormData({
            ...formData,
            [childKey]: { ...formData[childKey], ...childData }
        })
        toggleTabVertical(activeTabVartical + 1)
    }

    // Sanitize function to clean up the formData
    const sanitizeFormData = (data) => {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            // Remove undefined, null, and empty objects
            if (value === undefined || value === null) {
                return undefined;
            } else if (typeof value === 'object' && Object.keys(value).length === 0) {
                return undefined;
            } else {
                return value;
            }
        }));
    };  

    const handleFinalFormSubmit = (childKey, childData) => {
        // Ensure that childKey exists in formData and is an object before merging
        const currentChildData = formData[childKey] && typeof formData[childKey] === 'object'
            ? formData[childKey]
            : {};
    
        // Merge current child data with new data
        const updatedChildData = {
            ...currentChildData,
            ...childData
        };
    
        // Update the formData with the new child data
        const updatedFormData = {
            ...formData,
            [childKey]: updatedChildData
        };
    
        console.log("Merged and updated formData:", updatedFormData);
    
        // Sanitize the updated form data
        const sanitizedData = sanitizeFormData(updatedFormData);
    
        console.log("Sanitized formData:", sanitizedData);
    
        // If sanitized data is not empty, proceed to dispatch
        if (Object.keys(sanitizedData).length > 0) {
            const addVariantForm = new FormData();
            addVariantForm.append("data", JSON.stringify(sanitizedData));
    
            // Dispatch with updated and sanitized data
            dispatch(updateCarVariant(_id, sanitizedData.carModel, addVariantForm, history));
        } else {
            console.error("Sanitized data is empty, not dispatching.");
        }
    };  

    const toggleTabVertical = (tab) => {
        if (activeTabVartical !== tab) {
            var modifiedSteps = [...passedStepsVertical, tab]
            if (tab >= 1 && tab <= 10) {
                setoggleTabVertical(tab)
                setPassedStepsVertical(modifiedSteps)
            }
        }
    }

    const previousTabClick = () => {
        toggleTabVertical(activeTabVartical - 1)
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Car Variant" breadcrumbItem="Edit Car Variant" />
                    <div className="checkout-tabs">
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <h4 className="card-title mb-4">Car Variant Details</h4>
                                        <div className="vertical-wizard wizard clearfix vertical">
                                            <div className="steps clearfix">
                                                <ul>
                                                    <NavItem className={classnames({ current: activeTabVartical === 1 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 1 })} onClick={() => toggleTabVertical(1)} disabled={!(passedStepsVertical || []).includes(1)}>
                                                            <span className="number">1.</span> Basic Information
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 2 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 2 })} onClick={() => toggleTabVertical(2)} disabled={!(passedStepsVertical || []).includes(2)}>
                                                            <span className="number">2.</span> Engine & Transmission
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 3 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 3 })} onClick={() => toggleTabVertical(3)} disabled={!(passedStepsVertical || []).includes(3)}>
                                                            <span className="number">3.</span> Fuel & Performance
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 4 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 4 })} onClick={() => toggleTabVertical(4)} disabled={!(passedStepsVertical || []).includes(4)}>
                                                            <span className="number">4.</span> Suspension & Steering
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 5 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 5 })} onClick={() => toggleTabVertical(5)} disabled={!(passedStepsVertical || []).includes(5)}>
                                                            <span className="number">5.</span> Dimension & Capacity
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 6 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 6 })} onClick={() => toggleTabVertical(6)} disabled={!(passedStepsVertical || []).includes(6)}>
                                                            <span className="number">6.</span> Comfort & Convenience
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 7 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 7 })} onClick={() => toggleTabVertical(7)} disabled={!(passedStepsVertical || []).includes(7)}>
                                                            <span className="number">7.</span> Interior
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 8 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 8 })} onClick={() => toggleTabVertical(8)} disabled={!(passedStepsVertical || []).includes(8)}>
                                                            <span className="number">8.</span> Exterior
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 9 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 9 })} onClick={() => toggleTabVertical(9)} disabled={!(passedStepsVertical || []).includes(9)}>
                                                            <span className="number">9.</span> Safety
                                                        </NavLink>
                                                    </NavItem>
                                                    <NavItem className={classnames({ current: activeTabVartical === 10 })}>
                                                        <NavLink className={classnames({ active: activeTabVartical === 10 })} onClick={() => toggleTabVertical(10)} disabled={!(passedStepsVertical || []).includes(10)}>
                                                            <span className="number">10.</span> Entertainment & Communication
                                                        </NavLink>
                                                    </NavItem>
                                                </ul> 
                                            </div>
                                            <div className="content clearfix">
                                                <TabContent activeTab={activeTabVartical} className="body">
                                                    <TabPane tabId={1}>
                                                        <BasicCarVariant carVariant={carVariant} onFormSubmit={handleBasicCarFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane> 
                                                    <TabPane tabId={2}>
                                                        <EngineAndTransmissionVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} fuelType={carVariant?.basicInformation?.fuelType} />
                                                    </TabPane>
                                                    <TabPane tabId={3}>
                                                        <FuelPerformanceVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} fuelType={carVariant?.basicInformation?.fuelType} />
                                                    </TabPane>
                                                    <TabPane tabId={4}>
                                                        <SuspensionSteeringBrakesVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={5}>
                                                        <DimensionAndCapacityVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={6}>
                                                        <ComfortAndConvenienceVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={7}>
                                                        <InteriorVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={8}>
                                                        <ExteriorVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={9}>
                                                        <SafetyVariant carVariant={carVariant} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                    <TabPane tabId={10}>
                                                        <EntertainmentAndCommunicationVariant carVariant={carVariant} onFormSubmit={handleFinalFormSubmit} previousTabClick={previousTabClick} />
                                                    </TabPane>
                                                </TabContent>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default EditCarVariant
