import {
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
  FETCH_GLOBALTIX_TOKEN_REQUEST,
  FETCH_GLOBALTIX_TOKEN_SUCCESS,
  FETCH_GLOBALTIX_TOKEN_FAILURE,
  AUTHENTICATE_GLOBALTIX_REQUEST,
  AUTHENTICATE_GLOBALTIX_SUCCESS,
  AUTHENTICATE_GLOBALTIX_FAILURE,
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

  tokenInfo: null,
  tokenLoading: false,

  authLoading: false,
  authError: null,
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
      return { ...state, bookingDetailLoading: true };
    case FETCH_GLOBALTIX_BOOKING_DETAIL_SUCCESS:
      return { ...state, bookingDetailLoading: false, bookingDetail: action.payload.data };
    case FETCH_GLOBALTIX_BOOKING_DETAIL_FAILURE:
      return { ...state, bookingDetailLoading: false };

    case CANCEL_GLOBALTIX_BOOKING_REQUEST:
      return { ...state, cancelLoading: true };
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

    default:
      return state;
  }
};

export default globaltixReducer;
