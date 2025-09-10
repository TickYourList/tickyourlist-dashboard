import React, { useState, useEffect, useMemo } from "react"
import Select from "react-select"
import toastr from "toastr"
import { useSelector, useDispatch } from "react-redux";
import { createNewCity, editCity, getCountries, getCity } from "../../../store/travelCity/action"
import { useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Label,
  Row,
  TabContent,
  TabPane,
  Button,
  Input,
  Spinner
} from "reactstrap"
import { Formik, Field, FieldArray } from "formik"
import Dropzone from "react-dropzone"
import * as Yup from "yup"
import { Link } from "react-router-dom"
import classnames from "classnames"
import Breadcrumbs from "../../../components/Common/Breadcrumb"
import { useNavigate } from 'react-router-dom';
import PermissionDenied from "./PermissionDenied";

const AddNewCity = ({isEditMode}) => {
  document.title = `${!isEditMode ? "Add New City" : "Edit City"} | Scrollit`

  const dispatch = useDispatch();
  const [activeTab, setactiveTab] = useState(1)
  const [passedSteps, setPassedSteps] = useState([1])
  const navigate = useNavigate();
  const { cityCode } = useParams();
  const { city, loadingEditCity, loadingNewCity } = useSelector(state => state.travelCity)
  const { can, loading: cityPermissionLoading } = usePermissions();
  const initialLanguages = [
    { code: "EN", value: "" },
    { code: "ES", value: "" },
    { code: "FR", value: "" },
    { code: "IT", value: "" },
    { code: "DE", value: "" },
    { code: "PT", value: "" },
    { code: "NL", value: "" },
    { code: "PL", value: "" },
    { code: "DA", value: "" },
    { code: "NO", value: "" },
    { code: "RO", value: "" },
    { code: "RU", value: "" },
    { code: "SV", value: "" },
    { code: "TR", value: "" },
  ]

  const cityValues = useMemo(() => ({
    cityCode: city.cityCode || "",
    displayName: city.displayName || "",
    name: city.name || "",
    tagLine: city.tagLine || "",
    phoneNumber: city.phoneNumber || "",
    smsNumber: city.smsNumber || "",
    country: city.country?._id || "",
    discoverable: city.discoverable ? "true" : "false",
    noIndex: city.noIndex ? "true" : "false",
    timeZone: city.timeZone || "",
    latitude: city.latitude || "",
    longitude: city.longitude || "",
    status: city.status ? "active" : "inactive",
    image: null,
    languages: Object.entries(city.urlSlugs || {}).map(([code, value]) => ({ code, value })),
    extraLanguages: [],
  }), [city])
  const initialValues = {
    cityCode: "",
    displayName: "",
    name: "",
    tagLine: "",
    phoneNumber: "",
    smsNumber: "",
    country: "",
    discoverable: "",
    noIndex: "",
    timeZone:"",
    latitude: "",
    longitude: "",
    status: "",
    image: null,
    languages: initialLanguages,
    extraLanguages: [],
  }

  const validationSchema = Yup.object().shape({
    cityCode: Yup.string().required("City Code is required").notOneOf(["undefined", "null", ""], "Please enter a valid City Code"),
    displayName: Yup.string().required("Display Name is required"),
    name: Yup.string().required("City Name is required"),
    phoneNumber: Yup.string().required("Phone Number is required"),
    smsNumber: Yup.string().required("SMS Number is required"),
    country: Yup.string().required("Country is required"),
    discoverable: Yup.string().required("Discoverable is required"),
    noIndex: Yup.string().required("Index is required"),
    timeZone: Yup.string().required("Time Zone is required"),
    latitude: Yup.string().required("Latitude is required"),
    longitude: Yup.string().required("Longitude is required"),
    status: Yup.string().required("Status is required"),
    languages: Yup.array().of(
      Yup.object().shape({
        code: Yup.string().required(),
        value: Yup.string().required("Slug is required"),
      })
    ),
    extraLanguages: Yup.array().of(
      Yup.object().shape({
        code: Yup.string().required("Lang Code is required"),
        value: Yup.string().required("Slug is required"),
      })
    ),
  })

  const callback = () => {
      navigate('/city');
    };

  const onSubmit = (values) =>  {
    const formData = new FormData()

    formData.append("cityCode", values.cityCode)
    formData.append("displayName", values.displayName)
    formData.append("name", values.name)
    formData.append("tagLine", values.tagLine)
    formData.append("phoneNumber", values.phoneNumber)
    formData.append("smsNumber", values.smsNumber)
    formData.append("country", values.country)
    formData.append("discoverable", values.discoverable)
    formData.append("noIndex", values.noIndex)
    formData.append("timeZone", values.timeZone)
    formData.append("latitude", values.latitude)
    formData.append("longitude", values.longitude)
    formData.append("status", values.status === "active" ? "true" : "false")

    const allLangs = [...values.languages, ...values.extraLanguages]
    const slugObject = {}
    allLangs.forEach(lang => {
      slugObject[lang.code] = lang.value
    })
    formData.append("urlSlugs", JSON.stringify(slugObject))

    if (values.image) {
      formData.append("image", values.image)
    }

    if(isEditMode) dispatch(editCity(cityCode ,formData, callback));
    else dispatch(createNewCity(formData, callback));
  }

  const toggleTab = async (tab, validateForm, setFieldTouched) => {
    if (tab > activeTab) {
      const errors = await validateForm()
      let stepFields = []
      if (activeTab === 1)
        stepFields = ["cityCode", "displayName", "name", "tagLine", "image"]
      if (activeTab === 2)
        stepFields = [
          "phoneNumber",
          "smsNumber",
          "country",
          "timeZone",
          "latitude",
          "longitude",
        ]
      if (activeTab === 3) stepFields = ["discoverable", "noIndex", "status"]
      const hasStepError = Object.keys(errors).some(e => stepFields.includes(e))
      if (hasStepError) {
        stepFields.forEach(field => setFieldTouched(field, true, false))
        return
      }
    }
    if (tab >= 1 && tab <= 4) {
      const modifiedSteps = [...passedSteps, tab]
      setactiveTab(tab)
      setPassedSteps(modifiedSteps)
    }
  }


  useEffect(() => {
    if (can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) || can(ACTIONS.CAN_ADD, MODULES.CITY_PERMS)) {
      dispatch(getCountries())
    }
  }, [dispatch, can]);
  const {countries : countryOptions} = useSelector(state => state.travelCity)

  useEffect(() => {
    if (isEditMode && (!cityCode || cityCode === "undefined" || cityCode.trim() === "")) {
      toastr.error("Please enter a valid City Code in the URL.");
      navigate("/city");
    }
    if(isEditMode && cityCode && can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) && can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS)) {
      dispatch(getCity(cityCode, callback))
    }
  }, [dispatch, isEditMode, cityCode, can]);

  
  if(cityPermissionLoading) {
    return <div className="page-content">
      <Spinner className="ms-2" color="dark" />
      <p>{`Loading ${isEditMode? "city": "page"} data...`}</p>
    </div>
  }
  
  if (!can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS) || 
    (isEditMode && (!can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) || !can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS))) ||  
    (!isEditMode && !can(ACTIONS.CAN_ADD, MODULES.CITY_PERMS))
  ) {
    return <PermissionDenied />;
  }


  if (isEditMode && cityCode && city.cityCode !== cityCode) {
    return <div className="page-content">
      <Spinner className="ms-2" color="dark" />
      <p>{`Loading ${isEditMode? "city": "page"} data...`}</p>
    </div>
  }

  return (
    <div className="page-content">
      <Breadcrumbs title="Cities" breadcrumbItem={!isEditMode ? "Add New City" : `Edit City ${cityCode !== "undefined"? city.displayName : ""}`} />
      <Container fluid>
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <h4 className="card-title mb-4 d-flex justify-content-between align-items-center">
                  Enter City Details Below
                  <Button close onClick={() => navigate("/city")} />
                </h4>
                
                <Formik
                  initialValues={isEditMode && cityCode !== "undefined" ? cityValues : initialValues}
                  validationSchema={validationSchema}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                >
                  {({
                    values,
                    setFieldValue,
                    handleChange,
                    handleBlur,
                    validateForm,
                    setFieldTouched,
                    handleSubmit,
                    errors,
                    touched,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <div className="wizard clearfix">
                        <div className="steps clearfix">
                          <ul>
                            {[1, 2, 3, 4].map(step => (
                              <li
                                key={step}
                                className={classnames({
                                  current: activeTab === step,
                                })}
                              >
                                <Link
                                  to="#"
                                  onClick={() =>
                                    toggleTab(
                                      step,
                                      validateForm,
                                      setFieldTouched
                                    )
                                  }
                                  disabled={!(passedSteps || []).includes(step)}
                                >
                                  <span className="number">{step}.</span>{" "}
                                  {
                                    [
                                      "City Information",
                                      "Contact & Location",
                                      "Visibility Settings",
                                      "URL Slugs",
                                    ][step - 1]
                                  }
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="content clearfix">
                          <TabContent activeTab={activeTab} className="body">
                            <TabPane tabId={1}>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      City Code
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="cityCode"
                                      value={values.cityCode}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.cityCode && touched.cityCode && (
                                      <div className="text-danger">
                                        {errors.cityCode}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Display Name
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="displayName"
                                      value={values.displayName}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.displayName &&
                                      touched.displayName && (
                                        <div className="text-danger">
                                          {errors.displayName}
                                        </div>
                                      )}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      City Name
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="name"
                                      value={values.name}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.name && touched.name && (
                                      <div className="text-danger">
                                        {errors.name}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Tag Line
                                    </Label>
                                    <Input
                                      name="tagLine"
                                      value={values.tagLine}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.tagLine && touched.tagLine && (
                                      <div className="text-danger">
                                        {errors.tagLine}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg="12">
                                  <div className="mb-3">
                                    <Label for="cimg">
                                      City Image{" "}
                                    </Label>
                                    <div className="mh-50">
                                      <Dropzone
                                        onDrop={acceptedFiles => {
                                          const file = acceptedFiles[0]
                                          if (file) {
                                            const allowedTypes = [
                                              "image/png",
                                              "image/jpg",
                                              "image/jpeg",
                                              "image/avif",
                                              "image/webp",
                                            ]
                                            if (
                                              !allowedTypes.includes(file.type)
                                            ) {
                                              toastr.error(
                                                "Only PNG, JPG, JPEG, AVIF, or WEBP images are allowed.",
                                                "Invalid File Type"
                                              )
                                              return
                                            }
                                            file.preview =
                                              URL.createObjectURL(file)
                                            setFieldValue("image", file)
                                          }
                                        }}
                                        accept={{
                                          "image/*": [
                                            ".png",
                                            ".jpg",
                                            ".jpeg",
                                            ".avif",
                                            ".webp",
                                          ],
                                        }}
                                        style={{
                                          width: "300px",
                                          height: "100px",
                                          border: "2px dashed #000",
                                        }}
                                      >
                                        {({ getRootProps, getInputProps }) => (
                                          <div className="dropzone">
                                            <div
                                              className="dz-message needsclick mt-2"
                                              {...getRootProps()}
                                            >
                                              <input {...getInputProps()} />
                                              <div className="mb-3">
                                                <i className="display-4 text-muted bx bxs-cloud-upload" />
                                              </div>
                                              <h4>
                                                Drop City Image here or click to
                                                upload.
                                              </h4>
                                            </div>
                                          </div>
                                        )}
                                      </Dropzone>

                                      {values.image ? (
                                        <div className="dropzone-previews mt-3">
                                          <img
                                            src={values.image.preview}
                                            alt="Preview"
                                            height="100"
                                            className="rounded"
                                          />
                                        </div>
                                      ) : isEditMode && city.imageURL?.url && cityCode !== "undefined" ? (
                                        <div className="dropzone-previews mt-3">
                                          <img
                                            src={city.imageURL.url}
                                            alt="Existing City"
                                            height="100"
                                            className="rounded"
                                          />
                                          <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                                            Existing image — will be replaced if you upload a new one.
                                          </div>
                                        </div>
                                      ) : null}

                                      {errors.image && touched.image && (
                                        <div className="text-danger mt-1">
                                          {errors.image}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </TabPane>

                            <TabPane tabId={2}>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Phone Number
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="phoneNumber"
                                      value={values.phoneNumber}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.phoneNumber &&
                                      touched.phoneNumber && (
                                        <div className="text-danger">
                                          {errors.phoneNumber}
                                        </div>
                                      )}
                                  </div>
                                </Col>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      SMS Number
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="smsNumber"
                                      value={values.smsNumber}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.smsNumber && touched.smsNumber && (
                                      <div className="text-danger">
                                        {errors.smsNumber}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label className="form-label">
                                      Country Name{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <div style={{ minWidth: "100%" }}>
                                    <Select
                                      options={countryOptions}
                                      value={
                                        countryOptions.find(
                                          option =>
                                            option.value === values.country
                                        ) || null
                                      }
                                      onChange={selected =>
                                        setFieldValue(
                                          "country",
                                          selected ? selected.value : ""
                                        )
                                      }
                                      placeholder="Select Country"
                                      isSearchable
                                      className="select2-selection"
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        menu: base => ({
                                          ...base,
                                          zIndex: 9999,
                                          backgroundColor: "#fff", 
                                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
                                        }),
                                      }}
                                    />
                                    </div>
                                    {errors.country && touched.country && (
                                      <div className="text-danger">
                                        {errors.country}
                                      </div>
                                    )}
                                  </div>
                                </Col>

                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Time Zone
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="timeZone"
                                      value={values.timeZone}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.timeZone && touched.timeZone && (
                                      <div className="text-danger">
                                        {errors.timeZone}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>

                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Latitude
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="latitude"
                                      value={values.latitude}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.latitude && touched.latitude && (
                                      <div className="text-danger">
                                        {errors.latitude}
                                      </div>
                                    )}
                                  </div>
                                </Col>

                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Longitude
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      name="longitude"
                                      value={values.longitude}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-control"
                                    />
                                    {errors.longitude && touched.longitude && (
                                      <div className="text-danger">
                                        {errors.longitude}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </TabPane>

                            <TabPane tabId={3}>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      City Discoverable
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      type="select"
                                      name="discoverable"
                                      value={values.discoverable}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-select"
                                    >
                                      <option value="">Select</option>
                                      <option value="true">Yes</option>
                                      <option value="false">No</option>
                                    </Input>
                                    {errors.discoverable &&
                                      touched.discoverable && (
                                        <div className="text-danger">
                                          {errors.discoverable}
                                        </div>
                                      )}
                                  </div>
                                </Col>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Index Allowed
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      type="select"
                                      name="noIndex"
                                      value={values.noIndex}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-select"
                                    >
                                      <option value="">Select</option>
                                      <option value="true">Yes</option>
                                      <option value="false">No</option>
                                    </Input>
                                    {errors.noIndex && touched.noIndex && (
                                      <div className="text-danger">
                                        {errors.noIndex}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col lg="6">
                                  <div className="mb-3">
                                    <Label>
                                      Status
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Input
                                      type="select"
                                      name="status"
                                      value={values.status}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      className="form-select"
                                    >
                                      <option value="">Select</option>
                                      <option value="active">Active</option>
                                      <option value="inactive">Inactive</option>
                                    </Input>
                                    {errors.status && touched.status && (
                                      <div className="text-danger">
                                        {errors.status}
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              </Row>
                            </TabPane>

                            <TabPane tabId={4}>
                              {values.languages.map((lang, index) => (
                                <Row className="mb-3" key={index}>
                                  <Col lg="2" md="2" sm="2">
                                    <Field
                                      name={`languages.${index}.code`}
                                      readOnly
                                      className="form-control"
                                    />
                                  </Col>
                                  <Col lg="10" md="10" sm="10">
                                    <Field
                                      name={`languages.${index}.value`}
                                      placeholder={`/url-slug-${values.languages[`${index}`].code}/`}
                                      className="form-control"
                                    />
                                    {errors.languages &&
                                      errors.languages[index] &&
                                      errors.languages[index].value &&
                                      touched.languages &&
                                      touched.languages[index] &&
                                      touched.languages[index].value && (
                                        <div className="text-danger">
                                          {errors.languages[index].value}
                                        </div>
                                      )}
                                  </Col>
                                </Row>
                              ))}
                              <FieldArray name="extraLanguages">
                                {({ push, remove }) => (
                                  <>
                                    {values.extraLanguages.map(
                                      (lang, index) => (
                                        <Row className="mb-3" key={index}>
                                          <Col lg="2" md="2" sm="2">
                                            <Field
                                              name={`extraLanguages.${index}.code`}
                                              placeholder="Lang Code"
                                              className="form-control"
                                            />
                                            {errors.extraLanguages &&
                                              errors.extraLanguages[index] &&
                                              errors.extraLanguages[index]
                                                .code &&
                                              touched.extraLanguages &&
                                              touched.extraLanguages[index] &&
                                              touched.extraLanguages[index]
                                                .code && (
                                                <div className="text-danger">
                                                  {
                                                    errors.extraLanguages[index]
                                                      .code
                                                  }
                                                </div>
                                              )}
                                          </Col>
                                          <Col lg="8" md="8" sm="8">
                                            <Field
                                              name={`extraLanguages.${index}.value`}
                                              placeholder={"/Enter-Slug/"}
                                              className="form-control"
                                            />
                                            {errors.extraLanguages &&
                                              errors.extraLanguages[index] &&
                                              errors.extraLanguages[index]
                                                .value &&
                                              touched.extraLanguages &&
                                              touched.extraLanguages[index] &&
                                              touched.extraLanguages[index]
                                                .value && (
                                                <div className="text-danger">
                                                  {
                                                    errors.extraLanguages[index]
                                                      .value
                                                  }
                                                </div>
                                              )}
                                          </Col>
                                          <Col lg="2" md="2" sm="2">
                                            <Button
                                              type="button"
                                              color="danger"
                                              onClick={() => remove(index)}
                                            >
                                              Remove
                                            </Button>
                                          </Col>
                                        </Row>
                                      )
                                    )}
                                    <Button
                                      type="button"
                                      color="success"
                                      onClick={() =>
                                        push({ code: "", value: "" })
                                      }
                                    >
                                      Add More
                                    </Button>
                                  </>
                                )}
                              </FieldArray>
                            </TabPane>
                          </TabContent>
                        </div>

                        <div className="actions clearfix d-flex justify-content-between w-100">
                          <Button
                            type="button"
                            color="secondary"
                            className="me-2"
                            onClick={() => navigate("/city")}
                          >
                            Cancel
                          </Button>
                          
                          <ul className="d-flex ms-auto mb-0 align-items-center" style={{ listStyle: "none" }}>
                            <li className={activeTab === 1 ? "previous disabled" : "previous"}>
                              <Link to="#" onClick={() => activeTab > 1 && setactiveTab(activeTab - 1)}>
                                Previous
                              </Link>
                            </li>
                            <li className="next">
                              {activeTab < 4 ? (
                                <Link
                                  to="#"
                                  onClick={() =>
                                    toggleTab(activeTab + 1, validateForm, setFieldTouched)
                                  }
                                >
                                  Next
                                </Link>
                              ) : (
                                <Button
                                  type="submit"
                                  color="success"
                                  disabled={loadingNewCity || loadingEditCity}
                                >
                                  {loadingNewCity || loadingEditCity
                                    ? "Loading..."
                                    : !isEditMode
                                    ? "Add City"
                                    : "Update City"}
                                </Button>
                              )}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default AddNewCity