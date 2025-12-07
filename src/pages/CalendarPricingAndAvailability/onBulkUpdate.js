import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  Row,
  Col,
  Label,
  Input,
  FormFeedback,
  Alert,
} from "reactstrap"
import classnames from "classnames"
import { useFormik, getIn } from "formik"
import * as Yup from "yup"
import { showToastError } from "helpers/toastBuilder"
import { useDispatch } from "react-redux"

const cleanObject = obj => {
  if (Array.isArray(obj)) {
    return obj.map(v => cleanObject(v))
  } else if (obj !== null && typeof obj === "object") {
    const cleaned = {}
    Object.keys(obj).forEach(key => {
      const value = cleanObject(obj[key])
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(
          typeof value === "object" &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0
        )
      ) {
        cleaned[key] = value
      }
    })
    return cleaned
  }
  return obj
}

const PricingType = ({ pricingType, priceIndex, validation, onRemove }) => {
  const pricingTypeOptions = [
    "Adult",
    "Child",
    "Senior",
    "Infant",
    "Student",
    "Family",
  ]

  const handleFieldChange = e => {
    const { name, value, type } = e.target
    const fieldPath = `pricingTypes[${priceIndex}].${name}`
    const parsedValue = type === "number" && value === "" ? null : value
    validation.setFieldValue(fieldPath, parsedValue)
  }

  const getFieldTouched = fieldName =>
    validation.touched.pricingTypes?.[priceIndex]?.[fieldName]
  const getFieldError = fieldName =>
    validation.errors.pricingTypes?.[priceIndex]?.[fieldName]

  return (
    <div className="border rounded p-3 mb-3">
      <Row className="align-items-end mb-3">
        <Col>
          <Label
            className="form-label"
            htmlFor={`pricingTypes[${priceIndex}].type`}
          >
            Pricing Type <span className="text-danger">*</span>
          </Label>
          <Input
            type="select"
            name="type"
            id={`pricingTypes[${priceIndex}].type`}
            value={pricingType.type ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={!!(getFieldTouched("type") && getFieldError("type"))}
          >
            <option value="">Select Type</option>
            {pricingTypeOptions.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Input>
          <FormFeedback>{getFieldError("type")}</FormFeedback>
        </Col>
        <Col xs="auto">
          <Button
            color="danger"
            onClick={() => onRemove(priceIndex)}
            className="btn-l mt-2"
            disabled={validation.values.pricingTypes.length === 1}
          >
            Remove
          </Button>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <Label className="form-label">Final Price *</Label>
          <Input
            name="finalPrice"
            type="number"
            value={pricingType.finalPrice ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={
              !!(getFieldTouched("finalPrice") && getFieldError("finalPrice"))
            }
          />
          <FormFeedback>{getFieldError("finalPrice")}</FormFeedback>
        </Col>
        <Col md={6}>
          <Label className="form-label">Original Price</Label>
          <Input
            name="originalPrice"
            type="number"
            value={pricingType.originalPrice ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={
              !!(
                getFieldTouched("originalPrice") &&
                getFieldError("originalPrice")
              )
            }
          />
          <FormFeedback>{getFieldError("originalPrice")}</FormFeedback>
        </Col>
        <Col md={6}>
          <Label className="form-label">Discount %</Label>
          <Input
            name="discount"
            type="number"
            value={pricingType.discount ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={
              !!(getFieldTouched("discount") && getFieldError("discount"))
            }
          />
          <FormFeedback>{getFieldError("discount")}</FormFeedback>
        </Col>
        <Col md={6}>
          <Label className="form-label">Min Age</Label>
          <Input
            name="minAge"
            type="number"
            value={pricingType.minAge ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={!!(getFieldTouched("minAge") && getFieldError("minAge"))}
          />
          <FormFeedback>{getFieldError("minAge")}</FormFeedback>
        </Col>
        <Col md={6}>
          <Label className="form-label">Max Age</Label>
          <Input
            name="maxAge"
            type="number"
            value={pricingType.maxAge ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={!!(getFieldTouched("maxAge") && getFieldError("maxAge"))}
          />
          <FormFeedback>{getFieldError("maxAge")}</FormFeedback>
        </Col>
        <Col md={6}>
          <Label className="form-label">Min Height (cm)</Label>
          <Input
            name="minHeight"
            type="number"
            value={pricingType.minHeight ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={
              !!(getFieldTouched("minHeight") && getFieldError("minHeight"))
            }
          />
          <FormFeedback>{getFieldError("minHeight")}</FormFeedback>
        </Col>
        <Col md={12}>
          <Label className="form-label">Description</Label>
          <Input
            name="description"
            type="textarea"
            rows="2"
            value={pricingType.description ?? ""}
            onChange={handleFieldChange}
            onBlur={validation.handleBlur}
            invalid={
              !!(getFieldTouched("description") && getFieldError("description"))
            }
          />
          <FormFeedback>{getFieldError("description")}</FormFeedback>
        </Col>
      </Row>
    </div>
  )
}

PricingType.propTypes = {
  pricingType: PropTypes.object.isRequired,
  priceIndex: PropTypes.number.isRequired,
  validation: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
}
const OnBulkUpdate = ({ isOpen, toggle, addDefaultPricing }) => {
  const [activeTab, setActiveTab] = useState("1")
  const dispatch = useDispatch()

  const initialPricingType = {
    type: "Adult",
    finalPrice: null,
    originalPrice: null,
    discount: null,
    minAge: null,
    maxAge: null,
    minHeight: null,
    description: "",
  }

  const initialSlot = {
    startTime: "",
    endTime: "",
    capacity: "",
    slotType: "",
    slotPricing: [{ type: "", finalPrice: "", originalPrice: "" }],
  }

  const pricingSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    finalPrice: Yup.number()
      .typeError("Price must be a number")
      .required("Final price is required")
      .nullable(),
    originalPrice: Yup.number()
      .typeError("Original price must be a number")
      .nullable(),
    discount: Yup.number().typeError("Discount must be a number").nullable(),
    minAge: Yup.number().typeError("Min age must be a number").nullable(),
    maxAge: Yup.number()
      .typeError("Max age must be a number")
      .nullable()
      .when("minAge", {
        is: minAge => minAge !== null,
        then: schema =>
          schema.min(Yup.ref("minAge"), "Max age must be greater than min age"),
      }),
    minHeight: Yup.number().typeError("Min height must be a number").nullable(),
    description: Yup.string(),
  })

  const [useTimeSlots, setUseTimeSlots] = useState(false)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      ruleTag: "",
      ruleName: "",
      priority: "",
      variant: "",
      currency: "",
      status: "",
      description: "",
      weekdays: [],
      months: [],
      dateRange: [],
      excludeDate: [],
      pricingTypes: [initialPricingType],
      slots: [initialSlot],
      isAvailable: "",
      createdBy: "",
      notes: "",
    },
    validationSchema: Yup.object({
      ruleTag: Yup.string().required("Please enter Rule Tag"),
      ruleName: Yup.string().required("Please enter Rule Name"),
      priority: Yup.number()
        .typeError("Priority must be a number")
        .required("Please enter priority"),
      variant: Yup.string().required("Please enter variant"),
      currency: Yup.string().required("Please enter currency"),
      status: Yup.string().required("Please enter status"),
      pricingTypes: Yup.array()
        .of(pricingSchema)
        .min(1, "At least one pricing type is required"),
    }),
    onSubmit: values => {
      const payload = {
        tag: values.ruleTag,
        name: values.ruleName,
        priority: Number(values.priority),
        conditions: {
          weekdays: values.weekdays?.map(Number) || [],
          months: values.months?.map(Number) || [],
          dateRanges:
            values.dateRange?.map(dr => ({
              startDate: dr.start,
              endDate: dr.end,
            })) || [],
          excludeDates: values.excludeDate || [],
        },
        dayPricing: useTimeSlots ? [] : [
          {
            currency: values.currency,
            prices: values.pricingTypes.map(pt => ({
              type: pt.type ? pt.type.toUpperCase() : "GUEST",
              finalPrice: pt.finalPrice ? Number(pt.finalPrice) : 0,
              originalPrice: pt.originalPrice ? Number(pt.originalPrice) : 0,
              discountPercent: pt.discount ? Number(pt.discount) : 0,
              ageRange: {
                min: pt.minAge ? Number(pt.minAge) : 0,
                max: pt.maxAge ? Number(pt.maxAge) : 100,
              },
              description: pt.description || "",
            })),
          },
        ],
        slots: useTimeSlots ? values.slots
          .filter(
            s =>
              s.startTime ||
              s.endTime ||
              s.capacity ||
              s.slotPricing.some(p => p.type || p.finalPrice || p.originalPrice)
          )
          .map(s => ({
            startTime: s.startTime,
            endTime: s.endTime,
            capacity: Number(s.capacity) || 0,
            slotType: s.slotType,
            pricing: [{
              currency: values.currency,
              prices: s.slotPricing.map(p => ({
                type: p.type ? p.type.toLowerCase() : "guest",
                finalPrice: Number(p.finalPrice) || 0,
                originalPrice: Number(p.originalPrice) || 0,
              })),
            }],
          })) : undefined,
        isAvailable: values.isAvailable === "available",
        description: values.description,
      }

      const cleanedPayload = cleanObject(payload, { keepEmptyArrays: true })
      console.log("🚀 Final Payload (Cleaned):", cleanedPayload)
      dispatch(addDefaultPricing(cleanedPayload))
      toggle()
    },
  })

  const addPricingType = () => {
    validation.setFieldValue("pricingTypes", [
      ...validation.values.pricingTypes,
      { ...initialPricingType },
    ])
  }

  const removePricingType = indexToRemove => {
    const newPricingTypes = validation.values.pricingTypes.filter(
      (_, index) => index !== indexToRemove
    )
    validation.setFieldValue("pricingTypes", newPricingTypes)
  }

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const handlePrevious = () => {
    setActiveTab((+activeTab - 1).toString())
  }

  const handleNext = () => {
    validation.validateForm().then(errors => {
      const currentTabFields = {
        1: ["ruleTag", "ruleName", "priority", "variant", "currency", "status"],
        2: ["weekdays", "months", "dateRange", "excludeDate"],
        3: ["pricingTypes"],
        4: ["slots"],
        5: ["isAvailable", "createdBy", "notes"],
      }

      const fieldsToCheck = currentTabFields[activeTab] || []
      const currentErrors = fieldsToCheck.some(field => getIn(errors, field))

      if (!currentErrors) {
        setActiveTab((+activeTab + 1).toString())
      } else {
        showToastError("please enter all required fields")
      }
    })
  }

  const updateSlotField = (slotIndex, field, value) => {
    const updatedSlots = validation.values.slots.map((s, i) =>
      i === slotIndex ? { ...s, [field]: value } : s
    )
    validation.setFieldValue("slots", updatedSlots)
  }

  const updateSlotPricingField = (slotIndex, priceIndex, field, value) => {
    const updatedSlots = validation.values.slots.map((s, i) => {
      if (i !== slotIndex) return s
      const updatedPricing = s.slotPricing.map((p, j) =>
        j === priceIndex ? { ...p, [field]: value } : p
      )
      return { ...s, slotPricing: updatedPricing }
    })
    validation.setFieldValue("slots", updatedSlots)
  }

  // ---- JSX ----
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle} tag="h4">
        Add New Pricing Rule
      </ModalHeader>
      <Form onSubmit={validation.handleSubmit}>
        <ModalBody>
          {/* Tabs */}
          <Nav tabs>
            {["1", "2", "3", "4", "5"].map(tab => (
              <NavItem key={tab}>
                <NavLink
                  className={classnames({ active: activeTab === tab })}
                  onClick={() => toggleTab(tab)}
                >
                  {tab === "1" && "Basic Info"}
                  {tab === "2" && "Conditions"}
                  {tab === "3" && "Pricing"}
                  {tab === "4" && "Time Slots"}
                  {tab === "5" && "Advanced"}
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          {/* Tab Content */}
          <TabContent activeTab={activeTab} className="mt-3">
            <TabPane tabId="1">
              <h5 className="mb-3">Basic Information</h5>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Rule Tag <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      name="ruleTag"
                      type="text"
                      placeholder="e.g default, weekend_premium, holiday_special"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.ruleTag || ""}
                      invalid={
                        !!(
                          validation.touched.ruleTag &&
                          validation.errors.ruleTag
                        )
                      }
                    />
                    <FormFeedback>{validation.errors.ruleTag}</FormFeedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Rule Name <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      name="ruleName"
                      type="text"
                      placeholder="e.g Default Daily Pricing"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.ruleName || ""}
                      invalid={
                        !!(
                          validation.touched.ruleName &&
                          validation.errors.ruleName
                        )
                      }
                    />
                    <FormFeedback>{validation.errors.ruleName}</FormFeedback>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Variant <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="variant"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.variant || ""}
                      invalid={
                        !!(
                          validation.touched.variant &&
                          validation.errors.variant
                        )
                      }
                    >
                      <option value="">Select Variant</option>
                      <option value="variant1">Variant 1</option>
                      <option value="variant2">Variant 2</option>
                    </Input>
                    <FormFeedback>{validation.errors.variant}</FormFeedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Priority <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      name="priority"
                      type="number"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.priority || ""}
                      invalid={
                        !!(
                          validation.touched.priority &&
                          validation.errors.priority
                        )
                      }
                    />
                    <FormFeedback>{validation.errors.priority}</FormFeedback>
                    <small className="text-muted">
                      Higher number = higher priority
                    </small>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Currency <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="currency"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.currency || ""}
                      invalid={
                        !!(
                          validation.touched.currency &&
                          validation.errors.currency
                        )
                      }
                    >
                      <option value="">Select Currency</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </Input>
                    <FormFeedback>{validation.errors.currency}</FormFeedback>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="form-label">
                      Status <span style={{ color: "red" }}>*</span>
                    </Label>
                    <Input
                      type="select"
                      name="status"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.status || ""}
                      invalid={
                        !!(
                          validation.touched.status && validation.errors.status
                        )
                      }
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Input>
                    <FormFeedback>{validation.errors.status}</FormFeedback>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div className="mb-3">
                    <Label className="form-label">Description</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      name="description"
                      placeholder="Describe when this pricing rule applies"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.description || ""}
                    />
                  </div>
                </Col>
              </Row>
            </TabPane>

            <TabPane tabId="2">
              <h5 className="mb-3">Rule Conditions</h5>
              <Row>
                <Col md={6}>
                  <h6>Weekdays</h6>
                  <Row>
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day, index) => (
                      <Col sm={6} key={index} className="mb-2">
                        <div className="form-check">
                          <Input
                            type="checkbox"
                            id={`weekday-${index}`}
                            name="weekdays"
                            value={index}
                            onChange={validation.handleChange}
                            checked={validation.values.weekdays.includes(
                              String(index)
                            )}
                            className="form-check-input"
                          />
                          <Label
                            htmlFor={`weekday-${index}`}
                            className="form-check-label"
                          >
                            {day}
                          </Label>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
                <Col md={6}>
                  <h6>Months</h6>
                  <Row>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <Col sm={6} key={index} className="mb-2">
                        <div className="form-check">
                          <Input
                            type="checkbox"
                            id={`month-${index}`}
                            name="months"
                            value={index + 1}
                            onChange={validation.handleChange}
                            checked={validation.values.months.includes(
                              String(index + 1)
                            )}
                            className="form-check-input"
                          />
                          <Label
                            htmlFor={`month-${index}`}
                            className="form-check-label"
                          >
                            {month}
                          </Label>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              <div className="mt-4">
                <h6>Date Ranges</h6>
                {validation.values.dateRange.length === 0 && (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() =>
                      validation.setFieldValue("dateRange", [
                        { start: "", end: "" },
                      ])
                    }
                  >
                    Add Date Range
                  </Button>
                )}
                {validation.values.dateRange.map((range, idx) => (
                  <Row key={idx} className="align-items-center mb-2">
                    <Col md={5}>
                      <Input
                        type="date"
                        value={range.start || ""}
                        onChange={e => {
                          const newRanges = [...validation.values.dateRange]
                          newRanges[idx].start = e.target.value
                          validation.setFieldValue("dateRange", newRanges)
                        }}
                      />
                    </Col>
                    <Col md={5}>
                      <Input
                        type="date"
                        value={range.end || ""}
                        onChange={e => {
                          const newRanges = [...validation.values.dateRange]
                          newRanges[idx].end = e.target.value
                          validation.setFieldValue("dateRange", newRanges)
                        }}
                      />
                    </Col>
                    <Col md={2} className="d-flex gap-1">
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => {
                          const newRanges = validation.values.dateRange.filter(
                            (_, i) => i !== idx
                          )
                          validation.setFieldValue("dateRange", newRanges)
                        }}
                      >
                        Remove
                      </Button>
                      {idx === validation.values.dateRange.length - 1 && (
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() =>
                            validation.setFieldValue("dateRange", [
                              ...validation.values.dateRange,
                              { start: "", end: "" },
                            ])
                          }
                        >
                          Add
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
              </div>

              <div className="mt-4">
                <h6>Exclude Dates</h6>
                {validation.values.excludeDate.length === 0 && (
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() =>
                      validation.setFieldValue("excludeDate", [""])
                    }
                  >
                    Add Exclude Date
                  </Button>
                )}
                {validation.values.excludeDate.map((date, idx) => (
                  <Row key={idx} className="align-items-center mb-2">
                    <Col md={10}>
                      <Input
                        type="date"
                        value={date || ""}
                        onChange={e => {
                          const newExcludes = [...validation.values.excludeDate]
                          newExcludes[idx] = e.target.value
                          validation.setFieldValue("excludeDate", newExcludes)
                        }}
                      />
                    </Col>
                    <Col md={2} className="d-flex gap-1">
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => {
                          const newExcludes =
                            validation.values.excludeDate.filter(
                              (_, i) => i !== idx
                            )
                          validation.setFieldValue("excludeDate", newExcludes)
                        }}
                      >
                        Remove
                      </Button>
                      {idx === validation.values.excludeDate.length - 1 && (
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() =>
                            validation.setFieldValue("excludeDate", [
                              ...validation.values.excludeDate,
                              "",
                            ])
                          }
                        >
                          Add
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}
              </div>
            </TabPane>

            <TabPane tabId="3">
              <h5 className="mb-3">Day Pricing</h5>
              <p className="fw-medium">Pricing Types</p>
              {validation.values.pricingTypes.map((pricingType, index) => (
                <PricingType
                  key={index}
                  priceIndex={index}
                  pricingType={pricingType}
                  validation={validation}
                  onRemove={removePricingType}
                />
              ))}
              <Button
                color="secondary"
                className="mt-3"
                onClick={addPricingType}
              >
                Add Pricing Type
              </Button>
              {typeof validation.errors.pricingTypes === "string" && (
                <FormFeedback className="d-block mt-3">
                  {validation.errors.pricingTypes}
                </FormFeedback>
              )}
            </TabPane>

            <TabPane tabId="4">
              <div className="mb-3">
                <div className="form-check form-switch" style={{ paddingLeft: "2.5em" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="bulkUseTimeSlots"
                    checked={useTimeSlots}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      setUseTimeSlots(newValue)
                      if (!newValue) {
                        validation.setFieldValue("slots", [initialSlot])
                      }
                    }}
                    style={{ 
                      cursor: "pointer", 
                      marginLeft: "-2.5em",
                      width: "2em",
                      height: "1.25em"
                    }}
                  />
                  <Label 
                    className="form-check-label" 
                    htmlFor="bulkUseTimeSlots" 
                    style={{ cursor: "pointer", userSelect: "none", paddingLeft: "0.5em" }}
                  >
                    Use Time Slots (instead of day pricing)
                  </Label>
                </div>
                <small className="text-muted d-block mt-1">
                  Enable time slots to set different pricing and capacity for specific time periods
                </small>
              </div>

              {useTimeSlots && (
                <>
                  {validation.values.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="border p-3 rounded mb-3">
                  <Row>
                    <Col md={6}>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={slot.startTime || ""}
                        onChange={e =>
                          updateSlotField(
                            slotIndex,
                            "startTime",
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col md={6}>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={slot.endTime || ""}
                        onChange={e =>
                          updateSlotField(slotIndex, "endTime", e.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={6}>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={slot.capacity || ""}
                        onChange={e =>
                          updateSlotField(slotIndex, "capacity", e.target.value)
                        }
                      />
                    </Col>
                    <Col md={6}>
                      <Label>Slot Type</Label>
                      <Input
                        type="text"
                        value={slot.slotType || ""}
                        onChange={e =>
                          updateSlotField(slotIndex, "slotType", e.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <div className="mt-3">
                    <h6>Pricing</h6>
                    {slot.slotPricing.map((pricing, pIndex) => (
                      <Row key={pIndex} className="align-items-end mb-2">
                        <Col md={4}>
                          <Label>Type</Label>
                          <Input
                            type="select"
                            value={pricing.type || ""}
                            onChange={e =>
                              updateSlotPricingField(
                                slotIndex,
                                pIndex,
                                "type",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Type</option>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                            <option value="Night">Night</option>
                          </Input>
                        </Col>
                        <Col md={4}>
                          <Label>Final Price</Label>
                          <Input
                            type="number"
                            value={pricing.finalPrice || ""}
                            onChange={e =>
                              updateSlotPricingField(
                                slotIndex,
                                pIndex,
                                "finalPrice",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Label>Original Price</Label>
                          <Input
                            type="number"
                            value={pricing.originalPrice || ""}
                            onChange={e =>
                              updateSlotPricingField(
                                slotIndex,
                                pIndex,
                                "originalPrice",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                      </Row>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => {
                        const updatedSlots = validation.values.slots.filter(
                          (_, i) => i !== slotIndex
                        )
                        validation.setFieldValue("slots", updatedSlots)
                      }}
                    >
                      Remove Slot
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => {
                        const updatedSlots = [...validation.values.slots]
                        updatedSlots[slotIndex].slotPricing.push({
                          type: "",
                          finalPrice: "",
                          originalPrice: "",
                        })
                        validation.setFieldValue("slots", updatedSlots)
                      }}
                    >
                      Add Pricing Row
                    </Button>
                  </div>
                </div>
              ))}

                  <Button
                    color="primary"
                    className="mt-2"
                    onClick={() => {
                      const newSlot = {
                        startTime: "",
                        endTime: "",
                        capacity: "",
                        slotType: "",
                        slotPricing: [
                          { type: "", finalPrice: "", originalPrice: "" },
                        ],
                      }
                      validation.setFieldValue("slots", [
                        ...validation.values.slots,
                        newSlot,
                      ])
                    }}
                  >
                    + Add Slot
                  </Button>
                </>
              )}

              {!useTimeSlots && (
                <Alert color="info" className="mt-3">
                  Time slots are disabled. Enable the toggle above to add time slots.
                </Alert>
              )}
            </TabPane>

            <TabPane tabId="5">
              <h5 className="mb-3">Advanced Settings</h5>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label htmlFor="isAvailable">Is Available</Label>
                    <Input
                      type="select"
                      name="isAvailable"
                      id="isAvailable"
                      value={validation.values.isAvailable || ""}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    >
                      <option value="">Select Availability</option>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </Input>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label htmlFor="createdBy">Created By</Label>
                    <Input
                      type="text"
                      name="createdBy"
                      id="createdBy"
                      placeholder="User ID"
                      value={validation.values.createdBy || ""}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <div className="mb-3">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      type="textarea"
                      name="notes"
                      id="notes"
                      rows="3"
                      placeholder="Additional notes about this pricing rule"
                      value={validation.values.notes || ""}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                    />
                  </div>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </ModalBody>

        <ModalFooter className="d-flex justify-content-between">
          <div>
            <Button
              type="button"
              color="secondary"
              disabled={activeTab === "1"}
              onClick={handlePrevious}
              className="me-2"
            >
              Previous
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handleNext}
              disabled={activeTab === "5"}
            >
              Next
            </Button>
          </div>
          <div>
            <Button
              type="button"
              color="light"
              onClick={toggle}
              className="me-2"
            >
              Close
            </Button>
            <Button type="submit" color="success">
              Save Rule
            </Button>
          </div>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

OnBulkUpdate.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
}

export default OnBulkUpdate
