import React, { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isEmpty } from "lodash";
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from '../../../components/Common/DeleteModal';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { BlogId, BlogName, CarBrand, CarModel, Status } from "./CarBlogsCol";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import {
  Button, Col, Row, UncontrolledTooltip, Card, CardBody,
  Modal, ModalHeader, ModalBody, Form, Label, Input,
  FormFeedback, FormGroup,
} from "reactstrap";
import CarBlogDetail from "./CarBlogDetail";
import {
  addNewCarBlog, deleteAllCarBlogs, deleteCarBlog, getCarBlogs,
  getCarModelsByBrand, updateCarBlog
} from "store/automobiles/carBlogs/actions";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { getCarVariants } from "store/automobiles/carVariants/actions";
import { getCarModels } from "store/automobiles/carModels/actions";
import { getCarBrands } from "store/actions";

function CarBlogs() {
  document.title = "Car blogs | Scrollit";

  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [carBlog, setCarBlog] = useState(null);
  const [carBlogData, setCarBlogData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [carBlogsList, setCarBlogsList] = useState([]);
  const [isCarModelLoading, setIsCarModelLoading] = useState(false);

  const dispatch = useDispatch();

  const { carBlogs, carModels, carBrands, carVariants } = useSelector(state => ({
    carBlogs: state.CarBlog.carBlogs,
    carModels: state.CarBlog.carModels,
    carBrands: state.CarBrand.carBrands,
    carVariants: state.carVariant.carVariants
  }));

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: (carBlog && carBlog.title) || "",
      tagline: (carBlog && carBlog.tagline) || "",
      carBrand: (carBlog && carBlog.carBrand && carBlog.carBrand._id) || "",
      carModel: (carBlog && carBlog.carModel && carBlog.carModel._id) || "",
      content: (carBlog && carBlog.content) || "",
      sections: (carBlog && carBlog.sections) || [],
      publishDate: (carBlog && carBlog.publishDate) || new Date().toISOString().split('T')[0],
      status: (carBlog && carBlog.status ? 'Active' : 'InActive') || "",
      urlSlug: (carBlog && carBlog.urlSlug) || "",
      mainImage: null,
      metaTitle: (carBlog && carBlog.metaTitle) || "",
      metaDescription: (carBlog && carBlog.metaDescription) || ""
      // relatedNews: (carBlog && carBlog.relatedNews) || [],
      // trendingCars: (carBlog && carBlog.trendingCars) || [],
    },
    // validationSchema: Yup.object({
    //   title: Yup.string().required("Please Enter Blog Title"),
    //   tagline: Yup.string().required("Please Enter Blog Tagline"),
    //   carBrand: Yup.string().required("Please Select Car Brand"),
    //   carModel: Yup.string().required("Please Select Car Model"),
    //   content: Yup.string().required("Please Enter Blog Content"),
    //   sections: Yup.array().of(
    //     Yup.object().shape({
    //       title: Yup.string().required("Section Title is required"),
    //       content: Yup.string().required("Section Content is required"),
    //     })
    //   ),
    //   publishDate: Yup.date().required("Please Enter Publish Date"),
    //   status: Yup.string().required("Please Select Status"),
    //   urlSlug: Yup.string().required("Please Enter URL Slug"),
    //   mainImage: Yup.mixed().required("Please Upload Main Image"),
    //   relatedNews: Yup.array().of(
    //     Yup.object().shape({
    //       title: Yup.string().required("News Title is required"),
    //       url: Yup.string().url("Invalid URL").required("News URL is required"),
    //     })
    //   ),
    //   trendingCars: Yup.array().of(
    //     Yup.object().shape({
    //       name: Yup.string().required("Car Name is required"),
    //       price: Yup.string().required("Car Price is required"),
    //     })
    //   ),
    // }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        title: values.title,
        tagline: values.tagline,
        carBrand: values.carBrand,
        carModel: values.carModel,
        content: values.content,
        sections: values.sections,
        publishDate: values.publishDate,
        status: values.status,
        urlSlug: values.urlSlug,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription
        // relatedNews: values.relatedNews,
        // trendingCars: values.trendingCars,
      }));

      if (values.mainImage) {
        formData.append('mainImage', values.mainImage);
      }

      values.sections.forEach((section, index) => {
        if (section.image) {
          formData.append(`sectionImage`, section.image);
        }
      });
      // values.relatedNews.forEach((news, index) => {
      //   if (news.image) {
      //     formData.append(`relatedNewsImage${index}`, news.image);
      //   }
      // });

      // values.trendingCars.forEach((car, index) => {
      //   if (car.image) {
      //     formData.append(`trendingCarImage${index}`, car.image);
      //   }
      // });

      // if (isEdit) {
      //   dispatch(updateCarBlog(carBlog._id, formData));
      // } else {
        dispatch(addNewCarBlog(formData));
      // }

      validation.resetForm();
      toggle();
    },
  });

  const toggleViewModal = useCallback(() => setModal1(!modal1), [modal1]);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCarBlog(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const handleCarBlogClick = useCallback((arg) => {
    const blog = arg;
    setCarBlog(blog);
    setIsEdit(true);
    toggle();
  }, [toggle]);

  const handleCarBrandChange = useCallback((selectedBrandId) => {
    setIsCarModelLoading(true);
    dispatch(getCarModelsByBrand(selectedBrandId));
    validation.setFieldValue("carBrand", selectedBrandId);
    validation.setFieldValue("carModel", "");
  }, [dispatch, validation]);

  const onClickDelete = useCallback((blog) => {
    setCarBlog(blog);
    setDeleteModal(true);
  }, []);

  const handleDeleteCarBlog = useCallback(() => {
    if (carBlog && carBlog._id) {
      dispatch(deleteCarBlog(carBlog));
    } else {
      dispatch(deleteAllCarBlogs());
    }
    setDeleteModal(false);
  }, [dispatch, carBlog]);

  const handleAddCarBlogClick = () => {
    console.log("asasasas ");
    setCarBlog("");
    setIsEdit(true);
    toggle();
  };

  useEffect(() => {
    dispatch(getCarBlogs());
    dispatch(getCarVariants());
    dispatch(getCarBrands());
    dispatch(getCarModels());
  }, [dispatch]);

  useEffect(() => {
    if (carModels.length > 0) {
      setIsCarModelLoading(false);
    }
  }, [carModels]);

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
        filterable: true,
        Cell: (cellProps) => {
          return <BlogId {...cellProps} />;
        }
      },
      {
        Header: 'Blog Name',
        accessor: 'title',
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
              onClick={() => {
                const blogData = cellProps.row.original;
                setCarBlogData(blogData);
                toggleViewModal();
              }}
            >
              View Blog Details
            </Button>
          );
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
                  const blogData = cellProps.row.original;
                  handleCarBlogClick(blogData);
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
                  const blogData = cellProps.row.original;
                  onClickDelete(blogData);
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
    [handleCarBlogClick, onClickDelete, toggleViewModal]
  );

  return (
    <React.Fragment>
      <CarBlogDetail isOpen={modal1} toggle={toggleViewModal} data={carBlogData} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCarBlog}
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
          {!!isEdit ? "Edit Car Blog" : "Add Car Blog"}
        </ModalHeader>
        <ModalBody>
          <FormikProvider value={validation}>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                validation.handleSubmit();
                return false;
              }}
            >
              <Row form>
                <Col className="col-12">
                  <div className="mb-3">
                    <Label htmlFor="mainImage">Main Image</Label>
                    <Input
                      id="mainImage"
                      name="mainImage"
                      type="file"
                      onChange={(event) => {
                        validation.setFieldValue("mainImage", event.currentTarget.files[0]);
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Blog Title</Label>
                    <Input
                      name="title"
                      type="text"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.title || ""}
                      invalid={
                        validation.touched.title && validation.errors.title ? true : false
                      }
                    />
                    {validation.touched.title && validation.errors.title ? (
                      <FormFeedback type="invalid">{validation.errors.title}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Meta Title</Label>
                    <Input
                      name="metaTitle"
                      type="text"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.metaTitle || ""}
                      invalid={
                        validation.touched.metaTitle && validation.errors.metaTitle ? true : false
                      }
                    />
                    {validation.touched.metaTitle && validation.errors.metaTitle ? (
                      <FormFeedback type="invalid">{validation.errors.metaTitle}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Meta Description</Label>
                    <Input
                      name="metaDescription"
                      type="text"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.metaDescription || ""}
                      invalid={
                        validation.touched.metaDescription && validation.errors.metaDescription ? true : false
                      }
                    />
                    {validation.touched.metaDescription && validation.errors.metaDescription ? (
                      <FormFeedback type="invalid">{validation.errors.metaDescription}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Blog Tagline</Label>
                    <Input
                      name="tagline"
                      type="text"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.tagline || ""}
                      invalid={
                        validation.touched.tagline && validation.errors.tagline ? true : false
                      }
                    />
                    {validation.touched.tagline && validation.errors.tagline ? (
                      <FormFeedback type="invalid">{validation.errors.tagline}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Car Brand</Label>
                    <Input
                      type="select"
                      name="carBrand"
                      onChange={(e) => handleCarBrandChange(e.target.value)}
                      onBlur={validation.handleBlur}
                      value={validation.values.carBrand || ""}
                      invalid={
                        validation.touched.carBrand && validation.errors.carBrand ? true : false
                      }
                    >
                      <option value="">Select Car Brand</option>
                      {carBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.brandName}
                        </option>
                      ))}
                    </Input>
                    {validation.touched.carBrand && validation.errors.carBrand ? (
                      <FormFeedback type="invalid">{validation.errors.carBrand}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Car Model</Label>
                    <Input
                      type="select"
                      name="carModel"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.carModel || ""}
                      invalid={
                        validation.touched.carModel && validation.errors.carModel ? true : false
                      }
                      disabled={isCarModelLoading}
                    >
                      <option value="">Select Car Model</option>
                      {carModels.map((model) => (
                        <option key={model._id} value={model._id}>
                          {model.modelName}
                        </option>
                      ))}
                    </Input>
                    {validation.touched.carModel && validation.errors.carModel ? (
                      <FormFeedback type="invalid">{validation.errors.carModel}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Blog Content</Label>
                    <Input
                      name="content"
                      type="textarea"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.content || ""}
                      invalid={
                        validation.touched.content && validation.errors.content ? true : false
                      }
                    />
                    {validation.touched.content && validation.errors.content ? (
                      <FormFeedback type="invalid">{validation.errors.content}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">URL Slug</Label>
                    <Input
                      name="urlSlug"
                      type="text"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.urlSlug || ""}
                      invalid={
                        validation.touched.urlSlug && validation.errors.urlSlug ? true : false
                      }
                    />
                    {validation.touched.urlSlug && validation.errors.urlSlug ? (
                      <FormFeedback type="invalid">{validation.errors.urlSlug}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Publish Date</Label>
                    <Input
                      name="publishDate"
                      type="date"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.publishDate || ""}
                      invalid={
                        validation.touched.publishDate && validation.errors.publishDate ? true : false
                      }
                    />
                    {validation.touched.publishDate && validation.errors.publishDate ? (
                      <FormFeedback type="invalid">{validation.errors.publishDate}</FormFeedback>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <Label className="form-label">Status</Label>
                    <Input
                      name="status"
                      type="select"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.status || ""}
                      invalid={
                        validation.touched.status && validation.errors.status ? true : false
                      }
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Input>
                    {validation.touched.status && validation.errors.status ? (
                      <FormFeedback type="invalid">{validation.errors.status}</FormFeedback>
                    ) : null}
                  </div>
                  
                  <FieldArray name="sections">
                    {({ push, remove }) => (
                      <div>
                        {validation.values.sections.map((section, index) => (
                          <div key={index} className="mb-3">
                            <h5>Section {index + 1}</h5>
                            <div className="mb-2">
                              <Label>Title</Label>
                              <Input
                                name={`sections[${index}].title`}
                                type="text"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={section.title}
                              />
                            </div>
                            <div className="mb-2">
                              <Label>Content</Label>
                              <Input
                                name={`sections[${index}].content`}
                                type="textarea"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={section.content}
                              />
                            </div>
                            <div className="mb-2">
                              <Label>Image</Label>
                              <Input
                                type="file"
                                onChange={(event) => {
                                  validation.setFieldValue(`sections[${index}].image`, event.currentTarget.files[0]);
                                }}
                              />
                            </div>
                            <Button type="button" color="danger" onClick={() => remove(index)}>Remove Section</Button>
                          </div>
                        ))}
                        <Button type="button" color="primary" onClick={() => push({ title: '', content: '', image: null })}>
                          Add Section
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="text-end">
                    <button type="submit" className="btn btn-success save-user">
                      Save
                    </button>
                  </div>
                </Col>
              </Row>
            </Form>
          </FormikProvider>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
}

CarBlogs.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default CarBlogs;