// API related
export const API_SERVER = process.env.REACT_APP_API_SERVER;
export const API_VERSION = process.env.REACT_APP_API_VERSION;
export const API_SERVER_URL = API_SERVER + '/' + API_VERSION;
export const API_AUTH_HEADER_PREFIX = process.env.REACT_APP_API_AUTH_HEADER_PREFIX;

export const DEFAULT_EMAIL_RESEND_COUNTER = 30;

// Common
export const DEFAULT_PAGINATION_PER_PAGE = 50;