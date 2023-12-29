import {
  FORGET_PASSWORD,
  FORGET_PASSWORD_SUCCESS,
  FORGET_PASSWORD_ERROR,
  FORGET_PASSWORD_VERIFICATION,
  FORGET_PASSWORD_VERIFICATION_SUCCESS,
  FORGET_PASSWORD_VERIFICATION_ERROR,
} from "./actionTypes"

export const userForgetPassword = (user, history) => {
  return {
    type: FORGET_PASSWORD,
    payload: { user, history },
  }
}

export const userForgetPasswordSuccess = message => {
  return {
    type: FORGET_PASSWORD_SUCCESS,
    payload: message,
  }
}

export const userForgetPasswordError = message => {
  return {
    type: FORGET_PASSWORD_ERROR,
    payload: message,
  }
}

export const userForgetPasswordVerification = (token, password,  history) => {
  return {
    type: FORGET_PASSWORD_VERIFICATION,
    payload: { token, password, history },
  }
}

export const userForgetPasswordVerificationSuccess = message => {
  return {
    type: FORGET_PASSWORD_VERIFICATION_SUCCESS,
    payload: message,
  }
}

export const userForgetPasswordVerificationError = message => {
  return {
    type: FORGET_PASSWORD_VERIFICATION_ERROR,
    payload: message,
  }
}
