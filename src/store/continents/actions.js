export const GET_CONTINENTS_DASHBOARD = "GET_CONTINENTS_DASHBOARD"
export const GET_CONTINENTS_DASHBOARD_SUCCESS = "GET_CONTINENTS_DASHBOARD_SUCCESS"
export const GET_CONTINENTS_DASHBOARD_FAILURE = "GET_CONTINENTS_DASHBOARD_FAILURE"

export const BULK_LINK_CONTINENT = "BULK_LINK_CONTINENT"
export const BULK_LINK_CONTINENT_SUCCESS = "BULK_LINK_CONTINENT_SUCCESS"
export const BULK_LINK_CONTINENT_FAILURE = "BULK_LINK_CONTINENT_FAILURE"

export const BULK_LINK_ALL_COUNTRIES = "BULK_LINK_ALL_COUNTRIES"
export const BULK_LINK_ALL_COUNTRIES_SUCCESS = "BULK_LINK_ALL_COUNTRIES_SUCCESS"
export const BULK_LINK_ALL_COUNTRIES_FAILURE = "BULK_LINK_ALL_COUNTRIES_FAILURE"

export const getContinentsDashboard = () => ({
  type: GET_CONTINENTS_DASHBOARD,
})

export const getContinentsDashboardSuccess = (data) => ({
  type: GET_CONTINENTS_DASHBOARD_SUCCESS,
  payload: data,
})

export const getContinentsDashboardFailure = (error) => ({
  type: GET_CONTINENTS_DASHBOARD_FAILURE,
  payload: error,
})

export const bulkLinkContinent = (continentId, countryIds) => ({
  type: BULK_LINK_CONTINENT,
  payload: { continentId, countryIds },
})

export const bulkLinkContinentSuccess = (data) => ({
  type: BULK_LINK_CONTINENT_SUCCESS,
  payload: data,
})

export const bulkLinkContinentFailure = (error) => ({
  type: BULK_LINK_CONTINENT_FAILURE,
  payload: error,
})

export const bulkLinkAllCountries = () => ({
  type: BULK_LINK_ALL_COUNTRIES,
})

export const bulkLinkAllCountriesSuccess = (data) => ({
  type: BULK_LINK_ALL_COUNTRIES_SUCCESS,
  payload: data,
})

export const bulkLinkAllCountriesFailure = (error) => ({
  type: BULK_LINK_ALL_COUNTRIES_FAILURE,
  payload: error,
})

