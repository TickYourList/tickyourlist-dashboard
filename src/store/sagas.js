import { all, fork } from "redux-saga/effects";

//public
import AccountSaga from "./auth/register/saga";
import AuthSaga from "./auth/login/saga";
import ForgetSaga from "./auth/forgetpwd/saga";
import ProfileSaga from "./auth/profile/saga";
import LayoutSaga from "./layout/saga";
import ecommerceSaga from "./e-commerce/saga";
import calendarSaga from "./calendar/saga";
import chatSaga from "./chat/saga";
import cryptoSaga from "./crypto/saga";
import invoiceSaga from "./invoices/saga";
import jobsSaga from "./jobs/saga";
import projectsSaga from "./projects/saga";
import tasksSaga from "./tasks/saga";
import mailsSaga from "./mails/saga";
import contactsSaga from "./contacts/saga";
import dashboardSaga from "./dashboard/saga";
import dashboardSaasSaga from "./dashboard-saas/saga";
import dashboardCryptoSaga from "./dashboard-crypto/saga";
import dashboardBlogSaga from "./dashboard-blog/saga";
import dashboardJobSaga from "./dashboard-jobs/saga";
import collectionSaga from "./collections/saga";
import domainSaga from "./domain/saga";
import carBrandSaga from "./automobiles/carbrands/saga";
import carModelSaga from "./automobiles/carModels/saga";
import carVariantSaga from "./automobiles/carVariants/saga";
import carBlogSaga from "./automobiles/carBlogs/saga";
import carCustomerSaga from "./automobiles/carCustomers/saga";
import carDealerSaga from "./automobiles/carDealers/saga";
import testimonialSaga from "./testimonials/saga";
import CarBannerSaga from "./automobiles/carBanners/saga";

export default function* rootSaga() {
  yield all([
    //public
    fork(AccountSaga),
    fork(AuthSaga),
    fork(ForgetSaga),
    fork(ProfileSaga),
    fork(LayoutSaga),
    fork(ecommerceSaga),
    fork(collectionSaga),
    fork(calendarSaga),
    fork(chatSaga),
    fork(mailsSaga),
    fork(cryptoSaga),
    fork(invoiceSaga),
    fork(jobsSaga),
    fork(projectsSaga),
    fork(tasksSaga),
    fork(contactsSaga),
    fork(dashboardSaga),
    fork(dashboardSaasSaga),
    fork(dashboardCryptoSaga),
    fork(dashboardBlogSaga),
    fork(dashboardJobSaga),
    fork(domainSaga),
    fork(CarBannerSaga),
    fork(carBrandSaga),
    fork(carModelSaga),
    fork(carVariantSaga),
    fork(carBlogSaga),
    fork(carCustomerSaga),
    fork(carDealerSaga),
    fork(testimonialSaga)
  ]);
}
