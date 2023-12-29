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
        <ModalHeader toggle={toggle}>Brand Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Brand id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Brand Name: </b>
            <span className="text-primary">{Data?.brandName}</span>
          </p>
          <p className="mb-4">
            <b>Country Of Origin: </b>
            <span className="text-primary">{Data?.countryOfOrigin}</span>
          </p>

          <div className="table-responsive d-flex justify-content-center">
            <img src={Data?.media?.url} alt={Data?.media?.altText} width={100} height={85} />
          </div>
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
