import React, { useEffect, useState, useMemo } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import TableContainer from "components/Common/TableContainer";

import { getCollectionsForCity } from "helpers/backend_helper";

// A small component to display the category image
const CollectionsImage = ({ cell }) => (
  <img 
    src={cell.value} 
    alt="Category" 
    style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
  />
);

const CollectionsTab = ({ cityCode }) => {
  const [Collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the Collections only when a valid cityCode is provided
    if (cityCode) {
      setLoading(true);
      getCollectionsForCity(cityCode)
        .then(response => {
          // The category list is at response.data.Collections
          setCollections(response.data.collections || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch Collections for city", error);
          setLoading(false);
        });
    }
  }, [cityCode]);

  const columns = useMemo(
    () => [
      {
        Header: 'Image',
        // Access the first image in the 'medias' array
        accessor: 'heroImageUrl',
        disableFilters: true,
        Cell: CollectionsImage
      },
      {
        Header: 'Collection Name',
        accessor: 'displayName',
      },
      {
        Header: 'Title',
        accessor: 'title',
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
      data={Collections}
      isGlobalFilter={false}
      customPageSize={5}
    />
  );
};

export default CollectionsTab;