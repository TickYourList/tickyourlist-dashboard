import React, { useState, useEffect } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { useDispatch, useSelector } from "react-redux"
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
  Table,
  Badge,
  Collapse,
} from "reactstrap"
import Switch from "react-switch"
import { Checkbox } from "antd"
import WeekdaySelector from "./WeekdaySelector"
import MonthSelector from "./MonthSelector"
import DateRangeSelector from "./DateRangeSelector"
import { fetchVariantDetailRequest } from "store/tickyourlist/travelTourGroup/action"

/**
 * Rule-Based Pricing Builder
 * Create or edit dynamic pricing rules based on conditions
 */
const RuleBasedPricingBuilder = ({ variantId, variantData, existingRules, editingRule, onSave, onCancel }) => {
  const dispatch = useDispatch()
  const variantDetail = useSelector(state => state.tourGroup?.variantDetail)

  const [ruleType, setRuleType] = useState("default")
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [timeSlots, setTimeSlots] = useState([])
  const [useTimeSlots, setUseTimeSlots] = useState(false)
  const [variantPricingTypes, setVariantPricingTypes] = useState([])
  const [selectedPricingTypes, setSelectedPricingTypes] = useState(["adult"])
  // Shared pricing types for all slots
  const [selectedSlotPricingTypes, setSelectedSlotPricingTypes] = useState(["adult"])
  const [customSlotType, setCustomSlotType] = useState("")
  const [showOldPricing, setShowOldPricing] = useState(false)

  const isEditMode = !!editingRule

  // Fetch variant pricing types via Redux
  useEffect(() => {
    if (variantId) {
      dispatch(fetchVariantDetailRequest(variantId))
    }
  }, [variantId, dispatch])

  // Extract pricing types from variant detail
  useEffect(() => {
    if (variantDetail?.listingPrice?.prices && Array.isArray(variantDetail.listingPrice.prices)) {
      const types = variantDetail.listingPrice.prices.map(p => p.type?.toLowerCase()).filter(Boolean)
      setVariantPricingTypes([...new Set(types)]) // Remove duplicates
    }
  }, [variantDetail])

  // Suggest next priority based on existing rules
  const suggestedPriority = () => {
    if (!existingRules || existingRules.length === 0) return 5
    const priorities = existingRules.map(r => r.priority).sort((a, b) => a - b)
    const maxPriority = Math.max(...priorities)
    if (maxPriority < 90) return Math.min(maxPriority + 5, 90)
    return maxPriority + 1
  }

  // Initialize form values from editing rule or defaults
  const getInitialValues = () => {
    if (editingRule) {
      const usdPricing = editingRule.dayPricing?.find(p => p.currency === "USD") || editingRule.dayPricing?.[0] || { prices: [] }

      // Extract all pricing types and determine which ones are set
      const pricingTypes = ['adult', 'child', 'guest', 'youth', 'infant', 'senior', 'family', 'couple']
      const foundTypes = []
      const prices = {}

      const ageRangeDefaults = {
        adult: { min: 18, max: 99 },
        child: { min: 3, max: 17 },
        guest: { min: 18, max: 99 },
        youth: { min: 13, max: 17 },
        infant: { min: 0, max: 2 },
        senior: { min: 60, max: 99 },
        family: { min: null, max: null },
        couple: { min: null, max: null },
      }

      pricingTypes.forEach(type => {
        const price = usdPricing.prices?.find(p =>
          p.type?.toLowerCase() === type.toLowerCase()
        ) || {}
        if (price.finalPrice > 0) {
          foundTypes.push(type)
        }
        prices[`${type}FinalPrice`] = price.finalPrice || 0
        prices[`${type}OriginalPrice`] = price.originalPrice || price.finalPrice || 0
        prices[`${type}MinAge`] = price.ageRange?.min ?? ageRangeDefaults[type]?.min ?? null
        prices[`${type}MaxAge`] = price.ageRange?.max ?? ageRangeDefaults[type]?.max ?? null
        prices[`${type}MinHeight`] = price.minHeight || ""
        prices[`${type}Description`] = price.description || ""
      })

      // Note: Selected pricing types are handled in useEffect now

      return {
        tag: editingRule.tag || "",
        name: editingRule.name || "",
        priority: editingRule.priority || suggestedPriority(),

        // Conditions
        weekdays: editingRule.conditions?.weekdays || [],
        months: editingRule.conditions?.months || [],
        dateRanges: editingRule.conditions?.dateRanges || [],

        // Pricing - all types
        currency: usdPricing.currency || "USD",
        ...prices,

        // Availability
        isAvailable: editingRule.isAvailable !== false,
        reason: editingRule.reason || "",
        description: editingRule.description || "",
      }
    }

    return {
      tag: "",
      name: "",
      priority: suggestedPriority(),

      // Conditions
      weekdays: [],
      months: [],
      dateRanges: [],

      // Pricing - all types
      currency: "USD",
      adultFinalPrice: 0,
      adultOriginalPrice: 0,
      adultMinAge: 18,
      adultMaxAge: 99,
      adultMinHeight: "",
      adultDescription: "",
      childFinalPrice: 0,
      childOriginalPrice: 0,
      childMinAge: 3,
      childMaxAge: 17,
      childMinHeight: "",
      childDescription: "",
      guestFinalPrice: 0,
      guestOriginalPrice: 0,
      guestMinAge: 18,
      guestMaxAge: 99,
      guestMinHeight: "",
      guestDescription: "",
      youthFinalPrice: 0,
      youthOriginalPrice: 0,
      youthMinAge: 13,
      youthMaxAge: 17,
      youthMinHeight: "",
      youthDescription: "",
      infantFinalPrice: 0,
      infantOriginalPrice: 0,
      infantMinAge: 0,
      infantMaxAge: 2,
      infantMinHeight: "",
      infantDescription: "",
      seniorFinalPrice: 0,
      seniorOriginalPrice: 0,
      seniorMinAge: 60,
      seniorMaxAge: 99,
      seniorMinHeight: "",
      seniorDescription: "",
      familyFinalPrice: 0,
      familyOriginalPrice: 0,
      familyMinAge: null,
      familyMaxAge: null,
      familyMinHeight: "",
      familyDescription: "",
      coupleFinalPrice: 0,
      coupleOriginalPrice: 0,
      coupleMinAge: null,
      coupleMaxAge: null,
      coupleMinHeight: "",
      coupleDescription: "",

      // Availability
      isAvailable: true,
      reason: "",
      description: "",
    }
  }

  const initialValues = getInitialValues()

  // Initialize selected pricing types when editing rule changes
  useEffect(() => {
    if (editingRule) {
      const usdPricing = editingRule.dayPricing?.find(p => p.currency === "USD") || editingRule.dayPricing?.[0] || { prices: [] }
      const pricingTypes = ['adult', 'child', 'guest', 'youth', 'infant', 'senior', 'family', 'couple']
      const foundTypes = []

      pricingTypes.forEach(type => {
        const price = usdPricing.prices?.find(p =>
          p.type?.toLowerCase() === type.toLowerCase()
        ) || {}
        if (price.finalPrice > 0) {
          foundTypes.push(type)
        }
      })

      if (foundTypes.length > 0) {
        setSelectedPricingTypes(foundTypes)
      } else {
        setSelectedPricingTypes(["adult"])
      }
    } else {
      setSelectedPricingTypes(["adult"])
    }
  }, [editingRule])

  // Determine rule type from existing rule and initialize time slots
  useEffect(() => {
    if (editingRule) {
      const type = classifyRule(editingRule)
      // Map "custom" to "complex" if it falls through, or keep as is if we add "custom" option
      setRuleType(type === "custom" ? "complex" : type)

      // Initialize time slots if they exist
      if (editingRule.slots && editingRule.slots.length > 0) {
        // Extract pricing types from first slot (they should be same across all slots)
        const firstSlot = editingRule.slots[0]
        const slotPricing = firstSlot.pricing?.[0] || { prices: [] }
        const foundTypes = []
        const pricingTypes = ['adult', 'child', 'guest', 'youth', 'infant', 'senior', 'family', 'couple']
        
        pricingTypes.forEach(type => {
          const priceObj = slotPricing.prices?.find(p =>
            p.type?.toLowerCase() === type.toLowerCase()
          ) || {}
          
          if (priceObj.finalPrice > 0 || priceObj.originalPrice > 0) {
            foundTypes.push(type)
          }
        })

        // Set shared pricing types for all slots
        setSelectedSlotPricingTypes(foundTypes.length > 0 ? foundTypes : ["adult"])

        const slotsWithPricing = editingRule.slots.map((slot) => {
          const slotPricing = slot.pricing?.[0] || { prices: [] }
          const pricing = {}
          
          pricingTypes.forEach(type => {
            const priceObj = slotPricing.prices?.find(p =>
              p.type?.toLowerCase() === type.toLowerCase()
            ) || {}
            
            pricing[type] = {
              finalPrice: priceObj.finalPrice || 0,
              originalPrice: priceObj.originalPrice || priceObj.finalPrice || 0,
              minAge: priceObj.ageRange?.min ?? null,
              maxAge: priceObj.ageRange?.max ?? null,
              minHeight: priceObj.minHeight || "",
              description: priceObj.description || ""
            }
          })

          return {
            startTime: slot.startTime || "09:00",
            endTime: slot.endTime || "12:00",
            capacity: slot.capacity || 0,
            bookedCapacity: slot.bookedCapacity || 0,
            slotType: slot.slotType || "morning",
            isAvailable: slot.isAvailable !== false,
            pricing: pricing,
            notes: slot.notes || "",
          }
        })
        
        setTimeSlots(slotsWithPricing)
        setUseTimeSlots(true)
      } else {
        setTimeSlots([])
        setSelectedSlotPricingTypes(["adult"])
        setUseTimeSlots(false)
      }
    } else {
      setTimeSlots([])
      setUseTimeSlots(false)
    }
  }, [editingRule])

  const validationSchema = Yup.object({
    tag: Yup.string()
      .required("Rule tag is required")
      .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores")
      .max(50, "Max 50 characters")
      .test("unique-tag", "Rule tag already exists", function (value) {
        if (!value || !existingRules) return true
        const otherRules = existingRules.filter(r =>
          r.tag === value && (!editingRule || r.tag !== editingRule.tag)
        )
        return otherRules.length === 0
      }),
    name: Yup.string().required("Rule name is required"),
    priority: Yup.number()
      .min(1, "Min 1")
      .max(100, "Max 100")
      .required("Priority is required")
      .test("unique-priority", "Priority number already exists", function (value) {
        if (!value || !existingRules) return true
        const otherRules = existingRules.filter(r =>
          r.priority === value && (!editingRule || r.priority !== editingRule.priority)
        )
        return otherRules.length === 0
      }),
    adultFinalPrice: Yup.number().min(0),
    guestFinalPrice: Yup.number().min(0),
  }).test("pricing-required", function (value) {
    const { isAvailable } = value
    if (!isAvailable) return true // Not required if not available

    // Check if at least one selected type has price > 0
    const hasValidPrice = selectedPricingTypes.some(key => (parseFloat(value[`${key}FinalPrice`]) || 0) > 0)

    if (hasValidPrice) {
      return true
    }

    // If no valid price, show error on first selected type
    const firstType = selectedPricingTypes[0]
    if (firstType) {
      return this.createError({
        path: `${firstType}FinalPrice`,
        message: "At least one pricing type must have a valid price"
      })
    }

    return this.createError({
      path: "priority", // Fallback field
      message: "At least one pricing type must be selected and priced"
    })
  })

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      // Build conditions based on rule type
      const conditions = {}
      if (ruleType !== "default") {
        if (values.weekdays.length > 0) conditions.weekdays = values.weekdays
        if (values.months.length > 0) conditions.months = values.months
        if (values.dateRanges.length > 0) conditions.dateRanges = values.dateRanges
      }

      // Build dayPricing structure (only if not using time slots)
      const dayPricing = !useTimeSlots ? [
        {
          currency: values.currency,
          prices: selectedPricingTypes
            .map(type => {
              const finalPrice = parseFloat(values[`${type}FinalPrice`]) || 0
              const originalPrice = parseFloat(values[`${type}OriginalPrice`]) || finalPrice

              if (finalPrice <= 0 && originalPrice <= 0) return null

              const priceObj = { type: type.toUpperCase(), finalPrice, originalPrice }

              // Add age range if provided
              const minAge = values[`${type}MinAge`]
              const maxAge = values[`${type}MaxAge`]
              if (minAge !== null && minAge !== undefined && maxAge !== null && maxAge !== undefined) {
                priceObj.ageRange = {
                  min: parseInt(minAge),
                  max: parseInt(maxAge),
                }
              }

              // Add minHeight if provided
              if (values[`${type}MinHeight`]) {
                priceObj.minHeight = values[`${type}MinHeight`]
              }

              // Add description if provided
              if (values[`${type}Description`]) {
                priceObj.description = values[`${type}Description`]
              }

              return priceObj
            })
            .filter(p => p !== null) // Only include prices > 0
        }
      ] : []


      // Build slots structure
      const slots = useTimeSlots ? timeSlots.map((slot) => {
        // Use shared pricing types for all slots
        const selectedTypes = selectedSlotPricingTypes.length > 0 ? selectedSlotPricingTypes : ["adult"]
        
        // Build prices array from selected pricing types
        const prices = selectedTypes.map(type => {
          const priceData = slot.pricing?.[type] || {}
          const finalPrice = typeof priceData === 'object' ? (priceData.finalPrice || 0) : (priceData || 0)
          const originalPrice = typeof priceData === 'object' ? (priceData.originalPrice || finalPrice || 0) : (priceData || 0)
          
          const priceObj = {
                type: type.toUpperCase(),
                finalPrice: parseFloat(finalPrice) || 0,
                originalPrice: parseFloat(originalPrice) || parseFloat(finalPrice) || 0
          }

          // Add age range if provided
          if (priceData.minAge !== null && priceData.minAge !== undefined && 
              priceData.maxAge !== null && priceData.maxAge !== undefined) {
            priceObj.ageRange = {
              min: parseInt(priceData.minAge),
              max: parseInt(priceData.maxAge)
            }
          }

          // Add minHeight if provided
          if (priceData.minHeight) {
            priceObj.minHeight = String(priceData.minHeight)
          }

          // Add description if provided
          if (priceData.description) {
            priceObj.description = String(priceData.description)
          }

          return priceObj
        })

        // If no prices set, at least include adult with 0 price
        if (prices.length === 0) {
          prices.push({
            type: "ADULT",
            finalPrice: 0,
            originalPrice: 0
          })
        }

        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          capacity: slot.capacity || 0,
          bookedCapacity: slot.bookedCapacity || 0,
          slotType: slot.slotType || "",
          isAvailable: slot.isAvailable !== false,
          notes: slot.notes || "",
          pricing: [{
            currency: values.currency,
            prices: prices
          }]
        }
      }) : []

      const payload = {
        tag: values.tag,
        name: values.name,
        priority: parseInt(values.priority),
        conditions,
        dayPricing: dayPricing.length > 0 ? dayPricing : undefined,
        slots: slots.length > 0 ? slots : undefined,
        isAvailable: values.isAvailable,
        reason: values.reason || undefined,
        description: values.description || undefined,
        isActive: true,
      }

      // Call onSave callback with payload (parent will handle Redux dispatch)
      onSave && onSave(payload)

      setSuccessMessage(isEditMode ? "Pricing rule updated successfully!" : "Pricing rule created successfully!")
      resetForm()
      setRuleType("default")
    } catch (err) {
      console.error("Error saving pricing rule:", err)
      setErrorMessage(err.message || "Failed to save pricing rule")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h5 className="mb-3">Create Pricing Rule</h5>
      <p className="text-muted">
        Dynamic pricing rules allow you to set different prices based on conditions like
        weekdays, months, or specific date ranges.
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

      {/* Existing Rules Summary */}
      {existingRules && existingRules.length > 0 && (
        <Card className="mb-3 border-primary">
          <CardHeader className="bg-light">
            <h6 className="mb-0">Existing Rules ({existingRules.length})</h6>
          </CardHeader>
          <CardBody>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {existingRules
                    .sort((a, b) => b.priority - a.priority)
                    .map(rule => (
                      <tr key={rule._id}>
                        <td>
                          <Badge color={getPriorityColor(rule.priority)}>
                            {rule.priority}
                          </Badge>
                        </td>
                        <td>{rule.name}</td>
                        <td>
                          <small className="text-muted">{classifyRule(rule)}</small>
                        </td>
                        <td>
                          {rule.isActive ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="secondary">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* Rule Type Selection */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">1. Select Rule Type</h6>
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { value: "default", label: "Default (No Conditions)", icon: "bx-layer" },
                      { value: "weekly", label: "Weekly Pattern", icon: "bx-calendar-week" },
                      { value: "seasonal", label: "Seasonal", icon: "bx-sun" },
                      { value: "date_specific", label: "Specific Dates", icon: "bx-calendar-event" },
                      { value: "complex", label: "Complex", icon: "bx-network-chart" },
                    ].map(type => (
                      <Button
                        key={type.value}
                        color={ruleType === type.value ? "primary" : "outline-primary"}
                        onClick={() => setRuleType(type.value)}
                        type="button"
                      >
                        <i className={`bx ${type.icon} me-1`}></i>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </FormGroup>
              </CardBody>
            </Card>

            {/* Basic Info */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">2. Basic Information</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Rule Tag *</Label>
                      <Field
                        as={Input}
                        type="text"
                        name="tag"
                        placeholder="e.g., weekend_premium"
                        invalid={touched.tag && !!errors.tag}
                      />
                      {touched.tag && errors.tag && (
                        <div className="text-danger small">{errors.tag}</div>
                      )}
                      <small className="text-muted">Unique identifier (lowercase, underscores)</small>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Rule Name *</Label>
                      <Field
                        as={Input}
                        type="text"
                        name="name"
                        placeholder="e.g., Weekend Premium Pricing"
                        invalid={touched.name && !!errors.name}
                      />
                      {touched.name && errors.name && (
                        <div className="text-danger small">{errors.name}</div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Priority (1-100) *</Label>
                      <Field
                        as={Input}
                        type="number"
                        name="priority"
                        min="1"
                        max="100"
                        invalid={touched.priority && !!errors.priority}
                      />
                      {touched.priority && errors.priority && (
                        <div className="text-danger small">{errors.priority}</div>
                      )}
                      <small className="text-muted">
                        Higher = more priority. Suggested: {suggestedPriority()}
                      </small>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <Label>Description (Optional)</Label>
                      <Field
                        as={Input}
                        type="textarea"
                        name="description"
                        placeholder="Brief description of this rule"
                        rows="2"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Priority Guidelines */}
            <Card className="mb-3 border-info">
              <CardBody>
                <h6 className="mb-2">Priority Guidelines</h6>
                <div className="d-flex flex-wrap gap-2 small">
                  <Badge color="danger">90-100: Emergency</Badge>
                  <Badge color="warning">51-89: Special Events</Badge>
                  <Badge color="info">31-50: Complex Rules</Badge>
                  <Badge color="primary">21-30: Seasonal</Badge>
                  <Badge color="success">11-20: Weekly</Badge>
                  <Badge color="secondary">1-10: Default</Badge>
                </div>
              </CardBody>
            </Card>

            {/* Conditions */}
            {ruleType !== "default" && (
              <Card className="mb-3">
                <CardHeader className="bg-light">
                  <h6 className="mb-0">3. Conditions</h6>
                </CardHeader>
                <CardBody>
                  {(ruleType === "weekly" || ruleType === "complex") && (
                    <WeekdaySelector
                      value={values.weekdays}
                      onChange={days => setFieldValue("weekdays", days)}
                    />
                  )}

                  {(ruleType === "seasonal" || ruleType === "complex") && (
                    <MonthSelector
                      value={values.months}
                      onChange={months => setFieldValue("months", months)}
                    />
                  )}

                  {(ruleType === "date_specific" || ruleType === "complex") && (
                    <DateRangeSelector
                      value={values.dateRanges}
                      onChange={ranges => setFieldValue("dateRanges", ranges)}
                    />
                  )}
                </CardBody>
              </Card>
            )}

            {/* Pricing */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">4. Pricing</h6>
              </CardHeader>
              <CardBody>
                <Row className="mb-3">
                  <Col md={3}>
                    <FormGroup>
                      <Label>Currency</Label>
                      <Input type="select" value={values.currency} disabled>
                        <option>USD</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={9}>
                    <FormGroup>
                      <div className="d-flex align-items-center gap-2">
                        <Switch
                          checked={useTimeSlots}
                          onChange={(checked) => {
                            setUseTimeSlots(checked)
                            if (!checked) {
                              setTimeSlots([])
                            }
                          }}
                          onColor="#86d3ff"
                          onHandleColor="#2693e6"
                          handleDiameter={20}
                          uncheckedIcon={false}
                          checkedIcon={false}
                          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                          height={24}
                          width={48}
                          id="useTimeSlots"
                        />
                        <Label
                          htmlFor="useTimeSlots"
                          style={{ cursor: "pointer", userSelect: "none", margin: 0 }}
                        >
                          Use Time Slots (instead of day pricing)
                        </Label>
                      </div>
                      <small className="text-muted d-block mt-1">
                        Enable time slots to set different pricing and capacity for specific time periods
                      </small>
                    </FormGroup>
                  </Col>
                </Row>

                {!useTimeSlots && (
                  <div>
                    <Row className="mb-3">
                      <Col md={12}>
                        <FormGroup>
                          <Label>Select Pricing Types *</Label>
                          <div className="d-flex flex-wrap gap-2">
                            {["adult", "child", "guest", "youth", "infant", "senior", "family", "couple", ...variantPricingTypes.filter(t => !["adult", "child", "guest", "youth", "infant", "senior", "family", "couple"].includes(t))].map(type => {
                              const isChecked = selectedPricingTypes.includes(type)
                              const canRemove = selectedPricingTypes.length > 1

                              return (
                                <Button
                                  key={type}
                                  color={isChecked ? "primary" : "outline-secondary"}
                                  size="sm"
                                  className="rounded-pill px-3"
                                  disabled={!canRemove && isChecked}
                                  onClick={() => {
                                    if (!isChecked) {
                                      // Adding - always allow
                                      setSelectedPricingTypes(prev => {
                                        if (!prev.includes(type)) {
                                          return [...prev, type]
                                        }
                                        return prev
                                      })
                                    } else {
                                      // Removing - only if allowed
                                      if (canRemove) {
                                        setSelectedPricingTypes(prev => prev.filter(t => t !== type))
                                      }
                                    }
                                  }}
                                  style={{ textTransform: "capitalize" }}
                                >
                                  {type}
                                  {isChecked && <i className="bx bx-check ms-1"></i>}
                                </Button>
                              )
                            })}
                          </div>
                          <small className="text-muted">
                            Select pricing types. At least one type must be selected and have a price &gt; 0.
                          </small>
                        </FormGroup>
                      </Col>
                    </Row>

                    {selectedPricingTypes.map((type, index) => {
                      const isRequired = selectedPricingTypes.length === 1 && selectedPricingTypes[0] === type
                      const hasAgeRange = !["family", "couple"].includes(type)

                      return (
                        <Card key={type} className={index > 0 ? "mt-3" : ""}>
                          <CardHeader className="bg-light">
                            <h6 className="mb-0" style={{ textTransform: "capitalize" }}>
                              {type} Pricing
                              {isRequired && <span className="text-danger ms-1">*</span>}
                            </h6>
                          </CardHeader>
                          <CardBody>
                            <Row>
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
                                  {touched[`${type}FinalPrice`] && errors[`${type}FinalPrice`] && (
                                    <div className="text-danger small">{errors[`${type}FinalPrice`]}</div>
                                  )}
                                </FormGroup>
                              </Col>
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
                                  <small className="text-muted">Optional, defaults to final</small>
                                </FormGroup>
                              </Col>
                            </Row>

                            {/* Age Range Fields */}
                            {hasAgeRange && (
                              <Row className="mt-2">
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>Min Age</Label>
                                    <Field as={Input} type="number" name={`${type}MinAge`} placeholder="0" min="0" />
                                  </FormGroup>
                                </Col>
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>Max Age</Label>
                                    <Field as={Input} type="number" name={`${type}MaxAge`} placeholder="99" min="0" />
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

                    {/* Collapsible section for old pricing behavior */}
                    <Card className="mt-3 border-info">
                      <CardHeader
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowOldPricing(!showOldPricing)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>
                            <i className={`bx bx-chevron-${showOldPricing ? 'down' : 'right'} me-2`}></i>
                            Old Pricing Behavior (Legacy)
                          </span>
                          <Badge color="info">Info</Badge>
                        </div>
                      </CardHeader>
                      <Collapse isOpen={showOldPricing}>
                        <CardBody>
                          <Alert color="info">
                            <strong>Note:</strong> This section shows the old pricing structure for reference.
                            Use the pricing type selector above for the new dynamic pricing system.
                          </Alert>
                          <p className="text-muted small">
                            Previously, pricing was hardcoded with fixed types (Adult, Child, Guest, Youth, etc.).
                            The new system allows you to select which pricing types to use dynamically based on your variant's configuration.
                          </p>
                          <p className="text-muted small mb-0">
                            <strong>What changed:</strong>
                          </p>
                          <ul className="text-muted small">
                            <li>Pricing types are now selectable via checkboxes</li>
                            <li>Types are loaded from variant's listingPrice configuration</li>
                            <li>Adult is optional if Guest is selected (and vice versa)</li>
                            <li>At least one pricing type must be provided when available</li>
                          </ul>
                        </CardBody>
                      </Collapse>
                    </Card>
                  </div>
                )}

                {useTimeSlots && (
                  <Card className="mb-3">
                    <CardHeader>
                      Time Slots
                      <Button
                        color="primary"
                        size="sm"
                        className="float-end"
                        onClick={() => {
                          const defaultPricing = {}
                          const allTypes = ["adult", "child", "guest", "youth", "infant", "senior", "family", "couple"]
                          allTypes.forEach(type => {
                            const ageDefaults = {
                              adult: { min: 18, max: 99 },
                              child: { min: 3, max: 17 },
                              guest: { min: 18, max: 99 },
                              youth: { min: 13, max: 17 },
                              infant: { min: 0, max: 2 },
                              senior: { min: 60, max: 99 },
                              family: { min: null, max: null },
                              couple: { min: null, max: null },
                            }
                            defaultPricing[type] = {
                              finalPrice: 0,
                              originalPrice: 0,
                              minAge: ageDefaults[type]?.min ?? null,
                              maxAge: ageDefaults[type]?.max ?? null,
                              minHeight: "",
                              description: ""
                            }
                          })
                          
                          setTimeSlots([...timeSlots, {
                            startTime: "09:00",
                            endTime: "12:00",
                            capacity: 0,
                            bookedCapacity: 0,
                            slotType: "morning",
                            isAvailable: true,
                            pricing: defaultPricing,
                            notes: "",
                          }])
                          // New slots automatically use the shared selectedSlotPricingTypes
                        }}
                        type="button"
                      >
                        + Add Slot
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {timeSlots.length === 0 ? (
                        <Alert color="info">No time slots added. Click "Add Slot" to create one.</Alert>
                      ) : (
                        <div>
                          {timeSlots.map((slot, index) => (
                            <Card key={index} className="mb-3">
                              <CardHeader className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{slot.startTime} - {slot.endTime}</strong>
                                  <Badge color="secondary" className="ms-2">{slot.slotType || "morning"}</Badge>
                                </div>
                                <div>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => {
                                      const newSlots = timeSlots.filter((_, i) => i !== index)
                                      setTimeSlots(newSlots)
                                      if (newSlots.length === 0) {
                                        setUseTimeSlots(false)
                                      }
                                    }}
                                    type="button"
                                  >
                                    <i className="bx bx-trash"></i> Remove
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardBody>
                                <Row>
                                  <Col md={3}>
                                    <FormGroup>
                                      <Label>Start Time</Label>
                                      <Input
                                        type="time"
                                        value={slot.startTime}
                                        onChange={(e) => {
                                          const newSlots = [...timeSlots]
                                          newSlots[index] = { ...newSlots[index], startTime: e.target.value }
                                          setTimeSlots(newSlots)
                                        }}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md={3}>
                                    <FormGroup>
                                      <Label>End Time</Label>
                                      <Input
                                        type="time"
                                        value={slot.endTime}
                                        onChange={(e) => {
                                          const newSlots = [...timeSlots]
                                          newSlots[index] = { ...newSlots[index], endTime: e.target.value }
                                          setTimeSlots(newSlots)
                                        }}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md={3}>
                                    <FormGroup>
                                      <Label>Slot Type</Label>
                                      <Input
                                        type="select"
                                        value={["morning", "afternoon", "evening", "night"].includes(slot.slotType) ? slot.slotType : "custom"}
                                        onChange={(e) => {
                                          const newSlots = [...timeSlots]
                                          const value = e.target.value
                                          if (value === "custom") {
                                            // Set to empty to show custom input
                                            newSlots[index] = { ...newSlots[index], slotType: "" }
                                            setTimeSlots(newSlots)
                                          } else {
                                            newSlots[index] = { ...newSlots[index], slotType: value }
                                            setTimeSlots(newSlots)
                                          }
                                        }}
                                      >
                                        <option value="">Select Type</option>
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                        <option value="custom">+ Add Custom Type</option>
                                      </Input>
                                      {(!slot.slotType || !["morning", "afternoon", "evening", "night"].includes(slot.slotType)) && (
                                        <Input
                                          type="text"
                                          className="mt-2"
                                          placeholder="Enter custom slot type (e.g., christmas_slot_holiday)"
                                          value={slot.slotType || ""}
                                          onChange={(e) => {
                                            const newSlots = [...timeSlots]
                                            const value = e.target.value
                                            newSlots[index] = { ...newSlots[index], slotType: value }
                                            setTimeSlots(newSlots)
                                          }}
                                        />
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md={3}>
                                    <FormGroup>
                                      <Label>Capacity</Label>
                                      <Input
                                        type="number"
                                        value={slot.capacity || 0}
                                        onChange={(e) => {
                                          const newSlots = [...timeSlots]
                                          newSlots[index] = { ...newSlots[index], capacity: parseInt(e.target.value) || 0 }
                                          setTimeSlots(newSlots)
                                        }}
                                        min="0"
                                      />
                                    </FormGroup>
                                  </Col>
                                </Row>

                                <hr />

                                {/* Pricing Type Selection - Show once for all slots */}
                                {index === 0 && (
                                  <div className="mb-3">
                                    <Label className="mb-2 d-block">Select Pricing Types (Applies to All Slots) *</Label>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                      {["adult", "child", "guest", "youth", "infant", "senior", "family", "couple", ...variantPricingTypes.filter(t => !["adult", "child", "guest", "youth", "infant", "senior", "family", "couple"].includes(t))].map(type => {
                                        const isChecked = selectedSlotPricingTypes.includes(type)
                                        const canRemove = selectedSlotPricingTypes.length > 1

                                        return (
                                          <Button
                                            key={type}
                                            color={isChecked ? "primary" : "outline-secondary"}
                                            size="sm"
                                            className="rounded-pill px-3"
                                            disabled={!canRemove && isChecked}
                                            onClick={() => {
                                              if (!isChecked) {
                                                setSelectedSlotPricingTypes([...selectedSlotPricingTypes, type])
                                              } else {
                                                if (canRemove) {
                                                  setSelectedSlotPricingTypes(selectedSlotPricingTypes.filter(t => t !== type))
                                                }
                                              }
                                            }}
                                            style={{ textTransform: "capitalize" }}
                                            type="button"
                                          >
                                            {type}
                                            {isChecked && <i className="bx bx-check ms-1"></i>}
                                          </Button>
                                        )
                                      })}
                                    </div>
                                    <small className="text-muted d-block mb-3">
                                      Select pricing types. These apply to all slots. At least one type must be selected.
                                    </small>
                                    <hr />
                                  </div>
                                )}

                                <h6 className="mb-3">Pricing</h6>
                                {selectedSlotPricingTypes.map(type => {
                                  const priceData = slot.pricing?.[type] || {
                                    finalPrice: 0,
                                    originalPrice: 0,
                                    minAge: type === "adult" ? 18 : type === "child" ? 3 : type === "youth" ? 13 : type === "infant" ? 0 : type === "senior" ? 60 : null,
                                    maxAge: type === "adult" ? 99 : type === "child" ? 17 : type === "youth" ? 17 : type === "infant" ? 2 : type === "senior" ? 99 : null,
                                    minHeight: "",
                                    description: ""
                                  }
                                  const hasAgeRange = !["family", "couple"].includes(type)

                                  return (
                                    <Card key={type} className="mb-3">
                                      <CardHeader className="bg-light">
                                        <h6 className="mb-0" style={{ textTransform: "capitalize" }}>
                                          {type} Pricing
                                        </h6>
                                      </CardHeader>
                                      <CardBody>
                                        <Row>
                                          <Col md={3}>
                                      <FormGroup>
                                              <Label>Final Price *</Label>
                                        <Input
                                          type="number"
                                                value={priceData.finalPrice || 0}
                                          onChange={(e) => {
                                            const newSlots = [...timeSlots]
                                            if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                  if (!newSlots[index].pricing[type]) {
                                              newSlots[index].pricing[type] = {
                                                      finalPrice: 0,
                                                      originalPrice: 0,
                                                      minAge: priceData.minAge,
                                                      maxAge: priceData.maxAge,
                                                      minHeight: priceData.minHeight || "",
                                                      description: priceData.description || ""
                                                    }
                                                  }
                                                  newSlots[index].pricing[type].finalPrice = parseFloat(e.target.value) || 0
                                            setTimeSlots(newSlots)
                                          }}
                                          min="0"
                                          step="0.01"
                                        />
                                      </FormGroup>
                                    </Col>
                                          <Col md={3}>
                                      <FormGroup>
                                              <Label>Original Price</Label>
                                        <Input
                                          type="number"
                                                value={priceData.originalPrice || 0}
                                          onChange={(e) => {
                                            const newSlots = [...timeSlots]
                                            if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                  if (!newSlots[index].pricing[type]) {
                                              newSlots[index].pricing[type] = {
                                                      finalPrice: 0,
                                                      originalPrice: 0,
                                                      minAge: priceData.minAge,
                                                      maxAge: priceData.maxAge,
                                                      minHeight: priceData.minHeight || "",
                                                      description: priceData.description || ""
                                                    }
                                                  }
                                                  newSlots[index].pricing[type].originalPrice = parseFloat(e.target.value) || 0
                                            setTimeSlots(newSlots)
                                          }}
                                          min="0"
                                          step="0.01"
                                        />
                                        <small className="text-muted">Optional, defaults to final</small>
                                      </FormGroup>
                                    </Col>
                                  </Row>

                                        {hasAgeRange && (
                                          <Row className="mt-2">
                                            <Col md={3}>
                                              <FormGroup>
                                                <Label>Min Age</Label>
                                                <Input
                                                  type="number"
                                                  value={priceData.minAge ?? ""}
                                                  onChange={(e) => {
                                                    const newSlots = [...timeSlots]
                                                    if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                    if (!newSlots[index].pricing[type]) {
                                                      newSlots[index].pricing[type] = {
                                                        finalPrice: 0,
                                                        originalPrice: 0,
                                                        minAge: null,
                                                        maxAge: null,
                                                        minHeight: "",
                                                        description: ""
                                                      }
                                                    }
                                                    newSlots[index].pricing[type].minAge = e.target.value !== "" ? parseInt(e.target.value) : null
                                                    setTimeSlots(newSlots)
                                                  }}
                                                  placeholder="0"
                                                  min="0"
                                                />
                                              </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                              <FormGroup>
                                                <Label>Max Age</Label>
                                                <Input
                                                  type="number"
                                                  value={priceData.maxAge ?? ""}
                                                  onChange={(e) => {
                                                    const newSlots = [...timeSlots]
                                                    if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                    if (!newSlots[index].pricing[type]) {
                                                      newSlots[index].pricing[type] = {
                                                        finalPrice: 0,
                                                        originalPrice: 0,
                                                        minAge: null,
                                                        maxAge: null,
                                                        minHeight: "",
                                                        description: ""
                                                      }
                                                    }
                                                    newSlots[index].pricing[type].maxAge = e.target.value !== "" ? parseInt(e.target.value) : null
                                                    setTimeSlots(newSlots)
                                                  }}
                                                  placeholder="99"
                                                  min="0"
                                                />
                                              </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                              <FormGroup>
                                                <Label>Min Height (optional)</Label>
                                                <Input
                                                  type="text"
                                                  value={priceData.minHeight || ""}
                                                  onChange={(e) => {
                                                    const newSlots = [...timeSlots]
                                                    if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                    if (!newSlots[index].pricing[type]) {
                                                      newSlots[index].pricing[type] = {
                                                        finalPrice: 0,
                                                        originalPrice: 0,
                                                        minAge: priceData.minAge,
                                                        maxAge: priceData.maxAge,
                                                        minHeight: "",
                                                        description: ""
                                                      }
                                                    }
                                                    newSlots[index].pricing[type].minHeight = e.target.value
                                                    setTimeSlots(newSlots)
                                                  }}
                                                  placeholder="e.g., 120cm"
                                                />
                                              </FormGroup>
                                            </Col>
                                            <Col md={3}>
                                              <FormGroup>
                                                <Label>Description (optional)</Label>
                                                <Input
                                                  type="text"
                                                  value={priceData.description || ""}
                                                  onChange={(e) => {
                                                    const newSlots = [...timeSlots]
                                                    if (!newSlots[index].pricing) newSlots[index].pricing = {}
                                                    if (!newSlots[index].pricing[type]) {
                                                      newSlots[index].pricing[type] = {
                                                        finalPrice: 0,
                                                        originalPrice: 0,
                                                        minAge: priceData.minAge,
                                                        maxAge: priceData.maxAge,
                                                        minHeight: "",
                                                        description: ""
                                                      }
                                                    }
                                                    newSlots[index].pricing[type].description = e.target.value
                                                    setTimeSlots(newSlots)
                                                  }}
                                                  placeholder="Description"
                                                />
                                              </FormGroup>
                                            </Col>
                                          </Row>
                                        )}
                                      </CardBody>
                                    </Card>
                                  )
                                })}

                                <Row className="mt-3">
                                  <Col md={6}>
                                    <FormGroup>
                                      <div className="form-check">
                                        <Input
                                          type="checkbox"
                                          checked={slot.isAvailable !== false}
                                          onChange={(e) => {
                                            const newSlots = [...timeSlots]
                                            newSlots[index] = { ...newSlots[index], isAvailable: e.target.checked }
                                            setTimeSlots(newSlots)
                                          }}
                                          className="form-check-input"
                                          id={`slot-available-${index}`}
                                        />
                                        <Label className="form-check-label" htmlFor={`slot-available-${index}`}>
                                          Available
                                        </Label>
                                      </div>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}
              </CardBody>
            </Card>

            {/* Availability */}
            <Card className="mb-3">
              <CardHeader className="bg-light">
                <h6 className="mb-0">5. Availability</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Is Available?</Label>
                      <Field
                        as={Input}
                        type="select"
                        name="isAvailable"
                        onChange={e => setFieldValue("isAvailable", e.target.value === "true")}
                      >
                        <option value="true">Yes (Available)</option>
                        <option value="false">No (Unavailable)</option>
                      </Field>
                    </FormGroup>
                  </Col>
                  {!values.isAvailable && (
                    <Col md={8}>
                      <FormGroup>
                        <Label>Reason for Unavailability</Label>
                        <Field
                          as={Input}
                          type="text"
                          name="reason"
                          placeholder="e.g., Scheduled maintenance"
                        />
                      </FormGroup>
                    </Col>
                  )}
                </Row>
              </CardBody>
            </Card>

            {/* Submit */}
            <div className="text-end">
              <Button color="secondary" className="me-2" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <i className={isEditMode ? "bx bx-save me-2" : "bx bx-plus-circle me-2"}></i>
                    {isEditMode ? "Update Pricing Rule" : "Create Pricing Rule"}
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

// Helper functions
const getPriorityColor = (priority) => {
  if (priority >= 90) return "danger"
  if (priority >= 51) return "warning"
  if (priority >= 31) return "info"
  if (priority >= 21) return "primary"
  if (priority >= 11) return "success"
  return "secondary"
}



// ...

function classifyRule(rule) {
  const conditions = rule.conditions || {}
  const hasWeekdays = conditions.weekdays && conditions.weekdays.length > 0
  const hasMonths = conditions.months && conditions.months.length > 0
  const hasDateRanges = conditions.dateRanges && conditions.dateRanges.length > 0

  if (!hasWeekdays && !hasMonths && !hasDateRanges) return "default"

  // Check for complex combinations
  if ((hasDateRanges && (hasWeekdays || hasMonths)) || (hasWeekdays && hasMonths)) {
    return "complex"
  }

  if (hasDateRanges) return "date_specific"
  if (hasMonths) return "seasonal"
  if (hasWeekdays) return "weekly"

  return "custom"
}

export default RuleBasedPricingBuilder

