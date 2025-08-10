import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardBody,
    Col,
    Row,
    CardTitle,
    Container,
    Label,
    Input,
    Button,
    Form,
    FormGroup,
    FormFeedback
} from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Breadcrumbs from "components/Common/Breadcrumb";
import { useSelector, useDispatch } from "react-redux";
import {
    getExistingSubcategory, // To fetch existing subcategory data
    getTravelCategories,//subcategory based on city name
    getTravelCategoriesSuccess,
    updateSubcategory, // New action for updating
    resetUpdateSubcategoryStatus, // New action to reset update status
    getCities //cities
} from "store/actions";
import { useParams } from "react-router-dom";

const EditSubCategory = () => {
    const { subCategoryid } = useParams();
    const navigate = useNavigate();

    
    const dispatch = useDispatch();
    let index = 0;
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedCityNameId, setSelectedCityNameId] = useState("");
    document.title = "Edit Travel Sub Category | Scrollit"; // Changed document title
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [categoryName, setCategoryName] = useState("")
    const [initialCategoryId, setInitialCategoryId] = useState("")
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        travelcategories,
        travelCities,
        loading,
        error,
        success,
        travelSubcategoryDetails // This will hold the fetched subcategory data
    } = useSelector(state => ({
        travelcategories: state.travelSubCategoryReducer.travelcategories,
        travelCities: state.travelCity.cities,
        loading: state.travelSubCategoryReducer.loading,
        error: state.travelSubCategoryReducer.error,
        success: state.travelSubCategoryReducer.success,
        travelSubcategoryDetails: state.travelSubCategoryReducer.travelSubcategoryDetails
    }));

    console.log("This is travelSubcategoryDetails", travelCities);
    const cityCodes = travelCities;

    useEffect(() => {

        if (travelSubcategoryDetails && travelcategories && travelcategories.length > 0) {
            console.log("Travel categories:", travelcategories);
            setCategoryName(travelcategories.find((cat) => cat._id === travelSubcategoryDetails.category)?.name || "");
            setInitialCategoryId(travelcategories.find((cat) => cat._id === travelSubcategoryDetails.category)?._id || 0);
            console.log("Category Name from travelcategory initial category:", categoryName);
            console.log("Category Name from travelcategory initial categoryID:", initialCategoryId);
        }
    }, [travelSubcategoryDetails, travelcategories, selectedCityName])



    const initialUrlSlugs = {
        "EN": "",
        "ES": "",
        "FR": "",
        "IT": "",
        "DE": "",
        "PT": "",
        "NL": "",
        "PL": "",
        "DA": "",
        "NO": "",
        "RO": "",
        "RU": "",
        "SV": "",
        "TR": ""
    };
    const urlSlugsPlaceholder = {
        "EN": "/tours-en/",
        "ES": "/tours-es/",
        "FR": "/tours-fr/",
        "IT": "/tours-it/",
        "DE": "/tours-de/",
        "PT": "/tours-pt/",
        "NL": "/tours-nl/",
        "PL": "/tours-pl/",
        "DA": "/tours-da/",
        "NO": "/tours-no/",
        "RO": "/tours-ro/",
        "RU": "/tours-ru/",
        "SV": "/tours-sv/",
        "TR": "/tours-tr/"
    };

    const supportedLanguageOptions = [
        { label: "EN", value: "EN" },
        { label: "ES", value: "ES" },
        { label: "FR", value: "FR" },
        { label: "IT", value: "IT" },
        { label: "DE", value: "DE" },
        { label: "PT", value: "PT" },
        { label: "NL", value: "NL" },
        { label: "PL", value: "PL" },
        { label: "DA", value: "DA" },
        { label: "NO", value: "NO" },
        { label: "RO", value: "RO" },
        { label: "RU", value: "RU" },
        { label: "SV", value: "SV" },
        { label: "TR", value: "TR" },
    ];

    const validationSchema = Yup.object().shape({
        categoryName: Yup.string().required("Category Name is required"),
        displayName: Yup.string().required("Display Name is required"),
        categoryId: Yup.string().required("Category is required"),
        cityCode: Yup.string().required("City Code is required"),
        city: Yup.string(),
        heading: Yup.string().nullable().required("Heading is required"),
        metaTitle: Yup.string().nullable().required("Meta Title is required"),
        metaDescription: Yup.string().nullable().required("Meta Description is required"),
        indexing: Yup.string().oneOf(["allowed", "not allowed"]).required("Indexing is required"),
        canonicalUrl: Yup.string().url("Invalid URL format").nullable(),
        urlSlugs: Yup.object().shape(
            Object.keys(initialUrlSlugs).reduce((acc, lang) => { // Use initialUrlSlugs to define schema keys
                acc[lang] = Yup.string().nullable();
                return acc;
            }, {})
        ),
        descriptors: Yup.string().nullable(),
        highlights: Yup.string().nullable(),
        supportedLanguages: Yup.array().of(Yup.string()).nullable(),
        microBrandMetaTitle: Yup.string().nullable(),
        microBrandMetaDescription: Yup.string().nullable(),
        ratingCount: Yup.number().min(0, "Rating Count cannot be negative").integer("Rating Count must be an integer").nullable(),
        averageRating: Yup.number().min(0, "Average Rating cannot be negative").max(5, "Average Rating cannot exceed 5").nullable(),
        displayRating: Yup.string().oneOf(["yes", "no"]).required("Display Rating is required"),
    });

    // Initialize Formik
    const formik = useFormik({
        initialValues: {
            categoryName: categoryName,
            displayName: "",
            categoryId: initialCategoryId,
            heading: "",
            metaTitle: "",
            metaDescription: "",
            indexing: "allowed",
            canonicalUrl: "",
            urlSlugs: initialUrlSlugs,
            descriptors: "",
            highlights: "",
            supportedLanguages: [],
            microBrandMetaTitle: "",
            microBrandMetaDescription: "",
            ratingCount: 0,
            averageRating: 0,
            displayRating: "yes",
            cityCode: "",
            city: ""
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log("Submitting values for update:", values);
            const formData = new FormData();
            const transformedData = {
                name: values.categoryName,
                categoryId: values.categoryId,
                displayName: values.displayName,
                heading: values.heading,
                metaTitle: values.metaTitle,
                metaDescription: values.metaDescription,
                noIndex: values.indexing === "not allowed",
                canonicalUrl: values.canonicalUrl || null,
                urlSlugs: values.urlSlugs,
                ratingsInfo: {
                    ratingsCount: values.ratingCount || 0,
                    averageRating: values.averageRating || 0,
                    showRatings: values.displayRating === "yes",
                },
                microBrandInfo: {
                    descriptors: values.descriptors || null,
                    highlights: values.highlights || null,
                    supportedLanguages: selectedLanguages.map(lang => lang.value),
                    metaTitle: values.microBrandMetaTitle || null,
                    metaDescription: values.microBrandMetaDescription || null,
                },
                cityCode: selectedCityName,
                city: values.city
            };

            formData.append("data", JSON.stringify(transformedData));

            if (selectedFile) {
                formData.append("images", selectedFile);
            }
            console.log("This is edited formData", formData)
            dispatch(updateSubcategory(formData, subCategoryid)); // Dispatch update action
        },
    });

    if (formik.isValid) {
        console.log("Form is valid!");

    } else {
        console.log("Form is invalid.");
        console.log("Form errors:", formik.errors);
    }

    useEffect(() => {
        dispatch(resetUpdateSubcategoryStatus());
    }, []);
    useEffect(() => {
        dispatch(getCities());
        if (subCategoryid) {
            dispatch(getExistingSubcategory(subCategoryid));
        }
        dispatch(resetUpdateSubcategoryStatus());

    }, [dispatch, subCategoryid]);

    useEffect(() => {
        if (travelSubcategoryDetails) {


            formik.setValues({
                categoryName: travelSubcategoryDetails.displayName || "",
                displayName: travelSubcategoryDetails.displayName || "",
                categoryId: initialCategoryId || 0,
                heading: travelSubcategoryDetails.heading || "",
                metaTitle: travelSubcategoryDetails.metaTitle || "",
                metaDescription: travelSubcategoryDetails.metaDescription || "",
                indexing: travelSubcategoryDetails.noIndex ? "not allowed" : "allowed",
                canonicalUrl: travelSubcategoryDetails.canonicalUrl || "",
                urlSlugs: { ...initialUrlSlugs, ...travelSubcategoryDetails.urlSlugs },
                descriptors: travelSubcategoryDetails.microBrandInfo?.descriptors || "",
                highlights: travelSubcategoryDetails.microBrandInfo?.highlights || "",
                microBrandMetaTitle: travelSubcategoryDetails.microBrandInfo?.metaTitle || "",
                microBrandMetaDescription: travelSubcategoryDetails.microBrandInfo?.metaDescription || "",
                ratingCount: travelSubcategoryDetails.ratingsInfo?.ratingsCount || 0,
                averageRating: travelSubcategoryDetails.ratingsInfo?.averageRating || 0,
                displayRating: travelSubcategoryDetails.ratingsInfo?.showRatings ? "yes" : "no",
                cityCode: travelSubcategoryDetails.cityCode || "",
                city: travelSubcategoryDetails.city || ""
            });

            if (travelSubcategoryDetails.microBrandInfo?.supportedLanguages) {
                const preselectedLangs = travelSubcategoryDetails.microBrandInfo.supportedLanguages.map(lang => ({
                    label: lang,
                    value: lang
                }));

                setSelectedLanguages(preselectedLangs);
            }

            if (travelSubcategoryDetails.cityCode) {
                setSelectedCityName(travelSubcategoryDetails.cityCode);
                dispatch(getTravelCategories(travelSubcategoryDetails.cityCode));
            }
        }
    }, [travelSubcategoryDetails]); // Depend on travelSubcategoryDetails

    useEffect(() => {
        if (formik.values.cityCode) {
            dispatch(getTravelCategories(formik.values.cityCode));
        } else {
            dispatch(getTravelCategoriesSuccess([]));
        }
    }, [formik.values.cityCode, dispatch]);

    useEffect(() => {
        if (success) {
            //  toastr.success("Sub Category updated successfully !", "Success"); 
            dispatch(resetUpdateSubcategoryStatus()); // Reset Redux state

                navigate("/tour-group-sub-category");
            
        }

        if (error) {
            const errorMessage = typeof error === 'string'
                ? error
                : error?.message || "Failed to update sub category.";
            dispatch(resetUpdateSubcategoryStatus()); // Reset Redux state
        }
    }, [success, error, dispatch]);

    const handleSupportedLanguagesChange = (selectedOptions) => {
        setSelectedLanguages(selectedOptions);
        formik.setFieldValue("supportedLanguages", selectedOptions.map(option => option.value));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };



    const handleCityCodeChange = (e) => {
        const selectedCode = e.target.value;
        formik.handleChange(e);
        setSelectedCityName(selectedCode);
        const requiredCityId = cityCodes.find(city => city.cityCode === selectedCode);
        console.log("Selected city ID:", requiredCityId.city);
        setSelectedCityNameId(requiredCityId.city);
    };



    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Forms" breadcrumbItem="Edit Travel Sub Category" /> {/* Changed Breadcrumb */}

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="h4 mb-4">Edit Travel Sub Category</CardTitle> {/* Changed Card Title */}
                                    <Form onSubmit={formik.handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="categoryName">Sub Category Name</Label>
                                                    <Input
                                                        type="text"
                                                        className="form-control"
                                                        id="categoryName"
                                                        name="categoryName"
                                                        {...formik.getFieldProps("categoryName")}
                                                        invalid={formik.touched.categoryName && !!formik.errors.categoryName}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.categoryName}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="cityCode">City Code</Label>
                                                    <Input
                                                        type="select"
                                                        className="form-control"
                                                        id="cityCode"
                                                        name="cityCode"
                                                        value={formik.values.cityCode}
                                                        onChange={handleCityCodeChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.cityCode && !!formik.errors.cityCode}
                                                    >
                                                        {/* <option value="">{selectedCityName}</option> */}
                                                        {cityCodes.map((city) => (
                                                            <option key={city.city} value={city.cityCode}>
                                                                {city.cityCode}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.cityCode}
                                                    </FormFeedback>
                                                    {selectedCityName && <small className="text-muted">Selected City Code: {selectedCityName}</small>}
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="displayName">Display Name</Label>
                                                    <Input
                                                        type="text"
                                                        className="form-control"
                                                        id="displayName"
                                                        name="displayName"
                                                        {...formik.getFieldProps("displayName")}
                                                        invalid={formik.touched.displayName && !!formik.errors.displayName}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.displayName}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="categoryId">Category</Label>
                                                    <Input
                                                        type="select"
                                                        className="form-control"
                                                        id="categoryId"
                                                        name="categoryId"
                                                        {...formik.getFieldProps("categoryId")}
                                                        invalid={formik.touched.categoryId && !!formik.errors.categoryId}
                                                        disabled={loading || !travelcategories || travelcategories.length === 0
                                                        }
                                                    >
                                                        {/* <option value="">{categoryName === undefined ? "Select a Category" : categoryName}</option> */}
                                                        {travelcategories && travelcategories.map((cat) => (
                                                            <option key={cat._id} value={cat._id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.categoryId}
                                                    </FormFeedback>
                                                    {loading && <small className="text-muted">Loading categories...</small>}
                                                   
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <FormGroup className="mb-3">
                                            <Label htmlFor="heading">Heading</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="heading"
                                                name="heading"
                                                {...formik.getFieldProps("heading")}
                                                invalid={formik.touched.heading && !!formik.errors.heading}
                                            />
                                            <FormFeedback>
                                                {formik.errors.heading}
                                            </FormFeedback>
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Label htmlFor="metaTitle">Meta Title</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="metaTitle"
                                                name="metaTitle"
                                                {...formik.getFieldProps("metaTitle")}
                                                invalid={formik.touched.metaTitle && !!formik.errors.metaTitle}
                                            />
                                            <FormFeedback>
                                                {formik.errors.metaTitle}
                                            </FormFeedback>
                                        </FormGroup>

                                        <FormGroup className="mb-3">
                                            <Label htmlFor="metaDescription">Meta Description</Label>
                                            <Input
                                                type="textarea"
                                                className="form-control"
                                                id="metaDescription"
                                                name="metaDescription"
                                                rows="3"
                                                {...formik.getFieldProps("metaDescription")}
                                                invalid={formik.touched.metaDescription && !!formik.errors.metaDescription}
                                            />
                                            <FormFeedback>
                                                {formik.errors.metaDescription}
                                            </FormFeedback>
                                        </FormGroup>

                                        <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="indexing">Indexing</Label>
                                                    <Input
                                                        type="select"
                                                        className="form-control"
                                                        id="indexing"
                                                        name="indexing"
                                                        {...formik.getFieldProps("indexing")}
                                                        invalid={formik.touched.indexing && !!formik.errors.indexing}
                                                    >
                                                        <option value="allowed">Allowed</option>
                                                        <option value="not allowed">Not Allowed</option>
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.indexing}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                                                    <Input
                                                        type="url"
                                                        className="form-control"
                                                        id="canonicalUrl"
                                                        name="canonicalUrl"
                                                        {...formik.getFieldProps("canonicalUrl")}
                                                        invalid={formik.touched.canonicalUrl && !!formik.errors.canonicalUrl}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.canonicalUrl}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <h5 className="font-size-14 mt-4">URL Slugs</h5>
                                        <Row className="mb-3">
                                            {Object.keys(formik.values.urlSlugs).map((lang) => (
                                                <Col md={6} key={lang}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor={`urlSlugs.${lang}`}>
                                                            {lang}
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            id={`urlSlugs.${lang}`}
                                                            name={`urlSlugs.${lang}`}
                                                            value={formik.values.urlSlugs[lang]}
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            invalid={formik.touched.urlSlugs?.[lang] && !!formik.errors.urlSlugs?.[lang]}
                                                            placeholder={urlSlugsPlaceholder[lang]}
                                                        />
                                                        <FormFeedback>
                                                            {formik.errors.urlSlugs?.[lang]}
                                                        </FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            ))}
                                        </Row>

                                        <h5 className="font-size-14 mt-4">Micro Brands Info</h5>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="descriptors">Descriptors</Label>
                                                    <Input
                                                        type="textarea"
                                                        className="form-control"
                                                        id="descriptors"
                                                        name="descriptors"
                                                        rows="3"
                                                        {...formik.getFieldProps("descriptors")}
                                                        invalid={formik.touched.descriptors && !!formik.errors.descriptors}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.descriptors}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="highlights">Highlights</Label>
                                                    <Input
                                                        type="textarea"
                                                        className="form-control"
                                                        id="highlights"
                                                        name="highlights"
                                                        rows="3"
                                                        {...formik.getFieldProps("highlights")}
                                                        invalid={formik.touched.highlights && !!formik.errors.highlights}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.highlights}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="supportedLanguages">
                                                        Supported Languages
                                                    </Label>
                                                    <Select
                                                        value={selectedLanguages}
                                                        isMulti={true}
                                                        onChange={handleSupportedLanguagesChange}
                                                        options={supportedLanguageOptions}
                                                        classNamePrefix="select2-selection"
                                                        name="supportedLanguages"
                                                        onBlur={() => formik.setFieldTouched("supportedLanguages", true)}
                                                    />
                                                    {formik.touched.supportedLanguages && formik.errors.supportedLanguages ? (
                                                        <div className="text-danger mt-1">
                                                            {formik.errors.supportedLanguages}
                                                        </div>
                                                    ) : null}
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="microBrandMetaTitle">Micro Brand Meta Title</Label>
                                                    <Input
                                                        type="text"
                                                        className="form-control"
                                                        id="microBrandMetaTitle"
                                                        name="microBrandMetaTitle"
                                                        {...formik.getFieldProps("microBrandMetaTitle")}
                                                        invalid={formik.touched.microBrandMetaTitle && !!formik.errors.microBrandMetaTitle}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.microBrandMetaTitle}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        {/* <Row>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="microBrandMetaDescription">Micro Brand Meta Description</Label>
                                                    <Input
                                                        type="textarea"
                                                        className="form-control"
                                                        id="microBrandMetaDescription"
                                                        name="microBrandMetaDescription"
                                                        rows="3"
                                                        {...formik.getFieldProps("microBrandMetaDescription")}
                                                        invalid={formik.touched.microBrandMetaDescription && !!formik.errors.microBrandMetaDescription}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.microBrandMetaDescription}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="subcategoryImage">Subcategory Image</Label>
                                                    <img
                                                        // Use the first media URL if available, otherwise a placeholder
                                                        src={travelSubcategoryDetails.medias && travelSubcategoryDetails.medias.length > 0
                                                            ? travelSubcategoryDetails.medias[0].url
                                                            : "https://via.placeholder.com/400x300?text=No+Image"}
                                                        alt={travelSubcategoryDetails.medias && travelSubcategoryDetails.medias.length > 0
                                                            ? travelSubcategoryDetails.medias[0].altText
                                                            : "Category Image"}
                                                        className="img-fluid mx-auto d-block rounded"
                                                        style={{ maxWidth: "400px", maxHeight: "300px", objectFit: "cover" }}
                                                    />
                                                    <Input
                                                        type="file"
                                                        className="form-control"
                                                        id="subcategoryImage"
                                                        name="subcategoryImage"
                                                        onChange={handleFileChange}
                                                    />
                                                </FormGroup>
                                                {travelSubcategoryDetails?.image && (
                                                    <div className="mb-3">
                                                        <Label>Current Image:</Label>
                                                        <div>
                                                            <img src={travelSubcategoryDetails.image} alt="Current Subcategory" style={{ maxWidth: '200px', height: 'auto' }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </Col>
                                        </Row> */}
                                        <Row className="mb-4"> {/* Added mb-4 to the Row for general spacing */}
                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="microBrandMetaDescription">Micro Brand Meta Description</Label>
                                                    <Input
                                                        type="textarea"
                                                        className="form-control"
                                                        id="microBrandMetaDescription"
                                                        name="microBrandMetaDescription"
                                                        rows="3"
                                                        {...formik.getFieldProps("microBrandMetaDescription")}
                                                        invalid={formik.touched.microBrandMetaDescription && !!formik.errors.microBrandMetaDescription}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.microBrandMetaDescription}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>

                                            <Col md={6}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="subcategoryImage">Subcategory Image</Label>

                                                    {/* Display Current Image (if available) - consolidated and styled */}
                                                    {travelSubcategoryDetails && travelSubcategoryDetails.medias && travelSubcategoryDetails.medias.length > 0 && (
                                                        <div className="mb-3 text-center"> {/* Added text-center for horizontal centering */}
                                                            <img
                                                                src={travelSubcategoryDetails.medias[0].url}
                                                                alt={travelSubcategoryDetails.medias[0].altText || "Current Subcategory Image"}
                                                                className="img-thumbnail" // Use img-thumbnail for a nice border and slight padding
                                                                style={{
                                                                    maxWidth: "150px",   // Make it smaller for a preview
                                                                    maxHeight: "150px",  // Keep aspect ratio with object-fit
                                                                    objectFit: "cover",
                                                                    marginBottom: "10px" // Add some space below the image
                                                                }}
                                                            />
                                                            <p className="text-muted small">Current Image</p>
                                                        </div>
                                                    )}

                                                    {/* Placeholder Image (if no current image) */}
                                                    {(!travelSubcategoryDetails || !travelSubcategoryDetails.medias || travelSubcategoryDetails.medias.length === 0) && (
                                                        <div className="mb-3 text-center">
                                                            <img
                                                                src="https://via.placeholder.com/150x150?text=No+Image" // Smaller placeholder
                                                                alt="No Image Available"
                                                                className="img-thumbnail"
                                                                style={{ marginBottom: "10px" }}
                                                            />
                                                            <p className="text-muted small">No current image available.</p>
                                                        </div>
                                                    )}


                                                    <Label htmlFor="subcategoryImageInput">Upload New Image (Optional)</Label>
                                                    <Input
                                                        type="file"
                                                        className="form-control"
                                                        id="subcategoryImageInput" // Changed ID to avoid confusion
                                                        name="subcategoryImage"
                                                        onChange={handleFileChange}
                                                    />
                                                    {/* You might want a FormFeedback here if you have file validation */}
                                                    {/* {formik.touched.subcategoryImage && formik.errors.subcategoryImage && (
                <FormFeedback>{formik.errors.subcategoryImage}</FormFeedback>
            )} */}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <h5 className="font-size-14 mt-4">Ratings Info</h5>
                                        <Row>
                                            <Col md={4}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="ratingCount">Rating Count</Label>
                                                    <Input
                                                        type="number"
                                                        className="form-control"
                                                        id="ratingCount"
                                                        name="ratingCount"
                                                        {...formik.getFieldProps("ratingCount")}
                                                        invalid={formik.touched.ratingCount && !!formik.errors.ratingCount}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.ratingCount}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="averageRating">Average Rating</Label>
                                                    <Input
                                                        type="number"
                                                        className="form-control"
                                                        id="averageRating"
                                                        name="averageRating"
                                                        step="0.1"
                                                        {...formik.getFieldProps("averageRating")}
                                                        invalid={formik.touched.averageRating && !!formik.errors.averageRating}
                                                    />
                                                    <FormFeedback>
                                                        {formik.errors.averageRating}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                            <Col md={4}>
                                                <FormGroup className="mb-3">
                                                    <Label htmlFor="displayRating">Display Rating</Label>
                                                    <Input
                                                        type="select"
                                                        className="form-control"
                                                        id="displayRating"
                                                        name="displayRating"
                                                        {...formik.getFieldProps("displayRating")}
                                                        invalid={formik.touched.displayRating && !!formik.errors.displayRating}
                                                    >
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.displayRating}
                                                    </FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Button color="primary" type="submit" disabled={loading}>
                                            {loading ? "Updating..." : "Update Sub Category"}
                                        </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default EditSubCategory;