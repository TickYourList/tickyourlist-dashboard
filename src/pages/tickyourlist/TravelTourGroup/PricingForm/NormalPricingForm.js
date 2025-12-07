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
import { Checkbox } from "antd"
import axios from "axios"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import { fetchVariantDetailRequest, updateVariantPricesRequest } from "store/tickyourlist/travelTourGroup/action"
import { useDispatch, useSelector } from "react-redux"

/**
 * Normal Pricing Form Component
 * Updates variant's listingPrice using /update-prices/:variantId endpoint
 */
const NormalPricingForm = ({ variantId, onSave }) => {
  const dispatch = useDispatch()
  const variantDetail = useSelector(state => state.tourGroup?.variantDetail)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedPricingTypes, setSelectedPricingTypes] = useState([])

  useEffect(() => {
    if (variantId) {
      dispatch(fetchVariantDetailRequest(variantId))
      setLoading(false)
    }
  }, [variantId, dispatch])

  const listingPrice = variantDetail?.listingPrice || {}
  const prices = listingPrice?.prices || []

  // Initialize selected types based on existing data
  useEffect(() => {
    const prices = variantDetail?.listingPrice?.prices || []
    if (prices.length > 0) {
      const existingTypes = prices
        .filter(p => p.finalPrice > 0 || p.originalPrice > 0)
        .map(p => p.type?.toLowerCase())
      if (existingTypes.length > 0) {
        setSelectedPricingTypes(existingTypes)
      } else {
        // Default to adult if nothing exists
        setSelectedPricingTypes(["adult"])
      }
    } else {
      setSelectedPricingTypes(["adult"])
    }
  }, [variantDetail?.listingPrice?.prices])

  const getPrice = (type) => {
    return prices.find(p => p.type?.toLowerCase() === type.toLowerCase()) || {}
  }

  const getAgeRange = (type) => {
    const price = getPrice(type)
    return price?.ageRange || { min: null, max: null }
  }

  const allPricingTypes = [
    { key: "adult", label: "Adult", defaultMinAge: 18, defaultMaxAge: 99 },
    { key: "child", label: "Child", defaultMinAge: 3, defaultMaxAge: 17 },
    { key: "guest", label: "Guest", defaultMinAge: 18, defaultMaxAge: 99 },
    { key: "youth", label: "Youth", defaultMinAge: 13, defaultMaxAge: 17 },
    { key: "infant", label: "Infant", defaultMinAge: 0, defaultMaxAge: 2 },
    { key: "senior", label: "Senior", defaultMinAge: 60, defaultMaxAge: 99 },
    { key: "family", label: "Family", defaultMinAge: null, defaultMaxAge: null },
    { key: "couple", label: "Couple", defaultMinAge: null, defaultMaxAge: null },
  ]

  const initialValues = {}

  allPricingTypes.forEach(({ key, defaultMinAge, defaultMaxAge }) => {
    const price = getPrice(key)
    const ageRange = getAgeRange(key)

    initialValues[`${key}OriginalPrice`] = price?.originalPrice || 0
    initialValues[`${key}FinalPrice`] = price?.finalPrice || 0
    initialValues[`${key}MinimumPayable`] = price?.minimumPayablePrice || 0
    initialValues[`${key}BestDiscount`] = price?.bestDiscount || 0
    initialValues[`${key}MinAge`] = ageRange?.min ?? defaultMinAge
    initialValues[`${key}MaxAge`] = ageRange?.max ?? defaultMaxAge
    initialValues[`${key}MinHeight`] = price?.minHeight || ""
    initialValues[`${key}Description`] = price?.description || ""
  })

  initialValues.groupSize = listingPrice?.groupSize || 1

  // Dynamic validation - at least one of adult or guest must be selected and have price > 0
  const validationSchema = Yup.object({
    groupSize: Yup.number().min(1, "Must be at least 1").required("Required"),
  }).test("pricing-required", "At least one pricing type must be selected and have a price > 0", function (value) {
    const hasValidPrice = selectedPricingTypes.some(key => (parseFloat(value[`${key}FinalPrice`]) || 0) > 0)

    if (!hasValidPrice) {
      // Find the first selected type to attach error to, or attach to groupSize if none
      const firstType = selectedPricingTypes[0]
      if (firstType) {
        return this.createError({
          path: `${firstType}FinalPrice`,
          message: "At least one pricing type must have a valid price"
        })
      }
      return this.createError({
        path: "groupSize",
        message: "At least one pricing type must be selected"
      })
    }
    return true
  })

  const handleSubmit = async (values) => {
    try {
      setSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      // Build prices array - only include selected types with prices > 0
      const pricesArray = []

      selectedPricingTypes.forEach((key) => {
        const finalPrice = parseFloat(values[`${key}FinalPrice`]) || 0
        const originalPrice = parseFloat(values[`${key}OriginalPrice`]) || finalPrice

        if (finalPrice > 0 || originalPrice > 0) {
          const priceObj = {
            type: key.toUpperCase(),
            originalPrice,
            finalPrice,
          }

          // Add optional fields
          if (key === "adult" || key === "child") {
            priceObj.minimumPayablePrice = parseFloat(values[`${key}MinimumPayable`]) || 0
            priceObj.bestDiscount = parseFloat(values[`${key}BestDiscount`]) || 0
          }

          // Add age range if provided
          const minAge = values[`${key}MinAge`]
          const maxAge = values[`${key}MaxAge`]
          if (minAge !== null && minAge !== undefined && maxAge !== null && maxAge !== undefined) {
            priceObj.ageRange = {
              min: parseInt(minAge),
              max: parseInt(maxAge),
            }
          }

          // Add minHeight if provided
          if (values[`${key}MinHeight`]) {
            priceObj.minHeight = values[`${key}MinHeight`]
          }

          // Add description if provided
          if (values[`${key}Description`]) {
            priceObj.description = values[`${key}Description`]
          }

          pricesArray.push(priceObj)
        }
      })

      // Validation: At least one price must be provided
      if (pricesArray.length === 0) {
        setErrorMessage("At least one pricing type must be provided")
        return
      }

      const payload = {
        listingPrice: {
          currencyCode: "USD",
          prices: pricesArray,
          groupSize: parseInt(values.groupSize) || 1,
          otherPricesExist: pricesArray.length > 1,
        },
      }

      // Dispatch Redux action
      dispatch(updateVariantPricesRequest(variantId, payload, () => {
        setSuccessMessage("Listing price updated successfully!")
        if (onSave) {
          setTimeout(() => {
            onSave()
          }, 1000)
        }
      }))
    } catch (err) {
      console.error("Error updating listing price:", err)
      const errorMsg = err.message || "Failed to update listing price"
      setErrorMessage(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <div>
      <h5 className="mb-3">Normal Pricing Update</h5>
      <p className="text-muted">
        Update the base listing price for this variant. This will be converted to all currencies automatically.
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
        {({ values, errors, touched }) => (
          <Form>
            {/* Pricing Type Selector */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">Select Pricing Types *</h6>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-wrap gap-3">
                  {allPricingTypes.map(({ key, label }) => {
                    const isChecked = selectedPricingTypes.includes(key)
                    const canRemove = selectedPricingTypes.length > 1

                    return (
                      <Button
                        key={key}
                        color={isChecked ? "primary" : "outline-secondary"}
                        size="sm"
                        className="rounded-pill px-3"
                        disabled={!canRemove && isChecked}
                        onClick={() => {
                          if (!isChecked) {
                            // Adding - always allow
                            setSelectedPricingTypes(prev => {
                              if (!prev.includes(key)) {
                                return [...prev, key]
                              }
                              return prev
                            })
                          } else {
                            // Removing - only if allowed
                            if (canRemove) {
                              setSelectedPricingTypes(prev => prev.filter(t => t !== key))
                            }
                          }
                        }}
                      >
                        {label}
                        {isChecked && <i className="bx bx-check ms-1"></i>}
                      </Button>
                    )
                  })}
                </div>
                <small className="text-muted d-block mt-2">
                  Select at least one pricing type.
                </small>
              </CardBody>
            </Card>

            {/* Pricing Forms for Selected Types */}
            {selectedPricingTypes.map(type => {
              const typeInfo = allPricingTypes.find(t => t.key === type)
              const isAdultOrChild = type === "adult" || type === "guest" || type === "child"
              const isRequired = selectedPricingTypes.length === 1 && selectedPricingTypes[0] === type

              return (
                <Card key={type} className="mb-3">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0" style={{ textTransform: "capitalize" }}>
                      {typeInfo?.label} Pricing
                      {isRequired && <span className="text-danger ms-1">*</span>}
                    </h6>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col md={3}>
                        <FormGroup>
                          <Label>
                            Original Price
                            {isRequired && <span className="text-danger"> *</span>}
                          </Label>
                          <Field
                            as={Input}
                            type="number"
                            name={`${type}OriginalPrice`}
                            placeholder="100"
                            invalid={isRequired && touched[`${type}OriginalPrice`] && !values[`${type}OriginalPrice`]}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={3}>
                        <FormGroup>
                          <Label>
                            Final Price
                            {isRequired && <span className="text-danger"> *</span>}
                          </Label>
                          <Field
                            as={Input}
                            type="number"
                            name={`${type}FinalPrice`}
                            placeholder="100"
                            invalid={isRequired && touched[`${type}FinalPrice`] && !values[`${type}FinalPrice`]}
                          />
                        </FormGroup>
                      </Col>
                      {isAdultOrChild && (
                        <>
                          <Col md={3}>
                            <FormGroup>
                              <Label>Minimum Deposit</Label>
                              <Field as={Input} type="number" name={`${type}MinimumPayable`} placeholder="0" />
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
                              <Label>Discount %</Label>
                              <Field as={Input} type="number" name={`${type}BestDiscount`} placeholder="0" min="0" max="100" />
                            </FormGroup>
                          </Col>
                        </>
                      )}
                    </Row>

                    {/* Age Range */}
                    {typeInfo?.defaultMinAge !== null && (
                      <Row className="mt-2">
                        <Col md={3}>
                          <FormGroup>
                            <Label>Min Age</Label>
                            <Field as={Input} type="number" name={`${type}MinAge`} placeholder={typeInfo.defaultMinAge} min="0" />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label>Max Age</Label>
                            <Field as={Input} type="number" name={`${type}MaxAge`} placeholder={typeInfo.defaultMaxAge} min="0" />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label>Min Height (optional)</Label>
                            <Field as={Input} type="text" name={`${type}MinHeight`} placeholder="e.g., 120cm" />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label>Description (optional)</Label>
                            <Field as={Input} type="text" name={`${type}Description`} placeholder="Description" />
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                  </CardBody>
                </Card>
              )
            })}

            {/* Group Settings */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">Group Settings</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Group Size *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="groupSize"
                        placeholder="1"
                        min="1"
                        invalid={touched.groupSize && !!errors.groupSize}
                      />
                      {touched.groupSize && errors.groupSize && (
                        <div className="text-danger small">{errors.groupSize}</div>
                      )}
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
                    Update Listing Price
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

export default NormalPricingForm

