# Toronto Student Housing Matrix Frontend

This directory contains the React/Vite browser application for Toronto Student Housing Matrix.

Start with the repository's main documentation:

- [Project README](../README.md)
- [Technical Documentation](../docs/TECHNICAL_DOCUMENTATION.md)
- [Project Closure Artifacts](../docs/PROJECT_CLOSURE.md)

## Local development

Node.js 24.x is the version used by CI.

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` must point to the Express backend. `VITE_MAPTILER_KEY` is optional; maps fall back to OpenStreetMap when it is blank.

## Verification

```bash
npm test
npm run lint
npm run build
```

For complete backend setup, MongoDB seeding, environment variables, public deployment, and demo-account instructions, use the root [README](../README.md#local-installation).

## Authentication design assets

On desktop, sign-in and registration share a split layout with a Toronto rooftop photograph on
the left and the TS identity above the form on the right. At 700px and below, the photograph
becomes a short masthead above the form and loads its own WebP crop.

`AuthForm` sends field edits, mode changes and submissions to `App.jsx` through
`onFieldChange`, `onModeChange` and `onSubmit`. The app handles validation, API calls and the
session so a successful sign-in returns the visitor to the requested page. Keep auth styles in
`src/styles/auth.css`. Its reduced-motion rules turn off animations and transitions while the
submit button still shows progress in words.

- **Component references.** The split layout follows Mudit Goel’s Sign In. The mode switch and
  submit feedback adapt Edu Calvo’s Auth Form and Smooth Button in local JSX and CSS.
  [Sign In on 21st](https://21st.dev/@muditgoel1512/components/sign-in/sign-in) ·
  [Auth Form on 21st](https://preview.21st.dev/@educalvolpz/components/auth-form) ·
  [Smooth Button](https://smoothui.dev/docs/primitives/smooth-button)
- **Photography.** Both crops come from Mvrkle’s photograph of the CN Tower at sunset.
  [Original on Unsplash](https://unsplash.com/photos/person-standing-on-top-of-building-in-front-of-cn-tower-during-sunset-vJi2z0LSsqQ) ·
  [Unsplash License](https://unsplash.com/license)
- **Typography.** The gate self-hosts Fontsource’s Latin WOFF2 subsets. DM Sans sets the form
  and city panel. Instrument Serif italic sets “Toronto.” in the headline. Both SIL Open Font
  License notices ship under `/licenses/auth/`.
  [DM Sans](https://fontsource.org/fonts/dm-sans) · [Instrument Serif](https://fontsource.org/fonts/instrument-serif) ·
  [License notices](public/licenses/auth/)
