import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Input,
  Col,
  Card,
  CardSubtitle,
  CardTitle,
  Alert,
} from "reactstrap";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import paginationFactory, { PaginationProvider } from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import { importCoupons } from "store/coupon/actions";

const CouponsModal = props => {
  const dispatch = useDispatch();
  const { isOpen, toggle, coupons = [] } = props;
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const [dataSelector, setDataSelector] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  async function handleImportCoupons(importButtonEvent) {
    const inpFile = importButtonEvent.target.files[0];
    if (!inpFile) return;
    const fileExtension = inpFile.name.split(".").pop().toLowerCase();
    if (!(fileExtension === "xlsx" || fileExtension === "csv")) {
      setError(true);
      return;
    } else {
      error ? setError(false) : null;
      setFileName(inpFile.name);
      const data = await inpFile.arrayBuffer();
      const wb = XLSX.read(data, { dateNF: "yyyy-mm-dd", raw: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      dataHandler(XLSX.utils.sheet_to_json(sheet), coupons);
    }
  }

  const dataHandler = (upload, coupons) => {
    const codes = coupons.map(coupon => coupon.code);
    const fil = upload.filter(entry => !codes.includes(entry.code));
    setUploadData(upload);
    setFilteredData(fil);
    setPreview(true);
  };

  const pageOptions = {
    sizePerPage: 4,
    totalSize: dataSelector ? uploadData.length : filteredData.length,
    custom: true,
  };

  const handleImportSubmitClick = () => {
    dispatch(importCoupons(dataSelector ? uploadData : filteredData));
    toggle();
    setPreview(false);
  };

  const CouponsImportColumns = [
    { dataField: "code", text: "Coupon Code", sort: true },
    { dataField: "discount", text: "Discount", sort: true },
    { dataField: "conditions", text: "Conditions", sort: true },
    { dataField: "usage", text: "Usage", sort: true },
    { dataField: "validPeriod", text: "Valid Period", sort: true },
    { dataField: "status", text: "Status", sort: true },
  ];

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
        <ModalHeader toggle={toggle}>
          {preview ? fileName : "Import Coupons"}
        </ModalHeader>
        <ModalBody>
          {!preview ? (
            <>
              <Card>
                <CardTitle>Select a File to import entries from</CardTitle>
                <CardSubtitle>
                  Supported file formats are .xlsx (Microsoft Excel Spreadsheet) and .csv.
                </CardSubtitle>
              </Card>
              {error ? (
                <Alert color="danger">
                  The uploaded file is not supported. Please use files with .xlsx or .csv extensions
                </Alert>
              ) : null}
              <Input type="file" onChange={handleImportCoupons} />
            </>
          ) : (
            <>
              <Card>
                <Alert color="warning">
                  <h5 className="alert-heading">Warning</h5>
                  This action is not revertable. All new entries will be imported.
                </Alert>
                <div className="w-100">
                  <Button
                    color="secondary"
                    type="button"
                    outline={!dataSelector}
                    onClick={() => {
                      !dataSelector ? setDataSelector(!dataSelector) : null;
                    }}
                    className="btn-sm w-50"
                  >
                    All Data {uploadData.length} Items
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    outline={!!dataSelector}
                    onClick={() => {
                      dataSelector ? setDataSelector(!dataSelector) : null;
                    }}
                    className="btn-sm w-50"
                  >
                    New Entries {filteredData.length} Items
                  </Button>
                </div>
              </Card>
              <Col>
                <PaginationProvider
                  pagination={paginationFactory(pageOptions)}
                  keyField="code"
                  columns={CouponsImportColumns}
                  data={dataSelector ? uploadData : filteredData}
                >
                  {({ paginationProps, paginationTableProps }) => (
                    <>
                      <BootstrapTable
                        keyField="code"
                        data={dataSelector ? uploadData : filteredData}
                        columns={CouponsImportColumns}
                        {...paginationTableProps}
                      />
                    </>
                  )}
                </PaginationProvider>
              </Col>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {preview && (
            <Button color="primary" onClick={handleImportSubmitClick}>
              Import
            </Button>
          )}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

CouponsModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  coupons: PropTypes.array,
};

export default CouponsModal;