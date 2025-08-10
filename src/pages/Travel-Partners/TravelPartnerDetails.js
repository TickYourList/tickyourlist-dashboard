import React from "react"

import PropTypes from "prop-types"
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
  Button,
} from "reactstrap"
const TravelPartnerDetails = ({ isOpen, toggle, Data }) => {
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
      <ModalHeader toggle={toggle}>Partner Details</ModalHeader>
      <ModalBody>
        {Data ? (
          <div>
            <p>
              <strong>Name:</strong> {Data.name}
            </p>
            <p>
              <strong>Display Order:</strong> {Data.displayOrder}
            </p>
            <p>
              <strong>Featured:</strong> {Data.featured ? "Yes" : "No"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge bg-${Data.status ? "success" : "danger"}`}
              >
                {Data.status ? "Active" : "Inactive"}
              </span>
            </p>
            <img
              src={Data.imgUrl?.url}
              alt={Data.imgUrl?.altText || Data.name}
              style={{ width: "100%", objectFit: "contain", marginTop: 10 }}
            />
          </div>
        ) : (
          <p>No partner selected.</p>
        )}
      </ModalBody>
    </Modal>
  )
}
TravelPartnerDetails.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
}

export default TravelPartnerDetails
