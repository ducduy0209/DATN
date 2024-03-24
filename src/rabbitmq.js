// rabbitChannel.js
const amqp = require('amqplib');
const config = require('./config/config');
const logger = require('./config/logger');

let channelInstance = null;

async function channelMQ() {
  if (channelInstance) {
    return channelInstance;
  }

  try {
    const connection = await amqp.connect(config.rabbitmq);
    const channel = await connection.createChannel();
    channelInstance = channel;
    return channelInstance;
  } catch (error) {
    logger.error('Error creating RabbitMQ channel:', error);
  }
}

/*
Usage
require and const channel = await channelMQ();
    const queue = 'cartItems'; // queue name

    await channel.assertQueue(queue, {
      durable: false
    });

    // Add: Send cartItem to queue
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(cartItem)));
*/
module.exports = channelMQ;
