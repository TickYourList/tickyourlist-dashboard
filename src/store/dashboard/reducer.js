import {
    API_SUCCESS,
    API_FAIL,
    GET_CHARTS_DATA,
    GET_ORDERS_COUNT_DATA,
    GET_ORDERS_COUNT_DATA_SUCCESS,
    GET_ORDERS_COUNT_DATA_ERROR,
    GET_REVENUE_TOTAL_DATA_SUCCESS,
    GET_REVENUE_TOTAL_DATA_ERROR,
    GET_ORDER_TOTAL_AVERAGE_PRICE_SUCCESS,
    GET_ORDER_TOTAL_AVERAGE_PRICE_ERROR,
    CAR_DASHBOARD_ACTIVITY_COUNT_SUCCESS,
    CAR_SEARCHES_DASHBOARD_LIST_SUCCESS
} from "./actionTypes";

const INIT_STATE = {
    chartsData: [],
    ordersCount: 0,
    totalRevenue: 0,
    orderDataAveragePrice: 0,
    dashboardActivity: {},
    carSearchesList: []
};

const Dashboard = (state = INIT_STATE, action) => {
    switch (action.type) {
        case API_SUCCESS:
            switch (action.payload.actionType) {
                case GET_CHARTS_DATA:
                    return {
                        ...state,
                        chartsData: action.payload.data
                    };
                default:
                    return state;
            }
        case API_FAIL:
            switch (action.payload.actionType) {
                case GET_CHARTS_DATA:
                    return {
                        ...state,
                        chartsDataError: action.payload.error
                    };
                default:
                    return state;
            }
        case GET_ORDERS_COUNT_DATA_SUCCESS:
            switch (action.payload.actionType) {
                case GET_ORDERS_COUNT_DATA_SUCCESS:
                    return {
                        ...state,
                        ordersCount: action.payload.data?.totalOrder || 0
                    };


                default:
                    return state;
            }
        case GET_ORDERS_COUNT_DATA_ERROR:
            switch (action.payload.actionType) {
                case GET_ORDERS_COUNT_DATA_ERROR:
                    return {
                        ...state,
                        ordersCount: 0
                    };


                default:
                    return state;
            }
        case GET_REVENUE_TOTAL_DATA_SUCCESS:
            switch (action.payload.actionType) {
                case GET_REVENUE_TOTAL_DATA_SUCCESS:
                    return {
                        ...state,
                        totalRevenue: action.payload.data?.totalRevenue || 0
                    };


                default:
                    return state;
            }
        case GET_REVENUE_TOTAL_DATA_ERROR:
            switch (action.payload.actionType) {
                case GET_REVENUE_TOTAL_DATA_ERROR:
                    return {
                        ...state,
                        totalRevenue: 0
                    };


                default:
                    return state;
            }
        case GET_ORDER_TOTAL_AVERAGE_PRICE_SUCCESS:
            switch (action.payload.actionType) {
                case GET_ORDER_TOTAL_AVERAGE_PRICE_SUCCESS:
                    return {
                        ...state,
                        orderDataAveragePrice: action.payload.data?.orderDataAveragePrice || 0
                    };


                default:
                    return state;
            }
        case GET_ORDER_TOTAL_AVERAGE_PRICE_ERROR:
            switch (action.payload.actionType) {
                case GET_ORDER_TOTAL_AVERAGE_PRICE_ERROR:
                    return {
                        ...state,
                        orderDataAveragePrice: 0
                    };
                default:
                    return state;
            }
        case CAR_DASHBOARD_ACTIVITY_COUNT_SUCCESS:
            return {
                ...state,
                dashboardActivity: action.payload.data,
            };
        case CAR_SEARCHES_DASHBOARD_LIST_SUCCESS:
            return {
                ...state,
                carSearchesList: action.payload,
            };

        default:
            return state;
    }
}


export default Dashboard;