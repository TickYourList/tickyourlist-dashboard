import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Input,
  Label,
  Spinner,
  Badge,
} from "reactstrap";
import classnames from "classnames";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubCategoryDetailsForView,
  getSubCategoryViewToursTable,
  getSubCategoryViewBookingsTable,
  // This is a new action you need to create in your Redux actions file
  clearSubCategoryViewData
} from "store/actions";
import TableContainer from '../../../components/Common/TableContainer';
import { getCityTours, bulkConnectToursToSubcategory } from "helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";


import './SubCategoryCss.css';

// Separate components for better organization

// Renders the statistics cards (Total Tours, Bookings, Ratings)
const StatsCards = ({ travelSubcategoryDetails }) => (
  <Row className="mb-4">
    <StatsCard
      title="Total Tours"
      value={travelSubcategoryDetails.counts?.tourCount || 0}
      color="primary"
    />
    <StatsCard
      title="Total Bookings"
      value={travelSubcategoryDetails.counts?.totalBookingsCount || 0}
      color="success"
    />
    <StatsCard
      title="Avg Rating"
      value={travelSubcategoryDetails.avgRating || "N/A"}
      color="warning"
    />
  </Row>
);

// Individual stats card component
const StatsCard = ({ title, value, color }) => (
  <Col md={4} className="d-flex">
    <Card className="flex-fill stats-card" style={{ backgroundColor: "#f2f2f2" }}>
      <CardBody className="text-center stats-card-body">
        <CardTitle className="stats-card-title">{title}</CardTitle>
        <h2 className={`stats-card-value text-${color}`}>{value}</h2>
      </CardBody>
    </Card>
  </Col>
);

// Component to display the list of tours
const ToursTable = ({ tours }) => {
  const toursColumns = useMemo(
    () => [
      {
        Header: "Tour ID",
        accessor: "_id",
        filterable: true,
        width: 150, // Fixed width to prevent wrapping
      },
      {
        Header: "Tour Image",
        accessor: "imageUploads",
        disableFilters: true,
        width: 80, // Fixed width
        Cell: ({ row: { original } }) => {
          const imageUrl = original.imageUploads?.[0]?.url || 'https://placehold.co/50x50/E2E8F0/1A202C?text=No+Image';
          return (
            <img
              src={imageUrl}
              alt="Tour"
              className="avatar-sm rounded"
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          );
        },
      },
      {
        Header: "Tour Name",
        accessor: "name",
        filterable: true,
        minWidth: 200, // Allows it to grow
      },
      {
        Header: "Status",
        accessor: "status",
        width: 100, // Fixed width
        Cell: ({ value }) => {
          const statusText = value ? "Active" : "Inactive";
          const statusColor = value ? "bg-success" : "bg-danger";
          return <span className={`badge ${statusColor}`}>{statusText}</span>;
        },
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        width: 80, // Fixed width
        Cell: () => (
          <Button color="info" className="btn-sm">
            <i className="bx bx-show-alt font-size-16 align-middle"></i>
          </Button>
        ),
      },
    ],
    []
  );

  return tours?.length > 0 ? (
    <TableContainer
      columns={toursColumns}
      data={tours}
      isGlobalFilter={true}
      isCustomPageSize={false}
      className="custom-header-css"
      customPageSize={10}
    />
  ) : (
    <p className="text-center text-muted mt-4">
      No tours found for this subcategory.
    </p>
  );
};

// Component to display the list of bookings
const BookingsTable = ({ bookings }) => {
  const bookingsColumns = useMemo(
    () => [
      {
        Header: "Booking ID",
        accessor: "_id",
        width: 150,
      },
      {
        Header: "Customer Name",
        accessor: "nonCustomerName",
        minWidth: 150,
        Cell: ({ row: { original } }) => {
          const { nonCustomerFirstName, nonCustomerLastName } = original || {};
          if (!nonCustomerFirstName && !nonCustomerLastName) {
            return "N/A";
          }
          return `${nonCustomerFirstName || ""} ${nonCustomerLastName || ""}`.trim();
        },
      },
      {
        Header: "Customer Info",
        accessor: "customerInfo",
        minWidth: 200,
        Cell: ({ row: { original } }) => (
          <>
            <div>Email: {original.email || "N/A"}</div>
            <div>Phone: {original.phoneNumber || "N/A"}</div>
          </>
        ),
      },
      {
        Header: "Total Guests",
        accessor: "guestsCount",
        width: 120,
      },
      {
        Header: "Tour Title",
        accessor: "tourGroupId.name",
        minWidth: 200,
        Cell: ({ value }) => value || "N/A",
      },
      {
        Header: "Booking Date",
        accessor: "bookingDate",
        width: 120,
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: "Total Amount",
        accessor: "amount",
        width: 120,
        Cell: ({ value }) => (value ? `$${value}` : "N/A"),
      },
      {
        Header: "Status",
        accessor: "status",
        width: 100,
        Cell: ({ value }) => {
          const statusText = value === "CONFIRMED" ? "Confirmed" : "Pending";
          const statusColor = value === "CONFIRMED" ? "bg-success" : "bg-warning";
          return <span className={`badge ${statusColor}`}>{statusText}</span>;
        },
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        width: 150,
        Cell: () => (
          <Button color="primary" className="btn-sm">
            Download Invoice
          </Button>
        ),
      },
    ],
    []
  );

  return bookings?.length > 0 ? (
    <TableContainer
      columns={bookingsColumns}
      data={bookings}
      isGlobalFilter={true}
      isCustomPageSize={false}
      className="custom-header-css"
      customPageSize={10}
    />
  ) : (
    <p className="text-center text-muted mt-4">
      No bookings found for this subcategory.
    </p>
  );
};

// Main Modal Component
const TravelSubCategoryDetailsModal = ({ isOpen, toggle, subCategoryId, canEdit }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("1");

  // Bulk connection state
  const [connectCityCode, setConnectCityCode] = useState("");
  const [availableTours, setAvailableTours] = useState([]);
  const [selectedTourIds, setSelectedTourIds] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showConnectSection, setShowConnectSection] = useState(false);

  const {
    travelSubcategoryDetails,
    SubcategoryViewToursTable,
    SubcategoryViewBookingsTable,
    loading,
    error,
  } = useSelector((state) => state.travelSubCategoryReducer);

  // Fetch data and reset the active tab when the modal opens or the ID changes
  useEffect(() => {
    if (isOpen && subCategoryId) {
      // 1. Reset the active tab to "1" (Tours) every time the modal opens
      setActiveTab("1");

      // 2. Clear old data from the Redux store
      dispatch(clearSubCategoryViewData());

      // 3. Fetch new data
      dispatch(getSubCategoryDetailsForView(subCategoryId));
      dispatch(getSubCategoryViewToursTable(subCategoryId));

      console.log("Fetching data for subcategory ID:", subCategoryId);
    }
  }, [subCategoryId, dispatch, isOpen]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // Fetch data for the selected tab if it hasn't been fetched yet
      if (tab === "2" && !SubcategoryViewBookingsTable?.bookings) {
        dispatch(getSubCategoryViewBookingsTable(subCategoryId));
        console.log("Fetching bookings for subcategory ID:", subCategoryId);
      } else if (tab === "1" && !SubcategoryViewToursTable?.tours) {
        dispatch(getSubCategoryViewToursTable(subCategoryId));
      }
    }
  };

  const handleFetchToursByCity = async () => {
    if (!connectCityCode || !subCategoryId) return;

    setLoadingTours(true);
    try {
      const response = await getCityTours({ cityCode: connectCityCode, page: 1, limit: 100 });
      if (response?.data?.tours) {
        setAvailableTours(response.data.tours);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      showToastError("Failed to load tours for this city");
    } finally {
      setLoadingTours(false);
    }
  };

  const handleTourToggle = (tourId) => {
    setSelectedTourIds((prev) => {
      if (prev.includes(tourId)) {
        return prev.filter((id) => id !== tourId);
      } else {
        return [...prev, tourId];
      }
    });
  };

  const handleBulkConnect = async () => {
    if (!subCategoryId || selectedTourIds.length === 0) {
      showToastError("Please select at least one tour");
      return;
    }

    setConnecting(true);
    try {
      await bulkConnectToursToSubcategory(subCategoryId, selectedTourIds);
      showToastSuccess(`Successfully connected ${selectedTourIds.length} tour(s) to subcategory`);
      setSelectedTourIds([]);
      setAvailableTours([]);
      setConnectCityCode("");
      setShowConnectSection(false);
      // Refresh subcategory tours
      dispatch(getSubCategoryViewToursTable(subCategoryId));
    } catch (error) {
      console.error("Error connecting tours:", error);
      showToastError("Failed to connect tours to subcategory");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered className="custom-wide-modal">
      <ModalHeader toggle={toggle} className="border-bottom pb-3">
        Sub Category Overview - {travelSubcategoryDetails?.displayName || "Loading..."}
      </ModalHeader>
      <ModalBody>
        {loading && !travelSubcategoryDetails ? (
          <div className="text-center p-5">
            <i className="mdi mdi-spin mdi-loading display-4 text-primary"></i>
            <p className="mt-2">Loading subcategory details...</p>
          </div>
        ) : error ? (
          <Alert color="danger" className="text-center">
            Error loading details: {error.message || "An unexpected error occurred."}
          </Alert>
        ) : (
          travelSubcategoryDetails && (
            <>
              {/* Header section with image, title, and edit button */}
              <div className="d-flex align-items-center mb-3">
                {travelSubcategoryDetails.medias?.[0]?.url && (
                  <img
                    src={travelSubcategoryDetails.medias[0].url}
                    alt={travelSubcategoryDetails.displayName}
                    className="rounded me-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                )}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <h4 className="fw-bold mb-0 me-2">
                      {travelSubcategoryDetails.displayName || travelSubcategoryDetails.name || "N/A"}
                    </h4>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <p className="text-muted mt-2 mb-0">
                    {travelSubcategoryDetails.metaDescription || "No description provided."}
                  </p>
                </div>
                {canEdit && (
                  <Link 
                    to={`/edit-subCategory/${travelSubcategoryDetails._id}${searchParams.get('cityCode') ? `?cityCode=${searchParams.get('cityCode')}` : ''}`}
                    onClick={() => {
                      // Store cityCode in localStorage as backup
                      const cityCode = searchParams.get('cityCode');
                      if (cityCode) {
                        localStorage.setItem('subcategoryEditCityCode', cityCode);
                      }
                    }}
                  >
                    <Button color="primary" className="ms-3">
                      <i className="bx bx-edit font-size-18 align-middle me-1"></i>
                      Edit SubCategory
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats Cards Section */}
              <StatsCards travelSubcategoryDetails={travelSubcategoryDetails} />

              {/* Navigation Tabs */}
              <Nav tabs className="nav-tabs-custom mt-3">
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => toggleTab("1")}
                  >
                    Tours
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => toggleTab("2")}
                  >
                    Bookings
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => toggleTab("3")}
                  >
                    Analytics
                  </NavLink>
                </NavItem>
              </Nav>

              {/* Tab Content */}
              <TabContent activeTab={activeTab} className="p-3 text-muted">
                <TabPane tabId="1">
                  {/* Bulk Connect Section */}
                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Connect Tours to Subcategory</h5>
                      {canEdit && (
                        <Button
                          size="sm"
                          color={showConnectSection ? "secondary" : "primary"}
                          onClick={() => {
                            setShowConnectSection(!showConnectSection);
                            if (!showConnectSection) {
                              setSelectedTourIds([]);
                              setAvailableTours([]);
                              setConnectCityCode("");
                            }
                          }}
                        >
                          {showConnectSection ? "Hide" : "Connect Tours"}
                        </Button>
                      )}
                    </div>

                    {showConnectSection && canEdit && (
                      <Row>
                        <Col md={4}>
                          <Label>City Code</Label>
                          <Input
                            type="text"
                            value={connectCityCode}
                            onChange={(e) => setConnectCityCode(e.target.value.toUpperCase())}
                            placeholder="Enter city code (e.g., DUBAI, PNQ)"
                            className="text-uppercase"
                          />
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                          <Button
                            color="primary"
                            onClick={handleFetchToursByCity}
                            disabled={!connectCityCode || loadingTours}
                          >
                            {loadingTours ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Loading...
                              </>
                            ) : (
                              "Fetch Tours"
                            )}
                          </Button>
                        </Col>
                      </Row>
                    )}

                    {showConnectSection && canEdit && availableTours.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>
                            <Badge color="info">{selectedTourIds.length} selected</Badge> out of {availableTours.length} tours
                          </span>
                          <Button
                            color="success"
                            size="sm"
                            onClick={handleBulkConnect}
                            disabled={selectedTourIds.length === 0 || connecting}
                          >
                            {connecting ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Connecting...
                              </>
                            ) : (
                              `Connect ${selectedTourIds.length} Tour(s)`
                            )}
                          </Button>
                        </div>
                        <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "4px", padding: "10px" }}>
                          {availableTours.map((tour) => {
                            const tourId = tour._id || tour.id;
                            const isSelected = selectedTourIds.includes(tourId);
                            return (
                              <div key={tourId} className="d-flex align-items-center mb-2">
                                <Input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTourToggle(tourId)}
                                  className="me-2"
                                />
                                <Label className="mb-0 flex-grow-1">
                                  {tour.name || "Unnamed Tour"} {tour.cityCode && `(${tour.cityCode})`}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <h5 className="mb-3">Connected Tours</h5>
                  <ToursTable tours={SubcategoryViewToursTable?.tours} />
                </TabPane>
                <TabPane tabId="2">
                  <BookingsTable bookings={SubcategoryViewBookingsTable?.bookings} />
                </TabPane>
                <TabPane tabId="3">
                  <p className="text-center text-muted mt-4">Analytics content goes here.</p>
                </TabPane>
              </TabContent>
            </>
          )
        )}
      </ModalBody>
      <div className="modal-footer">
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </div>
      <style>
        {`
          .custom-wide-modal .modal-content {
            width: 95vw !important;
            max-width: 1300px; 
            margin: auto;
          }
          .custom-wide-modal .modal-body {
            overflow-x: hidden;
            overflow-y: auto;
            flex: 1;
          }
        `}
      </style>
    </Modal>
  );
};

TravelSubCategoryDetailsModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  subCategoryId: PropTypes.string,
  canEdit: PropTypes.bool,
};

TravelSubCategoryDetailsModal.defaultProps = {
  isOpen: false,
  toggle: () => { },
  subCategoryId: null,
  canEdit: false,
};

export default TravelSubCategoryDetailsModal;