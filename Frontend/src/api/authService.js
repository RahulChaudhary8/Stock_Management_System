import api from "./axios";

export const registerUser = (data) =>
    api.post("/accounts/register/", data);

export const loginUser = (data) =>
    api.post("/accounts/login/", data);

export const forgotPassword = (data) =>
    api.post("/accounts/forgot-password/", data);

export const verifyOtp = (data) =>
    api.post("/accounts/verify-otp/", data);

export const resetPassword = (data) =>
    api.post("/accounts/reset-password/", data);

export const logoutUser = () =>
    api.post("/accounts/logout/");