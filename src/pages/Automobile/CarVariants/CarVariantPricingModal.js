import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Table,
  Spinner,
} from "reactstrap";
import * as XLSX from "xlsx";
//redux
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const CarVariantPricingModal = ({
  isOpen,
  toggle,
  Data,
  handleDownloadTemplateForVariantPricing,
  saveVariantPricing
}) => {
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();

  const { carVariantPriceSaveLoader } = useSelector(state => ({
    carVariantPriceSaveLoader: state.carVariant.carVariantSaveLoader
  }))

  useEffect(() => {
    if (Data) {
      setTableData(Data?.orderItems || []);
    }
  }, [Data]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (jsonData.length > 1) {
            const headers = jsonData[0];
            const dataRows = jsonData.slice(1).map((row) => {
              let rowData = {};
              row.forEach((cell, index) => {
                const header = headers[index];
                if (header.startsWith("Others-Key-") || header.startsWith("Others-Value-")) {
                  const [prefix, key , idx] = header.split("-");
                  rowData[`${prefix}-${key}-${idx}`] = cell;
                } else {
                  rowData[header] = cell;
                }
              });
              return rowData;
            });

            setTableData(dataRows);
          } else {
            setTableData([]);
          }
        } catch (error) {
          console.error("Error reading file:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected.");
    }
  };

  const handleSaveModelPricing = () => {
    const formattedData = tableData.map(row => ({
      carBrand: row["CarBrand"],
      carModel: row["CarModel"],
      carVariant: row["CarVariant"],
      exShowroomPrice: row["Ex-Showroom Price"],
      rtoPrice: row["RTO"],
      insurance: row["Insurance"],
      state: row["State"],
      city: row["City"],
      cityCode: row["CityCode"],
      others: Object.keys(row)
        .filter(key => key.startsWith("Others-Key-"))
        .map(key => {
          const index = key.split("-")[2];
          return { key: row[key], value: row[`Others-Value-${index}`] };
        })
        .filter(other => other.key && other.value), // Ensure there are no empty keys or values
    })); 
    // Dispatch the save action with formattedData
    saveVariantPricing(formattedData?.[0].carVariant, formattedData, toggle);
    console.log("Save model pricing data:", formattedData);
  };


  // const handleSaveModelPricing = () => {
  //   // Dispatch the save action with tableData

  //   dispatch(saveVariantPricing(tableData));
  //   console.log("Save model pricing data:", tableData);
  // };

  const handleClearModelPricing = () => {
    setTableData([]);
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
              <UncontrolledDropdown direction="left" className="d-inline me-2">
                <DropdownToggle className="btn-rounded btn-primary align-middle mb-2" color="success" href="#">
                  <i className="me-2 fa fa-file-export " /> Download Template
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem href="#" onClick={() => handleDownloadTemplateForVariantPricing("xlsx")}>
                    <i className="fas fa-file-excel text-success me-2" /> Download template - xlsx
                  </DropdownItem>
                  <DropdownItem href="#" onClick={() => handleDownloadTemplateForVariantPricing("csv")}>
                    <i className="fas fa-file-excel text-success me-2" /> Download template - csv
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} className="mb-2" />
            </div>
            <div className="d-flex gap-2">
              <Button type="button" color="primary" disabled={tableData?.length <= 1} onClick={handleSaveModelPricing}> Save
              </Button>
              <Button type="button" color="primary" onClick={handleClearModelPricing}>
                Clear
              </Button>
              <Button type="button" color="danger" onClick={() => handleDeleteAllModelPricing(carVariant)}>
                Delete All
              </Button>
            </div>
          </div>

          {tableData.length > 0 && (
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

CarVariantPricingModal.propTypes = {
  Data: PropTypes.object,
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  handleDownloadTemplateForVariantPricing: PropTypes.func,
};

export default CarVariantPricingModal;
