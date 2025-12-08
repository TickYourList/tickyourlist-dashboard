export const GET_CURRENCY_LIST = "v1/tyltravelcurrency/get/travelcurrency/submitted/all";
export const UPDATE_COUNTRY = "v1/tyltravelcountry/update/travel-country/{code}";
export const GET_COUNTRY_BY_CODE = "v1/tyltravelcountry/get/travelcountry/{code}";
export const ADD_COUNTRY = "v1/tyltravelcountry/add/travel-country";
export const DELETE_COUNTRY = "v1/tyltravelcountry/delete/travel-country/{code}";
export const GET_CITIES_LIST = "v1/tyltravelcity/get/travelcity/submitted/all";
export const GET_CITY_DATA = "v1/tyltravelcity/get/travelcity";
export const GET_COUNTRIES_LIST = "v1/tyltravelcountry/get/travelcountry/submitted/all";
export const GET_CITY_DETAILS = "v1/tyltravelcity/get/travelcity-details";

export const CREATE_NEW_CITY = "v1/tyltravelcity/add/travel-city";

export const UPDATE_CITY = "v1/tyltravelcity/update/travel-city";

export const REMOVE_CITY = "v1/tyltravelcity/delete/travel-city";


export const GET_CITIES_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/cities/{country_id}";
export const GET_TOURS_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/tours/{country_id}";
export const GET_CATEGORIES_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/categories/{country_id}";
export const GET_COLLECTIONS_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/collections/{country_id}";
export const GET_SUBCATEGORIES_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/subcategories/{country_id}";
export const GET_BOOKING_BY_COUNTRY_ID = "/v1/tyltravelcountry/get/travelcountry/bookings/{country_id}";


export const CITY_TOURS_API = "v1/tyltravelcity/get/travelcity-details/tours"
export const CITY_CATEGORIES_API = "v1/tyltravelcity/get/travelcity-details/categories"
export const CITY_SUBCATEGORIES_API = "v1/tyltravelcity/get/travelcity-details/sub-categories"
export const CITY_COLLECTIONS_API = "v1/tyltravelcity/get/travelcity-details/collections"
export const CITY_BOOKINGS_API = "v1/tyltravelcity/get/travelcity-details/bookings"

export const FETCH_TOUR_GROUP_LIST =
  "/v1/tyltraveltourgroup/get/all/travel-tour-groups-list"
export const FETCH_TOUR_GROUPS_BY_CITY = "/v1/tyltraveltourgroup/tour-groups-by-city"
export const SEARCH_TOUR_GROUPS = "/v1/tyltraveltourgroup/search/travel-tour-groups"
export const FETCH_VARIANTS_BY_TOUR = "/v1/tyltraveltourgroupvariant/by-tour"
export const FETCH_PRICING_RULES = "/v1/variant-calendar-pricing/pricing-rules"
export const CREATE_PRICING_RULE = "/v1/variant-calendar-pricing/pricing-rule"
export const UPDATE_PRICING_RULE = "/v1/variant-calendar-pricing/pricing-rule"
export const DELETE_PRICING_RULE = "/v1/variant-calendar-pricing/pricing-rule"
export const GET_PRICING_RULE = "/v1/variant-calendar-pricing/pricing-rule"
export const FETCH_DATE_PRICING = "/v1/variant-calendar-pricing/date-pricing"
export const SAVE_DATE_PRICING = "/v1/variant-calendar-pricing/date-pricing"
export const FETCH_CITY_CODE_LIST =
  "/v1/tyltravelcity/get/travelcity/submitted/all"
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

export const GET_PM_COLLECTION_BY_ID = "/v1/tyltravelcollection/get/travel-collection/by-id/"

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

export const GET_SUBCATEGORIES = "/v1/tyltravelsubcategory/get/travel-subcategories";
export const GET_TRAVELCATEGORIES = "/v1/tyltravelcategory/travel-categories/city/"
export const ADD_TRAVEL_SUBCATEGORY = "/v1/tyltravelsubcategory/add/travel-sub-category"
export const GET_TRAVEL_CITIES = "/v1/tyltravelcategory/get/travel-category"
export const GET_EXISTING_SUBCATEGORY = "/v1/tyltravelsubcategory/get/travel-subcategory/"
export const UPDATE_SUBCATEGORY = "/v1/tyltravelsubcategory/travel-subcategory/"
export const GET_EXISTING_SUBCATEGORY_FOR_EDIT = "/v1/tyltravelsubcategory/get/travel-subcategory/"
export const DELETE_SUBCATEGORY = "/v1/tyltravelsubcategory/delete/travel-subcategory/"
export const GET_SUBCATEGORY_DETAILS_FOR_VIEW = "/v1/tyltravelsubcategory/get/travel-subcategory/"
export const GET_SUBCATEGORY_VIEW_TOURS_TABLE = "/v1/tyltravelsubcategory/travel-subcategory/"
export const GET_SUBCATEGORY_VIEW_BOOKINGS_TABLE = "/v1/tyltravelsubcategory/travel-subcategory/"
export const GET_USERS_PERMISSIONS_FOR_SUBCATEGORY = "/v1/admin/subusers/my-permissions";

// HomeBanner
export const GET_BANNER_LIST = "/v1/tylTravelCitySectionBanner/list/all";
export const ADD_NEW_BANNER = "/v1/tylTravelCitySectionBanner/create/home/banner";
export const GET_CITY_LIST = "/v1/tyltravelcity/get/travelcity/submitted/all";
export const GET_TOURS = "/v1/tyltraveltourgroup/get/all/travel-tour-groups?currency=AED&cityCode=DUBAI";
export const GET_CATEGORIES = "/v1/tyltravelcategory/travel-categories/city/DUBAI";
export const GET_SUBCATEGORIES_DATA = "/v1/tyltravelsubcategory/get/travel-subcategories-data";
export const GET_BANNER_COLLECTIONS = "/v1/tyltravelcollection/get/travel-collection/top/list?cityCode=DUBAI";
export const EDIT_BANNER = "/v1/tylHomeScreenBanner";
export const DELETE_BANNER = "/v1/tylHomeScreenBanner";

export const GET_CATEGORIES_LIST = "/v1/tyltravelcategory/get/travel-category";
export const DELETE_CATEGORY = "/v1/tyltravelcategory/travel-category/{id}";
export const GET_CATEGORY_BY_ID = "/v1/tyltravelcategory/travel-category/{id}";
export const UPDATE_CATEGORY = "/v1/tyltravelcategory/travel-category/{id}";
export const ADD_CATEGORY = "/v1/tyltravelcategory/add/travel-category?city={cityCode}";
export const GET_CITIES = "/v1/tyltravelcity/get/travelcity/submitted/all";

export const GET_CATEGORY_URL = "/v1/tyltravelcategory/travel-category/{id}";
export const GET_CATEGORY_TOURS = "/v1/tyltravelcategory/travel-category/{id}/tours";
export const GET_CATEGORY_SUBCATEGORIES = "/v1/tyltravelcategory/travel-category/{id}/subcategories";
export const GET_CATEGORY_BOOKINGS = "/v1/tyltravelcategory/travel-category/{id}/bookings";
export const GET_SETTINGS = "/v1/tyl-settings/category/system";

export const UPDATE_SYSTEM_SETTINGS = "/v1/tyl-settings/system";

// Tour Group
// export const GET_TOUR_GROUP_VARIANTS_API =

export const GET_TOUR_GROUP_VARIANT_DETAIL_API =
  "/v1/tyltraveltourgroupvariant/variant";
export const GET_PRICING_LIST_API = "/v1/tyltraveltourgroupvariant/variant";

export const GET_BOOKING_LIST_API = "v1/tyltraveltourgroupvariant/variant";
export const UPDATE_VARIANT_PRICES = "/v1/tyltraveltourgroupvariant/update-prices";

// HomeBanner Permissions
export const GET_PERMISSIONS_LIST = "/v1/admin/subusers/my-permissions";

// SectionBanner
export const GET_SECTION_LIST = "/v1/tyltravelcity/get/travelcity/submitted/all";
export const GET_SECTION_ID = "/v1/tylTravelCity/get/travelcity/";
export const GET_CATEGORIES_FOR_CITY = "/v1/tyltravelcity/get/travelcity-details/categories";
export const GET_TOURS_FOR_CITY = "/v1/tyltravelcity/get/travelcity-details/tours";
export const GET_COLLECTIONS_FOR_CITY = "/v1/tyltravelcity/get/travelcity-details/collections";
export const GET_SUBCATEGORIES_FOR_CITY = "/v1/tyltravelcity/get/travelcity-details/sub-categories";

//Pricing Calendar
export const ON_ADD_DEFAUL_PRICING = "/v1/variant-calendar-pricing/pricing-rule/685e6b39a5cea386da8cb312"

export const SORT_CATEGORY_API = "v1/tyltravelcategory/travel-categories/sort"
export const SORT_SUB_CATEGORY_API = "v1/tyltravelsubcategory/sort/travel-subcategories/by/category"

// Faq List
export const GET_FAQS_LIST = "/v1/tyltravelfaqs/list/all"; // Get all FAQs
export const GET_FAQS_BY_CITY = "/v1/tyltravelfaqs/city/"; // Note: cityCode will be appended
export const GET_FAQ_BY_ID = "/v1/tyltravelfaqs/get/"; // Note: ID will be appended
export const ADD_NEW_FAQS = "/v1/tyltravelfaqs/create";
export const UPDATE_FAQS = "/v1/tyltravelfaqs/update/"; // Note: ID will be appended

// Tour Group Connections
export const CONNECT_TOUR_GROUP = "/v1/tyltraveltourgroup/connect/tour-group"; // Connect tour group to categories/subcategories
export const BULK_CONNECT_TOURS_TO_CATEGORY = "/v1/tyltravelcategory/bulk-connect/tours"; // Bulk connect tours to category
export const BULK_CONNECT_TOURS_TO_SUBCATEGORY = "/v1/tyltravelsubcategory/bulk-connect/tours"; // Bulk connect tours to subcategory
