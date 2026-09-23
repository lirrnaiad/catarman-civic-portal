add PHP code here

## Database

```bash
mysql -u root -p your_db_name < schema.sql
mysql -u root -p your_db_name < seed.sql
```

- `schema.sql` — tables: `barangays`, `reports`, `evacuation_centers`, `events`.
- `seed.sql` — 55 barangays, 9 named evacuation centers (occupancy staged for
  the offline-demo nearest-open-center moment), and 8 Uwan-scenario reports.
  Safe to re-run — it truncates before inserting.

**Note on `evacuation_centers`:** the API contract in the team brief lists
only `name, barangay, capacity, current_occupancy`, but `lat`/`lng` are
required for both the map plot (Story 2.1) and the nearest-center distance
calc (Story 2.2). `GET /evacuation_centers` needs to return `lat`/`lng` too
— flagged in group chat, columns already exist in the schema and are seeded.
