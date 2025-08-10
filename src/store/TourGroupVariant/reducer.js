import {
  GET_TOUR_GROUP_VARIANTS_SUCCESS,
  GET_TOUR_GROUP_VARIANTS_ERROR,
  GET_TRAVEL_TOUR_GROUPS,
  GET_TRAVEL_TOUR_GROUPS_SUCCESS,
  GET_TRAVEL_TOUR_GROUPS_FAIL,
  ADD_TOUR_GROUP_VARIANT,
  ADD_TOUR_GROUP_VARIANT_SUCCESS,
  ADD_TOUR_GROUP_VARIANT_FAIL,
  UPDATE_TOUR_GROUP_VARIANT,
  UPDATE_TOUR_GROUP_VARIANT_SUCCESS,
  UPDATE_TOUR_GROUP_VARIANT_FAIL,
} from "./actionType";

const INIT_STATE = {
  tourGroupVariants: [],
  travelTourGroups: [],
  loading: false,
  error: {},
  updating: false,
  updateError: null,
  updatedVariant: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,
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

    default:
      return state;
  }
};

export default tourGroupVariantReducer;
