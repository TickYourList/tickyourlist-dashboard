import React, { useEffect, useState } from "react"

import {
    Col,
    Input,
    Form,
    FormGroup,
    Label,
    CardBody,
    CardTitle,
    CardSubtitle,
    FormFeedback,
    Button,
} from "reactstrap"
import Select from "react-select"
import { Link } from "react-router-dom"
import * as Yup from "yup";

import classnames from "classnames"

import { useSelector, useDispatch } from "react-redux"
import { getCarModels } from "store/automobiles/carModels/actions"
import { useFormik } from "formik"
import Switch from "react-switch";

const ComfortAndConvenienceVariant = ({ onFormSubmit }) => {

    //meta title
    document.title = "Add Car Variant | Scrollit";

    const dispatch = useDispatch();

    const [activeTab, setactiveTab] = useState("1")
    const [selectedGroup, setselectedGroup] = useState(null)

    const [carVariant, setCarVariant] = useState([]);
    const [switch1, setswitch1] = useState(true);
    // const [carModelsList, setCarModelsList] = useState([]);

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            length: (carVariant && carVariant.comfortAndConvinience && carVariant.comfortAndConvinience.length) || "",
            width: (carVariant && carVariant.comfortAndConvinience && carVariant.comfortAndConvinience.width) || "",

        },
        // validationSchema: Yup.object({
        //     modelName: Yup.string().required(
        //         "Please Enter Your Brand Name"
        //     ),
        //     carBrand: Yup.string().required(
        //         "Please Enter Your CarBrand"
        //     ),
        //     description: Yup.string().required(
        //         "Please Enter Your description"
        //     ),
        //     year: Yup.string().required(
        //         "Please Enter Your Year"
        //     ),
        //     status: Yup.string().required(
        //         "Please Enter Your Status"
        //     )
        // }),
        onSubmit: values => {
            // if (isEdit) {
            //     const updCarModel = new FormData();
            //     updCarModel.append("modelName", values["modelName"]);
            //     updCarModel.append("description", values["description"]);
            //     updCarModel.append("year", values["year"]);
            //     updCarModel.append("status", values["status"] === 'Active' ? true : false);
            //     updCarModel.append("image", modelImage ? modelImage : "broken!");
            //     dispatch(updateCarModel(carModel._id, values['carBrand'], updCarModel));

            //     validation.resetForm();
            // } else {
            //     const newCarModel = new FormData();
            //     newCarModel.append("modelName", values["modelName"]);
            //     newCarModel.append("description", values["description"]);
            //     newCarModel.append("year", values["year"]);
            //     newCarModel.append("status", values["status"] === 'Active' ? true : false);
            //     newCarModel.append("image", modelImage ? modelImage : "broken!");
            //     dispatch(addNewCarModel(values['carBrand'], newCarModel));
            //     validation.resetForm();
            // }
            
            if(onFormSubmit) {
            onFormSubmit('comfortAndConvenience', values, '7');
            }
            console.log('values ', values);
            toggle();
        },
        handleError: e => { },
    });

    function handleSelectGroup(selectedGroup) {
        setselectedGroup(selectedGroup)
    }

    const { carBrands, countries, carModels } = useSelector(state => ({
        carModels: state.CarModel.carModels
    }));

    useEffect(() => {
        if (carModels && !carModels.length) {
            dispatch(getCarModels());
        }
    }, [dispatch]);

    // useEffect(() => {
    //     setCarModelsList(carModels);
    // }, [carModels]);

    return (
        <React.Fragment>
            <div>
                <CardTitle>Comfort And Convinience</CardTitle>
                <p className="card-title-desc">
                    Fill all information below
                </p>
                <Form onSubmit={validation.handleSubmit}>
                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="length"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Length <span style={{ color: 'red' }}>*</span>
                                                    </Label>
                                                    <Col md="10">
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="length"
                                                            id="length"
                                                            placeholder="Enter your Length"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.length}
                                                        />
                                                    </Col>
                                                </FormGroup>

                                                <FormGroup className="mb-4" row>
                                                    <Label
                                                        htmlFor="width"
                                                        md="2"
                                                        className="col-form-label"
                                                    >
                                                        Width <span style={{ color: 'red' }}>*</span>
                                                    </Label>
                                                    <Col md="10">
                                                        <Input
                                                            type="text"
                                                            className="form-control"
                                                            name="width"
                                                            id="width"
                                                            placeholder="Enter your Width"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.width}
                                                        />
                                                    </Col>
                                                </FormGroup>

                    <Button type="submit" color="primary" className={
                            !validation.isValid ? "next disabled" : "next"
                          }>Next</Button>
                </Form>
            </div>
        </React.Fragment>
    )
}

export default ComfortAndConvenienceVariant
