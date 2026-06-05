import {
  FETCH_PROVIDER_CONFIGS_REQUEST,
  FETCH_PROVIDER_CONFIGS_SUCCESS,
  FETCH_PROVIDER_CONFIGS_FAILURE,
  CREATE_PROVIDER_CONFIG_REQUEST,
  CREATE_PROVIDER_CONFIG_SUCCESS,
  CREATE_PROVIDER_CONFIG_FAILURE,
  UPDATE_PROVIDER_CONFIG_REQUEST,
  UPDATE_PROVIDER_CONFIG_SUCCESS,
  UPDATE_PROVIDER_CONFIG_FAILURE,
  DELETE_PROVIDER_CONFIG_REQUEST,
  DELETE_PROVIDER_CONFIG_SUCCESS,
  DELETE_PROVIDER_CONFIG_FAILURE,
  FETCH_SUPPORTED_PROVIDERS_REQUEST,
  FETCH_SUPPORTED_PROVIDERS_SUCCESS,
  FETCH_SUPPORTED_PROVIDERS_FAILURE,
} from "./actionTypes";

export const fetchProviderConfigsRequest = (params) => ({ type: FETCH_PROVIDER_CONFIGS_REQUEST, payload: params });
export const fetchProviderConfigsSuccess = (data) => ({ type: FETCH_PROVIDER_CONFIGS_SUCCESS, payload: data });
export const fetchProviderConfigsFailure = (error) => ({ type: FETCH_PROVIDER_CONFIGS_FAILURE, payload: error });

export const createProviderConfigRequest = (data, onSuccess) => ({ type: CREATE_PROVIDER_CONFIG_REQUEST, payload: data, onSuccess });
export const createProviderConfigSuccess = (data) => ({ type: CREATE_PROVIDER_CONFIG_SUCCESS, payload: data });
export const createProviderConfigFailure = (error) => ({ type: CREATE_PROVIDER_CONFIG_FAILURE, payload: error });

export const updateProviderConfigRequest = (id, data, onSuccess) => ({ type: UPDATE_PROVIDER_CONFIG_REQUEST, payload: { id, data }, onSuccess });
export const updateProviderConfigSuccess = (data) => ({ type: UPDATE_PROVIDER_CONFIG_SUCCESS, payload: data });
export const updateProviderConfigFailure = (error) => ({ type: UPDATE_PROVIDER_CONFIG_FAILURE, payload: error });

export const deleteProviderConfigRequest = (id, onSuccess) => ({ type: DELETE_PROVIDER_CONFIG_REQUEST, payload: id, onSuccess });
export const deleteProviderConfigSuccess = (id) => ({ type: DELETE_PROVIDER_CONFIG_SUCCESS, payload: id });
export const deleteProviderConfigFailure = (error) => ({ type: DELETE_PROVIDER_CONFIG_FAILURE, payload: error });

export const fetchSupportedProvidersRequest = () => ({ type: FETCH_SUPPORTED_PROVIDERS_REQUEST });
export const fetchSupportedProvidersSuccess = (data) => ({ type: FETCH_SUPPORTED_PROVIDERS_SUCCESS, payload: data });
export const fetchSupportedProvidersFailure = (error) => ({ type: FETCH_SUPPORTED_PROVIDERS_FAILURE, payload: error });
