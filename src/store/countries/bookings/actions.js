export const GET_BOOKINGS = "GET_BOOKINGS";
export const GET_BOOKINGS_SUCCESS = "GET_BOOKINGS_SUCCESS";
export const GET_BOOKINGS_FAILURE = "GET_BOOKINGS_FAILURE";
export const APPEND_BOOKINGS_SUCCESS = "APPEND_BOOKINGS_SUCCESS";

export const getBookings = (countryId, { page = 1, limit = 50, append = false } = {}) => ({
    type: GET_BOOKINGS,
    payload: { countryId, page, limit, append },
});

export const getBookingsSuccess = (bookings) => ({
    type: GET_BOOKINGS_SUCCESS,
    payload: bookings,
});

export const getBookingsFailure = (error) => ({
    type: GET_BOOKINGS_FAILURE,
    payload: error,
});

export const appendBookingsSuccess = (bookings) => ({
    type: APPEND_BOOKINGS_SUCCESS,
    payload: bookings,
});