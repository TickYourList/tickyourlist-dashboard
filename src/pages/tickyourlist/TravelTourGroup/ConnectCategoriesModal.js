import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Label,
  Input,
  Spinner,
  Card,
  CardBody,
  Badge,
} from "reactstrap";
import {
  getCityCategories,
  getCitySubCategories,
  connectTourGroupToCategories,
  getTourById,
} from "helpers/location_management_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const ConnectCategoriesModal = ({
  isOpen,
  toggle,
  tourGroup,
  onSuccess,
}) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loadingTourGroup, setLoadingTourGroup] = useState(false);
  const [cityCode, setCityCode] = useState("");

  // Helper function to normalize ID to string for comparison
  const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (id._id) return String(id._id);
    if (id.toString) return String(id);
    return String(id);
  };

  // Fetch tour group with populated connections when modal opens
  useEffect(() => {
    if (isOpen && tourGroup?._id) {
      const fetchTourGroupData = async () => {
        setLoadingTourGroup(true);
        try {
          const response = await getTourById(tourGroup._id);
          if (response?.data) {
            const fetchedTourGroup = response.data;

            const tourCityCode = fetchedTourGroup.cityCode || fetchedTourGroup.city?.cityCode;
            setCityCode(tourCityCode || "");

            // Load existing connections - normalize IDs to strings
            const existingCategories = (fetchedTourGroup.categoryConnections || []).map(
              (conn) => normalizeId(conn.item?._id || conn.item)
            ).filter(id => id !== null);

            const existingSubcategories = (fetchedTourGroup.subcategoryConnections || []).map(
              (conn) => normalizeId(conn.item?._id || conn.item)
            ).filter(id => id !== null);

            setSelectedCategories(existingCategories);
            setSelectedSubcategories(existingSubcategories);

            if (tourCityCode) {
              fetchCategoriesAndSubcategories(tourCityCode);
            }
          }
        } catch (error) {
          console.error("Error fetching tour group:", error);
          // Fallback to using the passed tourGroup
          const tourCityCode = tourGroup.cityCode || tourGroup.city?.cityCode;
          setCityCode(tourCityCode || "");

          const existingCategories = (tourGroup.categoryConnections || []).map(
            (conn) => normalizeId(conn.item?._id || conn.item)
          ).filter(id => id !== null);

          const existingSubcategories = (tourGroup.subcategoryConnections || []).map(
            (conn) => normalizeId(conn.item?._id || conn.item)
          ).filter(id => id !== null);

          setSelectedCategories(existingCategories);
          setSelectedSubcategories(existingSubcategories);

          if (tourCityCode) {
            fetchCategoriesAndSubcategories(tourCityCode);
          }
        } finally {
          setLoadingTourGroup(false);
        }
      };

      fetchTourGroupData();
    } else if (isOpen && tourGroup) {
      // Fallback if no _id
      const tourCityCode = tourGroup.cityCode || tourGroup.city?.cityCode;
      setCityCode(tourCityCode || "");

      const existingCategories = (tourGroup.categoryConnections || []).map(
        (conn) => normalizeId(conn.item?._id || conn.item)
      ).filter(id => id !== null);

      const existingSubcategories = (tourGroup.subcategoryConnections || []).map(
        (conn) => normalizeId(conn.item?._id || conn.item)
      ).filter(id => id !== null);

      setSelectedCategories(existingCategories);
      setSelectedSubcategories(existingSubcategories);

      if (tourCityCode) {
        fetchCategoriesAndSubcategories(tourCityCode);
      }
    }
  }, [isOpen, tourGroup]);

  const fetchCategoriesAndSubcategories = async (cityCodeValue) => {
    if (!cityCodeValue) return;

    setFetching(true);
    try {
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        getCityCategories(cityCodeValue),
        getCitySubCategories(cityCodeValue),
      ]);

      if (categoriesRes?.data?.categories) {
        setCategories(categoriesRes.data.categories);
      }
      if (subcategoriesRes?.data?.subcategories) {
        setSubcategories(subcategoriesRes.data.subcategories);
      }
    } catch (error) {
      console.error("Error fetching categories/subcategories:", error);
      showToastError("Failed to load categories and subcategories");
    } finally {
      setFetching(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const normalizedId = normalizeId(categoryId);
    if (!normalizedId) return;

    setSelectedCategories((prev) => {
      const normalizedPrev = prev.map(id => normalizeId(id));
      if (normalizedPrev.includes(normalizedId)) {
        return prev.filter((id) => normalizeId(id) !== normalizedId);
      } else {
        return [...prev, normalizedId];
      }
    });
  };

  const resolveParentCategoryId = (subcategory) => {
    if (!subcategory) return null;

    const subcategoryCategoryObjectId = normalizeId(
      subcategory?.category?._id || subcategory?.category
    );
    const subcategoryCategoryNumericId =
      subcategory?.categoryId !== undefined && subcategory?.categoryId !== null
        ? String(subcategory.categoryId)
        : null;

    const parentCategory = categories.find((category) => {
      const categoryObjectId = normalizeId(category?._id || category?.id);
      const categoryNumericId =
        category?.id !== undefined && category?.id !== null
          ? String(category.id)
          : null;
      const categoryDomainId =
        category?.categoryId !== undefined && category?.categoryId !== null
          ? String(category.categoryId)
          : null;

      const objectIdMatches =
        subcategoryCategoryObjectId &&
        categoryObjectId &&
        subcategoryCategoryObjectId === categoryObjectId;

      const numericIdMatches =
        subcategoryCategoryNumericId &&
        ((categoryNumericId && subcategoryCategoryNumericId === categoryNumericId) ||
          (categoryDomainId && subcategoryCategoryNumericId === categoryDomainId));

      return objectIdMatches || numericIdMatches;
    });

    return normalizeId(parentCategory?._id || parentCategory?.id);
  };

  const handleSubcategoryToggle = (subcategory) => {
    const subcategoryId = subcategory?._id || subcategory?.id || subcategory;
    const normalizedId = normalizeId(subcategoryId);
    if (!normalizedId) return;

    const normalizedCurrent = selectedSubcategories.map(id => normalizeId(id));
    const isSelecting = !normalizedCurrent.includes(normalizedId);
    const nextSelectedSubcategories = isSelecting
      ? [...selectedSubcategories, normalizedId]
      : selectedSubcategories.filter((id) => normalizeId(id) !== normalizedId);

    setSelectedSubcategories(nextSelectedSubcategories);

    if (typeof subcategory !== "object" || subcategory === null) {
      return;
    }

    const parentCategoryId = resolveParentCategoryId(subcategory);
    if (!parentCategoryId) {
      return;
    }

    // Auto-select parent category when a subcategory is selected.
    if (isSelecting) {
      setSelectedCategories((prev) => {
        const normalizedPrev = prev.map((id) => normalizeId(id));
        if (normalizedPrev.includes(parentCategoryId)) {
          return prev;
        }
        return [...prev, parentCategoryId];
      });
    }
  };

  const handleSave = async () => {
    if (!tourGroup?._id) {
      showToastError("Tour group ID is missing");
      return;
    }

    setLoading(true);
    try {
      await connectTourGroupToCategories(
        tourGroup._id,
        selectedCategories,
        selectedSubcategories
      );
      showToastSuccess("Categories and subcategories connected successfully");
      if (onSuccess) {
        onSuccess();
      }
      toggle();
    } catch (error) {
      console.error("Error connecting categories:", error);
      showToastError("Failed to connect categories and subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleCityCodeChange = (e) => {
    const newCityCode = e.target.value.toUpperCase();
    setCityCode(newCityCode);
    // Do not auto-carry hidden selections across cities.
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    if (newCityCode) {
      fetchCategoriesAndSubcategories(newCityCode);
    } else {
      setCategories([]);
      setSubcategories([]);
    }
  };

  const getItemName = (item) =>
    item?.displayName || item?.name || item?.title || "Unnamed";

  // Categories ranked from 1..N based on existing sortOrder and then name.
  const rankedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const aSort = Number.isFinite(Number(a?.sortOrder)) ? Number(a.sortOrder) : Number.MAX_SAFE_INTEGER;
      const bSort = Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : Number.MAX_SAFE_INTEGER;
      if (aSort !== bSort) return aSort - bSort;
      return getItemName(a).toLowerCase().localeCompare(getItemName(b).toLowerCase());
    });

    return sorted.map((category, index) => ({
      ...category,
      displayRank: index + 1,
    }));
  }, [categories]);

  // Support both numeric `id/categoryId` and ObjectId mappings.
  const categoryLookup = useMemo(() => {
    const map = new Map();
    rankedCategories.forEach((category) => {
      const objectId = normalizeId(category?._id || category?.id);
      if (objectId) {
        map.set(objectId, category);
      }
      if (category?.id !== undefined && category?.id !== null) {
        map.set(String(category.id), category);
      }
      if (category?.categoryId !== undefined && category?.categoryId !== null) {
        map.set(String(category.categoryId), category);
      }
    });
    return map;
  }, [rankedCategories]);

  // Group subcategories under their parent category rank.
  const groupedSubcategories = useMemo(() => {
    const groupsByCategory = new Map();
    const unlinked = [];

    subcategories.forEach((subcategory) => {
      const parentKeys = [
        subcategory?.categoryId !== undefined && subcategory?.categoryId !== null
          ? String(subcategory.categoryId)
          : null,
        normalizeId(subcategory?.category?._id || subcategory?.category),
      ].filter(Boolean);

      let parentCategory = null;
      for (const key of parentKeys) {
        if (categoryLookup.has(key)) {
          parentCategory = categoryLookup.get(key);
          break;
        }
      }

      if (!parentCategory) {
        unlinked.push(subcategory);
        return;
      }

      const groupKey = normalizeId(parentCategory?._id || parentCategory?.id) || String(parentCategory?.displayRank);
      if (!groupsByCategory.has(groupKey)) {
        groupsByCategory.set(groupKey, {
          category: parentCategory,
          items: [],
        });
      }

      groupsByCategory.get(groupKey).items.push(subcategory);
    });

    const linkedGroups = Array.from(groupsByCategory.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) =>
          getItemName(a).toLowerCase().localeCompare(getItemName(b).toLowerCase()),
        ),
      }))
      .sort((a, b) => a.category.displayRank - b.category.displayRank);

    const sortedUnlinked = [...unlinked].sort((a, b) =>
      getItemName(a).toLowerCase().localeCompare(getItemName(b).toLowerCase()),
    );

    return { linkedGroups, unlinked: sortedUnlinked };
  }, [subcategories, categoryLookup]);

  const selectedCategorySummary = useMemo(() => {
    const normalizedSelected = selectedCategories.map(id => normalizeId(id));
    return rankedCategories
      .filter((category) => {
        const categoryId = normalizeId(category?._id || category?.id);
        return categoryId && normalizedSelected.includes(categoryId);
      })
      .map((category) => `Rank ${category.displayRank}: ${getItemName(category)}`);
  }, [rankedCategories, selectedCategories]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Connect Categories & Subcategories
        {tourGroup && (
          <small className="text-muted d-block mt-1">
            Tour: {tourGroup.name}
          </small>
        )}
      </ModalHeader>
      <ModalBody>
        <Row className="mb-3">
          <Col>
            <Label>City Code</Label>
            <Input
              type="text"
              value={cityCode}
              onChange={handleCityCodeChange}
              placeholder="Enter city code (e.g., DUBAI, PNQ)"
              className="text-uppercase"
            />
            <small className="text-muted">
              Enter city code to load categories and subcategories for that city
            </small>
          </Col>
        </Row>

        {(fetching || loadingTourGroup) && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">
              {loadingTourGroup
                ? "Loading tour group connections..."
                : "Loading categories and subcategories..."}
            </p>
          </div>
        )}

        {!fetching && !loadingTourGroup && cityCode && (
          <>
            <Row>
              <Col md={6}>
                <Card>
                  <CardBody>
                    <h5 className="mb-3">
                      Categories{" "}
                      <Badge color="primary">
                        {selectedCategories.length} selected
                      </Badge>
                    </h5>
                    {selectedCategorySummary.length > 0 && (
                      <small className="text-muted d-block mb-2">
                        {selectedCategorySummary.join(" | ")}
                      </small>
                    )}
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {categories.length === 0 ? (
                        <p className="text-muted">No categories found</p>
                      ) : (
                        rankedCategories.map((category) => {
                          const categoryId = category._id || category.id;
                          const normalizedId = normalizeId(categoryId);
                          const normalizedSelected = selectedCategories.map(id => normalizeId(id));
                          const isSelected = normalizedSelected.includes(normalizedId);

                          return (
                            <div
                              key={normalizedId || categoryId}
                              className="mb-2 d-flex align-items-center"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleCategoryToggle(categoryId)}
                            >
                              <Input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCategoryToggle(categoryId)}
                                onClick={(e) => e.stopPropagation()}
                                className="me-2"
                                style={{ cursor: 'pointer' }}
                              />
                              <Label
                                className="mb-0 flex-grow-1"
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                              >
                                {getItemName(category)}
                                <Badge color="secondary" className="ms-2">
                                  Rank: {category.displayRank}
                                </Badge>
                              </Label>
                              <Badge
                                color={isSelected ? "success" : "secondary"}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryToggle(categoryId);
                                }}
                              >
                                {isSelected ? "✓ Selected" : "Select"}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <CardBody>
                    <h5 className="mb-3">
                      Subcategories{" "}
                      <Badge color="primary">
                        {selectedSubcategories.length} selected
                      </Badge>
                    </h5>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {groupedSubcategories.linkedGroups.length === 0 && groupedSubcategories.unlinked.length === 0 ? (
                        <p className="text-muted">No subcategories found</p>
                      ) : (
                        <>
                          {groupedSubcategories.linkedGroups.map((group) => (
                            <div key={normalizeId(group.category?._id || group.category?.id) || group.category.displayRank} className="mb-3">
                              <div className="mb-2">
                                <Badge color="info">
                                  Rank {group.category.displayRank}
                                </Badge>
                                <span className="ms-2 fw-semibold">{getItemName(group.category)}</span>
                              </div>
                              {group.items.map((subcategory) => {
                                const subcategoryId = subcategory._id || subcategory.id;
                                const normalizedId = normalizeId(subcategoryId);
                                const normalizedSelected = selectedSubcategories.map(id => normalizeId(id));
                                const isSelected = normalizedSelected.includes(normalizedId);

                                return (
                                  <div
                                    key={normalizedId || subcategoryId}
                                    className="mb-2 d-flex align-items-center"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSubcategoryToggle(subcategory)}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSubcategoryToggle(subcategory)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="me-2"
                                      style={{ cursor: "pointer" }}
                                    />
                                    <Label
                                      className="mb-0 flex-grow-1"
                                      style={{ cursor: "pointer", userSelect: "none" }}
                                    >
                                      {getItemName(subcategory)}
                                    </Label>
                                    <Badge
                                      color={isSelected ? "success" : "secondary"}
                                      style={{ cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubcategoryToggle(subcategory);
                                      }}
                                    >
                                      {isSelected ? "✓ Selected" : "Select"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          ))}

                          {groupedSubcategories.unlinked.length > 0 && (
                            <div className="mt-3">
                              <div className="mb-2">
                                <Badge color="warning">No Rank</Badge>
                                <span className="ms-2 fw-semibold">Unlinked Subcategories</span>
                              </div>
                              <small className="text-muted d-block mb-2">
                                These subcategories are not linked to any category rank.
                              </small>
                              {groupedSubcategories.unlinked.map((subcategory) => {
                                const subcategoryId = subcategory._id || subcategory.id;
                                const normalizedId = normalizeId(subcategoryId);
                                const normalizedSelected = selectedSubcategories.map(id => normalizeId(id));
                                const isSelected = normalizedSelected.includes(normalizedId);

                                return (
                                  <div
                                    key={normalizedId || subcategoryId}
                                    className="mb-2 d-flex align-items-center"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSubcategoryToggle(subcategory)}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSubcategoryToggle(subcategory)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="me-2"
                                      style={{ cursor: "pointer" }}
                                    />
                                    <Label
                                      className="mb-0 flex-grow-1"
                                      style={{ cursor: "pointer", userSelect: "none" }}
                                    >
                                      {getItemName(subcategory)}
                                    </Label>
                                    <Badge
                                      color={isSelected ? "success" : "secondary"}
                                      style={{ cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubcategoryToggle(subcategory);
                                      }}
                                    >
                                      {isSelected ? "✓ Selected" : "Select"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {!fetching && !loadingTourGroup && !cityCode && (
          <div className="text-center py-4">
            <p className="text-muted">
              Please enter a city code to load categories and subcategories
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          disabled={loading || !cityCode || fetching || loadingTourGroup}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Connecting...
            </>
          ) : (
            "Save Connections"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConnectCategoriesModal;
