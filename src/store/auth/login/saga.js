import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";
import { getUserPermissions } from "../../user-permissions/actions";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/fakebackend_helper";
import { showToastError, showToastSuccess } from "helpers/toastBuilder";
import { postLogin, getPermissionsList } from "helpers/backend_helper";

const fireBaseBackend = getFirebaseBackend();

function* loginUser({ payload: { user, history } }) {
  try {
      const response = yield call(postLogin, {
        email: user.email,
        password: user.password,
      });
      localStorage.setItem("authUser", JSON.stringify(response));
      if(response.statusCode ==="10000"){
        showToastSuccess("Login is Successfull","Success")
      }
      yield put(loginSuccess(response));
      yield put(getUserPermissions(response.userId));
    history('/automobile-dashboard');
  } catch (error) {
    showToastError("Email and Password does not match","Error")
    yield put(apiError(error));
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    // Get user data before removing authUser to clear their specific permissions cache
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        const userId = userData.userId || userData.id || userData.user_id;
        if (userId) {
          // Clear user-specific permissions cache
          localStorage.removeItem(`permissions_${userId}`);
          console.log("Cleared permissions cache for user:", userId);
        }
      } catch (error) {
        console.error("Error clearing permissions cache:", error);
      }
    }

    localStorage.removeItem("authUser");

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout);
      yield put(logoutUserSuccess(response));
    }
    history('/login');
  } catch (error) {
    yield put(apiError(error));
  }
}

function* socialLogin({ payload: { type, history } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      const response = yield call(fireBaseBackend.socialLoginUser, type);
      if (response) {
        history("/dashboard");
      } else {
        history("/login");
      }
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
    }
    if(response)
    history("/dashboard");
  } catch (error) {
    console.log("error",error)
    yield put(apiError(error));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
  yield takeEvery(LOGOUT_USER, logoutUser);
}

export default authSaga;
