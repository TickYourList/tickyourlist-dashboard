// This file implements the main Coupons page for Operations, displaying and managing the list of coupons and discounts.
import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import TableContainer from "components/Common/TableContainer";
import Breadcrumbs from "components/Common/Breadcrumb";
import {
  CouponDetails,
  Discount,
  Conditions,
  Usage,
  ValidPeriod,
  Status,
  Actions
} from './CouponsCol';
import CouponsModal from "./CouponsModal";
import AddCouponModal from "./AddCouponModal";
import { getCoupon as onGetCoupon } from 'store/coupon/actions';
import { Card, CardBody, Container, Row, Col, Button } from "reactstrap";

function StatusColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <select
      className="form-select"
      value={filterValue || 'all'}
      onChange={e => setFilter(e.target.value === 'all' ? undefined : e.target.value)}
      style={{ width: 120 }}
    >
      <option value="all">All</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  );
}

const couponColumns = [
  { Header: 'Coupon Details', accessor: 'couponDetails', Cell: CouponDetails },
  { Header: 'Discount', accessor: 'discount', Cell: Discount },
  { Header: 'Conditions', accessor: 'conditions', Cell: Conditions },
  { Header: 'Usage', accessor: 'usage', Cell: Usage },
  { Header: 'Valid Period', accessor: 'validPeriod', Cell: ValidPeriod },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: Status,
    Filter: StatusColumnFilter,
    filter: 'includes',
  },
  { Header: 'Actions', accessor: 'actions', Cell: Actions, disableFilters: true },
];

const Coupons = () => {
  document.title = "Coupons & Discounts | Scrollit";
  const dispatch = useDispatch();
  const [addModal, setAddModal] = useState(false);
  const [importModal, setImportModal] = useState(false);

  const { coupons, total, page, limit, loading, error } = useSelector(state => ({
    coupons: state.coupons.coupons,
    total: state.coupons.total,
    page: state.coupons.page,
    limit: state.coupons.limit,
    loading: state.coupons.loading,
    error: state.coupons.error,
  }));

  const handlePageChange = (page) => {
    dispatch(onGetCoupon(page + 1, limit));
  };

  const handlePageSizeChange = (pageSize) => {
    dispatch(onGetCoupon(1, pageSize));
  };

  useEffect(() => {
    dispatch(onGetCoupon(1, 10));
  }, [dispatch]);

  const data = useMemo(() => {
    const sortedCoupons = [...(coupons || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sortedCoupons.map(coupon => ({
      couponDetails: coupon,
      discount: coupon,
      validPeriod: coupon,
      conditions: coupon,
      usage: { currentUsage: coupon.currentUsage, maxUsage: coupon.maxUsage },
      status: coupon.isActive ? 'Active' : 'Inactive',
      actions: coupon,
    }));
  }, [coupons]);

  const customControls = (
    <div className="d-flex w-100 justify-content-between align-items-center flex-wrap mb-2">
      <div className="d-flex align-items-center gap-2">
      </div>
      <div className="d-flex align-items-center gap-2">
        <Button color="success" onClick={() => setImportModal(true)}>
          <i className="me-2 fa fa-file-import" />
          Import Coupons
        </Button>
        <Button color="info" onClick={() => {/* logic here */}}>
          <i className="me-2 fa fa-file-export" />
          Export
        </Button>
        <Button color="primary" onClick={() => setAddModal(true)}>
          <i className="mdi mdi-plus me-1" />
          Create Coupon
        </Button>
        <Button color="danger" onClick={() => {/* logic here */}}>
          <i className="fa fa-trash me-1" />
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Coupons" breadcrumbItem="Coupons & Discounts" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  {customControls}
                  <TableContainer
                    columns={couponColumns}
                    data={data}
                    isGlobalFilter={true}
                    isAddCustList={false}
                    customPageSize={limit}
                    className="custom-header-css"
                    isServerSide={true}
                    pageCount={Math.ceil(total / limit)}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageIndex={page - 1}
                  />
                  {loading && <div>Loading...</div>}
                  {error && <div className="text-danger">{error.toString()}</div>}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
        <CouponsModal isOpen={importModal} toggle={() => setImportModal(false)} coupons={data} />
        <AddCouponModal isOpen={addModal} toggle={() => setAddModal(false)} />
      </div>
    </React.Fragment>
  );
};

export default Coupons;