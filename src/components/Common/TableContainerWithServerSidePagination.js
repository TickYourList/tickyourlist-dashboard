import React, { Fragment } from "react"
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  useFilters,
} from "react-table"
import { Table, Row, Col, Button, Input } from "reactstrap"
import { Filter, DefaultColumnFilter } from "./filters"

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <React.Fragment>
      <Col>
        <div className="search-box   d-inline-block">
          <div className="position-relative">
            <label htmlFor="search-bar-0" className="search-label">
              <span id="search-bar-0-label" className="sr-only">
                Search this table
              </span>
              <input
                onChange={e => {
                  setValue(e.target.value)
                  onChange(e.target.value)
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
    </React.Fragment>
  )
}

const TableContainerWithServerSidePagination = ({
  columns,
  data,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  setPageSize,
  isGlobalFilter,
  isAddNewTourGroup,
  toggleViewModal,
  customPageSizeOptions = [10, 20, 30, 50],
  className,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    page,
    headerGroups,
    setGlobalFilter,
    preGlobalFilteredRows,
    prepareRow,
    state,
    state: { pageIndex, pageSize: tablePageSize },
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: Math.ceil(totalCount / pageSize),
      initialState: { pageIndex: currentPage - 1, pageSize },
      manualSortBy: true,

      defaultColumn: { Filter: DefaultColumnFilter },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination
  )

  const handleChangePageSize = e => {
    const newSize = Number(e.target.value)
    setPageSize(newSize)
    onPageChange(1) // Reset to page 1 when page size changes
  }

  const handleChangePage = e => {
    const page = Math.max(1, Number(e.target.value))
    if (!isNaN(page)) {
      onPageChange(page)
    }
  }

  /* const generateSortingIndicator = column => {
    return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""
  } */

  return (
    <React.Fragment>
      <Row className=" d-flex">
        <Col md={customPageSizeOptions ? 2 : 1}>
          <select
            className="form-select"
            value={pageSize}
            onChange={handleChangePageSize}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Col>
        <Col>
          {isGlobalFilter && (
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          )}
        </Col>
        <Col>
          {isAddNewTourGroup && (
            <Col>
              <div className="text-sm-end">
                <Button
                  type="button"
                  color="success"
                  className="btn-rounded "
                  onClick={toggleViewModal}
                >
                  <i className="mdi mdi-plus me-1" />
                  Add New Tour Group
                </Button>
              </div>
            </Col>
          )}
        </Col>
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
                    </div>{" "}
                    {<Filter column={column} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row)
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr>
                    {row.cells.map(cell => {
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      )
                    })}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </Table>
      </div>

      <Row className="justify-content-md-end justify-content-center align-items-center">
        <Col className="col-md-auto">
          <Button
            color="primary"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </Button>
        </Col>
        <Col md="auto">
          <Button
            color="primary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
        </Col>
        <Col md="auto">
          Page{" "}
          <strong>
            {currentPage} of {Math.ceil(totalCount / pageSize)}
          </strong>
        </Col>
        <Col md="auto">
          <Input
            type="number"
            min={1}
            max={Math.ceil(totalCount / pageSize)}
            value={currentPage}
            onChange={handleChangePage}
          />
        </Col>
        <Col md="auto">
          <Button
            color="primary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
          >
            {">"}
          </Button>
        </Col>
        <Col md="auto">
          <Button
            color="primary"
            onClick={() => onPageChange(Math.ceil(totalCount / pageSize))}
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
          >
            {">>"}
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default TableContainerWithServerSidePagination