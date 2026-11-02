# 🎄 Christmas Gift Tracker: Joshua, Jude & Joey

**Live app:** https://sfxhewitt.github.io/xmas-gift-tracker/

A small, phone-friendly web app for planning and tracking Christmas presents for the kids. It's plain HTML/CSS/JS: no build step, no backend, no accounts, no tracking.

## What it does
- **A tab per kid** (Joshua, Jude, Joey) with an editable profile: age, interests and budget.
- **Find ideas (automatic):** a built-in curated catalogue of ~190 gift ideas, tagged by age band and interest (gaming, PC/desk setup, Pokémon, LEGO, books, sport, art, crafts, tech, outdoors, music, science, animals and more). Ideas re-rank themselves as soon as you change a kid's age, interests or budget. Filter by category or max price, shuffle, or hide ideas that aren't right.
- **One-tap UK shop searches** for every idea: Amazon.co.uk, Argos, Smyths Toys, John Lewis, Currys, eBay UK and Google Shopping UK. There's also a "Search shops" tab for anything else.
- **Save items:** name, link, price (£), shop (auto-detected from the link), notes, priority (🔥 must-have / ⭐ really want / 🙂 nice to have) and status (Idea → Saved → Bought → Wrapped; tap the pill to move it on).
- **Money tab:** budget, bought, still to buy and money left for each kid and in total. There's a **"Buy when I have money"** list sorted by priority, and an **"I have £X now"** box that highlights what you can afford.
- **Christmas countdown**, with dark and light themes.
- **Backups:** everything is saved in this browser (localStorage). Use **Export backup** / **Import backup** (JSON) to keep a copy or move it to another device.

## Files
- `index.html`: page shell
- `style.css`: styling (dark/light, mobile-first)
- `catalogue.js`: curated gift idea catalogue
- `app.js`: app logic

Hosted on GitHub Pages from `main` (root).
