import { get, post, put, axiosApi } from "./api_helper";

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

// ─── Product Setup Hub ───────────────────────────────────────────────────────
export const getProductSetup = (tourGroupId) => get(`/v1/admin/ops/product-setup/${tourGroupId}`);
export const setTourGroupLive = (tourGroupId, status) =>
  axiosApi.patch(`/v1/tyltraveltourgroup/tour-group/${tourGroupId}/availability`, { status }).then((r) => r.data);

// ─── Ops settings / credentials / reviews ────────────────────────────────────
export const getOpsConfigSettings = () => get(`/v1/admin/ops/config`);
export const updateOpsConfigSettings = (patch) => put(`/v1/admin/ops/config`, patch);
export const getProviderCredentials = () => get(`/v1/admin/ops/provider-credentials`);
export const saveProviderCredentials = (payload) => post(`/v1/admin/ops/provider-credentials`, payload);
export const toggleProviderCredentials = (id) => post(`/v1/admin/ops/provider-credentials/${id}/toggle`, {});
export const getModerationReviews = (show = "hidden") => get(`/v1/admin/ops/reviews`, { params: { show } });
export const moderateReview = (id, active) => post(`/v1/admin/ops/reviews/${id}/moderate`, { active });

// ─── TylCash management ──────────────────────────────────────────────────────
export const getTylCashConfig = () => get(`/v1/admin/tylcash/config`);
export const updateTylCashConfig = (data) => put(`/v1/admin/tylcash/config`, data);
export const getTylCashAnalytics = (params = {}) => get(`/v1/admin/tylcash/analytics`, { params });
export const getCustomerTylCash = (customerId, page = 1, limit = 20) =>
  get(`/v1/admin/tylcash/customer/${customerId}?page=${page}&limit=${limit}`);
export const adjustCustomerTylCash = (customerId, amount, reason) =>
  post(`/v1/admin/tylcash/customer/${customerId}/adjust`, { amount, reason });
export const recalculateCustomerTylCash = (customerId) =>
  post(`/v1/admin/tylcash/customer/${customerId}/recalculate`, {});

// ─── Support tickets ─────────────────────────────────────────────────────────
export const getSupportTickets = (params = {}) => get(`/v1/support/tickets`, { params });
export const replySupportTicket = (ticketId, message) =>
  post(`/v1/support/tickets/${ticketId}/reply`, { message });
export const setSupportTicketStatus = (ticketId, status) =>
  put(`/v1/support/tickets/${ticketId}/status`, { status });
