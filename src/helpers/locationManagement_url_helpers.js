export const GET_CURRENCY_LIST = "v1/tyltravelcurrency/get/travelcurrency/submitted/all";
export const UPDATE_COUNTRY = "v1/tyltravelcountry/update/travel-country/{code}";
export const GET_COUNTRY_BY_CODE = "v1/tyltravelcountry/get/travelcountry/{code}";
export const ADD_COUNTRY = "v1/tyltravelcountry/add/travel-country";
export const DELETE_COUNTRY = "v1/tyltravelcountry/delete/travel-country/{code}";
export const GET_CITIES_LIST = "v1/tyltravelcity/get/travelcity/submitted/all";
export const GET_CITY_DATA = "v1/tyltravelcity/get/travelcity";
export const GET_COUNTRIES_LIST = "v1/tyltravelcountry/get/travelcountry/submitted/all";

export const CREATE_NEW_CITY = "v1/tyltravelcity/add/travel-city";

export const UPDATE_CITY = "v1/tyltravelcity/update/travel-city";

export const REMOVE_CITY = "v1/tyltravelcity/delete/travel-city";

export const FETCH_TOUR_GROUP_LIST =
  "/v1/tyltraveltourgroup/get/all/travel-tour-groups-list"
export const ADD_TOUR_GROUP = "/v1/tyltraveltourgroup/add/travel-tour-group"
export const UPDATE_TOUR_GROUP = "/v1/tyltraveltourgroup/update/tour-group"
export const FETCH_TOUR_GROUP_BY_ID = "/v1/tyltraveltourgroup/get/tour-group/"
export const DELETE_TOUR_GROUP = "/v1/tyltraveltourgroup/tour-group/"

export const GET_TRAVEL_PARTNERS = "v1/tyltravelpartner/all";

//Add new partner
export const ADD_NEW_TRAVEL_PARTNER = "v1/tyltravelpartner/create";

export const UPDATE_TRAVEL_PARTNER = "v1/tyltravelpartner/update";
export const DELETE_TRAVEL_PARTNER = "v1/tyltravelpartner";

// operations/Coupons
export const GET_COUPON = "/v1/tyltravelcoupon/all";
export const ADD_NEW_COUPON = "/v1/tyltravelcoupon/create";
export const UPDATE_COUPON = "/v1/tyltravelcoupon/update/";
export const DELETE_COUPON = "/v1/tyltravelcoupon/";

export const GET_INVOICES_LIST = "/v1/tyltravelcustomerinvoice?page=1&limit=20";
// Customers
export const GET_CUSTOMERS_LIST =
  "v1/tyltourcustomerbooking/get/all/travel-booking-list?page=1&limit=20";

  // --------------------------------------Project management Collections------------------------------------------------------------
export const GET_PM_COLLECTIONS =
"/v1/tyltravelcollection/get/travel-collection/top/list/all?page=1&limit=10&sortOrder=asc"
export const ADD_PM_COLLECTION =
"/v1/tyltravelcollection/add/travel-collection/top/list?cityCode="

export const GET_PM_CITY_LIST = "/v1/tyltravelcity/get/travelcity/submitted/all"

export const GET_PM_COLLECTION_BY_ID ="/v1/tyltravelcollection/get/travel-collection/by-id/"

export const UPDATE_PM_COLLECTION =
"/v1/tyltravelcollection/update-travel-collection/"

export const DELETE_PM_COLLECTION = "/v1/tyltravelcollection/delete/"

// --------------------------------------Project management Collections------------------------------------------------------------

export const GET_TOUR_GROUP_VARIANTS = "v1/tyltraveltourgroupvariant/list";

// Tour Group
// export const GET_TOUR_GROUP_VARIANTS_API =
//   "v1/tyltraveltourgroupvariant/list?page=1&limit=20";
export const GET_TOUR_GROUP_VARIANTS_API = "/v1/tyltraveltourgroupvariant/list";

export const GET_TRAVEL_TOUR_GROUPS_API =
  "v1/tyltraveltourgroup/get/all/travel-tour-groups-list?page=1&limit=20";
export const POST_ADD_TOUR_GROUP_VARIANT_API =
  "v1/tyltraveltourgroupvariant/add/travel-tour-group-variant";
export const PUT_UPDATE_TOUR_GROUP_VARIANT_API =
  "v1/tyltraveltourgroupvariant/update";
