import React, { useEffect, useState } from "react";
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
} from "reactstrap";
import { fetchKlookLivePricingRequest } from "store/tickyourlist/travelTourGroup/action";
import { format } from "date-fns";

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

    const pricingData = klookLivePricing[tourGroupId];

    useEffect(() => {
        if (tourGroupId) {
            fetchPricing();
        }
    }, [tourGroupId, startDate, endDate, variantId]);

    const fetchPricing = () => {
        dispatch(fetchKlookLivePricingRequest(tourGroupId, startDate, endDate, variantId));
    };

    const formatPrice = (price, currency = 'USD') => {
        if (!price) return '—';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
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
                    <span>Loading live pricing from Klook...</span>
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
                        No live pricing data available. Make sure the tour group is connected to Klook.
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
                                Live Klook Pricing
                            </h5>
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col md={5}>
                                    <Label className="small">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        size="sm"
                                    />
                                </Col>
                                <Col md={5}>
                                    <Label className="small">End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        size="sm"
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
                                        <i className="mdi mdi-refresh"></i>
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody>
                    <div className="mb-3">
                        <small className="text-muted">
                            Date Range: {formatDateTime(startDate)} - {formatDateTime(endDate)}
                            {pricingData.fetchedAt && (
                                <span className="ms-2">
                                    (Fetched: {formatDateTime(pricingData.fetchedAt)})
                                </span>
                            )}
                        </small>
                    </div>

                    {pricingData.variants.map((variant, idx) => (
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
                                        {variant.schedules && variant.schedules.length > 0 && (
                                            <div>
                                                <h6 className="mb-2">Pricing Schedule</h6>
                                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                    {variant.schedules.map((schedule, schedIdx) => (
                                                        <div key={schedIdx} className="mb-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <strong>SKU {schedule.skuId}</strong>
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
                                                                        <Table size="sm" bordered responsive>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Date & Time</th>
                                                                                    <th>Price</th>
                                                                                    <th>Inventory</th>
                                                                                    <th>Block Out Time</th>
                                                                                    <th>Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {monthData.timeslots && monthData.timeslots.length > 0 ? (
                                                                                    monthData.timeslots.map((slot, slotIdx) => (
                                                                                        <tr key={slotIdx}>
                                                                                            <td>{formatDateTime(slot.startTime)}</td>
                                                                                            <td>
                                                                                                <strong>
                                                                                                    {formatPrice(slot.sellingPrice, schedule.currency)}
                                                                                                </strong>
                                                                                            </td>
                                                                                            <td>{slot.inventory || 0}</td>
                                                                                            <td className="small">
                                                                                                {formatDateTime(slot.blockOutTimeUtc)}
                                                                                            </td>
                                                                                            <td>
                                                                                                {getAvailabilityBadge(slot.available, slot.inventory)}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan="5" className="text-center text-muted">
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
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </CardBody>
            </Card>
        </div>
    );
};

export default LiveKlookPricing;
