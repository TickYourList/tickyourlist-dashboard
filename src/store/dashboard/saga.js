import { call, put, takeEvery, all, fork } from "redux-saga/effects";

// Crypto Redux States
import { CAR_DASHBOARD_ACTIVITY_COUNT, CAR_SEARCHES_DASHBOARD_LIST, CAR_SEARCHES_DASHBOARD_LIST_ERROR, CAR_SEARCHES_DASHBOARD_LIST_SUCCESS, GET_CHARTS_DATA, GET_ORDERS_COUNT_DATA, GET_ORDERS_COUNT_DATA_ERROR, GET_ORDER_TOTAL_AVERAGE_PRICE, GET_ORDER_TOTAL_AVERAGE_PRICE_ERROR, GET_ORDER_TOTAL_AVERAGE_PRICE_SUCCESS, GET_REVENUE_TOTAL_DATA, GET_REVENUE_TOTAL_DATA_ERROR } from "./actionTypes";
import { apiSuccess, apiFail, getTotalOrdersCountApiSuccess, getTotalOrdersCountApiError, getRevenueTotalDataSuccess, getOrderTotalAveragePriceError, getRevenueTotalDataError, getCarDashboardActivitySuccess, getCarDashboardActivityError, getCarSearchDashboardActivitySuccess, getCarSearchDashboardActivityError } from "./actions";

//Include Both Helper File with needed methods
import {
    getWeeklyData,
    getYearlyData,
    getMonthlyData
}
    from "../../helpers/fakebackend_helper";
import { getOrderTotalAveragePriceApi, getTotalOrdersCountData, getTotalRevenueCountData } from "helpers/backend_helper";
import { getCarDashboardAvtivityList, getCarTopSearchActivityList } from "helpers/automobile_helper_apis";
import { GET_CAR_DASHBOARD_ACTIVITY } from "helpers/automobile_url_helpers";

function* getChartsData({ payload: periodType }) {
    try {
        var response;
        if (periodType == "monthly") {
            response = yield call(getWeeklyData, periodType);
        }
        if (periodType == "yearly") {
            response = yield call(getYearlyData, periodType);
        }
        if (periodType == "weekly") {
            response = yield call(getMonthlyData, periodType);
        }

        yield put(apiSuccess(GET_CHARTS_DATA, response));
    } catch (error) {
        yield put(apiFail(GET_CHARTS_DATA, error));
    }
}

function* getDashboardActivitiesCountList() {
    try {
        const response = yield call(getCarDashboardAvtivityList);
        yield put(getCarDashboardActivitySuccess(response));
    } catch(error) {
        yield put(getCarDashboardActivityError({}));
    }
}

function* getOrdersCountData() {
    try {
        const response = yield call(getTotalOrdersCountData);
        // const response = yield call(getTotalOrdersCountData, '');
        yield put(getTotalOrdersCountApiSuccess(GET_ORDERS_COUNT_DATA_SUCCESS, response));
    }catch(error) {
        yield put(getTotalOrdersCountApiError(GET_ORDERS_COUNT_DATA_ERROR, {}));
    }
}

function* getRevenueTotalData() {
    try {
        const response = yield call(getTotalRevenueCountData);
        // const response = yield call(getTotalOrdersCountData, '');
        yield put(getRevenueTotalDataSuccess(GET_REVENUE_TOTAL_DATA_SUCCESS, response));
    }catch(error) {
        yield put(getRevenueTotalDataError(GET_REVENUE_TOTAL_DATA_ERROR, {}));
    }
}

function* getOrderTotalAveragePrice() {
    try {
        const response = yield call(getOrderTotalAveragePriceApi);
        // const response = yield call(getTotalOrdersCountData, '');
        yield put(getOrderTotalAveragePriceSuccess(GET_ORDER_TOTAL_AVERAGE_PRICE_SUCCESS, response));
    }catch(error) {
        yield put(getOrderTotalAveragePriceError(GET_ORDER_TOTAL_AVERAGE_PRICE_ERROR, {}));
    }
}

function* getCarTopSearchList() {
    try {
        const response = yield call(getCarTopSearchActivityList);
        yield put(getCarSearchDashboardActivitySuccess(response.data.carCustomersList));
    }catch(error) {
        yield put(getCarSearchDashboardActivityError({}));
    }
}

export function* watchGetChartsData() {
    yield takeEvery(GET_CHARTS_DATA, getChartsData);
    yield takeEvery(GET_ORDERS_COUNT_DATA, getOrdersCountData);
    yield takeEvery(GET_REVENUE_TOTAL_DATA, getRevenueTotalData);
    yield takeEvery(GET_ORDER_TOTAL_AVERAGE_PRICE, getOrderTotalAveragePrice);
    yield takeEvery(CAR_DASHBOARD_ACTIVITY_COUNT, getDashboardActivitiesCountList);
    yield takeEvery(CAR_SEARCHES_DASHBOARD_LIST, getCarTopSearchList);
}

function* dashboardSaga() {
    yield all([fork(watchGetChartsData)]);
}

export default dashboardSaga;
