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
  const [tourGroupData, setTourGroupData] = useState(null);

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
            setTourGroupData(fetchedTourGroup);

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
          setTourGroupData(tourGroup);

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
      setTourGroupData(tourGroup);

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

  const handleSubcategoryToggle = (subcategoryId) => {
    const normalizedId = normalizeId(subcategoryId);
    if (!normalizedId) return;

    setSelectedSubcategories((prev) => {
      const normalizedPrev = prev.map(id => normalizeId(id));
      if (normalizedPrev.includes(normalizedId)) {
        return prev.filter((id) => normalizeId(id) !== normalizedId);
      } else {
        return [...prev, normalizedId];
      }
    });
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
    if (newCityCode) {
      fetchCategoriesAndSubcategories(newCityCode);
    }
  };

  // Create a map of categoryId -> category.sortOrder for looking up parent category rank
  const categoryRankMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      // Map by both _id and id to handle different data structures
      const categoryId = category._id || category.id;
      if (categoryId && (category.sortOrder !== undefined && category.sortOrder !== null)) {
        map.set(String(categoryId), category.sortOrder);
        // Also map by numeric id if it exists
        if (category.id) {
          map.set(category.id, category.sortOrder);
        }
      }
    });
    return map;
  }, [categories]);

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
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {categories.length === 0 ? (
                        <p className="text-muted">No categories found</p>
                      ) : (
                        categories.map((category) => {
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
                                {category.name || category.displayName}
                                {(category.sortOrder !== undefined && category.sortOrder !== null) && (
                                  <Badge color="secondary" className="ms-2">
                                    Rank: {category.sortOrder}
                                  </Badge>
                                )}
                              </Label>
                              {/* Alternative: Clickable Badge */}
                              <Badge
                                color={isSelected ? "success" : "secondary"}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryToggle(categoryId);
                                }}
                              >
                                {isSelected ? "✓ Selected" : "Click to Select"}
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
                      {subcategories.length === 0 ? (
                        <p className="text-muted">No subcategories found</p>
                      ) : (
                        subcategories.map((subcategory) => {
                          const subcategoryId = subcategory._id || subcategory.id;
                          const normalizedId = normalizeId(subcategoryId);
                          const normalizedSelected = selectedSubcategories.map(id => normalizeId(id));
                          const isSelected = normalizedSelected.includes(normalizedId);

                          // Get parent category's rank using categoryId
                          const parentCategoryRank = subcategory.categoryId
                            ? categoryRankMap.get(subcategory.categoryId)
                            : null;

                          // Also try to find by category _id if it exists
                          const categoryId = subcategory.category?._id || subcategory.category;
                          const parentCategoryRankById = categoryId
                            ? categoryRankMap.get(String(categoryId))
                            : null;

                          // Use the parent category's rank, fallback to subcategory's own sortOrder if not found
                          const displayRank = parentCategoryRank !== null && parentCategoryRank !== undefined
                            ? parentCategoryRank
                            : (parentCategoryRankById !== null && parentCategoryRankById !== undefined
                              ? parentCategoryRankById
                              : (subcategory.sortOrder !== undefined && subcategory.sortOrder !== null
                                ? subcategory.sortOrder
                                : null));

                          return (
                            <div
                              key={normalizedId || subcategoryId}
                              className="mb-2 d-flex align-items-center"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleSubcategoryToggle(subcategoryId)}
                            >
                              <Input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSubcategoryToggle(subcategoryId)}
                                onClick={(e) => e.stopPropagation()}
                                className="me-2"
                                style={{ cursor: 'pointer' }}
                              />
                              <Label
                                className="mb-0 flex-grow-1"
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                              >
                                {subcategory.name || subcategory.displayName}
                                {displayRank !== null && (
                                  <Badge color="secondary" className="ms-2">
                                    Rank: {displayRank}
                                  </Badge>
                                )}
                              </Label>
                              {/* Alternative: Clickable Badge */}
                              <Badge
                                color={isSelected ? "success" : "secondary"}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubcategoryToggle(subcategoryId);
                                }}
                              >
                                {isSelected ? "✓ Selected" : "Click to Select"}
                              </Badge>
                            </div>
                          );
                        })
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

