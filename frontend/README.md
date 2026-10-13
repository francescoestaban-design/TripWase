# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## TripWise local setup

1. Create a Firebase project and enable **Authentication > Email/Password**.
2. In Google Cloud Console, enable **Maps JavaScript API**, **Geocoding API**, and **Maps Embed API**. Create an API key restricted to your development/deployment HTTP referrers and to those APIs.
3. Copy `.env.example` to `.env.local` and fill in the Firebase web app configuration values and `VITE_GOOGLE_MAPS_API_KEY`.
4. Start the frontend with `npm run dev`.

The destination search uses the Google Maps JavaScript Geocoder and only accepts a city, region, or country returned by Google. The map preview uses Maps Embed. The browser API key is visible to users, so HTTP referrer and API restrictions are required; do not reuse an unrestricted or server-side key.

Firebase Authentication currently handles account creation and sign-in. Experience requests, estimates, bookings, hotel availability, and payments are still frontend previews; they are not stored or sent to a provider.
