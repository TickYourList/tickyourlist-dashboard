import {
  GET_FAQS_LIST,
  GET_FAQS_LIST_SUCCESS,
  GET_FAQS_LIST_FAIL,
  ADD_NEW_FAQS,
  ADD_NEW_FAQS_SUCCESS,
  ADD_NEW_FAQS_FAIL,
} from "./actionTypes"

export const getFaqsList = () => ({
  type: GET_FAQS_LIST,
})

export const getFaqsListSuccess = data => ({
  type: GET_FAQS_LIST_SUCCESS,
  payload: data,
})

export const getFaqsListFail = error => ({
  type: GET_FAQS_LIST_FAIL,
  payload: error,
})

export const addNewFaqs = faq => ({
  type: ADD_NEW_FAQS,
  payload: faq,
})

export const addNewFaqsSuccess = faq => ({
  type: ADD_NEW_FAQS_SUCCESS,
  payload: faq,
})

export const addNewFaqsFail = error => ({
  type: ADD_NEW_FAQS_FAIL,
  payload: error,
})
