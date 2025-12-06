import React, { useState, useEffect } from "react"
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

/**
 * Listing Price Editor Component
 * For simple fixed pricing stored in variant's listingPrice field
 */
const ListingPriceEditor = ({ variantId, variantData, onSave }) => {
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const initialValues = {
    // Adult pricing
    adultOriginalPrice: variantData?.listingPrice?.prices?.find(p => p.type === "adult")?.originalPrice || 0,
    adultFinalPrice: variantData?.listingPrice?.prices?.find(p => p.type === "adult")?.finalPrice || 0,
    adultMinimumPayable: variantData?.listingPrice?.prices?.find(p => p.type === "adult")?.minimumPayablePrice || 0,
    adultBestDiscount: variantData?.listingPrice?.prices?.find(p => p.type === "adult")?.bestDiscount || 0,
    adultMinAge: 18,
    adultMaxAge: 99,

    // Child pricing
    childOriginalPrice: variantData?.listingPrice?.prices?.find(p => p.type === "child")?.originalPrice || 0,
    childFinalPrice: variantData?.listingPrice?.prices?.find(p => p.type === "child")?.finalPrice || 0,
    childMinimumPayable: variantData?.listingPrice?.prices?.find(p => p.type === "child")?.minimumPayablePrice || 0,
    childBestDiscount: variantData?.listingPrice?.prices?.find(p => p.type === "child")?.bestDiscount || 0,
    childMinAge: 3,
    childMaxAge: 17,

    // Infant pricing (usually free)
    infantOriginalPrice: 0,
    infantFinalPrice: 0,
    infantMinAge: 0,
    infantMaxAge: 2,

    // Group settings
    groupSize: variantData?.listingPrice?.groupSize || 1,
    currency: "USD",
  }

  const validationSchema = Yup.object({
    adultOriginalPrice: Yup.number().min(0, "Must be >= 0").required("Required"),
    adultFinalPrice: Yup.number().min(0, "Must be >= 0").required("Required"),
    adultMinimumPayable: Yup.number().min(0, "Must be >= 0"),
    adultBestDiscount: Yup.number().min(0).max(100),

    childOriginalPrice: Yup.number().min(0, "Must be >= 0"),
    childFinalPrice: Yup.number().min(0, "Must be >= 0"),
    childMinimumPayable: Yup.number().min(0, "Must be >= 0"),
    childBestDiscount: Yup.number().min(0).max(100),

    groupSize: Yup.number().min(1, "Must be at least 1").required("Required"),
  })

  const handleSubmit = async (values) => {
    try {
      setSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      const payload = {
        listingPrice: {
          prices: [
            {
              type: "adult",
              originalPrice: parseFloat(values.adultOriginalPrice),
              finalPrice: parseFloat(values.adultFinalPrice),
              minimumPayablePrice: parseFloat(values.adultMinimumPayable) || 0,
              bestDiscount: parseFloat(values.adultBestDiscount) || 0,
              ageRange: { min: values.adultMinAge, max: values.adultMaxAge },
            },
            {
              type: "child",
              originalPrice: parseFloat(values.childOriginalPrice) || 0,
              finalPrice: parseFloat(values.childFinalPrice) || 0,
              minimumPayablePrice: parseFloat(values.childMinimumPayable) || 0,
              bestDiscount: parseFloat(values.childBestDiscount) || 0,
              ageRange: { min: values.childMinAge, max: values.childMaxAge },
            },
            {
              type: "infant",
              originalPrice: 0,
              finalPrice: 0,
              minimumPayablePrice: 0,
              bestDiscount: 0,
              ageRange: { min: values.infantMinAge, max: values.infantMaxAge },
            },
          ],
          groupSize: parseInt(values.groupSize),
          otherPricesExist: false,
        },
      }

      await axios.put(
        `/api/v1/tyl-travel-tour-group-variants/${variantId}`,
        payload
      )

      setSuccessMessage("Listing price saved successfully!")
      setTimeout(() => {
        onSave && onSave()
      }, 1000)
    } catch (err) {
      console.error("Error saving listing price:", err)
      setErrorMessage(err.response?.data?.message || "Failed to save listing price")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h5 className="mb-3">Simple Listing Price</h5>
      <p className="text-muted">
        Set fixed pricing for this variant. This price will apply to all dates unless
        overridden by pricing rules.
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
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* Adult Pricing */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">
                  <i className="bx bx-user me-2"></i>
                  Adult Pricing (Ages {values.adultMinAge}-{values.adultMaxAge})
                </h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Original Price *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="adultOriginalPrice"
                        placeholder="100"
                        invalid={touched.adultOriginalPrice && !!errors.adultOriginalPrice}
                      />
                      {touched.adultOriginalPrice && errors.adultOriginalPrice && (
                        <div className="text-danger small">{errors.adultOriginalPrice}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Final Price *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="adultFinalPrice"
                        placeholder="100"
                        invalid={touched.adultFinalPrice && !!errors.adultFinalPrice}
                      />
                      {touched.adultFinalPrice && errors.adultFinalPrice && (
                        <div className="text-danger small">{errors.adultFinalPrice}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Minimum Deposit</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="adultMinimumPayable"
                        placeholder="20"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Discount %</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="adultBestDiscount"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Child Pricing */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">
                  <i className="bx bx-child me-2"></i>
                  Child Pricing (Ages {values.childMinAge}-{values.childMaxAge})
                </h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Original Price</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="childOriginalPrice"
                        placeholder="80"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Final Price</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="childFinalPrice"
                        placeholder="80"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Minimum Deposit</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="childMinimumPayable"
                        placeholder="16"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Discount %</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="childBestDiscount"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Infant Pricing */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">
                  <i className="bx bx-baby-carriage me-2"></i>
                  Infant Pricing (Ages {values.infantMinAge}-{values.infantMaxAge}) - Usually Free
                </h6>
              </CardHeader>
              <CardBody>
                <Alert color="info">
                  Infant pricing is typically free and cannot be changed here.
                </Alert>
              </CardBody>
            </Card>

            {/* Group Settings */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">
                  <i className="bx bx-group me-2"></i>
                  Group Settings
                </h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Group Size *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="groupSize"
                        placeholder="1"
                        min="1"
                      />
                      <small className="text-muted">
                        Number of people per booking unit
                      </small>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Currency</Label>
                      <Input type="select" value={values.currency} disabled>
                        <option>USD</option>
                      </Input>
                      <small className="text-muted">
                        Default currency (multi-currency in rules)
                      </small>
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Submit Button */}
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
                    Save Listing Price
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

export default ListingPriceEditor

