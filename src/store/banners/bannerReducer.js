import {
  GET_BANNERS,
  GET_BANNERS_SUCCESS,
  GET_BANNERS_FAILURE,
  ADD_NEW_BANNER,
  ADD_BANNER_SUCCESS,
  ADD_BANNER_FAIL,
  DELETE_BANNERS_FAILURE,
  DELETE_BANNERS_SUCCESS,
  EDIT_BANNER,
  EDIT_BANNER_SUCCESS,
  EDIT_BANNER_FAILURE,
} from './actionTypes';

const initialState = {
  loading: false,
  banners: [],
  bannerGroups: [],
  error: null
};

 const banner = (state = initialState, action) => {
  switch (action.type) {
    case GET_BANNERS:
      return {
        ...state,
        loading: true,
        error: null
      };
    case GET_BANNERS_SUCCESS: {
  const bannerGroups = action.payload?.data || [];
  const flatBanners = bannerGroups.flatMap((cityBanner) => {
    const { cityCode, isHomeScreen, status, _id, slides = [] } = cityBanner;

    return slides.map((slide, slideIndex) => ({
      ...slide,
      cityCode,
      isHomeScreen,
      groupStatus: status,
      bannerGroupId: _id,
      allSlides: slides,
      slideIndex,
    }));
  });

  return {
    ...state,
    loading: false,
    bannerGroups,
    banners: flatBanners,
  };
}
    case GET_BANNERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

      case ADD_NEW_BANNER:
      return { ...state, loading: true, error: null };

      case ADD_BANNER_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case ADD_BANNER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case EDIT_BANNER:
      return {
        ...state,
        loading: true,
        error: null
      };

    case EDIT_BANNER_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }

    case EDIT_BANNER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      } 
    
    case DELETE_BANNERS_SUCCESS:
      return {
        ...state,
        loading: false,
      };


    case DELETE_BANNERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default banner
