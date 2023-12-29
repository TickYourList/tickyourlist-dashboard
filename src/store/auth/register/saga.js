import { takeEvery, fork, put, all, call } from "redux-saga/effects"

//Account Redux states
import { EMAIL_VERIFICATION, REGISTER_USER } from "./actionTypes"
import { registerUserSuccessful, registerUserFailed } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { postRegister, postVerification } from "helpers/backend_helper"

// initialize relavant method of both Auth
const fireBaseBackend = getFirebaseBackend()

// Is user register successfull then direct plot user in redux.
function* registerUser({ payload: { user } }) {
  try {
    const response = yield call(postRegister, user)
    showToastSuccess("User is registered successfully", "SUCCESS");

    yield put(registerUserSuccessful(response))
  } catch (error) {
    showToastError('Sorry! Failed to register, plese try again', 'Error');
    yield put(registerUserFailed(error))
  }
}

// Is user register successfull then direct plot user in redux.
function* registerVerification({ payload: { token, history } }) {
  try {
    const response = yield call(postVerification, token)
    showToastSuccess("Verification is successfully", "SUCCESS");
    history('/verification-successful');
    yield put(registerUserSuccessful(response))
  } catch (error) {
    showToastError('Verification Failed, plese try again', 'Error');
    history('/verification-failed');
    yield put(registerUserFailed(error))
  }
}

export function* watchUserRegister() {
  yield takeEvery(REGISTER_USER, registerUser)
  yield takeEvery(EMAIL_VERIFICATION, registerVerification)
}

function* accountSaga() {
  yield all([fork(watchUserRegister)])
}

export default accountSaga
