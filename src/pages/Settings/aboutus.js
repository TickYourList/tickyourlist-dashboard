import React, { useState } from "react";
import {
  Form,
  Card,
  CardBody,
  Col,
  Row,
  CardTitle,
  Container,
  Button
} from "reactstrap";

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from "axios";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from 'react-dropzone';

const AboutUs = () => {
  document.title = "About Us | Scrollit";

  const [files, setFiles] = useState([]);

  const formik = useFormik({
    initialValues: {
      aboutus: '',
    },
    validationSchema: Yup.object({
      aboutus: Yup.string().required("Please Enter About Us"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('aboutus', values.aboutus);
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      axios.post("YOUR_API_ENDPOINT", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          console.log("Data successfully sent to API:", response.data);
        })
        .catch(error => {
          console.error("There was an error sending the data!", error);
        });
    },
  });

  const handleCkeditorChange = (event, editor) => {
    const data = editor.getData();
    formik.setFieldValue("aboutus", data);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles);
    }
  });

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
                    <CardTitle className="h4">About Us</CardTitle>
                    <p className="card-title-desc">
                      Please write About Us Details!!
                    </p>
                    <CKEditor
                      editor={ClassicEditor}
                      data=""
                      onReady={editor => {
                        console.log('Editor is ready to use!', editor);
                      }}
                      onChange={handleCkeditorChange}
                    />
                    {formik.touched.aboutus && formik.errors.aboutus ? (
                      <div className="text-danger">{formik.errors.aboutus}</div>
                    ) : null}

                    <div {...getRootProps({ className: 'dropzone' })} className="mt-3">
                      <input {...getInputProps()} />
                      <p>Drag & drop some files here, or click to select files</p>
                    </div>
                    <div>
                      {files.map(file => (
                        <p key={file.path}>{file.path} - {file.size} bytes</p>
                      ))}
                    </div>
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
