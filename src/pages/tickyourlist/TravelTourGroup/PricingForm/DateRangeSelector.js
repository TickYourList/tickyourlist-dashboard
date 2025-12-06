import React, { useState } from "react"
import { Label, Button, FormGroup, Row, Col, Input, ListGroup, ListGroupItem } from "reactstrap"

/**
 * Date Range Selector Component
 * Add specific date ranges
 */
const DateRangeSelector = ({ value = [], onChange }) => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [year, setYear] = useState("")

  const addDateRange = () => {
    if (!startDate || !endDate) return

    const newRange = {
      startDate,
      endDate,
      year: year ? parseInt(year) : undefined,
    }

    onChange([...value, newRange])
    
    // Reset
    setStartDate("")
    setEndDate("")
    setYear("")
  }

  const removeDateRange = (index) => {
    onChange(value.filter((_, idx) => idx !== index))
  }

  return (
    <FormGroup>
      <Label className="d-block mb-2">Specific Date Ranges</Label>
      
      {/* Add Date Range Form */}
      <Row className="mb-3">
        <Col md={4}>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Label>Year (Optional)</Label>
          <Input
            type="number"
            placeholder="e.g., 2024"
            value={year}
            onChange={e => setYear(e.target.value)}
            min="2024"
            max="2030"
          />
          <small className="text-muted">Leave empty for recurring</small>
        </Col>
        <Col md={1} className="d-flex align-items-end">
          <Button
            color="success"
            onClick={addDateRange}
            type="button"
            disabled={!startDate || !endDate}
          >
            <i className="bx bx-plus"></i>
          </Button>
        </Col>
      </Row>

      {/* Display Added Date Ranges */}
      {value.length > 0 && (
        <ListGroup>
          {value.map((range, idx) => (
            <ListGroupItem key={idx} className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{range.startDate}</strong> to <strong>{range.endDate}</strong>
                {range.year && (
                  <span className="ms-2 text-muted">(Year: {range.year})</span>
                )}
                {!range.year && (
                  <span className="ms-2 text-info">(Recurring yearly)</span>
                )}
              </div>
              <Button
                color="danger"
                size="sm"
                onClick={() => removeDateRange(idx)}
                type="button"
              >
                <i className="bx bx-trash"></i>
              </Button>
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {value.length === 0 && (
        <div className="text-muted">
          <small>No date ranges added yet</small>
        </div>
      )}
    </FormGroup>
  )
}

export default DateRangeSelector

