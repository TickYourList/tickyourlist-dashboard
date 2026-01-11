import { get, post, put, del, postFormData, putFormData } from "./api_helper";
import * as url from "./locationManagement_url_helpers";


const getCountriesList = () => get(url.GET_COUNTRIES_LIST);
const getCurrencyList = () => get(url.GET_CURRENCY_LIST);
const getCountryByCode = (code) => get(url.GET_COUNTRY_BY_CODE.replace('{code}', code));
const addCountry = (data) => post(url.ADD_COUNTRY, data);
const getCountryById = (id) => get(url.GET_COUNTRY_BY_CODE.replace('{code}', id));

const getToursByCountryId = (countryId) => get(url.GET_TOURS_BY_COUNTRY_ID.replace('{country_id}', countryId));
const getCategoriesByCountryId = (countryId) => get(url.GET_CATEGORIES_BY_COUNTRY_ID.replace('{country_id}', countryId));
const getCitiesByCountryId = (countryId) => get(url.GET_CITIES_BY_COUNTRY_ID.replace('{country_id}', countryId));
// New code with the debugging line
const getCollectionsByCountryId = (countryId) => {
  const finalUrl = url.GET_COLLECTIONS_BY_COUNTRY_ID.replace('{country_id}', countryId);
  return get(finalUrl);
};
const getBookingByCountryId = (countryId, { page, limit } = {}) => {
  const finalUrl = url.GET_BOOKING_BY_COUNTRY_ID.replace('{country_id}', countryId);
  const config = (page || limit) ? { params: { page, limit } } : {};
  return get(finalUrl, config);
};
const getSubcategoriesByCountryId = (countryId) => get(url.GET_SUBCATEGORIES_BY_COUNTRY_ID.replace('{country_id}', countryId));


const updateCountry = (countryCode, data) => put(url.UPDATE_COUNTRY.replace('{code}', countryCode), data);

const deleteCountryApi = (countryCode) => {
  // Placeholder for actual API call
  return del(url.DELETE_COUNTRY.replace("{code}", countryCode));
  return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
};

const getCitiesList = () => get(url.GET_CITIES_LIST)
const getCityData = (cityCode) => get(url.GET_CITY_DATA + '/' + cityCode)
const getCityDetails = (cityCode) => get(url.GET_CITY_DETAILS + '/' + cityCode)

const createNewCity = (formData) => postFormData(url.CREATE_NEW_CITY, formData)
const updateCity = (cityCode, formData) => putFormData(url.UPDATE_CITY + '/' + cityCode, formData)

const removeCity = (cityCode) => del(url.REMOVE_CITY + '/' + cityCode)

const getCityTours = ({ cityCode, page, limit }) => get(`${url.CITY_TOURS_API}/${cityCode}?page=${page}&limit=${limit}`)
const getCityCategories = (cityCode) => get(url.CITY_CATEGORIES_API + '/' + cityCode)
const getCitySubCategories = (cityCode) => get(url.CITY_SUBCATEGORIES_API + '/' + cityCode)
const getCityCollections = (cityCode) => get(url.CITY_COLLECTIONS_API + '/' + cityCode)
const getCityBookings = ({ cityCode, page, limit }) => get(`${url.CITY_BOOKINGS_API}/${cityCode}?page=${page}&limit=${limit}`)

//GET ALL TOUR GROUPS
const getAllTourGroupsList = (page, limit, cityCode = null) => {
  let apiUrl = `${url.FETCH_TOUR_GROUP_LIST}?page=${page}&limit=${limit}`;
  if (cityCode) {
    apiUrl += `&cityCode=${cityCode}`;
  }
  return get(apiUrl);
}

//GET TOUR GROUPS BY CITY (lightweight for dropdowns)
const getTourGroupsByCity = (cityCode) => {
  return get(`${url.FETCH_TOUR_GROUPS_BY_CITY}?cityCode=${cityCode}`);
}

//SEARCH TOUR GROUPS BY NAME
const searchTourGroupsByName = (searchQuery, cityCode = null) => {
  let apiUrl = `${url.SEARCH_TOUR_GROUPS}?q=${encodeURIComponent(searchQuery)}`;
  if (cityCode) {
    apiUrl += `&cityCode=${cityCode}`;
  }
  return get(apiUrl);
}

//GET VARIANTS BY TOUR
const getVariantsByTour = (tourId) => {
  return get(`${url.FETCH_VARIANTS_BY_TOUR}/${tourId}`);
}

//REFRESH VARIANT PRICING
const refreshVariantPricing = (variantId) => {
  return post(url.REFRESH_VARIANT_PRICING.replace(':variantId', variantId), {});
}

//GET CONTINENTS DASHBOARD
const getContinentsDashboard = () => {
  return get(url.GET_CONTINENTS_DASHBOARD);
}

//BULK LINK COUNTRIES TO CONTINENT
const bulkLinkContinent = (continentId, countryIds) => {
  return put(url.BULK_LINK_CONTINENT.replace(':continentId', continentId), { countryIds });
}

//BULK LINK ALL COUNTRIES TO CONTINENTS
const bulkLinkAllCountries = () => {
  return post(url.BULK_LINK_ALL_COUNTRIES, {});
}

//GET PRICING RULES BY VARIANT
const getPricingRulesByVariant = (variantId) => {
  return get(`${url.FETCH_PRICING_RULES}/${variantId}`);
}

//CREATE PRICING RULE
const createPricingRule = (variantId, ruleData) => {
  return post(`${url.CREATE_PRICING_RULE}/${variantId}`, ruleData);
}

//UPDATE PRICING RULE
const updatePricingRule = (variantId, tag, ruleData) => {
  return put(`${url.UPDATE_PRICING_RULE}/${variantId}/${tag}`, ruleData);
}

//DELETE PRICING RULE
const deletePricingRule = (variantId, tag) => {
  return del(`${url.DELETE_PRICING_RULE}/${variantId}/${tag}`);
}

//GET SINGLE PRICING RULE
const getPricingRule = (variantId, tag) => {
  return get(`${url.GET_PRICING_RULE}/${variantId}/${tag}`);
}

//FETCH DATE-SPECIFIC PRICING
const fetchDatePricing = (variantId, startDate, endDate) => {
  const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';
  return get(`${url.FETCH_DATE_PRICING}/${variantId}${params}`);
}

//SAVE DATE-SPECIFIC PRICING (create/update)
const saveDatePricing = (variantId, date, pricingData) => {
  return post(`${url.SAVE_DATE_PRICING}/${variantId}`, {
    date,
    ...pricingData
  });
}

//BULK DATE PRICING (for date ranges)
const bulkDatePricing = (variantId, dateRange, pricingData, operation = 'create') => {
  return post(`${url.BULK_DATE_PRICING}/${variantId}/bulk`, {
    operation,
    dateRange,
    pricingData
  });
}

const getTourBookingDetails = id =>
  get(`${url.FETCH_TOUR_GROUP_BY_ID}${id}/bookings`)

//GET TOUR BY ID
const getTourById = id => get(`${url.FETCH_TOUR_GROUP_BY_ID}${id}`)

//ADDING A NEW TOUR GROUP
const addNewTourGroup = (cityCode, data) =>
  postFormData(`${url.ADD_TOUR_GROUP}?cityCode=${cityCode}`, data)

//UPDATING AN EXISTING TOUR GROUP
const updateTourGroupHelper = (id, data) =>
  putFormData(`${url.UPDATE_TOUR_GROUP}/${id}`, data)

//DELETING A TOUR GROUP
const deleteTourGroupById = id => del(`${url.DELETE_TOUR_GROUP}${id}`)

const getTravelPartnerList = (page, limit) => {
  let apiUrl = url.GET_TRAVEL_PARTNERS;
  const params = [];
  if (page !== undefined) params.push(`page=${page}`);
  if (limit !== undefined) params.push(`limit=${limit}`);

  if (params.length > 0) {
    apiUrl += `?${params.join('&')}`;
  }
  return get(apiUrl);
};


//add new Travel Partner
const addTravelPartner = data => postFormData(url.ADD_NEW_TRAVEL_PARTNER, data);

//update Travel Partner
const updateTravelPartner = (userId, data) => putFormData(`${url.UPDATE_TRAVEL_PARTNER}/${userId}`, data);

//delete Travel Partner
const deleteTravelPartner = id => del(`${url.DELETE_TRAVEL_PARTNER}/${id}`);

// GET COUPON
const getCouponList = (page = 1, limit = 10) => get(`${url.GET_COUPON}?page=${page}&limit=${limit}`);

// ADD COUPON
const addCoupon = coupon => post(url.ADD_NEW_COUPON, coupon);

// UPDATE COUPON
const updateCoupon = coupon => put(`${url.UPDATE_COUPON}${coupon._id}`, coupon);

const importCoupons = coupons => post('/v1/tyltravelcoupon/import', { coupons });

const deleteCoupon = couponId => del(`${url.DELETE_COUPON}${couponId}`);

// get invoices list
const getInvoiceListAPI = () => get(url.GET_INVOICES_LIST);

// GET CUSTOMERS LIST
const getCustomerListAPI = (page = 1, limit = 20, dateType = "bookingDate", startDate = "", endDate = "") => {
  let queryString = `page=${page}&limit=${limit}&dateType=${dateType}`;
  if (startDate) queryString += `&startDate=${startDate}`;
  if (endDate) queryString += `&endDate=${endDate}`;
  return get(`${url.GET_CUSTOMERS_LIST.replace('?page=1&limit=20', '')}?${queryString}`);
};

// PREVIEW PENDING EMAIL
const getPreviewPendingEmailAPI = (bookingId) => get(`/v1/tyltourcustomerbooking/booking/${bookingId}/preview-pending-email`);

// SEND PENDING EMAIL
const sendPendingEmailAPI = (bookingId) => post('/v1/access/send-pending-booking-email', { bookingId });

// RESEND CONFIRMATION EMAIL
const resendConfirmationEmailAPI = (bookingId) => post(`/v1/tyltourcustomerbooking/booking/${bookingId}/resend-confirmation-email`, {});

// GET BOOKING DETAILS
const getBookingDetailsAPI = (bookingId) => get(`/v1/access/booking-details/${bookingId}`);

// CONFIRM BOOKING (Manual confirmation)
const confirmBookingAPI = (bookingId, sendInvoice = true) => post(`/v1/tyltourcustomerbooking/booking/${bookingId}/confirm`, { sendInvoice });

// SEND INVOICE (Send invoice email separately)
const sendInvoiceAPI = (bookingId) => post(`/v1/tyltourcustomerbooking/booking/${bookingId}/send-invoice`, {});

// UPDATE BOOKING STATUS (PENDING, CONFIRMED, REFUNDED, CANCELLED)
const updateBookingStatusAPI = (bookingId, status, refundDetails = null) =>
  put(`/v1/tyltourcustomerbooking/booking/${bookingId}/update-status`, { status, refundDetails });

// UPDATE TICKET DELIVERY
const updateTicketDeliveryAPI = (bookingId, ticketDeliveryData) =>
  put(`/v1/tyltourcustomerbooking/booking/${bookingId}/ticket-delivery`, ticketDeliveryData);

//----------------------------------------Product Management Collections--------------------------------------------------
const getPMCollections = () => get(url.GET_PM_COLLECTIONS)

const addPMCollection = ({ cityCode, formData }) =>
  postFormData(`${url.ADD_PM_COLLECTION}${cityCode}`, formData)

const getPMCitylist = () => get(url.GET_PM_CITY_LIST)

const getPMCollectionById = ({ collectionId, language }) => get(`${url.GET_PM_COLLECTION_BY_ID}${collectionId}/${language}`)

const updatePMCollection = ({ collectionId, formData }) => putFormData(`${url.UPDATE_PM_COLLECTION}${collectionId}`, formData)

const deletePMCollection = ({ collectionId }) => del(`${url.DELETE_PM_COLLECTION}${collectionId}`)

//----------------------------------------Product Management Collections--------------------------------------------------

const getTourGroupVariants = () => get(url.GET_TOUR_GROUP_VARIANTS);

// Travel Tour Group
// export const getTourGroupVariantsAPI = () =>
//   get(url.GET_TOUR_GROUP_VARIANTS_API);

const getTourGroupVariantsAPI = ({ page = 1, limit = 10, cityCode = null, tourGroupId = null, variantId = null }) => {
  const params = { page, limit }
  if (cityCode) params.cityCode = cityCode
  if (tourGroupId) params.tourGroupId = tourGroupId
  if (variantId) params.variantId = variantId
  return get(url.GET_TOUR_GROUP_VARIANTS_API, { params })
}

const getTravelTourGroupAPI = () => get(url.GET_TRAVEL_TOUR_GROUPS_API);
// export const addTourGroupVariantAPI = () =>
//   post(url.POST_ADD_TOUR_GROUP_VARIANT_API)

const addTourGroupVariantAPI = data =>
  post(url.POST_ADD_TOUR_GROUP_VARIANT_API, data);

const updateTourGroupVariantAPI = (variantId, data) =>
  put(`${url.PUT_UPDATE_TOUR_GROUP_VARIANT_API}/${variantId}`, data);

// GET SUB CATEGORIES
const getSubcategoriesList = () => {
  console.log("The url for getsubcategories ", url.GET_SUBCATEGORIES)
  return get(url.GET_SUBCATEGORIES);
}


//GET_EXISTING_SUBCATEGORY
const getExistingSubcategory = (subCategoryId) => {
  const newurl = `${url.GET_EXISTING_SUBCATEGORY}${subCategoryId}`;
  return get(newurl);
}

const addTravelSubcategoryApi = (formData, cityCode) => {
  const finalUrl = `${url.ADD_TRAVEL_SUBCATEGORY}?city=${cityCode}`;
  return postFormData(finalUrl, formData);
};

const updateSubcategory = (formData, subCategoryid) => {
  const finalUrl = `${url.UPDATE_SUBCATEGORY}${subCategoryid}`;
  return putFormData(finalUrl, formData);
}

const deleteSubcategoryApi = (subCategoryId) => {
  const finalUrl = `${url.DELETE_SUBCATEGORY}${subCategoryId}`;
  return del(finalUrl);
}

// GET TRAVEL CATEGORIES
const getTravelCategoriesList = (cityCode) => {
  const newurl = `${url.GET_TRAVELCATEGORIES}${cityCode}`;
  console.log("Fetching travel categories from URL:", newurl);
  return get(newurl);
};

//GET_TRAVEL_CITIES
const getTravelCitiesList = () => {
  return get(url.GET_TRAVEL_CITIES);
};

//GET_EXISTING_SUBCATEGORY
const getExistingSubcategoryForEdit = (subCategoryId) => {
  const newurl = `${url.GET_EXISTING_SUBCATEGORY_FOR_EDIT}${subCategoryId}`;
  return get(newurl);
}



// HomeBanner

const getBannerList = () => get(url.GET_BANNER_LIST);

const getCityList = () => get(url.GET_CITY_LIST).then(res =>

  res.data.travelCityList.map(city => ({
    value: city._id,
    label: city.name
  }))
);

const getTours = (city) => {
  const cityId = city.value;
  let baseUrl = url.GET_TOURS;

  const separator = baseUrl.includes('?') ? '&' : '?';

  const fullUrl = `${baseUrl}${separator}city=${cityId}`;

  return get(fullUrl).then(res =>
    res.data.map(tour => ({
      value: tour._id,
      label: tour.displayName
    }))
  );
};

const getCategories = (cityId) => get(`${url.GET_CATEGORIES}?city=${cityId}`).then(res =>
  res.data.map(category => ({
    value: category._id,
    label: category.displayName
  }))
);

const getSubcategories = (cityId) => get(`${url.GET_SUBCATEGORIES}?city=${cityId}`).then(res =>
  res.data.map(subcategory => ({
    value: subcategory._id,
    label: subcategory.displayName
  }))
);


const getBannerCollections = (city) => {

  const cityId = city.value;
  let baseUrl = url.GET_BANNER_COLLECTIONS;

  const separator = baseUrl.includes('?') ? '&' : '?';

  const fullUrl = `${baseUrl}${separator}city=${cityId}`;

  return get(fullUrl).then(res =>
    res.data.map(collection => ({
      value: collection._id,
      label: collection.displayName
    }))
  );
};

const addNewBanner = (bannerData) => postFormData(url.ADD_NEW_BANNER, bannerData);

const editBanner = (id, banner) => putFormData(`${url.EDIT_BANNER}/${id}`, banner);

const deleteBanner = (bannerId) => del(`${url.DELETE_BANNER}/${bannerId}`);

// HomeBanner Permissions
const getPermissionsList = id => get(`${url.GET_PERMISSIONS_LIST}`)

const getCategoriesList = () => get(url.GET_CATEGORIES_LIST);

const getCategoryById = (id) =>
  get(url.GET_CATEGORY_BY_ID.replace("{id}", id));

const deleteCategory = (id) =>
  del(url.DELETE_CATEGORY.replace("{id}", id));

const updateCategory = (id, data) =>
  putFormData(url.UPDATE_CATEGORY.replace("{id}", id), data, {
    "Content-Type": "multipart/form-data",
  });

const addCategory = (data, cityCode) =>
  postFormData(url.ADD_CATEGORY.replace("{cityCode}", cityCode), data);

const getCategoryByUrl = (id) => {

  return get(url.GET_CATEGORY_URL.replace("{id}", id));
};

const getCategoryTours = (id) => get(url.GET_CATEGORY_TOURS.replace("{id}", id));
const getCategorySubcategories = (id) => get(url.GET_CATEGORY_SUBCATEGORIES.replace("{id}", id));

const getCategoryBookings = (id) => get(url.GET_CATEGORY_BOOKINGS.replace("{id}", id));
const getCities = () => get(url.GET_CITIES);

// export const addTourGroupVariantAPI = () =>
//   post(url.POST_ADD_TOUR_GROUP_VARIANT_API)

// export const addTourGroupVariantAPI = data =>
//   post(url.POST_ADD_TOUR_GROUP_VARIANT_API, data);

// export const updateTourGroupVariantAPI = (variantId, data) =>
//   put(`${url.PUT_UPDATE_TOUR_GROUP_VARIANT_API}/${variantId}`, data);

export const getTourGroupVariantDetailAPI = variantId =>
  get(`${url.GET_TOUR_GROUP_VARIANT_DETAIL_API}/${variantId}/details`);

export const getPricingListAPI = variantId =>
  get(`${url.GET_PRICING_LIST_API}/${variantId}/pricing-table`);

export const getBookingListAPI = variantId =>
  get(`${url.GET_BOOKING_LIST_API}/${variantId}/bookings`);

const updateVariantPrices = (variantId, data) =>
  put(`${url.UPDATE_VARIANT_PRICES}/${variantId}`, data);


const getSectionDetailsById = (sectionId) => get(`${url.GET_SECTION_LIST}/${sectionId}`);

const getCategoriesForCity = (cityCode) => get(`${url.GET_CATEGORIES_FOR_CITY}/${cityCode}`);

const getSubcategoriesForCity = (cityCode) => get(`${url.GET_SUBCATEGORIES_FOR_CITY}/${cityCode}`);

const getToursForCity = (cityCode) => get(`${url.GET_TOURS_FOR_CITY}/${cityCode}`);

const getCollectionsForCity = (cityCode) => get(`${url.GET_COLLECTIONS_FOR_CITY}/${cityCode}`);

//Pricing Calendar
const onAddDefaultCalendarPricing = (data) => {
  return postFormData(`${url.ON_ADD_DEFAUL_PRICING}`, data)
}

// GET SUBCATEGORY DETAILS FOR VIEW
const getSubcategoryDetailsForView = (subcategoryId) => {
  const newurl = `${url.GET_SUBCATEGORY_DETAILS_FOR_VIEW}${subcategoryId}`;
  console.log("Fetching subcategory details for view from URL:", newurl);
  return get(newurl);
};

const getSubcategoryDetailsForViewToursTable = (subcategoryId) => {
  const newurl = `${url.GET_SUBCATEGORY_VIEW_TOURS_TABLE}${subcategoryId}/tours`;
  return get(newurl);
};



const getSubcategoryDetailsForViewBookingsTable = (subcategoryId) => {
  const newurl = `${url.GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE}${subcategoryId}/bookings`;
  console.log("Fetching subcategory view bookings table from URL:", newurl);
  return get(newurl);
};

const getUsersPermissionsForSubcategory = () => {
  const newurl = `${url.GET_USERS_PERMISSIONS_FOR_SUBCATEGORY}`;
  console.log("Fetching user permissions for subcategory from URL:", newurl);
  return get(newurl);
}

const sortCategory = (categoryOrder) => put(url.SORT_CATEGORY_API, categoryOrder);
const sortSubCategory = ({ categoryId, subcategoryOrders }) => put(url.SORT_SUB_CATEGORY_API + '/' + categoryId, { subcategoryOrders });

// Sort City Categories - using the same API as sortCategory
const sortCityCategories = (data) => put(url.SORT_CATEGORY_API, data);

// Sort City Sub Categories - using the same API as sortSubCategory
const sortCitySubCategories = (data) => {
  const { categoryId, subcategoryOrders } = data;
  return put(url.SORT_SUB_CATEGORY_API + '/' + categoryId, { subcategoryOrders });
};

const getSettings = () => get(url.GET_SETTINGS);
const updateSystemSettings = (data) =>
  putFormData(url.UPDATE_SYSTEM_SETTINGS, data, {
    "Content-Type": "multipart/form-data",
  });

// faqs List
const getFaqsList = () => get(url.GET_FAQS_LIST);
const getFaqsByCity = (cityCode) => get(url.GET_FAQS_BY_CITY + cityCode);
const getFaqById = (id) => get(url.GET_FAQ_BY_ID + id);
const addFaqs = faqData => post(url.ADD_NEW_FAQS, faqData);
const updateFaqs = (id, faqData) => put(url.UPDATE_FAQS + id, faqData);

// Tour Group Connections
// Klook Mapping APIs
const getKlookMappings = (tourGroupId) => {
  return get(`/v1/klook/mapping/product/${tourGroupId}`);
};

const searchKlookActivities = (query = "") => {
  // Fetch activities and filter client-side if needed
  const params = query ? { limit: 50, page: 1 } : { limit: 20, page: 1 };
  // Klook API requires Accept-Language in format like 'en_US' (not browser format)
  return get(`/v1/klook/api/activities`, {
    params,
    headers: {
      'Accept-Language': 'en_US' // Klook expects format: en_US, zh_CN, etc.
    }
  });
};

const getKlookActivity = (activityId) => {
  // Klook API requires Accept-Language in format like 'en_US' (not browser format)
  return get(`/v1/klook/api/activities/${activityId}`, {
    headers: {
      'Accept-Language': 'en_US' // Klook expects format: en_US, zh_CN, etc.
    }
  });
};

const bulkLinkKlookMappings = (mappings) => {
  return post(`/v1/klook/mapping/bulk-link`, { mappings });
};

const getKlookLivePricing = (tourGroupId, startDate, endDate, variantId, currency) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (variantId) params.variantId = variantId;
  if (currency) params.currency = currency; // Add currency parameter

  return get(`/v1/klook/pricing/live/${tourGroupId}`, { params });
};

const getSupportedCurrencies = () => {
  return get(`/v1/klook/pricing/currencies`);
};

const connectTourGroupToCategories = (tourGroupId, categoryIds, subcategoryIds) => {
  // Convert to array of IDs (strings) as expected by the API
  const categoryConnections = Array.isArray(categoryIds) ? categoryIds : [];
  const subcategoryConnections = Array.isArray(subcategoryIds) ? subcategoryIds : [];

  return put(`${url.CONNECT_TOUR_GROUP}/${tourGroupId}/connections`, {
    categoryConnections,
    subcategoryConnections
  });
};

const bulkConnectToursToCategory = (categoryId, tourGroupIds) => {
  return put(`${url.BULK_CONNECT_TOURS_TO_CATEGORY}/${categoryId}`, { tourGroupIds });
};

const bulkConnectToursToSubcategory = (subcategoryId, tourGroupIds) => {
  return put(`${url.BULK_CONNECT_TOURS_TO_SUBCATEGORY}/${subcategoryId}`, { tourGroupIds });
};

const createVariantFromKlookPackage = (tourGroupId, klookActivityId, klookPackageId) => {
  return post(`/v1/klook/sync/create-variant`, {
    tourGroupId,
    klookActivityId,
    klookPackageId,
  });
};

const deleteKlookMapping = (mappingId) => {
  return del(`/v1/klook/mapping/${mappingId}`);
};

export {
  getCountriesList,
  getCurrencyList,
  getCountryByCode,
  getCountryById,
  addCountry,
  updateCountry,
  deleteCountryApi,
  getCitiesList,
  getCityData,
  getCityDetails,
  createNewCity,
  updateCity,
  removeCity,
  getCityTours,
  getCityCategories,
  getCitySubCategories,
  getCityCollections,
  getCityBookings,
  getAllTourGroupsList,
  getTourGroupsByCity,
  searchTourGroupsByName,
  getVariantsByTour,
  refreshVariantPricing,
  getContinentsDashboard,
  bulkLinkContinent,
  bulkLinkAllCountries,
  getPricingRulesByVariant,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getPricingRule,
  fetchDatePricing,
  saveDatePricing,
  bulkDatePricing,
  getTourById,
  addNewTourGroup,
  updateTourGroupHelper,
  deleteTourGroupById,
  getTravelPartnerList,
  addTravelPartner,
  updateTravelPartner,
  deleteTravelPartner,
  getCouponList,
  addCoupon,
  updateCoupon,
  importCoupons,
  deleteCoupon,
  getInvoiceListAPI,
  getCustomerListAPI,
  getPreviewPendingEmailAPI,
  sendPendingEmailAPI,
  resendConfirmationEmailAPI,
  getBookingDetailsAPI,
  confirmBookingAPI,
  sendInvoiceAPI,
  updateBookingStatusAPI,
  updateTicketDeliveryAPI,
  getPMCollectionById,
  getPMCollections,
  addPMCollection,
  updatePMCollection,
  deletePMCollection,
  getPMCitylist,
  getTourGroupVariants,
  getTourGroupVariantsAPI,
  getTravelTourGroupAPI,
  addTourGroupVariantAPI,
  updateTourGroupVariantAPI,
  updateVariantPrices,
  getSubcategoriesList,
  getExistingSubcategory,
  addTravelSubcategoryApi,
  updateSubcategory,
  deleteSubcategoryApi,
  getTravelCategoriesList,
  getBannerList,
  getCityList,
  getTours,
  getCategories,
  getSubcategories,
  getBannerCollections,
  addNewBanner,
  editBanner,
  deleteBanner,
  getCategoriesList,
  getCategoryById,
  deleteCategory,
  updateCategory,
  addCategory,
  getToursByCountryId,
  getCitiesByCountryId,
  getCategoriesByCountryId,
  getCollectionsByCountryId,
  getSubcategoriesByCountryId,
  getBookingByCountryId,
  getCategoryByUrl,
  getCategoryTours,
  getCategorySubcategories,
  getCategoryBookings,
  getCities,
  getSectionDetailsById,
  getCategoriesForCity,
  getSubcategoriesForCity,
  getToursForCity,
  getCollectionsForCity,
  getPermissionsList,
  onAddDefaultCalendarPricing,
  getSubcategoryDetailsForView,
  getSubcategoryDetailsForViewToursTable,
  getSubcategoryDetailsForViewBookingsTable,
  getUsersPermissionsForSubcategory,
  sortCategory,
  sortSubCategory,
  sortCityCategories,
  sortCitySubCategories,
  getTourBookingDetails,
  getSettings,
  updateSystemSettings,
  getFaqsList,
  getFaqsByCity,
  getFaqById,
  addFaqs,
  updateFaqs,
  connectTourGroupToCategories,
  bulkConnectToursToCategory,
  bulkConnectToursToSubcategory,
  getKlookMappings,
  searchKlookActivities,
  getKlookActivity,
  bulkLinkKlookMappings,
  getKlookLivePricing,
  createVariantFromKlookPackage,
  deleteKlookMapping,
  getSupportedCurrencies,

};