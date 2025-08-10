import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Label,
  Input,
  Button,
  CardTitle,
  Container,
} from "reactstrap"

import Breadcrumbs from "../../components/Common/Breadcrumb"
// import { getInvoiceList } from "../../store/invoices/actions";
// import { getTourGroupList } from "../../store/invoices/actions"
// import { useSelector, useDispatch } from "react-redux"

const AddInvoice = () => {
  //meta title
  document.title = "Form Repeater | Scrollit"
  // const { invoiceList, loading } = useSelector(state => state.invoices);
  // const { tourGroupList, tourGroupLoading } = useSelector(
  //   state => state.invoices
  // )

  const [rows1, setrows1] = useState([{ id: 1 }])

  function handleAddRowNested() {
    const modifiedRows = [...rows1]
    modifiedRows.push({ id: modifiedRows.length + 1 })
    setrows1(modifiedRows)
  }

  function handleRemoveRow(id) {
    if (id !== 1) {
      var modifiedRows = [...rows1]
      modifiedRows = modifiedRows.filter(x => x["id"] !== id)
      setrows1(modifiedRows)
    }
  }

  const [formRows, setFormRows] = useState([{ id: 1 }])

  const onAddFormRow = () => {
    const modifiedRows = [...formRows]
    modifiedRows.push({ id: modifiedRows.length + 1 })
    setFormRows(modifiedRows)
  }

  const onDeleteFormRow = id => {
    if (id !== 1) {
      var modifiedRows = [...formRows]
      modifiedRows = modifiedRows.filter(x => x["id"] !== id)
      setFormRows(modifiedRows)
    }
  }

  const handleSubmitButtonClick = () => {
    console.log("Submit Clicked")
  }

  const navigate = useNavigate()
  const handleCancelButtonClick = () => {
    navigate("/create-invoice-list")
  }

  // useEffect(() => {
  //   dispatch(getTourGroupList())
  // }, [dispatch])
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Invoices" breadcrumbItem="Add New Invoice" />

          <Row>
            <Col xs={12}>
              <Card>
                <CardBody>
                  <h6 className="mb-4 card-title">Invoice Detail</h6>
                  <Form className="repeater" encType="multipart/form-data">
                    <div>
                      {(formRows || []).map((formRow, key) => (
                        <div key={key}>
                          {/* First Name & Last Name */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  First Name
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="text"
                                  id={`firstName-${key}`}
                                  name="firstName"
                                  className="form-control"
                                  placeholder="Enter First Name"
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Last Name
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="text"
                                  id={`lastName-${key}`}
                                  name="lastName"
                                  className="form-control"
                                  placeholder="Enter Last Name"
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Email & Phone Number */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Email
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="email"
                                  id={`email-${key}`}
                                  name="email"
                                  className="form-control"
                                  placeholder="Enter Email"
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Phone Number
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="tel"
                                  id={`phoneNumber-${key}`}
                                  name="phoneNumber"
                                  className="form-control"
                                  placeholder="Enter Phone Number"
                                  autoComplete="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Tourgroup & Variant */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Tourgroup
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <select
                                  id={`tourgroup-${key}`}
                                  name="tourgroup"
                                  className="form-control"
                                  style={{
                                    height: "30px",
                                    width: "100%",
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                    appearance: "auto",
                                  }}
                                >
                                  <option value="">Select Tourgroup</option>
                                  <option value="group1">Group 1</option>
                                  <option value="group2">Group 2</option>
                                  <option value="group3">Group 3</option>
                                  {/* <option value="">Select Tourgroup</option>
                                  {tourGroupList.map(group => (
                                    <option key={group.id} value={group.id}>
                                      {group.name}
                                    </option>
                                  ))} */}
                                </select>
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Variant
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <select
                                  id={`variant-${key}`}
                                  name="variant"
                                  className="form-control"
                                  style={{
                                    height: "30px",
                                    width: "100%",
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                    appearance: "auto",
                                  }}
                                >
                                  <option value="">Select Variant</option>
                                  <option value=""> Variant 1</option>
                                  <option value=""> Variant 2</option>
                                  <option value=""> Variant 3</option>
                                </select>
                              </div>
                            </Col>
                          </Row>

                          {/* Number of Guests & Adults */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Guests
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`guests-${key}`}
                                  name="guests"
                                  className="form-control"
                                  placeholder="Enter Number of Guests"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Adults
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`adults-${key}`}
                                  name="adults"
                                  className="form-control"
                                  placeholder="Enter Number of Adults"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Number of Children & Infants */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Children
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`children-${key}`}
                                  name="children"
                                  className="form-control"
                                  placeholder="Enter Number of Children"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Infants
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`infants-${key}`}
                                  name="infants"
                                  className="form-control"
                                  placeholder="Enter Number of Infants"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Number of Youth & Family */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Youth
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`youth-${key}`}
                                  name="youth"
                                  className="form-control"
                                  placeholder="Enter Number of Youth"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>

                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Family
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`family-${key}`}
                                  name="family"
                                  className="form-control"
                                  placeholder="Enter Number of Family"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Number of Couples */}
                          <Row className="mb-3 gx-5">
                            <Col lg={6} className="d-flex align-items-center">
                              <div
                                style={{
                                  width: "180px",
                                  position: "relative",
                                  paddingRight: "8px",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  className="fw-bold"
                                  style={{ paddingRight: "10px" }}
                                >
                                  Number of Couples
                                </span>
                                <span
                                  className="fw-bold"
                                  style={{
                                    position: "absolute",
                                    right: 10,
                                    top: 0,
                                  }}
                                >
                                  :
                                </span>
                              </div>
                              <div style={{ width: "300px" }}>
                                <input
                                  type="number"
                                  id={`couples-${key}`}
                                  name="couples"
                                  className="form-control"
                                  placeholder="Enter Number of Couples"
                                  min={0}
                                  style={{ height: "30px", width: "100%" }}
                                />
                              </div>
                            </Col>
                          </Row>
                          <div className="d-flex gap-2 flex-wrap mt-3">
                            <input
                              type="button"
                              className="btn btn-success"
                              value="Add More"
                              onClick={() => onAddFormRow()}
                            />

                            <Button
                              type="submit"
                              color="primary"
                              onClick={handleSubmitButtonClick}
                            >
                              Submit
                            </Button>

                            <Button
                              type="reset"
                              color="secondary"
                              onClick={handleCancelButtonClick}
                            >
                              Cancel
                            </Button>
                          </div>
                          <br />
                        </div>
                      ))}
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default AddInvoice
