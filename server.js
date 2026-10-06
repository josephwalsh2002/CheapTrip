require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

app.get("/", (req, res) => {
  res.json({
    app: "CheapTrip Europe",
    status: "online",
    message: "CheapTrip backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    duffelConfigured: Boolean(DUFFEL_ACCESS_TOKEN)
  });
});

app.post("/api/flights/search", async (req, res) => {
  try {
    if (!DUFFEL_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "DUFFEL_ACCESS_TOKEN is not configured on the server."
      });
    }

    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      cabinClass = "economy"
    } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: "origin, destination and departureDate are required."
      });
    }

    const slices = [
      {
        origin,
        destination,
        departure_date: departureDate
      }
    ];

    if (returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate
      });
    }

    const response = await fetch("https://api.duffel.com/air/offer_requests", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DUFFEL_ACCESS_TOKEN}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          slices,
          passengers: Array.from({ length: Number(adults) || 1 }, () => ({
            type: "adult"
          })),
          cabin_class: cabinClass,
          max_connections: 2
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Duffel flight search failed",
        details: data
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Flight search failed",
      details: error.message
    });
  }
});

app.post("/api/trip/calculate", (req, res) => {
  const {
    flightCost = 0,
    hotelCost = 0,
    foodCost = 0,
    transportCost = 0,
    otherCost = 0,
    travellers = 1
  } = req.body;

  const total =
    Number(flightCost) +
    Number(hotelCost) +
    Number(foodCost) +
    Number(transportCost) +
    Number(otherCost);

  res.json({
    travellers: Number(travellers) || 1,
    flightCost: Number(flightCost),
    hotelCost: Number(hotelCost),
    foodCost: Number(foodCost),
    transportCost: Number(transportCost),
    otherCost: Number(otherCost),
    totalTripCost: total,
    costPerTraveller: total / (Number(travellers) || 1)
  });
});

app.listen(PORT, () => {
  console.log(`CheapTrip backend running on port ${PORT}`);
});
