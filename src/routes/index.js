import React from "react";
import { Navigate } from "react-router-dom";

// Profile
import UserProfile from "../pages/Authentication/user-profile";

// //Tasks
import TasksList from "../pages/Tasks/tasks-list";
import TasksCreate from "../pages/Tasks/tasks-create";

// //Projects
import ProjectsGrid from "../pages/Projects/projects-grid";
import ProjectsList from "../pages/Projects/projects-list";
import ProjectsOverview from "../pages/Projects/ProjectOverview/projects-overview";
import ProjectsCreate from "../pages/Projects/projects-create";

//Invoices
import InvoicesList from "../pages/Invoices/invoices-list";
import InvoiceDetail from "../pages/Invoices/invoices-detail";

// Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

//  // Inner Authentication
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";

// Dashboard
import Blog from "../pages/Dashboard-Blog/index";

// Charts
import ChartApex from "../pages/Charts/Apexcharts";
import ChartistChart from "../pages/Charts/ChartistChart";
import ChartjsChart from "../pages/Charts/ChartjsChart";
import EChart from "../pages/Charts/EChart";
import SparklineChart from "../pages/Charts/SparklineChart";
import ChartsKnob from "../pages/Charts/charts-knob";
import ReCharts from "../pages/Charts/ReCharts";

// Maps
import MapsGoogle from "../pages/Maps/MapsGoogle";
import MapsVector from "../pages/Maps/MapsVector";
import MapsLeaflet from "../pages/Maps/MapsLeaflet";

//Icons
import IconBoxicons from "../pages/Icons/IconBoxicons";
import IconDripicons from "../pages/Icons/IconDripicons";
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
import IconFontawesome from "../pages/Icons/IconFontawesome";

//Tables
import BasicTables from "../pages/Tables/BasicTables";
import DatatableTables from "../pages/Tables/DatatableTables";
import ResponsiveTables from "../pages/Tables/ResponsiveTables";
import DragDropTables from "../pages/Tables/DragDropTables";

//Job
import JobGrid from "../pages/JobPages/JobGrid/index";
import JobDetails from "../pages/JobPages/JobDetails";
import JobCategories from "../pages/JobPages/JobCategories";
import JobList from "../pages/JobPages/JobList";
import ApplyJobs from "../pages/JobPages/ApplyJobs/index";
import CandidateList from "../pages/JobPages/CandidateList";
import CandidateOverview from "../pages/JobPages/CandidateOverview";

// Forms
import FormElements from "../pages/Forms/FormElements";
import FormLayouts from "../pages/Forms/FormLayouts";
import FormAdvanced from "../pages/Forms/FormAdvanced";
import FormEditors from "../pages/Forms/FormEditors";
import FormValidations from "../pages/Forms/FormValidations";
import FormMask from "../pages/Forms/FormMask";
import FormRepeater from "../pages/Forms/FormRepeater";
import FormUpload from "../pages/Forms/FormUpload";
import FormWizard from "../pages/Forms/FormWizard";

//Ui
import UiAlert from "../pages/Ui/UiAlert";
import UiButtons from "../pages/Ui/UiButtons";
import UiCards from "../pages/Ui/UiCards";
import UiCarousel from "../pages/Ui/UiCarousel";
import UiColors from "../pages/Ui/UiColors";
import UiDropdown from "../pages/Ui/UiDropdown";
import UiGeneral from "../pages/Ui/UiGeneral";
import UiGrid from "../pages/Ui/UiGrid";
import UiImages from "../pages/Ui/UiImages";
import UiLightbox from "../pages/Ui/UiLightbox";
import UiModal from "../pages/Ui/UiModal";
import UiProgressbar from "../pages/Ui/UiProgressbar";
import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
import UiTypography from "../pages/Ui/UiTypography";
import UiVideo from "../pages/Ui/UiVideo";
import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
import UiRating from "../pages/Ui/UiRating";
import UiRangeSlider from "../pages/Ui/UiRangeSlider";
import UiNotifications from "../pages/Ui/ui-notifications";
import UiOffCanvas from "pages/Ui/UiOffCanvas";
import UiUtilitie from "../pages/Ui/UiUtilitie";
import UiPlaceholders from "../pages/Ui/UiPlaceholders";
import UiToasts from "../pages/Ui/UiToast";

//Pages
import PagesStarter from "../pages/Utility/pages-starter";
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";
import PagesTimeline from "../pages/Utility/pages-timeline";
import PagesFaqs from "../pages/Utility/pages-faqs";
import PagesPricing from "../pages/Utility/pages-pricing";
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";

import EcommerceProductList from "pages/Ecommerce/EcommerceProductList";
import EcommerceGetDomain from "pages/Ecommerce/EcommerceGetDomain";
import EcommerceBuyDomain from "pages/Ecommerce/EcommerceGetDomain/EcommerceBuyDomain";
import DomainPaymentStatus from "pages/Ecommerce/EcommerceGetDomain/DomainPaymentStatus";
import BroughtDomain from "pages/Ecommerce/EcommerceGetDomain/BroughtDomain";
import EcommerceCustomerDetail from "pages/Ecommerce/EcommerceOrders/EcommerceCustomerDetail";
import Invoice from "pages/Invoices/Invoice";
import CarBrands from "pages/Automobile/CarBrands/CarBrands";
import SortCarBrands from "pages/Automobile/CarBrands/SortCarBrands";
import CarModels from "pages/Automobile/CarModels/CarModels";
import CarVariants from "pages/Automobile/CarVariants/CarVariants";
import AddCarVariant from "pages/Automobile/CarVariants/AddCarVariant";
import AutomobileCollections from "pages/Automobile/AutomobileCollections";
import AddCarCollection from "pages/Automobile/AutomobileCollections/AddCarCollection";
import CarModelCollectionDetails from "pages/Automobile/AutomobileCollections/CarModelCollectionDetails";
import CarBlogs from "pages/Automobile/CarBlogs/CarBlogs";
import EditCarVariant from "pages/Automobile/CarVariants/EditCarVariant";
import CarCustomers from "pages/Automobile/CarCustomers/CarCustomers";
import EmailVerification from "pages/Authentication/EmailVerification";
import ForgetPasswordPageDetails from "pages/Authentication/ForgetPasswordPageDetails";
import ForgotPasswordEmailVerification from "pages/Authentication/ForgotPasswordEmailVerification";
import ForgotPasswordSuccessful from "pages/Authentication/ForgotPasswordSuccessful";
import AutomobileDashboard from "pages/Automobile/Dashboard/AutomobileDashboard";
import CarDealers from "pages/Automobile/CarDealers/CarDealers";
import Testimonials from "pages/Testimonials/Testimonials";
import Aboutus from "pages/Settings/aboutus";
import Careerwithus from "pages/Settings/careerwithus";
import Termsandconditions from "pages/Settings/termsandconditions";
import PrivacyPolicy from "pages/Settings/privacyPolicy";
import CorporatePolicy from "pages/Settings/corporatePolicy";
import Investors from "pages/Settings/investors";
import Faqs from "pages/Settings/faqs";
import Contactus from "pages/Settings/contactus";
import AdvertiseWithUs from "pages/Settings/AdvertiseWithUs";
import Banner from "pages/Automobile/Banner/Banner";
import EcommerceCustomers from "pages/Ecommerce/EcommerceCustomers";
// import EmailVerification from "pages/AuthenticationInner/auth-email-verification";

const authProtectedRoutes = [
  { path: "/dashboard", component: <AutomobileDashboard /> },
  { path: "/automobile-dashboard", component: <AutomobileDashboard /> },

  // domain
  { path: "/ecommerce-get-domain", component: <EcommerceGetDomain /> },
  { path: "/ecommerce-buy-domain-name/:id", component: <EcommerceBuyDomain /> },
  { path: "/ecomm-Domain-paymentStatus/:id", component: <DomainPaymentStatus /> },
  { path: "/ecommerce-your-domains", component: <BroughtDomain /> },

  { path: "/automobile-collections", component: <AutomobileCollections /> },
  { path: "/automobile-create-collection", component: <AddCarCollection /> },
  {
    path: "/automobile-collection-details/:_id",
    component: <CarModelCollectionDetails />,
  },
  { path: "/blog", component: <Blog /> },
  // { path: "/dashboard-job", component: <DashboardJob /> },

  // //profile
  { path: "/profile", component: <UserProfile /> },

  { path: "/ecommerce-customers", component: <EcommerceCustomers /> },
  { path: "/ecommerce-customer-detail/:id", component: <EcommerceCustomerDetail /> },

  { path: "/car-brands", component: <CarBrands /> },
  { path: "/sort-car-brands", component: <SortCarBrands /> },

  { path: "/banner", component: <Banner /> },

  { path: "/car-models", component: <CarModels /> },

  { path: "/car-variants", component: <CarVariants /> },

  { path: "/add-car-variant", component: <AddCarVariant /> },

  { path: "/edit-car-variant/:_id", component: <EditCarVariant /> },

  // settings
  { path: "/about", component: <Aboutus /> },
  { path: "/careerwithus", component: <Careerwithus /> },
  { path: "/termsandcondition", component: <Termsandconditions /> },
  { path: "/privacypolicy", component: <PrivacyPolicy /> }, 
  { path: "/corporatepolicy", component: <CorporatePolicy /> }, 
  { path: "/investors", component: <Investors /> }, 
  { path: "/faqs", component: <Faqs /> },
  { path: "/contactus", component: <Contactus /> },
  { path: "/advertisewithus", component: <AdvertiseWithUs /> },

  //Invoices
  { path: "/invoices-list", component: <InvoicesList /> },
  { path: "/invoices-detail/:id", component: <InvoiceDetail /> },
  { path: "/invoices-detail", component: <InvoiceDetail /> },

  // Tasks
  { path: "/tasks-list", component: <TasksList /> },
  { path: "/tasks-create", component: <TasksCreate /> },

  //Projects
  { path: "/projects-grid", component: <ProjectsGrid /> },
  { path: "/projects-list", component: <ProjectsList /> },
  { path: "/projects-overview", component: <ProjectsOverview /> },
  { path: "/projects-overview/:id", component: <ProjectsOverview /> },
  { path: "/projects-create", component: <ProjectsCreate /> },

  //job
  { path: "/job-grid", component: <JobGrid /> },
  { path: "/job-details", component: <JobDetails /> },
  { path: "/job-categories", component: <JobCategories /> },
  { path: "/job-list", component: <JobList /> },
  { path: "/job-apply", component: <ApplyJobs /> },
  { path: "/candidate-list", component: <CandidateList /> },
  { path: "/candidate-overview", component: <CandidateOverview /> },

  //Charts
  { path: "/apex-charts", component: <ChartApex /> },
  { path: "/chartist-charts", component: <ChartistChart /> },
  { path: "/chartjs-charts", component: <ChartjsChart /> },
  { path: "/e-charts", component: <EChart /> },
  { path: "/sparkline-charts", component: <SparklineChart /> },
  { path: "/charts-knob", component: <ChartsKnob /> },
  { path: "/re-charts", component: <ReCharts /> },

  // Icons
  { path: "/icons-boxicons", component: <IconBoxicons /> },
  { path: "/icons-dripicons", component: <IconDripicons /> },
  { path: "/icons-materialdesign", component: <IconMaterialdesign /> },
  { path: "/icons-fontawesome", component: <IconFontawesome /> },

  // Tables
  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-datatable", component: <DatatableTables /> },
  { path: "/tables-responsive", component: <ResponsiveTables /> },
  { path: "/tables-dragndrop", component: <DragDropTables /> },

  // Maps
  { path: "/maps-google", component: <MapsGoogle /> },
  { path: "/maps-vector", component: <MapsVector /> },
  { path: "/maps-leaflet", component: <MapsLeaflet /> },

  // Forms
  { path: "/form-elements", component: <FormElements /> },
  { path: "/form-layouts", component: <FormLayouts /> },
  { path: "/form-advanced", component: <FormAdvanced /> },
  { path: "/form-editors", component: <FormEditors /> },
  { path: "/form-mask", component: <FormMask /> },
  { path: "/form-repeater", component: <FormRepeater /> },
  { path: "/form-uploads", component: <FormUpload /> },
  { path: "/form-wizard", component: <FormWizard /> },
  { path: "/form-validation", component: <FormValidations /> },

  // Ui
  { path: "/ui-alerts", component: <UiAlert /> },
  { path: "/ui-buttons", component: <UiButtons /> },
  { path: "/ui-cards", component: <UiCards /> },
  { path: "/ui-carousel", component: <UiCarousel /> },
  { path: "/ui-colors", component: <UiColors /> },
  { path: "/ui-dropdowns", component: <UiDropdown /> },
  { path: "/ui-general", component: <UiGeneral /> },
  { path: "/ui-grid", component: <UiGrid /> },
  { path: "/ui-images", component: <UiImages /> },
  { path: "/ui-lightbox", component: <UiLightbox /> },
  { path: "/ui-modals", component: <UiModal /> },
  { path: "/ui-progressbars", component: <UiProgressbar /> },
  { path: "/ui-tabs-accordions", component: <UiTabsAccordions /> },
  { path: "/ui-typography", component: <UiTypography /> },
  { path: "/ui-video", component: <UiVideo /> },
  { path: "/ui-session-timeout", component: <UiSessionTimeout /> },
  { path: "/ui-rating", component: <UiRating /> },
  { path: "/ui-rangeslider", component: <UiRangeSlider /> },
  { path: "/ui-notifications", component: <UiNotifications /> },
  { path: "/ui-offcanvas", component: <UiOffCanvas /> },
  { path: "/ui-utilities", component: <UiUtilitie /> },
  { path: "/ui-placeholders", component: <UiPlaceholders /> },
  { path: "/ui-toasts", component: <UiToasts /> },

  //Utility
  { path: "/pages-starter", component: <PagesStarter /> },
  { path: "/pages-timeline", component: <PagesTimeline /> },
  { path: "/pages-faqs", component: <PagesFaqs /> },
  { path: "/pages-pricing", component: <PagesPricing /> },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/register", component: <Register /> },
  { path: "/verify", component: <EmailVerification /> },
  { path: "/verification-successful", component: <ConfirmMail /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgetPasswordPageDetails /> },
  { path: "/reset-password/verify", component: <ForgotPasswordEmailVerification /> },
  { path: "/forgot-password-successful", component: <ForgotPasswordSuccessful /> },

  { path: "/pages-maintenance", component: <PagesMaintenance /> },
  { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Authentication Inner

  { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  { path: "/page-confirm-mail", component: <ConfirmMail /> },
  { path: "/auth-two-step-verification", component: <TwostepVerification /> },
];

export { authProtectedRoutes, publicRoutes };
