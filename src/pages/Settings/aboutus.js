import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

//redux
import { useSelector, useDispatch } from "react-redux";
import withRouter from "components/Common/withRouter";

//Import Breadcrumb
import Breadcrumb from "../../components/Common/Breadcrumb";

import avatar from "../../assets/images/users/avatar-1.jpg";
// actions
import { editProfile, resetProfileFlag } from "../../store/actions";
import termsandconditions from "./termsandconditions";

const AboutUs = () => {

  //meta title
  document.title = "About | Scrollit";

  const dispatch = useDispatch();

  const [email, setemail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idx, setidx] = useState(1);

  const { error, success } = useSelector(state => ({
    error: state.Profile.error,
    success: state.Profile.success,
  }));

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
      if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
        setname(obj.displayName);
        setemail(obj.email);
        setidx(obj.uid);
      } else if (
        process.env.REACT_APP_DEFAULTAUTH === "fake" ||
        process.env.REACT_APP_DEFAULTAUTH === "jwt"
      ) {
        setFirstName(obj.data.user.firstName);
        setLastName(obj.data.user.lastName);
        setemail(obj.data.user.email);
        setPhoneNumber(obj.data.user.phoneNumber);
        setidx(obj.data.user._id);
      }
      const timer = setTimeout(() => {
        dispatch(resetProfileFlag());
      }, 3000);

      return () => {
        clearTimeout(timer);
      }
    }
  }, [dispatch, success]);

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      aboutus: aboutus || '',
      termsAndConditions: termsandconditions || '',
      privacyPolicy: privacyPolicy || '',
      corporatePolicy: corporatePolicy || '',
      investors: investors || '',
      advertisewithus: advertisewithus || ''
    },
    validationSchema: Yup.object({
      aboutus: Yup.string().required("Please Enter About Us"),
      termsandconditions: Yup.string().required("Please Enter Terms and Conditions"),
      privacyPolicy: Yup.string().required("Please Enter PrivacyPolicy"),
      corporatePolicy: Yup.string().required("Please Enter corporatePolicy"),
      investors: Yup.string().required("Please Enter investors"),
    }),
    onSubmit: (values) => {
      const newProfileRecord = {
        abboutus: values.aboutus,
      }
      dispatch(editProfile(newProfileRecord, values.idx));
    }
  });

  useEffect(() => {
    if(success) {
      const user = JSON.parse(localStorage.getItem('authUser'));
      user.data.user.firstName = success.data.user.firstName;
      user.data.user.lastName = success.data.user.lastName;
      user.data.user.phoneNumber = success.data.user.phoneNumber;
      localStorage.setItem('authUser', JSON.stringify(user));
    }
  }, [success]);


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumb */}
          <Breadcrumb title="Scrollit" breadcrumbItem="About" />

          <Card>
            <CardBody>
              <Form
                className="form-horizontal"
                onSubmit={(e) => {
                  e.preventDefault();
                  validation.handleSubmit();
                  return false;
                }}
              >
                <div className="form-group">
                  <Label className="form-label">About Us</Label>
                  <Input
                    name="aboutus"
                    className="form-control"
                    placeholder="Enter First Name"
                    type="textarea"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.firstName || ""}
                    invalid={
                      validation.touched.firstName && validation.errors.firstName ? true : false
                    }
                  />
                  {validation.touched.firstName && validation.errors.firstName ? (
                    <FormFeedback type="invalid">{validation.errors.firstName}</FormFeedback>
                  ) : null}
                  <Input name="idx" value={idx} type="hidden" />
                </div>
                <div className="text-center mt-4">
                  <Button type="submit" color="danger">
                    Update About Us
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(AboutUs);
