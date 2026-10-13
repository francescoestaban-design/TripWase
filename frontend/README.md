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
2. In **Firestore Database**, create a database in production mode and choose its region carefully; the region cannot be changed later.
3. Publish the rules from `firestore.rules`. From the repository root, you can deploy them with `firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID` after installing/logging in to the Firebase CLI and selecting the correct project. Alternatively, paste the file contents in the Firestore **Rules** tab and publish. Signed-in users can create requests and read only their own requests; client updates and deletes are denied. The rules also require a valid date unless the user explicitly marks dates as flexible.
4. In Google Cloud Console, enable **Maps JavaScript API**, **Geocoding API**, and **Maps Embed API**. Create an API key restricted to your development/deployment HTTP referrers and to those APIs.
5. Copy `.env.example` to `.env.local` and fill in the Firebase web app configuration values and `VITE_GOOGLE_MAPS_API_KEY`.
6. Start the frontend with `npm run dev`.

The destination search uses the Google Maps JavaScript Geocoder and only accepts a city, region, or country returned by Google. The map preview uses Maps Embed. The browser API key is visible to users, so HTTP referrer and API restrictions are required; do not reuse an unrestricted or server-side key.

Firebase Authentication handles account creation and sign-in. After Firestore is created and the rules are published, submitting the request form saves a document to the `requests` collection, tied to the signed-in user's UID. The app displays a success summary only after Firestore confirms the write; otherwise it shows the Firebase error code. The data is visible in Firebase Console under Firestore Database > Data.

Activity and hotel cards are illustrative samples, not live inventory. Requests are stored for manual quotation; availability, bookable prices, bookings, and payments are not integrated with a supplier.
