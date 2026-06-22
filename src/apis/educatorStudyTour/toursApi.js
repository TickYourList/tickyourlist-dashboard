import { del, get, post, put } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";
import { buildQuery } from "./query";

export const getStudyTours = () => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours`);
export const getStudyTour = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}`);
export const createStudyTour = (data) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours`, data);
export const updateStudyTour = (id, data) => put(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}`, data);
export const deleteStudyTour = (id) => del(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}`);
export const duplicateStudyTour = (id, payload) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/duplicate`, payload);

export const getTourWeather = (id, place, date) =>
  get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/weather${buildQuery({ place, date })}`);

export const getTourAnalytics = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/analytics`);
export const getPaymentsReport = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/payments`);
export const getVisaBoard = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/visa-board`);
export const getRoomingBoard = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/rooming`);
export const getReadinessBoard = (id) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/readiness`);
export const getStudyTourActivity = (params = {}) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/activity${buildQuery(params)}`);
export const getCommunicationsTimeline = (id, params = {}) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/communications${buildQuery(params)}`);
export const assignRoom = (id, payload) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/rooming/assign`, payload);
export const clearRooming = (id, participantIds) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/rooming/clear`, { participantIds });
export const getManifest = (id, type) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/manifest?type=${type}`);
export const getManifestPrint = (id, type) => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/manifest?type=${type}&format=print`);
export const manifestCsvUrl = (id, type) => `${EDUCATOR_STUDY_TOUR_BASE}/admin/tours/${id}/manifest?type=${type}&format=csv`;
export const runAutomations = (studyTour) => post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/automations/run`, { studyTour });
export const getDefaultDocChecklist = () => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/default-doc-checklist`);
