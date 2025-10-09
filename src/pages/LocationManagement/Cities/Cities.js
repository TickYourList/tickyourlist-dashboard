import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import TableContainer from '../../../components/Common/TableContainer';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import DeleteModal from './CityDeleteModal';
import { getCities, deleteCity } from "store/travelCity/action"
import { Country, DisplayName, CityCode, CityImage, Tours } from "./CityCol"
import { usePermissions, MODULES, ACTIONS } from '../../../helpers/permissions';

//redux
import { useSelector, useDispatch } from "react-redux";

import {
  Button,
  Col,
  Row,
  UncontrolledTooltip,
  Card,
  CardBody,
  Spinner
} from "reactstrap";
import PermissionDenied from "./PermissionDenied";

function Cities() {

  // Meta title
  document.title = "Cities | Scrollit";

  // State declarations
  const [city, setCity] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cities }  = useSelector(state => state.travelCity)
  const { can, loading: cityPermissionLoading, getCityPermissions, isPermissionsReady } = usePermissions();


  // Effect hooks
  useEffect(() => {
    if (isPermissionsReady && can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS)) {
      dispatch(getCities());
    }
  }, [dispatch, can, isPermissionsReady])
  



  const onClickDelete = (cityData) => {
    setCity(cityData);
    setDeleteModal(true);
  };

  const handleDeleteCity = () => {
    if (city && city._id) {
      if(can(ACTIONS.CAN_DELETE, MODULES.CITY_PERMS)) dispatch(deleteCity(city));
      setDeleteModal(false);
    }
  };


  const handleAddCityClick = () => {
    navigate('/add-new-city');
  }

  const handleDeleteAllCitiesClick = () => {
    console.log('You click on Delete all cities')
  }

  const columns = useMemo(() => {
    let value = [
          {
            Header: "City Image",
            accessor: "imageURL.url",
            width: "150px",
            style: {
              textAlign: "center",
              width: "10%",
              background: "#0000",
            },
            filterable: true,
            Cell: cellProps => <CityImage {...cellProps} />,
          },
          {
            Header: "City Code",
            accessor: "cityCode",
            filterable: true,
            Cell: cellProps => <CityCode {...cellProps} />,
          },
          {
            Header: "Display Name",
            accessor: "displayName",
            filterable: true,
            Cell: cellProps => <DisplayName {...cellProps} />,
          },
          {
            Header: "Country",
            accessor: "country.displayName",
            filterable: true,
            Cell: cellProps => <Country {...cellProps} />,
          },
          {
            Header: "Tours",
            accessor: "tourCount", 
            filterable: true,
            Cell: cellProps => <Tours {...cellProps} />,
          },
          {
            Header: 'View Details',
            disableFilters: true,
            Cell: ({row}) => {
              return (
                <div> 
                  {
                    can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS) ?
                    <Button
                        type="button"
                        color="primary"
                        className="btn-sm btn-rounded"
                        onClick={e => {
                          navigate(`/city-details/${row.original.cityCode}`);
                        }}
                      >
                      View City Details
                    </Button>
                    : "-"
                  }
                </div>
                  
                
              )
            }
          },
    ]

    if(can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) || can(ACTIONS.CAN_DELETE, MODULES.CITY_PERMS)) {
      value.push({
            Header: 'Action',
            disableFilters: true,
            Cell: ({row}) => {
              return (
                <div className="d-flex justify-content-center gap-3">
                  {
                    can(ACTIONS.CAN_EDIT, MODULES.CITY_PERMS) && <Link
                    to={`/edit-city/${row.original.cityCode}`}
                    className="text-success"
                  >
                    <i className="mdi mdi-pencil font-size-18" id={`edittooltip-${row.original.cityCode}`} />
                    <UncontrolledTooltip placement="top" target={`edittooltip-${row.original.cityCode}`}>
                      Edit
                    </UncontrolledTooltip>
                  </Link>
                  }

                  {
                    can(ACTIONS.CAN_DELETE, MODULES.CITY_PERMS) &&  <Link
                    to="#"
                    className="text-danger"
                    onClick={() => {
                      const cityData = row.original;
                      onClickDelete(cityData);     
                    }}
                  >
                    <i className="mdi mdi-delete font-size-18" id={`deletetooltip-${row.original.cityCode}`} />
                    <UncontrolledTooltip placement="top" target={`deletetooltip-${row.original.cityCode}`} >
                      Delete
                    </UncontrolledTooltip>
                  </Link>
                  }
                </div>
              );
            }
        })
    }

    return value;
  }, [can])

  // Show loading while permissions are being fetched
  if ( cityPermissionLoading || !isPermissionsReady ) {
      return <div className="page-content">
        <Spinner className="ms-2" color="dark" />
        <p>Loading page data</p>
      </div>
    }
  
  // Only check permissions after they are loaded
  if (!can(ACTIONS.CAN_VIEW, MODULES.CITY_PERMS)) return <PermissionDenied />;

  return (
    <React.Fragment>

      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCity}
        onCloseClick={() => setDeleteModal(false)}
        cityToDelete={city}
      />
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Location Management" breadcrumbItem="Cities" />
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={cities}
                    isGlobalFilter={true}
                    isAddCityOptions={can(ACTIONS.CAN_ADD, MODULES.CITY_PERMS)}
                    handleAddCityClick={handleAddCityClick}
                    isDeleteAllCityOption={can(ACTIONS.CAN_DELETE, MODULES.CITY_PERMS)}
                    handleDeleteAllCitiesClick={handleDeleteAllCitiesClick}
                    customPageSize={10}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

Cities.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default Cities;