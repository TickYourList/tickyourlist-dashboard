import {
  GET_INVOICES_FAIL,
  GET_INVOICES_SUCCESS,
  GET_INVOICE_LIST,
  GET_INVOICE_LIST_SUCCESS,
  GET_INVOICE_LIST_FAIL,
  GET_INVOICE_DETAIL_SUCCESS,
  GET_INVOICE_DETAIL_FAIL,
  DELETE_INVOICE_SUCCESS,
  DELETE_INVOICE_FAIL,
  DELETE_ALL_INVOICE_SUCCESS,
  DELETE_ALL_INVOICE_FAIL,
} from "./actionTypes"

const INIT_STATE = {
  invoices: [],
  invoiceDetail: {},
  invoiceList: [],
  loading: false,
  error: null,
}

const Invoices = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_INVOICES_SUCCESS:
      return {
        ...state,
        invoices: action.payload,
      }

    case GET_INVOICES_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case GET_INVOICE_DETAIL_SUCCESS:
      return {
        ...state,
        invoiceDetail: action.payload,
      }

    case GET_INVOICE_DETAIL_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case DELETE_INVOICE_SUCCESS:
      return {
        ...state,
        invoices: state.invoices.filter(
          invoice => invoice._id.toString() !== action.payload.toString()
        ),
      };

    case DELETE_INVOICE_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    case DELETE_ALL_INVOICE_SUCCESS:
      return {
        ...state,
        invoices: [],
      };

    case DELETE_ALL_INVOICE_FAIL:
      return {
        ...state,
        error: action.payload,
      };
      case GET_INVOICE_LIST:
        return { ...state, loading: true };
  
      case GET_INVOICE_LIST_SUCCESS:
        return { ...state, loading: false, invoiceList: action.payload };
  
      case GET_INVOICE_LIST_FAIL:
        return { ...state, loading: false, error: action.payload };

    default:
      return state
  }
}

export default Invoices
