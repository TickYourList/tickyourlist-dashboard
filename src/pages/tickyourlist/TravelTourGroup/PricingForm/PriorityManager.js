import React, { useState } from "react"
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Badge,
  Button,
  Input,
  Alert,
  Row,
  Col,
} from "reactstrap"
import axios from "axios"

/**
 * Priority Manager Component
 * Manage and reorder pricing rule priorities
 */
const PriorityManager = ({ variantId, rules, onUpdate }) => {
  const [editingPriority, setEditingPriority] = useState({})
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState(null)

  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  const getPriorityColor = (priority) => {
    if (priority >= 90) return "danger"
    if (priority >= 51) return "warning"
    if (priority >= 31) return "info"
    if (priority >= 21) return "primary"
    if (priority >= 11) return "success"
    return "secondary"
  }

  const getPriorityLevel = (priority) => {
    if (priority >= 90) return "Emergency"
    if (priority >= 51) return "Special Events"
    if (priority >= 31) return "Complex"
    if (priority >= 21) return "Seasonal"
    if (priority >= 11) return "Weekly"
    return "Default"
  }

  const handlePriorityChange = (ruleId, newPriority) => {
    setEditingPriority({ ...editingPriority, [ruleId]: newPriority })
  }

  const savePriority = async (rule) => {
    try {
      setUpdating(true)
      setMessage(null)

      const newPriority = parseInt(editingPriority[rule._id] || rule.priority)
      
      // Update via API
      await axios.put(`/api/v1/pricing-rule/${variantId}/${rule.tag}`, {
        priority: newPriority,
      })

      setMessage({ type: "success", text: "Priority updated successfully!" })
      setEditingPriority({ ...editingPriority, [rule._id]: undefined })
      
      setTimeout(() => {
        onUpdate && onUpdate()
      }, 1000)
    } catch (err) {
      console.error("Error updating priority:", err)
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to update priority",
      })
    } finally {
      setUpdating(false)
    }
  }

  const cancelEdit = (ruleId) => {
    setEditingPriority({ ...editingPriority, [ruleId]: undefined })
  }

  const formatConditions = (rule) => {
    const conditions = rule.conditions || {}
    const parts = []

    if (conditions.months && conditions.months.length > 0) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      parts.push(`Months: ${conditions.months.map(m => monthNames[m - 1]).join(", ")}`)
    }

    if (conditions.weekdays && conditions.weekdays.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      parts.push(`Days: ${conditions.weekdays.map(d => dayNames[d]).join(", ")}`)
    }

    if (conditions.dateRanges && conditions.dateRanges.length > 0) {
      parts.push(`${conditions.dateRanges.length} date range(s)`)
    }

    return parts.length > 0 ? parts.join(" | ") : "No conditions (default)"
  }

  const groupedByLevel = {
    emergency: sortedRules.filter(r => r.priority >= 90),
    special: sortedRules.filter(r => r.priority >= 51 && r.priority < 90),
    complex: sortedRules.filter(r => r.priority >= 31 && r.priority < 51),
    seasonal: sortedRules.filter(r => r.priority >= 21 && r.priority < 31),
    weekly: sortedRules.filter(r => r.priority >= 11 && r.priority < 21),
    default: sortedRules.filter(r => r.priority <= 10),
  }

  return (
    <div>
      <h5 className="mb-3">Rule Priority Manager</h5>
      <p className="text-muted">
        Higher priority rules override lower priority rules. Adjust priorities to control
        which rules take precedence when multiple rules match a date.
      </p>

      {message && (
        <Alert color={message.type} toggle={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Priority Guidelines */}
      <Card className="mb-3 border-info">
        <CardHeader className="bg-light">
          <h6 className="mb-0">Priority Guidelines</h6>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <div className="mb-2">
                <Badge color="danger" className="me-2">90-100</Badge>
                <span>Emergency Overrides (weather, maintenance)</span>
              </div>
              <div className="mb-2">
                <Badge color="warning" className="me-2">51-89</Badge>
                <span>Special Events & Holidays</span>
              </div>
              <div className="mb-2">
                <Badge color="info" className="me-2">31-50</Badge>
                <span>Complex Combinations (month + weekday)</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <Badge color="primary" className="me-2">21-30</Badge>
                <span>Seasonal Patterns</span>
              </div>
              <div className="mb-2">
                <Badge color="success" className="me-2">11-20</Badge>
                <span>Weekly Patterns</span>
              </div>
              <div className="mb-2">
                <Badge color="secondary" className="me-2">1-10</Badge>
                <span>Default Pricing</span>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Rules by Priority Level */}
      {Object.entries({
        emergency: { label: "Emergency Overrides", color: "danger", rules: groupedByLevel.emergency },
        special: { label: "Special Events", color: "warning", rules: groupedByLevel.special },
        complex: { label: "Complex Rules", color: "info", rules: groupedByLevel.complex },
        seasonal: { label: "Seasonal Rules", color: "primary", rules: groupedByLevel.seasonal },
        weekly: { label: "Weekly Rules", color: "success", rules: groupedByLevel.weekly },
        default: { label: "Default Rules", color: "secondary", rules: groupedByLevel.default },
      }).map(([key, group]) => {
        if (group.rules.length === 0) return null

        return (
          <Card key={key} className="mb-3">
            <CardHeader className={`bg-${group.color} text-white`}>
              <h6 className="mb-0">
                {group.label} ({group.rules.length})
              </h6>
            </CardHeader>
            <CardBody className="p-0">
              <Table className="mb-0" hover responsive>
                <thead>
                  <tr>
                    <th style={{ width: "100px" }}>Priority</th>
                    <th>Rule Name</th>
                    <th>Conditions</th>
                    <th>Status</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rules.map(rule => {
                    const isEditing = editingPriority[rule._id] !== undefined
                    const currentPriority = isEditing
                      ? editingPriority[rule._id]
                      : rule.priority

                    return (
                      <tr key={rule._id}>
                        <td>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={currentPriority}
                              onChange={e =>
                                handlePriorityChange(rule._id, e.target.value)
                              }
                              min="1"
                              max="100"
                              style={{ width: "80px" }}
                            />
                          ) : (
                            <Badge color={getPriorityColor(rule.priority)}>
                              {rule.priority}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <strong>{rule.name}</strong>
                          <br />
                          <small className="text-muted">{rule.tag}</small>
                        </td>
                        <td>
                          <small>{formatConditions(rule)}</small>
                        </td>
                        <td>
                          {rule.isActive ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <>
                              <Button
                                color="success"
                                size="sm"
                                onClick={() => savePriority(rule)}
                                disabled={updating}
                                className="me-1"
                              >
                                Save
                              </Button>
                              <Button
                                color="secondary"
                                size="sm"
                                onClick={() => cancelEdit(rule._id)}
                                disabled={updating}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              color="primary"
                              size="sm"
                              onClick={() =>
                                handlePriorityChange(rule._id, rule.priority)
                              }
                            >
                              Edit Priority
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        )
      })}

      {/* Summary */}
      <Card className="border-primary">
        <CardBody>
          <h6 className="mb-2">Summary</h6>
          <p className="mb-0">
            Total Rules: <strong>{rules.length}</strong> |
            Active: <strong className="text-success">{rules.filter(r => r.isActive).length}</strong> |
            Inactive: <strong className="text-secondary">{rules.filter(r => !r.isActive).length}</strong>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

export default PriorityManager

