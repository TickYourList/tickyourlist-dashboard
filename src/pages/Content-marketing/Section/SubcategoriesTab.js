import React, { useEffect, useState, useMemo } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import TableContainer from "components/Common/TableContainer";

import { getSubcategoriesForCity } from "helpers/backend_helper";

// A small component to display the Subcategory image
const SubcategoryImage = ({ cell }) => (
  <img 
    src={cell.value} 
    alt="Subcategory" 
    style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
  />
);

const SubcategoryTab = ({ cityCode }) => {
  const [Subcategory, setSubcategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the Subcategory only when a valid cityCode is provided
    if (cityCode) {
      setLoading(true);
      getSubcategoriesForCity(cityCode)
        .then(response => {
          // The Subcategory list is at response.data.Subcategory
          setSubcategory(response.data.subcategories || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch Subcategory for city", error);
          setLoading(false);
        });
    }
  }, [cityCode]);

  const columns = useMemo(
    () => [
      {
        Header: 'Image',
        // Access the first image in the 'medias' array
        accessor: 'medias[0].url',
        disableFilters: true,
        Cell: SubcategoryImage
      },
      {
        Header: 'Subcategory Name',
        accessor: 'displayName',
      },
      {
        Header: 'Heading',
        accessor: 'heading',
      },
      {
        Header: 'Action',
        disableFilters: true,
        Cell: ({ row }) => (
          <UncontrolledDropdown>
           <DropdownToggle tag="button" className="btn btn-lg btn-icon bg-white border-0">
                   <i className="mdi mdi-dots-horizontal"></i>
                 </DropdownToggle>
                 <DropdownMenu>
                   <DropdownItem onClick={() => onEdit(row.original)}>
                     <i className="mdi mdi-pencil me-2 text-success"></i> Edit
                   </DropdownItem>
                   <DropdownItem onClick={() => onDelete(row.original)}>
                     <i className="mdi mdi-trash-can-outline me-2 text-danger"></i> Delete
                   </DropdownItem>
                 </DropdownMenu>
          </UncontrolledDropdown>
        ),
      }
    ],
    []
  );

  if (loading) {
    return <div className="text-center p-4"></div>;
  }

  return (
    <TableContainer
      columns={columns}
      data={Subcategory}
      isGlobalFilter={false}
      customPageSize={5}
    />
  );
};

export default SubcategoryTab;