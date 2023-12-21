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

const CarBlogModel = ({ isOpen, toggle, Data }) => {
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
        <ModalHeader toggle={toggle}>Order Details</ModalHeader>
        <ModalBody>
          <p className="mb-2">
            <b>Order id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Billing Name: </b>
            <span className="text-primary">{Data?.customerId?.username}</span>
          </p>
          <p className="mb-4">
            <b>Address:</b>
            <span className="text-primary">{` ${Data?.shippingAddress1}, ${Data?.state},${Data?.zip}`}</span>
          </p>

          <div className="table-responsive">
            <Table className="table align-middle table-nowrap">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Product Name</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((ele, idx) => {
                  const price = ele?.product?.price;
                  const quantity = ele?.quantity;
                  const total = price * quantity;
                  subTotal += total;
                  return (
                    <tr key={idx}>
                      <th scope="row">
                        <div>
                          <img
                            src={ele?.product?.media[0]?.url}
                            alt=""
                            className="avatar-sm"
                          />
                        </div>
                      </th>
                      <td>
                        <div>
                          <h5 className="text-truncate font-size-14">
                            {ele?.product?.name}
                          </h5>
                          <p className="text-muted mb-0">
                            $ {price} x {quantity}
                          </p>
                        </div>
                      </td>
                      <td>$ {total}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-end">Sub Total:</h6>
                  </td>
                  <td>$ {subTotal}</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-end">Shipping:</h6>
                  </td>
                  <td>Free</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <h6 className="m-0 text-end">Total:</h6>
                  </td>
                  <td>$ {Data?.totalPrice}</td>
                </tr>
              </tbody>
            </Table>
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

CarBlogModel.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarBlogModel;
