import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import TableContainer from "../../../components/Common/TableContainer";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

const CITY_WISE_SECTIONS = [
  {
    id: 1,
    city: "New York",
    section: "Popular Tours",
    totalItems: 12,
    status: "Active",
    updatedAt: "2026-01-15",
    description: "Top curated experiences for visitors.",
    items: ["Central Park Walk", "Harbor Cruise", "Broadway Night"],
  },
  {
    id: 2,
    city: "San Francisco",
    section: "Family Picks",
    totalItems: 8,
    status: "Active",
    updatedAt: "2026-01-20",
    description: "Family friendly tours and activities.",
    items: ["Golden Gate Bike Tour", "Aquarium Visit", "Cable Car Ride"],
  },
  {
    id: 3,
    city: "Chicago",
    section: "Food Trails",
    totalItems: 10,
    status: "Draft",
    updatedAt: "2026-01-28",
    description: "Local food and tasting experiences.",
    items: ["Deep Dish Tour", "Riverwalk Bites", "Neighborhood Eats"],
  },
  {
    id: 4,
    city: "Miami",
    section: "Water Adventures",
    totalItems: 7,
    status: "Active",
    updatedAt: "2026-02-01",
    description: "Beach and water-based experiences.",
    items: ["Sunset Cruise", "Snorkeling Bay", "Jet Ski Session"],
  },
];

function CityWiseSections() {
  document.title = "City Wise Sections | Scrollit";

  const [selectedSection, setSelectedSection] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = section => {
    setSelectedSection(section);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedSection(null);
  };

  const columns = useMemo(
    () => [
      {
        Header: "City",
        accessor: "city",
        filterable: true,
      },
      {
        Header: "Section",
        accessor: "section",
        filterable: true,
      },
      {
        Header: "Total Items",
        accessor: "totalItems",
        filterable: true,
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: true,
        Cell: cellProps => (
          <Badge color={cellProps.value === "Active" ? "success" : "warning"}>
            {cellProps.value}
          </Badge>
        ),
      },
      {
        Header: "Updated At",
        accessor: "updatedAt",
        filterable: true,
      },
      {
        Header: "View Detail",
        disableFilters: true,
        Cell: ({ row }) => (
          <Button
            type="button"
            color="primary"
            className="btn-sm btn-rounded"
            onClick={() => handleOpenDetail(row.original)}
          >
            View Detail
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs
            title="Location Management"
            breadcrumbItem="City Wise Sections"
          />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={CITY_WISE_SECTIONS}
                    isGlobalFilter={true}
                    customPageSize={10}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Modal isOpen={isDetailOpen} toggle={handleCloseDetail} centered>
        <ModalHeader toggle={handleCloseDetail}>
          City Wise Section Details
        </ModalHeader>
        <ModalBody>
          {selectedSection ? (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>City:</strong> {selectedSection.city}
              </div>
              <div>
                <strong>Section:</strong> {selectedSection.section}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge
                  color={selectedSection.status === "Active" ? "success" : "warning"}
                >
                  {selectedSection.status}
                </Badge>
              </div>
              <div>
                <strong>Total Items:</strong> {selectedSection.totalItems}
              </div>
              <div>
                <strong>Last Updated:</strong> {selectedSection.updatedAt}
              </div>
              <div>
                <strong>Description:</strong> {selectedSection.description}
              </div>
              <div>
                <strong>Sample Items:</strong> {selectedSection.items.join(", ")}
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseDetail}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default CityWiseSections;
