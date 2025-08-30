import React from "react";
import { Button } from "reactstrap";
import { EyeOutlined } from '@ant-design/icons';
const CollectionID = ({ value }) => value || "-";

const CollectionImage = ({ row }) => {
  const imageUrl = row.original?.heroImageUrl || row.original?.cardImageUrl || "";

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Collection"
      className="img-fluid"
      style={{ width: "120px", height: "80px", objectFit: "cover" }}
    />
  ) : (
    <span>-</span>
  );
};

const CollectionName = ({ value }) => value || "-"

const CollectionType = ({ value }) => value || "-"

const CityName = ({ value }) => value || "-"; 

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


export const collectionsColumns = (city_Name) => [
  {
    Header: "Collection ID",
    accessor: "_id",
    Cell: CollectionID,
  },
  {
    Header: "Image",
    accessor: "image", 
    disableFilters: true,
    Cell: CollectionImage,
  },
  {
    Header: "Collection Name",
    accessor: (row) => row.displayName || row.name, 
    Cell: CollectionName,
  },
  {
    Header: "Collection Type",
    accessor: "collectionType",
    Cell: CollectionType,
  },
  {
    Header: "City Name",
    accessor: (row) => city_Name || row.cityCode,
    Cell: CityName,
  },
  {
    Header: "Action",
    accessor: "action",
    disableFilters: true,
    Cell: ViewAction,
  },
];
