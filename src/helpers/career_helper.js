import { get, post, put, del } from "./api_helper";

// Career Postings API
export const getCareerPostingsList = () => get("/v1/careers/admin/all");

export const getCareerPostingById = (id) => get(`/v1/careers/${id}`);

export const createCareerPosting = (data) => post("/v1/careers/admin", data);

export const updateCareerPosting = (id, data) => put(`/v1/careers/admin/${id}`, data);

export const deleteCareerPosting = (id) => del(`/v1/careers/admin/${id}`);

// Career Applications API
export const getCareerApplications = () => get("/v1/careers/admin/applications");

export const updateApplicationStatus = (id, status) => put(`/v1/careers/admin/applications/${id}/status`, { status });
