
import { ADD_NEW_TRAVEL_PARTNER, ADD_TRAVEL_PARTNER_FAIL, ADD_TRAVEL_PARTNER_SUCCESS, DELETE_TRAVEL_PARTNER, DELETE_TRAVEL_PARTNER_FAIL, DELETE_TRAVEL_PARTNER_SUCCESS, GET_TRAVEL_PARTNERS, GET_TRAVEL_PARTNERS_FAIL, GET_TRAVEL_PARTNERS_SUCCESS, RESET_TRAVEL_PARTNER_FLAG, UPDATE_TRAVEL_PARTNER, UPDATE_TRAVEL_PARTNER_FAIL, UPDATE_TRAVEL_PARTNER_SUCCESS } from "./actionsType";

  
  export const getTravelPartner = (page, limit) => ({
  type: GET_TRAVEL_PARTNERS,
  payload: { page, limit }, 
});

export const getTravelPartnerSuccess = travelPartners => ({
  type: GET_TRAVEL_PARTNERS_SUCCESS,
  payload: travelPartners,
});

export const getTravelPartnerFail = error => ({
  type: GET_TRAVEL_PARTNERS_FAIL,
  payload: error,
});
  
  export const addNewTravelPartner = data => ({
    type: ADD_NEW_TRAVEL_PARTNER,
    payload: data,
  });
  
  export const addTravelPartnerSuccess = event => ({
    type: ADD_TRAVEL_PARTNER_SUCCESS,
    payload: event,
  });
  
  export const addTravelPartnerFail = error => ({
    type: ADD_TRAVEL_PARTNER_FAIL,
    payload: error,
  });
  
  export const updateTravelPartner = (id, data) => ({
    type: UPDATE_TRAVEL_PARTNER,
    payload: { id, data },
  });
  
  export const updateTravelPartnerSuccess = data => ({
    type: UPDATE_TRAVEL_PARTNER_SUCCESS,
    payload: data,
  });
  
  export const updateTravelPartnerFail = error => ({
    type: UPDATE_TRAVEL_PARTNER_FAIL,
    payload: error,
  });
  
  export const deleteTravelPartner = travelPartner => ({
    type: DELETE_TRAVEL_PARTNER,
    payload: travelPartner,
  });
  
  export const deleteTravelPartnerSuccess = travelPartner => ({
    type: DELETE_TRAVEL_PARTNER_SUCCESS,
    payload: travelPartner,
  });
  
  export const deleteTravelPartnerFail = error => ({
    type: DELETE_TRAVEL_PARTNER_FAIL,
    payload: error,
  });

  export const resetTravelPartnerFlag = () => ({
    type: RESET_TRAVEL_PARTNER_FLAG,
  })


