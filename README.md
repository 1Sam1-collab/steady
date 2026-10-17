# Steady

A week-by-week companion for Be Bodywise customers: what to expect month by month, daily and weekly calendar reminders, and a short weekly check-in read against the brand's own timeline. Concept prototype for the Mosaic Wellness Fellowship. Not an official Be Bodywise product.

## How it works

- Plain HTML, CSS and JavaScript modules. No framework, no build step, no server.
- All six products live in `products.json`: month-by-month content, the three signs to rate, the red-flag question and the doctor-prompt rules. Adding a product means adding an entry there.
- Everything a customer enters stays in her browser (localStorage for ratings, IndexedDB for photos). No login, no analytics.

## Run it locally

Browsers block modules opened straight from a file, so serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages

1. Create a public repository and upload the contents of this folder (index.html at the top level).
2. Settings, then Pages. Under "Build and deployment", choose "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Files

All files sit in one folder.

- `index.html`: the single page and app shell
- `styles.css`: colours, glass surfaces, shapes, phone and laptop layouts, skeleton loaders
- `app.js`: starts the app, routes between screens, back button
- `screens.js`: the home page and the 11 app screens
- `ui.js`: pop-up sheets and toasts
- `engine.js`: current week, trends, doctor-prompt rules
- `store.js`: saves and loads data in this browser
- `photos.js`: shrinks photos and stores them in IndexedDB
- `calendar.js`: Google Calendar links and the .ics reminder file
- `demo.js`: labelled sample data for previews
- `dom.js`: small DOM helpers and the custom line icons
- `products.json`: the six products, their month-by-month content, signs and rules
- `terms.html`, `privacy.html`: Terms of Service and Privacy Policy
- `photo-serum.jpg`, `photo-rollon.jpg`, `icon*.png`, `icon.svg`, `manifest.webmanifest`: images and home-screen icon
