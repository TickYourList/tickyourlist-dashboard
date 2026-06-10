import React, { useState, useEffect, useCallback } from "react";
import { Table, Spinner, Button, Alert, Badge, Input } from "reactstrap";
import { getGlobtixCustomPricing, setGlobtixCustomPricing } from "helpers/globaltix_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

/**
 * Per-ticket-type custom selling price manager.
 * Shows nett (B2B), min sell, recommended, floor, and an editable custom price.
 * The custom price must be >= floor (max(minimumSellingPrice, nettPrice)) — the
 * backend rejects anything below it. Clearing the field reverts to recommended.
 */
const GlobaltixCustomPricing = ({ tourGroupId, environment = "staging" }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState([]);
  // edits keyed by `${variantId}:${ticketTypeId}` → string input value
  const [edits, setEdits] = useState({});

  const load = useCallback(async () => {
    if (!tourGroupId) return;
    setLoading(true);
    try {
      const res = await getGlobtixCustomPricing(tourGroupId, environment);
      const data = res?.data || res;
      setVariants(data?.variants || []);
      setEdits({});
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, [tourGroupId, environment]);

  useEffect(() => { load(); }, [load]);

  const keyOf = (v, tt) => `${v.variantId}:${tt.ticketTypeId}`;

  const onEdit = (v, tt, value) => {
    setEdits((prev) => ({ ...prev, [keyOf(v, tt)]: value }));
  };

  const currentValue = (v, tt) => {
    const k = keyOf(v, tt);
    if (k in edits) return edits[k];
    return tt.customPrice != null ? String(tt.customPrice) : "";
  };

  const isBelowFloor = (tt, val) => val !== "" && Number(val) > 0 && Number(val) < tt.floor;

  const buildUpdates = () => {
    const updates = [];
    for (const v of variants) {
      for (const tt of v.ticketTypes) {
        const k = keyOf(v, tt);
        if (!(k in edits)) continue;
        const raw = edits[k];
        const val = raw === "" ? null : Number(raw);
        // Skip no-op edits
        if ((val == null && tt.customPrice == null) || val === tt.customPrice) continue;
        updates.push({ variantId: v.variantId, ticketTypeId: tt.ticketTypeId, sellingPriceSGD: val });
      }
    }
    return updates;
  };

  const save = async () => {
    const updates = buildUpdates();
    if (!updates.length) { showToastError("No changes to save"); return; }
    // Client-side floor check for fast feedback
    for (const v of variants) {
      for (const tt of v.ticketTypes) {
        const val = edits[keyOf(v, tt)];
        if (isBelowFloor(tt, val)) {
          showToastError(`${v.variantName} – ${tt.name}: price cannot be below floor SGD ${tt.floor}`);
          return;
        }
      }
    }
    setSaving(true);
    try {
      const res = await setGlobtixCustomPricing(tourGroupId, updates, environment);
      const results = (res?.data || res)?.results || [];
      const rejected = results.filter((r) => r.status === "rejected" || r.status === "error");
      if (rejected.length) {
        showToastError(`${rejected.length} update(s) rejected: ${rejected.map((r) => r.reason).join("; ")}`);
      } else {
        showToastSuccess("Custom prices saved");
      }
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-4"><Spinner /></div>;
  if (!variants.length) return <Alert color="info" className="mb-0">No Globaltix-linked variants found for this tour group.</Alert>;

  const dirty = buildUpdates().length > 0;

  return (
    <div>
      <Alert color="light" className="border py-2" style={{ fontSize: 12 }}>
        <i className="bx bx-info-circle me-1" />
        Default display = <strong>recommended</strong>. Enter a custom price to discount (or raise) — it must stay at/above the
        <strong> floor</strong> (max of min-sell &amp; nett). Leave blank to use recommended. All prices in <strong>SGD</strong>.
      </Alert>

      {variants.map((v) => (
        <div key={v.variantId} className="mb-3">
          <div className="fw-bold mb-1" style={{ fontSize: 13 }}>{v.variantName}</div>
          <Table size="sm" bordered className="mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>Ticket Type</th>
                <th className="text-end">Nett (cost)</th>
                <th className="text-end">Min Sell</th>
                <th className="text-end">Recommended</th>
                <th className="text-end">Floor</th>
                <th className="text-end" style={{ width: 130 }}>Custom Price</th>
                <th className="text-end">Effective</th>
                <th className="text-end">Margin</th>
              </tr>
            </thead>
            <tbody>
              {v.ticketTypes.map((tt) => {
                const val = currentValue(v, tt);
                const below = isBelowFloor(tt, val);
                const effective = val !== "" && Number(val) >= tt.floor ? Number(val) : tt.recommendedPrice;
                const margin = (effective - tt.nettPrice).toFixed(2);
                return (
                  <tr key={tt.ticketTypeId}>
                    <td>{tt.name} {tt.isCustom && <Badge color="info" style={{ fontSize: 9 }}>custom</Badge>}</td>
                    <td className="text-end text-muted">{tt.nettPrice}</td>
                    <td className="text-end text-muted">{tt.minimumSellingPrice}</td>
                    <td className="text-end">{tt.recommendedPrice}</td>
                    <td className="text-end"><Badge color="secondary" style={{ fontSize: 10 }}>{tt.floor}</Badge></td>
                    <td className="text-end">
                      <Input
                        type="number"
                        bsSize="sm"
                        min={tt.floor}
                        step="0.01"
                        value={val}
                        invalid={below}
                        placeholder={String(tt.recommendedPrice)}
                        onChange={(e) => onEdit(v, tt, e.target.value)}
                        style={{ fontSize: 12, textAlign: "right" }}
                      />
                    </td>
                    <td className="text-end fw-semibold">{effective}</td>
                    <td className={`text-end ${Number(margin) <= 0 ? "text-danger" : "text-success"}`}>{margin}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ))}

      <div className="d-flex justify-content-end gap-2 mt-2">
        <Button color="light" size="sm" onClick={load} disabled={saving}>Reset</Button>
        <Button color="primary" size="sm" onClick={save} disabled={!dirty || saving}>
          {saving ? <Spinner size="sm" /> : <><i className="bx bx-save me-1" />Save Custom Prices</>}
        </Button>
      </div>
    </div>
  );
};

export default GlobaltixCustomPricing;
