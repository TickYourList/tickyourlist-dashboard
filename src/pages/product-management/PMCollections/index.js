import React, { useEffect, useState, useMemo } from "react"
import PropTypes from "prop-types"
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap"

//Import Breadcrumb
import Breadcrumbs from "components/Common/Breadcrumb"

import {
  getCollections as onGetCollections,
  addCollections as onAddCollections,
  deleteCollection as onDeleteCollection,
} from "store/product-management/collections/actions"

//redux
import { useSelector, useDispatch } from "react-redux"
import TableContainer from "../../../components/Common/TableContainer"

// Column
import { Name, CityCode, Tours, Status } from "./PMCollectionsCols"

import { useNavigate } from "react-router-dom"
import DeleteModal from "./DeleteModal";

const PMCollections = props => {
  //meta title
  document.title = "Collections | Scrollit"
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [collections, setCollections] = useState([])
  const [collection, setCollection] = useState(null)
  const { pm_collections, error, loading } = useSelector(state => state.pmCollection)

  // console.log("collections display ", pm_collections)
 

  useEffect(() => {
    if (!pm_collections || pm_collections.length === 0) {
      dispatch(onGetCollections())
    }
  }, [dispatch, pm_collections])

  useEffect(() => {
    if (pm_collections) {
      setCollections(pm_collections)
    }
  }, [pm_collections])

  // console.log("pm   collections ", pm_collections)
  // console.log("collections ", collections)

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "displayName",
        filterable: true,
        Cell: cellProps => {
          return <Name {...cellProps} />
        },
      },
      {
        Header: "CityCode",
        accessor: "cityCode",
        filterable: true,
        Cell: cellProps => {
          return <CityCode {...cellProps} />
        },
      },
      {
        Header: "Tours",
        accessor: "tours",
        filterable: true,
        Cell: cellProps => {
          return <Tours {...cellProps} />
        },
      },
      {
        Header: "Status",
        accessor: "status",
        filterable: true,
        Cell: cellProps => {
          const value = cellProps?.value
          return (
            <span
              className={`badge rounded-pill ${
                value ? "bg-success" : "bg-danger"
              }`}
            >
              {value ? "Active" : "Not Active"}
            </span>
          )
        },
      },

      {
        Header: "View Details",
        accessor: "view",
        disableFilters: true,
        Cell: cellProps => {
          return (
            <Button color="primary" className="btn-rounded ">
              View Details
            </Button>
          )
        },
      },
      {
        Header: "Action",
        Cell: cellProps => {
        const { _id, language } = cellProps.row.original;

        const handleEdit = () => {
           navigate(`/collections/edit-collection/${_id}/${language}`);
          };

        const handleDelete = () => {
          onClickDelete(cellProps.row.original);
        };

        return (
          <div>
            <i
              className="mdi mdi-pencil font-size-16 text-success me-3"
              onClick={handleEdit}
              style={{ cursor: "pointer" }}
            ></i>

            <i
              className="mdi mdi-trash-can font-size-16 text-danger"
              onClick={handleDelete}
        style={{ cursor: "pointer" }}
            ></i>
          </div>
        );
      },

     },
    ],[])

  const handleAddCollectionClicks = () => {
    navigate("/collections/add")
    // window.location.reload();
  }

  // ----------------------------delete collwction----------------------------------------------------------

  const [deleteModal, setDeleteModal] = useState(false);
 const onClickDelete = (collection) => {
    setCollection(collection);
    setDeleteModal(true);
  };

  const handleDeleteCollection = () => {
      if (collection && collection._id) {
        dispatch(onDeleteCollection(collection));
        setDeleteModal(false);
      }
    };

  // ----------------------------delete collwction----------------------------------------------------------


  if(loading){
    return (<Container fluid className="p-4 mt-5">
            <h4 className="my-4">Loading Collections...</h4>
          </Container>)
  }


  return (
    <React.Fragment>
      <DeleteModal
              show={deleteModal}
              onDeleteClick={handleDeleteCollection}
              onCloseClick={() => setDeleteModal(false)}
              travelCollection_name={collection?.displayName}
            />
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Project Management"
            breadcrumbItem="collections"
          />

          {/* Table Section */}

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={pm_collections}
                    isGlobalFilter={true}
                    isAddCollectionOptions={true}
                    handleAddCollectionClicks={handleAddCollectionClicks}
                    customPageSize={10}
                    className="custom-header-css"
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  )
}

PMCollections.propTypes = {
  collections: PropTypes.array,
  onGetCollections: PropTypes.func,
}

export default PMCollections
