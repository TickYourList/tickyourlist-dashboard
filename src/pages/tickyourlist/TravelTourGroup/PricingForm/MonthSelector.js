import React from "react"
import { Label, Button, FormGroup } from "reactstrap"

/**
 * Month Selector Component
 * Select specific months
 */
const MonthSelector = ({ value = [], onChange }) => {
  const months = [
    { value: 1, label: "January", short: "Jan" },
    { value: 2, label: "February", short: "Feb" },
    { value: 3, label: "March", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "May", short: "May" },
    { value: 6, label: "June", short: "Jun" },
    { value: 7, label: "July", short: "Jul" },
    { value: 8, label: "August", short: "Aug" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "October", short: "Oct" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "December", short: "Dec" },
  ]

  const presets = [
    { label: "Summer (Jun-Aug)", values: [6, 7, 8] },
    { label: "Winter (Dec-Feb)", values: [12, 1, 2] },
    { label: "Spring (Mar-May)", values: [3, 4, 5] },
    { label: "Fall (Sep-Nov)", values: [9, 10, 11] },
    { label: "All Year", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { label: "Clear", values: [] },
  ]

  const toggleMonth = (monthValue) => {
    const newValue = value.includes(monthValue)
      ? value.filter(m => m !== monthValue)
      : [...value, monthValue]
    onChange(newValue)
  }

  const applyPreset = (presetValues) => {
    onChange(presetValues)
  }

  return (
    <FormGroup>
      <Label className="d-block mb-2">Apply in Months</Label>
      
      {/* Month Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {months.map(month => (
          <Button
            key={month.value}
            color={value.includes(month.value) ? "primary" : "outline-secondary"}
            size="sm"
            onClick={() => toggleMonth(month.value)}
            type="button"
            style={{ minWidth: "50px" }}
          >
            {month.short}
          </Button>
        ))}
      </div>

      {/* Presets */}
      <div className="d-flex flex-wrap gap-2">
        <small className="text-muted me-2 align-self-center">Quick Select:</small>
        {presets.map((preset, idx) => (
          <Button
            key={idx}
            color="link"
            size="sm"
            onClick={() => applyPreset(preset.values)}
            type="button"
            className="p-1"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Selected Months Display */}
      {value.length > 0 && (
        <div className="mt-2">
          <small className="text-success">
            Selected: {value.map(v => months.find(m => m.value === v)?.short).join(", ")}
          </small>
        </div>
      )}
    </FormGroup>
  )
}

export default MonthSelector

