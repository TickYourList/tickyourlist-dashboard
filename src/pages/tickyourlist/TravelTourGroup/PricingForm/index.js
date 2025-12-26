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
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
  Alert,
  Input,
  Label,
  FormGroup,
} from "reactstrap"
import { Radio, Tabs } from "antd"
import {
  fetchPricingRulesRequest,
  createPricingRuleRequest,
  updatePricingRuleRequest,
  deletePricingRuleRequest,
  fetchVariantDetailRequest,
} from "store/tickyourlist/travelTourGroup/action"
import RuleBasedPricingBuilder from "./RuleBasedPricingBuilder"
import NormalPricingForm from "./NormalPricingForm"
import CalendarAvailabilityManager from "./CalendarAvailabilityManager"
import BulkDateRangePricing from "./BulkDateRangePricing"

import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import axios from "axios"

/**
 * Comprehensive Pricing Form Component
 * Displays all existing pricing rules and allows CRUD operations
 */
const PricingForm = ({ variantId, variantName, onClose }) => {
  const dispatch = useDispatch()
  const [pricingMethod, setPricingMethod] = useState("normal") // "normal" or "rule-based"

  const [editMode, setEditMode] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState(null)

  const { pricingRules, loading, variantDetail } = useSelector(state => {
    const rules = state.tourGroup?.pricingRules || []
    // Handle both array format and object with rules property
    const rulesArray = Array.isArray(rules) ? rules : (rules.rules || [])
    return {
      pricingRules: rulesArray,
      loading: state.tourGroup?.loading || false,
      variantDetail: state.tourGroup?.variantDetail,
    }
  })

  useEffect(() => {
    if (variantId) {
      dispatch(fetchPricingRulesRequest(variantId))
      dispatch(fetchVariantDetailRequest(variantId))
    }
  }, [variantId, dispatch])

  const handleCreateRule = (ruleData) => {
    dispatch(createPricingRuleRequest(variantId, ruleData))
    setEditMode(false)
    setEditingRule(null)
  }

  const handleUpdateRule = (tag, ruleData) => {
    dispatch(updatePricingRuleRequest(variantId, tag, ruleData))
    setEditMode(false)
    setEditingRule(null)
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setEditMode(true)
  }

  const handleDelete = (rule) => {
    setRuleToDelete(rule)
    setDeleteModal(true)
  }

  const confirmDelete = () => {
    if (ruleToDelete) {
      dispatch(deletePricingRuleRequest(variantId, ruleToDelete.tag))
      setDeleteModal(false)
      setRuleToDelete(null)
    }
  }

  const getPriorityColor = (priority) => {
    if (priority >= 90) return "danger"
    if (priority >= 51) return "warning"
    if (priority >= 31) return "info"
    if (priority >= 21) return "success"
    return "secondary"
  }

  const formatConditions = (conditions) => {
    if (!conditions || Object.keys(conditions).length === 0) {
      return <Badge color="secondary">Default (All Dates)</Badge>
    }

    const parts = []
    if (conditions.weekdays?.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      parts.push(`Weekdays: ${conditions.weekdays.map(d => dayNames[d]).join(", ")}`)
    }
    if (conditions.months?.length > 0) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      parts.push(`Months: ${conditions.months.map(m => monthNames[m - 1]).join(", ")}`)
    }
    if (conditions.dateRanges?.length > 0) {
      parts.push(`${conditions.dateRanges.length} date range(s)`)
    }
    if (conditions.excludeDates?.length > 0) {
      parts.push(`${conditions.excludeDates.length} excluded date(s)`)
    }

    return parts.length > 0 ? parts.join(" | ") : "No conditions"
  }

  const formatPricing = (dayPricing) => {
    if (!dayPricing || dayPricing.length === 0) return "N/A"

    const usdPricing = dayPricing.find(p => p.currency === "USD") || dayPricing[0]
    if (!usdPricing?.prices || usdPricing.prices.length === 0) return "N/A"

    // Helper to find price by type (case insensitive)
    const findPrice = (type) => usdPricing.prices.find(p => p.type?.toUpperCase() === type.toUpperCase())

    const parts = []
    const adultPrice = findPrice("ADULT")
    const childPrice = findPrice("CHILD")
    const guestPrice = findPrice("GUEST")
    const familyPrice = findPrice("FAMILY")
    const couplePrice = findPrice("COUPLE")

    if (adultPrice) parts.push(`Adult: ${usdPricing.currency} ${adultPrice.finalPrice}`)
    if (childPrice) parts.push(`Child: ${usdPricing.currency} ${childPrice.finalPrice}`)
    if (guestPrice) parts.push(`Guest: ${usdPricing.currency} ${guestPrice.finalPrice}`)
    if (familyPrice) parts.push(`Family: ${usdPricing.currency} ${familyPrice.finalPrice}`)
    if (couplePrice) parts.push(`Couple: ${usdPricing.currency} ${couplePrice.finalPrice}`)

    return parts.join(" | ") || "N/A"
  }

  return (
    <div>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Pricing Rules Management
            {variantName && <small className="text-muted ms-2">- {variantName}</small>}
          </h5>
          <div>
            {onClose && (
              <Button color="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {/* Pricing Method Selector */}
          {!editMode && (
            <Row className="mb-4">
              <Col md={12}>
                <FormGroup>
                  <Tabs
                    activeKey={pricingMethod}
                    onChange={(key) => setPricingMethod(key)}
                    items={[
                      { label: "Normal Pricing (Update Listing Price)", key: "normal" },
                      { label: "Rule-Based Pricing", key: "rule-based" },
                      { label: "Calendar & Availability", key: "calendar-availability" },
                      { label: "Bulk Date Range Pricing", key: "bulk-date-range" }
                    ]}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}



          {/* Normal Pricing Form */}
          {pricingMethod === "normal" && !editMode && (
            <NormalPricingForm
              variantId={variantId}
              onSave={() => {
                // Refresh pricing rules if needed
                dispatch(fetchPricingRulesRequest(variantId))
              }}
            />
          )}

          {/* Rule-Based Pricing Builder */}
          {pricingMethod === "rule-based" && editMode && (
            <RuleBasedPricingBuilder
              variantId={variantId}
              variantData={{ name: variantName }}
              existingRules={pricingRules}
              editingRule={editingRule}
              onSave={(ruleData) => {
                if (editingRule) {
                  handleUpdateRule(editingRule.tag, ruleData)
                } else {
                  handleCreateRule(ruleData)
                }
              }}
              onCancel={() => {
                setEditMode(false)
                setEditingRule(null)
              }}
            />
          )}

          {/* Calendar & Availability Manager */}
          {pricingMethod === "calendar-availability" && !editMode && (
            <CalendarAvailabilityManager
              variantId={variantId}
              variantName={variantName}
            />
          )}

          {/* Bulk Date Range Pricing */}
          {pricingMethod === "bulk-date-range" && !editMode && (
            <BulkDateRangePricing
              variantId={variantId}
              variantName={variantName}
              onSuccess={() => {
                // Refresh pricing rules and date pricing after bulk update
                dispatch(fetchPricingRulesRequest(variantId))
              }}
            />
          )}

          {/* Rules List (only for rule-based pricing) */}
          {pricingMethod === "rule-based" && !editMode && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Rule-Based Pricing Rules</h6>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => {
                    setEditingRule(null)
                    setEditMode(true)
                  }}
                >
                  <i className="bx bx-plus me-1"></i>
                  Add New Rule
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading pricing rules...</p>
                </div>
              ) : pricingRules.length === 0 ? (
                <Alert color="info" className="text-center">
                  <h6>No Pricing Rules Found</h6>
                  <p>Create your first pricing rule to get started.</p>
                  <Button
                    color="primary"
                    onClick={() => {
                      setEditingRule(null)
                      setEditMode(true)
                    }}
                  >
                    <i className="bx bx-plus me-1"></i>
                    Create First Rule
                  </Button>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Rule Name</th>
                        <th>Tag</th>
                        <th>Priority</th>
                        <th>Conditions</th>
                        <th>Pricing</th>
                        <th>Available</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Base Price Row */}
                      <tr className="table-light">
                        <td>
                          <strong>Base Price (Default)</strong>
                          <small className="d-block text-muted">Fallback pricing when no rules match</small>
                        </td>
                        <td>
                          <Badge color="secondary" className="text-dark">
                            base_price
                          </Badge>
                        </td>
                        <td>
                          <Badge color="secondary">0</Badge>
                        </td>
                        <td>
                          <Badge color="secondary">Default (All Dates)</Badge>
                        </td>
                        <td>
                          <small>
                            {variantDetail?.listingPrice?.prices
                              ? formatPricing([{ currency: "USD", prices: variantDetail.listingPrice.prices }])
                              : "Not Set"}
                          </small>
                        </td>
                        <td>
                          <Badge color="success">Yes</Badge>
                        </td>
                        <td>
                          <Badge color="success">Active</Badge>
                        </td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => setPricingMethod("normal")}
                            title="Edit Base Price"
                          >
                            <i className="bx bx-edit"></i>
                          </Button>
                        </td>
                      </tr>
                      {pricingRules
                        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                        .map((rule) => (
                          <tr key={rule._id || rule.tag}>
                            <td>
                              <strong>{rule.name}</strong>
                              {rule.description && (
                                <small className="d-block text-muted">{rule.description}</small>
                              )}
                            </td>
                            <td>
                              <Badge color="light" className="text-dark">
                                {rule.tag}
                              </Badge>
                            </td>
                            <td>
                              <Badge color={getPriorityColor(rule.priority)}>
                                {rule.priority}
                              </Badge>
                            </td>
                            <td>
                              <small>{formatConditions(rule.conditions)}</small>
                            </td>
                            <td>
                              <small>{formatPricing(rule.dayPricing)}</small>
                              {rule.slots && rule.slots.length > 0 && (
                                <Badge color="info" className="ms-1">
                                  {rule.slots.length} slot(s)
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Badge color={rule.isAvailable !== false ? "success" : "danger"}>
                                {rule.isAvailable !== false ? "Yes" : "No"}
                              </Badge>
                              {rule.reason && (
                                <small className="d-block text-muted">{rule.reason}</small>
                              )}
                            </td>
                            <td>
                              <Badge color={rule.isActive !== false ? "success" : "secondary"}>
                                {rule.isActive !== false ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  color={rule.isActive !== false ? "warning" : "success"}
                                  size="sm"
                                  onClick={() => {
                                    const updatedRule = { ...rule, isActive: !rule.isActive }
                                    handleUpdateRule(rule.tag, updatedRule)
                                  }}
                                  title={rule.isActive !== false ? "Deactivate" : "Activate"}
                                >
                                  <i className={rule.isActive !== false ? "bx bx-pause" : "bx bx-play"}></i>
                                </Button>
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => handleEdit(rule)}
                                  title="Edit"
                                >
                                  <i className="bx bx-edit"></i>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDelete(rule)}
                                  title="Delete"
                                >
                                  <i className="bx bx-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete the pricing rule:</p>
          <p><strong>{ruleToDelete?.name}</strong> ({ruleToDelete?.tag})</p>
          <p className="text-danger">This action cannot be undone.</p>
          <div className="d-flex justify-content-end gap-2">
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  )
}

export default PricingForm

