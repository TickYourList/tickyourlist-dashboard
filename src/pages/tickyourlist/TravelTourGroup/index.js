import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import Select from "react-select"

import Breadcrumbs from "components/Common/Breadcrumb"

import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Label,
  Input,
  Spinner,
} from "reactstrap"
import TableContainerWithServerSidePagination from "components/Common/TableContainerWithServerSidePagination"
import NewTourModel from "./NewTourModel"

import {
  deleteTourGroupRequest,
  fetchTourGroupByIdRequest,
  fetchTourGroupsRequest,
  removeTourGroupWithId,
  clearTourGroupList,
  searchTourGroupsRequest,
  fetchKlookMappingsRequest,
} from "store/tickyourlist/travelTourGroup/action"
import DeleteModal from "components/Common/DeleteModal"

import ViewTourGroup from "./ViewTourGroup"
import ConnectCategoriesModal from "./ConnectCategoriesModal"
import ConnectKlookModal from "./ConnectKlookModal"
import VariantsPricingModal from "./VariantsPricingModal"
import VariantManagementModal from "./VariantManagementModal"
import { showToastSuccess } from "helpers/toastBuilder"
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions"
import { getCitiesList } from "helpers/location_management_helper"
function TourGroupTable() {
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const [tourGroupByIdName, setTourGroupByIdName] = useState("")
  const [editId, setEditId] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedTourGroupToBeDeleted, setSelectedTourGroupToBeDeleted] =
    useState(null)
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [loadingCities, setLoadingCities] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [connectModal, setConnectModal] = useState(false)
  const [selectedTourGroupForConnection, setSelectedTourGroupForConnection] = useState(null)
  const [connectKlookModal, setConnectKlookModal] = useState(false)
  const [selectedTourGroupForKlook, setSelectedTourGroupForKlook] = useState(null)
  const [variantsPricingModal, setVariantsPricingModal] = useState(false)
  const [selectedTourGroupForPricing, setSelectedTourGroupForPricing] = useState(null)
  const [variantManagementModal, setVariantManagementModal] = useState(false)
  const [selectedTourGroupForVariantManagement, setSelectedTourGroupForVariantManagement] = useState(null)
  const [pricingDetailsModal, setPricingDetailsModal] = useState(false)
  const [selectedTourGroupForPricingDetails, setSelectedTourGroupForPricingDetails] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can, getTourGroupPermissions, isPermissionsReady, loading: permissionsLoading } = usePermissions()

  // Permission checks using standardized usePermissions hook - moved before useEffect
  const canAddTourGroup = can(ACTIONS.CAN_ADD, MODULES.TOUR_GROUP_PERMS)
  const canViewTourGroup = can(ACTIONS.CAN_VIEW, MODULES.TOUR_GROUP_PERMS)
  const canEditTourGroup = can(ACTIONS.CAN_EDIT, MODULES.TOUR_GROUP_PERMS)
  const canDeleteTourGroup = can(ACTIONS.CAN_DELETE, MODULES.TOUR_GROUP_PERMS)

  /* destructuring the tour group state */
  const { tourGroup, currPage, totalCount, error, searchedTourGroups, loading, klookMappings: providerMappings } = useSelector(
    state => state.tourGroup
  )

  const toggle = () => {
    setModal(!modal)
    setIsEdit(false)
    setIsViewing(false)

    dispatch(removeTourGroupWithId())
  }
  const role = JSON.parse(localStorage.getItem("authUser"))?.data?.user
    ?.roles[0]?.code

  // Fetch cities list on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        const response = await getCitiesList()
        const cityOptions = response.data.travelCityList.map(city => ({
          value: city.cityCode,
          label: `${city.name} (${city.cityCode})`,
        }))
        setCities(cityOptions)
        
        // Restore city filter from URL params after cities are loaded
        const cityCodeFromUrl = searchParams.get('cityCode')
        if (cityCodeFromUrl) {
          const cityFromUrl = cityOptions.find(c => c.value === cityCodeFromUrl)
          if (cityFromUrl) {
            setSelectedCity(cityFromUrl)
          }
        }
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  //calling the api
  useEffect(() => {
    /* console.log("called dispatch fetch tour group") */
    if (isPermissionsReady && canViewTourGroup) {
      const itemsNeeded = currentPage * pageSize
      const fetchLimit = selectedCity ? 20 : pageSize

      // Only fetch if we don't have enough data in Redux (or initial load)
      if (tourGroup.length < itemsNeeded && (tourGroup.length === 0 || tourGroup.length < totalCount)) {
        const apiPage = Math.ceil(tourGroup.length / fetchLimit) + 1
        dispatch(
          fetchTourGroupsRequest({
            page: apiPage,
            limit: fetchLimit,
            cityCode: selectedCity?.value || null,
          })
        )
      }
    }
  }, [currentPage, pageSize, selectedCity, tourGroup.length, totalCount, isPermissionsReady, canViewTourGroup])

  // Open edit modal directly when editId is passed in query params
  useEffect(() => {
    if (!isPermissionsReady || !canEditTourGroup) return

    const params = new URLSearchParams(location.search)
    const editIdFromUrl = params.get("editId")

    if (editIdFromUrl) {
      dispatch(fetchTourGroupByIdRequest(editIdFromUrl))
      setEditId(editIdFromUrl)
      setIsEdit(true)
      setIsViewing(false)
      setModal(true)
    }
  }, [location.search, isPermissionsReady, canEditTourGroup, dispatch])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption)
    // Reset pagination when city changes
    setCurrentPage(1)

    // Clear Redux tour group state to prevent old data from showing
    dispatch(clearTourGroupList())

    // Exit search mode when city changes
    if (isSearchMode) {
      setIsSearchMode(false)
      setSearchQuery('')
    }
    
    // Update URL params to preserve filter
    const newSearchParams = new URLSearchParams(searchParams)
    if (selectedOption?.value) {
      newSearchParams.set('cityCode', selectedOption.value)
    } else {
      newSearchParams.delete('cityCode')
    }
    setSearchParams(newSearchParams)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return
    }
    setIsSearching(true)
    setIsSearchMode(true)
    setCurrentPage(1)
    dispatch(searchTourGroupsRequest(searchQuery.trim(), selectedCity?.value || null))
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    setIsSearching(false)
    setCurrentPage(1)
    dispatch(clearTourGroupList())
    // Refetch regular tour groups
    if (isPermissionsReady && canViewTourGroup) {
      dispatch(
        fetchTourGroupsRequest({
          page: 1,
          limit: pageSize,
          cityCode: selectedCity?.value || null,
        })
      )
    }
  }

  // Handle search results
  useEffect(() => {
    if (searchedTourGroups && searchedTourGroups.length > 0) {
      setIsSearching(false)
    } else if (isSearchMode && searchedTourGroups && searchedTourGroups.length === 0) {
      setIsSearching(false)
    }
  }, [searchedTourGroups, isSearchMode])
  const handleEdit = id => {
    dispatch(fetchTourGroupByIdRequest(id))
    setEditId(id)
    setIsEdit(true)
    setIsViewing(false)
    setModal(true)
  }

  const handleDelete = tourGroup => {
    /* console.log(tourGroup._id, tourGroup.city.name) */
    setDeleteModal(true)
    setSelectedTourGroupToBeDeleted(tourGroup)
    setIsDeleting(true)
  }

  const onConfirmDelete = () => {
    if (selectedTourGroupToBeDeleted) {
      dispatch(
        deleteTourGroupRequest(
          selectedTourGroupToBeDeleted._id,
          selectedTourGroupToBeDeleted.name
        )
      )
      setDeleteModal(false)
      setSelectedTourGroupToBeDeleted(null)
      setIsDeleting(false)
    }
  }

  const handleOnCloseClick = () => {
    setIsDeleting(false)
    setDeleteModal(false)
  }
  const handleViewDetails = id => {
    dispatch(fetchTourGroupByIdRequest(id))
    setEditId(id)
    setIsViewing(true)
    setIsEdit(false)
    setModal(true)
  }

  const handleViewCalender = id => {
    showToastSuccess("Calender Triggered")
  }

  const handleConnectCategories = (tourGroup) => {
    setSelectedTourGroupForConnection(tourGroup)
    setConnectModal(true)
  }

  const handleConnectionSuccess = () => {
    // Refresh the tour group data
    if (isPermissionsReady && canViewTourGroup) {
      dispatch(
        fetchTourGroupsRequest({
          page: currentPage,
          limit: pageSize,
          cityCode: selectedCity?.value || null,
        })
      )
    }
  }

  const handleConnectKlook = (tourGroup) => {
    setSelectedTourGroupForKlook(tourGroup)
    setConnectKlookModal(true)
  }

  const handleKlookConnectionSuccess = () => {
    // Refresh the tour group data
    if (isPermissionsReady && canViewTourGroup) {
      dispatch(
        fetchTourGroupsRequest({
          page: currentPage,
          limit: pageSize,
          cityCode: selectedCity?.value || null,
        })
      )
    }

    // Refresh Klook mappings for displayed items
    if (displayData.length > 0) {
      displayData.forEach((tg) => {
        dispatch(fetchKlookMappingsRequest(tg._id));
      });
    }
  }

  const handleViewVariantsPricing = (tourGroup) => {
    setSelectedTourGroupForPricing(tourGroup)
    setVariantsPricingModal(true)
  }

  const handleManageVariants = (tourGroup) => {
    setSelectedTourGroupForVariantManagement(tourGroup)
    setVariantManagementModal(true)
  }

  // Calculate which data to display - client-side pagination from Redux data
  const displayData = useMemo(() => {
    // Use search results if in search mode, otherwise use regular tour groups
    const dataSource = isSearchMode ? (searchedTourGroups || []) : tourGroup

    if (dataSource.length === 0) return []

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return dataSource.slice(startIndex, endIndex)
  }, [tourGroup, searchedTourGroups, currentPage, pageSize, isSearchMode])

  // Update total count based on search mode
  const displayTotalCount = useMemo(() => {
    return isSearchMode ? (searchedTourGroups?.length || 0) : totalCount
  }, [isSearchMode, searchedTourGroups, totalCount])

  // Fetch provider mappings for all tour groups (not just displayed page)
  useEffect(() => {
    const dataSource = isSearchMode ? (searchedTourGroups || []) : tourGroup;
    if (dataSource.length === 0) return;

    // Fetch mappings for all tour groups to ensure provider icon shows correctly
    // Use a Set to track which IDs we've already fetched to prevent duplicate calls
    const fetchedIds = new Set();
    dataSource.forEach((tg) => {
      // Only fetch if not already in Redux state and not already being fetched
      if (tg._id && (!providerMappings || !providerMappings[tg._id]) && !fetchedIds.has(tg._id)) {
        fetchedIds.add(tg._id);
        dispatch(fetchKlookMappingsRequest(tg._id));
      }
    });
  }, [tourGroup, searchedTourGroups, isSearchMode, dispatch])

  const columns = useMemo(
    () => [
      {
        Header: "Tour Name",
        accessor: "name",

        Cell: ({ row }) => (
          <div className="d-flex align-items-center gap-2">
            <Link
              to={`${row.original.urlSlugs?.EN || "#"}`}
              className="text-black fw-bold"
            >
              {row.original.name}
            </Link>
            {(() => {
              const mappings = providerMappings?.[row.original._id];
              const hasProvider = mappings && Array.isArray(mappings) && mappings.length > 0;
              return hasProvider ? (
                <span
                  className="badge bg-success"
                  title="Connected to External Provider"
                >
                  <i className="fas fa-plug me-1"></i>
                  Provider
                </span>
              ) : null;
            })()}
          </div>
        ),

        filterable: true,
      },
      {
        Header: "City",
        accessor: "cityName",
        Cell: ({ row }) => <span>{row.original.cityName || "—"}</span>,
        filterable: true,
      },
      {
        Header: "Price",
        accessor: "listingPrice.finalPrice",
        Cell: ({ row }) => {
          const price = row.original.listingPrice?.finalPrice;
          const currency = row.original.city?.country?.currency?.localSymbol || "$";

          return (
            <span>
              {price ? `${currency} ${price.toFixed(2)}` : "N/A"}
            </span>
          );
        },
        filterable: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`badge rounded-pill ${value === true ? "bg-success" : "bg-danger"
              }`}
          >
            {value === true ? "Active" : "Inactive"}
          </span>
        ),
        filterable: true,
      },
      {
        Header: "Rating",
        accessor: "review.average",
        Cell: ({ value }) => (
          <span className="badge bg-success">
            <i className="mdi mdi-star me-1"></i>
            {value}
          </span>
        ),
        disableFilters: true,
      },
      {
        Header: "Created Date",
        accessor: "createdAt",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "—",
        disableFilters: true,
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center justify-content-center gap-4">
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Edit"
                onClick={() => {
                  handleEdit(row.original._id)
                }}
              >
                <i className="fas fa-edit font-size-18 text-success"></i>
              </button>
            )}
            {canViewTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="view"
                onClick={() => {
                  handleViewDetails(row.original._id)
                }}
              >
                <i className="fas fa-eye font-size-18 text-primary"></i>
              </button>
            )}
            {role === "ADMIN" && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="variant"
              >
                <Link to={`variants/${row.original._id}`} target="_blank">
                  {" "}
                  <i className="fas fa-layer-group font-size-18 text-info"></i>
                </Link>
              </button>
            )}
            <button
              className="btn p-0 border-0 bg-transparent"
              title="calender"
              onClick={() => handleViewCalender(row.original._id)}
            >
              <i className="fas fa-calendar-alt font-size-18 text-warning"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title={row.original?.urlSlugs?.EN ? "View on Website" : "No URL slug available"}
              disabled={!row.original?.urlSlugs?.EN}
              onClick={(e) => {
                e.preventDefault();
                if (row.original?.urlSlugs?.EN) {
                  const urlSlug = row.original.urlSlugs.EN;
                  const cleanSlug = urlSlug.startsWith('/') ? urlSlug : `/${urlSlug}`;
                  window.open(`https://www.tickyourlist.com${cleanSlug}`, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                opacity: row.original?.urlSlugs?.EN ? 1 : 0.3,
                cursor: row.original?.urlSlugs?.EN ? 'pointer' : 'not-allowed'
              }}
            >
              <i className="fas fa-external-link-alt font-size-18 text-primary"></i>
            </button>
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Connect Categories"
                onClick={() => handleConnectCategories(row.original)}
              >
                <i className="fas fa-link font-size-18 text-info"></i>
              </button>
            )}
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Connect with External Provider"
                onClick={() => handleConnectKlook(row.original)}
              >
                <i className="fas fa-plug font-size-18 text-success"></i>
              </button>
            )}
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Manage Variants (Create/Edit/Import)"
                onClick={() => handleManageVariants(row.original)}
              >
                <i className="fas fa-layer-group font-size-18 text-purple"></i>
              </button>
            )}
            {canEditTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="View Variants & Refresh Pricing"
                onClick={() => handleViewVariantsPricing(row.original)}
              >
                <i className="fas fa-dollar-sign font-size-18 text-warning"></i>
              </button>
            )}
            {canDeleteTourGroup && (
              <button
                className="btn p-0 border-0 bg-transparent"
                title="Delete"
                onClick={() => handleDelete(row.original)}
              >
                <i className="fas fa-trash font-size-18 text-danger"></i>
              </button>
            )}
          </div>
        ),
      },
    ],
    [
      navigate,
      canEditTourGroup,
      canDeleteTourGroup,
      canViewTourGroup,
      role,
      providerMappings,
    ]
  )

  // Show loading while permissions are being fetched
  // Also show loading if permissions are missing (will auto-retry)
  if (permissionsLoading || !isPermissionsReady) {
    return (
      <div className="page-content">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">
              {permissionsLoading ? 'Loading permissions...' : 'Loading page data...'}
            </p>
            {!permissionsLoading && !isPermissionsReady && (
              <p className="text-muted small mt-2">
                <i className="mdi mdi-information me-1"></i>
                If this takes too long, permissions are being refreshed automatically...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canViewTourGroup) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="alert alert-danger text-center w-100" style={{ maxWidth: '600px' }}>
              <h5 className="mb-3">Permission Required!</h5>
              <p className="mb-2">You do not have permission to access this page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  document.title = "Tour Groups | TickYourList"
  if (!canViewTourGroup) {
    return (
      <div
        className="page-content  d-flex justify-content-center align-items-center "
        style={{ minHeight: "100vh" }}
      >
        <div
          style={{ minWidth: "80%" }}
          className="m-2 d-flex flex-column justify-content-center align-items-center bg-danger bg-soft text-white p-3"
        >
          <p className="fw-bold fs-4 mb-3 text-danger text-gradient">
            Permission Required
          </p>
          <p
            className="text-center mb-3 text-danger text-gradient "
            style={{ maxWidth: "60%" }}
          >
            You do not have the permission to access this page. If you think
            this is a mistake, contact the administrator.
          </p>
          <p className="text-center text-danger text-gradient">
            Click{" "}
            <Link
              to="/"
              className="text-primary text-soft text-decoration-underline fw-bold "
            >
              here
            </Link>{" "}
            to return to the home page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {error && <p>Something went wrong Please try again</p>}
      {isDeleting && (
        <DeleteModal
          show={deleteModal}
          onDeleteClick={onConfirmDelete}
          onCloseClick={handleOnCloseClick}
        >
          {selectedTourGroupToBeDeleted.name}
        </DeleteModal>
      )}
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="TickYourList" breadcrumbItem="TourGroup" />

          <Row>
            <Col>
              <Card>
                <CardBody>
                  {/* Search and Filter Section */}
                  <Row className="mb-3">
                    <Col md={4}>
                      <Label htmlFor="cityFilter" className="form-label">
                        Filter by City
                      </Label>
                      <Select
                        id="cityFilter"
                        value={selectedCity}
                        onChange={handleCityChange}
                        options={cities}
                        isClearable
                        isSearchable
                        isLoading={loadingCities}
                        placeholder="Search and select a city..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </Col>
                    <Col md={6}>
                      <Label htmlFor="tourSearch" className="form-label">
                        Search Tour Group by Name
                      </Label>
                      <div className="d-flex gap-2">
                        <Input
                          id="tourSearch"
                          type="text"
                          placeholder="Enter tour group name to search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                              handleSearch()
                            }
                          }}
                          disabled={loading || isSearching}
                        />
                        <Button
                          color="primary"
                          onClick={handleSearch}
                          disabled={!searchQuery.trim() || loading || isSearching}
                        >
                          {isSearching ? (
                            <>
                              <Spinner size="sm" className="me-1" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-search me-1"></i>
                              Search
                            </>
                          )}
                        </Button>
                        {isSearchMode && (
                          <Button
                            color="secondary"
                            onClick={handleClearSearch}
                            disabled={loading || isSearching}
                          >
                            <i className="bx bx-x me-1"></i>
                            Clear
                          </Button>
                        )}
                      </div>
                      {isSearchMode && searchedTourGroups && (
                        <small className="text-muted mt-1 d-block">
                          {searchedTourGroups.length > 0
                            ? `Found ${searchedTourGroups.length} tour group(s)`
                            : 'No tour groups found matching your search'}
                        </small>
                      )}
                    </Col>
                  </Row>

                  {/* This is the pagination component with search support */}
                  <TableContainerWithServerSidePagination
                    columns={columns}
                    data={displayData}
                    totalCount={displayTotalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    setPageSize={setPageSize}
                    toggleViewModal={toggle}
                    isAddNewTourGroup={canAddTourGroup}
                    isGlobalFilter={!isSearchMode}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                  <Modal isOpen={modal} toggle={toggle} size="xl">
                    <ModalHeader toggle={toggle} tag="h4">
                      {isViewing
                        ? `${tourGroupByIdName}`
                        : `${isEdit ? "Update Tour Group" : "Add New Tour Group"
                        }`}
                    </ModalHeader>
                    <ModalBody>
                      {isViewing ? (
                        <ViewTourGroup
                          setIsEdit={setIsEdit}
                          setIsViewing={setIsViewing}
                          isViewing={isViewing}
                          editId={editId}
                          setTourGroupByIdName={setTourGroupByIdName}
                        />
                      ) : (
                        <NewTourModel
                          setModal={setModal}
                          editId={editId}
                          isEdit={isEdit}
                        />
                      )}
                    </ModalBody>
                  </Modal>

                  {/* Connect Categories Modal */}
                  <ConnectCategoriesModal
                    isOpen={connectModal}
                    toggle={() => {
                      setConnectModal(false)
                      setSelectedTourGroupForConnection(null)
                    }}
                    tourGroup={selectedTourGroupForConnection}
                    onSuccess={handleConnectionSuccess}
                  />

                  {/* Connect Klook Modal */}
                  <ConnectKlookModal
                    isOpen={connectKlookModal}
                    toggle={() => {
                      setConnectKlookModal(false)
                      setSelectedTourGroupForKlook(null)
                    }}
                    tourGroup={selectedTourGroupForKlook}
                    onSuccess={handleKlookConnectionSuccess}
                  />

                  {/* Variants Pricing Modal */}
                  <VariantsPricingModal
                    isOpen={variantsPricingModal}
                    toggle={() => {
                      setVariantsPricingModal(false)
                      setSelectedTourGroupForPricing(null)
                    }}
                    tourGroupId={selectedTourGroupForPricing?._id}
                    tourGroupName={selectedTourGroupForPricing?.name}
                  />

                  {/* Variant Management Modal */}
                  <VariantManagementModal
                    isOpen={variantManagementModal}
                    toggle={() => {
                      setVariantManagementModal(false)
                      setSelectedTourGroupForVariantManagement(null)
                    }}
                    tourGroup={selectedTourGroupForVariantManagement}
                    onSuccess={() => {
                      // Refresh tour groups if needed
                    }}
                  />

                  {/* Pricing Details Modal (B2B/B2C) */}
                  <Modal isOpen={pricingDetailsModal} toggle={() => {
                    setPricingDetailsModal(false)
                    setSelectedTourGroupForPricingDetails(null)
                  }} size="md">
                    <ModalHeader toggle={() => {
                      setPricingDetailsModal(false)
                      setSelectedTourGroupForPricingDetails(null)
                    }}>
                      Pricing Details - {selectedTourGroupForPricingDetails?.name}
                    </ModalHeader>
                    <ModalBody>
                      {selectedTourGroupForPricingDetails?.providerPricing ? (
                        <div>
                          <h6 className="mb-3">Provider Pricing (B2B / B2C)</h6>
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Price</th>
                                  <th>Currency</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <span className="badge bg-info">B2B Price</span>
                                    <small className="text-muted d-block mt-1">Wholesale (Before Markup)</small>
                                  </td>
                                  <td className="fw-bold">
                                    {selectedTourGroupForPricingDetails.providerPricing.b2bPrice?.toFixed(2)}
                                  </td>
                                  <td>{selectedTourGroupForPricingDetails.providerPricing.currency || "USD"}</td>
                                </tr>
                                <tr>
                                  <td>
                                    <span className="badge bg-success">B2C Price</span>
                                    <small className="text-muted d-block mt-1">Retail (After Markup)</small>
                                  </td>
                                  <td className="fw-bold text-success">
                                    {selectedTourGroupForPricingDetails.providerPricing.b2cPrice?.toFixed(2)}
                                  </td>
                                  <td>{selectedTourGroupForPricingDetails.providerPricing.currency || "USD"}</td>
                                </tr>
                                {selectedTourGroupForPricingDetails.providerPricing.markupAmount && (
                                  <tr>
                                    <td>
                                      <span className="badge bg-warning">Markup</span>
                                    </td>
                                    <td className="fw-bold">
                                      {selectedTourGroupForPricingDetails.providerPricing.markupAmount?.toFixed(2)}
                                      {selectedTourGroupForPricingDetails.providerPricing.markupPercentage && (
                                        <span className="text-muted ms-2">
                                          ({selectedTourGroupForPricingDetails.providerPricing.markupPercentage}%)
                                        </span>
                                      )}
                                    </td>
                                    <td>{selectedTourGroupForPricingDetails.providerPricing.currency || "USD"}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {selectedTourGroupForPricingDetails.internalPrice && (
                            <div className="mt-4">
                              <h6 className="mb-3">Internal Pricing</h6>
                              <div className="table-responsive">
                                <table className="table table-bordered">
                                  <thead>
                                    <tr>
                                      <th>Type</th>
                                      <th>Price</th>
                                      <th>Currency</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>
                                        <span className="badge bg-secondary">Internal Price</span>
                                      </td>
                                      <td className="fw-bold">
                                        {selectedTourGroupForPricingDetails.internalPrice?.toFixed(2)}
                                      </td>
                                      <td>{selectedTourGroupForPricingDetails.internalCurrency || "$"}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          <p>No provider pricing details available</p>
                        </div>
                      )}
                    </ModalBody>
                  </Modal>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default TourGroupTable
