export const APP_CONSTANTS = {
  CURRENT_DATE: '2025-09-30',
  HOURS_PER_YEAR: 2000,
  LOCAL_STORAGE_KEYS: {
    AUTH_TOKEN: 'sredio.auth.token',
    AUTH_USER: 'sredio.auth.user',
  },
} as const;

export const ROUTES = {
  LOGIN: 'login',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
} as const;
