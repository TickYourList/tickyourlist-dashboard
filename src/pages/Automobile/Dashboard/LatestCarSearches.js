import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import withRouter from "components/Common/withRouter";
import { isEmpty } from "lodash";

import {
  Button,
  Card,
  CardBody,
} from "reactstrap";

import {
  OrderId,
  BillingName,
  Date,
  Total
} from "./LatestCarSearchesCol";
import TableContainer from "components/Common/TableContainer";
import CarSearchesModel from "./CarSearchesModel";

const LatestCarSearches = props => {


  const [modal1, setModal1] = useState(false);

  const toggleViewModal = () => setModal1(!modal1);

  const columns = useMemo(
    () => [
      {
        Header: "Search Id",
        accessor: "_id",
        filterable: false,
        disableFilters: true,
        Cell: cellProps => {
          return <OrderId {...cellProps} />;
        },
      },
      {
        Header: "Car Brand",
        accessor: "carBrandDetails.brandName",
        disableFilters: true,
        filterable: false,
        Cell: cellProps => {
          return <BillingName {...cellProps} />;
        },
      },
      {
        Header: "Car Model",
        accessor: "carModelDetails.modelName",
        disableFilters: true,
        filterable: false,
        Cell: cellProps => {
          return <Date {...cellProps} />;
        },
      },
      {
        Header: "Total Searches",
        accessor: "count",
        disableFilters: true,
        filterable: false,
        Cell: cellProps => {
          return <Total {...cellProps} />;
        },
      }
      // {
      //   Header: "View Details",
      //   disableFilters: true,
      //   accessor: "view",
      //   Cell: cellProps => {
      //     return (
      //       <Button
      //         type="button"
      //         color="primary"
      //         className="btn-sm btn-rounded"
      //         onClick={toggleViewModal}
      //       >
      //         View Details
      //       </Button>
      //     );
      //   },
      // },
    ],
    []
  );

  return (
    <React.Fragment>
      <CarSearchesModel carSearchesList={props.carSearchesList} isOpen={modal1} toggle={toggleViewModal} />
      <Card>
        <CardBody>
          <div className="mb-4 h4 card-title">Top Cars Searched {props.carSearchesList?.length ?? 0}</div>
          <TableContainer
            columns={columns}
            data={props.carSearchesList}
            isGlobalFilter={false}
            isAddOptions={false}
            customPageSize={6}
          />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

LatestCarSearches.propTypes = {
  orders: PropTypes.array,
  onGetOrders: PropTypes.func,
};

export default withRouter(LatestCarSearches);
