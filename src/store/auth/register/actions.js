import {
  REGISTER_USER,
  REGISTER_USER_SUCCESSFUL,
  REGISTER_USER_FAILED,
  EMAIL_VERIFICATION,
  EMAIL_VERIFICATION_SUCCESSFUL,
  EMAIL_VERIFICATION_FAILED,
} from "./actionTypes"

export const registerUser = user => {
  return {
    type: REGISTER_USER,
    payload: { user },
  }
}

export const registerUserSuccessful = user => {
  return {
    type: REGISTER_USER_SUCCESSFUL,
    payload: user,
  }
}

export const registerUserFailed = user => {
  return {
    type: REGISTER_USER_FAILED,
    payload: user,
  }
}

export const emailVerification = (token, history) => {
  return {
    type: EMAIL_VERIFICATION,
    payload: { token, history },
  }
}

export const emailVerificationSuccessful = (data) => {
  return {
    type: EMAIL_VERIFICATION_SUCCESSFUL,
    payload: data,
  }
}

export const emailVerificationFailed = (error) => {
  return {
    type: EMAIL_VERIFICATION_FAILED,
    payload: error,
  }
}
