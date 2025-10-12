Project: SSD-Fixing

Member Details:
- Index Number: IT22627728
- Name: SHRINATH D.V.A

My Scope
- Vulnerabilities addressed:
  1) Content Security Policy (CSP) Header Not Set
  2) Cross-Domain Misconfiguration

Application (short)
- Full-stack MERN app (payments, bookings, feedbacks, records, licenses, insurances, chat), multiple routes, file uploads, scheduled jobs.

Identified issues
1) CSP Header Not Set
   - Missing CSP allowed arbitrary script/style/connection sources.
2) Cross-Domain Misconfiguration
   - Dev server was reachable via LAN (192.168.*) and permissive origins; risk of DNS rebinding/data leakage.

Fixes (what I changed)
Backend (backend/index.js)
- Added strict CSP via HTTP header:
  default-src 'self';
  script-src 'self' https://accounts.google.com https://apis.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  connect-src 'self' <allowedOrigins> https://accounts.google.com https://apis.google.com;
  font-src 'self' data:;
  frame-src https://accounts.google.com;
  frame-ancestors 'none';
  upgrade-insecure-requests
- Tightened CORS: allow-list from localhost + FRONTEND_ORIGINS env.
- Added Host header allow-list in non-production to mitigate DNS rebinding.
- Bound server to 127.0.0.1 in development (0.0.0.0 in production or via BIND_ADDRESS).
- Added supporting headers: X-Content-Type-Options=nosniff, X-Frame-Options=DENY, Referrer-Policy=strict-origin-when-cross-origin, COOP/COEP set to keep flows working.

Frontend (frontend/vite.config.js, frontend/index.html)
- Locked Vite dev/preview servers to host: 'localhost' (prevents 192.168.* exposure).
- Set CSP/security headers in dev/preview (mirrors backend).
- index.html meta CSP for defense-in-depth; removed frame-ancestors from meta (ignored in meta), added a script hash to allow only the Vite preamble.

Configuration
- Backend .env:
  - FRONTEND_ORIGINS=http://localhost:5173
  - BIND_ADDRESS=127.0.0.1            # optional override
  - NODE_ENV=development|production
- Frontend (no LAN exposure by default; change only if you must test on LAN).

How to validate
- CSP: open any page → Network → Response Headers → check Content-Security-Policy present with strict directives.
- Inline script blocking: try creating an inline <script> in DevTools; it should be blocked by CSP.
- Cross-domain: attempt to load the app via http://192.168.* in dev; it should not be reachable (localhost-only binding). Host header outside allow-list should be rejected in non-production.
- CORS: requests from origins not in FRONTEND_ORIGINS should be blocked.

Notes
- If you need LAN access temporarily, set:
  - Backend: BIND_ADDRESS=0.0.0.0 and include the LAN origin in FRONTEND_ORIGINS.
  - Frontend: adjust Vite host/cors accordingly, then revert after testing.
- CSP header not set: added strict CSP on backend and dev/preview
- Cross-domain misconfiguration (e.g., sitemap.xml via 192.168.*): dev server bound to localhost, Host header allow-list added
- Inline script execution: blocked unless hashed (Vite preamble)
- Clickjacking, MIME sniffing, referrer leakage: addressed with headers
- Meta CSP warning: removed frame-ancestors from meta (kept in HTTP header)

4) Implementing an OAuth/OpenID Connect based function
- Frontend: GoogleOAuthProvider (@react-oauth/google) with VITE_GOOGLE_CLIENT_ID
- Backend: /api/auth route enabled, headers configured to support Google OAuth popup flow
- Headers set to keep OAuth working while maintaining security:
  - COOP: same-origin-allow-popups
  - COEP: unsafe-none
  - CSP allows scripts/frames from accounts.google.com and apis.google.com

Configuration
- .env (backend)
  - PORT=5555
  - DB_URI=...
  - EMAIL_USER=...
  - EMAIL_PASS=...
  - FRONTEND_ORIGINS=http://localhost:5173
  - BIND_ADDRESS=127.0.0.1           # optional override
  - NODE_ENV=development|production
- .env (frontend)
  - VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id

Validation steps
- Headers: open app, check Network tab → Response Headers → verify CSP, X-Frame-Options, nosniff, referrer-policy
- CSP: try to load an external script from console; should be blocked
- Inline script: only the Vite preamble executes (via hash), other inline scripts blocked
- LAN exposure: app not reachable from 192.168.* in dev; reachable in prod if BIND_ADDRESS/host configured
- OAuth: press Google login, popup works and returns tokens/session
- sitemap.xml or other routes via LAN IP: no longer accessible in dev due to localhost binding

Member Details:
- Index Number: IT22627728
- Name: SHRINATH D.V.A
