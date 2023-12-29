import { takeEvery, fork, put, all, call } from "redux-saga/effects"

// Login Redux States
import { FORGET_PASSWORD, FORGET_PASSWORD_VERIFICATION } from "./actionTypes"
import { userForgetPasswordSuccess, userForgetPasswordError, userForgetPasswordVerificationSuccess, userForgetPasswordVerificationError } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import {
  postFakeForgetPwd,
  postJwtForgetPwd,
} from "../../../helpers/fakebackend_helper"
import { postForgotPassword, postForgotPasswordVerification } from "helpers/backend_helper"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"

const fireBaseBackend = getFirebaseBackend()

//If user is send successfully send mail link then dispatch redux action's are directly from here.
function* forgetUser({ payload: { user, history } }) {
  try {
      const response = yield call(postForgotPassword, {
        email: user.email,
      })
      if (response) {
        yield put(
          userForgetPasswordSuccess(
            "Reset link are sended to your mailbox, check there first"
          )
        )
    }
  } catch (error) {
    yield put(userForgetPasswordError(error))
  }
}

function* forgetUserVerification({ payload: { token, password, history } }) {
  try {
      const response = yield call(postForgotPasswordVerification, token, password)
      if (response) {
        yield put(
          userForgetPasswordVerificationSuccess(
            "Reset link are sended to your mailbox, check there first"
          )
        )
        showToastSuccess("Password reset Successfully. Please login Again","Success")
        history('/forgot-password-successful')
    }
  } catch (error) {
    yield put(userForgetPasswordVerificationError(error))
    showToastError("Token expired, Please Reset password again","Error")
  }
}

export function* watchUserPasswordForget() {
  yield takeEvery(FORGET_PASSWORD, forgetUser)
  yield takeEvery(FORGET_PASSWORD_VERIFICATION, forgetUserVerification)
}

function* forgetPasswordSaga() {
  yield all([fork(watchUserPasswordForget)])
}

export default forgetPasswordSaga
