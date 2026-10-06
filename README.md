# CheapTrip Europe Backend

Backend for the CheapTrip Europe travel app.

## Features

- Health check
- Duffel flight search
- Trip cost calculator
- CORS enabled
- Railway-ready Node.js/Express server

## Run locally

```bash
npm install
npm start
```

## Environment variables

Create a `.env` file:

```text
DUFFEL_ACCESS_TOKEN=your_duffel_test_token
PORT=3000
```

Never commit your real Duffel token to GitHub.

## API endpoints

GET `/`

GET `/health`

POST `/api/flights/search`

POST `/api/trip/calculate`
