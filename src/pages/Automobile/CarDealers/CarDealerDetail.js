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

const CarDealerDetail = ({ isOpen, toggle, Data }) => {

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
        <ModalHeader toggle={toggle}>Dealer Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Dealer id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Dealer Name:</b> <span className="text-primary">{Data?.dealerName}</span>
          </p>
          <p className="mb-2">
            <b>Email:</b> <span className="text-primary">{Data?.email}</span>
          </p>
          <p className="mb-2">
            <b>Phone Number:</b> <span className="text-primary">{Data?.phoneNumber}</span>
          </p>
          <p className="mb-2">
            <b>Address:</b> <span className="text-primary">{Data?.address}</span>
          </p>
          <p className="mb-2">
            <b>State:</b> <span className="text-primary">{Data?.state}</span>
          </p>
          <p className="mb-2">
            <b>City:</b> <span className="text-primary">{Data?.city}</span>
          </p>
          <p className="mb-2">
            <b>Car Brand:</b> <span className="text-primary">{Data?.carBrand?.brandName}</span>
          </p>
          <p className="mb-2">
            <b>Description:</b> <span className="text-primary">{Data?.description}</span>
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

CarDealerDetail.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarDealerDetail;
