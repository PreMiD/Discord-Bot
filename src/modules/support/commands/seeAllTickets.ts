import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

var coll = MongoClient.db("PreMiD").collection("userSettings"),
  { ticketManager } = require("../../../roles.json"),
  { prefix } = require("../../../config.json");

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  if (!message.member.roles.has(ticketManager)) return;
  message.delete();

  var userSettings = await coll.findOne({ userId: message.author.id });
  if (!userSettings)
    userSettings = await coll.insertOne({
      userId: message.author.id,
      seeAllTickets: false
    });

  if (params.length == 0) {
    message
      .reply(
        `See all tickets: **\`\`${
          userSettings.seeAllTickets ? "ON" : "OFF"
        }\`\`**`
      )
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  switch (params[0].toLocaleLowerCase()) {
    case "off":
      userSettings.seeAllTickets = false;
      message
        .reply(`See all tickets: **\`\`OFF\`\`**`)
        .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
      coll.findOneAndUpdate(
        { userId: userSettings.userId },
        { $set: { seeAllTickets: false } }
      );
      break;
    case "on":
      userSettings.seeAllTickets = true;
      message
        .reply(`See all tickets: **\`\`ON\`\`**`)
        .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
      coll.findOneAndUpdate(
        { userId: userSettings.userId },
        { $set: { seeAllTickets: true } }
      );
      break;
    default:
      message
        .reply(`Please use ${prefix}seealltickets <**OFF**|**ON**>`)
        .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
      break;
  }

  var ticketColl = MongoClient.db("PreMiD").collection("tickets"),
    userToModify = await ticketColl.find({ status: 1 }).toArray();

  userToModify = userToModify.filter(
    ticket => !ticket.supporters.includes(message.author.id)
  );

  userToModify.map(ticket => {
    var ticketChannel = message.guild.channels.get(
      ticket.supportChannel
    ) as Discord.TextChannel;

    if (userSettings.seeAllTickets) ticket.supporters.push(message.author.id);
    else
      ticket.supporters = ticket.supporters.filter(
        supp => supp != message.author.id
      );

    ticketChannel.overwritePermissions({
      //@ts-ignore
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ["VIEW_CHANNEL"]
        },
        {
          id: ticket.userId,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "EMBED_LINKS",
            "ATTACH_FILES",
            "USE_EXTERNAL_EMOJIS"
          ]
        }
      ].concat(
        ticket.supporters.map(supp => {
          return {
            id: supp,
            allow: [
              "VIEW_CHANNEL",
              "SEND_MESSAGES",
              "EMBED_LINKS",
              "ATTACH_FILES",
              "USE_EXTERNAL_EMOJIS"
            ]
          };
        })
      )
    });
  });
};

module.exports.config = {
  name: "seealltickets"
};
