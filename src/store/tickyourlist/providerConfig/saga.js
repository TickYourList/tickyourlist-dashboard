import { call, put, takeLatest } from "redux-saga/effects";
import {
  FETCH_PROVIDER_CONFIGS_REQUEST,
  CREATE_PROVIDER_CONFIG_REQUEST,
  UPDATE_PROVIDER_CONFIG_REQUEST,
  DELETE_PROVIDER_CONFIG_REQUEST,
  FETCH_SUPPORTED_PROVIDERS_REQUEST,
} from "./actionTypes";
import {
  fetchProviderConfigsSuccess, fetchProviderConfigsFailure,
  createProviderConfigSuccess, createProviderConfigFailure,
  updateProviderConfigSuccess, updateProviderConfigFailure,
  deleteProviderConfigSuccess, deleteProviderConfigFailure,
  fetchSupportedProvidersSuccess, fetchSupportedProvidersFailure,
} from "./action";
import {
  getProviderConfigs, createProviderConfig, updateProviderConfig,
  deleteProviderConfig, getSupportedProviders,
} from "../../../helpers/provider_helper";

function* fetchConfigsSaga({ payload }) {
  try {
    const res = yield call(getProviderConfigs, payload);
    yield put(fetchProviderConfigsSuccess(res.data?.data || []));
  } catch (err) {
    yield put(fetchProviderConfigsFailure(err?.response?.data?.message || err.message));
  }
}

function* createConfigSaga({ payload, onSuccess }) {
  try {
    const res = yield call(createProviderConfig, payload);
    yield put(createProviderConfigSuccess(res.data?.data));
    if (onSuccess) onSuccess(res.data?.data);
  } catch (err) {
    yield put(createProviderConfigFailure(err?.response?.data?.message || err.message));
  }
}

function* updateConfigSaga({ payload: { id, data }, onSuccess }) {
  try {
    const res = yield call(updateProviderConfig, id, data);
    yield put(updateProviderConfigSuccess(res.data?.data));
    if (onSuccess) onSuccess(res.data?.data);
  } catch (err) {
    yield put(updateProviderConfigFailure(err?.response?.data?.message || err.message));
  }
}

function* deleteConfigSaga({ payload: id, onSuccess }) {
  try {
    yield call(deleteProviderConfig, id);
    yield put(deleteProviderConfigSuccess(id));
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(deleteProviderConfigFailure(err?.response?.data?.message || err.message));
  }
}

function* fetchSupportedSaga() {
  try {
    const res = yield call(getSupportedProviders);
    yield put(fetchSupportedProvidersSuccess(res.data?.data || []));
  } catch (err) {
    yield put(fetchSupportedProvidersFailure(err?.message));
  }
}

function* providerConfigSaga() {
  yield takeLatest(FETCH_PROVIDER_CONFIGS_REQUEST, fetchConfigsSaga);
  yield takeLatest(CREATE_PROVIDER_CONFIG_REQUEST, createConfigSaga);
  yield takeLatest(UPDATE_PROVIDER_CONFIG_REQUEST, updateConfigSaga);
  yield takeLatest(DELETE_PROVIDER_CONFIG_REQUEST, deleteConfigSaga);
  yield takeLatest(FETCH_SUPPORTED_PROVIDERS_REQUEST, fetchSupportedSaga);
}

export default providerConfigSaga;
