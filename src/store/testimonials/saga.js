import { takeEvery, put, call } from "redux-saga/effects"

// Calender Redux States
import { showToastError, showToastSuccess } from "helpers/toastBuilder"
import { ADD_NEW_TESTIMONIAL, DELETE_ALL_TESTIMONIAL, DELETE_TESTIMONIAL, GET_TESTIMONIALS, UPDATE_TESTIMONIAL } from "./actionTypes"
import { addTestimonialFail, addTestimonialsuccess, deleteAllTestimonialsFail, deleteAllTestimonialsSuccess, deleteTestimonialFail, deleteTestimonialsuccess, getTestimonialsFail, getTestimonialsSuccess, updateTestimonialFail, updateTestimonialsuccess } from "./actions"
import { addTestimonial, deleteAllTestimonials, deleteTestimonialData, getTestimonialsList, updateTestimonialData } from "helpers/backend_helper"


function* fetchTestimonials() {
  try {
    const response = yield call(getTestimonialsList)
    yield put(getTestimonialsSuccess(response.data.testimonialsList))  
  } catch (error) {
    yield put(getTestimonialsFail(error))
  }
}

function* onAddTestimonial({ payload: { data } }) {
  try {
    const response = yield call(addTestimonial, data)
    yield put(addTestimonialsuccess(response.data))
    showToastSuccess("Testimonial Added Successfully.","Success");
  } catch (error) {
    yield put(addTestimonialFail(error))
    showToastError("Testimonial Failed to Add. Please try again.","Error")
  }
}

function* onUpdateTestimonial({ payload: { id, data } }) {
  try {
    const response = yield call(updateTestimonialData, id, data )
    yield put(updateTestimonialsuccess(id))
    showToastSuccess("Testimonial Updated Successfully.","Success");
  } catch (error) {
    yield put(updateTestimonialFail(error))
    showToastError("Testimonial Failed to Update. Please try again.","Error")
  }
}

function* onDeleteTestimonial({ payload: testimonial  }) {
  try {
    const response = yield call(deleteTestimonialData, testimonial._id );
    yield put(deleteTestimonialsuccess(testimonial))
    showToastSuccess("Testimonial Deleted Successfully.","Success");
  } catch (error) {
    yield put(deleteTestimonialFail(error))
    showToastError("Testimonial Failed to Delete. Please try again.","Error")
  }
}

function* onDeleteAllTestimonials() {
    try {
      const response = yield call(deleteAllTestimonials)
      yield put(deleteAllTestimonialsSuccess(response))
      showToastSuccess("Testimonials Deleted Successfully.","Success");
    } catch (error) {
      yield put(deleteAllTestimonialsFail(error))
      showToastError("Testimonials Failed to Delete. Please try again.","Error")
    }
  }

function* testimonialSaga() {
  yield takeEvery(GET_TESTIMONIALS, fetchTestimonials);
  yield takeEvery(ADD_NEW_TESTIMONIAL, onAddTestimonial);
  yield takeEvery(UPDATE_TESTIMONIAL, onUpdateTestimonial);
  yield takeEvery(DELETE_TESTIMONIAL, onDeleteTestimonial);
  yield takeEvery(DELETE_ALL_TESTIMONIAL, onDeleteAllTestimonials);
}

export default testimonialSaga;
