import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import {
  Row,
  Col,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Alert,
} from "reactstrap"
import axios from "axios"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"

/**
 * Old Way Pricing Form Component
 * Simple pricing form for basic pricing updates
 */
const OldWayPricingForm = ({ variantId, onSave }) => {
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const initialValues = {
    adultPrice: 0,
    childPrice: 0,
    guestPrice: 0,
  }

  const validationSchema = Yup.object({
    adultPrice: Yup.number().min(0, "Must be >= 0").required("Adult price is required"),
    childPrice: Yup.number().min(0, "Must be >= 0"),
    guestPrice: Yup.number().min(0, "Must be >= 0"),
  })

  const handleSubmit = async (values) => {
    try {
      setSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      // Build simple pricing structure
      const pricesArray = []
      
      if (values.adultPrice > 0) {
        pricesArray.push({
          type: "adult",
          originalPrice: parseFloat(values.adultPrice),
          finalPrice: parseFloat(values.adultPrice),
        })
      }

      if (values.childPrice > 0) {
        pricesArray.push({
          type: "child",
          originalPrice: parseFloat(values.childPrice),
          finalPrice: parseFloat(values.childPrice),
        })
      }

      if (values.guestPrice > 0) {
        pricesArray.push({
          type: "guest",
          originalPrice: parseFloat(values.guestPrice),
          finalPrice: parseFloat(values.guestPrice),
        })
      }

      if (pricesArray.length === 0) {
        setErrorMessage("At least one price must be provided")
        return
      }

      const payload = {
        listingPrice: {
          prices: pricesArray,
          groupSize: 1,
          otherPricesExist: pricesArray.length > 1,
        },
      }

      const response = await axios.put(
        `/api/v1/tyltraveltourgroupvariant/update-prices/${variantId}`,
        payload
      )

      setSuccessMessage("Pricing updated successfully!")
      showToastSuccess("Pricing updated successfully")
      
      if (onSave) {
        setTimeout(() => {
          onSave()
        }, 1000)
      }
    } catch (err) {
      console.error("Error updating pricing:", err)
      const errorMsg = err.response?.data?.message || "Failed to update pricing"
      setErrorMessage(errorMsg)
      showToastError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h5 className="mb-3">Old Way Pricing (Simple)</h5>
      <p className="text-muted">
        Simple pricing form for basic pricing updates.
      </p>

      {successMessage && (
        <Alert color="success" toggle={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert color="danger" toggle={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form>
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">Pricing</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Adult Price *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="adultPrice"
                        placeholder="100"
                        invalid={touched.adultPrice && !!errors.adultPrice}
                      />
                      {touched.adultPrice && errors.adultPrice && (
                        <div className="text-danger small">{errors.adultPrice}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Child Price</Label>
                      <Field as={Input} type="number" name="childPrice" placeholder="80" />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Guest Price</Label>
                      <Field as={Input} type="number" name="guestPrice" placeholder="100" />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <div className="text-end">
              <Button color="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bx bx-save me-2"></i>
                    Save Pricing
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default OldWayPricingForm



