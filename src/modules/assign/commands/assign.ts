import * as Discord from "discord.js";
import {assignRoles as roles, assignee} from "../config";

let embed: Discord.MessageEmbed;

export default {
    config: {
        name: "assign",
        aliases: [],
        slashCommand: false
    }, run: (client, message, args) => {
        const roleCheck: {
            minecraft?: string;
            linuxTest?: string;
            vacation?: string;
            updates?: string;
        } = {
            updates: roles.updates
        };
    
        if(message.member.hasPermission("ADMINISTRATOR") || message.member.roles.cache.has(assignee.staffHead)) {
            roleCheck.minecraft = roles.minecraft;
            roleCheck.vacation = roles.vacation;
            roleCheck.linuxTest = roles.linuxTest;
        } else {
            if(message.member.roles.cache.has(assignee.linuxMaintainer)) roleCheck.linuxTest = roles.linuxTest;
            if(message.member.roles.cache.has(assignee.alphaRole)) roleCheck.minecraft = roles.minecraft;
            if(message.member.roles.cache.has(assignee.betaRole)) roleCheck.minecraft = roles.minecraft;
            if(message.member.roles.cache.has(assignee.staff)) roleCheck.vacation = roles.vacation;
        }
    
        const discordRoles: Discord.Role[] = Object.values(roleCheck)
            .map(r => message.guild.roles.cache.get(r))
            .filter(v => v != undefined);
    
        if(!args || args.length === 0) {
            message.delete();
            const embed = new Discord.MessageEmbed({
                title: "Assignable Roles",
                description: `*You can assign these roles by typing
                \`\`p!assign <roleName> [optionally tag a member to give the role to]\`\`*
    
                ${discordRoles.map((r) => `**${r.name}**`).join(", ")}`,
                color: "#7289DA"
            });
    
            return message.channel.send(embed).then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
        }
    
        const lastEl = args[args.length - 1];
        if(lastEl.startsWith("<@") && lastEl.endsWith(">")) args.pop();
    
        const assignRole = discordRoles.filter(r => r.name.toLowerCase() == args.join(" ").toLowerCase());
    
        if(assignRole.length == 0) {
            embed = new Discord.MessageEmbed({
                title: "Assign",
                description: `Role **${args.join(" ")}** does not exist.`,
                color: "#ff5050"
            });

            return message.channel.send(embed).then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
        }
    
        const asRole = assignRole[0],
            mentioned = message.mentions.members.first();
        
        let userToAddRole = message.member;
    
        if(mentioned != undefined) {
            if(
                message.member.hasPermission("ADMINISTRATOR") ||
                message.member.roles.cache.has(assignee.staffHead) ||
                (asRole.id == roles.linuxTest && message.member.roles.cache.has(assignee.linuxMaintainer))
            ) userToAddRole = mentioned;
            else {
                message.react("❌");
                embed = new Discord.MessageEmbed({
                    title: "Assign",
                    description: `You do not have permission to add the role to user **${mentioned.displayName}**.`,
                    color: "#ff5050"
                });
    
                return message.channel.send(embed).then((msg) => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
            }
        }
    
        let description: string, color: string;
    
        if(userToAddRole && userToAddRole.roles.cache.has(asRole.id)) {
            
            message.react("❌");
            
            description = userToAddRole == mentioned
                    ? `User **${userToAddRole.displayName}** already has role **${asRole.name}**.`
                    : `You already have the **${asRole.name}** role.`;
            
                    color = "#ff5050";
        } else {
            if(userToAddRole) userToAddRole.roles.add(asRole.id);

            message.react("✅");
            
            description = userToAddRole == mentioned
                    ? `Assigned **${asRole.name}** role to **${userToAddRole.displayName}**.`
                    : `Assigned you **${asRole.name}** role.`;

            color = "#50ff50";
        }
        embed = new Discord.MessageEmbed({
            title: "Assign",
            description,
            color
        });

        message.channel.send(embed).then(msg => msg.delete({ timeout: 10 * 1000 }));
    }
};