import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner, Input, Label,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, Nav, NavItem, NavLink,
  TabContent, TabPane, Table,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { showToastSuccess, showToastError } from "../../helpers/toastBuilder";
import {
  getStudyTour, getParticipants, getParticipant, createParticipant,
  updateParticipant, deleteParticipant, previewMessage, sendMessage,
  getTourAnalytics, getTourWeather, getManifest, runAutomations, bulkMessage,
  updateStudyTour, bulkImportParticipants, uploadDocument, getChannelAvailability,
  getDefaultDocChecklist,
  getExpenses, getExpenseSummary, addExpense, updateExpense, deleteExpense, EXPENSE_CATEGORIES,
  PARTICIPANT_STAGES, STAGE_LABELS, STAGE_COLORS, MESSAGE_TEMPLATES,
} from "../../apis/educatorStudyTour";

/** Toggle switch helper (reactstrap + bootstrap form-switch). */
const Toggle = ({ id, checked, onChange, label }) => (
  <div className="form-check form-switch">
    <input className="form-check-input" type="checkbox" role="switch" id={id} checked={!!checked} onChange={onChange} />
    <Label className="form-check-label" for={id}>{label}</Label>
  </div>
);

/** Date helper used across read-only displays. */
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

/** Compute "needs attention" reasons for a participant (client-side). */
const attentionReasons = (p) => {
  const out = [];
  const daysTo = (d) => (d ? Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000) : null);
  const missingDocs = (p.documents || []).filter((d) => d.required && d.status !== "uploaded" && d.status !== "verified").length;
  if (missingDocs && ["documents_pending", "visa_scheduled", "quoted", "paid"].includes(p.stage)) out.push(`${missingDocs} docs pending`);
  if (p.quotedAmount && (p.paidAmount || 0) < p.quotedAmount && p.stage !== "cancelled") out.push("payment due");
  const pe = daysTo(p.passportExpiry);
  if (pe != null && pe < 180) out.push("passport <6mo");
  const vd = daysTo(p.visaAppointment?.documentDeadline);
  if (vd != null && vd >= 0 && vd <= 7 && p.stage !== "visa_approved") out.push(`visa docs in ${vd}d`);
  return out;
};

// Selecting one of these tabs auto-fills the Stage dropdown to the matching stage.
const TAB_STAGE = {
  documents: "documents_pending",
  visa: "visa_scheduled",
  flight: "flight_booked",
};

const TOUR_STATUS_COLORS = { draft: "secondary", open: "success", closed: "warning", completed: "info", archived: "dark" };

const publicBaseUrl = () =>
  (process.env.REACT_APP_TYL_PUBLIC_BASE_URL || "https://www.tickyourlist.com").replace(/\/$/, "");

const publicRegistrationUrl = (tour) =>
  tour?.slug ? `${publicBaseUrl()}/educator-study-tours/${tour.slug}` : "";

const inputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const multilineToList = (text) =>
  (text || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

const listToMultiline = (list) => (Array.isArray(list) ? list.join("\n") : "");

const numberOrUndefined = (value) => {
  if (value === "" || value == null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const csvEscape = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const participantExportRows = (list) => list.map((p) => ({
  fullName: p.fullName || "",
  email: p.email || "",
  mobile: p.mobile || "",
  institutionName: p.institutionName || "",
  designation: p.designation || "",
  city: p.city || "",
  state: p.state || "",
  stage: p.stage || "",
  occupancy: p.occupancy || "",
  travelCluster: p.travelCluster || "",
  source: p.source || "",
  quotedAmount: p.quotedAmount || "",
  paidAmount: p.paidAmount || "",
  wantsExtension: p.wantsExtension || "",
}));

const IMPORT_HEADER_ALIASES = {
  fullName: ["fullname", "full name", "name", "participant name"],
  email: ["email", "email address", "mail"],
  mobile: ["mobile", "phone", "phone number", "contact", "contact number"],
  institutionName: ["institution", "institutionname", "institution name", "school", "school name"],
  designation: ["designation", "role", "title"],
  occupancy: ["occupancy", "room type"],
  travelCluster: ["travelcluster", "travel cluster", "cluster", "group"],
  city: ["city"],
  state: ["state"],
  mealPreference: ["meal", "meal preference", "food preference"],
  wantsExtension: ["extension", "wants extension", "wantsextension"],
};

const IMPORT_SAMPLE_ROWS = [
  {
    fullName: "Anita Sharma",
    email: "anita@example.com",
    mobile: "+919999999999",
    institutionName: "Green Valley School",
    designation: "Principal",
    occupancy: "double",
    travelCluster: "Mumbai group",
    city: "Mumbai",
    state: "Maharashtra",
    mealPreference: "Vegetarian",
    wantsExtension: "maybe",
  },
];

const parseCsvText = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') { value += '"'; i += 1; continue; }
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { row.push(value); value = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => String(cell).trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += ch;
  }
  row.push(value);
  if (row.some((cell) => String(cell).trim())) rows.push(row);
  return rows;
};

const normalizeHeader = (header) => String(header || "").trim().toLowerCase().replace(/[_-]+/g, " ");

const mapImportHeader = (header) => {
  const normalized = normalizeHeader(header);
  return Object.keys(IMPORT_HEADER_ALIASES).find((field) =>
    IMPORT_HEADER_ALIASES[field].some((alias) => normalizeHeader(alias) === normalized)
  ) || header.trim();
};

const parseParticipantImport = (text, existingParticipants = []) => {
  const csvRows = parseCsvText(text);
  if (!csvRows.length) return { rows: [], errors: [{ row: 0, email: "", reason: "empty file" }] };
  const headers = csvRows[0].map(mapImportHeader);
  const existingEmails = new Set(existingParticipants.map((p) => String(p.email || "").toLowerCase()));
  const seenEmails = new Set();
  const rows = [];
  const errors = [];

  csvRows.slice(1).forEach((cols, idx) => {
    const rowNumber = idx + 2;
    const item = {};
    headers.forEach((h, i) => { item[h] = String(cols[i] || "").trim(); });
    const email = String(item.email || "").toLowerCase();
    if (!item.fullName || !item.email || !item.mobile) {
      errors.push({ row: rowNumber, email: item.email || "", reason: "missing fullName, email or mobile" });
      return;
    }
    if (seenEmails.has(email)) {
      errors.push({ row: rowNumber, email, reason: "duplicate email in file" });
      return;
    }
    if (existingEmails.has(email)) {
      errors.push({ row: rowNumber, email, reason: "participant already exists in this tour" });
      return;
    }
    seenEmails.add(email);
    rows.push({ ...item, email });
  });

  return { rows, errors };
};

const EMPTY_ADVANCED_FILTERS = {
  city: "",
  state: "",
  institution: "",
  cluster: "",
  source: "",
  coordinator: "",
  documentStatus: "",
  paymentStatus: "",
  visaStatus: "",
  passportRisk: false,
  flightStatus: "",
  extensionDemand: "",
};

const containsText = (value, query) =>
  !query || String(value || "").toLowerCase().includes(String(query).toLowerCase().trim());

const daysUntilDate = (d) => {
  if (!d) return null;
  return Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
};

const matchesAdvancedFilters = (p, f) => {
  if (!containsText(p.city, f.city)) return false;
  if (!containsText(p.state, f.state)) return false;
  if (!containsText(p.institutionName, f.institution)) return false;
  if (!containsText(p.travelCluster, f.cluster)) return false;
  if (f.source && p.source !== f.source) return false;
  if (!containsText(p.assignedCoordinator?.name, f.coordinator)) return false;

  const docs = p.documents || [];
  const requiredDocs = docs.filter((d) => d.required);
  const missingRequired = requiredDocs.some((d) => d.status !== "uploaded" && d.status !== "verified");
  if (f.documentStatus === "missing_required" && !missingRequired) return false;
  if (["pending", "uploaded", "verified", "rejected"].includes(f.documentStatus) && !docs.some((d) => d.status === f.documentStatus)) return false;

  const quoted = Number(p.quotedAmount || 0);
  const paid = Number(p.paidAmount || 0);
  const overdueMilestone = (p.paymentMilestones || []).some((m) => !m.paid && daysUntilDate(m.dueDate) != null && daysUntilDate(m.dueDate) < 0);
  if (f.paymentStatus === "outstanding" && !(quoted > paid && p.stage !== "cancelled")) return false;
  if (f.paymentStatus === "fully_paid" && !(quoted > 0 && paid >= quoted)) return false;
  if (f.paymentStatus === "overdue" && !overdueMilestone) return false;

  const visaDeadlineDays = daysUntilDate(p.visaAppointment?.documentDeadline);
  if (f.visaStatus === "deadline_7d" && !(visaDeadlineDays != null && visaDeadlineDays >= 0 && visaDeadlineDays <= 7)) return false;
  if (f.visaStatus === "appointment_missing" && p.visaAppointment?.scheduled) return false;
  if (f.visaStatus === "appointment_scheduled" && !p.visaAppointment?.scheduled) return false;

  const passportDays = daysUntilDate(p.passportExpiry);
  if (f.passportRisk && !(passportDays == null || passportDays < 180)) return false;
  if (f.flightStatus === "missing" && p.flight?.booked) return false;
  if (f.flightStatus === "booked" && !p.flight?.booked) return false;
  if (f.extensionDemand && (p.wantsExtension || "no") !== f.extensionDemand) return false;

  return true;
};

const Participants = () => {
  const { tourId } = useParams();
  document.title = "Study Tour Participants | TickYourList";

  const [tour, setTour] = useState(null);
  const [stageCounts, setStageCounts] = useState({});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStage, setFilterStage] = useState("");
  const [search, setSearch] = useState("");
  const [soloOnly, setSoloOnly] = useState(false);
  const [attnOnly, setAttnOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(EMPTY_ADVANCED_FILTERS);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [detail, setDetail] = useState(null); // participant being viewed
  const [activeTab, setActiveTab] = useState("profile");
  const [addModal, setAddModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadTour = async () => {
    try {
      const res = await getStudyTour(tourId);
      setTour(res?.data?.tour || null);
      setStageCounts(res?.data?.stageCounts || {});
    } catch (e) { showToastError("Failed to load tour", "Error"); }
  };

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const res = await getParticipants({
        studyTour: tourId,
        stage: filterStage || undefined,
        search: search || undefined,
        solo: soloOnly ? "true" : undefined,
      });
      setParticipants(res?.data?.participants || []);
    } catch (e) { showToastError("Failed to load participants", "Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTour(); }, [tourId]);
  useEffect(() => { loadParticipants(); /* eslint-disable-next-line */ }, [tourId, filterStage, soloOnly]);

  const openDetail = async (id) => {
    try {
      const res = await getParticipant(id);
      setDetail(res?.data?.participant || null);
      setActiveTab("profile");
    } catch (e) { showToastError("Failed to load participant", "Error"); }
  };

  const patch = async (id, data, msg = "Updated") => {
    try {
      const res = await updateParticipant(id, data);
      showToastSuccess(msg, "Success");
      const updated = res?.data?.participant;
      if (updated) setDetail((d) => (d && d._id === id ? updated : d));
      loadParticipants(); loadTour();
    } catch (e) { showToastError(e?.response?.data?.message || "Update failed", "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this participant permanently?")) return;
    try { await deleteParticipant(id); showToastSuccess("Deleted", "Success"); setDetail(null); loadParticipants(); loadTour(); }
    catch (e) { showToastError("Delete failed", "Error"); }
  };

  const filtered = useMemo(
    () => participants
      .filter((p) => (attnOnly ? attentionReasons(p).length : true))
      .filter((p) => matchesAdvancedFilters(p, advancedFilters)),
    [participants, attnOnly, advancedFilters]
  );
  const activeAdvancedFilterCount = useMemo(
    () => Object.values(advancedFilters).filter((v) => v === true || (typeof v === "string" && v.trim())).length,
    [advancedFilters]
  );
  const selectedParticipants = useMemo(
    () => participants.filter((p) => selectedIds.includes(p._id)),
    [participants, selectedIds]
  );
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p._id));
  const toggleSelected = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const toggleAllFiltered = () => setSelectedIds((ids) => {
    if (allFilteredSelected) return ids.filter((id) => !filtered.some((p) => p._id === id));
    return [...new Set([...ids, ...filtered.map((p) => p._id)])];
  });
  const bulkUpdate = async (data, message = "Participants updated") => {
    if (!selectedParticipants.length) return;
    setLoading(true);
    try {
      await Promise.all(selectedParticipants.map((p) => updateParticipant(p._id, data)));
      showToastSuccess(`${selectedParticipants.length} participant(s) updated`, message);
      setSelectedIds([]);
      await Promise.all([loadParticipants(), loadTour()]);
    } catch (e) {
      showToastError(e?.response?.data?.message || "Bulk update failed", "Error");
    } finally {
      setLoading(false);
    }
  };
  const exportSelected = () => {
    const list = selectedParticipants.length ? selectedParticipants : filtered;
    if (!list.length) { showToastError("No participants to export", "Export"); return; }
    downloadCsv("participants-export.csv", rowsToCsv(participantExportRows(list)));
  };
  const setBulkCluster = () => {
    const travelCluster = window.prompt("Travel cluster for selected participants");
    if (travelCluster == null) return;
    bulkUpdate({ travelCluster }, "Cluster updated");
  };
  const setBulkCoordinator = () => {
    const name = window.prompt("Coordinator name for selected participants");
    if (name == null) return;
    const phone = window.prompt("Coordinator phone (optional)") || "";
    bulkUpdate({ assignedCoordinator: { name, phone } }, "Coordinator assigned");
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <Breadcrumbs title={<Link to="/educator-study-tours">Study Tours</Link>} breadcrumbItem={tour?.name || "Participants"} />
          <div className="mb-3">
            <Button color="soft-dark" size="sm" className="me-2" onClick={() => setExpensesOpen(true)}><i className="bx bx-wallet me-1" />Expenses</Button>
            <Button color="soft-secondary" size="sm" className="me-2" onClick={() => setImportOpen(true)}><i className="bx bx-import me-1" />Import CSV</Button>
            <Button color="soft-primary" size="sm" onClick={() => setSettingsOpen(true)}><i className="bx bx-cog me-1" />Tour Settings</Button>
          </div>
        </div>

        <RegistrationLinkPanel tour={tour} onEdit={() => setSettingsOpen(true)} />

        {/* Advanced cohort tools */}
        <CohortTools tourId={tourId} onChanged={() => { loadParticipants(); loadTour(); }} />

        {/* Stage board */}
        <Row className="mb-3">
          {PARTICIPANT_STAGES.filter((s) => s !== "cancelled").map((s) => (
            <Col key={s} xs={6} md={3} xl={true} className="mb-2">
              <Card className="mb-0" role="button" onClick={() => setFilterStage(filterStage === s ? "" : s)}
                    style={{ border: filterStage === s ? "2px solid #556ee6" : undefined }}>
                <CardBody className="p-2 text-center">
                  <h4 className="mb-0">{stageCounts[s] || 0}</h4>
                  <small className="text-muted">{STAGE_LABELS[s]}</small>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card><CardBody>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Label className="mb-1">Search</Label>
              <div className="d-flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                       placeholder="Name, email, institution, phone"
                       onKeyDown={(e) => e.key === "Enter" && loadParticipants()} />
                <Button color="primary" onClick={loadParticipants}><i className="bx bx-search" /></Button>
              </div>
            </Col>
            <Col md={3}>
              <Label className="mb-1">Stage</Label>
              <Input type="select" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="">All stages</option>
                {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </Input>
            </Col>
            <Col md={3}>
              <div className="mt-4 d-flex gap-3">
                <Toggle id="soloOnly" checked={soloOnly} onChange={(e) => setSoloOnly(e.target.checked)} label="Solo only" />
                <Toggle id="attnOnly" checked={attnOnly} onChange={(e) => setAttnOnly(e.target.checked)} label="Needs attention" />
              </div>
            </Col>
            <Col md={3} className="text-end">
              <Button color="soft-secondary" className="me-2" onClick={() => setAdvancedOpen((v) => !v)}>
                <i className="bx bx-filter-alt me-1" />Advanced{activeAdvancedFilterCount ? ` (${activeAdvancedFilterCount})` : ""}
              </Button>
              <Button color="success" onClick={() => setAddModal(true)}>
                <i className="bx bx-user-plus me-1" /> Add (Concierge)
              </Button>
            </Col>
          </Row>
          {advancedOpen ? (
            <AdvancedFiltersPanel
              filters={advancedFilters}
              onChange={setAdvancedFilters}
              onReset={() => setAdvancedFilters(EMPTY_ADVANCED_FILTERS)}
              resultCount={filtered.length}
            />
          ) : null}
        </CardBody></Card>

        {/* Table */}
        <Card><CardBody>
          <BulkActionBar
            selectedCount={selectedParticipants.length}
            onClear={() => setSelectedIds([])}
            onStage={(stage) => bulkUpdate({ stage }, "Stage updated")}
            onCluster={setBulkCluster}
            onCoordinator={setBulkCoordinator}
            onSolo={(isSolo) => bulkUpdate({ isSolo }, "Solo flag updated")}
            onCancel={() => {
              if (window.confirm(`Cancel ${selectedParticipants.length} selected participant(s)?`)) bulkUpdate({ stage: "cancelled" }, "Participants cancelled");
            }}
            onExport={exportSelected}
          />
          {loading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted py-4">No participants found.</div>
          ) : (
            <div className="table-responsive">
              <Table className="table align-middle mb-0">
                <thead><tr>
                  <th style={{ width: 36 }}><Input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} /></th>
                  <th>Name</th><th>Institution</th><th>Stage</th><th>Occupancy</th>
                  <th>Cluster</th><th>Contact</th><th className="text-end">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id}>
                      <td><Input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelected(p._id)} /></td>
                      <td>
                        <Link to="#" onClick={(e) => { e.preventDefault(); openDetail(p._id); }} className="fw-semibold">
                          {p.fullName}
                        </Link>
                        {p.isSolo ? <Badge color="soft-info" className="ms-2">Solo</Badge> : null}
                        {p.source === "concierge" ? <Badge color="soft-secondary" className="ms-1">Concierge</Badge> : null}
                        <div>{attentionReasons(p).map((r, ri) => <Badge key={ri} color="soft-danger" className="me-1 mt-1">{r}</Badge>)}</div>
                      </td>
                      <td>{p.institutionName || "—"}</td>
                      <td><Badge color={STAGE_COLORS[p.stage] || "secondary"}>{STAGE_LABELS[p.stage] || p.stage}</Badge></td>
                      <td className="text-capitalize">{p.occupancy || "—"}</td>
                      <td>{p.travelCluster || "—"}</td>
                      <td><div className="small">{p.email}<br />{p.mobile}</div></td>
                      <td className="text-end">
                        <Button color="soft-primary" size="sm" className="me-1" onClick={() => openDetail(p._id)}>
                          <i className="bx bx-show" />
                        </Button>
                        <Button color="soft-success" size="sm" className="me-1"
                                onClick={() => { setDetail(p); setMsgModal(true); }}>
                          <i className="bx bx-envelope" />
                        </Button>
                        <Button color="soft-danger" size="sm" onClick={() => remove(p._id)}>
                          <i className="bx bx-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody></Card>
      </Container>

      {/* Detail modal */}
      <ParticipantDetailModal
        participant={detail && !msgModal ? detail : null}
        tour={tour}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onClose={() => setDetail(null)}
        onPatch={patch}
        onMessage={() => setMsgModal(true)}
      />

      {/* Send message modal */}
      <SendMessageModal
        isOpen={msgModal}
        participant={detail}
        onClose={() => setMsgModal(false)}
        onSent={() => { setMsgModal(false); if (detail) openDetail(detail._id); }}
      />

      {/* Add concierge modal */}
      <AddParticipantModal
        isOpen={addModal}
        tourId={tourId}
        onClose={() => setAddModal(false)}
        onAdded={() => { setAddModal(false); loadParticipants(); loadTour(); }}
      />

      <ExpensesModal isOpen={expensesOpen} tourId={tourId} onClose={() => setExpensesOpen(false)} />
      <BulkImportModal isOpen={importOpen} tourId={tourId} existingParticipants={participants} onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); loadParticipants(); loadTour(); }} />
      <TourSettingsModal isOpen={settingsOpen} tour={tour} onClose={() => setSettingsOpen(false)} onSaved={() => { setSettingsOpen(false); loadTour(); }} />
    </div>
  );
};

/* ----------------------- Detail modal (tabs) --------------------------- */
const ParticipantDetailModal = ({ participant, tour, activeTab, setActiveTab, onClose, onPatch, onMessage }) => {
  const [ops, setOps] = useState({});
  const [reg, setReg] = useState({});
  const [companions, setCompanions] = useState([]);
  const [visa, setVisa] = useState({});
  const [flight, setFlight] = useState({});
  useEffect(() => {
    if (participant) {
      const x = participant;
      setOps({
        stage: x.stage || "registered",
        travelCluster: x.travelCluster || "",
        isSolo: !!x.isSolo,
        quotedAmount: x.quotedAmount || "",
        paidAmount: x.paidAmount || "",
        coordName: x.assignedCoordinator?.name || "",
        coordPhone: x.assignedCoordinator?.phone || "",
        internalNotes: x.internalNotes || "",
        milestones: (x.paymentMilestones || []).map((m) => ({
          label: m.label || "", amount: m.amount || "", paid: !!m.paid, reference: m.reference || "",
          dueDate: inputDate(m.dueDate), paidAt: inputDate(m.paidAt),
        })),
      });
      setReg({
        salutation: x.salutation || "", fullName: x.fullName || "", dob: inputDate(x.dob), gender: x.gender || "",
        communicationMethod: x.communicationMethod || "whatsapp", designation: x.designation || "",
        institutionName: x.institutionName || "", institutionType: x.institutionType || "", email: x.email || "", mobile: x.mobile || "",
        officialEmail: x.officialEmail || "", website: x.website || "",
        yearsExperience: x.yearsExperience || "", studentsCount: x.studentsCount || "", educatorsCount: x.educatorsCount || "",
        responsibilities: (x.responsibilities || []).join(", "),
        city: x.city || "", state: x.state || "", nationality: x.nationality || "",
        interests: (x.interests || []).join(", "), expectedOutcome: x.expectedOutcome || "",
        institutionVisitPreferences: (x.institutionVisitPreferences || []).join(", "),
        presentationInterest: x.presentationInterest || "", visitedNordic: !!x.visitedNordic,
        occupancy: x.occupancy || "", mealPreference: x.mealPreference || "",
        dietaryDetails: x.dietaryDetails || "", allergies: (x.allergies || []).join(", "), allergyDetails: x.allergyDetails || "",
        smoking: !!x.smoking, alcoholPreference: x.alcoholPreference || "", roommatePreference: x.roommatePreference || "",
        preferredRoommateName: x.preferredRoommateName || "", preferredRoommateInstitution: x.preferredRoommateInstitution || "",
        passportCountry: x.passportCountry || "India", passportIssueDate: inputDate(x.passportIssueDate),
        travelAssistance: (x.travelAssistance || []).join(", "), invitationLetter: !!x.invitationLetter,
        travelCommitments: x.travelCommitments || "",
        visaRefusalHas: !!x.visaRefusal?.has, visaRefusalCountry: x.visaRefusal?.country || "",
        visaRefusalYear: x.visaRefusal?.year || "", visaRefusalReason: x.visaRefusal?.reason || "",
        wantsExtension: x.wantsExtension || "", idaMember: !!x.idaMember, idaMembershipNumber: x.idaMembershipNumber || "",
        extensionDays: x.extensionDays || "", extensionTravelType: x.extensionTravelType || "",
        preferredDestinations: (x.preferredDestinations || []).join(", "), extensionCompanion: x.extensionCompanion || "",
        extensionSupport: !!x.extensionSupport, extensionNotes: x.extensionNotes || "",
        emergencyName: x.emergencyName || "", emergencyRelationship: x.emergencyRelationship || "", emergencyPhone: x.emergencyPhone || "",
        emergencyEmail: x.emergencyEmail || "",
        medicalCondition: x.medicalCondition || "", mainReason: x.mainReason || "", registeredAddress: x.registeredAddress || "",
        invoiceNameType: x.invoiceNameType || "", billingName: x.billingName || "", gstin: x.gstin || "",
        accountsContact: x.accountsContact || "", accountsEmail: x.accountsEmail || "", billingAddress: x.billingAddress || "",
        privacyConsent: !!x.declarations?.privacyConsent,
        visaDisclaimer: !!x.declarations?.visaDisclaimer,
        cancellationPolicy: !!x.declarations?.cancellationPolicy,
        medicalDeclaration: !!x.declarations?.medicalDeclaration,
      });
      setCompanions((x.accompanyingPersons || []).map((a) => ({
        fullName: a.fullName || "",
        relationship: a.relationship || "",
        dob: inputDate(a.dob),
        nationality: a.nationality || "",
        passportNumber: a.passportNumber || "",
        passportExpiry: inputDate(a.passportExpiry),
        mobile: a.mobile || "",
        email: a.email || "",
        mealPreference: a.mealPreference || "",
        visaSupport: !!a.visaSupport,
        medicalDetails: a.medicalDetails || "",
        participationType: a.participationType || "full_programme",
      })));
      const v = x.visaAppointment || {};
      setVisa({
        scheduled: !!v.scheduled,
        date: v.date ? new Date(v.date).toISOString().slice(0, 10) : "",
        time: v.time || "", centreName: v.centreName || "", centreAddress: v.centreAddress || "",
        referenceNumber: v.referenceNumber || "",
        documentDeadline: v.documentDeadline ? new Date(v.documentDeadline).toISOString().slice(0, 10) : "",
        formLink: v.formLink || "",
        passportNumber: x.passportNumber || "",
        passportExpiry: x.passportExpiry ? new Date(x.passportExpiry).toISOString().slice(0, 10) : "",
        hasSchengenVisa: !!x.hasSchengenVisa,
      });
      const f = x.flight || {};
      setFlight({
        booked: !!f.booked, pnr: f.pnr || "",
        oAirline: f.outbound?.airline || "", oFlight: f.outbound?.flightNumber || "",
        oDate: inputDate(f.outbound?.date), oDepartTime: f.outbound?.departTime || "", oArriveTime: f.outbound?.arriveTime || "",
        oFrom: f.outbound?.from || "", oTo: f.outbound?.to || "", oBaggage: f.outbound?.baggage || "",
        rAirline: f.return?.airline || "", rFlight: f.return?.flightNumber || "",
        rDate: inputDate(f.return?.date), rDepartTime: f.return?.departTime || "", rArriveTime: f.return?.arriveTime || "",
        rFrom: f.return?.from || "", rTo: f.return?.to || "", rBaggage: f.return?.baggage || "",
        departureCity: x.departureCity || "", departureAirport: x.departureAirport || "",
      });
    }
  }, [participant]);

  // Selecting a journey tab auto-fills the Stage dropdown to that tab's stage.
  // Advance-only: never rolls a more-advanced participant backwards.
  useEffect(() => {
    const mapped = TAB_STAGE[activeTab];
    if (!mapped) return;
    setOps((o) => {
      if (!o.stage) return { ...o, stage: mapped };
      const curIdx = PARTICIPANT_STAGES.indexOf(o.stage);
      const newIdx = PARTICIPANT_STAGES.indexOf(mapped);
      return newIdx > curIdx ? { ...o, stage: mapped } : o;
    });
  }, [activeTab]); // eslint-disable-line

  if (!participant) return null;
  const p = participant;

  // Advance-only stage helper: never rolls a more-advanced participant back.
  const advance = (target) => {
    const cur = PARTICIPANT_STAGES.indexOf(p.stage);
    const next = PARTICIPANT_STAGES.indexOf(target);
    return next > cur ? target : p.stage;
  };

  const saveOps = () => {
    const milestones = (ops.milestones || [])
      .filter((m) => m.label && m.amount !== "")
      .map((m) => ({
        label: m.label,
        amount: Number(m.amount),
        paid: !!m.paid,
        dueDate: m.dueDate || undefined,
        paidAt: m.paidAt || undefined,
        reference: m.reference,
      }));
    const paidFromMilestones = milestones.filter((m) => m.paid).reduce((s, m) => s + m.amount, 0);
    const paidAmount = paidFromMilestones || (ops.paidAmount === "" ? undefined : Number(ops.paidAmount));
    const quoted = ops.quotedAmount === "" ? undefined : Number(ops.quotedAmount);
    // Auto-advance to "paid" when the full quote is collected.
    let stage = ops.stage;
    if (quoted && paidAmount && paidAmount >= quoted) stage = advance("paid") === "paid" ? "paid" : stage;
    onPatch(p._id, {
      stage,
      travelCluster: ops.travelCluster,
      isSolo: ops.isSolo,
      quotedAmount: quoted,
      paidAmount,
      paymentMilestones: milestones,
      assignedCoordinator: { name: ops.coordName, phone: ops.coordPhone },
      internalNotes: ops.internalNotes,
    }, "Participant updated");
  };

  const splitList = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

  const saveReg = () => onPatch(p._id, {
    salutation: reg.salutation, fullName: reg.fullName, dob: reg.dob || undefined, gender: reg.gender,
    communicationMethod: reg.communicationMethod || undefined, designation: reg.designation,
    institutionName: reg.institutionName, institutionType: reg.institutionType, email: reg.email, mobile: reg.mobile,
    officialEmail: reg.officialEmail, website: reg.website,
    yearsExperience: numberOrUndefined(reg.yearsExperience), studentsCount: numberOrUndefined(reg.studentsCount), educatorsCount: numberOrUndefined(reg.educatorsCount),
    responsibilities: splitList(reg.responsibilities),
    city: reg.city, state: reg.state, nationality: reg.nationality, registeredAddress: reg.registeredAddress,
    interests: splitList(reg.interests), expectedOutcome: reg.expectedOutcome,
    institutionVisitPreferences: splitList(reg.institutionVisitPreferences),
    presentationInterest: reg.presentationInterest || undefined, visitedNordic: reg.visitedNordic,
    occupancy: reg.occupancy || undefined, mealPreference: reg.mealPreference,
    dietaryDetails: reg.dietaryDetails, allergies: splitList(reg.allergies), allergyDetails: reg.allergyDetails,
    smoking: reg.smoking, alcoholPreference: reg.alcoholPreference, roommatePreference: reg.roommatePreference,
    preferredRoommateName: reg.preferredRoommateName, preferredRoommateInstitution: reg.preferredRoommateInstitution,
    passportCountry: reg.passportCountry, passportIssueDate: reg.passportIssueDate || undefined,
    travelAssistance: splitList(reg.travelAssistance), invitationLetter: reg.invitationLetter, travelCommitments: reg.travelCommitments,
    visaRefusal: {
      has: !!reg.visaRefusalHas,
      country: reg.visaRefusalCountry,
      year: numberOrUndefined(reg.visaRefusalYear),
      reason: reg.visaRefusalReason,
    },
    wantsExtension: reg.wantsExtension || undefined, idaMember: reg.idaMember, idaMembershipNumber: reg.idaMembershipNumber,
    extensionDays: reg.extensionDays, extensionTravelType: reg.extensionTravelType,
    preferredDestinations: splitList(reg.preferredDestinations), extensionCompanion: reg.extensionCompanion,
    extensionSupport: reg.extensionSupport, extensionNotes: reg.extensionNotes,
    emergencyName: reg.emergencyName, emergencyRelationship: reg.emergencyRelationship, emergencyPhone: reg.emergencyPhone,
    emergencyEmail: reg.emergencyEmail,
    medicalCondition: reg.medicalCondition, mainReason: reg.mainReason,
    invoiceNameType: reg.invoiceNameType || undefined, billingName: reg.billingName, gstin: reg.gstin,
    accountsContact: reg.accountsContact, accountsEmail: reg.accountsEmail, billingAddress: reg.billingAddress,
    declarations: {
      ...(p.declarations || {}),
      privacyConsent: !!reg.privacyConsent,
      visaDisclaimer: !!reg.visaDisclaimer,
      cancellationPolicy: !!reg.cancellationPolicy,
      medicalDeclaration: !!reg.medicalDeclaration,
    },
  }, "Registration updated");

  const setCompanionField = (idx, field, value) => {
    setCompanions((items) => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addCompanion = () => {
    setCompanions((items) => [...items, {
      fullName: "", relationship: "", dob: "", nationality: "Indian", passportNumber: "", passportExpiry: "",
      mobile: "", email: "", mealPreference: "", visaSupport: true, medicalDetails: "", participationType: "full_programme",
    }]);
  };
  const removeCompanion = (idx) => setCompanions((items) => items.filter((_, i) => i !== idx));
  const saveCompanions = () => {
    const cleaned = companions
      .filter((a) => a.fullName || a.relationship || a.mobile || a.email || a.passportNumber)
      .map((a) => ({
        fullName: a.fullName,
        relationship: a.relationship,
        dob: a.dob || undefined,
        nationality: a.nationality,
        passportNumber: a.passportNumber,
        passportExpiry: a.passportExpiry || undefined,
        mobile: a.mobile,
        email: a.email,
        mealPreference: a.mealPreference,
        visaSupport: !!a.visaSupport,
        medicalDetails: a.medicalDetails,
        participationType: a.participationType || "full_programme",
      }));
    onPatch(p._id, { hasAccompanying: cleaned.length > 0, accompanyingPersons: cleaned }, "Accompanying persons updated");
  };

  const saveVisa = () => onPatch(p._id, {
    visaAppointment: {
      scheduled: visa.scheduled,
      date: visa.date || undefined, time: visa.time, centreName: visa.centreName, centreAddress: visa.centreAddress,
      referenceNumber: visa.referenceNumber, documentDeadline: visa.documentDeadline || undefined, formLink: visa.formLink,
    },
    passportNumber: visa.passportNumber, passportExpiry: visa.passportExpiry || undefined, hasSchengenVisa: visa.hasSchengenVisa,
    ...(visa.scheduled ? { stage: advance("visa_scheduled") } : {}),
  }, "Visa details updated");

  const saveFlight = () => onPatch(p._id, {
    flight: {
      booked: flight.booked, pnr: flight.pnr,
      outbound: {
        airline: flight.oAirline, flightNumber: flight.oFlight, date: flight.oDate || undefined,
        from: flight.oFrom, to: flight.oTo, departTime: flight.oDepartTime, arriveTime: flight.oArriveTime, baggage: flight.oBaggage,
      },
      return: {
        airline: flight.rAirline, flightNumber: flight.rFlight, date: flight.rDate || undefined,
        from: flight.rFrom, to: flight.rTo, departTime: flight.rDepartTime, arriveTime: flight.rArriveTime, baggage: flight.rBaggage,
      },
    },
    departureCity: flight.departureCity, departureAirport: flight.departureAirport,
    ...(flight.booked ? { stage: advance("flight_booked") } : {}),
  }, "Flight details updated");

  const verifyDoc = (idx, status) => {
    let note;
    if (status === "rejected") {
      note = window.prompt("Reason for rejecting this document");
      if (note == null) return;
    }
    const documents = (p.documents || []).map((d, i) => i === idx ? { ...d, status, ...(note !== undefined ? { note } : {}) } : d);
    onPatch(p._id, { documents }, "Document updated");
  };

  const uploadToDoc = async (idx, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const doc = (p.documents || [])[idx];
    if (doc?.maxSizeMB) {
      const tooBig = files.find((f) => f.size > doc.maxSizeMB * 1024 * 1024);
      if (tooBig) { showToastError(`"${tooBig.name}" exceeds ${doc.maxSizeMB}MB`, "Too large"); return; }
    }
    try {
      const uploaded = [];
      for (const f of files) {
        const r = await uploadDocument(f);
        if (r?.data?.url) uploaded.push({ url: r.data.url, key: r.data.key, name: f.name, size: f.size, uploadedAt: new Date() });
      }
      const documents = (p.documents || []).map((d, i) => {
        if (i !== idx) return d;
        const existing = d.multiple ? (d.files || []) : [];
        return { ...d, files: [...existing, ...uploaded], status: "uploaded" };
      });
      onPatch(p._id, { documents }, `${uploaded.length} file(s) uploaded`);
    } catch (e) { showToastError("Upload failed", "Error"); }
  };

  const removeFile = (idx, fileIdx) => {
    const documents = (p.documents || []).map((d, i) => {
      if (i !== idx) return d;
      const files = (d.files || []).filter((_, fi) => fi !== fileIdx);
      return { ...d, files, status: files.length ? d.status : "pending" };
    });
    onPatch(p._id, { documents }, "File removed");
  };

  const addCustomDoc = () => {
    const label = window.prompt("Document name (e.g. 'Marriage certificate')");
    if (!label) return;
    const documents = [...(p.documents || []), {
      key: `custom_${Date.now()}`, label, required: false, multiple: true, acceptTypes: [], files: [], status: "pending",
    }];
    onPatch(p._id, { documents }, "Document added");
  };

  return (
    <Modal isOpen={!!participant} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>
        {p.fullName} <Badge color={STAGE_COLORS[p.stage]} className="ms-2">{STAGE_LABELS[p.stage]}</Badge>
      </ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          {["profile", "companions", "ops", "documents", "visa", "flight", "comms"].map((t) => (
            <NavItem key={t}>
              <NavLink className={classnames({ active: activeTab === t })} onClick={() => setActiveTab(t)} role="button">
                <span className="text-capitalize">{t === "comms" ? "Communications" : t === "companions" ? "Accompanying" : t}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* PROFILE — editable registration */}
          <TabPane tabId="profile">
            <Row className="g-3">
              <Col md={12}><h6 className="text-muted mb-0">Personal &amp; institution</h6></Col>
              <Col md={2}><Label>Salutation</Label><Input value={reg.salutation} onChange={(e) => setReg({ ...reg, salutation: e.target.value })} /></Col>
              <Col md={5}><Label>Full name</Label><Input value={reg.fullName} onChange={(e) => setReg({ ...reg, fullName: e.target.value })} /></Col>
              <Col md={5}><Label>Designation</Label><Input value={reg.designation} onChange={(e) => setReg({ ...reg, designation: e.target.value })} /></Col>
              <Col md={6}><Label>Institution</Label><Input value={reg.institutionName} onChange={(e) => setReg({ ...reg, institutionName: e.target.value })} /></Col>
              <Col md={3}><Label>Email</Label><Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></Col>
              <Col md={3}><Label>Mobile</Label><Input value={reg.mobile} onChange={(e) => setReg({ ...reg, mobile: e.target.value })} /></Col>
              <Col md={3}><Label>Date of birth</Label><Input type="date" value={reg.dob || ""} onChange={(e) => setReg({ ...reg, dob: e.target.value })} /></Col>
              <Col md={3}><Label>Gender</Label><Input value={reg.gender || ""} onChange={(e) => setReg({ ...reg, gender: e.target.value })} /></Col>
              <Col md={3}><Label>Preferred communication</Label>
                <Input type="select" value={reg.communicationMethod || ""} onChange={(e) => setReg({ ...reg, communicationMethod: e.target.value })}>
                  <option value="">—</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="phone">Phone</option>
                </Input>
              </Col>
              <Col md={3}><Label>Official email</Label><Input type="email" value={reg.officialEmail || ""} onChange={(e) => setReg({ ...reg, officialEmail: e.target.value })} /></Col>
              <Col md={4}><Label>City</Label><Input value={reg.city} onChange={(e) => setReg({ ...reg, city: e.target.value })} /></Col>
              <Col md={4}><Label>State</Label><Input value={reg.state} onChange={(e) => setReg({ ...reg, state: e.target.value })} /></Col>
              <Col md={4}><Label>Nationality</Label><Input value={reg.nationality} onChange={(e) => setReg({ ...reg, nationality: e.target.value })} /></Col>
              <Col md={4}><Label>Institution type</Label><Input value={reg.institutionType || ""} onChange={(e) => setReg({ ...reg, institutionType: e.target.value })} /></Col>
              <Col md={4}><Label>Website</Label><Input value={reg.website || ""} onChange={(e) => setReg({ ...reg, website: e.target.value })} /></Col>
              <Col md={4}><Label>Years experience</Label><Input type="number" value={reg.yearsExperience || ""} onChange={(e) => setReg({ ...reg, yearsExperience: e.target.value })} /></Col>
              <Col md={4}><Label>Students count</Label><Input type="number" value={reg.studentsCount || ""} onChange={(e) => setReg({ ...reg, studentsCount: e.target.value })} /></Col>
              <Col md={4}><Label>Educators count</Label><Input type="number" value={reg.educatorsCount || ""} onChange={(e) => setReg({ ...reg, educatorsCount: e.target.value })} /></Col>
              <Col md={4}><Label>Responsibilities</Label><Input value={reg.responsibilities || ""} onChange={(e) => setReg({ ...reg, responsibilities: e.target.value })} placeholder="Leadership, curriculum, admissions" /></Col>
              <Col md={12}><Label>Registered address</Label><Input type="textarea" rows={2} value={reg.registeredAddress} onChange={(e) => setReg({ ...reg, registeredAddress: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Programme interest</h6></Col>
              <Col md={6}><Label>Interests (comma-separated)</Label><Input value={reg.interests || ""} onChange={(e) => setReg({ ...reg, interests: e.target.value })} /></Col>
              <Col md={6}><Label>Institution visit preferences</Label><Input value={reg.institutionVisitPreferences || ""} onChange={(e) => setReg({ ...reg, institutionVisitPreferences: e.target.value })} /></Col>
              <Col md={4}><Label>Presentation interest</Label>
                <Input type="select" value={reg.presentationInterest || ""} onChange={(e) => setReg({ ...reg, presentationInterest: e.target.value })}>
                  <option value="">—</option><option value="yes">Yes</option><option value="no">No</option><option value="maybe">Maybe</option>
                </Input>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Toggle id="visitedNordic" checked={reg.visitedNordic} onChange={(e) => setReg({ ...reg, visitedNordic: e.target.checked })} label="Visited Nordic before" />
              </Col>
              <Col md={12}><Label>Expected outcome</Label><Input type="textarea" rows={2} value={reg.expectedOutcome || ""} onChange={(e) => setReg({ ...reg, expectedOutcome: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Trip preferences</h6></Col>
              <Col md={3}><Label>Occupancy</Label>
                <Input type="select" value={reg.occupancy} onChange={(e) => setReg({ ...reg, occupancy: e.target.value })}>
                  <option value="">—</option><option value="double">Double</option><option value="single">Single</option>
                </Input>
              </Col>
              <Col md={3}><Label>Meal</Label><Input value={reg.mealPreference} onChange={(e) => setReg({ ...reg, mealPreference: e.target.value })} /></Col>
              <Col md={3}><Label>Wants extension</Label>
                <Input type="select" value={reg.wantsExtension} onChange={(e) => setReg({ ...reg, wantsExtension: e.target.value })}>
                  <option value="">—</option><option value="yes">Yes</option><option value="no">No</option><option value="maybe">Maybe</option>
                </Input>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="idaFlag" checked={reg.idaMember} onChange={(e) => setReg({ ...reg, idaMember: e.target.checked })} label="IDA member" />
              </Col>
              <Col md={3}><Label>IDA membership no.</Label><Input value={reg.idaMembershipNumber || ""} onChange={(e) => setReg({ ...reg, idaMembershipNumber: e.target.value })} /></Col>
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="invitationLetter" checked={reg.invitationLetter} onChange={(e) => setReg({ ...reg, invitationLetter: e.target.checked })} label="Needs invitation letter" />
              </Col>
              <Col md={3}><Label>Passport country</Label><Input value={reg.passportCountry || ""} onChange={(e) => setReg({ ...reg, passportCountry: e.target.value })} /></Col>
              <Col md={3}><Label>Passport issue date</Label><Input type="date" value={reg.passportIssueDate || ""} onChange={(e) => setReg({ ...reg, passportIssueDate: e.target.value })} /></Col>
              <Col md={6}><Label>Allergies (comma-separated)</Label><Input value={reg.allergies} onChange={(e) => setReg({ ...reg, allergies: e.target.value })} /></Col>
              <Col md={6}><Label>Travel assistance (comma-separated)</Label><Input value={reg.travelAssistance} onChange={(e) => setReg({ ...reg, travelAssistance: e.target.value })} /></Col>
              <Col md={6}><Label>Dietary details</Label><Input value={reg.dietaryDetails || ""} onChange={(e) => setReg({ ...reg, dietaryDetails: e.target.value })} /></Col>
              <Col md={6}><Label>Allergy details</Label><Input value={reg.allergyDetails || ""} onChange={(e) => setReg({ ...reg, allergyDetails: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Accommodation</h6></Col>
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="smokingPref" checked={reg.smoking} onChange={(e) => setReg({ ...reg, smoking: e.target.checked })} label="Smoking preference" />
              </Col>
              <Col md={3}><Label>Alcohol preference</Label><Input value={reg.alcoholPreference || ""} onChange={(e) => setReg({ ...reg, alcoholPreference: e.target.value })} /></Col>
              <Col md={3}><Label>Roommate preference</Label><Input value={reg.roommatePreference || ""} onChange={(e) => setReg({ ...reg, roommatePreference: e.target.value })} /></Col>
              <Col md={3}><Label>Preferred roommate</Label><Input value={reg.preferredRoommateName || ""} onChange={(e) => setReg({ ...reg, preferredRoommateName: e.target.value })} /></Col>
              <Col md={4}><Label>Preferred roommate institution</Label><Input value={reg.preferredRoommateInstitution || ""} onChange={(e) => setReg({ ...reg, preferredRoommateInstitution: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Visa history and extension</h6></Col>
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="visaRefusalHas" checked={reg.visaRefusalHas} onChange={(e) => setReg({ ...reg, visaRefusalHas: e.target.checked })} label="Visa refusal history" />
              </Col>
              <Col md={3}><Label>Refusal country</Label><Input value={reg.visaRefusalCountry || ""} onChange={(e) => setReg({ ...reg, visaRefusalCountry: e.target.value })} /></Col>
              <Col md={2}><Label>Refusal year</Label><Input type="number" value={reg.visaRefusalYear || ""} onChange={(e) => setReg({ ...reg, visaRefusalYear: e.target.value })} /></Col>
              <Col md={4}><Label>Refusal reason</Label><Input value={reg.visaRefusalReason || ""} onChange={(e) => setReg({ ...reg, visaRefusalReason: e.target.value })} /></Col>
              <Col md={3}><Label>Extension days</Label><Input value={reg.extensionDays || ""} onChange={(e) => setReg({ ...reg, extensionDays: e.target.value })} /></Col>
              <Col md={3}><Label>Extension travel type</Label><Input value={reg.extensionTravelType || ""} onChange={(e) => setReg({ ...reg, extensionTravelType: e.target.value })} /></Col>
              <Col md={6}><Label>Preferred destinations</Label><Input value={reg.preferredDestinations || ""} onChange={(e) => setReg({ ...reg, preferredDestinations: e.target.value })} /></Col>
              <Col md={4}><Label>Extension companion</Label><Input value={reg.extensionCompanion || ""} onChange={(e) => setReg({ ...reg, extensionCompanion: e.target.value })} /></Col>
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="extensionSupport" checked={reg.extensionSupport} onChange={(e) => setReg({ ...reg, extensionSupport: e.target.checked })} label="Needs extension support" />
              </Col>
              <Col md={12}><Label>Extension notes</Label><Input type="textarea" rows={2} value={reg.extensionNotes || ""} onChange={(e) => setReg({ ...reg, extensionNotes: e.target.value })} /></Col>
              <Col md={12}><Label>Travel commitments</Label><Input type="textarea" rows={2} value={reg.travelCommitments || ""} onChange={(e) => setReg({ ...reg, travelCommitments: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Emergency &amp; medical</h6></Col>
              <Col md={4}><Label>Emergency name</Label><Input value={reg.emergencyName} onChange={(e) => setReg({ ...reg, emergencyName: e.target.value })} /></Col>
              <Col md={4}><Label>Relationship</Label><Input value={reg.emergencyRelationship} onChange={(e) => setReg({ ...reg, emergencyRelationship: e.target.value })} /></Col>
              <Col md={4}><Label>Emergency phone</Label><Input value={reg.emergencyPhone} onChange={(e) => setReg({ ...reg, emergencyPhone: e.target.value })} /></Col>
              <Col md={4}><Label>Emergency email</Label><Input type="email" value={reg.emergencyEmail || ""} onChange={(e) => setReg({ ...reg, emergencyEmail: e.target.value })} /></Col>
              <Col md={12}><Label>Medical condition</Label><Input value={reg.medicalCondition} onChange={(e) => setReg({ ...reg, medicalCondition: e.target.value })} /></Col>
              <Col md={12}><Label>Main reason for joining</Label><Input type="textarea" rows={2} value={reg.mainReason} onChange={(e) => setReg({ ...reg, mainReason: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Billing</h6></Col>
              <Col md={3}><Label>Invoice name type</Label>
                <Input type="select" value={reg.invoiceNameType || ""} onChange={(e) => setReg({ ...reg, invoiceNameType: e.target.value })}>
                  <option value="">—</option><option value="individual">Individual</option><option value="institution">Institution</option>
                </Input>
              </Col>
              <Col md={3}><Label>Billing name</Label><Input value={reg.billingName || ""} onChange={(e) => setReg({ ...reg, billingName: e.target.value })} /></Col>
              <Col md={3}><Label>GSTIN</Label><Input value={reg.gstin || ""} onChange={(e) => setReg({ ...reg, gstin: e.target.value })} /></Col>
              <Col md={3}><Label>Accounts contact</Label><Input value={reg.accountsContact || ""} onChange={(e) => setReg({ ...reg, accountsContact: e.target.value })} /></Col>
              <Col md={4}><Label>Accounts email</Label><Input type="email" value={reg.accountsEmail || ""} onChange={(e) => setReg({ ...reg, accountsEmail: e.target.value })} /></Col>
              <Col md={8}><Label>Billing address</Label><Input value={reg.billingAddress || ""} onChange={(e) => setReg({ ...reg, billingAddress: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Declarations</h6></Col>
              <Col md={3}><Toggle id="privacyConsent" checked={reg.privacyConsent} onChange={(e) => setReg({ ...reg, privacyConsent: e.target.checked })} label="Privacy consent" /></Col>
              <Col md={3}><Toggle id="visaDisclaimer" checked={reg.visaDisclaimer} onChange={(e) => setReg({ ...reg, visaDisclaimer: e.target.checked })} label="Visa disclaimer" /></Col>
              <Col md={3}><Toggle id="cancellationPolicy" checked={reg.cancellationPolicy} onChange={(e) => setReg({ ...reg, cancellationPolicy: e.target.checked })} label="Cancellation policy" /></Col>
              <Col md={3}><Toggle id="medicalDeclaration" checked={reg.medicalDeclaration} onChange={(e) => setReg({ ...reg, medicalDeclaration: e.target.checked })} label="Medical declaration" /></Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveReg}>Save registration</Button>
          </TabPane>

          {/* ACCOMPANYING PERSONS */}
          <TabPane tabId="companions">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-0">Accompanying persons</h6>
                <small className="text-muted">Manage family members, colleagues, or travel-stay-only guests attached to this participant.</small>
              </div>
              <Button size="sm" color="soft-primary" onClick={addCompanion}><i className="bx bx-plus me-1" />Add person</Button>
            </div>
            {companions.length === 0 ? <p className="text-muted">No accompanying persons added.</p> : companions.map((a, idx) => (
              <Card key={idx} className="border mb-2">
                <CardBody>
                  <Row className="g-2">
                    <Col md={4}><Label>Full name</Label><Input value={a.fullName || ""} onChange={(e) => setCompanionField(idx, "fullName", e.target.value)} /></Col>
                    <Col md={2}><Label>Relationship</Label><Input value={a.relationship || ""} onChange={(e) => setCompanionField(idx, "relationship", e.target.value)} /></Col>
                    <Col md={2}><Label>DOB</Label><Input type="date" value={a.dob || ""} onChange={(e) => setCompanionField(idx, "dob", e.target.value)} /></Col>
                    <Col md={2}><Label>Nationality</Label><Input value={a.nationality || ""} onChange={(e) => setCompanionField(idx, "nationality", e.target.value)} /></Col>
                    <Col md={2}><Label>Participation</Label>
                      <Input type="select" value={a.participationType || "full_programme"} onChange={(e) => setCompanionField(idx, "participationType", e.target.value)}>
                        <option value="full_programme">Full programme</option>
                        <option value="travel_stay_only">Travel/stay only</option>
                      </Input>
                    </Col>
                    <Col md={3}><Label>Passport number</Label><Input value={a.passportNumber || ""} onChange={(e) => setCompanionField(idx, "passportNumber", e.target.value)} /></Col>
                    <Col md={3}><Label>Passport expiry</Label><Input type="date" value={a.passportExpiry || ""} onChange={(e) => setCompanionField(idx, "passportExpiry", e.target.value)} /></Col>
                    <Col md={3}><Label>Mobile</Label><Input value={a.mobile || ""} onChange={(e) => setCompanionField(idx, "mobile", e.target.value)} /></Col>
                    <Col md={3}><Label>Email</Label><Input type="email" value={a.email || ""} onChange={(e) => setCompanionField(idx, "email", e.target.value)} /></Col>
                    <Col md={3}><Label>Meal preference</Label><Input value={a.mealPreference || ""} onChange={(e) => setCompanionField(idx, "mealPreference", e.target.value)} /></Col>
                    <Col md={3} className="d-flex align-items-end">
                      <Toggle id={`comp-visa-${idx}`} checked={a.visaSupport} onChange={(e) => setCompanionField(idx, "visaSupport", e.target.checked)} label="Visa support" />
                    </Col>
                    <Col md={5}><Label>Medical details</Label><Input value={a.medicalDetails || ""} onChange={(e) => setCompanionField(idx, "medicalDetails", e.target.value)} /></Col>
                    <Col md={1} className="d-flex align-items-end"><i className="bx bx-trash text-danger fs-4" role="button" onClick={() => removeCompanion(idx)} /></Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
            <Button color="primary" onClick={saveCompanions}>Save accompanying persons</Button>
          </TabPane>

          {/* OPS */}
          <TabPane tabId="ops">
            <Row className="g-3">
              <Col md={4}>
                <Label>Stage</Label>
                <Input type="select" value={ops.stage} onChange={(e) => setOps({ ...ops, stage: e.target.value })}>
                  {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </Input>
              </Col>
              <Col md={4}>
                <Label>Travel cluster</Label>
                <Input value={ops.travelCluster} onChange={(e) => setOps({ ...ops, travelCluster: e.target.value })}
                       placeholder="e.g. Mumbai group" />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Toggle id="soloFlag" checked={ops.isSolo} onChange={(e) => setOps({ ...ops, isSolo: e.target.checked })} label="Solo traveller" />
              </Col>
              <Col md={4}>
                <Label>Quoted amount (₹)</Label>
                <Input type="number" value={ops.quotedAmount} onChange={(e) => setOps({ ...ops, quotedAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Paid amount (₹) <small className="text-muted">(auto from milestones)</small></Label>
                <Input type="number" value={ops.paidAmount} onChange={(e) => setOps({ ...ops, paidAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Coordinator name</Label>
                <Input value={ops.coordName} onChange={(e) => setOps({ ...ops, coordName: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Coordinator phone</Label>
                <Input value={ops.coordPhone} onChange={(e) => setOps({ ...ops, coordPhone: e.target.value })} />
              </Col>
              <Col md={12}>
                <Label>Internal notes</Label>
                <Input type="textarea" rows={2} value={ops.internalNotes} onChange={(e) => setOps({ ...ops, internalNotes: e.target.value })} />
              </Col>

              {/* Payment milestones editor */}
              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center">
                  <Label className="mb-0">Payment schedule</Label>
                  <Button size="sm" color="soft-primary" onClick={() => setOps({ ...ops, milestones: [...(ops.milestones || []), { label: "", amount: "", dueDate: "", paidAt: "", reference: "", paid: false }] })}>
                    <i className="bx bx-plus me-1" />Add milestone
                  </Button>
                </div>
                {(ops.milestones || []).length === 0 ? <small className="text-muted">No milestones — add a token/advance/balance schedule.</small> : (
                  (ops.milestones || []).map((m, mi) => (
                    <Row key={mi} className="g-2 mt-1 align-items-center">
                      <Col md={3}><Input placeholder="Label (Token / Balance)" value={m.label} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, label: e.target.value }; setOps({ ...ops, milestones: x }); }} /></Col>
                      <Col md={2}><Input type="number" placeholder="Amount" value={m.amount} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, amount: e.target.value }; setOps({ ...ops, milestones: x }); }} /></Col>
                      <Col md={2}><Input type="date" title="Due date" value={m.dueDate} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, dueDate: e.target.value }; setOps({ ...ops, milestones: x }); }} /></Col>
                      <Col md={2}><Input type="date" title="Paid date" value={m.paidAt || ""} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, paidAt: e.target.value }; setOps({ ...ops, milestones: x }); }} /></Col>
                      <Col md={2}><Input placeholder="Reference" value={m.reference || ""} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, reference: e.target.value }; setOps({ ...ops, milestones: x }); }} /></Col>
                      <Col md={1}><Toggle id={`paid-${mi}`} checked={m.paid} onChange={(e) => { const x = [...ops.milestones]; x[mi] = { ...m, paid: e.target.checked }; setOps({ ...ops, milestones: x }); }} label="Paid" /></Col>
                      <Col md={1}><i className="bx bx-trash text-danger" role="button" onClick={() => setOps({ ...ops, milestones: ops.milestones.filter((_, j) => j !== mi) })} /></Col>
                    </Row>
                  ))
                )}
              </Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveOps}>Save ops details</Button>
          </TabPane>

          {/* DOCUMENTS — upload (single/multiple), verify, add custom */}
          <TabPane tabId="documents">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Upload on the participant's behalf, verify, or add a custom document.</small>
              <Button size="sm" color="soft-primary" onClick={addCustomDoc}><i className="bx bx-plus me-1" />Add document</Button>
            </div>
            {(p.documents || []).length === 0 ? <p className="text-muted">No documents configured for this tour.</p> : (
              <Table className="align-middle">
                <thead><tr><th>Document</th><th>Req.</th><th>Status</th><th>Files</th><th style={{ minWidth: 220 }}>Action</th></tr></thead>
                <tbody>
                  {p.documents.map((d, i) => {
                    const accept = (d.acceptTypes && d.acceptTypes.length) ? d.acceptTypes.map((t) => `.${t}`).join(",") : "image/*,application/pdf,.doc,.docx";
                    const files = d.files && d.files.length ? d.files : (d.fileUrl ? [{ url: d.fileUrl, name: "file" }] : []);
                    return (
                      <tr key={d.key}>
                        <td>
                          {d.label}{d.required ? <span className="text-danger"> *</span> : null}
                          {d.multiple ? <Badge color="soft-secondary" className="ms-1">multi</Badge> : null}
                          {d.maxSizeMB ? <small className="text-muted d-block">max {d.maxSizeMB}MB {d.acceptTypes?.length ? `· ${d.acceptTypes.join("/")}` : ""}</small> : (d.acceptTypes?.length ? <small className="text-muted d-block">{d.acceptTypes.join("/")}</small> : null)}
                          {d.description ? <small className="text-muted d-block">{d.description}</small> : null}
                          {d.note ? <small className="text-danger d-block">Note: {d.note}</small> : null}
                        </td>
                        <td>{d.required ? "Yes" : "—"}</td>
                        <td><Badge color={d.status === "verified" ? "success" : d.status === "uploaded" ? "info" : d.status === "rejected" ? "danger" : "secondary"}>{d.status}</Badge></td>
                        <td>
                          {files.length === 0 ? <span className="text-muted">—</span> : files.map((f, fi) => (
                            <div key={fi} className="small d-flex align-items-center gap-1">
                              <a href={f.url} target="_blank" rel="noreferrer">{f.name || `file ${fi + 1}`}</a>
                              <i className="bx bx-x text-danger" role="button" title="remove" onClick={() => removeFile(i, fi)} />
                            </div>
                          ))}
                        </td>
                        <td>
                          <Label className="btn btn-soft-primary btn-sm mb-0 me-1">
                            <i className="bx bx-upload me-1" />Upload
                            <input type="file" hidden multiple={!!d.multiple} accept={accept}
                                   onChange={(e) => { uploadToDoc(i, e.target.files); e.target.value = ""; }} />
                          </Label>
                          <Button size="sm" color="soft-success" className="me-1" onClick={() => verifyDoc(i, "verified")}>Verify</Button>
                          <Button size="sm" color="soft-danger" onClick={() => verifyDoc(i, "rejected")}>Reject</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </TabPane>

          {/* VISA — editable */}
          <TabPane tabId="visa">
            <Row className="g-3">
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="visaSched" checked={visa.scheduled} onChange={(e) => setVisa({ ...visa, scheduled: e.target.checked })} label="Appointment scheduled" />
              </Col>
              <Col md={3}><Label>Date</Label><Input type="date" value={visa.date} onChange={(e) => setVisa({ ...visa, date: e.target.value })} /></Col>
              <Col md={3}><Label>Time</Label><Input value={visa.time} onChange={(e) => setVisa({ ...visa, time: e.target.value })} placeholder="10:30 AM" /></Col>
              <Col md={3}><Label>Reference no.</Label><Input value={visa.referenceNumber} onChange={(e) => setVisa({ ...visa, referenceNumber: e.target.value })} /></Col>
              <Col md={6}><Label>Centre name</Label><Input value={visa.centreName} onChange={(e) => setVisa({ ...visa, centreName: e.target.value })} /></Col>
              <Col md={6}><Label>Centre address</Label><Input value={visa.centreAddress} onChange={(e) => setVisa({ ...visa, centreAddress: e.target.value })} /></Col>
              <Col md={4}><Label>Document deadline</Label><Input type="date" value={visa.documentDeadline} onChange={(e) => setVisa({ ...visa, documentDeadline: e.target.value })} /></Col>
              <Col md={8}><Label>Visa form link</Label><Input value={visa.formLink} onChange={(e) => setVisa({ ...visa, formLink: e.target.value })} /></Col>
              <Col md={4}><Label>Passport number</Label><Input value={visa.passportNumber} onChange={(e) => setVisa({ ...visa, passportNumber: e.target.value })} /></Col>
              <Col md={4}><Label>Passport expiry</Label><Input type="date" value={visa.passportExpiry} onChange={(e) => setVisa({ ...visa, passportExpiry: e.target.value })} /></Col>
              <Col md={4} className="d-flex align-items-end">
                <Toggle id="schengen" checked={visa.hasSchengenVisa} onChange={(e) => setVisa({ ...visa, hasSchengenVisa: e.target.checked })} label="Holds Schengen visa" />
              </Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveVisa}>Save visa details</Button>
            <span className="text-muted ms-2 small">Then use "Send Message → Visa Appointment" to notify the participant.</span>
          </TabPane>

          {/* FLIGHT — editable */}
          <TabPane tabId="flight">
            <Row className="g-3">
              <Col md={3} className="d-flex align-items-end">
                <Toggle id="flightBooked" checked={flight.booked} onChange={(e) => setFlight({ ...flight, booked: e.target.checked })} label="Flights booked" />
              </Col>
              <Col md={3}><Label>PNR</Label><Input value={flight.pnr} onChange={(e) => setFlight({ ...flight, pnr: e.target.value })} /></Col>
              <Col md={3}><Label>Departure city</Label><Input value={flight.departureCity} onChange={(e) => setFlight({ ...flight, departureCity: e.target.value })} /></Col>
              <Col md={3}><Label>Departure airport</Label><Input value={flight.departureAirport} onChange={(e) => setFlight({ ...flight, departureAirport: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Outbound</h6></Col>
              <Col md={3}><Label>Airline</Label><Input value={flight.oAirline} onChange={(e) => setFlight({ ...flight, oAirline: e.target.value })} /></Col>
              <Col md={3}><Label>Flight no.</Label><Input value={flight.oFlight} onChange={(e) => setFlight({ ...flight, oFlight: e.target.value })} /></Col>
              <Col md={2}><Label>Date</Label><Input type="date" value={flight.oDate} onChange={(e) => setFlight({ ...flight, oDate: e.target.value })} /></Col>
              <Col md={2}><Label>From</Label><Input value={flight.oFrom} onChange={(e) => setFlight({ ...flight, oFrom: e.target.value })} /></Col>
              <Col md={2}><Label>To</Label><Input value={flight.oTo} onChange={(e) => setFlight({ ...flight, oTo: e.target.value })} /></Col>
              <Col md={2}><Label>Depart time</Label><Input value={flight.oDepartTime || ""} onChange={(e) => setFlight({ ...flight, oDepartTime: e.target.value })} placeholder="22:45" /></Col>
              <Col md={2}><Label>Arrive time</Label><Input value={flight.oArriveTime || ""} onChange={(e) => setFlight({ ...flight, oArriveTime: e.target.value })} placeholder="07:10" /></Col>
              <Col md={4}><Label>Baggage</Label><Input value={flight.oBaggage || ""} onChange={(e) => setFlight({ ...flight, oBaggage: e.target.value })} placeholder="23kg check-in + 7kg cabin" /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Return</h6></Col>
              <Col md={3}><Label>Airline</Label><Input value={flight.rAirline} onChange={(e) => setFlight({ ...flight, rAirline: e.target.value })} /></Col>
              <Col md={3}><Label>Flight no.</Label><Input value={flight.rFlight} onChange={(e) => setFlight({ ...flight, rFlight: e.target.value })} /></Col>
              <Col md={2}><Label>Date</Label><Input type="date" value={flight.rDate} onChange={(e) => setFlight({ ...flight, rDate: e.target.value })} /></Col>
              <Col md={2}><Label>From</Label><Input value={flight.rFrom || ""} onChange={(e) => setFlight({ ...flight, rFrom: e.target.value })} /></Col>
              <Col md={2}><Label>To</Label><Input value={flight.rTo || ""} onChange={(e) => setFlight({ ...flight, rTo: e.target.value })} /></Col>
              <Col md={2}><Label>Depart time</Label><Input value={flight.rDepartTime || ""} onChange={(e) => setFlight({ ...flight, rDepartTime: e.target.value })} /></Col>
              <Col md={2}><Label>Arrive time</Label><Input value={flight.rArriveTime || ""} onChange={(e) => setFlight({ ...flight, rArriveTime: e.target.value })} /></Col>
              <Col md={4}><Label>Baggage</Label><Input value={flight.rBaggage || ""} onChange={(e) => setFlight({ ...flight, rBaggage: e.target.value })} /></Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveFlight}>Save flight details</Button>
            <span className="text-muted ms-2 small">Then use "Send Message → Flight Confirmation".</span>
          </TabPane>

          {/* COMMS */}
          <TabPane tabId="comms">
            {(p.communications || []).length === 0 ? <p className="text-muted">No messages sent yet.</p> : (
              <Table className="align-middle">
                <thead><tr><th>When</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th></tr></thead>
                <tbody>
                  {[...p.communications].reverse().map((c, i) => (
                    <tr key={i}>
                      <td className="small">{new Date(c.sentAt).toLocaleString("en-IN")}</td>
                      <td className="text-capitalize">{c.channel}</td>
                      <td>{c.templateKey}</td>
                      <td className="small">{c.to || "—"}</td>
                      <td><Badge color={c.status === "sent" ? "success" : c.status === "failed" ? "danger" : "warning"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={onMessage}><i className="bx bx-envelope me-1" /> Send Message</Button>
        <Button color="light" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ----------------------- Send message modal ---------------------------- */
const SendMessageModal = ({ isOpen, participant, onClose, onSent }) => {
  const [templateKey, setTemplateKey] = useState("registration_received");
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [vars, setVars] = useState({});
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [avail, setAvail] = useState(null);

  useEffect(() => { if (isOpen) { setPreview(null); setVars({}); getChannelAvailability().then((r) => setAvail(r?.data?.channels || null)).catch(() => {}); } }, [isOpen, participant]);

  const doPreview = async () => {
    if (!participant) return;
    try {
      const res = await previewMessage(participant._id, templateKey, vars);
      setPreview(res?.data?.rendered || null);
    } catch (e) { showToastError("Preview failed", "Error"); }
  };

  const doSend = async () => {
    if (!participant) return;
    const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (!chans.length) { showToastError("Select at least one channel", "Validation"); return; }
    setBusy(true);
    try {
      const res = await sendMessage(participant._id, templateKey, chans, vars);
      const entries = res?.data?.entries || [];
      const ok = entries.filter((e) => e.status === "sent").length;
      showToastSuccess(`${ok}/${entries.length} channel(s) sent`, "Message dispatched");
      onSent();
    } catch (e) { showToastError(e?.response?.data?.message || "Send failed", "Error"); }
    finally { setBusy(false); }
  };

  if (!participant) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>Send message to {participant.fullName}</ModalHeader>
      <ModalBody>
        <Row>
          <Col md={5}>
            <Label>Template</Label>
            <Input type="select" value={templateKey} onChange={(e) => { setTemplateKey(e.target.value); setPreview(null); }}>
              {MESSAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Input>

            <Label className="mt-3">Channels</Label>
            <div className="d-flex gap-3">
              {["email", "whatsapp", "sms"].map((c) => (
                <div key={c}>
                  <Toggle id={`ch-${c}`} checked={channels[c]}
                          onChange={(e) => setChannels({ ...channels, [c]: e.target.checked })}
                          label={c[0].toUpperCase() + c.slice(1)} />
                  {avail && avail[c] === false ? <small className="text-danger d-block" style={{ fontSize: 10 }}>not configured</small> : null}
                </div>
              ))}
            </div>

            {templateKey === "payment_instructions" && (
              <>
                <Label className="mt-3">Amount (₹)</Label>
                <Input type="number" value={vars.amount || ""} onChange={(e) => setVars({ ...vars, amount: Number(e.target.value) })} />
                <Label className="mt-2">Payment link</Label>
                <Input value={vars.paymentLink || ""} onChange={(e) => setVars({ ...vars, paymentLink: e.target.value })} />
              </>
            )}
            {templateKey === "document_request" && (
              <>
                <Label className="mt-3">Upload link</Label>
                <Input value={vars.uploadLink || ""} onChange={(e) => setVars({ ...vars, uploadLink: e.target.value })} />
                <Label className="mt-2">Deadline</Label>
                <Input type="date" value={vars.deadline || ""} onChange={(e) => setVars({ ...vars, deadline: e.target.value })} />
              </>
            )}
            {templateKey === "weather_packing" && (
              <>
                <Label className="mt-3">Temperature range</Label>
                <Input value={vars.temperatureRange || ""} onChange={(e) => setVars({ ...vars, temperatureRange: e.target.value })} placeholder="8°C to 14°C" />
              </>
            )}
            {templateKey === "sightseeing_extension" && (
              <>
                <Label className="mt-3">Response deadline</Label>
                <Input type="date" value={vars.responseDeadline || ""} onChange={(e) => setVars({ ...vars, responseDeadline: e.target.value })} />
              </>
            )}
            {templateKey === "thank_you" && (
              <>
                <Label className="mt-3">Feedback link</Label>
                <Input value={vars.feedbackLink || ""} onChange={(e) => setVars({ ...vars, feedbackLink: e.target.value })} />
              </>
            )}
            {templateKey === "custom" && (
              <>
                <Label className="mt-3">Subject</Label>
                <Input value={vars.subject || ""} onChange={(e) => setVars({ ...vars, subject: e.target.value })} />
                <Label className="mt-2">Heading</Label>
                <Input value={vars.heading || ""} onChange={(e) => setVars({ ...vars, heading: e.target.value })} />
                <Label className="mt-2">Message</Label>
                <Input type="textarea" rows={4} value={vars.message || ""} onChange={(e) => setVars({ ...vars, message: e.target.value })} />
              </>
            )}

            <Button color="secondary" outline className="mt-3" onClick={doPreview}>
              <i className="bx bx-show me-1" /> Preview email
            </Button>
          </Col>
          <Col md={7}>
            <Label>Email preview</Label>
            {preview ? (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <div className="p-2 bg-light small"><strong>Subject:</strong> {preview.subject}</div>
                <iframe title="preview" srcDoc={preview.html} style={{ width: "100%", height: 460, border: 0 }} />
              </div>
            ) : (
              <div className="text-muted border rounded p-4 text-center">Click "Preview email" to render.</div>
            )}
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="success" onClick={doSend} disabled={busy}>
          {busy ? <Spinner size="sm" /> : <><i className="bx bx-send me-1" /> Send now</>}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/* ----------------------- Add concierge modal --------------------------- */
const AddParticipantModal = ({ isOpen, tourId, onClose, onAdded }) => {
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isOpen) setF({}); }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.fullName || !f.email || !f.mobile) { showToastError("Name, email, mobile required", "Validation"); return; }
    setBusy(true);
    try {
      await createParticipant({ ...f, studyTour: tourId });
      showToastSuccess("Participant added", "Success");
      onAdded();
    } catch (e2) { showToastError(e2?.response?.data?.message || "Failed", "Error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Add participant (on their behalf)</ModalHeader>
      <Form onSubmit={submit}>
        <ModalBody>
          <div className="mb-2"><Label>Full name *</Label><Input value={f.fullName || ""} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <Row>
            <Col md={6} className="mb-2"><Label>Email *</Label><Input type="email" value={f.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} /></Col>
            <Col md={6} className="mb-2"><Label>Mobile *</Label><Input value={f.mobile || ""} onChange={(e) => setF({ ...f, mobile: e.target.value })} placeholder="+91…" /></Col>
          </Row>
          <Row>
            <Col md={6} className="mb-2"><Label>Institution</Label><Input value={f.institutionName || ""} onChange={(e) => setF({ ...f, institutionName: e.target.value })} /></Col>
            <Col md={6} className="mb-2"><Label>Designation</Label><Input value={f.designation || ""} onChange={(e) => setF({ ...f, designation: e.target.value })} /></Col>
          </Row>
          <Row>
            <Col md={6} className="mb-2"><Label>Occupancy</Label>
              <Input type="select" value={f.occupancy || ""} onChange={(e) => setF({ ...f, occupancy: e.target.value })}>
                <option value="">—</option><option value="double">Double</option><option value="single">Single</option>
              </Input>
            </Col>
            <Col md={6} className="mb-2"><Label>Travel cluster</Label><Input value={f.travelCluster || ""} onChange={(e) => setF({ ...f, travelCluster: e.target.value })} /></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={onClose}>Cancel</Button>
          <Button color="primary" type="submit" disabled={busy}>{busy ? <Spinner size="sm" /> : "Add"}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

/* ----------------------- Bulk participant actions ----------------------- */
const BulkActionBar = ({ selectedCount, onClear, onStage, onCluster, onCoordinator, onSolo, onCancel, onExport }) => {
  const [stage, setStage] = useState("");

  if (!selectedCount) return null;

  return (
    <div className="border rounded p-2 mb-3 bg-light">
      <Row className="g-2 align-items-center">
        <Col md={2}><strong>{selectedCount}</strong> selected</Col>
        <Col md={3}>
          <div className="d-flex gap-2">
            <Input bsSize="sm" type="select" value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">Set stage...</option>
              {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </Input>
            <Button size="sm" color="primary" disabled={!stage} onClick={() => { onStage(stage); setStage(""); }}>Apply</Button>
          </div>
        </Col>
        <Col md={7} className="text-md-end">
          <Button size="sm" color="soft-secondary" className="me-1" onClick={onCluster}>Cluster</Button>
          <Button size="sm" color="soft-secondary" className="me-1" onClick={onCoordinator}>Coordinator</Button>
          <Button size="sm" color="soft-info" className="me-1" onClick={() => onSolo(true)}>Mark solo</Button>
          <Button size="sm" color="soft-light" className="me-1" onClick={() => onSolo(false)}>Clear solo</Button>
          <Button size="sm" color="soft-warning" className="me-1" onClick={onCancel}>Cancel</Button>
          <Button size="sm" color="soft-success" className="me-1" onClick={onExport}>Export</Button>
          <Button size="sm" color="light" onClick={onClear}>Clear</Button>
        </Col>
      </Row>
    </div>
  );
};

/* ----------------------- Registration link panel ------------------------ */
const RegistrationLinkPanel = ({ tour, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const url = publicRegistrationUrl(tour);
  const status = tour?.status || "draft";
  const isOpen = status === "open";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      showToastSuccess("Registration link copied", "Copied");
    } catch (e) {
      showToastError("Could not copy link", "Clipboard");
    }
  };

  return (
    <Card>
      <CardBody>
        <Row className="g-3 align-items-end">
          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="mb-0">Public registration</h6>
              <Badge color={TOUR_STATUS_COLORS[status] || "secondary"}>{status}</Badge>
            </div>
            <Input value={url || "Add a tour slug to generate the public registration URL"} readOnly />
            {!isOpen ? (
              <small className="text-warning d-block mt-1">This tour is not open yet. Change status to open before sharing the link.</small>
            ) : null}
          </Col>
          <Col md={5} className="text-md-end">
            <Button color="soft-secondary" className="me-2" onClick={copy} disabled={!url}>
              <i className={`bx ${copied ? "bx-check" : "bx-copy"} me-1`} />{copied ? "Copied" : "Copy"}
            </Button>
            <Button color="soft-primary" className="me-2" onClick={() => window.open(url, "_blank", "noopener,noreferrer")} disabled={!url}>
              <i className="bx bx-link-external me-1" />Open
            </Button>
            <Button color="primary" onClick={onEdit}>
              <i className="bx bx-edit me-1" />Edit Tour
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

/* ----------------------- Advanced participant filters ------------------- */
const AdvancedFiltersPanel = ({ filters, onChange, onReset, resultCount }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="border-top mt-3 pt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Advanced filters</h6>
        <div>
          <small className="text-muted me-3">{resultCount} matching participant(s)</small>
          <Button size="sm" color="light" onClick={onReset}>Reset</Button>
        </div>
      </div>
      <Row className="g-2">
        <Col md={3}><Label className="mb-1 small">City</Label><Input bsSize="sm" value={filters.city} onChange={(e) => set("city", e.target.value)} /></Col>
        <Col md={3}><Label className="mb-1 small">State</Label><Input bsSize="sm" value={filters.state} onChange={(e) => set("state", e.target.value)} /></Col>
        <Col md={3}><Label className="mb-1 small">Institution</Label><Input bsSize="sm" value={filters.institution} onChange={(e) => set("institution", e.target.value)} /></Col>
        <Col md={3}><Label className="mb-1 small">Cluster</Label><Input bsSize="sm" value={filters.cluster} onChange={(e) => set("cluster", e.target.value)} /></Col>
        <Col md={3}><Label className="mb-1 small">Source</Label>
          <Input bsSize="sm" type="select" value={filters.source} onChange={(e) => set("source", e.target.value)}>
            <option value="">Any</option><option value="self">Self</option><option value="concierge">Concierge</option>
          </Input>
        </Col>
        <Col md={3}><Label className="mb-1 small">Coordinator</Label><Input bsSize="sm" value={filters.coordinator} onChange={(e) => set("coordinator", e.target.value)} /></Col>
        <Col md={3}><Label className="mb-1 small">Documents</Label>
          <Input bsSize="sm" type="select" value={filters.documentStatus} onChange={(e) => set("documentStatus", e.target.value)}>
            <option value="">Any</option>
            <option value="missing_required">Missing required</option>
            <option value="pending">Has pending</option>
            <option value="uploaded">Has uploaded</option>
            <option value="verified">Has verified</option>
            <option value="rejected">Has rejected</option>
          </Input>
        </Col>
        <Col md={3}><Label className="mb-1 small">Payment</Label>
          <Input bsSize="sm" type="select" value={filters.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}>
            <option value="">Any</option>
            <option value="outstanding">Outstanding</option>
            <option value="fully_paid">Fully paid</option>
            <option value="overdue">Overdue milestone</option>
          </Input>
        </Col>
        <Col md={3}><Label className="mb-1 small">Visa</Label>
          <Input bsSize="sm" type="select" value={filters.visaStatus} onChange={(e) => set("visaStatus", e.target.value)}>
            <option value="">Any</option>
            <option value="deadline_7d">Docs due in 7 days</option>
            <option value="appointment_missing">Appointment missing</option>
            <option value="appointment_scheduled">Appointment scheduled</option>
          </Input>
        </Col>
        <Col md={3}><Label className="mb-1 small">Flights</Label>
          <Input bsSize="sm" type="select" value={filters.flightStatus} onChange={(e) => set("flightStatus", e.target.value)}>
            <option value="">Any</option><option value="missing">Missing</option><option value="booked">Booked</option>
          </Input>
        </Col>
        <Col md={3}><Label className="mb-1 small">Extension demand</Label>
          <Input bsSize="sm" type="select" value={filters.extensionDemand} onChange={(e) => set("extensionDemand", e.target.value)}>
            <option value="">Any</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option>
          </Input>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Toggle id="passportRiskFilter" checked={filters.passportRisk} onChange={(e) => set("passportRisk", e.target.checked)} label="Passport risk" />
        </Col>
      </Row>
    </div>
  );
};

/* ----------------------- Cohort tools panel ---------------------------- */
const rowsToCsv = (rows) => {
  if (!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
};
const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const CohortTools = ({ tourId, onChanged }) => {
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const loadAnalytics = async () => {
    try { const r = await getTourAnalytics(tourId); setAnalytics(r?.data?.analytics || null); }
    catch (e) { /* silent */ }
  };
  useEffect(() => { loadAnalytics(); /* eslint-disable-next-line */ }, [tourId]);

  const fetchWeather = async () => {
    setBusy("weather");
    try { const r = await getTourWeather(tourId); setWeather(r?.data?.weather || null); }
    catch (e) { showToastError("Weather unavailable", "Error"); }
    finally { setBusy(""); }
  };

  const exportManifest = async (type) => {
    setBusy(type);
    try {
      const r = await getManifest(tourId, type);
      const rows = r?.data?.rows || [];
      if (!rows.length) { showToastError("No data to export", "Manifest"); return; }
      downloadCsv(`${type}-manifest.csv`, rowsToCsv(rows));
    } catch (e) { showToastError("Export failed", "Error"); }
    finally { setBusy(""); }
  };

  const runReminders = async () => {
    if (!window.confirm("Run due reminders now? This sends any deadline-driven messages that are due today.")) return;
    setBusy("automations");
    try {
      const r = await runAutomations(tourId);
      const res = r?.data?.result || {};
      showToastSuccess(`Sent ${res.sent || 0}, skipped ${res.skipped || 0}, failed ${res.failed || 0}`, "Reminders");
      onChanged && onChanged();
    } catch (e) { showToastError("Automation run failed", "Error"); }
    finally { setBusy(""); }
  };

  const a = analytics;
  return (
    <Card><CardBody>
      <Row className="align-items-center">
        <Col>
          <h6 className="mb-0"><i className="bx bx-trending-up me-1" /> Cohort Tools</h6>
        </Col>
        <Col className="text-end">
          <Button size="sm" color="soft-info" className="me-2" onClick={fetchWeather} disabled={busy === "weather"}>
            {busy === "weather" ? <Spinner size="sm" /> : <><i className="bx bx-cloud me-1" />Live weather</>}
          </Button>
          <Button size="sm" color="soft-success" className="me-2" onClick={() => setBulkOpen(true)}>
            <i className="bx bx-broadcast me-1" />Bulk message
          </Button>
          <Button size="sm" color="soft-warning" onClick={runReminders} disabled={busy === "automations"}>
            {busy === "automations" ? <Spinner size="sm" /> : <><i className="bx bx-bell me-1" />Run reminders</>}
          </Button>
        </Col>
      </Row>

      {a && (
        <Row className="mt-3 g-2">
          <Stat label="Headcount" value={a.totalHeadcount} sub={`${a.totalParticipants} leads`} />
          <Stat label="Solo" value={a.soloTravellers} />
          <Stat label="Collection" value={`${a.revenue?.collectionRate || 0}%`} sub={`₹${(a.revenue?.paidTotal || 0).toLocaleString("en-IN")}`} />
          <Stat label="Outstanding" value={`₹${(a.revenue?.outstanding || 0).toLocaleString("en-IN")}`} />
          <Stat label="Docs done" value={`${a.documents?.completionRate || 0}%`} sub={`${a.documents?.completed}/${a.documents?.required}`} />
          <Stat label="Wants extension" value={a.extensionDemand?.yes || 0} />
        </Row>
      )}

      {weather && (
        <div className="alert alert-info mt-3 mb-0">
          <strong><i className="bx bx-map-pin me-1" />{weather.place}:</strong> {weather.temperatureRange} · {weather.condition}
          {weather.indicative ? " (indicative)" : ""} — <span className="text-muted">{weather.packingHint}</span>
        </div>
      )}

      <div className="mt-3">
        <span className="text-muted me-2 small">Export manifests:</span>
        {["rooming", "dietary", "flight"].map((t) => (
          <Button key={t} size="sm" color="light" className="me-2 text-capitalize" onClick={() => exportManifest(t)} disabled={busy === t}>
            <i className="bx bx-download me-1" />{t} CSV
          </Button>
        ))}
      </div>

      <BulkMessageModal isOpen={bulkOpen} tourId={tourId} onClose={() => setBulkOpen(false)} onSent={() => { setBulkOpen(false); onChanged && onChanged(); }} />
    </CardBody></Card>
  );
};

const Stat = ({ label, value, sub }) => (
  <Col xs={6} md={2}>
    <div className="border rounded p-2 text-center h-100">
      <h5 className="mb-0">{value}</h5>
      <small className="text-muted d-block">{label}</small>
      {sub ? <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small> : null}
    </div>
  </Col>
);

const BulkMessageModal = ({ isOpen, tourId, onClose, onSent }) => {
  const [templateKey, setTemplateKey] = useState("custom");
  const [stage, setStage] = useState("");
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [vars, setVars] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isOpen) { setVars({}); setStage(""); } }, [isOpen]);

  const send = async () => {
    const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (!chans.length) { showToastError("Select a channel", "Validation"); return; }
    if (!window.confirm("Send this message to the whole (filtered) cohort?")) return;
    setBusy(true);
    try {
      const r = await bulkMessage(tourId, templateKey, chans, vars, stage || undefined);
      const d = r?.data || {};
      showToastSuccess(`${d.sent || 0}/${d.recipients || 0} sent`, "Bulk message");
      onSent();
    } catch (e) { showToastError("Bulk send failed", "Error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Bulk message to cohort</ModalHeader>
      <ModalBody>
        <Label>Template</Label>
        <Input type="select" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)}>
          {MESSAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </Input>
        <Label className="mt-2">Only stage (optional)</Label>
        <Input type="select" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </Input>
        <Label className="mt-2">Channels</Label>
        <div className="d-flex gap-3">
          {["email", "whatsapp", "sms"].map((c) => (
            <Toggle key={c} id={`bch-${c}`} checked={channels[c]}
                    onChange={(e) => setChannels({ ...channels, [c]: e.target.checked })}
                    label={c[0].toUpperCase() + c.slice(1)} />
          ))}
        </div>
        {templateKey === "custom" && (
          <>
            <Label className="mt-2">Subject</Label>
            <Input value={vars.subject || ""} onChange={(e) => setVars({ ...vars, subject: e.target.value })} />
            <Label className="mt-2">Heading</Label>
            <Input value={vars.heading || ""} onChange={(e) => setVars({ ...vars, heading: e.target.value })} />
            <Label className="mt-2">Message</Label>
            <Input type="textarea" rows={3} value={vars.message || ""} onChange={(e) => setVars({ ...vars, message: e.target.value })} />
          </>
        )}
        {templateKey === "weather_packing" && (
          <p className="text-muted small mt-2">Leave temperature blank — a live forecast is fetched automatically.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="success" onClick={send} disabled={busy}>{busy ? <Spinner size="sm" /> : "Send to cohort"}</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Expenses modal ============================== */
const ExpensesModal = ({ isOpen, tourId, onClose }) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [f, setF] = useState({ category: "hotel", status: "incurred" });
  const [editingId, setEditingId] = useState("");
  const [filters, setFilters] = useState({ category: "", participant: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [e, s] = await Promise.all([getExpenses(tourId, { category: filters.category || undefined }), getExpenseSummary(tourId)]);
      setExpenses(e?.data?.expenses || []);
      setSummary(s?.data?.summary || null);
    } catch (err) { showToastError("Failed to load expenses", "Error"); }
  };
  useEffect(() => { if (isOpen) { load(); setF({ category: "hotel", status: "incurred" }); setEditingId(""); } /* eslint-disable-next-line */ }, [isOpen, filters.category]);

  const saveExpense = async () => {
    if (!f.title || f.amount == null || f.amount === "") { showToastError("Title and amount required", "Validation"); return; }
    setBusy(true);
    try {
      const payload = { ...f, amount: Number(f.amount) };
      if (editingId) await updateExpense(editingId, payload);
      else await addExpense(tourId, payload);
      showToastSuccess(editingId ? "Expense updated" : "Expense added", "Success");
      setEditingId("");
      setF({ category: "hotel", status: "incurred" });
      load();
    } catch (e) { showToastError(editingId ? "Update failed" : "Add failed", "Error"); }
    finally { setBusy(false); }
  };
  const startEdit = (x) => {
    setEditingId(x._id);
    setF({
      category: x.category || "hotel",
      status: x.status || "incurred",
      title: x.title || "",
      amount: x.amount || "",
      date: x.date ? new Date(x.date).toISOString().slice(0, 10) : "",
      vendor: x.vendor || "",
      isExtra: !!x.isExtra,
      reimbursable: !!x.reimbursable,
      notes: x.notes || "",
    });
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      if (editingId === id) { setEditingId(""); setF({ category: "hotel", status: "incurred" }); }
      load();
    } catch (e) { showToastError("Delete failed", "Error"); }
  };

  const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const s = summary;
  const filteredExpenses = expenses.filter((x) => containsText(x.participant?.fullName, filters.participant));

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>Trip Expense Management</ModalHeader>
      <ModalBody>
        {s && (
          <Row className="g-2 mb-3">
            <Stat label="Total spent" value={money(s.totalSpent)} />
            <Stat label="Extras" value={money(s.extrasSpent)} />
            <Stat label="Revenue collected" value={money(s.revenueCollected)} />
            <Stat label="Margin (vs collected)" value={money(s.marginVsCollected)} sub={s.marginVsCollected >= 0 ? "profit" : "loss"} />
            <Stat label="Cost / head" value={money(s.costPerHead)} />
            <Stat label="Reimbursable" value={money(s.reimbursable)} />
          </Row>
        )}

        <Card className="bg-light border-0"><CardBody className="py-2">
          <Row className="g-2 align-items-end">
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{editingId ? "Edit expense" : "Add expense"}</h6>
                {editingId ? <Button size="sm" color="light" onClick={() => { setEditingId(""); setF({ category: "hotel", status: "incurred" }); }}>Cancel edit</Button> : null}
              </div>
            </Col>
            <Col md={2}><Label className="mb-0 small">Category</Label>
              <Input type="select" bsSize="sm" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Input>
            </Col>
            <Col md={3}><Label className="mb-0 small">Title</Label><Input bsSize="sm" value={f.title || ""} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Hotel — 3 nights Helsinki" /></Col>
            <Col md={2}><Label className="mb-0 small">Amount (₹)</Label><Input bsSize="sm" type="number" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Col>
            <Col md={2}><Label className="mb-0 small">Date</Label><Input bsSize="sm" type="date" value={f.date || ""} onChange={(e) => setF({ ...f, date: e.target.value })} /></Col>
            <Col md={2}><Label className="mb-0 small">Vendor</Label><Input bsSize="sm" value={f.vendor || ""} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></Col>
            <Col md={1}><Button color="primary" size="sm" onClick={saveExpense} disabled={busy}>{busy ? <Spinner size="sm" /> : editingId ? "Save" : "Add"}</Button></Col>
            <Col md={2}><Toggle id="exExtra" checked={!!f.isExtra} onChange={(e) => setF({ ...f, isExtra: e.target.checked })} label="Extra / utilised" /></Col>
            <Col md={2}><Toggle id="exReimb" checked={!!f.reimbursable} onChange={(e) => setF({ ...f, reimbursable: e.target.checked })} label="Reimbursable" /></Col>
            <Col md={6}><Label className="mb-0 small">Notes</Label><Input bsSize="sm" value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Col>
          </Row>
        </CardBody></Card>

        <Row className="g-2 align-items-end mt-2">
          <Col md={3}><Label className="mb-0 small">Filter category</Label>
            <Input type="select" bsSize="sm" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Input>
          </Col>
          <Col md={3}><Label className="mb-0 small">Participant name</Label><Input bsSize="sm" value={filters.participant} onChange={(e) => setFilters({ ...filters, participant: e.target.value })} /></Col>
          <Col md={2}><Button size="sm" color="light" onClick={() => setFilters({ category: "", participant: "" })}>Reset filters</Button></Col>
        </Row>

        <Table className="align-middle mt-3">
          <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Vendor</th><th className="text-end">Amount</th><th>Flags</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {filteredExpenses.length === 0 ? <tr><td colSpan={7} className="text-center text-muted">No expenses found.</td></tr> :
              filteredExpenses.map((x) => (
                <tr key={x._id}>
                  <td className="small">{fmt(x.date)}</td>
                  <td className="text-capitalize">{x.category}</td>
                  <td>{x.title}{x.participant?.fullName ? <small className="text-muted d-block">for {x.participant.fullName}</small> : null}</td>
                  <td>{x.vendor || "—"}</td>
                  <td className="text-end fw-semibold">{money(x.amount)}</td>
                  <td>{x.isExtra ? <Badge color="soft-warning" className="me-1">extra</Badge> : null}{x.reimbursable ? <Badge color="soft-info">reimb.</Badge> : null}</td>
                  <td className="text-end">
                    <Button size="sm" color="soft-primary" className="me-1" onClick={() => startEdit(x)}><i className="bx bx-edit" /></Button>
                    <Button size="sm" color="soft-danger" onClick={() => remove(x._id)}><i className="bx bx-trash" /></Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter><Button color="light" onClick={onClose}>Close</Button></ModalFooter>
    </Modal>
  );
};

/* ========================= Bulk import modal =========================== */
const BulkImportModal = ({ isOpen, tourId, existingParticipants = [], onClose, onDone }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isOpen) { setRows([]); setErrors([]); } }, [isOpen]);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseParticipantImport(String(reader.result), existingParticipants);
      setRows(parsed.rows);
      setErrors(parsed.errors);
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    downloadCsv("study-tour-participants-sample.csv", rowsToCsv(IMPORT_SAMPLE_ROWS));
  };

  const downloadErrors = () => {
    if (!errors.length) return;
    downloadCsv("study-tour-import-errors.csv", rowsToCsv(errors));
  };

  const doImport = async () => {
    if (!rows.length) { showToastError("Nothing to import", "Validation"); return; }
    setBusy(true);
    try {
      const r = await bulkImportParticipants(tourId, rows);
      const d = r?.data || {};
      showToastSuccess(`Created ${d.created || 0}, skipped ${d.skipped || 0}`, "Import complete");
      onDone();
    } catch (e) { showToastError("Import failed", "Error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" scrollable>
      <ModalHeader toggle={onClose}>Bulk import participants (CSV)</ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-between align-items-start gap-3">
          <p className="text-muted small mb-2">CSV header row must include at least <code>fullName,email,mobile</code>. Optional aliases such as <code>Name</code>, <code>Phone</code>, <code>Institution</code>, and <code>Cluster</code> are mapped automatically.</p>
          <Button color="soft-secondary" size="sm" onClick={downloadSample}><i className="bx bx-download me-1" />Sample</Button>
        </div>
        <Input type="file" accept=".csv,text/csv" onChange={onFile} />
        {(rows.length || errors.length) ? (
          <div className="mt-3">
            <Badge color="success" className="me-2">{rows.length} valid</Badge>
            <Badge color={errors.length ? "danger" : "secondary"}>{errors.length} issue(s)</Badge>
            {errors.length ? <Button color="link" size="sm" className="p-0 ms-2" onClick={downloadErrors}>Download error report</Button> : null}
          </div>
        ) : null}
        {rows.length > 0 && (
          <>
            <p className="mt-3 mb-1"><strong>{rows.length}</strong> rows parsed (preview first 5):</p>
            <Table size="sm" className="align-middle">
              <thead><tr>{Object.keys(rows[0]).slice(0, 6).map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 5).map((r, i) => <tr key={i}>{Object.keys(rows[0]).slice(0, 6).map((h) => <td key={h} className="small">{r[h]}</td>)}</tr>)}</tbody>
            </Table>
          </>
        )}
        {errors.length > 0 ? (
          <Table size="sm" className="align-middle mt-3">
            <thead><tr><th>Row</th><th>Email</th><th>Issue</th></tr></thead>
            <tbody>{errors.slice(0, 6).map((err, i) => <tr key={i}><td>{err.row}</td><td>{err.email || "—"}</td><td>{err.reason}</td></tr>)}</tbody>
          </Table>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={doImport} disabled={busy || !rows.length}>{busy ? <Spinner size="sm" /> : `Import ${rows.length || ""}`}</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ===================== Tour settings / full setup ======================= */
const TourSettingsModal = ({ isOpen, tour, onClose, onSaved }) => {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({});
  const [bank, setBank] = useState({});
  const [coordinators, setCoordinators] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [docs, setDocs] = useState({ individual: [], schoolSponsored: [] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen && tour) {
      setTab("details");
      setForm({
        name: tour.name || "",
        slug: tour.slug || "",
        year: tour.year || "",
        destinationCountry: tour.destinationCountry || "",
        status: tour.status || "draft",
        startDate: inputDate(tour.startDate),
        endDate: inputDate(tour.endDate),
        summary: tour.summary || "",
        hostName: tour.hostPartner?.name || "",
        hostContactPerson: tour.hostPartner?.contactPerson || "",
        hostEmail: tour.hostPartner?.email || "",
        hostPhone: tour.hostPartner?.phone || "",
        hostWebsite: tour.hostPartner?.website || "",
        currency: tour.pricing?.currency || "INR",
        doubleOccupancyPerPerson: tour.pricing?.doubleOccupancyPerPerson || "",
        singleSupplementMin: tour.pricing?.singleSupplementMin || "",
        singleSupplementMax: tour.pricing?.singleSupplementMax || "",
        inclusions: listToMultiline(tour.pricing?.inclusions),
        exclusions: listToMultiline(tour.pricing?.exclusions),
      });
      setBank(tour.bankDetails || {});
      setCoordinators(tour.coordinators || []);
      setItinerary(tour.itinerary?.length ? tour.itinerary : []);
      setDocs({
        individual: tour.documentChecklist?.individual || [],
        schoolSponsored: tour.documentChecklist?.schoolSponsored || [],
      });
    }
  }, [isOpen, tour]);

  const save = async () => {
    if (!form.name || !form.slug) { showToastError("Tour name and slug are required", "Validation"); return; }
    setBusy(true);
    try {
      const slug = form.slug.trim().toLowerCase().replace(/\s+/g, "-");
      await updateStudyTour(tour._id, {
        name: form.name,
        slug,
        year: numberOrUndefined(form.year),
        destinationCountry: form.destinationCountry,
        status: form.status,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        summary: form.summary,
        hostPartner: {
          name: form.hostName,
          contactPerson: form.hostContactPerson,
          email: form.hostEmail,
          phone: form.hostPhone,
          website: form.hostWebsite,
        },
        pricing: {
          currency: form.currency || "INR",
          doubleOccupancyPerPerson: numberOrUndefined(form.doubleOccupancyPerPerson),
          singleSupplementMin: numberOrUndefined(form.singleSupplementMin),
          singleSupplementMax: numberOrUndefined(form.singleSupplementMax),
          inclusions: multilineToList(form.inclusions),
          exclusions: multilineToList(form.exclusions),
        },
        itinerary: itinerary
          .filter((day) => day.title || day.city || day.details)
          .map((day, idx) => ({
            day: Number(day.day) || idx + 1,
            title: day.title || `Day ${idx + 1}`,
            city: day.city,
            details: day.details,
          })),
        bankDetails: bank,
        coordinators: coordinators.filter((c) => c.name || c.role || c.phone || c.email),
        documentChecklist: docs,
      });
      showToastSuccess("Tour settings saved", "Success");
      onSaved();
    } catch (e) { showToastError("Save failed", "Error"); }
    finally { setBusy(false); }
  };

  const setDocField = (list, idx, field, value) => {
    setDocs((d) => ({ ...d, [list]: d[list].map((it, i) => i === idx ? { ...it, [field]: value } : it) }));
  };
  const addDoc = (list) => setDocs((d) => ({ ...d, [list]: [...d[list], { key: `doc_${Date.now()}`, label: "", required: true, multiple: false, acceptTypes: [] }] }));
  const removeDoc = (list, idx) => setDocs((d) => ({ ...d, [list]: d[list].filter((_, i) => i !== idx) }));
  const setItineraryField = (idx, field, value) => {
    setItinerary((days) => days.map((day, i) => i === idx ? { ...day, [field]: value } : day));
  };
  const addItineraryDay = () => setItinerary((days) => ([...days, { day: days.length + 1, title: "", city: "", details: "" }]));
  const removeItineraryDay = (idx) => setItinerary((days) => days.filter((_, i) => i !== idx));

  const DocBuilder = ({ list, title }) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{title}</h6>
        <Button size="sm" color="soft-primary" onClick={() => addDoc(list)}><i className="bx bx-plus" /> Add field</Button>
      </div>
      {(docs[list] || []).map((it, idx) => (
        <Row key={idx} className="g-2 mt-1 align-items-center">
          <Col md={3}><Input bsSize="sm" placeholder="Document label" value={it.label} onChange={(e) => setDocField(list, idx, "label", e.target.value)} /></Col>
          <Col md={3}><Input bsSize="sm" placeholder="Description / helper text" value={it.description || ""} onChange={(e) => setDocField(list, idx, "description", e.target.value)} /></Col>
          <Col md={2}><Input bsSize="sm" placeholder="types e.g. pdf,jpg" value={(it.acceptTypes || []).join(",")} onChange={(e) => setDocField(list, idx, "acceptTypes", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></Col>
          <Col md={2}><Input bsSize="sm" type="number" placeholder="max MB" value={it.maxSizeMB || ""} onChange={(e) => setDocField(list, idx, "maxSizeMB", e.target.value ? Number(e.target.value) : undefined)} /></Col>
          <Col md={1}><Toggle id={`req-${list}-${idx}`} checked={it.required} onChange={(e) => setDocField(list, idx, "required", e.target.checked)} label="Req" /></Col>
          <Col md={1}><Toggle id={`mul-${list}-${idx}`} checked={it.multiple} onChange={(e) => setDocField(list, idx, "multiple", e.target.checked)} label="Multi" /></Col>
          <Col md={1}><i className="bx bx-trash text-danger" role="button" onClick={() => removeDoc(list, idx)} /></Col>
        </Row>
      ))}
    </div>
  );

  if (!tour) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>Tour settings — {tour.name}</ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          {["details", "pricing", "itinerary", "bank", "coordinators", "documents"].map((t) => (
            <NavItem key={t}><NavLink className={classnames({ active: tab === t })} role="button" onClick={() => setTab(t)}><span className="text-capitalize">{t === "bank" ? "Bank details" : t}</span></NavLink></NavItem>
          ))}
        </Nav>
        <TabContent activeTab={tab}>
          <TabPane tabId="details">
            <Row className="g-3">
              <Col md={6}><Label>Tour name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Col>
              <Col md={3}><Label>Slug *</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Col>
              <Col md={3}><Label>Status</Label>
                <Input type="select" value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </Input>
              </Col>
              <Col md={3}><Label>Year</Label><Input type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Col>
              <Col md={3}><Label>Destination country</Label><Input value={form.destinationCountry || ""} onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} /></Col>
              <Col md={3}><Label>Start date</Label><Input type="date" value={form.startDate || ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Col>
              <Col md={3}><Label>End date</Label><Input type="date" value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Col>
              <Col md={12}><Label>Summary</Label><Input type="textarea" rows={3} value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Col>

              <Col md={12}><h6 className="text-muted mb-0 mt-2">Host partner</h6></Col>
              <Col md={4}><Label>Partner name</Label><Input value={form.hostName || ""} onChange={(e) => setForm({ ...form, hostName: e.target.value })} /></Col>
              <Col md={4}><Label>Contact person</Label><Input value={form.hostContactPerson || ""} onChange={(e) => setForm({ ...form, hostContactPerson: e.target.value })} /></Col>
              <Col md={4}><Label>Website</Label><Input value={form.hostWebsite || ""} onChange={(e) => setForm({ ...form, hostWebsite: e.target.value })} /></Col>
              <Col md={6}><Label>Email</Label><Input type="email" value={form.hostEmail || ""} onChange={(e) => setForm({ ...form, hostEmail: e.target.value })} /></Col>
              <Col md={6}><Label>Phone</Label><Input value={form.hostPhone || ""} onChange={(e) => setForm({ ...form, hostPhone: e.target.value })} /></Col>
              <Col md={12}>
                <Label>Public registration URL</Label>
                <Input value={form.slug ? `${publicBaseUrl()}/educator-study-tours/${form.slug.trim().toLowerCase().replace(/\s+/g, "-")}` : ""} readOnly />
              </Col>
            </Row>
          </TabPane>

          <TabPane tabId="pricing">
            <Row className="g-3">
              <Col md={3}><Label>Currency</Label><Input value={form.currency || "INR"} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Col>
              <Col md={3}><Label>Double / person</Label><Input type="number" value={form.doubleOccupancyPerPerson || ""} onChange={(e) => setForm({ ...form, doubleOccupancyPerPerson: e.target.value })} /></Col>
              <Col md={3}><Label>Single supplement min</Label><Input type="number" value={form.singleSupplementMin || ""} onChange={(e) => setForm({ ...form, singleSupplementMin: e.target.value })} /></Col>
              <Col md={3}><Label>Single supplement max</Label><Input type="number" value={form.singleSupplementMax || ""} onChange={(e) => setForm({ ...form, singleSupplementMax: e.target.value })} /></Col>
              <Col md={6}><Label>Inclusions (one per line)</Label><Input type="textarea" rows={8} value={form.inclusions || ""} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} /></Col>
              <Col md={6}><Label>Exclusions (one per line)</Label><Input type="textarea" rows={8} value={form.exclusions || ""} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} /></Col>
            </Row>
          </TabPane>

          <TabPane tabId="itinerary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="text-muted small mb-0">Build the shared day-wise programme shown to ops and later the public/customer portal.</p>
              <Button size="sm" color="soft-primary" onClick={addItineraryDay}><i className="bx bx-plus me-1" />Add day</Button>
            </div>
            {itinerary.length === 0 ? <p className="text-muted">No itinerary days yet.</p> : itinerary.map((day, idx) => (
              <Card key={idx} className="border mb-2">
                <CardBody className="py-2">
                  <Row className="g-2 align-items-start">
                    <Col md={1}><Label className="small mb-1">Day</Label><Input bsSize="sm" type="number" value={day.day || idx + 1} onChange={(e) => setItineraryField(idx, "day", e.target.value)} /></Col>
                    <Col md={4}><Label className="small mb-1">Title</Label><Input bsSize="sm" value={day.title || ""} onChange={(e) => setItineraryField(idx, "title", e.target.value)} /></Col>
                    <Col md={3}><Label className="small mb-1">City</Label><Input bsSize="sm" value={day.city || ""} onChange={(e) => setItineraryField(idx, "city", e.target.value)} /></Col>
                    <Col md={3}><Label className="small mb-1">Details</Label><Input bsSize="sm" value={day.details || ""} onChange={(e) => setItineraryField(idx, "details", e.target.value)} /></Col>
                    <Col md={1} className="pt-4"><i className="bx bx-trash text-danger" role="button" onClick={() => removeItineraryDay(idx)} /></Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </TabPane>

          <TabPane tabId="bank">
            <p className="text-muted small">Global bank details for this tour — shared with participants in the payment email.</p>
            <Row className="g-3">
              <Col md={6}><Label>Account name</Label><Input value={bank.accountName || ""} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} /></Col>
              <Col md={6}><Label>Account number</Label><Input value={bank.accountNumber || ""} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} /></Col>
              <Col md={4}><Label>IFSC</Label><Input value={bank.ifsc || ""} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} /></Col>
              <Col md={4}><Label>Bank name</Label><Input value={bank.bankName || ""} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} /></Col>
              <Col md={4}><Label>Branch</Label><Input value={bank.branch || ""} onChange={(e) => setBank({ ...bank, branch: e.target.value })} /></Col>
              <Col md={6}><Label>UPI</Label><Input value={bank.upi || ""} onChange={(e) => setBank({ ...bank, upi: e.target.value })} /></Col>
              <Col md={6}><Label>Note (e.g. payment reference)</Label><Input value={bank.notes || ""} onChange={(e) => setBank({ ...bank, notes: e.target.value })} /></Col>
            </Row>
          </TabPane>
          <TabPane tabId="coordinators">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="text-muted small mb-0">Named coordinators shown in participant emails.</p>
              <Button size="sm" color="soft-primary" onClick={() => setCoordinators([...coordinators, { name: "", role: "", phone: "", email: "" }])}><i className="bx bx-plus" /> Add</Button>
            </div>
            {coordinators.map((c, i) => (
              <Row key={i} className="g-2 mt-1">
                <Col md={3}><Input bsSize="sm" placeholder="Name" value={c.name || ""} onChange={(e) => setCoordinators(coordinators.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /></Col>
                <Col md={3}><Input bsSize="sm" placeholder="Role (Visa Coordinator)" value={c.role || ""} onChange={(e) => setCoordinators(coordinators.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} /></Col>
                <Col md={2}><Input bsSize="sm" placeholder="Phone" value={c.phone || ""} onChange={(e) => setCoordinators(coordinators.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} /></Col>
                <Col md={3}><Input bsSize="sm" placeholder="Email" value={c.email || ""} onChange={(e) => setCoordinators(coordinators.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></Col>
                <Col md={1}><i className="bx bx-trash text-danger" role="button" onClick={() => setCoordinators(coordinators.filter((_, j) => j !== i))} /></Col>
              </Row>
            ))}
          </TabPane>
          <TabPane tabId="documents">
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-muted small mb-2">Customise the document requirements participants must upload (label, file types, max size, required, multiple).</p>
              <Button size="sm" color="soft-secondary" onClick={async () => {
                try { const r = await getDefaultDocChecklist(); if (r?.data?.checklist) { setDocs(r.data.checklist); showToastSuccess("Loaded standard Schengen list", "Defaults"); } }
                catch (e) { showToastError("Could not load defaults", "Error"); }
              }}><i className="bx bx-list-ul me-1" />Load Schengen defaults</Button>
            </div>
            <DocBuilder list="individual" title="Individual applicant" />
            <DocBuilder list="schoolSponsored" title="School-sponsored" />
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="primary" onClick={save} disabled={busy}>{busy ? <Spinner size="sm" /> : "Save tour settings"}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default Participants;
