import { del, get, post, put } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";
import { buildQuery } from "./query";

export const getExpenses = (tourId, params = {}) =>
  get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${tourId}/expenses${buildQuery(params)}`);

export const getExpenseSummary = (tourId) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${tourId}/expenses/summary`);
export const addExpense = (tourId, data) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${tourId}/expenses`, data);
export const updateExpense = (id, data) => put(`${EDUCATOR_STUDY_TOUR_BASE}/admin/expenses/${id}`, data);
export const deleteExpense = (id) => del(`${EDUCATOR_STUDY_TOUR_BASE}/admin/expenses/${id}`);
