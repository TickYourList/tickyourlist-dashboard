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
  Testimonial
});

export default rootReducer;
