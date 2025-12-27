import React, { useEffect, useMemo, useState } from "react"
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Label, Input, Card, CardBody } from "reactstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import Select from "react-select"

import { getTourGroupVariants, getTourGroupVariantDetail } from "../../store/TourGroupVariant/action"
import { getCities } from "store/travelCity/action"
import {
  fetchTourGroupsByCityRequest,
  fetchVariantsByTourRequest,
  searchTourGroupsRequest,
} from "store/tickyourlist/travelTourGroup/action"
import Breadcrumbs from "components/Common/Breadcrumb"
import TableContainerWithServerSidePagination from "components/Common/TableContainerWithServerSidePagination"
import DeleteModal from "components/Common/DeleteModal"
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"
import ViewDetail from "./ViewDetail"

import "./index.scss"

const TourGroupVariantsTable = () => {
  document.title = "Tour Group Variants | Scrollit"

  const dispatch = useDispatch()
  const { tourGroupVariants, totalRecords, loading } = useSelector(
    state => state.TourGroupVariant
  )
  // console.log(totalRecords);
  // console.log("Tour Group Variants:", tourGroupVariants);

  const { can } = usePermissions()

  // Modal state for view details
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [activeTab, setActiveTab] = useState("1")

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)

  const [page, setPage] = useState(
    () => Number(localStorage.getItem("variantPage")) || 1
  )
  const [limit, setLimit] = useState(
    () => Number(localStorage.getItem("variantLimit")) || 10
  )

  // Filter states - using same pattern as calendar page
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedTour, setSelectedTour] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Redux selectors - same as calendar page
  const cities = useSelector(state => state.travelCity?.cities || [])
  const tourGroupsByCity = useSelector(state => state.tourGroup?.tourGroupsByCity || [])
  const searchedTourGroups = useSelector(state => state.tourGroup?.searchedTourGroups || [])
  const variants = useSelector(state => state.tourGroup?.variantsByTour || [])
  const loadingFilters = useSelector(state => state.tourGroup?.loading || false)

  const total = totalRecords || 0

  // Fetch cities on mount using Redux (same as calendar page)
  useEffect(() => {
    dispatch(getCities())
  }, [dispatch])

  // Fetch tours when city is selected (same as calendar page)
  useEffect(() => {
    if (selectedCity) {
      dispatch(fetchTourGroupsByCityRequest(selectedCity))
      setSelectedTour('')
      setSelectedVariant('')
    } else {
      setSelectedTour('')
      setSelectedVariant('')
    }
  }, [selectedCity, dispatch])

  // Fetch variants when tour is selected (same as calendar page)
  useEffect(() => {
    if (selectedTour) {
      dispatch(fetchVariantsByTourRequest(selectedTour))
      setSelectedVariant('')
    } else {
      setSelectedVariant('')
    }
  }, [selectedTour, dispatch])

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      dispatch(searchTourGroupsRequest(searchQuery, selectedCity || null))
    }
  }

  // Use searched results if searching, otherwise use city-filtered tours
  const availableTourGroups = isSearching && searchQuery ? searchedTourGroups : tourGroupsByCity

  // Reset to page 1 when filters change
  useEffect(() => {
    if (selectedCity || selectedTour) {
      setPage(1)
    }
  }, [selectedCity, selectedTour])

  // Fetch variants when page, limit, or filters change
  // When tour group is selected, show only variants for that tour group
  // When filters are cleared, show all variants
  useEffect(() => {
    const cityCode = selectedCity || null
    const tourGroupId = selectedTour || null
    dispatch(getTourGroupVariants(page, limit, cityCode, tourGroupId, null))
  }, [dispatch, page, limit, selectedCity, selectedTour])

  useEffect(() => {
    localStorage.setItem("variantPage", page)
  }, [page])

  useEffect(() => {
    localStorage.setItem("variantLimit", limit)
  }, [limit])

  const processedVariants = Array.isArray(tourGroupVariants)
    ? tourGroupVariants.map(row => ({
        ...row,
        name: row.name || "-",
        tourName: row.name || "-",
        city: row.city || "-",
        cityCode: row.cityCode || "-",
        status: row.status ? "Active" : "Inactive",
      }))
    : []

  // Permission checks using standardized usePermissions hook
  const canAddTourGroupVariant = can(ACTIONS.CAN_ADD, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canEditTourGroupVariant = can(ACTIONS.CAN_EDIT, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canViewTourGroupVariant = can(ACTIONS.CAN_VIEW, MODULES.TOUR_GROUP_VARIANT_PERMS)
  const canDeleteTourGroupVariant = can(ACTIONS.CAN_DELETE, MODULES.TOUR_GROUP_VARIANT_PERMS)

  const navigate = useNavigate()
  
  // Define all handler functions before useMemo
  const handleAddTourGroupVariantClicks = () => {
    navigate("add-tour-group-variants")
  }

  const handleEditButtonClick = variantId => {
    console.log("Editing variant with ID:", variantId)
    navigate(`/tour-group-variants/edit/${variantId}`)
  }

  const handleViewButtonClick = variantId => {
    console.log("View button clicked for variant ID:", variantId)
    setSelectedVariantId(variantId)
    setActiveTab("1")
    dispatch(getTourGroupVariantDetail(variantId))
    setIsViewModalOpen(true)
  }

  const toggleViewModal = () => {
    console.log("Toggle modal called, current state:", isViewModalOpen)
    setIsViewModalOpen(!isViewModalOpen)
    if (isViewModalOpen) {
      setSelectedVariantId(null)
    }
  }

  // Delete handlers
  const onClickDelete = (variant) => {
    setVariantToDelete(variant)
    setDeleteModal(true)
  }

  const handleDeleteVariant = () => {
    if (variantToDelete && variantToDelete._id) {
      // TODO: Implement actual delete API call here
      // dispatch(deleteTourGroupVariant(variantToDelete._id))
      
      // For now, show a message that this needs to be implemented
      showToastError("Delete functionality is not yet implemented for Tour Group Variants. Please contact your administrator.", "Not Implemented")
      
      setDeleteModal(false)
      setVariantToDelete(null)
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: "Variant Name",
        accessor: "name",
      },
      {
        Header: "Tour Name",
        accessor: "name",
        Cell: ({ row }) => (
          <a href="#" style={{ color: "blue", textDecoration: "underline" }}>
            {row.original.name}
          </a>
        ),
        id: "tourName",
      },
      {
        Header: "City",
        accessor: row => {
          const city = row.city || "-"
          return city
        },
        id: "cityName",
      },
      {
        Header: "City Code",
        accessor: row => {
          const cityCode = row.cityCode || "-"
          return cityCode
        },
        id: "cityCode",
      },
      {
        Header: "Price",
        accessor: row =>
          row?.listingPrice?.prices?.[0]?.finalPrice
            ? `₹${row.listingPrice.prices[0].finalPrice}`
            : "-",
        id: "price",
      },
      {
        Header: "Status",
        Cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.notAvailable ? "bg-danger" : "bg-success"
            } text-white`}
          >
            {row.original.notAvailable ? "Inactive" : "Active"}
          </span>
        ),
        id: "status",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center gap-2">
            {canViewTourGroupVariant && (
              <Button
                color="primary"
                size="sm"
                style={{ 
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewButtonClick(row.original._id);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="View Details"
              >
                👁️ View
              </Button>
            )}
            
            {canEditTourGroupVariant && (
              <Button
                color="success"
                size="sm"
                style={{ 
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditButtonClick(row.original._id);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                title="Edit"
              >
                ✏️ Edit
              </Button>
            )}

            {canViewTourGroupVariant && (
              <i className="bx bx-money cursor-pointer" title="Pricing" style={{ color: "#f1b44c" }} />
            )}
            {canViewTourGroupVariant && (
              <i className="bx bx-book-content cursor-pointer" title="Bookings" style={{ color: "#50a5f1" }} />
            )}
            {canEditTourGroupVariant && (
              <i className="bx bx-copy cursor-pointer" title="Duplicate" style={{ color: "#5b73e8" }} />
            )}
            {canDeleteTourGroupVariant && (
              <i
                className="bx bx-trash text-danger cursor-pointer"
                title="Delete"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickDelete(row.original);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            )}
          </div>
        ),
        id: "actions",
      },
    ],
    [navigate, canEditTourGroupVariant, canViewTourGroupVariant, canDeleteTourGroupVariant, handleViewButtonClick, handleEditButtonClick, onClickDelete]
  )

  if (!canViewTourGroupVariant) {
    return (
      <div className="page-content">
        <Container
          fluid
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div
            className="alert alert-danger text-center w-100"
            style={{ maxWidth: "600px" }}
          >
            <h5 className="mb-3">Permission Required!</h5>
            <p className="mb-2">
              You do not have permission to access this page. If you believe
              this is a mistake, please contact your administrator.
            </p>
            <p className="mb-0">
              Click{" "}
              <a
                href="/dashboard"
                className="text-primary text-decoration-underline"
              >
                here
              </a>{" "}
              to return to the homepage or navigate to a page you have access
              to.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tour Groups" breadcrumbItem="Group Variants" />
        
        {/* Filters - Same as Calendar Pricing & Availability */}
        <Card className="mb-3">
          <CardBody>
            <Row className="mb-3">
              <Col md={3}>
                <Label>City</Label>
                <Select
                  id="city-select"
                  isClearable
                  isSearchable
                  placeholder="Search and select a city..."
                  options={cities.map(city => ({
                    value: city.cityCode,
                    label: `${city.cityName} (${city.cityCode})`
                  }))}
                  value={selectedCity ? cities.find(c => c.cityCode === selectedCity) ? {
                    value: selectedCity,
                    label: `${cities.find(c => c.cityCode === selectedCity)?.cityName} (${selectedCity})`
                  } : null : null}
                  onChange={(option) => setSelectedCity(option?.value || '')}
                  isDisabled={cities.length === 0}
                />
              </Col>
              <Col md={3}>
                <Label>Tour Group</Label>
                <Select
                  id="tour-select"
                  isClearable
                  isSearchable
                  placeholder={selectedCity ? "Search and select a tour..." : "Select city first"}
                  options={availableTourGroups.map(tour => ({
                    value: tour._id || tour.id,
                    label: tour.name || tour.title
                  }))}
                  value={selectedTour ? availableTourGroups.find(t => (t._id || t.id) === selectedTour) ? {
                    value: selectedTour,
                    label: availableTourGroups.find(t => (t._id || t.id) === selectedTour)?.name || availableTourGroups.find(t => (t._id || t.id) === selectedTour)?.title
                  } : null : null}
                  onChange={(option) => setSelectedTour(option?.value || '')}
                  isDisabled={loadingFilters || !selectedCity}
                  isLoading={loadingFilters && selectedCity}
                />
              </Col>
              <Col md={3}>
                <Label>Variant (Reference)</Label>
                <Select
                  id="variant-select"
                  isClearable
                  isSearchable
                  placeholder={selectedTour ? "View variants for this tour..." : "Select tour first"}
                  options={Array.isArray(variants) ? variants.map(variant => ({
                    value: variant._id || variant.id,
                    label: variant.name
                  })) : []}
                  value={selectedVariant ? (Array.isArray(variants) && variants.find(v => (v._id || v.id) === selectedVariant)) ? {
                    value: selectedVariant,
                    label: variants.find(v => (v._id || v.id) === selectedVariant)?.name
                  } : null : null}
                  onChange={(option) => setSelectedVariant(option?.value || '')}
                  isDisabled={loadingFilters || !selectedTour}
                  isLoading={loadingFilters && selectedTour}
                />
                <small className="text-muted d-block mt-1">
                  All variants for selected tour are shown in table below
                </small>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button
                  color="secondary"
                  onClick={() => {
                    setSelectedCity('')
                    setSelectedTour('')
                    setSelectedVariant('')
                    setSearchQuery('')
                    setIsSearching(false)
                    setPage(1)
                  }}
                  disabled={!selectedCity && !selectedTour}
                  className="w-100"
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Label>Search Tour Groups</Label>
                <div className="d-flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter tour group name to search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (!e.target.value.trim()) {
                        setIsSearching(false)
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleSearch()
                      }
                    }}
                    disabled={loadingFilters}
                  />
                  <Button
                    color="primary"
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || loadingFilters}
                  >
                    <i className="bx bx-search"></i>
                  </Button>
                </div>
                {isSearching && (
                  <small className="text-info mt-2 d-block">
                    <i className="bx bx-loader-alt bx-spin me-1"></i>
                    Searching...
                  </small>
                )}
                {searchedTourGroups.length > 0 && isSearching && (
                  <div className="mt-2">
                    <small className="text-success d-block mb-2">
                      Found {searchedTourGroups.length} tour group(s)
                    </small>
                    <Select
                      isClearable
                      placeholder="Select from search results..."
                      options={searchedTourGroups.map(tour => ({
                        value: tour._id || tour.id,
                        label: tour.name
                      }))}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSelectedTour(selectedOption.value)
                          setSearchQuery('')
                          setIsSearching(false)
                        }
                      }}
                    />
                  </div>
                )}
                <small className="text-muted d-block mt-1">
                  Search across all tour groups or filter by city first
                </small>
              </Col>
            </Row>
          </CardBody>
        </Card>
        
        <div className="variant-list-page">
          <TableContainerWithServerSidePagination
            columns={columns}
            data={processedVariants}
            totalCount={total}
            currentPage={page}
            pageSize={limit}
            onPageChange={newPage => setPage(newPage)}
            setPageSize={newLimit => {
              setLimit(newLimit)
              setPage(1)
            }}
            isGlobalFilter={true}
            isAddTourGroupVariantOptions={canAddTourGroupVariant}
            handleAddTourGroupVariantClicks={handleAddTourGroupVariantClicks}
            className="custom-header-css"
          />
        </div>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteVariant}
        onCloseClick={() => setDeleteModal(false)}
      />
      
      {/* View Detail Modal */}
      <ViewDetail 
        isOpen={isViewModalOpen}
        toggle={toggleViewModal}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

export default TourGroupVariantsTable
