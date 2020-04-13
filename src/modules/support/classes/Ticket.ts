import * as Discord from "discord.js";
import { client } from "../../..";
import { MongoClient } from "../../../database/client";
import channels from "../../../channels";

const coll = MongoClient.db("PreMiD").collection("tickets"),
	circleFolder =
		"https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/";

let ticketCount = 0;

export class Ticket {
	id: string;
	status: number;

	message: Discord.Message;
	user: Discord.GuildMember;

	channel: Discord.TextChannel;
	channelMessage: Discord.Message;

	supporters: Array<Discord.GuildMember>;

	embed: Discord.MessageEmbedOptions;

	attachmentsMessage: Discord.Message;

	constructor() {}

	async fetch(type: "ticket" | "message" | "channel", arg: any) {
		const ticket =
			type === "ticket"
				? arg
				: await coll.findOne(
						type === "message"
							? { ticketMessage: arg }
							: { supportChannel: arg }
				  );

		if (!ticket) return false;

		this.id = ticket.ticketId;
		this.status = ticket.status;

		this.message = await (client.guilds.cache
			.first()
			.channels.cache.get(
				channels.ticketChannel
			) as Discord.TextChannel).messages.fetch(ticket.ticketMessage);
		this.embed = this.message.embeds[0];

		if (this.status === 1) {
			this.channel = client.guilds.cache
				.first()
				.channels.cache.get(ticket.supportChannel) as Discord.TextChannel;
			this.channelMessage = await this.channel.messages.fetch(
				ticket.supportEmbed
			);
			this.supporters = await Promise.all(
				ticket.supporters.map((s: string) =>
					client.guilds.cache.first().members.fetch(s)
				)
			);
		}

		if (ticket.attachmentMessage)
			this.attachmentsMessage = await (client.guilds.cache
				.first()
				.channels.cache.get(
					channels.ticketChannel
				) as Discord.TextChannel).messages.fetch(ticket.attachmentMessage);

		try {
			this.user = await client.guilds.cache
				.first()
				.members.fetch(ticket.userId);
		} catch (_) {}
		return true;
	}

	async create(message: Discord.Message) {
		try {
			if (ticketCount === 0) ticketCount = await coll.countDocuments({});

			ticketCount++;

			this.id = ticketCount.toString().padStart(5, "0");

			this.embed = {
				author: {
					name: `Ticket#${this.id} [OPEN]`,
					iconURL: `${circleFolder}green_circle.png`
				},
				description: message.cleanContent,
				footer: {
					text: message.author.tag,
					iconURL: message.author.displayAvatarURL({ size: 128 })
				},
				color: "#77ff77"
			};

			this.message = await (message.guild.channels.cache.get(
				channels.ticketChannel
			) as Discord.TextChannel).send({
				embed: this.embed
			});

			this.message
				.react("🚫")
				.then(() =>
					this.message.react(
						message.guild.emojis.cache.get("521018476870107156")
					)
				);

			if (message.attachments.size > 0)
				this.attachmentsMessage = await (client.guilds.cache
					.first()
					.channels.cache.get(
						channels.ticketChannel
					) as Discord.TextChannel).send(message.attachments.first());

			message.author
				.send(
					`Your ticket \`\`#${this.id}\`\` has been submitted and will be answered shortly. Please be patient. Thank you!`
				)
				.catch(() => {});

			coll.insertOne({
				ticketId: this.id,
				userId: message.author.id,
				ticketMessage: this.message.id,
				timestamp: Date.now(),
				attachmentMessage: this.attachmentsMessage
					? this.attachmentsMessage.id
					: undefined,
				created: Date.now()
			});

			message.delete().catch(() => {});
		} catch (err) {
			(message.guild.channels.cache.get(
				channels.dev
			) as Discord.TextChannel).send(
				new Discord.MessageEmbed({
					title: "Error: " + err.name,
					description: err.message
				})
			);
		}
	}

	async accept(supporter: Discord.GuildMember) {
		this.embed.author = {
			name: `Ticket#${this.id} [PENDING]`,
			iconURL:
				"https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png"
		};
		this.embed.color = "#f4dd1a";
		this.embed.fields = [
			{
				name: "Supporter",
				value: supporter.toString()
			}
		];

		this.message.reactions.removeAll().then(() => this.message.react("🚫"));
		this.message.edit(this.embed);

		const channelPerms = [
			"VIEW_CHANNEL",
			"SEND_MESSAGES",
			"EMBED_LINKS",
			"ATTACH_FILES",
			"USE_EXTERNAL_EMOJIS"
		];

		this.channel = (await client.guilds.cache.first().channels.create(this.id, {
			parent: channels.ticketCategory,
			type: "text",
			//@ts-ignore
			permissionOverwrites: [
				{
					id: client.guilds.cache.first().id,
					deny: ["VIEW_CHANNEL"]
				},
				{
					id: this.user.id,
					allow: channelPerms
				},
				{
					id: supporter.id,
					allow: channelPerms
				}
			].concat(
				(
					await MongoClient.db("PreMiD")
						.collection("userSettings")
						.find({ seeAllTickets: true })
						.toArray()
				).map(uSett => {
					return {
						id: uSett.userId,
						allow: channelPerms
					};
				})
			)
		})) as Discord.TextChannel;

		this.embed.footer = {
			text: "p!close - Closes this ticket.",
			iconURL: null
		};
		this.channelMessage = await this.channel.send({ embed: this.embed });

		this.channel.send(
			`${this.user}, Your ticket \`\`#${this.id}\`\` has been accepted by **${supporter.displayName}**.`
		);

		coll.findOneAndUpdate(
			{ ticketId: this.id },
			{
				$set: {
					supportChannel: this.channel.id,
					status: 1,
					supporters: [supporter.id],
					supportEmbed: this.channelMessage.id,
					accepter: supporter.id
				}
			}
		);
	}

	async close(closer?: Discord.GuildMember, reason?: string) {
		try {
			if (reason)
				this.user
					.send(
						`Your Ticket \`\`#${this.id}\`\` has been closed. Reason:\n\n*\`\`${reason}\`\`*`
					)
					.catch(() => {});

			this.embed.author = {
				name: `Ticket#${this.id} [CLOSED]`,
				iconURL:
					"https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/red_circle.png"
			};
			this.embed.color = "#dd2e44";

			if (this.embed.thumbnail) delete this.embed.thumbnail;
			delete this.embed.fields;

			if (this.attachmentsMessage)
				this.attachmentsMessage.delete().catch(() => {});

			this.message.reactions.removeAll().catch(() => {});
			this.message.edit(this.embed).catch(() => {});
			this.channel.delete().catch(() => {});

			coll.findOneAndUpdate(
				{ ticketId: this.id },
				{
					$unset: { supportChannel: "", supporters: "", supportEmbed: "" },
					$set: {
						status: 2,
						closer: closer?.id || undefined
					}
				}
			);
		} catch (e) {
			console.log(e);
		}
	}

	async addSupporter(member: Discord.GuildMember, sendMessage = true) {
		if (this.supporters.find(s => s.id === member.id)) return;

		this.supporters.push(member);

		this.embed.fields[0] = {
			name: "Supporter",
			value: this.supporters.toString()
		};

		this.message.edit(this.embed);
		this.channelMessage.edit(this.embed);

		if (sendMessage) await this.channel.send(`**>** ${member}`);

		this.channel.updateOverwrite(member, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			EMBED_LINKS: true,
			ATTACH_FILES: true,
			USE_EXTERNAL_EMOJIS: true
		});

		coll.findOneAndUpdate(
			{ ticketId: this.id },
			{
				$set: {
					supportChannel: this.channel.id,
					supporters: this.supporters.map(s => s.id)
				}
			}
		);
	}

	async removeSupporter(member: Discord.GuildMember, sendMessage = true) {
		if (this.supporters.find(s => s.id === member.id)) {
			this.supporters = this.supporters.filter(s => s.id !== member.id);

			this.embed.fields[0] = {
				name: "Supporter",
				value: this.supporters.toString()
			};

			this.message.edit(this.embed);
			this.channelMessage.edit(this.embed);

			this.channel.updateOverwrite(member, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				EMBED_LINKS: true,
				ATTACH_FILES: true,
				USE_EXTERNAL_EMOJIS: true
			});

			if (sendMessage) await this.channel.send(`**<** ${member}`);

			coll.findOneAndUpdate(
				{ ticketId: this.id },
				{ $set: { supporters: this.supporters.map(s => s.id) } }
			);
		}
	}
}
