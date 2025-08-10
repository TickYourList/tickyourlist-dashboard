import {get, post, put, del, postFormData, putFormData } from "./api_helper";
import * as url from "./locationManagement_url_helpers";


const getCountriesList = () => get(url.GET_COUNTRIES_LIST);
const getCurrencyList = () => get(url.GET_CURRENCY_LIST);
const getCountryByCode = (code) => get(url.GET_COUNTRY_BY_CODE.replace('{code}', code));
const addCountry = (data) => post(url.ADD_COUNTRY, data);


const updateCountry = (countryCode, data) => put(url.UPDATE_COUNTRY.replace('{code}', countryCode), data);

const deleteCountryApi = (countryCode) => {
    // Placeholder for actual API call
    return del(url.DELETE_COUNTRY.replace("{code}", countryCode));
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
};

const getCitiesList = () => get(url.GET_CITIES_LIST)
const getCityData = (cityCode) => get(url.GET_CITY_DATA +'/' + cityCode)

const createNewCity = (formData) => postFormData(url.CREATE_NEW_CITY, formData)
const updateCity = (cityCode, formData) => putFormData(url.UPDATE_CITY + '/' + cityCode, formData)

const removeCity = (cityCode) => del(url.REMOVE_CITY + '/' + cityCode)

//GET ALL TOUR GROUPS
const getAllTourGroupsList = (page, limit) =>
    get(`${url.FETCH_TOUR_GROUP_LIST}?page=${page}&limit=${limit}`)

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
const deleteTravelPartner= id => del(`${url.DELETE_TRAVEL_PARTNER}/${id}`);

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
const getCustomerListAPI = () => get(url.GET_CUSTOMERS_LIST);

//----------------------------------------Product Management Collections--------------------------------------------------
const getPMCollections = () => get(url.GET_PM_COLLECTIONS)

const addPMCollection = ({ cityCode, formData }) =>
  postFormData(`${url.ADD_PM_COLLECTION}${cityCode}`, formData)

const getPMCitylist = () => get(url.GET_PM_CITY_LIST)

const getPMCollectionById =({collectionId, language})=> get(`${url.GET_PM_COLLECTION_BY_ID}${collectionId}/${language}`)

const updatePMCollection = ({ collectionId, formData }) => putFormData(`${url.UPDATE_PM_COLLECTION}${collectionId}`, formData)

const deletePMCollection = ({ collectionId }) => del(`${url.DELETE_PM_COLLECTION}${collectionId}`)  

//----------------------------------------Product Management Collections--------------------------------------------------

const getTourGroupVariants = () => get(url.GET_TOUR_GROUP_VARIANTS);

// Travel Tour Group
// export const getTourGroupVariantsAPI = () =>
//   get(url.GET_TOUR_GROUP_VARIANTS_API);

const getTourGroupVariantsAPI = ({ page = 1, limit = 10 }) =>
  get(url.GET_TOUR_GROUP_VARIANTS_API, { params: { page, limit } });

const getTravelTourGroupAPI = () => get(url.GET_TRAVEL_TOUR_GROUPS_API);
// export const addTourGroupVariantAPI = () =>
//   post(url.POST_ADD_TOUR_GROUP_VARIANT_API)

const addTourGroupVariantAPI = data =>
  post(url.POST_ADD_TOUR_GROUP_VARIANT_API, data);

const updateTourGroupVariantAPI = (variantId, data) =>
  put(`${url.PUT_UPDATE_TOUR_GROUP_VARIANT_API}/${variantId}`, data);

// GET SUB CATEGORIES
const getSubcategoriesList= () => { 
  console.log("The url for getsubcategories ",url.GET_SUBCATEGORIES)
  return get(url.GET_SUBCATEGORIES);
}


//GET_EXISTING_SUBCATEGORY
const getExistingSubcategory=(subCategoryId)=>{
  const newurl = `${url.GET_EXISTING_SUBCATEGORY}${subCategoryId}`;
return get(newurl);
}

const addTravelSubcategoryApi = (formData,cityCode) => {
const finalUrl = `${url.ADD_TRAVEL_SUBCATEGORY}?city=${cityCode}`;
return postFormData(finalUrl, formData);
};

const updateSubcategory=(formData,subCategoryid)=>{
const finalUrl=`${url.UPDATE_SUBCATEGORY}${subCategoryid}`;
return putFormData(finalUrl, formData);
}

const deleteSubcategoryApi=(subCategoryId)=>{
const finalUrl=`${url.DELETE_SUBCATEGORY}${subCategoryId}`;
return del(finalUrl);
}

// GET TRAVEL CATEGORIES
const getTravelCategoriesList= (cityCode) => {
  const newurl = `${url.GET_TRAVELCATEGORIES}${cityCode}`;
  console.log("Fetching travel categories from URL:", newurl);
  return get(newurl);
};

// HomeBanner

const getBannerList = () => get(url.GET_BANNER_LIST);

const getCityList = () => get(url.GET_CITY_LIST).then(res => 

  res.data.travelCityList.map(city => ({ 
    value: city._id,          
    label: city.name   
  }))
);

const getTours = (city) =>
  { const cityId = city.value;
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



export {
    getCountriesList,
    getCurrencyList,
    getCountryByCode,
    addCountry,
    updateCountry,
    deleteCountryApi,
    getCitiesList,
    getCityData,
    createNewCity,
    updateCity,
    removeCity,
    getAllTourGroupsList,
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
    deleteBanner
};