import React, { useEffect, useState, useMemo } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import TableContainer from "components/Common/TableContainer";

import { getToursForCity } from "helpers/backend_helper";

// A small component to display the category image
const TourGroupImage = ({ cell }) => (
  <img 
    src={cell.value} 
    alt="Category" 
    style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
  />
);

const TourGroupsTab = ({ cityCode }) => {
  const [Tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the Tours only when a valid cityCode is provided
    if (cityCode) {
      setLoading(true);
      getToursForCity(cityCode)
        .then(response => {
          // The category list is at response.data.Tours
          setTours(response.data.tours || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch Tours for city", error);
          setLoading(false);
        });
    }
  }, [cityCode]);

  const columns = useMemo(
    () => [
      {
        Header: 'Image',
        accessor: 'imageUploads[0].url',
        disableFilters: true,
        Cell: TourGroupImage
      },
      {
        Header: 'Tour Group Name',
        accessor: 'name',
      },
      {
        Header: 'Title',
        accessor: 'metaTitle',
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
      data={Tours}
      isGlobalFilter={false}
      customPageSize={5}
    />
  );
};

export default TourGroupsTab;