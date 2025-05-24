import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
  Badge,
  Toast,
  ToastBody,
  ToastHeader,
} from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { updateCarBrandsSortOrder } from "../../../store/automobiles/carbrands/actions";
import { getCarBrands } from "../../../store/automobiles/carbrands/actions";

const BrandCard = ({ brand, index, moveBrand }) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: "BrandCard",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveBrand(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "BrandCard",
    item: () => {
      return { id: brand._id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className="col-lg-3 col-md-4 col-sm-6 mb-4"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card className="h-100 shadow-sm">
        <CardBody className="p-3">
          <div className="text-center">
            {brand.media?.url ? (
              <img
                src={brand.media.url}
                alt={brand.brandName}
                className="rounded mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="rounded d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <i className="mdi mdi-car font-size-36 text-muted"></i>
              </div>
            )}
            <h5 className="mb-2">{brand.brandName}</h5>
            <div className="d-flex justify-content-center gap-2 mb-2">
              <Badge color={brand.status ? "success" : "danger"}>
                {brand.status ? "Active" : "Inactive"}
              </Badge>
              <Badge color="info">
                {brand.countryOfOrigin}
              </Badge>
            </div>
            <div className="position-absolute top-0 end-0 m-2">
              <span className="badge bg-primary rounded-pill">
                #{brand.sortOrder}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const SortCarBrands = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carBrands } = useSelector((state) => ({
    carBrands: state.CarBrand.carBrands,
  }));

  const [brands, setBrands] = useState([]);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (carBrands) {
      const sortedBrands = [...carBrands].sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder; // Ascending order
        }
        return 0;
      });
      setBrands(sortedBrands);
    }
  }, [carBrands]);

  const moveBrand = useCallback((dragIndex, hoverIndex) => {
    setBrands((prevBrands) => {
      const newBrands = [...prevBrands];
      const [draggedBrand] = newBrands.splice(dragIndex, 1);
      newBrands.splice(hoverIndex, 0, draggedBrand);
      
      // Update sortOrder values after reordering (ascending order)
      return newBrands.map((brand, index) => ({
        ...brand,
        sortOrder: index + 1 // Start from 1 and increment
      }));
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sortedBrands = brands.map((brand) => ({
        _id: brand._id,
        sortOrder: brand.sortOrder
      }));

      const response = await dispatch(updateCarBrandsSortOrder(sortedBrands));
      
      if (response?.success) {
        setToastMessage({
          title: "Success",
          message: "Brand order updated successfully",
        });
        setToast(true);
        
        // Navigate back using useNavigate
        navigate(-1);
      }
    } catch (error) {
      console.error("Error updating brand order:", error);
      setToastMessage({
        title: "Error",
        message: "Failed to update brand order. Please try again.",
      });
      setToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Automobile" breadcrumbItem="Sort Car Brands" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between mb-4">
                    <div>
                      <h4 className="card-title mb-1">Sort Car Brands</h4>
                      <p className="text-muted">Drag and drop to reorder the brands</p>
                    </div>
                    <Button 
                      color="primary" 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <i className="mdi mdi-content-save me-1"></i>
                      {isSaving ? "Saving..." : "Save Order"}
                    </Button>
                  </div>
                  <DndProvider backend={HTML5Backend}>
                    <Row>
                      {brands.map((brand, index) => (
                        <BrandCard
                          key={brand._id}
                          brand={brand}
                          index={index}
                          moveBrand={moveBrand}
                        />
                      ))}
                    </Row>
                  </DndProvider>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Toast Notification */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <Toast isOpen={toast}>
          <ToastHeader toggle={() => setToast(false)}>
            {toastMessage.title}
          </ToastHeader>
          <ToastBody>
            {toastMessage.message}
          </ToastBody>
        </Toast>
      </div>
    </React.Fragment>
  );
};

export default SortCarBrands; 