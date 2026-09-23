# Testing the portal locally

Everything is on the **`integration`** branch: Report, Centers, Events, the MDRRMO
dashboard and the office accounts. Test that branch. Setup takes about 15 minutes
the first time and about 1 minute after that.

> Commands work in PowerShell (Windows), Terminal (macOS) and bash/fish (Linux).
> Where Windows is different, it's shown separately.

---

## Part 1 — One-time setup

### Step 1. Install the tools

| Tool | Check it's installed | Get it |
|---|---|---|
| **Git** | `git --version` | git-scm.com |
| **Node.js 20.9 or newer** (22 recommended) | `node -v` | nodejs.org (LTS) |
| **MySQL**: pick **one** | see Step 4 | **XAMPP** (easiest on Windows), MySQL 8, or Docker |

### Step 2. Get the code

If you **don't** have the repo yet:

```bash
git clone git@github.com:lirrnaiad/catarman-civic-portal.git
cd catarman-civic-portal
git switch integration
```

If you **already** have it:

```bash
cd catarman-civic-portal
git stash            # only if `git status` shows changes you want to keep
git fetch origin
git switch integration
git pull
```

### Step 3. Install the app's packages

```bash
cd frontend
npm install
```

### Step 4. Start MySQL and load the database

Pick the option that matches what you installed.

**Option A: XAMPP (Windows/macOS)**
1. Open the **XAMPP Control Panel** → click **Start** next to **MySQL**.
2. Click **Admin** next to MySQL (opens phpMyAdmin in your browser).
3. Click **New** → database name `catarman_civic` → **Create**.
4. With `catarman_civic` selected: **Import** → choose `backend/schema.sql` → **Import**.
5. **Import** again → choose `backend/seed.sql` → **Import**.
6. Your MySQL user is `root` with an **empty** password.

**Option B: Docker**
```bash
docker run -d --name civic-mysql -e MYSQL_ROOT_PASSWORD=civic -e MYSQL_DATABASE=catarman_civic -p 3306:3306 mysql:8.4
```
Wait about 20 seconds, then from the **repo root**:
```bash
mysql -h127.0.0.1 -uroot -pcivic catarman_civic < backend/schema.sql
mysql -h127.0.0.1 -uroot -pcivic catarman_civic < backend/seed.sql
```
(No `mysql` command? Use `docker exec -i civic-mysql mysql -uroot -pcivic catarman_civic < backend/schema.sql` and the same for `seed.sql`.)
Your MySQL user is `root`, password `civic`.

**Option C: MySQL installed directly**
```bash
mysql -h127.0.0.1 -uroot -p -e "CREATE DATABASE IF NOT EXISTS catarman_civic"
mysql -h127.0.0.1 -uroot -p catarman_civic < backend/schema.sql
mysql -h127.0.0.1 -uroot -p catarman_civic < backend/seed.sql
```

✅ **Check:** the database has 8 reports, 8 evacuation centers, 9 events and 55 barangays.

### Step 5. Create your settings file

Copy `.env.example` (repo root) to **`frontend/.env.local`**:

- macOS/Linux: `cp .env.example frontend/.env.local`
- Windows (PowerShell): `Copy-Item .env.example frontend\.env.local`

Open `frontend/.env.local` and fill it in:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=catarman_civic
DB_USER=root
DB_PASS=
ADMIN_PASSWORD=pick-an-mdrrmo-password
AGENCY_PASSWORDS=MHO:pick-one,MENRO:pick-another
```

- `DB_PASS`: leave it **empty** for XAMPP; write `civic` for the Docker option.
- Use `127.0.0.1`, **not** `localhost` (see Troubleshooting).
- These passwords are only for your laptop. `.env.local` is never committed, so **never put real passwords in `.env.example`**.

### Step 6. Run it

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**. You should land on **Report an issue**, with the
bottom tabs **Centers · (orange Report) · Events**.

---

## Part 2 — Every time after that

```bash
git pull
cd frontend
npm install        # only needed if someone added a package; safe to always run
npm run dev
```

MySQL has to be running (XAMPP **Start**, or `docker start civic-mysql`).

---

## Part 3 — What to test

Use **Chrome**. Press **F12** → click the **phone icon** (device toolbar) → pick
**iPhone 12 Pro** or similar, because the app is designed for phones first.
Allow location when asked.

Tick each line. If something doesn't match **Expected**, see Part 5.

### A. Report (the main tab)

| # | Do this | Expected |
|---|---|---|
| A1 | Open http://localhost:3000 | "Report an issue", 4 big tiles, "Using your location · near Brgy. …" |
| A2 | Tap **Submit report** without choosing a tile | Red "Choose what's happening." Nothing is sent |
| A3 | Tap **Garbage / Segregation** → **Submit report** | Animated check → **"Sent to MDRRMO"** + a reference like #4CE86766 |
| A4 | **Report another issue** → tap **Flood / Landslide** | A green **"Need shelter? Nearest open center…"** card appears |
| A5 | Tap the **photo box** and add a picture; open **Add details** and type a description | Photo thumbnail shows; details accepted |
| A6 | **Offline test:** F12 → **Network** tab → change **No throttling** to **Offline** | Top pill turns amber **Offline**; banner "You're offline…"; button reads "Save report · sends when online" |
| A7 | Choose a tile → **Save report** | **"Saved on this device"** (pulsing amber) + "1 report waiting to send" |
| A8 | Set the Network tab back to **No throttling** | Within about 2 s: **"Sent to MDRRMO"** and "1 report saved offline was sent" |

⚠️ While offline, **don't reload the page**. Reloading offline isn't supported yet.

### B. Centers (left tab)

| # | Do this | Expected |
|---|---|---|
| B1 | Tap **Centers** | Content slides; green card **"Your nearest open center"** with km, walk time, spaces left |
| B2 | Tap **Directions** | Google Maps opens with walking directions |
| B3 | Tap the **Full (2)** chip | Only St. Michael Academy and Catarman Cathedral |
| B4 | Tap any center in the list | The map flies to it |
| B5 | Block location (click the 🔒 in the address bar → Location → Block → reload) | A **barangay picker** appears; choosing one shows the nearest center "(from your barangay)" |

### C. Events (right tab)

| # | Do this | Expected |
|---|---|---|
| C1 | Tap **Events** | "Up next" colored card with a countdown, date strip, and a list grouped by day |
| C2 | Tap **Health** | Only health events |
| C3 | Tap the **bookmark** on an event, then reload | **Saved (1)** chip; the event is still saved |
| C4 | Tap an event card | Detail page (the date badge grows into it); **Add to calendar** downloads a `.ics` file; **Open in Google Maps** works |

### D. MDRRMO staff (use `ADMIN_PASSWORD`)

| # | Do this | Expected |
|---|---|---|
| D1 | Go to http://localhost:3000/admin | Staff sign-in page |
| D2 | Enter a wrong password | "Wrong password. Try again." |
| D3 | Enter `ADMIN_PASSWORD` | **Reports** dashboard with your reports from Part A |
| D4 | Change a report's status → reload | New status is kept |
| D5 | On a phone-size screen: **List / Map** switch; tap a card, then **Map** | Map opens on that report, no error |
| D6 | First open http://localhost:3000/evacuation in a **second tab**. Back in the dashboard: **Centers** button → **+10** on a center | "Saved ✓". In the second tab the number updates **by itself within 20 s**, no reload |
| D7 | Flip a center's switch to **Closed** | Citizens see it as **Closed · Not accepting evacuees** (flip it back after) |
| D8 | **Add center** → fill it in, tap the map for the pin → **Add center** | Appears on the public Centers tab; then **Remove** it |
| D9 | **Sign out** | Back to the Report tab; `/admin` asks for the password again |

### E. Other offices (use an `AGENCY_PASSWORDS` entry, e.g. MHO)

| # | Do this | Expected |
|---|---|---|
| E1 | http://localhost:3000/admin → MHO's password | **Your events** · "Posting as MHO" |
| E2 | Go to http://localhost:3000/admindashboard | Sent back to Your events (offices can't see reports) |
| E3 | **New event** → fill it in → watch "How citizens will see it" → **Publish** | Toast "Published"; it's on the public **Events** tab with **✓ MHO** |
| E4 | **Edit** it → change the title → **Save changes** | Public tab shows the new title |
| E5 | **Delete** → **Delete** | Gone from the public tab |

### F. On a real phone (optional, same Wi-Fi)

1. Find your laptop's IP address: Windows `ipconfig` (IPv4 Address), macOS `ipconfig getifaddr en0`, Linux `hostname -I`. For example, `192.168.1.23`.
2. Stop the app (Ctrl+C) and start it **on that address**:
   `npm run dev -- -H 192.168.1.23`
   (The dev server only accepts requests addressed to the host it was started with. With `0.0.0.0` the phone gets a page whose scripts never load.)
3. On the phone **and** the laptop, open `http://192.168.1.23:3000`; `localhost` won't answer in this mode.
4. If the phone can't connect, allow Node.js through the laptop's firewall (Windows asks the first time; click **Allow**).
5. **Location won't work on the phone** (browsers only allow it on HTTPS or localhost). Tap the map to drop a pin, and on Centers pick your barangay. Everything else works.

---

## Part 4 — Resetting the data

To get back to clean demo data (this **deletes** reports, events and centers you added):

- **XAMPP:** phpMyAdmin → `catarman_civic` → Import `backend/schema.sql`, then `backend/seed.sql`.
- **Docker/MySQL:** rerun the two `mysql … < backend/schema.sql` / `seed.sql` commands from Step 4.

Events are dated relative to the day you load `seed.sql`, so **reload it on demo
day** to make "Up next" and "Today" correct.

---

## Part 5 — Troubleshooting

| You see | Fix |
|---|---|
| `ECONNREFUSED ::1:3306` or `127.0.0.1:3306` | MySQL isn't running (XAMPP → Start / `docker start civic-mysql`), or `DB_HOST` is `localhost`; change it to `127.0.0.1` |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` / `DB_PASS` in `frontend/.env.local` (XAMPP: `root` + empty) |
| `ER_BAD_DB_ERROR` / `Table … doesn't exist` | Step 4 wasn't finished: create `catarman_civic` and import both files |
| "Staff login isn't set up" | `ADMIN_PASSWORD` is missing from `frontend/.env.local`; add it and **restart** `npm run dev` |
| Changed `.env.local` but nothing changed | Stop (Ctrl+C) and `npm run dev` again; env is only read at start |
| `Port 3000 is in use` / "Another next dev server is already running" | Close the other terminal running the app, or use the URL it prints |
| Maps are grey | Map tiles need internet (OpenStreetMap). Everything else works offline |
| `npm install` errors | Check `node -v` is 20.9 or newer; delete `frontend/node_modules` and run `npm install` again |
| Something else | Screenshot the page **and** the terminal output, note which step (e.g. "D6"), and post it in the group chat |

---

## Reporting a problem

Post in the group chat:
1. **Step number** (e.g. "A8"),
2. what you **expected** vs what **happened**,
3. a **screenshot**, and any red text from the **terminal** or F12 → **Console**.

Don't fix shared files on `integration` yourself: tell Fabia, or fix it on your
own feature branch.
