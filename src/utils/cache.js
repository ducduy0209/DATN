const redis = require('redis');
const { promisify } = require('util');
const logger = require('../config/logger');
const config = require('../config/config');

// Connect to Redis
const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});
client.on('error', (err) => logger.error('Redis Client Error', err));

// Convert callback-based Redis client methods to Promise-based
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

/**
 * Store data in the cache
 * @param {string} key - The cache key
 * @param {string} value - The value to be stored
 * @param {number} duration - Duration of cache existence (in seconds)
 */
const setCache = async (key, value, duration = 3600) => {
  await setAsync(key, JSON.stringify(value), 'EX', duration);
};

/**
 * Retrieve data from the cache
 * @param {string} key - The cache key
 * @returns {Promise<*>} The cached value (if any)
 */
const getCache = async (key) => {
  const data = await getAsync(key);
  return data ? JSON.parse(data) : null;
};

module.exports = {
  setCache,
  getCache,
};
