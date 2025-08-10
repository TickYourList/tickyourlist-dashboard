import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Label, Input, FormFeedback, Form } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { addNewCoupon } from "store/coupon/actions";

const AddCouponModal = ({ isOpen, toggle }) => {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState("");
  const today = new Date().toISOString().split('T')[0];

  const validation = useFormik({
    initialValues: {
      code: "",
      name: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minBookingAmount: "",
      maxUsage: "",
      applicableFor: "",
      startDate: "",
      endDate: "",
      description: "",
      isActive: true,
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .matches(/^[a-zA-Z0-9]{3,25}$/, "Code must be 3-25 alphanumeric characters.")
        .required("Coupon code is required"),
      discountType: Yup.string().oneOf(["PERCENTAGE", "FIXED"]).required("Discount type must be either Percentage or Fixed."),
      discountValue: Yup.number().required("Discount value is required").min(1).max(999999),
      maxDiscountAmount: Yup.number().when('discountType', {
        is: 'PERCENTAGE',
        then: schema => schema.required("Max discount required").min(1, "Must be positive").max(999999),
        otherwise: schema => schema.notRequired(),
      }),
      minBookingAmount: Yup.number().min(0, "Cannot be negative").max(999999),
      maxUsage: Yup.number().required("Usage limit is required").min(1).max(999999),
      startDate: Yup.date().required("Start date is required").min(today, "Start date can't be in the past"),
      endDate: Yup.date().required("End date is required").min(
        Yup.ref('startDate'),
        "End date can't be before start date"
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      setFormError("");
      let discountType = values.discountType;
      if (discountType === 'Fixed Amount') discountType = 'FIXED';
      if (discountType === 'Percentage (%)') discountType = 'PERCENTAGE';
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return dateStr;
      };
      const couponPayload = {
        code: values.code,
        discountType,
        discountValue: Number(values.discountValue),
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate),
        maxUsage: Number(values.maxUsage),
        currencyCode: "AED",
        minBookingAmount: values.minBookingAmount ? Number(values.minBookingAmount) : undefined,
        name: values.name,
        applicableFor: values.applicableFor,
        description: values.description,
        isActive: values.isActive,
      };
      if (discountType === 'PERCENTAGE') {
        couponPayload.maxDiscountAmount = Number(values.maxDiscountAmount);
      }
      try {
        await dispatch(addNewCoupon(couponPayload));
        resetForm();
        toggle();
      } catch (error) {
        if (error?.response?.data?.message?.includes('duplicate')) {
          setFormError('Coupon code already exists.');
        } else {
          setFormError(error?.message || 'An error occurred.');
        }
      }
    },
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Add Coupon</ModalHeader>
      <ModalBody>
        {formError && <div className="alert alert-danger">{formError}</div>}
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <Label>Coupon Code</Label>
                <Input
                  name="code"
                  type="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.code}
                  invalid={validation.touched.code && !!validation.errors.code}
                />
                <FormFeedback>{validation.errors.code}</FormFeedback>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <Label>Coupon Name</Label>
                <Input
                  name="name"
                  type="text"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.name}
                  invalid={validation.touched.name && !!validation.errors.name}
                />
                <FormFeedback>{validation.errors.name}</FormFeedback>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <Label>Discount Type</Label>
                <Input
                  name="discountType"
                  type="select"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.discountType}
                  invalid={validation.touched.discountType && !!validation.errors.discountType}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </Input>
                <FormFeedback>{validation.errors.discountType}</FormFeedback>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <Label>Discount Value</Label>
                <Input
                  name="discountValue"
                  type="number"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.discountValue}
                  invalid={validation.touched.discountValue && !!validation.errors.discountValue}
                />
                <FormFeedback>{validation.errors.discountValue}</FormFeedback>
              </div>
            </Col>
          </Row>
          {validation.values.discountType === "PERCENTAGE" && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <Label>Maximum Discount</Label>
                  <Input
                    name="maxDiscountAmount"
                    type="number"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.maxDiscountAmount}
                    invalid={validation.touched.maxDiscountAmount && !!validation.errors.maxDiscountAmount}
                  />
                  <FormFeedback>{validation.errors.maxDiscountAmount}</FormFeedback>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <Label>Applicable For</Label>
                  <Input
                    name="applicableFor"
                    type="select"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.applicableFor}
                    invalid={validation.touched.applicableFor && !!validation.errors.applicableFor}
                  >
                    <option value="">Select</option>
                    <option value="all">All Customers</option>
                    <option value="new">New Customers Only</option>
                    <option value="bronze">Bronze Members</option>
                    <option value="silver">Silver Members</option>
                    <option value="gold">Gold Members</option>
                    <option value="platinum">Platinum Members</option>
                  </Input>
                  <FormFeedback>{validation.errors.applicableFor}</FormFeedback>
                </div>
              </Col>
            </Row>
          )}
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <Label>Minimum Order Amount</Label>
                <Input
                  name="minBookingAmount"
                  type="number"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.minBookingAmount}
                  invalid={validation.touched.minBookingAmount && !!validation.errors.minBookingAmount}
                />
                <FormFeedback>{validation.errors.minBookingAmount}</FormFeedback>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <Label>Usage Limit</Label>
                <Input
                  name="maxUsage"
                  type="number"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.maxUsage}
                  invalid={validation.touched.maxUsage && !!validation.errors.maxUsage}
                />
                <FormFeedback>{validation.errors.maxUsage}</FormFeedback>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <Label>Start Date</Label>
                <Input
                  name="startDate"
                  type="date"
                  min={today}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.startDate}
                  invalid={validation.touched.startDate && !!validation.errors.startDate}
                />
                <FormFeedback>{validation.errors.startDate}</FormFeedback>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <Label>End Date</Label>
                <Input
                  name="endDate"
                  type="date"
                  min={today}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.endDate}
                  invalid={validation.touched.endDate && !!validation.errors.endDate}
                />
                <FormFeedback>{validation.errors.endDate}</FormFeedback>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className="mb-3">
                <Label>Description</Label>
                <Input
                  name="description"
                  type="textarea"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.description}
                  invalid={validation.touched.description && !!validation.errors.description}
                />
                <FormFeedback>{validation.errors.description}</FormFeedback>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className="mb-3">
                <Label>Status</Label>
                <Input
                  name="isActive"
                  type="checkbox"
                  checked={validation.values.isActive}
                  onChange={e => validation.setFieldValue('isActive', e.target.checked)}
                />
                <span className="ms-2">Active</span>
              </div>
            </Col>
          </Row>
          <ModalFooter>
            <Button color="primary" type="submit">Add Coupon</Button>
            <Button color="secondary" onClick={toggle}>Cancel</Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  );
};

AddCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default AddCouponModal; 