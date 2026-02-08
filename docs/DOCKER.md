# Docker & Dokploy Deployment Guide

Dit project is geoptimaliseerd voor deployment via **Dokploy** met behulp van **Docker Compose**. Dit betekent dat zowel de database als de applicatie als één "stack" worden gedeployed.

## 1. Structuur
- **App**: Next.js 16 (Standalone output)
- **Database**: PostgreSQL 16 (Alpine)
- **Configuratie**: `docker-compose.yml` beheert beide services.

## 2. Lokaal Ontwikkelen (Localhost)

Voordat je live gaat, kun je alles lokaal testen.

1.  **Start de applicatie:**
    ```bash
    docker-compose up -d --build
    ```
    *Dit bouwt de images en start de database + app op de achtergrond.*

2.  **Check de logs:**
    ```bash
    docker-compose logs -f app
    ```

3.  **Database Migraties (Eerste keer):**
    Als de app draait, moet je het database schema synchroniseren:
    ```bash
    docker-compose exec app npx prisma db push
    ```

4.  **Open de app:**
    Ga naar `http://localhost:3000`.

5.  **Stoppen:**
    ```bash
    docker-compose down
    ```

---

## 3. Productie Deployment op Dokploy (De "Stack" Methode)

We gebruiken de **Compose** functionaliteit van Dokploy. Dit is de makkelijkste manier om te starten.

### Stap A: Voorbereiding in Dokploy
1.  Log in op je Dokploy dashboard.
2.  Ga naar je Project.
3.  Klik op het tabblad **"Compose"** (niet "Application").
4.  Klik op **"Create Compose"**.

### Stap B: Configuratie
Vul de volgende gegevens in:
- **Name**: `hagenkit-stack` (of een eigen naam)
- **Source Type**: `Git` (Selecteer je GitHub/GitLab repository)
- **Branch**: `main`
- **Compose Path**: `docker-compose.yml` (standaard)

### Stap C: Environment Variables
Ga in Dokploy naar de **"Environment"** tab van je nieuwe Compose stack en voeg deze variabelen toe. **Let op: Verander de wachtwoorden voor productie!**

```ini
# --- Database Config ---
POSTGRES_USER=hagenkit_user
# GEBRUIK EEN STERK WACHTWOORD HIERONDER!
POSTGRES_PASSWORD=verander_dit_in_een_veilig_wachtwoord_123!
POSTGRES_DB=hagenkit_prod

# --- App Config ---
# Gebruik dezelfde gegevens als hierboven:
DATABASE_URL=postgresql://hagenkit_user:verander_dit_in_een_veilig_wachtwoord_123!@postgres:5432/hagenkit_prod

# --- Security ---
# Genereer een lange random string voor deze secret
BETTER_AUTH_SECRET=genereer_een_lange_random_code_hier

# Jouw domeinnaam (zonder slash aan het einde)
BETTER_AUTH_URL=https://jouw-domein.com
NEXT_PUBLIC_APP_URL=https://jouw-domein.com

# --- Node ---
NODE_ENV=production
```

### Stap D: Deploy
Klik op **"Deploy"**. Dokploy zal nu:
1.  De repository clonen.
2.  De Docker image bouwen (dit duurt even de eerste keer).
3.  PostgreSQL en de App starten.

### Stap E: Database Migratie (Productie)
Nadat de deploy "groen" (succesvol) is, moet je de database tabellen aanmaken.

1.  Ga in Dokploy naar de **"Terminal"** tab van de `app` service (soms moet je even klikken om de sub-services te zien).
2.  Of gebruik de "Shell" optie als Dokploy die biedt voor de stack.
3.  Voer dit commando uit:
    ```bash
    npx prisma migrate deploy
    ```
    *Als `migrate deploy` faalt omdat je nog geen migrations hebt, gebruik dan voor de eerste keer:*
    ```bash
    npx prisma db push
    ```

---

## 4. Domeinnaam Koppelen (Traefik)

Standaard stelt Dokploy geen domein in voor een Compose stack.

1.  Ga in Dokploy naar de **"Domains"** tab van je Compose service.
2.  Selecteer de **Service**: `app`
3.  **Port**: `3000`
4.  **Domain**: `jouw-domein.com`
5.  Klik "Create". Dokploy regelt automatisch HTTPS (SSL).

---

## 5. Troubleshooting

**De app start niet op?**
- Controleer de logs in Dokploy.
- Vaak is het de database connectie: klopt de `DATABASE_URL` met de `POSTGRES_PASSWORD`?
- Is de poort `5432` intern bereikbaar? (In deze setup: Ja, via de hostnaam `postgres`).

**Database resetten?**
Als je helemaal opnieuw wilt beginnen (LET OP: DATA WEG):
1. Stop de stack in Dokploy.
2. Verwijder de volumes (via Advanced tab of Docker CLI).
3. Redeploy.

