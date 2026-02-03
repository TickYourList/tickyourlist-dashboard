import React, { useState, useCallback, useRef, useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Row,
  Col,
  Badge,
  Label,
} from "reactstrap";
import Select from "react-select";
import { usePermissions, MODULES, ACTIONS } from "../../../helpers/permissions";
import { getCitiesList } from "../../../helpers/location_management_helper";
import { 
  fetchCategorySubcategoriesRequest,
  getCategoriesByCityRequest,
  sortSubcategoriesRequest
} from "../../../store/travelCategories/actions";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const SubCategoryCard = ({ subCategory, index, moveSubCategory }) => {
  const ref = useRef(null);

  const truncateWords = (text, wordLimit = 15) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const [, drop] = useDrop({
    accept: "SubCategoryCard",
    hover(item) {
      if (!ref.current) return;
      if (item.index === index) return;
      moveSubCategory(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "SubCategoryCard",
    item: { id: subCategory._id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="col-lg-3 col-md-4 col-sm-6 mb-4"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      <Card className="h-100 shadow-sm border-0">
        {/* Image */}
        {subCategory.medias?.[0]?.url ? (
          <div
            className="position-relative"
            style={{
              height: "150px",
              background: `url(${subCategory.medias[0].url}) center/cover no-repeat`,
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          >
            <span className="badge bg-primary position-absolute top-0 end-0 m-2">
              #{subCategory.sortOrder || index + 1}
            </span>
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ height: "150px" }}
          >
            <i className="mdi mdi-folder font-size-36 text-muted"></i>
            <span className="badge bg-primary position-absolute top-0 end-0 m-2">
              #{subCategory.sortOrder || index + 1}
            </span>
          </div>
        )}

        <CardBody className="p-3 text-start">
          {/* Title */}
          <h5 className="mb-1">{subCategory.displayName || subCategory.name}</h5>
          <p className="text-muted small mb-2">{subCategory.heading}</p>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge color="info">{subCategory.cityCode}</Badge>
            {subCategory.medias && subCategory.medias.length > 0 && (
              <Badge color="secondary">{subCategory.medias.length} media</Badge>
            )}
          </div>

          {/* SEO description preview */}
          {subCategory.metaDescription && (
            <p className="text-muted small mb-0">
              {truncateWords(subCategory.metaDescription, 15)}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const SubCategorySortingModal = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const { can, loading: permissionLoading } = usePermissions();
  
  const { 
    subCategories = [],
    subCategoriesLoading = false,
    categoriesByCity = [],
    categoriesByCityLoading = false,
    sortSubcategoriesLoading = false
  } = useSelector((state) => state.travelCategory || {});

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  // Fetch cities list on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await getCitiesList();
        const cityOptions = response.data.travelCityList.map((city) => ({
          value: city.cityCode,
          label: `${city.name} (${city.cityCode})`,
        }));
        setCities(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
        toastr.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  // Fetch categories when city is selected
  useEffect(() => {
    if (selectedCity && isOpen) {
      dispatch(getCategoriesByCityRequest(selectedCity.value));
      // Reset category and subcategory selections when city changes
      setSelectedCategory(null);
      setSubCategoryList([]);
    }
  }, [selectedCity, isOpen, dispatch]);

  // Update category options when categories by city are fetched
  useEffect(() => {
    if (categoriesByCity && Array.isArray(categoriesByCity) && categoriesByCity.length > 0) {
      const options = categoriesByCity.map((cat) => ({
        value: cat._id,
        label: `${cat.displayName || cat.name} (${cat.cityCode})`,
      }));
      setCategoryOptions(options);
    } else {
      setCategoryOptions([]);
    }
  }, [categoriesByCity]);

  // Fetch subcategories when category is selected
  useEffect(() => {
    if (selectedCategory && isOpen) {
      dispatch(fetchCategorySubcategoriesRequest(selectedCategory.value));
      // Reset subcategory list when category changes
      setSubCategoryList([]);
    } else {
      setSubCategoryList([]);
    }
  }, [selectedCategory, isOpen, dispatch]);

  // Update subcategory list when subcategories are fetched
  useEffect(() => {
    if (subCategories && Array.isArray(subCategories) && subCategories.length > 0) {
      const sorted = [...subCategories].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      setSubCategoryList(sorted);
    } else {
      setSubCategoryList([]);
    }
  }, [subCategories]);

  const moveSubCategory = useCallback((dragIndex, hoverIndex) => {
    setSubCategoryList((prev) => {
      const newList = [...prev];
      const [dragged] = newList.splice(dragIndex, 1);
      newList.splice(hoverIndex, 0, dragged);

      return newList.map((subcat, idx) => ({
        ...subcat,
        sortOrder: idx + 1,
      }));
    });
  }, []);

  const handleSave = async () => {
    if (!selectedCity) {
      toastr.error("Please select a city first");
      return;
    }

    if (!selectedCategory) {
      toastr.error("Please select a category first");
      return;
    }

    if (!can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS)) {
      toastr.error("You don't have permission to sort subcategories");
      return;
    }

    const finalSubCategoryOrder = subCategoryList.map((e) => ({
      id: e._id,
      sortOrder: e.sortOrder,
    }));

    dispatch(
      sortSubcategoriesRequest({
        categoryId: selectedCategory.value,
        subcategoryOrders: finalSubCategoryOrder,
      })
    );

    // Close modal after a short delay to show success message
    setTimeout(() => {
      toggle();
      setSelectedCity(null);
      setSelectedCategory(null);
      setSubCategoryList([]);
    }, 1000);
  };

  const handleClose = () => {
    toggle();
    setSelectedCity(null);
    setSelectedCategory(null);
    setSubCategoryList([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="xl"
      centered
      contentClassName="border-0 shadow-lg rounded"
    >
      <ModalHeader toggle={handleClose} className="border-0 pb-2">
        <h4 className="mb-0">Sort Travel Sub Categories</h4>
      </ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <Label className="form-label fw-semibold">Select City</Label>
          <Select
            value={selectedCity}
            onChange={setSelectedCity}
            options={cities}
            isClearable
            isSearchable
            isLoading={loadingCities}
            placeholder="Select city to filter categories..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {selectedCity && (
          <div className="mb-4">
            <Label className="form-label fw-semibold">Select Category</Label>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              isClearable
              isSearchable
              isLoading={categoriesByCityLoading}
              placeholder="Select category to filter subcategories..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        )}

        {selectedCity && selectedCategory && (
          <>
            {subCategoryList.length > 0 ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">
                      Subcategories for {selectedCategory.label}
                    </h5>
                    <p className="text-muted small mb-0">
                      Drag and drop to reorder the subcategories
                    </p>
                  </div>
                </div>
                <DndProvider backend={HTML5Backend}>
                  <Row>
                    {subCategoryList.map((subCategory, index) => (
                      <SubCategoryCard
                        key={subCategory._id}
                        subCategory={subCategory}
                        index={index}
                        moveSubCategory={moveSubCategory}
                      />
                    ))}
                  </Row>
                </DndProvider>
              </div>
            ) : (
              <div className="text-center w-100 py-5">
                <h5 className="text-muted">
                  {subCategoriesLoading 
                    ? "Loading subcategories..." 
                    : "No subcategories found for this category."}
                </h5>
              </div>
            )}
          </>
        )}

        {!selectedCity && (
          <div className="text-center w-100 py-5">
            <p className="text-muted">
              Please select a city to view and sort subcategories.
            </p>
          </div>
        )}

        {selectedCity && !selectedCategory && (
          <div className="text-center w-100 py-5">
            <p className="text-muted">
              {categoriesByCityLoading 
                ? "Loading categories..." 
                : "Please select a category to view and sort subcategories."}
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter className="justify-content-between border-0 pt-3">
        <Button color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleSave}
          disabled={
            sortSubcategoriesLoading ||
            !selectedCity ||
            !selectedCategory ||
            subCategoryList.length === 0 ||
            !can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS)
          }
        >
          {sortSubcategoriesLoading ? "Saving..." : "Save Order"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SubCategorySortingModal;
