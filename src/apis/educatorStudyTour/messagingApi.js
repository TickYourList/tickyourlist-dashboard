import { get, post } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";

export const previewMessage = (id, templateKey, vars = {}) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/message/preview`, { templateKey, vars });

export const sendMessage = (id, templateKey, channels, vars = {}) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/${id}/message`, { templateKey, channels, vars });

export const bulkMessage = (studyTour, templateKey, channels, vars = {}, stage) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/bulk-message`, { studyTour, templateKey, channels, vars, stage });

export const bulkMessagePreview = (studyTour, templateKey, channels, vars = {}, stage) =>
  post(`${EDUCATOR_STUDY_TOUR_BASE}/admin/participants/bulk-message/preview`, { studyTour, templateKey, channels, vars, stage });

export const getChannelAvailability = () => get(`${EDUCATOR_STUDY_TOUR_BASE}/admin/channels`);
