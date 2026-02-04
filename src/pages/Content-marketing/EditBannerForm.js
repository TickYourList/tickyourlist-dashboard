import React from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { editBanner } from "store/banners/bannerActions";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Row,
  Col,
} from "reactstrap";

const EditBannerForm = ({ isOpen, toggle, banner }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      buttonText: banner?.buttonText || "",
      sortOrder: banner?.sortOrder ?? 0,
      status: banner?.groupStatus ?? true,
    },
    validationSchema: Yup.object({
      sortOrder: Yup.number()
        .typeError("Sort order must be a number.")
        .min(0, "Sort order must be 0 or more.")
        .required("Sort order is required."),
    }),
    onSubmit: values => {
      if (!banner) return;

      const existingSlides = Array.isArray(banner.allSlides) ? banner.allSlides : [];
      const updatedSlides = existingSlides.length
        ? existingSlides.map((slide, index) => {
            const isCurrentSlide = slide?._id
              ? String(slide._id) === String(banner._id)
              : index === banner.slideIndex;

            if (!isCurrentSlide) return slide;

            return {
              ...slide,
              title: values.title || undefined,
              subtitle: values.subtitle || undefined,
              buttonText: values.buttonText || undefined,
              sortOrder: Number(values.sortOrder),
            };
          })
        : [
            {
              ...banner,
              title: values.title || undefined,
              subtitle: values.subtitle || undefined,
              buttonText: values.buttonText || undefined,
              sortOrder: Number(values.sortOrder),
            },
          ];

      dispatch(
        editBanner({
          isHomeScreen: banner.isHomeScreen,
          cityCode: banner.cityCode,
          status: values.status,
          slides: updatedSlides,
        }),
      );

      toggle();
    },
  });

  if (!banner) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Banner</ModalHeader>
      <Form
        onSubmit={event => {
          event.preventDefault();
          validation.handleSubmit();
        }}
      >
        <ModalBody>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label>Banner Type</Label>
                <Input
                  type="text"
                  value={banner.isHomeScreen ? "Worldwide" : "City"}
                  disabled
                />
              </FormGroup>
            </Col>
            {!banner.isHomeScreen && (
              <Col xs="12">
                <FormGroup>
                  <Label>City Code</Label>
                  <Input type="text" value={banner.cityCode || ""} disabled />
                </FormGroup>
              </Col>
            )}
            <Col xs="12">
              <FormGroup>
                <Label>Title</Label>
                <Input
                  name="title"
                  value={validation.values.title}
                  onChange={validation.handleChange}
                />
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Subtitle</Label>
                <Input
                  name="subtitle"
                  value={validation.values.subtitle}
                  onChange={validation.handleChange}
                />
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Button Text</Label>
                <Input
                  name="buttonText"
                  value={validation.values.buttonText}
                  onChange={validation.handleChange}
                />
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  min="0"
                  name="sortOrder"
                  value={validation.values.sortOrder}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    !!(validation.touched.sortOrder && validation.errors.sortOrder)
                  }
                />
                {validation.touched.sortOrder && validation.errors.sortOrder ? (
                  <FormFeedback type="invalid">
                    {validation.errors.sortOrder}
                  </FormFeedback>
                ) : null}
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Status</Label>
                <Input
                  type="select"
                  name="status"
                  value={String(validation.values.status)}
                  onChange={event =>
                    validation.setFieldValue(
                      "status",
                      event.target.value === "true",
                    )
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="primary">
            Update Banner
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default EditBannerForm;
