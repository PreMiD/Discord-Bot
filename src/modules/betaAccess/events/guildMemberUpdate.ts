import * as Discord from "discord.js";

var { supporter, patron } = require("../../../roles.json");

module.exports = async (
  _oldMember: Discord.GuildMember,
  newMember: Discord.GuildMember
) => {
  if (newMember.roles.has(patron) && !newMember.roles.has(supporter))
    newMember.roles.add(supporter);
};
