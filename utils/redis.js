const redis = require("redis");

// let client;
// (async () => {
//   client = redis.createClient();
//   client.on("error", (error) => console.log(error));
//   await client.connect();
// })();

// client.on("ready", () => {
//   console.log("Redis connected!");
// });

const promisify = function (func, ...args) {
  const jsonify = (reply) => {
    try {
      if (typeof reply === "string") {
        return JSON.parse(reply);
      }
      return Object.keys(reply).reduce(
        (accumulator, current) => ({
          ...accumulator,
          [current]: JSON.parse(reply[current]),
        }),
        {}
      );
    } catch (error) {
      return {};
    }
  };
  return new Promise((resolve) => {
    try {
      func(...args, function (error, reply) {
        try {
          if (error) {
            throw error;
          }
          resolve(jsonify(reply));
        } catch (error) {
          console.log(`Redis: error [${args.join(".")}]`, error);
          resolve({});
        }
      });
    } catch (error) {
      console.log(`ERROR IN REDIS PROMISIFY => `, error);
      resolve({});
    }
  });
};

class RedisClient {
  constructor() {
    this._client = redis.createClient();

    this._client.on("connect", () => {
      console.log("Redis: connected");
    });

    this._client.on("disconnected", () => {
      console.log("Redis: disconnected");
    });

    this._client.on("error", (error) => console.log(error));
  }

  async hget(key, field) {
    return promisify(this._client.hget.bind(this._client), key || "", field || "");
  }

  async hgetall(key) {
    return promisify(this._client.hgetall.bind(this._client), key || "");
  }

  async hset(key, field, value) {
    try {
      let existing = await this.hget(key, field);

      // If the hash is empty, initialize it as an empty object
      if (!existing) {
        existing = {};
      }
      return await this._client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      console.error("Error in hset:", error);
    }
  }

  async hdel(key, field) {
    try {
      await this._client.hdel(key, field);
    } catch (error) {
      console.log("Error in hdel: ", error);
    }
  }
}

const client = new RedisClient({
  host: "localhost",
  port: 6379,
});
module.exports = { client };
