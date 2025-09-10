import React, { useEffect, useState } from "react"
import Rating from "react-rating"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { Link, NavLink } from "react-router-dom"

import classnames from "classnames"
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Nav,
  NavItem,
  Row,
  TabContent,
  TabPane,
} from "reactstrap"
import { fetchTourGroupByIdRequest } from "store/actions"
import TourGroupVariants from "./ViewTourGroupComponents/TourGroupVariants"
import BookingTable from "./ViewTourGroupComponents/BookingTable"
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions"

export default function ViewTourGroup({
  setIsViewing,
  setIsEdit,
  editId,
  isViewing,
  setTourGroupByIdName,
}) {
  const [customActiveTab, setcustomActiveTab] = useState("1")

  function extractListItemsFromHTML(htmlString) {
    const regex = /<li>\s*<p>(.*?)<\/p>\s*<\/li>/g
    const items = []
    let match

    while ((match = regex.exec(htmlString)) !== null) {
      items.push(match[1])
    }

    return items
  }

  const dispatch = useDispatch()
  const { tourGroupById } = useSelector(state => state.tourGroup)
  const { can, getTourGroupPermissions } = usePermissions()
  /*   console.log(tourGroupById) */
  const highlights = extractListItemsFromHTML(tourGroupById?.highlights || "")
  const id = editId
  useEffect(() => {
    dispatch(fetchTourGroupByIdRequest(id))
    setTourGroupByIdName(tourGroupById.name)
  }, [tourGroupById.name])

  const toggleCustom = tab => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab)
    }
  }
  const role = JSON.parse(localStorage.getItem("authUser"))?.data?.user
    ?.roles[0]?.code

  const canEditTourGroupFromView = can(ACTIONS.CAN_EDIT, MODULES.TOUR_GROUP_PERMS)
  return (
    <React.Fragment>
      <div>
        <Row>
          <Col className="px-3 py-2 ">
            <Card>
              <Row className="no-gutters align-items-center">
                {/* Tour Image */}
                <Col md={4} className="align-self-start ">
                  <CardImg
                    className="img-fluid rounded"
                    style={{ objectFit: "cover", height: "100%" }}
                    src={tourGroupById.imageUploads?.[0]?.url || ""}
                    alt="Scrollit"
                  />
                </Col>

                {/* Tour Info */}
                <Col>
                  <div className="px-3 py-2">
                    {/* Title & Status */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <CardTitle className="fs-3 mb-0 text-primary ">
                        <strong>{tourGroupById.name}</strong>
                      </CardTitle>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "30%",
                          alignItems: "justify-between",
                        }}
                      >
                        <CardText className="mb-0">
                          {tourGroupById.status ? (
                            <Button
                              type="button"
                              className="btn btn-soft-success btn-rounded waves-effect waves-light"
                            >
                              Active
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              className="btn btn-soft-danger btn-rounded waves-effect waves-light"
                            >
                              InActive
                            </Button>
                          )}
                        </CardText>

                        {canEditTourGroupFromView && (
                          <CardText
                            style={{ cursor: "pointer" }}
                            className={`text-dark ${classnames({
                              active: customActiveTab === "2",
                            })}`}
                            onClick={() => {
                              toggleCustom("2")
                              setIsEdit(true)
                              setIsViewing(false)
                            }}
                          >
                            <span className="d-none d-sm-block ">
                              <i className="fas fa-edit text-success" /> Edit
                              Tour
                            </span>
                          </CardText>
                        )}
                      </div>
                    </div>

                    {/* Location & Rating */}
                    <div className="d-flex align-items-center mb-3">
                      <CardText className="text-primary mb-0">
                        <i className="mdi mdi-map-marker"></i>{" "}
                        {tourGroupById.city?.name},{" "}
                        {tourGroupById.city?.country?.displayName}
                      </CardText>
                      <div className="d-flex align-items-center ms-3">
                        <Rating
                          stop={5}
                          emptySymbol="mdi mdi-star-outline text-primary"
                          fullSymbol="mdi mdi-star text-primary"
                          className="rating-symbol-background"
                          initialRating={tourGroupById.ratings?.average || 0}
                          readonly
                        />
                        <h5 className="mt-0 mb-0 ms-2">{`${tourGroupById.ratings?.average} (${tourGroupById.ratings?.count} Reviews)`}</h5>
                      </div>
                    </div>

                    {/* Stats Cards: Variants & Bookings */}
                    <div className="d-flex gap-2" style={{ maxHeight: "80px" }}>
                      <Card className="bg-secondary bg-soft h-100 w-100">
                        <CardBody className="d-flex justify-content-center align-items-center">
                          <CardText className="fs-4 text-center mb-0">
                            <span className="text-primary fw-bold">
                              {tourGroupById.variantsCount || 0}
                            </span>{" "}
                            Variants
                          </CardText>
                        </CardBody>
                      </Card>

                      <Card className="bg-secondary bg-soft h-100 w-100">
                        <CardBody className="d-flex justify-content-center align-items-center">
                          <CardText className="fs-4 text-center mb-0">
                            <span className="text-primary fw-bold">
                              {tourGroupById.confirmedBookingsCount || 0}
                            </span>{" "}
                            Bookings
                          </CardText>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Accordion */}
        <Row>
          <Nav tabs className="nav-tabs-custom nav-justified">
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: customActiveTab === "1",
                })}
                onClick={() => {
                  toggleCustom("1")
                }}
              >
                <span className="d-none d-sm-block ">
                  <i className="fas fa-eye text-success" /> OverView
                </span>
              </NavLink>
            </NavItem>

            {role === "ADMIN" && (
              <React.Fragment>
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({
                      active: customActiveTab === "2",
                    })}
                    onClick={() => {
                      toggleCustom("2")
                    }}
                  >
                    <span className="d-none d-sm-block">
                      <i className="fas fa-layer-group text-info" /> Variants
                    </span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    style={{ cursor: "pointer" }}
                    className={classnames({
                      active: customActiveTab === "3",
                    })}
                    onClick={() => {
                      toggleCustom("3")
                    }}
                  >
                    <span className="d-none d-sm-block">
                      {" "}
                      <i className="fas fa-money-bill-wave text-success" />{" "}
                      Bookings
                    </span>
                  </NavLink>
                </NavItem>
              </React.Fragment>
            )}
            <NavItem>
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: customActiveTab === "4",
                })}
                onClick={() => {
                  toggleCustom("4")
                }}
              >
                {" "}
                <i className="fas fa-chart-pie text-primary" /> Analytics
              </NavLink>
            </NavItem>
          </Nav>

          <hr />

          <TabContent activeTab={customActiveTab} className="p-3 text-muted">
            <TabPane tabId="1">
              {" "}
              <Row>
                <Col sm="12" style={{ width: "60%", textAlign: "justify" }}>
                  {tourGroupById.metaDescription && (
                    <React.Fragment>
                      <CardTitle>Tour Description</CardTitle>
                      <CardText>{tourGroupById.metaDescription}</CardText>
                    </React.Fragment>
                  )}
                  {tourGroupById.highlights && (
                    <React.Fragment>
                      {" "}
                      <CardTitle>Tour Highlight</CardTitle>
                      <CardText>
                        <ul>
                          {highlights.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </CardText>
                    </React.Fragment>
                  )}
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <TourGroupVariants isViewing={isViewing} />
            </TabPane>
            <TabPane tabId="3">
              <Row>
                <Col>
                  <BookingTable bookingId={id} />
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="4">
              <Row>
                <Col>
                  <h4>You can View Analytics Here</h4>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </Row>
      </div>
    </React.Fragment>
  )
}
