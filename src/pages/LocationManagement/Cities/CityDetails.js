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
import { Card, CardBody } from "reactstrap"

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

  const tabLabels = [
    "Tours",
    "Categories",
    "Sub Categories",
    "Collections",
    "Bookings",
    "Analytics",
  ]
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
  if (statistics?.totalTours && loadedTabs[0]) {
    dispatch(getTours(cityCode, pageCount, pageSize));
  }
}, [statistics?.totalTours]);


  useEffect(() => {
    if (!loadedTabs[tab]) {
      switch (tab) {
        case 0:
          dispatch(getTours(cityCode, currentPageTour, pageSize))  
          break
        case 1:
          dispatch(getCategories(cityCode))
          break
        case 2:
          dispatch(getSubCategories(cityCode))
          break
        case 3:
          dispatch(getCollections(cityCode))
          break
        case 4:
          dispatch(getBookings(cityCode, currentPageBooking, pageSize))
          break
        default:
          break
      }

      setLoadedTabs(prev => ({ ...prev, [tab]: true }))
    }
  }, [tab, dispatch, cityCode, loadedTabs])

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

    if (cityCode) {
      dispatch(getCityDetails(cityCode, callback))
    }
  }, [dispatch, cityCode])

  if (
    city == null ||
    (cityCode !== "undefined" && city.cityCode !== cityCode)
  ) {
    return <div className="page-content">Loading city data...</div>
  }

  return (
    <div className="page-content">
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
                  <button
                    onClick={handleEditClick}
                    className="btn btn-sm border border-info fs-6 fw-bold text-info rounded-pill px-4"
                    style={{ backgroundColor: "rgba(13, 202, 240, 0.1)" }}
                  >
                    Edit
                  </button>
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
                  className="card text-center flex-fill"
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
          {tabLabels.map((label, index) => (
            <li className="nav-item" key={label}>
              <button
                className={`nav-link border-0 ${
                  tab === index
                    ? "active border-bottom fw-bold text-primary border-primary border-3"
                    : "text-dark"
                }`}
                onClick={() => setTab(index)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Separator Line */}
        <div className="border-bottom border-1 border-secondary mb-4"></div>

        {/* Tours */}
        {tab === 0 && (
          <Card>
            <CardBody>
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
                  />
            </CardBody>
          </Card>
        )}

        {/* Categories */}
        {tab === 1 && (
          <Card>
            <CardBody>
              <TableContainer
                columns={categoriesColumns(city.name)}
                data={categories.data}
                isGlobalFilter={true}
                customPageSize={10}
              />
            </CardBody>
          </Card>
        )}

        {/* Sub Categories */}
        {tab === 2 && (
          <Card>
            <CardBody>
              <TableContainer
                columns={subCategoriesColumns(city.name)}
                data={subCategories.data}
                isGlobalFilter={true}
                customPageSize={10}
              />
            </CardBody>
          </Card>
        )}

        {/* Collections */}
        {tab === 3 && (
          <Card>
            <CardBody>
              <TableContainer
                columns={collectionsColumns(city.name)}
                data={collections.data}
                isGlobalFilter={true}
                customPageSize={10}
              />
            </CardBody>
          </Card>
        )}

        {/* Bookings */}
        {tab === 4 && (
          <Card>
            <CardBody>
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
              />

            </CardBody>
          </Card>
        )}

        {/* Analytics */}
        {tab === 5 && <Card></Card>}
  
      </div>
    </div>
  )
}

export default CityDetails