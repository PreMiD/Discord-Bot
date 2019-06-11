"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
var { prefix } = require("../../../config.json"), assignRolesFile = require("../assignRoles.json"), embed;
module.exports.run = async (message, params) => {
    // @ts-ignore
    var assignRoles = assignRolesFile
        .map(r => {
        if (message.guild)
            message.guild.roles.get(r);
        else
            return undefined;
    })
        .filter(v => v != undefined);
    if (params.length == 0) {
        message.delete();
        embed = new Discord.MessageEmbed({
            title: "Assignable Roles",
            description: `*You can assign these roles by typing
			\`\`${prefix}assign <roleName>\`\`*
			
			${assignRoles.map(r => `**${r.name}**`).join(", ")}`,
            color: "#7289DA"
        });
        message.channel
            .send(embed)
            .then(msg => setTimeout(() => msg.delete(), 10 * 1000));
        return;
    }
    var assignRole = assignRoles.filter(r => r.name.toLowerCase() == params.join(" ").toLowerCase());
    if (assignRole.length == 0) {
        embed = new Discord.MessageEmbed({
            title: "Assign",
            description: `Role **${params.join(" ")}** does not exist.`,
            color: "#ff5050"
        });
        message.channel
            .send(embed)
            .then(msg => setTimeout(() => msg.delete(), 10 * 1000));
        return;
    }
    var asRole = assignRole[0];
    if (message.member && message.member.roles.has(asRole.id)) {
        message.react("❌");
        embed = new Discord.MessageEmbed({
            title: "Assign",
            description: `You already have the **${asRole.name}** role.`,
            color: "#ff5050"
        });
        message.channel.send(embed).then(msg => setTimeout(() => {
            message.delete();
            msg.delete();
        }, 10 * 1000));
    }
    else {
        if (message.member)
            message.member.roles.add(asRole.id);
        message.react("✅");
        embed = new Discord.MessageEmbed({
            title: "Assign",
            description: `Assigned **${asRole.name}** role.`,
            color: "#50ff50"
        });
        message.channel.send(embed).then(msg => setTimeout(() => {
            message.delete();
            msg.delete();
        }, 10 * 1000));
    }
};
module.exports.config = {
    name: "assign"
};
