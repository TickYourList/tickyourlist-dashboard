import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Input, Badge, Spinner, Label, FormGroup } from "reactstrap";
import { searchTourGroupsByName, getVariantsByTour } from "helpers/location_management_helper";

/**
 * Per-product coupon scoping selector.
 * - Search and pick tour groups (coupon applies only to them; empty = all products)
 * - Optionally narrow further to specific variants of the selected groups
 *
 * Emits { tourGroupIds: string[], variantIds: string[] } via onChange.
 */
const CouponProductScope = ({ value, onChange, initialSummary }) => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  // selected: [{ id, name, variants: [{id, name}]|null, loadingVariants }]
  const [selected, setSelected] = useState(value?.selectedGroups || []);
  const [variantIds, setVariantIds] = useState(value?.variantIds || []);
  const debounceRef = useRef(null);

  const emit = useCallback((groups, vIds) => {
    onChange({
      tourGroupIds: groups.map((g) => g.id),
      variantIds: vIds,
      selectedGroups: groups,
    });
  }, [onChange]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchTourGroupsByName(query.trim());
        const list = res?.data?.tourGroups || res?.data || [];
        setResults(Array.isArray(list) ? list.slice(0, 8) : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  const addGroup = async (tg) => {
    const id = tg._id || tg.id;
    if (selected.some((g) => g.id === id)) return;
    const entry = { id, name: tg.name || tg.title || id, variants: null, loadingVariants: true };
    const next = [...selected, entry];
    setSelected(next);
    emit(next, variantIds);
    setQuery("");
    setResults([]);
    // Load variants for optional narrowing
    try {
      const res = await getVariantsByTour(id);
      const vs = (res?.data || []).map((v) => ({ id: v._id, name: v.name }));
      setSelected((prev) => {
        const upd = prev.map((g) => (g.id === id ? { ...g, variants: vs, loadingVariants: false } : g));
        emit(upd, variantIds);
        return upd;
      });
    } catch {
      setSelected((prev) => prev.map((g) => (g.id === id ? { ...g, variants: [], loadingVariants: false } : g)));
    }
  };

  const removeGroup = (id) => {
    const next = selected.filter((g) => g.id !== id);
    // Drop variant selections belonging to the removed group
    const removed = selected.find((g) => g.id === id);
    const removedVariantIds = new Set((removed?.variants || []).map((v) => v.id));
    const nextVids = variantIds.filter((v) => !removedVariantIds.has(v));
    setSelected(next);
    setVariantIds(nextVids);
    emit(next, nextVids);
  };

  const toggleVariant = (vid) => {
    const next = variantIds.includes(vid) ? variantIds.filter((v) => v !== vid) : [...variantIds, vid];
    setVariantIds(next);
    emit(selected, next);
  };

  return (
    <div className="border rounded p-2 bg-light" style={{ fontSize: 13 }}>
      <Label className="fw-semibold mb-1" style={{ fontSize: 13 }}>
        Product scope <span className="text-muted fw-normal">(optional — leave empty to apply to all products)</span>
      </Label>
      {initialSummary ? (
        <div className="text-muted mb-2" style={{ fontSize: 12 }}>
          <i className="bx bx-info-circle me-1" />{initialSummary}
        </div>
      ) : null}

      <div className="position-relative">
        <Input
          bsSize="sm"
          placeholder="Search tour groups by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && <Spinner size="sm" className="position-absolute" style={{ right: 8, top: 7 }} />}
        {results.length > 0 && (
          <div className="border rounded bg-white shadow-sm position-absolute w-100" style={{ zIndex: 1080, maxHeight: 220, overflowY: "auto" }}>
            {results.map((tg) => (
              <button
                key={tg._id || tg.id}
                type="button"
                className="btn btn-sm w-100 text-start border-0 border-bottom rounded-0"
                onClick={() => addGroup(tg)}
              >
                {tg.name || tg.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-2">
          {selected.map((g) => (
            <div key={g.id} className="border rounded bg-white p-2 mb-1">
              <div className="d-flex justify-content-between align-items-center">
                <Badge color="primary" style={{ fontSize: 11 }}>{g.name}</Badge>
                <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => removeGroup(g.id)}>
                  <i className="bx bx-x" /> remove
                </button>
              </div>
              {g.loadingVariants ? (
                <small className="text-muted"><Spinner size="sm" /> loading variants…</small>
              ) : g.variants && g.variants.length > 0 ? (
                <div className="mt-1">
                  <small className="text-muted d-block mb-1">Narrow to specific variants (none checked = whole tour group):</small>
                  {g.variants.map((v) => (
                    <FormGroup check inline key={v.id} className="me-2">
                      <Input
                        type="checkbox"
                        id={`cv-${v.id}`}
                        checked={variantIds.includes(v.id)}
                        onChange={() => toggleVariant(v.id)}
                      />
                      <Label check for={`cv-${v.id}`} style={{ fontSize: 12 }}>{v.name}</Label>
                    </FormGroup>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CouponProductScope.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  initialSummary: PropTypes.string,
};

export default CouponProductScope;
