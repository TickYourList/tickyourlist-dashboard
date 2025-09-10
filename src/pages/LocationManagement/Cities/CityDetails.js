import React, { useEffect, useState } from "react"
import { EnvironmentFilled , RightOutlined } from '@ant-design/icons';
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getCityDetails } from "store/travelCity/action"
import {
  getTours,
  getCategories,
  getSubCategories,
  getCollections,
  getBookings,
} from "store/city-details/actions"
import TableContainer from "../../../components/Common/TableContainer"
import TableContainerWithServerSidePagination from "../../../components/Common/TableContainerWithServerSidePagination"
import { bookingsColumns } from "./CityDetails_Columns/BookingsColumns"
import { categoriesColumns } from "./CityDetails_Columns/CategoriesColumns"
import { subCategoriesColumns } from "./CityDetails_Columns/SubCategoriesColumns"
import { collectionsColumns } from "./CityDetails_Columns/CollectionsColumns"
import { toursColumns } from "./CityDetails_Columns/ToursColumns"
import toastr from "toastr"
import { Card, CardBody, Spinner, Button } from "reactstrap"
import PermissionDenied from "./PermissionDenied";
import { usePermissions, MODULES, ACTIONS } from '../../../helpers/permissions';


const CityDetails = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cityCode } = useParams()
  const { city, statistics } = useSelector(state => state.travelCity.cityDetails)
  const { tours, categories, subCategories, collections, bookings } = useSelector(state => state.CityDetails)
  const [tab, setTab] = useState(0)
  const pageCount = 1;
  const [pageSize, setPageSize] = useState(10)
  const [currentPageBooking, setCurrentPageBooking] = useState(1)
  const [currentPageTour, setCurrentPageTour] = useState(1)
  const { 
    can, 
    loading: cityPermissionLoading, 
    getCityPermissions, 
    getTourPermissions, 
    getCategoryPermissions, 
    getSubCategoryPermissions, 
    getCollectionPermissions, 
    getBookingPermissions 
  } = usePermissions();
 
  const handleCategorySortClick = () => {
    navigate(`/categories/${cityCode}/sort`);
  }

  const tabConfig = [
  {
    label: "Tours",
    access: can(ACTIONS.CAN_VIEW, MODULES.TOUR_PERMS),
    fetch: () => dispatch(getTours(cityCode, pageCount, pageSize)),
    render: () => (
      <Card>
        <CardBody>
          {
            statistics.totalTours > 0 ?
            <TableContainerWithServerSidePagination
              columns={toursColumns()}
              data={tours.data}
              totalCount={statistics.totalTours}
              currentPage={currentPageTour}
              pageSize={pageSize}
              onPageChange={handlePageChangeTour}
              setPageSize={setPageSize}
              isGlobalFilter={true}
              customPageSize={10}
              className="custom-header-css"
            />:
            <div className="text-muted">No tours found.</div>
          }
        </CardBody>
      </Card>
    ),
  },
  {
    label: "Categories",
    access: can(ACTIONS.CAN_VIEW, MODULES.CATEGORY_PERMS),
    fetch: () => dispatch(getCategories(cityCode)),
    render: () => (
      <Card>
        <CardBody>
          {
            statistics.totalCategories > 0 ?
            <div>
              {
                can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS) && 
                <div className="d-flex justify-content-end mb-3">
                <Button
                  color="info"
                  className="btn-sm me-2"
                  onClick={handleCategorySortClick}
                >
                  Sort Categories
                </Button>
                </div>
              }
              <TableContainer
                columns={categoriesColumns(city.name)}
                data={categories.data}
                isGlobalFilter={true}
                customPageSize={10}
              />
            </div>: 
            <div className="text-muted">No categories found.</div>
          }
        </CardBody>
      </Card>
    ),
  },
  {
    label: "Sub Categories",
    access: can(ACTIONS.CAN_VIEW, MODULES.SUBCATEGORY_PERMS),
    fetch: () => dispatch(getSubCategories(cityCode)),
    render: () => (
      <Card>
        <CardBody>
          {
            statistics.totalSubcategories > 0 ?
            <TableContainer
              columns={subCategoriesColumns(city.name)}
              data={subCategories.data}
              isGlobalFilter={true}
              customPageSize={10}
            />:
            <div className="text-muted">No sub categories found.</div>
          }
        </CardBody>
      </Card>
    ),
  },
  {
    label: "Collections",
    access: can(ACTIONS.CAN_VIEW, MODULES.COLLECTION_PERMS),
    fetch: () => dispatch(getCollections(cityCode)),
    render: () => (
      <Card>
        <CardBody>
          {
            statistics.totalCollections > 0 ?
            <TableContainer
              columns={collectionsColumns(city.name)}
              data={collections.data}
              isGlobalFilter={true}
              customPageSize={10}
            />:
            <div className="text-muted">No collections found.</div>
          }
        </CardBody>
      </Card>
    ),
  },
  {
    label: "Bookings",
    access: can(ACTIONS.CAN_VIEW, MODULES.BOOKING_PERMS),
    fetch: () => dispatch(getBookings(cityCode, currentPageBooking, pageSize)),
    render: () => (
      <Card>
        <CardBody>
          {
            statistics.totalBookings > 0 ?
            <TableContainerWithServerSidePagination
              columns={bookingsColumns()}
              data={bookings.data}
              totalCount={statistics.totalBookings}
              currentPage={currentPageBooking}
              pageSize={pageSize}
              onPageChange={handlePageChangeBooking}
              setPageSize={setPageSize}
              isGlobalFilter={true}
              customPageSize={10}
              className="custom-header-css"
            />:
            <div className="text-muted">No bookings found.</div>
          }
        </CardBody>
      </Card>
    ),
  },
  {
    label: "Analytics",
    access: true, 
    fetch: null,
    render: () => (
      <div></div>
    ),
  },
]


  const availableTabs = tabConfig.filter(t => t.access)

  const [loadedTabs, setLoadedTabs] = useState({})

  const handlePageChangeTour = newPage => {
    dispatch(getTours(cityCode, newPage, pageSize))
    setCurrentPageTour(newPage)
  }

  const handlePageChangeBooking = newPage => {
    dispatch(getBookings(cityCode, newPage, pageSize))
    setCurrentPageBooking(newPage)
  }

  useEffect(() => {
    const currentTab = availableTabs?.[tab]
    if (currentTab && currentTab.fetch && !loadedTabs[tab]) {
    currentTab.fetch();
    setLoadedTabs(prev => {
      if (prev[tab]) return prev;
      return { ...prev, [tab]: true };
    });
  }
  }, [tab,
  cityCode,
  currentPageTour,
  currentPageBooking,
  pageSize]);
  
  const callback = () => {
    navigate("/city")
  }

  const handleEditClick = () => {
    navigate(`/edit-city/${city.cityCode}`)
  }

  useEffect(() => {
    if (!cityCode || cityCode === "undefined" || cityCode.trim() === "") {
      toastr.error("Please enter a valid City Code in the URL.")
      navigate("/city")
    }

    if (cityCode && can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS)) {
      dispatch(getCityDetails(cityCode, callback))
    }
  }, [dispatch, cityCode, can])

  if(cityPermissionLoading) {
    return <div className="page-content">
        <Spinner className="ms-2" color="dark" />
        <p>Loading page data</p>
      </div>
  }

  if (!can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS)) return <PermissionDenied />;

  if (
    city == null ||
    (cityCode && city.cityCode !== cityCode)
  ) {
    return <div className="page-content">
        <Spinner className="ms-2" color="dark" />
        <p>Loading page data</p>
      </div>
  }

  return (
    <div className="page-content">
      <Card> 
      <div className="container py-4 fs-5">
        {/* Page Title */}
        <h3 className="fw-bold mb-3 fs-1">
          City Overview - {city.displayName}
        </h3>

        {/* Separator Line */}
        <div className="border-bottom border-1 border-secondary mb-3"></div>

        {/* Breadcrumb */}
        <div className="d-flex align-items-center mb-3">
          <span className="text-primary fs-5">Cities</span>
          <RightOutlined fontSize="medium" className="mx-1 text-muted" />
          <span className="text-dark fs-5">{city.displayName}</span>
        </div>

        {/* Separator Line */}
        <div className="border-bottom border-1 border-secondary mb-4"></div>

        {/* Top Section */}
        <div className="row g-4 mb-4">
          {/* Left Image */}
          <div className="col-lg-4">
            <img
              src={city.imageURL?.url}
              alt="City"
              className="img-fluid"
              style={{
                width: 300,
                height: 250,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          </div>

          {/* Right City Info */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1 fw-bold fs-1">{city.displayName}</h4>
                {city.country && (
                  <div className="d-flex align-items-center text-muted">
                    <EnvironmentFilled fontSize="small" style={{ fontSize: 20}} />
                    <small className="ms-1">
                      {city.country?.displayName} ({city.country?.code})
                    </small>
                  </div>
                )}
              </div>
              <div className="text-end">
                {city.status ? (
                  <span
                    className="badge border border-success text-success fs-5 rounded-pill"
                    style={{ backgroundColor: "#ECF8F3" }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    className="badge border border-danger text-danger fs-5 rounded-pill"
                    style={{ backgroundColor: "#FDEDEC" }}
                  >
                    Inactive
                  </span>
                )}

                <div className="mt-2">
                  {
                    can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) && 
                    <button
                        onClick={handleEditClick}
                        className="btn btn-sm border border-info fs-6 fw-bold text-info rounded-pill px-4"
                        style={{ backgroundColor: "rgba(13, 202, 240, 0.1)" }}
                      >
                      Edit
                    </button>
                  }
                </div>
              </div>
            </div>

            {/* Summary Cards*/}
            <div className="d-flex gap-3 flex-wrap">
              {[
                {
                  label: "Total Tours",
                  value: statistics.totalTours || 0,
                  color: "text-primary",
                },
                {
                  label: "Categories",
                  value: statistics.totalCategories || 0,
                  color: "text-success",
                },
                {
                  label: "Sub Categories",
                  value: statistics.totalSubcategories || 0,
                  color: "text-danger",
                },
                {
                  label: "Collections",
                  value: statistics.totalCollections || 0,
                  color: "text-warning",
                },
                {
                  label: "Bookings",
                  value: statistics.totalBookings || 0,
                  color: "text-info",
                },
              ].map(({ label, value, color }) => (
                <div
                  className="card text-center flex-fill bg-light"
                  style={{ minWidth: "120px", maxWidth: "150px" }}
                  key={label}
                >
                  <div className="card-body py-3 px-2">
                    <h5 className={`card-title ${color} mb-1 font-size-24`}>
                      {value}
                    </h5>
                    <p className="card-text small mb-0 fw-medium font-size-18">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-bottom border-1 border-secondary mb-4"></div>

        {/* Tabs */}

        <ul className="nav nav-tabs border-bottom border-1">
          {availableTabs.map((t, index) => (
            <li className="nav-item" key={t.label}>
              <button
                className={`nav-link border-0 ${
                  tab === index
                    ? "active border-bottom fw-bold text-primary border-primary border-3"
                    : "text-dark"
                }`}
                onClick={() => setTab(index)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Separator Line */}
        {availableTabs.length != 0 && <div className="border-bottom border-1 border-secondary mb-4"></div>} 
        

        {/* <div className="mt-3"> */}
          {availableTabs[tab]?.render()}
        {/* </div> */}

      </div>
      </Card>
    </div>
  )
}

export default CityDetails