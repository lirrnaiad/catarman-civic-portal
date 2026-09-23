import mysql from "mysql2/promise";

/**
 * Shared MySQL connection pool for the Route Handlers in app/api/.
 * Configure in frontend/.env.local (see ../.env.example). Works against
 * MySQL 8 and XAMPP's MariaDB alike.
 *
 * Cached on globalThis so `next dev` hot reloads reuse one pool instead of
 * opening a new set of connections on every edit.
 */
const globalForDb = globalThis as unknown as { civicPool?: mysql.Pool };

export const db =
  globalForDb.civicPool ??
  mysql.createPool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? "catarman_civic",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "",
    // Catarman time, so seed timestamps and new reports line up.
    timezone: "+08:00",
    connectionLimit: 5,
    // DECIMAL lat/lng come back as numbers instead of strings.
    decimalNumbers: true,
  });

if (!globalForDb.civicPool) {
  // Make SQL NOW()/CURDATE() Catarman time too, matching how DATETIMEs are
  // written above (the MySQL server itself often runs in UTC).
  db.pool.on("connection", (conn) => {
    conn.query("SET time_zone = '+08:00'");
  });
}

if (process.env.NODE_ENV !== "production") globalForDb.civicPool = db;
