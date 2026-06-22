import { del, get, post, put } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";
import { buildQuery } from "./query";

export const getParticipants = (params = {}) =>
  get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants${buildQuery(params)}`);

export const getParticipant = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`);
export const createParticipant = (data) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants`, data);
export const updateParticipant = (id, data) => put(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`, data);
export const deleteParticipant = (id) => del(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`);
export const archiveParticipant = (id) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/archive`, {});
export const restoreParticipant = (id) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/restore`, {});
export const cancelParticipant = (id, payload) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/cancel`, payload);
export const getParticipantInvoice = (id, type) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/invoice?type=${type}`);
export const getVisaDoc = (id, type) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/visa-doc?type=${type}`);

export const bulkImportParticipants = (studyTour, participants) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/bulk-import`, { studyTour, participants });

export const bulkVisaSchedule = (payload) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/bulk-visa`, payload);
