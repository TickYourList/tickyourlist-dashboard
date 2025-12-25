import React, { useEffect, useMemo, useState } from "react";
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Alert, UncontrolledTooltip } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { getCustomerList } from "../../store/customers/actions";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";
import {
  getPreviewPendingEmailAPI,
  sendPendingEmailAPI,
  resendConfirmationEmailAPI,
  getBookingDetailsAPI,
  confirmBookingAPI,
  sendInvoiceAPI,
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
        return {
          ...row,
          customerName: `${user.firstName || "Guest"} ${user.lastName || ""}`,
          customerEmail: user.email || row.email || "-",
          phone: `${row.phoneCode || ""} ${row.phoneNumber || "-"}`,
          amount: `${row.amount || "0"} ${row.currency || ""}`,
          guestsCount: row.guestsCount || 0,
          bookingDate: row.bookingDate || "-",
          status: row.status || "-",
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
        Header: "Status",
        accessor: "status",
        filterable: true,
        Cell: ({ value }) => {
          const color =
            value === "CONFIRMED"
              ? "#34c38f"
              : value === "PENDING"
              ? "#f1b44c"
              : "#f46a6a";

          return <span style={{ fontWeight: "bold", color }}>{value}</span>;
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
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {status === "PENDING" && (
                <button
                  style={{ border: "none", background: "transparent", padding: 0 }}
                  title="Preview & Send Pending Email"
                  onClick={() => handlePreviewPendingEmail(row.original)}
                >
                  <i
                    className="bx bx-mail-send"
                    style={{ fontSize: "20px", color: "#f1b44c" }}
                  />
                </button>
              )}
              {status === "CONFIRMED" && (
                <button
                  style={{ border: "none", background: "transparent", padding: 0 }}
                  title="Resend Confirmation Email"
                  onClick={() => handleResendConfirmationEmail(row.original)}
                >
                  <i
                    className="bx bx-refresh"
                    style={{ fontSize: "20px", color: "#34c38f" }}
                  />
                </button>
              )}
              <button
                style={{ border: "none", background: "transparent", padding: 0 }}
                onClick={() => {
                  console.log("Edit booking", row.original._id);
                }}
              >
                <i
                  className="bx bxs-pencil"
                  style={{ fontSize: "20px", color: "#34c38f" }}
                />
              </button>
              <button
                style={{ border: "none", background: "transparent", padding: 0 }}
                onClick={() => {
                  console.log("Delete booking", row.original._id);
                }}
              >
                <i
                  className="mdi mdi-delete"
                  style={{ fontSize: "20px", color: "#f46a6a" }}
                />
              </button>
            </div>
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

          <TableContainer
            columns={columns}
            data={processedCustomers}
            isGlobalFilter={true}
            isFilterable={true}
            isAddOptions={false}
            customPageSize={limit}
            totalRecords={total}
            currentPage={page}
            onPageChange={newPage => setPage(newPage)}
            onPageSizeChange={newLimit => {
              setLimit(newLimit);
              setPage(1);
            }}
            isLoading={loading}
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
      </Container>
    </div>
  );
};

export default CustomersList;
