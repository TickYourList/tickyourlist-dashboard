import React from "react";
import PropTypes from "prop-types";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DeleteCouponModal = ({ isOpen, toggle, couponCode, onDelete, loading }) => (
  <Modal isOpen={isOpen} toggle={toggle} centered>
    <ModalHeader toggle={toggle}>Delete Coupon</ModalHeader>
    <ModalBody>
      <div className="text-danger fw-bold mb-2">
        Are you sure you want to permanently delete this <b>{couponCode}</b> Coupon? Once deleted, cannot be recovered.
      </div>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={onDelete} disabled={loading}>
        Delete
      </Button>
      <Button color="secondary" onClick={toggle} disabled={loading}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

DeleteCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  couponCode: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default DeleteCouponModal; 