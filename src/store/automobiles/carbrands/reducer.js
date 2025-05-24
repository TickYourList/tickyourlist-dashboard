import { ADD_CAR_BRAND_FAIL, ADD_CAR_BRAND_SUCCESS, DELETE_ALL_CAR_BRAND_SUCCESS, DELETE_CAR_BRAND_FAIL, DELETE_CAR_BRAND_SUCCESS, GET_CAR_BRANDS, GET_CAR_BRANDS_FAIL, GET_CAR_BRANDS_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BRAND_FAIL, UPDATE_CAR_BRAND_SUCCESS, UPDATE_CAR_BRANDS_SORT_ORDER_SUCCESS } from "./actionTypes";

const INIT_STATE = {
    carBrands: [],
    countries: [],
    error: {},
};

const CarBrand = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_CAR_BRANDS_SUCCESS:
            const sortedBrands = (action.payload || []).sort((a, b) => {
                if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                    return b.sortOrder - a.sortOrder; // Descending order
                }
                return 0;
            });
            return {
                ...state,
                carBrands: sortedBrands,
            };
        case GET_CAR_BRANDS_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case ADD_CAR_BRAND_SUCCESS:
            return {
                ...state,
                carBrands: [...state.carBrands, action.payload.carBrand],
            };
        case ADD_CAR_BRAND_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case UPDATE_CAR_BRAND_SUCCESS:
            return {
                ...state,
                carBrands: state.carBrands.map(carBrand =>
                    carBrand._id.toString() === action.payload._id.toString()
                        ? { carBrand, ...action.payload }
                        : carBrand
                ),
            };
        case UPDATE_CAR_BRAND_FAIL:
            return {
                ...state,
                error: action.payload,
            };

        case DELETE_CAR_BRAND_SUCCESS:
            return {
                ...state,
                carBrands: state.carBrands.filter(
                    carBrand => carBrand._id.toString() !== action.payload._id.toString()
                ),
            };

        case DELETE_CAR_BRAND_FAIL:
            return {
                ...state,
                error: action.payload,
            };
        case DELETE_ALL_CAR_BRAND_SUCCESS:
            return {
                ...state,
                carBrands: []
            }
        case GET_COUNTRIES_LIST_SUCCESS:
            return {
                ...state,
                countries: action.payload
            }
        case UPDATE_CAR_BRANDS_SORT_ORDER_SUCCESS:
            // Get the updated sort orders from the response
            const updatedSortOrders = action.payload || [];
            
            // Update the existing car brands with new sort orders
            const updatedBrands = state.carBrands.map(brand => {
                const updatedSort = updatedSortOrders.find(order => order._id === brand._id);
                return {
                    ...brand,
                    sortOrder: updatedSort ? updatedSort.sortOrder : brand.sortOrder
                };
            }).sort((a, b) => {
                if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                    return b.sortOrder - a.sortOrder; // Descending order
                }
                return 0;
            });

            return {
                ...state,
                carBrands: updatedBrands,
            };
        default:
            return state;
    }
};

export default CarBrand;
