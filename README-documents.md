# Optivora Documents: Standalone Server + OnlyOffice (Ubuntu Docker)

This repo includes a standalone Node/Express backend under `server/` to store and manage documents and integrate with OnlyOffice Document Server. Next.js is used only for the client.

## What you get

- REST API for documents (CRUD, file serving)
- OnlyOffice editor config endpoint and callback to save edits
- Docker Compose to run the backend and OnlyOffice Document Server

## Prereqs (Ubuntu)

1. Update packages and install Docker & Compose:

   ```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg lsb-release
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io
   # Install docker compose plugin (Ubuntu 22.04+)
   sudo apt-get install -y docker-compose-plugin
   # Optional: use current user for docker
   sudo usermod -aG docker $USER
   # Log out/in or run: newgrp docker
   ```

2. Verify Docker:
   ```bash
   docker --version
   docker compose version
   ```

## Run with Docker Compose

From the repository root:

```bash
# Ensure storage folder exists
mkdir -p server/storage/documents

# Start services
docker compose up -d --build

# Tail logs
docker compose logs -f doc-server
```

Services:

- Backend server: http://localhost:4000
- OnlyOffice Document Server: http://localhost:8082 (internal use by the client widget)

Environment variables (compose defaults):

- `CLIENT_ORIGIN`: CORS origin for your Next client (default http://localhost:3000)
- `APP_URL`: Public URL for backend (default http://localhost:4000)

## API Overview

- GET `/health`
- GET `/documents`
- GET `/documents/file/:id`
- POST `/documents/upload` (multipart `file`)
- POST `/documents/create` JSON `{ name, ext, contentBase64? }`
- GET `/documents/:id`
- PUT `/documents/:id` (multipart `file`)
- DELETE `/documents/:id`
- POST `/documents/onlyoffice-config/:id`
- POST `/documents/callback/:id`

Storage: `server/storage/documents`

## OnlyOffice integration

- The client requests `POST /documents/onlyoffice-config/:id` and gets the editor config JSON.
- Embed OnlyOffice DocEditor widget in the client page with that config.
- OnlyOffice will call the callback URL to save changes; the server updates the file.

If you enable JWT in OnlyOffice, set JWT variables and add verification. Current compose uses `JWT_ENABLED=false` for simplicity.

## Next client integration

Set `NEXT_PUBLIC_DOC_SERVER=http://localhost:4000` and call the endpoints from client components.

Example to fetch editor config:

```ts
const base = process.env.NEXT_PUBLIC_DOC_SERVER || 'http://localhost:4000'
const res = await fetch(`${base}/documents/onlyoffice-config/${encodeURIComponent(id)}`, { method: 'POST' })
const config = await res.json()
// pass config to DocEditor init
```

## Troubleshooting

- If you get CORS errors, set `CLIENT_ORIGIN` to your actual client URL.
- Ensure `server/storage/documents` is writable. Compose mounts it into the container.
- If OnlyOffice callback fails, check `doc-server` logs and ensure `APP_URL` is reachable from OnlyOffice (use host-accessible URL).

## Local (non-Docker) run

```bash
cd server
npm install
npm run dev
# Server at http://localhost:4000
```

## Notes

- This backend is separate from Next.js. Use Next only as a client.
- Default ports: backend 4000, OnlyOffice 8082.
- You can change them in `docker-compose.yml`.
