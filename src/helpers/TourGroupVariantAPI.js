import { del, get, post, postFormData, put, putFormData } from "./api_helper";
import * as url from "./TourGroupVariantsHelperURL";
 
 

const getTourGroupVariants = () => get(url.GET_TOUR_GROUP_VARIANTS);
 
 

export {
    getTourGroupVariants,
    
}
 