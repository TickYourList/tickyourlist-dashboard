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
    FormFeedback,
    Alert
} from "reactstrap";
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Breadcrumbs from "components/Common/Breadcrumb";
import { useSelector, useDispatch } from "react-redux";
import {
    getExistingSubcategoryForEdit,
    getTravelCategories,
    getTravelCategoriesSuccess,
    updateSubcategory,
    resetUpdateSubcategoryStatus,
    getCities,
    getUsersPermissionsForSubcategory
} from "store/actions";

const EditSubCategory = () => {
    const { subCategoryid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    document.title = "Edit Travel Sub Category | Scrollit";
    
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    const {
        travelcategories,
        travelCities,
        loading,
        error,
        success,
        travelSubcategoryDetails,
        SubcategoryUserPermissions
    } = useSelector(state => ({
        travelcategories: state.travelSubCategoryReducer.travelcategories,
        travelCities: state.travelCity.cities,
        loading: state.travelSubCategoryReducer.loading,
        error: state.travelSubCategoryReducer.error,
        success: state.travelSubCategoryReducer.success,
        travelSubcategoryDetails: state.travelSubCategoryReducer.travelSubcategoryDetails,
        SubcategoryUserPermissions: state.travelSubCategoryReducer.SubcategoryUserPermissions
    }));

    const cityCodes = travelCities;

    const subCategoryPermissions = useMemo(() => {
        if (Array.isArray(SubcategoryUserPermissions)) {
            return SubcategoryUserPermissions.find(
                (perm) => perm.module === "tylTravelSubCategory"
            );
        }
        return null;
    }, [SubcategoryUserPermissions]);

    const canView = subCategoryPermissions?.canView;
    const canEdit = subCategoryPermissions?.canEdit;
    
    // Formik initialization and schema must be declared first
    const initialUrlSlugs = { "EN": "", "ES": "", "FR": "", "IT": "", "DE": "", "PT": "", "NL": "", "PL": "", "DA": "", "NO": "", "RO": "", "RU": "", "SV": "", "TR": "" };
    const urlSlugsPlaceholder = { "EN": "/tours-en/", "ES": "/tours-es/", "FR": "/tours-fr/", "IT": "/tours-it/", "DE": "/tours-de/", "PT": "/tours-pt/", "NL": "/tours-nl/", "PL": "/tours-pl/", "DA": "/tours-da/", "NO": "/tours-no/", "RO": "/tours-ro/", "RU": "/tours-ru/", "SV": "/tours-sv/", "TR": "/tours-tr/" };
    const supportedLanguageOptions = [
        { label: "EN", value: "EN" }, { label: "ES", value: "ES" }, { label: "FR", value: "FR" },
        { label: "IT", value: "IT" }, { label: "DE", value: "DE" }, { label: "PT", value: "PT" },
        { label: "NL", value: "NL" }, { label: "PL", value: "PL" }, { label: "DA", value: "DA" },
        { label: "NO", value: "NO" }, { label: "RO", value: "RO" }, { label: "RU", value: "RU" },
        { label: "SV", value: "SV" }, { label: "TR", value: "TR" },
    ];

    const validationSchema = Yup.object().shape({
        categoryName: Yup.string().required("Sub Category Name is required"),
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
            Object.keys(initialUrlSlugs).reduce((acc, lang) => { acc[lang] = Yup.string().nullable(); return acc; }, {})
        ),
        descriptors: Yup.string().nullable(), highlights: Yup.string().nullable(), supportedLanguages: Yup.array().of(Yup.string()).nullable(),
        microBrandMetaTitle: Yup.string().nullable(), microBrandMetaDescription: Yup.string().nullable(),
        ratingCount: Yup.number().min(0, "Rating Count cannot be negative").integer("Rating Count must be an integer").nullable(),
        averageRating: Yup.number().min(0, "Average Rating cannot be negative").max(5, "Average Rating cannot exceed 5").nullable(),
        displayRating: Yup.string().oneOf(["yes", "no"]).required("Display Rating is required"),
    });

    const formik = useFormik({
        initialValues: {
            categoryName: "", displayName: "", categoryId: "", heading: "", metaTitle: "", metaDescription: "",
            indexing: "allowed", canonicalUrl: "", urlSlugs: initialUrlSlugs, descriptors: "", highlights: "",
            supportedLanguages: [], microBrandMetaTitle: "", microBrandMetaDescription: "", ratingCount: 0,
            averageRating: 0, displayRating: "yes", cityCode: "", city: ""
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const formData = new FormData();
            const transformedData = {
                name: values.categoryName, categoryId: values.categoryId, displayName: values.displayName,
                heading: values.heading, metaTitle: values.metaTitle, metaDescription: values.metaDescription,
                noIndex: values.indexing === "not allowed", canonicalUrl: values.canonicalUrl || null,
                urlSlugs: values.urlSlugs,
                ratingsInfo: { ratingsCount: values.ratingCount || 0, averageRating: values.averageRating || 0, showRatings: values.displayRating === "yes" },
                microBrandInfo: { descriptors: values.descriptors || null, highlights: values.highlights || null, supportedLanguages: selectedLanguages.map(lang => lang.value),
                    metaTitle: values.microBrandMetaTitle || null, metaDescription: values.microBrandMetaDescription || null },
                cityCode: values.cityCode, city: values.city
            };
            formData.append("data", JSON.stringify(transformedData));
            if (selectedFile) { formData.append("images", selectedFile); }
            dispatch(updateSubcategory(formData, subCategoryid));
        },
    });

    // 1. Fetch permissions first.
    useEffect(() => {
        dispatch(getUsersPermissionsForSubcategory());
        dispatch(resetUpdateSubcategoryStatus());
    }, [dispatch]);

    // 2. Once permissions are loaded, check if the user can view.
    useEffect(() => {
        if (SubcategoryUserPermissions) {
            setPermissionsLoaded(true);
            if (canView) {
                if (canEdit && subCategoryid) {
                    dispatch(getCities());
                    dispatch(getExistingSubcategoryForEdit(subCategoryid));
                }
            }
        }
    }, [dispatch, subCategoryid, canEdit, canView, SubcategoryUserPermissions]);

    // 3. This effect populates the form once data is available.
    useEffect(() => {
        if (travelSubcategoryDetails && canEdit && Object.keys(travelSubcategoryDetails).length > 0) {
            const formValues = {
                categoryName: travelSubcategoryDetails.displayName || travelSubcategoryDetails.name || "",
                displayName: travelSubcategoryDetails.displayName || travelSubcategoryDetails.name || "",
                categoryId: travelSubcategoryDetails.category?._id || travelSubcategoryDetails.category || "",
                heading: travelSubcategoryDetails.heading || "",
                metaTitle: travelSubcategoryDetails.metaTitle || "",
                metaDescription: travelSubcategoryDetails.metaDescription || "",
                indexing: travelSubcategoryDetails.noIndex ? "not allowed" : "allowed",
                canonicalUrl: travelSubcategoryDetails.canonicalUrl || "",
                urlSlugs: { ...initialUrlSlugs, ...(travelSubcategoryDetails.urlSlugs || {}) },
                descriptors: travelSubcategoryDetails.microBrandInfo?.descriptors || "",
                highlights: travelSubcategoryDetails.microBrandInfo?.highlights || "",
                microBrandMetaTitle: travelSubcategoryDetails.microBrandInfo?.metaTitle || "",
                microBrandMetaDescription: travelSubcategoryDetails.microBrandInfo?.metaDescription || "",
                ratingCount: travelSubcategoryDetails.ratingsInfo?.ratingsCount || 0,
                averageRating: travelSubcategoryDetails.ratingsInfo?.averageRating || 0,
                displayRating: travelSubcategoryDetails.ratingsInfo?.showRatings ? "yes" : "no",
                cityCode: travelSubcategoryDetails.cityCode || "",
                city: travelSubcategoryDetails.city?._id || travelSubcategoryDetails.city || ""
            };
            formik.setValues(formValues);
            
            if (travelSubcategoryDetails.microBrandInfo?.supportedLanguages && Array.isArray(travelSubcategoryDetails.microBrandInfo.supportedLanguages)) {
                const preselectedLangs = travelSubcategoryDetails.microBrandInfo.supportedLanguages.map(lang => ({ label: lang, value: lang }));
                setSelectedLanguages(preselectedLangs);
            }
        }
    }, [travelSubcategoryDetails, canEdit]);

    // 4. This effect fetches categories when the city code changes.
    useEffect(() => {
        if (canEdit && formik.values.cityCode) {
            dispatch(getTravelCategories(formik.values.cityCode));
        } else {
            dispatch(getTravelCategoriesSuccess([]));
        }
    }, [formik.values.cityCode, dispatch, canEdit]);

    useEffect(() => {
        if (success) {
            dispatch(resetUpdateSubcategoryStatus());
            navigate("/tour-group-sub-category");
        }
        if (error) {
            dispatch(resetUpdateSubcategoryStatus());
        }
    }, [success, error, dispatch, navigate]);

    const handleSupportedLanguagesChange = (selectedOptions) => {
        setSelectedLanguages(selectedOptions);
        formik.setFieldValue("supportedLanguages", selectedOptions.map(option => option.value));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    
    const handleCityCodeChange = (e) => {
        const selectedCode = e.target.value;
        const requiredCity = cityCodes.find(city => city.cityCode === selectedCode);
        formik.setFieldValue('cityCode', selectedCode);
        formik.setFieldValue('city', requiredCity?.city || '');
    };
    
    if (!permissionsLoaded) {
        return (
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Forms" breadcrumbItem="Edit Travel Sub Category" />
                    <div className="text-center p-5">
                        <i className="mdi mdi-spin mdi-loading display-4 text-primary"></i>
                        <p className="mt-2">Loading permissions...</p>
                    </div>
                </Container>
            </div>
        );
    }
    
    // The main render logic for the page
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Forms" breadcrumbItem="Edit Travel Sub Category" />
                    <Row>
                        <Col lg={12}>
                            {canEdit ? (
                                <Card>
                                    <CardBody>
                                        <CardTitle className="h4 mb-4">Edit Travel Sub Category</CardTitle>
                                        {error && <Alert color="danger">{error}</Alert>}
                                        <Form onSubmit={formik.handleSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="categoryName">Sub Category Name<span className="text-danger">*</span></Label>
                                                        <Input type="text" className="form-control" id="categoryName" name="categoryName"
                                                            {...formik.getFieldProps("categoryName")} invalid={formik.touched.categoryName && !!formik.errors.categoryName} />
                                                        <FormFeedback>{formik.errors.categoryName}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="cityCode">City Code<span className="text-danger">*</span></Label>
                                                        <Input type="select" className="form-control" id="cityCode" name="cityCode"
                                                            value={formik.values.cityCode} onChange={handleCityCodeChange} onBlur={formik.handleBlur}
                                                            invalid={formik.touched.cityCode && !!formik.errors.cityCode}>
                                                            <option value="">Select City Code</option>
                                                            {cityCodes.map((city) => (<option key={city.city} value={city.cityCode}>{city.cityCode}</option>))}
                                                        </Input>
                                                        <FormFeedback>{formik.errors.cityCode}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="displayName">Display Name<span className="text-danger">*</span></Label>
                                                        <Input type="text" className="form-control" id="displayName" name="displayName"
                                                            {...formik.getFieldProps("displayName")} invalid={formik.touched.displayName && !!formik.errors.displayName} />
                                                        <FormFeedback>{formik.errors.displayName}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="categoryId">Category<span className="text-danger">*</span></Label>
                                                        <Input type="select" className="form-control" id="categoryId" name="categoryId"
                                                            {...formik.getFieldProps("categoryId")} invalid={formik.touched.categoryId && !!formik.errors.categoryId}
                                                            disabled={loading || !travelcategories || travelcategories.length === 0}>
                                                            {travelcategories && travelcategories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                                                        </Input>
                                                        <FormFeedback>{formik.errors.categoryId}</FormFeedback>
                                                        {loading && <small className="text-muted">Loading categories...</small>}
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <FormGroup className="mb-3">
                                                <Label htmlFor="heading">Heading<span className="text-danger">*</span></Label>
                                                <Input type="text" className="form-control" id="heading" name="heading"
                                                    {...formik.getFieldProps("heading")} invalid={formik.touched.heading && !!formik.errors.heading} />
                                                <FormFeedback>{formik.errors.heading}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Label htmlFor="metaTitle">Meta Title<span className="text-danger">*</span></Label>
                                                <Input type="text" className="form-control" id="metaTitle" name="metaTitle"
                                                    {...formik.getFieldProps("metaTitle")} invalid={formik.touched.metaTitle && !!formik.errors.metaTitle} />
                                                <FormFeedback>{formik.errors.metaTitle}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <Label htmlFor="metaDescription">Meta Description<span className="text-danger">*</span></Label>
                                                <Input type="textarea" className="form-control" id="metaDescription" name="metaDescription" rows="3"
                                                    {...formik.getFieldProps("metaDescription")} invalid={formik.touched.metaDescription && !!formik.errors.metaDescription} />
                                                <FormFeedback>{formik.errors.metaDescription}</FormFeedback>
                                            </FormGroup>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="indexing">Indexing</Label>
                                                        <Input type="select" className="form-control" id="indexing" name="indexing"
                                                            {...formik.getFieldProps("indexing")} invalid={formik.touched.indexing && !!formik.errors.indexing}>
                                                            <option value="allowed">Allowed</option>
                                                            <option value="not allowed">Not Allowed</option>
                                                        </Input>
                                                        <FormFeedback>{formik.errors.indexing}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="canonicalUrl">Canonical URL</Label>
                                                        <Input type="url" className="form-control" id="canonicalUrl" name="canonicalUrl"
                                                            {...formik.getFieldProps("canonicalUrl")} invalid={formik.touched.canonicalUrl && !!formik.errors.canonicalUrl} />
                                                        <FormFeedback>{formik.errors.canonicalUrl}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <h5 className="font-size-14 mt-4">URL Slugs</h5>
                                            <Row className="mb-3">
                                                {Object.keys(formik.values.urlSlugs).map((lang) => (
                                                    <Col md={6} key={lang}>
                                                        <FormGroup className="mb-3">
                                                            <Label htmlFor={`urlSlugs.${lang}`}>{lang}</Label>
                                                            <Input type="text" className="form-control" id={`urlSlugs.${lang}`} name={`urlSlugs.${lang}`}
                                                                value={formik.values.urlSlugs[lang]} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                                                invalid={formik.touched.urlSlugs?.[lang] && !!formik.errors.urlSlugs?.[lang]}
                                                                placeholder={urlSlugsPlaceholder[lang]} />
                                                            <FormFeedback>{formik.errors.urlSlugs?.[lang]}</FormFeedback>
                                                        </FormGroup>
                                                    </Col>
                                                ))}
                                            </Row>
                                            <h5 className="font-size-14 mt-4">Micro Brands Info</h5>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="descriptors">Descriptors</Label>
                                                        <Input type="textarea" className="form-control" id="descriptors" name="descriptors" rows="3"
                                                            {...formik.getFieldProps("descriptors")} invalid={formik.touched.descriptors && !!formik.errors.descriptors} />
                                                        <FormFeedback>{formik.errors.descriptors}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="highlights">Highlights</Label>
                                                        <Input type="textarea" className="form-control" id="highlights" name="highlights" rows="3"
                                                            {...formik.getFieldProps("highlights")} invalid={formik.touched.highlights && !!formik.errors.highlights} />
                                                        <FormFeedback>{formik.errors.highlights}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="supportedLanguages">Supported Languages</Label>
                                                        <Select value={selectedLanguages} isMulti={true} onChange={handleSupportedLanguagesChange} options={supportedLanguageOptions}
                                                            classNamePrefix="select2-selection" name="supportedLanguages" onBlur={() => formik.setFieldTouched("supportedLanguages", true)} />
                                                        {formik.touched.supportedLanguages && formik.errors.supportedLanguages ? (<div className="text-danger mt-1">{formik.errors.supportedLanguages}</div>) : null}
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="microBrandMetaTitle">Micro Brand Meta Title</Label>
                                                        <Input type="text" className="form-control" id="microBrandMetaTitle" name="microBrandMetaTitle"
                                                            {...formik.getFieldProps("microBrandMetaTitle")} invalid={formik.touched.microBrandMetaTitle && !!formik.errors.microBrandMetaTitle} />
                                                        <FormFeedback>{formik.errors.microBrandMetaTitle}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="mb-4">
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="microBrandMetaDescription">Micro Brand Meta Description</Label>
                                                        <Input type="textarea" className="form-control" id="microBrandMetaDescription" name="microBrandMetaDescription" rows="3"
                                                            {...formik.getFieldProps("microBrandMetaDescription")} invalid={formik.touched.microBrandMetaDescription && !!formik.errors.microBrandMetaDescription} />
                                                        <FormFeedback>{formik.errors.microBrandMetaDescription}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="subcategoryImage">Subcategory Image</Label>
                                                        {travelSubcategoryDetails?.medias?.length > 0 && (
                                                            <div className="mb-3 text-center">
                                                                <img src={travelSubcategoryDetails.medias[0].url} alt={travelSubcategoryDetails.medias[0].altText || "Current Subcategory Image"}
                                                                    className="img-thumbnail" style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover", marginBottom: "10px" }} />
                                                                <p className="text-muted small">Current Image</p>
                                                            </div>
                                                        )}
                                                        {(!travelSubcategoryDetails || !travelSubcategoryDetails.medias || travelSubcategoryDetails.medias.length === 0) && (
                                                            <div className="mb-3 text-center">
                                                                <img src="https://via.placeholder.com/150x150?text=No+Image" alt="No Image Available"
                                                                    className="img-thumbnail" style={{ marginBottom: "10px" }} />
                                                                <p className="text-muted small">No current image available.</p>
                                                            </div>
                                                        )}
                                                        <Label htmlFor="subcategoryImageInput">Upload New Image (Optional)</Label>
                                                        <Input type="file" className="form-control" id="subcategoryImageInput" name="subcategoryImage" onChange={handleFileChange} />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <h5 className="font-size-14 mt-4">Ratings Info</h5>
                                            <Row>
                                                <Col md={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="ratingCount">Rating Count</Label>
                                                        <Input type="number" className="form-control" id="ratingCount" name="ratingCount"
                                                            {...formik.getFieldProps("ratingCount")} invalid={formik.touched.ratingCount && !!formik.errors.ratingCount} />
                                                        <FormFeedback>{formik.errors.ratingCount}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="averageRating">Average Rating</Label>
                                                        <Input type="number" className="form-control" id="averageRating" name="averageRating" step="0.1"
                                                            {...formik.getFieldProps("averageRating")} invalid={formik.touched.averageRating && !!formik.errors.averageRating} />
                                                        <FormFeedback>{formik.errors.averageRating}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={4}>
                                                    <FormGroup className="mb-3">
                                                        <Label htmlFor="displayRating">Display Rating</Label>
                                                        <Input type="select" className="form-control" id="displayRating" name="displayRating"
                                                            {...formik.getFieldProps("displayRating")} invalid={formik.touched.displayRating && !!formik.errors.displayRating}>
                                                            <option value="yes">Yes</option>
                                                            <option value="no">No</option>
                                                        </Input>
                                                        <FormFeedback>{formik.errors.displayRating}</FormFeedback>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-end gap-2 mt-3">
                                                <Button color="secondary" type="button" onClick={() => navigate("/tour-group-sub-category")}>
                                                    Cancel
                                                </Button>
                                                <Button color="primary" type="submit" disabled={loading}>
                                                    {loading ? "Updating..." : "Update Sub Category"}
                                                </Button>
                                            </div>
                                        </Form>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Alert color="danger" className="text-center">
                                    <p>You do not have permission to edit this subcategory.</p>
                                    {canView?<Button color="primary" className="mt-2" onClick={() => navigate("/tour-group-sub-category")}>
                                        Go Back to Home
                                    </Button>:<Button color="primary" className="mt-2" onClick={() => navigate("/dashboard")}>
                                        Go Back to Dashboard
                                    </Button>}

                                </Alert>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default EditSubCategory;