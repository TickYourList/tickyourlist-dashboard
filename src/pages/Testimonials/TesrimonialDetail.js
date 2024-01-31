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

const CarBrandDetail = ({ isOpen, toggle, Data }) => {

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
        <ModalHeader toggle={toggle}>Testimonial Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Testimonial id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Testimonial Name: </b>
            <span className="text-primary">{Data?.name}</span>
          </p>
          <p className="mb-2">
            <b>State: </b>
            <span className="text-primary">{Data?.state}</span>
          </p>
          <p className="mb-2">
            <b>City: </b>
            <span className="text-primary">{Data?.city}</span>
          </p>
          <p className="mb-2">
            <b>Rating: </b>
            <span className="text-primary">{Data?.rating}</span>
          </p>
          <p className="mb-4">
            <b>Description: </b>
            <span className="text-primary">{Data?.description}</span>
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

CarBrandDetail.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarBrandDetail;
