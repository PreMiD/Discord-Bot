var { success } = require("../util/debug");

import * as Discord from "discord.js";

module.exports.run = (client: Discord.Client) => {
  if (client.user) success(`Connected to Discord as ${client.user.tag}`);
};

module.exports.config = {
  clientOnly: true
};
