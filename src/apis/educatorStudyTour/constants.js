export const EDUCATOR_STUDY_TOUR_BASE = "/v1/educator-study-tours";

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

export const EXPENSE_CATEGORIES = [
  "flights",
  "hotel",
  "visa",
  "transport",
  "meals",
  "sightseeing",
  "insurance",
  "guide",
  "gifts",
  "misc",
  "refund",
];
