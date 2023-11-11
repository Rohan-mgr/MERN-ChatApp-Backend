const redis = require("redis");

let client;
(async () => {
  client = redis.createClient();
  client.on("error", (error) => console.log(error));
  await client.connect();
})();

client.on("ready", () => {
  console.log("Redis connected!");
});

module.exports = { client };
