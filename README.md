# Tulaziva Front

Classifieds web app (Locanto-style) for the Tulaziva API. React 18 + TypeScript + Vite + Material UI 6.
Languages: Spanish and English (i18next).

## Run

```bash
# 1. Backend (C:\Repos\tulaziva) in Development, listening on http://localhost:5158
cd C:\Repos\tulaziva\src\Tulaziva.Api
dotnet run --launch-profile http

# 2. Front
cd C:\Repos\tulaziva-front
npm install
npm run dev        # http://localhost:5173
```

Vite proxies `/api` to the backend, so no CORS is needed in development.
To point to another backend set `VITE_API_PROXY_TARGET` in `.env` (see `.env.example`).
Seeded admin in Development: `admin@tulaziva.local` / `Admin12345`.

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm test` (Vitest), `npm run test:watch`.

## Production

`npm run build` outputs `dist/`. Serve it behind a reverse proxy that forwards `/api` to the API
(and falls back to `index.html` for client routes), or add the front origin to `Cors:AllowedOrigins`
and adapt `BASE` in `src/api/client.ts`.

## Structure

```
src/
  api/          fetch client (token, Accept-Language, ProblemDetails errors) + one module per API area
  types/        DTO types mirroring the API
  context/      AuthContext (session), NotificationContext (snackbars)
  hooks/        react-query hooks (ads, chat), geolocation, debounce, protected images
  components/
    common/     avatar, dialogs, route guard, empty/error states, language switcher
    layout/     navbar, footer, layouts
    ads/        card, grid, filters, form, image uploader, gallery
    chat/       conversation list, chat window, message bubble
  pages/        Home, Search, AdDetail, AdForm, MyAds, Login, Register, Messages, Profile, Admin, NotFound
  i18n/         i18next setup + locales/es.json, en.json
  theme/        MUI theme
  utils/        formatting (UTC dates, prices), category icons
```

## Notes

- Dark mode: toggle in the navbar; starts from the OS preference and is remembered (`ColorModeContext`).
- Ad map: Leaflet + OpenStreetMap tiles, lazy-loaded; shows an approximate area, not the exact point.

- Live chat: SignalR (`/hubs/chat`, token in the query string). `RealtimeContext` only reacts to "something changed" and refreshes the
  queries; if the channel cannot open, the chat falls back to polling every 5 s (and only once a minute while it is live).
  The Vite proxy has `ws: true` for `/hubs`; a production proxy must allow WebSocket upgrades there too.
- Emails (verify address, forgot password): in development the API writes them, with their links, to its log. Set `Email:Smtp:Host`
  (and `Email:FrontendBaseUrl`) in the API to send them for real. Links open `/verify-email?token=…` and `/reset-password?token=…`.
- The endpoints that send emails are rate limited per IP (429 → `errors.tooManyRequests`).
- Favorites use an optimistic update of the id list (`useToggleFavorite`); the hearts are painted from one request (`/api/favorites/ids`).
- Sessions renew themselves: the API hands out a short access token and a refresh token (30 days, used once, replaced each time).
  `api/client.ts` answers a 401 by renewing the session once and sending the request again; requests that fail together share one
  renewal, and a tab that finds the token already renewed by another tab just retries. Only when the refresh token is refused does the
  user go back to the login. Changing or resetting the password kills the refresh tokens of the other devices.
- Change of email (`/profile`): needs the password; the link goes to the **new** address (`/confirm-email-change?token=…`) and the
  account keeps the old one until it is opened. The old address gets a notice.
- Delete account (`/profile`): needs the password. Ads, favorites and the photo are removed; the chats stay for the other person with
  the account shown as "Deleted user" and nobody can write in them. Administrators cannot delete their account from here.
- Blocking: from the menu of a chat or the list in `/profile`. Neither user can start a chat or write in the shared ones; the one who
  is blocked gets the same refusal whoever blocked whom (they are not told).
- Featured ads: shown first in the searches with a "Featured" badge. There is no payment yet, so the API decides who can promote:
  admins always, owners only when `Featuring:OwnersCanFeature` is `true` (it is in Development, not in the base settings).
  The button and its dialog read `GET /api/featuring`.
- Chat attachments need the bearer token, so they are fetched as blobs (`AuthImage`).
- The API returns UTC timestamps without a `Z`; `parseUtc` in `utils/format.ts` handles it.
- To add a language: add `src/i18n/locales/<code>.json`, register it in `src/i18n/index.ts`, and make sure the API supports it.
