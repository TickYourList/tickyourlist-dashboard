import React, { useState, useEffect } from "react"
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    Input,
    FormGroup,
    Label,
    Alert,
    Badge
} from "reactstrap"
import { useDispatch } from "react-redux"
import {
    createPricingRuleRequest,
    updatePricingRuleRequest,
    fetchPricingRulesRequest
} from "store/tickyourlist/travelTourGroup/action"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"

const HolidayManagerModal = ({ isOpen, toggle, variantId, pricingRules = [] }) => {
    const dispatch = useDispatch()
    const [holidays, setHolidays] = useState([])
    const [newHolidayName, setNewHolidayName] = useState("")
    const [newHolidayStart, setNewHolidayStart] = useState("")
    const [newHolidayEnd, setNewHolidayEnd] = useState("")
    const [loading, setLoading] = useState(false)

    // Load existing holidays from the "holiday_closures" rule
    useEffect(() => {
        if (isOpen && pricingRules) {
            // Handle both array format and object with rules property
            const rules = Array.isArray(pricingRules) ? pricingRules : (pricingRules?.rules || [])
            const holidayRule = rules.find(r => r.tag === "holiday_closures")

            if (holidayRule && holidayRule.conditions?.dateRanges) {
                // Map date ranges to our local holiday format
                // We'll use the "year" field or a custom property if available to store the name, 
                // but for now, we might just have to rely on the date range itself.
                // Ideally, the backend would support a "name" or "reason" per date range, 
                // but the current schema might not. 
                // Let's assume we just store dates for now, and maybe use the rule description for metadata if needed.
                // Or we can try to infer/store a name if the schema allows extra props in dateRanges.
                // For this implementation, we'll keep it simple: List of Dates.

                setHolidays(holidayRule.conditions.dateRanges.map((dr, idx) => ({
                    id: idx,
                    name: dr.name || "Holiday", // If we can't store name per range, default to "Holiday"
                    startDate: dr.startDate,
                    endDate: dr.endDate
                })))
            } else {
                setHolidays([])
            }
        }
    }, [isOpen, pricingRules])

    const handleAddHoliday = () => {
        if (!newHolidayStart || !newHolidayEnd) {
            showToastError("Please select start and end dates")
            return
        }

        const newHoliday = {
            id: Date.now(),
            name: newHolidayName || "Holiday",
            startDate: newHolidayStart,
            endDate: newHolidayEnd
        }

        setHolidays([...holidays, newHoliday])
        setNewHolidayName("")
        setNewHolidayStart("")
        setNewHolidayEnd("")
    }

    const handleRemoveHoliday = (index) => {
        const updatedHolidays = holidays.filter((_, i) => i !== index)
        setHolidays(updatedHolidays)
    }

    const handleSave = () => {
        setLoading(true)

        // Construct the payload
        const payload = {
            tag: "holiday_closures",
            name: "Holiday Closures",
            priority: 100, // High priority to override everything
            conditions: {
                dateRanges: holidays.map(h => ({
                    startDate: h.startDate,
                    endDate: h.endDate,
                    name: h.name
                }))
            },
            isAvailable: false,
            reason: "Holiday Closure",
            isActive: true,
            description: "Auto-generated rule for holiday closures"
        }

        const rules = Array.isArray(pricingRules) ? pricingRules : (pricingRules?.rules || [])
        const existingRule = rules.find(r => r.tag === "holiday_closures")

        if (existingRule) {
            dispatch(updatePricingRuleRequest(variantId, "holiday_closures", payload))
        } else {
            dispatch(createPricingRuleRequest(variantId, payload))
        }

        // Refresh rules and close after a short delay
        setTimeout(() => {
            dispatch(fetchPricingRulesRequest(variantId))
            setLoading(false)
            toggle()
            showToastSuccess("Holidays updated successfully")
        }, 1000)
    }

    // We need to actually import the actions. 
    // I'll use a `useEffect` to close modal on success? 
    // Or just rely on the parent to refresh.

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Manage Holidays
            </ModalHeader>
            <ModalBody>
                <Alert color="info" className="mb-3">
                    <i className="bx bx-info-circle me-2"></i>
                    Dates added here will be marked as <strong>Unavailable</strong> on the calendar.
                </Alert>

                <div className="mb-4 p-3 border rounded bg-light">
                    <h6>Add New Holiday</h6>
                    <div className="row g-2 align-items-end">
                        <div className="col-md-4">
                            <Label>Name (Optional)</Label>
                            <Input
                                type="text"
                                placeholder="e.g. New Year"
                                value={newHolidayName}
                                onChange={e => setNewHolidayName(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={newHolidayStart}
                                onChange={e => setNewHolidayStart(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={newHolidayEnd}
                                onChange={e => setNewHolidayEnd(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <Button color="success" block onClick={handleAddHoliday}>
                                <i className="bx bx-plus"></i> Add
                            </Button>
                        </div>
                    </div>
                </div>

                <Table striped responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                    No holidays added yet.
                                </td>
                            </tr>
                        ) : (
                            holidays.map((holiday, index) => (
                                <tr key={index}>
                                    <td>{holiday.name}</td>
                                    <td>{holiday.startDate}</td>
                                    <td>{holiday.endDate}</td>
                                    <td>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => handleRemoveHoliday(index)}
                                        >
                                            <i className="bx bx-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Cancel</Button>
                <Button color="primary" onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default HolidayManagerModal
