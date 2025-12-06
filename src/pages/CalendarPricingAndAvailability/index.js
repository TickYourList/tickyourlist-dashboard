import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Input, Label, Spinner, Alert, Badge } from 'reactstrap';
import axios from "axios";
import Select from 'react-select';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';

import '@fullcalendar/bootstrap/main.css';
import '@fullcalendar/daygrid/main.css';
import OnBulkUpdate from './onBulkUpdate';
import { addDefaultPricing } from 'store/CalendarPricingAndAvailability/actions';
import { getCities } from 'store/travelCity/action';
import { 
  fetchTourGroupsByCityRequest,
  fetchVariantsByTourRequest,
  fetchPricingRulesRequest,
  searchTourGroupsRequest
} from 'store/tickyourlist/travelTourGroup/action';

const Breadcrumbs = ({ title }) => (
  <div className="mb-4">
    <h1 className="h4">{title}</h1>
  </div>
);

const CalendarPricingAndAvailability = () => {
  document.title = 'Pricing Calendar | Scrollit';

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [model, setModel] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTour, setSelectedTour] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Redux selectors
  const pricingData = useSelector(state => state.CalendarPricing?.pricing || []);
  const cities = useSelector(state => state.travelCity?.cities || []);
  const tourGroupsByCity = useSelector(state => {
    console.log('🔍 Component: Full Redux State:', state);
    console.log('🔍 Component: tourGroup state:', state.tourGroup);
    console.log('🔍 Component: tourGroupsByCity:', state.tourGroup?.tourGroupsByCity);
    return state.tourGroup?.tourGroupsByCity || [];
  });
  const searchedTourGroups = useSelector(state => state.tourGroup?.searchedTourGroups || []);
  const variants = useSelector(state => state.tourGroup?.variantsByTour || []);
  const pricingRules = useSelector(state => state.tourGroup?.pricingRules || []);
  const loading = useSelector(state => state.tourGroup?.loading || false);

  // Fetch cities on mount using Redux
  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

  // Fetch tours when city is selected (using Redux)
  useEffect(() => {
    if (selectedCity) {
      console.log('🟡 Component: Dispatching fetchTourGroupsByCityRequest for:', selectedCity);
      dispatch(fetchTourGroupsByCityRequest(selectedCity));
    } else {
      setSelectedTour('');
      setSelectedVariant('');
    }
  }, [selectedCity, dispatch]);

  // Fetch variants when tour is selected (using Redux)
  useEffect(() => {
    if (selectedTour) {
      console.log('🟡 Component: Dispatching fetchVariantsByTourRequest for:', selectedTour);
      dispatch(fetchVariantsByTourRequest(selectedTour));
    } else {
      setSelectedVariant('');
    }
  }, [selectedTour, dispatch]);

  // Fetch pricing rules when variant is selected (using Redux)
  useEffect(() => {
    if (selectedVariant) {
      console.log('🟡 Component: Dispatching fetchPricingRulesRequest for:', selectedVariant);
      dispatch(fetchPricingRulesRequest(selectedVariant));
    } else {
      setEvents([]);
    }
  }, [selectedVariant, dispatch]);

  // Generate calendar events when pricing rules change
  useEffect(() => {
    if (pricingRules && pricingRules.length > 0) {
      console.log('🎨 Component: Generating calendar events from rules:', pricingRules);
      const calendarEvents = generateEventsFromRules(pricingRules);
      setEvents(calendarEvents);
    }
  }, [pricingRules]);


  const generateEventsFromRules = (rules) => {
    const events = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Show 6 months ahead

    // Sort rules by priority (highest first)
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    let currentDate = new Date(today);
    while (currentDate <= endDate) {
      const weekday = currentDate.getDay();
      const month = currentDate.getMonth() + 1;

      // Find the highest priority rule that matches this date
      const matchingRule = sortedRules.find(rule => {
        if (!rule.isActive) return false;

        const conditions = rule.conditions || {};
        
        // Check weekday condition
        if (conditions.weekdays && conditions.weekdays.length > 0) {
          if (!conditions.weekdays.includes(weekday)) return false;
        }

        // Check month condition
        if (conditions.months && conditions.months.length > 0) {
          if (!conditions.months.includes(month)) return false;
        }

        // Check date ranges
        if (conditions.dateRanges && conditions.dateRanges.length > 0) {
          const inRange = conditions.dateRanges.some(range => {
            const start = new Date(range.startDate);
            const end = new Date(range.endDate);
            return currentDate >= start && currentDate <= end;
          });
          if (!inRange) return false;
        }

        // If no conditions, it's a default rule
        return true;
      });

      if (matchingRule) {
        const dayPricing = matchingRule.dayPricing?.[0];
        const adultPrice = dayPricing?.prices?.find(p => p.type === 'adult' || p.type === 'ADULT')?.finalPrice;
        const childPrice = dayPricing?.prices?.find(p => p.type === 'child' || p.type === 'CHILD')?.finalPrice;

        events.push({
          id: `${matchingRule._id}-${currentDate.toISOString().split('T')[0]}`,
          title: matchingRule.name || matchingRule.tag,
          start: new Date(currentDate),
          end: new Date(currentDate),
          allDay: true,
          backgroundColor: getPriorityColor(matchingRule.priority),
          borderColor: getPriorityColor(matchingRule.priority),
          extendedProps: {
            availability: matchingRule.isAvailable !== false ? "Available" : "Unavailable",
            tag: matchingRule.tag,
            priority: matchingRule.priority,
            currency: dayPricing?.currency || 'USD',
            adultPrice,
            childPrice,
            ruleId: matchingRule._id,
            description: matchingRule.description || "",
          },
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  };

  const getPriorityColor = (priority) => {
    if (priority >= 90) return '#dc3545'; // Red - Emergency
    if (priority >= 51) return '#fd7e14'; // Orange - Special
    if (priority >= 31) return '#ffc107'; // Yellow - Complex
    if (priority >= 21) return '#0dcaf0'; // Cyan - Seasonal
    if (priority >= 11) return '#198754'; // Green - Weekly
    return '#6c757d'; // Gray - Default
  };

  const renderEventContent = (eventInfo) => {
    const { availability, currency, adultPrice, childPrice, priority, tag } = eventInfo.event.extendedProps;
    
    return (
      <div className="p-1 text-white small" style={{ fontSize: '0.75rem' }}>
        <div className="fw-bold text-truncate">{eventInfo.event.title}</div>
        {adultPrice && (
          <div className="text-truncate">
            Adult: {currency} {adultPrice}
          </div>
        )}
        {childPrice && (
          <div className="text-truncate">
            Child: {currency} {childPrice}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-1">
          <small className="text-truncate">{tag}</small>
          <Badge 
            color="light" 
            className="text-dark" 
            style={{ fontSize: '0.65rem' }}
          >
            P{priority}
          </Badge>
        </div>
      </div>
    );
  };

  const handleDateClick = (arg) => {
    if (!selectedVariant) {
      alert('Please select a variant first');
      return;
    }
    console.log('Date clicked:', arg.dateStr);
    // Could open a modal to edit pricing for this specific date
  };

  const handleEventClick = (clickInfo) => {
    const { ruleId, tag } = clickInfo.event.extendedProps;
    console.log('Event clicked - Rule:', tag, 'ID:', ruleId);
    // Could open rule details or edit modal
  };

  const toggleModel = () => {
    setModel(!model);
  };

  const handleQuickCopy = () => {
    if (!selectedVariant) {
      alert('Please select a variant first');
      return;
    }
    // Implement copy from date functionality
    alert('Copy from Date feature - Coming soon');
  };

  const handleSeasonalPricing = () => {
    if (!selectedVariant) {
      alert('Please select a variant first');
      return;
    }
    // Navigate to seasonal pricing setup
    alert('Apply Seasonal Pricing - Coming soon');
  };

  const handleManagePricing = () => {
    if (!selectedVariant) {
      alert('Please select a variant first');
      return;
    }
    navigate(`/pricing-management/${selectedVariant}`);
  };

  const handleSearchTourGroups = () => {
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearching(true);
    dispatch(searchTourGroupsRequest(searchQuery.trim(), selectedCity || null));
  };

  // Handle search results
  useEffect(() => {
    if (searchedTourGroups.length > 0) {
      setIsSearching(false);
    }
  }, [searchedTourGroups]);

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
          font-weight: 500;
        }
        .fc .fc-event {
          border-radius: 4px;
          padding: 2px;
          margin: 1px;
        }
        .fc .fc-daygrid-event {
          white-space: normal;
        }
        .fc-event-title {
          overflow: hidden;
        }
      `}</style>

      <div className="page-content">
        <OnBulkUpdate 
          isOpen={model} 
          toggle={toggleModel} 
          addDefaultPricing={addDefaultPricing}
          selectedVariant={selectedVariant}
        />
        
        <Container fluid={true}>
          <Breadcrumbs title="Calendar Pricing & Availability" />

          {error && (
            <Alert color="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row>
            <Col lg={3}>
              <Card>
                <CardHeader className="bg-light">
                  <h5 className="mb-0">Select Location & Tour</h5>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <Label htmlFor="city-select">
                      City <span className="text-danger">*</span>
                    </Label>
                    <Select
                      id="city-select"
                      isClearable
                      isSearchable
                      placeholder="Search and select a city..."
                      options={
                        Array.isArray(cities)
                          ? cities.map(city => ({
                              value: city.cityCode,
                              label: `${city.cityName} (${city.cityCode})`,
                            }))
                          : []
                      }
                      value={
                        selectedCity
                          ? {
                              value: selectedCity,
                              label: cities.find(c => c.cityCode === selectedCity)
                                ? `${cities.find(c => c.cityCode === selectedCity).cityName} (${selectedCity})`
                                : selectedCity
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : "";
                        setSelectedCity(selectedValue);
                      }}
                      isDisabled={cities.length === 0}
                    />
                    {cities.length === 0 && (
                      <small className="text-muted mt-2 d-block">
                        Loading cities...
                      </small>
                    )}
                  </div>

                  {/* Search Tour Groups by Name */}
                  <div className="mb-3">
                    <Label htmlFor="tour-search">
                      Search Tour Group by Name
                    </Label>
                    <div className="d-flex gap-2">
                      <Input
                        id="tour-search"
                        type="text"
                        placeholder="Enter tour group name to search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            handleSearchTourGroups();
                          }
                        }}
                        disabled={loading}
                      />
                      <Button
                        color="primary"
                        onClick={handleSearchTourGroups}
                        disabled={!searchQuery.trim() || loading}
                      >
                        <i className="bx bx-search"></i>
                      </Button>
                    </div>
                    {isSearching && (
                      <small className="text-info mt-2 d-block">
                        <Spinner size="sm" className="me-1" />
                        Searching...
                      </small>
                    )}
                    {searchedTourGroups.length > 0 && (
                      <div className="mt-2">
                        <small className="text-success d-block mb-2">
                          Found {searchedTourGroups.length} tour group(s)
                        </small>
                        <Select
                          isClearable
                          placeholder="Select from search results..."
                          options={searchedTourGroups.map(tour => ({
                            value: tour._id || tour.id,
                            label: tour.name,
                          }))}
                          onChange={(selectedOption) => {
                            if (selectedOption) {
                              setSelectedTour(selectedOption.value);
                              setSearchQuery('');
                              setIsSearching(false);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label htmlFor="tour-select">
                      Tour Group <span className="text-danger">*</span>
                    </Label>
                    <Select
                      id="tour-select"
                      isClearable
                      isSearchable
                      placeholder={selectedCity ? "Search and select a tour..." : "Select city first"}
                      options={(() => {
                        console.log('🎨 Rendering: tourGroupsByCity:', tourGroupsByCity);
                        console.log('🎨 Rendering: Is Array?', Array.isArray(tourGroupsByCity));
                        const options = Array.isArray(tourGroupsByCity)
                          ? tourGroupsByCity.map(tour => ({
                              value: tour.id,
                              label: tour.name,
                            }))
                          : [];
                        console.log('🎨 Rendering: Dropdown options:', options);
                        return options;
                      })()}
                      value={
                        selectedTour
                          ? {
                              value: selectedTour,
                              label: tourGroupsByCity.find(t => t.id === selectedTour)?.name || selectedTour
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : "";
                        setSelectedTour(selectedValue);
                      }}
                      isDisabled={loading || !selectedCity}
                      isLoading={loading && selectedCity}
                    />
                    {!loading && selectedCity && tourGroupsByCity.length === 0 && (
                      <small className="text-warning mt-2 d-block">
                        No tours found for this city
                      </small>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="variant-select">
                      Variant <span className="text-danger">*</span>
                    </Label>
                    <Select
                      id="variant-select"
                      isClearable
                      isSearchable
                      placeholder={selectedTour ? "Search and select a variant..." : "Select tour first"}
                      options={
                        Array.isArray(variants)
                          ? variants.map(variant => ({
                              value: variant._id || variant.id,
                              label: variant.name,
                            }))
                          : []
                      }
                      value={
                        selectedVariant
                          ? {
                              value: selectedVariant,
                              label: variants.find(v => (v._id || v.id) === selectedVariant)?.name || selectedVariant
                            }
                          : null
                      }
                      onChange={(selectedOption) => {
                        const selectedValue = selectedOption ? selectedOption.value : "";
                        setSelectedVariant(selectedValue);
                      }}
                      isDisabled={loading || !selectedTour}
                      isLoading={loading && selectedTour}
                    />
                    {!loading && selectedTour && variants.length === 0 && (
                      <small className="text-warning mt-2 d-block">
                        No variants found for this tour
                      </small>
                    )}
                  </div>

                  {selectedVariant && (
                    <>
                  <Button
                    color="primary"
                        className="w-100 mb-2"
                        onClick={handleManagePricing}
                      >
                        <i className="bx bx-dollar-circle me-1"></i>
                        Manage Pricing Rules
                      </Button>
                      
                      <Button
                        color="success"
                        outline
                    className="w-100"
                    onClick={() => setModel(true)}
                  >
                    <i className="mdi mdi-cogs me-1"></i>
                    Bulk Update Pricing
                  </Button>
                    </>
                  )}
                </CardBody>
              </Card>

              {selectedVariant && pricingRules.length > 0 && (
                <Card>
                  <CardHeader className="bg-light">
                    <h5 className="mb-0">
                      Active Rules ({pricingRules.filter(r => r.isActive).length})
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {pricingRules
                        .filter(r => r.isActive)
                        .sort((a, b) => b.priority - a.priority)
                        .map(rule => (
                          <div 
                            key={rule._id} 
                            className="d-flex align-items-center justify-content-between mb-2 p-2 border rounded"
                            style={{ backgroundColor: getPriorityColor(rule.priority) + '15' }}
                          >
                            <div className="flex-grow-1">
                              <div className="fw-bold small">{rule.name}</div>
                              <small className="text-muted">{rule.tag}</small>
                            </div>
                            <Badge 
                              style={{ 
                                backgroundColor: getPriorityColor(rule.priority),
                                color: 'white'
                              }}
                            >
                              {rule.priority}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader className="bg-light">
                  <h5 className="mb-0">Priority Legend</h5>
                </CardHeader>
                <CardBody>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#dc3545',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>90-100: Emergency</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#fd7e14',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>51-89: Special Events</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#ffc107',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>31-50: Complex</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#0dcaf0',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>21-30: Seasonal</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#198754',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>11-20: Weekly</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: '#6c757d',
                          marginRight: '8px',
                          borderRadius: '3px'
                        }}
                      ></div>
                      <small>1-10: Default</small>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="bg-light">
                  <h5 className="mb-0">Quick Actions</h5>
                </CardHeader>
                <CardBody className="d-flex flex-column gap-2">
                  <Button 
                    outline 
                    color="secondary" 
                    className="w-100 text-start"
                    onClick={handleQuickCopy}
                    disabled={!selectedVariant}
                  >
                    <i className="bx bx-copy me-2"></i>
                    Copy from Date
                  </Button>
                  <Button 
                    outline 
                    color="secondary" 
                    className="w-100 text-start"
                    onClick={handleSeasonalPricing}
                    disabled={!selectedVariant}
                  >
                    <i className="bx bx-sun me-2"></i>
                    Apply Seasonal Pricing
                  </Button>
                </CardBody>
              </Card>
            </Col>

            <Col lg={9}>
              <Card>
                <CardBody>
                  {loading && !selectedVariant ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="mt-3 text-muted">Loading calendar data...</p>
                    </div>
                  ) : !selectedVariant ? (
                    <div className="text-center py-5">
                      <i className="bx bx-calendar-x display-4 text-muted"></i>
                      <h5 className="mt-3 text-muted">Select city, tour, and variant to view pricing calendar</h5>
                      <p className="text-muted">
                        Choose from the dropdown menus on the left to get started
                      </p>
                      {!selectedCity && (
                        <p className="text-muted">
                          <strong>Step 1:</strong> Select a city
                        </p>
                      )}
                      {selectedCity && !selectedTour && (
                        <p className="text-muted">
                          <strong>Step 2:</strong> Select a tour group
                        </p>
                      )}
                      {selectedTour && !selectedVariant && (
                        <p className="text-muted">
                          <strong>Step 3:</strong> Select a variant
                        </p>
                      )}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bx bx-info-circle display-4 text-warning"></i>
                      <h5 className="mt-3 text-muted">No pricing rules found</h5>
                      <p className="text-muted mb-4">
                        This variant doesn't have any pricing rules yet
                      </p>
                      <Button color="primary" onClick={handleManagePricing}>
                        <i className="bx bx-plus-circle me-2"></i>
                        Create Pricing Rules
                      </Button>
                    </div>
                  ) : (
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
                      eventClick={handleEventClick}
                    events={events}   
                    eventContent={renderEventContent}
                      height="auto"
                      dayMaxEvents={3}
                  />
                  )}
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
