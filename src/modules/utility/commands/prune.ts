import * as Discord from "discord.js";

module.exports.run = async (message: Discord.Message, params) => {
  await message.delete()
  message.channel.bulkDelete(params[0])
};

module.exports.config = {
  permLeve: 1,
  name: "prune",
  description: "Prunes messages"
};
