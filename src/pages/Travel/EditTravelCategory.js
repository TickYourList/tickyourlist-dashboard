import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, CardBody, Form, Label, Input, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { useParams, useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import URLSlugsSection from "./URLSlugsSection";
import EditImageUploader from "./EditImageUploader";
import SlugList from "./SlugList";
import {
  fetchTravelCategoryRequest,
  updateTravelCategoryRequest,
  resetTravelCategory,
} from "../../store/travelCategories/actions";
import NoPermission from "./NoPermissions"; // Import NoPermission component
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions";
import { getCitiesList } from "../../helpers/location_management_helper";

const EditTravelCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [slugsEntered, setSlugsEntered] = useState({});
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const { data, loading, error, updateSuccess } = useSelector(
    (state) => state.travelCategory || {}
  );

  // Use standardized permissions hook
  const { can, isPermissionsReady, loading: permissionsLoading } = usePermissions();

  // Permission checks using standardized system
  const permissions = useMemo(() => ({
    canAdd: can(ACTIONS.CAN_ADD, MODULES.CATEGORY_PERMS),
    canDelete: can(ACTIONS.CAN_DELETE, MODULES.CATEGORY_PERMS),
    canEdit: can(ACTIONS.CAN_EDIT, MODULES.CATEGORY_PERMS),
    canView: can(ACTIONS.CAN_VIEW, MODULES.CATEGORY_PERMS)
  }), [can]);

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  useEffect(() => {
    if (updateSuccess) {
      dispatch(resetTravelCategory());
      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate("/travel-categories");
      }, 500);
    }
  }, [updateSuccess, dispatch, navigate]);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await getCitiesList();
        const cityOptions = response.data.travelCityList.map((city) => ({
          value: city.cityCode, // Always use cityCode as value
          label: `${city.name} (${city.cityCode})`,
          name: city.name, // Store name for matching
        }));
        setCities(cityOptions);
      } catch (error) {
        console.error("Error fetching cities:", error);
        toastr.error("Failed to load cities");
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    // Fetch category only when permissions are ready
    if (isPermissionsReady && categoryId) {
      dispatch(fetchTravelCategoryRequest(categoryId));
    }
  }, [dispatch, categoryId, isPermissionsReady]);

  const validationSchema = Yup.object({
    name: Yup.string(),
    cityCode: Yup.string(),
    displayName: Yup.string(),
    heading: Yup.string(),
    metaTitle: Yup.string(),
    metaDescription: Yup.string(),
    canonicalUrl: Yup.string(),
    descriptors: Yup.string(),
    highlights: Yup.string(),
    supportedLanguages: Yup.string(),
    microMetaTitle: Yup.string(),
    microMetaDescription: Yup.string(),
    indexing: Yup.string(),
    sortOrder: Yup.number()
      .typeError("Sort Order must be a number")
      .nullable(),
    images: Yup.array(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: "",
      name: "",
      displayName: "",
      heading: "",
      metaTitle: "",
      metaDescription: "",
      indexing: "Allowed",
      canonicalUrl: "",
      descriptors: "",
      highlights: "",
      supportedLanguages: "",
      microMetaTitle: "",
      microMetaDescription: "",
      images: [],
      medias: [],
      cityCode: "",
      city: "",
      sortOrder: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        formik.setTouched({
          name: true,
          displayName: true,
          heading: true,
          metaTitle: true,
          metaDescription: true,
          canonicalUrl: true,
          sortOrder: true,
          descriptors: true,
          highlights: true,
          supportedLanguages: true,
          microMetaTitle: true,
          microMetaDescription: true,
          rank: true,
          images: true,
          cityCode: true,
        });

        // URL slugs are now optional - removed validation

        const cleanString = (val) => {
          if (!val || val.trim().toLowerCase() === "null") return null;
          return val.trim();
        };

        const newImages = values.images?.filter((img) => img instanceof File) || [];
        const existingImages = values.images?.filter((img) => !(img instanceof File)) || [];

        const mediaArray = existingImages.map((img) => {
          // Handle existing images - convert type to mediaType if needed
          let mediaType = img.mediaType;
          if (!mediaType && img.type) {
            // If type is "IMAGE", convert to proper MIME type
            if (img.type === "IMAGE" || img.type === "image") {
              // Try to detect from URL or default to image/jpeg
              const url = img.url || "";
              if (url.includes(".png")) {
                mediaType = "image/png";
              } else if (url.includes(".gif")) {
                mediaType = "image/gif";
              } else if (url.includes(".webp")) {
                mediaType = "image/webp";
              } else {
                mediaType = "image/jpeg"; // Default
              }
            } else {
              mediaType = img.type; // Use as-is if it's already a MIME type
            }
          }
          if (!mediaType) {
            mediaType = "image/jpeg"; // Final fallback
          }

          return {
            url: img.url,
            mediaType: mediaType,
            altText: img.altText || img.filename || "",
          };
        });

        const updatedData = {
          // Don't send id in payload - it's in the URL parameter
          name: cleanString(values.name),
          displayName: cleanString(values.displayName),
          heading: cleanString(values.heading),
          metaTitle: cleanString(values.metaTitle),
          metaDescription: cleanString(values.metaDescription),
          canonicalUrl: cleanString(values.canonicalUrl),
          urlSlugs: slugsEntered,
          microBrandInfo: {
            descriptors: cleanString(values.descriptors),
            highlights: cleanString(values.highlights),
            supportedLanguages: values.supportedLanguages
              ? values.supportedLanguages
                .split(",")
                .map((s) => cleanString(s))
                .filter(Boolean)
              : [],
            metaTitle: cleanString(values.microMetaTitle),
            metaDescription: cleanString(values.microMetaDescription) || "",
          },
          cityCode: cleanString(values.cityCode) || null,
          city: data?.city?._id || data?.city || null,
          sortOrder: parseInt(values.sortOrder) || 1,
          medias: mediaArray.length > 0 ? mediaArray : undefined,
        };

        // Validate cityCode - ensure it's a valid city code, not a name
        if (updatedData.cityCode && cities.length > 0) {
          const cityMatch = cities.find(city => city.value === updatedData.cityCode);
          if (!cityMatch) {
            // If cityCode doesn't match any city code, try to find by name and use the code
            const cityByName = cities.find(city =>
              city.name?.toLowerCase() === updatedData.cityCode.toLowerCase() ||
              city.label?.toLowerCase().includes(updatedData.cityCode.toLowerCase())
            );
            if (cityByName) {
              updatedData.cityCode = cityByName.value;
              console.log("Converted city name to code:", cityByName.value);
            } else {
              console.warn("City code not found in cities list:", updatedData.cityCode);
            }
          }
        }

        console.log("Final updatedData:", JSON.stringify(updatedData, null, 2));

        const formData = new FormData();
        formData.append("data", JSON.stringify(updatedData));

        newImages.forEach((file) => {
          formData.append("images", file);
        });

        const categoryId = data?._id || values.id;
        if (!categoryId) {
          toastr.error("Category ID is missing. Please refresh the page.");
          return;
        }

        console.log("Dispatching update request for category:", categoryId);
        dispatch(updateTravelCategoryRequest({ categoryId, formData }));
      } catch (error) {
        console.error("❌ Submit error:", error);
        toastr.error("Something went wrong while submitting.");
      }
    },
  });

  useEffect(() => {
    if (data) {
      formik.setValues({
        id: data._id || "",
        name: data.name || "",
        displayName: data.displayName || "",
        heading: data.heading || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        indexing: data.noIndex ? "Not Allowed" : "Allowed",
        canonicalUrl: data.canonicalUrl || "",
        sortOrder: data.sortOrder || 1,
        descriptors: data.microBrandInfo?.descriptors || "",
        highlights: data.microBrandInfo?.highlights || "",
        supportedLanguages: (data.microBrandInfo?.supportedLanguages || []).join(", "),
        microMetaTitle: data.microBrandInfo?.metaTitle || "",
        microMetaDescription: data.microBrandInfo?.metaDescription || "",
        images: data.medias || [],
        medias: data.medias || [],
        cityCode: data.cityCode || "",
        city: data.city?._id || "",
      });

      setSlugsEntered(data.urlSlugs || {});
    }
  }, [data]);

  // Show loading while permissions are being fetched
  if (permissionsLoading || !isPermissionsReady) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Loading page data...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Permission check - if no canEdit permission, show NoPermission component
  if (!permissions.canEdit) {
    return <NoPermission />;
  }

  if (loading || !data) return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading category data...</span>
          </div>
        </div>
      </Container>
    </div>
  );

  if (error) return (
    <div className="page-content">
      <Container fluid>
        <p className="text-danger">Error: {error}</p>
      </Container>
    </div>
  );

  // Regular component flow - render edit form only if user has canEdit permission
  try {
    return (
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Travel Category" breadcrumbItem="Edit Travel Category" />
          <Card>
            <CardBody>
              <Form onSubmit={formik.handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Label>Sort Order *</Label>
                    <Input
                      type="number"
                      name="sortOrder"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.sortOrder}
                      invalid={formik.touched.sortOrder && !!formik.errors.sortOrder}
                    />
                    {formik.touched.sortOrder && formik.errors.sortOrder && (
                      <div className="text-danger">{formik.errors.sortOrder}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Category Name *</Label>
                    <Input
                      name="name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      invalid={formik.touched.name && !!formik.errors.name}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-danger">{formik.errors.name}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>City Code *</Label>
                    <Select
                      name="cityCode"
                      value={cities.find(city => {
                        // Match by city code value or by name if code matches the name
                        return city.value === formik.values.cityCode ||
                          city.value.toLowerCase() === formik.values.cityCode?.toLowerCase() ||
                          city.label.toLowerCase().includes(formik.values.cityCode?.toLowerCase());
                      }) || null}
                      onChange={(selectedOption) => {
                        // Always use the city code value, not the label
                        const cityCode = selectedOption ? selectedOption.value : "";
                        formik.setFieldValue("cityCode", cityCode);
                        console.log("Selected city code:", cityCode);
                      }}
                      onBlur={() => formik.setFieldTouched("cityCode", true)}
                      options={cities}
                      isClearable
                      isSearchable
                      isLoading={loadingCities}
                      placeholder="Select City"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: formik.touched.cityCode && formik.errors.cityCode
                            ? '#dc3545'
                            : state.isFocused
                              ? '#80bdff'
                              : '#ced4da',
                          '&:hover': {
                            borderColor: formik.touched.cityCode && formik.errors.cityCode
                              ? '#dc3545'
                              : '#80bdff'
                          }
                        })
                      }}
                    />
                    {formik.touched.cityCode && formik.errors.cityCode && (
                      <div className="text-danger" style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                        {formik.errors.cityCode}
                      </div>
                    )}
                    {loadingCities && (
                      <small className="text-muted">Loading cities...</small>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Display Name *</Label>
                    <Input
                      name="displayName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.displayName}
                      invalid={formik.touched.displayName && !!formik.errors.displayName}
                    />
                    {formik.touched.displayName && formik.errors.displayName && (
                      <div className="text-danger">{formik.errors.displayName}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Heading *</Label>
                    <Input
                      name="heading"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.heading}
                      invalid={formik.touched.heading && !!formik.errors.heading}
                    />
                    {formik.touched.heading && formik.errors.heading && (
                      <div className="text-danger">{formik.errors.heading}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Meta Title *</Label>
                    <Input
                      name="metaTitle"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.metaTitle}
                      invalid={formik.touched.metaTitle && !!formik.errors.metaTitle}
                    />
                    {formik.touched.metaTitle && formik.errors.metaTitle && (
                      <div className="text-danger">{formik.errors.metaTitle}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Meta Description *</Label>
                    <Input
                      name="metaDescription"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.metaDescription}
                      invalid={formik.touched.metaDescription && !!formik.errors.metaDescription}
                    />
                    {formik.touched.metaDescription && formik.errors.metaDescription && (
                      <div className="text-danger">{formik.errors.metaDescription}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Indexing *</Label>
                    <Input
                      type="select"
                      name="indexing"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.indexing}
                      invalid={formik.touched.indexing && !!formik.errors.indexing}
                    >
                      <option value="">Select Indexing</option>
                      <option value="Allowed">Allowed</option>
                      <option value="Not Allowed">Not Allowed</option>
                    </Input>
                    {formik.touched.indexing && formik.errors.indexing && (
                      <div className="text-danger">{formik.errors.indexing}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Canonical URL *</Label>
                    <Input
                      name="canonicalUrl"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.canonicalUrl}
                      invalid={formik.touched.canonicalUrl && !!formik.errors.canonicalUrl}
                    />
                    {formik.touched.canonicalUrl && formik.errors.canonicalUrl && (
                      <div className="text-danger">{formik.errors.canonicalUrl}</div>
                    )}
                  </Col>
                </Row>

                <URLSlugsSection slugsEntered={slugsEntered} setSlugsEntered={setSlugsEntered} />
                <SlugList slugsEntered={slugsEntered} onRemove={lang => setSlugsEntered(prev => {
                  const newSlugs = { ...prev };
                  delete newSlugs[lang];
                  return newSlugs;
                })} />

                <h5 className="mt-4">Micro Brands Info</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Label>Descriptors *</Label>
                    <Input
                      name="descriptors"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.descriptors}
                      invalid={formik.touched.descriptors && !!formik.errors.descriptors}
                    />
                    {formik.touched.descriptors && formik.errors.descriptors && (
                      <div className="text-danger">{formik.errors.descriptors}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Highlights *</Label>
                    <Input
                      name="highlights"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.highlights}
                      invalid={formik.touched.highlights && !!formik.errors.highlights}
                    />
                    {formik.touched.highlights && formik.errors.highlights && (
                      <div className="text-danger">{formik.errors.highlights}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Supported Languages *</Label>
                    <Input
                      name="supportedLanguages"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.supportedLanguages}
                      invalid={formik.touched.supportedLanguages && !!formik.errors.supportedLanguages}
                    />
                    {formik.touched.supportedLanguages && formik.errors.supportedLanguages && (
                      <div className="text-danger">{formik.errors.supportedLanguages}</div>
                    )}
                  </Col>

                  <Col md={6} className="mb-3">
                    <Label>Micro Meta Title *</Label>
                    <Input
                      name="microMetaTitle"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.microMetaTitle}
                      invalid={formik.touched.microMetaTitle && !!formik.errors.microMetaTitle}
                    />
                    {formik.touched.microMetaTitle && formik.errors.microMetaTitle && (
                      <div className="text-danger">{formik.errors.microMetaTitle}</div>
                    )}
                  </Col>

                  <Col md={12} className="mb-3">
                    <Label>Micro Meta Description *</Label>
                    <Input
                      name="microMetaDescription"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.microMetaDescription}
                      invalid={formik.touched.microMetaDescription && !!formik.errors.microMetaDescription}
                    />
                    {formik.touched.microMetaDescription && formik.errors.microMetaDescription && (
                      <div className="text-danger">{formik.errors.microMetaDescription}</div>
                    )}
                  </Col>
                </Row>

                <EditImageUploader
                  images={formik.values.images}
                  errors={formik.errors}
                  touched={formik.touched}
                  setFieldValue={formik.setFieldValue}
                  medias={formik.values.medias}
                />

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={formik.isSubmitting || loading}
                  >
                    {loading ? "Updating..." : "Update"}
                  </Button>

                  <Button
                    color="secondary"
                    type="button"
                    onClick={() => {
                      dispatch(resetTravelCategory());
                      dispatch({ type: 'GET_TRAVEL_CATEGORIES_REQUEST' });
                      navigate("/travel-categories");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    );
  } catch (err) {
    console.error("Render error in EditTravelCategory:", err);
    return <div className="text-danger">Something went wrong.</div>;
  }
};

export default EditTravelCategory;