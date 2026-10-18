# Steady

A week-by-week companion for Be Bodywise customers. It shows what to expect month by month, puts daily and weekly reminders in the customer's calendar, and asks for a short weekly check-in that is read against the brand's own timeline. When something looks wrong, it sends the customer to a Be Bodywise doctor.

Concept prototype for the Mosaic Wellness Fellowship Builder Round. Not an official Be Bodywise product. Not medical advice.

- Live app: https://1sam1-collab.github.io/steady/
- Code: https://github.com/1Sam1-collab/steady

## What it does

- **Pick products:** up to three of six Be Bodywise products (hair serum, hair gummies, AHA BHA body wash, urea body lotion, underarm roll-on, multivitamin gummies), each with its own start date.
- **13-week timeline:** month cards quoting Be Bodywise's own product-page claims; text written by the app is labelled "App note".
- **Weekly check-in:** days used, three product-specific signs rated on a five-word scale, an optional photo and one warning-sign question. Under a minute.
- **Progress:** a line per sign from the starting point to now, plus photos side by side.
- **Doctor prompt:** a "Yes" to the warning sign, or no improvement by the brand's milestone, opens Be Bodywise's online doctor page.
- **Reminders:** Google Calendar links and an .ics file for Apple or Outlook, stopping at week 13.
- **Add to home screen:** a button on the home page installs Steady like an app.

## How it is built

- Plain HTML, CSS and JavaScript modules. No framework, no build step, no server, no login.
- All six products live in `products.json`: month-by-month content, the three signs to rate, the warning-sign question and the doctor-prompt rules. Adding a product means adding an entry there.
- Everything a customer enters stays in her browser: localStorage for the plan and ratings, IndexedDB for photos. Nothing is uploaded and there is no tracking.
- A Content Security Policy allows scripts only from the site itself.
- Every file is loaded with a version number (`?v=20`) so a new release never mixes with an old cached copy.

## Run it locally

Browsers block modules opened straight from a file, so serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Files

All files sit in one folder.

- `index.html`: the page shell, navigation and footer
- `styles.css`: colours, glass surfaces, shapes, phone and laptop layouts, skeleton loaders
- `app.js`: starts the app, switches screens, Back button, Add to home screen button
- `screens.js`: the home page and the app screens (pick products, start dates, check-in, timeline, month, check-in done, progress, doctor, settings)
- `engine.js`: current week, trends and the doctor-prompt rules
- `store.js`: saves and loads data in this browser
- `photos.js`: shrinks photos and stores them in IndexedDB
- `calendar.js`: Google Calendar links and the .ics reminder file
- `ui.js`: pop-up sheets and toasts
- `dom.js`: small DOM helpers and the custom line icons
- `products.json`: the six products, their month-by-month content, signs and rules
- `terms.html`, `privacy.html`: Terms of Service and Privacy Policy
- `photo-serum.jpg`, `photo-rollon.jpg`: home page images
- `icon.svg`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest`: app icon for the home screen
