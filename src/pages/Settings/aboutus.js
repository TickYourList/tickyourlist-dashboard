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
     <>hi</>
    </React.Fragment>
  );
};

export default withRouter(AboutUs);
