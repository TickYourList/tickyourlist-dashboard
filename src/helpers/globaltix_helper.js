import { get, post, del } from "./api_helper";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const getGlobtixToken = (environment = "staging") =>
  get(`/v1/globaltix/auth/token`, { params: { environment } });

// ─── Meta ─────────────────────────────────────────────────────────────────────

// Distinct filter values derived from synced products (only what you actually have)
export const getGlobtixProductFilters = (environment = "staging") =>
  get(`/v1/globaltix/products/distinct-filters`, { params: { environment } });

// Full Globaltix reference data (235 countries, all categories — use sparingly)
export const getGlobtixCountries = (environment = "staging") =>
  get(`/v1/globaltix/meta/countries`, { params: { environment } });

export const getGlobtixCities = (environment = "staging") =>
  get(`/v1/globaltix/meta/cities`, { params: { environment } });

export const getGlobtixCategories = (environment = "staging") =>
  get(`/v1/globaltix/meta/categories`, { params: { environment } });

export const getGlobtixCredit = (environment = "staging") =>
  get(`/v1/globaltix/meta/credit`, { params: { environment } });

export const authenticateGlobtix = (environment = "staging") =>
  post(`/v1/globaltix/auth/authenticate`, { environment });

// ─── Products ────────────────────────────────────────────────────────────────

export const getGlobtixProducts = ({ environment = "staging", isActive, syncStatus, country, city, category, isLinked, isCancellable, isOpenDated, page = 1, limit = 50 } = {}) =>
  get(`/v1/globaltix/products`, {
    params: {
      environment,
      ...(isActive !== undefined && { isActive }),
      ...(syncStatus && { syncStatus }),
      ...(country && { country }),
      ...(city && { city }),
      ...(category && { category }),
      ...(isLinked !== undefined && { isLinked }),
      ...(isCancellable !== undefined && { isCancellable }),
      ...(isOpenDated !== undefined && { isOpenDated }),
      page,
      limit,
    },
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
  post(`/v1/globaltix/sync/incremental`, { environment, ...(since && { since }) });

export const globaltixSyncProduct = (globaltixProductId, environment = "staging") =>
  post(`/v1/globaltix/sync/product`, { globaltixProductId, environment });

// ─── Availability ─────────────────────────────────────────────────────────────

export const getGlobtixAvailabilityCalendar = (ticketTypeID, month, environment = "staging") =>
  get(`/v1/globaltix/availability/calendar`, { params: { ticketTypeID, month, environment } });

export const getGlobtixAvailabilityTimeslot = (ticketTypeID, date, environment = "staging") =>
  get(`/v1/globaltix/availability/timeslot`, { params: { ticketTypeID, date, environment } });

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const getGlobtixBookings = ({ environment = "staging", status, globaltixProductId, customerEmail, partnerReference, referenceNumber, dateFrom, dateTo, page = 1, limit = 20 } = {}) =>
  get(`/v1/globaltix/bookings`, {
    params: {
      environment,
      ...(status && { status }),
      ...(globaltixProductId && { globaltixProductId }),
      ...(customerEmail && { customerEmail }),
      ...(partnerReference && { partnerReference }),
      ...(referenceNumber && { referenceNumber }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      page,
      limit,
    },
  });

export const exportGlobtixBookings = (params = {}) => {
  const { environment = "staging", status, customerEmail, partnerReference, referenceNumber, dateFrom, dateTo } = params;
  return get(`/v1/globaltix/bookings/export.csv`, {
    params: {
      environment,
      ...(status && { status }),
      ...(customerEmail && { customerEmail }),
      ...(partnerReference && { partnerReference }),
      ...(referenceNumber && { referenceNumber }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    },
    responseType: "blob",
  });
};

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

export const resendGlobtixBookingEmail = (referenceNumber, environment = "staging", toEmail) =>
  post(`/v1/globaltix/bookings/${referenceNumber}/resend-email`, { environment, ...(toEmail && { toEmail }) });

export const checkGlobtixAvailability = (ticketTypeID, dateFrom, dateTo, environment = "staging") =>
  get(`/v1/globaltix/availability/check`, { params: { ticketTypeID, dateFrom, dateTo, environment } });

export const getGlobtixTicketUrls = (referenceNumber, environment = "staging") =>
  get(`/v1/globaltix/bookings/${referenceNumber}/ticket-urls`, { params: { environment } });

export const triggerGlobtixSweep = (environment = "staging") =>
  post(`/v1/globaltix/bookings/sweep-expired`, { environment });

// ─── Webhook Events ────────────────────────────────────────────────────────────

export const getGlobtixWebhookEvents = ({ environment = "staging", eventType, processed, page = 1, limit = 30 } = {}) =>
  get(`/v1/globaltix/webhooks/events`, {
    params: {
      environment,
      ...(eventType && { eventType }),
      ...(processed !== undefined && { processed }),
      page,
      limit,
    },
  });

// ─── Link / Unlink Booking to TYL Tour Booking ───────────────────────────────

export const linkGlobtixBookingToTour = (referenceNumber, tourBookingId) =>
  post(`/v1/globaltix/bookings/${referenceNumber}/link`, { tourBookingId });

export const unlinkGlobtixBookingFromTour = (referenceNumber) =>
  del(`/v1/globaltix/bookings/${referenceNumber}/link`);

// ─── Pricing Calendar (6-month daily price grid) ──────────────────────────────

export const getGlobtixPricingCalendar = ({
  ticketTypeID,
  fromMonth,
  months = 3,
  environment = "staging",
  currency = "SGD",
  productId,
} = {}) =>
  get(`/v1/globaltix/pricing-calendar`, {
    params: {
      ticketTypeID,
      ...(fromMonth && { fromMonth }),
      months,
      environment,
      currency,
      ...(productId && { productId }),
    },
  });
