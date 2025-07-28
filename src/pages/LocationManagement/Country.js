import React, { useEffect, useMemo, useState, useRef } from "react"
import PropTypes from "prop-types"
import { isEmpty } from "lodash"
import "bootstrap/dist/css/bootstrap.min.css"
import TableContainer from "../../components/Common/TableContainer"
import Breadcrumbs from "../../components/Common/Breadcrumb"
import { useSelector, useDispatch } from "react-redux"
import {
  Button,
  Col,
  Row,
  Card,
  CardBody,
  Alert,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  FormFeedback,
  NavItem,
  NavLink,
  FormGroup,
  TabContent,
  TabPane,
  Spinner,
} from "reactstrap"
import {
  getCountries,
  addCountry,
  getCurrencyList,
  updateCountry,
  getCountryByCode,
  deleteCountry,
} from "../../store/countries/actions"
import { useFormik } from "formik"
import * as Yup from "yup"
import classnames from "classnames"
import CreatableSelect from "react-select/creatable"
import { Field, Form as FormikForm } from "formik"
import Select from "react-select"

const CountryCode = props => <span> {props.value} </span>
const CountryName = props => <span> {props.value} </span>
const Status = props => (
  <Badge color={props.value ? "success" : "secondary"}>
    {" "}
    {props.value ? "Active" : "Inactive"}{" "}
  </Badge>
)

function LocationManagement() {
  document.title = "Countries | Scrollit"

  const [modal, setModal] = useState(false)
  const [activeTabVartical, setoggleTabVertical] = useState(1)
  const [passedStepsVertical, setPassedStepsVertical] = useState([])
  const [toast, setToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({
    title: "",
    message: "",
    type: "",
  })
  const dispatch = useDispatch()
  const [wasAdding, setWasAdding] = useState(false)
  const [wasEditing, setWasEditing] = useState(false);

  // 1. Add state for edit modal
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const formPopulatedRef = useRef(false)

  // Country Detail modal state
  const [countryDetailModalOpen, setCountryDetailModalOpen] = useState(false);
  const [countryDetailData, setCountryDetailData] = useState(null);

  const {
    countries,
    loading,
    error,
    addLoading,
    currencyList,
    currencyLoading,
    currencyError,
    selectedCountry,
    selectedCountryLoading,
    selectedCountryError,
    deleteLoading,
    error: deleteErrorRedux,
  } = useSelector(state => state.countries)

  // Debug log to see Redux state
  useEffect(() => {
    console.log('Redux state:', { selectedCountry, selectedCountryLoading, selectedCountryError })
  }, [selectedCountry, selectedCountryLoading, selectedCountryError])
  const prevCountriesLength = React.useRef(countries.length)

  // Add status options
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ]

  // Formik validation schema
  const validation = useFormik({
    enableReinitialize: false, // We'll manually set values
    initialValues: {
      code: "",
      displayName: "",
      currency: "",
      status: true,
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .required("Country code is required")
        .min(2, "Country code must be at least 2 characters")
        .max(3, "Country code must be at most 3 characters"),
      displayName: Yup.string()
        .required("Country name is required")
        .min(2, "Country name must be at least 2 characters"),
      currency: Yup.string().required("Currency is required"),
      status: Yup.boolean().required("Status is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      // Prepare payload for API
      const payload = {
        code: values.code,
        displayName: values.displayName,
        currency: values.currency, // _id
        status: values.status,
      }
      // Call the add country API (my_api)
      if (isEdit && selectedCountry) {
        const countryData = selectedCountry.country || selectedCountry
        dispatch(updateCountry(countryData.code, payload))
        setWasEditing(true)
      } else {
        dispatch(addCountry(payload))
        setWasAdding(true)
      }
      resetForm()
      setoggleTabVertical(1)
      setPassedStepsVertical([])
      setModal(false)
      setIsEdit(false)
      setSelectedCountryCode(null)
    },
  })

  // Remove getCurrencyList from useEffect on mount
  useEffect(() => {
    dispatch(getCountries())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      setToastMessage({
        title: "Error",
        message: error,
        type: "danger",
      })
      setToast(true)
    }
  }, [error])

  // Effect to populate form when API data arrives
  useEffect(() => {
    console.log('useEffect triggered with:', { selectedCountry, selectedCountryLoading, formPopulatedRef: formPopulatedRef.current, currencyListLength: currencyList.length })

    if (selectedCountry && !selectedCountryLoading && !formPopulatedRef.current && currencyList.length > 0) {
      console.log('Populating form with:', selectedCountry) // Debug log

      // Handle nested data structure from API
      const countryData = selectedCountry.country || selectedCountry
      console.log('Extracted countryData:', countryData)
      console.log('Country currency object:', countryData.currency)

      const formValues = {
        code: countryData.code || "",
        displayName: countryData.displayName || "",
        currency: countryData.currency?._id || "",
        status: countryData.status,
      }
      console.log('Setting form values:', formValues)
      console.log('Current form values before setValues:', validation.values)
      console.log('Status value from API:', countryData.status, 'Type:', typeof countryData.status)

      validation.setValues(formValues)
      formPopulatedRef.current = true
      console.log('Form values set successfully')

      // Debug: Check if values are actually set
      setTimeout(() => {
        console.log('Form values after setValues:', validation.values)
        console.log('Form field values:', {
          code: validation.values.code,
          displayName: validation.values.displayName,
          currency: validation.values.currency,
          status: validation.values.status
        })
      }, 100)
    }
  }, [selectedCountry, selectedCountryLoading, currencyList])

  // Effect to handle selectedCountryError
  useEffect(() => {
    if (selectedCountryError) {
      setToastMessage({
        title: "Error",
        message: selectedCountryError,
        type: "danger",
      })
      setToast(true)
    }
  }, [selectedCountryError])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Only define currencyOptions once, using currencyList from Redux
  const currencyOptions = currencyList.map(c => ({
    _id: c._id,
    label: `${c.currencyName} (${c.code}) ${c.symbol}`,
  }))

  // Debug currency options
  useEffect(() => {
    console.log('Currency options:', currencyOptions)
    console.log('Currency list length:', currencyList.length)
  }, [currencyOptions, currencyList])

  useEffect(() => {
    // Show toast and refresh data after successful add
    if (wasAdding && !addLoading) {
      setWasAdding(false)
      setToastMessage({
        title: "Success",
        message: "Country created successfully!",
        type: "success",
      })
      setToast(true)
      dispatch(getCountries())
      setModal(false)
    }
  }, [addLoading, wasAdding, dispatch])

  useEffect(() => {
    // Show toast and refresh data after successful edit
    if (wasEditing && !addLoading) {
      setWasEditing(false)
      setToastMessage({
        title: "Success",
        message: "Country updated successfully!",
        type: "success",
      })
      setToast(true)
      dispatch(getCountries())
      setModal(false)
    }
  }, [addLoading, wasEditing, dispatch])

  // Add a handler to fetch currency list only when needed
  const handleCurrencyMenuOpen = () => {
    if (!currencyList || currencyList.length === 0) {
      dispatch(getCurrencyList())
    }
  }

  // 2. Add edit handler
  const handleCountryEditClick = country => {
    console.log('Edit clicked for country:', country) // Debug log
    setSelectedCountryCode(country.code)
    setIsEdit(true)
    setModal(true)
    formPopulatedRef.current = false // Reset the flag for new edit

    // Load currency list if not already loaded
    if (!currencyList || currencyList.length === 0) {
      dispatch(getCurrencyList())
    }

    // Dispatch API call to get fresh country data
    dispatch(getCountryByCode(country.code))
  }

  // 7. On modal close, reset isEdit and selectedCountry
  const toggle = () => {
    setModal(!modal)
    validation.resetForm()
    setoggleTabVertical(1)
    setPassedStepsVertical([])
    setIsEdit(false)
    setSelectedCountryCode(null)
    formPopulatedRef.current = false // Reset the flag when closing modal
  }

  function toggleTabVertical(tab) {
    if (activeTabVartical !== tab) {
      const modifiedSteps = [...passedStepsVertical, tab]
      if (tab >= 1 && tab <= 2) {
        // Only allow steps 1 and 2
        setoggleTabVertical(tab)
        setPassedStepsVertical(modifiedSteps)
      }
    }
  }

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);
  // const [deleteLoading, setDeleteLoading] = useState(false); // This state is now managed by Redux
  // const [deleteError, setDeleteError] = useState(""); // This state is now managed by Redux

  // Delete handler (Redux API)
  const handleDeleteCountry = () => {
    if (countryToDelete) {
      dispatch(deleteCountry(countryToDelete.code));
    }
  };

  // Show toast and close modal on delete success/failure
  useEffect(() => {
    if (!deleteLoading && countryToDelete) {
      if (!deleteErrorRedux) {
        setDeleteModalOpen(false);
        setToastMessage({
          title: 'Success',
          message: `${countryToDelete.displayName} country deleted successfully`,
          type: 'success',
        });
        setToast(true);
        setCountryToDelete(null);
      } else if (deleteErrorRedux) {
        setToastMessage({
          title: 'Error',
          message: `${countryToDelete.displayName} country failed to delete.`,
          type: 'danger',
        });
        setToast(true);
      }
    }
    // eslint-disable-next-line
  }, [deleteLoading]);

  const columns = useMemo(
    () => [
      {
        Header: "Country Code",
        accessor: "code",
        width: "150px",
        style: {
          textAlign: "center",
          width: "10%",
          background: "#0000",
        },
        filterable: true,
        Cell: cellProps => <CountryCode {...cellProps} />,
      },
      {
        Header: "Country Name",
        accessor: "displayName",
        filterable: true,
        Cell: cellProps => <CountryName {...cellProps} />,
      },
      {
        Header: "Currency",
        accessor: "currency",
        filterable: true,
        Cell: cellProps => {
          const currency = cellProps.value
          return currency ? `${currency.code} (${currency.symbol})` : "N/A"
        },
      },
      {
        Header: "Cities",
        accessor: "cityCount",
        filterable: true,
        Cell: cellProps => <span> {cellProps.value || 0} </span>,
      },
      {
        Header: "Tours",
        accessor: "tourCount",
        filterable: true,
        Cell: cellProps => <span> {cellProps.value || 0} </span>,
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: true,
        Cell: cellProps => <Status {...cellProps} />,
      },
      {
        Header: "Country Detail",
        accessor: "countryDetail",
        disableFilters: true,
        Cell: cellProps => (
          <Button
            type="button"
            color="primary"
            className="btn-sm btn-rounded"
            onClick={() => {
              setCountryDetailModalOpen(true);
              setCountryDetailData(cellProps.row.original);
            }}
          >
            Country Detail
          </Button>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        Cell: cellProps => (
          <div className="d-flex gap-3">
            <Button
              color="success"
              size="sm"
              className="btn-rounded"
              onClick={() => handleCountryEditClick(cellProps.row.original)}
            >
              <i className="mdi mdi-pencil font-size-14" />
            </Button>{" "}
            <Button
              color="danger"
              size="sm"
              className="btn-rounded"
              onClick={() => {
                setCountryToDelete(cellProps.row.original);
                setDeleteModalOpen(true);
                // setDeleteError(""); // This state is now managed by Redux
              }}
            >
              <i className="mdi mdi-delete font-size-14" />
            </Button>{" "}
          </div>
        ),
      },
    ],
    []
  )

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Location Management" breadcrumbItem="Countries" />{" "}
          {/* Toast Messages */}{" "}
          {toast && (
            <Alert
              color={toastMessage.type}
              className="mb-3"
              toggle={() => setToast(false)}
            >
              <strong> {toastMessage.title}: </strong> {toastMessage.message}{" "}
            </Alert>
          )}{" "}
          {/* Error Message */}{" "}
          {error && !toast && (
            <Alert color="danger" className="mb-3">
              <strong> Error: </strong>
              {error}{" "}
            </Alert>
          )}{" "}
          {/* Loading State */}{" "}
          {loading && (
            <Alert color="info" className="mb-3">
              <Spinner size="sm" className="me-2" />
              Loading countries...{" "}
            </Alert>
          )}{" "}
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={countries || []}
                    isGlobalFilter={true}
                    isAddOptions={true}
                    handleAddClicks={toggle}
                    addButtonLabel="Add New Country"
                    customPageSize={10}
                  />{" "}
                </CardBody>{" "}
              </Card>{" "}
            </Col>{" "}
          </Row>{" "}
        </div>{" "}
      </div>{" "}
      {/* Add Country Modal - Flow: Currency → Country → City → Tour Groups */}{" "}
      <Modal size="xl" isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle} tag="h4">
          Add New Country{" "}
        </ModalHeader>{" "}
        <ModalBody>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">
                    {" "}
                    Location Management Flow{" "}
                  </h4>{" "}
                  <div className="vertical-wizard wizard clearfix vertical">
                    <div className="steps clearfix">
                      <ul>
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 1,
                          })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTabVartical === 1,
                            })}
                            onClick={() => toggleTabVertical(1)}
                            disabled={!(passedStepsVertical || []).includes(1)}
                          >
                            <span className="number"> 1. </span> Currency Setup{" "}
                          </NavLink>{" "}
                        </NavItem>{" "}
                        <NavItem
                          className={classnames({
                            current: activeTabVartical === 2,
                          })}
                        >
                          <NavLink
                            className={classnames({
                              active: activeTabVartical === 2,
                            })}
                            onClick={() => toggleTabVertical(2)}
                            disabled={!(passedStepsVertical || []).includes(2)}
                          >
                            <span className="number"> 2. </span> Country Details{" "}
                          </NavLink>{" "}
                        </NavItem>{" "}
                      </ul>{" "}
                    </div>{" "}
                    <div className="content clearfix">
                      <TabContent
                        activeTab={activeTabVartical}
                        className="body"
                      >
                        <TabPane tabId={1}>
                          {" "}
                          {activeTabVartical === 1 && (
                            <form onSubmit={validation.handleSubmit}>
                              {" "}
                              {/* Currency fields */}{" "}
                              <Row>
                                <Col lg="12">
                                  <h5 className="mb-3">
                                    {" "}
                                    Currency Information{" "}
                                  </h5>{" "}
                                  <p className="text-muted">
                                    {" "}
                                    Set up the currency for this country{" "}
                                  </p>{" "}
                                </Col>{" "}
                              </Row>{" "}
                              <Row>
                                <Col lg="12">
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="currency-select">
                                      Currency{" "}
                                      <span style={{ color: "red" }}> * </span>{" "}
                                    </Label>{" "}
                                    <CreatableSelect
                                      id="currency-select"
                                      name="currency"
                                      isClearable
                                      isLoading={currencyLoading}
                                      options={currencyOptions.map(opt => ({
                                        value: opt._id,
                                        label: opt.label,
                                      }))}
                                      value={
                                        currencyOptions.find(
                                          opt =>
                                            opt._id ===
                                            validation.values.currency
                                        ) || null
                                      }
                                      onChange={option => {
                                        validation.setFieldValue(
                                          "currency",
                                          option ? option.value : ""
                                        )
                                      }}
                                      onMenuOpen={handleCurrencyMenuOpen}
                                      placeholder="Select currency..."
                                      classNamePrefix="select2-selection"
                                    />{" "}
                                    {validation.touched.currency &&
                                    validation.errors.currency ? (
                                      <FormFeedback
                                        type="invalid"
                                        style={{ display: "block" }}
                                      >
                                        {" "}
                                        {validation.errors.currency}{" "}
                                      </FormFeedback>
                                    ) : null}{" "}
                                  </FormGroup>{" "}
                                </Col>{" "}
                              </Row>{" "}
                            </form>
                          )}{" "}
                        </TabPane>{" "}
                        <TabPane tabId={2}>
                          {" "}
                          {activeTabVartical === 2 && (
                            <form onSubmit={validation.handleSubmit}>
                              {" "}
                              {/* Country fields */}{" "}
                              <Row>
                                <Col lg="12">
                                  <h5 className="mb-3">
                                    {" "}
                                    Country Information{" "}
                                  </h5>{" "}
                                  <p className="text-muted">
                                    {" "}
                                    Enter the basic country details{" "}
                                  </p>{" "}
                                </Col>{" "}
                              </Row>{" "}
                              <Row>
                                <Col lg="6">
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="country-code">
                                      Country Code{" "}
                                      <span style={{ color: "red" }}> * </span>{" "}
                                    </Label>{" "}
                                    <Input
                                      name="code"
                                      type="text"
                                      className="form-control"
                                      id="country-code"
                                      placeholder="Enter country code (e.g., US, IN)"
                                      value={validation.values.code}
                                      onChange={validation.handleChange}
                                      onBlur={validation.handleBlur}
                                      invalid={
                                        validation.touched.code &&
                                        !!validation.errors.code
                                      }
                                    />{" "}
                                    {validation.touched.code &&
                                    validation.errors.code ? (
                                      <FormFeedback type="invalid">
                                        {" "}
                                        {validation.errors.code}{" "}
                                      </FormFeedback>
                                    ) : null}{" "}
                                  </FormGroup>{" "}
                                </Col>{" "}
                                <Col lg="6">
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="country-name">
                                      Country Name{" "}
                                      <span style={{ color: "red" }}> * </span>{" "}
                                    </Label>{" "}
                                    <Input
                                      name="displayName"
                                      type="text"
                                      className="form-control"
                                      id="country-name"
                                      placeholder="Enter country name"
                                      value={validation.values.displayName}
                                      onChange={validation.handleChange}
                                      onBlur={validation.handleBlur}
                                      invalid={
                                        validation.touched.displayName &&
                                        !!validation.errors.displayName
                                      }
                                    />{" "}
                                    {validation.touched.displayName &&
                                    validation.errors.displayName ? (
                                      <FormFeedback type="invalid">
                                        {" "}
                                        {validation.errors.displayName}{" "}
                                      </FormFeedback>
                                    ) : null}{" "}
                                  </FormGroup>{" "}
                                </Col>{" "}
                              </Row>{" "}
                              <Row>
                                <Col lg="12">
                                  <FormGroup className="mb-3">
                                    <Label htmlFor="status-select">
                                      Status{" "}
                                      <span style={{ color: "red" }}> * </span>{" "}
                                    </Label>{" "}
                                    <Select
                                      id="status-select"
                                      name="status"
                                      options={statusOptions}
                                      value={statusOptions.find(
                                        opt =>
                                          opt.value === validation.values.status
                                      )}
                                      onChange={option =>
                                        validation.setFieldValue(
                                          "status",
                                          option.value
                                        )
                                      }
                                      placeholder="Select status..."
                                    />{" "}
                                    {validation.touched.status &&
                                    validation.errors.status ? (
                                      <FormFeedback type="invalid">
                                        {" "}
                                        {validation.errors.status}{" "}
                                      </FormFeedback>
                                    ) : null}{" "}
                                  </FormGroup>{" "}
                                </Col>{" "}
                              </Row>{" "}
                            </form>
                          )}{" "}
                        </TabPane>{" "}
                      </TabContent>{" "}
                    </div>{" "}
                  </div>{" "}
                </CardBody>{" "}
              </Card>{" "}
            </Col>{" "}
          </Row>{" "}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button
              type="button"
              color="secondary"
              onClick={toggle}
              disabled={addLoading}
            >
              Cancel{" "}
            </Button>{" "}

            {/* Show Next button only on step 1 */}
            {activeTabVartical === 1 && (
              <Button
                type="button"
                color="primary"
                onClick={() => toggleTabVertical(2)}
                disabled={
                  addLoading ||
                  !validation.values.currency ||
                  !!validation.errors.currency
                }
              >
                Next
              </Button>
            )}

            {/* Show Previous button only on step 2 */}
            {activeTabVartical === 2 && (
              <Button
                type="button"
                color="primary"
                onClick={() => toggleTabVertical(1)}
                disabled={addLoading}
              >
                Previous
              </Button>
            )}

            {/* Show Add/Update button only on step 2 */}
            {activeTabVartical === 2 && (
              <Button
                type="submit"
                color="success"
                onClick={validation.handleSubmit}
                disabled={
                  addLoading ||
                  !validation.values.code ||
                  !validation.values.displayName ||
                  !validation.values.currency ||
                  validation.values.status === undefined ||
                  !!validation.errors.code ||
                  !!validation.errors.displayName ||
                  !!validation.errors.currency ||
                  !!validation.errors.status
                }
              >
                {addLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {isEdit ? "Updating..." : "Adding..."}
                  </>
                ) : isEdit ? (
                  "Update Country"
                ) : (
                  "Add Country"
                )}{" "}
              </Button>
            )}
          </div>{" "}
        </ModalBody>{" "}
      </Modal>{" "}

      {/* Country Detail Modal */}
      <Modal isOpen={countryDetailModalOpen} toggle={() => setCountryDetailModalOpen(false)}>
        <ModalHeader toggle={() => setCountryDetailModalOpen(false)}>
          Country Details
        </ModalHeader>
        <ModalBody>
          {/* TODO: Render country details here */}
          {countryDetailData ? (
            <div>
              <p><b>Country Code:</b> {countryDetailData.code}</p>
              <p><b>Country Name:</b> {countryDetailData.displayName}</p>
              <p><b>Currency:</b> {countryDetailData.currency ? `${countryDetailData.currency.code} (${countryDetailData.currency.symbol})` : 'N/A'}</p>
              <p><b>Status:</b> {countryDetailData.status ? 'Active' : 'Inactive'}</p>
              {/* Add more fields as needed */}
            </div>
          ) : (
            <p>No data available.</p>
          )}
        </ModalBody>
      </Modal>

      {/* Delete Modal for Country */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)} centered>
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          Delete Country
        </ModalHeader>
        <ModalBody className="text-center">
          <div className="mb-3">
            <i className="mdi mdi-alert-circle-outline text-danger" style={{ fontSize: 48 }}></i>
          </div>
          <p className="mb-3">
            Are you sure you want to permanently delete this <b>{countryToDelete?.displayName}</b> Country? Once deleted, cannot be recovered.
          </p>
          {deleteErrorRedux && <div className="text-danger mb-2">{countryToDelete?.displayName} country failed to delete.</div>}
          <div className="d-flex justify-content-center gap-2">
            <Button color="danger" onClick={handleDeleteCountry} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
            <Button color="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  )
}

LocationManagement.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
}

export default LocationManagement