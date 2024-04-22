import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';

import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import {
} from "../../../store/e-commerce/actions";

import {
  BlogId,
  BlogName,
  CarBrand,
  CarModel,
  Status,
}
  from "./CarBlogsCol";
import * as Yup from "yup";

//redux
import { useSelector, useDispatch } from "react-redux";
// import CarBlogssModal from "./CarBlogssModal";

import {
  Button,
  Col,
  Row,
  UncontrolledTooltip,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Label,
  Input,
  FormFeedback,
  FormGroup,
} from "reactstrap";
import Select from "react-select";
import CarBlogDetail from "./CarBlogDetail";
import { addNewCarBlog, deleteAllCarBlogs, deleteCarBlog, getCarBlogs, getCarModelsByBrand, getCountriesList, updateCarBlog } from "store/automobiles/carBlogs/actions";
import { useFormik } from "formik";
import CarBlogModel from "./CarBlogModel";
import { getCarVariants } from "store/automobiles/carVariants/actions";
import { getCarModels } from "store/automobiles/carModels/actions";
import { getCarBrands } from "store/actions";

function CarBlogs() {

  //meta title
  document.title = "Car blogs | Scrollit";

  const [modal, setModal] = useState(false);
  const [nestedModal, setNestedModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carBlogsList, setCarBlogsList] = useState([]);
  const [carBlog, setCatBlog] = useState(null);
  const [carBlogData, setCatBlogData] = useState({});
  const [closeAll, setCloseAll] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const [blogImage, setBlogImage] = useState(null)
  const [isCarBrandLoading, setIsCarBrandLoading] = useState(true);
  const [isCarModelLoading, setIsCarModelLoading] = useState(false);

  const dispatch = useDispatch();

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      blogName: (carBlog && carBlog.blogName) || "",
      blogTagLine: (carBlog && carBlog.blogTagLine) || "",
      carBrand: (carBlog && carBlog.carBrand && carBlog.carBrand._id) || "",
      carModel: (carBlog && carBlog.carModel && carBlog.carModel._id) || "",
      status: (carBlog && carBlog.status ? 'Active' : 'InActive') || "",
      blogDescription: (carBlog && carBlog.blogDescription) || "",
      blogImage: (carBlog && carBlog?.media?.url) || "",
      urlslug: (carBlog && carBlog?.urlslug) || ""
    },
    validationSchema: Yup.object({
      blogName: Yup.string().required(
        "Please Enter Your Blog Name"
      ),
      blogTagLine: Yup.string().required(
        "Please Enter Blog tagline"
      ),
      carBrand: Yup.string().required(
        "Please Enter Your Car Brand"
      ),
      carModel: Yup.string().required(
        "Please Enter Your Car Model"
      ),
      // carVariant: Yup.string().required(
      //   "Please Enter Your Car Model"
      // ),
      blogDescription: Yup.string().required(
        "Please Enter Your Car Model"
      ),
      // blogImage: Yup.object().required(
      //   "Please Enter Your Blog Image"
      // ),
      status: Yup.string().required(
        "Please Enter Your Status"
      ),
      urlslug: Yup.string().required("Please enter slug")
    }),
    onSubmit: values => {
      const newCarBlog = new FormData();
      const blogData = {
        blogName: values.blogName,
        blogTagLine: values.blogTagLine,
        carBrand: values.carBrand,
        carModel: values.carModel,
        blogDescription: values.blogDescription,
        status: values.status,
        urlslug: values.urlslug
      };
      newCarBlog.append("data", JSON.stringify(blogData));
      if (values.blogImage) {
        newCarBlog.append("image", values.blogImage);
      }
      if (!isEdit) {
        dispatch(addNewCarBlog(newCarBlog));
        validation.resetForm();
        toggle();
      } else {
        dispatch(updateCarBlog(newCarBlog));
        validation.resetForm();
        toggle();
      }
    },
    handleError: e => { },
  });

  const toggleViewModal = () => setModal1(!modal1);

  const { carBlogs, carModels, carBrands, carVariants } = useSelector(state => ({
    carBlogs: state.CarBlog.carBlogs,
    carModels: state.CarBlog.carModels,
    carBrands: state.CarBrand.carBrands,
    carVariants: state.carVariant.carVariants
  }));

  useEffect(() => {
    if (carBlogs && !carBlogs.length) {
      dispatch(getCarBlogs());
      dispatch(getCarVariants());
      setIsCarBrandLoading(true);
      dispatch(getCarBrands());
      dispatch(getCarModels());
    }
  }, [dispatch]);

  useEffect(() => {
    setCarBlogsList(carBlogs);
  }, [carBlogs]);

  useEffect(() => {
    if (!isEmpty(carBlogs) && !!isEdit) {
      setCarBlogsList(carBlogs);
      setIsEdit(false);
    }
  }, [carBlogs]);

  useEffect(() => {
    if (carModels && carModels.length > 0) {
      setIsCarModelLoading(false);
    }
  }, [carModels])

  const resizeFile = file => {
    // setBlogImage(file);
    validation.setFieldValue('blogImage', file);
  }

  const toggle = () => {
    if (modal) {
      setModal(false);
      setCatBlog(null);
    } else {
      setModal(true);
    }
  };

  const handlecarBlogClick = arg => {
    const carBlog = arg;
    setCatBlog(carBlog);
    setIsEdit(true);

    toggle();
  };

  const handleCarBrandChange = (selectedBrandId) => {
    setIsCarModelLoading(true);
    console.log('selectedBrandId', selectedBrandId);
    dispatch(getCarModelsByBrand(selectedBrandId))
    validation.setFieldValue("carBrand", selectedBrandId);
    validation.setFieldValue("carModel", ""); // Reset car model value
  };

  //delete carBlog
  const [deleteModal, setDeleteModal] = useState(false);

  const toggleNested = () => {
    setNestedModal(!nestedModal);
    setCloseAll(false);
  };

  const toggleAll = () => {
    setNestedModal(!nestedModal);
    setCloseAll(true);
  };

  const onClickDelete = (carBlog) => {
    setCatBlog(carBlog);
    setDeleteModal(true);
  };

  const handleDeletecarBlog = () => {
    if (carBlog && carBlog._id) {
      dispatch(deleteCarBlog(carBlog));
      setDeleteModal(false);
    } else {
      dispatch(deleteAllCarBlogs(carBlog));
      setDeleteModal(false);
    }
  };
  const handleAddCarBlogClicks = () => {
    setCarBlogsList("");
    setIsEdit(false);
    toggle();
  };

  const handleCarBlogDeleteClicks = () => {
    setCatBlog();
    setDeleteModal(true);
  }

  const columns = useMemo(
    () => [

      {
        Header: 'Blog ID',
        accessor: '_id',
        width: '150px',
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: (cellProps) => {
          return <BlogId {...cellProps} />;
        }
      },
      {
        Header: 'Blog Name',
        accessor: 'blogName',
        filterable: true,
        Cell: (cellProps) => {
          return <BlogName {...cellProps} />;
        }
      },
      {
        Header: 'Car Brand',
        accessor: 'carBrand.brandName',
        filterable: true,
        Cell: (cellProps) => {
          return <CarBrand {...cellProps} />;
        }
      },
      {
        Header: 'Car Model',
        accessor: 'carModel.modelName',
        filterable: true,
        Cell: (cellProps) => {
          return <CarModel {...cellProps} />;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        filterable: true,
        Cell: (cellProps) => {
          return <Status {...cellProps} />;
        }
      },
      {
        Header: 'View Blogs',
        accessor: 'view',
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <Button
              type="button"
              color="primary"
              className="btn-sm btn-rounded"
              onClick={e => {
                toggleViewModal();
                setCatBlogData(cellProps.row.original);
              }}
            >
              View Blog Models
            </Button>);
        }
      },
      {
        Header: 'Action',
        accessor: 'action',
        disableFilters: true,
        Cell: (cellProps) => {
          return (
            <div className="d-flex gap-3">
              <Link
                to="#"
                className="text-success"
                onClick={() => {
                  const carBlogData = cellProps.row.original;
                  handlecarBlogClick(carBlogData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                <UncontrolledTooltip placement="top" target="edittooltip">
                  Edit
                </UncontrolledTooltip>
              </Link>
              <Link
                to="#"
                className="text-danger"
                onClick={() => {
                  const carBlogData = cellProps.row.original;
                  onClickDelete(carBlogData);
                }}
              >
                <i className="mdi mdi-delete font-size-18" id="deletetooltip" />
                <UncontrolledTooltip placement="top" target="deletetooltip">
                  Delete
                </UncontrolledTooltip>
              </Link>
            </div>
          );
        }
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <CarBlogDetail isOpen={modal1} toggle={toggleViewModal} Data={carBlogData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeletecarBlog}
        onCloseClick={() => setDeleteModal(false)}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Ecommerce" breadcrumbItem="Car Blogs" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={carBlogs}
                    isGlobalFilter={true}
                    isAddCarBlogOptions={true}
                    isEventAddButtonOptions={true}
                    handleAddCarBlogClicks={handleAddCarBlogClicks}
                    handleCarBlogDeleteClicks={handleCarBlogDeleteClicks}
                    customPageSize={10}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <Modal size="lg" isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle} tag="h4">
          {!!isEdit ? "Edit Car blog" : "Add New Car Blog"}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={e => {
              e.preventDefault();
              validation.handleSubmit();
              return false;
            }}
          >
            <Row form="true">
              <Col className="col-12">
                <div className="mb-3">
                  <Label className="form-label">
                    Blog Name <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="blogName"
                    id="blogName"
                    type="text"
                    validate={{
                      required: { value: true },
                    }}
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .blogName || ""
                    }
                    invalid={
                      validation.touched
                        .blogName &&
                        validation.errors
                          .blogName
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .blogName &&
                    validation.errors
                      .blogName ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .blogName
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <div className="mb-3">
                  <Label className="form-label">
                    Blog TagLine <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="blogTagLine"
                    id="blogTagLine"
                    type="text"
                    validate={{
                      required: { value: true },
                    }}
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .blogTagLine || ""
                    }
                    invalid={
                      validation.touched
                        .blogTagLine &&
                        validation.errors
                          .blogTagLine
                        ? true
                        : false
                    }
                  />
                  {validation.touched
                    .blogTagLine &&
                    validation.errors
                      .blogTagLine ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .blogTagLine
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <FormGroup>
                  <Label for="carBrand">Car Brand <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    type="select"
                    name="carBrand"
                    id="carBrand"
                    onChange={e => handleCarBrandChange(e.target.value)}
                    value={validation.values.carBrand}
                  >
                    {/* {isCarBrandLoading ? (
                      <option>Loading...</option>
                    ) : (
                      <> */}
                    <option value="">Select a Brand</option>
                    {carBrands.map(brand => (
                      <option key={brand._id} value={brand._id}>{brand.brandName}</option>
                    ))}
                    {/* </> */}
                    {/* )} */}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label for="carModel">Car Model <span style={{ color: 'red' }}>*</span></Label>
                  <Input
                    type="select"
                    name="carModel"
                    id="carModel"
                    onChange={validation.handleChange}
                    value={validation.values.carModel}
                    disabled={isCarModelLoading}
                  >
                    {isCarModelLoading ? (
                      <option>Loading...</option>
                    ) : (
                      <>
                        <option value="">Select a Model</option>
                        {carModels.map(model => (
                          <option key={model._id} value={model._id}>{model.modelName}</option>
                        ))}
                      </>
                    )}
                  </Input>
                </FormGroup>

                <div className="mb-3">
                  <Label className="form-label">
                    Blog Description <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <textarea
                    className="form-control"
                    name="blogDescription"
                    id="blogDescription"
                    placeholder="Enter your Blog Description"
                    rows="10"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.blogDescription}
                  ></textarea>
                  {validation.touched
                    .blogDescription &&
                    validation.errors
                      .blogDescription ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .blogDescription
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <div className="mb-3">
                  <Label className="form-label">
                    Url Slug <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="urlslug"
                    id="urlslug"
                    type="text"
                    validate={{
                      required: { value: true },
                    }}
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .urlslug || ""
                    }
                    invalid={
                      validation.touched
                        .urlslug &&
                        validation.errors
                          .urlslug
                        ? true
                        : false
                    }
                  />
                </div>
                <div className="mb-3">
                  <Label className="form-label">
                    Status <span style={{ color: 'red' }}>*</span>
                  </Label>
                  <Input
                    name="status"
                    type="select"
                    className="form-select"
                    onChange={
                      validation.handleChange
                    }
                    onBlur={validation.handleBlur}
                    value={
                      validation.values
                        .status || ""
                    }
                  >
                    <option>Active</option>
                    <option>InActive</option>
                  </Input>
                  {validation.touched
                    .status &&
                    validation.errors
                      .status ? (
                    <FormFeedback type="invalid">
                      {
                        validation.errors
                          .status
                      }
                    </FormFeedback>
                  ) : null}
                </div>
                <div className="mt-3 mb-3">
                  <Label for="blogImage">Blog Image <span style={{ color: 'red' }}>*</span></Label>
                  <div className="mh-50">
                    <Input
                      id="blogImage"
                      onChange={async e => {
                        if (
                          ["jpeg", "jpg", "png"].includes(
                            e.target.files[0].name.split(".").pop()
                          )
                        ) {
                          setToastDetails({
                            title: "Image Uploaded",
                            message: `${e.target.files[0].name} has been uploaded.`,
                          })
                          setToast(true)
                          validation.setFieldValue('blogImage', e.target.files[0])
                        } else {
                          setToastDetails({
                            title: "Invalid image",
                            message:
                              "Please upload images with jpg, jpeg or png extension",
                          })
                          setToast(true)
                        }
                      }}
                      type="file"
                    />
                  </div>
                  {isEdit ? <div className="d-flex text-center margin-auto"><img src={validation.values.blogImage} width={100} height={65} className="mt-3" /></div> : ""}
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-success save-user"
                    disabled={!(validation.isValid)}
                  >
                    Save
                  </button>
                </div>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
}
CarBlogs.propTypes = {
  preGlobalFilteredRows: PropTypes.any,

};


export default CarBlogs;