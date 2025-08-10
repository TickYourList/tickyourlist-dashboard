import React from "react";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { editBanner } from "store/banners/bannerActions";
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, FormFeedback, Row, Col, Card, CardImg
} from "reactstrap";

const EditBannerForm = ({ isOpen, toggle, banner }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    
    enableReinitialize: true, 

    initialValues: {
      cityCode: banner?.cityCode || "",
      isHomeScreen: banner?.isHomeScreen || false,
      status: banner?.status === "Active",
      bannerFile: null, // field to hold the new file
    },

    validationSchema: Yup.object({
      cityCode: Yup.string().required("City Code is required"),
    }),

    // The logic to build and dispatch the FormData
    onSubmit: (values) => {
      const formData = new FormData();

      // 1. Append the updated banner properties
      formData.append('cityCode', values.cityCode);
      formData.append('isHomeScreen', values.isHomeScreen);
      formData.append('status', values.status);

      // 2. If a new banner image was selected, append it
      if (values.bannerFile) {
        formData.append('bannerImage', values.bannerFile);
      }
      console.log("ID being sent to edit action:", banner?._id);
      // 3. Dispatch the action with the banner ID and the FormData
      dispatch(editBanner(banner._id, formData));
      toggle();
    },
  });

  if (!banner) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} >
      <ModalHeader toggle={toggle}>Edit Home Banner</ModalHeader>
      <Form onSubmit={(e) => { e.preventDefault(); validation.handleSubmit(); }}>
        <ModalBody>
          <Row>
            <Col xs="12">
              <FormGroup>
                <Label>Upload New Image (Optional)</Label>
                <Input 
                  type="file" 
                  name="bannerFile" 
                  onChange={(e) => validation.setFieldValue('bannerFile', e.currentTarget.files[0])} 
                  accept="image/*,video/*"
                />
                {validation.values.bannerFile && (
                  <Card className="mt-2">
                    <CardImg top src={URL.createObjectURL(validation.values.bannerFile)} alt="New Banner Preview" />
                  </Card>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs="12">
              <FormGroup>
                <Label>City Code</Label>
                <Input name="cityCode" value={validation.values.cityCode} onChange={validation.handleChange} onBlur={validation.handleBlur} invalid={!!(validation.touched.cityCode && validation.errors.cityCode)} />
                {validation.touched.cityCode && validation.errors.cityCode ? <FormFeedback type="invalid">{validation.errors.cityCode}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Banner Type</Label>
                <Input type="select" name="isHomeScreen" value={validation.values.isHomeScreen} onChange={validation.handleChange}>
                  <option value={false}>City</option>
                  <option value={true}>Worldwide</option>
                </Input>
              </FormGroup>
            </Col>
            <Col xs="12">
              <FormGroup>
                <Label>Status</Label>
                <Input type="select" name="status" value={validation.values.status} onChange={validation.handleChange}>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="primary">Update Banner</Button>
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default EditBannerForm;