import React, { useEffect, useMemo, useState } from "react";
import { 
  Button, 
  Container, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Spinner, 
  Alert, 
  UncontrolledTooltip,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { getCustomerList } from "../../store/customers/actions";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainerWithServerSidePagination from "components/Common/TableContainerWithServerSidePagination";
import {
  getPreviewPendingEmailAPI,
  sendPendingEmailAPI,
  resendConfirmationEmailAPI,
  getBookingDetailsAPI,
  confirmBookingAPI,
  sendInvoiceAPI,
  updateBookingStatusAPI,
  updateTicketDeliveryAPI,
} from "../../helpers/location_management_helper";

import "./CustomersList.scss";

const CustomersList = () => {
  document.title = "Customer List | Scrollit";

  const dispatch = useDispatch();
  const { customers, loading, total } = useSelector(state => state.customers);

  // Pagination state
  const [page, setPage] = useState(
    () => Number(localStorage.getItem("customerPage")) || 1
  );
  const [limit, setLimit] = useState(
    () => Number(localStorage.getItem("customerLimit")) || 10
  );

  // Filter state
  const [dateType, setDateType] = useState("bookingDate"); // "bookingDate" or "createdDate"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");

  // Dialog states
  const [pendingEmailModal, setPendingEmailModal] = useState(false);
  const [viewBookingModal, setViewBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pendingEmailHTML, setPendingEmailHTML] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState({ show: false, message: "", color: "" });
  const [confirmResendModal, setConfirmResendModal] = useState(false);
  const [confirmBookingModal, setConfirmBookingModal] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState(null);
  const [sendInvoice, setSendInvoice] = useState(true); // Default to true
  
  // Status Update Modal States
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [refundDetails, setRefundDetails] = useState({
    refundAmount: "",
    refundReason: "",
    refundMethod: "original_payment",
    refundReference: "",
    refundNotes: ""
  });
  
  // Ticket Delivery Modal States
  const [ticketDeliveryModal, setTicketDeliveryModal] = useState(false);
  const [ticketDeliveryData, setTicketDeliveryData] = useState({
    deliveredViaOtherMeans: false,
    deliveryMethod: "email",
    isDelivered: true,
    failureReason: "",
    failureNotes: ""
  });

  useEffect(() => {
    dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
  }, [dispatch, page, limit, dateType, startDate, endDate]);

  // Persist pagination
  useEffect(() => {
    localStorage.setItem("customerPage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("customerLimit", limit);
  }, [limit]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
  };

  // Handle invoice preview
  const handleViewInvoice = (s3Url) => {
    setInvoiceUrl(s3Url);
    setInvoiceModalOpen(true);
  };

  // Handle preview pending email
  const handlePreviewPendingEmail = async (booking) => {
    setSelectedBooking(booking);
    setLoadingEmail(true);
    setPendingEmailModal(true);
    setPendingEmailHTML("");

    try {
      const response = await getPreviewPendingEmailAPI(booking._id);
      if (response.statusCode === "10000") {
        setPendingEmailHTML(response.data.html);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to load email preview",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error loading email preview:", error);
      setEmailAlert({
        show: true,
        message: "Failed to load email preview. Please try again.",
        color: "danger"
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  // Handle send pending email
  const handleSendPendingEmail = async () => {
    if (!selectedBooking) return;

    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });

    try {
      const response = await sendPendingEmailAPI(selectedBooking._id);
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: "Pending email sent successfully!",
          color: "success"
        });
        setTimeout(() => {
          setPendingEmailModal(false);
          setEmailAlert({ show: false, message: "", color: "" });
        }, 2000);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to send email",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailAlert({
        show: true,
        message: "Failed to send email. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle resend confirmation email - with confirmation dialog
  const handleResendConfirmationEmailClick = (booking) => {
    setSelectedBooking(booking);
    setConfirmResendModal(true);
  };

  const handleResendConfirmationEmail = async () => {
    if (!selectedBooking) return;
    
    setConfirmResendModal(false);
    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });

    try {
      const response = await resendConfirmationEmailAPI(selectedBooking._id);
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: "Confirmation email sent successfully!",
          color: "success"
        });
        setTimeout(() => {
          setEmailAlert({ show: false, message: "", color: "" });
        }, 3000);
        // Refresh the list
        dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to send email",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error resending email:", error);
      setEmailAlert({
        show: true,
        message: "Failed to send email. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
      setSelectedBooking(null);
    }
  };

  // Handle manual booking confirmation
  const handleConfirmBookingClick = (booking) => {
    setBookingToConfirm(booking);
    setSendInvoice(true); // Reset to default
    setConfirmBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingToConfirm) return;

    setConfirmBookingModal(false);
    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });

    try {
      // Always send confirmation email with invoice (invoice is always attached)
      const response = await confirmBookingAPI(bookingToConfirm._id, true);
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: "Booking confirmed successfully! Confirmation email with invoice has been sent to the customer.",
          color: "success"
        });
        setTimeout(() => {
          setEmailAlert({ show: false, message: "", color: "" });
        }, 3000);
        // Refresh the list
        dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to confirm booking",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      setEmailAlert({
        show: true,
        message: "Failed to confirm booking. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
      setBookingToConfirm(null);
      setSendInvoice(true); // Reset to default
    }
  };

  // Handle send invoice separately
  const handleSendInvoice = async (booking) => {
    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });

    try {
      const response = await sendInvoiceAPI(booking._id);
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: "Invoice sent successfully!",
          color: "success"
        });
        setTimeout(() => {
          setEmailAlert({ show: false, message: "", color: "" });
        }, 3000);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to send invoice",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      setEmailAlert({
        show: true,
        message: "Failed to send invoice. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Handle status update modal open
  const handleStatusUpdateClick = (booking) => {
    setBookingToUpdate(booking);
    setNewStatus(booking.status);
    setRefundDetails({
      refundAmount: booking.amount || "",
      refundReason: "",
      refundMethod: "original_payment",
      refundReference: "",
      refundNotes: ""
    });
    setStatusUpdateModal(true);
  };
  
  // Handle status update submit
  const handleStatusUpdate = async () => {
    if (!bookingToUpdate || !newStatus) return;
    
    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });
    
    try {
      const refundData = newStatus === "REFUNDED" ? refundDetails : null;
      const response = await updateBookingStatusAPI(bookingToUpdate._id, newStatus, refundData);
      
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: `Booking status updated to ${newStatus} successfully!`,
          color: "success"
        });
        setStatusUpdateModal(false);
        setBookingToUpdate(null);
        dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
        setTimeout(() => {
          setEmailAlert({ show: false, message: "", color: "" });
        }, 3000);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to update status",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setEmailAlert({
        show: true,
        message: "Failed to update status. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Handle ticket delivery modal open
  const handleTicketDeliveryClick = (booking) => {
    setBookingToUpdate(booking);
    setTicketDeliveryData({
      deliveredViaOtherMeans: booking.ticketDelivery?.deliveredViaOtherMeans || false,
      deliveryMethod: booking.ticketDelivery?.deliveryMethod || "email",
      isDelivered: booking.ticketDelivery?.isDelivered || true,
      failureReason: booking.ticketDelivery?.failureReason || "",
      failureNotes: booking.ticketDelivery?.failureNotes || ""
    });
    setTicketDeliveryModal(true);
  };
  
  // Handle ticket delivery update submit
  const handleTicketDeliveryUpdate = async () => {
    if (!bookingToUpdate) return;
    
    setSendingEmail(true);
    setEmailAlert({ show: false, message: "", color: "" });
    
    try {
      const response = await updateTicketDeliveryAPI(bookingToUpdate._id, ticketDeliveryData);
      
      if (response.statusCode === "10000") {
        setEmailAlert({
          show: true,
          message: "Ticket delivery information updated successfully!",
          color: "success"
        });
        setTicketDeliveryModal(false);
        setBookingToUpdate(null);
        dispatch(getCustomerList(page, limit, dateType, startDate, endDate));
        setTimeout(() => {
          setEmailAlert({ show: false, message: "", color: "" });
        }, 3000);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to update ticket delivery",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error updating ticket delivery:", error);
      setEmailAlert({
        show: true,
        message: "Failed to update ticket delivery. Please try again.",
        color: "danger"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle view booking
  const handleViewBooking = async (booking) => {
    setSelectedBooking(booking);
    setLoadingBooking(true);
    setViewBookingModal(true);
    setBookingDetails(null);

    try {
      const response = await getBookingDetailsAPI(booking._id);
      if (response.statusCode === "10000") {
        setBookingDetails(response.data.booking);
      } else {
        setEmailAlert({
          show: true,
          message: response.message || "Failed to load booking details",
          color: "danger"
        });
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      setEmailAlert({
        show: true,
        message: "Failed to load booking details. Please try again.",
        color: "danger"
      });
    } finally {
      setLoadingBooking(false);
    }
  };

  // Process data
  const processedCustomers = Array.isArray(customers)
    ? customers.map(row => {
        const user = row.customerUserId || {};
        // Calculate total guests for AGEGROUP type bookings
        const totalGuests = row.type === "AGEGROUP" 
          ? (row.adultsCount || 0) + (row.childCount || 0) + (row.infantCount || 0) + (row.seniorCount || 0)
          : (row.guestsCount || 0);
        return {
          ...row,
          customerName: `${user.firstName || "Guest"} ${user.lastName || ""}`,
          customerEmail: user.email || row.email || "-",
          phone: `${row.phoneCode || ""} ${row.phoneNumber || "-"}`,
          amount: `${row.amount || "0"} ${row.currency || ""}`,
          guestsCount: totalGuests,
          bookingDate: row.bookingDate || "-",
          status: row.status || "-",
          ticketDeliveryStatus: row.ticketDelivery?.isDelivered 
            ? "Delivered" 
            : row.ticketDelivery?.failureReason 
              ? row.ticketDelivery.failureReason.replace(/_/g, " ")
              : "Not Set",
        };
      })
    : [];

  const columns = useMemo(
    () => [
      {
        Header: "Customer Name",
        accessor: "customerName",
        filterable: true,
        Cell: ({ value }) => <strong>{value}</strong>,
      },

      {
        Header: "Contact Details",
        accessor: "customerEmail",
        filterable: true,
        Cell: ({ row }) => (
          <div>
            <div style={{ fontSize: "12px" }}>{row.original.customerEmail}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {row.original.phone}
            </div>
          </div>
        ),
      },
      {
        Header: "Total Amount",
        accessor: "amount",
        filterable: true,
      },
      {
        Header: "Guests",
        accessor: "guestsCount",
        filterable: true,
      },
      {
        Header: "Booking Date",
        accessor: "bookingDate",
        filterable: true,
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        filterable: true,
        Cell: ({ value }) => {
          if (!value) return "-";
          try {
            const date = new Date(value);
            return date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          } catch (e) {
            return value;
          }
        },
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: true,
        Cell: ({ value }) => {
          const badgeColor =
            value === "CONFIRMED"
              ? "success"
              : value === "PENDING"
              ? "warning"
              : value === "REFUNDED"
              ? "info"
              : value === "CANCELLED"
              ? "secondary"
              : "danger";

          return (
            <Badge color={badgeColor} className="font-size-12" pill>
              {value}
            </Badge>
          );
        },
      },
      {
        Header: "Ticket Status",
        accessor: "ticketDeliveryStatus",
        filterable: true,
        Cell: ({ row }) => {
          const ticketDelivery = row.original.ticketDelivery;
          const isDelivered = ticketDelivery?.isDelivered;
          const failureReason = ticketDelivery?.failureReason;
          
          let badgeColor = "secondary"; // default gray
          let text = "Not Set";
          let icon = "bx-question-mark";
          
          if (isDelivered) {
            badgeColor = "success";
            icon = "bx-check";
            text = ticketDelivery?.deliveredViaOtherMeans 
              ? `${ticketDelivery?.deliveryMethod || 'Other'}` 
              : "Delivered";
          } else if (failureReason) {
            badgeColor = "danger";
            icon = "bx-x";
            text = failureReason.replace(/_/g, " ");
          }

          return (
            <Badge 
              color={badgeColor} 
              className="font-size-11"
              style={{ cursor: "pointer" }}
              onClick={() => handleTicketDeliveryClick(row.original)}
              title="Click to update ticket delivery"
            >
              <i className={`bx ${icon} me-1`}></i>
              {text}
            </Badge>
          );
        },
      },
      {
        Header: "View Booking",
        accessor: "viewBooking",
        disableFilters: true,
        Cell: ({ row }) => (
          <Button
            color="primary"
            className="btn-rounded"
            size="sm"
            onClick={() => handleViewBooking(row.original)}
          >
            View Booking
          </Button>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: ({ row }) => {
          const status = row.original.status;
          return (
            <UncontrolledDropdown>
              <DropdownToggle 
                tag="button" 
                className="btn btn-soft-primary btn-sm"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "4px",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 12px"
                }}
              >
                <i className="bx bx-dots-vertical-rounded"></i>
                Actions
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem header>
                  <strong>Booking Actions</strong>
                </DropdownItem>
                <DropdownItem divider />
                
                {/* Email Actions */}
                {status === "PENDING" && (
                  <DropdownItem onClick={() => handlePreviewPendingEmail(row.original)}>
                    <i className="bx bx-mail-send text-warning me-2"></i>
                    Send Pending Email
                  </DropdownItem>
                )}
                {status === "PENDING" && (
                  <DropdownItem onClick={() => handleConfirmBookingClick(row.original)}>
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Confirm Booking
                  </DropdownItem>
                )}
                {status === "CONFIRMED" && (
                  <DropdownItem onClick={() => handleResendConfirmationEmailClick(row.original)}>
                    <i className="bx bx-refresh text-success me-2"></i>
                    Resend Confirmation Email
                  </DropdownItem>
                )}
                {status === "CONFIRMED" && row.original.invoice?.s3Url && (
                  <DropdownItem onClick={() => handleSendInvoice(row.original)}>
                    <i className="bx bx-file text-info me-2"></i>
                    Send Invoice
                  </DropdownItem>
                )}
                
                <DropdownItem divider />
                <DropdownItem header>
                  <strong>Status & Delivery</strong>
                </DropdownItem>
                
                {/* Status Change */}
                <DropdownItem onClick={() => handleStatusUpdateClick(row.original)}>
                  <i className="bx bx-transfer text-primary me-2"></i>
                  Change Status
                </DropdownItem>
                
                {/* Ticket Delivery */}
                <DropdownItem onClick={() => handleTicketDeliveryClick(row.original)}>
                  <i className="bx bx-package text-warning me-2"></i>
                  Update Ticket Delivery
                </DropdownItem>
                
                {/* Quick Refund (only for confirmed) */}
                {status === "CONFIRMED" && (
                  <>
                    <DropdownItem divider />
                    <DropdownItem 
                      onClick={() => {
                        setBookingToUpdate(row.original);
                        setNewStatus("REFUNDED");
                        setRefundDetails({
                          refundAmount: row.original.amount?.toString().replace(/[^\d.]/g, '') || "",
                          refundReason: "",
                          refundMethod: "original_payment",
                          refundReference: "",
                          refundNotes: ""
                        });
                        setStatusUpdateModal(true);
                      }}
                      className="text-danger"
                    >
                      <i className="bx bx-money text-danger me-2"></i>
                      Process Refund
                    </DropdownItem>
                  </>
                )}
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Customers" breadcrumbItem="Customer List" />

        <div className="customer-list-page" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
            <h4 style={{ margin: 0 }}>Customer Bookings</h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Date Type Filter */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <label style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>Filter by:</label>
                <select
                  value={dateType}
                  onChange={(e) => {
                    setDateType(e.target.value);
                    setPage(1); // Reset to first page when filter changes
                  }}
                  style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="bookingDate">Booking Date</option>
                  <option value="createdDate">Created Date</option>
                </select>
              </div>
              {/* Date Range Filters */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
                  placeholder="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
                  placeholder="End Date"
                />
                {(startDate || endDate) && (
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Button
                color="primary"
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className="bx bx-refresh me-1"></i>
                Refresh
              </Button>
            </div>
          </div>

          {emailAlert.show && (
            <Alert color={emailAlert.color} style={{ marginBottom: "20px" }}>
              {emailAlert.message}
            </Alert>
          )}

          <TableContainerWithServerSidePagination
            columns={columns}
            data={processedCustomers}
            totalCount={total || 0}
            currentPage={page}
            pageSize={limit}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            setPageSize={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            isGlobalFilter={true}
            customPageSizeOptions={[10, 20, 30, 50]}
            className="custom-header-css"
          />
        </div>

        {/* Pending Email Preview Modal */}
        <Modal
          isOpen={pendingEmailModal}
          toggle={() => {
            setPendingEmailModal(false);
            setPendingEmailHTML("");
            setEmailAlert({ show: false, message: "", color: "" });
          }}
          size="lg"
        >
          <ModalHeader toggle={() => {
            setPendingEmailModal(false);
            setPendingEmailHTML("");
            setEmailAlert({ show: false, message: "", color: "" });
          }}>
            Pending Email Preview
          </ModalHeader>
          <ModalBody>
            {emailAlert.show && (
              <Alert color={emailAlert.color} className="mb-3">
                {emailAlert.message}
              </Alert>
            )}
            {loadingEmail ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading email preview...</p>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{ __html: pendingEmailHTML }}
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "5px",
                }}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setPendingEmailModal(false);
                setPendingEmailHTML("");
                setEmailAlert({ show: false, message: "", color: "" });
              }}
            >
              Close
            </Button>
            <Button
              color="primary"
              onClick={handleSendPendingEmail}
              disabled={loadingEmail || sendingEmail || !pendingEmailHTML}
            >
              {sendingEmail ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="bx bx-send me-1"></i>
                  Send Pending Mail
                </>
              )}
            </Button>
            {selectedBooking?.status === "PENDING" && (
              <Button
                color="success"
                onClick={() => {
                  setPendingEmailModal(false);
                  handleConfirmBookingClick(selectedBooking);
                }}
                disabled={loadingEmail || sendingEmail}
              >
                <i className="bx bx-check-circle me-1"></i>
                Confirm Booking
              </Button>
            )}
          </ModalFooter>
        </Modal>

        {/* View Booking Modal */}
        <Modal
          isOpen={viewBookingModal}
          toggle={() => {
            setViewBookingModal(false);
            setBookingDetails(null);
            setEmailAlert({ show: false, message: "", color: "" });
          }}
          size="xl"
        >
          <ModalHeader toggle={() => {
            setViewBookingModal(false);
            setBookingDetails(null);
            setEmailAlert({ show: false, message: "", color: "" });
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "40px" }}>
              <span>Booking Details</span>
              {bookingDetails?.status === "CONFIRMED" && bookingDetails?.invoice?.s3Url && (
                <Button
                  color="primary"
                  className="btn-rounded"
                  size="sm"
                  onClick={() => handleViewInvoice(bookingDetails.invoice.s3Url)}
                >
                  <i className="bx bx-file me-1"></i>
                  View Invoice
                </Button>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {emailAlert.show && (
              <Alert color={emailAlert.color} className="mb-3">
                {emailAlert.message}
              </Alert>
            )}
            {loadingBooking ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2">Loading booking details...</p>
              </div>
            ) : bookingDetails ? (
              <div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>Customer Information</h5>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <td>
                            {bookingDetails.customerUserId
                              ? `${bookingDetails.customerUserId.firstName || ""} ${bookingDetails.customerUserId.lastName || ""}`.trim()
                              : `${bookingDetails.nonCustomerFirstName || ""} ${bookingDetails.nonCustomerLastName || ""}`.trim()}
                          </td>
                        </tr>
                        <tr>
                          <th>Email</th>
                          <td>
                            {bookingDetails.customerUserId?.email || bookingDetails.email || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <th>Phone</th>
                          <td>
                            {bookingDetails.phoneCode || ""} {bookingDetails.phoneNumber || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h5>Booking Information</h5>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Booking ID</th>
                          <td>{bookingDetails._id}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <span
                              style={{
                                color:
                                  bookingDetails.status === "CONFIRMED"
                                    ? "#34c38f"
                                    : bookingDetails.status === "PENDING"
                                    ? "#f1b44c"
                                    : "#f46a6a",
                                fontWeight: "bold"
                              }}
                            >
                              {bookingDetails.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Booking Date</th>
                          <td>{bookingDetails.bookingDate || "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{bookingDetails.type || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-12">
                    <h5>Tour Information</h5>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Tour Group</th>
                          <td>{bookingDetails.tourGroupId?.name || "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Variant</th>
                          <td>{bookingDetails.variandId?.name || "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Tour</th>
                          <td>{bookingDetails.tourId?.name || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-12">
                    <h5>Guest Information</h5>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Total Guests</th>
                          <td>{bookingDetails.guestsCount || 0}</td>
                        </tr>
                        <tr>
                          <th>Adults</th>
                          <td>{bookingDetails.adultsCount || 0}</td>
                        </tr>
                        <tr>
                          <th>Children</th>
                          <td>{bookingDetails.childCount || 0}</td>
                        </tr>
                        <tr>
                          <th>Infants</th>
                          <td>{bookingDetails.infantCount || 0}</td>
                        </tr>
                        <tr>
                          <th>Seniors</th>
                          <td>{bookingDetails.seniorCount || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-12">
                    <h5>Pricing Information</h5>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Original Amount</th>
                          <td>
                            {Number(bookingDetails.originalAmount || bookingDetails.amount || 0).toFixed(2)}{" "}
                            {bookingDetails.currency || "USD"}
                          </td>
                        </tr>
                        <tr>
                          <th>Final Amount</th>
                          <td>
                            <strong>
                              {Number(bookingDetails.amount || 0).toFixed(2)}{" "}
                              {bookingDetails.currency || "USD"}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {bookingDetails.status === "CONFIRMED" && bookingDetails.invoice?.s3Url && (
                  <div className="row">
                    <div className="col-md-12">
                      <h5>Invoice</h5>
                      <div>
                        <p>Invoice Number: <strong>{bookingDetails.invoice.invoiceNumber || "N/A"}</strong></p>
                        <p style={{ color: "#888", fontSize: "14px" }}>Use the "View Invoice" button in the header to preview the invoice.</p>
                        <Button
                          color="primary"
                          className="btn-rounded"
                          size="sm"
                          onClick={() => handleSendInvoice(bookingDetails)}
                          disabled={sendingEmail}
                          style={{ marginTop: "10px" }}
                        >
                          {sendingEmail ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-paper-plane me-1"></i>
                              Send Invoice via Email
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {bookingDetails.status === "CONFIRMED" && !bookingDetails.invoice?.s3Url && (
                  <div className="row">
                    <div className="col-md-12">
                      <h5>Invoice</h5>
                      <p style={{ color: "#888", fontStyle: "italic" }}>Invoice not available yet.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <p>No booking details available</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setViewBookingModal(false);
                setBookingDetails(null);
                setEmailAlert({ show: false, message: "", color: "" });
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>

        {/* Invoice Preview Modal */}
        <Modal
          isOpen={invoiceModalOpen}
          toggle={() => setInvoiceModalOpen(!invoiceModalOpen)}
          size="xl"
          scrollable
        >
          <div className="modal-header">
            <h5 className="modal-title">Invoice Preview</h5>
            <button
              type="button"
              className="close"
              onClick={() => setInvoiceModalOpen(false)}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ height: "80vh" }}>
            {invoiceUrl ? (
              <iframe
                src={invoiceUrl}
                title="Invoice PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            ) : (
              <p>No invoice to display</p>
            )}
          </div>
        </Modal>

        {/* Confirm Booking Modal */}
        <Modal
          isOpen={confirmBookingModal}
          toggle={() => {
            setConfirmBookingModal(false);
            setBookingToConfirm(null);
          }}
        >
          <ModalHeader toggle={() => {
            setConfirmBookingModal(false);
            setBookingToConfirm(null);
          }}>
            Confirm Booking
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to confirm this booking? This will:</p>
            <ul>
              <li>Change the booking status from PENDING to CONFIRMED</li>
              <li>Generate an invoice</li>
              <li>Send a confirmation email to the customer</li>
            </ul>
            {bookingToConfirm && (
              <div style={{ marginTop: "15px" }}>
                <p><strong>Customer:</strong> {bookingToConfirm.customerName || "N/A"}</p>
                <p><strong>Email:</strong> {bookingToConfirm.customerEmail || "N/A"}</p>
                <p><strong>Booking ID:</strong> {bookingToConfirm._id}</p>
                <p><strong>Amount:</strong> {bookingToConfirm.amount || "N/A"}</p>
              </div>
            )}
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "5px", border: "1px solid #4caf50" }}>
              <p style={{ marginBottom: "10px", fontWeight: "500", color: "#2e7d32" }}>
                <i className="bx bx-info-circle me-1"></i>
                Confirmation Email with Invoice
              </p>
              <p style={{ fontSize: "14px", color: "#333", marginBottom: 0 }}>
                When you confirm this booking, a confirmation email with the invoice PDF attached will be automatically sent to the customer at <strong>{bookingToConfirm?.customerEmail || "their email address"}</strong>.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setConfirmBookingModal(false);
                setBookingToConfirm(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="success"
              onClick={handleConfirmBooking}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Confirming...
                </>
              ) : (
                <>
                  <i className="bx bx-check-circle me-1"></i>
                  Yes, Confirm Booking
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Status Update Modal */}
        <Modal
          isOpen={statusUpdateModal}
          toggle={() => {
            setStatusUpdateModal(false);
            setBookingToUpdate(null);
          }}
          size="lg"
        >
          <ModalHeader toggle={() => {
            setStatusUpdateModal(false);
            setBookingToUpdate(null);
          }}>
            Update Booking Status
          </ModalHeader>
          <ModalBody>
            {bookingToUpdate && (
              <div>
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                  <p><strong>Customer:</strong> {bookingToUpdate.customerName || "N/A"}</p>
                  <p><strong>Email:</strong> {bookingToUpdate.customerEmail || "N/A"}</p>
                  <p><strong>Booking ID:</strong> {bookingToUpdate._id}</p>
                  <p><strong>Current Status:</strong> <span style={{ fontWeight: "bold", color: bookingToUpdate.status === "CONFIRMED" ? "#34c38f" : bookingToUpdate.status === "PENDING" ? "#f1b44c" : "#f46a6a" }}>{bookingToUpdate.status}</span></p>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}>New Status:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                
                {newStatus === "REFUNDED" && (
                  <div style={{ padding: "20px", backgroundColor: "#fff3e0", borderRadius: "5px", border: "1px solid #ff9800" }}>
                    <h6 style={{ marginBottom: "15px", color: "#e65100" }}>
                      <i className="bx bx-money me-1"></i>
                      Refund Details
                    </h6>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Refund Amount:</label>
                      <input
                        type="number"
                        value={refundDetails.refundAmount}
                        onChange={(e) => setRefundDetails({ ...refundDetails, refundAmount: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                        placeholder="Enter refund amount"
                      />
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Refund Method:</label>
                      <select
                        value={refundDetails.refundMethod}
                        onChange={(e) => setRefundDetails({ ...refundDetails, refundMethod: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      >
                        <option value="original_payment">Original Payment Method</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="wallet">Wallet/TylCash</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Refund Reason:</label>
                      <input
                        type="text"
                        value={refundDetails.refundReason}
                        onChange={(e) => setRefundDetails({ ...refundDetails, refundReason: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                        placeholder="e.g., Customer requested cancellation"
                      />
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Reference Number (optional):</label>
                      <input
                        type="text"
                        value={refundDetails.refundReference}
                        onChange={(e) => setRefundDetails({ ...refundDetails, refundReference: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                        placeholder="e.g., Transaction ID"
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Notes (optional):</label>
                      <textarea
                        value={refundDetails.refundNotes}
                        onChange={(e) => setRefundDetails({ ...refundDetails, refundNotes: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px" }}
                        placeholder="Any additional notes about the refund"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setStatusUpdateModal(false);
                setBookingToUpdate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleStatusUpdate}
              disabled={sendingEmail || !newStatus}
            >
              {sendingEmail ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bx bx-check me-1"></i>
                  Update Status
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Ticket Delivery Modal */}
        <Modal
          isOpen={ticketDeliveryModal}
          toggle={() => {
            setTicketDeliveryModal(false);
            setBookingToUpdate(null);
          }}
          size="lg"
        >
          <ModalHeader toggle={() => {
            setTicketDeliveryModal(false);
            setBookingToUpdate(null);
          }}>
            Update Ticket Delivery Status
          </ModalHeader>
          <ModalBody>
            {bookingToUpdate && (
              <div>
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                  <p><strong>Customer:</strong> {bookingToUpdate.customerName || "N/A"}</p>
                  <p><strong>Booking ID:</strong> {bookingToUpdate._id}</p>
                  <p><strong>Tour:</strong> {bookingToUpdate.tourGroupId?.name || "N/A"}</p>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                    <input
                      type="checkbox"
                      id="deliveredViaOtherMeans"
                      checked={ticketDeliveryData.deliveredViaOtherMeans}
                      onChange={(e) => setTicketDeliveryData({ ...ticketDeliveryData, deliveredViaOtherMeans: e.target.checked })}
                      style={{ marginRight: "10px", width: "18px", height: "18px" }}
                    />
                    <label htmlFor="deliveredViaOtherMeans" style={{ fontWeight: "500", cursor: "pointer" }}>
                      Ticket sent through other means (WhatsApp, SMS, etc.)
                    </label>
                  </div>
                </div>
                
                {ticketDeliveryData.deliveredViaOtherMeans && (
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}>Delivery Method:</label>
                    <select
                      value={ticketDeliveryData.deliveryMethod}
                      onChange={(e) => setTicketDeliveryData({ ...ticketDeliveryData, deliveryMethod: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="manual">Manual/In-person</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
                
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}>Delivery Status:</label>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="radio"
                        id="delivered"
                        name="deliveryStatus"
                        checked={ticketDeliveryData.isDelivered}
                        onChange={() => setTicketDeliveryData({ ...ticketDeliveryData, isDelivered: true, failureReason: "" })}
                        style={{ marginRight: "8px" }}
                      />
                      <label htmlFor="delivered" style={{ cursor: "pointer", color: "#34c38f" }}>Delivered</label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="radio"
                        id="notDelivered"
                        name="deliveryStatus"
                        checked={!ticketDeliveryData.isDelivered}
                        onChange={() => setTicketDeliveryData({ ...ticketDeliveryData, isDelivered: false })}
                        style={{ marginRight: "8px" }}
                      />
                      <label htmlFor="notDelivered" style={{ cursor: "pointer", color: "#f46a6a" }}>Not Delivered</label>
                    </div>
                  </div>
                </div>
                
                {!ticketDeliveryData.isDelivered && (
                  <div style={{ padding: "20px", backgroundColor: "#ffebee", borderRadius: "5px", border: "1px solid #f44336" }}>
                    <h6 style={{ marginBottom: "15px", color: "#c62828" }}>
                      <i className="bx bx-error me-1"></i>
                      Reason for Non-Delivery
                    </h6>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Reason:</label>
                      <select
                        value={ticketDeliveryData.failureReason}
                        onChange={(e) => setTicketDeliveryData({ ...ticketDeliveryData, failureReason: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                      >
                        <option value="">Select a reason</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DATE_NOT_AVAILABLE">Date Not Available</option>
                        <option value="SUPPLIER_ISSUE">Supplier Issue</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>Additional Notes:</label>
                      <textarea
                        value={ticketDeliveryData.failureNotes}
                        onChange={(e) => setTicketDeliveryData({ ...ticketDeliveryData, failureNotes: e.target.value })}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px" }}
                        placeholder="Explain why the ticket could not be delivered"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => {
                setTicketDeliveryModal(false);
                setBookingToUpdate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleTicketDeliveryUpdate}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bx bx-check me-1"></i>
                  Update Ticket Delivery
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default CustomersList;
