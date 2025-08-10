import React from "react";
import { Formik, Form, FieldArray } from "formik";
import { Button, Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { addNewBanner } from "store/banners/bannerActions";
import { useDispatch } from "react-redux"
import * as Yup from "yup"
import BannerFormRow from "./BannerFormRow"; 

const bannerValidationSchema = Yup.object({
  banners: Yup.array().of(
    Yup.object().shape({
      cityId: Yup.string().required("A city must be selected."),
      mediaFile: Yup.mixed().required("An image or video file is required.").nullable(),
    })
  )
});
  
const AddBannerForm = ({ onCancel }) => {
  const dispatch = useDispatch()
  const initialValues = {
    banners: [{ cityId: "", tourId: "", categoryId: "", subcategoryId: "", collectionId: "", mediaFile: null }],
  };

   const handleSubmit = (values, { resetForm }) => {
 
  values.banners.forEach(banner => {
    // 1. Create a FormData object for each banner row
    const formData = new FormData();

    // 2. Append all the necessary fields
    formData.append('cityId', banner.cityId);
    formData.append('tourId', banner.tourId);
    formData.append('categoryId', banner.categoryId);
    formData.append('subcategoryId', banner.subcategoryId);
    formData.append('collectionId', banner.collectionId);

    // 3. Append the file if it exists
    if (banner.mediaFile) {
      formData.append('media', banner.mediaFile);
    }
    
    // 4. Dispatch the action with the FormData object
    dispatch(addNewBanner(formData));
  });

  resetForm(); 
  onCancel();  
};

  return (
    <Card>
      <CardHeader><h4 className="card-title mb-0">Add New Banners</h4></CardHeader>
      <CardBody>
        <Formik initialValues={initialValues} validationSchema={bannerValidationSchema} onSubmit={handleSubmit}>
          {({ values, setFieldValue, setFieldTouched, errors, touched }) => (
            <Form>
              <FieldArray name="banners">
                {({ push, remove }) => (
                  <div>
                    {values.banners.map((banner, index) => (
                      <Row key={index} className="align-items-center mb-3">
                        <Col>
                          <BannerFormRow
                            index={index}
                            values={values}
                            setFieldValue={setFieldValue}
                            errors={errors}
                            touched={touched}
                            setFieldTouched={setFieldTouched}
                          />
                        </Col>
                        <Col xs="auto" className="align-self-end mb-3">
                          <Button color="danger" onClick={() => remove(index)}>Delete</Button>
                        </Col>
                      </Row>
                    ))}
                    <Button color="success" onClick={() => push({ cityId: "", tourId: "", categoryId: "", subcategoryId: "", collectionId: "", mediaUrl: "" })}>
                      Add Another Banner
                    </Button>
                  </div>
                )}
              </FieldArray>
              <hr className="my-4" />
              <Button type="submit" color="primary">Submit Banners</Button>
              <Button type="button" color="secondary" className="ms-2" onClick={onCancel}>Cancel</Button>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
};

export default AddBannerForm;