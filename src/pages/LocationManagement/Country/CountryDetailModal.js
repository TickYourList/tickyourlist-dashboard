import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Nav,
    NavItem,
    NavLink,
    Row,
    Col,
    TabContent,
    TabPane,
    Badge,
    Input,
    Card,
    CardBody,
    CardTitle,
    CardText,
} from "reactstrap";
import classnames from "classnames";
import TableContainer from '../../../components/Common/TableContainer';
import axios from 'axios';
import { getCitiesByCountryId } from '../../../helpers/location_management_helper';
import { useSelector, useDispatch } from 'react-redux';
import { usePermissions, MODULES, ACTIONS } from 'helpers/permissions';
import { getCities } from '../../../store/countries/cities/actions';
import { getTours, clearTours } from '../../../store/countries/tour/actions';
import { getCategories } from '../../../store/countries/categories/actions';
import { getSubcategories } from '../../../store/countries/Subcategories/actions';
import { getCollections } from '../../../store/countries/collections/actions';
import { getBookings } from '../../../store/countries/bookings/actions';
import './CountryDetailModal.scss'; // Add this import for custom modal styling

const CountryDetailModal = ({ isOpen, toggle, countryData, loading, error }) => {
    const [activeTab, setActiveTab] = useState("1");
    const dispatch = useDispatch();

    // Use global permission system
    const { can } = usePermissions()

    // Permission checks for different modules
    const canEditCity = can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS)
    const canDeleteCity = can(ACTIONS.CAN_DELETE, MODULES.CITY_PERMS)
    const canEditTour = can(ACTIONS.CAN_EDIT, MODULES.TOUR_PERMS)
    const canDeleteTour = can(ACTIONS.CAN_DELETE, MODULES.TOUR_PERMS)
    const canEditCategory = can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS)
    const canDeleteCategory = can(ACTIONS.CAN_DELETE, MODULES.CATEGORY_PERMS)
    const canEditSubcategory = can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS)
    const canDeleteSubcategory = can(ACTIONS.CAN_DELETE, MODULES.SUBCATEGORY_PERMS)
    const canEditCollection = can(ACTIONS.CAN_EDIT, MODULES.COLLECTION_PERMS)
    const canDeleteCollection = can(ACTIONS.CAN_DELETE, MODULES.COLLECTION_PERMS)
    const canEditBooking = can(ACTIONS.CAN_EDIT, MODULES.BOOKING_PERMS)
    const canDeleteBooking = can(ACTIONS.CAN_DELETE, MODULES.BOOKING_PERMS)
    const { cities, loading: citiesLoading, error: citiesError } = useSelector(state => state.cities);
    const { tours, loading: toursLoading, error: toursError } = useSelector(state => state.tours);
    const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(state => state.categories);
    const { subcategories, loading: subcategoriesLoading, error: subcategoriesError } = useSelector(state => state.subcategories);
    const { collections, loading: collectionsLoading, error: collectionsError } = useSelector(state => state.collections);
    const { bookings, loading: bookingsLoading, error: bookingsError } = useSelector(state => state.bookings);
    // Local state for cities and load flag
    const [localCities, setLocalCities] = useState([]);
    const [citiesLoaded, setCitiesLoaded] = useState(false);
    const [toursLoaded, setToursLoaded] = useState(false);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [subcategoriesLoaded, setSubcategoriesLoaded] = useState(false);
    const [collectionsLoaded, setCollectionsLoaded] = useState(false);
    const [bookingsLoaded, setBookingsLoaded] = useState(false);
    const bookingsCurrentApiPageRef = useRef(0);

    // Use refs to track API calls to prevent duplicates
    const citiesApiCalled = useRef(false);
    const toursApiCalled = useRef(false);
    const categoriesApiCalled = useRef(false);
    const subcategoriesApiCalled = useRef(false);
    const collectionsApiCalled = useRef(false);
    const bookingsApiCalled = useRef(false);

    // Reset local state when modal closes or country changes
    useEffect(() => {
        if (isOpen && countryData && countryData._id) {
            setActiveTab("1");
            if (!citiesLoaded && !citiesApiCalled.current) {
                dispatch(getCities(countryData._id));
                setCitiesLoaded(true);
                citiesApiCalled.current = true;
            }
        } else if (!isOpen || !countryData || !countryData._id) {
            setLocalCities([]);
            setCitiesLoaded(false);
            setToursLoaded(false);
            setCategoriesLoaded(false);
            setSubcategoriesLoaded(false);
            setCollectionsLoaded(false);
            setBookingsLoaded(false);
            citiesApiCalled.current = false;
            toursApiCalled.current = false;
            categoriesApiCalled.current = false;
            subcategoriesApiCalled.current = false;
            collectionsApiCalled.current = false;
            bookingsApiCalled.current = false;
            dispatch(clearTours());
        }
    }, [isOpen, countryData]); // Removed dispatch dependency

    // When Redux cities change (after fetch), update localCities
    useEffect(() => {
        if (citiesLoaded && Array.isArray(cities)) {
            setLocalCities(cities);
        }
    }, [cities, citiesLoaded]);

    // Only fetch cities/tours/categories/subcategories/collections/bookings when their tab is first opened
    const toggleTab = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            if (tab === "1" && !citiesLoaded && !citiesApiCalled.current && countryData && countryData._id) {
                citiesApiCalled.current = true;
                dispatch(getCities(countryData._id));
                setCitiesLoaded(true);
            }
            if (tab === "2" && !toursLoaded && !toursApiCalled.current && countryData && countryData._id) {
                toursApiCalled.current = true;
                dispatch(getTours(countryData._id));
                setToursLoaded(true);
            }
            if (tab === "3" && !categoriesLoaded && !categoriesApiCalled.current && countryData && countryData._id) {
                categoriesApiCalled.current = true;
                dispatch(getCategories(countryData._id));
                setCategoriesLoaded(true);
            }
            if (tab === "4" && !subcategoriesLoaded && !subcategoriesApiCalled.current && countryData && countryData._id) {
                subcategoriesApiCalled.current = true;
                dispatch(getSubcategories(countryData._id));
                setSubcategoriesLoaded(true);
            }
            if (tab === "5" && !collectionsLoaded && !collectionsApiCalled.current && countryData && countryData._id) {
                collectionsApiCalled.current = true;
                dispatch(getCollections(countryData._id));
                setCollectionsLoaded(true);
            }
            if (tab === "6" && !bookingsLoaded && !bookingsApiCalled.current && countryData && countryData._id) {
                bookingsApiCalled.current = true;
                // Fetch first page only (page size is controlled by API; keep it reasonable)
                dispatch(getBookings(countryData._id, { page: 1, limit: 50, append: false }));
                bookingsCurrentApiPageRef.current = 1;
                setBookingsLoaded(true);
            }
        }
    };

    // Safety net: if the activeTab changes to Collections ("5"), trigger fetch once
    useEffect(() => {
        if (activeTab === "5" && !collectionsLoaded && !collectionsApiCalled.current && countryData && countryData._id) {
            collectionsApiCalled.current = true;
            dispatch(getCollections(countryData._id));
            setCollectionsLoaded(true);
        }
    }, [activeTab, collectionsLoaded, countryData, dispatch]);

    // Mock data for Top Categories - replace with real data when available
    // const topCategories = [
    //     { name: "Walking Tours", tourCount: 18, color: "#007bff" },
    //     { name: "Food Tours", tourCount: 12, color: "#28a745" },
    //     { name: "Historical Tours", tourCount: 9, color: "#ffc107" },
    //     { name: "Adventure Tours", tourCount: 6, color: "#17a2b8" },
    // ];

    const citiesColumns = React.useMemo(() => [
        { Header: 'City Id', accessor: '_id' },
        {
            Header: 'City Image',
            accessor: 'imageURL',
            Cell: ({ row }) => {
                const url = row.original.imageURL && row.original.imageURL.url;
                return url ? (
                    <img
                        src={url}
                        alt="City"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : '-';
            }
        },
        { Header: 'City Code', accessor: 'cityCode' },
        { Header: 'City Name', accessor: 'displayName' },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <Badge color={value ? 'success' : 'secondary'}>
                    {value ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <div className="d-flex gap-3">
                    {canEditCity && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteCity && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [canEditCity, canDeleteCity]);

    // Tours table columns
    const toursColumns = React.useMemo(() => [
        { Header: 'Tour Id', accessor: '_id' },
        {
            Header: 'Tour Image',
            accessor: 'imageUploads',
            Cell: ({ row }) => {
                const imgArr = row.original.imageUploads;
                const url = Array.isArray(imgArr) && imgArr.length > 0 ? imgArr[0].url : null;
                return url ? (
                    <img
                        src={url}
                        alt="Tour"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : '-';
            }
        },
        { Header: 'Tour Name', accessor: 'name' },
        { Header: 'City Name', accessor: 'city', Cell: ({ value }) => ((value && value.displayName) || (value && value.name) || '-') },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <Badge color={value ? 'success' : 'secondary'}>
                    {value ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <div className="d-flex gap-3">
                    {canEditTour && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteTour && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [canEditTour, canDeleteTour]);
    
    // Categories table columns
    const categoriesColumns = React.useMemo(() => [
        { Header: 'Category ID', accessor: '_id' },
        {
            Header: 'Category Image',
            accessor: 'medias',
            Cell: ({ value }) => {
                // 'value' is the medias array. We access the url from the first element.
                const url = Array.isArray(value) && value[0] && value[0].url;
                return url ? (
                    <img
                        src={url}
                        alt="Category"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : '-';
            }
        },
        {
            Header: 'Category Name',
            accessor: 'displayName'
        },
        {
            Header: 'City Name',
            // The city name is directly in the 'cityCode' property of each category.
            accessor: 'cityCode'
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <div className="d-flex gap-3">
                    {canEditCategory && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteCategory && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [canEditCategory, canDeleteCategory]);

    // Subcategories table columns
    const subcategoriesColumns = React.useMemo(() => [
        { Header: 'Sub Category ID', accessor: '_id' },
        {
            Header: 'Image',
            accessor: 'medias',
            Cell: ({ value }) => {
                const url = Array.isArray(value) && value[0] && value[0].url;
                return url ? (
                    <img
                        src={url}
                        alt="Sub Category"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : '-';
            }
        },
        { Header: 'Sub Category Name', accessor: 'displayName' },
        { Header: 'Category Name', accessor: 'category', Cell: ({ value }) => ((value && value.displayName) || '-') },
        { Header: 'City Name', accessor: 'cityCode' },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <div className="d-flex gap-3">
                    {canEditSubcategory && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteSubcategory && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [canEditSubcategory, canDeleteSubcategory]);

    // Collections table columns
    const collectionsColumns = React.useMemo(() => [{
            Header: 'Collection ID',
            accessor: '_id'
        },
        {
            Header: 'Image',
            accessor: 'heroImageUrl',
            Cell: ({ value }) => {
                const url = value;
                return url ? (
                    <img
                        src={url}
                        alt="Collection"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : '-';
            }
        },
        {
            Header: 'Collection Name',
            accessor: 'displayName'
        },
        {
            Header: 'Collection Type',
            accessor: 'collectionType'
        },
        {
            Header: 'City Name',
            accessor: 'cityCode'
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <div className="d-flex gap-3">
                    {canEditCollection && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteCollection && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [canEditCollection, canDeleteCollection]);

    // Bookings table columns
    const bookingsColumns = React.useMemo(() => [
        { Header: 'Booking ID', accessor: '_id' },
        { Header: 'Customer Name', accessor: 'customerName' },
        {
            Header: 'Customer Info',
            id: 'customerInfo',
            accessor: (row) => ({ email: row.email, phone: row.phoneNumber, phoneCode: row.phoneCode }),
            Cell: ({ value }) => {
                const email = (value && value.email) || '-';
                const phone = (value && value.phone) || '-';
                const phoneCode = (value && value.phoneCode) || '';
                return (
                    <div>
                        <div className="fw-bold">{email}</div>
                        <div className="text-muted">{`${phoneCode} ${phone}`}</div>
                    </div>
                );
            }
        },
        {
            Header: 'Total Guests',
            accessor: (row) => row.type === 'GUEST' ? row.guestsCount : row.totalGuests,
            Cell: ({ value }) => (value || '-'),
        },
        {
            Header: 'Tour Title',
            accessor: 'title',
            Cell: ({ value }) => (value || '-'),
        },
        {
            Header: 'Booking Date',
            accessor: 'bookingDate',
            Cell: ({ value }) => {
                return value ? <span className="text-primary">{new Date(value).toLocaleDateString()}</span> : '-';
            }
        },
        {
            Header: 'Unit Price',
            id: 'unitPrice',
            accessor: (row) => row.guestPrice || row.adultPrice,
            Cell: ({ value, row }) => {
                const currency = (row.original && row.original.currency) || '';
                return value ? `${currency} ${parseFloat(value).toFixed(2)}` : '-';
            }
        },
        {
            Header: 'Total Amount',
            accessor: 'amount',
            Cell: ({ value, row }) => {
                const currency = (row.original && row.original.currency) || '';
                return value ? `${currency} ${parseFloat(value).toFixed(2)}` : '-';
            }
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <Badge color={(value && value.toLowerCase() === 'confirmed') ? 'success' : 'warning'}>{value || 'Pending'}</Badge>
            )
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: () => (
                <div className="d-flex gap-3">
                    {canEditBooking && (
                        <Button
                            color="success"
                            size="sm"
                            className="btn-rounded"
                            title="Edit"
                            onClick={() => { /* TODO: Implement edit handler */ }}
                        >
                            <i className="mdi mdi-pencil font-size-14" />
                        </Button>
                    )}
                    {canDeleteBooking && (
                        <Button
                            color="danger"
                            size="sm"
                            className="btn-rounded"
                            title="Delete"
                            onClick={() => { /* TODO: Implement delete handler */ }}
                        >
                            <i className="mdi mdi-delete font-size-14" />
                        </Button>
                    )}
                </div>
            )
        },
    ], [countryData, canEditBooking, canDeleteBooking]);

    return (
        <Modal
            isOpen={isOpen}
            size="xl"
            role="dialog"
            autoFocus={true}
            centered={true}
            className="exampleModal country-detail-modal-lg"
            tabIndex="-1"
            toggle={toggle}
        >
            <div className="modal-content">
                <ModalHeader toggle={toggle}>
                    <h4>Country Overview</h4>
                </ModalHeader>
                <ModalBody>
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading country details...</p>
                        </div>
                    )}
                    {/* Error State */}
                    {error && (
                        <div className="text-center py-4">
                            <div className="text-danger">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: 48 }}></i>
                            </div>
                            <p className="mt-2 text-danger">Error loading country details: {error}</p>
                        </div>
                    )}
                    {/* Country Data */}
                    {countryData && !loading && !error && (
                        <>
                            {/* Country Header */}
                            <div className="mb-4">
                                {/* Breadcrumb Navigation */}
                                <p className="text-muted mb-2">
                                    Country &gt; {countryData && countryData.displayName ? countryData.displayName : 'Unknown Country'}
                                </p>
                                {/* Country Name and Status */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="mb-0">{countryData.displayName}</h2>
                                    <Badge color={countryData.status ? "success" : "secondary"} className="px-3 py-2">
                                        {countryData.status ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                {/* Currency Symbol */}
                                <p className="mb-3">
                                    <strong>Symbol:</strong> {countryData.currency?.symbol || '$'}
                                </p>
                                {/* Country Statistics */}
                                <Row className="mb-4">
                                    <Col sm="6" md="3">
                                        <Card className="text-center country-stats-card">
                                            <CardBody>
                                                <h5 className="text-primary">{countryData.cityCount || 0}</h5>
                                                <p className="text-muted mb-0">Cities</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="6" md="3">
                                        <Card className="text-center country-stats-card">
                                            <CardBody>
                                                <h5 className="text-success">{countryData.tourCount || 0}</h5>
                                                <p className="text-muted mb-0">Tours</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="6" md="3">
                                        <Card className="text-center country-stats-card">
                                            <CardBody>
                                                <h5 className="text-warning">{countryData.categoryCount || 0}</h5>
                                                <p className="text-muted mb-0">Categories</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="6" md="3">
                                        <Card className="text-center country-stats-card">
                                            <CardBody>
                                                <h5 className="text-info">{countryData.subCategoryCount || 0}</h5>
                                                <p className="text-muted mb-0">Sub Categories</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                    {/* Navigation Tabs */}
                    {countryData && !loading && !error && (
                        <Nav tabs className="nav-tabs-custom nav-justified">
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => toggleTab("1")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-city"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Cities</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => toggleTab("2")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-map"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Tours</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "3" })}
                                    onClick={() => toggleTab("3")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-list"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Categories</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "4" })}
                                    onClick={() => toggleTab("4")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-tags"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Sub Categories</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "5" })}
                                    onClick={() => toggleTab("5")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-box"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Collections</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "6" })}
                                    onClick={() => toggleTab("6")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-book"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Bookings</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    style={{ cursor: "pointer" }}
                                    className={classnames({ active: activeTab === "7" })}
                                    onClick={() => toggleTab("7")}
                                >
                                    <span className="d-block d-sm-none">
                                        <i className="fas fa-chart-bar"></i>
                                    </span>
                                    <span className="d-none d-sm-block">Analytics</span>
                                </NavLink>
                            </NavItem>
                        </Nav>
                    )}
                    {/* Tab Content */}
                    {countryData && !loading && !error && (
                        <TabContent activeTab={activeTab} className="mt-4">
                            {/* Cities Tab */}
                            <TabPane tabId="1">
                                <Row>
                                    <Col sm="12">
                                        {citiesLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading cities...</p>
                                            </div>
                                        ) : citiesError ? (
                                            <div className="text-danger text-center py-4">{citiesError}</div>
                                        ) : (
                                            <div className="scrollable-table-container">
                                                <TableContainer
                                                    columns={citiesColumns}
                                                    data={Array.isArray(localCities) ? localCities : []}
                                                    isGlobalFilter={true}
                                                    customPageSize={10}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Tours Tab */}
                            <TabPane tabId="2">
                                <Row>
                                    <Col sm="12">
                                        {toursLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading tours...</p>
                                            </div>
                                        ) : toursError ? (
                                            <div className="text-danger text-center py-4">{toursError}</div>
                                        ) : (
                                            <div className="scrollable-table-container">
                                                <TableContainer
                                                    columns={toursColumns}
                                                    data={Array.isArray(tours) ? tours : []}
                                                    isGlobalFilter={true}
                                                    customPageSize={10}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Categories Tab */}
                            <TabPane tabId="3">
                                <Row>
                                    <Col sm="12">
                                        {categoriesLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading categories...</p>
                                            </div>
                                        ) : categoriesError ? (
                                            <div className="text-danger text-center py-4">{categoriesError}</div>
                                        ) : (
                                            <div className="scrollable-table-container">
                                                <TableContainer
                                                    columns={categoriesColumns}
                                                    data={Array.isArray(categories) ? categories : []}
                                                    isGlobalFilter={true}
                                                    customPageSize={10}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Sub Categories Tab */}
                            <TabPane tabId="4">
                                <Row>
                                    <Col sm="12">
                                        {subcategoriesLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading subcategories...</p>
                                            </div>
                                        ) : subcategoriesError ? (
                                            <div className="text-danger text-center py-4">{subcategoriesError}</div>
                                        ) : (
                                            <div className="scrollable-table-container">
                                                <TableContainer
                                                    columns={subcategoriesColumns}
                                                    data={Array.isArray(subcategories) ? subcategories : []}
                                                    isGlobalFilter={true}
                                                    customPageSize={10}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Collections Tab */}
                            <TabPane tabId="5">
                                <Row>
                                    <Col sm="12">
                                        {collectionsLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading collections...</p>
                                            </div>
                                        ) : collectionsError ? (
                                            <div className="text-danger text-center py-4">{collectionsError}</div>
                                        ) : (
                                            <div className="scrollable-table-container">
                                                <TableContainer
                                                    columns={collectionsColumns}
                                                    data={Array.isArray(collections) ? collections : []}
                                                    isGlobalFilter={true}
                                                    customPageSize={10}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Bookings Tab */}
                            <TabPane tabId="6">
                                <Row>
                                    <Col sm="12">
                                        {bookingsLoading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2">Loading bookings...</p>
                                            </div>
                                        ) : bookingsError ? (
                                            <div className="text-danger text-center py-4">{bookingsError}</div>
                                        ) : (
                                            <>
                                                <div className="scrollable-table-container">
                                                    <TableContainer
                                                        columns={bookingsColumns}
                                                        data={Array.isArray(bookings) ? bookings : []}
                                                        isGlobalFilter={true}
                                                        customPageSize={10}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </Col>
                                </Row>
                            </TabPane>
                            {/* Analytics Tab */}
                            <TabPane tabId="7">
                                <Row>
                                    <Col sm="12">
                                        <p>Analytics information for {countryData.displayName}.(Placeholder)</p>
                                    </Col>
                                </Row>
                            </TabPane>
                        </TabContent>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>
                        Close
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
};

CountryDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    countryData: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
};

export default CountryDetailModal;