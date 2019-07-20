import { success } from "../util/debug";

import * as Discord from "discord.js";

module.exports.run = (client: Discord.Client) => {
  if (client.user) success(`Connected as ${client.user.tag}`);
};

module.exports.config = {
  clientOnly: true
};
