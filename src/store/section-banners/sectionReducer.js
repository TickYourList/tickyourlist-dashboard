import { GET_CITIES, GET_CITIES_SUCCESS, GET_CITIES_FAILURE, GET_SECTION_CITIES, GET_SECTION_CITIES_SUCCESS, GET_SECTION_CITIES_FAILURE } from './actionTypes';

const initialState = {
  loading: false,
  cities: [],
  error: null
};

const citiesSection = (state = initialState, action) => {
  switch (action.type) {
    case GET_SECTION_CITIES:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_SECTION_CITIES_SUCCESS:
      return {
        ...state,
        loading: false,
        cities: action.payload.data.travelCityList,
      };

    case GET_SECTION_CITIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default citiesSection;