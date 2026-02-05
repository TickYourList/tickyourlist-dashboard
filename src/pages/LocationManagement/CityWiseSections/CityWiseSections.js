import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";
import Select from "react-select";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import TableContainerWithServerSidePagination from "../../../components/Common/TableContainerWithServerSidePagination";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  createTravelSection,
  deleteTravelSection,
  getCategoriesForCity,
  getCityList,
  getSubcategoriesForCity,
  sortTravelSections,
  getTravelSectionsWithFallback,
} from "../../../helpers/location_management_helper";
import { showToastError, showToastSuccess } from "../../../helpers/toastBuilder";

const getCategoryTypeLabel = (type) => {
  if (type === "PRIMARY_CATEGORY") return "Category";
  if (type === "SUB_CATEGORY") return "Subcategory";
  return "—";
};

const getSectionName = (section) => {
  const category = section?.category?.id;
  return (
    category?.displayName ||
    category?.name ||
    category?.title ||
    section?.sectionName ||
    section?.iconName ||
    "Untitled Section"
  );
};

const getCityName = (section) =>
  section?.city?.displayName || section?.city?.name || "—";

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString();
};

const SortSectionRow = ({ section, index, moveSortSection }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "SectionSortItem",
    hover(item) {
      if (!ref.current) return;
      if (item.index === index) return;
      moveSortSection(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "SectionSortItem",
    item: { id: section?._id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  return (
    <ListGroupItem
      ref={ref}
      className="d-flex justify-content-between align-items-center"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      <div>
        <strong>{index + 1}.</strong>{" "}
        {getSectionName(section)}{" "}
        <small className="text-muted">
          ({getCategoryTypeLabel(section?.category?.type)})
        </small>
      </div>
      <div className="text-muted">
        <i className="mdi mdi-drag me-1" />
        Drag
      </div>
    </ListGroupItem>
  );
};

function CityWiseSections() {
  document.title = "City Wise Sections | TickYourList";

  const [selectedSection, setSelectedSection] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cityCodeFilter, setCityCodeFilter] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCityOption, setSelectedCityOption] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [dataSource, setDataSource] = useState("primary");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortSections, setSortSections] = useState([]);
  const [loadingSortSections, setLoadingSortSections] = useState(false);
  const [savingSortOrder, setSavingSortOrder] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [addSectionCity, setAddSectionCity] = useState(null);
  const [addSectionType, setAddSectionType] = useState(null);
  const [addSectionOption, setAddSectionOption] = useState(null);
  const [sectionOptionsByType, setSectionOptionsByType] = useState([]);
  const [loadingSectionOptions, setLoadingSectionOptions] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);
  const [allSectionsForCity, setAllSectionsForCity] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [loadingAddSectionData, setLoadingAddSectionData] = useState(false);

  const sectionTypeOptions = useMemo(
    () => [
      { value: "PRIMARY_CATEGORY", label: "Category" },
      { value: "SUB_CATEGORY", label: "Subcategory" },
    ],
    [],
  );

  const handleOpenDetail = section => {
    setSelectedSection(section);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedSection(null);
  };

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getTravelSectionsWithFallback({
        page: currentPage,
        limit: pageSize,
        cityCode: cityCodeFilter,
      });

      const payload = response?.data || {};
      const fetchedSections = Array.isArray(payload.sections)
        ? payload.sections
        : [];

      setSections(fetchedSections);
      setTotalCount(
        Number.isFinite(Number(payload.total))
          ? Number(payload.total)
          : fetchedSections.length,
      );
      if (
        Number.isFinite(Number(payload.page)) &&
        Number(payload.page) > 0 &&
        Number(payload.page) !== currentPage
      ) {
        setCurrentPage(Number(payload.page));
      }
      setDataSource(payload.source || "primary");
    } catch (error) {
      setSections([]);
      setTotalCount(0);
      setDataSource("primary");
      setErrorMessage("Failed to fetch sections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cityCodeFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const cities = await getCityList();
        const options = (Array.isArray(cities) ? cities : []).map((city) => ({
          ...city,
          label: `${city.label} (${city.cityCode || city.value})`,
        }));
        setCityOptions(options);
      } catch (error) {
        setCityOptions([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchAddSectionData = async () => {
      if (!isAddSectionModalOpen || !addSectionCity?.value) {
        setAllSectionsForCity([]);
        setAvailableCategories([]);
        setAvailableSubcategories([]);
        setSectionOptionsByType([]);
        setAddSectionOption(null);
        return;
      }

      setLoadingAddSectionData(true);
      try {
        const cityCode = addSectionCity.value;

        // Fetch all sections for the city
        const sectionsResponse = await getTravelSectionsWithFallback({
          page: 1,
          limit: 1000,
          cityCode,
        });
        const sectionsPayload = sectionsResponse?.data || {};
        const allSections = Array.isArray(sectionsPayload.sections)
          ? sectionsPayload.sections
          : [];

        // Handle pagination if needed
        const totalPages = Number(sectionsPayload.totalPages) || 1;
        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page += 1) {
            const pageResponse = await getTravelSectionsWithFallback({
              page,
              limit: 1000,
              cityCode,
            });
            const pageSections = Array.isArray(pageResponse?.data?.sections)
              ? pageResponse.data.sections
              : [];
            allSections.push(...pageSections);
          }
        }

        setAllSectionsForCity(allSections);

        // Get IDs of categories and subcategories already used in sections
        // Check multiple possible paths for category ID and type
        const usedCategoryIds = new Set();
        const usedSubcategoryIds = new Set();
        const usedIds = new Set(); // Track all used IDs regardless of type

        allSections.forEach((section) => {
          // Try multiple ways to get the category ID
          const categoryId =
            section?.category?.id ||
            section?.category?._id ||
            section?.categoryId ||
            (typeof section?.category === "string" ? section.category : null);

          // Try multiple ways to get the category type
          const categoryType =
            section?.category?.type ||
            section?.categoryType ||
            section?.type;

          if (categoryId) {
            // Convert to string for consistent comparison
            const idString = String(categoryId);
            usedIds.add(idString); // Track in general set

            if (categoryType === "PRIMARY_CATEGORY") {
              usedCategoryIds.add(idString);
            } else if (categoryType === "SUB_CATEGORY") {
              usedSubcategoryIds.add(idString);
            }
            // If type is unclear, we'll check against both lists when filtering
          }
        });

        // Fetch all categories and subcategories
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          getCategoriesForCity(cityCode),
          getSubcategoriesForCity(cityCode),
        ]);

        const allCategories = Array.isArray(categoriesResponse?.data?.categories)
          ? categoriesResponse.data.categories
          : [];
        const allSubcategories = Array.isArray(subcategoriesResponse?.data?.subcategories)
          ? subcategoriesResponse.data.subcategories
          : [];

        // Filter out already used items - convert IDs to strings for comparison
        // A category/subcategory is excluded if its ID is in the usedIds set
        const leftOutCategories = allCategories.filter((cat) => {
          if (!cat?._id) return false;
          const catIdString = String(cat._id);
          // Exclude if used as either category or subcategory (to prevent duplicates)
          return !usedIds.has(catIdString);
        });

        const leftOutSubcategories = allSubcategories.filter((sub) => {
          if (!sub?._id) return false;
          const subIdString = String(sub._id);
          // Exclude if used as either category or subcategory (to prevent duplicates)
          return !usedIds.has(subIdString);
        });

        setAvailableCategories(leftOutCategories);
        setAvailableSubcategories(leftOutSubcategories);

        // Update section options based on selected type
        if (addSectionType?.value) {
          const rawOptions =
            addSectionType.value === "PRIMARY_CATEGORY"
              ? leftOutCategories
              : leftOutSubcategories;

          const mappedOptions = rawOptions.map((item) => ({
            value: item?._id,
            label: item?.displayName || item?.name || item?.title || "Unnamed",
          }));

          setSectionOptionsByType(mappedOptions);
        }
      } catch (error) {
        console.error("Error fetching add section data:", error);
        setAllSectionsForCity([]);
        setAvailableCategories([]);
        setAvailableSubcategories([]);
        setSectionOptionsByType([]);
        showToastError("Failed to load section data for selected city");
      } finally {
        setLoadingAddSectionData(false);
        setLoadingSectionOptions(false);
      }
    };

    fetchAddSectionData();
  }, [isAddSectionModalOpen, addSectionCity]);

  // Update section options when type changes
  useEffect(() => {
    if (!addSectionType?.value || !isAddSectionModalOpen) {
      setSectionOptionsByType([]);
      setAddSectionOption(null);
      return;
    }

    const rawOptions =
      addSectionType.value === "PRIMARY_CATEGORY"
        ? availableCategories
        : availableSubcategories;

    const mappedOptions = rawOptions.map((item) => ({
      value: item?._id,
      label: item?.displayName || item?.name || item?.title || "Unnamed",
    }));

    setSectionOptionsByType(mappedOptions);
    setAddSectionOption(null);
  }, [addSectionType, availableCategories, availableSubcategories, isAddSectionModalOpen]);

  const tableData = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        sectionCode: section?._id || "—",
        cityCode: section?.cityCode || section?.city?.cityCode || "—",
        cityName: getCityName(section),
        sectionName: getSectionName(section),
        categoryType: getCategoryTypeLabel(section?.category?.type),
        rank:
          Number.isFinite(Number(section?.sortOrder))
            ? Number(section.sortOrder)
            : "—",
        statusLabel: section?.status ? "Active" : "Inactive",
        updatedAtLabel: formatDate(section?.updatedAt),
      })),
    [sections],
  );

  const loadSortSections = async (cityCode) => {
    if (!cityCode) return;

    setLoadingSortSections(true);
    try {
      const firstPageResponse = await getTravelSectionsWithFallback({
        page: 1,
        limit: 100,
        cityCode,
      });
      const firstPayload = firstPageResponse?.data || {};
      const firstSections = Array.isArray(firstPayload.sections)
        ? firstPayload.sections
        : [];
      const totalPages = Number(firstPayload.totalPages) || 1;

      let allSections = [...firstSections];

      if (totalPages > 1) {
        for (let page = 2; page <= totalPages; page += 1) {
          const pageResponse = await getTravelSectionsWithFallback({
            page,
            limit: 100,
            cityCode,
          });
          const pageSections = Array.isArray(pageResponse?.data?.sections)
            ? pageResponse.data.sections
            : [];
          allSections = allSections.concat(pageSections);
        }
      }

      const orderedSections = [...allSections].sort((a, b) => {
        const aOrder = Number(a?.sortOrder);
        const bOrder = Number(b?.sortOrder);
        const safeA = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
        const safeB = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
        if (safeA !== safeB) return safeA - safeB;
        return String(a?._id || "").localeCompare(String(b?._id || ""));
      });

      setSortSections(orderedSections);
    } catch (error) {
      setSortSections([]);
      showToastError("Failed to load sections for sorting");
    } finally {
      setLoadingSortSections(false);
    }
  };

  const handleOpenSortModal = async () => {
    if (!cityCodeFilter) {
      showToastError("Please select a city first to sort sections");
      return;
    }
    setIsSortModalOpen(true);
    await loadSortSections(cityCodeFilter);
  };

  const handleCloseSortModal = () => {
    setIsSortModalOpen(false);
    setSortSections([]);
    setLoadingSortSections(false);
    setSavingSortOrder(false);
  };

  const moveSortSection = useCallback((dragIndex, hoverIndex) => {
    setSortSections((prev) => {
      if (dragIndex === hoverIndex) return prev;
      const nextSections = [...prev];
      const [item] = nextSections.splice(dragIndex, 1);
      nextSections.splice(hoverIndex, 0, item);

      return nextSections.map((section, index) => ({
        ...section,
        sortOrder: index + 1,
      }));
    });
  }, []);

  const handleSaveSortOrder = async () => {
    if (!cityCodeFilter || sortSections.length === 0) {
      showToastError("No sections available to sort");
      return;
    }

    setSavingSortOrder(true);
    try {
      await sortTravelSections({
        cityCode: cityCodeFilter,
        sectionIds: sortSections.map((section) => section._id).filter(Boolean),
      });
      showToastSuccess("Section order saved successfully");
      handleCloseSortModal();
      fetchSections();
    } catch (error) {
      showToastError("Failed to save section order");
    } finally {
      setSavingSortOrder(false);
    }
  };

  const handleOpenDeleteModal = (section) => {
    setSectionToDelete(section);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete?._id) return;

    setIsDeleting(true);
    try {
      await deleteTravelSection(sectionToDelete._id);
      showToastSuccess("Section deleted successfully");
      setIsDeleteModalOpen(false);
      setSectionToDelete(null);
      fetchSections();
    } catch (error) {
      showToastError("Failed to delete section");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddSectionModal = () => {
    setAddSectionCity(selectedCityOption || null);
    setAddSectionType(sectionTypeOptions[0]);
    setAddSectionOption(null);
    setSectionOptionsByType([]);
    setAllSectionsForCity([]);
    setAvailableCategories([]);
    setAvailableSubcategories([]);
    setIsAddSectionModalOpen(true);
  };

  const handleCloseAddSectionModal = () => {
    if (creatingSection) return;
    setIsAddSectionModalOpen(false);
    setAddSectionCity(null);
    setAddSectionType(null);
    setAddSectionOption(null);
    setSectionOptionsByType([]);
    setLoadingSectionOptions(false);
    setAllSectionsForCity([]);
    setAvailableCategories([]);
    setAvailableSubcategories([]);
    setLoadingAddSectionData(false);
  };

  const handleCreateSection = async () => {
    if (!addSectionCity?.value) {
      showToastError("Please select a city");
      return;
    }

    if (!addSectionType?.value) {
      showToastError("Please select section type");
      return;
    }

    if (!addSectionOption?.value) {
      showToastError("Please select a category/subcategory");
      return;
    }

    setCreatingSection(true);
    try {
      await createTravelSection({
        cityCode: addSectionCity.value,
        category: {
          type: addSectionType.value,
          id: addSectionOption.value,
        },
        iconName: addSectionOption.label,
      });

      showToastSuccess("Section created successfully");
      handleCloseAddSectionModal();

      if (selectedCityOption?.value === addSectionCity.value) {
        fetchSections();
      } else {
        setSelectedCityOption(addSectionCity);
        setCityCodeFilter(addSectionCity.value);
        setCurrentPage(1);
      }
    } catch (error) {
      showToastError("Failed to create section");
    } finally {
      setCreatingSection(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Section Code",
        accessor: "sectionCode",
      },
      {
        Header: "City Code",
        accessor: "cityCode",
      },
      {
        Header: "City",
        accessor: "cityName",
      },
      {
        Header: "Section",
        accessor: "sectionName",
      },
      {
        Header: "Type",
        accessor: "categoryType",
      },
      {
        Header: "Rank",
        accessor: "rank",
      },
      {
        Header: "Status",
        accessor: "statusLabel",
        Cell: (cellProps) => (
          <Badge color={cellProps.value === "Active" ? "success" : "secondary"}>
            {cellProps.value}
          </Badge>
        ),
      },
      {
        Header: "Updated",
        accessor: "updatedAtLabel",
      },
      {
        Header: "View Detail",
        disableFilters: true,
        Cell: ({ row }) => (
          <Button
            type="button"
            color="primary"
            className="btn-sm btn-rounded"
            onClick={() => handleOpenDetail(row.original)}
          >
            View Detail
          </Button>
        ),
      },
      {
        Header: "Action",
        disableFilters: true,
        Cell: ({ row }) => (
          <Button
            type="button"
            color="danger"
            className="btn-sm btn-rounded"
            onClick={() => handleOpenDeleteModal(row.original)}
          >
            Delete
          </Button>
        ),
      },
    ],
    [],
  );

  const handleCityChange = (selectedOption) => {
    setSelectedCityOption(selectedOption || null);
    setCityCodeFilter(selectedOption?.value || "");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchSections();
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Location Management"
            breadcrumbItem="City Wise Sections"
          />

          <Row className="mb-3">
            <Col md={4}>
              <Label className="form-label">Filter by City</Label>
              <Select
                value={selectedCityOption}
                onChange={handleCityChange}
                options={cityOptions}
                isClearable
                isSearchable
                isLoading={loadingCities}
                placeholder="Search and select a city..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Col>
            <Col md={8} className="d-flex align-items-end justify-content-md-end mt-3 mt-md-0">
              <Button
                color="success"
                className="me-2"
                onClick={handleOpenAddSectionModal}
                disabled={loading || loadingCities}
              >
                Add Section
              </Button>
              <Button
                color="info"
                className="me-2"
                onClick={handleOpenSortModal}
                disabled={loading || !cityCodeFilter}
              >
                Sort Sections
              </Button>
              <Button color="primary" onClick={handleRefresh} disabled={loading}>
                Refresh
              </Button>
            </Col>
          </Row>

          {dataSource === "fallback" && (
            <Alert color="warning">
              Using fallback mode. Primary paginated sections API is unavailable.
            </Alert>
          )}

          {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner color="primary" />
                      <div className="mt-2">Loading sections...</div>
                    </div>
                  ) : tableData.length > 0 ? (
                    <TableContainerWithServerSidePagination
                      columns={columns}
                      data={tableData}
                      totalCount={totalCount}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      setPageSize={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      isGlobalFilter={false}
                      className="custom-header-css"
                    />
                  ) : (
                    <div className="text-muted text-center py-4">
                      No sections found.
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={isDetailOpen} toggle={handleCloseDetail} centered>
        <ModalHeader toggle={handleCloseDetail}>
          City Wise Section Details
        </ModalHeader>
        <ModalBody>
          {selectedSection ? (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>Section Code:</strong> {selectedSection.sectionCode}
              </div>
              <div>
                <strong>City Code:</strong> {selectedSection.cityCode}
              </div>
              <div>
                <strong>City:</strong> {selectedSection.cityName}
              </div>
              <div>
                <strong>Section:</strong> {selectedSection.sectionName}
              </div>
              <div>
                <strong>Type:</strong> {selectedSection.categoryType}
              </div>
              <div>
                <strong>Rank:</strong> {selectedSection.rank}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge
                  color={
                    selectedSection.statusLabel === "Active"
                      ? "success"
                      : "secondary"
                  }
                >
                  {selectedSection.statusLabel}
                </Badge>
              </div>
              <div>
                <strong>Last Updated:</strong> {selectedSection.updatedAtLabel}
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseDetail}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isAddSectionModalOpen} toggle={handleCloseAddSectionModal} centered size="xl">
        <ModalHeader toggle={handleCloseAddSectionModal}>
          Add New Section
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label className="form-label">City</Label>
            <Select
              value={addSectionCity}
              onChange={(option) => {
                setAddSectionCity(option || null);
                setAddSectionOption(null);
              }}
              options={cityOptions}
              isClearable
              isSearchable
              isLoading={loadingCities}
              placeholder="Select city..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {loadingAddSectionData ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading sections and categories...</p>
            </div>
          ) : addSectionCity?.value ? (
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <CardBody>
                    <h5 className="mb-3">
                      Selected Sections ({allSectionsForCity.length})
                    </h5>
                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      {allSectionsForCity.length > 0 ? (
                        <ListGroup flush>
                          {allSectionsForCity.map((section, index) => {
                            const categoryId =
                              section?.category?.id ||
                              section?.category?._id ||
                              section?.categoryId ||
                              null;
                            const categoryType =
                              section?.category?.type ||
                              section?.categoryType ||
                              "Unknown";
                            const sectionName = getSectionName(section);

                            return (
                              <ListGroupItem
                                key={section?._id || index}
                                className="d-flex justify-content-between align-items-start"
                              >
                                <div className="flex-grow-1">
                                  <strong>{sectionName}</strong>
                                  <br />
                                  <small className="text-muted">
                                    <Badge color="secondary" className="me-1">
                                      {getCategoryTypeLabel(categoryType)}
                                    </Badge>
                                    {categoryId && (
                                      <span className="text-muted">
                                        ID: {String(categoryId).substring(0, 8)}...
                                      </span>
                                    )}
                                  </small>
                                </div>
                                <Badge color="info" className="ms-2">
                                  #{section?.sortOrder || index + 1}
                                </Badge>
                              </ListGroupItem>
                            );
                          })}
                        </ListGroup>
                      ) : (
                        <p className="text-muted text-center py-3">
                          No sections found for this city
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <CardBody>
                    <div className="mb-3">
                      <Label className="form-label">Section Type</Label>
                      <Select
                        value={addSectionType}
                        onChange={(option) => {
                          setAddSectionType(option || null);
                          setAddSectionOption(null);
                        }}
                        options={sectionTypeOptions}
                        isClearable={false}
                        isSearchable={false}
                        placeholder="Select section type..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <h5 className="mb-2">
                      Available{" "}
                      {addSectionType?.value === "PRIMARY_CATEGORY"
                        ? "Categories"
                        : "Subcategories"}{" "}
                      (
                      {addSectionType?.value === "PRIMARY_CATEGORY"
                        ? availableCategories.length
                        : availableSubcategories.length}
                      )
                    </h5>
                    <p className="text-muted small mb-3">
                      <i className="mdi mdi-information-outline me-1"></i>
                      Only showing items not already used in sections
                    </p>
                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      {addSectionType?.value ? (
                        sectionOptionsByType.length > 0 ? (
                          <ListGroup flush>
                            {sectionOptionsByType.map((option, index) => (
                              <ListGroupItem
                                key={option.value || index}
                                className="d-flex justify-content-between align-items-center"
                                style={{
                                  cursor: "pointer",
                                  backgroundColor:
                                    addSectionOption?.value === option.value
                                      ? "#e3f2fd"
                                      : "transparent",
                                }}
                                onClick={() =>
                                  setAddSectionOption(
                                    addSectionOption?.value === option.value
                                      ? null
                                      : option
                                  )
                                }
                              >
                                <div>
                                  <strong>{option.label}</strong>
                                </div>
                                {addSectionOption?.value === option.value && (
                                  <Badge color="success">
                                    <i className="mdi mdi-check"></i>
                                  </Badge>
                                )}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        ) : (
                          <p className="text-muted text-center py-3">
                            No available{" "}
                            {addSectionType.value === "PRIMARY_CATEGORY"
                              ? "categories"
                              : "subcategories"}{" "}
                            left to add
                          </p>
                        )
                      ) : (
                        <p className="text-muted text-center py-3">
                          Please select a section type
                        </p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ) : (
            <p className="text-muted text-center py-4">
              Please select a city to view sections and available categories/subcategories
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={handleCloseAddSectionModal}
            disabled={creatingSection}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleCreateSection}
            disabled={
              creatingSection ||
              !addSectionCity ||
              !addSectionType ||
              !addSectionOption
            }
          >
            {creatingSection ? (
              <>
                <Spinner size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              "Create Section"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isSortModalOpen} toggle={handleCloseSortModal} centered size="lg">
        <ModalHeader toggle={handleCloseSortModal}>
          Sort Sections ({cityCodeFilter || "—"})
        </ModalHeader>
        <ModalBody>
          {loadingSortSections ? (
            <div className="text-center py-3">
              <Spinner color="primary" />
              <div className="mt-2">Loading sections...</div>
            </div>
          ) : sortSections.length > 0 ? (
            <DndProvider backend={HTML5Backend}>
              <ListGroup>
                {sortSections.map((section, index) => (
                  <SortSectionRow
                    key={section?._id || `${section?.cityCode}-${index}`}
                    section={section}
                    index={index}
                    moveSortSection={moveSortSection}
                  />
                ))}
              </ListGroup>
            </DndProvider>
          ) : (
            <div className="text-muted text-center py-3">
              No sections available for sorting.
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseSortModal} disabled={savingSortOrder}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSaveSortOrder}
            disabled={savingSortOrder || loadingSortSections || sortSections.length === 0}
          >
            {savingSortOrder ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Order"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} toggle={handleCloseDeleteModal} centered>
        <ModalHeader toggle={handleCloseDeleteModal}>Delete Section</ModalHeader>
        <ModalBody>
          {sectionToDelete ? (
            <>
              Are you sure you want to delete section{" "}
              <strong>{sectionToDelete.sectionName}</strong> (
              {sectionToDelete.cityCode})?
            </>
          ) : (
            "Are you sure you want to delete this section?"
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}

export default CityWiseSections;
