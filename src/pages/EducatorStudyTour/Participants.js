import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner, Input, Label,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, Nav, NavItem, NavLink,
  TabContent, TabPane, Table,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from "reactstrap";
import classnames from "classnames";
import Switch from "react-switch";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ConfirmModal from "../../components/Common/ConfirmModal";
import { showToastSuccess, showToastError } from "../../helpers/toastBuilder";
import { usePermissions, ACTIONS, MODULES } from "../../helpers/permissions";
import {
  getStudyTour, getParticipants, getParticipant, createParticipant,
  updateParticipant, deleteParticipant, archiveParticipant, restoreParticipant, cancelParticipant, getParticipantInvoice, getVisaDoc, emailDocument, emailVisaPack, previewMessage, sendMessage, bulkVisaSchedule, bulkMessagePreview,
  scheduleCampaign, getCampaigns, cancelCampaign,
  getTourAnalytics, getPaymentsReport, getVisaBoard, getRoomingBoard, assignRoom, clearRooming, getReadinessBoard, getRiskBoard, getStudyTourActivity, getJobLogs, getCommunicationsTimeline, getConversionAnalytics,
  getTourWeather, getManifest, getManifestPrint, runAutomations, bulkMessage,
  updateStudyTour, bulkImportParticipants, uploadDocument, getChannelAvailability,
  getDefaultDocChecklist,
  getExpenses, getExpenseSummary, addExpense, updateExpense, deleteExpense, EXPENSE_CATEGORIES,
  PARTICIPANT_STAGES, STAGE_LABELS, STAGE_COLORS, MESSAGE_TEMPLATES,
} from "../../apis/educatorStudyTour";

/**
 * Toggle switch helper — uses react-switch (the same component used across the
 * dashboard, e.g. Calendar pricing) so it's reliably clickable and clearly sized.
 * Keeps the original API: onChange receives a synthetic `{ target: { checked } }`
 * so every existing call site (e.target.checked) keeps working unchanged.
 */
const Toggle = ({ id, checked, onChange, label }) => (
  <div className="d-flex align-items-center gap-2">
    <Switch
      id={id}
      checked={!!checked}
      onChange={(val) => onChange({ target: { checked: val } })}
      onColor="#556ee6"
      offColor="#ced4da"
      onHandleColor="#ffffff"
      offHandleColor="#ffffff"
      handleDiameter={22}
      uncheckedIcon={false}
      checkedIcon={false}
      boxShadow="0px 1px 4px rgba(0,0,0,0.3)"
      activeBoxShadow="0px 0px 1px 6px rgba(0,0,0,0.15)"
      height={26}
      width={50}
    />
    {label ? (
      <span role="button" className="user-select-none mb-0" onClick={() => onChange({ target: { checked: !checked } })}>
        {label}
      </span>
    ) : null}
  </div>
);

/** Date helper used across read-only displays. */
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

/** Red asterisk marking a field that's required at registration. */
const Req = () => <span className="text-danger"> *</span>;

/** Salutation options (incl. Dr / Prof). */
const SALUTATIONS = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

/** Selectable file types for the document-requirement builder. */
const DOC_FILE_TYPES = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

/** Compute "needs attention" reasons for a participant (client-side). */
const attentionReasons = (p) => {
  const out = [];
  const daysTo = (d) => (d ? Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000) : null);
  const missingDocs = (p.documents || []).filter((d) => d.required && d.status !== "uploaded" && d.status !== "verified").length;
  if (missingDocs && ["documents_pending", "visa_scheduled", "quoted", "paid"].includes(p.stage)) out.push(`${missingDocs} docs pending`);
  if (p.quotedAmount && (p.paidAmount || 0) < p.quotedAmount && p.stage !== "cancelled") out.push("payment due");
  const passportRisks = passportRiskReasons(p);
  if (passportRisks.length) out.push(passportRisks[0]);
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

const PARTICIPANT_SORT_OPTIONS = [
  { value: "createdAt", label: "Newest first", defaultOrder: "desc" },
  { value: "fullName", label: "Name", defaultOrder: "asc" },
  { value: "institutionName", label: "Institution", defaultOrder: "asc" },
  { value: "stage", label: "Stage", defaultOrder: "asc" },
  { value: "city", label: "City", defaultOrder: "asc" },
  { value: "travelCluster", label: "Cluster", defaultOrder: "asc" },
  { value: "quotedAmount", label: "Quote amount", defaultOrder: "desc" },
  { value: "paidAmount", label: "Paid amount", defaultOrder: "desc" },
];

const containsText = (value, query) =>
  !query || String(value || "").toLowerCase().includes(String(query).toLowerCase().trim());

const daysUntilDate = (d) => {
  if (!d) return null;
  return Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
};

const documentReadiness = (p) => {
  const required = (p.documents || []).filter((d) => d.required);
  const completed = required.filter((d) => d.status === "uploaded" || d.status === "verified").length;
  const verified = required.filter((d) => d.status === "verified").length;
  const rejected = required.filter((d) => d.status === "rejected").length;
  const missing = Math.max(required.length - completed, 0);
  return {
    required: required.length,
    completed,
    verified,
    rejected,
    missing,
    pct: required.length ? Math.round((completed / required.length) * 100) : 100,
  };
};

const passportRiskReasons = (p) => {
  const reasons = [];
  const expiryDays = daysUntilDate(p.passportExpiry);
  if (!p.passportNumber) reasons.push("passport number missing");
  if (!p.passportIssueDate) reasons.push("issue date missing");
  if (!p.passportExpiry) reasons.push("expiry missing");
  else if (expiryDays < 0) reasons.push("passport expired");
  else if (expiryDays < 180) reasons.push("expiry under 6 months");
  if (p.visaRefusal?.has) reasons.push("visa refusal history");
  return reasons;
};

const paymentInsights = (p) => {
  const quoted = Number(p.quotedAmount || 0);
  const paid = Number(p.paidAmount || 0);
  const outstanding = Math.max(quoted - paid, 0);
  const overdueMilestones = (p.paymentMilestones || []).filter((m) => !m.paid && daysUntilDate(m.dueDate) != null && daysUntilDate(m.dueDate) < 0);
  const upcomingMilestones = (p.paymentMilestones || []).filter((m) => !m.paid && daysUntilDate(m.dueDate) != null && daysUntilDate(m.dueDate) >= 0 && daysUntilDate(m.dueDate) <= 7);
  return { quoted, paid, outstanding, overdue: overdueMilestones.length, upcoming: upcomingMilestones.length };
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

  if (f.passportRisk && !passportRiskReasons(p).length) return false;
  if (f.flightStatus === "missing" && p.flight?.booked) return false;
  if (f.flightStatus === "booked" && !p.flight?.booked) return false;
  if (f.extensionDemand && (p.wantsExtension || "no") !== f.extensionDemand) return false;

  return true;
};

const Participants = () => {
  const { tourId } = useParams();
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const canDelete = can(ACTIONS.CAN_DELETE, MODULES.STUDY_TOUR_PERMS);
  const [confirm, setConfirm] = useState(null);
  document.title = "Study Tour Participants | TickYourList";

  const [tour, setTour] = useState(null);
  const [stageCounts, setStageCounts] = useState({});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStage, setFilterStage] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [soloOnly, setSoloOnly] = useState(false);
  const [attnOnly, setAttnOnly] = useState(false);
  const [archivedView, setArchivedView] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(EMPTY_ADVANCED_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [visaOpen, setVisaOpen] = useState(false);
  const [roomingOpen, setRoomingOpen] = useState(false);
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [commsLogOpen, setCommsLogOpen] = useState(false);
  const [conversionOpen, setConversionOpen] = useState(false);
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
        search: appliedSearch || undefined,
        solo: soloOnly ? "true" : undefined,
        city: advancedFilters.city || undefined,
        state: advancedFilters.state || undefined,
        institution: advancedFilters.institution || undefined,
        cluster: advancedFilters.cluster || undefined,
        source: advancedFilters.source || undefined,
        coordinator: advancedFilters.coordinator || undefined,
        archived: archivedView ? "true" : undefined,
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      });
      setParticipants(res?.data?.participants || []);
      setTotalParticipants(Number(res?.data?.total ?? res?.data?.participants?.length ?? 0));
      setSelectedIds([]);
    } catch (e) { showToastError("Failed to load participants", "Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTour(); }, [tourId]);
  useEffect(() => { loadParticipants(); /* eslint-disable-next-line */ }, [
    tourId, filterStage, appliedSearch, soloOnly, archivedView, page, pageSize, sortBy, sortOrder,
    advancedFilters.city, advancedFilters.state, advancedFilters.institution,
    advancedFilters.cluster, advancedFilters.source, advancedFilters.coordinator,
  ]);

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

  const remove = (p) => {
    setConfirm({
      title: "Delete participant",
      message: `Permanently delete ${p.fullName || "this participant"}? This removes their registration, documents and history. This cannot be undone — consider Archiving instead.`,
      confirmLabel: "Delete permanently",
      confirmWord: "DELETE",
      onConfirm: async () => {
        try { await deleteParticipant(p._id); showToastSuccess("Deleted", "Success"); setDetail(null); loadParticipants(); loadTour(); }
        catch (e) { showToastError("Delete failed", "Error"); throw e; }
      },
    });
  };

  const archive = (p) => {
    setConfirm({
      title: "Archive participant",
      message: `Archive ${p.fullName || "this participant"}? They'll be hidden from lists, boards and analytics but can be restored anytime.`,
      confirmLabel: "Archive",
      confirmColor: "warning",
      onConfirm: async () => {
        try { await archiveParticipant(p._id); showToastSuccess("Archived", "Success"); setDetail(null); loadParticipants(); loadTour(); }
        catch (e) { showToastError("Archive failed", "Error"); throw e; }
      },
    });
  };

  const restore = async (p) => {
    try { await restoreParticipant(p._id); showToastSuccess(`${p.fullName} restored`, "Restored"); loadParticipants(); loadTour(); }
    catch (e) { showToastError("Restore failed", "Error"); }
  };

  const cancel = async (id, payload) => {
    await cancelParticipant(id, payload); // throws on failure → handled by caller
    showToastSuccess("Participant cancelled", "Cancelled");
    if (detail?._id === id) openDetail(id);
    loadParticipants(); loadTour();
  };

  // Row-level quick actions (operate directly on a list row, no modal needed).
  const rowPortalUrl = (p) => (p.portalToken ? `${publicBaseUrl()}/educator-study-tours/portal/${p.portalToken}` : "");
  const rowOpenPortal = (p) => { const u = rowPortalUrl(p); if (u) window.open(u, "_blank"); else showToastError("No portal link yet", "Portal"); };
  const rowCopyPortal = async (p) => {
    const u = rowPortalUrl(p); if (!u) return showToastError("No portal link yet", "Portal");
    try { await navigator.clipboard.writeText(u); showToastSuccess("Portal link copied", "Copied"); } catch (e) { showToastError("Could not copy", "Clipboard"); }
  };
  const rowEmailInvoice = async (p) => {
    try { const r = await emailDocument(p._id, "invoice", "proforma"); showToastSuccess(`Proforma emailed to ${r?.data?.to || p.email}`, "Sent"); }
    catch (e) { showToastError(e?.response?.data?.message || "Could not email invoice", "Error"); }
  };
  const rowEmailVisaPack = async (p) => {
    try { const r = await emailVisaPack(p._id); showToastSuccess(`${r?.data?.count || 4} letters emailed to ${r?.data?.to || p.email}`, "Visa pack sent"); }
    catch (e) { showToastError(e?.response?.data?.message || "Could not email visa pack", "Error"); }
  };
  const rowOpenDoc = async (fetcher, id, type, label) => {
    const w = window.open("", "_blank");
    if (w) w.document.write("<p style='font-family:sans-serif;padding:24px'>Generating…</p>");
    try { const r = await fetcher(id, type); const html = r?.data?.html; if (!html) throw new Error("none"); if (w) { w.document.open(); w.document.write(html); w.document.close(); } }
    catch (e) { if (w) w.close(); showToastError(`Could not open ${label}`, "Error"); }
  };

  const filtered = useMemo(
    () => participants
      .filter((p) => (attnOnly ? attentionReasons(p).length : true))
      .filter((p) => matchesAdvancedFilters(p, advancedFilters)),
    [participants, attnOnly, advancedFilters]
  );
  const pageOpsSummary = useMemo(() => {
    const summary = {
      count: filtered.length,
      outstanding: 0,
      paymentDue: 0,
      overduePayments: 0,
      docRequired: 0,
      docCompleted: 0,
      passportRisks: 0,
      missingFlights: 0,
    };
    filtered.forEach((p) => {
      const docs = documentReadiness(p);
      const pay = paymentInsights(p);
      summary.outstanding += pay.outstanding;
      if (pay.outstanding > 0) summary.paymentDue += 1;
      if (pay.overdue > 0) summary.overduePayments += 1;
      summary.docRequired += docs.required;
      summary.docCompleted += docs.completed;
      if (passportRiskReasons(p).length) summary.passportRisks += 1;
      if (!p.flight?.booked) summary.missingFlights += 1;
    });
    summary.docRate = summary.docRequired ? Math.round((summary.docCompleted / summary.docRequired) * 100) : 100;
    return summary;
  }, [filtered]);
  const activeAdvancedFilterCount = useMemo(
    () => Object.values(advancedFilters).filter((v) => v === true || (typeof v === "string" && v.trim())).length,
    [advancedFilters]
  );
  const selectedParticipants = useMemo(
    () => participants.filter((p) => selectedIds.includes(p._id)),
    [participants, selectedIds]
  );
  const totalPages = Math.max(1, Math.ceil((totalParticipants || 0) / pageSize));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.includes(p._id));
  const toggleSelected = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const toggleAllFiltered = () => setSelectedIds((ids) => {
    if (allFilteredSelected) return ids.filter((id) => !filtered.some((p) => p._id === id));
    return [...new Set([...ids, ...filtered.map((p) => p._id)])];
  });
  const setStageFilter = (stage) => { setFilterStage(stage); setPage(1); };
  const applySearch = () => { setAppliedSearch(search.trim()); setPage(1); };
  const updateAdvancedFilters = (next) => { setAdvancedFilters(next); setPage(1); };
  const resetAdvancedFilters = () => { setAdvancedFilters(EMPTY_ADVANCED_FILTERS); setPage(1); };
  const changeSort = (field) => {
    const option = PARTICIPANT_SORT_OPTIONS.find((x) => x.value === field);
    setSortBy(field);
    setSortOrder(sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : (option?.defaultOrder || "asc"));
    setPage(1);
  };
  const changePageSize = (size) => { setPageSize(Number(size)); setPage(1); };
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
  const bulkArchive = () => {
    if (!selectedParticipants.length) return;
    setConfirm({
      title: "Archive participants",
      message: `Archive ${selectedParticipants.length} selected participant(s)? They'll be hidden from lists but can be restored.`,
      confirmLabel: "Archive", confirmColor: "warning",
      onConfirm: async () => {
        setLoading(true);
        try {
          await Promise.all(selectedParticipants.map((p) => archiveParticipant(p._id)));
          showToastSuccess(`${selectedParticipants.length} archived`, "Archived");
          setSelectedIds([]); await Promise.all([loadParticipants(), loadTour()]);
        } catch (e) { showToastError(e?.response?.data?.message || "Bulk archive failed", "Error"); throw e; }
        finally { setLoading(false); }
      },
    });
  };

  const bulkDelete = () => {
    if (!selectedParticipants.length) return;
    setConfirm({
      title: "Delete participants permanently",
      message: `Permanently delete ${selectedParticipants.length} selected participant(s)? This removes their registration, documents and history and CANNOT be undone. Consider Archive instead.`,
      confirmLabel: "Delete permanently", confirmWord: "DELETE", confirmColor: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          await Promise.all(selectedParticipants.map((p) => deleteParticipant(p._id)));
          showToastSuccess(`${selectedParticipants.length} deleted`, "Deleted");
          setSelectedIds([]); await Promise.all([loadParticipants(), loadTour()]);
        } catch (e) { showToastError(e?.response?.data?.message || "Bulk delete failed", "Error"); throw e; }
        finally { setLoading(false); }
      },
    });
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
            <Button color="soft-info" size="sm" className="me-2" onClick={() => setVisaOpen(true)}><i className="bx bx-id-card me-1" />Visa Board</Button>
            <Button color="soft-warning" size="sm" className="me-2" onClick={() => setRoomingOpen(true)}><i className="bx bx-bed me-1" />Rooming</Button>
            <Button color="soft-primary" size="sm" className="me-2" onClick={() => setReadinessOpen(true)}><i className="bx bx-check-shield me-1" />Readiness</Button>
            <Button color="soft-danger" size="sm" className="me-2" onClick={() => setRiskOpen(true)}><i className="bx bx-error me-1" />Risk</Button>
            <Button color="soft-success" size="sm" className="me-2" onClick={() => setPaymentsOpen(true)}><i className="bx bx-rupee me-1" />Payments</Button>
            <Button color="soft-dark" size="sm" className="me-2" onClick={() => setExpensesOpen(true)}><i className="bx bx-wallet me-1" />Expenses</Button>
            <Button color="soft-success" size="sm" className="me-2" onClick={() => setFinanceOpen(true)}><i className="bx bx-line-chart me-1" />Finance</Button>
            <Button color="soft-info" size="sm" className="me-2" onClick={() => setConversionOpen(true)}><i className="bx bx-filter me-1" />Funnel</Button>
            <Button color="soft-secondary" size="sm" className="me-2" onClick={() => setCommsLogOpen(true)}><i className="bx bx-message-rounded-dots me-1" />Comms Log</Button>
            <Button color="soft-secondary" size="sm" className="me-2" onClick={() => setActivityOpen(true)}><i className="bx bx-history me-1" />Activity</Button>
            <Button color="soft-secondary" size="sm" className="me-2" onClick={() => setImportOpen(true)}><i className="bx bx-import me-1" />Import CSV</Button>
            <Button color="soft-primary" size="sm" onClick={() => setSettingsOpen(true)}><i className="bx bx-cog me-1" />Tour Settings</Button>
          </div>
        </div>

        <RegistrationLinkPanel tour={tour} onEdit={() => setSettingsOpen(true)} filled={Object.entries(stageCounts).reduce((s, [k, v]) => (k === "cancelled" ? s : s + (Number(v) || 0)), 0)} />

        {/* Advanced cohort tools */}
        <CohortTools tourId={tourId} onChanged={() => { loadParticipants(); loadTour(); }} />

        {/* Stage board */}
        <Row className="mb-3">
          {PARTICIPANT_STAGES.filter((s) => s !== "cancelled").map((s) => (
            <Col key={s} xs={6} md={3} xl={true} className="mb-2">
              <Card className="mb-0" role="button" onClick={() => setStageFilter(filterStage === s ? "" : s)}
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
            <Col md={3}>
              <Label className="mb-1">Search</Label>
              <div className="d-flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                       placeholder="Name, email, institution, phone"
                       onKeyDown={(e) => e.key === "Enter" && applySearch()} />
                <Button color="primary" onClick={applySearch}><i className="bx bx-search" /></Button>
              </div>
            </Col>
            <Col md={3}>
              <Label className="mb-1">Stage</Label>
              <Input type="select" value={filterStage} onChange={(e) => setStageFilter(e.target.value)}>
                <option value="">All stages</option>
                {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </Input>
            </Col>
            <Col md={2}>
              <Label className="mb-1">Sort</Label>
              <Input type="select" value={sortBy} onChange={(e) => changeSort(e.target.value)}>
                {PARTICIPANT_SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </Input>
            </Col>
            <Col md={1}>
              <Label className="mb-1">Order</Label>
              <Button color="light" className="w-100" onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); }}>
                <i className={`bx bx-sort-${sortOrder === "asc" ? "up" : "down"}`} />
              </Button>
            </Col>
            <Col md={3} className="text-end">
              <div className="d-flex gap-2 justify-content-end flex-wrap">
                <Button color="soft-secondary" onClick={() => setAdvancedOpen((v) => !v)}>
                  <i className="bx bx-filter-alt me-1" />Advanced{activeAdvancedFilterCount ? ` (${activeAdvancedFilterCount})` : ""}
                </Button>
                <Button color="success" onClick={() => setAddModal(true)}>
                  <i className="bx bx-user-plus me-1" /> Add (Concierge)
                </Button>
              </div>
            </Col>
          </Row>

          {/* Quick toggles on their own row so they stay aligned and clearly tappable */}
          <div className="d-flex flex-wrap gap-4 mt-3">
            <Toggle id="soloOnly" checked={soloOnly} onChange={(e) => { setSoloOnly(e.target.checked); setPage(1); }} label="Solo only" />
            <Toggle id="attnOnly" checked={attnOnly} onChange={(e) => setAttnOnly(e.target.checked)} label="Needs attention" />
            <Toggle id="archivedView" checked={archivedView} onChange={(e) => { setArchivedView(e.target.checked); setPage(1); }} label="Show archived" />
          </div>
          {advancedOpen ? (
            <AdvancedFiltersPanel
              filters={advancedFilters}
              onChange={updateAdvancedFilters}
              onReset={resetAdvancedFilters}
              resultCount={filtered.length}
            />
          ) : null}
        </CardBody></Card>

        <CurrentViewSummary summary={pageOpsSummary} total={totalParticipants} />

        {/* Table */}
        <Card><CardBody>
          <BulkActionBar
            selectedCount={selectedParticipants.length}
            onClear={() => setSelectedIds([])}
            onStage={(stage) => bulkUpdate({ stage }, "Stage updated")}
            onCluster={setBulkCluster}
            onCoordinator={setBulkCoordinator}
            onSolo={(isSolo) => bulkUpdate({ isSolo }, "Solo flag updated")}
            onCancel={() => setConfirm({
              title: "Cancel participants",
              message: `Mark ${selectedParticipants.length} selected participant(s) as cancelled? You can move them back to another stage later.`,
              confirmLabel: "Cancel participants",
              confirmColor: "warning",
              confirmWord: "CANCEL",
              onConfirm: () => bulkUpdate({ stage: "cancelled" }, "Participants cancelled"),
            })}
            onExport={exportSelected}
            onArchive={canEdit ? bulkArchive : null}
            onDelete={canDelete ? bulkDelete : null}
          />
          <ParticipantPagination
            page={page}
            pageSize={pageSize}
            total={totalParticipants}
            totalPages={totalPages}
            currentCount={filtered.length}
            onPage={setPage}
            onPageSize={changePageSize}
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
                  <SortableTh field="fullName" sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort}>Name</SortableTh>
                  <SortableTh field="institutionName" sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort}>Institution</SortableTh>
                  <SortableTh field="stage" sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort}>Stage</SortableTh>
                  <th>Readiness</th>
                  <th>Occupancy</th>
                  <SortableTh field="travelCluster" sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort}>Cluster</SortableTh>
                  <th>Contact</th><th className="text-end">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((p) => {
                    const docs = documentReadiness(p);
                    const passportRisks = passportRiskReasons(p);
                    const payment = paymentInsights(p);
                    return (
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
                        <td>
                          <Badge color={docs.missing || docs.rejected ? "soft-warning" : "soft-success"} className="me-1">
                            Docs {docs.pct}%
                          </Badge>
                          {passportRisks.length ? (
                            <Badge color="soft-danger" title={passportRisks.join(", ")} className="me-1">Passport review</Badge>
                          ) : (
                            <Badge color="soft-success" className="me-1">Passport OK</Badge>
                          )}
                          {payment.quoted ? (
                            <Badge color={payment.outstanding ? (payment.overdue ? "soft-danger" : "soft-warning") : "soft-success"} className="mt-1">
                              {payment.outstanding ? `₹${payment.outstanding.toLocaleString("en-IN")} due` : "Paid"}
                            </Badge>
                          ) : (
                            <Badge color="soft-secondary" className="mt-1">No quote</Badge>
                          )}
                        </td>
                        <td className="text-capitalize">{p.occupancy || "—"}</td>
                        <td>{p.travelCluster || "—"}</td>
                        <td><div className="small">{p.email}<br />{p.mobile}</div></td>
                        <td className="text-end">
                          <Button color="soft-primary" size="sm" className="me-1" title="View" onClick={() => openDetail(p._id)}>
                            <i className="bx bx-show" />
                          </Button>
                          <Button color="soft-success" size="sm" className="me-1" title="Send message"
                                  onClick={() => { setDetail(p); setMsgModal(true); }}>
                            <i className="bx bx-envelope" />
                          </Button>
                          <UncontrolledDropdown className="d-inline-block">
                            <DropdownToggle color="soft-secondary" size="sm" caret title="More actions"><i className="bx bx-dots-horizontal-rounded" /></DropdownToggle>
                            <DropdownMenu end>
                              <DropdownItem header>View</DropdownItem>
                              <DropdownItem onClick={() => openDetail(p._id)}><i className="bx bx-show me-2" />Open details</DropdownItem>
                              {p.portalToken && <DropdownItem onClick={() => rowOpenPortal(p)}><i className="bx bx-link-external me-2" />Open customer portal</DropdownItem>}
                              {p.portalToken && <DropdownItem onClick={() => rowCopyPortal(p)}><i className="bx bx-copy me-2" />Copy portal link</DropdownItem>}
                              <DropdownItem divider />
                              <DropdownItem header>Documents — open</DropdownItem>
                              <DropdownItem onClick={() => rowOpenDoc(getParticipantInvoice, p._id, "proforma", "invoice")}><i className="bx bx-receipt me-2" />Proforma invoice</DropdownItem>
                              <DropdownItem onClick={() => rowOpenDoc(getParticipantInvoice, p._id, "receipt", "receipt")}><i className="bx bx-receipt me-2" />Receipt</DropdownItem>
                              <DropdownItem onClick={() => rowOpenDoc(getVisaDoc, p._id, "cover_letter", "cover letter")}><i className="bx bx-file me-2" />Visa cover letter</DropdownItem>
                              <DropdownItem onClick={() => rowOpenDoc(getVisaDoc, p._id, "checklist", "checklist")}><i className="bx bx-list-check me-2" />Visa checklist</DropdownItem>
                              {canEdit && <>
                                <DropdownItem divider />
                                <DropdownItem header>Email to customer</DropdownItem>
                                <DropdownItem onClick={() => rowEmailInvoice(p)}><i className="bx bx-envelope me-2" />Email proforma invoice</DropdownItem>
                                <DropdownItem onClick={() => rowEmailVisaPack(p)}><i className="bx bx-package me-2" />Email visa pack (4 letters)</DropdownItem>
                              </>}
                              <DropdownItem divider />
                              {archivedView
                                ? (canEdit && <DropdownItem onClick={() => restore(p)}><i className="bx bx-undo me-2" />Restore</DropdownItem>)
                                : (canEdit && <DropdownItem onClick={() => archive(p)}><i className="bx bx-archive-in me-2" />Archive</DropdownItem>)}
                              {canDelete && <DropdownItem className="text-danger" onClick={() => remove(p)}><i className="bx bx-trash me-2" />Delete permanently</DropdownItem>}
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
          {!loading ? (
            <ParticipantPagination
              page={page}
              pageSize={pageSize}
              total={totalParticipants}
              totalPages={totalPages}
              currentCount={filtered.length}
              onPage={setPage}
              onPageSize={changePageSize}
              compact
            />
          ) : null}
        </CardBody></Card>
      </Container>

      {/* Detail modal */}
      <ParticipantDetailModal
        participant={detail && !msgModal ? detail : null}
        tour={tour}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onClose={() => setDetail(null)}
        onPatch={patch}
        onCancel={cancel}
        onArchive={() => detail && archive(detail)}
        onDelete={() => detail && remove(detail)}
        canDelete={canDelete}
        canEdit={canEdit}
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

      <VisaBoardModal isOpen={visaOpen} tourId={tourId} onClose={() => setVisaOpen(false)} onOpenParticipant={(id) => { setVisaOpen(false); openDetail(id); }} onChanged={() => { loadParticipants(); loadTour(); }} />
      <RoomingModal isOpen={roomingOpen} tourId={tourId} onClose={() => setRoomingOpen(false)} onOpenParticipant={(id) => { setRoomingOpen(false); openDetail(id); }} onChanged={() => { loadParticipants(); loadTour(); }} />
      <ReadinessModal isOpen={readinessOpen} tourId={tourId} onClose={() => setReadinessOpen(false)} onOpenParticipant={(id) => { setReadinessOpen(false); openDetail(id); }} />
      <RiskModal isOpen={riskOpen} tourId={tourId} onClose={() => setRiskOpen(false)} onOpenParticipant={(id) => { setRiskOpen(false); openDetail(id); }} />
      <ActivityModal isOpen={activityOpen} onClose={() => setActivityOpen(false)} />
      <CommsLogModal isOpen={commsLogOpen} tourId={tourId} onClose={() => setCommsLogOpen(false)} onOpenParticipant={(id) => { setCommsLogOpen(false); openDetail(id); }} />
      <PaymentsModal isOpen={paymentsOpen} tourId={tourId} onClose={() => setPaymentsOpen(false)} onOpenParticipant={(id) => { setPaymentsOpen(false); openDetail(id); }} />
      <FinanceModal isOpen={financeOpen} tourId={tourId} onClose={() => setFinanceOpen(false)} />
      <ConversionModal isOpen={conversionOpen} tourId={tourId} onClose={() => setConversionOpen(false)} />
      <ExpensesModal isOpen={expensesOpen} tourId={tourId} onClose={() => setExpensesOpen(false)} />
      <BulkImportModal isOpen={importOpen} tourId={tourId} existingParticipants={participants} onClose={() => setImportOpen(false)} onDone={() => { setImportOpen(false); loadParticipants(); loadTour(); }} />
      <TourSettingsModal isOpen={settingsOpen} tour={tour} onClose={() => setSettingsOpen(false)} onSaved={() => { setSettingsOpen(false); loadTour(); }} />

      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

/* ----------------------- Quote builder (Ops tab) ----------------------- */
/**
 * Computes a suggested quote from the tour's pricing anchors + this participant's
 * occupancy / companions / extension, with discount & tax. Applies the total to
 * the Quoted amount field and can generate a 25/50/25 token-advance-balance
 * payment schedule. Pure UI helper — saving still goes through Save ops details.
 */
const QuoteBuilder = ({ tour, participant, onApplyQuote, onApplySchedule }) => {
  const pr = (tour && tour.pricing) || {};
  const [open, setOpen] = useState(false);
  const [base, setBase] = useState(pr.doubleOccupancyPerPerson || 0);
  const [single, setSingle] = useState(participant?.occupancy === "single" ? (pr.singleSupplementMax || pr.singleSupplementMin || 0) : 0);
  const [compCount, setCompCount] = useState((participant?.accompanyingPersons || []).length || 0);
  const [compRate, setCompRate] = useState(pr.doubleOccupancyPerPerson || 0);
  const [extension, setExtension] = useState(0);
  const [addons, setAddons] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  const n = (v) => Number(v) || 0;
  const subtotal = n(base) + n(single) + n(compCount) * n(compRate) + n(extension) + n(addons) - n(discount);
  const tax = Math.round((subtotal * n(taxPct)) / 100);
  const total = Math.max(0, subtotal + tax);
  const fmtMoney = (v) => `₹${n(v).toLocaleString("en-IN")}`;

  const isoInDays = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
  const makeSchedule = () => {
    const token = Math.round(total * 0.25);
    const advance = Math.round(total * 0.5);
    const balance = total - token - advance; // exact remainder — no rounding drift
    onApplySchedule([
      { label: "Token", amount: token, dueDate: isoInDays(7), paidAt: "", reference: "", paid: false },
      { label: "Advance", amount: advance, dueDate: isoInDays(30), paidAt: "", reference: "", paid: false },
      { label: "Balance", amount: balance, dueDate: isoInDays(60), paidAt: "", reference: "", paid: false },
    ]);
  };

  return (
    <Col md={12}>
      <Button size="sm" color="soft-info" onClick={() => setOpen((o) => !o)}>
        <i className="bx bx-calculator me-1" />{open ? "Hide quote builder" : "Build a quote"}
      </Button>
      {open && (
        <div className="border rounded p-3 mt-2 bg-light">
          <Row className="g-2">
            <Col md={4}><Label className="small mb-0">Base (double / person)</Label><Input type="number" value={base} onChange={(e) => setBase(e.target.value)} /></Col>
            <Col md={4}><Label className="small mb-0">Single supplement</Label><Input type="number" value={single} onChange={(e) => setSingle(e.target.value)} /></Col>
            <Col md={2}><Label className="small mb-0">Companions</Label><Input type="number" value={compCount} onChange={(e) => setCompCount(e.target.value)} /></Col>
            <Col md={2}><Label className="small mb-0">Rate each</Label><Input type="number" value={compRate} onChange={(e) => setCompRate(e.target.value)} /></Col>
            <Col md={3}><Label className="small mb-0">Extension</Label><Input type="number" value={extension} onChange={(e) => setExtension(e.target.value)} /></Col>
            <Col md={3}><Label className="small mb-0">Add-ons</Label><Input type="number" value={addons} onChange={(e) => setAddons(e.target.value)} /></Col>
            <Col md={3}><Label className="small mb-0">Discount</Label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} /></Col>
            <Col md={3}><Label className="small mb-0">Tax %</Label><Input type="number" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} /></Col>
          </Row>
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-3">
            <div className="small text-muted">
              Subtotal {fmtMoney(subtotal)}{n(taxPct) ? ` · tax ${fmtMoney(tax)}` : ""}
              <span className="ms-2 fs-6 fw-semibold text-dark">Total {fmtMoney(total)}</span>
            </div>
            <div>
              <Button size="sm" color="soft-primary" className="me-2" onClick={() => onApplyQuote(total)}>Use as quoted amount</Button>
              <Button size="sm" color="soft-success" onClick={makeSchedule}>Generate 25/50/25 schedule</Button>
            </div>
          </div>
        </div>
      )}
    </Col>
  );
};

/* ----------------------- Detail modal (tabs) --------------------------- */
const ParticipantDetailModal = ({ participant, tour, activeTab, setActiveTab, onClose, onPatch, onCancel, onArchive, onDelete, canDelete, canEdit, onMessage }) => {
  const [ops, setOps] = useState({});
  const [reg, setReg] = useState({});
  const [companions, setCompanions] = useState([]);
  const [visa, setVisa] = useState({});
  const [flight, setFlight] = useState({});
  const [logistics, setLogistics] = useState({});
  const [logUploading, setLogUploading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelForm, setCancelForm] = useState({ reason: "", refundAmount: "", refundStatus: "none", refundReference: "", creditNoteRef: "", notes: "" });
  const [cancelBusy, setCancelBusy] = useState(false);
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
      const ins = x.insurance || {}; const tr = x.transfer || {};
      setLogistics({
        provider: ins.provider || "", policyNumber: ins.policyNumber || "", insuredAmount: ins.insuredAmount || "",
        currency: ins.currency || "INR", validFrom: inputDate(ins.validFrom), validTo: inputDate(ins.validTo),
        emergencyHotline: ins.emergencyHotline || "", documentUrl: ins.documentUrl || "", documentName: ins.documentName || "",
        arrivalGroup: tr.arrivalGroup || "", arrivalPoint: tr.arrivalPoint || "", arrivalPickupTime: tr.arrivalPickupTime || "",
        departureGroup: tr.departureGroup || "", departurePoint: tr.departurePoint || "", departurePickupTime: tr.departurePickupTime || "",
        vehicle: tr.vehicle || "", guideName: tr.guideName || "", guidePhone: tr.guidePhone || "",
        emergencyPhone: tr.emergencyPhone || "", notes: tr.notes || "",
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

  const saveLogistics = () => onPatch(p._id, {
    insurance: {
      provider: logistics.provider, policyNumber: logistics.policyNumber,
      insuredAmount: logistics.insuredAmount === "" ? undefined : Number(logistics.insuredAmount),
      currency: logistics.currency, validFrom: logistics.validFrom || undefined, validTo: logistics.validTo || undefined,
      emergencyHotline: logistics.emergencyHotline, documentUrl: logistics.documentUrl, documentName: logistics.documentName,
    },
    transfer: {
      arrivalGroup: logistics.arrivalGroup, arrivalPoint: logistics.arrivalPoint, arrivalPickupTime: logistics.arrivalPickupTime,
      departureGroup: logistics.departureGroup, departurePoint: logistics.departurePoint, departurePickupTime: logistics.departurePickupTime,
      vehicle: logistics.vehicle, guideName: logistics.guideName, guidePhone: logistics.guidePhone,
      emergencyPhone: logistics.emergencyPhone, notes: logistics.notes,
    },
  }, "Insurance & transfer saved");

  // Open a printable doc in a new tab — opened synchronously (popup-safe), filled after fetch.
  const openPrintable = async (fetcher, type, label) => {
    const w = window.open("", "_blank");
    if (w) w.document.write("<p style='font-family:sans-serif;padding:24px'>Generating…</p>");
    try {
      const r = await fetcher(p._id, type);
      const html = r?.data?.html;
      if (!html) throw new Error("No document returned");
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) {
      if (w) w.close();
      showToastError(e?.response?.data?.message || `Could not generate ${label}`, "Error");
    }
  };
  const openInvoice = (type) => openPrintable(getParticipantInvoice, type, "invoice");
  const openVisaDoc = (type) => openPrintable(getVisaDoc, type, "document");

  const [emailingDoc, setEmailingDoc] = useState("");
  const emailDoc = async (kind, type) => {
    setEmailingDoc(`${kind}-${type}`);
    try {
      const r = await emailDocument(p._id, kind, type);
      showToastSuccess(`Emailed to ${r?.data?.to || p.email}`, "Sent to customer");
    } catch (e) { showToastError(e?.response?.data?.message || "Could not email document", "Error"); }
    finally { setEmailingDoc(""); }
  };
  const emailPack = async () => {
    setEmailingDoc("visa-pack");
    try {
      const r = await emailVisaPack(p._id);
      showToastSuccess(`${r?.data?.count || 4} letters emailed to ${r?.data?.to || p.email}`, "Visa pack sent");
    } catch (e) { showToastError(e?.response?.data?.message || "Could not email visa pack", "Error"); }
    finally { setEmailingDoc(""); }
  };

  const resendComm = async (c) => {
    try {
      await sendMessage(p._id, c.templateKey, [c.channel], {});
      onPatch(p._id, {}, "Message re-sent"); // re-dispatches + reloads the participant
    } catch (e) { showToastError(e?.response?.data?.message || "Resend failed", "Error"); }
  };

  // Preview an email as it was/would be rendered for this participant.
  const previewComm = async (templateKey) => {
    const w = window.open("", "_blank");
    if (w) w.document.write("<p style='font-family:sans-serif;padding:24px'>Rendering preview…</p>");
    try {
      const r = await previewMessage(p._id, templateKey, {});
      const html = r?.data?.rendered?.html;
      if (!html) throw new Error("No preview");
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) { if (w) w.close(); showToastError(e?.response?.data?.message || "Preview failed", "Error"); }
  };

  // Open the customer's own portal (exactly what they see).
  const portalUrl = p.portalToken ? `${publicBaseUrl()}/educator-study-tours/portal/${p.portalToken}` : "";
  const openPortal = () => { if (portalUrl) window.open(portalUrl, "_blank"); };
  const copyPortal = async () => {
    if (!portalUrl) return;
    try { await navigator.clipboard.writeText(portalUrl); showToastSuccess("Portal link copied", "Copied"); }
    catch (e) { showToastError("Could not copy", "Clipboard"); }
  };

  const submitCancel = async () => {
    if (!cancelForm.reason.trim()) { showToastError("A cancellation reason is required", "Validation"); return; }
    setCancelBusy(true);
    try {
      await onCancel(p._id, {
        reason: cancelForm.reason.trim(),
        refundAmount: cancelForm.refundAmount === "" ? undefined : Number(cancelForm.refundAmount),
        refundStatus: cancelForm.refundStatus,
        refundReference: cancelForm.refundReference || undefined,
        creditNoteRef: cancelForm.creditNoteRef || undefined,
        notes: cancelForm.notes || undefined,
      });
      setCancelOpen(false);
    } catch (e) { showToastError(e?.response?.data?.message || "Cancellation failed", "Error"); }
    finally { setCancelBusy(false); }
  };

  const uploadInsuranceDoc = async (fileList) => {
    const f = Array.from(fileList || [])[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { showToastError("File exceeds 15MB", "Too large"); return; }
    setLogUploading(true);
    try {
      const r = await uploadDocument(f);
      if (r?.data?.url) setLogistics((l) => ({ ...l, documentUrl: r.data.url, documentName: f.name }));
      showToastSuccess("Policy document uploaded — remember to Save", "Uploaded");
    } catch (e) { showToastError("Upload failed", "Error"); }
    finally { setLogUploading(false); }
  };

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
          {["profile", "companions", "ops", "documents", "visa", "flight", "logistics", "comms"].map((t) => (
            <NavItem key={t}>
              <NavLink className={classnames({ active: activeTab === t })} onClick={() => setActiveTab(t)} role="button">
                <span className="text-capitalize">{t === "comms" ? "Communications" : t === "companions" ? "Accompanying" : t === "logistics" ? "Insurance & Transfer" : t}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* PROFILE — editable registration */}
          <TabPane tabId="profile">
            <Row className="g-3">
              {portalUrl && (
                <Col md={12}>
                  <Label>Customer portal link <small className="text-muted">(auto-generated at registration — share with the customer)</small></Label>
                  <div className="d-flex gap-2">
                    <Input value={portalUrl} readOnly onFocus={(e) => e.target.select()} />
                    <Button color="soft-secondary" onClick={copyPortal} title="Copy"><i className="bx bx-copy" /></Button>
                    <Button color="soft-info" onClick={openPortal} title="Open"><i className="bx bx-link-external" /></Button>
                  </div>
                </Col>
              )}
              <Col md={12} className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-1 mt-2">
                <h6 className="text-muted mb-0 text-uppercase" style={{ letterSpacing: 0.5, fontSize: 12 }}>Personal details</h6>
                <small className="text-muted"><span className="text-danger">*</span> required at registration</small>
              </Col>
              <Col md={2}><Label>Salutation</Label>
                <Input type="select" value={reg.salutation || ""} onChange={(e) => setReg({ ...reg, salutation: e.target.value })}>
                  <option value="">—</option>
                  {SALUTATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Input>
              </Col>
              <Col md={5}><Label>Full name<Req /></Label><Input value={reg.fullName} onChange={(e) => setReg({ ...reg, fullName: e.target.value })} /></Col>
              <Col md={2}><Label>Date of birth</Label><Input type="date" value={reg.dob || ""} onChange={(e) => setReg({ ...reg, dob: e.target.value })} /></Col>
              <Col md={3}><Label>Gender</Label><Input value={reg.gender || ""} onChange={(e) => setReg({ ...reg, gender: e.target.value })} /></Col>
              <Col md={3}><Label>Email<Req /></Label><Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></Col>
              <Col md={3}><Label>Mobile<Req /></Label><Input value={reg.mobile} onChange={(e) => setReg({ ...reg, mobile: e.target.value })} /></Col>
              <Col md={3}><Label>Preferred communication</Label>
                <Input type="select" value={reg.communicationMethod || ""} onChange={(e) => setReg({ ...reg, communicationMethod: e.target.value })}>
                  <option value="">—</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="phone">Phone</option>
                </Input>
              </Col>
              <Col md={3}><Label>Nationality</Label><Input value={reg.nationality} onChange={(e) => setReg({ ...reg, nationality: e.target.value })} /></Col>
              <Col md={4}><Label>City<Req /></Label><Input value={reg.city} onChange={(e) => setReg({ ...reg, city: e.target.value })} /></Col>
              <Col md={4}><Label>State<Req /></Label><Input value={reg.state} onChange={(e) => setReg({ ...reg, state: e.target.value })} /></Col>

              <Col md={12} className="border-bottom pb-1 mb-1 mt-2"><h6 className="text-muted mb-0 text-uppercase" style={{ letterSpacing: 0.5, fontSize: 12 }}>Institution</h6></Col>
              <Col md={6}><Label>Institution<Req /></Label><Input value={reg.institutionName} onChange={(e) => setReg({ ...reg, institutionName: e.target.value })} /></Col>
              <Col md={3}><Label>Designation<Req /></Label><Input value={reg.designation} onChange={(e) => setReg({ ...reg, designation: e.target.value })} /></Col>
              <Col md={3}><Label>Institution type</Label><Input value={reg.institutionType || ""} onChange={(e) => setReg({ ...reg, institutionType: e.target.value })} /></Col>
              <Col md={3}><Label>Official email</Label><Input type="email" value={reg.officialEmail || ""} onChange={(e) => setReg({ ...reg, officialEmail: e.target.value })} /></Col>
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

              {/* Quote builder — computes a suggested quote + payment schedule */}
              <QuoteBuilder
                tour={tour}
                participant={p}
                onApplyQuote={(amt) => setOps((o) => ({ ...o, quotedAmount: amt }))}
                onApplySchedule={(ms) => setOps((o) => ({ ...o, milestones: ms }))}
              />

              <Col md={12}>
                <span className="text-muted me-2 small">Documents:</span>
                <Button size="sm" color="soft-secondary" className="me-2" onClick={() => openInvoice("proforma")}><i className="bx bx-receipt me-1" />Proforma</Button>
                <Button size="sm" color="soft-secondary" className="me-2" onClick={() => openInvoice("gst")}><i className="bx bx-receipt me-1" />Tax invoice</Button>
                <Button size="sm" color="soft-secondary" onClick={() => openInvoice("receipt")}><i className="bx bx-receipt me-1" />Receipt</Button>
                <div className="mt-1">
                  <span className="text-muted me-2 small">Email PDF to customer:</span>
                  <Button size="sm" color="soft-success" className="me-2" disabled={emailingDoc === "invoice-proforma"} onClick={() => emailDoc("invoice", "proforma")}>{emailingDoc === "invoice-proforma" ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Proforma</>}</Button>
                  <Button size="sm" color="soft-success" disabled={emailingDoc === "invoice-receipt"} onClick={() => emailDoc("invoice", "receipt")}>{emailingDoc === "invoice-receipt" ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Receipt</>}</Button>
                </div>
                <small className="text-muted d-block mt-1">"Opens" = printable in a tab. "Email PDF" = sends the PDF to the customer (BCC to your inbox). Save ops first.</small>
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

            {/* Cancellation & refund */}
            <hr />
            {p.stage === "cancelled" && p.cancellation ? (
              <div className="alert alert-danger">
                <strong><i className="bx bx-x-circle me-1" />Cancelled</strong>
                {p.cancellation.cancelledAt ? <span className="text-muted ms-2 small">{fmt(p.cancellation.cancelledAt)}</span> : null}
                <div className="small mt-1">
                  {p.cancellation.reason ? <div><strong>Reason:</strong> {p.cancellation.reason}</div> : null}
                  {p.cancellation.refundAmount != null ? <div><strong>Refund:</strong> ₹{Number(p.cancellation.refundAmount).toLocaleString("en-IN")} · <Badge color={p.cancellation.refundStatus === "processed" ? "soft-success" : p.cancellation.refundStatus === "pending" ? "soft-warning" : "soft-secondary"}>{p.cancellation.refundStatus || "none"}</Badge></div> : null}
                  {p.cancellation.refundReference ? <div><strong>Refund ref:</strong> {p.cancellation.refundReference}</div> : null}
                  {p.cancellation.creditNoteRef ? <div><strong>Credit note:</strong> {p.cancellation.creditNoteRef}</div> : null}
                  {p.cancellation.notes ? <div><strong>Notes:</strong> {p.cancellation.notes}</div> : null}
                </div>
              </div>
            ) : !cancelOpen ? (
              <Button color="soft-danger" size="sm" onClick={() => setCancelOpen(true)}><i className="bx bx-x-circle me-1" />Cancel participant…</Button>
            ) : (
              <div className="border border-danger rounded p-3">
                <h6 className="text-danger mb-2">Cancel participant</h6>
                <Row className="g-2">
                  <Col md={12}><Label className="mb-0">Reason *</Label><Input value={cancelForm.reason} onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })} placeholder="e.g. Visa refused, personal reasons" /></Col>
                  <Col md={3}><Label className="mb-0">Refund amount</Label><Input type="number" value={cancelForm.refundAmount} onChange={(e) => setCancelForm({ ...cancelForm, refundAmount: e.target.value })} /></Col>
                  <Col md={3}><Label className="mb-0">Refund status</Label>
                    <Input type="select" value={cancelForm.refundStatus} onChange={(e) => setCancelForm({ ...cancelForm, refundStatus: e.target.value })}>
                      <option value="none">None</option><option value="pending">Pending</option><option value="processed">Processed</option>
                    </Input>
                  </Col>
                  <Col md={3}><Label className="mb-0">Refund ref</Label><Input value={cancelForm.refundReference} onChange={(e) => setCancelForm({ ...cancelForm, refundReference: e.target.value })} /></Col>
                  <Col md={3}><Label className="mb-0">Credit note ref</Label><Input value={cancelForm.creditNoteRef} onChange={(e) => setCancelForm({ ...cancelForm, creditNoteRef: e.target.value })} /></Col>
                  <Col md={12}><Label className="mb-0">Notes</Label><Input value={cancelForm.notes} onChange={(e) => setCancelForm({ ...cancelForm, notes: e.target.value })} /></Col>
                </Row>
                <div className="mt-2">
                  <Button color="danger" size="sm" className="me-2" disabled={cancelBusy} onClick={submitCancel}>{cancelBusy ? <Spinner size="sm" /> : "Confirm cancellation"}</Button>
                  <Button color="light" size="sm" onClick={() => setCancelOpen(false)}>Keep active</Button>
                </div>
              </div>
            )}
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

            <hr />
            <div>
              <span className="text-muted me-2 small">Generate visa-pack documents:</span>
              <Button size="sm" color="soft-secondary" className="me-2 mb-1" onClick={() => openVisaDoc("cover_letter")}><i className="bx bx-file me-1" />Cover letter</Button>
              <Button size="sm" color="soft-secondary" className="me-2 mb-1" onClick={() => openVisaDoc("invitation")}><i className="bx bx-file me-1" />Invitation</Button>
              <Button size="sm" color="soft-secondary" className="me-2 mb-1" onClick={() => openVisaDoc("noc")}><i className="bx bx-file me-1" />NOC</Button>
              <Button size="sm" color="soft-secondary" className="mb-1" onClick={() => openVisaDoc("checklist")}><i className="bx bx-list-check me-1" />Checklist</Button>
              <small className="text-muted d-block mt-1">Pre-filled drafts — open, review, print on letterhead and sign.</small>
              <div className="mt-1">
                <span className="text-muted me-2 small">Email PDF to customer:</span>
                {["cover_letter", "invitation", "noc", "checklist"].map((t) => (
                  <Button key={t} size="sm" color="soft-success" className="me-2 mb-1 text-capitalize" disabled={emailingDoc === `visa-${t}`} onClick={() => emailDoc("visa", t)}>
                    {emailingDoc === `visa-${t}` ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />{t.replace("_", " ")}</>}
                  </Button>
                ))}
                <Button size="sm" color="success" className="mb-1" disabled={emailingDoc === "visa-pack"} onClick={emailPack}>
                  {emailingDoc === "visa-pack" ? <Spinner size="sm" /> : <><i className="bx bx-package me-1" />Email whole pack</>}
                </Button>
              </div>
            </div>
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

            {(p.customerUploads || []).length > 0 && (
              <div className="mt-3 border rounded p-2 bg-light">
                <strong className="small"><i className="bx bx-cloud-upload me-1" />Customer-uploaded travel documents</strong>
                <ul className="mb-0 mt-1">
                  {(p.customerUploads || []).map((f, i) => (
                    <li key={i} className="small">
                      <a href={f.url} target="_blank" rel="noreferrer">{f.name || "file"}</a>
                      {f.label ? <span className="text-muted"> · {f.label}</span> : null}
                      {f.uploadedAt ? <span className="text-muted"> · {fmt(f.uploadedAt)}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabPane>

          {/* INSURANCE & TRANSFER */}
          <TabPane tabId="logistics">
            <h6 className="text-muted mb-2"><i className="bx bx-shield-quarter me-1" />Travel insurance</h6>
            <Row className="g-3">
              <Col md={4}><Label>Provider</Label><Input value={logistics.provider || ""} onChange={(e) => setLogistics({ ...logistics, provider: e.target.value })} /></Col>
              <Col md={4}><Label>Policy number</Label><Input value={logistics.policyNumber || ""} onChange={(e) => setLogistics({ ...logistics, policyNumber: e.target.value })} /></Col>
              <Col md={2}><Label>Insured amount</Label><Input type="number" value={logistics.insuredAmount || ""} onChange={(e) => setLogistics({ ...logistics, insuredAmount: e.target.value })} /></Col>
              <Col md={2}><Label>Currency</Label><Input value={logistics.currency || ""} onChange={(e) => setLogistics({ ...logistics, currency: e.target.value })} /></Col>
              <Col md={3}><Label>Valid from</Label><Input type="date" value={logistics.validFrom || ""} onChange={(e) => setLogistics({ ...logistics, validFrom: e.target.value })} /></Col>
              <Col md={3}><Label>Valid to</Label><Input type="date" value={logistics.validTo || ""} onChange={(e) => setLogistics({ ...logistics, validTo: e.target.value })} /></Col>
              <Col md={3}><Label>Emergency hotline</Label><Input value={logistics.emergencyHotline || ""} onChange={(e) => setLogistics({ ...logistics, emergencyHotline: e.target.value })} /></Col>
              <Col md={3}>
                <Label>Policy document</Label>
                <div className="d-flex align-items-center gap-2">
                  <Label className="btn btn-soft-primary btn-sm mb-0">
                    {logUploading ? <Spinner size="sm" /> : <><i className="bx bx-upload me-1" />Upload</>}
                    <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => { uploadInsuranceDoc(e.target.files); e.target.value = ""; }} />
                  </Label>
                  {logistics.documentUrl ? <a href={logistics.documentUrl} target="_blank" rel="noreferrer" className="small">{logistics.documentName || "view"}</a> : <span className="text-muted small">none</span>}
                </div>
              </Col>
            </Row>

            <h6 className="text-muted mb-2 mt-4"><i className="bx bx-bus me-1" />Ground transfers</h6>
            <Row className="g-3">
              <Col md={12}><small className="text-muted">Arrival</small></Col>
              <Col md={3}><Label>Group</Label><Input value={logistics.arrivalGroup || ""} onChange={(e) => setLogistics({ ...logistics, arrivalGroup: e.target.value })} placeholder="Bus A" /></Col>
              <Col md={5}><Label>Pickup point</Label><Input value={logistics.arrivalPoint || ""} onChange={(e) => setLogistics({ ...logistics, arrivalPoint: e.target.value })} placeholder="Helsinki Airport T2 arrivals" /></Col>
              <Col md={4}><Label>Pickup time</Label><Input value={logistics.arrivalPickupTime || ""} onChange={(e) => setLogistics({ ...logistics, arrivalPickupTime: e.target.value })} placeholder="14 May · 08:30" /></Col>
              <Col md={12}><small className="text-muted">Departure</small></Col>
              <Col md={3}><Label>Group</Label><Input value={logistics.departureGroup || ""} onChange={(e) => setLogistics({ ...logistics, departureGroup: e.target.value })} /></Col>
              <Col md={5}><Label>Drop point</Label><Input value={logistics.departurePoint || ""} onChange={(e) => setLogistics({ ...logistics, departurePoint: e.target.value })} /></Col>
              <Col md={4}><Label>Pickup time</Label><Input value={logistics.departurePickupTime || ""} onChange={(e) => setLogistics({ ...logistics, departurePickupTime: e.target.value })} /></Col>
              <Col md={4}><Label>Vehicle</Label><Input value={logistics.vehicle || ""} onChange={(e) => setLogistics({ ...logistics, vehicle: e.target.value })} placeholder="49-seater coach" /></Col>
              <Col md={4}><Label>Guide name</Label><Input value={logistics.guideName || ""} onChange={(e) => setLogistics({ ...logistics, guideName: e.target.value })} /></Col>
              <Col md={4}><Label>Guide phone</Label><Input value={logistics.guidePhone || ""} onChange={(e) => setLogistics({ ...logistics, guidePhone: e.target.value })} /></Col>
              <Col md={4}><Label>Emergency phone</Label><Input value={logistics.emergencyPhone || ""} onChange={(e) => setLogistics({ ...logistics, emergencyPhone: e.target.value })} /></Col>
              <Col md={8}><Label>Notes</Label><Input value={logistics.notes || ""} onChange={(e) => setLogistics({ ...logistics, notes: e.target.value })} /></Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveLogistics}>Save insurance & transfer</Button>
          </TabPane>

          {/* COMMS */}
          <TabPane tabId="comms">
            {(p.communications || []).length === 0 ? <p className="text-muted">No messages sent yet.</p> : (
              <Table className="align-middle">
                <thead><tr><th>When</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[...p.communications].reverse().map((c, i) => (
                    <tr key={i}>
                      <td className="small">{new Date(c.sentAt).toLocaleString("en-IN")}</td>
                      <td className="text-capitalize">{c.channel}</td>
                      <td>{c.templateKey}</td>
                      <td className="small">{c.to || "—"}</td>
                      <td><Badge color={c.status === "sent" ? "success" : c.status === "failed" ? "danger" : "warning"}>{c.status}</Badge>{c.error ? <i className="bx bx-info-circle text-danger ms-1" title={c.error} /> : null}</td>
                      <td>
                        {c.channel === "email" && (
                          <Button size="sm" color="soft-secondary" className="me-1" title="Preview email" onClick={() => previewComm(c.templateKey)}><i className="bx bx-show" /></Button>
                        )}
                        {c.status === "failed" && (
                          <Button size="sm" color="soft-primary" title="Resend" onClick={() => resendComm(c)}><i className="bx bx-refresh" /></Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        {portalUrl && (
          <>
            <Button color="soft-info" onClick={openPortal} title="Open the customer's portal (what they see)"><i className="bx bx-link-external me-1" />Customer portal</Button>
            <Button color="soft-secondary" onClick={copyPortal} title="Copy portal link"><i className="bx bx-copy" /></Button>
          </>
        )}
        <Button color="success" onClick={onMessage}><i className="bx bx-envelope me-1" /> Send Message</Button>
        {canEdit && !participant.archived && (
          <Button color="soft-warning" onClick={onArchive}><i className="bx bx-archive-in me-1" />Archive</Button>
        )}
        {canDelete && (
          <Button color="soft-danger" onClick={onDelete}><i className="bx bx-trash me-1" />Delete</Button>
        )}
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

const CurrentViewSummary = ({ summary, total }) => (
  <Card>
    <CardBody className="py-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <h6 className="mb-0"><i className="bx bx-pulse me-1" />Current view readiness</h6>
        <small className="text-muted">{summary.count} visible from {total || 0} matching server result(s)</small>
      </div>
      <Row className="g-2">
        <Col xs={6} md={2}>
          <div className="border rounded p-2 h-100">
            <small className="text-muted d-block">Outstanding</small>
            <strong>₹{(summary.outstanding || 0).toLocaleString("en-IN")}</strong>
            <small className="d-block text-muted">{summary.paymentDue} participant(s)</small>
          </div>
        </Col>
        <Col xs={6} md={2}>
          <div className="border rounded p-2 h-100">
            <small className="text-muted d-block">Overdue payments</small>
            <strong className={summary.overduePayments ? "text-danger" : ""}>{summary.overduePayments}</strong>
            <small className="d-block text-muted">milestone owner(s)</small>
          </div>
        </Col>
        <Col xs={6} md={2}>
          <div className="border rounded p-2 h-100">
            <small className="text-muted d-block">Docs ready</small>
            <strong>{summary.docRate}%</strong>
            <small className="d-block text-muted">{summary.docCompleted}/{summary.docRequired}</small>
          </div>
        </Col>
        <Col xs={6} md={2}>
          <div className="border rounded p-2 h-100">
            <small className="text-muted d-block">Passport risks</small>
            <strong className={summary.passportRisks ? "text-danger" : ""}>{summary.passportRisks}</strong>
            <small className="d-block text-muted">need review</small>
          </div>
        </Col>
        <Col xs={6} md={2}>
          <div className="border rounded p-2 h-100">
            <small className="text-muted d-block">Flights missing</small>
            <strong className={summary.missingFlights ? "text-warning" : ""}>{summary.missingFlights}</strong>
            <small className="d-block text-muted">not booked</small>
          </div>
        </Col>
      </Row>
    </CardBody>
  </Card>
);

const SortableTh = ({ field, sortBy, sortOrder, onSort, children }) => (
  <th role="button" onClick={() => onSort(field)} className="text-nowrap">
    {children}
    {sortBy === field ? <i className={`bx bx-chevron-${sortOrder === "asc" ? "up" : "down"} ms-1`} /> : null}
  </th>
);

const ParticipantPagination = ({ page, pageSize, total, totalPages, currentCount, onPage, onPageSize, compact }) => {
  const start = total ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, total || 0);
  const expectedPageCount = total ? Math.max(0, end - start + 1) : 0;
  return (
    <div className={`d-flex justify-content-between align-items-center flex-wrap gap-2 ${compact ? "mt-3" : "mb-3"}`}>
      <div className="small text-muted">
        Showing {start}-{end} of {total || 0}
        {currentCount !== expectedPageCount && total ? ` (${currentCount} visible after page filters)` : ""}
      </div>
      <div className="d-flex align-items-center gap-2">
        {!compact ? (
          <>
            <span className="small text-muted">Rows</span>
            <Input bsSize="sm" type="select" value={pageSize} onChange={(e) => onPageSize(e.target.value)} style={{ width: 82 }}>
              {[10, 25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
            </Input>
          </>
        ) : null}
        <Button color="light" size="sm" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))}>
          Previous
        </Button>
        <span className="small text-muted">Page {page} of {totalPages}</span>
        <Button color="light" size="sm" disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
};

/* ----------------------- Bulk participant actions ----------------------- */
const BulkActionBar = ({ selectedCount, onClear, onStage, onCluster, onCoordinator, onSolo, onCancel, onExport, onArchive, onDelete }) => {
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
          <Button size="sm" color="soft-secondary" className="me-1" onClick={() => onSolo(false)}>Clear solo</Button>
          <Button size="sm" color="soft-warning" className="me-1" onClick={onCancel}>Cancel</Button>
          <Button size="sm" color="soft-success" className="me-1" onClick={onExport}>Export</Button>
          {onArchive && <Button size="sm" color="soft-warning" className="me-1" onClick={onArchive}><i className="bx bx-archive-in me-1" />Archive</Button>}
          {onDelete && <Button size="sm" color="soft-danger" className="me-1" onClick={onDelete}><i className="bx bx-trash me-1" />Delete</Button>}
          <Button size="sm" color="light" onClick={onClear}>Clear</Button>
        </Col>
      </Row>
    </div>
  );
};

/* ----------------------- Registration link panel ------------------------ */
const RegistrationLinkPanel = ({ tour, onEdit, filled = 0 }) => {
  const [copied, setCopied] = useState(false);
  const url = publicRegistrationUrl(tour);
  const status = tour?.status || "draft";
  const isOpen = status === "open";
  const cap = Number(tour?.capacity) || 0;
  const full = cap > 0 && filled >= cap;

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
              {cap > 0 && (
                <Badge color={full ? (tour.waitlistEnabled ? "soft-warning" : "soft-danger") : "soft-info"}>
                  {filled}/{cap} filled{full ? (tour.waitlistEnabled ? " · waitlist on" : " · FULL") : ""}
                </Badge>
              )}
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
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

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

  const printManifest = async (type) => {
    const w = window.open("", "_blank");
    if (w) w.document.write("<p style='font-family:sans-serif;padding:24px'>Generating…</p>");
    setBusy(`print-${type}`);
    try {
      const r = await getManifestPrint(tourId, type);
      const html = r?.data?.html;
      if (!html) throw new Error("No document");
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) { if (w) w.close(); showToastError("Could not generate document", "Error"); }
    finally { setBusy(""); }
  };

  const runReminders = () => setConfirm({
    title: "Run due reminders",
    message: "Send any deadline-driven messages (visa, payment, weather, etc.) that are due today? Recipients will receive emails/SMS immediately.",
    confirmLabel: "Run reminders now",
    confirmColor: "warning",
    onConfirm: async () => {
      setBusy("automations");
      try {
        const r = await runAutomations(tourId);
        const res = r?.data?.result || {};
        showToastSuccess(`Sent ${res.sent || 0}, skipped ${res.skipped || 0}, failed ${res.failed || 0}`, "Reminders");
        onChanged && onChanged();
      } catch (e) { showToastError("Automation run failed", "Error"); }
      finally { setBusy(""); }
    },
  });

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
          {canEdit && (
            <Button size="sm" color="soft-success" className="me-2" onClick={() => setBulkOpen(true)}>
              <i className="bx bx-broadcast me-1" />Bulk message
            </Button>
          )}
          {canEdit && (
            <Button size="sm" color="soft-warning" onClick={runReminders} disabled={busy === "automations"}>
              {busy === "automations" ? <Spinner size="sm" /> : <><i className="bx bx-bell me-1" />Run reminders</>}
            </Button>
          )}
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
        {["rooming", "dietary", "flight", "transfer", "insurance"].map((t) => (
          <Button key={t} size="sm" color="light" className="me-2 text-capitalize" onClick={() => exportManifest(t)} disabled={busy === t}>
            <i className="bx bx-download me-1" />{t} CSV
          </Button>
        ))}
      </div>
      <div className="mt-2">
        <span className="text-muted me-2 small">Partner documents (print/PDF):</span>
        {["rooming", "dietary", "flight", "transfer", "insurance"].map((t) => (
          <Button key={t} size="sm" color="soft-secondary" className="me-2 text-capitalize" onClick={() => printManifest(t)} disabled={busy === `print-${t}`}>
            <i className="bx bx-printer me-1" />{t}
          </Button>
        ))}
      </div>

      <BulkMessageModal isOpen={bulkOpen} tourId={tourId} onClose={() => setBulkOpen(false)} onSent={() => { setBulkOpen(false); onChanged && onChanged(); }} />
      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
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
  const [segment, setSegment] = useState("");
  const [city, setCity] = useState("");
  const [cluster, setCluster] = useState("");
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [vars, setVars] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const loadCampaigns = async () => {
    try { const r = await getCampaigns(tourId); setCampaigns(r?.data?.campaigns || []); } catch (e) { /* silent */ }
  };
  useEffect(() => { if (isOpen) { setVars({}); setStage(""); setSegment(""); setCity(""); setCluster(""); setPreview(null); setScheduleAt(""); loadCampaigns(); } /* eslint-disable-next-line */ }, [isOpen]);
  // The preview goes stale if the message definition or targeting changes — clear it.
  useEffect(() => { setPreview(null); }, [templateKey, stage, segment, city, cluster, channels, vars]);

  const selectedChans = () => Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
  const filters = () => ({ stage: stage || undefined, segment: segment || undefined, city: city.trim() || undefined, cluster: cluster.trim() || undefined });

  const runPreview = async () => {
    const chans = selectedChans();
    if (!chans.length) { showToastError("Select a channel", "Validation"); return; }
    setPreviewing(true);
    try {
      const r = await bulkMessagePreview(tourId, templateKey, chans, vars, filters());
      setPreview(r?.data || null);
    } catch (e) { showToastError(e?.response?.data?.message || "Preview failed", "Error"); }
    finally { setPreviewing(false); }
  };

  const schedule = async () => {
    const chans = selectedChans();
    if (!chans.length) { showToastError("Select a channel", "Validation"); return; }
    if (!scheduleAt) { showToastError("Pick a date & time", "Validation"); return; }
    if (new Date(scheduleAt).getTime() <= Date.now()) { showToastError("Schedule a time in the future", "Validation"); return; }
    setScheduling(true);
    try {
      await scheduleCampaign({ studyTour: tourId, templateKey, channels: chans, vars, ...filters(), scheduledFor: new Date(scheduleAt).toISOString() });
      showToastSuccess("Campaign scheduled", "Scheduled");
      setScheduleAt("");
      loadCampaigns();
    } catch (e) { showToastError(e?.response?.data?.message || "Scheduling failed", "Error"); }
    finally { setScheduling(false); }
  };

  const dropCampaign = async (c) => {
    try { await cancelCampaign(c._id); showToastSuccess("Campaign cancelled", "Cancelled"); loadCampaigns(); }
    catch (e) { showToastError(e?.response?.data?.message || "Cancel failed", "Error"); }
  };

  const send = () => {
    const chans = selectedChans();
    if (!chans.length) { showToastError("Select a channel", "Validation"); return; }
    const deliverableNote = preview
      ? ` ${chans.map((c) => `${c}: ${preview.projected?.[c]?.deliverable ?? "?"} deliverable`).join(", ")}.`
      : " Tip: run a preview first to see exact recipients.";
    setConfirm({
      title: "Send to cohort",
      message: `Send this message via ${chans.join(", ")} to ${stage ? `everyone at stage “${STAGE_LABELS[stage] || stage}”` : "the whole cohort"}${preview ? ` (${preview.total} recipients)` : ""}? This dispatches immediately.${deliverableNote}`,
      confirmLabel: "Send now",
      confirmColor: "success",
      onConfirm: async () => {
        setBusy(true);
        try {
          const r = await bulkMessage(tourId, templateKey, chans, vars, filters());
          const d = r?.data || {};
          showToastSuccess(`${d.sent || 0}/${d.recipients || 0} sent`, "Bulk message");
          onSent();
        } catch (e) { showToastError("Bulk send failed", "Error"); }
        finally { setBusy(false); }
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" scrollable>
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
        <Row className="g-2 mt-1">
          <Col md={4}>
            <Label className="mb-0 small">Segment</Label>
            <Input type="select" bsSize="sm" value={segment} onChange={(e) => setSegment(e.target.value)}>
              <option value="">Everyone</option>
              <option value="docs_pending">Documents pending</option>
              <option value="payment_due">Payment outstanding</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="solo">Solo travellers</option>
            </Input>
          </Col>
          <Col md={4}><Label className="mb-0 small">City contains</Label><Input bsSize="sm" value={city} onChange={(e) => setCity(e.target.value)} /></Col>
          <Col md={4}><Label className="mb-0 small">Cluster contains</Label><Input bsSize="sm" value={cluster} onChange={(e) => setCluster(e.target.value)} /></Col>
        </Row>
        <small className="text-muted">Filters combine (AND). Use “Preview recipients” to see exactly who matches before sending.</small>
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

        {/* Dry-run preview */}
        {preview && (
          <div className="border rounded p-3 mt-3 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <strong className="small"><i className="bx bx-show me-1" />Dry run — {preview.total} recipient(s){stage ? ` at “${STAGE_LABELS[stage] || stage}”` : " (whole cohort)"}</strong>
              <span className="text-muted small">nothing sent yet</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {Object.entries(preview.projected || {}).map(([c, p]) => (
                <Badge key={c} color={!p.configured ? "soft-secondary" : p.undeliverable ? "soft-warning" : "soft-success"} className="p-2 text-capitalize">
                  {c}: {p.configured ? <>{p.deliverable} deliverable{p.undeliverable ? `, ${p.undeliverable} missing contact` : ""}</> : "channel not configured"}
                </Badge>
              ))}
            </div>
            {preview.rendered?.subject && (
              <div className="small text-muted mt-2">Sample subject (as {preview.sampleOf}): <span className="text-dark">{preview.rendered.subject}</span></div>
            )}
            <div className="mt-2" style={{ maxHeight: 180, overflowY: "auto" }}>
              <Table size="sm" className="mb-0">
                <thead><tr><th>Name</th><th>Stage</th>{(preview.channels || []).map((c) => <th key={c} className="text-capitalize">{c}</th>)}</tr></thead>
                <tbody>
                  {(preview.recipients || []).map((r) => (
                    <tr key={r.id}>
                      <td className="small">{r.fullName}<div className="text-muted" style={{ fontSize: 11 }}>{r.email || r.mobile || ""}</div></td>
                      <td className="small">{STAGE_LABELS[r.stage] || r.stage}</td>
                      {(preview.channels || []).map((c) => (
                        <td key={c}>{r.deliverable?.[c] ? <i className="bx bx-check text-success" /> : <i className="bx bx-x text-danger" title="undeliverable — missing contact or channel off" />}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Schedule for later */}
        <div className="border rounded p-2 mt-3">
          <div className="d-flex flex-wrap align-items-end gap-2">
            <div>
              <Label className="mb-0 small">Or schedule for later</Label>
              <Input type="datetime-local" bsSize="sm" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} style={{ maxWidth: 230 }} />
            </div>
            <Button size="sm" color="soft-primary" disabled={scheduling || !scheduleAt} onClick={schedule}>
              {scheduling ? <Spinner size="sm" /> : <><i className="bx bx-time me-1" />Schedule campaign</>}
            </Button>
          </div>
          {campaigns.length > 0 && (
            <div className="mt-2" style={{ maxHeight: 150, overflowY: "auto" }}>
              <Table size="sm" className="mb-0">
                <thead><tr><th>When</th><th>Template</th><th>Target</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c._id}>
                      <td className="small">{new Date(c.scheduledFor).toLocaleString("en-IN")}</td>
                      <td className="small">{(MESSAGE_TEMPLATES.find((t) => t.key === c.templateKey)?.label) || c.templateKey}</td>
                      <td className="small">{[c.stage && STAGE_LABELS[c.stage], c.segment, c.city, c.cluster].filter(Boolean).join(", ") || "all"}</td>
                      <td>
                        <Badge color={c.status === "sent" ? "soft-success" : c.status === "scheduled" ? "soft-info" : c.status === "failed" ? "soft-danger" : "soft-secondary"}>{c.status}</Badge>
                        {c.result ? <span className="text-muted small ms-1">{c.result.sent}/{c.result.recipients}</span> : null}
                      </td>
                      <td>{c.status === "scheduled" ? <i className="bx bx-trash text-danger" role="button" title="Cancel" onClick={() => dropCampaign(c)} /> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="soft-info" onClick={runPreview} disabled={previewing}>
          {previewing ? <Spinner size="sm" /> : <><i className="bx bx-show me-1" />Preview recipients</>}
        </Button>
        <Button color="success" onClick={send} disabled={busy}>{busy ? <Spinner size="sm" /> : "Send now"}</Button>
      </ModalFooter>
      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </Modal>
  );
};

/* =================== Cohort communication timeline ==================== */
const CommsLogModal = ({ isOpen, tourId, onClose, onOpenParticipant }) => {
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [template, setTemplate] = useState("");
  const [page, setPage] = useState(1);
  const [resending, setResending] = useState("");
  const limit = 50;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const r = await getCommunicationsTimeline(tourId, { page: pg, limit, channel: channel || undefined, status: status || undefined, template: template || undefined });
      setData(r?.data || null);
      setPage(pg);
    } catch (e) { showToastError(e?.response?.data?.message || "Failed to load comms log", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) { setChannel(""); setStatus(""); setTemplate(""); load(1); } /* eslint-disable-next-line */ }, [isOpen, tourId]);
  useEffect(() => { if (isOpen) load(1); /* eslint-disable-next-line */ }, [channel, status, template]);

  const resend = async (it, i) => {
    setResending(`${i}`);
    try {
      await sendMessage(it.participantId, it.templateKey, [it.channel], {});
      showToastSuccess(`Re-sent ${it.channel} to ${it.fullName}`, "Resent");
      await load(page);
    } catch (e) { showToastError(e?.response?.data?.message || "Resend failed", "Error"); }
    finally { setResending(""); }
  };

  const d = data;
  const totalPages = d ? Math.max(1, Math.ceil(d.total / limit)) : 1;
  const tmplLabel = (k) => (MESSAGE_TEMPLATES.find((t) => t.key === k)?.label) || k;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
      <ModalHeader toggle={onClose}>Communication log — whole cohort</ModalHeader>
      <ModalBody>
        {d && (
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
            {Object.entries(d.channelCounts || {}).map(([c, n]) => <Badge key={c} color="soft-info" className="p-2 text-capitalize">{c}: {n}</Badge>)}
            {Object.entries(d.statusCounts || {}).map(([s, n]) => <Badge key={s} color={s === "sent" ? "soft-success" : s === "failed" ? "soft-danger" : "soft-warning"} className="p-2 text-capitalize">{s}: {n}</Badge>)}
          </div>
        )}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <Input type="select" bsSize="sm" style={{ maxWidth: 150 }} value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="">All channels</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option>
          </Input>
          <Input type="select" bsSize="sm" style={{ maxWidth: 150 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option><option value="sent">Sent</option><option value="failed">Failed</option><option value="queued">Queued</option>
          </Input>
          <Input type="select" bsSize="sm" style={{ maxWidth: 200 }} value={template} onChange={(e) => setTemplate(e.target.value)}>
            <option value="">All templates</option>
            {MESSAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Input>
        </div>

        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !d || d.items.length === 0 ? (
          <p className="text-muted">No messages match.</p>
        ) : (
          <Table className="align-middle" responsive>
            <thead><tr><th>When</th><th>Participant</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th><th>Trigger</th><th></th></tr></thead>
            <tbody>
              {d.items.map((it, i) => (
                <tr key={i}>
                  <td className="small">{new Date(it.sentAt).toLocaleString("en-IN")}</td>
                  <td className="small"><a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(it.participantId); }}>{it.fullName}</a></td>
                  <td className="text-capitalize small">{it.channel}</td>
                  <td className="small">{tmplLabel(it.templateKey)}</td>
                  <td className="small">{it.to || "—"}</td>
                  <td><Badge color={it.status === "sent" ? "soft-success" : it.status === "failed" ? "soft-danger" : "soft-warning"}>{it.status}</Badge>{it.error ? <i className="bx bx-info-circle text-danger ms-1" title={it.error} /> : null}</td>
                  <td className="small text-capitalize">{it.trigger || "manual"}</td>
                  <td>
                    {it.status === "failed" && canEdit && (
                      <Button size="sm" color="soft-primary" disabled={resending === `${i}`} onClick={() => resend(it, i)} title="Resend this message">
                        {resending === `${i}` ? <Spinner size="sm" /> : <i className="bx bx-refresh" />}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        <span className="text-muted small me-auto">{d?.total || 0} message(s) · page {page}/{totalPages}</span>
        <Button color="light" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>Prev</Button>
        <Button color="light" disabled={page >= totalPages || loading} onClick={() => load(page + 1)}>Next</Button>
        <Button color="soft-primary" onClick={() => load(1)}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Activity timeline ========================== */
/** Turn an audited method+path into a human-readable action. */
const describeActivity = (it) => {
  const p = it.path || "";
  const m = it.method || "";
  if (p.includes("/participants/bulk-import")) return "Bulk-imported participants";
  if (p.includes("/participants/bulk-message")) return "Sent a bulk message";
  if (p.includes("/participants/bulk-visa")) return "Bulk visa scheduling";
  if (/\/participants\/[a-f0-9]{24}\/archive/.test(p)) return "Archived a participant";
  if (/\/participants\/[a-f0-9]{24}\/restore/.test(p)) return "Restored a participant";
  if (/\/participants\/[a-f0-9]{24}\/message/.test(p)) return "Sent a participant message";
  if (/\/participants\/[a-f0-9]{24}$/.test(p) && m === "PUT") return "Updated a participant";
  if (/\/participants\/[a-f0-9]{24}$/.test(p) && m === "DELETE") return "Deleted a participant";
  if (p.endsWith("/participants") && m === "POST") return "Added a participant (concierge)";
  if (p.includes("/rooming/assign")) return "Assigned rooming";
  if (p.includes("/rooming/clear")) return "Cleared rooming";
  if (p.includes("/duplicate")) return "Duplicated a tour";
  if (p.includes("/automations/run")) return "Ran due reminders";
  if (/\/expenses/.test(p)) return m === "DELETE" ? "Deleted an expense" : m === "PUT" ? "Updated an expense" : "Added an expense";
  if (p.endsWith("/tours") && m === "POST") return "Created a study tour";
  if (/\/tours\/[a-f0-9]{24}$/.test(p) && m === "PUT") return "Updated tour settings";
  if (/\/tours\/[a-f0-9]{24}$/.test(p) && m === "DELETE") return "Deleted a study tour";
  if (p.includes("/upload")) return "Uploaded a document";
  return `${m} ${p.split("?")[0].replace("/v1/educator-study-tours/admin", "")}`;
};
const ACTION_COLORS = { create: "soft-success", update: "soft-info", delete: "soft-danger", other: "soft-secondary" };

const ActivityModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("audit"); // "audit" | "jobs"
  const [items, setItems] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const load = async (pg = page) => {
    setLoading(true);
    try {
      if (view === "jobs") {
        const r = await getJobLogs({ limit });
        setJobs(r?.data?.logs || []);
      } else {
        const r = await getStudyTourActivity({ page: pg, limit });
        setItems(r?.data?.items || []);
        setTotal(Number(r?.data?.total || 0));
        setPage(pg);
      }
    } catch (e) { showToastError(e?.response?.data?.message || "Failed to load", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) load(1); /* eslint-disable-next-line */ }, [isOpen, view]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered scrollable>
      <ModalHeader toggle={onClose}>{view === "jobs" ? "Background jobs — scheduler runs" : "Activity log — who changed what"}</ModalHeader>
      <ModalBody>
        <div className="btn-group btn-group-sm mb-3">
          <Button color={view === "audit" ? "primary" : "soft-secondary"} onClick={() => setView("audit")}>Admin actions</Button>
          <Button color={view === "jobs" ? "primary" : "soft-secondary"} onClick={() => setView("jobs")}>Scheduler runs</Button>
        </div>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : view === "jobs" ? (
          jobs.length === 0 ? <p className="text-muted">No scheduler runs recorded yet. Reminder automations + scheduled campaigns log a row here when they do work.</p> : (
            <Table className="align-middle" responsive>
              <thead><tr><th>When</th><th>Type</th><th>Result</th><th>Status</th></tr></thead>
              <tbody>
                {jobs.map((j, i) => {
                  const s = j.summary || {};
                  const detail = j.type === "automation"
                    ? `${s.sent || 0} sent, ${s.skipped || 0} skipped, ${s.failed || 0} failed (${s.participants || 0} participants)`
                    : `${s.processed || 0} campaign(s)${(s.campaigns || []).length ? ` — ${s.campaigns.reduce((a, c) => a + (c.sent || 0), 0)} sent` : ""}`;
                  return (
                    <tr key={j._id || i}>
                      <td className="small">{new Date(j.createdAt).toLocaleString("en-IN")}{j.durationMs != null ? <div className="text-muted" style={{ fontSize: 11 }}>{j.durationMs}ms</div> : null}</td>
                      <td><Badge color={j.type === "automation" ? "soft-info" : "soft-primary"} className="text-capitalize">{j.type}</Badge></td>
                      <td className="small">{detail}</td>
                      <td><Badge color={j.ok ? "soft-success" : "soft-danger"}>{j.ok ? "ok" : "issues"}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )
        ) : items.length === 0 ? (
          <p className="text-muted">No activity recorded yet. Admin actions (create/update/delete/messages) appear here.</p>
        ) : (
          <Table className="align-middle" responsive>
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it._id || i}>
                  <td className="small">{new Date(it.createdAt).toLocaleString("en-IN")}</td>
                  <td className="small">{it.actorName || it.actorEmail || "—"}{it.actorName && it.actorEmail ? <div className="text-muted" style={{ fontSize: 11 }}>{it.actorEmail}</div> : null}</td>
                  <td><Badge color={ACTION_COLORS[it.action] || "soft-secondary"} className="me-1 text-capitalize">{it.action}</Badge>{describeActivity(it)}</td>
                  <td>{it.statusCode ? <Badge color={it.statusCode < 300 ? "soft-success" : "soft-danger"}>{it.statusCode}</Badge> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        {view === "audit" ? (
          <>
            <span className="text-muted small me-auto">{total} event(s) · page {page}/{totalPages}</span>
            <Button color="light" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>Prev</Button>
            <Button color="light" disabled={page >= totalPages || loading} onClick={() => load(page + 1)}>Next</Button>
          </>
        ) : <span className="text-muted small me-auto">{jobs.length} run(s)</span>}
        <Button color="soft-primary" onClick={() => load(1)}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Risk dashboard ============================= */
const SEVERITY_COLOR = { critical: "danger", high: "soft-danger", medium: "soft-warning", low: "soft-secondary" };
const LEVEL_COLOR = { critical: "danger", high: "soft-danger", medium: "soft-warning", low: "soft-secondary", none: "soft-success" };
const RiskModal = ({ isOpen, tourId, onClose, onOpenParticipant }) => {
  const [b, setB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await getRiskBoard(tourId); setB(r?.data?.board || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load risk board", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) { setCat(""); load(); } /* eslint-disable-next-line */ }, [isOpen, tourId]);

  const rows = useMemo(() => {
    const all = b?.rows || [];
    return cat ? all.filter((r) => r.reasons.some((x) => x.category === cat)) : all;
  }, [b, cat]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
      <ModalHeader toggle={onClose}>Risk dashboard — who needs attention</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !b ? <p className="text-muted">No data.</p> : (
          <>
            <Row className="g-2 mb-3">
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-danger">{b.atRisk}</h5><small className="text-muted">Need attention</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.total}</h5><small className="text-muted">Total</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-danger">{(b.levelCounts?.critical || 0) + (b.levelCounts?.high || 0)}</h5><small className="text-muted">Critical / high</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.travelDays != null ? `${b.travelDays}d` : "—"}</h5><small className="text-muted">To departure</small></div></Col>
            </Row>
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
              <span className="text-muted small">By category:</span>
              {Object.entries(b.byCategory || {}).map(([c, n]) => (
                <Badge key={c} color={cat === c ? "primary" : "soft-secondary"} className="p-2 text-capitalize" role="button" onClick={() => setCat(cat === c ? "" : c)}>{c}: {n}</Badge>
              ))}
              {cat ? <Button size="sm" color="link" onClick={() => setCat("")}>clear</Button> : null}
            </div>
            {rows.length === 0 ? <p className="text-muted">🎉 No outstanding risks in this view.</p> : (
              <Table className="align-middle" responsive>
                <thead><tr><th>#</th><th>Participant</th><th>Stage</th><th>Score</th><th>Issues</th><th>Coordinator</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td><a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(r.id); }} className="fw-semibold">{r.fullName}</a><div className="small text-muted">{r.email}</div></td>
                      <td><Badge color="soft-secondary">{STAGE_LABELS[r.stage] || r.stage}</Badge></td>
                      <td><Badge color={LEVEL_COLOR[r.level] || "soft-secondary"}>{r.score} · {r.level}</Badge></td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {r.reasons.map((x, j) => <Badge key={j} color={SEVERITY_COLOR[x.severity] || "soft-secondary"} title={x.severity}>{x.label}</Badge>)}
                        </div>
                      </td>
                      <td className="small">{r.coordinator || <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ===================== On-trip readiness board ======================== */
const READINESS_ITEMS = [
  { key: "passport", label: "Passport", abbr: "Passport" },
  { key: "visa", label: "Visa approved", abbr: "Visa" },
  { key: "insurance", label: "Insurance", abbr: "Insur." },
  { key: "flight", label: "Flight booked", abbr: "Flight" },
  { key: "hotel", label: "Hotel/room", abbr: "Hotel" },
  { key: "emergency", label: "Emergency contact", abbr: "Emerg." },
  { key: "payment", label: "Fully paid", abbr: "Paid" },
  { key: "documents", label: "Docs verified", abbr: "Docs" },
];
const ReadinessModal = ({ isOpen, tourId, onClose, onOpenParticipant }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(""); // "", "ready", "not_ready"
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await getReadinessBoard(tourId); setBoard(r?.data?.board || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load readiness", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) { load(); setFilter(""); setSearch(""); } /* eslint-disable-next-line */ }, [isOpen, tourId]);

  const rows = useMemo(() => {
    const all = board?.rows || [];
    return all.filter((r) =>
      (!filter || (filter === "ready" ? r.ready : !r.ready)) &&
      (!search || `${r.fullName} ${r.email} ${r.travelCluster}`.toLowerCase().includes(search.toLowerCase().trim())),
    );
  }, [board, filter, search]);

  const b = board;
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
      <ModalHeader toggle={onClose}>On-trip readiness — ready to fly?</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !b ? <p className="text-muted">No data.</p> : (
          <>
            <Row className="g-2 mb-3">
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-success">{b.readyCount}/{b.total}</h5><small className="text-muted">Ready to fly</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-danger">{b.notReady}</h5><small className="text-muted">Not ready</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.travelDays != null ? `${b.travelDays}d` : "—"}</h5><small className="text-muted">To departure</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.total ? Math.round((b.readyCount / b.total) * 100) : 0}%</h5><small className="text-muted">Cohort ready</small></div></Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
              {READINESS_ITEMS.map((it) => (b.itemFailCounts?.[it.key] ? (
                <Badge key={it.key} color="soft-danger" className="p-2">{it.label}: {b.itemFailCounts[it.key]} pending</Badge>
              ) : null))}
              {!READINESS_ITEMS.some((it) => b.itemFailCounts?.[it.key]) && <Badge color="soft-success" className="p-2">Everyone is fully ready 🎉</Badge>}
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
              <Input type="select" bsSize="sm" style={{ maxWidth: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All ({b.total})</option>
                <option value="not_ready">Not ready ({b.notReady})</option>
                <option value="ready">Ready ({b.readyCount})</option>
              </Input>
              <Input style={{ maxWidth: 220 }} bsSize="sm" placeholder="Search name / cluster" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {rows.length === 0 ? <p className="text-muted">No participants match.</p> : (
              <Table className="align-middle text-center" responsive>
                <thead>
                  <tr>
                    <th className="text-start">Participant</th>
                    {READINESS_ITEMS.map((it) => <th key={it.key} title={it.label}><small>{it.abbr}</small></th>)}
                    <th>Ready</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={r.ready ? "table-success" : ""}>
                      <td className="text-start">
                        <a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(r.id); }} className="fw-semibold">{r.fullName}</a>
                        {r.travelCluster ? <span className="text-muted small"> · {r.travelCluster}</span> : null}
                      </td>
                      {READINESS_ITEMS.map((it) => (
                        <td key={it.key}>
                          {r.checks[it.key]
                            ? <i className="bx bx-check-circle text-success" title={`${it.label}: ok`} />
                            : <i className="bx bx-x-circle text-danger" title={`${it.label}: pending`} />}
                        </td>
                      ))}
                      <td>
                        {r.ready
                          ? <Badge color="soft-success">Ready</Badge>
                          : <Badge color="soft-danger" title={`Missing: ${r.missing.join(", ")}`}>{r.doneCount}/{r.total}</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Rooming builder ============================= */
const EMPTY_ROOM_FORM = { hotel: "", roomNumber: "", roomType: "", checkIn: "", checkOut: "", notes: "" };

const RoomingModal = ({ isOpen, tourId, onClose, onOpenParticipant, onChanged }) => {
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState(EMPTY_ROOM_FORM);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await getRoomingBoard(tourId); setBoard(r?.data?.board || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load rooming", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (isOpen) { load(); setSelected([]); setForm(EMPTY_ROOM_FORM); setSearch(""); }
    /* eslint-disable-next-line */
  }, [isOpen, tourId]);

  const unassigned = useMemo(() => {
    const u = board?.unassigned || [];
    return u.filter((r) => !search || `${r.fullName} ${r.institutionName} ${r.preferredRoommateName}`.toLowerCase().includes(search.toLowerCase().trim()));
  }, [board, search]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const suggestType = (n) => (n <= 1 ? "single" : n === 2 ? "twin" : "triple");

  const assign = async () => {
    if (!selected.length) { showToastError("Select participants from the unassigned list", "Validation"); return; }
    if (!form.roomNumber.trim()) { showToastError("Enter a room number", "Validation"); return; }
    setBusy(true);
    try {
      await assignRoom(tourId, {
        participantIds: selected,
        hotel: form.hotel || undefined,
        roomNumber: form.roomNumber.trim(),
        roomType: form.roomType || suggestType(selected.length),
        checkIn: form.checkIn || undefined,
        checkOut: form.checkOut || undefined,
        notes: form.notes || undefined,
      });
      showToastSuccess(`Room ${form.roomNumber} assigned to ${selected.length}`, "Rooming");
      setSelected([]); setForm((f) => ({ ...f, roomNumber: "", notes: "" })); // keep hotel + dates for the next room
      await load(); onChanged && onChanged();
    } catch (e) { showToastError(e?.response?.data?.message || "Assignment failed", "Error"); }
    finally { setBusy(false); }
  };

  const clearRoom = async (ids) => {
    setBusy(true);
    try { await clearRooming(tourId, ids); await load(); onChanged && onChanged(); }
    catch (e) { showToastError("Could not clear room", "Error"); }
    finally { setBusy(false); }
  };

  const b = board;
  const prefBadge = (r) => (
    <>
      {r.occupancy ? <Badge color={r.occupancy === "single" ? "soft-secondary" : "soft-info"} className="me-1 text-capitalize">{r.occupancy}</Badge> : null}
      {r.isSolo ? <Badge color="soft-warning" className="me-1">solo</Badge> : null}
      {r.smoking ? <Badge color="soft-dark" className="me-1">smoking</Badge> : null}
      {r.accompanyingCount ? <Badge color="soft-secondary" className="me-1">+{r.accompanyingCount}</Badge> : null}
    </>
  );

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
      <ModalHeader toggle={onClose}>Rooming allocation</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !b ? <p className="text-muted">No data.</p> : (
          <>
            <Row className="g-2 mb-3">
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.assigned}/{b.total}</h5><small className="text-muted">Assigned</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.roomsCount}</h5><small className="text-muted">Rooms</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-warning">{b.unassignedCount}</h5><small className="text-muted">Unassigned</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{b.soloUnassigned}</h5><small className="text-muted">Solo unassigned</small></div></Col>
            </Row>

            {canEdit && (
              <Card className="border mb-3"><CardBody className="py-2">
                <strong className="small"><i className="bx bx-bed me-1" />Assign a room {selected.length ? `(${selected.length} selected)` : ""}</strong>
                <Row className="g-2 mt-1">
                  <Col md={3}><Label className="small mb-0">Hotel</Label><Input bsSize="sm" value={form.hotel} onChange={(e) => setForm({ ...form, hotel: e.target.value })} /></Col>
                  <Col md={2}><Label className="small mb-0">Room no.</Label><Input bsSize="sm" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} /></Col>
                  <Col md={2}><Label className="small mb-0">Type</Label>
                    <Input type="select" bsSize="sm" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
                      <option value="">{`auto (${suggestType(selected.length || 1)})`}</option>
                      <option value="single">single</option><option value="double">double</option><option value="twin">twin</option><option value="triple">triple</option>
                    </Input>
                  </Col>
                  <Col md={2}><Label className="small mb-0">Check-in</Label><Input type="date" bsSize="sm" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Col>
                  <Col md={2}><Label className="small mb-0">Check-out</Label><Input type="date" bsSize="sm" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Col>
                  <Col md={1} className="d-flex align-items-end"><Button size="sm" color="primary" className="w-100" disabled={busy || !selected.length} onClick={assign}>{busy ? <Spinner size="sm" /> : "Assign"}</Button></Col>
                </Row>
              </CardBody></Card>
            )}

            <Row>
              {/* Unassigned pool */}
              <Col md={6}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Unassigned ({unassigned.length})</h6>
                  <Input style={{ maxWidth: 180 }} bsSize="sm" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto" }} className="border rounded p-2">
                  {unassigned.length === 0 ? <p className="text-muted small mb-0">Everyone is assigned 🎉</p> : unassigned.map((r) => (
                    <div key={r.id} className={`d-flex align-items-start gap-2 p-2 rounded ${selected.includes(r.id) ? "bg-soft-primary" : ""}`}>
                      {canEdit && <input type="checkbox" className="mt-1" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />}
                      <div className="flex-grow-1">
                        <a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(r.id); }} className="fw-semibold">{r.fullName}</a>
                        <span className="text-muted small"> · {r.institutionName || "—"}{r.travelCluster ? ` · ${r.travelCluster}` : ""}</span>
                        <div className="mt-1">{prefBadge(r)}</div>
                        {r.preferredRoommateName ? <div className="small text-muted">prefers: {r.preferredRoommateName}</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Col>

              {/* Rooms */}
              <Col md={6}>
                <h6 className="mb-2">Rooms ({b.rooms.length})</h6>
                <div style={{ maxHeight: 360, overflowY: "auto" }} className="border rounded p-2">
                  {b.rooms.length === 0 ? <p className="text-muted small mb-0">No rooms assigned yet.</p> : b.rooms.map((room, ri) => (
                    <div key={ri} className="border rounded p-2 mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>Room {room.roomNumber}{room.hotel ? <span className="text-muted fw-normal"> · {room.hotel}</span> : null}</strong>
                        <span>
                          <Badge color="soft-info" className="me-2 text-capitalize">{room.roomType || `${room.occupants.length}-bed`}</Badge>
                          {canEdit && <i className="bx bx-trash text-danger" role="button" title="Clear room" onClick={() => clearRoom(room.occupants.map((o) => o.id))} />}
                        </span>
                      </div>
                      {(room.checkIn || room.checkOut) && <div className="small text-muted">{room.checkIn ? fmt(room.checkIn) : "?"} → {room.checkOut ? fmt(room.checkOut) : "?"}</div>}
                      <ul className="mb-0 mt-1 ps-3">
                        {room.occupants.map((o) => (
                          <li key={o.id} className="small">
                            <a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(o.id); }}>{o.fullName}</a>
                            {o.accompanyingCount ? <Badge color="soft-secondary" className="ms-1">+{o.accompanyingCount}</Badge> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Visa board modal =========================== */
const VISA_STATUS_META = {
  docs_pending: { label: "Docs pending", color: "soft-danger" },
  ready_to_schedule: { label: "Ready to schedule", color: "soft-warning" },
  scheduled: { label: "Scheduled", color: "soft-info" },
  approved: { label: "Approved", color: "soft-success" },
};
const RISK_META = {
  high: { label: "High", color: "danger" },
  medium: { label: "Medium", color: "soft-warning" },
  low: { label: "Low", color: "soft-secondary" },
  none: { label: "", color: "soft-success" },
};
const EMPTY_VISA_FORM = { date: "", time: "", centreName: "", centreAddress: "", referenceNumber: "", documentDeadline: "", formLink: "" };

const VisaBoardModal = ({ isOpen, tourId, onClose, onOpenParticipant, onChanged }) => {
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState(EMPTY_VISA_FORM);
  const [advanceStage, setAdvanceStage] = useState(true);
  const [notify, setNotify] = useState(false);
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [applying, setApplying] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await getVisaBoard(tourId); setBoard(r?.data?.board || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load visa board", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (isOpen) { load(); setSelected([]); setForm(EMPTY_VISA_FORM); setNotify(false); setStatusFilter(""); setRiskFilter(""); setSearch(""); }
    /* eslint-disable-next-line */
  }, [isOpen, tourId]);

  const rows = useMemo(() => {
    const all = board?.rows || [];
    return all.filter((r) =>
      (!statusFilter || r.status === statusFilter) &&
      (!riskFilter || (r.status !== "approved" && r.risk?.level === riskFilter)) &&
      (!search || `${r.fullName} ${r.email} ${r.coordinator}`.toLowerCase().includes(search.toLowerCase().trim())),
    );
  }, [board, statusFilter, riskFilter, search]);

  const selectableIds = rows.filter((r) => r.status !== "approved").map((r) => r.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id));
  const toggleAll = () => setSelected(allSelected ? [] : selectableIds);
  const toggleOne = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const apply = async () => {
    if (!selected.length) { showToastError("Select at least one participant", "Validation"); return; }
    if (!form.date && !form.documentDeadline && !form.centreName) {
      showToastError("Add at least an appointment date, centre or document deadline", "Validation"); return;
    }
    setApplying(true);
    try {
      const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
      const visaAppointment = {
        scheduled: true,
        date: form.date || undefined, time: form.time || undefined,
        centreName: form.centreName || undefined, centreAddress: form.centreAddress || undefined,
        referenceNumber: form.referenceNumber || undefined, documentDeadline: form.documentDeadline || undefined,
        formLink: form.formLink || undefined,
      };
      const r = await bulkVisaSchedule({ studyTour: tourId, participantIds: selected, visaAppointment, advanceStage, notify, channels: chans });
      const d = r?.data || {};
      showToastSuccess(`${d.updated || 0} scheduled${notify ? `, ${d.notified || 0} notified` : ""}${d.failed ? `, ${d.failed} failed` : ""}`, "Visa scheduling");
      setSelected([]); setForm(EMPTY_VISA_FORM); setNotify(false);
      await load();
      onChanged && onChanged();
    } catch (e) { showToastError(e?.response?.data?.message || "Bulk scheduling failed", "Error"); }
    finally { setApplying(false); }
  };

  const b = board;
  const expiryText = (r) => {
    if (!r.passportExpiry) return <span className="text-danger">missing</span>;
    const d = r.passportExpiryDays;
    const label = fmt(r.passportExpiry);
    if (d == null) return label;
    if (d < 0) return <span className="text-danger">{label} (expired)</span>;
    if (d < 180) return <span className="text-warning">{label} (&lt;6mo)</span>;
    return label;
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
      <ModalHeader toggle={onClose}>Visa operations board</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !b ? <p className="text-muted">No data.</p> : (
          <>
            {/* Summary */}
            <Row className="g-2 mb-3">
              {Object.entries(VISA_STATUS_META).map(([k, meta]) => (
                <Col xs={6} md={3} key={k}>
                  <div className="border rounded p-2 text-center" role="button" onClick={() => setStatusFilter(statusFilter === k ? "" : k)}
                       style={{ borderColor: statusFilter === k ? "#556ee6" : undefined, borderWidth: statusFilter === k ? 2 : 1 }}>
                    <h5 className="mb-0">{b.counts?.[k] || 0}</h5>
                    <small className="text-muted">{meta.label}</small>
                  </div>
                </Col>
              ))}
            </Row>
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
              {b.travelDays != null && <Badge color="soft-secondary" className="p-2">Travel in {b.travelDays} day(s)</Badge>}
              <Badge color="danger" className="p-2" role="button" onClick={() => setRiskFilter(riskFilter === "high" ? "" : "high")}>High risk: {b.riskCounts?.high || 0}</Badge>
              <Badge color="soft-warning" className="p-2" role="button" onClick={() => setRiskFilter(riskFilter === "medium" ? "" : "medium")}>Medium: {b.riskCounts?.medium || 0}</Badge>
              <Badge color="soft-secondary" className="p-2" role="button" onClick={() => setRiskFilter(riskFilter === "low" ? "" : "low")}>Low: {b.riskCounts?.low || 0}</Badge>
              <Input style={{ maxWidth: 220 }} bsSize="sm" placeholder="Search name / coordinator" value={search} onChange={(e) => setSearch(e.target.value)} />
              {(statusFilter || riskFilter || search) && <Button size="sm" color="link" onClick={() => { setStatusFilter(""); setRiskFilter(""); setSearch(""); }}>Clear filters</Button>}
            </div>

            {/* Bulk scheduling panel */}
            {canEdit && (
              <Card className="mb-3 border">
                <CardBody className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small"><i className="bx bx-calendar-check me-1" />Bulk schedule {selected.length ? `(${selected.length} selected)` : ""}</strong>
                    {selected.length > 0 && <Button size="sm" color="link" className="text-muted p-0" onClick={() => setSelected([])}>clear selection</Button>}
                  </div>
                  <Row className="g-2 mt-1">
                    <Col md={3}><Label className="small mb-0">Appointment date</Label><Input type="date" bsSize="sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Col>
                    <Col md={2}><Label className="small mb-0">Time</Label><Input bsSize="sm" placeholder="10:30 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Col>
                    <Col md={3}><Label className="small mb-0">Centre name</Label><Input bsSize="sm" value={form.centreName} onChange={(e) => setForm({ ...form, centreName: e.target.value })} /></Col>
                    <Col md={4}><Label className="small mb-0">Centre address</Label><Input bsSize="sm" value={form.centreAddress} onChange={(e) => setForm({ ...form, centreAddress: e.target.value })} /></Col>
                    <Col md={3}><Label className="small mb-0">Reference</Label><Input bsSize="sm" value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} /></Col>
                    <Col md={3}><Label className="small mb-0">Document deadline</Label><Input type="date" bsSize="sm" value={form.documentDeadline} onChange={(e) => setForm({ ...form, documentDeadline: e.target.value })} /></Col>
                    <Col md={6}><Label className="small mb-0">Visa form link</Label><Input bsSize="sm" value={form.formLink} onChange={(e) => setForm({ ...form, formLink: e.target.value })} /></Col>
                  </Row>
                  <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
                    <Toggle id="visaAdvance" checked={advanceStage} onChange={(e) => setAdvanceStage(e.target.checked)} label="Advance stage to Visa Scheduled" />
                    <Toggle id="visaNotify" checked={notify} onChange={(e) => setNotify(e.target.checked)} label="Notify participants" />
                    {notify && ["email", "whatsapp", "sms"].map((c) => (
                      <div className="form-check" key={c}>
                        <input className="form-check-input" type="checkbox" id={`vch-${c}`} checked={channels[c]} onChange={(e) => setChannels({ ...channels, [c]: e.target.checked })} />
                        <Label className="form-check-label text-capitalize" for={`vch-${c}`}>{c}</Label>
                      </div>
                    ))}
                    <Button size="sm" color="primary" className="ms-auto" disabled={applying || !selected.length} onClick={apply}>
                      {applying ? <Spinner size="sm" /> : <>Apply to {selected.length || 0} selected</>}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Board table */}
            {rows.length === 0 ? <p className="text-muted">No participants match these filters.</p> : (
              <Table className="align-middle" responsive>
                <thead>
                  <tr>
                    <th style={{ width: 30 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!selectableIds.length} title="Select all schedulable" /></th>
                    <th>Participant</th><th>Status</th><th>Risk</th><th>Passport expiry</th><th>Docs</th><th>Doc deadline</th><th>Appointment</th><th>Coordinator</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const sMeta = VISA_STATUS_META[r.status] || { label: r.status, color: "soft-secondary" };
                    const rMeta = RISK_META[r.risk?.level] || RISK_META.low;
                    const appt = r.visaAppointment || {};
                    return (
                      <tr key={r.id}>
                        <td>{r.status !== "approved" ? <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} /> : <i className="bx bx-check text-success" />}</td>
                        <td>
                          <a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(r.id); }} className="fw-semibold">{r.fullName}</a>
                          <div className="small text-muted">{r.email}</div>
                          {r.visaRefusal ? <Badge color="soft-danger" className="me-1">refusal history</Badge> : null}
                          {r.hasSchengenVisa ? <Badge color="soft-success">has Schengen</Badge> : null}
                        </td>
                        <td><Badge color={sMeta.color}>{sMeta.label}</Badge></td>
                        <td>
                          {r.status === "approved" ? <span className="text-muted">—</span> : (
                            <Badge color={rMeta.color} title={(r.risk?.reasons || []).join(", ")}>{rMeta.label}{r.risk?.score ? ` (${r.risk.score})` : ""}</Badge>
                          )}
                          {r.status !== "approved" && (r.risk?.reasons || []).length ? <div className="small text-muted" style={{ maxWidth: 220 }}>{r.risk.reasons.slice(0, 2).join(", ")}{r.risk.reasons.length > 2 ? "…" : ""}</div> : null}
                        </td>
                        <td className="small">{expiryText(r)}</td>
                        <td className="small">{r.docDone}/{r.docRequired} <span className="text-muted">({r.docPct}%)</span></td>
                        <td className="small">{appt.documentDeadline ? <>{fmt(appt.documentDeadline)}{r.documentDeadlineDays != null && r.documentDeadlineDays < 0 ? <span className="text-danger"> (passed)</span> : null}</> : "—"}</td>
                        <td className="small">{appt.scheduled && appt.date ? <>{fmt(appt.date)}{appt.time ? ` · ${appt.time}` : ""}<br /><span className="text-muted">{appt.centreName || ""}</span></> : <span className="text-muted">not scheduled</span>}</td>
                        <td className="small">{r.coordinator || <span className="text-muted">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ==================== Conversion funnel + time-in-stage =============== */
const ConversionModal = ({ isOpen, tourId, onClose }) => {
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await getConversionAnalytics(tourId); setC(r?.data?.conversion || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load funnel", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) load(); /* eslint-disable-next-line */ }, [isOpen, tourId]);

  const maxReached = c ? Math.max(1, ...c.funnel.map((f) => f.reached)) : 1;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered scrollable>
      <ModalHeader toggle={onClose}>Conversion funnel &amp; time-in-stage</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !c ? <p className="text-muted">No data.</p> : (
          <>
            <p className="small text-muted">{c.total} participant(s){c.cancelled ? ` · ${c.cancelled} cancelled` : ""}. "Reached" counts anyone who ever got to that stage; "avg days" is the typical time before moving on.</p>
            <Table className="align-middle">
              <thead><tr><th>Stage</th><th style={{ width: "40%" }}>Reached</th><th className="text-end">Now</th><th className="text-end">Conv. %</th><th className="text-end">Avg days</th></tr></thead>
              <tbody>
                {c.funnel.map((f) => (
                  <tr key={f.stage}>
                    <td>{STAGE_LABELS[f.stage] || f.stage}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 8 }}>
                          <div className="progress-bar bg-primary" style={{ width: `${Math.round((f.reached / maxReached) * 100)}%` }} />
                        </div>
                        <span className="small fw-semibold">{f.reached}</span>
                      </div>
                    </td>
                    <td className="text-end">{f.current}</td>
                    <td className="text-end">{f.conversionFromPrev == null ? "—" : <Badge color={f.conversionFromPrev >= 70 ? "soft-success" : f.conversionFromPrev >= 40 ? "soft-warning" : "soft-danger"}>{f.conversionFromPrev}%</Badge>}</td>
                    <td className="text-end small">{f.avgDaysInStage == null ? "—" : `${f.avgDaysInStage}d`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Finance report ============================= */
const FinanceModal = ({ isOpen, tourId, onClose }) => {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await getExpenseSummary(tourId); setS(r?.data?.summary || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load finance report", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) load(); /* eslint-disable-next-line */ }, [isOpen, tourId]);

  const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const catLabel = (key) => key || "uncategorised";

  const exportCsv = () => {
    if (!s) return;
    const rows = [
      ["Metric", "Value"],
      ["Revenue quoted", s.revenueQuoted], ["Revenue collected", s.revenueCollected],
      ["Outstanding", s.outstanding], ["Collection rate %", s.collectionRate],
      ["Total spent", s.totalSpent], ["Extras spent", s.extrasSpent], ["Reimbursable", s.reimbursable],
      ["Margin vs collected", s.marginVsCollected], ["Margin % vs collected", s.marginPctVsCollected],
      ["Margin vs quoted", s.marginVsQuoted], ["Cost per head", s.costPerHead], ["Revenue per head", s.revenuePerHead],
      ["Participants", s.participants],
      [], ["Expense category", "Amount"],
      ...(s.byCategoryDetailed || []).map((c) => [catLabel(c._id), c.total]),
    ];
    const csv = rows.map((r) => r.map((v) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "study-tour-finance.csv"; a.click();
    URL.revokeObjectURL(a.href);
  };

  const maxCat = s ? Math.max(1, ...(s.byCategoryDetailed || []).map((c) => c.total)) : 1;
  const marginPos = s ? s.marginVsCollected >= 0 : true;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" centered scrollable>
      <ModalHeader toggle={onClose}>Financial report</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !s ? <p className="text-muted">No data.</p> : (
          <>
            <h6 className="text-muted">Revenue</h6>
            <Row className="g-2 mb-3">
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{money(s.revenueQuoted)}</h5><small className="text-muted">Quoted</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-success">{money(s.revenueCollected)}</h5><small className="text-muted">Collected</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-warning">{money(s.outstanding)}</h5><small className="text-muted">Outstanding</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{s.collectionRate}%</h5><small className="text-muted">Collection rate</small></div></Col>
            </Row>

            <h6 className="text-muted">Costs &amp; margin</h6>
            <Row className="g-2 mb-3">
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{money(s.totalSpent)}</h5><small className="text-muted">Total spent</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className={`mb-0 ${marginPos ? "text-success" : "text-danger"}`}>{money(s.marginVsCollected)}</h5><small className="text-muted">Margin (vs collected)</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className={`mb-0 ${marginPos ? "text-success" : "text-danger"}`}>{s.marginPctVsCollected}%</h5><small className="text-muted">Margin %</small></div></Col>
              <Col xs={6} md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{money(s.costPerHead)}</h5><small className="text-muted">Cost / head</small></div></Col>
            </Row>
            <p className="small text-muted">
              {s.participants} participant(s) · revenue/head {money(s.revenuePerHead)} · extras {money(s.extrasSpent)} · reimbursable {money(s.reimbursable)} · margin vs quoted {money(s.marginVsQuoted)}
            </p>

            <h6 className="text-muted mt-3">Expenses by category</h6>
            {(s.byCategoryDetailed || []).length === 0 ? <p className="text-muted small">No expenses recorded.</p> : (
              <div>
                {s.byCategoryDetailed.map((c) => (
                  <div key={c._id} className="mb-2">
                    <div className="d-flex justify-content-between small"><span className="text-capitalize">{catLabel(c._id)} <span className="text-muted">({c.count})</span></span><span className="fw-semibold">{money(c.total)}</span></div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar bg-primary" style={{ width: `${Math.round((c.total / maxCat) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-secondary" onClick={exportCsv} disabled={!s}><i className="bx bx-download me-1" />Export CSV</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ===================== Outstanding payments modal ===================== */
const BUCKET_META = {
  current: { label: "Current / not overdue", color: "soft-secondary" },
  d1_7: { label: "Overdue 1–7 days", color: "soft-warning" },
  d8_30: { label: "Overdue 8–30 days", color: "soft-danger" },
  d30_plus: { label: "Overdue 30+ days", color: "danger" },
};
const PaymentsModal = ({ isOpen, tourId, onClose, onOpenParticipant }) => {
  const { can } = usePermissions();
  const canEdit = can(ACTIONS.CAN_EDIT, MODULES.STUDY_TOUR_PERMS);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remindingId, setRemindingId] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await getPaymentsReport(tourId); setReport(r?.data?.report || null); }
    catch (e) { showToastError(e?.response?.data?.message || "Failed to load payments", "Error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isOpen) load(); /* eslint-disable-next-line */ }, [isOpen, tourId]);

  const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const remind = async (row) => {
    setRemindingId(row.id);
    try {
      await sendMessage(row.id, "payment_instructions", ["email"]);
      showToastSuccess(`Reminder sent to ${row.fullName}`, "Payment reminder");
    } catch (e) { showToastError(e?.response?.data?.message || "Could not send reminder", "Error"); }
    finally { setRemindingId(""); }
  };

  const r = report;
  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" centered>
      <ModalHeader toggle={onClose}>Outstanding payments</ModalHeader>
      <ModalBody>
        {loading ? <div className="text-center py-4"><Spinner color="primary" /></div> : !r ? (
          <p className="text-muted">No data.</p>
        ) : (
          <>
            <Row className="g-2 mb-3">
              <Col md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{money(r.totalOutstanding)}</h5><small className="text-muted">Total outstanding</small></div></Col>
              <Col md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{r.participantsOwing}</h5><small className="text-muted">Participants owing</small></div></Col>
              <Col md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0 text-danger">{r.overdueCount}</h5><small className="text-muted">With overdue dues</small></div></Col>
              <Col md={3}><div className="border rounded p-2 text-center"><h5 className="mb-0">{money(r.buckets?.d30_plus)}</h5><small className="text-muted">30+ days overdue</small></div></Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {Object.entries(BUCKET_META).map(([k, meta]) => (
                <Badge key={k} color={meta.color} className="p-2">
                  {meta.label}: <strong>{money(r.buckets?.[k])}</strong>
                </Badge>
              ))}
            </div>

            {r.rows.length === 0 ? <p className="text-muted">🎉 Everyone is fully paid — nothing outstanding.</p> : (
              <Table className="align-middle" responsive>
                <thead><tr><th>Participant</th><th>Stage</th><th className="text-end">Quoted</th><th className="text-end">Paid</th><th className="text-end">Outstanding</th><th>Next due</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <a href="#!" onClick={(e) => { e.preventDefault(); onOpenParticipant(row.id); }}>{row.fullName}</a>
                        <div className="small text-muted">{row.email}</div>
                      </td>
                      <td><Badge color="soft-secondary">{STAGE_LABELS[row.stage] || row.stage}</Badge></td>
                      <td className="text-end">{money(row.quoted)}</td>
                      <td className="text-end">{money(row.paid)}</td>
                      <td className="text-end fw-semibold">{money(row.outstanding)}</td>
                      <td>{row.nextDue ? <span className="small">{row.nextDue.label} · {money(row.nextDue.amount)}<br />{row.nextDue.dueDate ? fmt(row.nextDue.dueDate) : ""}</span> : <span className="text-muted small">{row.hasSchedule ? "—" : "no schedule"}</span>}</td>
                      <td>{row.overdueDays > 0 ? <Badge color={row.overdueDays > 30 ? "danger" : "soft-danger"}>{row.overdueDays}d overdue</Badge> : <Badge color="soft-success">on track</Badge>}</td>
                      <td className="text-end">
                        {canEdit && (
                          <Button size="sm" color="soft-primary" disabled={remindingId === row.id} onClick={() => remind(row)}>
                            {remindingId === row.id ? <Spinner size="sm" /> : <><i className="bx bx-envelope me-1" />Remind</>}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Close</Button>
        <Button color="soft-primary" onClick={load}><i className="bx bx-refresh me-1" />Refresh</Button>
      </ModalFooter>
    </Modal>
  );
};

/* ========================= Expenses modal ============================== */
const ExpensesModal = ({ isOpen, tourId, onClose }) => {
  const { can } = usePermissions();
  const canDelete = can(ACTIONS.CAN_DELETE, MODULES.STUDY_TOUR_PERMS);
  const [confirm, setConfirm] = useState(null);
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
  const remove = (x) => setConfirm({
    title: "Delete expense",
    message: `Delete “${x.title || "this expense"}” (${`₹${Number(x.amount || 0).toLocaleString("en-IN")}`})? This cannot be undone.`,
    confirmLabel: "Delete expense",
    onConfirm: async () => {
      try {
        await deleteExpense(x._id);
        if (editingId === x._id) { setEditingId(""); setF({ category: "hotel", status: "incurred" }); }
        load();
      } catch (e) { showToastError("Delete failed", "Error"); throw e; }
    },
  });

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
                    {canDelete && (
                      <Button size="sm" color="soft-danger" onClick={() => remove(x)}><i className="bx bx-trash" /></Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter><Button color="light" onClick={onClose}>Close</Button></ModalFooter>
      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
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
  const [visits, setVisits] = useState([]);
  const [pub, setPub] = useState({ heroTagline: "", highlights: "", eligibility: "", priceNote: "", cancellationPolicy: "", faqs: [] });
  const [msgOverrides, setMsgOverrides] = useState({});
  const [letters, setLetters] = useState({});
  const [letterUploading, setLetterUploading] = useState("");
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
        capacity: tour.capacity || "",
        waitlistEnabled: !!tour.waitlistEnabled,
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
      setVisits((tour.visitPartners || []).map((v) => ({ ...v, date: inputDate(v.date) })));
      setMsgOverrides(tour.messageOverrides || {});
      setLetters(tour.letterSettings || {});
      const pc = tour.publicContent || {};
      setPub({
        heroTagline: pc.heroTagline || "", highlights: (pc.highlights || []).join("\n"),
        eligibility: pc.eligibility || "", priceNote: pc.priceNote || "",
        cancellationPolicy: pc.cancellationPolicy || "", faqs: pc.faqs || [],
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
        capacity: numberOrUndefined(form.capacity),
        waitlistEnabled: !!form.waitlistEnabled,
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
        visitPartners: visits.filter((v) => v.name).map((v) => ({ ...v, date: v.date || undefined })),
        messageOverrides: msgOverrides,
        letterSettings: letters,
        publicContent: {
          heroTagline: pub.heroTagline || undefined,
          highlights: multilineToList(pub.highlights),
          eligibility: pub.eligibility || undefined,
          priceNote: pub.priceNote || undefined,
          cancellationPolicy: pub.cancellationPolicy || undefined,
          faqs: (pub.faqs || []).filter((f) => f.q || f.a),
        },
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
  const setVisitField = (idx, field, value) => setVisits((vs) => vs.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  const addVisit = () => setVisits((vs) => [...vs, { name: "", type: "School", status: "proposed" }]);
  const removeVisit = (idx) => setVisits((vs) => vs.filter((_, i) => i !== idx));

  // Inline render fn (not a nested component) so inputs keep focus while typing.
  const renderVisitBuilder = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">Schools, universities and speaker sessions being visited.</small>
        <Button size="sm" color="soft-primary" onClick={addVisit}><i className="bx bx-plus" /> Add visit</Button>
      </div>
      {visits.length === 0 ? <small className="text-muted">No visits added yet.</small> : null}
      {visits.map((v, idx) => (
        <div key={idx} className="border rounded p-2 mt-2">
          <Row className="g-2">
            <Col md={4}><Label className="mb-0 small">Name</Label><Input bsSize="sm" placeholder="e.g. Helsinki Int’l School" value={v.name} onChange={(e) => setVisitField(idx, "name", e.target.value)} /></Col>
            <Col md={2}><Label className="mb-0 small">Type</Label>
              <Input type="select" bsSize="sm" value={v.type || "School"} onChange={(e) => setVisitField(idx, "type", e.target.value)}>
                <option>School</option><option>University</option><option>Institute</option><option>Speaker session</option><option>Other</option>
              </Input>
            </Col>
            <Col md={3}><Label className="mb-0 small">Contact person</Label><Input bsSize="sm" value={v.contactPerson || ""} onChange={(e) => setVisitField(idx, "contactPerson", e.target.value)} /></Col>
            <Col md={3}><Label className="mb-0 small">Status</Label>
              <Input type="select" bsSize="sm" value={v.status || "proposed"} onChange={(e) => setVisitField(idx, "status", e.target.value)}>
                <option value="proposed">Proposed</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option>
              </Input>
            </Col>
            <Col md={3}><Label className="mb-0 small">Email</Label><Input bsSize="sm" value={v.email || ""} onChange={(e) => setVisitField(idx, "email", e.target.value)} /></Col>
            <Col md={3}><Label className="mb-0 small">Phone</Label><Input bsSize="sm" value={v.phone || ""} onChange={(e) => setVisitField(idx, "phone", e.target.value)} /></Col>
            <Col md={2}><Label className="mb-0 small">Date</Label><Input type="date" bsSize="sm" value={v.date || ""} onChange={(e) => setVisitField(idx, "date", e.target.value)} /></Col>
            <Col md={2}><Label className="mb-0 small">Time</Label><Input bsSize="sm" placeholder="10:00" value={v.time || ""} onChange={(e) => setVisitField(idx, "time", e.target.value)} /></Col>
            <Col md={2} className="d-flex align-items-end"><i className="bx bx-trash text-danger fs-5" role="button" onClick={() => removeVisit(idx)} /></Col>
            <Col md={12}><Label className="mb-0 small">Address / notes</Label><Input bsSize="sm" value={v.address || ""} onChange={(e) => setVisitField(idx, "address", e.target.value)} /></Col>
          </Row>
        </div>
      ))}
    </div>
  );

  const setFaq = (idx, field, value) => setPub((p) => ({ ...p, faqs: p.faqs.map((f, i) => (i === idx ? { ...f, [field]: value } : f)) }));
  const addFaq = () => setPub((p) => ({ ...p, faqs: [...(p.faqs || []), { q: "", a: "" }] }));
  const removeFaq = (idx) => setPub((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== idx) }));

  const renderPublicContent = () => (
    <Row className="g-3">
      <Col md={12}><Label>Hero tagline</Label><Input value={pub.heroTagline} onChange={(e) => setPub({ ...pub, heroTagline: e.target.value })} placeholder="One punchy line under the title" /></Col>
      <Col md={12}><Label>Highlights <small className="text-muted">(one per line)</small></Label><Input type="textarea" rows={4} value={pub.highlights} onChange={(e) => setPub({ ...pub, highlights: e.target.value })} placeholder={"Visit 6 Finnish schools\nMeet education leaders\nCertificate of participation"} /></Col>
      <Col md={12}><Label>Eligibility / who can apply</Label><Input type="textarea" rows={2} value={pub.eligibility} onChange={(e) => setPub({ ...pub, eligibility: e.target.value })} /></Col>
      <Col md={6}><Label>Price note</Label><Input value={pub.priceNote} onChange={(e) => setPub({ ...pub, priceNote: e.target.value })} placeholder="e.g. ₹2,40,000 per person on twin-sharing; excludes visa fee" /></Col>
      <Col md={6}><Label>Cancellation policy</Label><Input type="textarea" rows={2} value={pub.cancellationPolicy} onChange={(e) => setPub({ ...pub, cancellationPolicy: e.target.value })} /></Col>
      <Col md={12}>
        <div className="d-flex justify-content-between align-items-center">
          <Label className="mb-0">FAQs</Label>
          <Button size="sm" color="soft-primary" onClick={addFaq}><i className="bx bx-plus" /> Add FAQ</Button>
        </div>
        {(pub.faqs || []).map((f, idx) => (
          <div key={idx} className="border rounded p-2 mt-2">
            <div className="d-flex gap-2">
              <Input bsSize="sm" placeholder="Question" value={f.q} onChange={(e) => setFaq(idx, "q", e.target.value)} />
              <i className="bx bx-trash text-danger fs-5" role="button" onClick={() => removeFaq(idx)} />
            </div>
            <Input bsSize="sm" type="textarea" rows={2} className="mt-1" placeholder="Answer" value={f.a} onChange={(e) => setFaq(idx, "a", e.target.value)} />
          </div>
        ))}
      </Col>
      <Col md={12}><small className="text-muted">These render on the public registration page (highlights, what&apos;s included from Pricing, eligibility, FAQ, cancellation).</small></Col>
    </Row>
  );

  const setOverride = (key, field, value) => setMsgOverrides((o) => ({ ...o, [key]: { ...(o[key] || {}), [field]: value } }));

  const renderTemplateEditor = () => (
    <div>
      <p className="text-muted small mb-2">
        Override the email <strong>subject</strong> and the <strong>WhatsApp/SMS</strong> text per template (blank = use the built-in default).
        Placeholders: <code>{"{{name}}"}</code>, <code>{"{{tour}}"}</code>. The rich email body keeps its built-in design.
      </p>
      {MESSAGE_TEMPLATES.map((t) => {
        const ov = msgOverrides[t.key] || {};
        return (
          <div key={t.key} className="border rounded p-2 mb-2">
            <strong className="small">{t.label}</strong>
            <Row className="g-2 mt-1">
              <Col md={12}><Label className="mb-0 small">Email subject</Label><Input bsSize="sm" placeholder="(default)" value={ov.subject || ""} onChange={(e) => setOverride(t.key, "subject", e.target.value)} /></Col>
              <Col md={6}><Label className="mb-0 small">WhatsApp text</Label><Input bsSize="sm" type="textarea" rows={2} placeholder="(default)" value={ov.whatsapp || ""} onChange={(e) => setOverride(t.key, "whatsapp", e.target.value)} /></Col>
              <Col md={6}><Label className="mb-0 small">SMS text</Label><Input bsSize="sm" type="textarea" rows={2} placeholder="(default)" value={ov.sms || ""} onChange={(e) => setOverride(t.key, "sms", e.target.value)} /></Col>
            </Row>
          </div>
        );
      })}
    </div>
  );

  const uploadLetterAsset = async (field, fileList) => {
    const f = Array.from(fileList || [])[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { showToastError("Image must be under 5MB", "Too large"); return; }
    setLetterUploading(field);
    try {
      const r = await uploadDocument(f);
      if (r?.data?.url) setLetters((l) => ({ ...l, [field]: r.data.url }));
      showToastSuccess("Uploaded — remember to Save", "Uploaded");
    } catch (e) { showToastError("Upload failed", "Error"); }
    finally { setLetterUploading(""); }
  };

  const renderLetterEditor = () => (
    <Row className="g-3">
      <Col md={12}><small className="text-muted">Customise the letterhead and the visa cover letter used for all generated documents (cover letter, invitation, NOC, checklist).</small></Col>
      <Col md={6}>
        <Label>Logo</Label>
        <div className="d-flex align-items-center gap-2">
          <Label className="btn btn-soft-primary btn-sm mb-0">
            {letterUploading === "logoUrl" ? <Spinner size="sm" /> : <><i className="bx bx-upload me-1" />Upload logo</>}
            <input type="file" hidden accept="image/*" onChange={(e) => { uploadLetterAsset("logoUrl", e.target.files); e.target.value = ""; }} />
          </Label>
          {letters.logoUrl ? <a href={letters.logoUrl} target="_blank" rel="noreferrer" className="small">view</a> : <span className="text-muted small">none</span>}
          {letters.logoUrl && <i className="bx bx-x text-danger" role="button" onClick={() => setLetters({ ...letters, logoUrl: "" })} />}
        </div>
      </Col>
      <Col md={6}>
        <Label>Letterhead banner <small className="text-muted">(full-width image, overrides logo)</small></Label>
        <div className="d-flex align-items-center gap-2">
          <Label className="btn btn-soft-primary btn-sm mb-0">
            {letterUploading === "letterheadUrl" ? <Spinner size="sm" /> : <><i className="bx bx-upload me-1" />Upload letterhead</>}
            <input type="file" hidden accept="image/*" onChange={(e) => { uploadLetterAsset("letterheadUrl", e.target.files); e.target.value = ""; }} />
          </Label>
          {letters.letterheadUrl ? <a href={letters.letterheadUrl} target="_blank" rel="noreferrer" className="small">view</a> : <span className="text-muted small">none</span>}
          {letters.letterheadUrl && <i className="bx bx-x text-danger" role="button" onClick={() => setLetters({ ...letters, letterheadUrl: "" })} />}
        </div>
      </Col>
      <Col md={6}><Label>Signatory name</Label><Input value={letters.signatoryName || ""} onChange={(e) => setLetters({ ...letters, signatoryName: e.target.value })} placeholder="e.g. Priya Sharma" /></Col>
      <Col md={6}><Label>Signatory title</Label><Input value={letters.signatoryTitle || ""} onChange={(e) => setLetters({ ...letters, signatoryTitle: e.target.value })} placeholder="e.g. Programme Director, TickYourList" /></Col>
      <Col md={12}>
        <Label>Cover letter body <small className="text-muted">(blank = built-in default)</small></Label>
        <Input type="textarea" rows={8} value={letters.coverLetterBody || ""} onChange={(e) => setLetters({ ...letters, coverLetterBody: e.target.value })}
               placeholder={"To,\nThe Visa Officer, Embassy of {{country}}\n\nRespected Sir/Madam,\n\nI, {{name}} ({{designation}} at {{institution}}, passport {{passport}}), am applying for a visa to attend {{tour}} from {{dates}}...\n\nThanking you,"} />
        <small className="text-muted">Placeholders: <code>{"{{name}}"}</code> <code>{"{{salutation}}"}</code> <code>{"{{tour}}"}</code> <code>{"{{country}}"}</code> <code>{"{{dates}}"}</code> <code>{"{{passport}}"}</code> <code>{"{{institution}}"}</code> <code>{"{{designation}}"}</code></small>
      </Col>
      <Col md={12}><Label>Footer note</Label><Input value={letters.footerNote || ""} onChange={(e) => setLetters({ ...letters, footerNote: e.target.value })} placeholder="Shown at the bottom of every letter" /></Col>
    </Row>
  );

  const setItineraryField = (idx, field, value) => {
    setItinerary((days) => days.map((day, i) => i === idx ? { ...day, [field]: value } : day));
  };
  const addItineraryDay = () => setItinerary((days) => ([...days, { day: days.length + 1, title: "", city: "", details: "" }]));
  const removeItineraryDay = (idx) => setItinerary((days) => days.filter((_, i) => i !== idx));

  const toggleDocType = (list, idx, ft) => setDocs((d) => ({
    ...d,
    [list]: d[list].map((it, i) => {
      if (i !== idx) return it;
      const cur = it.acceptTypes || [];
      return { ...it, acceptTypes: cur.includes(ft) ? cur.filter((x) => x !== ft) : [...cur, ft] };
    }),
  }));

  // NOTE: rendered via a function call (not <DocBuilder/>) so the inputs don't
  // remount on every keystroke — that nested-component pattern was eating focus.
  const renderDocBuilder = (list, title) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h6 className="mb-0">{title}</h6>
        <Button size="sm" color="soft-primary" onClick={() => addDoc(list)}><i className="bx bx-plus" /> Add field</Button>
      </div>
      {(docs[list] || []).length === 0 ? <small className="text-muted">No documents yet — add the ones participants must upload.</small> : null}
      {(docs[list] || []).map((it, idx) => (
        <div key={it.key || idx} className="border rounded p-2 mt-2">
          <Row className="g-2 align-items-center">
            <Col md={4}><Label className="mb-0 small">Label</Label><Input bsSize="sm" placeholder="e.g. Passport (front & back)" value={it.label} onChange={(e) => setDocField(list, idx, "label", e.target.value)} /></Col>
            <Col md={4}><Label className="mb-0 small">Helper text</Label><Input bsSize="sm" placeholder="Instructions shown to the uploader" value={it.description || ""} onChange={(e) => setDocField(list, idx, "description", e.target.value)} /></Col>
            <Col md={2}><Label className="mb-0 small">Max size (MB)</Label><Input bsSize="sm" type="number" placeholder="15" value={it.maxSizeMB || ""} onChange={(e) => setDocField(list, idx, "maxSizeMB", e.target.value ? Number(e.target.value) : undefined)} /></Col>
            <Col md={2} className="d-flex align-items-end justify-content-between">
              <Toggle id={`req-${list}-${idx}`} checked={it.required} onChange={(e) => setDocField(list, idx, "required", e.target.checked)} label="Required" />
              <i className="bx bx-trash text-danger fs-5" role="button" title="Remove" onClick={() => removeDoc(list, idx)} />
            </Col>
          </Row>
          <div className="d-flex flex-wrap align-items-center gap-1 mt-2">
            <span className="text-muted small me-1">Allowed file types:</span>
            {DOC_FILE_TYPES.map((ft) => {
              const on = (it.acceptTypes || []).includes(ft);
              return (
                <Button key={ft} size="sm" color={on ? "primary" : "soft-secondary"} className="py-0 px-2 text-uppercase"
                        style={{ fontSize: 11 }} onClick={() => toggleDocType(list, idx, ft)}>
                  {ft}
                </Button>
              );
            })}
            {(it.acceptTypes || []).length === 0 ? <small className="text-muted ms-1">any common doc/image</small> : null}
            <span className="ms-3">
              <Toggle id={`mul-${list}-${idx}`} checked={it.multiple} onChange={(e) => setDocField(list, idx, "multiple", e.target.checked)} label="Allow multiple files" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  if (!tour) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>Tour settings — {tour.name}</ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          {["details", "pricing", "itinerary", "visits", "publicpage", "bank", "coordinators", "documents", "templates", "letters"].map((t) => (
            <NavItem key={t}><NavLink className={classnames({ active: tab === t })} role="button" onClick={() => setTab(t)}><span className="text-capitalize">{t === "bank" ? "Bank details" : t === "publicpage" ? "Public page" : t === "templates" ? "Message templates" : t === "letters" ? "Letters & letterhead" : t}</span></NavLink></NavItem>
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

              <Col md={4}><Label>Capacity <small className="text-muted">(0 = unlimited)</small></Label><Input type="number" value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 30" /></Col>
              <Col md={4} className="d-flex align-items-end">
                <Toggle id="waitlistEnabled" checked={form.waitlistEnabled} onChange={(e) => setForm({ ...form, waitlistEnabled: e.target.checked })} label="Waitlist when full" />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <small className="text-muted">When capacity is reached, the public form {form.waitlistEnabled ? "adds new sign-ups to a waitlist" : "closes registration"}.</small>
              </Col>

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

          <TabPane tabId="visits">
            {renderVisitBuilder()}
          </TabPane>

          <TabPane tabId="publicpage">
            {renderPublicContent()}
          </TabPane>

          <TabPane tabId="templates">
            {renderTemplateEditor()}
          </TabPane>

          <TabPane tabId="letters">
            {renderLetterEditor()}
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
            {renderDocBuilder("individual", "Individual applicant")}
            {renderDocBuilder("schoolSponsored", "School-sponsored")}
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
