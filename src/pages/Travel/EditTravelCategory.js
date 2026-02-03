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

const EditTravelCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [slugsEntered, setSlugsEntered] = useState({});

  const { data, loading, error, updateSuccess } = useSelector(
    (state) => state.travelCategory
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
      toastr.success("Travel Category Updated Successfully ✅");
      dispatch(resetTravelCategory());
      navigate("/travel-categories");
    } else if (!updateSuccess && !loading && error) {
      toastr.error("❌ Failed to update Travel Category.");
    }
  }, [updateSuccess, error, dispatch, navigate, loading]);

  useEffect(() => {
    // Fetch category only when permissions are ready
    if (isPermissionsReady && categoryId) {
      dispatch(fetchTravelCategoryRequest(categoryId));
    }
  }, [dispatch, categoryId, isPermissionsReady]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Please enter the Category Name"),
    cityCode: Yup.string().required("Please enter the City Code"),
    displayName: Yup.string().required("Please enter the Display Name"),
    heading: Yup.string().required("Please enter the Heading"),
    metaTitle: Yup.string().required("Please enter the Meta Title"),
    metaDescription: Yup.string().required("Please enter the Meta Description"),
    canonicalUrl: Yup.string().required("Please enter the Canonical URL"),
    descriptors: Yup.string().required("Please enter the Descriptors"),
    highlights: Yup.string().required("Please enter the Highlights"),
    supportedLanguages: Yup.string().required("Please enter Supported Languages"),
    microMetaTitle: Yup.string().required("Please enter the Micro Meta Title"),
    microMetaDescription: Yup.string().required("Please enter the Micro Meta Description"),
    indexing: Yup.string().required("Please select Indexing"),
    sortOrder: Yup.number()
      .typeError("Sort Order must be a number")
      .required("Please enter the Sort Order"),
    images: Yup.array()
      .min(1, "Please upload at least one image")
      .required("Please upload at least one image"),
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

        if (Object.keys(slugsEntered).length === 0) {
          toastr.error("Please enter atleast one URL Slug");
          return;
        }

        const cleanString = (val) => {
          if (!val || val.trim().toLowerCase() === "null") return null;
          return val.trim();
        };

        const newImages = values.images?.filter((img) => img instanceof File) || [];
        const existingImages = values.images?.filter((img) => !(img instanceof File)) || [];

        const mediaArray = existingImages.map((img) => ({
          _id: img._id || undefined,
          url: img.url,
          type: img.type || "IMAGE",
          altText: img.altText || img.filename || "",
          metadata: img.metadata || {},
          info: img.info || {},
        }));

        const updatedData = {
          id: data?.id,
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
          cityCode: cleanString(values.cityCode),
          city: data?.city || null,
          sortOrder: values.sortOrder || 1,
          medias: mediaArray,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(updatedData));

        newImages.forEach((file) => {
          formData.append("images", file);
        });
        dispatch(updateTravelCategoryRequest({ categoryId: values.id, formData }));
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
                    <Input
                      name="cityCode"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.cityCode}
                      invalid={formik.touched.cityCode && !!formik.errors.cityCode}
                    />
                    {formik.touched.cityCode && formik.errors.cityCode && (
                      <div className="text-danger">{formik.errors.cityCode}</div>
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
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    Update
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