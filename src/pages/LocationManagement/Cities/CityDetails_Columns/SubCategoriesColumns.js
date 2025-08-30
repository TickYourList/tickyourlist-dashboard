import React from "react";
import { Button } from "reactstrap";
import { EyeOutlined } from '@ant-design/icons';
const SubCategoryID = ({ value }) => value || "-";

const SubCategoryImage = ({ row }) => {
  const imageUrl = row.original?.medias?.[0]?.url;
  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Sub Category"
      className="img-fluid"
      style={{ width: "120px", height: "80px", objectFit: "cover" }}
    />
  ) : (
    <span>-</span>
  );
};

const SubCategoryName = ({ value }) => value || "-";

const CategoryName = ({ value }) => value || "-" ;

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

export const subCategoriesColumns = (city_Name) => [
  {
    Header: "Sub Category ID",
    accessor: "_id",
    Cell: SubCategoryID,
  },
  {
    Header: "Image",
    accessor: "image",
    disableFilters: true,
    Cell: SubCategoryImage,
  },
  {
    Header: "Sub Category Name",
    accessor: (row) => row.name || row.displayName,
    Cell: SubCategoryName,
  },
  {
    Header: "Category Name",
    accessor: "categoryName",  
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
