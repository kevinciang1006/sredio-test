# Interceptors

HTTP interceptors live here. They intercept outgoing HTTP requests and incoming responses.

## Convention
- One interceptor per file, named `<purpose>.interceptor.ts`.
- Use the functional API (`HttpInterceptorFn`), not the class-based `HttpInterceptor`.
- Register in `app.config.ts` via `provideHttpClient(withInterceptors([...]))`.

## What's implemented here
- `auth.interceptor.ts` — attaches `Authorization: Bearer <token>` to outgoing requests when `AuthService.token()` is set.

## What would live here later
```ts
// error.interceptor.ts (example, not implemented)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) inject(AuthService).logout();
      return throwError(() => err);
    }),
  );
};
```
