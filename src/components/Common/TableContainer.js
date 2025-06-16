import React, { Fragment } from "react";
import PropTypes from "prop-types";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
} from "react-table";
import { Table, Row, Col, Button, Input, CardBody, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Filter, DefaultColumnFilter } from "./filters";
import JobListGlobalFilter from "../../components/Common/GlobalSearchFilter";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  isJobListGlobalFilter
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <React.Fragment>
      <Col md={4}>
        <div className="search-box me-xxl-2 my-3 my-xxl-0 d-inline-block">
          <div className="position-relative">
            <label htmlFor="search-bar-0" className="search-label">
              <span id="search-bar-0-label" className="sr-only">
                Search this table
              </span>
              <input
                onChange={e => {
                  setValue(e.target.value);
                  onChange(e.target.value);
                }}
                id="search-bar-0"
                type="text"
                className="form-control"
                placeholder={`${count} records...`}
                value={value || ""}
              />
            </label>
            <i className="bx bx-search-alt search-icon"></i>
          </div>
        </div>

      </Col>
      {isJobListGlobalFilter && (
        <JobListGlobalFilter />
      )}

    </React.Fragment>
  );
}

const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  isJobListGlobalFilter,
  isAddOptions,
  isAddCarBrandOptions,
  isAddCarBlogOptions,
  isAddCarModelOptions,
  isAddCarCustomerOptions,
  isAddCarDealerOptions,
  isAddTestimonialOptions,
  isProductListAddOptions, 
  handleDownloadTemplate,
  handleExportCustomers,
  handleDeleteAllCustomerModel,
  toggleViewModal,
  isAddUserList,
  handleOrderClicks,
  handleOrderDeleteClicks,
  handleAddCarBrandClicks,
  handleCarBrandDeleteClicks,
  handleAddCarBlogClicks,
  handleCarBlogDeleteClicks,
  handleAddCarModelClicks,
  handleCarModelDeleteClicks,
  handleAddCarDealerClicks,
  handleCarDealerDeleteClicks,
  handleAddTestimonialClicks,
  handleTestimonialDeleteClicks,
  isAddcarVariantOptions,
  handleAddcarVariantClicks,
  handlecarVariantDeleteClicks,
  handleCarCustomerExportClicks,
  handleCarCustomerDeleteClicks,
  handleUserClick,
  handleCustomerClick,
  handleProductListClicks,
  isAddCustList,
  customPageSize,
  className,
  customPageSizeOptions,

}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
        sortBy: [
          {
            desc: true,
          },
        ],
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  );

  const generateSortingIndicator = column => {
    return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : "";
  };

  const onChangeInSelect = event => {
    setPageSize(Number(event.target.value));
  };

  const onChangeInInput = event => {
    const page = event.target.value ? Number(event.target.value) - 1 : 0;
    gotoPage(page);
  };
  return (
    <Fragment>
      <Row className="mb-2">
        <Col md={customPageSizeOptions ? 2 : 1}>
          <select
            className="form-select"
            value={pageSize}
            onChange={onChangeInSelect}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Col>
        {isGlobalFilter && (
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
            isJobListGlobalFilter={isJobListGlobalFilter}
          />
        )}
        {isAddOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleOrderClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Order
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handleOrderDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all orders
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
        {isAddCarBrandOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleAddCarBrandClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Car Brand
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handleCarBrandDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all Car Brands
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
         {isAddCarBlogOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleAddCarBlogClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Car Blog
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handleCarBlogDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all Car Blogs
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
        {isAddCarCustomerOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleCarCustomerExportClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Export Customers
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handleCarCustomerDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all Customers
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
        {isAddCarDealerOptions && (
          <Col sm="7" className="d-flex justify-content-end">
          {/* <div className="text-sm-end"> */}
          <div className="text-sm-end">
            <Button
              type="button"
              color="success"
              className="btn-rounded  mb-2 me-2"
              onClick={handleAddCarDealerClicks}
            >
              <i className="mdi mdi-plus me-1" />
              Add New Car Dealer
            </Button>
          </div>
          <div className="text-sm-end">
            <Button
              type="button"
              color="danger"
              className="btn-rounded  mb-2 me-2"
              onClick={handleCarDealerDeleteClicks}
            >
              <i className="mdi mdi-plus me-1" />
              Delete all Car Dealers
            </Button>
          </div>
          {/* </div> */}
        </Col>
        )}
        {isAddTestimonialOptions && (
          <Col sm="7" className="d-flex justify-content-end">
          {/* <div className="text-sm-end"> */}
          <div className="text-sm-end">
            <Button
              type="button"
              color="success"
              className="btn-rounded  mb-2 me-2"
              onClick={handleAddTestimonialClicks}
            >
              <i className="mdi mdi-plus me-1" />
              Add New Testimonial
            </Button>
          </div>
          <div className="text-sm-end">
            <Button
              type="button"
              color="danger"
              className="btn-rounded  mb-2 me-2"
              onClick={handleTestimonialDeleteClicks}
            >
              <i className="mdi mdi-plus me-1" />
              Delete all Testimonials
            </Button>
          </div>
          {/* </div> */}
        </Col>
        )}
        {isAddCarModelOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleAddCarModelClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Car Model
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handleCarModelDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all Car Models
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
        {isAddcarVariantOptions && (
          <Col sm="7" className="d-flex justify-content-end">
            {/* <div className="text-sm-end"> */}
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleAddcarVariantClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Car Variant
              </Button>
            </div>
            <div className="text-sm-end">
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={handlecarVariantDeleteClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Delete all Car Variants
              </Button>
            </div>
            {/* </div> */}
          </Col>
        )}
        {isProductListAddOptions && (
          <Col sm="7">
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleProductListClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Product
              </Button>
            </div>
          </Col>
        )}
        {isAddUserList && (
          <Col sm="7">
            <div className="text-sm-end">
              <Button
                type="button"
                color="primary"
                className="btn mb-2 me-2"
                onClick={handleUserClick}
              >
                <i className="mdi mdi-plus-circle-outline me-1" />
                Create New User
              </Button>
            </div>
          </Col>
        )}
        {isAddCustList && (
          <Col sm="7" className="d-flex justify-content-end">
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded mb-2 me-2"
                onClick={toggleViewModal}
              >
                <i className="me-2 me-2 fa fa-file-import " />
                New Customers
              </Button>
            </div>
            <UncontrolledDropdown
              direction="left"
              className="d-inline mb-2 me-2 align-middle"
            >
              <DropdownToggle
                className=" btn-rounded btn-primary align-middle mb-2"
                color="success"
                href="#"
              >
                <i className="me-2 me-2 fa fa-file-export " />{" "}
                Export
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem
                  href="#"
                  onClick={() =>
                    handleExportCustomers("xlsx")
                  }
                  disabled={data?.length === 0}
                >
                  <i className="fas fa-file-excel text-success me-2" />
                  Save as Customers.xlsx
                </DropdownItem>
                <DropdownItem
                  href="#"
                  onClick={() =>
                    handleExportCustomers("csv")
                  }
                  disabled={data?.length === 0}
                >
                  <i className="fas fa-file-excel text-success me-2" />
                  Save as Customers.csv
                </DropdownItem>
                <DropdownItem
                  href="#"
                  onClick={() =>
                    handleDownloadTemplate("xlsx")
                  }
                >
                  <i className="fas fa-file-excel text-success me-2" />
                  Download template - xlsx
                </DropdownItem>
                <DropdownItem
                  href="#"
                  onClick={() =>
                    handleDownloadTemplate("csv")
                  }
                >
                  <i className="fas fa-file-excel text-success me-2" />
                  Download template - csv
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded mb-2 me-2"
                onClick={handleCustomerClick}
              >
                <i className="mdi mdi-plus me-1" />
                New Customers
              </Button>
              <Button
                type="button"
                color="danger"
                className="btn-rounded  mb-2 me-2"
                onClick={() => {
                  handleDeleteAllCustomerModel(true);
                }}
              >
                <i className="mdi mdi-delete me-1" />
                Delete all customers
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <div className="table-responsive react-table">
        <Table bordered hover {...getTableProps()} className={className}>
          <thead className="table-light table-nowrap">
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th key={column.id}>
                    <div className="mb-2" {...column.getSortByToggleProps()}>
                      {column.render("Header")}
                      {generateSortingIndicator(column)}
                    </div>
                    <Filter column={column} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr>
                    {row.cells.map(cell => {
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Row className="justify-content-md-end justify-content-center align-items-center">
        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button
              color="primary"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {"<<"}
            </Button>
            <Button
              color="primary"
              onClick={previousPage}
              disabled={!canPreviousPage}
            >
              {"<"}
            </Button>
          </div>
        </Col>
        <Col className="col-md-auto d-none d-md-block">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </Col>
        <Col className="col-md-auto">
          <Input
            type="number"
            min={1}
            style={{ width: 70 }}
            max={pageOptions.length}
            defaultValue={pageIndex + 1}
            onChange={onChangeInInput}
          />
        </Col>

        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button color="primary" onClick={nextPage} disabled={!canNextPage}>
              {">"}
            </Button>
            <Button
              color="primary"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {">>"}
            </Button>
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default TableContainer;
