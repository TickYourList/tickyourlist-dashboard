import { get, post, axiosApi } from "./api_helper";

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

// ─── Customer 360 / automations health ──────────────────────────────────────
export const getCustomer360 = (email) => get(`/v1/admin/ops/customer`, { params: { email } });
export const getAutomationsHealth = () => get(`/v1/admin/ops/automations`);
export const resendConfirmationEmail = (bookingId) =>
  post(`/v1/tyltourcustomerbooking/booking/${bookingId}/resend-confirmation-email`, {});

// ─── Tracking: overview + product journey ────────────────────────────────────
export const getOpsOverview = (days = 30) => get(`/v1/admin/ops/overview`, { params: { days } });
export const searchProducts = (q) => get(`/v1/admin/ops/product-search`, { params: { q } });
export const getProductJourney = (tourGroupId, days = 60) =>
  get(`/v1/admin/ops/product-journey`, { params: { tourGroupId, days } });

// ─── Variant visibility + provider content import ───────────────────────────
export const setVariantVisibility = (variantId, status) =>
  axiosApi.patch(`/v1/tyltraveltourgroupvariant/variant/${variantId}/availability`, { status }).then((r) => r.data);
export const globaltixImportContent = ({ globaltixProductId, tourGroupId, environment = "staging", fields }) =>
  post(`/v1/globaltix/sync/import-content`, { globaltixProductId, tourGroupId, environment, fields });
