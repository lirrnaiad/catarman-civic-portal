# Deploying to an Azure VM with Docker

One VM runs three containers (`deploy/docker-compose.yml`):

| Container | What it does |
|---|---|
| `db` | MySQL 8.4. Loads `backend/schema.sql` + `backend/seed.sql` on its **first** start. Not reachable from outside the VM. |
| `app` | The Next.js portal (built from `frontend/Dockerfile`). |
| `caddy` | HTTPS on ports 80/443 with a free, auto-renewing Let's Encrypt certificate. |

The steps use the existing VM `mc-server-new` (resource group `minecraft-rg`,
Standard_B2as_v2: 2 vCPU / 8 GB, East Asia) and its DNS name
`mc-server-lirrnaiad.eastasia.cloudapp.azure.com`. The Minecraft server can keep
running alongside; the portal uses about 400 MB of RAM.

## 1. Open ports 80 and 443 (on your laptop, once)

```sh
az network nsg rule create -g minecraft-rg --nsg-name mc-server-nsg-new \
  -n web --priority 130 --protocol Tcp --access Allow \
  --destination-port-ranges 80 443
```

Port 80 is needed even though the site is HTTPS-only: Let's Encrypt checks it
when issuing the certificate, and Caddy uses it to redirect to HTTPS.

## 2. Start the VM and connect

```sh
az vm start -g minecraft-rg -n mc-server-new
ssh <your-vm-user>@mc-server-lirrnaiad.eastasia.cloudapp.azure.com
```

## 3. Install Docker (on the VM, once)

For Ubuntu or Debian (check with `cat /etc/os-release`), using Docker's
official install script:

```sh
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit   # log out and ssh back in so the group change applies
```

After reconnecting, `docker compose version` should print a version.

## 4. Get the code and set secrets (on the VM)

```sh
git clone https://github.com/lirrnaiad/catarman-civic-portal.git
cd catarman-civic-portal/deploy
cp .env.example .env
nano .env
```

Fill in every value. Generate each password/secret with `openssl rand -hex 32`
(run it once per value). Choose **new** staff passwords for `ADMIN_PASSWORD` and
each office in `AGENCY_PASSWORDS`, not ones used on laptops. `deploy/.env` is
git-ignored; never commit it. Then lock it down:

```sh
chmod 600 .env
```

## 5. Start everything

```sh
docker compose up -d --build
```

The first build takes a few minutes. Then check:

```sh
docker compose ps              # all three "Up"; db "(healthy)"
docker compose logs caddy | grep -i "certificate obtained"
```

Open **https://mc-server-lirrnaiad.eastasia.cloudapp.azure.com** and check that
the map loads, a report can be submitted, and `/admin` signs in.

## Day-to-day

| Task | Command (in `catarman-civic-portal/deploy`) |
|---|---|
| Deploy new code | `git pull && docker compose up -d --build` |
| App logs (incl. `[audit]` lines) | `docker compose logs -f app` |
| Reset demo data to the seed | `docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" catarman_civic < /docker-entrypoint-initdb.d/02-seed.sql'` |
| Stop the portal | `docker compose down` (data is kept) |
| Back up the database | `docker compose exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" catarman_civic' > backup.sql` |

The containers restart on their own when the VM boots, so `az vm start` brings
the portal back. Avoid `docker compose down -v`: it deletes the database **and**
the HTTPS certificate (Let's Encrypt limits how often it can be re-issued).

## After the demo

```sh
az vm deallocate -g minecraft-rg -n mc-server-new   # stops compute billing
```

The public IP is static (Standard SKU), so the address and DNS name survive
deallocation.

## Trying the stack on a laptop

Rootless Docker can't bind ports below 1024. Set `SITE_ADDRESS=localhost` in
`deploy/.env` and publish Caddy on 8080/8443 with an override file:

```yaml
# deploy/compose.override.yml (git-ignored name suggestion: keep it local)
services:
  caddy:
    ports: !override
      - "8080:80"
      - "8443:443"
```

Then open https://localhost:8443 (Caddy uses a self-signed certificate for
`localhost`).
