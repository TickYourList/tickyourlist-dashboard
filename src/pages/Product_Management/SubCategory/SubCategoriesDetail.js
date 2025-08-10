import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Spinner,
  Alert,
  ListGroup,
  ListGroupItem,
  Badge,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Table,
} from "reactstrap";
import classnames from "classnames";

import Breadcrumbs from "components/Common/Breadcrumb";
import { getSubcategories } from "store/actions";

const SubCategoryDetails = () => {
  document.title = "Category Details | Scrollit";

  const dispatch = useDispatch();
  const { categoryid } = useParams();
  console.log("Thsi is category id",categoryid)

  const { subcategories, loading, error } = useSelector(state => (state.travelReducer));

  // CONVERSION IS HERE: Convert categoryid to a number for comparison
  const categoryToDisplay = subcategories.find(
    cat => cat._id === categoryid// Or: cat.id === +categoryid
  );

 

  useEffect(() => {
    if (subcategories.length === 0 && !loading && !error) {
      dispatch(getSubcategories());
    }
  }, [dispatch, subcategories.length, loading, error]);

  const [activeTab, setActiveTab] = useState("1");

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Product Management" breadcrumbItem="Category Details" />

          {loading && !categoryToDisplay ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">Loading categories...</p>
            </div>
          ) : error ? (
            <Alert color="danger" className="text-center">
              <p>Error loading category details: {error}</p>
              <p>Could not retrieve details for ID: {categoryid}.</p>
              <Link to="/categories" className="btn btn-primary mt-3">
                Back to Categories List
              </Link>
            </Alert>
          ) : categoryToDisplay ? (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <Row>
                      <Col xl={6}>
                        <div className="product-detai-imgs text-center">
                          <img
                            // Use the first media URL if available, otherwise a placeholder
                            src={categoryToDisplay.medias && categoryToDisplay.medias.length > 0
                                ? categoryToDisplay.medias[0].url
                                : "https://via.placeholder.com/400x300?text=No+Image"}
                            alt={categoryToDisplay.medias && categoryToDisplay.medias.length > 0
                                ? categoryToDisplay.medias[0].altText
                                : "Category Image"}
                            className="img-fluid mx-auto d-block rounded"
                            style={{ maxWidth: "400px", maxHeight: "300px", objectFit: "cover" }}
                          />
                          
                        </div>
                      </Col>

                      <Col xl="6">
                        <div className="mt-4 mt-xl-3">
                          <Link to="#" className="text-primary">
                            {categoryToDisplay.categoryName || "Sub Category"} {/* If you have categoryName from parent */}
                          </Link>
                          <h4 className="mt-1 mb-3">{categoryToDisplay.displayName || categoryToDisplay.name}</h4>

                          <p className="text-muted mb-4">
                            ( {categoryToDisplay.tourCount || 0} Tours Available ) {/* Use actual tourCount count if available */}
                          </p>

                          <p className="text-muted mb-4">
                            {categoryToDisplay.metaDescription || `Explore the details of the "${categoryToDisplay.displayName || categoryToDisplay.name}" subcategory. This category offers a unique collection of destinations and activities.`}
                          </p>

                          <Row className="mb-3">
                            <Col md="6">
                              <p className="text-muted">
                                <i className="bx bx-hash font-size-16 align-middle text-primary me-2" />
                                <strong>ID:</strong> {categoryToDisplay.id}
                              </p>
                              <p className="text-muted">
                                <i className="bx bx-sort font-size-16 align-middle text-primary me-2" />
                                <strong>Sort Order:</strong> {categoryToDisplay.sortOrder}
                              </p>
                            </Col>
                            <Col md="6">
                              <p className="text-muted">
                                <i className="bx bx-city font-size-16 align-middle text-primary me-2" />
                                <strong>City Code:</strong> <Badge color="primary">{categoryToDisplay.cityCode || "N/A"}</Badge>
                              </p>
                              <p className="text-muted">
                                <i className="bx bx-trending-up font-size-16 align-middle text-primary me-2" />
                                <strong>Category ID:</strong> <Badge color="info">{categoryToDisplay.id}</Badge>
                              </p>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-5">
                      <h5 className="mb-3">Additional Information :</h5>
                      <Nav pills className="product-detail-nav justify-content-center">
                        <NavItem>
                          <NavLink
                            className={classnames({ active: activeTab === "1" })}
                            onClick={() => { toggleTab("1"); }}
                          >
                            Overview
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({ active: activeTab === "2" })}
                            onClick={() => { toggleTab("2"); }}
                          >
                            Meta Details
                          </NavLink>
                        </NavItem>
                      </Nav>

                      <TabContent activeTab={activeTab} className="p-3 text-muted">
                        <TabPane tabId="1">
                          <h5 className="font-size-16 mb-3">Category Overview</h5>
                          <p>
                            {categoryToDisplay.heading || `This section provides a general overview of the "${categoryToDisplay.displayName || categoryToDisplay.name}" category.`}
                          </p>
                          <p>
                            This subcategory is named "<strong>{categoryToDisplay.name}</strong>" and is identified by ID <strong>{categoryToDisplay.id}</strong>. It's associated with the city code "<strong>{categoryToDisplay.cityCode}</strong>". Its primary purpose, as indicated by its heading, is "<strong>{categoryToDisplay.heading}</strong>".
                          </p>
                        </TabPane>
                        <TabPane tabId="2">
                          <h5 className="font-size-16 mb-3">Meta Details</h5>
                          <div className="table-responsive">
                            <Table className="table mb-0 table-bordered">
                              <tbody>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    Meta Title
                                  </th>
                                  <td>{categoryToDisplay.metaTitle || "N/A"}</td>
                                </tr>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    Meta Description
                                  </th>
                                  <td>{categoryToDisplay.metaDescription || "N/A"}</td>
                                </tr>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    No Index
                                  </th>
                                  <td>{categoryToDisplay.noIndex ? "Yes" : "No"}</td>
                                </tr>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    Canonical URL
                                  </th>
                                  <td>{categoryToDisplay.canonicalUrl || "N/A"}</td>
                                </tr>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    English URL Slug
                                  </th>
                                  <td>{categoryToDisplay.urlSlugs?.EN || "N/A"}</td>
                                </tr>
                                <tr>
                                  <th scope="row" style={{ width: "200px" }} className={"text-capitalize"}>
                                    Author ID
                                  </th>
                                  <td>{categoryToDisplay.author || "N/A"}</td>
                                </tr>
                                {/* You can add more rows for other nested details like microBrandInfo if needed */}
                              </tbody>
                            </Table>
                          </div>
                        </TabPane>
                      </TabContent>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="text-center py-5">
                      <Alert color="warning">
                        <h4 className="alert-heading">Category Not Found!</h4>
                        <p>The details for category ID "<strong>{categoryid}</strong>" could not be found.</p>
                        <hr />
                        <p className="mb-0">Please ensure the category ID is correct or go back to the list.</p>
                      </Alert>
                      <Link to="/categories" className="btn btn-primary mt-3">
                        Back to Categories List
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SubCategoryDetails;