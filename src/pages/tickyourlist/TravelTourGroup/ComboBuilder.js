import React, { useEffect, useMemo, useState } from "react"
import { Button, Col, Input, Label, Row, Spinner } from "reactstrap"
import Select from "react-select"
import { get } from "helpers/api_helper"

/**
 * Combo bundle builder — shown when flowType === "COMBO". Lets an admin pick the
 * constituent experiences (each a tourGroup + a specific variant) and the combo
 * discount. One fetch of /travel-tour-group-list gives every tour group with its
 * variants, so the two selects cascade without extra calls.
 *
 * Shape (matches backend comboConfig):
 *   { items: [{ tourGroupId, variantId, label, required, minQty }], discount: { type, value } }
 */

const DISCOUNT_TYPES = [
  { value: "PERCENT", label: "% off summed price" },
  { value: "FIXED", label: "Flat amount off" },
  { value: "FIXED_PRICE", label: "Fixed combo price" },
]

export const emptyComboConfig = () => ({
  items: [],
  discount: { type: "PERCENT", value: 0 },
})

// DB doc -> Formik value (ids as strings for the selects)
export const comboConfigToFormValue = (combo) => {
  if (!combo || typeof combo !== "object") return emptyComboConfig()
  return {
    items: Array.isArray(combo.items)
      ? combo.items.map((it) => ({
          tourGroupId: it.tourGroupId ? String(it.tourGroupId) : "",
          variantId: it.variantId ? String(it.variantId) : "",
          label: it.label || "",
          required: it.required !== false,
          minQty: Number(it.minQty) > 0 ? Number(it.minQty) : 1,
        }))
      : [],
    discount: {
      type: combo.discount?.type || "PERCENT",
      value: Number(combo.discount?.value) || 0,
    },
  }
}

// Formik value -> payload. Returns null when not a usable combo (so non-combo
// products never persist an empty comboConfig).
export const comboConfigToPayload = (combo) => {
  if (!combo || !Array.isArray(combo.items)) return null
  const items = combo.items
    .filter((it) => it.tourGroupId && it.variantId)
    .map((it, i) => ({
      tourGroupId: it.tourGroupId,
      variantId: it.variantId,
      label: (it.label || "").trim() || undefined,
      required: it.required !== false,
      minQty: Number(it.minQty) > 0 ? Number(it.minQty) : 1,
      sortOrder: i,
    }))
  if (items.length < 2) return null
  return {
    items,
    discount: {
      type: combo.discount?.type || "PERCENT",
      value: Math.max(0, Number(combo.discount?.value) || 0),
    },
  }
}

const ComboBuilder = ({ value, onChange }) => {
  const combo = value && value.items ? value : emptyComboConfig()
  const [tourGroups, setTourGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    get("/v1/tyltraveltourgroup/get/travel-tour-group-list")
      .then((res) => {
        if (!active) return
        setTourGroups(Array.isArray(res?.data) ? res.data : [])
      })
      .catch((e) => active && setError(e?.response?.data?.message || "Failed to load experiences"))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const tgOptions = useMemo(
    () => tourGroups.map((tg) => ({ value: String(tg._id), label: tg.name || "(unnamed)" })),
    [tourGroups],
  )
  const variantsFor = (tourGroupId) => {
    const tg = tourGroups.find((t) => String(t._id) === String(tourGroupId))
    return (tg?.variants || []).map((v) => ({ value: String(v._id), label: v.variantName || "(unnamed)" }))
  }

  const update = (next) => onChange({ ...combo, ...next })
  const updateItem = (idx, patch) => {
    const items = combo.items.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    update({ items })
  }
  const addItem = () =>
    update({ items: [...combo.items, { tourGroupId: "", variantId: "", label: "", required: true, minQty: 1 }] })
  const removeItem = (idx) => update({ items: combo.items.filter((_, i) => i !== idx) })

  return (
    <div className="border rounded p-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Combo bundle</h5>
        {loading && <Spinner size="sm" />}
      </div>
      <p className="text-muted small mb-3">
        Bundle 2+ existing experiences. Customers pick a date/time/pax per experience at checkout and pay once at the
        discounted combo price.
      </p>
      {error && <div className="text-danger small mb-2">{error}</div>}

      {/* Discount config */}
      <Row className="mb-3">
        <Col md={6}>
          <Label className="form-label">Discount type</Label>
          <Select
            options={DISCOUNT_TYPES}
            value={DISCOUNT_TYPES.find((o) => o.value === (combo.discount?.type || "PERCENT"))}
            onChange={(opt) => update({ discount: { ...combo.discount, type: opt.value } })}
          />
        </Col>
        <Col md={6}>
          <Label className="form-label">
            {combo.discount?.type === "FIXED_PRICE" ? "Combo price" : combo.discount?.type === "FIXED" ? "Amount off" : "Percent off (%)"}
          </Label>
          <Input
            type="number"
            min={0}
            value={combo.discount?.value ?? 0}
            onChange={(e) => update({ discount: { ...combo.discount, value: e.target.value } })}
          />
        </Col>
      </Row>

      {/* Items */}
      {combo.items.map((it, idx) => (
        <div key={idx} className="border rounded p-2 mb-2 bg-white">
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Label className="form-label small mb-1">Experience #{idx + 1}</Label>
              <Select
                options={tgOptions}
                value={tgOptions.find((o) => o.value === it.tourGroupId) || null}
                placeholder="Select experience…"
                onChange={(opt) => updateItem(idx, { tourGroupId: opt?.value || "", variantId: "" })}
              />
            </Col>
            <Col md={3}>
              <Label className="form-label small mb-1">Ticket variant</Label>
              <Select
                options={variantsFor(it.tourGroupId)}
                value={variantsFor(it.tourGroupId).find((o) => o.value === it.variantId) || null}
                placeholder={it.tourGroupId ? "Select variant…" : "Pick experience first"}
                isDisabled={!it.tourGroupId}
                onChange={(opt) => updateItem(idx, { variantId: opt?.value || "" })}
              />
            </Col>
            <Col md={3}>
              <Label className="form-label small mb-1">Label (optional)</Label>
              <Input
                type="text"
                value={it.label || ""}
                placeholder="Shown at checkout"
                onChange={(e) => updateItem(idx, { label: e.target.value })}
              />
            </Col>
            <Col md={1}>
              <Label className="form-label small mb-1">Min qty</Label>
              <Input
                type="number"
                min={1}
                value={it.minQty || 1}
                onChange={(e) => updateItem(idx, { minQty: Number(e.target.value) || 1 })}
              />
            </Col>
            <Col md={1} className="text-end">
              <Button color="danger" size="sm" outline onClick={() => removeItem(idx)} title="Remove">
                ✕
              </Button>
            </Col>
          </Row>
        </div>
      ))}

      <Button color="primary" size="sm" outline onClick={addItem} className="mt-1">
        + Add experience
      </Button>
      {combo.items.length > 0 && combo.items.length < 2 && (
        <div className="text-warning small mt-2">A combo needs at least 2 experiences.</div>
      )}
    </div>
  )
}

export default ComboBuilder
