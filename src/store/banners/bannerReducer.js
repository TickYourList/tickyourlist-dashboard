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
  const flatBanners = action.payload.data.flatMap((cityBanner) => {
    const { cityCode, isHomeScreen, _id, slides = [] } = cityBanner;

    return slides.map((slide) => ({
      ...slide,
      cityCode,
      isHomeScreen,
      bannerGroupId: _id, 
    }));
  });

  return {
    ...state,
    loading: false,
    banners: flatBanners,
  };
}
    case GET_BANNERS_FAILURE:
      return {
        ...state,
        error: action.payload,
      }

      case ADD_NEW_BANNER:
      return { ...state, loading: true, error: null };

      case ADD_BANNER_SUCCESS:
      return {
        ...state,
        banners: [action.payload, ...state.banners],
      };

    case ADD_BANNER_FAIL:
      return {
        ...state,
        error: action.payload,
      }

    case EDIT_BANNER:
      return {
        ...state,
        loading: true,
        error: null
      };

    case EDIT_BANNER_SUCCESS: {
      const updatedBanners = state.banners.map(banner => {
        if (banner._id === action.payload._id) {
          return action.payload;
        }
        return banner;
      });
      return {
        ...state,
        loading: false,
        banners: updatedBanners,
      };
    }

    case EDIT_BANNER_FAILURE:
      return {
        ...state,
        error: action.payload,
      } 
    
    case DELETE_BANNERS_SUCCESS:
      return {
        ...state,
        banners: state.banners.filter(
          banner => banner._id !== action.payload
        ),
      };


    case DELETE_BANNERS_FAILURE:
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}

export default banner