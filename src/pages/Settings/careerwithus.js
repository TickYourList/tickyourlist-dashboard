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

const CareerWithUs = () => {

  //meta title
  document.title = "Profile | Scrollit";

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
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      phoneNumber: phoneNumber || '',
      idx: idx || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Please Enter Your First Name"),
      lastName: Yup.string().required("Please Enter Your Last Name"),
      phoneNumber: Yup.string().required("Please Enter Your Phone Number"),
    }),
    onSubmit: (values) => {
      const newProfileRecord = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: String(values.phoneNumber)
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
          <Breadcrumb title="Scrollit" breadcrumbItem="Profile" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="ms-3">
                      <img
                        src={avatar}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">
                        <h5>{name}</h5>
                        <p className="mb-1">{email}</p>
                        <p className="mb-0">Id no: #{idx}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h4 className="card-title mb-4">Change User Name</h4>

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
                  <Label className="form-label">First Name</Label>
                  <Input
                    name="firstName"
                    // value={name}
                    className="form-control"
                    placeholder="Enter First Name"
                    type="text"
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
                <div className="form-group mt-3">
                  <Label className="form-label">Last Name</Label>
                  <Input
                    name="lastName"
                    // value={name}
                    className="form-control"
                    placeholder="Enter Last Name"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.lastName || ""}
                    invalid={
                      validation.touched.lastName && validation.errors.lastName ? true : false
                    }
                  />
                  {validation.touched.lastName && validation.errors.lastName ? (
                    <FormFeedback type="invalid">{validation.errors.lastName}</FormFeedback>
                  ) : null}
                  <Input name="idx" value={idx} type="hidden" />
                </div>
                <div className="form-group mt-3">
                  <Label className="form-label">Email</Label>
                  <Input
                    name="email"
                    // value={name}
                    className="form-control"
                    placeholder="Enter Email"
                    type="text"
                    disabled
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.email || ""}
                    invalid={
                      validation.touched.email && validation.errors.email ? true : false
                    }
                  />
                  {validation.touched.email && validation.errors.email ? (
                    <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                  ) : null}
                  <Input name="idx" value={idx} type="hidden" />
                </div>
                <div className="form-group mt-3">
                  <Label className="form-label">Phone Number</Label>
                  <Input
                    name="phoneNumber"
                    // value={name}
                    className="form-control"
                    placeholder="Enter Phone Number"
                    type="text"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.phoneNumber || ""}
                    maxLength={10}
                    invalid={
                      validation.touched.phoneNumber && validation.errors.phoneNumber ? true : false
                    }
                  />
                  {validation.touched.phoneNumber && validation.errors.phoneNumber ? (
                    <FormFeedback type="invalid">{validation.errors.phoneNumber}</FormFeedback>
                  ) : null}
                  <Input name="idx" value={idx} type="hidden" />
                </div>
                <div className="text-center mt-4">
                  <Button type="submit" color="danger">
                    Update User Details
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

export default withRouter(CareerWithUs);
