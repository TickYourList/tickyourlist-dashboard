import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field } from "formik"
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
  Badge,
  Table,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap"
import {
  fetchDatePricingRequest,
  saveDatePricingRequest,
} from "store/tickyourlist/travelTourGroup/action"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"

/**
 * Date Editor Modal Component
 * Edit pricing, availability, and time slots for a specific date
 */
const DateEditorModal = ({ isOpen, toggle, variantId, selectedDate, variantName }) => {
  const dispatch = useDispatch()
  const [existingDatePricing, setExistingDatePricing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState([])
  const [useTimeSlots, setUseTimeSlots] = useState(false)

  const datePricing = useSelector(state => state.tourGroup?.datePricing || [])

  // Fetch existing date pricing when modal opens
  useEffect(() => {
    if (isOpen && selectedDate && variantId) {
      setLoading(true)
      dispatch(fetchDatePricingRequest({ variantId, date: selectedDate }))
      
      // Find existing pricing for this date
      const dateStr = new Date(selectedDate).toISOString().split('T')[0]
      const existing = datePricing.find(dp => {
        const dpDate = dp.date ? new Date(dp.date).toISOString().split('T')[0] : null
        return dpDate === dateStr
      })
      
      if (existing) {
        setExistingDatePricing(existing)
        setTimeSlots(existing.slots || [])
        setUseTimeSlots(existing.slots && existing.slots.length > 0)
      } else {
        setExistingDatePricing(null)
        setTimeSlots([])
        setUseTimeSlots(false)
      }
      setLoading(false)
    }
  }, [isOpen, selectedDate, variantId, dispatch, datePricing])

  // Initialize form values
  const getInitialValues = () => {
    if (existingDatePricing) {
      const usdPricing = existingDatePricing.dayPricing?.find(p => p.currency === "USD") || 
                        existingDatePricing.dayPricing?.[0] || { prices: [] }
      const adultPrice = usdPricing.prices?.find(p => p.type === "adult" || p.type === "ADULT") || {}
      const childPrice = usdPricing.prices?.find(p => p.type === "child" || p.type === "CHILD") || {}
      
      return {
        isAvailable: existingDatePricing.isAvailable !== false,
        reason: existingDatePricing.reason || "",
        notes: existingDatePricing.notes || "",
        dayCapacity: existingDatePricing.dayCapacity || 0,
        bookedCapacity: existingDatePricing.bookedCapacity || 0,
        
        // Day pricing (if not using time slots)
        useDayPricing: !useTimeSlots,
        currency: usdPricing.currency || "USD",
        adultFinalPrice: adultPrice.finalPrice || 0,
        adultOriginalPrice: adultPrice.originalPrice || adultPrice.finalPrice || 0,
        childFinalPrice: childPrice.finalPrice || 0,
        childOriginalPrice: childPrice.originalPrice || childPrice.finalPrice || 0,
        infantFinalPrice: 0,
        infantOriginalPrice: 0,
      }
    }
    
    return {
      isAvailable: true,
      reason: "",
      notes: "",
      dayCapacity: 0,
      bookedCapacity: 0,
      useDayPricing: true,
      currency: "USD",
      adultFinalPrice: 0,
      adultOriginalPrice: 0,
      childFinalPrice: 0,
      childOriginalPrice: 0,
      infantFinalPrice: 0,
      infantOriginalPrice: 0,
    }
  }

  const validationSchema = Yup.object().shape({
    adultFinalPrice: Yup.number().min(0, "Price must be non-negative"),
    childFinalPrice: Yup.number().min(0, "Price must be non-negative"),
    infantFinalPrice: Yup.number().min(0, "Price must be non-negative"),
    dayCapacity: Yup.number().min(0, "Capacity must be non-negative"),
    bookedCapacity: Yup.number().min(0, "Booked capacity must be non-negative"),
  })

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      // Build dayPricing structure
      const dayPricing = values.useDayPricing ? [{
        currency: values.currency,
        prices: [
          { type: "adult", finalPrice: values.adultFinalPrice, originalPrice: values.adultOriginalPrice },
          { type: "child", finalPrice: values.childFinalPrice, originalPrice: values.childOriginalPrice },
          { type: "infant", finalPrice: values.infantFinalPrice, originalPrice: values.infantOriginalPrice },
        ]
      }] : []

      // Build slots structure
      const slots = useTimeSlots ? timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity || 0,
        bookedCapacity: slot.bookedCapacity || 0,
        slotType: slot.slotType || "",
        isAvailable: slot.isAvailable !== false,
        notes: slot.notes || "",
        pricing: slot.pricing || [{
          currency: values.currency,
          prices: [
            { type: "adult", finalPrice: slot.adultPrice || 0, originalPrice: slot.adultPrice || 0 },
            { type: "child", finalPrice: slot.childPrice || 0, originalPrice: slot.childPrice || 0 },
          ]
        }]
      })) : []

      const pricingData = {
        isAvailable: values.isAvailable,
        reason: values.reason,
        notes: values.notes,
        dayCapacity: values.dayCapacity,
        bookedCapacity: values.bookedCapacity,
        dayPricing: dayPricing.length > 0 ? dayPricing : undefined,
        slots: slots.length > 0 ? slots : undefined,
      }

      dispatch(saveDatePricingRequest({
        variantId,
        date: selectedDate,
        pricingData
      }))

      setTimeout(() => {
        toggle()
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error saving date pricing:", error)
      showToastError("Failed to save date pricing")
      setLoading(false)
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
      adultPrice: 0,
      childPrice: 0,
      notes: "",
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

  if (!selectedDate) return null

  const dateStr = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, handleChange }) => (
          <Form>
            <ModalHeader toggle={toggle}>
              Edit Pricing for {dateStr}
              {variantName && <Badge color="secondary" className="ms-2">{variantName}</Badge>}
            </ModalHeader>
            <ModalBody>
              {loading && !existingDatePricing && (
                <Alert color="info">Loading existing pricing...</Alert>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <FormGroup>
                    <Label>
                      <Input
                        type="checkbox"
                        checked={values.isAvailable}
                        onChange={(e) => setFieldValue("isAvailable", e.target.checked)}
                      />{" "}
                      Available
                    </Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
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

              <FormGroup className="mb-3">
                <Label>Notes</Label>
                <Input
                  type="textarea"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Additional notes about this date"
                />
              </FormGroup>

              <hr />

              <FormGroup className="mb-3">
                <Label>
                  <Input
                    type="checkbox"
                    checked={useTimeSlots}
                    onChange={(e) => {
                      setUseTimeSlots(e.target.checked)
                      setFieldValue("useDayPricing", !e.target.checked)
                    }}
                  />{" "}
                  Use Time Slots (instead of day pricing)
                </Label>
              </FormGroup>

              {!useTimeSlots && (
                <Card className="mb-3">
                  <CardHeader>Day Pricing</CardHeader>
                  <CardBody>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Currency</Label>
                          <Input
                            type="select"
                            name="currency"
                            value={values.currency}
                            onChange={handleChange}
                          >
                            <option value="USD">USD</option>
                            <option value="AED">AED</option>
                            <option value="INR">INR</option>
                            <option value="EUR">EUR</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Adult Price</Label>
                          <Input
                            type="number"
                            name="adultFinalPrice"
                            value={values.adultFinalPrice}
                            onChange={handleChange}
                            min="0"
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label>Child Price</Label>
                          <Input
                            type="number"
                            name="childFinalPrice"
                            value={values.childFinalPrice}
                            onChange={handleChange}
                            min="0"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )}

              {useTimeSlots && (
                <Card className="mb-3">
                  <CardHeader>
                    Time Slots
                    <Button
                      color="primary"
                      size="sm"
                      className="float-end"
                      onClick={addTimeSlot}
                    >
                      + Add Slot
                    </Button>
                  </CardHeader>
                  <CardBody>
                    {timeSlots.length === 0 ? (
                      <Alert color="info">No time slots added. Click "Add Slot" to create one.</Alert>
                    ) : (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Start</th>
                            <th>End</th>
                            <th>Type</th>
                            <th>Capacity</th>
                            <th>Adult Price</th>
                            <th>Child Price</th>
                            <th>Available</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((slot, index) => (
                            <tr key={index}>
                              <td>
                                <Input
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="select"
                                  value={slot.slotType || ""}
                                  onChange={(e) => updateTimeSlot(index, "slotType", e.target.value)}
                                  style={{ width: "120px" }}
                                >
                                  <option value="morning">Morning</option>
                                  <option value="afternoon">Afternoon</option>
                                  <option value="evening">Evening</option>
                                </Input>
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  value={slot.capacity || 0}
                                  onChange={(e) => updateTimeSlot(index, "capacity", parseInt(e.target.value) || 0)}
                                  min="0"
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  value={slot.adultPrice || 0}
                                  onChange={(e) => updateTimeSlot(index, "adultPrice", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  value={slot.childPrice || 0}
                                  onChange={(e) => updateTimeSlot(index, "childPrice", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="checkbox"
                                  checked={slot.isAvailable !== false}
                                  onChange={(e) => updateTimeSlot(index, "isAvailable", e.target.checked)}
                                />
                              </td>
                              <td>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => removeTimeSlot(index)}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default DateEditorModal

