import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    Badge,
    Spinner,
    Button,
    Row,
    Col,
    Alert,
    Input,
    Label,
    UncontrolledTooltip,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Nav,
    NavItem,
    NavLink,
} from "reactstrap";
import classnames from "classnames";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import BootstrapTheme from "@fullcalendar/bootstrap";
import Select from "react-select";
import { fetchKlookLivePricingRequest } from "store/tickyourlist/travelTourGroup/action";
import { format, parseISO, isSameDay, startOfDay } from "date-fns";
import { getSupportedCurrencies } from "helpers/location_management_helper";
import "@fullcalendar/bootstrap/main.css";

const LiveKlookPricing = ({ tourGroupId, variantId = null }) => {
    const dispatch = useDispatch();
    const { klookLivePricing, klookLivePricingLoading } = useSelector((state) => ({
        klookLivePricing: state.tourGroup?.klookLivePricing || {},
        klookLivePricingLoading: state.tourGroup?.klookLivePricingLoading || false,
    }));

    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const today = new Date();
        const future = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return future.toISOString().split('T')[0];
    });

    // Filter by pricing type (SKU type) - per variant
    const [selectedSkuTypes, setSelectedSkuTypes] = useState({}); // { variantId: 'ALL' or SKU ID }

    // View mode: 'calendar' or 'table'
    const [viewMode, setViewMode] = useState('table');

    // Selected date for filtering (when calendar date is clicked)
    const [selectedDate, setSelectedDate] = useState(null);

    // Currency selection
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);

    const pricingData = klookLivePricing[tourGroupId];

    // Fetch supported currencies on mount
    useEffect(() => {
        const fetchCurrencies = async () => {
            setLoadingCurrencies(true);
            try {
                const response = await getSupportedCurrencies();
                // Handle both response formats: { data: { currencies } } or { currencies }
                const currencies = response?.data?.currencies || response?.data?.data?.currencies || response?.currencies || [];

                if (currencies.length > 0) {
                    setAvailableCurrencies(currencies);
                    console.log(`✅ Loaded ${currencies.length} currencies`);
                } else {
                    throw new Error('No currencies returned');
                }
            } catch (error) {
                console.error('Error fetching currencies:', error);
                // Fallback to common currencies
                setAvailableCurrencies([
                    { code: 'USD', symbol: '$', label: 'USD ($)' },
                    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
                    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
                    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
                    { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
                    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
                ]);
            } finally {
                setLoadingCurrencies(false);
            }
        };
        fetchCurrencies();
    }, []);

    // Extract all timeslots and group by date for calendar
    const calendarEvents = useMemo(() => {
        if (!pricingData || !pricingData.variants) return [];

        const datePriceMap = new Map(); // { dateString: { minPrice, maxPrice, currency, count, variants } }

        pricingData.variants.forEach(variant => {
            if (!variant.schedules || variant.error) return;

            variant.schedules.forEach(schedule => {
                if (!schedule.calendars) return;

                schedule.calendars.forEach(monthData => {
                    if (!monthData.timeslots) return;

                    monthData.timeslots.forEach(slot => {
                        if (!slot.startTime || !slot.sellingPrice) return;

                        try {
                            const slotDate = parseISO(slot.startTime);
                            const dateStr = slotDate.toISOString().split('T')[0]; // YYYY-MM-DD

                            if (!datePriceMap.has(dateStr)) {
                                datePriceMap.set(dateStr, {
                                    minPrice: slot.sellingPrice,
                                    maxPrice: slot.sellingPrice,
                                    currency: schedule.currency || variant.currency || 'USD',
                                    count: 0,
                                    variants: new Set(),
                                    available: slot.available && slot.inventory > 0,
                                });
                            }

                            const dateData = datePriceMap.get(dateStr);
                            dateData.minPrice = Math.min(dateData.minPrice, slot.sellingPrice);
                            dateData.maxPrice = Math.max(dateData.maxPrice, slot.sellingPrice);
                            dateData.count += 1;
                            dateData.variants.add(variant.variantId);
                            if (slot.available && slot.inventory > 0) {
                                dateData.available = true;
                            }
                        } catch (e) {
                            console.error('Error parsing date:', slot.startTime, e);
                        }
                    });
                });
            });
        });

        // Convert to FullCalendar events format
        return Array.from(datePriceMap.entries()).map(([dateStr, data]) => {
            const formatPriceValue = (price, currency) => {
                if (!price) return '—';
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency || 'USD',
                }).format(price);
            };

            return {
                title: formatPriceValue(data.minPrice, data.currency),
                date: dateStr,
                extendedProps: {
                    minPrice: data.minPrice,
                    maxPrice: data.maxPrice,
                    currency: data.currency,
                    count: data.count,
                    variantCount: data.variants.size,
                    available: data.available,
                },
                backgroundColor: data.available ? '#28a745' : '#6c757d',
                borderColor: data.available ? '#28a745' : '#6c757d',
                textColor: '#fff',
            };
        });
    }, [pricingData]);

    // Get all dates in a range
    const getAllDatesInRange = (start, end) => {
        const dates = [];
        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    };

    // Get available dates from variant schedules
    const getAvailableDatesFromVariant = (variant) => {
        const availableDates = new Set();

        if (!variant.schedules) return availableDates;

        variant.schedules.forEach(schedule => {
            if (!schedule.calendars) return;

            schedule.calendars.forEach(monthData => {
                if (!monthData.timeslots) return;

                monthData.timeslots.forEach(slot => {
                    if (slot.startTime) {
                        try {
                            const slotDate = new Date(slot.startTime);
                            const dateStr = slotDate.toISOString().split('T')[0]; // YYYY-MM-DD
                            availableDates.add(dateStr);
                        } catch (e) {
                            console.error('Error parsing date:', slot.startTime, e);
                        }
                    }
                });
            });
        });

        return availableDates;
    };

    // Get unavailable dates for a variant within the date range
    const getUnavailableDates = (variant) => {
        if (!variant || !startDate || !endDate) return [];

        const allDates = getAllDatesInRange(startDate, endDate);
        const availableDates = getAvailableDatesFromVariant(variant);

        const unavailableDates = allDates
            .map(date => {
                const dateStr = date.toISOString().split('T')[0];
                return { date, dateStr };
            })
            .filter(({ dateStr }) => !availableDates.has(dateStr))
            .map(({ date }) => date);

        return unavailableDates;
    };

    // Filter timeslots by selected date
    const filterTimeslotsByDate = (variant, selectedDate) => {
        if (!selectedDate || !variant.schedules) return variant.schedules;

        const selectedDateStart = startOfDay(selectedDate);

        return variant.schedules.map(schedule => {
            const filteredCalendars = schedule.calendars.map(monthData => {
                const filteredTimeslots = monthData.timeslots.filter(slot => {
                    if (!slot.startTime) return false;
                    try {
                        const slotDate = parseISO(slot.startTime);
                        return isSameDay(slotDate, selectedDateStart);
                    } catch {
                        return false;
                    }
                });

                return {
                    ...monthData,
                    timeslots: filteredTimeslots,
                };
            }).filter(monthData => monthData.timeslots.length > 0);

            return {
                ...schedule,
                calendars: filteredCalendars,
            };
        }).filter(schedule => schedule.calendars.length > 0);
    };

    // Handle calendar date click
    const handleDateClick = (arg) => {
        const clickedDate = parseISO(arg.dateStr);
        setSelectedDate(clickedDate);
        setViewMode('table'); // Switch to table view to show filtered results
    };

    // Clear date filter
    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    // Render schedules for a variant (with date filtering)
    const renderVariantSchedules = (variant, variantId, availableSkuTypes, selectedSkuType) => {
        // Filter schedules by selected date if applicable
        const filteredSchedules = selectedDate
            ? filterTimeslotsByDate(variant, selectedDate)
            : variant.schedules;

        if (!filteredSchedules || filteredSchedules.length === 0) {
            return (
                <Alert color="info">
                    {selectedDate
                        ? `No pricing available for ${format(selectedDate, 'MMM dd, yyyy')}`
                        : 'No pricing schedule available'}
                </Alert>
            );
        }

        // Map SKU type to badge color
        const getSkuTypeBadgeColor = (type) => {
            const upperType = (type || '').toUpperCase();
            switch (upperType) {
                case 'ADULT': return 'primary';
                case 'CHILD': return 'warning';
                case 'YOUTH': return 'info';
                case 'INFANT': return 'info';
                case 'SENIOR': return 'success';
                default: return 'secondary';
            }
        };

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                        Pricing Schedule
                        {selectedDate && (
                            <Badge color="info" className="ms-2">
                                {format(selectedDate, 'MMM dd, yyyy')}
                            </Badge>
                        )}
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                        {/* Filter by SKU Type Dropdown */}
                        {availableSkuTypes.length > 1 && (
                            <div className="d-flex align-items-center">
                                <Label className="me-2 small mb-0" style={{ whiteSpace: 'nowrap' }}>Filter by Type:</Label>
                                <Input
                                    type="select"
                                    value={selectedSkuType}
                                    onChange={(e) => handleSkuTypeFilterChange(variantId, e.target.value)}
                                    style={{ width: '220px', minWidth: '220px' }}
                                    bsSize="sm"
                                >
                                    <option value="ALL">All Types</option>
                                    {availableSkuTypes.map(skuType => {
                                        // Ensure skuId is converted to string for option value
                                        const skuIdValue = String(skuType.skuId);
                                        return (
                                            <option key={skuIdValue} value={skuIdValue}>
                                                {skuType.title} ({skuType.skuType})
                                            </option>
                                        );
                                    })}
                                </Input>
                            </div>
                        )}
                        <div className="small text-muted">
                            <i className="mdi mdi-information me-1" id={`blockout-time-info-${variantId}`}></i>
                            <span>Blockout time: Last time to book</span>
                            <UncontrolledTooltip placement="top" target={`blockout-time-info-${variantId}`}>
                                Blockout time is the cutoff time before the activity starts when bookings close.
                                After this time, no new bookings can be made for that timeslot.
                            </UncontrolledTooltip>
                        </div>
                    </div>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredSchedules
                        .filter(schedule => {
                            if (selectedSkuType === 'ALL') return true;
                            // Convert both to numbers for comparison
                            const scheduleSkuId = typeof schedule.skuId === 'number' ? schedule.skuId : parseInt(schedule.skuId);
                            const selectedSkuId = typeof selectedSkuType === 'number' ? selectedSkuType : parseInt(selectedSkuType);
                            return scheduleSkuId === selectedSkuId;
                        })
                        .map((schedule, schedIdx) => {
                            // Find SKU details from variant.skus array
                            const skuInfo = variant.skus?.find(sku => {
                                const skuId = typeof sku.skuId === 'number' ? sku.skuId : parseInt(sku.skuId);
                                const scheduleSkuId = typeof schedule.skuId === 'number' ? schedule.skuId : parseInt(schedule.skuId);
                                return skuId === scheduleSkuId;
                            }) || null;
                            const skuTypeLabel = skuInfo ? skuInfo.title : `SKU ${schedule.skuId}`;
                            const skuTypeBadge = skuInfo?.skuType || 'UNKNOWN';

                            return (
                                <div key={schedIdx} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>{skuTypeLabel}</strong>
                                            <Badge color={getSkuTypeBadgeColor(skuTypeBadge)} className="ms-2">
                                                {skuTypeBadge}
                                            </Badge>
                                            <span className="text-muted ms-2 small">
                                                (SKU ID: {schedule.skuId})
                                            </span>
                                        </div>
                                        <Badge color="secondary">
                                            {schedule.currency}
                                        </Badge>
                                    </div>
                                    {schedule.calendars && schedule.calendars.length > 0 ? (
                                        schedule.calendars.map((monthData, monthIdx) => (
                                            <div key={monthIdx} className="mb-2">
                                                <div className="small text-muted mb-1">
                                                    {monthData.month}
                                                </div>
                                                <Table size="sm" bordered responsive striped>
                                                    <thead className="table-dark">
                                                        <tr>
                                                            <th style={{ minWidth: '180px' }}>
                                                                <i className="mdi mdi-calendar-clock me-1"></i>
                                                                Date & Time
                                                            </th>
                                                            <th style={{ minWidth: '120px' }}>
                                                                <i className="mdi mdi-tag me-1"></i>
                                                                Pricing Type
                                                            </th>
                                                            <th style={{ minWidth: '100px' }}>
                                                                <i className="mdi mdi-currency-usd me-1"></i>
                                                                Price
                                                            </th>
                                                            <th style={{ minWidth: '90px' }}>
                                                                <i className="mdi mdi-package-variant me-1"></i>
                                                                Inventory
                                                            </th>
                                                            <th style={{ minWidth: '150px' }}>
                                                                <i className="mdi mdi-alarm me-1"></i>
                                                                Block Out Time
                                                                <i className="mdi mdi-information ms-1" id={`blockout-${schedIdx}-${monthIdx}-${variantId}`} style={{ cursor: 'help' }}></i>
                                                                <UncontrolledTooltip placement="top" target={`blockout-${schedIdx}-${monthIdx}-${variantId}`}>
                                                                    Last time to make a booking for this timeslot.
                                                                    After this time, bookings are closed.
                                                                </UncontrolledTooltip>
                                                            </th>
                                                            <th style={{ minWidth: '120px' }}>
                                                                <i className="mdi mdi-check-circle me-1"></i>
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {monthData.timeslots && monthData.timeslots.length > 0 ? (() => {
                                                            // Group timeslots by date for better organization
                                                            const slotsByDate = {};
                                                            monthData.timeslots.forEach((slot, idx) => {
                                                                if (slot.startTime) {
                                                                    try {
                                                                        const date = new Date(slot.startTime);
                                                                        const dateKey = date.toDateString();
                                                                        if (!slotsByDate[dateKey]) {
                                                                            slotsByDate[dateKey] = { date, slots: [] };
                                                                        }
                                                                        slotsByDate[dateKey].slots.push({ ...slot, originalIdx: idx });
                                                                    } catch (e) {
                                                                        console.error('Error parsing date:', slot.startTime, e);
                                                                    }
                                                                }
                                                            });

                                                            // Sort dates
                                                            const sortedDates = Object.keys(slotsByDate).sort((a, b) => {
                                                                return slotsByDate[a].date - slotsByDate[b].date;
                                                            });

                                                            return sortedDates.map((dateKey, dateGroupIdx) => {
                                                                const { date, slots } = slotsByDate[dateKey];
                                                                // Sort slots within each date by time
                                                                const sortedSlots = slots.sort((a, b) => {
                                                                    const timeA = new Date(a.startTime).getTime();
                                                                    const timeB = new Date(b.startTime).getTime();
                                                                    return timeA - timeB;
                                                                });

                                                                return sortedSlots.map((slot, slotIdx) => {
                                                                    const isFirstSlotOfDay = slotIdx === 0;

                                                                    return (
                                                                        <tr
                                                                            key={`${dateGroupIdx}-${slot.originalIdx}`}
                                                                            style={{
                                                                                borderTop: isFirstSlotOfDay ? '2px solid #0d6efd' : '1px solid #dee2e6',
                                                                                backgroundColor: slotIdx % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                                                            }}
                                                                        >
                                                                            <td>
                                                                                {isFirstSlotOfDay && (
                                                                                    <div className="mb-1" style={{
                                                                                        fontWeight: 'bold',
                                                                                        color: '#0d6efd',
                                                                                        fontSize: '12px',
                                                                                        borderBottom: '1px solid #e0e0e0',
                                                                                        paddingBottom: '4px',
                                                                                        marginBottom: '6px'
                                                                                    }}>
                                                                                        <i className="mdi mdi-calendar me-1"></i>
                                                                                        {format(date, 'EEEE, MMM dd, yyyy')}
                                                                                    </div>
                                                                                )}
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <i className="mdi mdi-clock-outline text-primary" style={{ fontSize: '14px' }}></i>
                                                                                    <strong style={{ fontSize: '14px' }}>{formatTime12Hour(slot.startTime)}</strong>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <Badge color={getSkuTypeBadgeColor(skuTypeBadge)} style={{ fontSize: '11px' }}>
                                                                                    {skuTypeLabel}
                                                                                </Badge>
                                                                            </td>
                                                                            <td>
                                                                                <strong className="text-success" style={{ fontSize: '14px' }}>
                                                                                    {formatPrice(slot.sellingPrice, schedule.currency)}
                                                                                </strong>
                                                                            </td>
                                                                            <td>
                                                                                <span style={{
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '14px',
                                                                                    color: slot.inventory > 10 ? '#28a745' : slot.inventory > 0 ? '#ffc107' : '#dc3545'
                                                                                }}>
                                                                                    {slot.inventory || 0}
                                                                                </span>
                                                                            </td>
                                                                            <td className="small">
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                                                    <i className="mdi mdi-alarm text-warning" style={{ fontSize: '12px' }}></i>
                                                                                    {formatTime12Hour(slot.blockOutTimeUtc)}
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                {getAvailabilityBadge(slot.available, slot.inventory)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                });
                                                            }).flat();
                                                        })() : (
                                                            <tr>
                                                                <td colSpan="6" className="text-center text-muted">
                                                                    No timeslots available
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ))
                                    ) : (
                                        <Alert color="info" className="mb-0">
                                            No calendar data available
                                        </Alert>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    // Get available SKU types for a specific variant
    const getAvailableSkuTypesForVariant = (variant) => {
        if (!variant || !variant.skus || variant.skus.length === 0) return [];

        return variant.skus.map(sku => ({
            skuId: sku.skuId,
            title: sku.title,
            skuType: sku.skuType,
        }));
    };

    // Handle filter change for a specific variant
    const handleSkuTypeFilterChange = (variantId, value) => {
        setSelectedSkuTypes(prev => ({
            ...prev,
            [variantId]: value
        }));
    };

    // Get selected filter for a variant (defaults to 'ALL')
    const getSelectedSkuTypeForVariant = (variantId) => {
        return selectedSkuTypes[variantId] || 'ALL';
    };

    // JSON Preview state
    const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);
    const [jsonPreviewData, setJsonPreviewData] = useState(null);

    useEffect(() => {
        if (tourGroupId) {
            fetchPricing();
        }
    }, [tourGroupId, startDate, endDate, variantId, selectedCurrency]);

    const fetchPricing = () => {
        dispatch(fetchKlookLivePricingRequest(tourGroupId, startDate, endDate, variantId, selectedCurrency));
    };

    const formatPrice = (price, currency = null) => {
        if (!price) return '—';
        const currencyToUse = currency || selectedCurrency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyToUse,
        }).format(price);
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        try {
            const date = new Date(dateTimeStr);
            return format(date, 'MMM dd, yyyy HH:mm');
        } catch {
            return dateTimeStr;
        }
    };

    // Format date and time in 12-hour format with AM/PM
    const formatDateTime12Hour = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        try {
            const date = new Date(dateTimeStr);
            const dateStr = format(date, 'MMM dd, yyyy');
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            const minutesStr = minutes.toString().padStart(2, '0');
            return `${dateStr} ${hours12}:${minutesStr} ${ampm}`;
        } catch {
            return dateTimeStr;
        }
    };

    // Format time only in 12-hour format
    const formatTime12Hour = (dateTimeStr) => {
        if (!dateTimeStr) return '—';
        try {
            const date = new Date(dateTimeStr);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            const minutesStr = minutes.toString().padStart(2, '0');
            return `${hours12}:${minutesStr} ${ampm}`;
        } catch {
            return dateTimeStr;
        }
    };

    const getAvailabilityBadge = (available, inventory) => {
        if (!available) {
            return <Badge color="danger">Unavailable</Badge>;
        }
        if (inventory > 10) {
            return <Badge color="success">Available ({inventory})</Badge>;
        } else if (inventory > 0) {
            return <Badge color="warning">Limited ({inventory})</Badge>;
        }
        return <Badge color="danger">Sold Out</Badge>;
    };

    if (klookLivePricingLoading) {
        return (
            <Card>
                <CardBody className="text-center py-5">
                    <Spinner color="primary" className="me-2" />
                    <span>Loading live pricing from provider...</span>
                </CardBody>
            </Card>
        );
    }

    if (!pricingData || !pricingData.variants || pricingData.variants.length === 0) {
        return (
            <Card>
                <CardBody>
                    <Alert color="info">
                        <i className="mdi mdi-information me-2"></i>
                        No live pricing data available. Make sure the tour group is connected to provider.
                    </Alert>
                </CardBody>
            </Card>
        );
    }

    return (
        <div>
            <Card className="mb-3">
                <CardHeader>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h5 className="mb-0">
                                <i className="mdi mdi-currency-usd me-2"></i>
                                Live Provider Pricing
                            </h5>
                        </Col>
                        <Col md={6}>
                            <Row className="g-2">
                                <Col md={3}>
                                    <Label className="small">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setSelectedDate(null); // Clear date filter when range changes
                                        }}
                                        size="sm"
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="small">End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setSelectedDate(null); // Clear date filter when range changes
                                        }}
                                        size="sm"
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="small">Currency</Label>
                                    <Select
                                        value={availableCurrencies.find(c => c.code === selectedCurrency) ? {
                                            value: selectedCurrency,
                                            label: availableCurrencies.find(c => c.code === selectedCurrency)?.label || `${selectedCurrency} (${availableCurrencies.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency})`
                                        } : null}
                                        onChange={(option) => {
                                            if (option) {
                                                setSelectedCurrency(option.value);
                                            }
                                        }}
                                        options={availableCurrencies.map(c => ({
                                            value: c.code,
                                            label: c.label || `${c.code} (${c.symbol || c.code})`,
                                        }))}
                                        isSearchable
                                        isClearable={false}
                                        placeholder={loadingCurrencies ? "Loading currencies..." : "Search currency..."}
                                        isLoading={loadingCurrencies}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '31px',
                                                fontSize: '14px',
                                            }),
                                            option: (base) => ({
                                                ...base,
                                                fontSize: '14px',
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                fontSize: '14px',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                        }}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        filterOption={(option, searchText) => {
                                            const label = option.label || '';
                                            const value = option.value || '';
                                            const search = searchText.toLowerCase();
                                            return label.toLowerCase().includes(search) ||
                                                value.toLowerCase().includes(search);
                                        }}
                                    />
                                </Col>
                                <Col md={2}>
                                    <Label className="small d-block">&nbsp;</Label>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={fetchPricing}
                                        className="w-100"
                                    >
                                        <i className="mdi mdi-refresh"></i> Refresh
                                    </Button>
                                </Col>
                                <Col md={2}>
                                    <Label className="small d-block">&nbsp;</Label>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setViewMode(viewMode === 'calendar' ? 'table' : 'calendar');
                                            setSelectedDate(null);
                                        }}
                                        className="w-100"
                                    >
                                        <i className={`mdi mdi-${viewMode === 'calendar' ? 'table' : 'calendar'}`}></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {/* View Mode Tabs */}
                    <Row className="mt-3">
                        <Col>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({ active: viewMode === 'calendar' })}
                                        onClick={() => {
                                            setViewMode('calendar');
                                            setSelectedDate(null);
                                        }}
                                    >
                                        <i className="mdi mdi-calendar me-1"></i>
                                        Calendar View
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        style={{ cursor: "pointer" }}
                                        className={classnames({ active: viewMode === 'table' })}
                                        onClick={() => setViewMode('table')}
                                    >
                                        <i className="mdi mdi-table me-1"></i>
                                        Table View
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Col>
                    </Row>
                    {/* Selected Date Filter Indicator */}
                    {selectedDate && (
                        <Row className="mt-2">
                            <Col>
                                <Alert color="info" className="mb-0 py-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <i className="mdi mdi-filter me-2"></i>
                                            Showing prices for: <strong>{format(selectedDate, 'MMM dd, yyyy')}</strong>
                                        </span>
                                        <Button
                                            color="link"
                                            size="sm"
                                            onClick={clearDateFilter}
                                            className="p-0"
                                        >
                                            <i className="mdi mdi-close me-1"></i>
                                            Clear Filter
                                        </Button>
                                    </div>
                                </Alert>
                            </Col>
                        </Row>
                    )}
                </CardHeader>
                <CardBody>
                    {viewMode === 'calendar' ? (
                        <div>
                            <Alert color="info" className="mb-3">
                                <i className="mdi mdi-information me-2"></i>
                                Click on any date to view detailed pricing for that day. Prices shown are minimum prices across all variants.
                            </Alert>
                            <FullCalendar
                                plugins={[BootstrapTheme, dayGridPlugin, interactionPlugin]}
                                themeSystem="bootstrap"
                                headerToolbar={{
                                    left: 'prev,today',
                                    center: 'title',
                                    right: 'next',
                                }}
                                initialView="dayGridMonth"
                                selectable={true}
                                dateClick={handleDateClick}
                                events={calendarEvents}
                                eventContent={(arg) => {
                                    const { title, event } = arg;
                                    const { minPrice, maxPrice, currency, count, variantCount, available } = event.extendedProps;
                                    return (
                                        <div style={{
                                            padding: '2px 4px',
                                            fontSize: '11px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            <div style={{ fontWeight: 'bold' }}>{title}</div>
                                            {minPrice !== maxPrice && (
                                                <div style={{ fontSize: '9px', opacity: 0.9 }}>
                                                    - {formatPrice(maxPrice, currency)}
                                                </div>
                                            )}
                                            {variantCount > 1 && (
                                                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                                                    {variantCount} variants
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                                height="auto"
                                dayMaxEvents={3}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-3">
                                <small className="text-muted">
                                    Date Range: {formatDateTime(startDate)} - {formatDateTime(endDate)}
                                    {pricingData.fetchedAt && (
                                        <span className="ms-2">
                                            (Fetched: {formatDateTime(pricingData.fetchedAt)})
                                        </span>
                                    )}
                                    {selectedDate && (
                                        <span className="ms-2">
                                            • Filtered: {format(selectedDate, 'MMM dd, yyyy')}
                                        </span>
                                    )}
                                </small>
                            </div>

                            {pricingData.variants.map((variant, idx) => {
                                const variantId = variant.variantId || `variant-${idx}`;
                                const availableSkuTypes = getAvailableSkuTypesForVariant(variant);
                                const selectedSkuType = getSelectedSkuTypeForVariant(variantId);

                                return (
                                    <Card key={idx} className="mb-3 border">
                                        <CardHeader className="bg-light">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <h6 className="mb-0">
                                                        {variant.variantName || `Variant ${idx + 1}`}
                                                    </h6>
                                                    <small className="text-muted">
                                                        Activity: {variant.activityTitle} (ID: {variant.activityId})
                                                        {variant.packageName && ` • Package: ${variant.packageName}`}
                                                    </small>
                                                </Col>
                                                <Col md="auto">
                                                    <Button
                                                        color="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setJsonPreviewData(variant);
                                                            setJsonPreviewOpen(true);
                                                        }}
                                                    >
                                                        <i className="mdi mdi-code-json me-1"></i>
                                                        View JSON
                                                    </Button>
                                                </Col>
                                                {variant.priceSummary && (
                                                    <Col md="auto">
                                                        <div className="text-end">
                                                            <div className="h5 mb-0 text-primary">
                                                                {formatPrice(variant.priceSummary.minPrice, variant.currency)}
                                                                {variant.priceSummary.maxPrice !== variant.priceSummary.minPrice && (
                                                                    <span className="text-muted small">
                                                                        {' - '}
                                                                        {formatPrice(variant.priceSummary.maxPrice, variant.currency)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <small className="text-muted">
                                                                {variant.priceSummary.totalAvailableSlots} available slots
                                                            </small>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </CardHeader>
                                        <CardBody>
                                            {variant.error ? (
                                                <Alert color="danger">
                                                    <i className="mdi mdi-alert-circle me-2"></i>
                                                    {variant.error}
                                                </Alert>
                                            ) : (
                                                <>
                                                    {/* Price Summary */}
                                                    {variant.priceSummary && (
                                                        <Row className="mb-3">
                                                            <Col md={3}>
                                                                <div className="text-center p-2 bg-light rounded">
                                                                    <div className="small text-muted">Min Price</div>
                                                                    <div className="h6 mb-0">
                                                                        {formatPrice(variant.priceSummary.minPrice, variant.currency)}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md={3}>
                                                                <div className="text-center p-2 bg-light rounded">
                                                                    <div className="small text-muted">Max Price</div>
                                                                    <div className="h6 mb-0">
                                                                        {formatPrice(variant.priceSummary.maxPrice, variant.currency)}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md={3}>
                                                                <div className="text-center p-2 bg-light rounded">
                                                                    <div className="small text-muted">Avg Price</div>
                                                                    <div className="h6 mb-0">
                                                                        {formatPrice(variant.priceSummary.avgPrice, variant.currency)}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col md={3}>
                                                                <div className="text-center p-2 bg-light rounded">
                                                                    <div className="small text-muted">Available Slots</div>
                                                                    <div className="h6 mb-0 text-success">
                                                                        {variant.priceSummary.totalAvailableSlots}
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    )}

                                                    {/* SKUs */}
                                                    {variant.skus && variant.skus.length > 0 && (
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">SKUs</h6>
                                                            <Table size="sm" responsive>
                                                                <thead>
                                                                    <tr>
                                                                        <th>SKU ID</th>
                                                                        <th>Title</th>
                                                                        <th>Type</th>
                                                                        <th>Age Range</th>
                                                                        <th>Pax Range</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {variant.skus.map((sku, skuIdx) => (
                                                                        <tr key={skuIdx}>
                                                                            <td>{sku.skuId}</td>
                                                                            <td>{sku.title}</td>
                                                                            <td>
                                                                                <Badge color="info">{sku.skuType}</Badge>
                                                                            </td>
                                                                            <td>
                                                                                {sku.minAge === 0 && sku.maxAge === 0
                                                                                    ? 'Any'
                                                                                    : `${sku.minAge || 0}-${sku.maxAge || '∞'}`}
                                                                            </td>
                                                                            <td>
                                                                                {sku.minPax || 0} - {sku.maxPax || '∞'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    )}

                                                    {/* Schedules */}
                                                    {renderVariantSchedules(variant, variantId, availableSkuTypes, selectedSkuType)}

                                                    {/* Unavailable Dates */}
                                                    {(() => {
                                                        const unavailableDates = getUnavailableDates(variant);
                                                        if (unavailableDates.length === 0) return null;

                                                        // Group consecutive dates for better readability
                                                        const groupedDates = [];
                                                        let currentGroup = null;

                                                        unavailableDates.forEach((date, idx) => {
                                                            if (!currentGroup) {
                                                                currentGroup = { start: date, end: date, count: 1 };
                                                            } else {
                                                                const prevDate = unavailableDates[idx - 1];
                                                                const daysDiff = Math.floor((date - prevDate) / (1000 * 60 * 60 * 24));

                                                                if (daysDiff === 1) {
                                                                    // Consecutive date
                                                                    currentGroup.end = date;
                                                                    currentGroup.count++;
                                                                } else {
                                                                    // Gap found, save current group and start new one
                                                                    groupedDates.push(currentGroup);
                                                                    currentGroup = { start: date, end: date, count: 1 };
                                                                }
                                                            }
                                                        });

                                                        if (currentGroup) {
                                                            groupedDates.push(currentGroup);
                                                        }

                                                        return (
                                                            <div className="mt-4 pt-3 border-top">
                                                                <Alert color="warning" className="mb-3">
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <i className="mdi mdi-calendar-remove me-2"></i>
                                                                        <strong>
                                                                            Unavailable Dates ({unavailableDates.length} date{unavailableDates.length !== 1 ? 's' : ''})
                                                                        </strong>
                                                                    </div>
                                                                    <small className="text-muted">
                                                                        The following dates within the selected range ({format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}) do not have any pricing or availability:
                                                                    </small>
                                                                </Alert>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: '8px',
                                                                    maxHeight: '200px',
                                                                    overflowY: 'auto',
                                                                    padding: '10px',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #dee2e6'
                                                                }}>
                                                                    {groupedDates.map((group, groupIdx) => (
                                                                        <Badge
                                                                            key={groupIdx}
                                                                            color="secondary"
                                                                            style={{
                                                                                padding: '6px 10px',
                                                                                fontSize: '12px',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px'
                                                                            }}
                                                                        >
                                                                            {group.count === 1 ? (
                                                                                <>
                                                                                    <i className="mdi mdi-calendar-blank"></i>
                                                                                    {format(group.start, 'MMM dd, yyyy')}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <i className="mdi mdi-calendar-range"></i>
                                                                                    {format(group.start, 'MMM dd')} - {format(group.end, 'MMM dd, yyyy')}
                                                                                    <span className="ms-1">({group.count} days)</span>
                                                                                </>
                                                                            )}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                                {groupedDates.length > 10 && (
                                                                    <small className="text-muted mt-2 d-block">
                                                                        <i className="mdi mdi-information me-1"></i>
                                                                        Showing {groupedDates.length} date range{groupedDates.length !== 1 ? 's' : ''}. Scroll to see all.
                                                                    </small>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </>
                                            )}
                                        </CardBody>
                                    </Card>
                                );
                            })}

                            {/* Unmapped Klook Packages */}
                            {pricingData.unmappedPackages && pricingData.unmappedPackages.length > 0 && (
                                <Card className="mt-4 border-info">
                                    <CardHeader className="bg-info text-white">
                                        <div className="d-flex align-items-center">
                                            <i className="mdi mdi-package-variant-closed me-2"></i>
                                            <h6 className="mb-0">
                                                Additional Provider Packages Available
                                            </h6>
                                            <Badge color="light" className="ms-2 text-info">
                                                {pricingData.unmappedPackages.reduce((sum, act) => sum + act.packages.length, 0)} package{pricingData.unmappedPackages.reduce((sum, act) => sum + act.packages.length, 0) !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <Alert color="info" className="mb-3">
                                            <i className="mdi mdi-information me-2"></i>
                                            The following packages are available from the provider but are not yet mapped to TYL variants. You can add them using the "Import from Provider" feature.
                                        </Alert>
                                        {pricingData.unmappedPackages.map((activityData, actIdx) => (
                                            <div key={actIdx} className="mb-4">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="mb-0">
                                                        <i className="mdi mdi-map-marker me-2 text-primary"></i>
                                                        {activityData.activityTitle}
                                                    </h6>
                                                    <Badge color="secondary" className="ms-2">
                                                        Activity ID: {activityData.activityId}
                                                    </Badge>
                                                    <Badge color="info" className="ms-2">
                                                        {activityData.packages.length} package{activityData.packages.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <Table size="sm" bordered responsive striped>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: '80px' }}>Package ID</th>
                                                            <th>Package Name</th>
                                                            <th style={{ width: '100px' }}>SKUs</th>
                                                            <th style={{ width: '120px' }}>Pax Range</th>
                                                            <th style={{ width: '100px' }}>Type</th>
                                                            <th style={{ width: '120px' }}>Features</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {activityData.packages.map((pkg, pkgIdx) => (
                                                            <tr key={pkgIdx}>
                                                                <td>
                                                                    <strong>{pkg.packageId}</strong>
                                                                </td>
                                                                <td>
                                                                    <div style={{ fontWeight: '500' }}>
                                                                        {pkg.packageName}
                                                                    </div>
                                                                </td>
                                                                <td className="text-center">
                                                                    <Badge color="info">
                                                                        {pkg.skuCount} SKU{pkg.skuCount !== 1 ? 's' : ''}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-center">
                                                                    {pkg.minPax || 0} - {pkg.maxPax || '∞'}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-1">
                                                                        {pkg.isOpenDate && (
                                                                            <Badge color="success" style={{ fontSize: '10px' }}>
                                                                                Open Date
                                                                            </Badge>
                                                                        )}
                                                                        {pkg.instant && (
                                                                            <Badge color="warning" style={{ fontSize: '10px' }}>
                                                                                Instant
                                                                            </Badge>
                                                                        )}
                                                                        {pkg.ticketType && (
                                                                            <Badge color="secondary" style={{ fontSize: '10px' }}>
                                                                                Type: {pkg.ticketType}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="small">
                                                                        {pkg.voucherUsage && (
                                                                            <div>
                                                                                <i className="mdi mdi-ticket me-1"></i>
                                                                                {pkg.voucherUsage}
                                                                            </div>
                                                                        )}
                                                                        {pkg.cancellationType && (
                                                                            <div>
                                                                                <i className="mdi mdi-cancel me-1"></i>
                                                                                {pkg.cancellationType}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ))}
                                    </CardBody>
                                </Card>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* JSON Preview Modal */}
            <Modal isOpen={jsonPreviewOpen} toggle={() => setJsonPreviewOpen(false)} size="xl">
                <ModalHeader toggle={() => setJsonPreviewOpen(false)}>
                    JSON Response Preview
                </ModalHeader>
                <ModalBody>
                    <div style={{
                        maxHeight: '70vh',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '0.25rem',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {JSON.stringify(jsonPreviewData, null, 2)}
                        </pre>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => {
                        if (jsonPreviewData) {
                            navigator.clipboard.writeText(JSON.stringify(jsonPreviewData, null, 2));
                            alert('JSON copied to clipboard!');
                        }
                    }}>
                        <i className="mdi mdi-content-copy me-1"></i>
                        Copy to Clipboard
                    </Button>
                    <Button color="primary" onClick={() => setJsonPreviewOpen(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default LiveKlookPricing;
