import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
  Button,
} from "reactstrap";

const CarCustomerDetail = ({ isOpen, toggle, Data }) => {

  const ConnectionDate = (cell) => {
    if (!cell) {
        return "";
    }

    const date = new Date(cell);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed in JS
    const day = date.getDate().toString().padStart(2, '0');

    const dateOnlyString = `${day}-${month}-${year}`;
    return dateOnlyString;
};

  return (
    <Modal
      isOpen={isOpen}
      role="dialog"
      autoFocus={true}
      centered={true}
      className="exampleModal"
      tabIndex="-1"
      toggle={toggle}
    >
      <div className="modal-content">
        <ModalHeader toggle={toggle}>Customer Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Customer id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Customer Name:</b> <span className="text-primary">{Data?.username}</span>
          </p>
          <p className="mb-2">
            <b>Email:</b> <span className="text-primary">{Data?.email}</span>
          </p>
          <p className="mb-2">
            <b>Phone Number:</b> <span className="text-primary">{Data?.phone}</span>
          </p>
          <p className="mb-2">
            <b>PAN Details:</b> <span className="text-primary">{Data?.panDetails}</span>
          </p>
          <p className="mb-2">
            <b>Car Brand:</b> <span className="text-primary">{Data?.carBrand?.brandName}</span>
          </p>
          <p className="mb-2">
            <b>Car Model:</b> <span className="text-primary">{Data?.carModel?.modelName}</span>
          </p>
          <p className="mb-2">
            <b>Car Variant:</b> <span className="text-primary">{Data?.carVariant?.name}</span>
          </p>
          <p className="mb-2">
            <b>City:</b> <span className="text-primary">{Data?.city}</span>
          </p>
          <p className="mb-2">
            <b>Buying Period: </b>
            <span className="text-primary">{Data?.buyingPeriod}</span>
          </p>
          <p className="mb-2">
            <b>Usage: </b>
            <span className="text-primary">{Data?.usage}</span>
          </p>
          <p className="mb-2">
            <b>Joining Date: </b>
            <span className="text-primary">{ConnectionDate(Data?.joiningDate)}</span>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

CarCustomerDetail.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarCustomerDetail;
