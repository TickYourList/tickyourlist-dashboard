import React, { useState, useEffect } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Card, CardBody,
  Nav, NavItem, NavLink, TabContent, TabPane, Badge, Button, Placeholder, Breadcrumb, BreadcrumbItem
} from "reactstrap";
import classnames from 'classnames';
import BannersTab from "./BannersTab";
import CategoriesTab from "./CategoriesTab";
import SubcategoriesTab from "./SubcategoriesTab";
import CollectionsTab from "./CollectionsTab";
import TourGroupsTab from "./TourGroupsTab";
import { getCollectionsForCity, getCategoriesForCity, getToursForCity, getSubcategoriesForCity } from "helpers/backend_helper";

const SectionDetailsModal = ({ isOpen, toggle, sectionData }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [counts, setCounts] = useState({
    categoryCount: 0,
    subCategoryCount: 0,
    collectionCount: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);  

  useEffect(() => {
    // Fetch details when the modal is opened with a valid sectionData object
    if (isOpen && sectionData) {
      setLoadingCounts(true);

      // Create an array of promises for all the API calls
      const promises = [
        getCategoriesForCity(sectionData.cityCode),
        getSubcategoriesForCity(sectionData.cityCode),
        getCollectionsForCity(sectionData.cityCode),
      ];

      // Use Promise.all to wait for all calls to complete
      Promise.all(promises)
        .then(([categoriesRes, subCategoriesRes, collectionsRes]) => {
          // Update the state with the counts from each response
          setCounts({
            categoryCount: categoriesRes.data.total || 0,
            subCategoryCount: subCategoriesRes.data.total || 0,
            collectionCount: collectionsRes.data.total || 0,
          });
        })
        .catch(error => console.error("Failed to fetch section counts", error))
        .finally(() => setLoadingCounts(false));
    }
  }, [isOpen, sectionData]);

  if (!sectionData) {
    return null;
  }

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  
  const sectionName = sectionData.displayName || "";
  const countryName = sectionData.country?.displayName || "";
  const urlSlug = (sectionData.urlSlugs.EN || sectionName).replace(/^\/|\/$/g, '');

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered scrollable>
      <ModalHeader toggle={toggle}>
        <b>Section Overview - {sectionName}</b>
      </ModalHeader>
      <ModalBody>
        <div>
           <Row className="mb-4">
            <Col>
              <Breadcrumb>
                <BreadcrumbItem>Sections</BreadcrumbItem>
                <BreadcrumbItem>{urlSlug}</BreadcrumbItem>
              </Breadcrumb>
            </Col>
          </Row>
          <div className="d-flex align-items-center mb-3">
            <div className="flex-grow-1">
              <h2 className="mb-1"><b>{sectionName}, {countryName}</b></h2>
              <p className="mb-0">URL Slug : {urlSlug}</p>
            </div>
            <div className="flex-shrink-0 d-flex flex-column align-items-end">
              <Badge color={sectionData.status ? "success" : "secondary"} className="me-2 font-size-12 mb-2">
                {sectionData.status ? "Active" : "Inactive"}
              </Badge>
              <Button outline color="primary" size="sm">
                <i className="mdi mdi-pencil"></i>Edit
              </Button>
            </div>
          </div>
          {/* Summary Cards */}
            <Row>
            <Col>
                <Card className="text-center bg-light"><CardBody>
                
                <h4 className="mb-1 text-primary font-weight-bold">{sectionData.tourCount || 0}</h4>
                <p className="text-muted mb-0">Total Tours</p>
                </CardBody></Card>
            </Col>
            <Col>
                <Card className="text-center bg-light"><CardBody>
                
                <h4 className="mb-1 text-warning font-weight-bold">{loadingCounts ? <Placeholder xs={6} /> : counts.categoryCount}</h4>
                <p className="text-muted mb-0">Categories</p>
                </CardBody></Card>
            </Col>
            <Col>
                <Card className="text-center bg-light"><CardBody>
                <h4 className="mb-1 text-success font-weight-bold">{loadingCounts ? <Placeholder xs={6} /> : counts.subCategoryCount}</h4>
                <p className="text-muted mb-0">Sub Categories</p>
                </CardBody></Card>
            </Col>
            <Col>
                <Card className="text-center bg-light"><CardBody>
                <h4 className="mb-1 text-info font-weight-bold">{loadingCounts ? <Placeholder xs={6} /> : counts.collectionCount}</h4>
                <p className="text-muted mb-0">Collections</p>
                </CardBody></Card>
            </Col>
            </Row>
          {/* Navigation Tabs */}
         <Nav tabs className="mt-4">
              {['Banners', 'Categories', 'Sub Categories', 'Tour Groups', 'Collections'].map((tabName, index) => (
                <NavItem key={index}>
                  <NavLink
                    className={classnames({ active: activeTab === `${index + 1}` })}
                    onClick={() => toggleTab(`${index + 1}`)}
                  >
                    {tabName}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          <TabContent activeTab={activeTab} className="py-4">
              <TabPane tabId="1"><BannersTab sectionData={sectionData} /></TabPane>
              <TabPane tabId="2"><CategoriesTab cityCode={sectionData?.cityCode} /></TabPane>
              <TabPane tabId="3"><SubcategoriesTab cityCode={sectionData?.cityCode} /></TabPane>
              <TabPane tabId="4"><TourGroupsTab cityCode={sectionData?.cityCode} />.</TabPane>
              <TabPane tabId="5"><CollectionsTab cityCode={sectionData?.cityCode} /></TabPane>
            </TabContent>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default SectionDetailsModal;