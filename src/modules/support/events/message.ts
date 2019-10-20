import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import * as path from "path";

let { supportChannel, ticketChannel } = require("../channels.json"),
  { ticketManager } = require("../../../roles.json"),
  circleFolder =
    "https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/";

let coll = MongoClient.db("PreMiD").collection("tickets");
module.exports = async (message: Discord.Message) => {
  let ticket = await coll.findOne({ supportChannel: message.channel.id });
  if (ticket) delete ticket._id;

  if (
    ticket &&
    !ticket.supporters.includes(message.author.id) &&
    !message.author.bot &&
    (message.member.roles.has(ticketManager) ||
      message.member.permissions.has("ADMINISTRATOR"))
  ) {
    message.channel.send(`<@${message.author.id}> joined this ticket.`);

    ticket.supporters.push(message.author.id);
    addToTicket(
      message,
      ticket,
      await (message.guild.channels.get(
        ticket.supportChannel
      ) as Discord.TextChannel)
    );
    coll.findOneAndUpdate({ ticketId: ticket.ticketId }, { $set: ticket });
    return;
  }

  if (ticket && ticket.supporters.includes(message.author.id)) {
    let suppChannel = await (message.guild.channels.get(
      ticket.supportChannel
    ) as Discord.TextChannel);

    if (message.content.startsWith(">>")) {
      message.delete();

      let userToAdd = message.guild.members.find(
        m =>
          m.displayName.toLowerCase() ===
            message.content
              .slice(2, message.content.length)
              .trim()
              .toLowerCase() &&
          (m.roles.has(ticketManager) || m.permissions.has("ADMINISTRATOR")) &&
          !ticket.supporters.includes(m.id)
      );

      if (typeof userToAdd === "undefined") {
        message
          .reply(
            `This user either does not exist, is not a ${
              message.guild.roles.get(ticketManager).name
            } or is already assigned to this ticket.`
          )
          .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
        return;
      } else {
        await message.channel.send(
          `<@${userToAdd.id}> has been added to this ticket.`
        );

        ticket.supporters.push(userToAdd.id);
        addToTicket(message, ticket, suppChannel);
        coll.findOneAndUpdate({ ticketId: ticket.ticketId }, { $set: ticket });
      }
    } else if (
      message.content.startsWith("<<") &&
      (message.member.roles.has(ticketManager) ||
        message.member.hasPermission("ADMINISTRATOR")) &&
      ticket.supporters.includes(message.author.id)
    ) {
      message.delete();

      ticket.supporters = ticket.supporters.filter(
        supp => supp !== message.author.id
      );
      if (ticket.supporters.length == 0) {
        message
          .reply(
            "You can't leave this ticket because you are the only supporter assigned to it."
          )
          .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
        return;
      }
      suppChannel.overwritePermissions({
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
      message.channel.send(`<@${message.author.id}> left this ticket.`);

      let ticketMessage = await (message.guild.channels.get(
          ticketChannel
        ) as Discord.TextChannel).messages.fetch(ticket.ticketMessage),
        embed = ticketMessage.embeds[0];

      embed.fields = [
        {
          name: "Supporters",
          value: `${ticket.supporters
            .map(supp => "<@" + supp + ">")
            .join(", ")}`
        }
      ];

      ticketMessage.edit({ embed: embed });
      (await suppChannel.messages.fetch(ticket.supportEmbed)).edit(embed);

      coll.findOneAndUpdate({ ticketId: ticket.ticketId }, { $set: ticket });
    }
    return;
  }

  if (message.channel.id !== supportChannel || message.author.bot) return;

  if (message.content.length <= 50) {
    ((await message.reply(
      "Your message is too short. (minimum is **50 characters**)"
    )) as Discord.Message).delete({ timeout: 10 * 1000 });
    message.delete();
    return;
  }

  let ticketNumber = ((await coll.countDocuments()) + 1)
      .toString()
      .padStart(5, "0"),
    embed = new Discord.MessageEmbed({
      author: {
        name: `Ticket#${ticketNumber} [OPEN]`,
        iconURL: `${circleFolder}green_circle.png`
      },
      description: message.content,
      footer: {
        text: message.author.tag,
        iconURL: message.author.displayAvatarURL({ size: 128 })
      },
      color: "#77ff77"
    });

  if (
    message.attachments.size > 0 &&
    [".png", ".gif", ".jpg"].includes(
      path.extname(message.attachments.first().name)
    )
  )
    embed.thumbnail = {
      url: message.attachments.first().url
    };

  let ticketMessage = (await (message.guild.channels.get(
    ticketChannel
  ) as Discord.TextChannel).send(embed)) as Discord.Message;
  ticketMessage
    .react("🚫")
    .then(() =>
      ticketMessage.react(message.guild.emojis.get("521018476870107156"))
    );

  if (
    // @ts-ignore
    embed.thumbnail === null &&
    message.attachments.size > 0
  ) {
    let attachmentMessage = (await (message.guild.channels.get(
      ticketChannel
    ) as Discord.TextChannel).send({
      files: message.attachments.map(att => att.url)
    })) as Discord.Message;

    coll.insertOne({
      ticketId: ticketNumber,
      userId: message.author.id,
      ticketMessage: ticketMessage.id,
      attachmentMessage: attachmentMessage.id,
      timestamp: Date.now()
    });
  } else
    coll.insertOne({
      ticketId: ticketNumber,
      userId: message.author.id,
      ticketMessage: ticketMessage.id,
      timestamp: Date.now()
    });

  message.delete();
};

async function addToTicket(
  message: Discord.Message,
  ticket,
  suppChannel: Discord.TextChannel
) {
  let ticketMessage = await (message.guild.channels.get(
      ticketChannel
    ) as Discord.TextChannel).messages.fetch(ticket.ticketMessage),
    embed = ticketMessage.embeds[0];

  suppChannel.overwritePermissions({
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

  embed.fields = [
    {
      name: "Supporters",
      value: `${ticket.supporters.map(supp => "<@" + supp + ">").join(", ")}`
    }
  ];

  ticketMessage.edit({ embed: embed });
  (await suppChannel.messages.fetch(ticket.supportEmbed)).edit(embed);
}
