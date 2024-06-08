import React from "react";
import { Form, Card, CardBody, Col, Row, CardTitle, Container, Button } from "reactstrap";
import { Editor as DraftEditor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from "axios";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useFormik } from "formik";
import * as Yup from "yup";

const AboutUs = () => {
  document.title = "About Us | Scrollit";

  const formik = useFormik({
    initialValues: {
      draftContent: '',
      aboutus: '',
    },
    validationSchema: Yup.object({
      draftContent: Yup.string().required("Draft content is required"),
      aboutus: Yup.string().required("Please Enter About Us"),
    }),
    onSubmit: (values) => {
      axios.post("YOUR_API_ENDPOINT", values)
        .then(response => {
          console.log("Data successfully sent to API:", response.data);
        })
        .catch(error => {
          console.error("There was an error sending the data!", error);
        });
    },
  });

  const handleDraftChange = (contentState) => {
    formik.setFieldValue("draftContent", JSON.stringify(contentState));
  };

  const handleCkeditorChange = (event, editor) => {
    const data = editor.getData();
    formik.setFieldValue("aboutus", data);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Settings" breadcrumbItem="About Us" />

          <Form onSubmit={formik.handleSubmit}>
            <Row>
              <Col>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">react-draft-wysiwyg</CardTitle>
                    <p className="card-title-desc">
                      Simple WYSIWYG editor with react-draft-wysiwyg.
                    </p>
                    <DraftEditor
                      toolbarClassName="toolbarClassName"
                      wrapperClassName="wrapperClassName"
                      editorClassName="editorClassName"
                      onContentStateChange={handleDraftChange}
                    />
                    {formik.touched.draftContent && formik.errors.draftContent ? (
                      <div className="text-danger">{formik.errors.draftContent}</div>
                    ) : null}
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col>
                <Card>
                  <CardBody>
                    <CardTitle className="h4">CK Editor</CardTitle>
                    <p className="card-title-desc">
                      Super simple WYSIWYG editor with CKEditor.
                    </p>
                    <CKEditor
                      editor={ClassicEditor}
                      data="<p>Hello from CKEditor 5!</p>"
                      onReady={editor => {
                        console.log('Editor is ready to use!', editor);
                      }}
                      onChange={handleCkeditorChange}
                    />
                    {formik.touched.aboutus && formik.errors.aboutus ? (
                      <div className="text-danger">{formik.errors.aboutus}</div>
                    ) : null}
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Button type="submit" color="primary">Submit</Button>
          </Form>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AboutUs;
