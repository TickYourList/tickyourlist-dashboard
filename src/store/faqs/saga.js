import { call, put, takeLatest } from "redux-saga/effects"
import { GET_FAQS_LIST, ADD_NEW_FAQS } from "./actionTypes"
import {
  getFaqsListSuccess,
  getFaqsListFail,
  addNewFaqsSuccess,
  addNewFaqsFail,
} from "./actions"
import axios from "axios"
import { getFaqsList, addFaqs } from "../../helpers/location_management_helper"

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

export default function* faqsSaga() {
  yield takeLatest(GET_FAQS_LIST, fetchFaqsList)
  yield takeLatest(ADD_NEW_FAQS, onAddNewFaqs)
}
