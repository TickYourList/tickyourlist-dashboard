import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Input, Label } from 'reactstrap';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';

import '@fullcalendar/bootstrap/main.css';
import '@fullcalendar/daygrid/main.css';
import OnBulkUpdate from './onBulkUpdate';
import { addDefaultPricing } from 'store/CalendarPricingAndAvailability/actions';

import { addMonths } from "date-fns";

/**
 * @param {Array} pricingData 
 * @returns {Array} 
 */
export const generatePricingEvents = (pricingData = []) => {
  const events = [];
  const today = new Date();
  const endDate = addMonths(today, 6);

  let current = new Date(today);

  while (current <= endDate) {
    const weekday = current.getDay(); 

    pricingData.forEach((rule) => {
      if (rule.conditions?.weekdays?.includes(weekday)) {
        rule.dayPricing.forEach((pricing) => {
          const adultPrice = pricing.prices.find((p) => p.type === "adult")?.finalPrice;
          const childPrice = pricing.prices.find((p) => p.type === "child")?.finalPrice;

          events.push({
            id: `${rule.tag}-${current.toISOString()}-${pricing.currency}`,
            title: `${rule.name} (${pricing.currency})`,
            start: new Date(current),
            end: new Date(current),
            allDay: true,
            extendedProps: {
              availability: rule.isAvailable ? "Available" : "Unavailable",
              tag: rule.tag,
              currency: pricing.currency,
              adultPrice,
              childPrice,
              description: rule.description || "",
            },
          });
        });
      }
    });

    current.setDate(current.getDate() + 1); // move to next day
  }

  return events;
};

const Breadcrumbs = ({ title }) => (
  <div className="mb-4">
    <h1 className="h4">{title}</h1>
  </div>
);
const renderEventContent = (eventInfo) => {
  const { availability, tag, currency, adultPrice, childPrice } = eventInfo.event.extendedProps;
  return (
    <div className="p-1 text-dark small">
      <div className="fw-bold">{eventInfo.event.title}</div>
      <div className="text-muted">{availability}</div>
      {adultPrice && <div>Adult: {adultPrice} {currency}</div>}
      {childPrice && <div>Child: {childPrice} {currency}</div>}
      {tag && <div className="text-primary">{tag}</div>}
    </div>
  );
};

const CalendarPricingAndAvailability = () => {
  document.title = 'Pricing Calendar | Scrollit';

  const [model, setModel] = useState(false);
  const [events, setEvents] = useState([]);

  const pricingData = useSelector(state => state.CalendarPricing.pricing);

  useEffect(() => {
    if (pricingData && Array.isArray(pricingData)) {
      const mappedEvents = pricingData.map((item, idx) => ({
        id: item._id || idx,
        title: item.name || "Pricing Rule",
        start: item.startDate || item.conditions?.dateRange?.[0]?.start || new Date(),
        end: item.endDate || item.conditions?.dateRange?.[0]?.end || new Date(),
        availability: item.isAvailable ? "Available" : "Unavailable",
        tag: item.tag || "",
      }));
      setEvents(mappedEvents);
    }
  }, [pricingData]);

  const handleDateClick = (arg) => {
    console.log('Date clicked: ', arg.dateStr);
  };

  const toggleModel = () => {
    setModel(!model);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1 text-dark">
        <div className="fw-bold fs-6">{eventInfo.event.title}</div>
        <div className="text-muted small">{eventInfo.event.extendedProps.availability}</div>
        {eventInfo.event.extendedProps.tag && (
          <div className="text-primary small mt-1">{eventInfo.event.extendedProps.tag}</div>
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <style>{`
        .fc .fc-col-header-cell-cushion {
          color: #6c757d; 
          font-weight: 500;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .fc .fc-daygrid-day-top {
          justify-content: flex-start;
        }
        .fc .fc-daygrid-day-number {
          padding: 0.5em 0.5em 0 0.5em;
        }
      `}</style>

      <div className="page-content">
        <OnBulkUpdate isOpen={model} toggle={toggleModel} addDefaultPricing={addDefaultPricing} />
        <Container fluid={true}>
          <Breadcrumbs title="Calendar Pricing & Availability" />
          <Row>
            <Col lg={3}>
              <Card>
                <CardHeader className="bg-light">
                  <h5 className="mb-0">Select Tour & Variant</h5>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <Label htmlFor="tour-select">Tour</Label>
                    <Input type="select" id="tour-select">
                      <option>Select a tour...</option>
                    </Input>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="variant-select">Variant</Label>
                    <Input type="select" id="variant-select">
                      <option>Select variant...</option>
                    </Input>
                  </div>
                  <Button
                    color="primary"
                    className="w-100"
                    onClick={() => setModel(true)}
                  >
                    <i className="mdi mdi-cogs me-1"></i>
                    Bulk Update Pricing
                  </Button>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="bg-light">
                  <h5 className="mb-0">Quick Actions</h5>
                </CardHeader>
                <CardBody className="d-flex flex-column gap-2">
                  <Button outline color="secondary" className="w-100 text-start">Copy from Date</Button>
                  <Button outline color="secondary" className="w-100 text-start">Apply Seasonal Pricing</Button>
                </CardBody>
              </Card>
            </Col>

            <Col lg={9}>
              <Card>
                <CardBody>
                  <FullCalendar
                    plugins={[BootstrapTheme, dayGridPlugin, interactionPlugin]}
                    themeSystem="bootstrap"
                    headerToolbar={{
                      left: 'prev',
                      center: 'title',
                      right: 'next',
                    }}
                    initialView="dayGridMonth"
                    selectable={true}
                    dateClick={handleDateClick}
                    events={events}   
                    eventContent={renderEventContent}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CalendarPricingAndAvailability;
