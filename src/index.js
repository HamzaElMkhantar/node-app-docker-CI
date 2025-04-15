const express = require("express");
const mongoose = require("mongoose")
const http = require("http");
const redis = require("redis");
const pg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);

// redis connection
const REDIS_HOST = 'redis'
const REDIS_PORT = 6379

const redisClient = redis.createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});
redisClient.on('error', (err) => {
  console.log('Redis Client Error.', err);
});
redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});
redisClient.connect().catch(console.error);

// db connection
const DB_USER = 'root'
const DB_PASSWORD = 'example'
const DB_PORT = 27018
const DB_HOST = 'mongo'
const URI = `mongodb://${DB_USER}:${ DB_PASSWORD}@${DB_HOST}:${DB_PORT}`

mongoose
  .connect(URI)
  .then(res => {
    console.log("mongo - database connected.")
  })
  .catch((err) => {
    console.log("mongo - error connecting database. : ", err)
  })

// const { Client, Pool } = pg
// const PG_HOST = 'postgres'
// const PG_PORT = 5432
// const PG_USER = "root";
// const PG_PASSWORD = "example";

// const connectionString = `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}`;
// const client = new Client({
//   connectionString,
// })
// client
//   .connect().then(() => {
//     console.log('Postgres - database connected.')
//   })
//   .catch((err) => {
//     console.error('Postgres - error connecting database.', err)
//   }
//   )

app.get("/", (req, res) => {
  redisClient.set("products", "products data ...");
  res.send(
    `<h4>[ ${process.env.NODE_ENV} ] - Hello, World! -- This is an api server running ${process.env.NODE_ENV === 'production' ? '-- From OVHCloud --': 'in local machine'}.</h1>`
  );
})

app.get("/data", async (req, res) => {
  const products = await redisClient.get("products");
  res.send(
    `<h4>[ ${process.env.NODE_ENV} ] - Hello, World! -- This is an api server running on port 0.0.0.0:4000 -> 4000/tcp.</h1> <br /> <h4>products :  ${products} </h4>`
  );
})

app.get("/db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    res.json({ collections: collectionNames });
  } catch (err) {
    console.error("Failed to list collections:", err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
})

const PORT = process.env.PORT || 4000;
console.log(
  `Server is running on port ${process.env.PORT}`,
  process.env.NODE_ENV + ' Mode'
);
server.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
