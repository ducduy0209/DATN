const redis = require('redis');
const { promisify } = require('util');
const logger = require('../config/logger');
const config = require('../config/config');

// Connect to Redis
const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  legacyMode: true,
});
client
  .connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((err) => {
    logger.error('Could not connect to Redis', err);
  });
client.on('error', (err) => logger.error('Redis Client Error', err));

// Convert callback-based Redis client methods to Promise-based
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

/**
 * Store data in the cache
 * @param {string} key - The cache key
 * @param {string} value - The value to be stored
 * @param {number} duration - Duration of cache existence (in seconds)
 */
const setCache = async (key, value, duration = 3600) => {
  await setAsync(key.toString(), JSON.stringify(value), 'EX', duration);
};

/**
 * Retrieve data from the cache
 * @param {string} key - The cache key
 * @returns {Promise<*>} The cached value (if any)
 */
const getCache = async (key) => {
  const data = await getAsync(key.toString());
  return data ? JSON.parse(data) : null;
};

/**
 * Delete data from the cache
 * @param {string} key - The cache key
 * @returns {Promise<void>}
 */
const delCache = async (key) => {
  await delAsync(key.toString());
};

module.exports = {
  setCache,
  getCache,
  delCache,
};
