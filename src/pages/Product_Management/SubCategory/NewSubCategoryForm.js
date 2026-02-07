import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Breadcrumbs from "components/Common/Breadcrumb";
import { useSelector, useDispatch } from "react-redux";
import {
    getCities, // cities
    getTravelCategories, //subcategory based on cities
    getTravelCategoriesSuccess,
    addTravelSubcategory,
    resetAddSubcategoryStatus,
    resetCategoryStatus
} from "store/actions";


const SubCategoryForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectedCityName, setSelectedCityName] = useState("");
    const [selectedCityNameId, setSelectedCityNameId] = useState("");
    document.title = "Add New Travel Sub Category | Scrollit";
    const [selectedLanguages, setSelectedLanguages] = useState([]); // Renamed for clarity
    const [selectedFile, setSelectedFile] = useState(null);
    const store = useSelector(state => state);
    // console.log("This is whole store", store)
    const { travelcategories, travelCities, loading, error, success } = useSelector(state => ({
        travelcategories: state.travelSubCategoryReducer.travelcategories,
        travelCities: state.travelCity.cities,
        loading: state.travelSubCategoryReducer.loading,
        error: state.travelSubCategoryReducer.error,
        success: state.travelSubCategoryReducer.success
    }));

    const cityCodes = travelCities;

    console.log("city from Redux store:", travelCities);
    console.log("Categories from Redux store:", travelcategories);
    // console.log("Loading state from Redux store:", loading);
    // console.log("Error state from Redux store:", error);
    // console.log("Success state from Redux store:", success);

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



    // CORRECTED: The list of supported languages should be an array of objects for react-select
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


    // Define validation schema using Yup
    const validationSchema = Yup.object().shape({
        categoryName: Yup.string().required("Category Name is required"),
        displayName: Yup.string().required("Display Name is required"),
        categoryId: Yup.string().required("Category is required"),
        cityCode: Yup.string().required("City Code is required"),
        heading: Yup.string().nullable().required("Heading is required"),
        metaTitle: Yup.string().nullable().required("Meta Title is required"),
        metaDescription: Yup.string().nullable().required("Meta Description is required"), // Corrected typo here
        indexing: Yup.string().oneOf(["allowed", "not allowed"]).required("Indexing is required"),
        canonicalUrl: Yup.string().url("Invalid URL format").nullable(),
        urlSlugs: Yup.object().shape(
            Object.keys({
                EN: "", ES: "", FR: "", IT: "", DE: "", PT: "", NL: "", PL: "", DA: "", NO: "", RO: "", RU: "", SV: "", TR: "",
            }).reduce((acc, lang) => {
                acc[lang] = Yup.string().nullable();
                return acc;
            }, {})
        ),
        descriptors: Yup.string().nullable(),
        highlights: Yup.string().nullable(),
        // CORRECTED: supportedLanguages should be an array of strings
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
            categoryName: "",
            displayName: "",
            categoryId: "",
            heading: "",
            metaTitle: "",
            metaDescription: "",
            indexing: "allowed",
            canonicalUrl: "",
            urlSlugs: initialUrlSlugs,
            descriptors: "",
            highlights: "",
            supportedLanguages: [], // Initialize as an empty array
            microBrandMetaTitle: "",
            microBrandMetaDescription: "",
            ratingCount: 0,
            averageRating: 0,
            displayRating: "yes",
            cityCode: "",
            city:""
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log(values);
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
                    // CORRECTED: Map selectedLanguages (from react-select) to an array of string values
                    supportedLanguages: selectedLanguages.map(lang => lang.value), 
                    metaTitle: values.microBrandMetaTitle || null,
                    metaDescription: values.microBrandMetaDescription || null,
                },
                cityCode: values.cityCode,
                city:selectedCityNameId
            };

            formData.append("data", JSON.stringify(transformedData));

            if (selectedFile) {
                formData.append("images", selectedFile);
            }
            dispatch(addTravelSubcategory(formData, selectedCityName));
            console.log("Form data submitted:", formData);
            // Preserve city filter from URL params
            const cityCode = searchParams.get('cityCode');
            const url = cityCode 
                ? `/tour-group-sub-category?cityCode=${cityCode}`
                : "/tour-group-sub-category";
            navigate(url); // Navigate to the subcategories page after submission
            
        },
    });

    useEffect(() => {    //getting TravelCitiesList
        dispatch(getCities());
    }, [dispatch])


    useEffect(() => {
        console.log("this is travelcityselected ", formik.values.cityCode);
        if (formik.values.cityCode) {
            dispatch(getTravelCategories(formik.values.cityCode)); // Use formik's state directly
        } else {
            dispatch(getTravelCategoriesSuccess([]));
        }
        formik.setFieldValue('categoryId', ''); // Reset category when city changes
    }, [formik.values.cityCode, dispatch]); // Depend on formik.values.cityCode

    useEffect(() => {
        if (success) {
            formik.resetForm(); // Reset form fields on success
            setSelectedFile(null); // Clear selected file
            setSelectedCityName("");
            setSelectedLanguages([]); // Clear selected languages
            dispatch(resetCategoryStatus())
    setTimeout(() => { navigate("/categories"); }, 500);
        }

        // Error notification
        if (error) {
            const errorMessage = typeof error === 'string'
                ? error
                : error?.message || "Failed to add sub category.";
            dispatch(resetCategoryStatus())
            
        }
    }, [success, error, dispatch,navigate]); // Depend on these Redux states

    // CORRECTED: Handle change for react-select for supportedLanguages
    function handleSupportedLanguagesChange(selectedOptions) {
        setSelectedLanguages(selectedOptions);
        // Also update Formik's state if you want it to be part of formik.values
        formik.setFieldValue("supportedLanguages", selectedOptions.map(option => option.value));
    }


    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };



    const handleCityCodeChange = (e) => {
        const selectedCode = e.target.value;
        console.log("Selected city code:", selectedCode);
        // console.log("Selected city code:", selectedCode.cityCode);
        const requiredCityId=cityCodes.find(city => city.cityCode === selectedCode);
        console.log("Selected city ID:", requiredCityId.city);
        setSelectedCityNameId(requiredCityId.city); // Set the city ID
        formik.handleChange(e); // This is important to update formik's state
        setSelectedCityName(selectedCode); // Correctly set the local state with the selected city code
    };
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Forms" breadcrumbItem="Add New Travel Sub Category" />

                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="h4 mb-4">Add New Travel Sub Category</CardTitle>
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
                                                    <Input type="select"className="form-control"id="cityCode"
                                                        name="cityCode"
                                                        value={formik.values.cityCode}
                                                        onChange={handleCityCodeChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.cityCode && !!formik.errors.cityCode}
                                                    >
                                                         <option value="" disabled hidden>Select a City</option>
                                                        {cityCodes.map((city) => (
                                                            <option key={city.city} value={city.cityCode}>
                                                                {city.cityCode}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.cityCode}
                                                    </FormFeedback>
                                                    {selectedCityName && <small className="text-muted">Selected City Name: {selectedCityName}</small>}
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
                                                        placeholder="Select a category"
                                                        {...formik.getFieldProps("categoryId")}
                                                        invalid={formik.touched.categoryId && !!formik.errors.categoryId}
                                                        disabled={loading || !travelcategories || travelcategories.length === 0}
                                                    >
                                                         <option value="" disabled hidden>Select a Category</option>
                                                        {/* <option value="">Select a category</option> */}
                                                        {travelcategories && travelcategories.map((cat) => (
                                                            <option key={cat._id} value={cat._id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                    <FormFeedback>
                                                        {formik.errors.category}
                                                    </FormFeedback>
                                                    {loading && <small className="text-muted">Loading categories...</small>}
                                                    {error && <small className="text-danger">{typeof error === 'object' ? error.message || 'An error occurred.' : error}</small>}
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
                                                        value={selectedLanguages} // Bind selectedLanguages state
                                                        isMulti={true}
                                                        onChange={handleSupportedLanguagesChange} // Use the new handler
                                                        options={supportedLanguageOptions} // Use the new options array
                                                        classNamePrefix="select2-selection"
                                                        name="supportedLanguages" // Important for Formik validation
                                                        onBlur={() => formik.setFieldTouched("supportedLanguages", true)}
                                                    />
                                                    {/* FormFeedback for supportedLanguages, if needed based on Yup schema */}
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

                                        <h5 className="font-size-14 mt-4">Rating Info</h5>
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

                                        <FormGroup className="mb-3">
                                            <Label htmlFor="imageUpload">Upload Image</Label>
                                            <Input type="file"className="form-control"id="imageUpload"name="images"onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </FormGroup>

                                        <div className="d-flex justify-content-end">
                                            <Button color="primary" type="submit" disabled={loading}>
                                                {loading ? "Creating..." : "Submit"}
                                            </Button>
                                        </div>
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

export default SubCategoryForm;