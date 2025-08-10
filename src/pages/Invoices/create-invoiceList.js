import React, { useEffect, useMemo, useState } from "react";
import { Button, Container, Modal } from "reactstrap";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { getInvoiceList } from "../../store/invoices/actions";

import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

import "./create-invoiceList.scss";

const CreateInvoiceList = () => {
  document.title = "Invoice List | Scrollit";

  const [modalOpen, setModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Load page and limit from localStorage
  const [page, setPage] = useState(
    () => Number(localStorage.getItem("invoicePage")) || 1
  );
  const [limit, setLimit] = useState(
    () => Number(localStorage.getItem("invoiceLimit")) || 10
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { invoiceList, loading, total } = useSelector(state => state.invoices);

  // Persist page/limit to localStorage
  useEffect(() => {
    localStorage.setItem("invoicePage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("invoiceLimit", limit);
  }, [limit]);

  // Fetch invoice list on page/limit change
  useEffect(() => {
    dispatch(getInvoiceList(page, limit));
  }, [dispatch, page, limit]);

  const handleAddInvoiceClicks = () => {
    navigate("/add-invoice");
  };

  const columns = useMemo(
    () => [
      {
        Header: "Customer Name",
        accessor: "customerName",
        filterable: true,
        Cell: ({ row }) => (
          <div>
            <strong>{row.original.customerName}</strong>
            <div style={{ fontSize: "10px", color: "#888" }}>
              {row.original.customerEmail}
            </div>
          </div>
        ),
      },
      {
        Header: "Invoice Id",
        accessor: "invoiceNumber",
        filterable: true,
      },
      {
        Header: "Booking Date",
        accessor: "bookingDate",
        filterable: true,
      },
      {
        Header: "Total Amount",
        accessor: "totalAmount",
        filterable: true,
        Cell: ({ value }) => `₹ ${value}`,
      },
      {
        Header: "View Invoice",
        accessor: "s3Url",
        disableFilters: true,
        Cell: ({ value }) =>
          value ? (
            <Button
              color="primary"
              className="btn-rounded"
              onClick={() => {
                setPdfUrl(value);
                setModalOpen(true);
              }}
            >
              View Invoice
            </Button>
          ) : (
            "N/A"
          ),
      },
      {
        Header: "Action",
        accessor: "action",
        id: "action",
        disableFilters: true,
        Cell: () => null,
      },
    ],
    []
  );

  // Process invoice list
  const processedInvoiceList = Array.isArray(invoiceList)
    ? invoiceList.map(inv => {
        const details = inv.bookingDetails || {};
        const firstName = details.customerFirstName || "Guest";
        const lastName = details.customerLastName || "";
        const email = details.customerEmail || "";
        const items = Array.isArray(inv.items) ? inv.items : [];

        return {
          ...inv,
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
          bookingDate: details.bookingDate || "-",
          totalAmount: items.reduce((sum, item) => sum + (item.total || 0), 0),
        };
      })
    : [];

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Invoices" breadcrumbItem="Invoice List" />

        <div className="invoice-list-page">
          <TableContainer
            columns={columns}
            data={processedInvoiceList}
            isGlobalFilter={true}
            isAddOptions={false}
            isAddInvoiceOptions={true}
            handleAddInvoiceClicks={handleAddInvoiceClicks}
            customPageSize={limit}
            totalRecords={total}
            currentPage={page}
            onPageChange={newPage => setPage(newPage)}
            onPageSizeChange={newLimit => {
              setLimit(newLimit);
              setPage(1); // Reset page when limit changes
            }}
            initialState={{
              sortBy: [], // disables default sorting
            }}
            isLoading={loading} // assumes TableContainer handles loading
            className="custom-header-css"
          />
        </div>

        {/* PDF Modal */}
        <Modal
          isOpen={modalOpen}
          toggle={() => setModalOpen(!modalOpen)}
          size="xl"
          scrollable
        >
          <div className="modal-header">
            <h5 className="modal-title">Invoice Preview</h5>
            <button
              type="button"
              className="close"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ height: "80vh" }}>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Invoice PDF"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            ) : (
              <p>No PDF to display</p>
            )}
          </div>
        </Modal>
      </Container>
    </div>
  );
};

export default CreateInvoiceList;
