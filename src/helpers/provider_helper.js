import { get, post, put, del } from "./api_helper";

// ─── Provider Configs (CRUD) ──────────────────────────────────────────────────

export const getSupportedProviders = () =>
  get(`/v1/provider/configs/supported`);

export const getProviderConfigs = ({ variantId, tourGroupId, isActive } = {}) =>
  get(`/v1/provider/configs`, {
    params: {
      ...(variantId && { variantId }),
      ...(tourGroupId && { tourGroupId }),
      ...(isActive !== undefined && { isActive }),
    },
  });

export const createProviderConfig = (data) =>
  post(`/v1/provider/configs`, data);

export const updateProviderConfig = (id, data) =>
  put(`/v1/provider/configs/${id}`, data);

export const deleteProviderConfig = (id) =>
  del(`/v1/provider/configs/${id}`);

// ─── Unified Availability ─────────────────────────────────────────────────────

export const getProviderAvailabilityCalendar = ({ variantId, tourGroupId, month }) =>
  get(`/v1/provider/availability/calendar`, { params: { variantId, tourGroupId, month } });

export const getProviderAvailabilityTimeslots = ({ variantId, tourGroupId, date }) =>
  get(`/v1/provider/availability/timeslots`, { params: { variantId, tourGroupId, date } });

// ─── Unified Pricing ──────────────────────────────────────────────────────────

export const getProviderPricing = ({ variantId, tourGroupId, currency = "SGD" }) =>
  get(`/v1/provider/bookings/pricing`, { params: { variantId, tourGroupId, currency } });

// ─── Unified Bookings ─────────────────────────────────────────────────────────

export const providerReserve = (data) =>
  post(`/v1/provider/bookings/reserve`, data);

export const providerConfirm = ({ referenceNumber, provider, environment = "staging" }) =>
  post(`/v1/provider/bookings/confirm`, { referenceNumber, provider, environment });

export const providerRelease = ({ referenceNumber, provider, environment = "staging" }) =>
  post(`/v1/provider/bookings/release`, { referenceNumber, provider, environment });

export const providerCancel = ({ referenceNumber, provider, environment = "staging", reason }) =>
  post(`/v1/provider/bookings/cancel`, { referenceNumber, provider, environment, reason });

export const getProviderBooking = (referenceNumber, provider = "GLOBALTIX", environment = "staging") =>
  get(`/v1/provider/bookings/${referenceNumber}`, { params: { provider, environment } });
