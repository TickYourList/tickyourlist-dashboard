import React from "react"

import PropTypes from "prop-types"
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap"

const TravelPartnerDetails = ({ isOpen, toggle, Data }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} tag="h4">
        Partner Details
      </ModalHeader>
      <ModalBody>
        {Data ? (
          <div>
            <div className="text-center mb-4">
              <img
                src={Data.imgUrl?.url}
                alt={Data.imgUrl?.altText || Data.name}
                className="img-fluid rounded border" 
                style={{
                  maxHeight: "300px", 
                  objectFit: "contain",
                }}
              />
            </div>


            <div>
              <p>
                <strong>Id:</strong> {Data._id}
              </p>
              <p>
                <strong>Display Order:</strong> {Data.displayOrder}
              </p>
              <p>
                <strong>Name:</strong> {Data.name}
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
            </div>
          </div>
        ) : (
          <p className="text-center text-muted">No partner selected.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

TravelPartnerDetails.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
}

export default TravelPartnerDetails