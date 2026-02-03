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
import { usePermissions, MODULES, ACTIONS } from "../../helpers/permissions";
import { getCitiesList } from "../../helpers/location_management_helper";
import { getCategories } from "../../store/city-details/actions";
import { sortCategories } from "../../store/city-details/actions";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const CategoryCard = ({ category, index, moveCategory }) => {
    const ref = useRef(null);

    const truncateWords = (text, wordLimit = 15) => {
        if (!text) return "";
        const words = text.split(" ");
        return words.length > wordLimit
            ? words.slice(0, wordLimit).join(" ") + "..."
            : text;
    };

    const [, drop] = useDrop({
        accept: "CategoryCard",
        hover(item) {
            if (!ref.current) return;
            if (item.index === index) return;
            moveCategory(item.index, index);
            item.index = index;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: "CategoryCard",
        item: { id: category._id, index },
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
                {category.medias?.[0]?.url ? (
                    <div
                        className="position-relative"
                        style={{
                            height: "150px",
                            background: `url(${category.medias[0].url}) center/cover no-repeat`,
                            borderTopLeftRadius: "0.5rem",
                            borderTopRightRadius: "0.5rem",
                        }}
                    >
                        <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                            #{category.sortOrder || index + 1}
                        </span>
                    </div>
                ) : (
                    <div
                        className="d-flex align-items-center justify-content-center bg-light"
                        style={{ height: "150px" }}
                    >
                        <i className="mdi mdi-folder font-size-36 text-muted"></i>
                        <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                            #{category.sortOrder || index + 1}
                        </span>
                    </div>
                )}

                <CardBody className="p-3 text-start">
                    {/* Title */}
                    <h5 className="mb-1">{category.displayName || category.name}</h5>
                    <p className="text-muted small mb-2">{category.heading}</p>

                    {/* Badges */}
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        <Badge color="info">{category.cityCode}</Badge>
                        {category.medias && category.medias.length > 0 && (
                            <Badge color="secondary">{category.medias.length} media</Badge>
                        )}
                    </div>

                    {/* SEO description preview */}
                    {category.metaDescription && (
                        <p className="text-muted small mb-0">
                            {truncateWords(category.metaDescription, 15)}
                        </p>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

const CategorySortingModal = ({ isOpen, toggle }) => {
    const dispatch = useDispatch();
    const { can, loading: permissionLoading } = usePermissions();
    const categoriesState = useSelector(
        (state) => state.CityDetails?.categories || { loading: false, data: [], error: null, loadingSortCategories: false }
    );
    const { data: categories, loadingSortCategories } = categoriesState;

    const [selectedCity, setSelectedCity] = useState(null);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [categoryList, setCategoryList] = useState([]);

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
            dispatch(getCategories(selectedCity.value));
        }
    }, [selectedCity, isOpen, dispatch]);

    // Update category list when categories are fetched
    useEffect(() => {
        if (categories && Array.isArray(categories) && categories.length > 0) {
            const sorted = [...categories].sort(
                (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
            );
            setCategoryList(sorted);
        } else {
            setCategoryList([]);
        }
    }, [categories]);

    const moveCategory = useCallback((dragIndex, hoverIndex) => {
        setCategoryList((prev) => {
            const newList = [...prev];
            const [dragged] = newList.splice(dragIndex, 1);
            newList.splice(hoverIndex, 0, dragged);

            return newList.map((cat, idx) => ({
                ...cat,
                sortOrder: idx + 1,
            }));
        });
    }, []);

    const handleSave = async () => {
        if (!selectedCity) {
            toastr.error("Please select a city first");
            return;
        }

        if (!can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS)) {
            toastr.error("You don't have permission to sort categories");
            return;
        }

        const finalCategoryOrder = categoryList.map((e) => ({
            id: e._id,
            sortOrder: e.sortOrder,
        }));

        dispatch(sortCategories({ categoryOrders: finalCategoryOrder }));

        // Close modal after a short delay to show success message
        setTimeout(() => {
            toggle();
            setSelectedCity(null);
            setCategoryList([]);
        }, 1000);
    };

    const handleClose = () => {
        toggle();
        setSelectedCity(null);
        setCategoryList([]);
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
                <h4 className="mb-0">Sort Travel Categories</h4>
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
                    <>
                        {categoryList.length > 0 ? (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 className="mb-1">Categories for {selectedCity.label}</h5>
                                        <p className="text-muted small mb-0">
                                            Drag and drop to reorder the categories
                                        </p>
                                    </div>
                                </div>
                                <DndProvider backend={HTML5Backend}>
                                    <Row>
                                        {categoryList.map((category, index) => (
                                            <CategoryCard
                                                key={category._id}
                                                category={category}
                                                index={index}
                                                moveCategory={moveCategory}
                                            />
                                        ))}
                                    </Row>
                                </DndProvider>
                            </div>
                        ) : (
                            <div className="text-center w-100 py-5">
                                <h5 className="text-muted">
                                    No categories found for this city.
                                </h5>
                            </div>
                        )}
                    </>
                )}

                {!selectedCity && (
                    <div className="text-center w-100 py-5">
                        <p className="text-muted">Please select a city to view and sort categories.</p>
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
                        loadingSortCategories ||
                        !selectedCity ||
                        categoryList.length === 0 ||
                        !can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS)
                    }
                >
                    {loadingSortCategories ? "Saving..." : "Save Order"}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CategorySortingModal;
