# Steady

A week-by-week companion for Be Bodywise customers: what to expect month by month, daily and weekly calendar reminders, and a short weekly check-in read against the brand's own timeline. Concept prototype for the Mosaic Wellness Fellowship. Not an official Be Bodywise product.

## How it works

- Plain HTML, CSS and JavaScript modules. No framework, no build step, no server.
- All six products live in `data/products.json`: month-by-month content, the three signs to rate, the red-flag question and the doctor-prompt rules. Adding a product means adding an entry there.
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

- `index.html`: the single page and app shell
- `css/styles.css`: colours, type, phone and laptop layouts, skeleton loaders
- `js/app.js`: starts the app and routes between screens
- `js/screens.js`: the 11 screens
- `js/engine.js`: current week, trends, doctor-prompt rules
- `js/store.js`: saves and loads data in this browser
- `js/photos.js`: shrinks photos and stores them in IndexedDB
- `js/calendar.js`: builds the .ics reminder file
- `js/demo.js`: labelled sample data for previews
- `terms.html`, `privacy.html`: Terms of Service and Privacy Policy
