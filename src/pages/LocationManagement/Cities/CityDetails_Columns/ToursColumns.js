import React from "react";
import { Button } from "reactstrap";
import { EyeOutlined } from '@ant-design/icons';
import {Badge } from "reactstrap"
const TourID = ({ value }) => value || "-";

const TourImage = ({ row }) => {
  const imageUrl =
    row.original?.imageUploads?.[0]?.url ||
    row.original?.media?.productImages?.[0]?.url ||
    "";

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Tour"
      className="img-fluid"
      style={{ width: "120px", height: "80px", objectFit: "cover" }}
    />
  ) : (
    <span>-</span>
  );
};

const TourName = ({ value }) => {
  return value || "-";
};

const TourStatus = ({ value }) => {
  return <Badge color={value === "Active" ?"success" : "danger"}> {value} </Badge>
};

const ViewAction = ({ row }) => {
  return (
    <Button
      color="primary"
      size="sm"
    >
      <EyeOutlined fontSize="small" style={{ fontSize: 20}}/>
    </Button>
  );
};

export const toursColumns = () => [
  {
    Header: "Tour ID",
    accessor: "_id",
    Cell: TourID,
  },
  {
    Header: "Tour Image",
    accessor: "tourImage",
    disableFilters: true,
    Cell: TourImage,
  },
  {
    Header: "Tour Name",
    accessor: "name",
    Cell: TourName,
  },
  {
    Header: "Status",
    accessor: row => row.status ? "Active" : "Inactive",
    Cell: TourStatus,
  },
  {
    Header: "Action",
    accessor: "action",
    disableFilters: true,
    Cell: ViewAction,
  },
];
