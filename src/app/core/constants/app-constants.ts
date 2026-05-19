export const APP_CONSTANTS = {
  CURRENT_DATE: '2026-05-19',
  HOURS_PER_YEAR: 2000,
  LOCAL_STORAGE_KEYS: {
    AUTH_TOKEN: 'sredio.auth.token',
    AUTH_USER: 'sredio.auth.user',
    LAST_TENANT_ID: 'sredio.last-tenant-id',
  },
} as const;

export const ROUTES = {
  LOGIN: 'login',
  TENANT_ROOT: 'tenant',
} as const;
