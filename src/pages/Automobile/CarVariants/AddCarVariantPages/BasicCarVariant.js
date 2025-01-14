import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";

import {
    Row,
    Col,
    Input,
    Form,
    FormGroup,
    Label,
    CardTitle,
    FormFeedback,
    Button,
    Card,
} from "reactstrap"
import { Link } from "react-router-dom"
import * as Yup from "yup";

import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"

const BasicCarVariant = ({ carVariant, onValidChange, onFormValuesChange, onFormSubmit, onFuelTypeChange }) => {

    //meta title
    const dispatch = useDispatch();
    const [switch1, setswitch1] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            variantName: (carVariant && carVariant.name) || "",
            carModel: (carVariant && carVariant.carModel?._id) || "",
            variantStatus: (carVariant && carVariant.status ? 'Active' : 'InActive') || "",
            onRoadPrice: (carVariant && carVariant.basicInformation && carVariant.basicInformation.onRoadPrice) || "",
            userRating: (carVariant && carVariant.basicInformation && carVariant.basicInformation.userRating) || "",
            startEmiAmount: (carVariant && carVariant.basicInformation && carVariant.basicInformation.startEmiAmount) || "",
            startInsuranceAmount: (carVariant && carVariant.basicInformation && carVariant.basicInformation.startInsuranceAmount) || "",
            serviceCost: (carVariant && carVariant.basicInformation && carVariant.basicInformation.serviceCost) || "",
            fuelType: (carVariant && carVariant?.basicInformation?.fuelType) || "",
            // selectedFiles: (carVariant && carVariant.media) || []
        },
        validationSchema: Yup.object({
            // variantName: Yup.string().required(
            //     "Please Enter Your Variant Name"
            // ),
            // carModel: Yup.string().required(
            //     "Please Enter Your CarModel"
            // ),
            // variantStatus: Yup.string().required(
            //     "Please Enter Your Variant Status"
            // ),
            // onRoadPrice: Yup.string().required(
            //     "Please Enter Your on Road Price"
            // ),
            // userRating: Yup.string().required(
            //     "Please Enter Your User Rating"
            // ),
            // startEmiAmount: Yup.string().required(
            //     "Please Enter Your Start Emi Amount"
            // ),
            // startInsuranceAmount: Yup.string().required(
            //     "Please Enter Your Start Insurance Amount"
            // ),
            // serviceCost: Yup.string().required(
            //     "Please Enter Your Service Cost"
            // ),
            // selectedFiles: Yup.array()
            // .min(1, 'You must upload at least one image')
            // .required('Images are required')
        }),
        onSubmit: values => {
            if (isEdit) {
                const updCarModel = new FormData();
                updCarModel.append("modelName", values["modelName"]);
                updCarModel.append("description", values["description"]);
                updCarModel.append("year", values["year"]);
                updCarModel.append("status", values["status"] === 'Active' ? true : false);
                updCarModel.append("fuelType", values["fuelType"]);
                dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

                validation.resetForm();
            } else {
                if (onFormSubmit) {
                    const basicInformation = {
                        onRoadPrice: values.onRoadPrice,
                        userRating: values.userRating,
                        startEmiAmount: values.startEmiAmount,
                        startInsuranceAmount: values.startInsuranceAmount,
                        serviceCost: values.serviceCost,
                        fuelType: values.fuelType
                    }
                    const basicCarData = {
                        name: values.variantName,
                        carModel: values.carModel,
                        status: values.variantStatus === 'Active' ? true : false,
                        basicInformation
                    }
                    onFormSubmit(basicCarData, values.selectedFiles);
                }
            }
        },
        handleError: e => { },
    });

    const { carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch, carModels]);

    // function handleAcceptedFiles(newFiles) {
    //     // Combine old and new files
    //     let combinedFiles = [...validation.values.selectedFiles, ...newFiles];
      
    //     // Check if the combined files exceed 5
    //     if (combinedFiles.length > 5) {
    //       alert("You can only upload up to 5 images");
    //       combinedFiles = combinedFiles.slice(0, 5); // Keep only the first 5 files
    //     }
      
    //     // Add properties to the new files
    //     const formattedFiles = combinedFiles.map(file =>
    //       Object.assign(file, {
    //         preview: URL.createObjectURL(file),
    //         formattedSize: formatBytes(file.size),
    //       })
    //     );

    //     validation.setFieldValue("selectedFiles", formattedFiles);
    //     // setselectedFiles(formattedFiles);
    //   }
      
    

    /**
 * Formats the size
 */
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }

    return (
        <React.Fragment>
            <div>
                <CardTitle>Basic information</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label
                                    htmlFor="variantName"
                                    className="col-form-label"
                                >
                                    Variant Name <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="variantName"
                                        id="variantName"
                                        placeholder="Enter your Variant name"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.variantName}
                                    />
                                    {validation.touched
                                        .variantName &&
                                        validation.errors
                                            .variantName ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .variantName
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    Car Model <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="select"
                                        name="carModel"
                                        id="carModel"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.carModel}
                                    >
                                        <option value="">Select a Car Brand</option>
                                        {carModels?.map((carModel, index) => (
                                            <option key={index} value={carModel._id}>
                                                {carModel.modelName}
                                            </option>
                                        ))}
                                    </Input>

                                    {validation.touched
                                        .carModel &&
                                        validation.errors
                                            .carModel ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .carModel
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    Status <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="select"
                                        name="variantStatus"
                                        id="variantStatus"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.variantStatus}
                                    >
                                        <option>Active</option>
                                        <option>InActive</option>
                                    </Input>

                                    {validation.touched
                                        .status &&
                                        validation.errors
                                            .variantStatus ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .variantStatus
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    On Road Price <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        name="onRoadPrice"
                                        id="onRoadPrice"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.onRoadPrice}
                                    >
                                    </Input>

                                    {validation.touched
                                        .onRoadPrice &&
                                        validation.errors
                                            .onRoadPrice ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .onRoadPrice
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    User Rating <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="number"
                                        name="userRating"
                                        id="userRating"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.userRating}
                                    >
                                    </Input>

                                    {validation.touched
                                        .userRating &&
                                        validation.errors
                                            .userRating ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .userRating
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    Start EMI Amount <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        name="startEmiAmount"
                                        id="startEmiAmount"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.startEmiAmount}
                                    >
                                    </Input>

                                    {validation.touched
                                        .startEmiAmount &&
                                        validation.errors
                                            .startEmiAmount ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .startEmiAmount
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    Start Insurance Amount <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        name="startInsuranceAmount"
                                        id="startInsuranceAmount"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.startInsuranceAmount}
                                    >
                                    </Input>

                                    {validation.touched
                                        .startInsuranceAmount &&
                                        validation.errors
                                            .startInsuranceAmount ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .startInsuranceAmount
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col lg="6">
                            <FormGroup className="mb-4" row>
                                <Label className="form-label">
                                    Service Cost <span style={{ color: 'red' }}>*</span>
                                </Label>
                                <Col md="10">
                                    <Input
                                        type="text"
                                        name="serviceCost"
                                        id="serviceCost"
                                        onChange={validation.handleChange}
                                        onBlur={validation.handleBlur}
                                        value={validation.values.serviceCost}
                                    >
                                    </Input>

                                    {validation.touched
                                        .serviceCost &&
                                        validation.errors
                                            .serviceCost ? (
                                        <FormFeedback type="invalid">
                                            {
                                                validation.errors
                                                    .serviceCost
                                            }
                                        </FormFeedback>
                                    ) : null}
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                    <Col lg="6">
                    <FormGroup className="mb-4" row>
                        <Label htmlFor="fuelType">Fuel Type</Label>
                            <Input
                            type="select"
                            className="form-control"
                            name="fuelType"
                            id="fuelType"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.fuelType}
                        >
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </Input>
                    </FormGroup>
                </Col>
                    </Row>
                    {/* <Row>
                        <Col className="col-12">
                                    <h6 className="card-title">Upload Car Variant Images</h6>
                                    <p>Maximum 5 Images to be uploaded.</p>
                                    <Form>
                                        <Dropzone
                                            onDrop={acceptedFiles => {
                                                handleAcceptedFiles(acceptedFiles)
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
                                                        <h4>Drop files here or click to upload.</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </Dropzone>
                                        <div className="dropzone-previews mt-3" id="file-previews">
                                            {validation.values.selectedFiles.map((f, i) => {
                                                return (
                                                    <Card
                                                        className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                                                        key={i + "-file"}
                                                    >
                                                        <div className="p-2">
                                                            <Row className="align-items-center">
                                                                <Col className="col-auto">
                                                                    <img
                                                                        data-dz-thumbnail=""
                                                                        height="80"
                                                                        className="avatar-sm rounded bg-light"
                                                                        alt={f.name}
                                                                        src={f.preview}
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                    <Link
                                                                        to="#"
                                                                        className="text-muted font-weight-bold"
                                                                    >
                                                                        {f.name}
                                                                    </Link>
                                                                    <p className="mb-0">
                                                                        <strong>{f.formattedSize}</strong>
                                                                    </p>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </Form>
                           
                        </Col>
                    </Row> */}
                    <Button type="submit" color="primary" className={
                        !validation.isValid ? "next disabled" : "next"
                    }>Next</Button>
                </Form>
            </div>


        </React.Fragment>
    )
}

export default BasicCarVariant
