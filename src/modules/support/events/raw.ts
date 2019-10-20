import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import { client } from "../../..";

let { ticketCategory, ticketChannel } = require("../channels.json"),
  { ticketManager } = require("../../../roles.json"),
  coll = MongoClient.db("PreMiD").collection("tickets");

module.exports = async packet => {
  if (!["MESSAGE_REACTION_ADD"].includes(packet.t)) return;

  let guild = client.guilds.get(packet.d.guild_id),
    member = guild.members.get(packet.d.user_id);

  if (member.user.bot) return;

  let ticket = await coll.findOne({ ticketMessage: packet.d.message_id });

  if (!ticket) return;
  delete ticket._id;

  let ticketchannel = guild.channels.get(ticketChannel) as Discord.TextChannel,
    ticketMessage = await ticketchannel.messages.fetch(ticket.ticketMessage),
    embed = ticketMessage.embeds[0];

  if (
    !member.permissions.has("ADMINISTRATOR") &&
    !member.roles.has(ticketManager)
  ) {
    ticketMessage.reactions
      .find(emoji => emoji.emoji.name == packet.d.emoji.name)
      .users.remove(packet.d.user_id);
    return;
  }

  if (packet.d.emoji.name === "🚫" && typeof ticket.status === "undefined") {
    ticketMessage.reactions.removeAll().then(() => {
      ticketMessage.react("💔");
      ticketMessage
        .awaitReactions(
          (r, u) => r.emoji.name === "💔" && u.id === packet.d.user_id,
          { max: 1, time: 5 * 1000, errors: ["time"] }
        )
        .then(() => {
          ticketMessage.delete();
          if (typeof ticket.attachmentMessage !== "undefined")
            ticketchannel.messages
              .fetch(ticket.attachmentMessage)
              .then(msg => msg.delete());
          coll.findOneAndDelete({ ticketId: ticket.ticketId });
        })
        .catch(() => {
          ticketMessage.reactions
            .removeAll()
            .then(() =>
              ticketMessage
                .react("🚫")
                .then(() =>
                  ticketMessage.react(guild.emojis.get("521018476870107156"))
                )
            );
        });
    });
    return;
  }

  if (
    packet.d.emoji.id === "521018476870107156" &&
    typeof ticket.status === "undefined"
  ) {
    let supportersToAdd = await MongoClient.db("PreMiD")
      .collection("userSettings")
      .find({ seeAllTickets: true })
      .toArray();

    let channel = (await guild.channels.create(ticket.ticketId.toString(), {
      parent: ticketCategory,
      type: "text",
      //@ts-ignore
      permissionOverwrites: [
        {
          id: guild.id,
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
        },
        {
          id: packet.d.user_id,
          allow: [
            "VIEW_CHANNEL",
            "SEND_MESSAGES",
            "EMBED_LINKS",
            "ATTACH_FILES",
            "USE_EXTERNAL_EMOJIS"
          ]
        }
      ].concat(
        supportersToAdd.map(uSett => {
          return {
            id: uSett.userId,
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
    })) as Discord.TextChannel;

    embed.setAuthor(
      `Ticket#${ticket.ticketId} [PENDING]`,
      "https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png"
    );
    embed.setColor("#f4dd1a");
    embed.addField("Supporter", `<@${packet.d.user_id}>`);

    ticketMessage.edit({ embed: embed });
    ticketMessage.reactions.removeAll().then(() => ticketMessage.react("🚫"));

    ticket.supportEmbed = ((await channel.send(embed)) as Discord.Message).id;
    if (ticket.attachmentMessage) {
      await channel.send({
        files: (await ticketchannel.messages.fetch(
          ticket.attachmentMessage
        )).attachments.map(att => att.url)
      });
    }
    channel.send(
      `<@${ticket.userId}>, Your ticket \`\`#${
        ticket.ticketId
      }\`\` has been accepted by **${member.displayName}**`
    );

    ticket.supportChannel = channel.id;
    ticket.status = 1;
    ticket.supporters = [packet.d.user_id];

    coll.findOneAndUpdate({ ticketId: ticket.ticketId }, { $set: ticket });
    return;
  }

  if (
    packet.d.emoji.name === "🚫" &&
    ticket.status === 1 &&
    (ticket.supporters.includes(packet.d.user_id) ||
      client.guilds
        .get(packet.d.guild_id)
        .members.get(packet.d.user_id)
        .hasPermission("ADMINISTRATOR"))
  ) {
    ticketMessage.reactions.removeAll();

    embed.setAuthor(
      `Ticket#${ticket.ticketId} [CLOSED]`,
      "https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/red_circle.png"
    );
    embed.setColor("#dd2e44");

    if (ticket.attachmentMessage) {
      (await ticketchannel.messages.fetch(ticket.attachmentMessage)).delete();
      delete ticket.attachmentMessage;
    }

    if (embed.thumbnail) delete embed.thumbnail;
    delete embed.fields;

    ticketMessage.edit({ embed: embed });
    guild.channels.get(ticket.supportChannel).delete();

    delete ticket.supportChannel;
    delete ticket.supporters;
    delete ticket.supportEmbed;
    ticket.status = 2;
    coll.findOneAndUpdate({ ticketId: ticket.ticketId }, { $set: ticket });
    return;
  }
};
