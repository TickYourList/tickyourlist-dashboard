import {
  FETCH_PROVIDER_CONFIGS_REQUEST, FETCH_PROVIDER_CONFIGS_SUCCESS, FETCH_PROVIDER_CONFIGS_FAILURE,
  CREATE_PROVIDER_CONFIG_REQUEST, CREATE_PROVIDER_CONFIG_SUCCESS, CREATE_PROVIDER_CONFIG_FAILURE,
  UPDATE_PROVIDER_CONFIG_REQUEST, UPDATE_PROVIDER_CONFIG_SUCCESS, UPDATE_PROVIDER_CONFIG_FAILURE,
  DELETE_PROVIDER_CONFIG_REQUEST, DELETE_PROVIDER_CONFIG_SUCCESS, DELETE_PROVIDER_CONFIG_FAILURE,
  FETCH_SUPPORTED_PROVIDERS_REQUEST, FETCH_SUPPORTED_PROVIDERS_SUCCESS, FETCH_SUPPORTED_PROVIDERS_FAILURE,
} from "./actionTypes";

const initialState = {
  configs: [],
  configsLoading: false,
  configsError: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  supportedProviders: [],
  supportedProvidersLoading: false,
};

const providerConfig = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROVIDER_CONFIGS_REQUEST:
      return { ...state, configsLoading: true, configsError: null };
    case FETCH_PROVIDER_CONFIGS_SUCCESS:
      return { ...state, configsLoading: false, configs: action.payload };
    case FETCH_PROVIDER_CONFIGS_FAILURE:
      return { ...state, configsLoading: false, configsError: action.payload };

    case CREATE_PROVIDER_CONFIG_REQUEST:
      return { ...state, createLoading: true, createError: null };
    case CREATE_PROVIDER_CONFIG_SUCCESS:
      return { ...state, createLoading: false, configs: [...state.configs, action.payload] };
    case CREATE_PROVIDER_CONFIG_FAILURE:
      return { ...state, createLoading: false, createError: action.payload };

    case UPDATE_PROVIDER_CONFIG_REQUEST:
      return { ...state, updateLoading: true, updateError: null };
    case UPDATE_PROVIDER_CONFIG_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        configs: state.configs.map(c => c._id === action.payload._id ? action.payload : c),
      };
    case UPDATE_PROVIDER_CONFIG_FAILURE:
      return { ...state, updateLoading: false, updateError: action.payload };

    case DELETE_PROVIDER_CONFIG_REQUEST:
      return { ...state, deleteLoading: true, deleteError: null };
    case DELETE_PROVIDER_CONFIG_SUCCESS:
      return { ...state, deleteLoading: false, configs: state.configs.filter(c => c._id !== action.payload) };
    case DELETE_PROVIDER_CONFIG_FAILURE:
      return { ...state, deleteLoading: false, deleteError: action.payload };

    case FETCH_SUPPORTED_PROVIDERS_REQUEST:
      return { ...state, supportedProvidersLoading: true };
    case FETCH_SUPPORTED_PROVIDERS_SUCCESS:
      return { ...state, supportedProvidersLoading: false, supportedProviders: action.payload };
    case FETCH_SUPPORTED_PROVIDERS_FAILURE:
      return { ...state, supportedProvidersLoading: false };

    default:
      return state;
  }
};

export default providerConfig;
