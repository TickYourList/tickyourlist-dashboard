import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Container,
  Row,
  Col,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
  Card,
  CardBody,
  FormGroup,
} from "reactstrap"
import {
  addCollections as onAddCollections,
  getCollectionById as onGetCollectionById,
  updateCollection as onUpdateCollection,
  resetAddCollectionState as onResetAddCollectionState,
} from "store/product-management/collections/actions"
import { getCities as onGetCityList } from "../../../store/travelCity/action"

import { useFormik } from "formik"
import * as Yup from "yup"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"
// import { showToastError, showToastSuccess } from "helpers/toastBuilder";

const AddCollectionForm = () => {
  const defaultUrlSlugs = {
    EN: "",
    ES: "",
    FR: "",
    IT: "",
    DE: "",
    PT: "",
    NL: "",
    PL: "",
    // DA: "",
    // NO: "",
    // RO: "",
    // RU: "",
    // SV: "",
    // TR: "",
  }
  const languageOptions = [
    { value: "EN", label: "English" },
    { value: "ES", label: "Spanish" },
    { value: "FR", label: "French" },
    { value: "IT", label: "Italian" },
    { value: "DE", label: "German" },
    { value: "PT", label: "Portuguese" },
    { value: "RU", label: "Russian" },
    { value: "NL", label: "Dutch" },
    { value: "PL", label: "Polish" },
    // { value: "DA", label: "Danish" },
    // { value: "NO", label: "Norwegian" },
    // { value: "RO", label: "Romanian" },
    // { value: "SV", label: "Swedish" },
    // { value: "TR", label: "Turkish" },
  ]
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [cityList, setCityList] = useState([])
  const { collectionId, language } = useParams()

  const [customLanguages, setCustomLanguages] = useState([])
  // State for the input field where user types the new language code
  const [newCustomLangCode, setNewCustomLangCode] = useState("")

  useEffect(() => {
    dispatch(onGetCityList())
  }, [dispatch])
  const { pm_citylists } = useSelector(state => ({
    pm_citylists: state.travelCity.cities
  }));
  console.log("citiescities ", pm_citylists);
  const { singleCollection, addSuccess, error, loading, submitting } =
    useSelector(state => state.pmCollection)

  useEffect(() => {
    if (singleCollection) {
      console.log("✅ singleCollection Loaded:", singleCollection)
    }
  }, [singleCollection])

  useEffect(() => {
    if (addSuccess) {
      navigate("/collections")
      dispatch(onResetAddCollectionState())
    }
  }, [addSuccess])

  useEffect(() => {
    if (collectionId) {
      dispatch(onGetCollectionById({ collectionId, language }))
    }
  }, [collectionId, dispatch])

  if (error && error.message) {
    console.log(error)
  }
  useEffect(() => {
    if (pm_citylists && pm_citylists.length > 0) {
      setCityList(pm_citylists)
    }
  }, [pm_citylists])

  const tagOptions = [
    { value: "Adventure", label: "Adventure" },
    { value: "Family", label: "Family" },
    { value: "Luxury", label: "Luxury" },
  ]

  const booleanOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ]
  // =================================================================
  // ## STEP 1: Format data for the Frontend (On Load)
  // =================================================================
  // Convert string arrays from the API into {value, label} objects for react-select.

  const initialTags = singleCollection?.tags
    ? singleCollection.tags.map(tag => ({ value: tag, label: tag }))
    : []

  const initialSupportedLanguages = singleCollection?.supportedLanguages
    ? singleCollection.supportedLanguages
        .map(langCode =>
          languageOptions.find(option => option.value === langCode)
        )
        .filter(Boolean) // Filter out any nulls if a code isn't found
    : []

  const formik = useFormik({
    enableReinitialize: true, // Important to allow initialValues update
    initialValues: {
      name: singleCollection?.name || "",
      displayName: singleCollection?.displayName || "",
      cityCode: singleCollection?.cityCode || "",
      collectionType: singleCollection?.collectionType || "",
      urlSlug: singleCollection?.urlSlug || "",
      title: singleCollection?.title || "",
      heading: singleCollection?.heading || "",
      subtext: singleCollection?.subtext || "",
      metaDescription: singleCollection?.metaDescription || "",
      canonicalUrl: singleCollection?.canonicalUrl || "",
      language: singleCollection?.language || "SP",
      supportedLanguages: initialSupportedLanguages,
      urlSlugs: { ...defaultUrlSlugs, ...singleCollection?.urlSlugs },
      ratingsInfo: {
        ratingsCount: singleCollection?.ratingsInfo?.ratingsCount || "",
        averageRating: singleCollection?.ratingsInfo?.averageRating || "",
      },
      tags: initialTags,
      primaryParentId: singleCollection?.primaryParentId || "",
      parentIds: singleCollection?.parentIds || [],
      childrenIds: singleCollection?.childrenIds || [],
      experienceCount: singleCollection?.experienceCount || 0,
      poiId: singleCollection?.poiId || "",
      distanceInKms: singleCollection?.distanceInKms || "",
      pageTitle: singleCollection?.pageTitle || "",
      category: {
        id: singleCollection?.category?.id || "",
        displayName: singleCollection?.category?.displayName || "",
      },
      subcategory: {
        id: singleCollection?.subcategory?.id || "",
        displayName: singleCollection?.subcategory?.displayName || "",
      },
      heroMedia: singleCollection?.heroMedia || null,
      cardMedia: singleCollection?.cardMedia || null,
      videos: singleCollection?.videos || null,
      startingPrice: {
        originalListingPrice:
          singleCollection?.startingPrice?.originalListingPrice || "",
        listingPrice: singleCollection?.startingPrice?.listingPrice || "",
        currency: singleCollection?.startingPrice?.currency || "",
        tourGroupId: singleCollection?.startingPrice?.tourGroupId || "",
        bestDiscount: singleCollection?.startingPrice?.bestDiscount || "",
      },
      active: singleCollection?.active ?? true,

      useOldDesign: singleCollection?.useOldDesign || false,
      noIndex: singleCollection?.noIndex || false,
      super: singleCollection?.super || false,
      longFormDescription: singleCollection?.longFormDescription || "",
      secondaryCities: singleCollection?.secondaryCities || [],
      microBrandInfo: singleCollection?.microBrandInfo || {},
      personaAffinityTags: singleCollection?.personaAffinityTags || [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      displayName: Yup.string().required("Required"),
      cityCode: Yup.string().when("collectionType", {
        is: "city", // IF collectionType is "city"
        then: schema =>
          schema.required("City is required for this collection type."),
        otherwise: schema => schema.nullable(), // OTHERWISE it's optional
      }),
      collectionType: Yup.string().required("Required"),
      urlSlug: Yup.string().required("Required"),
      title: Yup.string().required("Required"),
      heading: Yup.string().required("Required"),
      subtext: Yup.string().required("Required"),
      metaDescription: Yup.string().required("Required"),
      canonicalUrl: Yup.string().url("Invalid URL").nullable(),
      tags: Yup.array().min(1, "At least one tag is required"),
      supportedLanguages: Yup.array().min(
        1,
        "At least one language is required"
      ),
      urlSlugs: Yup.object().shape(
        Object.keys(defaultUrlSlugs).reduce((acc, lang) => {
          // Make each language slug a required string
          acc[lang] = Yup.string().required(
            `Slug for ${lang.toUpperCase()} is required.`
          )
          return acc
        }, {})
      ),
      ratingsInfo: Yup.object().shape({
        ratingsCount: Yup.number().min(0).required("Ratings count is required"),
        averageRating: Yup.number()
          .min(0)
          .max(5, "Max 5")
          .required("Average rating is required"),
      }),
      distanceInKms: Yup.number().min(0).nullable(),
      pageTitle: Yup.string().nullable(),
      category: Yup.object().shape({
        id: Yup.number().nullable(),
        displayName: Yup.string().nullable(),
      }),
      subcategory: Yup.object().shape({
        id: Yup.number().nullable(),
        displayName: Yup.string().nullable(),
      }),
      heroMedia: Yup.mixed().required("Hero image is required"),
      cardMedia: Yup.mixed().required("Card image is required"),
      videos: Yup.mixed().required("Videos is required"),
      poiId: Yup.number().min(0).required("POI ID is required"),
      active: Yup.boolean(),

      useOldDesign: Yup.boolean(),
      noIndex: Yup.boolean(),
      super: Yup.boolean(),
      primaryParentId: Yup.number().required("Primary Parent ID is required"),
      parentIds: Yup.array().min(1, "At least one Parent ID is required"),
      childrenIds: Yup.array().min(1, "At least one Child ID is required"),
      startingPrice: Yup.object().shape({
        originalListingPrice: Yup.number().min(0).nullable(),
        listingPrice: Yup.number().min(0).nullable(),
        currency: Yup.string().max(3, "Max 3 chars").nullable(),
        tourGroupId: Yup.number().nullable(),
        bestDiscount: Yup.number().min(0).max(100).nullable(),
      }),
      secondaryCities: Yup.array(),
    }),
    onSubmit: values => {
      const cleanedValues = { ...values }

      // Convert {value, label} objects back into a simple array of strings.
      cleanedValues.tags = (cleanedValues.tags || []).map(tag => tag.value)
      cleanedValues.supportedLanguages = (
        cleanedValues.supportedLanguages || []
      ).map(lang => lang.value)

      // ✅ Clean ID arrays - convert to integers
      ;["parentIds", "childrenIds"].forEach(field => {
        cleanedValues[field] = (cleanedValues[field] || [])
          .filter(id => id !== "" && id !== null && id !== undefined)
          .map(id => parseInt(id, 10))
      })

      // ✅ Clean numeric fields - ensure integers or null
      ;["distanceInKms", "experienceCount", "poiId", "primaryParentId"].forEach(
        field => {
          if (
            cleanedValues[field] !== "" &&
            cleanedValues[field] !== null &&
            cleanedValues[field] !== undefined
          ) {
            cleanedValues[field] = parseInt(cleanedValues[field], 10)
          } else {
            cleanedValues[field] = null
          }
        }
      )

      // ✅ Separate media files
      const { cityCode, heroMedia, cardMedia, videos, ...otherValues } =
        cleanedValues

      const formData = new FormData()
      formData.append("data", JSON.stringify(otherValues))
      if (heroMedia) formData.append("heroMedia", heroMedia)
      if (cardMedia) formData.append("cardMedia", cardMedia)
      if (videos) formData.append("videos", videos)

      // ✅ Submit
      if (collectionId && language) {
        dispatch(onUpdateCollection({ collectionId, formData }))
        formik.resetForm() // reset after update
      } else {
        dispatch(onAddCollections({ cityCode, formData }))
        formik.resetForm() // reset after add
       
      }

      console.log("✅ Final Cleaned Payload:", {
        collectionId,
        cityCode,
        otherValues,
      })
    },
  })

  const selectedCityObject = React.useMemo(() => {
    if (!formik.values.cityCode || cityList.length === 0) {
      return null
    }
    // Find the city object that matches the cityCode stored in Formik
    return (
      cityList
        .map(city => ({ value: city.cityCode, label: city.displayName }))
        .find(option => option.value === formik.values.cityCode) || null
    )
  }, [formik.values.cityCode, cityList])
  console.log("VALIDATION ERRORS:", formik.errors)

  // This effect runs when the collection data is loaded

  // Add these handler functions
  const handleAddCustomLanguage = () => {
    const code = newCustomLangCode.trim().toUpperCase()
    if (!code) return // Ignore if empty

    // Check for duplicates
    const allLangCodes = [
      ...Object.keys(defaultUrlSlugs),
      ...customLanguages.map(l => l.code),
    ]
    if (allLangCodes.includes(code)) {
      alert(`Language code "${code}" already exists.`)
      return
    }

    // Add the new language and clear the input
    setCustomLanguages(prev => [...prev, { id: Date.now(), code }])
    formik.setFieldValue(`urlSlugs.${code}`, "")
    setNewCustomLangCode("")
  }

  const handleRemoveCustomLanguage = idToRemove => {
    const langToRemove = customLanguages.find(l => l.id === idToRemove)
    if (!langToRemove) return

    // Remove from the custom languages list
    setCustomLanguages(prev => prev.filter(l => l.id !== idToRemove))

    // Also remove the key from Formik's state
    const newSlugs = { ...formik.values.urlSlugs }
    delete newSlugs[langToRemove.code]
    formik.setFieldValue("urlSlugs", newSlugs)
  }
  useEffect(() => {
    if (singleCollection?.urlSlugs) {
      const defaultLangKeys = Object.keys(defaultUrlSlugs)
      // Find any slug keys from the API that are not in our default list
      const customKeys = Object.keys(singleCollection.urlSlugs).filter(
        key => !defaultLangKeys.includes(key)
      )
      // Set the custom languages state so they render on the screen
      setCustomLanguages(customKeys.map(code => ({ id: Math.random(), code })))
    } else {
      // For a new form, start with no custom languages
      setCustomLanguages([])
    }
  }, [singleCollection])

  //loading
  if (loading && collectionId) {
    return (
      <Container fluid className="p-4 mt-5">
        <h4 className="my-4">Loading data in the edit form...</h4>
      </Container>
    )
  }
  return (
    <React.Fragment>
      <Container fluid className="p-4 mt-5">
        <h4 className="my-4">Add New Travel Collection</h4>
        <Card>
          <CardBody>
            <Form onSubmit={formik.handleSubmit}>
              <Row>
                <Col md="6" className="mb-3">
                  <Label>Name*</Label>
                  <Input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.name && !!formik.errors.name}
                    placeholder="e.g. Paris Collection"
                  />
                  <FormFeedback>{formik.errors.name}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Display Name*</Label>
                  <Input
                    name="displayName"
                    placeholder="e.g. Paris"
                    value={formik.values.displayName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.displayName && !!formik.errors.displayName
                    }
                  />
                  <FormFeedback>{formik.errors.displayName}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Collection Type*</Label>
                  <Select
                    name="collectionType"
                    value={[
                      { value: "city", label: "City" },
                      { value: "worldwide", label: "Worldwide" },
                    ].find(
                      option => option.value === formik.values.collectionType
                    )}
                    onChange={selectedOption =>
                      formik.setFieldValue(
                        "collectionType",
                        selectedOption.value
                      )
                    }
                    onBlur={() =>
                      formik.setFieldTouched("collectionType", true)
                    }
                    options={[
                      { value: "city", label: "City" },
                      { value: "worldwide", label: "Worldwide" },
                    ]}
                    classNamePrefix={
                      formik.touched.collectionType &&
                      formik.errors.collectionType
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.collectionType &&
                    formik.errors.collectionType && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.collectionType}
                      </div>
                    )}
                </Col>
                {formik.values.collectionType === "city" && (
                  <Col md="6" className="mb-3">
                    <Label>City Code*</Label>
                    <Select
                      name="cityCode"
                      // Use the safely derived object here
                      value={selectedCityObject}
                      // Defensive mapping to prevent errors from bad data
                      options={cityList
                        .filter(city => city.cityCode && city.displayName)
                        .map(city => ({
                          value: city.cityCode,
                          label: city.displayName,
                        }))}
                      onChange={selectedOption =>
                        formik.setFieldValue(
                          "cityCode",
                          selectedOption?.value || ""
                        )
                      }
                      onBlur={() => formik.setFieldTouched("cityCode", true)}
                    />
                    {formik.touched.cityCode && formik.errors.cityCode && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.cityCode}
                      </div>
                    )}
                  </Col>
                )}
                <Col md="6" className="mb-3">
                  <Label>Url Slug*</Label>
                  <Input
                    name="urlSlug"
                    placeholder="e.g. /paris-collection-102/"
                    value={formik.values.urlSlug}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.urlSlug && !!formik.errors.urlSlug}
                  />
                  <FormFeedback>{formik.errors.urlSlug}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Title*</Label>
                  <Input
                    name="title"
                    placeholder="e.g. Explore the Best of Paris"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.title && !!formik.errors.title}
                  />
                  <FormFeedback>{formik.errors.title}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Heading*</Label>
                  <Input
                    name="heading"
                    placeholder="e.g. Discover Paris"
                    value={formik.values.heading}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.heading && !!formik.errors.heading}
                  />
                  <FormFeedback>{formik.errors.heading}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Sub Text*</Label>
                  <Input
                    name="subtext"
                    placeholder="e.g. Discover Paris"
                    value={formik.values.subtext}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.subtext && !!formik.errors.subtext}
                  />
                  <FormFeedback>{formik.errors.subtext}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Meta Description*</Label>
                  <Input
                    type="textarea"
                    placeholder="e.g. Discover Paris"
                    rows="3"
                    name="metaDescription"
                    value={formik.values.metaDescription}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.metaDescription &&
                      !!formik.errors.metaDescription
                    }
                  />
                  <FormFeedback>{formik.errors.metaDescription}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Tags*</Label>
                  <CreatableSelect
                    isMulti
                    name="tags"
                    value={formik.values.tags}
                    options={tagOptions}
                    onChange={selected =>
                      formik.setFieldValue("tags", selected)
                    }
                    onBlur={() => formik.setFieldTouched("tags", true)}
                    placeholder="Type and press enter to create tag"
                    classNamePrefix={
                      formik.touched.tags && formik.errors.tags
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {formik.touched.tags && formik.errors.tags && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.tags}
                    </div>
                  )}
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Canonical Url</Label>
                  <Input
                    name="canonicalUrl"
                    placeholder="e.g. https://example.com/paris-collection-102/"
                    value={formik.values.canonicalUrl}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.canonicalUrl &&
                      !!formik.errors.canonicalUrl
                    }
                  />
                  <FormFeedback>{formik.errors.canonicalUrl}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Supported Languages*</Label>
                  <Select
                    isMulti
                    name="supportedLanguages"
                    options={languageOptions}
                    classNamePrefix="select"
                    value={formik.values.supportedLanguages}
                    onChange={selected =>
                      formik.setFieldValue("supportedLanguages", selected)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("supportedLanguages", true)
                    }
                    invalid={
                      formik.touched.supportedLanguages &&
                      !!formik.errors.supportedLanguages
                    }
                  />
                  {formik.touched.supportedLanguages &&
                  formik.errors.supportedLanguages ? (
                    <div className="invalid-feedback d-block">
                      {formik.errors.supportedLanguages}
                    </div>
                  ) : null}
                </Col>

                <Col md="12" className="mb-3">
                  <Label className="mb-2 fw-bold">URL Slugs by Language</Label>
                  <Row>
                    {/* Part 1: Render the 14 default language inputs */}
                    {Object.keys(defaultUrlSlugs).map(lang => (
                      <Col md="6" key={lang} className="mb-2">
                        <FormGroup>
                          <Label
                            for={`urlSlugs-${lang}`}
                          >{`${lang.toUpperCase()}*`}</Label>
                          <Input
                            id={`urlSlugs-${lang}`}
                            name={`urlSlugs.${lang}`}
                            value={formik.values.urlSlugs[lang] || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              !!(
                                formik.touched.urlSlugs?.[lang] &&
                                formik.errors.urlSlugs?.[lang]
                              )
                            }
                          />
                          <FormFeedback>
                            {formik.errors.urlSlugs?.[lang]}
                          </FormFeedback>
                        </FormGroup>
                      </Col>
                    ))}

                    {/* Part 2: Render any custom language inputs */}
                    {customLanguages.map(customLang => (
                      <Col md="6" key={customLang.id} className="mb-2">
                        <FormGroup>
                          <Label for={`urlSlugs-${customLang.code}`}>
                            {`${customLang.code.toUpperCase()}*`}
                            <Button
                              type="button"
                              size="sm"
                              color="link"
                              className="text-danger p-0 ms-2 "
                              onClick={() =>
                                handleRemoveCustomLanguage(customLang.id)
                              }
                              title="Remove Custom Language"
                            >
                              Remove
                            </Button>
                          </Label>
                          <Input
                            id={`urlSlugs-${customLang.code}`}
                            name={`urlSlugs.${customLang.code}`}
                            value={
                              formik.values.urlSlugs[customLang.code] || ""
                            }
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              !!(
                                formik.touched.urlSlugs?.[customLang.code] &&
                                formik.errors.urlSlugs?.[customLang.code]
                              )
                            }
                          />
                          <FormFeedback>
                            {formik.errors.urlSlugs?.[customLang.code]}
                          </FormFeedback>
                        </FormGroup>
                      </Col>
                    ))}
                  </Row>

                  {/* Part 3: UI for adding a new custom language */}
                  <hr className="my-3" />
                  <Row className="align-items-center">
                    <Label sm={2}>Add Custom Language</Label>
                    <Col sm={3}>
                      <Input
                        type="text"
                        placeholder="Enter 2-letter code (e.g., HI)"
                        value={newCustomLangCode}
                        onChange={e => setNewCustomLangCode(e.target.value)}
                        maxLength={2}
                      />
                    </Col>
                    <Col>
                      <Button
                        type="button"
                        outline
                        onClick={handleAddCustomLanguage}
                      >
                        + Add
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col md="12">
                  <h5 className="mb-3 mt-2">Rating Info</h5>
                </Col>
                <Col md="6" className="mb-3">
                  <FormGroup>
                    <Label>Ratings Count*</Label>
                    <Input
                      name="ratingsInfo.ratingsCount" // Use dot notation
                      type="number"
                      placeholder="e.g. 100"
                      value={formik.values.ratingsInfo.ratingsCount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.ratingsInfo?.ratingsCount &&
                        !!formik.errors.ratingsInfo?.ratingsCount
                      }
                    />
                    <FormFeedback>
                      {formik.errors.ratingsInfo?.ratingsCount}
                    </FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="6" className="mb-3">
                  <FormGroup>
                    <Label>Average Rating*</Label>
                    <Input
                      name="ratingsInfo.averageRating" // Use dot notation
                      type="number"
                      placeholder="e.g. 4.5"
                      step="0.1"
                      value={formik.values.ratingsInfo.averageRating}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.ratingsInfo?.averageRating &&
                        !!formik.errors.ratingsInfo?.averageRating
                      }
                    />
                    <FormFeedback>
                      {formik.errors.ratingsInfo?.averageRating}
                    </FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="4" className="mb-3">
                  <Label>Distance In KMs</Label>
                  <Input
                    name="distanceInKms"
                    type="number"
                    placeholder="e.g. 10"
                    value={formik.values.distanceInKms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.distanceInKms &&
                      !!formik.errors.distanceInKms
                    }
                  />
                  <FormFeedback>{formik.errors.distanceInKms}</FormFeedback>
                </Col>
                <Col md="4" className="mb-3">
                  <Label>POI ID*</Label>
                  <Input
                    name="poiId"
                    type="number"
                    placeholder="e.g. 12345"
                    value={formik.values.poiId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={formik.touched.poiId && !!formik.errors.poiId}
                  />
                  <FormFeedback>{formik.errors.poiId}</FormFeedback>
                </Col>
                <Col md="4" className="mb-3">
                  <Label>Experience Count</Label>
                  <Input
                    name="experienceCount"
                    placeholder="e.g. 10"
                    type="number"
                    value={formik.values.experienceCount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.experienceCount &&
                      !!formik.errors.experienceCount
                    }
                  />
                  <FormFeedback>{formik.errors.experienceCount}</FormFeedback>
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Page Title</Label>
                  <Input
                    name="pageTitle"
                    placeholder="e.g. Explore Paris - Top Attractions"
                    value={formik.values.pageTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.pageTitle && !!formik.errors.pageTitle
                    }
                  />
                  <FormFeedback>{formik.errors.pageTitle}</FormFeedback>
                </Col>
                <Col md="3" className="mb-3">
                  <Label>Category ID</Label>
                  <Input
                    name="category.id"
                    placeholder="e.g. 1"
                    type="number"
                    value={formik.values.category.id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.category?.id &&
                      !!formik.errors.category?.id
                    }
                  />
                  <FormFeedback>{formik.errors.category?.id}</FormFeedback>
                </Col>
                <Col md="3" className="mb-3">
                  <Label>Category Name</Label>
                  <Input
                    name="category.displayName"
                    placeholder="e.g. Paris Attractions"
                    value={formik.values.category.displayName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.category?.displayName &&
                      !!formik.errors.category?.displayName
                    }
                  />
                  <FormFeedback>
                    {formik.errors.category?.displayName}
                  </FormFeedback>
                </Col>
                {/* --- subcategory Fields --- */}
                <Col md="3" className="mb-3">
                  <Label>subcategory ID</Label>
                  <Input
                    name="subcategory.id"
                    placeholder="e.g. 2"
                    type="number"
                    value={formik.values.subcategory.id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.subcategory?.id &&
                      !!formik.errors.subcategory?.id
                    }
                  />
                  <FormFeedback>{formik.errors.subcategory?.id}</FormFeedback>
                </Col>
                <Col md="3" className="mb-3">
                  <Label>subcategory Name</Label>
                  <Input
                    name="subcategory.displayName"
                    placeholder="e.g. Paris Museums"
                    value={formik.values.subcategory.displayName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.subcategory?.displayName &&
                      !!formik.errors.subcategory?.displayName
                    }
                  />
                  <FormFeedback>
                    {formik.errors.subcategory?.displayName}
                  </FormFeedback>
                </Col>
                <Col md="12" className="mb-3">
                  {/* Conditionally render a split layout in edit mode */}
                  {collectionId && singleCollection?.heroImageUrl ? (
                    <Row>
                      <Col md="6">
                        <Label>Current Hero Image</Label>
                        <div>
                          <img
                            src={singleCollection.heroImageUrl}
                            alt="Current Hero Media"
                            className="img-thumbnail img-fluid"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      </Col>
                      <Col md="6">
                        <Label>Upload New Hero Image (Optional)</Label>
                        <Input
                          type="file"
                          name="heroMedia"
                          accept="image/*"
                          onChange={e => {
                            formik.setFieldValue(
                              "heroMedia",
                              e.currentTarget.files[0]
                            )
                          }}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.heroMedia &&
                          formik.errors.heroMedia && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.heroMedia}
                            </div>
                          )}
                      </Col>
                    </Row>
                  ) : (
                    // Default full-width layout for adding a new collection
                    <>
                      <Label>Hero Image*</Label>
                      <Input
                        type="file"
                        name="heroMedia"
                        accept="image/*"
                        onChange={e => {
                          formik.setFieldValue(
                            "heroMedia",
                            e.currentTarget.files[0]
                          )
                        }}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.heroMedia && formik.errors.heroMedia && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.heroMedia}
                        </div>
                      )}
                    </>
                  )}
                </Col>

                <Col md="12" className="mb-3">
                  {/* Conditionally render a split layout in edit mode */}
                  {collectionId && singleCollection?.cardImageUrl ? (
                    <Row>
                      <Col md="6">
                        <Label>Current Card Image</Label>
                        <div>
                          <img
                            src={singleCollection.cardImageUrl}
                            alt="Current Card Media"
                            className="img-thumbnail img-fluid"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      </Col>
                      <Col md="6">
                        <Label>Upload New Card Image (Optional)</Label>
                        <Input
                          type="file"
                          name="cardMedia"
                          accept="image/*"
                          onChange={e => {
                            formik.setFieldValue(
                              "cardMedia",
                              e.currentTarget.files[0]
                            )
                          }}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.cardMedia &&
                          formik.errors.cardMedia && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.cardMedia}
                            </div>
                          )}
                      </Col>
                    </Row>
                  ) : (
                    // Default full-width layout for adding a new collection
                    <>
                      <Label>Card Image*</Label>
                      <Input
                        type="file"
                        name="cardMedia"
                        accept="image/*"
                        onChange={e => {
                          formik.setFieldValue(
                            "cardMedia",
                            e.currentTarget.files[0]
                          )
                        }}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.cardMedia && formik.errors.cardMedia && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.cardMedia}
                        </div>
                      )}
                    </>
                  )}
                </Col>

                <Col md="12" className="mb-3">
                  {/* Conditionally render a split layout in edit mode */}
                  {collectionId && singleCollection?.collectionVideo ? (
                    <Row>
                      <Col md="6">
                        <Label>Current Video</Label>
                        <div>
                          <video
                            src={singleCollection.collectionVideo}
                            controls
                            className="img-thumbnail"
                            style={{ maxWidth: "100%", maxHeight: "200px" }}
                          />
                        </div>
                      </Col>
                      <Col md="6">
                        <Label>Upload New Video (Optional)</Label>
                        <Input
                          type="file"
                          name="videos"
                          accept="video/*"
                          onChange={e => {
                            formik.setFieldValue(
                              "videos",
                              e.currentTarget.files[0]
                            )
                          }}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.videos && formik.errors.videos && (
                          <div className="invalid-feedback d-block">
                            {formik.errors.videos}
                          </div>
                        )}
                      </Col>
                    </Row>
                  ) : (
                    // Default full-width layout for adding a new collection
                    <>
                      <Label>Video*</Label>
                      <Input
                        type="file"
                        name="videos"
                        accept="video/*"
                        onChange={e => {
                          formik.setFieldValue(
                            "videos",
                            e.currentTarget.files[0]
                          )
                        }}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.videos && formik.errors.videos && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.videos}
                        </div>
                      )}
                    </>
                  )}
                </Col>
                <Col md={12}>
                  <h5 className="mb-3 mt-2">Starting Price</h5>
                </Col>
                <Col md={4} className="mb-3">
                  <Label>Listing Price</Label>
                  <Input
                    name="startingPrice.listingPrice"
                    type="number"
                    placeholder="e.g., 1000"
                    value={formik.values.startingPrice.listingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Label>Original Price</Label>
                  <Input
                    name="startingPrice.originalListingPrice"
                    type="number"
                    placeholder="e.g., 1200"
                    value={formik.values.startingPrice.originalListingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Label>Currency</Label>
                  <Input
                    name="startingPrice.currency"
                    type="text"
                    placeholder="e.g., INR"
                    value={formik.values.startingPrice.currency}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Label>Tour Group ID</Label>
                  <Input
                    name="startingPrice.tourGroupId"
                    type="number"
                    placeholder="e.g., 12345"
                    value={formik.values.startingPrice.tourGroupId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Label>Best Discount (%)</Label>
                  <Input
                    name="startingPrice.bestDiscount"
                    type="number"
                    placeholder="e.g., 10 for 10%"
                    value={formik.values.startingPrice.bestDiscount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md="4" className="mb-3">
                  <Label>Primary Parent ID*</Label>
                  <Input
                    name="primaryParentId"
                    type="number"
                    placeholder="e.g., 100"
                    value={formik.values.primaryParentId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.primaryParentId &&
                      !!formik.errors.primaryParentId
                    }
                  />
                  <FormFeedback>{formik.errors.primaryParentId}</FormFeedback>
                </Col>
                <Col md="4" className="mb-3">
                  <Label>Parent IDs (comma-separated)*</Label>
                  <Input
                    name="parentIds"
                    type="text"
                    placeholder="e.g., 101, 102, 103"
                    value={formik.values.parentIds.join(", ")}
                    onChange={e =>
                      formik.setFieldValue(
                        "parentIds",
                        e.target.value.split(",").map(s => s.trim())
                      )
                    }
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.parentIds && !!formik.errors.parentIds
                    }
                  />
                  <FormFeedback>{formik.errors.parentIds}</FormFeedback>
                </Col>
                <Col md="4" className="mb-3">
                  <Label>Children IDs (comma-separated)*</Label>
                  <Input
                    name="childrenIds"
                    type="text"
                    placeholder="e.g., 201, 202"
                    value={formik.values.childrenIds.join(", ")}
                    onChange={e =>
                      formik.setFieldValue(
                        "childrenIds",
                        e.target.value.split(",").map(s => s.trim())
                      )
                    }
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.childrenIds && !!formik.errors.childrenIds
                    }
                  />
                  <FormFeedback>{formik.errors.childrenIds}</FormFeedback>
                </Col>
                {/* --- Required Checkboxes --- */}
                <Col xs="12">
                  <Row>
                    <Col md="3" className="mb-3">
                      <Label htmlFor="active">Active</Label>
                      <Select
                        name="active"
                        id="active"
                        options={booleanOptions}
                        value={booleanOptions.find(
                          option => option.value === formik.values.active
                        )}
                        onChange={selectedOption => {
                          formik.setFieldValue("active", selectedOption.value)
                        }}
                        onBlur={() => formik.setFieldTouched("active", true)}
                      />
                    </Col>

                    <Col md="3" className="mb-3">
                      <Label htmlFor="useOldDesign">Use Old Design</Label>
                      <Select
                        name="useOldDesign"
                        id="useOldDesign"
                        options={booleanOptions}
                        value={booleanOptions.find(
                          option => option.value === formik.values.useOldDesign
                        )}
                        onChange={selectedOption => {
                          formik.setFieldValue(
                            "useOldDesign",
                            selectedOption.value
                          )
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("useOldDesign", true)
                        }
                      />
                    </Col>

                    <Col md="3" className="mb-3">
                      <Label htmlFor="super">Super Collection</Label>
                      <Select
                        name="super"
                        id="super"
                        options={booleanOptions}
                        value={booleanOptions.find(
                          option => option.value === formik.values.super
                        )}
                        onChange={selectedOption => {
                          formik.setFieldValue("super", selectedOption.value)
                        }}
                        onBlur={() => formik.setFieldTouched("super", true)}
                      />
                    </Col>

                    <Col md="3" className="mb-3">
                      <Label htmlFor="noIndex">No Index</Label>
                      <Select
                        name="noIndex"
                        id="noIndex"
                        options={booleanOptions}
                        value={booleanOptions.find(
                          option => option.value === formik.values.noIndex
                        )}
                        onChange={selectedOption => {
                          formik.setFieldValue("noIndex", selectedOption.value)
                        }}
                        onBlur={() => formik.setFieldTouched("noIndex", true)}
                      />
                    </Col>
                  </Row>
                </Col>
                {/* --- Language and Secondary Cities --- */}

                <Col md="6" className="mb-3">
                  <Label>Default Language*</Label>
                  <Select
                    name="language"
                    value={languageOptions.find(
                      option => option.value === formik.values.language
                    )}
                    onChange={selectedOption =>
                      formik.setFieldValue("language", selectedOption.value)
                    }
                    onBlur={() => formik.setFieldTouched("language", true)}
                    options={languageOptions}
                    classNamePrefix={
                      formik.touched.language && formik.errors.language
                        ? "is-invalid"
                        : ""
                    }
                    placeholder="Select Language"
                  />
                  {formik.touched.language && formik.errors.language && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.language}
                    </div>
                  )}
                </Col>
                <Col md="6" className="mb-3">
                  <Label>Secondary Cities (comma-separated)</Label>
                  <Input
                    name="secondaryCities"
                    type="text"
                    placeholder="e.g., LAX, JFK"
                    value={formik.values.secondaryCities.join(", ")}
                    onChange={e =>
                      formik.setFieldValue(
                        "secondaryCities",
                        e.target.value.split(",").map(s => s.trim())
                      )
                    }
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.secondaryCities &&
                      !!formik.errors.secondaryCities
                    }
                  />
                  <FormFeedback>{formik.errors.secondaryCities}</FormFeedback>
                </Col>
                {/* --- Long Form Description --- */}
                <Col md="12" className="mb-3">
                  <Label>Long Form Description</Label>
                  <Input
                    type="textarea"
                    name="longFormDescription"
                    rows="5"
                    value={formik.values.longFormDescription}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Col>
                <Col md="12" className="text-end">
                  <Button
                    color="primary"
                    type="submit"
                    disabled={loading || submitting} // Disable button when loading or submitting
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </React.Fragment>
  )
}

export default AddCollectionForm
