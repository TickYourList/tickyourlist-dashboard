import React from "react"
import { Label, Button, FormGroup } from "reactstrap"

/**
 * Weekday Selector Component
 * Select specific days of the week
 */
const WeekdaySelector = ({ value = [], onChange }) => {
  const days = [
    { value: 0, label: "Sunday", short: "Sun" },
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
  ]

  const presets = [
    { label: "Weekdays", values: [1, 2, 3, 4, 5] },
    { label: "Weekend", values: [5, 6, 0] },
    { label: "All Days", values: [0, 1, 2, 3, 4, 5, 6] },
    { label: "Clear", values: [] },
  ]

  const toggleDay = (dayValue) => {
    const newValue = value.includes(dayValue)
      ? value.filter(d => d !== dayValue)
      : [...value, dayValue]
    onChange(newValue)
  }

  const applyPreset = (presetValues) => {
    onChange(presetValues)
  }

  return (
    <FormGroup>
      <Label className="d-block mb-2">Apply on Days</Label>
      
      {/* Day Buttons */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {days.map(day => (
          <Button
            key={day.value}
            color={value.includes(day.value) ? "primary" : "outline-secondary"}
            size="sm"
            onClick={() => toggleDay(day.value)}
            type="button"
            style={{ minWidth: "60px" }}
          >
            {day.short}
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

      {/* Selected Days Display */}
      {value.length > 0 && (
        <div className="mt-2">
          <small className="text-success">
            Selected: {value.map(v => days.find(d => d.value === v)?.short).join(", ")}
          </small>
        </div>
      )}
    </FormGroup>
  )
}

export default WeekdaySelector

