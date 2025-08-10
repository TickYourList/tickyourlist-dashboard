import React, { useState } from 'react';
import {  
  Row, 
  Col,  
  Nav, 
  NavItem, 
  NavLink, 
  TabContent, 
  TabPane, 
  Card, 
  CardBody 
} from 'reactstrap';
import classnames from 'classnames';


const BannerDetailsView = ({ banner, onBack }) => {
  
  const [activeTab, setActiveTab] = useState('1');

  if (!banner) {
    return null;
  }

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  return (
    <Card>
      <CardBody>
        {/* ---- HEADER SECTION ---- */}
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <img 
                  src={banner.preview} 
                  alt={banner.title || "Banner"} 
                  className="avatar-lg rounded" 
                />
              </div>
              <div>
                <h4 className="mb-0">{banner.title || banner.cityCode || "Banner Details"}</h4>
                <a href="#" onClick={onBack} className="text-muted">← View All Banners</a>
              </div>
            </div>
          </Col>
        </Row>
        
        <Row className="border-top pt-3">
            <Col md={3}><p className="text-muted mb-0">City</p><h5>{banner.cityCode || 'N/A'}</h5></Col>
            <Col md={3}><p className="text-muted mb-0">Type</p><h5>{banner.bannerType}</h5></Col>
            <Col md={3}><p className="text-muted mb-0">Status</p><h5><span className={`badge bg-${banner.status === "Active" ? "success" : "danger"}`}>{banner.status}</span></h5></Col>
            <Col md={3}><p className="text-muted mb-0">Tour</p><h5>{banner.Tour || 'N/A'}</h5></Col>
        </Row>

        <hr />

        {/* ---- TABBED SECTION ---- */}
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' })}
              onClick={() => { toggleTab('1'); }}
            >
              Overview
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '2' })}
              onClick={() => { toggleTab('2'); }}
            >
              Analytics
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' })}
              onClick={() => { toggleTab('3'); }}
            >
              Notes
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className="py-4">
          <TabPane tabId="1">
            <h5>Overview Details</h5>
            <p>This is the main overview tab. You can display the full banner image here again or provide detailed text content, creation date, author, etc.</p>
            <img src={banner.preview} alt="Banner" style={{ maxWidth: '100%', borderRadius: '8px' }}/>
          </TabPane>
          <TabPane tabId="2">
            <h5>Analytics Content</h5>
            <p>This tab can contain charts and statistics about the banner's performance, such as clicks, views, and conversion rates.</p>
          </TabPane>
          <TabPane tabId="3">
            <h5>Notes</h5>
            <p>This tab can be used for internal notes or comments related to this banner.</p>
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default BannerDetailsView;