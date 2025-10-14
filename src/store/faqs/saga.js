import { call, put, takeLatest } from "redux-saga/effects"
import { GET_FAQS_LIST, ADD_NEW_FAQS, UPDATE_FAQS } from "./actionTypes"
import {
  getFaqsListSuccess,
  getFaqsListFail,
  addNewFaqsSuccess,
  addNewFaqsFail,
  updateFaqsSuccess,
  updateFaqsFail,
} from "./actions"
import axios from "axios"
import { getFaqsList, addFaqs, updateFaqs } from "../../helpers/location_management_helper"

function* fetchFaqsList() {
  try {
    const response = yield call(getFaqsList)

    if (response?.statusCode === "10000") {
      yield put(getFaqsListSuccess(response.data))
    } else {
      yield put(getFaqsListFail(response.message || "Something went wrong"))
    }
  } catch (error) {
    yield put(getFaqsListFail(error.message))
  }
}

function* onAddNewFaqs({ payload }) {
  try {
    const response = yield call(addFaqs, payload)
    console.log(response)

    if (response?.statusCode === "10000") {
      yield put(addNewFaqsSuccess(response.data))
    } else {
      yield put(addNewFaqsFail(response.message || "Something went wrong"))
    }
  } catch (error) {
    yield put(addNewFaqsFail(error.message))
  }
}

function* onUpdateFaqs({ payload }) {
  try {
    const { id, ...faqData } = payload
    const response = yield call(updateFaqs, id, faqData)
    console.log(response)

    if (response?.statusCode === "10000") {
      yield put(updateFaqsSuccess(response.data))
    } else {
      yield put(updateFaqsFail(response.message || "Something went wrong"))
    }
  } catch (error) {
    yield put(updateFaqsFail(error.message))
  }
}

export default function* faqsSaga() {
  yield takeLatest(GET_FAQS_LIST, fetchFaqsList)
  yield takeLatest(ADD_NEW_FAQS, onAddNewFaqs)
  yield takeLatest(UPDATE_FAQS, onUpdateFaqs)
}
