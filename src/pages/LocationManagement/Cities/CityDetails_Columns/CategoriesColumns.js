import React from "react";
import { Button } from "reactstrap";
import { EyeOutlined } from '@ant-design/icons';

const CategoryID = ({ value }) => value || "-";

const CategoryImage = ({ row }) => {
  const imageUrl = row.original?.medias?.[0]?.url;
  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Category"
      className="img-fluid"
      style={{ width: "120px", height: "80px", objectFit: "cover" }}
    />
  ) : (
    <span>-</span>
  );
};

const CategoryName = ({ value }) => value || "-";

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


export const categoriesColumns = (city_Name) => [
  {
    Header: "Category ID",
    accessor: "_id",
    Cell: CategoryID,
  },
  {
    Header: "Category Image",
    accessor: "image",         
    disableFilters: true,
    Cell: CategoryImage,        
  },
  {
    Header: "Category Name",
    accessor: (row) => row.name || row.displayName,
    Cell: CategoryName,
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
