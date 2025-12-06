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
  Table,
  Badge,
} from "reactstrap"
import axios from "axios"
import WeekdaySelector from "./WeekdaySelector"
import MonthSelector from "./MonthSelector"
import DateRangeSelector from "./DateRangeSelector"

/**
 * Rule-Based Pricing Builder
 * Create dynamic pricing rules based on conditions
 */
const RuleBasedPricingBuilder = ({ variantId, variantData, existingRules, onSave }) => {
  const [ruleType, setRuleType] = useState("default")
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Suggest next priority based on existing rules
  const suggestedPriority = () => {
    if (!existingRules || existingRules.length === 0) return 5
    const priorities = existingRules.map(r => r.priority).sort((a, b) => a - b)
    const maxPriority = Math.max(...priorities)
    if (maxPriority < 90) return Math.min(maxPriority + 5, 90)
    return maxPriority + 1
  }

  const initialValues = {
    tag: "",
    name: "",
    priority: suggestedPriority(),
    
    // Conditions
    weekdays: [],
    months: [],
    dateRanges: [],
    
    // Pricing
    currency: "USD",
    adultFinalPrice: 0,
    adultOriginalPrice: 0,
    childFinalPrice: 0,
    childOriginalPrice: 0,
    infantFinalPrice: 0,
    infantOriginalPrice: 0,
    
    // Availability
    isAvailable: true,
    reason: "",
    description: "",
  }

  const validationSchema = Yup.object({
    tag: Yup.string()
      .required("Rule tag is required")
      .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores")
      .max(50, "Max 50 characters"),
    name: Yup.string().required("Rule name is required"),
    priority: Yup.number()
      .min(1, "Min 1")
      .max(100, "Max 100")
      .required("Priority is required"),
    adultFinalPrice: Yup.number().min(0).when("isAvailable", {
      is: true,
      then: Yup.number().min(1, "Must be > 0 when available").required("Required"),
    }),
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

      const payload = {
        variantId,
        tag: values.tag,
        name: values.name,
        priority: parseInt(values.priority),
        conditions,
        dayPricing: [
          {
            currency: values.currency,
            prices: [
              {
                type: "adult",
                finalPrice: parseFloat(values.adultFinalPrice),
                originalPrice: parseFloat(values.adultOriginalPrice) || parseFloat(values.adultFinalPrice),
              },
              {
                type: "child",
                finalPrice: parseFloat(values.childFinalPrice) || 0,
                originalPrice: parseFloat(values.childOriginalPrice) || parseFloat(values.childFinalPrice) || 0,
              },
              {
                type: "infant",
                finalPrice: 0,
                originalPrice: 0,
              },
            ],
          },
        ],
        isAvailable: values.isAvailable,
        reason: values.reason || undefined,
        description: values.description || undefined,
        isActive: true,
      }

      await axios.post(`/api/v1/pricing-rule/${variantId}`, payload)

      setSuccessMessage("Pricing rule created successfully!")
      resetForm()
      setRuleType("default")
      
      setTimeout(() => {
        onSave && onSave()
      }, 1000)
    } catch (err) {
      console.error("Error creating pricing rule:", err)
      setErrorMessage(err.response?.data?.message || "Failed to create pricing rule")
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
                </Row>
                <Row>
                  <Col md={6}>
                    <h6 className="text-muted">Adult Pricing *</h6>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label>Final Price</Label>
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
                      <Col>
                        <FormGroup>
                          <Label>Original Price</Label>
                          <Field
                            as={Input}
                            type="number"
                            name="adultOriginalPrice"
                            placeholder="100"
                          />
                          <small className="text-muted">Optional, defaults to final</small>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted">Child Pricing</h6>
                    <Row>
                      <Col>
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
                      <Col>
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
                    </Row>
                  </Col>
                </Row>
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
              <Button color="primary" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bx bx-plus-circle me-2"></i>
                    Create Pricing Rule
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

const classifyRule = (rule) => {
  const conditions = rule.conditions || {}
  const hasConditions = Object.keys(conditions).some(k => 
    conditions[k] && (Array.isArray(conditions[k]) ? conditions[k].length > 0 : true)
  )
  
  if (!hasConditions) return "default"
  if (conditions.dateRanges && conditions.dateRanges.length > 0) return "date_specific"
  if (conditions.months && conditions.weekdays) return "complex"
  if (conditions.months) return "seasonal"
  if (conditions.weekdays) return "weekly"
  return "custom"
}

export default RuleBasedPricingBuilder

