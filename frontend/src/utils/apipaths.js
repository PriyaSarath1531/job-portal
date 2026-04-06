export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        GET_ME: "/api/auth/me",
        UPLOAD_IMAGE: "/api/auth/upload-image",
        FACE_LOGIN: "/api/auth/face-login",
        REGISTER_FACE: "/api/auth/register-face",
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
    USER: {
        UPDATE_PROFILE: "/api/user/profile",
        DELETE_RESUME: "/api/user/resume",
        GET_PUBLIC_PROFILE: (userId) => `/api/user/public/${userId}`,
    },
    JOBS: {
        CREATE: "/api/jobs",
        GET_ALL: "/api/jobs",
        GET_BY_ID: (id) => `/api/jobs/${id}`,
        UPDATE: (id) => `/api/jobs/${id}`,
        DELETE: (id) => `/api/jobs/${id}`,
        TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
        GET_EMPLOYER_JOBS: "/api/jobs/get-jobs-employer",
    },
    APPLICATIONS: {
        APPLY: (jobId) => `/api/applications/${jobId}`,
        GET_MY: "/api/applications/my",
        GET_BY_JOB: (jobId) => `/api/applications/job/${jobId}`,
        GET_BY_ID: (id) => `/api/applications/${id}`,
        UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
    },
    SAVED_JOBS: {
        SAVE: (jobId) => `/api/save-jobs/${jobId}`,
        GET_MY: "/api/save-jobs/my",
        UNSAVE: (jobId) => `/api/save-jobs/${jobId}`,
    },
    ANALYTICS: {
        OVERVIEW: "/app/analytics/overview",
    }
};
