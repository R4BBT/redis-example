const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { createClient } = require("redis");

const PORT = 3000;
const DEFAULT_EXPIRATION = 3600;

const app = express();
app.use(cors());

const redisClient = createClient();
// In production, can pass in {url:} as an option for production instance of redis
redisClient.on("connect", () => {
  console.log("connected to redis successfully!");
});

redisClient.on("error", (error) => {
  console.log("Redis connection error :", error);
});

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      {
        params: { albumId },
      }
    );
    return data;
  });
  res.json(photos);
});

app.get("/photos/:id", async (req, res) => {
  try {
    const photo = await getOrSetCache(`photos:${req.params.id}`, async () => {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
      );
      return data;
    });
    res.json(photo);
  } catch (error) {
    console.log(error);
  }
});

function getOrSetCache(key, cb) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await redisClient.get(key);
      if (data != null) {
        console.log("CACHE HIT");
        return resolve(JSON.parse(data));
      }

      console.log("CACHE MISS");
      const freshData = await cb();
      redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      return resolve(freshData);
    } catch (error) {
      return reject(error);
    }
  });
}

const server = app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  await redisClient.connect();
});

server.on("SIGINT", async () => {
  await redisClient.disconnect();
});
