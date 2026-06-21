import { del, get, post, put } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";
import { buildQuery } from "./query";

export const getParticipants = (params = {}) =>
  get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants${buildQuery(params)}`);

export const getParticipant = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`);
export const createParticipant = (data) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants`, data);
export const updateParticipant = (id, data) => put(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`, data);
export const deleteParticipant = (id) => del(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}`);

export const bulkImportParticipants = (studyTour, participants) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/bulk-import`, { studyTour, participants });
