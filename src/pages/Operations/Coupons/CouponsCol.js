import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, UncontrolledTooltip } from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import EditCouponModal from './EditCouponModal';
import DeleteCouponModal from './DeleteCouponModal';
import CouponUsageModal from './CouponUsageModal';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCoupon } from 'store/coupon/actions';

const CouponDetails = (cell) => {
  const c = cell.value || cell.row?.original || {};
  return (
    <span>
      <b>{c.code || 'N/A'}</b>
      <div style={{ fontSize: '85%', marginTop: 4 }}>
        {c.firstTimeOnly && <span className="badge bg-info me-1">First Time User</span>}
        {c.isSingleUse && <span className="badge bg-warning me-1">Single Use</span>}
        {c.canCombineWithOther && <span className="badge bg-success me-1">Combinable</span>}
        {c.onlyForFamily && <span className="badge bg-primary me-1">Family Only</span>}
        {c.onlyForCouple && <span className="badge bg-danger me-1">Couple Only</span>}
        {!c.firstTimeOnly && !c.isSingleUse && !c.canCombineWithOther && !c.onlyForFamily && !c.onlyForCouple && (
          <span className="text-muted">General Use</span>
        )}
      </div>
    </span>
  );
};

const Discount = (cell) => {
  const c = cell.value || cell.row?.original || {};
  return (
    <span>
      <b>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `${c.discountValue} ${c.baseCurrency}`}</b>
      {c.discountType === 'PERCENTAGE' && (
        <><br /><span style={{ fontSize: '90%' }}>Max: {c.maxDiscountAmount} {c.baseCurrency}</span></>
      )}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ValidPeriod = (cell) => {
  const c = cell.value || cell.row?.original || {};
  return (
    <span>
      {formatDate(c.startDate)}<br />to<br />{formatDate(c.endDate)}
    </span>
  );
};

const Conditions = (cell) => {
  const c = cell.value || cell.row?.original || {};
  return <span>Min: {typeof c.minBookingAmount !== 'undefined' ? c.minBookingAmount : 0} {c.baseCurrency}</span>;
};

const Usage = (cell) => {
  const c = cell.value || cell.row?.original || {};
  return <span>{c.currentUsage ?? 0} / {c.maxUsage ?? 0}</span>;
};

const Status = (cell) => (
  <Link to="#" className="text-body fw-bold">{cell.value ? cell.value : ''}</Link>
);

const Actions = (cell) => {
  const c = cell.value || {};
  const [copied, setCopied] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [usageModal, setUsageModal] = useState(false);
  const dispatch = useDispatch();
  const loading = useSelector(state => state.coupons.loading);
  const rowId = c._id || c.code || Math.random().toString(36).substr(2, 9);
  const couponCode = c.code || '';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleEdit = () => {
    setEditModal(true);
  };
  const handleUsageReport = () => {
    setUsageModal(true);
  };
  const handleDelete = () => {
    setDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    dispatch(deleteCoupon(c._id, couponCode));
    setDeleteModal(false);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Copy Button */}
        <span id={`copy-span-${rowId}`} style={{ display: 'inline-block' }}>
          <CopyToClipboard text={couponCode} onCopy={handleCopy}>
            <Button color="light" size="sm">
              <i className="fas fa-clone"></i>
            </Button>
          </CopyToClipboard>
        </span>
        <UncontrolledTooltip target={`copy-span-${rowId}`}>{copied ? 'Copied!' : 'Copy'}</UncontrolledTooltip>

        {/* Edit Button */}
        <span id={`edit-span-${rowId}`} style={{ display: 'inline-block' }}>
          <Button color="light" size="sm" onClick={handleEdit}>
            <i className="fas fa-pen"></i>
          </Button>
        </span>
        <UncontrolledTooltip target={`edit-span-${rowId}`}>Edit</UncontrolledTooltip>

        {/* View Coupon Details Button */}
        <span id={`usage-span-${rowId}`} style={{ display: 'inline-block' }}>
          <Button color="light" size="sm" onClick={handleUsageReport}>
            <i className="fas fa-eye"></i>
          </Button>
        </span>
        <UncontrolledTooltip target={`usage-span-${rowId}`}>View Coupon Details</UncontrolledTooltip>

        {/* Delete Button */}
        <span id={`delete-span-${rowId}`} style={{ display: 'inline-block' }}>
          <Button color="light" size="sm" onClick={handleDelete}>
            <i className="fas fa-trash-alt"></i>
          </Button>
        </span>
        <UncontrolledTooltip target={`delete-span-${rowId}`}>Delete</UncontrolledTooltip>
      </div>
      <EditCouponModal isOpen={editModal} toggle={() => setEditModal(false)} coupon={c} />
      <DeleteCouponModal
        isOpen={deleteModal}
        toggle={() => setDeleteModal(false)}
        couponCode={couponCode}
        onDelete={handleDeleteConfirm}
        loading={loading}
      />
      <CouponUsageModal
        isOpen={usageModal}
        toggle={() => setUsageModal(false)}
        couponId={c._id}
        couponCode={couponCode}
      />
    </>
  );
};


export {
  CouponDetails,
  Discount,
  Conditions,
  Usage,
  ValidPeriod,
  Status,
  Actions
};