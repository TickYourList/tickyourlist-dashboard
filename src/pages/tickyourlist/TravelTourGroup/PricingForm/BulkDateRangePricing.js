import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import {
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
} from "reactstrap"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import Switch from "react-switch"
import { bulkDatePricingRequest, saveDatePricingRequest, fetchDatePricingRequest } from "store/tickyourlist/travelTourGroup/action"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"

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
 * Bulk Date Range Pricing Component
 * Add pricing for multiple dates (2-3 days or more) at once
 * Includes ALL fields from the availability schema: all customer types, pricing fields, slots, etc.
 */
const BulkDateRangePricing = ({ variantId, variantName, onSuccess }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [selectionMode, setSelectionMode] = useState("range") // "single", "range", or "multiple"
  const [dateRange, setDateRange] = useState(null)
  const [singleDate, setSingleDate] = useState(null)
  const [multipleDates, setMultipleDates] = useState([])
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

  const handleSingleDateChange = (date) => {
    setSingleDate(date)
  }

  const [tempDateForMultiple, setTempDateForMultiple] = useState(null)

  const handleTempDateChange = (date) => {
    setTempDateForMultiple(date)
  }

  const addDateToMultiple = () => {
    if (!tempDateForMultiple) return
    const dateStr = dayjs(tempDateForMultiple).format('YYYY-MM-DD')
    if (!multipleDates.some(d => dayjs(d).format('YYYY-MM-DD') === dateStr)) {
      setMultipleDates([...multipleDates, tempDateForMultiple].sort((a, b) => dayjs(a).unix() - dayjs(b).unix()))
    }
    setTempDateForMultiple(null)
  }

  const removeDateFromMultiple = (dateToRemove) => {
    setMultipleDates(multipleDates.filter(d => dayjs(d).format('YYYY-MM-DD') !== dayjs(dateToRemove).format('YYYY-MM-DD')))
  }

  const calculateDaysCount = () => {
    if (selectionMode === "single") {
      return singleDate ? 1 : 0
    } else if (selectionMode === "multiple") {
      return multipleDates.length
    } else {
      if (!dateRange || dateRange.length !== 2) return 0
      const start = dayjs(dateRange[0])
      const end = dayjs(dateRange[1])
      return end.diff(start, 'day') + 1
    }
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
    // Handle both object type (from slot) and string type (from selectedPricingTypes)
    const typeValue = typeof type === 'object' ? type.value : type
    const finalPrice = parseFloat(values[`${prefix}${typeValue}FinalPrice`] || 0)
    const originalPrice = parseFloat(values[`${prefix}${typeValue}OriginalPrice`] || finalPrice)
    const discountPercent = parseFloat(values[`${prefix}${typeValue}DiscountPercent`] || 0)
    const surchargePercent = parseFloat(values[`${prefix}${typeValue}SurchargePercent`] || 0)
    const ageMin = values[`${prefix}${typeValue}AgeMin`]
    const ageMax = values[`${prefix}${typeValue}AgeMax`]
    const minHeight = values[`${prefix}${typeValue}MinHeight`]
    const description = values[`${prefix}${typeValue}Description`]

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
    // Validate date selection based on mode
    if (selectionMode === "single") {
      if (!singleDate) {
        showToastError("Please select a date")
        return
      }
    } else if (selectionMode === "multiple") {
      if (!multipleDates || multipleDates.length === 0) {
        showToastError("Please select at least one date")
        return
      }
    } else {
      if (!dateRange || dateRange.length !== 2) {
        showToastError("Please select a date range")
        return
      }
    }

    try {
      setLoading(true)

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

      // Use appropriate API based on selection mode
      if (selectionMode === "single") {
        // Single date insert - use saveDatePricingRequest
        const date = dayjs(singleDate).format('YYYY-MM-DD')
        dispatch(saveDatePricingRequest(variantId, date, pricingData))

        // Refresh date pricing after successful save
        dispatch(fetchDatePricingRequest({
          variantId,
          date: date
        }))
      } else if (selectionMode === "multiple") {
        // Multiple specific dates - call single API for each date
        multipleDates.forEach(date => {
          const dateStr = dayjs(date).format('YYYY-MM-DD')
          dispatch(saveDatePricingRequest(variantId, dateStr, pricingData))
        })
        
        // Refresh date pricing for the first date after successful save
        if (multipleDates.length > 0) {
          const firstDate = dayjs(multipleDates[0]).format('YYYY-MM-DD')
          dispatch(fetchDatePricingRequest({
            variantId,
            date: firstDate
          }))
        }
      } else {
        // Bulk date range insert - use bulkDatePricingRequest
        const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD')
        const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD')
        
        dispatch(bulkDatePricingRequest(
          variantId,
          { startDate, endDate },
          pricingData,
          'create'
        ))

        // Refresh date pricing after successful save
        const today = new Date()
        dispatch(fetchDatePricingRequest({
          variantId,
          date: today.toISOString().split('T')[0]
        }))
      }

      setTimeout(() => {
        setLoading(false)
        setDateRange(null)
        setSingleDate(null)
        setMultipleDates([])
        setTempDateForMultiple(null)
        setTimeSlots([])
        setUseTimeSlots(false)
        showToastSuccess(`Pricing applied successfully to ${calculateDaysCount()} date${calculateDaysCount() !== 1 ? 's' : ''}!`)
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

  const daysCount = calculateDaysCount()

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
    <div>
      <Alert color="info" className="mb-3">
        <i className="bx bx-info-circle me-2"></i>
        {selectionMode === "single" 
          ? "Select a single date to apply pricing to that specific day."
          : selectionMode === "multiple"
          ? "Select multiple specific dates (not necessarily consecutive) to apply pricing."
          : "Select a date range to apply the same pricing to all dates in the range."}
        {daysCount > 0 && (
          <strong className="d-block mt-2">
            <Badge color="primary">{daysCount}</Badge> date{daysCount !== 1 ? 's' : ''} will be updated
          </strong>
        )}
      </Alert>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange }) => (
          <Form>
            {/* Selection Mode Toggle */}
            <Row className="mb-3">
              <Col md={12}>
                <FormGroup>
                  <Label>Selection Mode</Label>
                  <div className="d-flex gap-2">
                    <Button
                      color={selectionMode === "single" ? "primary" : "outline-primary"}
                      onClick={() => {
                        setSelectionMode("single")
                        setDateRange(null)
                        setMultipleDates([])
                        setTempDateForMultiple(null)
                      }}
                    >
                      Single Date
                    </Button>
                    <Button
                      color={selectionMode === "multiple" ? "primary" : "outline-primary"}
                      onClick={() => {
                        setSelectionMode("multiple")
                        setSingleDate(null)
                        setDateRange(null)
                        setTempDateForMultiple(null)
                      }}
                    >
                      Multiple Dates
                    </Button>
                    <Button
                      color={selectionMode === "range" ? "primary" : "outline-primary"}
                      onClick={() => {
                        setSelectionMode("range")
                        setSingleDate(null)
                        setMultipleDates([])
                        setTempDateForMultiple(null)
                      }}
                    >
                      Date Range
                    </Button>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            {/* Date Selection */}
            <Row className="mb-3">
              <Col md={12}>
                <FormGroup>
                  <Label>
                    {selectionMode === "single" 
                      ? "Select Date" 
                      : selectionMode === "multiple"
                      ? "Select Multiple Dates"
                      : "Date Range"} <span className="text-danger">*</span>
                  </Label>
                  {selectionMode === "single" ? (
                    <>
                      <DatePicker
                        className="w-100"
                        format="YYYY-MM-DD"
                        onChange={handleSingleDateChange}
                        value={singleDate}
                        disabledDate={(current) => {
                          return current && current < dayjs().startOf('day')
                        }}
                        placeholder="Select a date"
                      />
                      {!singleDate && (
                        <small className="text-muted d-block mt-1">
                          Select a single date to apply pricing to that day
                        </small>
                      )}
                      {singleDate && (
                        <small className="text-success d-block mt-1">
                          ✓ 1 date selected: {dayjs(singleDate).format('YYYY-MM-DD')}
                        </small>
                      )}
                    </>
                  ) : selectionMode === "multiple" ? (
                    <>
                      <Row>
                        <Col md={8}>
                          <DatePicker
                            className="w-100"
                            format="YYYY-MM-DD"
                            onChange={handleTempDateChange}
                            value={tempDateForMultiple}
                            disabledDate={(current) => {
                              return current && current < dayjs().startOf('day')
                            }}
                            placeholder="Select a date to add"
                          />
                        </Col>
                        <Col md={4}>
                          <Button
                            color="primary"
                            className="w-100"
                            onClick={addDateToMultiple}
                            disabled={!tempDateForMultiple}
                          >
                            <i className="bx bx-plus me-1"></i>
                            Add Date
                          </Button>
                        </Col>
                      </Row>
                      {multipleDates.length === 0 && (
                        <small className="text-muted d-block mt-1">
                          Select dates individually and click "Add Date" to build your list
                        </small>
                      )}
                      {multipleDates.length > 0 && (
                        <>
                          <small className="text-success d-block mt-2">
                            ✓ {multipleDates.length} date{multipleDates.length !== 1 ? 's' : ''} selected:
                          </small>
                          <div className="mt-2 d-flex flex-wrap gap-2">
                            {multipleDates.map((date, idx) => (
                              <Badge key={idx} color="info" style={{ fontSize: '0.875rem', padding: '0.5rem' }}>
                                {dayjs(date).format('YYYY-MM-DD')}
                                <button
                                  type="button"
                                  className="ms-2 btn-close btn-close-white"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    removeDateFromMultiple(date)
                                  }}
                                  aria-label="Remove"
                                />
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
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
                                setSelectedPricingTypes(prev => {
                                  if (!prev.includes(type.value)) {
                                    return [...prev, type.value]
                                  }
                                  return prev
                                })
                              } else {
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

            <div className="text-end">
              <Button
                type="submit"
                color="primary"
                disabled={loading || daysCount === 0 || 
                  (selectionMode === "single" ? !singleDate : 
                   selectionMode === "multiple" ? multipleDates.length === 0 : 
                   !dateRange)}
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
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default BulkDateRangePricing

