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

cd ml
source ./env/bin/activate
pip install -r requirements.txt
python App.py

```

## Deployment

```bash
# Build docker images
docker build -f Dockerfile.backend -t via-scientific-backend:0.0.3 -t kaganalisari/via-scientific-backend:0.0.3 --platform linux/amd64 .
# Update VITE_API_URL and VITE_ML_API_URL in "frontend/.env.local" if backend is not served from localhost
docker build -f Dockerfile.frontend -t via-scientific-frontend:0.0.3 -t kaganalisari/via-scientific-frontend:0.0.3 --platform linux/amd64 .
docker build -f Dockerfile.ml -t via-scientific-ml:0.0.3 -t kaganalisari/via-scientific-ml:0.0.3 --platform linux/amd64 .

# Push to dockerhub
docker push kaganalisari/via-scientific-backend:0.0.3
docker push kaganalisari/via-scientific-frontend:0.0.3
docker push kaganalisari/via-scientific-ml:0.0.3

# Or in order to use local images, replace kaganalisari/via-scientific... with via-scientific...

docker compose up
# Visit localhost:3001
```
