import { call, put, takeEvery } from "redux-saga/effects";

// Crypto Redux States
import { DELETE_ALL_INVOICE, DELETE_INVOICE, GET_INVOICES, GET_INVOICE_DETAIL, GET_INVOICE_LIST } from "./actionTypes";
import {
  getInvoiceListSuccess,
  getInvoiceListFail,
  getInvoicesSuccess,
  getInvoicesFail,
  getInvoiceDetailSuccess,
  getInvoiceDetailFail,
} from "./actions";
import { deleteAllInvoice, deleteInvoice, getInvoiceDetail, getInvoices } from "helpers/backend_helper";
import { getInvoiceListAPI } from "../../helpers/location_management_helper";
import { showToastError, showToastSuccess } from "helpers/toastBuilder";

function* fetchInvoices() {
  try {
    const response = yield call(getInvoices);
    yield put(getInvoicesSuccess(response.data));
  } catch (error) {
    yield put(getInvoicesFail(error));
  }
}

function* fetchInvoiceList() {
  try {
    const response = yield call(getInvoiceListAPI)
    const invoices = response.data.invoices

    yield put(getInvoiceListSuccess(invoices))
  } catch (error) {
    yield put(getInvoiceListFail(error.message))
  }
}

function* fetchInvoiceDetail({ invoiceId }) {
  try {
    const response = yield call(getInvoiceDetail, invoiceId);
    yield put(getInvoiceDetailSuccess(response));
  } catch (error) {
    yield put(getInvoiceDetailFail(error));
  }
}

//deleting all invoice
function* onDeleteAllInvoice() {
  try {
    const response = yield call(deleteAllInvoice);
    yield put(deleteAllInvoiceSuccess());
    showToastSuccess("All Invoices Deleted Successfully!", "Deleted !");
  } catch (error) {
    yield put(deleteAllInvoiceFail(error));
    showToastError('Sorry! Invoices failed to Delete, plese try again', 'Error');
  }
}

function* onDeleteInvoice({ payload: { customerId, invoiceId } }) {
  try {
    const response = yield call(deleteInvoice, customerId, invoiceId);
    yield put(deleteInvoiceSuccess(invoiceId));
    showToastSuccess("Invoice Deleted Successfully!", "Deleted !");
  } catch (error) {
    yield put(deleteInvoiceFail(error));
    showToastError('Sorry! Invoice failed to Delete, plese try again', 'Error');
  }
}

function* invoiceSaga() {
  yield takeEvery(GET_INVOICES, fetchInvoices);
  yield takeEvery(GET_INVOICE_LIST, fetchInvoiceList);
  yield takeEvery(GET_INVOICE_DETAIL, fetchInvoiceDetail);
  yield takeEvery(DELETE_ALL_INVOICE, onDeleteAllInvoice);
  yield takeEvery(DELETE_INVOICE, onDeleteInvoice);
}

export default invoiceSaga;
