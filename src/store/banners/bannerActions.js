import { GET_BANNERS, GET_BANNERS_SUCCESS, GET_BANNERS_FAILURE, ADD_NEW_BANNER, ADD_BANNER_SUCCESS, ADD_BANNER_FAIL, 
  EDIT_BANNER, EDIT_BANNER_SUCCESS, EDIT_BANNER_FAILURE, DELETE_BANNERS_FAILURE, DELETE_BANNERS_SUCCESS, DELETE_BANNER }
from "./actionTypes";
  

export const getBanners = () => ({
  type: GET_BANNERS,
});

export const getBannersSuccess = (banners) => ({
  type: GET_BANNERS_SUCCESS,
  payload: banners
});

export const getBannersFailure = (error) => ({
  type: GET_BANNERS_FAILURE,
  payload: error
});

export const deleteBanner = banner => ({
  type: DELETE_BANNER,
  payload: banner,
});


export const deleteBannersSuccess = (payload) => ({
  type: DELETE_BANNERS_SUCCESS,
  payload
});

export const deleteBannersFailure = () => ({
  type: DELETE_BANNERS_FAILURE
});

export const addNewBanner = (bannerData) => ({
  type: ADD_NEW_BANNER, 
  payload: bannerData
});

export const addBannerSuccess = (banner) => ({
  type: ADD_BANNER_SUCCESS, 
  payload: banner
});

export const addBannerFail = (error) => ({
  type: ADD_BANNER_FAIL,
  payload: error
});

export const editBanner = bannerPayload => ({
  type: EDIT_BANNER,
  payload: bannerPayload
});

export const editBannerSuccess = (banner) => ({
  type: EDIT_BANNER_SUCCESS,
  payload: banner
});

export const editBannerFailure = (error) => ({
  type: EDIT_BANNER_FAILURE,
  payload: error
});
