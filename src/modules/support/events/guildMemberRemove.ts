import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

var coll = MongoClient.db("PreMiD").collection("tickets"),
  { ticketChannel } = require("../channels.json");

module.exports = async (user: Discord.GuildMember) => {
  var tickets = await coll.find({ userId: user.id }).toArray();

  tickets.map(async ticket => {
    if (typeof ticket.status === "undefined") {
      (await (user.guild.channels.get(
        ticketChannel
      ) as Discord.TextChannel).messages.fetch(ticket.ticketMessage)).delete();
    } else if (ticket.status === 1) {
      (await (user.guild.channels.get(
        ticketChannel
      ) as Discord.TextChannel).messages.fetch(ticket.ticketMessage)).delete();
      (user.guild.channels.get(
        ticket.supportChannel
      ) as Discord.TextChannel).delete();
    }

    coll.findOneAndDelete({ ticketId: ticket.ticketId });
  });
};
