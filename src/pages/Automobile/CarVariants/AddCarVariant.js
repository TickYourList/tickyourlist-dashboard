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
import { Link, useNavigate } from "react-router-dom"
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
import BasicCarVariant from "./AddCarVariantPages/BasicCarVariant";
import EngineAndTransmissionVariant from "./AddCarVariantPages/EngineAndTransmissionVariant";
import FuelPerformanceVariant from "./AddCarVariantPages/FuelPerformanceVariant";
import SuspensionSteeringBrakesVariant from "./AddCarVariantPages/SuspensionSteeringBrakesVariant";
import DimensionAndCapacityVariant from "./AddCarVariantPages/DimensionAndCapacityVariant";
import ComfortAndConvenienceVariant from "./AddCarVariantPages/ComfortAndConvenienceVariant";
import InteriorVariant from "./AddCarVariantPages/InteriorVariant";
import ExteriorVariant from "./AddCarVariantPages/ExteriorVariant";
import SafetyVariant from "./AddCarVariantPages/SafetyVariant";
import { addNewCarVariant } from "store/automobiles/carVariants/actions";
import EntertainmentAndCommunicationVariant from "./AddCarVariantPages/EntertainmentAndCommunicationVariant";

const AddCarVariant = () => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const [activeTab, setactiveTab] = useState("1");
    const [allValid, setAllValid] = useState(false);
    const [selectedGroup, setselectedGroup] = useState(null)

    const [carVariant, setCarVariant] = useState();
    const [switch1, setswitch1] = useState(true);
    
    const [activeTabVartical, setoggleTabVertical] = useState(1)

    const [passedSteps, setPassedSteps] = useState([1])
    const [passedStepsVertical, setPassedStepsVertical] = useState([1])
    const history = useNavigate();

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
        // warranty: {},
        status: {},
        media: []
    });
    // const [carModelsList, setCarModelsList] = useState([]);

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    // Validate all sections
    const validateAllSections = (basicValid, engineValid) => {
        setAllValid(basicValid && engineValid);
    };

    const handleFinalSubmit = () => {
        // Aggregate data from both forms
        const completeFormData = {
            ...basicFormData,  // Data from Basic Information Form
            ...engineFormData  // Data from Engine and Transmission Form
        };
    };

    const { carBrands, countries, carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch]);

    const handleFormValuesChange = (data) => {
        console.log('data ', data);
    }

    const handleBasicCarFormSubmit = (childData, selectedFiles) => {
        const basicInformation = childData.basicInformation;
        console.log('childData ', childData, selectedFiles);
        setFormData({
            ...formData,
            name: childData.name,
            carModel: childData.carModel,
            status: childData.status,
            basicInformation,
            media: selectedFiles
        });
        // setactiveTab("2");
        toggleTabVertical(activeTabVartical + 1)
    };

    const handleFormSubmit = (childKey, childData, movement) => {
        console.log("childData ", childKey, childData);
        setFormData({
            ...formData,
            [childKey]: { ...formData[childKey], ...childData }
        });
        setactiveTab(movement);
        toggleTabVertical(activeTabVartical + 1)
    }

      const handleFinalFormSubmit = (childKey, childData, movement) => {
        // Update the formData correctly with the new childData
        const updatedFormData = {
            ...formData,
            [childKey]: { ...formData[childKey], ...childData },
        };
    
        // Now create a new FormData object
        const addVariantForm = new FormData();
        
        // Append the updated formData as a string
        addVariantForm.append("data", JSON.stringify(updatedFormData));
    
        // Dispatch the action with the updated formData
        dispatch(addNewCarVariant(updatedFormData.carModel, addVariantForm, history));
    
        // Optionally, update the state if needed to persist the changes
        setFormData(updatedFormData);
    };

    function toggleTabVertical(tab) {
        if (activeTabVartical !== tab) {
          var modifiedSteps = [...passedStepsVertical, tab]
    
          if (tab >= 1 && tab <= 10) {
            console.log('modified steps ', modifiedSteps);
            console.log('tab ', tab);
            setoggleTabVertical(tab)
            setPassedStepsVertical(modifiedSteps)
          }
        }
      }

      const previousTabClick = () => {
        toggleTabVertical(activeTabVartical - 1);
      }

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
                        <Col lg="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Car Vairant Details</h4>
                  <div className="vertical-wizard wizard clearfix vertical">
                    <div className="steps clearfix">
                      <ul>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 1,
                          })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTabVartical === 1,
                            })}
                            onClick={() => {
                              toggleTabVertical(1)
                            }}
                            disabled={!(passedStepsVertical || []).includes(1)}
                          >
                            <span className="number">1.</span> Basic Information
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 2,
                          })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTabVartical === 2,
                            })}
                            onClick={() => {
                              toggleTabVertical(2)
                            }}
                            disabled={!(passedStepsVertical || []).includes(2)}
                          >
                            <span className="number">2.</span>{" "}
                            <span>Engine & Transmission</span>
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 3,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 3,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(3)
                            }}
                            disabled={!(passedStepsVertical || []).includes(3)}
                          >
                            <span className="number">3.</span> Fuel & Performance
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 4,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 4,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(4)
                            }}
                            disabled={!(passedStepsVertical || []).includes(4)}
                          >
                            <span className="number">4.</span> Suspension & Steering
                          </NavLink>
                         
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 5,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 5,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(5)
                            }}
                            disabled={!(passedStepsVertical || []).includes(5)}
                          >
                            <span className="number">5.</span> Dimension & Capacity
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 6,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 6,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(6)
                            }}
                            disabled={!(passedStepsVertical || []).includes(6)}
                          >
                            <span className="number">6.</span> Comfort & Convinience
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 7,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 7,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(7)
                            }}
                            disabled={!(passedStepsVertical || []).includes(7)}
                          >
                            <span className="number">7.</span> Interior
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 8,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 8,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(8)
                            }}
                            disabled={!(passedStepsVertical || []).includes(7)}
                          >
                            <span className="number">8.</span> Exterior
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 9,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 9,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(9)
                            }}
                            disabled={!(passedStepsVertical || []).includes(9)}
                          >
                            <span className="number">9.</span> Safety
                          </NavLink>
                        </NavItem>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 10,
                          })}
                        >
                          <NavLink
                            className={
                              (classnames({
                                active: activeTabVartical === 10,
                              }),
                                "done")
                            }
                            onClick={() => {
                              toggleTabVertical(9)
                            }}
                            disabled={!(passedStepsVertical || []).includes(9)}
                          >
                            <span className="number">10.</span> Entertainment And Communication
                          </NavLink>
                        </NavItem>
                      </ul>
                    </div>
                    <div className="content clearfix">
                      <TabContent
                        activeTab={activeTabVartical}
                        className="body"
                      >
                        <TabPane tabId={1}>
                        <BasicCarVariant carVariant={carVariant} onValidChange={(isValid) => validateAllSections(isValid, false)} onFormSubmit={handleBasicCarFormSubmit} previousTabClick={previousTabClick}/>
                        </TabPane>
                        <TabPane tabId={2}>
                        <EngineAndTransmissionVariant carVariant={carVariant} onValidChange={(isValid) => validateAllSections(false, isValid)} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} fuelType={formData?.basicInformation?.fuelType} />
                        </TabPane>
                        <TabPane tabId={3}>
                        <FuelPerformanceVariant carVariant={carVariant} onValidChange={(isValid) => validateAllSections(false, isValid)} onFormSubmit={handleFormSubmit} previousTabClick={previousTabClick} fuelType={formData?.basicInformation?.fuelType} />
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

export default AddCarVariant
