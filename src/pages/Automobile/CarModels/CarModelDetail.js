import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
  Button,
  Row,
  Col,
} from "reactstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getCarVariantsFromModel } from "store/automobiles/carModels/actions";

const CarModelDetail = ({ isOpen, toggle, Data }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const { carVariants } = useSelector((state) => ({
    carVariants: state.CarModel.carVariants
  }));

  useEffect(() => {
      dispatch(getCarVariantsFromModel(Data._id));
  }, [Data]);

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
        <ModalHeader toggle={toggle}>Model Details</ModalHeader>
        <ModalBody>
          <div className="d-flex justify-content-center">
        <img src={Data?.media?.[0]?.url ?? Data?.media?.url} alt={Data?.media?.altText} width={170} height={150} />
        </div>
          <p className="mb-2">
            <b>Model id:</b> <span className="text-primary">{Data?._id}</span>
          </p>
          <p className="mb-2">
            <b>Model Name: </b>
            <span className="text-primary">{Data?.modelName}</span>
          </p>
          <p className="mb-2">
            <b>Body Type: </b>
            <span className="text-primary">{Data?.bodyType}</span>
          </p>
          <p className="mb-2">
            <b>Year: </b>
            <span className="text-primary">{Data?.year}</span>
          </p>
          <p className="mb-4">
            <b>Description: </b>
            <span className="text-primary">{Data?.description}</span>
          </p>
          <div className="table-responsive">
            <Table className="table align-middle table-nowrap">
              <thead>
                <tr>
                  <th scope="col">Variant Name</th>
                  <th scope="col">Variant Image</th>
                  {/* <th scope="col">Variant Data</th> */}
                </tr>
              </thead>
              <tbody>
                {carVariants?.map((ele, idx) => {
                  return (
                    <tr key={idx}>
                      <td>
                        <div>
                          <h5 className="text-truncate font-size-14">
                            {ele?.name}
                          </h5>
                        </div>
                      </td>
                      <th scope="row">
                        <div>
                          <img
                            src={ele?.media?.[0]?.url}
                            alt=""
                            className="avatar-sm"
                          />
                        </div>
                      </th>
                      {/* <td>$ {'total'}</td> */}
                    </tr>
                  );
                })}
                {/* <tr>
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
                </tr> */}
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

CarModelDetail.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarModelDetail;
