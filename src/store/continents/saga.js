import { call, put, takeEvery } from "redux-saga/effects"
import {
  GET_CONTINENTS_DASHBOARD,
  BULK_LINK_CONTINENT,
  BULK_LINK_ALL_COUNTRIES,
  getContinentsDashboardSuccess,
  getContinentsDashboardFailure,
  bulkLinkContinentSuccess,
  bulkLinkContinentFailure,
  bulkLinkAllCountriesSuccess,
  bulkLinkAllCountriesFailure,
  getContinentsDashboard as getContinentsDashboardAction,
} from "./actions"
import { getContinentsDashboard, bulkLinkContinent as bulkLinkContinentAPI, bulkLinkAllCountries as bulkLinkAllCountriesAPI } from "../../helpers/location_management_helper"
import { showToastSuccess, showToastError } from "helpers/toastBuilder"

function* getContinentsDashboardSaga() {
  try {
    const response = yield call(getContinentsDashboard)
    yield put(getContinentsDashboardSuccess(response?.data || {}))
  } catch (error) {
    console.error("Error fetching continents dashboard:", error)
    yield put(getContinentsDashboardFailure(error?.response?.data?.message || "Failed to fetch continents"))
    showToastError(error?.response?.data?.message || "Failed to fetch continents", "Error")
  }
}

function* bulkLinkContinentSaga(action) {
  try {
    const { continentId, countryIds } = action.payload
    const response = yield call(bulkLinkContinentAPI, continentId, countryIds)
    yield put(bulkLinkContinentSuccess(response?.data || {}))
    showToastSuccess(`Successfully linked ${response?.data?.countriesLinked || 0} countries to continent!`, "Success")
    // Refresh continents data after successful link
    yield put(getContinentsDashboardAction())
  } catch (error) {
    console.error("Error linking countries to continent:", error)
    yield put(bulkLinkContinentFailure(error?.response?.data?.message || "Failed to link countries"))
    showToastError(error?.response?.data?.message || "Failed to link countries to continent", "Error")
  }
}

function* bulkLinkAllCountriesSaga() {
  try {
    const response = yield call(bulkLinkAllCountriesAPI)
    yield put(bulkLinkAllCountriesSuccess(response?.data || {}))
    const data = response?.data || {}
    showToastSuccess(
      `Successfully linked ${data.countriesUpdated || 0} countries to continents! ${data.countriesAlreadySet || 0} were already linked.`,
      "Success"
    )
    // Refresh continents data after successful link
    yield put(getContinentsDashboardAction())
  } catch (error) {
    console.error("Error bulk linking all countries:", error)
    yield put(bulkLinkAllCountriesFailure(error?.response?.data?.message || "Failed to bulk link all countries"))
    showToastError(error?.response?.data?.message || "Failed to bulk link all countries", "Error")
  }
}

export default function* continentsSaga() {
  yield takeEvery(GET_CONTINENTS_DASHBOARD, getContinentsDashboardSaga)
  yield takeEvery(BULK_LINK_CONTINENT, bulkLinkContinentSaga)
  yield takeEvery(BULK_LINK_ALL_COUNTRIES, bulkLinkAllCountriesSaga)
}

