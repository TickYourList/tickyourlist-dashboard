import { combineReducers } from "redux";

// Front
import Layout from "./layout/reducer";

// Authentication
import Login from "./auth/login/reducer";
import Account from "./auth/register/reducer";
import ForgetPassword from "./auth/forgetpwd/reducer";
import Profile from "./auth/profile/reducer";

//E-commerce
import ecommerce from "./e-commerce/reducer";

//Collection
import collection from './collections/reducer';

//Calendar
import calendar from "./calendar/reducer";

//chat
import chat from "./chat/reducer";

//crypto
import crypto from "./crypto/reducer";

//invoices
import invoices from "./invoices/reducer";

//jobs
import JobReducer from "./jobs/reducer";

//projects
import projects from "./projects/reducer";

//tasks
import tasks from "./tasks/reducer";

//contacts
import contacts from "./contacts/reducer";

//mails
import mails from "./mails/reducer";

//Dashboard 
import Dashboard from "./dashboard/reducer";

//Dasboard saas
import DashboardSaas from "./dashboard-saas/reducer";

//Dasboard crypto
import DashboardCrypto from "./dashboard-crypto/reducer";

//Dasboard blog
import DashboardBlog from "./dashboard-blog/reducer";

//Dasboard job
import DashboardJob from "./dashboard-jobs/reducer";

import domain from "./domain/reducer";

import CarBrand from "./automobiles/carbrands/reducer";
import CarModel from "./automobiles/carModels/reducer";
import carVariant from "./automobiles/carVariants/reducer";
import CarBlog from "./automobiles/carBlogs/reducer";
import CarCustomer from "./automobiles/carCustomers/reducer";
import CarDealer from "./automobiles/carDealers/reducer";
import Testimonial from "./testimonials/reducer";
import CarBanner from "./automobiles/carBanners/reducer";
import countries from "./countries/reducers";

//  Travel Currency 
import travelCurrency from "./travelCurrency/reducer";
import travelCity from "./travelCity/reducer";
import tourGroupReducer from "./tickyourlist/travelTourGroup/reducer";
import travelPartner from "./travelPartner/reducers";
import Coupon from "./coupon/reducer";
import customerReducer from "./customers/reducer";
//Project management Collections
import pmCollectionReducer from "./product-management/collections/reducer";
//tourgroup
import tourGroupVariantReducer from "./TourGroupVariant/reducer"
import travelSubCategoryReducer from "./productManagement/subcategories/reducer"
import banner from "./banners/bannerReducer";
import travelCategory from "./travelCategories/reducer";
// City Details
import CityDetails from "./city-details/reducer"
import cities from "./countries/cities/reducers";
import tours from "./countries/tour/reducers";
import categories from "./countries/categories/reducers";
import collections from "./countries/collections/reducers";
import subcategories from "./countries/Subcategories/reducers";
import bookings from "./countries/bookings/reducers";
// Section
import citiesSection from "./section-banners/sectionReducer";
// User Permissions
import UserPermissionsReducer from "./user-permissions/reducer";
import CalendarPricing from "./CalendarPricingAndAvailability/reducers";
import faqsReducer from "./faqs/reducer";
import continents from "./continents/reducer";
import emailWorkflows from "./emailWorkflows/reducer";

const rootReducer = combineReducers({
  // public
  Layout,
  Login,
  Account,
  ForgetPassword,
  Profile,
  ecommerce,
  collection,
  calendar,
  chat,
  mails,
  crypto,
  invoices,
  JobReducer,
  projects,
  tasks,
  contacts,
  Dashboard,  
  DashboardSaas,
  DashboardCrypto,
  DashboardBlog,
  DashboardJob,
  domain,
  CarBanner,
  CarBrand,
  CarModel,
  carVariant,
  CarBlog,
  CarCustomer,
  CarDealer,
  Testimonial,
  countries,
  travelPartner,
  travelCity,
  tourGroup: tourGroupReducer,
  coupons: Coupon,
  customers: customerReducer,
  pmCollection: pmCollectionReducer,
  TourGroupVariant: tourGroupVariantReducer,
  travelSubCategoryReducer,
  banner,
  CityDetails,
  cities,
  tours,
  categories,
  collections,
  subcategories,
  bookings,
  travelCategory,
  travelCurrency, // travel currency
  citiesSection,
  UserPermissionsReducer,
  CalendarPricing,
  faqsReducer,
  continents,
  emailWorkflows,
});

export default rootReducer;
