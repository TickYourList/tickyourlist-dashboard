import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Card, CardBody, Form, Label, Input, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { addTravelCategoryRequest } from "../../store/travelCategories/actions";
import URLSlugsSection from "./URLSlugsSection";
import ImageUploader from "./ImageUploader";
import SlugList from "./SlugList";
import { getFieldClass } from "./helper";
import { getCities } from "store/actions";
import NoPermission from "./NoPermissions";
import { usePermissions, MODULES, ACTIONS } from "helpers/permissions";

const TravelCategoryForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {cities, successMessage, error } = useSelector(state => ({
    cities: state.travelCity.cities,
    successMessage: state.travelCategory.successMessage,
    error: state.travelCategory.error
  }));

  // Use standardized permissions hook
  const { can } = usePermissions();

  // Permission check using standardized system
  const canAdd = can(ACTIONS.CAN_ADD, MODULES.CATEGORY_PERMS);

  const [slugsEntered, setSlugsEntered] = useState({}); 

  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

   toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000",
  };

  useEffect(() => {
    if (successMessage) {
      toastr.success(successMessage);
      dispatch({ type: "RESET_ADD_TRAVEL_CATEGORY" });
      navigate("/travel-categories");
    } else if (error) {
      toastr.error(error);
      dispatch({ type: "RESET_ADD_TRAVEL_CATEGORY" });
    }
  }, [successMessage, error, dispatch, navigate]);

  const formik = useFormik({
    initialValues: {
      name: "",
      cityCode: "",
      displayName: "",
      heading: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      descriptors: "",
      highlights: "",
      supportedLanguages: "",
      microMetaTitle: "",
      microMetaDescription: "",
      ratingCount: "",
      averageRating: "",
      displayRating: "Yes",
      indexing: "Allowed",
      sortOrder: "",
      images: [],
    },
    validationSchema: Yup.object({
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
      ratingCount: Yup.number().required("Please enter the Rating Count"),
      averageRating: Yup.number().required("Please enter the Average Rating"),
      sortOrder: Yup.number().required("Please enter the Sort Order"),
      images: Yup.mixed().test(
        "required",
        "Please upload at least one image",
        function (value) {
          return value && value.length > 0;
        }
      )
    }),
    onSubmit: (values, { setTouched, setSubmitting }) => {
      setTouched(
        Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );

      if (Object.keys(slugsEntered).length === 0) {
        toastr.error("Please add at least one URL slug.");
        setSubmitting(false);
        return;
      }

      const { images, ...rest } = values;

      const payload = {
        data: {
          name: rest.name,
          cityCode: rest.cityCode,
          displayName: rest.displayName,
          heading: rest.heading,
          metaTitle: rest.metaTitle,
          metaDescription: rest.metaDescription,
          noIndex: rest.indexing === "Not Allowed",
          canonicalUrl: rest.canonicalUrl,
          urlSlugs: slugsEntered,
          microBrandInfo: {
            descriptors: rest.descriptors,
            highlights: rest.highlights,
            supportedLanguages: rest.supportedLanguages.split(",").map(s => s.trim()),
            metaTitle: rest.microMetaTitle,
            metaDescription: rest.microMetaDescription
          },
          ratingCount: Number(rest.ratingCount),
          averageRating: Number(rest.averageRating),
          displayRating: rest.displayRating === "Yes",
          sortOrder: Number(rest.sortOrder)
        },
        images
      };
      
      dispatch(addTravelCategoryRequest(payload));
      setSubmitting(false);
    },
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = formik;

  const areAllFieldsFilled = (values) => {
    const requiredFields = [
      "name", "cityCode", "displayName", "heading",
      "metaTitle", "metaDescription", "canonicalUrl", "descriptors",
      "highlights", "supportedLanguages", "microMetaTitle",
      "microMetaDescription", "ratingCount", "averageRating", "sortOrder"
    ];

    return requiredFields.every(field => values[field]?.toString().trim() !== "") &&
      slugsEntered && Object.keys(slugsEntered).length > 0 &&
      values.images && values.images.length > 0;
  };

  // Permission check - if no canAdd permission, show NoPermission component
  if (!canAdd) {
    return <NoPermission />;
  }

  // Regular component flow - render form only if user has canAdd permission
  return (
    <Card>
      <CardBody>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Row>
            <Col md={6} className="mb-3">
              <Label>Category Name *</Label>
              <Input
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("name", touched, errors)}
              />
              {touched.name && errors.name && (
                <div className="text-danger">{errors.name}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>City *</Label>
              <CreatableSelect
                isClearable
                isSearchable
                placeholder="Select or type city code"
                options={
                  Array.isArray(cities)
                    ? cities.map(city => ({
                        value: city.cityCode,
                        label: `${city.cityCode} (${city.country?.code || "N/A"})`,
                      }))
                    : []
                }
                value={
                  values.cityCode
                    ? { value: values.cityCode, label: values.cityCode }
                    : null
                }
                onChange={(selectedOption) => {
                  const selectedValue = selectedOption ? selectedOption.value : "";
                  setFieldValue("cityCode", selectedValue);
                }}
                onCreateOption={(inputValue) => {
                  setFieldValue("cityCode", inputValue);
                }}
                onBlur={() => {
                  setFieldTouched("cityCode", true);
                }}
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                noOptionsMessage={() => "No city found. You can type to add."}
                className={getFieldClass("cityCode", touched, errors)}
              />
              {touched.cityCode && errors.cityCode && (
                <div className="text-danger">{errors.cityCode}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Display Name *</Label>
              <Input
                name="displayName"
                value={values.displayName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("displayName", touched, errors)}
              />
              {touched.displayName && errors.displayName && (
                <div className="text-danger">{errors.displayName}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Heading *</Label>
              <Input
                name="heading"
                value={values.heading}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("heading", touched, errors)}
              />
              {touched.heading && errors.heading && (
                <div className="text-danger">{errors.heading}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Meta Title *</Label>
              <Input
                name="metaTitle"
                value={values.metaTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("metaTitle", touched, errors)}
              />
              {touched.metaTitle && errors.metaTitle && (
                <div className="text-danger">{errors.metaTitle}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Meta Description *</Label>
              <Input
                name="metaDescription"
                value={values.metaDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("metaDescription", touched, errors)}
              />
              {touched.metaDescription && errors.metaDescription && (
                <div className="text-danger">{errors.metaDescription}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Indexing</Label>
              <Input
                type="select"
                name="indexing"
                value={values.indexing}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Allowed">Allowed</option>
                <option value="Not Allowed">Not Allowed</option>
              </Input>
            </Col>

            <Col md={6} className="mb-3">
              <Label>Canonical URL *</Label>
              <Input
                name="canonicalUrl"
                value={values.canonicalUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("canonicalUrl", touched, errors)}
              />
              {touched.canonicalUrl && errors.canonicalUrl && (
                <div className="text-danger">{errors.canonicalUrl}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Sort Order *</Label>
              <Input
                name="sortOrder"
                type="number"
                value={values.sortOrder}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("sortOrder", touched, errors)}
              />
              {touched.sortOrder && errors.sortOrder && (
                <div className="text-danger">{errors.sortOrder}</div>
              )}
            </Col>
          </Row>

          {/* URL Slugs */}
          <URLSlugsSection
            slugsEntered={slugsEntered}
            setSlugsEntered={setSlugsEntered}
          />

          <SlugList
            slugsEntered={slugsEntered}
            onRemove={(lang) => {
              const updated = { ...slugsEntered };
              delete updated[lang];
              setSlugsEntered(updated);
            }}
          />

          {/* Remaining Fields */}
          <h5 className="mt-5">Micro Brands Info</h5>
          <Row>
            <Col md={6} className="mb-3">
              <Label>Descriptors *</Label>
              <Input
                name="descriptors"
                value={values.descriptors}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("descriptors", touched, errors)}
              />
              {touched.descriptors && errors.descriptors && (
                <div className="text-danger">{errors.descriptors}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Highlights *</Label>
              <Input
                name="highlights"
                value={values.highlights}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("highlights", touched, errors)}
              />
              {touched.highlights && errors.highlights && (
                <div className="text-danger">{errors.highlights}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Supported Languages *</Label>
              <Input
                name="supportedLanguages"
                value={values.supportedLanguages}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("supportedLanguages", touched, errors)}
              />
              {touched.supportedLanguages && errors.supportedLanguages && (
                <div className="text-danger">{errors.supportedLanguages}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Micro Meta Title *</Label>
              <Input
                name="microMetaTitle"
                value={values.microMetaTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("microMetaTitle", touched, errors)}
              />
              {touched.microMetaTitle && errors.microMetaTitle && (
                <div className="text-danger">{errors.microMetaTitle}</div>
              )}
            </Col>

            <Col md={12} className="mb-3">
              <Label>Micro Meta Description *</Label>
              <Input
                name="microMetaDescription"
                value={values.microMetaDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("microMetaDescription", touched, errors)}
              />
              {touched.microMetaDescription && errors.microMetaDescription && (
                <div className="text-danger">{errors.microMetaDescription}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Rating Count *</Label>
              <Input
                name="ratingCount"
                type="number"
                value={values.ratingCount}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("ratingCount", touched, errors)}
              />
              {touched.ratingCount && errors.ratingCount && (
                <div className="text-danger">{errors.ratingCount}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Average Rating *</Label>
              <Input
                name="averageRating"
                type="number"
                value={values.averageRating}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("averageRating", touched, errors)}
              />
              {touched.averageRating && errors.averageRating && (
                <div className="text-danger">{errors.averageRating}</div>
              )}
            </Col>

            <Col md={6} className="mb-3">
              <Label>Display Rating *</Label>
              <Input
                type="select"
                name="displayRating"
                value={values.displayRating}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClass("displayRating", touched, errors)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Input>
              {touched.displayRating && errors.displayRating && (
                <div className="text-danger">{errors.displayRating}</div>
              )}
            </Col>
          </Row>

          {/* Image Uploader */}
          <ImageUploader formik={formik} />

          <div className="d-flex gap-2">
            <Button
              type="submit"
              color="primary"
              disabled={
                !areAllFieldsFilled(values) ||
                isSubmitting
              }
            >
              Submit
            </Button>
            <Button color="secondary" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TravelCategoryForm;