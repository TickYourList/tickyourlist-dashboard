import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Row, 
  Col, 
  Card, 
  CardBody,
  Table,
  Spinner
} from "reactstrap";
import { useDispatch, useSelector } from 'react-redux';
import { getCouponUsage } from 'store/coupon/actions';

const CouponUsageModal = ({ isOpen, toggle, couponId, couponCode }) => {
  const dispatch = useDispatch();
  const { usageData, loading, error } = useSelector(state => ({
    usageData: state.coupons.usageData,
    loading: state.coupons.usageLoading,
    error: state.coupons.usageError
  }));

  const fetchUsageData = async () => {
    if (!couponId) return;
    
    try {
      await dispatch(getCouponUsage(couponId));
    } catch (err) {
      console.error('Error fetching coupon usage:', err);
    }
  };

  useEffect(() => {
    if (isOpen && couponId) {
      fetchUsageData();
    }
  }, [isOpen, couponId]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateStats = (data) => {
    // Handle various empty data scenarios
    if (!data) {
      return {
        totalUsers: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
        usageRate: 0
      };
    }

    // Handle case where data exists but usage array is empty or missing
    const usage = data.usage || [];
    if (!Array.isArray(usage) || usage.length === 0) {
      return {
        totalUsers: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
        usageRate: 0
      };
    }

    // Usage docs are CouponUsage records written at payment confirmation:
    // discountAmount / orderAmount / email / usedAt (not discount/orderValue).
    const totalUsers = new Set(usage.map((u) => u.email || u.userId)).size;
    const totalDiscount = usage.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalOrderValue = usage.reduce((sum, item) => sum + (item.orderAmount || item.finalPrice || 0), 0);
    const avgOrderValue = usage.length > 0 ? totalOrderValue / usage.length : 0;

    const maxUsage = data.coupon?.maxUsage || 0;
    const usageRate = maxUsage > 0 ? ((data.total || usage.length) / maxUsage) * 100 : 0;

    return {
      totalUsers,
      totalDiscount,
      avgOrderValue,
      usageRate
    };
  };

  const stats = calculateStats(usageData);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        Coupon Usage Report - {couponCode}
      </ModalHeader>
      <ModalBody>
        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading usage data...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

                 {!loading && !error && (
          <>
            {/* Summary Statistics */}
            <Row className="mb-4">
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <h4 className="text-primary mb-1">{stats.totalUsers}</h4>
                    <p className="text-muted mb-0">Total Users</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <h4 className="text-success mb-1">{formatCurrency(stats.totalDiscount)}</h4>
                    <p className="text-muted mb-0">Total Discount</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <h4 className="text-info mb-1">{formatCurrency(stats.avgOrderValue)}</h4>
                    <p className="text-muted mb-0">Avg Order Value</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <h4 className="text-warning mb-1">{stats.usageRate.toFixed(1)}%</h4>
                    <p className="text-muted mb-0">Usage Rate</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>

                         {/* Detailed Usage Table */}
             {usageData && usageData.usage && Array.isArray(usageData.usage) && usageData.usage.length > 0 ? (
               <div>
                 <h5 className="mb-3">Detailed Usage Data</h5>
                 <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
                   <Table striped responsive>
                     <thead>
                       <tr>
                         <th>Date</th>
                         <th>Customer</th>
                         <th>Booking</th>
                         <th>Order Value</th>
                         <th>Discount</th>
                         <th>Payment</th>
                       </tr>
                     </thead>
                     <tbody>
                       {usageData.usage.map((item, index) => (
                         <tr key={item._id || index}>
                           <td>{formatDate(item.usedAt || item.date)}</td>
                           <td>{item.email || item.customer || item.userId || 'N/A'}</td>
                           <td>
                             {item.bookingId ? (
                               <code style={{ fontSize: '0.75rem' }}>…{String(item.bookingId).slice(-8)}</code>
                             ) : '—'}
                           </td>
                           <td>{item.currency ? `${item.currency} ${(item.orderAmount || item.finalPrice || 0).toFixed(2)}` : formatCurrency(item.orderAmount || item.finalPrice || 0)}</td>
                           <td>{item.currency ? `${item.currency} ${(item.discountAmount || 0).toFixed(2)}` : formatCurrency(item.discountAmount || 0)}</td>
                           <td>
                             {item.metadata?.confirmed ? (
                               <span className="badge bg-success">Confirmed</span>
                             ) : (
                               <span className="badge bg-warning text-dark">Pending</span>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </Table>
                 </div>
               </div>
             ) : (
               <div className="text-center py-4">
                 <div className="mb-3">
                   <i className="fas fa-chart-line fa-3x text-muted"></i>
                 </div>
                 <h5 className="text-muted mb-2">No Usage Data Available</h5>
                 <p className="text-muted mb-0">
                   This coupon hasn't been used yet. Usage statistics will appear here once customers start using this coupon.
                 </p>
               </div>
             )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CouponUsageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  couponId: PropTypes.string,
  couponCode: PropTypes.string
};

export default CouponUsageModal; 