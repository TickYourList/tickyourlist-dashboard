import React, { useEffect, useMemo, useState } from "react";
import { Button, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

import { getCustomerList } from "../../store/customers/actions";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

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

  useEffect(() => {
    dispatch(getCustomerList(page, limit));
  }, [dispatch, page, limit]);

  // Persist pagination
  useEffect(() => {
    localStorage.setItem("customerPage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("customerLimit", limit);
  }, [limit]);

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
            onClick={() => {
              console.log("View booking for:", row.original._id);
            }}
          >
            View Booking
          </Button>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "8px" }}>
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
        ),
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Customers" breadcrumbItem="Customer List" />

        <div className="customer-list-page">
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
      </Container>
    </div>
  );
};

export default CustomersList;
