import React from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TravelCategoryForm from "./TravelCategoryForm";

const AddTravelCategory = () => {
  document.title = "Add Travel Category | TickYourList";

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Travel Category" breadcrumbItem="Add New" />
        <TravelCategoryForm />
      </Container>
    </div>
  );
};

export default AddTravelCategory;