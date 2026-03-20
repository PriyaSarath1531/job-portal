export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    // Auth
    Auth:{
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        GET_PROFILE: '/auth/profile',
        UPDATE_PROFILE: '/auth/update-profile',
        DELETE_RESUME: '/auth/delete-resume',
    },
    DASHBOARD :{
        OVERVIEW : '/api/analytics/overview',
    },
    // Jobs
    JOBS: {
        GET_ALL_JOBS: '/api/jobs',
        GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
        POST_JOB: '/api/jobs',
        GET_JOBS_EMPLOYER: '/api/jobs/get-jobs-employer',
        GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
        UPDATE_JOB: (id) => `/api/jobs/${id}`,
        DELETE_JOB: (id) => `/api/jobs/${id}`,
        DELETE_JOB: (id) => `/api/jobs/${id}`,
        TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
        
        SAVE_JOB:(id) => `/api/save-jobs/${id}`,
        UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
        GET_SAVED_JOBS: '/api/save-jobs/my',

    }
};
