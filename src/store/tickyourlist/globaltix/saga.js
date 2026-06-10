import { call, put, takeLatest } from "redux-saga/effects";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
  FETCH_GLOBALTIX_CREDIT_REQUEST,
  TRIGGER_GLOBALTIX_SWEEP_REQUEST,
  EXPORT_GLOBALTIX_BOOKINGS_REQUEST,
  FETCH_GLOBALTIX_WEBHOOK_EVENTS_REQUEST,
  FETCH_RAZORPAY_WEBHOOK_EVENTS_REQUEST,
  RESERVE_GLOBALTIX_BOOKING_REQUEST,
  FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_REQUEST,
  FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_REQUEST,
  FETCH_GLOBALTIX_PRODUCTS_REQUEST,
  SEARCH_GLOBALTIX_PRODUCTS_REQUEST,
  FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST,
  LINK_GLOBALTIX_PRODUCT_REQUEST,
  GLOBALTIX_SYNC_FULL_REQUEST,
  GLOBALTIX_SYNC_PRODUCT_REQUEST,
  FETCH_GLOBALTIX_BOOKINGS_REQUEST,
  FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST,
  CANCEL_GLOBALTIX_BOOKING_REQUEST,
  CONFIRM_GLOBALTIX_BOOKING_REQUEST,
  RELEASE_GLOBALTIX_BOOKING_REQUEST,
  RESEND_GLOBALTIX_EMAIL_REQUEST,
  REFRESH_GLOBALTIX_BOOKING_REQUEST,
  FETCH_GLOBALTIX_TOKEN_REQUEST,
  AUTHENTICATE_GLOBALTIX_REQUEST,
  FETCH_GLOBALTIX_TICKET_URLS_REQUEST,
  LINK_GLOBALTIX_BOOKING_REQUEST,
  UNLINK_GLOBALTIX_BOOKING_REQUEST,
  GLOBALTIX_SYNC_INCREMENTAL_REQUEST,
} from "./actionTypes";
import {
  fetchGlobtixCreditSuccess,
  fetchGlobtixCreditFailure,
  triggerGlobtixSweepSuccess,
  triggerGlobtixSweepFailure,
  exportGlobtixBookingsSuccess,
  exportGlobtixBookingsFailure,
  fetchGlobtixWebhookEventsSuccess,
  fetchGlobtixWebhookEventsFailure,
  fetchRazorpayWebhookEventsSuccess,
  fetchRazorpayWebhookEventsFailure,
  reserveGlobtixBookingSuccess,
  reserveGlobtixBookingFailure,
  fetchGlobtixTicketUrlsSuccess,
  fetchGlobtixTicketUrlsFailure,
  fetchGlobtixAvailabilityCalendarSuccess,
  fetchGlobtixAvailabilityCalendarFailure,
  fetchGlobtixAvailabilityTimeslotSuccess,
  fetchGlobtixAvailabilityTimeslotFailure,
  fetchGlobtixProductsSuccess,
  fetchGlobtixProductsFailure,
  searchGlobtixProductsSuccess,
  searchGlobtixProductsFailure,
  fetchGlobtixProductDetailSuccess,
  fetchGlobtixProductDetailFailure,
  linkGlobtixProductSuccess,
  linkGlobtixProductFailure,
  globaltixSyncFullSuccess,
  globaltixSyncFullFailure,
  globaltixSyncProductSuccess,
  globaltixSyncProductFailure,
  fetchGlobtixBookingsSuccess,
  fetchGlobtixBookingsFailure,
  fetchGlobtixBookingDetailSuccess,
  fetchGlobtixBookingDetailFailure,
  cancelGlobtixBookingSuccess,
  cancelGlobtixBookingFailure,
  confirmGlobtixBookingSuccess,
  confirmGlobtixBookingFailure,
  releaseGlobtixBookingSuccess,
  releaseGlobtixBookingFailure,
  resendGlobtixEmailSuccess,
  resendGlobtixEmailFailure,
  refreshGlobtixBookingSuccess,
  refreshGlobtixBookingFailure,
  fetchGlobtixTokenSuccess,
  fetchGlobtixTokenFailure,
  authenticateGlobtixSuccess,
  authenticateGlobtixFailure,
  linkGlobtixBookingSuccess,
  linkGlobtixBookingFailure,
  unlinkGlobtixBookingSuccess,
  unlinkGlobtixBookingFailure,
  globaltixSyncIncrementalSuccess,
  globaltixSyncIncrementalFailure,
} from "./action";
import {
  getGlobtixCredit,
  triggerGlobtixSweep,
  exportGlobtixBookings,
  getGlobtixWebhookEvents,
  getRazorpayWebhookEvents,
  reserveGlobtixBooking,
  getGlobtixAvailabilityCalendar,
  getGlobtixAvailabilityTimeslot,
  getGlobtixProducts,
  searchGlobtixProducts,
  getGlobtixProductDetail,
  linkGlobtixProduct,
  globaltixSyncFull,
  globaltixSyncProduct,
  getGlobtixBookings,
  getGlobtixBookingDetail,
  cancelGlobtixBooking,
  confirmGlobtixBooking,
  releaseGlobtixBooking,
  resendGlobtixBookingEmail,
  refreshGlobtixBooking,
  getGlobtixToken,
  authenticateGlobtix,
  getGlobtixTicketUrls,
  linkGlobtixBookingToTour,
  unlinkGlobtixBookingFromTour,
  globaltixSyncIncremental,
} from "helpers/globaltix_helper";

function* fetchGlobtixProductsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixProducts, payload);
    yield put(fetchGlobtixProductsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixProductsFailure(error.message));
  }
}

function* searchGlobtixProductsSaga({ payload }) {
  try {
    const response = yield call(searchGlobtixProducts, payload.query, payload.environment);
    yield put(searchGlobtixProductsSuccess(response));
  } catch (error) {
    yield put(searchGlobtixProductsFailure(error.message));
  }
}

function* fetchGlobtixProductDetailSaga({ payload }) {
  try {
    const response = yield call(getGlobtixProductDetail, payload.productId, payload.environment);
    yield put(fetchGlobtixProductDetailSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixProductDetailFailure(error.message));
  }
}

function* linkGlobtixProductSaga({ payload }) {
  try {
    const response = yield call(linkGlobtixProduct, payload.globaltixProductId, payload.tourGroupId, payload.environment);
    yield put(linkGlobtixProductSuccess(response));
  } catch (error) {
    yield put(linkGlobtixProductFailure(error.message));
  }
}

function* globaltixSyncFullSaga({ payload }) {
  try {
    const response = yield call(globaltixSyncFull, payload.environment);
    yield put(globaltixSyncFullSuccess(response));
  } catch (error) {
    yield put(globaltixSyncFullFailure(error.message));
  }
}

function* globaltixSyncProductSaga({ payload }) {
  try {
    const response = yield call(globaltixSyncProduct, payload.globaltixProductId, payload.environment);
    yield put(globaltixSyncProductSuccess(response));
  } catch (error) {
    yield put(globaltixSyncProductFailure(error.message));
  }
}

function* fetchGlobtixBookingsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixBookings, payload);
    yield put(fetchGlobtixBookingsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixBookingsFailure(error.message));
  }
}

function* fetchGlobtixBookingDetailSaga({ payload }) {
  try {
    const response = yield call(getGlobtixBookingDetail, payload.referenceNumber);
    yield put(fetchGlobtixBookingDetailSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixBookingDetailFailure(error.message));
  }
}

function* cancelGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(cancelGlobtixBooking, payload.referenceNumber, payload.environment, payload.reason);
    yield put(cancelGlobtixBookingSuccess(response, payload.referenceNumber));
    showToastSuccess(`Booking ${payload.referenceNumber} cancelled successfully`);
  } catch (error) {
    yield put(cancelGlobtixBookingFailure(error.message));
    showToastError("Cancel failed: " + error.message);
  }
}

function* confirmGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(confirmGlobtixBooking, payload.referenceNumber, payload.environment);
    yield put(confirmGlobtixBookingSuccess(response));
    showToastSuccess(`Booking ${payload.referenceNumber} confirmed`);
  } catch (error) {
    yield put(confirmGlobtixBookingFailure(error.message));
    showToastError("Confirm failed: " + error.message);
  }
}

function* releaseGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(releaseGlobtixBooking, payload.referenceNumber, payload.environment);
    yield put(releaseGlobtixBookingSuccess(response));
    showToastSuccess(`Booking ${payload.referenceNumber} released`);
  } catch (error) {
    yield put(releaseGlobtixBookingFailure(error.message));
    showToastError("Release failed: " + error.message);
  }
}

function* resendGlobtixEmailSaga({ payload }) {
  try {
    const response = yield call(resendGlobtixBookingEmail, payload.referenceNumber, payload.environment, payload.toEmail);
    yield put(resendGlobtixEmailSuccess(response));
    showToastSuccess(payload.toEmail ? `Email resent to ${payload.toEmail}` : "Confirmation email resent");
  } catch (error) {
    yield put(resendGlobtixEmailFailure(error.message));
    showToastError("Resend failed: " + error.message);
  }
}

function* refreshGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(refreshGlobtixBooking, payload.referenceNumber, payload.environment);
    yield put(refreshGlobtixBookingSuccess(response));
  } catch (error) {
    yield put(refreshGlobtixBookingFailure(error.message));
    showToastError("Refresh failed: " + error.message);
  }
}

function* fetchGlobtixTokenSaga({ payload }) {
  try {
    const response = yield call(getGlobtixToken, payload.environment);
    yield put(fetchGlobtixTokenSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixTokenFailure(error.message));
  }
}

function* authenticateGlobtixSaga({ payload }) {
  try {
    const response = yield call(authenticateGlobtix, payload.environment);
    yield put(authenticateGlobtixSuccess(response));
    showToastSuccess("Globaltix authenticated successfully");
  } catch (error) {
    yield put(authenticateGlobtixFailure(error.message));
    showToastError("Authentication failed: " + error.message);
  }
}

function* reserveGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(reserveGlobtixBooking, payload);
    yield put(reserveGlobtixBookingSuccess(response));
    showToastSuccess(`Booking reserved: ${response?.data?.referenceNumber || ""}`);
  } catch (error) {
    yield put(reserveGlobtixBookingFailure(error.message));
    showToastError("Reserve failed: " + error.message);
  }
}

function* fetchGlobtixAvailabilityCalendarSaga({ payload }) {
  try {
    const response = yield call(getGlobtixAvailabilityCalendar, payload.ticketTypeID, payload.month, payload.environment);
    yield put(fetchGlobtixAvailabilityCalendarSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixAvailabilityCalendarFailure(error.message));
  }
}

function* fetchGlobtixAvailabilityTimeslotSaga({ payload }) {
  try {
    const response = yield call(getGlobtixAvailabilityTimeslot, payload.ticketTypeID, payload.date, payload.environment);
    yield put(fetchGlobtixAvailabilityTimeslotSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixAvailabilityTimeslotFailure(error.message));
  }
}

function* fetchGlobtixTicketUrlsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixTicketUrls, payload.referenceNumber, payload.environment);
    yield put(fetchGlobtixTicketUrlsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixTicketUrlsFailure(error.message));
  }
}

function* fetchGlobtixWebhookEventsSaga({ payload }) {
  try {
    const response = yield call(getGlobtixWebhookEvents, payload);
    yield put(fetchGlobtixWebhookEventsSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixWebhookEventsFailure(error.message));
  }
}

function* fetchRazorpayWebhookEventsSaga({ payload }) {
  try {
    const response = yield call(getRazorpayWebhookEvents, payload);
    yield put(fetchRazorpayWebhookEventsSuccess(response));
  } catch (error) {
    yield put(fetchRazorpayWebhookEventsFailure(error.message));
  }
}

function* fetchGlobtixCreditSaga({ payload }) {
  try {
    const response = yield call(getGlobtixCredit, payload.environment);
    yield put(fetchGlobtixCreditSuccess(response));
  } catch (error) {
    yield put(fetchGlobtixCreditFailure(error.message));
  }
}

function* triggerGlobtixSweepSaga({ payload }) {
  try {
    const response = yield call(triggerGlobtixSweep, payload.environment);
    yield put(triggerGlobtixSweepSuccess(response));
    const expired = response?.data?.expired ?? 0;
    showToastSuccess(`${expired} expired reservation${expired !== 1 ? "s" : ""} cleaned up`);
  } catch (error) {
    yield put(triggerGlobtixSweepFailure(error.message));
    showToastError("Sweep failed: " + error.message);
  }
}

function* exportGlobtixBookingsSaga({ payload }) {
  try {
    const response = yield call(exportGlobtixBookings, payload);
    // Trigger browser download from blob
    const blob = new Blob([response], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `globaltix-bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    yield put(exportGlobtixBookingsSuccess({}));
    showToastSuccess("Bookings exported successfully");
  } catch (error) {
    yield put(exportGlobtixBookingsFailure(error.message));
    showToastError("Export failed: " + error.message);
  }
}

function* globaltixSyncIncrementalSaga({ payload }) {
  try {
    const response = yield call(globaltixSyncIncremental, payload.environment, payload.since);
    yield put(globaltixSyncIncrementalSuccess(response));
    const synced = response?.data?.synced ?? 0;
    showToastSuccess(`Quick sync done: ${synced} product${synced !== 1 ? "s" : ""} updated`);
  } catch (error) {
    yield put(globaltixSyncIncrementalFailure(error.message));
    showToastError("Quick sync failed: " + error.message);
  }
}

function* linkGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(linkGlobtixBookingToTour, payload.referenceNumber, payload.tourBookingId);
    yield put(linkGlobtixBookingSuccess(response));
    showToastSuccess(`Booking ${payload.referenceNumber} linked to TYL booking`);
  } catch (error) {
    yield put(linkGlobtixBookingFailure(error.message));
    showToastError("Link failed: " + error.message);
  }
}

function* unlinkGlobtixBookingSaga({ payload }) {
  try {
    const response = yield call(unlinkGlobtixBookingFromTour, payload.referenceNumber);
    yield put(unlinkGlobtixBookingSuccess(response));
    showToastSuccess(`Booking ${payload.referenceNumber} unlinked`);
    // Refresh booking list so the UI reflects the updated tourBookingId
    if (payload.environment) {
      yield put({ type: "FETCH_GLOBALTIX_BOOKINGS_REQUEST", payload: { environment: payload.environment } });
    }
  } catch (error) {
    yield put(unlinkGlobtixBookingFailure(error.message));
    showToastError("Unlink failed: " + error.message);
  }
}

function* globaltixSaga() {
  yield takeLatest(FETCH_GLOBALTIX_PRODUCTS_REQUEST, fetchGlobtixProductsSaga);
  yield takeLatest(SEARCH_GLOBALTIX_PRODUCTS_REQUEST, searchGlobtixProductsSaga);
  yield takeLatest(FETCH_GLOBALTIX_PRODUCT_DETAIL_REQUEST, fetchGlobtixProductDetailSaga);
  yield takeLatest(LINK_GLOBALTIX_PRODUCT_REQUEST, linkGlobtixProductSaga);
  yield takeLatest(GLOBALTIX_SYNC_FULL_REQUEST, globaltixSyncFullSaga);
  yield takeLatest(GLOBALTIX_SYNC_PRODUCT_REQUEST, globaltixSyncProductSaga);
  yield takeLatest(FETCH_GLOBALTIX_BOOKINGS_REQUEST, fetchGlobtixBookingsSaga);
  yield takeLatest(FETCH_GLOBALTIX_BOOKING_DETAIL_REQUEST, fetchGlobtixBookingDetailSaga);
  yield takeLatest(CANCEL_GLOBALTIX_BOOKING_REQUEST, cancelGlobtixBookingSaga);
  yield takeLatest(CONFIRM_GLOBALTIX_BOOKING_REQUEST, confirmGlobtixBookingSaga);
  yield takeLatest(RELEASE_GLOBALTIX_BOOKING_REQUEST, releaseGlobtixBookingSaga);
  yield takeLatest(RESEND_GLOBALTIX_EMAIL_REQUEST, resendGlobtixEmailSaga);
  yield takeLatest(REFRESH_GLOBALTIX_BOOKING_REQUEST, refreshGlobtixBookingSaga);
  yield takeLatest(RESERVE_GLOBALTIX_BOOKING_REQUEST, reserveGlobtixBookingSaga);
  yield takeLatest(FETCH_GLOBALTIX_AVAILABILITY_CALENDAR_REQUEST, fetchGlobtixAvailabilityCalendarSaga);
  yield takeLatest(FETCH_GLOBALTIX_AVAILABILITY_TIMESLOT_REQUEST, fetchGlobtixAvailabilityTimeslotSaga);
  yield takeLatest(FETCH_GLOBALTIX_TOKEN_REQUEST, fetchGlobtixTokenSaga);
  yield takeLatest(AUTHENTICATE_GLOBALTIX_REQUEST, authenticateGlobtixSaga);
  yield takeLatest(FETCH_GLOBALTIX_TICKET_URLS_REQUEST, fetchGlobtixTicketUrlsSaga);
  yield takeLatest(FETCH_GLOBALTIX_WEBHOOK_EVENTS_REQUEST, fetchGlobtixWebhookEventsSaga);
  yield takeLatest(FETCH_RAZORPAY_WEBHOOK_EVENTS_REQUEST, fetchRazorpayWebhookEventsSaga);
  yield takeLatest(FETCH_GLOBALTIX_CREDIT_REQUEST, fetchGlobtixCreditSaga);
  yield takeLatest(TRIGGER_GLOBALTIX_SWEEP_REQUEST, triggerGlobtixSweepSaga);
  yield takeLatest(EXPORT_GLOBALTIX_BOOKINGS_REQUEST, exportGlobtixBookingsSaga);
  yield takeLatest(LINK_GLOBALTIX_BOOKING_REQUEST, linkGlobtixBookingSaga);
  yield takeLatest(UNLINK_GLOBALTIX_BOOKING_REQUEST, unlinkGlobtixBookingSaga);
  yield takeLatest(GLOBALTIX_SYNC_INCREMENTAL_REQUEST, globaltixSyncIncrementalSaga);
}

export default globaltixSaga;
