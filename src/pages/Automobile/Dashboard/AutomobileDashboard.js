import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
} from "reactstrap";
import { Link } from "react-router-dom";

import classNames from "classnames";

//import Charts
import StackedColumnChart from "../../Dashboard/StackedColumnChart";

//import action
import { getCarDashboardActivity, getCarSearchDashboardActivity, getOrderTotalAveragePrice, getRevenueTotalData, getTotalOrderCount, getChartsData as onGetChartsData } from "../../../store/actions";

import modalimage1 from "../../../assets/images/product/img-7.png";
import modalimage2 from "../../../assets/images/product/img-4.png";

// Pages Components
import WelcomeComp from "../../Dashboard/WelcomeComp";
import MonthlyEarning from "../../Dashboard/MonthlyEarning";
import SocialSource from "../../Dashboard/SocialSource";
import ActivityComp from "../../Dashboard/ActivityComp";
import TopCities from "../../Dashboard/TopCities";

//Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";

//i18n
import { withTranslation } from "react-i18next";

//redux
import { useSelector, useDispatch } from "react-redux";
import AutomobileWelcomeComp from "./AutomobileWelcomeComp";
import LatestCarSearches from "./LatestCarSearches";

const reportsDummyData = [
  { title: "Collections", iconClass: "bx-copy-alt", description: 0 },
  { title: "Brands", iconClass: "bx-copy-alt", description: 0 },
  { title: "Models", iconClass: "bx-archive-in", description: 0 },
  {
    title: "Variants",
    iconClass: "bx-purchase-tag-alt",
    description: 0,
  },
  {
    title: "Blogs",
    iconClass: "bx-purchase-tag-alt",
    description: 0,
  },
  {
    title: "Customers",
    iconClass: "bx-purchase-tag-alt",
    description: 0,
  },
];

const AutomobileDashboard = props => {
  
  const [modal, setmodal] = useState(false);
  const [subscribemodal, setSubscribemodal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [periodData, setPeriodData] = useState([]);
  const [reports, setReportsData] = useState(reportsDummyData);
  const [periodType, setPeriodType] = useState("yearly");
  const [dashboardActivityDetails, setDashboardActivityDetails] = useState({});

  const { chartsData, ordersCount, totalRevenue, orderDataAveragePrice, dashboardActivity, carSearchesList } = useSelector(state => ({
    chartsData: state.Dashboard.chartsData,
    ordersCount: state.Dashboard.ordersCount,
    totalRevenue: state.Dashboard.totalRevenue,
    orderDataAveragePrice: state.Dashboard.orderDataAveragePrice,
    dashboardActivity: state.Dashboard.dashboardActivity,
    carSearchesList: state.Dashboard.carSearchesList
  }));

  useEffect(() => {
    dispatch(getCarDashboardActivity())
    dispatch(getCarSearchDashboardActivity())
  }, [])

  useEffect(() => {
    const authUserData = JSON.parse(localStorage.getItem('authUser'));
    const name = `${authUserData?.data?.user?.firstName} ${authUserData?.data?.user?.lastName}`;
    setAuthorName(name);
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubscribemodal(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    }
  }, []);

  const updateDashboardData = (newData) => {
    // Create a copy of the reportsDummyData
    const updatedReports = [...reportsDummyData];
  
    // Loop through the newData and update the corresponding descriptions
    newData?.forEach(item => {
      const reportIndex = updatedReports.findIndex(report => report.title === item.type);
      if (reportIndex !== -1) {
        updatedReports[reportIndex].description = item.description;
      }
    });
  
    // Now set the state with the updated reports
    setDashboardActivityDetails(updatedReports);
  };

  useEffect(() => {
    updateDashboardData(dashboardActivity?.dashboardList);
    // }
    setPeriodData([
      {
        name: "weekly",
        data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
      },
      {
        name: "monthly",
        data: [120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]
      },
      {
        name: "yearly",
        data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]
      },
      // ... more series objects
    ]);
  }, [chartsData, dashboardActivity]);

  // useEffect(() => {
  //   setReportsData((prevData) => {
  //     prevData[1].description = `$ ${totalRevenue}`;
  //     return prevData;
  //   });
  // }, [totalRevenue])

  // useEffect(() => {
  //   setReportsData((prevData) => {
  //     prevData[2].description = `$ ${orderDataAveragePrice}`;
  //     return prevData;
  //   });
  // }, [orderDataAveragePrice])

  const getNewChartDataBasedOnPeriod = () => {
    return periodData.find()
  }

  const onChangeChartPeriod = pType => {
    setPeriodType(pType);
    dispatch(onGetChartsData(pType));
    const newData = getNewChartDataBasedOnPeriod(pType);
    setPeriodData(newData);
  };
  

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(onGetChartsData("yearly"));
    dispatch(getTotalOrderCount());
    dispatch(getRevenueTotalData());
    dispatch(getOrderTotalAveragePrice());
  }, [dispatch]);

  //meta title
  document.title = "Dashboard | Scrollit";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumbs
            title={props.t("Dashboards")}
            breadcrumbItem={props.t("Dashboard")}
          />

          <Row>
            <Col xl="4">
              <AutomobileWelcomeComp totalRevenue = {dashboardActivity.carBrandsTotal} totalSales = {reports[0].description} author={authorName} />
              {/* <MonthlyEarning /> */}
            </Col>
            <Col xl="8">
              <Row>
                {/* Reports Render */}
                {reports.map((report, key) => (
                  <Col md="4" key={"_col_" + key}>
                    <Card className="mini-stats-wid">
                      <CardBody>
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium">
                              {report.title}
                            </p>
                            <h4 className="mb-0">{report.description}</h4>
                          </div>
                          <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                            <span className="avatar-title rounded-circle bg-primary">
                              <i
                                className={
                                  "bx " + report.iconClass + " font-size-24"
                                }
                              ></i>
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>

      
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <LatestCarSearches carSearchesList={carSearchesList} />
            </Col>
          </Row>
        </Container>
      </div>

      {/* subscribe ModalHeader */}
      {/* <Modal
        isOpen={subscribemodal}
        role="dialog"
        autoFocus={true}
        centered
        data-toggle="modal"
        toggle={() => {
          setSubscribemodal(!subscribemodal);
        }}
      >
        <div>
          <ModalHeader
            className="border-bottom-0"
            toggle={() => {
              setSubscribemodal(!subscribemodal);
            }}
          ></ModalHeader>
        </div>
        <div className="modal-body">
          <div className="text-center mb-4">
            <div className="avatar-md mx-auto mb-4">
              <div className="avatar-title bg-light  rounded-circle text-primary h1">
                <i className="mdi mdi-email-open"></i>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-xl-10">
                <h4 className="text-primary">Subscribe !</h4>
                <p className="text-muted font-size-14 mb-4">
                  Subscribe our newletter and get notification to stay update.
                </p>

                <div
                  className="input-group rounded bg-light"
                >
                  <Input
                    type="email"
                    className="form-control bg-transparent border-0"
                    placeholder="Enter Email address"
                  />
                  <Button color="primary" type="button" id="button-addon2">
                    <i className="bx bxs-paper-plane"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal> */}

      <Modal
        isOpen={modal}
        role="dialog"
        autoFocus={true}
        centered={true}
        className="exampleModal"
        tabIndex="-1"
        toggle={() => {
          setmodal(!modal);
        }}
      >
        <div>
          <ModalHeader
            toggle={() => {
              setmodal(!modal);
            }}
          >
            Order Detail
          </ModalHeader>
          <ModalBody>
            <p className="mb-2">
              Product id: <span className="text-primary">#SK2540</span>
            </p>
            <p className="mb-4">
              Billing Name: <span className="text-primary">Neal Matthews</span>
            </p>

            <div className="table-responsive">
              <Table className="table table-centered table-nowrap">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <div>
                        <img src={modalimage1} alt="" className="avatar-sm" />
                      </div>
                    </th>
                    <td>
                      <div>
                        <h5 className="text-truncate font-size-14">
                          Wireless Headphone (Black)
                        </h5>
                        <p className="text-muted mb-0">$ 225 x 1</p>
                      </div>
                    </td>
                    <td>$ 255</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <div>
                        <img src={modalimage2} alt="" className="avatar-sm" />
                      </div>
                    </th>
                    <td>
                      <div>
                        <h5 className="text-truncate font-size-14">
                          Hoodie (Blue)
                        </h5>
                        <p className="text-muted mb-0">$ 145 x 1</p>
                      </div>
                    </td>
                    <td>$ 145</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Sub Total:</h6>
                    </td>
                    <td>$ 400</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Shipping:</h6>
                    </td>
                    <td>Free</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <h6 className="m-0 text-end">Total:</h6>
                    </td>
                    <td>$ 400</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="secondary"
              onClick={() => {
                setmodal(!modal);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </React.Fragment>
  );
};

AutomobileDashboard.propTypes = {
  t: PropTypes.any,
  chartsData: PropTypes.any,
  onGetChartsData: PropTypes.func,
};

export default withTranslation()(AutomobileDashboard);
