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

const CarBlogDetail = ({ isOpen, toggle, Data }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (Data) {
      setData(Data?.orderItems);
    }
  }, [Data]);

  let subTotal = 0;
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
        <ModalHeader toggle={toggle}>Blog Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Blog id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Blog Name: </b>
            <span className="text-primary">{Data?.blogName}</span>
          </p>
          <p className="mb-2">
            <b>Car Brand: </b>
            <span className="text-primary">{Data?.carBrand?.brandName}</span>
          </p>
          <p className="mb-2">
            <b>Car Model: </b>
            <span className="text-primary">{Data?.carModel?.modelName}</span>
          </p>
          <p className="mb-2">
            <b>Blog Description: </b>
            <span className="text-primary">{Data?.blogDescription}</span>
          </p>
          <div className="mb-2">
            <b>Blog Image: </b>
            <div>
            <img src={Data?.media?.url} alt={Data?.media?.altText} width={100} height={100} />
            </div>
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

CarBlogDetail.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarBlogDetail;
