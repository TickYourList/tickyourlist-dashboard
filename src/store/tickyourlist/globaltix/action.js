import {
  FETCH_GLOBALTIX_TICKET_URLS_REQUEST,
  FETCH_GLOBALTIX_TICKET_URLS_SUCCESS,
  FETCH_GLOBALTIX_TICKET_URLS_FAILURE,
  RESERVE_GLOBALTIX_BOOKING_REQUEST,
  RESERVE_GLOBALTIX_BOOKING_SUCCESS,
  RESERVE_GLOBALTIX_BOOKING_FAILURE,
  FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_REQUEST,
  FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_SUCCESS,
  FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_FAILURE,
  FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_REQUEST,
  FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_SUCCESS,
  FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_FAILURE,
  FETCH_GLOBALTIX_PRODUCTS_REQUEST,
  FETCH_GLOBALTIX_PRODUCTS_SUCCESS,
  FETCH_GLOBALTIX_PRODUCTS_FAILURE,
  SEARCH_GLOBALTIX_PRODUCTS_REQUEST,
  SEARCH_GLOBALTIX_PRODUCTS_SUCCESS,
  SEARCH_GLOBALTIX_PRODUCTS_FAILURE,
  FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST,
  FETCH_GLOBALTIX_PRODUCT_DETAIL_SUCCESS,
  FETCH_GLOBALTIX_PRODUCT_DETAIL_FAILURE,
  LINK_GLOBALTIX_PRODUCT_REQUEST,
  LINK_GLOBALTIX_PRODUCT_SUCCESS,
  LINK_GLOBALTIX_PRODUCT_FAILURE,
  GLOBALTIX_SYNC_FULL_REQUEST,
  GLOBALTIX_SYNC_FULL_SUCCESS,
  GLOBALTIX_SYNC_FULL_FAILURE,
  GLOBALTIX_SYNC_PRODUCT_REQUEST,
  GLOBALTIX_SYNC_PRODUCT_SUCCESS,
  GLOBALTIX_SYNC_PRODUCT_FAILURE,
  FETCH_GLOBALTIX_BOOKINGS_REQUEST,
  FETCH_GLOBALTIX_BOOKINGS_SUCCESS,
  FETCH_GLOBALTIX_BOOKINGS_FAILURE,
  FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST,
  FETCH_GLOBALTIX_BOOKING_DETAIL_SUCCESS,
  FETCH_GLOBALTIX_BOOKING_DETAIL_FAILURE,
  CANCEL_GLOBALTIX_BOOKING_REQUEST,
  CANCEL_GLOBALTIX_BOOKING_SUCCESS,
  CANCEL_GLOBALTIX_BOOKING_FAILURE,
  CONFIRM_GLOBALTIX_BOOKING_REQUEST,
  CONFIRM_GLOBALTIX_BOOKING_SUCCESS,
  CONFIRM_GLOBALTIX_BOOKING_FAILURE,
  RELEASE_GLOBALTIX_BOOKING_REQUEST,
  RELEASE_GLOBALTIX_BOOKING_SUCCESS,
  RELEASE_GLOBALTIX_BOOKING_FAILURE,
  RESEND_GLOBALTIX_EMAIL_REQUEST,
  RESEND_GLOBALTIX_EMAIL_SUCCESS,
  RESEND_GLOBALTIX_EMAIL_FAILURE,
  REFRESH_GLOBALTIX_BOOKING_REQUEST,
  REFRESH_GLOBALTIX_BOOKING_SUCCESS,
  REFRESH_GLOBALTIX_BOOKING_FAILURE,
  FETCH_GLOBALTIX_TOKEN_REQUEST,
  FETCH_GLOBALTIX_TOKEN_SUCCESS,
  FETCH_GLOBALTIX_TOKEN_FAILURE,
  AUTHENTICATE_GLOBALTIX_REQUEST,
  AUTHENTICATE_GLOBALTIX_SUCCESS,
  AUTHENTICATE_GLOBALTIX_FAILURE,
} from "./actionTypes";

export const fetchGlobtixProductsRequest = (params) => ({ type: FETCH_GLOBALTIX_PRODUCTS_REQUEST, payload: params });
export const fetchGlobtixProductsSuccess = (data) => ({ type: FETCH_GLOBALTIX_PRODUCTS_SUCCESS, payload: data });
export const fetchGlobtixProductsFailure = (error) => ({ type: FETCH_GLOBALTIX_PRODUCTS_FAILURE, payload: error });

export const searchGlobtixProductsRequest = (query, environment) => ({ type: SEARCH_GLOBALTIX_PRODUCTS_REQUEST, payload: { query, environment } });
export const searchGlobtixProductsSuccess = (data) => ({ type: SEARCH_GLOBALTIX_PRODUCTS_SUCCESS, payload: data });
export const searchGlobtixProductsFailure = (error) => ({ type: SEARCH_GLOBALTIX_PRODUCTS_FAILURE, payload: error });

export const fetchGlobtixProductDetailRequest = (productId, environment) => ({ type: FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST, payload: { productId, environment } });
export const fetchGlobtixProductDetailSuccess = (data) => ({ type: FETCH_GLOBALTIX_PRODUCT_DETAIL_SUCCESS, payload: data });
export const fetchGlobtixProductDetailFailure = (error) => ({ type: FETCH_GLOBALTIX_PRODUCT_DETAIL_FAILURE, payload: error });

export const linkGlobtixProductRequest = (globaltixProductId, tourGroupId, environment) => ({ type: LINK_GLOBALTIX_PRODUCT_REQUEST, payload: { globaltixProductId, tourGroupId, environment } });
export const linkGlobtixProductSuccess = (data) => ({ type: LINK_GLOBALTIX_PRODUCT_SUCCESS, payload: data });
export const linkGlobtixProductFailure = (error) => ({ type: LINK_GLOBALTIX_PRODUCT_FAILURE, payload: error });

export const globaltixSyncFullRequest = (environment) => ({ type: GLOBALTIX_SYNC_FULL_REQUEST, payload: { environment } });
export const globaltixSyncFullSuccess = (data) => ({ type: GLOBALTIX_SYNC_FULL_SUCCESS, payload: data });
export const globaltixSyncFullFailure = (error) => ({ type: GLOBALTIX_SYNC_FULL_FAILURE, payload: error });

export const globaltixSyncProductRequest = (globaltixProductId, environment) => ({ type: GLOBALTIX_SYNC_PRODUCT_REQUEST, payload: { globaltixProductId, environment } });
export const globaltixSyncProductSuccess = (data) => ({ type: GLOBALTIX_SYNC_PRODUCT_SUCCESS, payload: data });
export const globaltixSyncProductFailure = (error) => ({ type: GLOBALTIX_SYNC_PRODUCT_FAILURE, payload: error });

export const fetchGlobtixBookingsRequest = (params) => ({ type: FETCH_GLOBALTIX_BOOKINGS_REQUEST, payload: params });
export const fetchGlobtixBookingsSuccess = (data) => ({ type: FETCH_GLOBALTIX_BOOKINGS_SUCCESS, payload: data });
export const fetchGlobtixBookingsFailure = (error) => ({ type: FETCH_GLOBALTIX_BOOKINGS_FAILURE, payload: error });

export const fetchGlobtixBookingDetailRequest = (referenceNumber) => ({ type: FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST, payload: { referenceNumber } });
export const fetchGlobtixBookingDetailSuccess = (data) => ({ type: FETCH_GLOBALTIX_BOOKING_DETAIL_SUCCESS, payload: data });
export const fetchGlobtixBookingDetailFailure = (error) => ({ type: FETCH_GLOBALTIX_BOOKING_DETAIL_FAILURE, payload: error });

export const cancelGlobtixBookingRequest = (referenceNumber, environment, reason) => ({ type: CANCEL_GLOBALTIX_BOOKING_REQUEST, payload: { referenceNumber, environment, reason } });
export const cancelGlobtixBookingSuccess = (data, referenceNumber) => ({ type: CANCEL_GLOBALTIX_BOOKING_SUCCESS, payload: { ...(data || {}), referenceNumber } });
export const cancelGlobtixBookingFailure = (error) => ({ type: CANCEL_GLOBALTIX_BOOKING_FAILURE, payload: error });

export const fetchGlobtixTokenRequest = (environment) => ({ type: FETCH_GLOBALTIX_TOKEN_REQUEST, payload: { environment } });
export const fetchGlobtixTokenSuccess = (data) => ({ type: FETCH_GLOBALTIX_TOKEN_SUCCESS, payload: data });
export const fetchGlobtixTokenFailure = (error) => ({ type: FETCH_GLOBALTIX_TOKEN_FAILURE, payload: error });

export const authenticateGlobtixRequest = (environment) => ({ type: AUTHENTICATE_GLOBALTIX_REQUEST, payload: { environment } });
export const authenticateGlobtixSuccess = (data) => ({ type: AUTHENTICATE_GLOBALTIX_SUCCESS, payload: data });
export const authenticateGlobtixFailure = (error) => ({ type: AUTHENTICATE_GLOBALTIX_FAILURE, payload: error });

export const confirmGlobtixBookingRequest = (referenceNumber, environment) => ({ type: CONFIRM_GLOBALTIX_BOOKING_REQUEST, payload: { referenceNumber, environment } });
export const confirmGlobtixBookingSuccess = (data) => ({ type: CONFIRM_GLOBALTIX_BOOKING_SUCCESS, payload: data });
export const confirmGlobtixBookingFailure = (error) => ({ type: CONFIRM_GLOBALTIX_BOOKING_FAILURE, payload: error });

export const releaseGlobtixBookingRequest = (referenceNumber, environment) => ({ type: RELEASE_GLOBALTIX_BOOKING_REQUEST, payload: { referenceNumber, environment } });
export const releaseGlobtixBookingSuccess = (data) => ({ type: RELEASE_GLOBALTIX_BOOKING_SUCCESS, payload: data });
export const releaseGlobtixBookingFailure = (error) => ({ type: RELEASE_GLOBALTIX_BOOKING_FAILURE, payload: error });

export const resendGlobtixEmailRequest = (referenceNumber, environment) => ({ type: RESEND_GLOBALTIX_EMAIL_REQUEST, payload: { referenceNumber, environment } });
export const resendGlobtixEmailSuccess = (data) => ({ type: RESEND_GLOBALTIX_EMAIL_SUCCESS, payload: data });
export const resendGlobtixEmailFailure = (error) => ({ type: RESEND_GLOBALTIX_EMAIL_FAILURE, payload: error });

export const refreshGlobtixBookingRequest = (referenceNumber, environment) => ({ type: REFRESH_GLOBALTIX_BOOKING_REQUEST, payload: { referenceNumber, environment } });
export const refreshGlobtixBookingSuccess = (data) => ({ type: REFRESH_GLOBALTIX_BOOKING_SUCCESS, payload: data });
export const refreshGlobtixBookingFailure = (error) => ({ type: REFRESH_GLOBALTIX_BOOKING_FAILURE, payload: error });

export const reserveGlobtixBookingRequest = (payload) => ({ type: RESERVE_GLOBALTIX_BOOKING_REQUEST, payload });
export const reserveGlobtixBookingSuccess = (data) => ({ type: RESERVE_GLOBALTIX_BOOKING_SUCCESS, payload: data });
export const reserveGlobtixBookingFailure = (error) => ({ type: RESERVE_GLOBALTIX_BOOKING_FAILURE, payload: error });

export const fetchGlobtixAvailabilityCalendarRequest = (ticketTypeID, month, environment) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_REQUEST, payload: { ticketTypeID, month, environment } });
export const fetchGlobtixAvailabilityCalendarSuccess = (data) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_SUCCESS, payload: data });
export const fetchGlobtixAvailabilityCalendarFailure = (error) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_FAILURE, payload: error });

export const fetchGlobtixAvailabilityTimeslotRequest = (ticketTypeID, date, environment) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_REQUEST, payload: { ticketTypeID, date, environment } });
export const fetchGlobtixAvailabilityTimeslotSuccess = (data) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_SUCCESS, payload: data });
export const fetchGlobtixAvailabilityTimeslotFailure = (error) => ({ type: FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_FAILURE, payload: error });

export const fetchGlobtixTicketUrlsRequest = (referenceNumber, environment) => ({ type: FETCH_GLOBALTIX_TICKET_URLS_REQUEST, payload: { referenceNumber, environment } });
export const fetchGlobtixTicketUrlsSuccess = (data) => ({ type: FETCH_GLOBALTIX_TICKET_URLS_SUCCESS, payload: data });
export const fetchGlobtixTicketUrlsFailure = (error) => ({ type: FETCH_GLOBALTIX_TICKET_URLS_FAILURE, payload: error });
