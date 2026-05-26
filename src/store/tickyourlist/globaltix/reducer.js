import {
  FETCH_GLOBALTIX_CREDIT_REQUEST,
  FETCH_GLOBALTIX_CREDIT_SUCCESS,
  FETCH_GLOBALTIX_CREDIT_FAILURE,
  TRIGGER_GLOBALTIX_SWEEP_REQUEST,
  TRIGGER_GLOBALTIX_SWEEP_SUCCESS,
  TRIGGER_GLOBALTIX_SWEEP_FAILURE,
  EXPORT_GLOBALTIX_BOOKINGS_REQUEST,
  EXPORT_GLOBALTIX_BOOKINGS_SUCCESS,
  EXPORT_GLOBALTIX_BOOKINGS_FAILURE,
  FETCH_GLOBALTIX_WEBHOOK_EVENTS_REQUEST,
  FETCH_GLOBALTIX_WEBHOOK_EVENTS_SUCCESS,
  FETCH_GLOBALTIX_WEBHOOK_EVENTS_FAILURE,
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
  LINK_GLOBALTIX_BOOKING_REQUEST,
  LINK_GLOBALTIX_BOOKING_SUCCESS,
  LINK_GLOBALTIX_BOOKING_FAILURE,
  UNLINK_GLOBALTIX_BOOKING_REQUEST,
  UNLINK_GLOBALTIX_BOOKING_SUCCESS,
  UNLINK_GLOBALTIX_BOOKING_FAILURE,
  GLOBALTIX_SYNC_INCREMENTAL_REQUEST,
  GLOBALTIX_SYNC_INCREMENTAL_SUCCESS,
  GLOBALTIX_SYNC_INCREMENTAL_FAILURE,
} from "./actionTypes";

const initialState = {
  products: [],
  productsPagination: {},
  productsLoading: false,
  productsError: null,

  searchResults: [],
  searching: false,

  productDetail: null,
  productDetailLoading: false,

  linkLoading: false,
  linkError: null,

  syncLoading: false,
  syncResult: null,
  syncProductLoading: false,

  bookings: [],
  bookingsPagination: {},
  bookingsLoading: false,
  bookingsError: null,

  bookingDetail: null,
  bookingDetailLoading: false,

  cancelLoading: false,
  cancelSuccess: false,
  confirmLoading: false,
  confirmSuccess: false,
  confirmError: null,
  releaseLoading: false,
  resendEmailLoading: false,
  refreshBookingLoading: false,

  tokenInfo: null,
  tokenLoading: false,

  authLoading: false,
  authError: null,

  reserveLoading: false,
  reservedBooking: null,
  reserveError: null,

  availabilityCalendar: null,
  calendarLoading: false,

  availabilityTimeslots: [],
  timeslotsLoading: false,

  ticketUrls: null,
  ticketUrlsLoading: false,
  ticketUrlsError: null,

  webhookEvents: [],
  webhookEventsPagination: {},
  webhookEventsLoading: false,
  webhookEventsError: null,

  creditBalance: null,
  creditLoading: false,

  sweepLoading: false,
  sweepResult: null,

  exportLoading: false,

  linkBookingLoading: false,
  linkBookingError: null,
  unlinkBookingLoading: false,

  syncIncrementalLoading: false,
  syncIncrementalResult: null,
};

const globaltixReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GLOBALTIX_PRODUCTS_REQUEST:
      return { ...state, productsLoading: true, productsError: null };
    case FETCH_GLOBALTIX_PRODUCTS_SUCCESS:
      return { ...state, productsLoading: false, products: action.payload.data || [], productsPagination: action.payload.pagination || {} };
    case FETCH_GLOBALTIX_PRODUCTS_FAILURE:
      return { ...state, productsLoading: false, productsError: action.payload };

    case SEARCH_GLOBALTIX_PRODUCTS_REQUEST:
      return { ...state, searching: true };
    case SEARCH_GLOBALTIX_PRODUCTS_SUCCESS:
      return { ...state, searching: false, searchResults: action.payload.data || [] };
    case SEARCH_GLOBALTIX_PRODUCTS_FAILURE:
      return { ...state, searching: false };

    case FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST:
      return { ...state, productDetailLoading: true };
    case FETCH_GLOBALTIX_PRODUCT_DETAIL_SUCCESS:
      return { ...state, productDetailLoading: false, productDetail: action.payload.data };
    case FETCH_GLOBALTIX_PRODUCT_DETAIL_FAILURE:
      return { ...state, productDetailLoading: false };

    case LINK_GLOBALTIX_PRODUCT_REQUEST:
      return { ...state, linkLoading: true, linkError: null };
    case LINK_GLOBALTIX_PRODUCT_SUCCESS:
      return { ...state, linkLoading: false };
    case LINK_GLOBALTIX_PRODUCT_FAILURE:
      return { ...state, linkLoading: false, linkError: action.payload };

    case GLOBALTIX_SYNC_FULL_REQUEST:
      return { ...state, syncLoading: true, syncResult: null };
    case GLOBALTIX_SYNC_FULL_SUCCESS:
      return { ...state, syncLoading: false, syncResult: action.payload.data };
    case GLOBALTIX_SYNC_FULL_FAILURE:
      return { ...state, syncLoading: false };

    case GLOBALTIX_SYNC_PRODUCT_REQUEST:
      return { ...state, syncProductLoading: true };
    case GLOBALTIX_SYNC_PRODUCT_SUCCESS: {
      const updated = action.payload?.data;
      return {
        ...state,
        syncProductLoading: false,
        products: updated
          ? state.products.map((p) =>
              p.globaltixProductId === updated.globaltixProductId ? { ...p, ...updated } : p
            )
          : state.products,
      };
    }
    case GLOBALTIX_SYNC_PRODUCT_FAILURE:
      return { ...state, syncProductLoading: false };

    case FETCH_GLOBALTIX_BOOKINGS_REQUEST:
      return { ...state, bookingsLoading: true, bookingsError: null };
    case FETCH_GLOBALTIX_BOOKINGS_SUCCESS:
      return { ...state, bookingsLoading: false, bookings: action.payload.data || [], bookingsPagination: action.payload.pagination || {} };
    case FETCH_GLOBALTIX_BOOKINGS_FAILURE:
      return { ...state, bookingsLoading: false, bookingsError: action.payload };

    case FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST:
      return { ...state, bookingDetailLoading: true, ticketUrls: null, ticketUrlsError: null };
    case FETCH_GLOBALTIX_BOOKING_DETAIL_SUCCESS:
      return { ...state, bookingDetailLoading: false, bookingDetail: action.payload.data };
    case FETCH_GLOBALTIX_BOOKING_DETAIL_FAILURE:
      return { ...state, bookingDetailLoading: false };

    case CANCEL_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, cancelLoading: true, cancelSuccess: false };
    case CANCEL_GLOBALTIX_BOOKING_SUCCESS:
      return {
        ...state,
        cancelLoading: false,
        cancelSuccess: true,
        // Update the cancelled booking's status in the list
        bookings: state.bookings.map((b) =>
          b.referenceNumber === action.payload?.referenceNumber
            ? { ...b, status: "CANCELLED" }
            : b
        ),
      };
    case CANCEL_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, cancelLoading: false, cancelSuccess: false };

    case CONFIRM_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, confirmLoading: true, confirmError: null, confirmSuccess: false };
    case CONFIRM_GLOBALTIX_BOOKING_SUCCESS: {
      const updated = action.payload?.data;
      return {
        ...state,
        confirmLoading: false,
        confirmSuccess: true,
        confirmError: null,
        bookings: updated
          ? state.bookings.map((b) => b.referenceNumber === updated.referenceNumber ? { ...b, ...updated } : b)
          : state.bookings,
        bookingDetail: state.bookingDetail?.referenceNumber === updated?.referenceNumber ? updated : state.bookingDetail,
      };
    }
    case CONFIRM_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, confirmLoading: false, confirmSuccess: false, confirmError: action.payload };

    case RELEASE_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, releaseLoading: true };
    case RELEASE_GLOBALTIX_BOOKING_SUCCESS: {
      const updated = action.payload?.data;
      return {
        ...state,
        releaseLoading: false,
        bookings: updated
          ? state.bookings.map((b) => b.referenceNumber === updated.referenceNumber ? { ...b, ...updated } : b)
          : state.bookings,
        bookingDetail: state.bookingDetail?.referenceNumber === updated?.referenceNumber ? updated : state.bookingDetail,
      };
    }
    case RELEASE_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, releaseLoading: false };

    case RESEND_GLOBALTIX_EMAIL_REQUEST:
      return { ...state, resendEmailLoading: true };
    case RESEND_GLOBALTIX_EMAIL_SUCCESS:
      return { ...state, resendEmailLoading: false };
    case RESEND_GLOBALTIX_EMAIL_FAILURE:
      return { ...state, resendEmailLoading: false };

    case REFRESH_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, refreshBookingLoading: true };
    case REFRESH_GLOBALTIX_BOOKING_SUCCESS:
      return { ...state, refreshBookingLoading: false, bookingDetail: action.payload?.data || state.bookingDetail };
    case REFRESH_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, refreshBookingLoading: false };

    case FETCH_GLOBALTIX_TOKEN_REQUEST:
      return { ...state, tokenLoading: true };
    case FETCH_GLOBALTIX_TOKEN_SUCCESS:
      return { ...state, tokenLoading: false, tokenInfo: action.payload.data };
    case FETCH_GLOBALTIX_TOKEN_FAILURE:
      return { ...state, tokenLoading: false };

    case AUTHENTICATE_GLOBALTIX_REQUEST:
      return { ...state, authLoading: true, authError: null };
    case AUTHENTICATE_GLOBALTIX_SUCCESS:
      return { ...state, authLoading: false };
    case AUTHENTICATE_GLOBALTIX_FAILURE:
      return { ...state, authLoading: false, authError: action.payload };

    case RESERVE_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, reserveLoading: true, reserveError: null, reservedBooking: null };
    case RESERVE_GLOBALTIX_BOOKING_SUCCESS:
      return { ...state, reserveLoading: false, reservedBooking: action.payload.data };
    case RESERVE_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, reserveLoading: false, reserveError: action.payload };

    case FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_REQUEST:
      return { ...state, calendarLoading: true, availabilityCalendar: null };
    case FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_SUCCESS:
      return { ...state, calendarLoading: false, availabilityCalendar: action.payload.data || action.payload };
    case FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_FAILURE:
      return { ...state, calendarLoading: false };

    case FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_REQUEST:
      return { ...state, timeslotsLoading: true, availabilityTimeslots: [] };
    case FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_SUCCESS:
      return { ...state, timeslotsLoading: false, availabilityTimeslots: action.payload.data || action.payload || [] };
    case FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_FAILURE:
      return { ...state, timeslotsLoading: false };

    case FETCH_GLOBALTIX_TICKET_URLS_REQUEST:
      return { ...state, ticketUrlsLoading: true, ticketUrlsError: null, ticketUrls: null };
    case FETCH_GLOBALTIX_TICKET_URLS_SUCCESS:
      return { ...state, ticketUrlsLoading: false, ticketUrls: action.payload.data || action.payload };
    case FETCH_GLOBALTIX_TICKET_URLS_FAILURE:
      return { ...state, ticketUrlsLoading: false, ticketUrlsError: action.payload };

    case FETCH_GLOBALTIX_WEBHOOK_EVENTS_REQUEST:
      return { ...state, webhookEventsLoading: true, webhookEventsError: null };
    case FETCH_GLOBALTIX_WEBHOOK_EVENTS_SUCCESS:
      return {
        ...state,
        webhookEventsLoading: false,
        webhookEvents: action.payload.data || [],
        webhookEventsPagination: action.payload.pagination || {},
      };
    case FETCH_GLOBALTIX_WEBHOOK_EVENTS_FAILURE:
      return { ...state, webhookEventsLoading: false, webhookEventsError: action.payload };

    case FETCH_GLOBALTIX_CREDIT_REQUEST:
      return { ...state, creditLoading: true };
    case FETCH_GLOBALTIX_CREDIT_SUCCESS:
      return { ...state, creditLoading: false, creditBalance: action.payload.data || action.payload };
    case FETCH_GLOBALTIX_CREDIT_FAILURE:
      return { ...state, creditLoading: false };

    case TRIGGER_GLOBALTIX_SWEEP_REQUEST:
      return { ...state, sweepLoading: true, sweepResult: null };
    case TRIGGER_GLOBALTIX_SWEEP_SUCCESS:
      return { ...state, sweepLoading: false, sweepResult: action.payload.data || action.payload };
    case TRIGGER_GLOBALTIX_SWEEP_FAILURE:
      return { ...state, sweepLoading: false };

    case EXPORT_GLOBALTIX_BOOKINGS_REQUEST:
      return { ...state, exportLoading: true };
    case EXPORT_GLOBALTIX_BOOKINGS_SUCCESS:
      return { ...state, exportLoading: false };
    case EXPORT_GLOBALTIX_BOOKINGS_FAILURE:
      return { ...state, exportLoading: false };

    case LINK_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, linkBookingLoading: true, linkBookingError: null };
    case LINK_GLOBALTIX_BOOKING_SUCCESS: {
      const updated = action.payload?.data;
      return {
        ...state,
        linkBookingLoading: false,
        bookingDetail: updated && state.bookingDetail?.referenceNumber === updated.referenceNumber ? updated : state.bookingDetail,
        bookings: updated
          ? state.bookings.map((b) => b.referenceNumber === updated.referenceNumber ? { ...b, tourBookingId: updated.tourBookingId } : b)
          : state.bookings,
      };
    }
    case LINK_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, linkBookingLoading: false, linkBookingError: action.payload };

    case UNLINK_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, unlinkBookingLoading: true };
    case UNLINK_GLOBALTIX_BOOKING_SUCCESS: {
      const updated = action.payload?.data;
      return {
        ...state,
        unlinkBookingLoading: false,
        bookingDetail: updated && state.bookingDetail?.referenceNumber === updated.referenceNumber ? updated : state.bookingDetail,
        bookings: updated
          ? state.bookings.map((b) => b.referenceNumber === updated.referenceNumber ? { ...b, tourBookingId: null } : b)
          : state.bookings,
      };
    }
    case UNLINK_GLOBALTIX_BOOKING_FAILURE:
      return { ...state, unlinkBookingLoading: false };

    case GLOBALTIX_SYNC_INCREMENTAL_REQUEST:
      return { ...state, syncIncrementalLoading: true, syncIncrementalResult: null };
    case GLOBALTIX_SYNC_INCREMENTAL_SUCCESS:
      return { ...state, syncIncrementalLoading: false, syncIncrementalResult: action.payload.data || action.payload };
    case GLOBALTIX_SYNC_INCREMENTAL_FAILURE:
      return { ...state, syncIncrementalLoading: false };

    default:
      return state;
  }
};

export default globaltixReducer;
