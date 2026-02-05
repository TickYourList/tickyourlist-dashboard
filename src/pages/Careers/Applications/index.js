import React, { useEffect, useMemo, useState } from "react";
import { isEmpty } from "lodash";
import TableContainer from "../../../components/Common/TableContainer";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

import {
  getCareerApplications as onGetCareerApplications,
  updateApplicationStatus as onUpdateApplicationStatus,
} from "../../../store/actions";

import {
  Col,
  Row,
  Card,
  CardBody,
  Badge,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";

//redux
import { useSelector, useDispatch } from "react-redux";
import toastr from "toastr";

function CareerApplications() {
  //meta title
  document.title = "Career Applications | TickYourList";

  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => ({
    applications: state.careers?.applications || [],
    loading: state.careers?.loading || false,
  }));

  useEffect(() => {
    dispatch(onGetCareerApplications());
  }, [dispatch]);

  const handleStatusUpdate = (applicationId, newStatus) => {
    dispatch(onUpdateApplicationStatus({ id: applicationId, status: newStatus }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "warning", label: "Pending" },
      Reviewed: { color: "info", label: "Reviewed" },
      Interviewing: { color: "primary", label: "Interviewing" },
      Rejected: { color: "danger", label: "Rejected" },
      Hired: { color: "success", label: "Hired" },
    };

    const config = statusConfig[status] || { color: "secondary", label: status };
    return (
      <Badge className={`badge-soft-${config.color}`}>{config.label}</Badge>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Applicant Name",
        accessor: "fullName",
        filterable: true,
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.fullName}</span>;
        },
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: true,
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.email}</span>;
        },
      },
      {
        Header: "Phone",
        accessor: "phoneNumber",
        Cell: (cellProps) => {
          return <span>{cellProps.row.original.phoneNumber}</span>;
        },
      },
      {
        Header: "Position",
        accessor: "careerPosting",
        Cell: (cellProps) => {
          const posting = cellProps.row.original.careerPosting;
          return <span>{posting?.title || "N/A"}</span>;
        },
      },
      {
        Header: "Department",
        accessor: "careerPosting.department",
        Cell: (cellProps) => {
          const posting = cellProps.row.original.careerPosting;
          return <span>{posting?.department || "N/A"}</span>;
        },
      },
      {
        Header: "Experience",
        accessor: "experience",
        Cell: (cellProps) => {
          const exp = cellProps.row.original.experience;
          return <span>{exp ? `${exp} years` : "N/A"}</span>;
        },
      },
      {
        Header: "Applied Date",
        accessor: "appliedAt",
        Cell: (cellProps) => {
          const date = cellProps.row.original.appliedAt;
          return (
            <span>
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          );
        },
      },
      {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        Cell: (cellProps) => {
          const application = cellProps.row.original;
          if (!application) return <span>N/A</span>;
          return getStatusBadge(application.status || "Pending");
        },
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: (cellProps) => {
          const application = cellProps.row.original;
          if (!application || !application._id) return <span>N/A</span>;
          return (
            <UncontrolledDropdown>
              <DropdownToggle
                tag="button"
                className="btn btn-sm btn-soft-primary"
              >
                <i className="mdi mdi-dots-vertical"></i>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  onClick={() => handleStatusUpdate(application._id, "Pending")}
                >
                  Set Pending
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    handleStatusUpdate(application._id, "Reviewed")
                  }
                >
                  Set Reviewed
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    handleStatusUpdate(application._id, "Interviewing")
                  }
                >
                  Set Interviewing
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleStatusUpdate(application._id, "Rejected")}
                >
                  Set Rejected
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleStatusUpdate(application._id, "Hired")}
                >
                  Set Hired
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  href={application.resumeUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="mdi mdi-download me-1"></i> Download Resume
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs
            title="Careers"
            breadcrumbItem="Career Applications"
          />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="card-title mb-0">Career Applications</h4>
                    <Button
                      color="primary"
                      className="btn-sm"
                      onClick={() => dispatch(onGetCareerApplications())}
                    >
                      <i className="mdi mdi-refresh me-1"></i> Refresh
                    </Button>
                  </div>

                  <TableContainer
                    columns={columns}
                    data={applications || []}
                    isGlobalFilter={true}
                    isAddOptions={false}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

export default CareerApplications;
