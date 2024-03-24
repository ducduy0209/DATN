const { Client } = require('@elastic/elasticsearch');
const config = require('./config/config');

const elasticsearchClient = new Client({
  node: config.elasticsearch,
});

module.exports = elasticsearchClient;
