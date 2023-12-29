import {
  REGISTER_USER,
  REGISTER_USER_SUCCESSFUL,
  REGISTER_USER_FAILED,
  EMAIL_VERIFICATION,
  EMAIL_VERIFICATION_SUCCESSFUL,
  EMAIL_VERIFICATION_FAILED,
} from "./actionTypes"

const initialState = {
  registrationError: null,
  message: null,
  loading: false,
  user: null,
  verificationLoad: false,
  verification: null
}

const account = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_USER:
      state = {
        ...state,
        loading: true,
        registrationError: null,
      }
      break
    case REGISTER_USER_SUCCESSFUL:
      state = {
        ...state,
        loading: false,
        user: action.payload,
        registrationError: null,
      }
      break
    case REGISTER_USER_FAILED:
      state = {
        ...state,
        user: null,
        loading: false,
        registrationError: action.payload,
      }
      break
      case EMAIL_VERIFICATION:
        state = {
          ...state,
          user: null,
          verificationLoad: true,
          verification: null
        }
        break
        case EMAIL_VERIFICATION_SUCCESSFUL:
        state = {
          ...state,
          user: null,
          verificationLoad: true,
          verification: true
        }
        break
        case EMAIL_VERIFICATION_FAILED:
        state = {
          ...state,
          user: null,
          verificationLoad: false,
          verification: false
        }
        break
    default:
      state = { ...state }
      break
  }
  return state
}

export default account
