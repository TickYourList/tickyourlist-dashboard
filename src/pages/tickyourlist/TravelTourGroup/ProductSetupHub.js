import React, { useState, useEffect, useCallback } from "react";
import {
  Modal, ModalHeader, ModalBody, Badge, Button, Spinner, Table,
} from "reactstrap";
import { getProductSetup, setTourGroupLive } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const Check = ({ ok }) => (
  <i className={`mdi ${ok ? "mdi-check-circle text-success" : "mdi-alert-circle-outline text-warning"} fs-5`} />
);

/**
 * One guided screen per product: setup completeness step by step, each with a
 * button straight into the right tool. Replaces hunting across seven icons.
 */
const ProductSetupHub = ({
  isOpen,
  toggle,
  tourGroup,
  onEditContent,
  onManageVariants,
  onConnectSupplier,
  onPricing,
  onCoupons,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [goingLive, setGoingLive] = useState(false);

  const load = useCallback(async () => {
    if (!tourGroup?._id) return;
    setLoading(true);
    try {
      const res = await getProductSetup(tourGroup._id);
      setData(res?.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tourGroup?._id]);

  useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

  const c = data?.checklist;
  const live = data?.product?.live;

  const readyToGoLive =
    c &&
    c.content.hasImages &&
    c.variants.visible > 0 &&
    (c.variants.priced > 0 || c.supplier.withNett > 0);

  const toggleLive = async () => {
    setGoingLive(true);
    try {
      await setTourGroupLive(tourGroup._id, !live);
      showToastSuccess(!live ? "Product is LIVE on the site 🎉" : "Product taken off the site");
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Could not change live status");
    } finally {
      setGoingLive(false);
    }
  };

  const steps = c
    ? [
        {
          n: 1,
          title: "Content & images",
          ok: c.content.hasImages && c.content.hasSummary,
          detail: `${c.content.imageCount} image${c.content.imageCount === 1 ? "" : "s"}${c.content.hasSummary ? " · summary ✓" : " · no summary"}${c.content.hasHighlights ? " · highlights ✓" : ""}`,
          action: () => onEditContent?.(tourGroup),
          actionLabel: "Edit content",
        },
        {
          n: 2,
          title: "Variants",
          ok: c.variants.visible > 0,
          detail: `${c.variants.visible} visible · ${c.variants.hidden} hidden · ${c.variants.priced} priced`,
          action: () => onManageVariants?.(tourGroup),
          actionLabel: "Manage variants",
        },
        {
          n: 3,
          title: "Supplier connection",
          ok: c.supplier.connected,
          detail: c.supplier.connected
            ? `${c.supplier.providers.join(", ")} · ${c.supplier.mappings} mapping${c.supplier.mappings === 1 ? "" : "s"} · ${c.supplier.withNett} with buy rate${c.supplier.providers.length > 1 ? " · cheapest B2B auto-routes" : ""}`
            : "No provider linked — manual product (own inventory) or connect one",
          action: () => onConnectSupplier?.(tourGroup),
          actionLabel: "⚡ Connect supplier",
          optional: true,
        },
        {
          n: 4,
          title: "Pricing & markup",
          ok: c.pricing.markupRules > 0 || c.variants.priced > 0,
          detail: `${c.pricing.markupRules} markup rule${c.pricing.markupRules === 1 ? "" : "s"} (weekend/peak rules live here)`,
          action: () => onPricing?.(tourGroup),
          actionLabel: "Open pricing",
        },
        {
          n: 5,
          title: "Discounts & coupons",
          ok: true, // optional step — informational
          detail: c.discounts.coupons > 0 ? `${c.discounts.coupons} coupon${c.discounts.coupons === 1 ? "" : "s"} assigned` : "None (optional)",
          action: () => onCoupons?.(tourGroup),
          actionLabel: "Manage coupons",
          optional: true,
        },
      ]
    : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" scrollable>
      <ModalHeader toggle={toggle}>
        <span className="d-flex align-items-center gap-2">
          🚀 Product Setup — {tourGroup?.name}
          {data && (
            <Badge color={live ? "success" : "secondary"}>{live ? "LIVE" : "NOT LIVE"}</Badge>
          )}
        </span>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-5"><Spinner /></div>
        ) : !data ? (
          <div className="text-muted text-center py-4">Could not load setup status.</div>
        ) : (
          <>
            <Table className="align-middle" borderless>
              <tbody>
                {steps.map((s) => (
                  <tr key={s.n} className="border-bottom">
                    <td style={{ width: 36 }}><Check ok={s.ok} /></td>
                    <td>
                      <div className="fw-semibold">
                        {s.n}. {s.title}
                        {s.optional && <Badge color="light" className="text-muted ms-2">optional</Badge>}
                      </div>
                      <div className="text-muted small">{s.detail}</div>
                    </td>
                    <td className="text-end" style={{ width: 170 }}>
                      <Button size="sm" color={s.ok ? "light" : "primary"} onClick={s.action}>
                        {s.actionLabel}
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><Check ok={!!live} /></td>
                  <td>
                    <div className="fw-semibold">6. Go live</div>
                    <div className="text-muted small">
                      {live
                        ? <>Visible on the site{data.product.urlSlug && <> — <a href={`https://www.tickyourlist.com/${data.product.urlSlug}`} target="_blank" rel="noreferrer">open page ↗</a></>}</>
                        : readyToGoLive
                          ? "Everything needed is in place — flip the switch."
                          : "Needs at least: 1 image, 1 visible variant, and a price (variant price or supplier buy rate)."}
                    </div>
                  </td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      color={live ? "outline-danger" : "success"}
                      disabled={goingLive || (!live && !readyToGoLive)}
                      onClick={toggleLive}
                    >
                      {goingLive ? <Spinner size="sm" /> : live ? "Take offline" : "Go live"}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </Table>
            <div className="text-muted" style={{ fontSize: 11 }}>
              Tip: after connecting a supplier, buy rates and variant mappings sync automatically; when several
              suppliers carry this product the cheapest B2B price is used. Track performance later in
              Business Ops → Product Journey.
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ProductSetupHub;
