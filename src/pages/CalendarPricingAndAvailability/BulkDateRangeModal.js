import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Label,
  Input,
  FormGroup,
  Alert,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
} from "reactstrap"
import { DatePicker, Tabs } from "antd"
import dayjs from "dayjs"
import Switch from "react-switch"
import { bulkDatePricingRequest } from "store/tickyourlist/travelTourGroup/action"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import PricingForm from "pages/tickyourlist/TravelTourGroup/PricingForm"

const { RangePicker } = DatePicker

// Customer types available
const CUSTOMER_TYPES = [
  { value: "adult", label: "Adult" },
  { value: "child", label: "Child" },
  { value: "guest", label: "Guest" },
  { value: "youth", label: "Youth" },
  { value: "infant", label: "Infant" },
  { value: "senior", label: "Senior" },
  { value: "family", label: "Family" },
  { value: "couple", label: "Couple" },
]

/**
 * Bulk Date Range Pricing Modal
 * Add pricing for multiple dates (2-3 days or more) at once
 * Includes ALL fields from the schema: all customer types, pricing fields, slots, etc.
 */
const BulkDateRangeModal = ({ isOpen, toggle, variantId, variantName, onSuccess }) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState("bulk")
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [useTimeSlots, setUseTimeSlots] = useState(false)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedPricingTypes, setSelectedPricingTypes] = useState(["adult"])
  const [selectedSlotPricingTypes, setSelectedSlotPricingTypes] = useState(["adult"])

  const validationSchema = Yup.object().shape({
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().required("End date is required").min(Yup.ref('startDate'), "End date must be after start date"),
    isAvailable: Yup.boolean(),
  })

  const getInitialValues = () => {
    const initialPrices = {}
    CUSTOMER_TYPES.forEach(type => {
      initialPrices[`${type.value}FinalPrice`] = 0
      initialPrices[`${type.value}OriginalPrice`] = 0
      initialPrices[`${type.value}DiscountPercent`] = 0
      initialPrices[`${type.value}SurchargePercent`] = 0
      initialPrices[`${type.value}AgeMin`] = ""
      initialPrices[`${type.value}AgeMax`] = ""
      initialPrices[`${type.value}MinHeight`] = ""
      initialPrices[`${type.value}Description`] = ""
    })

    return {
      startDate: null,
      endDate: null,
      isAvailable: true,
      reason: "",
      currency: "USD",
      dayCapacity: 0,
      bookedCapacity: 0,
      notes: "",
      ...initialPrices,
    }
  }

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates)
    } else {
      setDateRange(null)
    }
  }

  const calculateDaysInRange = () => {
    if (!dateRange || dateRange.length !== 2) return 0
    const start = dayjs(dateRange[0])
    const end = dayjs(dateRange[1])
    return end.diff(start, 'day') + 1
  }

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
        startTime: "09:00",
        endTime: "12:00",
        capacity: 0,
        bookedCapacity: 0,
        slotType: "morning",
        isAvailable: true,
        notes: "",
        // Prices for selected customer types only
        ...selectedSlotPricingTypes.reduce((acc, type) => {
          acc[`${type}FinalPrice`] = 0
          acc[`${type}OriginalPrice`] = 0
          acc[`${type}DiscountPercent`] = 0
          acc[`${type}SurchargePercent`] = 0
          acc[`${type}AgeMin`] = ""
          acc[`${type}AgeMax`] = ""
          acc[`${type}MinHeight`] = ""
          acc[`${type}Description`] = ""
          return acc
        }, {})
    }])
    setUseTimeSlots(true)
  }

  const removeTimeSlot = (index) => {
    const newSlots = timeSlots.filter((_, i) => i !== index)
    setTimeSlots(newSlots)
    if (newSlots.length === 0) {
      setUseTimeSlots(false)
    }
  }

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setTimeSlots(newSlots)
  }

  const buildPriceObject = (type, values, prefix = "") => {
    const finalPrice = parseFloat(values[`${prefix}${type}FinalPrice`] || 0)
    const originalPrice = parseFloat(values[`${prefix}${type}OriginalPrice`] || finalPrice)
    const discountPercent = parseFloat(values[`${prefix}${type}DiscountPercent`] || 0)
    const surchargePercent = parseFloat(values[`${prefix}${type}SurchargePercent`] || 0)
    const ageMin = values[`${prefix}${type}AgeMin`]
    const ageMax = values[`${prefix}${type}AgeMax`]
    const minHeight = values[`${prefix}${type}MinHeight`]
    const description = values[`${prefix}${type}Description`]

    if (finalPrice <= 0) return null

    const priceObj = {
      type: typeValue.toUpperCase(),
      finalPrice,
    }

    if (originalPrice && originalPrice !== finalPrice) priceObj.originalPrice = originalPrice
    if (discountPercent > 0) priceObj.discountPercent = discountPercent
    if (surchargePercent > 0) priceObj.surchargePercent = surchargePercent
    if (ageMin || ageMax) {
      priceObj.ageRange = {}
      if (ageMin) priceObj.ageRange.min = parseInt(ageMin)
      if (ageMax) priceObj.ageRange.max = parseInt(ageMax)
    }
    if (minHeight) priceObj.minHeight = minHeight
    if (description) priceObj.description = description

    return priceObj
  }

  const handleSubmit = async (values) => {
    if (!dateRange || dateRange.length !== 2) {
      showToastError("Please select a date range")
      return
    }

    try {
      setLoading(true)

      const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD')
      const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD')

      // Build pricing data structure
      const pricingData = {
        isAvailable: values.isAvailable,
        ...(values.reason ? { reason: values.reason } : {}),
        ...(values.dayCapacity > 0 ? { dayCapacity: values.dayCapacity } : {}),
        ...(values.bookedCapacity > 0 ? { bookedCapacity: values.bookedCapacity } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
      }

      if (useTimeSlots && timeSlots.length > 0) {
        // Build slots with all pricing details (only for selected types)
        const selectedTypes = selectedSlotPricingTypes.length > 0 ? selectedSlotPricingTypes : ["adult"]
        pricingData.slots = timeSlots.map(slot => {
          const slotPrices = selectedTypes
            .map(type => buildPriceObject(type, slot, ""))
            .filter(price => price !== null)

          const slotObj = {
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity: slot.capacity || 0,
            bookedCapacity: slot.bookedCapacity || 0,
            slotType: slot.slotType || "",
            isAvailable: slot.isAvailable !== false,
            ...(slot.notes ? { notes: slot.notes } : {}),
            pricing: [{
              currency: values.currency,
              prices: slotPrices
            }]
          }

          return slotObj
        })
      } else {
        // Build day pricing with selected customer types only
        const selectedTypes = selectedPricingTypes.length > 0 ? selectedPricingTypes : ["adult"]
        const dayPrices = selectedTypes
          .map(type => buildPriceObject(type, values, ""))
          .filter(price => price !== null)

        if (dayPrices.length > 0) {
          pricingData.dayPricing = [{
            currency: values.currency,
            prices: dayPrices
          }]
        }
      }

      dispatch(bulkDatePricingRequest(
        variantId,
        { startDate, endDate },
        pricingData,
        'create'
      ))

      setTimeout(() => {
        toggle()
        setLoading(false)
        setDateRange(null)
        setTimeSlots([])
        setUseTimeSlots(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 500)
    } catch (error) {
      console.error("Error saving bulk date pricing:", error)
      showToastError("Failed to save bulk date pricing")
      setLoading(false)
    }
  }

  const daysCount = calculateDaysInRange()

  const renderCustomerTypePricingFields = (values, handleChange, errors, touched, prefix = "", selectedTypes = selectedPricingTypes) => {
    return selectedTypes.map(type => {
      const typeInfo = CUSTOMER_TYPES.find(t => t.value === type) || { value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }
      return (
      <Card key={type} className="mb-3">
        <CardHeader className="bg-light">
          <h6 className="mb-0" style={{ textTransform: "capitalize" }}>
            {typeInfo.label} Pricing
            {selectedTypes.length === 1 && selectedTypes[0] === type && <span className="text-danger ms-1">*</span>}
          </h6>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Final Price ({values.currency || "USD"}) 
                  {selectedTypes.length === 1 && selectedTypes[0] === type && <span className="text-danger"> *</span>}
                </Label>
                <Input
                  type="number"
                  name={`${prefix}${type}FinalPrice`}
                  value={values[`${prefix}${type}FinalPrice`] || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Original Price ({values.currency || "USD"})</Label>
                <Input
                  type="number"
                  name={`${prefix}${type}OriginalPrice`}
                  value={values[`${prefix}${type}OriginalPrice`] || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Discount Percent (%)</Label>
                <Input
                  type="number"
                  name={`${prefix}${type}DiscountPercent`}
                  value={values[`${prefix}${type}DiscountPercent`] || 0}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Surcharge Percent (%)</Label>
                <Input
                  type="number"
                  name={`${prefix}${type}SurchargePercent`}
                  value={values[`${prefix}${type}SurchargePercent`] || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <FormGroup>
                <Label>Age Range - Min</Label>
                <Input
                  type="number"
                  name={`${prefix}${type}AgeMin`}
                  value={values[`${prefix}${type}AgeMin`] || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 12"
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Age Range - Max</Label>
                <Input
                  type="number"
                  name={`${prefix}${type}AgeMax`}
                  value={values[`${prefix}${type}AgeMax`] || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 65"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Min Height</Label>
                <Input
                  type="text"
                  name={`${prefix}${type}MinHeight`}
                  value={values[`${prefix}${type}MinHeight`] || ""}
                  onChange={handleChange}
                  placeholder="e.g., 120cm or 48in"
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label>Description</Label>
                <Input
                  type="textarea"
                  name={`${prefix}${type}Description`}
                  value={values[`${prefix}${type}Description`] || ""}
                  onChange={handleChange}
                  rows="2"
                  placeholder={`Additional details for ${typeInfo.label} pricing`}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
      )
    })
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" style={{ maxWidth: '95%' }}>
      <ModalHeader toggle={toggle}>
        Pricing Management
        {variantName && (
          <small className="d-block text-muted mt-1">{variantName}</small>
        )}
      </ModalHeader>
      <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'bulk',
              label: 'Bulk Date Range Pricing',
            },
            {
              key: 'rules',
              label: 'Manage Pricing Rules',
            },
          ]}
        />

        {/* Tab Content */}
        {activeTab === 'bulk' && (
          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, handleChange }) => (
              <Form>
                <div className="mt-3">
                  <Alert color="info" className="mb-3">
                    <i className="bx bx-info-circle me-2"></i>
                    This will apply the same pricing to all dates in the selected range.
                    {daysCount > 0 && (
                      <strong className="d-block mt-2">
                        <Badge color="primary">{daysCount}</Badge> date{daysCount !== 1 ? 's' : ''} will be updated
                      </strong>
                    )}
                  </Alert>

              {/* Date Range */}
              <Row className="mb-3">
                <Col md={12}>
                  <FormGroup>
                    <Label>
                      Date Range <span className="text-danger">*</span>
                    </Label>
                    <RangePicker
                      className="w-100"
                      format="YYYY-MM-DD"
                      onChange={handleDateRangeChange}
                      value={dateRange}
                      disabledDate={(current) => {
                        return current && current < dayjs().startOf('day')
                      }}
                    />
                    {!dateRange && (
                      <small className="text-muted d-block mt-1">
                        Select a start and end date to apply pricing to all dates in the range
                      </small>
                    )}
                    {daysCount > 0 && (
                      <small className="text-success d-block mt-1">
                        ✓ {daysCount} date{daysCount !== 1 ? 's' : ''} selected
                      </small>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              {/* Availability and Basic Info */}
              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <Label>Currency</Label>
                    <Input
                      type="select"
                      name="currency"
                      value={values.currency}
                      onChange={handleChange}
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>
                      Available <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      name="isAvailable"
                      value={values.isAvailable}
                      onChange={(e) => setFieldValue('isAvailable', e.target.value === 'true')}
                    >
                      <option value={true}>Available</option>
                      <option value={false}>Not Available</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Reason (if not available)</Label>
                    <Input
                      type="text"
                      name="reason"
                      value={values.reason}
                      onChange={handleChange}
                      placeholder="e.g., Holiday, Maintenance"
                      disabled={values.isAvailable}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <FormGroup>
                    <Label>Day Capacity</Label>
                    <Input
                      type="number"
                      name="dayCapacity"
                      value={values.dayCapacity}
                      onChange={handleChange}
                      min="0"
                    />
                    <small className="text-muted">Leave 0 for unlimited</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Booked Capacity</Label>
                    <Input
                      type="number"
                      name="bookedCapacity"
                      value={values.bookedCapacity}
                      onChange={handleChange}
                      min="0"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <hr />

              {/* Day Pricing vs Time Slots Toggle */}
              <Row className="mb-3">
                <Col md={12}>
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
                <Card className="mb-3">
                  <CardHeader className="bg-primary text-white">
                    <h6 className="mb-0">Day Pricing</h6>
                  </CardHeader>
                  <CardBody>
                    {/* Customer Type Selection Buttons */}
                    <FormGroup className="mb-3">
                      <Label>Select Pricing Types *</Label>
                      <div className="d-flex flex-wrap gap-2">
                        {CUSTOMER_TYPES.map(type => {
                          const isChecked = selectedPricingTypes.includes(type.value)
                          const canRemove = selectedPricingTypes.length > 1

                          return (
                            <Button
                              key={type.value}
                              color={isChecked ? "primary" : "outline-secondary"}
                              size="sm"
                              className="rounded-pill px-3"
                              disabled={!canRemove && isChecked}
                              onClick={() => {
                                if (!isChecked) {
                                  // Adding - always allow
                                  setSelectedPricingTypes(prev => {
                                    if (!prev.includes(type.value)) {
                                      return [...prev, type.value]
                                    }
                                    return prev
                                  })
                                } else {
                                  // Removing - only if allowed
                                  if (canRemove) {
                                    setSelectedPricingTypes(prev => prev.filter(t => t !== type.value))
                                  }
                                }
                              }}
                              style={{ textTransform: "capitalize" }}
                            >
                              {type.label}
                              {isChecked && <i className="bx bx-check ms-1"></i>}
                            </Button>
                          )
                        })}
                      </div>
                      <small className="text-muted d-block mt-2">
                        Select pricing types. At least one type must be selected and have a price &gt; 0.
                      </small>
                    </FormGroup>

                    {/* Pricing Fields for Selected Types Only */}
                    {renderCustomerTypePricingFields(values, handleChange, errors, touched, "", selectedPricingTypes)}
                  </CardBody>
                </Card>
              )}

              {useTimeSlots && (
                <Card className="mb-3">
                  <CardHeader className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Time Slots</h6>
                      <Button
                        color="light"
                        size="sm"
                        onClick={addTimeSlot}
                      >
                        <i className="bx bx-plus me-1"></i>
                        Add Slot
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {timeSlots.length === 0 ? (
                      <Alert color="info">No time slots added. Click "Add Slot" to create one.</Alert>
                    ) : (
                      <div>
                        {/* Customer Type Selection for All Slots (Shared) */}
                        <FormGroup className="mb-3">
                          <Label>Select Pricing Types for All Slots *</Label>
                          <div className="d-flex flex-wrap gap-2">
                            {CUSTOMER_TYPES.map(type => {
                              const isChecked = selectedSlotPricingTypes.includes(type.value)
                              const canRemove = selectedSlotPricingTypes.length > 1

                              return (
                                <Button
                                  key={type.value}
                                  color={isChecked ? "primary" : "outline-secondary"}
                                  size="sm"
                                  className="rounded-pill px-3"
                                  disabled={!canRemove && isChecked}
                                  onClick={() => {
                                    if (!isChecked) {
                                      setSelectedSlotPricingTypes(prev => {
                                        if (!prev.includes(type.value)) {
                                          return [...prev, type.value]
                                        }
                                        return prev
                                      })
                                    } else {
                                      if (canRemove) {
                                        setSelectedSlotPricingTypes(prev => prev.filter(t => t !== type.value))
                                      }
                                    }
                                  }}
                                  style={{ textTransform: "capitalize" }}
                                >
                                  {type.label}
                                  {isChecked && <i className="bx bx-check ms-1"></i>}
                                </Button>
                              )
                            })}
                          </div>
                          <small className="text-muted d-block mt-2">
                            Select pricing types that apply to all slots. At least one type must be selected.
                          </small>
                        </FormGroup>

                        {timeSlots.map((slot, slotIndex) => (
                          <Card key={slotIndex} className="mb-3">
                            <CardHeader className="bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Slot {slotIndex + 1}</h6>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => removeTimeSlot(slotIndex)}
                                >
                                  <i className="bx bx-trash me-1"></i>
                                  Remove
                                </Button>
                              </div>
                            </CardHeader>
                            <CardBody>
                              <Row className="mb-3">
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>Start Time</Label>
                                    <Input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) => updateTimeSlot(slotIndex, "startTime", e.target.value)}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>End Time</Label>
                                    <Input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) => updateTimeSlot(slotIndex, "endTime", e.target.value)}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>Slot Type</Label>
                                    <Input
                                      type="select"
                                      value={slot.slotType || ""}
                                      onChange={(e) => updateTimeSlot(slotIndex, "slotType", e.target.value)}
                                    >
                                      <option value="morning">Morning</option>
                                      <option value="afternoon">Afternoon</option>
                                      <option value="evening">Evening</option>
                                    </Input>
                                  </FormGroup>
                                </Col>
                                <Col md={3}>
                                  <FormGroup>
                                    <Label>Available</Label>
                                    <Input
                                      type="checkbox"
                                      checked={slot.isAvailable !== false}
                                      onChange={(e) => updateTimeSlot(slotIndex, "isAvailable", e.target.checked)}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row className="mb-3">
                                <Col md={6}>
                                  <FormGroup>
                                    <Label>Slot Capacity</Label>
                                    <Input
                                      type="number"
                                      value={slot.capacity || 0}
                                      onChange={(e) => updateTimeSlot(slotIndex, "capacity", parseInt(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md={6}>
                                  <FormGroup>
                                    <Label>Booked Capacity</Label>
                                    <Input
                                      type="number"
                                      value={slot.bookedCapacity || 0}
                                      onChange={(e) => updateTimeSlot(slotIndex, "bookedCapacity", parseInt(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <FormGroup className="mb-3">
                                <Label>Slot Notes</Label>
                                <Input
                                  type="textarea"
                                  value={slot.notes || ""}
                                  onChange={(e) => updateTimeSlot(slotIndex, "notes", e.target.value)}
                                  rows="2"
                                />
                              </FormGroup>
                              {/* Pricing Fields for Selected Types Only */}
                              {renderCustomerTypePricingFields(
                                slot,
                                (e) => updateTimeSlot(slotIndex, e.target.name, e.target.value),
                                {},
                                {},
                                "",
                                selectedSlotPricingTypes
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

                  {/* Notes */}
                  <FormGroup className="mb-3">
                    <Label>Notes (Optional)</Label>
                    <Input
                      type="textarea"
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add any notes about this date range pricing..."
                    />
                  </FormGroup>
                </div>
                <ModalFooter>
                  <Button color="secondary" onClick={toggle} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={loading || !dateRange || daysCount === 0}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-save me-2"></i>
                        Apply to {daysCount > 0 ? daysCount : 'Selected'} Date{daysCount !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        )}

        {activeTab === 'rules' && (
          <div className="mt-3">
            {variantId ? (
              <PricingForm
                variantId={variantId}
                variantName={variantName}
                onClose={() => {
                  // Refresh pricing rules after changes
                  if (onSuccess) {
                    onSuccess()
                  }
                }}
              />
            ) : (
              <Alert color="warning">Please select a variant first</Alert>
            )}
          </div>
        )}
      </ModalBody>
      {activeTab === 'rules' && (
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}

export default BulkDateRangeModal
