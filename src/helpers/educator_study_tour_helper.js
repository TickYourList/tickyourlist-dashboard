import { get, post, put, del, postFormData } from "./api_helper";

const BASE = "/v1/educator-study-tours";

/* ----------------------------- Tours ----------------------------------- */
export const getStudyTours = () => get(`${BASE}/admin/tours`);
export const getStudyTour = (id) => get(`${BASE}/admin/tours/${id}`);
export const createStudyTour = (data) => post(`${BASE}/admin/tours`, data);
export const updateStudyTour = (id, data) => put(`${BASE}/admin/tours/${id}`, data);
export const deleteStudyTour = (id) => del(`${BASE}/admin/tours/${id}`);

/* -------------------------- Participants -------------------------------- */
export const getParticipants = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
  ).toString();
  return get(`${BASE}/admin/participants${qs ? `?${qs}` : ""}`);
};
export const getParticipant = (id) => get(`${BASE}/admin/participants/${id}`);
export const createParticipant = (data) => post(`${BASE}/admin/participants`, data);
export const updateParticipant = (id, data) => put(`${BASE}/admin/participants/${id}`, data);
export const deleteParticipant = (id) => del(`${BASE}/admin/participants/${id}`);

/* --------------------------- Messaging ---------------------------------- */
export const previewMessage = (id, templateKey, vars = {}) =>
  post(`${BASE}/admin/participants/${id}/message/preview`, { templateKey, vars });
export const sendMessage = (id, templateKey, channels, vars = {}) =>
  post(`${BASE}/admin/participants/${id}/message`, { templateKey, channels, vars });
export const bulkMessage = (studyTour, templateKey, channels, vars = {}, stage) =>
  post(`${BASE}/admin/participants/bulk-message`, { studyTour, templateKey, channels, vars, stage });

/* --------------------- Advanced: weather / ops -------------------------- */
export const getChannelAvailability = () => get(`${BASE}/admin/channels`);
export const getTourWeather = (id, place, date) =>
  get(`${BASE}/admin/tours/${id}/weather${place || date ? `?${new URLSearchParams({ ...(place ? { place } : {}), ...(date ? { date } : {}) })}` : ""}`);
export const getTourAnalytics = (id) => get(`${BASE}/admin/tours/${id}/analytics`);
export const getManifest = (id, type) => get(`${BASE}/admin/tours/${id}/manifest?type=${type}`);
export const manifestCsvUrl = (id, type) => `${BASE}/admin/tours/${id}/manifest?type=${type}&format=csv`;
export const runAutomations = (studyTour) => post(`${BASE}/admin/automations/run`, { studyTour });
export const bulkImportParticipants = (studyTour, participants) =>
  post(`${BASE}/admin/participants/bulk-import`, { studyTour, participants });
export const uploadDocument = (file) => {
  const fd = new FormData();
  fd.append("document", file);
  return postFormData(`${BASE}/admin/upload`, fd);
};
export const getDefaultDocChecklist = () => get(`${BASE}/admin/default-doc-checklist`);

/* --------------------------- Expenses ----------------------------------- */
export const getExpenses = (tourId, params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return get(`${BASE}/admin/tours/${tourId}/expenses${qs ? `?${qs}` : ""}`);
};
export const getExpenseSummary = (tourId) => get(`${BASE}/admin/tours/${tourId}/expenses/summary`);
export const addExpense = (tourId, data) => post(`${BASE}/admin/tours/${tourId}/expenses`, data);
export const updateExpense = (id, data) => put(`${BASE}/admin/expenses/${id}`, data);
export const deleteExpense = (id) => del(`${BASE}/admin/expenses/${id}`);

export const EXPENSE_CATEGORIES = [
  "flights", "hotel", "visa", "transport", "meals", "sightseeing",
  "insurance", "guide", "gifts", "misc", "refund",
];

/* --------------------------- Constants ---------------------------------- */
export const PARTICIPANT_STAGES = [
  "registered",
  "quoted",
  "paid",
  "documents_pending",
  "visa_scheduled",
  "visa_approved",
  "flight_booked",
  "ready",
  "travelling",
  "completed",
  "cancelled",
];

export const STAGE_LABELS = {
  registered: "Registered",
  quoted: "Quoted",
  paid: "Paid",
  documents_pending: "Documents",
  visa_scheduled: "Visa Scheduled",
  visa_approved: "Visa Approved",
  flight_booked: "Flight Booked",
  ready: "Ready",
  travelling: "Travelling",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STAGE_COLORS = {
  registered: "secondary",
  quoted: "info",
  paid: "primary",
  documents_pending: "warning",
  visa_scheduled: "warning",
  visa_approved: "info",
  flight_booked: "primary",
  ready: "success",
  travelling: "success",
  completed: "success",
  cancelled: "danger",
};

export const MESSAGE_TEMPLATES = [
  { key: "registration_received", label: "Registration Received" },
  { key: "payment_instructions", label: "Payment + Bank Details" },
  { key: "document_request", label: "Document Request" },
  { key: "visa_appointment", label: "Visa Appointment" },
  { key: "flight_confirmation", label: "Flight Confirmation" },
  { key: "weather_packing", label: "Weather / Packing / Attire" },
  { key: "sightseeing_extension", label: "Sightseeing / Extension" },
  { key: "thank_you", label: "Thank You / Feedback" },
  { key: "custom", label: "Custom Message" },
];
