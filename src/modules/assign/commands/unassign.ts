import * as Discord from "discord.js";
import assignee from "../assignee";
import config from "../../../config";
import assignRolesFile from "../assignRoles";

let embed: Discord.MessageEmbed;

module.exports.run = async (
	message: Discord.Message,
	params: Array<String>
) => {
	let roleCheck: {
		minecraft?: string;
		linuxTest?: string;
		vacation?: string;
		updates?: string;
	} = {
		updates: assignRolesFile.updates
	};

	if (
		message.member.hasPermission("ADMINISTRATOR") || message.member.roles.cache.has(assignee.staffHead)
	) {
		roleCheck.minecraft = assignRolesFile.minecraft;
		roleCheck.vacation = assignRolesFile.vacation;
		roleCheck.linuxTest = assignRolesFile.linuxTest;
	} else {
		if (message.member.roles.cache.has(assignee.alphaRole)) roleCheck.minecraft = assignRolesFile.minecraft;
		if (message.member.roles.cache.has(assignee.betaRole)) roleCheck.minecraft = assignRolesFile.minecraft;
		if (message.member.roles.cache.has(assignee.staff)) roleCheck.vacation = assignRolesFile.vacation;
		if (message.member.roles.cache.has(assignee.linuxMaintainer)) roleCheck.linuxTest = assignRolesFile.linuxTest;
	}

	let assignRoles: Discord.Role[] = Object.values(roleCheck)
		.map((r) => message.guild.roles.cache.get(r))
		.filter((v) => v != undefined);

	if (params.length == 0) {
		message.delete();
		embed = new Discord.MessageEmbed({
			title: "Unassignable Roles",
			description: `*You can unassign these roles by typing\:
			\`\`${config.prefix}assign <roleName> [optionally tag a member to remove the role from]\`\`*

			${assignRoles.map((r) => `**${r.name}**`).join(", ")}`,
			color: "#7289DA",
		});

		message.channel
			.send(embed)
			.then((msg) => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		return;
	}

	let lastEl = params[params.length - 1];
	if (lastEl.startsWith("<@") && lastEl.endsWith(">")) params.pop();

	let assignRole = assignRoles.filter(r => r.name.toLowerCase() == params.join(" ").toLowerCase());

	if (assignRole.length == 0) {
		embed = new Discord.MessageEmbed({
			title: "Unassign",
			description: `Role **${params.join(" ")}** does not exist.`,
			color: "#ff5050",
		});
		message.channel
			.send(embed)
			.then((msg) => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		return;
	}

	let asRole = assignRole[0],
		mentioned = message.mentions.members.first(),
		userToAddRole = message.member;

	if (mentioned != undefined) {
		if (
			message.member.hasPermission("ADMINISTRATOR") ||
			message.member.roles.cache.has(assignee.staffHead) ||
			(asRole.id == assignRolesFile.linuxTest && message.member.roles.cache.has(assignee.linuxMaintainer))
		) userToAddRole = mentioned;
		else {
			message.react("❌");
			embed = new Discord.MessageEmbed({
				title: "Unassign",
				description: `You don't have permission to remove the role from **${mentioned.displayName}**.`,
				color: "#ff5050",
			});

			return message.channel
				.send(embed)
				.then((msg) => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		}
	}

	if (userToAddRole && !userToAddRole.roles.cache.has(asRole.id)) {
		message.react("❌");
		let description =
			userToAddRole == mentioned
				? `User **${userToAddRole.displayName}** doesn't have the **${asRole.name}** role.`
				: `You don't have the **${asRole.name}** role.`;
		embed = new Discord.MessageEmbed({
			title: "Unassign",
			description,
			color: "#ff5050",
		});
	} else {
		if (userToAddRole) userToAddRole.roles.remove(asRole.id);
		message.react("✅");
		let description =
			userToAddRole == mentioned
				? `Unassigned **${asRole.name}** role from user **${userToAddRole.displayName}**.`
				: `Unassigned **${asRole.name}** role.`;
		embed = new Discord.MessageEmbed({
			title: "Unassign",
			description,
			color: "#50ff50",
		});
	}
	message.channel
		.send(embed)
		.then(msg => msg.delete({ timeout: 10 * 1000 }));

	if (!message.deleted) message.delete();
};

module.exports.config = {
	name: "unassign",
	description: "Unassign roles from yourself or other member.",
};
