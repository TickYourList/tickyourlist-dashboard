import { get, post } from "./api_helper";

// ─── Audit log ───────────────────────────────────────────────────────────────
export const getAuditLog = (params = {}) => get(`/v1/admin/audit-log`, { params });

// ─── Agents ──────────────────────────────────────────────────────────────────
export const getAgents = () => get(`/v1/admin/agents`);
export const grantAgentByEmail = ({ email, commissionPct }) =>
  post(`/v1/admin/agents/grant-by-email`, { email, commissionPct });
export const revokeAgent = (customerId) => post(`/v1/admin/agents/${customerId}/revoke`, {});

// ─── Gift cards / waitlist ───────────────────────────────────────────────────
export const getGiftCards = (params = {}) => get(`/v1/admin/ops/gift-cards`, { params });
export const getWaitlist = (params = {}) => get(`/v1/admin/ops/waitlist`, { params });

// ─── Booking amendment (admin) ───────────────────────────────────────────────
export const amendBooking = (bookingId, { newDate, newStartTime }) =>
  post(`/v1/tyltourcustomerbooking/booking/${bookingId}/amend`, { newDate, newStartTime });
