const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  discordLink: {
    type: String,
    default: 'https://discord.gg/example'
  },
  siteTitle: {
    type: String,
    default: 'Endless Studio'
  },
  siteDescription: {
    type: String,
    default: 'Design Criativo e Moderno'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Config = mongoose.model('Config', configSchema);
module.exports = Config;