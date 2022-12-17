const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

const redisClient = Redis.createClient();
// In production, can pass in {url:} as an option for production instance of redis

const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(cors());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  redisClient.get(`photos?albumId=${albumId}`, async (error, data) => {
    if (error) console.error(error);
    if (data != null) {
      console.log("Cache Hit");
      return res.json(JSON.parse(data));
    } else {
      console.log("Cache Miss");
      const { data } = await axios(
        "https://jsonplaceholder.typicode.com/photos",
        {
          params: { albumId },
        }
      );
      redisClient.setEx("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
      res.json(data);
    }
  });
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );

  res.json(data);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
