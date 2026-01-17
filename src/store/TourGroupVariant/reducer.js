import {
  GET_TOUR_GROUP_VARIANTS_SUCCESS,
  GET_TOUR_GROUP_VARIANTS_ERROR,
  GET_TOUR_GROUP_VARIANT_BY_ID,
  GET_TOUR_GROUP_VARIANT_BY_ID_SUCCESS,
  GET_TOUR_GROUP_VARIANT_BY_ID_FAIL,
  GET_TRAVEL_TOUR_GROUPS,
  GET_TRAVEL_TOUR_GROUPS_SUCCESS,
  GET_TRAVEL_TOUR_GROUPS_FAIL,
  ADD_TOUR_GROUP_VARIANT,
  ADD_TOUR_GROUP_VARIANT_SUCCESS,
  ADD_TOUR_GROUP_VARIANT_FAIL,
  UPDATE_TOUR_GROUP_VARIANT,
  UPDATE_TOUR_GROUP_VARIANT_SUCCESS,
  UPDATE_TOUR_GROUP_VARIANT_FAIL,
  GET_TOUR_GROUP_VARIANT_DETAIL,
  GET_TOUR_GROUP_VARIANT_DETAIL_SUCCESS,
  GET_TOUR_GROUP_VARIANT_DETAIL_FAIL,
  GET_PRICING_LIST,
  GET_PRICING_LIST_SUCCESS,
  GET_PRICING_LIST_FAIL,
  GET_BOOKING_LIST,
  GET_BOOKING_LIST_SUCCESS,
  GET_BOOKING_LIST_FAIL,
  DELETE_TOUR_GROUP_VARIANT,
  DELETE_TOUR_GROUP_VARIANT_SUCCESS,
  DELETE_TOUR_GROUP_VARIANT_FAIL,
} from "./actionType";

const INIT_STATE = {
  tourGroupVariants: [],
  travelTourGroups: [],
  selectedVariant: null,
  tourGroupVariantDetail: null,
  pricingList: [],
  bookingList: [],
  loading: false,
  error: {},
  updating: false,
  updateError: null,
  updatedVariant: null,
  bookingTourGroup: null,
  pricingLoading: false,
  pricingError: null,
  bookingLoading: false,
  bookingError: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,
  detailLoading: false,
  detailError: null,
};

const tourGroupVariantReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_TOUR_GROUP_VARIANTS_SUCCESS:
      const variants = action.payload?.variants || [];
      const sortedVariants = variants.sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return b.sortOrder - a.sortOrder;
        }
        return 0;
      });
      return {
        ...state,
        tourGroupVariants: sortedVariants,
        totalRecords: action.payload?.totalRecords,
        currentPage: action.payload?.page,
        pageSize: action.payload?.limit,
      };

    case GET_TOUR_GROUP_VARIANTS_ERROR:
      return {
        ...state,
        error: action.payload,
      };

      case GET_TOUR_GROUP_VARIANT_BY_ID:
        return {
          ...state,
          loading: true,
          selectedVariant: null,
          error: null,
        };
  
      case GET_TOUR_GROUP_VARIANT_BY_ID_SUCCESS:
        return {
          ...state,
          selectedVariant: action.payload,
          loading: false,
        };
  
      case GET_TOUR_GROUP_VARIANT_BY_ID_FAIL:
        return {
          ...state,
          selectedVariant: null,
          loading: false,
          error: action.payload,
        };

    case GET_TRAVEL_TOUR_GROUPS:
      return {
        ...state,
        loading: true,
      };

    case GET_TRAVEL_TOUR_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        travelTourGroups: action.payload,
      };

    case GET_TRAVEL_TOUR_GROUPS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ADD_TOUR_GROUP_VARIANT:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADD_TOUR_GROUP_VARIANT_SUCCESS:
      return {
        ...state,
        variantAddResponse: action.payload,
        loading: false,
        error: null,
      };

    case ADD_TOUR_GROUP_VARIANT_FAIL:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case UPDATE_TOUR_GROUP_VARIANT:
      return {
        ...state,
        updating: true,
        updateError: null,
      };

    case UPDATE_TOUR_GROUP_VARIANT_SUCCESS:
      return {
        ...state,
        updating: false,
        updatedVariant: action.payload,
      };

    case UPDATE_TOUR_GROUP_VARIANT_FAIL:
      return {
        ...state,
        updating: false,
        updateError: action.payload,
      };

    case GET_TOUR_GROUP_VARIANT_DETAIL:
      return {
        ...state,
        detailLoading: true,
        tourGroupVariantDetail: null,
        detailError: null,
      };

    case GET_TOUR_GROUP_VARIANT_DETAIL_SUCCESS:
      return {
        ...state,
        detailLoading: false,
        tourGroupVariantDetail: action.payload,
      };

    case GET_TOUR_GROUP_VARIANT_DETAIL_FAIL:
      return {
        ...state,
        detailLoading: false,
        detailError: action.payload,
      };

    case GET_PRICING_LIST:
      return {
        ...state,
        pricingLoading: true,
        pricingList: [],
        pricingError: null,
      };

    case GET_PRICING_LIST_SUCCESS:
      return {
        ...state,
        pricingLoading: false,
        pricingList: action.payload,
      };

    case GET_PRICING_LIST_FAIL:
      return {
        ...state,
        pricingLoading: false,
        pricingError: action.payload,
      };

    case GET_BOOKING_LIST:
      return {
        ...state,
        bookingLoading: true,
        bookingList: [],
        bookingTourGroup: null,
        bookingError: null,
      };

    case GET_BOOKING_LIST_SUCCESS:
      return {
        ...state,
        bookingLoading: false,
        bookingList: action.payload || [],
      };

    case GET_BOOKING_LIST_FAIL:
      return {
        ...state,
        bookingLoading: false,
        bookingError: action.payload,
      };

    case DELETE_TOUR_GROUP_VARIANT:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_TOUR_GROUP_VARIANT_SUCCESS:
      return {
        ...state,
        loading: false,
        tourGroupVariants: state.tourGroupVariants.filter(
          variant => variant._id !== action.payload
        ),
        totalRecords: state.totalRecords - 1,
      };

    case DELETE_TOUR_GROUP_VARIANT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default tourGroupVariantReducer;
