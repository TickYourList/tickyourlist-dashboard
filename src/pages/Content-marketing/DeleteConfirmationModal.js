import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const DeleteConfirmationModal = ({ isOpen, toggle, banner, onDelete }) => {
  if (!banner) {
    return null;
  }

  const city_name = banner.cityCode || 'this';

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Home Banner</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to permanently delete this {city_name} Home Banner?</p>
        <p className="text-danger">Once deleted, it cannot be recovered.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete}>
          Delete
        </Button>{' '}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmationModal;