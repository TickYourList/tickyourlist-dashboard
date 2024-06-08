import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Spinner,
} from "reactstrap";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { deleteCarVariantPricing, getCarVariantPricing } from "store/automobiles/carVariants/actions";

const generateDataFields = (numOthersFields = 2) => {
  const baseFields = [
    "CarBrand",
    "BrandName",
    "CarModel",
    "ModelName",
    "CarVariant",
    "VariantName",
    "State",
    "City",
    "CityCode",
    "Ex-Showroom Price",
    "RTO",
    "Insurance",
  ];

  const othersFields = [];
  for (let i = 1; i <= numOthersFields; i++) {
    othersFields.push(`Others-Key-${i}`, `Others-Value-${i}`);
  }

  return [...baseFields, ...othersFields];
};

const CarVariantPricingViewModal = ({ isOpen, toggle, Data }) => {
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();

  const { carVariantPriceLoader, carVariantPricing } = useSelector(state => ({
    carVarianPricetLoader: state.carVariant.carVariantPriceLoader,
    carVariantPricing: state.carVariant.carVariantPricing,
  }));

  useEffect(() => {
    if (Data && Data._id) {
      dispatch(getCarVariantPricing(Data._id));
    }
  }, [Data, dispatch]);

  useEffect(() => {
    if (carVariantPricing) {
      const dataFields = generateDataFields(2);
      const formattedData = carVariantPricing.map(row => {
        const formattedRow = {
          CarBrand: row.carBrand._id,
          BrandName: row.carBrand.brandName,
          CarModel: row.carModel._id,
          ModelName: row.carModel.modelName,
          CarVariant: Data?.name,
          VariantName: row.carVariant,
          "Ex-Showroom Price": row.exShowroomPrice,
          RTO: row.rtoPrice,
          Insurance: row.insurance,
          State: row.state,
          City: row.city,
          CityCode: row.cityCode,
        };

        row.others.forEach((other, index) => {
          formattedRow[`Others-Key-${index + 1}`] = other.key;
          formattedRow[`Others-Value-${index + 1}`] = other.value;
        });

        // Ensure all data fields are present
        dataFields.forEach(field => {
          if (!(field in formattedRow)) {
            formattedRow[field] = "";
          }
        });

        return formattedRow;
      });

      // Ensure all fields are present in at least one row
      if (formattedData.length === 0) {
        const emptyRow = {};
        generateDataFields(2).forEach(field => {
          emptyRow[field] = "";
        });
        formattedData.push(emptyRow);
      }

      setTableData(formattedData);
    }
  }, [carVariantPricing, Data]);

  const handleSaveModelPricing = () => {
    const formattedData = tableData.map(row => ({
      carBrand: row.CarBrand,
      carModel: row.CarModel,
      carVariant: row.CarVariant,
      exShowroomPrice: row["Ex-Showroom Price"],
      rtoPrice: row.RTO,
      insurance: row.Insurance,
      state: row.State,
      city: row.City,
      cityCode: row.CityCode,
      others: Object.keys(row)
        .filter(key => key.startsWith("Others-Key-"))
        .map(key => {
          const index = key.split("-")[2];
          return { key: row[key], value: row[`Others-Value-${index}`] };
        })
        .filter(other => other.key && other.value),
    }));
    // saveVariantPricing(formattedData[0].carVariant, formattedData);
  };

  const handleDeleteModelPricing = () => {
    if(Data?._id) {
    dispatch(deleteCarVariantPricing(Data?._id));
    }
  };

  const handleDownloadTemplateForVariantPricing = (format) => {
    const dataFields = generateDataFields(2); // Adjust the number of others fields as needed
    const worksheet = XLSX.utils.json_to_sheet(tableData.length > 0 ? tableData : [{}], { header: dataFields });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Variant Pricing Template");
    XLSX.writeFile(workbook, `CarVariant_Pricing_Template.${format}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      role="dialog"
      autoFocus={true}
      centered={true}
      className="exampleModal"
      tabIndex="-1"
      toggle={toggle}
    >
      <div className="modal-content">
        <ModalHeader toggle={toggle}>Variant</ModalHeader>
        <ModalBody className="modal-dialog-scrollable d-flex flex-column">
          <div>
            <p className="mb-2">
              <b>Variant id:</b> <span className="text-primary">{Data?._id}</span>
            </p>
            <p className="mb-2">
              <b>Variant Name: </b><span className="text-primary">{Data?.name}</span>
            </p>
            <div className="mb-4">
              <b>Variant Image :</b>
              <div className="d-flex mt-2">
                {Data?.media?.map((image) => (
                  <div key={image._id} className="text-primary me-2">
                    <img src={image?.url} alt={image?.altText} width={50} height={50} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex mb-2 justify-content-between">
            <div>
              <Button
                type="button"
                color="success"
                className="me-2"
                onClick={() => handleDownloadTemplateForVariantPricing("xlsx")}
              >
                <i className="me-2 fas fa-file-excel" /> Download Variant Pricing
              </Button>
              <Button
                type="button"
                color="primary"
                className="me-2"
                onClick={() => handleDownloadTemplateForVariantPricing("csv")}
              >
                <i className="me-2 fas fa-file-csv" /> Download Variant Pricing
              </Button>
            </div>
            <div className="d-flex gap-2">
              <Button type="button" color="danger" onClick={handleDeleteModelPricing}>
                Delete ALL
              </Button>
            </div>
          </div>

          {carVariantPriceLoader ? (
            <div className="page-content">
              <Spinner
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                }}
              />
            </div>
          ) : tableData.length > 0 && (
            <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
              <Table striped>
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
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

CarVariantPricingViewModal.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default CarVariantPricingViewModal;
