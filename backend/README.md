# Backend: MySQL database

There is no separate server. The API is Next.js Route Handlers in
`frontend/app/api/`, and they talk to this MySQL database through
`frontend/lib/db.ts` (connection) and `frontend/lib/store.ts` (queries).

## Set up (once per laptop)

**1. Have MySQL running.** Any of these work:
- **XAMPP:** start **MySQL** in the XAMPP Control Panel (it's MariaDB, which is fine)
- **MySQL installed directly:** start the MySQL service
- **Docker/Podman:**
  `docker run -d --name civic-mysql -e MYSQL_ROOT_PASSWORD=civic -e MYSQL_DATABASE=catarman_civic -p 3306:3306 mysql:8.4`

**2. Create the database and load the tables and data** (run from the repo root):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS catarman_civic"
mysql -u root -p catarman_civic < backend/schema.sql
mysql -u root -p catarman_civic < backend/seed.sql
```

With XAMPP you can instead open phpMyAdmin → create `catarman_civic` → **Import** `schema.sql`, then `seed.sql`.

**3. Tell the app how to connect.** Copy the repo-root `.env.example` to
`frontend/.env.local` and fill in your password (empty for XAMPP):

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=catarman_civic
DB_USER=root
DB_PASS=
```

**4. Run the app:** `cd frontend && npm install && npm run dev`, then open
http://localhost:3000/admindashboard. The 8 Uwan-scenario seed reports should be listed.

## Files

- `schema.sql`: tables `barangays`, `evacuation_centers`, `reports`, `report_photos`, `events`.
  **Re-running it drops and recreates the two report tables** (dev/demo data only).
- `seed.sql`: 55 barangays, 8 named evacuation centers (occupancy staged for
  the nearest-open-center demo moment), and 8 Uwan-scenario reports.
  Safe to re-run: it clears the tables before inserting.

## Reports

- `reports.id` is the **client-generated UUID**. The offline queue re-sends a
  report with the same id, and `INSERT IGNORE` drops the duplicate.
- Photos are rows in `report_photos` as base64 data URLs, one row per photo.
- Times are stored in Catarman time (`+08:00`) and returned by the API as ISO 8601 UTC.
- The API shape lives in `frontend/lib/types.ts`. Change it through the
  integration owner, since the store and the schema must change together.

**Note on `evacuation_centers`:** `lat`/`lng` are required for both the map
plot (Story 2.1) and the nearest-center distance calc (Story 2.2), so any
`GET /api/evacuation-centers` must return them. The columns exist and are seeded.
