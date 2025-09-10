import React, { useState, useCallback, useRef, useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getCategories, sortCategories } from "../../../store/city-details/actions"
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
              #{category.sortOrder}
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
          <h5 className="mb-1">{category.displayName}</h5>
          <p className="text-muted small mb-2">{category.heading}</p>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge color="info">{category.cityCode}</Badge>
            {category.hasMedia && (
              <Badge color="secondary">{category.mediaCount} media</Badge>
            )}
          </div>

          {/* SEO description preview */}
          {category.seoDescription && (
            <p
              className="text-muted small mb-0"
            >
              {truncateWords(category.seoDescription, 15)}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};


const CategorySorting = () => {
  const { cityCode } = useParams()
  const dispatch = useDispatch()
   const navigate = useNavigate();
  const {loading, data: initialCategories, loadingSortCategories} = useSelector(state => state.CityDetails.categories);
  const { can, loading: permissionLoading } = usePermissions();

  const [categories, setCategories] = useState([]);

  const moveCategory = useCallback((dragIndex, hoverIndex) => {
    setCategories((prev) => {
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
      const finalcategoriesOrder = categories.map((e) => {
          return { id: e._id, sortOrder: e.sortOrder }
      })
      if(can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS)) dispatch(sortCategories({categoryOrders : finalcategoriesOrder}));
  };

  useEffect(() => {
    if(can(ACTIONS.CAN_VIEW, MODULES.CATEGORY_PERMS)) dispatch(getCategories(cityCode));
  }, [dispatch, cityCode, can]);

  useEffect(() => {
    if(initialCategories && initialCategories.length > 0) {
      const sorted = [...initialCategories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(sorted);
    }
    else {
      setCategories([]);
    }
  }, [initialCategories]);

  if(permissionLoading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading categories...</p>
        </div>
      </div>
    );
  }

  if(!can(ACTIONS.CAN_VIEW, MODULES.CATEGORY_PERMS)) return <PermissionDenied />;

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading categories...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Categories" breadcrumbItem="Sort Categories" />
        <Row>
          <Col xs="12">
            
              {
                  categories.length > 0 ?
                  <Card>
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="card-title mb-1">Sort Categories</h4>
                        <p className="text-muted">Drag and drop to reorder the categories</p>
                      </div>
                      <div  className={"d-flex gap-2"}>
                        <Button color="secondary"  onClick={() => navigate(`/city-details/${cityCode}`)}>
                          <i className="mdi mdi-arrow-left"></i>
                          Back
                        </Button>
                        <Button color="primary" onClick={handleSave} disabled={loadingSortCategories}>
                          <i className="mdi mdi-content-save me-1"></i>
                          {loadingSortCategories ? "Saving..." : "Save Order"}
                        </Button>
                      </div>
                      
                    </div>
                    <DndProvider backend={HTML5Backend}>
                    <Row>
                        {categories.map((cat, index) => (
                          <CategoryCard
                            key={cat._id}
                            category={cat}
                            index={index}
                            moveCategory={moveCategory}
                          />
                        ))}
                      </Row>
                      
                      
                    </DndProvider>
                  </CardBody>
                  </Card>:
                  <div className="text-center w-100 py-5">
                    <h5 className="text-muted">No categories found for this city.</h5>
                  </div>
              }
              
            
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default CategorySorting;
