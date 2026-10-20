# Rekord Store

My favorite records, served from a database. Click a title to see the copies I own, when I bought them, and what condition they're in.

**Live:** https://hannahcapone.github.io/RekordStore/

This started as a PHP + MySQL project (the original code is in [`php/`](php)). GitHub Pages can't run PHP, so the live version loads the same [`rekordstore_db_tables.sql`](rekordstore_db_tables.sql) into SQLite in the browser with [sql.js](https://sql.js.org/) and runs the queries there. The queries are the same ones the PHP pages ran, now with parameters instead of string concatenation.

Run it locally with any static server, for example `python3 -m http.server`.
