import React from "react";
import {
  Modal,
  Row,
  Button,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Tabel,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

import {
  getPricingList,
  getBookingList,
} from "../../store/TourGroupVariant/action";
import "./ViewDetail.scss";

const ViewDetail = ({ isOpen, toggle, activeTab, setActiveTab }) => {
  const [showTabs, setShowTabs] = useState(false);

  const { bookingList, pricingList, tourGroupVariantDetail } = useSelector(
    state => state.TourGroupVariant
  );

  const variant = tourGroupVariantDetail?.variant || {};
  const tourGroup = tourGroupVariantDetail?.tourGroup || {};
  const analytics = tourGroupVariantDetail?.analytics || {};

  const imageUrl =
    tourGroup?.media?.productImages?.[0]?.url || "/placeholder.jpg";
  const navigate = useNavigate();

  const bookings = bookingList.bookings || [];

  const handleEditButtonClick = variantId => {
    // console.log(variantId);
    navigate(`/tour-group-variants/edit/${variantId}`);
  };

  const dispatch = useDispatch();
  const handleTabClick = tabId => {
    setActiveTab(tabId);
    setShowTabs(true);
    if (tabId === "3" && variant?._id) {
      dispatch(getPricingList(variant._id));
    }
    if (tabId === "4" && variant?._id) {
      dispatch(getBookingList(variant._id));
    }
  };

  const handleDownloadInvoice = bookingId => {
    // Implement invoice download logic here
    console.log("Download invoice for booking:", bookingId);
  };

  const columns = useMemo(
    () => [
      {
        Header: "Booking ID",
        accessor: "_id",
      },
      {
        Header: "Customer Name",
        accessor: row => row.customerName || "",
        id: "customerName",
      },
      {
        Header: "Customer Info",
        accessor: row =>
          `${row.customerEmail || row.email || ""} | ${row.phoneCode || ""} ${
            row.customerPhone || row.phoneNumber || ""
          }`,
        id: "customerInfo",
        Cell: ({ value }) => {
          const [email, phone] = value.split("|");
          return (
            <div>
              <div>{email?.trim()}</div>
              <small className="text-muted">{phone?.trim()}</small>
            </div>
          );
        },
      },
      {
        Header: "Total Guests",
        accessor: row => row.guestsCount ?? row.totalGuests ?? 0,
      },
      {
        Header: "Tour Title",
        accessor: row => row.tourGroupId?.name || "",
      },
      {
        Header: "Booking Date",
        accessor: "bookingDate",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "",
      },
      {
        Header: "Guest Price",
        accessor: row => `${row.guestPrice || 0}`,
      },
      {
        Header: "Total Amount",
        accessor: row => `${row.amount || 0}`,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`badge ${
              value === "CONFIRMED" ? "bg-success" : "bg-warning"
            }`}
          >
            {value || "PENDING"}
          </span>
        ),
      },
      {
        Header: "Action",
        Cell: ({ row }) =>
          row.original.invoice?.s3Url ? (
            <a
              className="btn btn-sm btn-primary"
              href={row.original.invoice.s3Url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Invoice
            </a>
          ) : (
            <span className="text-muted">No Invoice</span>
          ),
      },
    ],
    []
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <div className="modal-header">
        <h3 className="modal-title mt-0" id="model-title">
          Tour Group Variant Overview - {variant?.name || ""}
        </h3>
        <button type="button" className="close" onClick={toggle}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div className="modal-body viewdetail-modal-body">
        {variant && (
          <>
            {/* Top Section */}
            <Row className="mb-4">
              <Col md="4">
                <img
                  src={imageUrl || "/placeholder.jpg"}
                  alt="Tour"
                  style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                />
              </Col>
              <Col md="6">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="mb-0">{variant.name}</h3>

                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "0.75rem" }}
                  >
                    <span
                      className="badge fs-6 px-3 py-2"
                      style={{
                        fontSize: "1rem",
                        borderRadius: "20px",
                        backgroundColor: variant.notAvailable
                          ? "#10b981"
                          : "#d4edda",
                        color: variant.notAvailable ? "#721c24" : "#155724",
                      }}
                    >
                      {variant.notAvailable ? "Inactive" : "Active"}
                    </span>

                    <div className="editButton">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                        onClick={() => handleEditButtonClick(variant._id)}
                      >
                        <i className="bx bx-edit"></i>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mb-1">{tourGroup.name}</p>
                <p className="mb-1 text-primary">
                  <i className="mdi mdi-map-marker"></i>{" "}
                  {tourGroup?.startLocation?.cityName || "NA"},{" "}
                  {tourGroup?.startLocation?.countryCode || ""}
                </p>

                <div className="d-flex align-items-center gap-2">
                  <span>⭐ ⭐ ⭐ ⭐ {variant.rating || "NA"} (NA reviews)</span>
                </div>

                <Row className="mt-4">
                  <Col md="4">
                    <Card className="text-center bg-light">
                      <CardBody>
                        <h5 style={{ color: "#10b981" }}>
                          {analytics.totalBookings}
                        </h5>
                        <p className="mb-0">Total Bookings</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4">
                    <Card className="text-center bg-light">
                      <CardBody>
                        <h5 style={{ color: " #ff9800" }}>
                          ${analytics.monthlyRevenue || ""}
                        </h5>
                        <p className="mb-0">Monthly Revenue</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4">
                    <Card className="text-center bg-light">
                      <CardBody>
                        <h5 style={{ color: " #06b6d4" }}>
                          {analytics.avgCapacity || "N/A"}{" "}
                        </h5>
                        <p className="mb-0">Avg. Capacity</p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Tabs */}
            <Nav tabs>
              {[
                { id: "1", label: "Overview" },
                { id: "2", label: "Variants" },
                { id: "3", label: "Pricing" },
                { id: "4", label: "Bookings" },
                { id: "5", label: "Analytics" },
              ].map(tab => (
                <NavItem key={tab.id}>
                  <NavLink
                    className={classnames({ active: activeTab === tab.id })}
                    onClick={() => {
                      handleTabClick(tab.id);
                      setActiveTab(tab.id);
                      setShowTabs(true);
                    }}
                    role="button"
                  >
                    {tab.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            {/* Show tab details only after click */}
            {showTabs && (
              <div className="viewdetail-tab-scroll">
                <TabContent activeTab={activeTab} className="pt-4">
                  <TabPane tabId="1">
                    <Row>
                      {/* LEFT COLUMN */}
                      <Col md="8">
                        <h1 className="mb-2">Tour Group Description</h1>
                        {tourGroup?.summary ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: tourGroup.summary,
                            }}
                          />
                        ) : (
                          <p></p>
                        )}

                        {/* Tour Highlights */}
                        <h2 className="mt-4 mb-2">Tour Group Highlights</h2>
                        {tourGroup?.highlights ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: tourGroup.highlights,
                            }}
                          />
                        ) : (
                          <p></p>
                        )}

                        {/* Inclusions / Exclusions */}
                        <h2 className="mt-4 mb-2">What's Included</h2>
                        <Row>
                          <Col md="6">
                            <p className="text-success fw-bold">✓ Included</p>
                            {tourGroup?.inclusions ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: tourGroup.inclusions,
                                }}
                              />
                            ) : (
                              <ul>
                                <li></li>
                              </ul>
                            )}
                          </Col>
                          <Col md="6">
                            <p className="text-danger fw-bold">
                              ✗ Not Included
                            </p>
                            {tourGroup?.exclusions ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: tourGroup.exclusions,
                                }}
                              />
                            ) : (
                              <ul>
                                <li></li>
                              </ul>
                            )}
                          </Col>
                        </Row>
                      </Col>

                      <Col md="4">
                        {/* Quick Stats Card */}
                        <Card className="mb-4">
                          <CardBody>
                            <h5 className="fw-bold mb-3">
                              <strong>Quick Stats</strong>
                            </h5>
                            <p>
                              <strong>Duration:</strong>{" "}
                              {variant?.duration || ""}
                            </p>
                            <p>
                              <strong>Group Size:</strong>{" "}
                              {variant?.groupSize || ""}
                            </p>
                            <p>
                              <strong>Language:</strong>{" "}
                              {variant?.language || ""}
                            </p>
                            <p>
                              <strong>Meeting Point:</strong>{" "}
                              {variant?.meetingPoint || ""}
                            </p>
                            <p>
                              <strong>Difficulty:</strong>{" "}
                              {variant?.difficulty || ""}
                            </p>
                          </CardBody>
                        </Card>

                        {/* Connected Items Card */}
                        <Card>
                          <CardBody>
                            <h5 className="fw-bold mb-3">
                              <strong>Connected Items</strong>
                            </h5>
                            <p>
                              <strong>City:</strong> {tourGroup?.cityCode || ""}
                            </p>
                            <p>
                              <strong>Category:</strong>{" "}
                              {variant?.categoryName || ""}
                            </p>
                            <p>
                              <strong>Collections:</strong>{" "}
                              {variant?.collections?.length > 0
                                ? variant.collections.join(", ")
                                : ""}
                            </p>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="2">
                    <p>Variants content here</p>
                  </TabPane>

                  <TabPane tabId="3">
                    {/* Pricing */}
                    <div className="bg-light p-4 rounded">
                      <Row>
                        <Col md="8">
                          <h5 className="mb-3">Pricing Structure</h5>

                          {(() => {
                            // Get first date's prices
                            const firstDay = pricingList?.pricingTable?.find(
                              item => item.prices
                            );
                            console.log(firstDay);
                            if (!firstDay)
                              return <p>No pricing data available</p>;

                            const prices = firstDay.prices || [];

                            // Check if GUEST price exists
                            const guestPrice = prices.find(
                              p => p.type === "GUEST"
                            );
                            const displayPrices = guestPrice
                              ? [guestPrice] // Only show guest
                              : prices.filter(p => p.type && p.finalPrice); // Show all valid types

                            return (
                              <Row>
                                {displayPrices.map((p, idx) => (
                                  <Col md="6" key={idx}>
                                    <Card>
                                      <CardBody>
                                        <h6>{p.type || ""}</h6>
                                        <h4 className="text-primary">
                                          ${p.finalPrice?.toFixed(2) || ""}
                                          {p.originalPrice &&
                                            p.originalPrice !==
                                              p.finalPrice && (
                                              <del className="text-muted ms-2">
                                                ${p.originalPrice.toFixed(2)}
                                              </del>
                                            )}
                                        </h4>
                                      </CardBody>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            );
                          })()}

                          <Row className="mt-3">
                            <Col md="6">
                              <Card>
                                <CardBody>
                                  <h6>
                                    <i className="bx bx-time-five me-2"></i>Time
                                    Slots
                                  </h6>
                                  <p className="mb-0 text-muted">
                                    {pricingList?.pricingTable?.some(
                                      item => item.hasTimeSlots
                                    )
                                      ? "Available"
                                      : "Not Available"}
                                  </p>
                                </CardBody>
                              </Card>
                            </Col>
                            <Col md="6">
                              <Card>
                                <CardBody>
                                  <h6>
                                    <i className="bx bx-group me-2"></i>Capacity
                                  </h6>
                                  <p className="mb-0 text-muted">N/A</p>
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                        </Col>

                        <Col md="4">
                          <h5 className="mb-3">Quick Actions</h5>
                          <ul className="list-group">
                            {[
                              {
                                label: "Edit Variant",
                                icon: "bx bx-edit-alt",
                                color: "primary",
                              },
                              { label: "Manage Pricing", icon: "bx bx-money" },
                              {
                                label: "View Bookings",
                                icon: "bx bx-book-content",
                              },
                              {
                                label: "Duplicate Variant",
                                icon: "bx bx-copy",
                              },
                              {
                                label: "Delete Variant",
                                icon: "bx bx-trash text-danger",
                              },
                            ].map((action, idx) => (
                              <li
                                key={idx}
                                className={`list-group-item d-flex align-items-center ${
                                  action.color ? `text-${action.color}` : ""
                                }`}
                                style={{ cursor: "pointer" }}
                              >
                                <i className={`${action.icon} me-2`}></i>{" "}
                                {action.label}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      </Row>
                    </div>
                  </TabPane>

                  <TabPane tabId="4">
                    <div className="viewdetail-table-wrapper">
                      {bookings.length > 0 ? (
                        <TableContainer
                          columns={columns}
                          data={bookings}
                          isGlobalFilter={true}
                          customPageSize={10}
                          className="custom-header-css"
                        />
                      ) : (
                        <p>No Bookings</p>
                      )}
                    </div>
                  </TabPane>

                  <TabPane tabId="5">
                    <p>Analytics Content Here</p>
                  </TabPane>
                </TabContent>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ViewDetail;
