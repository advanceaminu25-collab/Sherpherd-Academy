# Sherpherd-Academy
Our school website made to make registration and administrative works easier and effective. Sign up as a parent and register your child now

# Sherpherd Academy

School management dashboard starter project.

## Project structure

- `index.html` — dashboard page
- `css/styles.css` — styling and responsive layout
- `js/config.js` — school configuration
- `js/data.js` — browser-only demo student data
- `js/app.js` — dashboard interactions
- `supabase/schema.sql` — initial database tables
- `assets/` — images and other static assets

## Run locally

1. Keep the folder structure unchanged.
2. Open `index.html` in a browser, or use a local development server.
3. Add demo students and test the dashboard.
4. Demo data is stored in the browser's local storage.

## Publish with GitHub Pages

1. Create a GitHub repository named `sherpherd-academy`.
2. Upload the project files and folders.
3. Open the repository's Settings.
4. Choose Pages.
5. Select the main branch and root folder.
6. Save and wait for GitHub Pages to publish the site.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Review `supabase/schema.sql` before running it.
4. Configure authentication and role-aware security policies.
5. Connect the frontend through the Supabase JavaScript client.
6. Replace the demo data layer only after the database permissions have
   been reviewed and tested.

## Important security notes

This starter is not a complete production school management system.

- Demo mode does not synchronize data between devices.
- The current dashboard does not yet have working Supabase authentication.
- Only the initial database structure is provided.
- Database access policies must be completed before using real student,
  parent, staff, attendance, or financial records.
- Never put a Supabase service-role or secret key in frontend code.
- Do not commit passwords, private keys, or real student information.
