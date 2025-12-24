import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Badge,
  Input,
  Label,
  FormGroup,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import {
  fetchDatePricingRequest,
  saveDatePricingRequest,
} from "store/tickyourlist/travelTourGroup/action"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import { get, post } from "helpers/api_helper"
import * as url from "helpers/locationManagement_url_helpers"

const { RangePicker } = DatePicker

/**
 * Calendar & Availability Manager Component
 * Manage holidays and unavailable dates for variants
 */
const CalendarAvailabilityManager = ({ variantId, variantName }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dateOverrides, setDateOverrides] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [dateRange, setDateRange] = useState(null)
  const [singleDate, setSingleDate] = useState(null)
  const [selectionMode, setSelectionMode] = useState("range") // "range" or "individual"
  const [notes, setNotes] = useState("")
  const [isAvailable, setIsAvailable] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [dateToDelete, setDateToDelete] = useState(null)

  const datePricing = useSelector(state => state.tourGroup?.datePricing || [])

  // Fetch date overrides on mount and when variantId changes
  useEffect(() => {
    if (variantId) {
      fetchDateOverrides()
    }
  }, [variantId])

  // Update local state when Redux state changes
  useEffect(() => {
    setDateOverrides(datePricing)
  }, [datePricing])

  const fetchDateOverrides = async () => {
    if (!variantId) return

    try {
      setLoading(true)
      const response = await get(`${url.FETCH_DATE_PRICING}/${variantId}`)
      const data = response?.data || {}
      setDateOverrides(data.dateOverrides || [])
      dispatch({
        type: "FETCH_DATE_PRICING_SUCCESS",
        payload: data.dateOverrides || []
      })
    } catch (error) {
      console.error("Error fetching date overrides:", error)
      showToastError("Failed to fetch date overrides")
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates)
      // Generate array of dates in range
      const start = dayjs(dates[0])
      const end = dayjs(dates[1])
      const datesArray = []
      let current = start
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        datesArray.push(current.format('YYYY-MM-DD'))
        current = current.add(1, 'day')
      }
      setSelectedDates(datesArray)
    } else {
      setDateRange(null)
      setSelectedDates([])
    }
  }

  const handleSingleDateChange = (date) => {
    setSingleDate(date)
  }

  const addIndividualDate = () => {
    if (!singleDate) return
    const dateStr = dayjs(singleDate).format('YYYY-MM-DD')
    if (!selectedDates.includes(dateStr)) {
      setSelectedDates([...selectedDates, dateStr].sort())
    }
    setSingleDate(null)
  }

  const removeIndividualDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter(date => date !== dateToRemove))
  }

  const handleModeChange = (mode) => {
    setSelectionMode(mode)
    // Clear selections when switching modes
    setSelectedDates([])
    setDateRange(null)
    setSingleDate(null)
  }

  const handleBulkSave = async () => {
    if (!variantId || selectedDates.length === 0) {
      showToastError("Please select at least one date")
      return
    }

    if (!notes.trim()) {
      showToastError("Please enter notes/reason for the date(s)")
      return
    }

    try {
      setSaving(true)
      const promises = selectedDates.map(date => {
        const payload = {
          date,
          isAvailable,
          notes: notes.trim(),
        }
        return post(`${url.SAVE_DATE_PRICING}/${variantId}`, payload)
      })

      await Promise.all(promises)
      showToastSuccess(`Successfully updated ${selectedDates.length} date(s)`)
      
      // Reset form
      setDateRange(null)
      setSingleDate(null)
      setSelectedDates([])
      setNotes("")
      setIsAvailable(false)
      
      // Refresh date overrides
      fetchDateOverrides()
    } catch (error) {
      console.error("Error saving date overrides:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to save date overrides"
      showToastError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (dateOverride) => {
    setDateToDelete(dateOverride)
    setDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!variantId || !dateToDelete) return

    try {
      setSaving(true)
      // Set isAvailable to true and clear notes to effectively "remove" the override
      await post(`${url.SAVE_DATE_PRICING}/${variantId}`, {
        date: dateToDelete.date,
        isAvailable: true,
        notes: "",
      })
      showToastSuccess("Date override removed successfully")
      setDeleteModal(false)
      setDateToDelete(null)
      fetchDateOverrides()
    } catch (error) {
      console.error("Error deleting date override:", error)
      showToastError("Failed to remove date override")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter to show only unavailable dates and dates with notes (holidays)
  const filteredOverrides = dateOverrides.filter(override => 
    override.isAvailable === false || (override.notes && override.notes.trim() !== "")
  )

  return (
    <div>
      <Card>
        <CardHeader>
          <h5 className="mb-0">Calendar & Availability Management</h5>
          {variantName && <small className="text-muted">- {variantName}</small>}
        </CardHeader>
        <CardBody>
          <Alert color="info">
            <strong>Manage Holidays & Unavailable Dates</strong>
            <ul className="mb-0 mt-2">
              <li><strong>Date Range:</strong> Select a start and end date - all dates in between will be updated</li>
              <li><strong>Individual Dates:</strong> Add multiple separate dates one by one</li>
              <li><strong>Unavailable (Holiday/Closure):</strong> Dates will be marked as unavailable and not bookable - perfect for holidays</li>
              <li><strong>Available (with notes):</strong> Dates remain bookable but with your custom notes</li>
            </ul>
          </Alert>

          {/* Add New Date Override Section */}
          <Card className="mb-4">
            <CardHeader>
              <h6 className="mb-0">Add Holidays / Unavailable Dates</h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={12} className="mb-3">
                  <Label className="mb-2 d-block">Selection Mode</Label>
                  <div className="btn-group" role="group">
                    <Button
                      type="button"
                      color={selectionMode === "range" ? "primary" : "outline-primary"}
                      onClick={() => handleModeChange("range")}
                    >
                      <i className="bx bx-calendar-range me-1"></i>
                      Date Range
                    </Button>
                    <Button
                      type="button"
                      color={selectionMode === "individual" ? "primary" : "outline-primary"}
                      onClick={() => handleModeChange("individual")}
                    >
                      <i className="bx bx-calendar me-1"></i>
                      Individual Dates
                    </Button>
                  </div>
                </Col>

                {/* Date Range Mode */}
                {selectionMode === "range" && (
                  <Col md={12} className="mb-3">
                    <Label>Select Date Range</Label>
                    <RangePicker
                      style={{ width: "100%" }}
                      onChange={handleDateRangeChange}
                      value={dateRange}
                      format="YYYY-MM-DD"
                      placeholder={["Start Date", "End Date"]}
                      disabledDate={(current) => {
                        // Disable dates before today
                        return current && current < dayjs().startOf('day')
                      }}
                    />
                    {selectedDates.length > 0 && (
                      <small className="text-muted d-block mt-2">
                        {selectedDates.length} date(s) selected: {selectedDates.slice(0, 3).join(", ")}
                        {selectedDates.length > 3 && ` ... and ${selectedDates.length - 3} more`}
                      </small>
                    )}
                  </Col>
                )}

                {/* Individual Dates Mode */}
                {selectionMode === "individual" && (
                  <>
                    <Col md={12} className="mb-3">
                      <Label>Add Individual Date</Label>
                      <div className="d-flex gap-2">
                        <DatePicker
                          style={{ flex: 1 }}
                          onChange={handleSingleDateChange}
                          value={singleDate ? dayjs(singleDate) : null}
                          format="YYYY-MM-DD"
                          placeholder="Select a date"
                          disabledDate={(current) => {
                            // Disable dates before today
                            return current && current < dayjs().startOf('day')
                          }}
                        />
                        <Button
                          color="success"
                          onClick={addIndividualDate}
                          disabled={!singleDate}
                        >
                          <i className="bx bx-plus me-1"></i>
                          Add
                        </Button>
                      </div>
                    </Col>
                    {selectedDates.length > 0 && (
                      <Col md={12} className="mb-3">
                        <Label>Selected Dates ({selectedDates.length})</Label>
                        <div className="border rounded p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {selectedDates.map((date, index) => (
                            <div
                              key={index}
                              className="d-inline-flex align-items-center me-2 mb-2"
                              style={{ background: "#007bff", color: "white", borderRadius: "4px", padding: "0.25rem 0.5rem" }}
                            >
                              <span style={{ fontSize: "0.875rem" }}>
                                {dayjs(date).format('MMM DD, YYYY')}
                              </span>
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                style={{ fontSize: "0.6rem", opacity: 1 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeIndividualDate(date)
                                }}
                                aria-label="Remove"
                              ></button>
                            </div>
                          ))}
                        </div>
                      </Col>
                    )}
                  </>
                )}
                <Col md={12} className="mb-3">
                  <Label className="mb-2 d-block">Status</Label>
                  <div className="btn-group" role="group">
                    <Button
                      type="button"
                      color={!isAvailable ? "danger" : "outline-danger"}
                      onClick={() => setIsAvailable(false)}
                    >
                      <i className="bx bx-x-circle me-1"></i>
                      Unavailable (Holiday/Closure)
                    </Button>
                    <Button
                      type="button"
                      color={isAvailable ? "success" : "outline-success"}
                      onClick={() => setIsAvailable(true)}
                    >
                      <i className="bx bx-check-circle me-1"></i>
                      Available (with notes)
                    </Button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    {!isAvailable 
                      ? "Dates will be marked as unavailable/holiday and not bookable"
                      : "Dates will remain available but with your custom notes"}
                  </small>
                </Col>
                <Col md={12} className="mb-3">
                  <Label>
                    Notes / Reason <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="textarea"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Holiday - tour not operating, Christmas Day, Maintenance day, etc."
                  />
                </Col>
                <Col md={12}>
                  <Button
                    color="primary"
                    onClick={handleBulkSave}
                    disabled={saving || selectedDates.length === 0 || !notes.trim()}
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-save me-1"></i>
                        Save {selectedDates.length > 0 ? `${selectedDates.length} Date(s)` : "Dates"}
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Existing Date Overrides List */}
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Existing Holidays & Unavailable Dates</h6>
              <Button
                color="secondary"
                size="sm"
                onClick={fetchDateOverrides}
                disabled={loading}
              >
                <i className="bx bx-refresh me-1"></i>
                Refresh
              </Button>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading date overrides...</p>
                </div>
              ) : filteredOverrides.length === 0 ? (
                <Alert color="info" className="text-center">
                  <h6>No Holidays or Unavailable Dates</h6>
                  <p>Add dates above to mark them as holidays or unavailable.</p>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Notes / Reason</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOverrides
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((override, index) => (
                          <tr key={override._id || index}>
                            <td>
                              <strong>{formatDate(override.date)}</strong>
                            </td>
                            <td>
                              <Badge color={override.isAvailable === false ? "danger" : "success"}>
                                {override.isAvailable === false ? "Unavailable" : "Available"}
                              </Badge>
                            </td>
                            <td>
                              {override.notes ? (
                                <span>{override.notes}</span>
                              ) : (
                                <span className="text-muted">No notes</span>
                              )}
                            </td>
                            <td>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(override)}
                                title="Remove"
                              >
                                <i className="bx bx-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          Confirm Remove
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to remove this date override?</p>
          <p>
            <strong>Date:</strong> {dateToDelete && formatDate(dateToDelete.date)}
          </p>
          {dateToDelete?.notes && (
            <p>
              <strong>Notes:</strong> {dateToDelete.notes}
            </p>
          )}
          <p className="text-muted">
            The date will revert to using default pricing rules.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default CalendarAvailabilityManager
