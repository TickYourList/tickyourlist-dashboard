import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrencyList } from "../../store/travelCurrency/action";
import './CurrencyTable.css';
import AddCurrencyForm from "./AddCurrencyForm";
import { Modal } from 'antd';

const CurrencyTable = () => {
  const dispatch = useDispatch();
  const { currencyList } = useSelector(state => ({
    currencyList: state.travelCurrency.currencyList
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchSymbol, setSearchSymbol] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(getCurrencyList());
  }, [dispatch]);

  const filteredData = currencyList?.filter(item =>
    item.currencyName?.toLowerCase().includes(searchName.toLowerCase()) &&
    item.code?.toLowerCase().includes(searchCode.toLowerCase()) &&
    item.localSymbol?.toLowerCase().includes(searchSymbol.toLowerCase()) &&
    (searchStatus === "" ||
      (searchStatus === "active" && item.status) ||
      (searchStatus === "inactive" && !item.status))
  );

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="currency-page">
      <Modal
        title="Add New Currency"
        open={showAddForm}
        onCancel={() => setShowAddForm(false)}
        footer={null}
        destroyOnClose
      >
        <AddCurrencyForm onClose={() => setShowAddForm(false)} />
      </Modal>

      {/* Header Section */}
      <div className="currency-header-bar">
  {/* Left: Title */}
  <div className="currency-header-left">
    <h1 className="currency-page-title">Currency Table</h1>
  </div>

  {/* Right side */}
  <div className="currency-header-right">
    <div className="currency-page-breadcrumb">
      <a href="/dashboard" className="currency-page-route">Dashboard</a>
      <span className="currency-page-route-separator">/</span>
      <span className="currency-page-route-current">Travel Currency</span>
    </div>
    <div className="currency-header-actions">
      <button className="btn-success" onClick={() => setShowAddForm(true)}>
        <i className="bx bx-plus"></i> New Currency
      </button>
      <button className="btn-danger">
        <i className="bx bx-trash" style={{ marginRight: "6px" }}></i>
        Delete All
      </button>
    </div>
  </div>
</div>


      {/* Table Section */}
      <div className="currency-table-container">
        <table className="currency-table">
          <thead>
            <tr>
              <th>Country Name</th>
              <th>Country Code</th>
              <th>Currency</th>
              <th>Status</th>
              <th>View Country Details</th>
              <th>Actions</th>
            </tr>
            <tr className="search-row">
              <th>
                <input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Search..." />
              </th>
              <th>
                <input type="text" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="Search..." />
              </th>
              <th>
                <input type="text" value={searchSymbol} onChange={(e) => setSearchSymbol(e.target.value)} placeholder="Search..." />
              </th>
              <th>
                <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map(item => (
              <tr key={item._id}>
                <td>{item.currencyName}</td>
                <td>{item.code}</td>
                <td>{item.localSymbol}</td>
                <td>
                  <span className={item.status ? "status-active" : "status-inactive"}>
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="view-button">View Country Details</button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn"><i className="bx bx-edit"></i></button>
                    <button className="delete-btn"><i className="bx bx-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-container">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>‹</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>›</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyTable;


