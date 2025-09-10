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
} from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  getSubCategoryDetailsForView, 
  getSubCategoryViewToursTable, 
  getSubCategoryViewBookingsTable,
  // This is a new action you need to create in your Redux actions file
  clearSubCategoryViewData
} from "store/actions";
import TableContainer from '../../../components/Common/TableContainer';


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
  const [activeTab, setActiveTab] = useState("1");

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
                  <Link to={`/edit-subcategory/${travelSubcategoryDetails._id}`}>
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
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  subCategoryId: PropTypes.string,
  canEdit: PropTypes.bool,
};

export default TravelSubCategoryDetailsModal;