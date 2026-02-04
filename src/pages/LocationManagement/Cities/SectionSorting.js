import React, { useState, useCallback, useRef, useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTravelSectionsWithFallback,
  sortTravelSections,
} from "../../../helpers/location_management_helper";
import { showToastError, showToastSuccess } from "../../../helpers/toastBuilder";
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

const getSectionName = (section) => {
  const category = section?.category?.id || section?.category;
  return (
    category?.displayName ||
    category?.name ||
    category?.title ||
    section?.sectionName ||
    section?.iconName ||
    "Untitled Section"
  );
};

const getCategoryTypeLabel = (type) => {
  if (type === "PRIMARY_CATEGORY") return "Category";
  if (type === "SUB_CATEGORY") return "Subcategory";
  return "Section";
};

const SectionCard = ({ section, index, moveSection }) => {
  const ref = useRef(null);

  const truncateWords = (text, wordLimit = 15) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const [, drop] = useDrop({
    accept: "SectionCard",
    hover(item) {
      if (!ref.current) return;
      if (item.index === index) return;
      moveSection(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "SectionCard",
    item: { id: section._id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  const sectionName = getSectionName(section);
  const categoryType = section?.category?.type || section?.categoryType;
  const cityCode = section?.cityCode || section?.city?.cityCode || "—";

  return (
    <div
      ref={ref}
      className="col-lg-3 col-md-4 col-sm-6 mb-4"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    >
      <Card className="h-100 shadow-sm border-0">
        {/* Image */}
        {section?.medias?.[0]?.url ? (
          <div
            className="position-relative"
            style={{
              height: "150px",
              background: `url(${section.medias[0].url}) center/cover no-repeat`,
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          >
            <span className="badge bg-primary position-absolute top-0 end-0 m-2">
              #{section.sortOrder || index + 1}
            </span>
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-light"
            style={{ height: "150px" }}
          >
            <i className="mdi mdi-folder font-size-36 text-muted"></i>
            <span className="badge bg-primary position-absolute top-0 end-0 m-2">
              #{section.sortOrder || index + 1}
            </span>
          </div>
        )}

        <CardBody className="p-3 text-start">
          {/* Title */}
          <h5 className="mb-1">{sectionName}</h5>
          <p className="text-muted small mb-2">
            {getCategoryTypeLabel(categoryType)}
          </p>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge color="info">{cityCode}</Badge>
            {section?.status !== undefined && (
              <Badge color={section.status ? "success" : "secondary"}>
                {section.status ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>

          {/* Description preview */}
          {section?.description && (
            <p className="text-muted small mb-0">
              {truncateWords(section.description, 15)}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const SectionSorting = () => {
  const { cityCode } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = useCallback(async () => {
    if (!cityCode) return;

    setLoading(true);
    try {
      // Load all sections for the city (paginated)
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

      // Load remaining pages if any
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

      // Sort by sortOrder
      const orderedSections = [...allSections].sort((a, b) => {
        const aOrder = Number(a?.sortOrder);
        const bOrder = Number(b?.sortOrder);
        const safeA = Number.isFinite(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
        const safeB = Number.isFinite(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;
        if (safeA !== safeB) return safeA - safeB;
        return String(a?._id || "").localeCompare(String(b?._id || ""));
      });

      setSections(orderedSections);
    } catch (error) {
      console.error("Error loading sections:", error);
      showToastError("Failed to load sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [cityCode]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const moveSection = useCallback((dragIndex, hoverIndex) => {
    setSections((prev) => {
      const newList = [...prev];
      const [dragged] = newList.splice(dragIndex, 1);
      newList.splice(hoverIndex, 0, dragged);

      return newList.map((section, idx) => ({
        ...section,
        sortOrder: idx + 1,
      }));
    });
  }, []);

  const handleSave = async () => {
    if (sections.length === 0) {
      showToastError("No sections to save");
      return;
    }

    setSaving(true);
    try {
      const sectionIds = sections.map((section) => section._id).filter(Boolean);

      if (sectionIds.length === 0) {
        showToastError("No valid sections to save");
        return;
      }

      await sortTravelSections({
        cityCode,
        sectionIds,
      });

      showToastSuccess("Section order saved successfully");
      // Reload sections to get updated order
      await loadSections();
    } catch (error) {
      console.error("Error saving section order:", error);
      showToastError("Failed to save section order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid text-center py-5">
          <Spinner color="primary" />
          <p className="mt-3">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Sections" breadcrumbItem="Sort Sections" />
        <Row>
          <Col xs="12">
            {sections.length > 0 ? (
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="card-title mb-1">Sort Sections</h4>
                      <p className="text-muted">
                        Drag and drop to reorder the sections for {cityCode}
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        color="secondary"
                        onClick={() => navigate("/city-wise-sections")}
                      >
                        <i className="mdi mdi-arrow-left"></i>
                        Back
                      </Button>
                      <Button
                        color="primary"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <i className="mdi mdi-content-save me-1"></i>
                        {saving ? "Saving..." : "Save Order"}
                      </Button>
                    </div>
                  </div>
                  <DndProvider backend={HTML5Backend}>
                    <Row>
                      {sections.map((section, index) => (
                        <SectionCard
                          key={section._id}
                          section={section}
                          index={index}
                          moveSection={moveSection}
                        />
                      ))}
                    </Row>
                  </DndProvider>
                </CardBody>
              </Card>
            ) : (
              <div className="text-center w-100 py-5">
                <h5 className="text-muted">
                  No sections found for this city.
                </h5>
                <Button
                  color="secondary"
                  onClick={() => navigate("/city-wise-sections")}
                  className="mt-3"
                >
                  <i className="mdi mdi-arrow-left"></i>
                  Back to Sections
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SectionSorting;
