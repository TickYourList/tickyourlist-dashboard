import React, { useState, useCallback, useRef, useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { sortSubCategories } from "../../../store/city-details/actions"
import { fetchCategorySubcategoriesRequest } from "../../../store/travelCategories/actions";
import PermissionDenied from "./PermissionDenied";
import { usePermissions, MODULES, ACTIONS } from '../../../helpers/permissions';
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
  Badge,
} from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

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
              #{subCategory.sortOrder}
            </span>
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ height: "150px" }}
          >
            <i className="mdi mdi-folder font-size-36 text-muted"></i>
          </div>
        )}

        <CardBody className="p-3 text-start">
          {/* Title */}
          <h5 className="mb-1">{subCategory.displayName}</h5>
          <p className="text-muted small mb-2">{subCategory.heading}</p>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge color="info">{subCategory.cityCode}</Badge>
            {subCategory.hasMedia && (
              <Badge color="secondary">{subCategory.mediaCount} media</Badge>
            )}
          </div>

          {/* SEO description preview */}
          {subCategory.seoDescription && (
            <p
              className="text-muted small mb-0"
            >
              {truncateWords(subCategory.seoDescription, 15)}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};


const SubCategorySorting = () => {
  const { categoryId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate();
    const { loadingSortSubCategories } = useSelector(state => state.CityDetails.subCategories);
  const { loading, subCategories: initialSubCategories  } = useSelector((state) => state.travelCategory);
  const { can, loading: permissionLoading } = usePermissions();

  const [subCategories, setSubCategories] = useState([]);
  const moveSubCategory = useCallback((dragIndex, hoverIndex) => {
    setSubCategories((prev) => {
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
      const finalSubCategoriesOrder = subCategories.map((e) => {
          return { id: e._id, sortOrder: e.sortOrder }
      })
      if(can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS)) dispatch(sortSubCategories({ categoryId, subcategoryOrders: finalSubCategoriesOrder }));
  };

  useEffect(() => {
    if(can(ACTIONS.CAN_VIEW, MODULES.SUBCATEGORY_PERMS)) dispatch(fetchCategorySubcategoriesRequest(categoryId));
  }, [dispatch, categoryId, can]);

  useEffect(() => {
    if(initialSubCategories && initialSubCategories.length > 0) {
      const sorted = [...initialSubCategories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setSubCategories(sorted);
    }
    else {
      setSubCategories([]);
    }
  }, [initialSubCategories]);

  if(permissionLoading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading sub categories...</p>
        </div>
      </div>
    );
  }

  if(!can(ACTIONS.CAN_VIEW, MODULES.SUBCATEGORY_PERMS)) return <PermissionDenied />;

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading sub categories...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Sub Categories" breadcrumbItem="Sort Sub Categories" />
        <Row>
          <Col xs="12">
            
              {
                  subCategories.length > 0 ?
                  <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="card-title mb-1">Sort Sub Categories</h4>
                        <p className="text-muted">Drag and drop to reorder the sub categories</p>
                      </div>
                      <div  className={"d-flex gap-2"}>
                        <Button color="secondary"  onClick={() => navigate("/travel-categories")}>
                          <i className="mdi mdi-arrow-left"></i>
                          Back
                        </Button>
                        <Button color="primary" onClick={handleSave} disabled={loadingSortSubCategories}>
                          <i className="mdi mdi-content-save me-1"></i>
                          {loadingSortSubCategories ? "Saving..." : "Save Order"}
                        </Button>
                      </div>
                      
                    </div>
                    <DndProvider backend={HTML5Backend}>
                    <Row>
                        {subCategories.map((subcat, index) => (
                          <SubCategoryCard
                            key={subcat._id}
                            subCategory={subcat}
                            index={index}
                            moveSubCategory={moveSubCategory}
                          />
                        ))}
                      </Row>
                      
                      
                    </DndProvider>
                  </CardBody>
                  </Card>:
                  <div className="text-center w-100 py-5">
                    <h5 className="text-muted">No sub categories found for this category.</h5>
                  </div>
              }
              
            
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default SubCategorySorting;
