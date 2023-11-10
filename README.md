## Demo

https://demo.kagansari.com

## Development

> Prerequisites:
>
> - Install node >= 18
> - Install pnpm: `npm install -g pnpm`
> - Install MongoDB and run locally

```bash

pnpm install

cd backend
npm run start:dev

cd frontend
cp .env.example .env.local
npm run dev

```

## Deployment

```bash
# Build docker images
docker build -f Dockerfile.backend -t via-scientific-backend:0.0.1  .
# Update VITE_API_URL in "frontend/.env.local" if backend is not served from localhost
docker build -f Dockerfile.frontend -t via-scientific-frontend:0.0.1  .

docker compose up
# Visit localhost:3001
```
