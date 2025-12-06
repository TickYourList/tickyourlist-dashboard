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

      setPreviewData(response.data.data)
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
    if (!day || !previewData?.preview) return null
    
    const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    
    return previewData.preview.find(p => p.date === dateStr)
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
        Preview how your pricing rules apply across different dates. Higher priority rules
        are shown when multiple rules match.
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
                        const adultPrice = matchedRule?.appliedPricing?.dayPricing?.[0]?.prices?.find(
                          p => p.type === "adult"
                        )?.finalPrice

                        return (
                          <td
                            key={dayIdx}
                            className="text-center"
                            style={{ minHeight: "80px", padding: "8px" }}
                          >
                            <div className="fw-bold mb-1">{day}</div>
                            {matchedRule ? (
                              <>
                                <Badge
                                  color={getPriorityColor(matchedRule.priority)}
                                  className="mb-1"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  P{matchedRule.priority}
                                </Badge>
                                <div style={{ fontSize: "0.75rem" }}>
                                  <strong>{currency} {adultPrice}</strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.65rem" }}
                                  className="text-muted text-truncate"
                                  title={matchedRule.name}
                                >
                                  {matchedRule.tag}
                                </div>
                              </>
                            ) : (
                              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                No price
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
                  <h6 className="mb-2">Priority Levels</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge color="danger">90-100: Emergency</Badge>
                    <Badge color="warning">51-89: Special</Badge>
                    <Badge color="info">31-50: Complex</Badge>
                    <Badge color="primary">21-30: Seasonal</Badge>
                    <Badge color="success">11-20: Weekly</Badge>
                    <Badge color="secondary">1-10: Default</Badge>
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

