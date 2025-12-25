import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
} from "reactstrap";
import Breadcrumbs from "components/Common/Breadcrumb";
import Select from "react-select";
import { getContinentsDashboard, bulkLinkContinent, bulkLinkAllCountries } from "store/continents/actions";
import { getCountries } from "store/countries/actions";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const Continents = () => {
  document.title = "Continents | TickYourList";

  const dispatch = useDispatch();
  const { continents, summary, loading, error, linking, linkingAll } = useSelector((state) => state.continents);
  const { countries: allCountries } = useSelector((state) => state.countries);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    dispatch(getContinentsDashboard());
    dispatch(getCountries());
  }, [dispatch]);

  const handleLinkCountries = (continent) => {
    setSelectedContinent(continent);
    setSelectedCountries([]);
    setLinkModalOpen(true);
  };

  const handleConfirmLink = async () => {
    if (!selectedContinent || selectedCountries.length === 0) {
      showToastError("Please select at least one country", "Error");
      return;
    }

    const countryIds = selectedCountries.map(c => c.value);
    await dispatch(bulkLinkContinent(selectedContinent._id, countryIds));
    setLinkModalOpen(false);
    setSelectedContinent(null);
    setSelectedCountries([]);
  };

  const handleBulkLinkAll = () => {
    if (window.confirm("Are you sure you want to link all countries to their continents based on the country-to-continent mapping? This will only update countries that don't already have a continent assigned.")) {
      dispatch(bulkLinkAllCountries());
    }
  };

  // Refresh data when linking completes
  useEffect(() => {
    if (!linking) {
      dispatch(getContinentsDashboard());
    }
  }, [linking, dispatch]);

  // Prepare country options for dropdown (countries not yet linked to any continent)
  const getUnlinkedCountries = () => {
    if (!allCountries || !continents) return [];
    
    const linkedCountryIds = new Set();
    continents.forEach(continent => {
      continent.countries?.forEach(country => {
        // Convert to string for comparison
        linkedCountryIds.add(country._id?.toString());
      });
    });

    return allCountries
      .filter(country => !linkedCountryIds.has(country._id?.toString()))
      .map(country => ({
        value: country._id,
        label: `${country.displayName || country.code} (${country.code})`
      }));
  };

  const countryOptions = getUnlinkedCountries();

  const getContinentColor = (code) => {
    const colors = {
      'AF': '#FF6B6B', // Red - Africa
      'AS': '#4ECDC4', // Teal - Asia
      'EU': '#45B7D1', // Blue - Europe
      'NA': '#FFA07A', // Light Salmon - North America
      'SA': '#98D8C8', // Mint - South America
      'OC': '#F7DC6F', // Yellow - Oceania
      'AN': '#95A5A6', // Gray - Antarctica
    };
    return colors[code] || '#6C757D';
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading continents...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Location Management" breadcrumbItem="Continents" />

        {/* Summary Cards */}
        {summary && (
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-primary">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm bg-primary bg-soft rounded me-3">
                      <span className="avatar-title rounded">
                        <i className="bx bx-globe font-size-24"></i>
                      </span>
                    </div>
                    <div>
                      <h5 className="mb-1">{summary.totalContinents}</h5>
                      <p className="text-muted mb-0">Total Continents</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-success">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm bg-success bg-soft rounded me-3">
                      <span className="avatar-title rounded">
                        <i className="bx bx-map font-size-24"></i>
                      </span>
                    </div>
                    <div>
                      <h5 className="mb-1">{summary.totalCountries}</h5>
                      <p className="text-muted mb-0">Total Countries</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-info">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm bg-info bg-soft rounded me-3">
                      <span className="avatar-title rounded">
                        <i className="bx bx-buildings font-size-24"></i>
                      </span>
                    </div>
                    <div>
                      <h5 className="mb-1">{summary.totalCities}</h5>
                      <p className="text-muted mb-0">Total Cities</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Bulk Link All Button */}
        <div className="mb-4">
          <Button
            color="success"
            className="me-2"
            onClick={handleBulkLinkAll}
            disabled={linkingAll}
          >
            {linkingAll ? (
              <>
                <Spinner size="sm" className="me-2" />
                Linking All Countries...
              </>
            ) : (
              <>
                <i className="bx bx-link-external me-1"></i>
                Link All Countries to Continents
              </>
            )}
          </Button>
          <small className="text-muted d-block mt-2">
            This will automatically link all countries to their continents based on the country-to-continent mapping. 
            Only countries without a continent will be updated.
          </small>
        </div>

        {/* Continents Grid */}
        <Row>
          {continents.map((continent) => (
            <Col key={continent._id} lg={6} xl={4} className="mb-4">
              <Card
                className="h-100 shadow-sm"
                style={{
                  borderLeft: `4px solid ${getContinentColor(continent.code)}`,
                }}
              >
                <CardHeader
                  className="text-white"
                  style={{ backgroundColor: getContinentColor(continent.code) }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{continent.displayName}</h5>
                      <small>{continent.code}</small>
                    </div>
                    <div className="text-end">
                      <Badge color="light" className="text-dark">
                        {continent.totalCountries} Countries
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Total Cities:</span>
                      <Badge color="primary">{continent.totalCities}</Badge>
                    </div>
                    {continent.description && (
                      <p className="text-muted small mb-3">{continent.description}</p>
                    )}
                  </div>

                  {/* Countries List */}
                  <div className="mb-3">
                    <h6 className="mb-2">
                      <i className="bx bx-map me-1"></i>
                      Countries ({continent.totalCountries})
                    </h6>
                    {continent.countries && continent.countries.length > 0 ? (
                      <div className="max-height-300 overflow-auto">
                        {continent.countries.map((country) => (
                          <div
                            key={country._id}
                            className="d-flex justify-content-between align-items-start p-2 mb-2 border rounded bg-light"
                          >
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <strong>{country.displayName}</strong>
                                <Badge color="secondary" className="ms-2">{country.code}</Badge>
                              </div>
                              <div className="small text-muted mb-1">
                                <i className="bx bx-buildings me-1"></i>
                                {country.totalCities} {country.totalCities === 1 ? 'city' : 'cities'}
                              </div>
                              {country.cities && country.cities.length > 0 && country.cities.length <= 5 && (
                                <div className="small">
                                  <span className="text-muted">Cities: </span>
                                  <span>{country.cities.map(c => c.displayName || c.name).join(', ')}</span>
                                </div>
                              )}
                              {country.cities && country.cities.length > 5 && (
                                <div className="small">
                                  <span className="text-muted">Sample cities: </span>
                                  <span>
                                    {country.cities.slice(0, 3).map(c => c.displayName || c.name).join(', ')}
                                    <span className="text-muted"> +{country.totalCities - 3} more</span>
                                  </span>
                                </div>
                              )}
                            </div>
                            <Badge color="primary" className="ms-2">
                              <i className="bx bx-buildings"></i> {country.totalCities}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert color="info" className="mb-0">
                        <i className="bx bx-info-circle me-2"></i>
                        No countries linked to this continent. Click "Link Countries & Cities" to get started.
                      </Alert>
                    )}
                  </div>

                  {/* Link Countries Button */}
                  <Button
                    color="primary"
                    className="w-100"
                    onClick={() => handleLinkCountries(continent)}
                  >
                    <i className="bx bx-link me-1"></i>
                    Link Countries & Cities
                  </Button>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Link Countries Modal */}
        <Modal isOpen={linkModalOpen} toggle={() => setLinkModalOpen(false)} size="lg">
          <ModalHeader toggle={() => setLinkModalOpen(false)}>
            Link Countries to {selectedContinent?.displayName}
          </ModalHeader>
          <ModalBody>
            <Alert color="info" className="mb-3">
              Select countries to link to <strong>{selectedContinent?.displayName}</strong>. 
              Cities belonging to these countries will automatically be associated with this continent.
            </Alert>

            <div className="mb-3">
              <Label>Select Countries</Label>
              <Select
                isMulti
                value={selectedCountries}
                onChange={setSelectedCountries}
                options={countryOptions}
                isClearable
                isSearchable
                placeholder="Search and select countries..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {countryOptions.length === 0 && (
                <Alert color="warning" className="mt-2 mb-0">
                  All countries are already linked to continents.
                </Alert>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                color="secondary"
                onClick={() => setLinkModalOpen(false)}
                disabled={linking}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleConfirmLink}
                disabled={linking || selectedCountries.length === 0}
              >
                {linking ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Linking...
                  </>
                ) : (
                  <>
                    <i className="bx bx-link me-1"></i>
                    Link {selectedCountries.length} {selectedCountries.length === 1 ? 'Country' : 'Countries'}
                  </>
                )}
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </Container>

      <style>{`
        .max-height-300 {
          max-height: 300px;
        }
        .overflow-auto {
          overflow-y: auto;
        }
        .react-select-container .react-select__menu {
          background-color: white !important;
          z-index: 9999;
        }
        .react-select-container .react-select__option {
          background-color: white !important;
        }
        .react-select-container .react-select__option--is-focused {
          background-color: #e7f3ff !important;
        }
        .react-select-container .react-select__option--is-selected {
          background-color: #0066cc !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Continents;

