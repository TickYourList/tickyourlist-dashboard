import { postFormData } from "../../helpers/api_helper";
import { EDUCATOR_STUDY_TOUR_BASE } from "./constants";

export const uploadDocument = (file) => {
  const fd = new FormData();
  fd.append("document", file);
  return postFormData(`${EDUCATOR_STUDY_TOUR_BASE}/admin/upload`, fd);
};
