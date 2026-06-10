import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Modal, ModalHeader, ModalBody, Table, Spinner, Button, Badge, Alert,
} from "reactstrap";
import { getCouponsByTourGroup } from "helpers/location_management_helper";
import { showToastError } from "helpers/toastBuilder";
import AddCouponModal from "../../Operations/Coupons/AddCouponModal";

/**
 * "Coupons & Discounts" panel for a single tour group.
 * Lists every coupon scoped to this product (directly or via its variants) and
 * lets the admin create a new coupon pre-scoped to it.
 */
const TourGroupCouponsModal = ({ isOpen, toggle, tourGroup }) => {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    if (!tourGroup?._id) return;
    setLoading(true);
    try {
      const res = await getCouponsByTourGroup(tourGroup._id);
      setCoupons(res?.data?.coupons || []);
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [tourGroup?._id]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
  const now = Date.now();

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <i className="bx bx-purchase-tag-alt me-2" />
        Coupons & Discounts — {tourGroup?.name}
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted">
            Coupons assigned to this product (directly or via its variants). Codes without a product scope apply platform-wide and are managed in Operations → Coupons.
          </small>
          <div className="d-flex gap-2">
            <Button color="light" size="sm" onClick={load} disabled={loading}>
              <i className={`bx bx-refresh${loading ? " bx-spin" : ""}`} />
            </Button>
            <Button color="primary" size="sm" onClick={() => setAddOpen(true)}>
              <i className="bx bx-plus me-1" />Create coupon for this product
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4"><Spinner /></div>
        ) : !coupons.length ? (
          <Alert color="info" className="mb-0">
            No coupons are scoped to this product yet. Create one, or scope an existing coupon from Operations → Coupons.
          </Alert>
        ) : (
          <Table size="sm" hover responsive className="align-middle" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Validity</th>
                <th>Usage</th>
                <th>Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = c.endDate && new Date(c.endDate).getTime() < now;
                return (
                  <tr key={c._id}>
                    <td><code>{c.code}</code>{c.name ? <div className="text-muted">{c.name}</div> : null}</td>
                    <td>
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}%${c.maxDiscountAmount ? ` (max ${c.maxDiscountAmount})` : ""}`
                        : `${c.currencyCode || ""} ${c.discountValue} flat`}
                    </td>
                    <td>{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</td>
                    <td>{c.currentUsage || 0}/{c.maxUsage || "∞"}</td>
                    <td>
                      {(c.tourGroupIds?.length || 0) > 0 && <Badge color="primary" className="me-1" style={{ fontSize: 10 }}>{c.tourGroupIds.length} group(s)</Badge>}
                      {(c.variantIds?.length || 0) > 0 && <Badge color="info" style={{ fontSize: 10 }}>{c.variantIds.length} variant(s)</Badge>}
                    </td>
                    <td>
                      <Badge color={expired ? "secondary" : c.isActive ? "success" : "warning"} style={{ fontSize: 10 }}>
                        {expired ? "EXPIRED" : c.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {addOpen && (
          <AddCouponModal
            isOpen={addOpen}
            toggle={() => { setAddOpen(false); load(); }}
            presetTourGroup={{ id: tourGroup._id, name: tourGroup.name }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

TourGroupCouponsModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  tourGroup: PropTypes.object,
};

export default TourGroupCouponsModal;
