import React from "react";
import { Button } from "reactstrap";
import toastr from "toastr";
import {Badge } from "reactstrap"

const BookingID = ({ value }) => value || "-";

const CustomerName = ({ value }) => value || "-";

const CustomerInfo = ({ value }) => {
    const [email, ...phoneParts] = value.split(" ");
    const phone = phoneParts.join(" ");
    return (
      <div>
        <div>{email || "-"}</div>
        <div>{phone}</div>
      </div>
    );
};

const TotalGuests = ({ value }) => (value != null ? value : "-");

const TourTitle = ({ value }) => value || "-";

const BookingDate = ({ value }) => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const GuestPrice = ({ value }) => value || "-";  

const TotalAmount = ({ value }) => value || "-";

const Status = ({ value }) => {
  return <Badge color={value === "CONFIRMED" ?"success" : "secondary"}> {value} </Badge>
};


const DownloadInvoice = ({ row }) => {
  const invoiceUrl = row.original?.invoice?.s3Url;
  const isAvailable = row.original?.invoice?.status;

  const handleDownload = async () => {
    try {
      const response = await fetch(invoiceUrl, { mode: "cors" });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      toastr.error("Failed to download invoice.");
    }
  };

  return isAvailable && invoiceUrl ? (
    // <Button color="info" size="sm" onClick={handleDownload}>
    //   Download Invoice
    // </Button>
    <a href={invoiceUrl} target="_blank" rel="noreferrer">
      <Button color="info" size="sm">Download Invoice</Button>
    </a>
  ) : (
    <span>-</span>
  );
};

export const bookingsColumns = () => [
  {
    Header: "Booking ID",
    accessor: "_id",
    Cell: BookingID,
  },
  {
    Header: "Customer Name",
    accessor: (row) => {
      const user = row.customerUserId;
      const firstName = user?.firstName || row.nonCustomerFirstName || "";
      const lastName = user?.lastName || row.nonCustomerLastName || "";
      return `${firstName} ${lastName}`.trim()
    },
    Cell: CustomerName,
  },
  {
    Header: "Customer Info",
    accessor: row => {
      const user = row.customerUserId;
      const email = user?.email || row.email || "";
      const phone = `${row.phoneCode || ""} ${row.phoneNumber || ""}`.trim();
      return `${email} ${phone}`.trim();
    },
    Cell: CustomerInfo,
  },
  {
    Header: "Total Guests",
    accessor: "guestsCount",
    Cell: TotalGuests,
  },
  {
    Header: "Tour Title",
    accessor: (row) => row.title || row.tourId?.name,
    Cell: (props) => (
    <div style={{ minWidth: "250px", whiteSpace: "normal" }}>
      {TourTitle(props)}
    </div>
  ),
  },
  {
    Header: "Booking Date",
    accessor: "bookingDate",
    Cell: BookingDate,
  },
  {
    Header: "Guest Price",
    accessor: (row) => {
      const amount = row.guestPrice || "";
      const currency = row.currency || "";
      return amount ? `${currency} ${amount}` : "";
    },
    Cell: GuestPrice,
  },
  {
    Header: "Total Amount",
    accessor: (row) => {
      const amount = row.amount || "";
      const currency = row.currency || "";
      return amount ? `${currency} ${amount}` : "";
    },
    Cell: TotalAmount,
  },
  {
    Header: "Status",
    accessor: (row) => row.status?.toUpperCase() || "",
    Cell: Status,
  },
  {
    Header: "Action",
    accessor: "invoice",
    disableFilters: true,
    Cell: DownloadInvoice,
  },
];
