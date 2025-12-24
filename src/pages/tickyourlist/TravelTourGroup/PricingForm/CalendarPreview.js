import React, { useState, useEffect } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Button,
  Input,
  Badge,
  Alert,
  Table,
} from "reactstrap"
import axios from "axios"

/**
 * Calendar Preview Component
 * Preview how pricing rules apply across a calendar month
 */
const CalendarPreview = ({ variantId, rules }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    if (variantId) {
      loadPreviewData()
    }
  }, [variantId, selectedMonth, currency])

  const loadPreviewData = async () => {
    try {
      setLoading(true)
      setError(null)

      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth()
      
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      const response = await axios.post(
        `/api/v1/preview-rule-matches/${variantId}`,
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          currency,
        }
      )

      // Response structure: { data: { preview: [...], summary: {...}, ... } }
      const data = response.data.data || response.data
      setPreviewData(data)
      
      // Debug: Log availability data
      if (data.preview && data.preview.length > 0) {
        const datesWithAvailability = data.preview.filter(p => p.hasAvailabilityOverride)
        console.log('Dates with availability overrides:', datesWithAvailability.length)
        if (datesWithAvailability.length > 0) {
          console.log('Sample availability data:', datesWithAvailability[0])
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error("Error loading preview:", err)
      setError(err.response?.data?.message || "Failed to load preview")
      setLoading(false)
    }
  }

  const changeMonth = (delta) => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() + delta)
    setSelectedMonth(newDate)
  }

  const goToToday = () => {
    setSelectedMonth(new Date())
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const buildCalendarDays = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getPriceForDate = (day) => {
    if (!day || !previewData) return null
    
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    
    // Handle response structure: { preview: [...] }
    const previewArray = previewData.preview || []
    return previewArray.find(p => p.date === dateStr)
  }

  const getPriorityColor = (priority) => {
    if (priority >= 90) return "danger"
    if (priority >= 51) return "warning"
    if (priority >= 31) return "info"
    if (priority >= 21) return "primary"
    if (priority >= 11) return "success"
    return "secondary"
  }

  const calendarDays = buildCalendarDays()
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div>
      <h5 className="mb-3">Calendar Preview</h5>
      <p className="text-muted">
        Preview how pricing and availability apply across different dates. Shows rule-based pricing (with priority badges), 
        legacy/base pricing (shown as "Legacy"), and unavailable dates/holidays (shown with red "Holiday" badge). 
        Higher priority rules override lower priority ones.
      </p>

      {error && (
        <Alert color="danger" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Month Selector */}
      <Card className="mb-3">
        <CardBody>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2">
                <Button color="primary" size="sm" onClick={() => changeMonth(-1)}>
                  <i className="bx bx-chevron-left"></i>
                </Button>
                <h5 className="mb-0 mx-3">{getMonthName(selectedMonth)}</h5>
                <Button color="primary" size="sm" onClick={() => changeMonth(1)}>
                  <i className="bx bx-chevron-right"></i>
                </Button>
                <Button color="outline-primary" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
              </Input>
            </Col>
            <Col md={3} className="text-end">
              <Button color="primary" outline size="sm" onClick={loadPreviewData}>
                <i className="bx bx-refresh"></i> Refresh
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading preview...</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Calendar Grid */}
          <Card className="mb-3">
            <CardBody>
              <Table bordered className="mb-0">
                <thead>
                  <tr>
                    <th className="text-center">Sun</th>
                    <th className="text-center">Mon</th>
                    <th className="text-center">Tue</th>
                    <th className="text-center">Wed</th>
                    <th className="text-center">Thu</th>
                    <th className="text-center">Fri</th>
                    <th className="text-center">Sat</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIdx) => (
                    <tr key={weekIdx}>
                      {week.map((day, dayIdx) => {
                        if (!day) {
                          return <td key={dayIdx} className="bg-light"></td>
                        }

                        const priceData = getPriceForDate(day)
                        const matchedRule = priceData?.matchedRules?.[0] // Highest priority
                        const isAvailable = priceData?.isAvailable !== false
                        const hasAvailabilityOverride = priceData?.hasAvailabilityOverride || false
                        const availabilityNotes = priceData?.availabilityNotes
                        const availabilityReason = priceData?.availabilityReason
                        
                        // Get price from either matched rule or legacy pricing
                        let adultPrice = null
                        let pricingSource = null
                        let ruleTag = null
                        let rulePriority = null
                        
                        if (matchedRule?.appliedPricing?.dayPricing?.[0]?.prices) {
                          adultPrice = matchedRule.appliedPricing.dayPricing[0].prices.find(
                            p => p.type === "adult" || p.type === "guest"
                          )?.finalPrice
                          pricingSource = priceData?.pricingSource || "rule_based"
                          ruleTag = matchedRule.tag
                          rulePriority = matchedRule.priority
                        } else if (priceData?.appliedPricing?.dayPricing?.[0]?.prices) {
                          // Legacy pricing or other pricing source
                          adultPrice = priceData.appliedPricing.dayPricing[0].prices.find(
                            p => p.type === "adult" || p.type === "guest"
                          )?.finalPrice
                          pricingSource = priceData?.pricingSource || "legacy"
                        }

                        return (
                          <td
                            key={dayIdx}
                            className={`text-center ${!isAvailable ? "bg-light" : ""}`}
                            style={{ 
                              minHeight: "80px", 
                              padding: "8px",
                              opacity: !isAvailable ? 0.6 : 1
                            }}
                            title={
                              hasAvailabilityOverride 
                                ? (availabilityNotes || availabilityReason || (isAvailable ? "Available with override" : "Not available"))
                                : ""
                            }
                          >
                            <div className="fw-bold mb-1">{day}</div>
                            {/* Show availability badge if there's an override */}
                            {hasAvailabilityOverride && (
                              <Badge
                                color={isAvailable ? "success" : "danger"}
                                className="mb-1"
                                style={{ fontSize: "0.7rem" }}
                              >
                                <i className={`bx ${isAvailable ? "bx-check-circle" : "bx-x-circle"} me-1`}></i>
                                {isAvailable ? "Override" : "Holiday"}
                              </Badge>
                            )}
                            {adultPrice !== null && adultPrice !== undefined && isAvailable ? (
                              <>
                                {pricingSource === "legacy" ? (
                                  <Badge
                                    color="secondary"
                                    className="mb-1"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Legacy
                                  </Badge>
                                ) : rulePriority !== null ? (
                                  <Badge
                                    color={getPriorityColor(rulePriority)}
                                    className="mb-1"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    P{rulePriority}
                                  </Badge>
                                ) : null}
                                <div style={{ fontSize: "0.75rem" }}>
                                  <strong>{currency} {adultPrice}</strong>
                                </div>
                                {ruleTag && (
                                  <div
                                    style={{ fontSize: "0.65rem" }}
                                    className="text-muted text-truncate"
                                    title={matchedRule?.name}
                                  >
                                    {ruleTag}
                                  </div>
                                )}
                                {pricingSource === "legacy" && (
                                  <div
                                    style={{ fontSize: "0.65rem" }}
                                    className="text-muted"
                                  >
                                    Base Price
                                  </div>
                                )}
                              </>
                            ) : !isAvailable ? (
                              <div className="text-danger" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                                Unavailable
                              </div>
                            ) : (
                              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                No price
                              </div>
                            )}
                            {/* Show notes/reason for all dates with availability overrides */}
                            {hasAvailabilityOverride && (availabilityNotes || availabilityReason) && (
                              <div
                                style={{ fontSize: "0.6rem" }}
                                className="text-muted text-truncate mt-1"
                                title={availabilityNotes || availabilityReason}
                              >
                                {availabilityNotes || availabilityReason}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="bg-light">
              <h6 className="mb-0">Legend</h6>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <h6 className="mb-2">Priority Levels & Status</h6>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <Badge color="danger">90-100: Emergency</Badge>
                    <Badge color="warning">51-89: Special</Badge>
                    <Badge color="info">31-50: Complex</Badge>
                    <Badge color="primary">21-30: Seasonal</Badge>
                    <Badge color="success">11-20: Weekly</Badge>
                    <Badge color="secondary">1-10: Default</Badge>
                    <Badge color="secondary">Legacy: Base Price</Badge>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge color="danger">
                      <i className="bx bx-x-circle me-1"></i>
                      Holiday/Unavailable
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-2">Active Rules ({rules.length})</h6>
                  <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                    {rules.map(rule => (
                      <div key={rule._id} className="mb-1">
                        <Badge color={getPriorityColor(rule.priority)} className="me-2">
                          {rule.priority}
                        </Badge>
                        <small>{rule.name}</small>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

export default CalendarPreview

