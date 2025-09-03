import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, UncontrolledDropdown, DropdownToggle, 
  DropdownMenu, DropdownItem, Button } from "reactstrap";
import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";
import { useSelector, useDispatch } from "react-redux";
import { getCities as onGetCityList } from "store/section-banners/sectionActions";
import SectionDetailsModal from "./SectionDetailsModal";

// --- Components for Table Columns ---
const Status = ({ status }) => (
  <span className={`badge bg-${status ? "success" : "secondary"}`}>
    {status ? "Active" : "Inactive"}
  </span>
);

const ViewDetailsButton = ({ onOpen }) => (
  <Button color="primary" size="sm" onClick={onOpen}>
    View Sections
  </Button>
);

const SectionTable = () => {

  document.title = "Section Table | Content & Marketing";

  const dispatch = useDispatch();

  const { cities } = useSelector(state => ({
    cities: state.cities.cities,
  }));

  useEffect(() => {
    dispatch(onGetCityList());
  }, [dispatch]);

  // 1. CHANGE THE STATE TO HOLD THE FULL OBJECT, NOT JUST THE ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // 2. UPDATE THE HANDLERS
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleViewDetailsClick = (sectionObject) => {
    setSelectedSection(sectionObject); // Set the full object
    toggleModal();
  };

  // columns for the table
  const columns = useMemo(
    () => [
      {
        Header: 'City Id',
        accessor: '_id', 
      },
      {
        Header: 'City Name',
        accessor: 'displayName',
      },
      {
        Header: 'City Code',
        accessor: 'cityCode',
      },
      {
        Header: 'Url Slug - EN',
        accessor: 'urlSlugs.EN',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ cell }) => <Status status={cell.value} />
      },
      {
        Header: 'View Section Details',
        disableFilters: true,
         Cell: ({ row }) => (
          <Button
            color="primary"
            size="sm"
            onClick={() => handleViewDetailsClick(row.original)}
          >
            View Sections
          </Button>
        ),
      },
      {
        Header: 'Action',
        disableFilters: true,
        Cell: () => (
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
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Content & Marketing" breadcrumbItem="Sections" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    
                    data={cities || []}
                    customPageSize={10}
                    // We can add a button here later if needed
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
       <SectionDetailsModal 
        isOpen={isModalOpen}
        toggle={toggleModal}
        sectionData={selectedSection} // Prop name changed to sectionData
      />
    </React.Fragment>
  );
};

export default SectionTable;