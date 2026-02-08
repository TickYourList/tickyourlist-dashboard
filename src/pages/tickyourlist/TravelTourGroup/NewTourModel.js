import React, { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import {
  Button,
  FormGroup,
  Label,
  Input,
  Col,
  Row,
  Card,
  CardBody,
  TabContent,
  TabPane,
} from "reactstrap"
import Location from "./Location"
import Navbar from "./Navbar"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"

import FormikSubmitButton from "./FormikSubmitButton"

import TourImages from "./ImageUploadFroms/TourImage"
import ProductImage from "./ImageUploadFroms/ProductImage"
import SafetyImage from "./ImageUploadFroms/SafetyImages"
import SafetyVideo from "./ImageUploadFroms/SafetyVideos"
import {
  addTourGroupRequest,
  updateTourGroupRequest,
} from "store/tickyourlist/travelTourGroup/action"

import { getCities } from "../../../store/travelCity/action"
import EditorReact from "./Editor"
import CreatableSelect from "react-select/creatable"

export default function NewTourModel({ setModal, isEdit, editId }) {
  const [activeTab, setactiveTab] = useState(1)
  const [passedSteps, setPassedSteps] = useState([1])

  const tourGroupByIdMap = useSelector(state => state.tourGroup.tourGroupById)
  // Access the tour group data using the editId as the key
  const tourGroupById = isEdit ? (tourGroupByIdMap?.[editId] || {}) : {}

  useEffect(() => {
    dispatch(getCities())
  }, [])
  /* console.log("TourGroup By ID", tourGroupById) */
  const PREDEFINED_LANGS = [
    "EN",
    "FR",
    "DE",
    "NL",
    "DA",
    "RO",
    "SV",
    "ES",
    "IT",
    "PT",
    "PL",
    "NO",
    "RU",
    "TR",
  ]
  const existingLangs = Object.keys(tourGroupById.urlSlugs || {})
  const defaultLangs = Array.from(
    new Set([...PREDEFINED_LANGS, ...existingLangs])
  )
  const [slugLangs, setSlugLangs] = useState(defaultLangs)
  const [newSlugLang, setNewSlugLang] = useState("")

  const allInitialTags = tourGroupById?.allTags
    ? tourGroupById.allTags.map(tag => ({ value: tag, label: tag }))
    : []
  const initialValues = {
    name: tourGroupById?.name || "",
    flowType: tourGroupById?.flowType || "",
    neighbourhood: tourGroupById?.neighbourhood || "",
    url: tourGroupById?.url || "",
    cityCode: tourGroupById?.cityCode || "",
    displayTags: tourGroupById?.displayTags || [],
    allTags: allInitialTags,
    promotionLabel: tourGroupById?.promotionLabel || "",
    metaTitle: tourGroupById?.metaTitle || "",

    metaDescription: tourGroupById?.metaDescription || "",
    summary: tourGroupById?.summary || "",
    highlights: tourGroupById?.highlights || "",
    faq: tourGroupById?.faq || "",
    validity: tourGroupById?.validity || "",
    adhoc: tourGroupById?.adhoc || "",
    shortSummary: tourGroupById?.shortSummary || "",
    inclusions: tourGroupById?.inclusions || "",
    exclusions: tourGroupById?.exclusions || "",
    itinerary: tourGroupById?.itinerary || "",
    additionalInfo: tourGroupById?.additionalInfo || "",
    ticketDeliveryInfo: tourGroupById?.ticketDeliveryInfo || "",
    confirmedTicketInfo: tourGroupById?.confirmedTicketInfo || "",

    status: tourGroupById?.status || false,
    displaySeatsLeftDisabled: tourGroupById?.displaySeatsLeftDisabled || false,
    cancellation: tourGroupById?.cancellation || false,
    hasMobileTicket: tourGroupById?.hasMobileTicket || false,
    hasHotelPickup: tourGroupById?.hasHotelPickup || false,
    hasInstantConfirmation: tourGroupById?.hasInstantConfirmation || false,
    hasSkipTheLine: tourGroupById?.hasSkipTheLine || false,
    hasFreeCancellation: tourGroupById?.hasFreeCancellation || false,
    whatsappOnly: tourGroupById?.whatsappOnly || false,
    notAvailable: tourGroupById?.notAvailable || false,
    flexiDate: tourGroupById?.flexiDate || false,
    minDuration: tourGroupById?.minDuration || "",
    maxDuration: tourGroupById?.maxDuration || "",
    distance: tourGroupById?.distance || "",
    tourType: tourGroupById?.tourType || "",
    descriptors: tourGroupById?.descriptors || [],
    microBrandsDescriptor: tourGroupById?.microBrandsDescriptor || "",
    microBrandsHighlight: tourGroupById?.microBrandsHighlight || "",
    callToAction: tourGroupById?.callToAction || "",
    canonicalUrl: tourGroupById?.canonicalUrl || "",
    noIndex: tourGroupById?.noIndex || false,
    supportedLanguages: tourGroupById?.supportedLanguages || [],
    contentMachineTranslated: tourGroupById?.contentMachineTranslated || false,
    urlSlugs: Object.fromEntries(
      slugLangs.map(lang => [lang, tourGroupById?.urlSlugs?.[lang] || ""])
    ),
    venueId: tourGroupById?.venueId || "",
    ticketValidity: {
      ticketValidityType:
        tourGroupById?.ticketValidity?.ticketValidityType || "UNTIL_DATE",
      ticketValidityUntilDate:
        tourGroupById?.ticketValidity?.ticketValidityUntilDate || "",
      ticketValidityUntilDaysFromPurchase:
        tourGroupById?.ticketValidity?.ticketValidityUntilDaysFromPurchase ||
        "",
    },
    cancellationPolicy: tourGroupById?.cancellationPolicy || {},
    cancellationPolicyV2: {
      cancellable: tourGroupById?.cancellationPolicyV2?.cancellable || false,
      cancellableUpTo:
        tourGroupById?.cancellationPolicyV2?.cancellableUpTo || "",
    },
    reschedulePolicy: {
      reschedulable: tourGroupById?.reschedulePolicy?.reschedulable || false,
      reschedulableUpTo:
        tourGroupById?.reschedulePolicy?.reschedulableUpTo || "",
    },
    supportedLanguages: tourGroupById?.supportedLanguages || [],
    startLocation: {
      latitude: tourGroupById?.startLocation?.latitude || "",
      longitude: tourGroupById?.startLocation?.longitude || "",
      addressLine1: tourGroupById?.startLocation?.addressLine1 || "",
      addressLine2: tourGroupById?.startLocation?.addressLine2 || "",
      cityName: tourGroupById?.startLocation?.cityName || "",
      postalCode: tourGroupById?.startLocation?.postalCode || "",
      state: tourGroupById?.startLocation?.state || "",
      countryCode: tourGroupById?.startLocation?.countryCode || "",
    },
    endLocation: {
      latitude: tourGroupById?.endLocation?.latitude || "",
      longitude: tourGroupById?.endLocation?.longitude || "",
      addressLine1: tourGroupById?.endLocation?.addressLine1 || "",
      addressLine2: tourGroupById?.endLocation?.addressLine2 || "",
      cityName: tourGroupById?.endLocation?.cityName || "",
      postalCode: tourGroupById?.endLocation?.postalCode || "",
      state: tourGroupById?.endLocation?.state || "",
      countryCode: tourGroupById?.endLocation?.countryCode || "",
    },

    imageUploads: tourGroupById?.imageUploads?.length
      ? tourGroupById.imageUploads.map(item => ({
        altText: item.altText || "",
        url: item.url || null,
      }))
      : [
        {
          altText: "",
          url: null,
        },
      ],

    productImages: tourGroupById?.media?.productImages?.length
      ? tourGroupById.media.productImages.map(item => ({
        altText: item.altText || "",
        url: item.url || null,
      }))
      : [
        {
          altText: "",
          url: null,
        },
      ],
    safetyImages: tourGroupById?.media?.safetyImages?.length
      ? tourGroupById.media.safetyImages.map(item => ({
        altText: item.altText || "",
        url: item.url || null,
      }))
      : [
        {
          altText: "",
          url: null,
        },
      ],
    safetyVideos: tourGroupById?.media?.SafetyVideos?.length
      ? tourGroupById.media.safetyVideos.map(item => ({
        altText: item.altText || "",
        url: item.url || null,
      }))
      : [
        {
          altText: "",
          url: null,
        },
      ],
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Tour Group name is required"),
    // flowType: Yup.string(),
    // neighbourhood: Yup.string(),
    // url: Yup.string(),
    // cityCode: Yup.string(),
    // metaTitle: Yup.string(),
    // metaDescription: Yup.string(),
    // summary: Yup.string(),
    // highlights: Yup.string(),
    // faq: Yup.string(),
    // validity: Yup.date(),
    // adhoc: Yup.string().nullable(),
    // shortSummary: Yup.string(),
    // inclusions: Yup.string(),
    // exclusions: Yup.string(),
    // itinerary: Yup.string(),
    // additionalInfo: Yup.string(),
    // microBrandsDescriptor: Yup.string(),
    // microBrandsHighlight: Yup.string(),
    // callToAction: Yup.string(),
    // canonicalUrl: Yup.string().url("Please enter a valid URL"),
    // noIndex: Yup.boolean(),
    // supportedLanguages: Yup.array(),
    // contentMachineTranslated: Yup.boolean(),

    // ticketDeliveryInfo: Yup.string(),
    // confirmedTicketInfo: Yup.string(),
    // cancellation: Yup.boolean().oneOf([true, false], "Please select a value."),
    // status: Yup.boolean().oneOf([true, false], "Please select a value."),
    // displaySeatsLeftDisabled: Yup.boolean().oneOf(
    //   [true, false],
    //   "Please select a value."
    // ),
    // hasMobileTicket: Yup.boolean().oneOf(
    //   [true, false],
    //   "Please select a value."
    // ),
    // hasHotelPickup: Yup.boolean().oneOf(
    //   [true, false],
    //   "Please select a value."
    // ),
    // hasInstantConfirmation: Yup.boolean().oneOf(
    //   [true, false],
    //   "Please select a value."
    // ),
    // hasSkipTheLine: Yup.boolean().oneOf(
    //   [true, false],
    //   "Please select a value."
    // ),
    // whatsappOnly: Yup.boolean().oneOf([true, false], "Please select a value."),
    // notAvailable: Yup.boolean().oneOf([true, false], "Please select a value."),

    // minDuration: Yup.number(),
    // maxDuration: Yup.number(),
    // distance: Yup.number(),
    // tourType: Yup.string(),
    // descriptors: Yup.array(),

    // allTags: Yup.array(),

    // urlSlugs: Yup.object().shape(
    //   Object.fromEntries(slugLangs.map(lang => [lang, Yup.string().nullable()]))
    // ),

    // venueId: Yup.string(),
    // ticketValidity: Yup.object().shape({
    //   ticketValidityType: Yup.string(),
    //   ticketValidityUntilDate: Yup.date(),
    //   ticketValidityUntilDaysFromPurchase: Yup.number(),
    // }),
    // cancellationPolicy: Yup.object(),
    // cancellationPolicyV2: Yup.object().shape({
    //   cancellable: Yup.boolean().oneOf([true, false], "Please select a value."),
    //   cancellableUpTo: Yup.number(),
    // }),
    // reschedulePolicy: Yup.object().shape({
    //   reschedulable: Yup.boolean().oneOf(
    //     [true, false],
    //     "Please select a value."
    //   ),
    //   reschedulableUpTo: Yup.number(),
    // }),
    // supportedLanguages: Yup.array(),
    // startLocation: Yup.object().shape({
    //   latitude: Yup.number(),
    //   longitude: Yup.number(),
    //   addressLine1: Yup.string(),
    //   addressLine2: Yup.string(),
    //   cityName: Yup.string(),
    //   postalCode: Yup.number(),
    //   state: Yup.string(),
    //   countryCode: Yup.string(),
    // }),
    // endLocation: Yup.object().shape({
    //   latitude: Yup.number(),
    //   longitude: Yup.number(),
    //   addressLine1: Yup.string(),
    //   addressLine2: Yup.string(),
    //   cityName: Yup.string(),
    //   postalCode: Yup.number(),
    //   state: Yup.string(),
    //   countryCode: Yup.string(),
    // }),

    // imageUploads: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       altText: Yup.string(),
    //       image: Yup.mixed(),
    //     })
    //   )
    //   .min(5, "At least 5 tour image is required")
    //   .max(15, "Maximum 15 tour images allowed"),

    // productImages: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       altText: Yup.string(),
    //       image: Yup.mixed(),
    //     })
    //   )
    //   .min(5, "At least 5 tour image is required")
    //   .max(10, "Maximum 10 product images allowed"),
    // safetyImages: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       altText: Yup.string(),
    //       image: Yup.mixed(),
    //     })
    //   )

    //   .max(10, "Maximum 10 safety images allowed"),
    // safetyVideos: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       altText: Yup.string(),
    //       image: Yup.mixed(),
    //     })
    //   )

    //   .max(10, "Maximum 10 safety videos allowed"),
  })

  const emptyStringToNull = obj => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === "string" && value.trim() === "" ? null : value,
      ])
    )
  }

  const keyFields = [
    "name",
    "flowType",
    "neighbourhood",
    "url",
    "cityCode",
    "city",
    "urlSlugs",
    "displaySeatsLeftDisabled",
    "displayTags",

    "promotionLabel",
    "metaTitle",
    "metaDescription",
    "summary",
    "highlights",
    "faq",
    "validity",
    "cancellation",
    "adhoc",
    "shortSummary",
    "ticketDeliveryInfo",
    "confirmedTicketInfo",
    "inclusions",
    "exclusions",
    "itinerary",
    "additionalInfo",
    "hasMobileTicket",
    "hasHotelPickup",
    "hasInstantConfirmation",
    "hasSkipTheLine",
    "hasFreeCancellation",
    "flexiDate",
    "startLocation",
    "endLocation",
    "minDuration",
    "maxDuration",
    "distance",
    "tourType",
    "descriptors",
    "microBrandsDescriptor",
    "microBrandsHighlight",
    "callToAction",
    "canonicalUrl",
    "noIndex",
    "supportedLanguages",
    "contentMachineTranslated",

    "cancellationPolicy",
    "cancellationPolicyV2",
    "reschedulePolicy",
    "ticketValidity",
    "venueId",
    "liveInventoryCheck",
    "status",
    "whatsappOnly",
    "notAvailable",
  ]
  const dispatch = useDispatch()

  const handleSubmit = values => {
    /*  console.log("FAQ value before submit:", values.faq) */
    /* const allTags = values.allTags.split(",") */
    const data = {
      ...Object.fromEntries(keyFields.map(key => [key, values?.[key]])),
      allTags: values.allTags.map(tag => tag.value),
    }
    const nullValidatedData = emptyStringToNull(data)
    const formData = new FormData()

    formData.append("data", JSON.stringify(nullValidatedData))

    //Uploading images
    values.imageUploads?.forEach((img, index) => {
      if (img.image instanceof File) {
        formData.append(`imageUploads`, img.image)
      }
    })

    values.productImages?.forEach((img, index) => {
      if (img.image instanceof File) {
        formData.append(`productImages`, img.image)
      }
    })
    values.safetyImages?.forEach((img, index) => {
      if (img.image instanceof File) {
        formData.append(`safetyImages`, img.image)
      }
    })
    values.safetyVideos?.forEach((img, index) => {
      if (img.image instanceof File) {
        formData.append(`safetyVideos`, img.image)
      }
    })

    /*  console.log(JSON.stringify(values.imageUploads)) */
    if (isEdit) {
      dispatch(
        updateTourGroupRequest({
          formData: formData,
          id: editId,
        })
      )
    } else {
      dispatch(
        addTourGroupRequest({
          CityCode: values.cityCode,
          formData: formData,
        })
      )
    }

    /*  for (let [key, value] of formData.entries()) {
      console.info(key, value)
    } */
  }

  const cityCode = useSelector(state => state.travelCity.cities)

  function toggleTab(tab) {
    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab]
      if (tab >= 1 && tab <= 10) {
        setactiveTab(tab)
        setPassedSteps(modifiedSteps)
      }
    }
  }
  const handleAddSlugLang = setFieldValue => {
    const lang = newSlugLang.toUpperCase().trim()
    if (lang && !slugLangs.includes(lang)) {
      setSlugLangs(prev => [...prev, lang])
      setFieldValue(`urlSlugs.${lang}`, "")
      setNewSlugLang("")
    }
  }
  const handleRemoveSlugLang = (lang, setFieldValue) => {
    if (!PREDEFINED_LANGS.includes(lang)) {
      setSlugLangs(prev => prev.filter(l => l !== lang))
      setFieldValue(`urlSlugs.${lang}`, undefined)
    }
  }

  const half = Math.ceil(slugLangs.length / 2)
  const firstHalf = slugLangs.slice(0, half)
  const secondHalf = slugLangs.slice(half)

  const renderSlugInputs = (langs, setFieldValue) =>
    langs.map(lang => (
      <Row className="mb-3" key={lang}>
        <Col xs={10}>
          <Label className="form-label">{lang}</Label>
          <Field
            as={Input}
            type="text"
            name={`urlSlugs.${lang}`}
            placeholder={`Enter slug for ${lang}`}
          />
        </Col>

        {!PREDEFINED_LANGS.includes(lang) && (
          <Col xs={2} className="d-flex align-items-end">
            <Button
              color="danger"
              size="sm"
              type="button"
              onClick={() => handleRemoveSlugLang(lang, setFieldValue)}
            >
              ×
            </Button>
          </Col>
        )}
      </Row>
    ))
  return (
    <React.Fragment>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnMount={true}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <Row>
              <Col lg="12">
                <Card>
                  <CardBody>
                    <div className="vertical-wizard wizard clearfix vertical">
                      <div className="steps clearfix">
                        <Navbar
                          activeTab={activeTab}
                          setactiveTab={setactiveTab}
                          passedSteps={passedSteps}
                        />
                      </div>
                      {/* modal form  */}
                      <div className="content clearfix">
                        <TabContent activeTab={activeTab} className="body">
                          {/* Basic details */}
                          <TabPane tabId={1}>
                            <Row form="true">
                              <Col className="col-12">
                                {/* Tour group name */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Tour Group Name{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="name"
                                      type="text"
                                      placeholder="Enter the tour group..."
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="name"
                                    />
                                  </Col>

                                  {/* Tour Group ID - Disabled field for copying (only in edit mode) */}
                                  {isEdit && editId && (
                                    <Col className="mb-3">
                                      <Label className="form-label">
                                        Tour Group ID
                                      </Label>
                                      <div className="d-flex gap-2">
                                        <Input
                                          type="text"
                                          value={editId}
                                          disabled
                                          readOnly
                                          className="form-control"
                                          style={{ 
                                            backgroundColor: "#f8f9fa",
                                            cursor: "text",
                                            userSelect: "all"
                                          }}
                                          onClick={(e) => e.target.select()}
                                        />
                                        <Button
                                          color="secondary"
                                          size="sm"
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(editId);
                                            // You could add a toast notification here if available
                                          }}
                                          title="Copy Tour Group ID"
                                          style={{ height: "38px", alignSelf: "flex-end" }}
                                        >
                                          <i className="fas fa-copy"></i>
                                        </Button>
                                      </div>
                                      <small className="form-text text-muted">
                                        Copy this ID to use in scripts or API calls
                                      </small>
                                    </Col>
                                  )}

                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="flowType"
                                    >
                                      Flow Type{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="flowType"
                                      type="text"
                                      placeholder="Enter the flow type"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="flowType"
                                    />
                                  </Col>
                                </Row>
                                {/* Tour Type and url */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      URL{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="url"
                                      type="text"
                                      placeholder="Enter the tour group url."
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="url"
                                    />
                                  </Col>

                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="tourType"
                                    >
                                      Tour Type{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="tourType"
                                      type="text"
                                      placeholder="Enter the tour type"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="tourType"
                                    />
                                  </Col>
                                </Row>

                                {/* citycode and neighbourhood */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="neighbourhood"
                                    >
                                      Neighbourhood{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="neighbourhood"
                                      type="text"
                                      placeholder="Enter the Neighbourhood"
                                    />
                                  </Col>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="cityCode"
                                    >
                                      City Code{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="cityCode"
                                      type="select"
                                      placeholder="select the city code"
                                      onChange={e =>
                                        setFieldValue(
                                          "cityCode",
                                          e.target.value || ""
                                        )
                                      }
                                    >
                                      <option></option>
                                      {cityCode.map(city => (
                                        <option key={city._id}>
                                          {city.cityCode}
                                        </option>
                                      ))}
                                    </Field>
                                  </Col>
                                </Row>

                                {/* status and whatsappOnly */}
                                <Row>
                                  {/* status */}
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="status"
                                    >
                                      Status{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="status"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "status",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="status"
                                    />
                                  </Col>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      whatsappOnly{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="whatsappOnly"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "whatsappOnly",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                </Row>
                                {/* hasMobileTicket and hasHotelPickup */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="hasMobileTicket"
                                    >
                                      Has Mobile Ticket{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="hasMobileTicket"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "hasMobileTicket",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="hasHotelPickup"
                                    >
                                      Has Hotel Pickup{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="hasHotelPickup"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "hasHotelPickup",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                </Row>
                                {/* hasInstantConfirmation and hasSkipTheLine */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Has Instant Confirmation{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="hasInstantConfirmation"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "hasInstantConfirmation",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="hasSkipTheLine"
                                    >
                                      Has Skip TheLine{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="hasSkipTheLine"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "hasSkipTheLine",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                </Row>
                                {/* hasFreeCancellation and flexiDate */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="hasFreeCancellation"
                                    >
                                      Has Free Cancellation{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="hasFreeCancellation"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "hasFreeCancellation",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Flexi Date{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="flexiDate"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "flexiDate",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                </Row>
                                {/* liveInventoryCheck and notAvailable */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Live Inventory Check{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="liveInventoryCheck"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "liveInventoryCheck",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                  <Col className="mb-3">
                                    <Label className="form-label">
                                      Not Available{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="notAvailable"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "notAvailable",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="true">True</option>
                                      <option value="false">False</option>
                                    </Field>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </TabPane>
                          <TabPane tabId={2}>
                            {" "}
                            {/* url slugs */}
                            <h5>Url Slugs</h5>
                            <Row>
                              <Col>
                                {renderSlugInputs(firstHalf, setFieldValue)}
                              </Col>
                              <Col>
                                {renderSlugInputs(secondHalf, setFieldValue)}
                              </Col>
                            </Row>
                            <Row className="mt-3 align-items-end">
                              <Col md={4}>
                                <Label className="form-label">
                                  Add New Language
                                </Label>
                                <Input
                                  value={newSlugLang}
                                  onChange={e => setNewSlugLang(e.target.value)}
                                  placeholder="e.g. JP"
                                />
                              </Col>
                              <Col md="auto">
                                <Button
                                  type="button"
                                  onClick={() =>
                                    handleAddSlugLang(setFieldValue)
                                  }
                                  color="success"
                                >
                                  + Add Language
                                </Button>
                              </Col>
                            </Row>
                          </TabPane>
                          {/* Location */}
                          <TabPane tabId={3}>
                            <Location
                              title={"Start Location"}
                              Prefix={"startLocation"}
                            />
                            <Location
                              title={"End Location"}
                              Prefix={"endLocation"}
                            />
                          </TabPane>

                          {/* ticket info */}
                          <TabPane tabId={4}>
                            <div>
                              {/* validity and cancellation */}
                              <Row>
                                <Col className="mb-3">
                                  <Label className="form-label">
                                    Validity{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as={Input}
                                    name="validity"
                                    type="date"
                                    placeholder="Enter the tour group..."
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="validity"
                                  />
                                </Col>

                                <Col className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="cancellation"
                                  >
                                    Cancellation{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as={Input}
                                    name="cancellation"
                                    type="select"
                                    className="form-select"
                                    onChange={e =>
                                      setFieldValue(
                                        "cancellation",
                                        e.target.value === "true"
                                      )
                                    }
                                  >
                                    <option value="true">Allowed</option>
                                    <option value="false">Not Allowed</option>
                                  </Field>
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="cancellation"
                                  />
                                </Col>
                              </Row>
                              {/* ticket validity */}
                              <br />
                              <h5>Ticket validity</h5>
                              <Row>
                                <Col className="form-label">
                                  <Label>Ticket Validity Type</Label>
                                  <Field
                                    as={Input}
                                    type="text"
                                    name="ticketValidity.ticketValidityType"
                                  />
                                </Col>
                                <Col className="form-label">
                                  <Label>Ticket Validity Until Date</Label>
                                  <Field
                                    as={Input}
                                    type="date"
                                    name="ticketValidity.ticketValidityUntilDate"
                                  />
                                </Col>
                                <Col className="form-label">
                                  <Label>
                                    Ticket Validity Until Days From Purchase
                                  </Label>
                                  <Field
                                    as={Input}
                                    type="number"
                                    name="ticketValdity.ticketValidityUntilDaysFromPurchase"
                                  />
                                </Col>
                              </Row>

                              <br />
                              <h5>Cancellation Policy V2</h5>
                              <Row>
                                <Col className="form-label">
                                  <Label>Cancellable</Label>
                                  <Field
                                    as={Input}
                                    name="cancellationPolicyV2.cancellable"
                                    type="select"
                                    className="form-select"
                                    onChange={e =>
                                      setFieldValue(
                                        "cancellationPolicyV2",
                                        e.target.value === "true"
                                      )
                                    }
                                  >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                  </Field>
                                </Col>
                                <Col className="form-label">
                                  <Label>Cancellable Upto</Label>
                                  <Field
                                    as={Input}
                                    type="number"
                                    name="cancellationPolicyV2.cancellableUpTo"
                                  />
                                </Col>
                              </Row>
                              <br />
                              <h5>Reschedule Policy </h5>
                              <Row>
                                <Col className="form-label">
                                  <Label>Reschedulable</Label>
                                  <Field
                                    as={Input}
                                    name="reschedulePolicy.reschedulable"
                                    type="select"
                                    className="form-select"
                                    onChange={e =>
                                      setFieldValue(
                                        "reschedulePolicy.reschedulable",
                                        e.target.value === "true"
                                      )
                                    }
                                  >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                  </Field>
                                </Col>
                                <Col className="form-label">
                                  <Label>Reschedulable Upto</Label>
                                  <Field
                                    as={Input}
                                    type="number"
                                    name="reschedulePolicy.reschedulableUpTo"
                                  />
                                </Col>
                              </Row>
                              <br />
                              <Row>
                                <Col className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="ticketDeliveryInfo"
                                  >
                                    Ticket Delivery Info{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <EditorReact
                                    value={values.ticketDeliveryInfo}
                                    onChange={val =>
                                      setFieldValue("ticketDeliveryInfo", val)
                                    }
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="ticketDeliveryInfo"
                                  />
                                </Col>
                              </Row>

                              <Row>
                                <Col className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="confirmedTicketInfo"
                                  >
                                    Confirmed Ticket Info
                                  </Label>
                                  <EditorReact
                                    value={values.confirmedTicketInfo}
                                    onChange={val =>
                                      setFieldValue("confirmedTicketInfo", val)
                                    }
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="confirmedTicketInfo"
                                  />
                                </Col>
                              </Row>

                              {/* venueId and additionalInfo  */}
                              <Row>
                                {" "}
                                <Col className="mb-3">
                                  <Label className="form-label">
                                    Venue Id{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as={Input}
                                    name="venueId"
                                    type="text"
                                    placeholder="Enter the venue Id"
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="venueId"
                                  />
                                </Col>
                                <Col className="mb-3">
                                  <Label
                                    className="form-label"
                                    htmlFor="additionalInfo"
                                  >
                                    Additional Info{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as="textarea"
                                    name="additionalInfo"
                                    type="text"
                                    className="form-control"
                                    placeholder="Something to keep in mind?"
                                  ></Field>
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="additionalInfo"
                                  />
                                </Col>
                              </Row>

                              <Row>
                                <Col className="mb-3">
                                  <Label className="form-label">
                                    Min Duration{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as={Input}
                                    name="minDuration"
                                    type="number"
                                    placeholder="Enter the value in hours"
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="minDuration"
                                  />
                                </Col>
                                <Col className="mb-3">
                                  <Label className="form-label">
                                    Max Duration{" "}
                                    <span style={{ color: "red" }}>*</span>
                                  </Label>
                                  <Field
                                    as={Input}
                                    name="maxDuration"
                                    type="number"
                                    placeholder="Enter the value in hours"
                                  />
                                  <ErrorMessage
                                    component={"span"}
                                    className="text-danger"
                                    name="maxDuration"
                                  />
                                </Col>
                              </Row>
                            </div>
                          </TabPane>

                          {/* Meta Discriptions  */}
                          <TabPane tabId={5}>
                            <Row>
                              <Col>
                                {/* Meta title and description */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="metaTitle"
                                    >
                                      Meta Title{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as="textarea"
                                      name="metaTitle"
                                      className="form-control"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="metaTitle"
                                    />
                                  </Col>

                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="metaDescription"
                                    >
                                      Meta Description{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as="textarea"
                                      name="metaDescription"
                                      className="form-control"
                                    ></Field>
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="metaDescription"
                                    />
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Label
                                      className="form-label"
                                      htmlFor="allTags"
                                    >
                                      Tags{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <Field
                                      as={CreatableSelect}
                                      isMulti
                                      name="allTags"
                                      className="form-control"
                                      onChange={selectedOptions => {
                                        setFieldValue(
                                          "allTags",
                                          selectedOptions || []
                                        )
                                      }}
                                    />
                                  </Col>
                                </Row>
                                {/* faq and highlights */}
                                <Row>
                                  <Col className="mb-3 ">
                                    <Label className="form-label" htmlFor="faq">
                                      FAQ{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>

                                    <EditorReact
                                      value={values.faq}
                                      onChange={val =>
                                        setFieldValue("faq", val)
                                      }
                                    />

                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="faq"
                                    />
                                  </Col>{" "}
                                </Row>
                                <Row>
                                  <Col className="mb-3 ">
                                    <Label
                                      className="form-label"
                                      htmlFor="highlights"
                                    >
                                      Highlights{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <EditorReact
                                      value={values.highlights}
                                      onChange={val =>
                                        setFieldValue("highlights", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="highlights"
                                    />
                                  </Col>
                                </Row>

                                {/* Additional Meta Fields */}
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="microBrandsDescriptor"
                                    >
                                      Micro Brands Descriptor
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="microBrandsDescriptor"
                                      type="text"
                                      placeholder="Enter micro brands descriptor"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="microBrandsDescriptor"
                                    />
                                  </Col>
                                </Row>

                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="microBrandsHighlight"
                                    >
                                      Micro Brands Highlight
                                    </Label>
                                    <EditorReact
                                      value={values.microBrandsHighlight}
                                      onChange={val =>
                                        setFieldValue("microBrandsHighlight", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="microBrandsHighlight"
                                    />
                                  </Col>
                                </Row>

                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="callToAction"
                                    >
                                      Call To Action
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="callToAction"
                                      type="text"
                                      placeholder="Enter call to action"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="callToAction"
                                    />
                                  </Col>
                                </Row>

                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="canonicalUrl"
                                    >
                                      Canonical URL
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="canonicalUrl"
                                      type="url"
                                      placeholder="Enter canonical URL"
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="canonicalUrl"
                                    />
                                  </Col>
                                </Row>

                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="noIndex"
                                    >
                                      No Index
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="noIndex"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "noIndex",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="false">False</option>
                                      <option value="true">True</option>
                                    </Field>
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="noIndex"
                                    />
                                  </Col>

                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="contentMachineTranslated"
                                    >
                                      Content Machine Translated
                                    </Label>
                                    <Field
                                      as={Input}
                                      name="contentMachineTranslated"
                                      type="select"
                                      className="form-select"
                                      onChange={e =>
                                        setFieldValue(
                                          "contentMachineTranslated",
                                          e.target.value === "true"
                                        )
                                      }
                                    >
                                      <option value="false">False</option>
                                      <option value="true">True</option>
                                    </Field>
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="contentMachineTranslated"
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </TabPane>

                          {/* summary and short summary */}
                          <TabPane tabId={6}>
                            <Row>
                              <Col>
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="summary"
                                    >
                                      Summary{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <EditorReact
                                      value={values.summary}
                                      onChange={val =>
                                        setFieldValue("summary", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="summary"
                                    />
                                  </Col>{" "}
                                </Row>
                                <Row>
                                  <Col className="mb-3 ">
                                    <Label
                                      className="form-label"
                                      htmlFor="shortSummary"
                                    >
                                      Short Summary{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <EditorReact
                                      value={values.shortSummary}
                                      onChange={val =>
                                        setFieldValue("shortSummary", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="shortSummary"
                                    />
                                  </Col>
                                </Row>
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="inclusions"
                                    >
                                      Inclusions{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <EditorReact
                                      value={values.inclusions}
                                      onChange={val =>
                                        setFieldValue("inclusions", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="inclusions"
                                    />
                                  </Col>
                                </Row>
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="exclusions"
                                    >
                                      Exclusions{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Label>
                                    <EditorReact
                                      value={values.exclusions}
                                      onChange={val =>
                                        setFieldValue("exclusions", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="exclusions"
                                    />
                                  </Col>
                                </Row>
                                <Row>
                                  <Col className="mb-3">
                                    <Label
                                      className="form-label"
                                      htmlFor="itinerary"
                                    >
                                      Itinerary
                                    </Label>
                                    <EditorReact
                                      value={values.itinerary}
                                      onChange={val =>
                                        setFieldValue("itinerary", val)
                                      }
                                    />
                                    <ErrorMessage
                                      component={"span"}
                                      className="text-danger"
                                      name="itinerary"
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </TabPane>
                          <TabPane tabId={7}>
                            {/* Media -productImages, safetyImages and safetyVideos */}
                            <h5>Tour Images</h5>
                            <TourImages />
                          </TabPane>

                          {/* Product Images */}
                          <TabPane tabId={8}>
                            <h5>Product Images</h5>
                            <ProductImage />{" "}
                          </TabPane>

                          {/* Safety Images */}
                          <TabPane tabId={9}>
                            {" "}
                            <h5>Safety Images</h5>
                            <SafetyImage />
                          </TabPane>

                          {/* Safety Videos */}
                          <TabPane tabId={10}>
                            {" "}
                            <h5>Safety Videos</h5>
                            <SafetyVideo />
                          </TabPane>
                        </TabContent>
                      </div>

                      {/* button for next and previous */}
                      <div className="actions clearfix">
                        <ul>
                          <li>
                            <Button
                              onClick={() => setModal(false)}
                              className="btn btn-secondary "
                            >
                              Cancel
                            </Button>
                          </li>
                          <li
                            className={
                              activeTab === 1 ? "previous disabled" : "previous"
                            }
                          >
                            <Link
                              to="#"
                              onClick={() => {
                                toggleTab(activeTab - 1)
                              }}
                            >
                              Previous
                            </Link>
                          </li>
                          <li
                            className={
                              activeTab === 10 ? "next d-none" : "next"
                            }
                          >
                            <Link
                              to="#"
                              onClick={() => {
                                toggleTab(activeTab + 1)
                              }}
                            >
                              Next
                            </Link>
                          </li>
                          {activeTab === 10 && (
                            <li className="next">
                              <FormikSubmitButton
                                isEdit={isEdit}
                                setModal={setModal}
                              />
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  )
}
