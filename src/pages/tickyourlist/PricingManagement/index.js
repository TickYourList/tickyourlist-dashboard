import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Button,
  Alert,
} from "reactstrap"
import axios from "axios"
import PricingForm from "../TravelTourGroup/PricingForm"

/**
 * Pricing Management Page
 * Standalone page for managing variant pricing
 */
const PricingManagement = () => {
  const { variantId } = useParams()
  const navigate = useNavigate()
  const [variant, setVariant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (variantId) {
      fetchVariant()
    } else {
      setLoading(false)
    }
  }, [variantId])

  const fetchVariant = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `/api/v1/tyl-travel-tour-group-variants/${variantId}`
      )
      setVariant(response.data.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching variant:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/tour-group-variants-data")
  }

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading pricing management...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <Container fluid>
          <Alert color="danger">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <hr />
            <Button color="primary" onClick={handleBack}>
              Back to Variants
            </Button>
          </Alert>
        </Container>
      </div>
    )
  }

  if (!variantId) {
    return (
      <div className="page-content">
        <Container fluid>
          <Alert color="warning">
            <h4 className="alert-heading">No Variant Selected</h4>
            <p>Please select a variant to manage pricing.</p>
            <hr />
            <Button color="primary" onClick={handleBack}>
              Go to Variants List
            </Button>
          </Alert>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-content">
      <Container fluid>
        {/* Breadcrumb */}
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0 font-size-18">Pricing Management</h4>
          <div className="page-title-right">
            <Breadcrumb listClassName="m-0">
              <BreadcrumbItem>
                <a href="/dashboard">Dashboard</a>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <a href="/tour-group-variants-data">Tour Variants</a>
              </BreadcrumbItem>
              <BreadcrumbItem active>Pricing Management</BreadcrumbItem>
            </Breadcrumb>
          </div>
        </div>

        {/* Variant Info Header */}
        {variant && (
          <Card className="mb-3">
            <CardBody>
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="mb-1">{variant.name}</h5>
                  <p className="text-muted mb-0">
                    <small>
                      Variant ID: {variant._id} | City: {variant.cityCode}
                      {variant.status ? (
                        <span className="badge bg-success ms-2">Active</span>
                      ) : (
                        <span className="badge bg-secondary ms-2">Inactive</span>
                      )}
                    </small>
                  </p>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    color="secondary"
                    outline
                    onClick={handleBack}
                    className="me-2"
                  >
                    <i className="bx bx-arrow-back me-1"></i>
                    Back to Variants
                  </Button>
                  <Button
                    color="primary"
                    outline
                    onClick={() =>
                      navigate(`/tour-group-variants/edit/${variantId}`)
                    }
                  >
                    <i className="bx bx-edit me-1"></i>
                    Edit Variant
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        )}

        {/* Pricing Form */}
        <Row>
          <Col>
            <PricingForm variantId={variantId} />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default PricingManagement

