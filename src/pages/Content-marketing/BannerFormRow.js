import React, { useState, useEffect } from "react";
import { FormFeedback, FormGroup, Label, Col, Row, Input } from "reactstrap";
import Select from "react-select";
import {
  getCityList,
  getTours,
  getCategories,
  getSubcategories,
  getBannerCollections,
} from "../../helpers/location_management_helper";

const BannerFormRow = ({
  index,
  values,
  setFieldValue,
  setFieldTouched,
  touched,
  errors,
}) => {
  const [cities, setCities] = useState([]);
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [bannerCollections, setBannerCollections] = useState([]);

  const currentBanner = values.banners[index];
  const currentErrors = errors.banners?.[index];
  const currentTouched = touched.banners?.[index];
  const rowError = typeof currentErrors === "string" ? currentErrors : null;
  const isCityBanner = currentBanner.bannerType === "city";

  const getSelectStyles = fieldName => ({
    control: base => ({
      ...base,
      borderColor:
        currentErrors?.[fieldName] && currentTouched?.[fieldName]
          ? "#f46a6a"
          : base.borderColor,
      "&:hover": {
        borderColor:
          currentErrors?.[fieldName] && currentTouched?.[fieldName]
            ? "#f46a6a"
            : "#ced4da",
      },
    }),
  });

  useEffect(() => {
    getCityList().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!isCityBanner || !currentBanner.cityCode) {
      setTours([]);
      setCategories([]);
      setSubcategories([]);
      setBannerCollections([]);
      return;
    }

    getTours(currentBanner.cityCode).then(setTours).catch(() => setTours([]));
    getCategories(currentBanner.cityCode)
      .then(setCategories)
      .catch(() => setCategories([]));
    getSubcategories(currentBanner.cityCode)
      .then(setSubcategories)
      .catch(() => setSubcategories([]));
    getBannerCollections(currentBanner.cityCode)
      .then(setBannerCollections)
      .catch(() => setBannerCollections([]));
  }, [currentBanner.cityCode, isCityBanner]);

  const clearProductTargets = () => {
    setFieldValue(`banners[${index}].tourId`, "");
    setFieldValue(`banners[${index}].categoryId`, "");
    setFieldValue(`banners[${index}].subcategoryId`, "");
    setFieldValue(`banners[${index}].bannerCollectionId`, "");
  };

  const handleSelectionChange = (name, selectedValue) => {
    const value = selectedValue ? selectedValue.value : "";
    setFieldValue(name, value);

    if (name === `banners[${index}].tourId` && value) {
      setFieldValue(`banners[${index}].categoryId`, "");
      setFieldValue(`banners[${index}].subcategoryId`, "");
      setFieldValue(`banners[${index}].bannerCollectionId`, "");
    } else if (name === `banners[${index}].categoryId` && value) {
      setFieldValue(`banners[${index}].tourId`, "");
      setFieldValue(`banners[${index}].subcategoryId`, "");
      setFieldValue(`banners[${index}].bannerCollectionId`, "");
    } else if (name === `banners[${index}].subcategoryId` && value) {
      setFieldValue(`banners[${index}].tourId`, "");
      setFieldValue(`banners[${index}].categoryId`, "");
      setFieldValue(`banners[${index}].bannerCollectionId`, "");
    } else if (name === `banners[${index}].bannerCollectionId` && value) {
      setFieldValue(`banners[${index}].tourId`, "");
      setFieldValue(`banners[${index}].categoryId`, "");
      setFieldValue(`banners[${index}].subcategoryId`, "");
    }
  };

  const isTourSelected = !!currentBanner.tourId;
  const isCategorySelected = !!currentBanner.categoryId;
  const isSubcategorySelected = !!currentBanner.subcategoryId;
  const isCollectionSelected = !!currentBanner.bannerCollectionId;

  return (
    <>
      <Row className="align-items-start">
        <Col md={2}>
          <FormGroup>
            <Label>Banner Type</Label>
            <Input
              type="select"
              name={`banners[${index}].bannerType`}
              value={currentBanner.bannerType}
              onChange={event => {
                const selectedType = event.target.value;
                setFieldValue(`banners[${index}].bannerType`, selectedType);
                if (selectedType === "worldwide") {
                  setFieldValue(`banners[${index}].cityCode`, "");
                  clearProductTargets();
                }
              }}
              onBlur={() =>
                setFieldTouched(`banners[${index}].bannerType`, true)
              }
              invalid={
                touched.banners?.[index]?.bannerType &&
                !!errors.banners?.[index]?.bannerType
              }
            >
              <option value="city">City</option>
              <option value="worldwide">Worldwide</option>
            </Input>
            <FormFeedback>
              {errors.banners?.[index]?.bannerType}
            </FormFeedback>
          </FormGroup>
        </Col>

        <Col md={2}>
          <FormGroup>
            <Label>City</Label>
            <Select
              name={`banners[${index}].cityCode`}
              styles={getSelectStyles("cityCode")}
              value={
                cities.find(option => option.value === currentBanner.cityCode) ||
                null
              }
              options={cities}
              onChange={selectedOption => {
                const cityCode = selectedOption ? selectedOption.value : "";
                setFieldValue(`banners[${index}].cityCode`, cityCode);
                clearProductTargets();
              }}
              onBlur={() => setFieldTouched(`banners[${index}].cityCode`, true)}
              placeholder={isCityBanner ? "Search..." : "Not required"}
              isDisabled={!isCityBanner}
              isClearable
            />
            {currentErrors?.cityCode && currentTouched?.cityCode && (
              <FormFeedback className="d-block">
                {currentErrors.cityCode}
              </FormFeedback>
            )}
          </FormGroup>
        </Col>

        <Col md={2}>
          <FormGroup>
            <Label>Tour</Label>
            <Select
              options={tours}
              name={`banners[${index}].tourId`}
              styles={getSelectStyles("tourId")}
              value={tours.find(o => o.value === currentBanner.tourId) || null}
              onChange={opt =>
                handleSelectionChange(`banners[${index}].tourId`, opt)
              }
              onBlur={() => setFieldTouched(`banners[${index}].tourId`, true)}
              placeholder="Search..."
              isClearable
              isDisabled={
                !isCityBanner ||
                !currentBanner.cityCode ||
                isCategorySelected ||
                isSubcategorySelected ||
                isCollectionSelected
              }
            />
          </FormGroup>
        </Col>

        <Col md={2}>
          <FormGroup>
            <Label>Category</Label>
            <Select
              options={categories}
              name={`banners[${index}].categoryId`}
              styles={getSelectStyles("categoryId")}
              value={
                categories.find(o => o.value === currentBanner.categoryId) ||
                null
              }
              onChange={opt =>
                handleSelectionChange(`banners[${index}].categoryId`, opt)
              }
              onBlur={() =>
                setFieldTouched(`banners[${index}].categoryId`, true)
              }
              placeholder="Search..."
              isClearable
              isDisabled={
                !isCityBanner ||
                !currentBanner.cityCode ||
                isTourSelected ||
                isSubcategorySelected ||
                isCollectionSelected
              }
            />
          </FormGroup>
        </Col>

        <Col md={2}>
          <FormGroup>
            <Label>Subcategory</Label>
            <Select
              options={subcategories}
              name={`banners[${index}].subcategoryId`}
              styles={getSelectStyles("subcategoryId")}
              value={
                subcategories.find(
                  o => o.value === currentBanner.subcategoryId,
                ) || null
              }
              onChange={opt =>
                handleSelectionChange(`banners[${index}].subcategoryId`, opt)
              }
              onBlur={() =>
                setFieldTouched(`banners[${index}].subcategoryId`, true)
              }
              placeholder="Search..."
              isClearable
              isDisabled={
                !isCityBanner ||
                !currentBanner.cityCode ||
                isTourSelected ||
                isCategorySelected ||
                isCollectionSelected
              }
            />
          </FormGroup>
        </Col>

        <Col md={2}>
          <FormGroup>
            <Label>Banner Collection</Label>
            <Select
              options={bannerCollections}
              name={`banners[${index}].bannerCollectionId`}
              styles={getSelectStyles("bannerCollectionId")}
              value={
                bannerCollections.find(
                  o => o.value === currentBanner.bannerCollectionId,
                ) || null
              }
              onChange={opt =>
                handleSelectionChange(
                  `banners[${index}].bannerCollectionId`,
                  opt,
                )
              }
              onBlur={() =>
                setFieldTouched(`banners[${index}].bannerCollectionId`, true)
              }
              placeholder="Search..."
              isClearable
              isDisabled={
                !isCityBanner ||
                !currentBanner.cityCode ||
                isTourSelected ||
                isCategorySelected ||
                isSubcategorySelected
              }
            />
          </FormGroup>
        </Col>
      </Row>

      <Row className="align-items-start">
        <Col md={2}>
          <FormGroup>
            <Label>Title</Label>
            <Input
              name={`banners[${index}].title`}
              value={currentBanner.title || ""}
              onChange={event =>
                setFieldValue(`banners[${index}].title`, event.target.value)
              }
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label>Subtitle</Label>
            <Input
              name={`banners[${index}].subtitle`}
              value={currentBanner.subtitle || ""}
              onChange={event =>
                setFieldValue(`banners[${index}].subtitle`, event.target.value)
              }
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label>Button Text</Label>
            <Input
              name={`banners[${index}].buttonText`}
              value={currentBanner.buttonText || ""}
              onChange={event =>
                setFieldValue(
                  `banners[${index}].buttonText`,
                  event.target.value,
                )
              }
            />
          </FormGroup>
        </Col>
        <Col md={1}>
          <FormGroup>
            <Label>Sort</Label>
            <Input
              type="number"
              min="0"
              name={`banners[${index}].sortOrder`}
              value={currentBanner.sortOrder}
              onChange={event =>
                setFieldValue(
                  `banners[${index}].sortOrder`,
                  event.target.value,
                )
              }
              onBlur={() =>
                setFieldTouched(`banners[${index}].sortOrder`, true)
              }
              invalid={
                touched.banners?.[index]?.sortOrder &&
                !!errors.banners?.[index]?.sortOrder
              }
            />
            <FormFeedback>
              {errors.banners?.[index]?.sortOrder}
            </FormFeedback>
          </FormGroup>
        </Col>
        <Col md={1}>
          <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              name={`banners[${index}].status`}
              value={String(currentBanner.status !== false)}
              onChange={event =>
                setFieldValue(
                  `banners[${index}].status`,
                  event.target.value === "true",
                )
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label>Web View Media</Label>
            <Input
              name={`banners[${index}].mediaFile`}
              type="file"
              accept="image/*,video/*"
              onChange={event =>
                setFieldValue(
                  `banners[${index}].mediaFile`,
                  event.currentTarget.files?.[0] || null,
                )
              }
              invalid={
                touched.banners?.[index]?.mediaFile &&
                !!errors.banners?.[index]?.mediaFile
              }
            />
            <FormFeedback>
              {errors.banners?.[index]?.mediaFile}
            </FormFeedback>
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label>Phone View Media</Label>
            <Input
              name={`banners[${index}].phoneViewMediaFile`}
              type="file"
              accept="image/*,video/*"
              onChange={event =>
                setFieldValue(
                  `banners[${index}].phoneViewMediaFile`,
                  event.currentTarget.files?.[0] || null,
                )
              }
              invalid={
                touched.banners?.[index]?.phoneViewMediaFile &&
                !!errors.banners?.[index]?.phoneViewMediaFile
              }
            />
            <FormFeedback>
              {errors.banners?.[index]?.phoneViewMediaFile}
            </FormFeedback>
          </FormGroup>
        </Col>
      </Row>

      {rowError && (
        <Row>
          <Col>
            <div className="text-danger text-center mt-2 mb-2">{rowError}</div>
          </Col>
        </Row>
      )}

      <hr className="my-3" />
    </>
  );
};

export default BannerFormRow;
