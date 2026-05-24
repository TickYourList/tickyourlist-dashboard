import { get, post } from "./api_helper";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const getGlobtixToken = (environment = "staging") =>
  get(`/v1/globaltix/auth/token`, { params: { environment } });

export const authenticateGlobtix = (environment = "staging") =>
  post(`/v1/globaltix/auth/authenticate`, { environment });

// ─── Products ────────────────────────────────────────────────────────────────

export const getGlobtixProducts = ({ environment = "staging", isActive, syncStatus, page = 1, limit = 50 } = {}) =>
  get(`/v1/globaltix/products`, {
    params: { environment, ...(isActive !== undefined && { isActive }), ...(syncStatus && { syncStatus }), page, limit },
  });

export const searchGlobtixProducts = (query, environment = "staging") =>
  get(`/v1/globaltix/products/search`, { params: { q: query, environment, limit: 30 } });

export const getGlobtixUnlinkedProducts = (environment = "staging", page = 1, limit = 50) =>
  get(`/v1/globaltix/products/unlinked`, { params: { environment, page, limit } });

export const getGlobtixProductDetail = (productId, environment = "staging") =>
  get(`/v1/globaltix/products/${productId}`, { params: { environment } });

export const getGlobtixProductLive = (productId, environment = "staging") =>
  get(`/v1/globaltix/products/${productId}/live`, { params: { environment } });

export const getGlobtixProductPricing = (productId, { environment = "staging", currency = "SGD", live = false } = {}) =>
  get(`/v1/globaltix/products/${productId}/pricing`, { params: { environment, currency, live } });

export const getGlobtixProductByTourGroup = (tourGroupId, environment = "staging") =>
  get(`/v1/globaltix/products/by-tour-group/${tourGroupId}`, { params: { environment } });

export const linkGlobtixProduct = (globaltixProductId, tourGroupId, environment = "staging") =>
  post(`/v1/globaltix/sync/link`, { globaltixProductId, tourGroupId, environment });

// ─── Sync ─────────────────────────────────────────────────────────────────────

export const globaltixSyncFull = (environment = "staging") =>
  post(`/v1/globaltix/sync/full`, { environment });

export const globaltixCreateTourGroup = (globaltixProductId, environment = "staging") =>
  post(`/v1/globaltix/sync/create-tour-group`, { globaltixProductId, environment });

export const globaltixSyncIncremental = (environment = "staging", since) =>
  post(`/v1/globaltix/sync/incremental`, { environment, since });

export const globaltixSyncProduct = (globaltixProductId, environment = "staging") =>
  post(`/v1/globaltix/sync/product`, { globaltixProductId, environment });

// ─── Availability ─────────────────────────────────────────────────────────────

export const getGlobtixAvailabilityCalendar = (productId, optionId, month, environment = "staging") =>
  get(`/v1/globaltix/availability/calendar`, { params: { productId, optionId, month, environment } });

export const getGlobtixAvailabilityTimeslot = (productId, optionId, date, environment = "staging") =>
  get(`/v1/globaltix/availability/timeslot`, { params: { productId, optionId, date, environment } });

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const getGlobtixBookings = ({ environment = "staging", status, globaltixProductId, page = 1, limit = 20 } = {}) =>
  get(`/v1/globaltix/bookings`, {
    params: { environment, ...(status && { status }), ...(globaltixProductId && { globaltixProductId }), page, limit },
  });

export const getGlobtixBookingDetail = (referenceNumber) =>
  get(`/v1/globaltix/bookings/${referenceNumber}`);

export const reserveGlobtixBooking = (payload) =>
  post(`/v1/globaltix/bookings/reserve`, payload);

export const confirmGlobtixBooking = (referenceNumber, environment = "staging") =>
  post(`/v1/globaltix/bookings/confirm`, { referenceNumber, environment });

export const releaseGlobtixBooking = (referenceNumber, environment = "staging") =>
  post(`/v1/globaltix/bookings/release`, { referenceNumber, environment });

export const cancelGlobtixBooking = (referenceNumber, environment = "staging", reason) =>
  post(`/v1/globaltix/bookings/cancel`, { referenceNumber, environment, reason });

export const refreshGlobtixBooking = (referenceNumber, environment = "staging") =>
  get(`/v1/globaltix/bookings/${referenceNumber}/refresh`, { params: { environment } });
