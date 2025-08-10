import {
  DELETE_ALL_INVOICE,
  DELETE_ALL_INVOICE_FAIL,
  DELETE_ALL_INVOICE_SUCCESS,
  DELETE_INVOICE,
  DELETE_INVOICE_FAIL,
  DELETE_INVOICE_SUCCESS,
  GET_INVOICE_LIST,
  GET_INVOICE_LIST_SUCCESS,
  GET_INVOICE_LIST_FAIL,
  GET_INVOICES,
  GET_INVOICES_FAIL,
  GET_INVOICES_SUCCESS,
  GET_INVOICE_DETAIL,
  GET_INVOICE_DETAIL_FAIL,
  GET_INVOICE_DETAIL_SUCCESS,
} from "./actionTypes"

export const getInvoices = () => ({
  type: GET_INVOICES,
})

export const getInvoicesSuccess = invoices => ({
  type: GET_INVOICES_SUCCESS,
  payload: invoices,
})

export const getInvoicesFail = error => ({
  type: GET_INVOICES_FAIL,
  payload: error,
})

export const getInvoiceDetail = invoiceId => ({
  type: GET_INVOICE_DETAIL,
  invoiceId,
})

export const getInvoiceDetailSuccess = invoices => ({
  type: GET_INVOICE_DETAIL_SUCCESS,
  payload: invoices,
})

export const getInvoiceDetailFail = error => ({
  type: GET_INVOICE_DETAIL_FAIL,
  payload: error,
})

export const deleteAllInvoice = () => ({
  type: DELETE_ALL_INVOICE,
});

export const deleteAllInvoiceSuccess = () => ({
  type: DELETE_ALL_INVOICE_SUCCESS,
});

export const deleteAllInvoiceFail = error => ({
  type: DELETE_ALL_INVOICE_FAIL,
  payload: error,
});

export const deleteInvoice = (customerId, invoiceId) => ({
  type: DELETE_INVOICE,
  payload: { customerId, invoiceId },
});

export const deleteInvoiceSuccess = (customerId, invoiceId) => ({
  type: DELETE_INVOICE_SUCCESS,
  payload: { customerId, invoiceId },
});

export const deleteInvoiceFail = error => ({
  type: DELETE_INVOICE_FAIL,
  payload: error,
});

export const getInvoiceList = () => ({ type: GET_INVOICE_LIST });

export const getInvoiceListSuccess = invoices => ({
  type: GET_INVOICE_LIST_SUCCESS,
  payload: invoices,
});

export const getInvoiceListFail = error => ({
  type: GET_INVOICE_LIST_FAIL,
  payload: error,
});
