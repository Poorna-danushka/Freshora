# Freshora Quick Start

## Run with Docker Desktop

1. Start Docker Desktop and wait for it to finish starting.
2. In PowerShell, change to the Freshora project directory:

   ```powershell
   cd "C:\path\to\Freshora"
   ```

3. Create `.env` from `.env.example` if needed, then set local database
   passwords and a JWT secret of at least 32 characters.
4. Build and start the application:

   ```powershell
   .\docker-start.ps1
   ```

   Alternatively, run `docker compose up -d --build`.
5. Wait until `docker compose ps` shows the services as healthy, then open
   http://localhost:3000.

## Useful Commands

```powershell
docker compose ps
docker compose logs -f backend
docker compose down
```

`docker compose down` stops the services but preserves database and upload
volumes. Do not use `docker compose down -v` unless you intend to permanently
delete that data. See [DOCKER.md](./DOCKER.md) for configuration details.
