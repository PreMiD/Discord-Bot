import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import { client } from "../../..";

var { prefix } = require("../../../config.json"),
  { moderators } = require(".././channels.json"),
  { muted } = require("../../../roles.json");

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  var embed = new Discord.MessageEmbed({
    title: "Warn",
    description: `*You can warn a user by typing
    \`\`${prefix}warn <user> <reason>\`\`*`,
    color: "#FF7000"
  });

  message.delete();
  if (params.length < 2 || message.mentions.users.size == 0) {
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.users.first().id == message.author.id) {
    embed.setDescription("You can't warn yourself!");
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.users.first().bot) {
    embed.setDescription("You can't warn bots!");
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  var coll = MongoClient.db("PreMiD").collection("warns"),
    user = await coll.findOne({ userId: message.mentions.users.first().id }),
    warns = 1;

  if (!user)
    coll.insertOne({
      userId: message.mentions.users.first().id,
      warns: [
        {
          userId: message.author.id,
          reason: params
            .slice(1, params.length)
            .join(" ")
            .trim(),
          timestamp: Date.now()
        }
      ]
    });
  else {
    user.warns.push({
      userId: message.mentions.users.first().id,
      reason: params
        .slice(1, params.length)
        .join(" ")
        .trim(),
      timestamp: Date.now()
    });
    coll.findOneAndReplace({ userId: user.userId }, user);
    warns = user.warns.length++;
  }

  var muteTime: string = null;
  switch (warns) {
    case 1: {
      break;
    }
    case 2: {
      muteTill(message.mentions.users.first().id, 60 * 60 * 1000);
      muteTime = "3 hours";
      break;
    }
    case 3: {
      muteTill(message.mentions.users.first().id, 3 * 24 * 60 * 60 * 1000);
      muteTime = "3 days";
      break;
    }
    case 4: {
      muteTill(message.mentions.users.first().id);
    }
  }

  var warnNumberText = `${warns}th`;
  if (warns == 1) warnNumberText = "1st";
  if (warns == 2) warnNumberText = "2nd";
  if (warns == 3) warnNumberText = "3rd";

  embed = new Discord.MessageEmbed({
    title:
      "<:lolipatrol:606599634567168089> WARNING <:lolipatrol:606599634567168089>",
    color: "#FF7000",
    description: `This is your ${warnNumberText} warning. More will cause a mute or other consequenses!\nPlease read our rules in <#518466088263090176> carefully to prevent more warnings!`,
    fields: [
      {
        name: "Moderator",
        value: `<@${message.author.id}>`,
        inline: true
      },
      {
        name: "Reason",
        value: params
          .slice(1, params.length)
          .join(" ")
          .trim(),
        inline: true
      }
    ],
    timestamp: new Date(),
    thumbnail: {
      url:
        "https://pbs.twimg.com/profile_images/1087819203011375114/tpYmYFg9_400x400.png"
    }
  });

  if (warns > 1 && warns < 4) {
    embed.setFooter(`Your mute ends in ${muteTime}.`);
    message.channel.send(
      `**${
        message.mentions.users.first().tag
      }** has been warned and muted for ${muteTime}.`
    );
  } else if (warns == 4) {
    (message.guild.channels.get(moderators) as Discord.TextChannel).send(
      `<@${
        message.mentions.users.first().id
      }> has been muted permanently. Please discuss and take further action!`
    );
    message.channel.send(
      `**${
        message.mentions.users.first().tag
      }** has been warned and muted permanently. Moderators can and will take action!`
    );
  } else {
    message.channel.send(
      `**${message.mentions.users.first().tag}** has been warned.`
    );
  }

  await message.mentions.users.first().send("You have been warned!", embed);
};

function muteTill(id: string, time: number = 0) {
  client.guilds
    .first()
    .members.fetch(id)
    .then(async m => {
      m.roles.add(muted, "Warn penalty.");

      var data = {
        userId: id,
        mutedUntil: Date.now() + time
      };

      if (time == 0) delete data.mutedUntil;

      if (
        await MongoClient.db("PreMiD")
          .collection("mutes")
          .findOne({ userId: id })
      )
        MongoClient.db("PreMiD")
          .collection("mutes")
          .findOneAndUpdate(
            { userId: m.id },
            { $set: { mutedUntil: Date.now() + time } }
          );
      else
        MongoClient.db("PreMiD")
          .collection("mutes")
          .insertOne(data);

      if (time == 0) {
        MongoClient.db("PreMiD")
          .collection("mutes")
          .findOneAndDelete({ userId: id });
      } else setTimeout(() => unmute(m.id), time);
    });
}

export async function unmute(id: string) {
  var mute = await MongoClient.db("PreMiD")
    .collection("mutes")
    .findOne({ userId: id });

  if (mute.mutedUntil >= Date.now() || !mute) return;

  client.guilds
    .first()
    .members.fetch(id)
    .then(m => m.roles.remove(muted, "Warn penalty over."))
    .catch(() => {});

  MongoClient.db("PreMiD")
    .collection("mutes")
    .findOneAndDelete({ userId: id });
}

module.exports.config = {
  name: "warn",
  description: "Warns a user.",
  permLevel: 2
};
